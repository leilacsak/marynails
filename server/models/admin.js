const pool = require('../db');


// Új admin hozzáadása
const addAdmin = async (email, hashedPassword, nev) => {
  const result = await pool.query(
    'INSERT INTO admin (email, passwordhash, nev) VALUES ($1, $2, $3) RETURNING *',
    [email, hashedPassword, nev]
  );
  return result.rows[0]; 
};

// Admin lekérdezése email alapján
const getAdminByEmail = async (email) => {
  const result = await pool.query('SELECT * FROM admin WHERE email = $1', [email]);
  return result.rows[0]; 
};

// Admin ID alapján történő lekérdezése
const getAdminById = async (id) => {
  const result = await pool.query('SELECT * FROM admin WHERE adminid = $1', [id]);
  return result.rows[0];
};

module.exports = {
  getAdminByEmail,
  addAdmin,
  getAdminById,
};
