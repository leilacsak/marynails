const jwt = require('jsonwebtoken');


const authenticateAdmin = (req, res, next) => {
  try {
    //Authorization fejléc létezik-e
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Token hiányzik vagy érvénytelen formátumú!' });
    }
    // Token kinyerése 
    const token = authHeader.split(' ')[1];

    // Token ellenőrzése
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        if (err.name === 'TokenExpiredError') {
          return res.status(403).json({ message: 'A token lejárt. Jelentkezz be újra!' });
        }
        return res.status(403).json({ message: 'Érvénytelen token!' });
      }

      // Jogosultság ellenőrzése
      if (user.role !== 'admin') {
        return res.status(403).json({ message: 'Hozzáférés megtagadva. Nem admin jogosultság.' });
      }

      // Felhasználói adatokat + a kéréshez
      req.user = user;
      next(); 
    });
  } catch (error) {
    console.error('Admin autentikációs hiba:', error.message);
    res.status(500).json({ message: 'Szerverhiba történt az admin autentikáció során.' });
  }
};

module.exports = authenticateAdmin;

