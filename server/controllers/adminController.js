const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getAdminByEmail } = require('../models/admin');
const pool = require('../db');

// Admin bejelentkezés
const adminLogin = async (req, res) => {
  // const { email, password } = req.body;
  //
  // if (!email || !password) {
  //   return res.status(400).json({ message: 'Email and password are required!' });
  // }
  //
  // try {
  //   const admin = await getAdminByEmail(email);
  //   if (!admin) {
  //     return res.status(400).json({ message: 'Invalid email or password.' });
  //   }
  //
  //   const isValidPassword = await bcrypt.compare(password, admin.passwordhash);
  //   if (!isValidPassword) {
  //     return res.status(400).json({ message: 'Invalid email or password.' });
  //   }

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
  // } catch (error) {
  //   console.error('Admin bejelentkezési hiba:', error.message);
  //   res.status(500).json({ message: 'Error signing in.' });
  // }
};


module.exports = { adminLogin,};

