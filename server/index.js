require('dotenv').config(); // Környezeti változók betöltése

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const adminRoutes = require('./routes/adminRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const timeslotRoutes = require('./routes/timeslotRoutes');



const app = express();
const PORT = process.env.PORT || 3000;

// Naplózó middleware - minden bejövő kérést naplózunk
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// CORS középső szoftver beállítása
app.use(cors({
  origin: '*'
}));

app.use(bodyParser.json());

// Útvonalak
app.use('/api/bookings', bookingRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/timeslots', timeslotRoutes);



// Alapértelmezett útvonal
app.get('/', (req, res) => {
  res.send('Szerver működik! Üdv a műkörmös webalkalmazás API-jában.');
});

// Hibakezelő middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Valami hiba történt a szerveren.' });
});

// Szerver indítása
app.listen(PORT, () => {
  console.log(`Szerver fut a ${PORT} porton.`);
});

