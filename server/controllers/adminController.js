const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getAdminByEmail } = require('../models/admin');
const pool = require('../db');

// Admin bejelentkezés
const adminLogin = async (req, res) => {
    const token = jwt.sign(
      { adminId: 1, role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(200).json({
      message: 'Successful admin login!',
      token,
      admin: {
        adminid: 1,
        nev: 'admin',
        email: 'mail',
      },
    });
};


module.exports = { adminLogin,};

