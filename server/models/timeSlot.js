const pool = require('../db'); 

// Idősáv keresése azonosító alapján
const getTimeslotById = async (timeslotId) => {
  const result = await pool.query('SELECT * FROM timeslots WHERE timeslotid = $1', [timeslotId]);
  return result.rows[0]; 
};

// Idősáv frissítése foglaláshoz
const updateTimeslotAvailability = async (timeslotId) => {
  const result = await pool.query(
    'UPDATE timeslots SET isavailable = false WHERE timeslotid = $1',
    [timeslotId]
  );
  return result.rows[0];
};

// Idősáv visszaállítása (elérhetővé tétele)
const resetTimeslotAvailability = async (timeslotId) => {
  const result = await pool.query(
    'UPDATE timeslots SET isAvailable = true, foglalasId = NULL WHERE timeslotId = $1 RETURNING *',
    [timeslotId]
  );
  return result.rows[0]; 
};

module.exports = {
  getTimeslotById,
  updateTimeslotAvailability,
  resetTimeslotAvailability,
};
