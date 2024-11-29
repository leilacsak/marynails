const pool = require('../db');
const { v4: uuidv4 } = require('uuid');

// Új fizetési tranzakció rögzítése
const createPayment = async (foglalasId, osszeg, method, status = 'pending') => {
  const fizetesId = uuidv4(); // Egyedi fizetés azonosító generálása

  const result = await pool.query(
    `INSERT INTO fizetesek (fizetesid, foglalasid, osszeg, datum, method, status)
     VALUES ($1, $2, $3, NOW(), $4, $5)
     RETURNING *`,
    [fizetesId, foglalasId, osszeg, method, status]
  );

  return result.rows[0];
};

// Fizetési tranzakció lekérdezése ID alapján
const getPaymentById = async (fizetesId) => {
  const result = await pool.query(
    'SELECT * FROM fizetesek WHERE fizetesid = $1',
    [fizetesId]
  );

  return result.rows[0];
};

// Fizetési tranzakciók listázása
const getAllPayments = async () => {
  const result = await pool.query(
    'SELECT * FROM fizetesek ORDER BY datum DESC'
  );

  return result.rows;
};

// Fizetési tranzakció státuszának frissítése
const updatePaymentStatus = async (fizetesId, status) => {
  const result = await pool.query(
    `UPDATE fizetesek 
     SET status = $1, datum = NOW()
     WHERE fizetesid = $2
     RETURNING *`,
    [status, fizetesId]
  );

  return result.rows[0];
};

module.exports = {
  createPayment,
  getPaymentById,
  getAllPayments,
  updatePaymentStatus,
};
