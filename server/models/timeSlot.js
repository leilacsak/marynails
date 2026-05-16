const pool = require('../db');

// Idősáv keresése azonosító alapján
const getTimeslotById = async (timeslotId) => {
  const result = await pool.query('SELECT * FROM timeslots WHERE timeslotid = $1', [timeslotId]);
  return result.rows[0] || null;
};

// Idősáv frissítése foglaláshoz (visszaadja a frissített sort)
const updateTimeslotAvailability = async (timeslotId, foglalasId = null) => {
  const result = await pool.query(
    'UPDATE timeslots SET isavailable = false WHERE timeslotid = $1 RETURNING *',
    [timeslotId]
  );
  return result.rows[0] || null;
};

// Idősáv visszaállítása (elérhetővé tétele)
const resetTimeslotAvailability = async (timeslotId) => {
  const result = await pool.query(
    'UPDATE timeslots SET isavailable = true WHERE timeslotid = $1 RETURNING *',
    [timeslotId]
  );
  return result.rows[0] || null;
};

module.exports = {
  getTimeslotById,
  updateTimeslotAvailability,
  resetTimeslotAvailability,
};
