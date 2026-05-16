const { updateBookingStatusInDB, deleteBookingById, getBookingById } = require('../models/booking');
const { getTimeslotById, updateTimeslotAvailability, resetTimeslotAvailability } = require('../models/timeSlot');
const pool = require('../db'); 



//Foglalás létrehozása
const createBooking = async (req, res) => {
  console.log('Kapott adatok:', req.body);

  const { serviceid, timeslotid, datum, name, email, phone } = req.body;

  const serviceId = serviceid;
  const timeslotId = timeslotid;

  if (!serviceId || !timeslotId || !datum || !name || !email || !phone) {
    return res.status(400).json({ message: 'Minden mezőt ki kell tölteni!' });
  }

  // Email formátum validálása
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'Érvénytelen email cím!' });
  }

  try {
    // 1. Ügyfél kezelése: beszúrás vagy lekérdezés
    const customerResult = await pool.query(
      `INSERT INTO ugyfelek (name, email, phone) 
       VALUES ($1, $2, $3)
       ON CONFLICT (email) DO UPDATE SET phone = EXCLUDED.phone
       RETURNING userid`,
      [name, email, phone]
    );

    let userId;
    if (customerResult.rows.length > 0) {
      console.log('Felismert vagy új ügyfél ID:', customerResult.rows[0].userid);
      userId = customerResult.rows[0].userid;
    } else {
      console.error('Hiba: Ügyfél beszúrás vagy lekérdezés sikertelen.');
      return res.status(500).json({ message: 'Ügyfél beszúrás vagy lekérdezés sikertelen.' });
    }



    // 2. Szolgáltatás ellenőrzése
    const service = await pool.query(
      'SELECT nev, idotartam FROM szolgaltatasok WHERE serviceid = $1',
      [serviceId]
    );
    if (service.rows.length === 0) {
      return res.status(404).json({ message: 'Szolgáltatás nem található!' });
    }
    const serviceName = service.rows[0].nev;
    const serviceDurationMinutes = parseInt(service.rows[0].idotartam, 10)


    // 3. Idősáv ellenőrzése
    const timeslot = await pool.query(
      'SELECT starttime, endtime, isavailable FROM timeslots WHERE timeslotid = $1',
      [timeslotId]
    );if (timeslot.rows.length === 0) {
      console.log('Timeslot query returned no rows for id:', timeslotId, 'result:', timeslot.rows);
      return res.status(404).json({ message: 'Idősáv nem található!' });
    }
    
    const timeslotStartTime = new Date(timeslot.rows[0].starttime);
    const timeslotEndTime = new Date(timeslot.rows[0].endtime);

    const now = new Date();
    if (timeslotStartTime <= now) {
      return res.status(400).json({ message: 'A kiválasztott idősáv már elmúlt!' });
    }
    
    // Ellenőrizzük, hogy a szolgáltatás belefér-e az idősávba
    const calculatedEndTime = new Date(timeslotStartTime.getTime() + serviceDurationMinutes * 60000);
    if (calculatedEndTime > timeslotEndTime) {
      return res.status(400).json({ message: 'A szolgáltatás nem fér bele az idősávba!' });
    }
    
    // Ellenőrizzük, hogy az idősáv elérhető-e
    if (!timeslot.rows[0].isavailable) {
      return res.status(400).json({ message: 'Az idősáv már foglalt!' });
    }

    // 4. Foglalás rögzítése
    const newBooking = await pool.query(
      `INSERT INTO foglalasok (userid, serviceid, datum, timeslotid, status)
       VALUES ($1, $2, $3, $4, 'pending') RETURNING *`,
      [userId, serviceId, datum, timeslotId]
    );

    // 5. Idősáv foglalása
    await updateTimeslotAvailability(timeslotId, newBooking.rows[0].foglalasid);
  
    // 7. Válasz a kliensnek
    res.status(201).json({ message: 'Foglalás sikeresen létrehozva!', booking: newBooking.rows[0] });
  } catch (error) {
    console.error('Hiba a foglalás során:', error.message);
    res.status(500).json({ message: 'Hiba történt a foglalás során.' });
  }
};



// Összes foglalás lekérdezése
const getAllBookingsHandler = async (req, res) => {
  try {
    const bookings = await pool.query(
      `SELECT f.foglalasid, f.serviceid, f.datum, f.timeslotid, f.status,
              u.name, u.email, u.phone, t.starttime, t.endtime
       FROM foglalasok f
       JOIN ugyfelek u ON f.userid = u.userid
       JOIN timeslots t on f.timeslotid = t.timeslotid
       ORDER BY f.datum, f.timeslotid`
    );
    res.status(200).json({ bookings: bookings.rows });
  } catch (error) {
    console.error('Hiba a foglalások lekérdezése során:', error.message);
    res.status(500).json({ message: 'Hiba történt a foglalások lekérdezése során.' });
  }
};




// Foglalás státuszának frissítése
const updateBookingStatusHandler = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ message: 'Státuszt meg kell adni!' });
  }

  try {
    const updatedBooking = await updateBookingStatusInDB(id, status);
    if (!updatedBooking) {
      return res.status(404).json({ message: 'Foglalás nem található.' });
    }
    res.status(200).json({ message: 'Foglalás státusza frissítve!', booking: updatedBooking });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Hiba történt a foglalás frissítése során.' });
  }
};



// Törlés
const deleteBooking = async (req, res) => {
  const { bookingId } = req.params;
  console.log('Törölni kívánt foglalás ID:', bookingId);


  try {
    const booking = await getBookingById(bookingId);
    console.log('Lekért foglalás az adatbázisból:', booking);

    if (!booking) {
      return res.status(404).json({ message: 'Foglalás nem található.' });
    }

    await deleteBookingById(bookingId);
    await resetTimeslotAvailability(booking.timeslotid); // Idősáv visszaállítása

    res.status(200).json({ message: 'Foglalás sikeresen törölve, az idősáv újra elérhető!' });
  } catch (error) {
    console.error('Hiba a foglalás törlése során:', error.message);
    res.status(500).json({ message: 'Hiba történt a foglalás törlése során.' });
  }
};


module.exports = { createBooking, updateBookingStatusHandler, deleteBooking, getAllBookingsHandler };
