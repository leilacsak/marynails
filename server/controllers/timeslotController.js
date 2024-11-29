const pool = require('../db');
const { getTimeslotById, updateTimeslotAvailability } = require('../models/timeSlot');

// Idősávok lekérdezése
const getTimeslots = async (req, res) => {const { serviceId, date } = req.query;

console.log('Lekérdezési paraméterek:', serviceId, date);

if (!serviceId || !date) {
  return res.status(400).json({ message: 'Service ID és dátum megadása kötelező!' });
}

try {
  // Idősávellenőrzés
  const existingSlots = await pool.query(
    'SELECT * FROM timeslots WHERE serviceid = $1 AND DATE(starttime) = $2',
    [serviceId, date]
  );

  // Ha már van idősáv, nem generál újat
  if (existingSlots.rows.length > 0) {
    return res.status(200).json({ message: 'Már léteznek idősávok erre a dátumra.', timeslots: existingSlots.rows });
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
  // Mentés az adatbázisba
  for (const timeslot of generatedTimeslots) {
    await pool.query(
      `INSERT INTO timeslots (starttime, endtime, isavailable, serviceid)
       VALUES ($1, $2, $3, $4)`,
      [timeslot.starttime, timeslot.endtime, timeslot.isavailable, timeslot.serviceid]
    );
  }

  res.status(201).json({ message: 'Idősávok sikeresen generálva!', timeslots: generatedTimeslots });
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
      'INSERT INTO timeslots (starttime, endtime, datum, isAvailable) VALUES ($1, $2, $3, true) RETURNING *',
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
      'DELETE FROM timeslots WHERE timeslotId = $1 RETURNING *',
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
