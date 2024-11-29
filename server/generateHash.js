const bcrypt = require('bcryptjs');

const plainTextPassword = 'admin';

// Hash generálása
bcrypt.hash(plainTextPassword, 10, (err, hash) => {
  if (err) {
    console.error('Hiba történt a hash generálása során:', err);
  } else {
    console.log('Generált hash:', hash);
  }
});
