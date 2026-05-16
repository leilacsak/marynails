const pool = require('../db');
const { getTimeslotById, updateTimeslotAvailability } = require('../models/timeSlot');

const formatLocalDate = (value) => {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const isFutureTimeslot = (timeslot, now) => new Date(timeslot.starttime) > now;
const hasConfirmedBooking = (timeslot) => Boolean(timeslot.booking_status === 'confirmed');

// Idősávok lekérdezése
const getTimeslots = async (req, res) => {const { serviceId, date } = req.query;

console.log('Lekérdezési paraméterek:', serviceId, date);

if (!serviceId || !date) {
  return res.status(400).json({ message: 'Service ID és dátum megadása kötelező!' });
}

try {
  const now = new Date();
  const requestedDate = new Date(`${date}T00:00:00`);
  const isToday = formatLocalDate(requestedDate) === formatLocalDate(now);

  // Idősávellenőrzés
  const checkSlots = await pool.query(
    `SELECT t.*, f.status AS booking_status
     FROM timeslots t
     LEFT JOIN foglalasok f ON f.timeslotid = t.timeslotid
     WHERE t.serviceid = $1
       AND DATE(t.starttime) = $2
     ORDER BY t.starttime`,
    [serviceId, date]
  );

  // Ha már van idősáv, nem generál újat
  if (checkSlots.rows.length > 0) {
    const existingSlots = checkSlots.rows.filter((slot) => slot.isavailable && !hasConfirmedBooking(slot) && (!isToday || isFutureTimeslot(slot, now)));
    return res.status(200).json({ message: 'Idősávok lekérve!', timeslots: existingSlots });
  }

  
  

  // Ha nincs, generáljon idősávokat
  console.log('Nincsenek idősávok, generálás indítása...');
  // Szolgáltatás időtartamának lekérdezése és percekre alakítása
  const service = await pool.query(
    `SELECT EXTRACT(EPOCH FROM idotartam) / 60 AS idotartam_percek 
     FROM szolgaltatasok 
     WHERE serviceid = $1`,
    [serviceId]
  );

  if (service.rows.length === 0) {
    return res.status(404).json({ message: 'Szolgáltatás nem található!' });
  }

  const serviceDurationMinutes = parseInt(service.rows[0].idotartam_percek, 10); // Percekben
  if (isNaN(serviceDurationMinutes)) {
    return res.status(500).json({ message: 'Hibás szolgáltatás időtartam!' });
  }

  // Nyitvatartási idő beállítása
  const openingTime = new Date(`${date}T08:00:00`);
  const closingTime = new Date(`${date}T20:00:00`);
  let currentTime = new Date(openingTime);
  const generatedTimeslots = [];

  while (currentTime < closingTime) {
    let nextTime = new Date(currentTime.getTime() + serviceDurationMinutes * 60000);

    if (nextTime > closingTime) break;

    generatedTimeslots.push({
      starttime: currentTime.toISOString(),
      endtime: nextTime.toISOString(),
      isavailable: true,
      serviceid: serviceId,
    });

    currentTime = nextTime;
  }

  const futureGeneratedTimeslots = generatedTimeslots.filter((timeslot) => !isToday || isFutureTimeslot(timeslot, now));

  // Mentés az adatbázisba
  const insertedRows = [];
  for (const timeslot of futureGeneratedTimeslots) {
    const bookedSlot = await pool.query(
      `SELECT 1
       FROM foglalasok f
       JOIN timeslots t ON f.timeslotid = t.timeslotid
       WHERE f.status = 'confirmed'
         AND t.serviceid = $1
         AND t.starttime = $2
         AND t.endtime = $3
       LIMIT 1`,
      [timeslot.serviceid, timeslot.starttime, timeslot.endtime]
    );

    if (bookedSlot.rows.length > 0) {
      continue;
    }

    const result = await pool.query(
      `INSERT INTO timeslots (starttime, endtime, isavailable, serviceid)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [timeslot.starttime, timeslot.endtime, timeslot.isavailable, timeslot.serviceid]
    );
    insertedRows.push(result.rows[0]);
  }

  res.status(201).json({ message: 'Idősávok sikeresen generálva!', timeslots: insertedRows });
} catch (error) {
  console.error('Hiba az idősávok generálása során:', error.message);
  res.status(500).json({ message: 'Hiba történt az idősávok generálása során.' });
}
};

// Új idősáv létrehozása
const createTimeslot = async (req, res) => {
  const { startTime, endTime, datum } = req.body;

  if (!startTime || !endTime || !datum) {
    return res.status(400).json({ message: 'Minden mezőt ki kell tölteni!' });
  }

  const openingTime = new Date(`${datum}T08:00`);
  const closingTime = new Date(`${datum}T20:00`);
  const start = new Date(`${datum}T${startTime}`);
  const end = new Date(`${datum}T${endTime}`);

  const dayOfWeek = start.getDay();
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    return res.status(400).json({ message: 'Az idősáv csak hétköznapokon adható meg!' });
  }
  if (start < openingTime || end > closingTime) {
    return res.status(400).json({ message: 'Az idősáv a nyitvatartási időn kívül van!' });
  }
  try {
    const overlappingTimeslots = await pool.query(
      `SELECT * FROM timeslots 
       WHERE datum = $1 AND 
       (starttime, endtime) OVERLAPS ($2, $3)`,
      [datum, startTime, endTime]
    );

    if (overlappingTimeslots.rows.length > 0) {
      return res.status(400).json({ message: 'Az idősáv ütközik egy másik foglalt időponttal!' });
    }
    const result = await pool.query(
      'INSERT INTO timeslots (starttime, endtime, datum, isavailable) VALUES ($1, $2, $3, true) RETURNING *',
      [startTime, endTime, datum]
    );

    res.status(201).json({ message: 'Idősáv sikeresen létrehozva!', timeslot: result.rows[0] });
  } catch (error) {
    console.error('Hiba az idősáv létrehozása során:', error.message);
    res.status(500).json({ message: 'Hiba történt az idősáv létrehozása során.' });
  }
};


// Idősáv állapotának frissítése (foglalás)
const updateTimeslot = async (req, res) => {
  const { timeslotId } = req.params;
  const { foglalasId } = req.body;

  if (!timeslotId || !foglalasId) {
    return res.status(400).json({ message: 'Idősáv azonosító és foglalás azonosító megadása kötelező!' });
  }

  try {
    const timeslot = await getTimeslotById(timeslotId);
    if (!timeslot) {
      return res.status(404).json({ message: 'Idősáv nem található!' });
    }
    if (!timeslot.isavailable) {
      return res.status(400).json({ message: 'Az idősáv már foglalt!' });
    }
    const updatedTimeslot = await updateTimeslotAvailability(timeslotId, foglalasId);

    res.status(200).json({
      success: true,
      message: 'Idősáv sikeresen frissítve!',
      timeslot: updatedTimeslot,
    });
  } catch (error) {
    console.error('Hiba az idősáv frissítése során:', error.message);
    res.status(500).json({ success: false, message: 'Hiba történt az idősáv frissítése során.' });
  }
};

// Idősáv törlése
const deleteTimeslot = async (req, res) => {
  const { timeslotId } = req.params;

  try {
    const result = await pool.query(
      'DELETE FROM timeslots WHERE timeslotid = $1 RETURNING *',
      [timeslotId]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Idősáv nem található!' });
    }
    res.status(200).json({ message: 'Idősáv sikeresen törölve!' });
  } catch (error) {
    console.error('Hiba az idősáv törlése során:', error.message);
    res.status(500).json({ message: 'Hiba történt az idősáv törlése során.' });
  }
};

module.exports = { getTimeslots, createTimeslot, updateTimeslot, deleteTimeslot };
