const pool = require('../db');

//Szolgáltatás létrehozása
const createService = async (nev, description, ar, idotartam) => {
  const result = await pool.query(
    'INSERT INTO Szolgaltatasok (nev, description, ar, idotartam) VALUES ($1, $2, $3, $4) RETURNING *',
    [nev, description, ar, idotartam]
  );
  return result.rows[0];
};

//Szolg. frissítése
const updateService = async (serviceId, nev, description, ar, idotartam) => {
  const result = await pool.query(
    'UPDATE Szolgaltatasok SET nev = COALESCE($1, nev), description = COALESCE($2, description), ar = COALESCE($3, ar), idotartam = COALESCE($4, idotartam) WHERE serviceID = $5 RETURNING *',
    [nev, description, ar, idotartam, serviceId]
  );
  return result.rows[0];
};

//Szolg. törlése
const deleteService = async (serviceId) => {
  const bookings = await pool.query('SELECT * FROM Foglalasok WHERE serviceID = $1', [serviceId]);
  if (bookings.rows.length > 0) {
    throw new Error('Szolgáltatás nem törölhető, mert kapcsolódik hozzá foglalás!');
  }
  const result = await pool.query('DELETE FROM Szolgaltatasok WHERE serviceID = $1 RETURNING *', [serviceId]);
  return result.rows[0];
};


const getServiceById = async (serviceId) => {
    const result = await pool.query('SELECT * FROM Szolgaltatasok WHERE serviceID = $1', [serviceId]);
    return result.rows[0];
  };


  const getAllServices = async () => {
    const result = await pool.query('SELECT * FROM Szolgaltatasok');
    return result.rows;
  };

module.exports = { createService, updateService, deleteService, getServiceById, getAllServices };
