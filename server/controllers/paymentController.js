const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { getPaymentById, updatePaymentStatus } = require('../models/payment');
const pool = require("../db");
const nodemailer = require('nodemailer');

const sendBookingEmails = async ({ email, name, phone, serviceName, datum, starttime, endtime }) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const formattedTime = new Date(starttime).toLocaleTimeString('hu-HU', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const formattedEndTime = new Date(endtime).toLocaleTimeString('hu-HU', {
    hour: '2-digit',
    minute: '2-digit',
  });

    const formattedDate = new Date(datum).toLocaleDateString('hu-HU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Booking Confirmation',
      text: `Dear ${name},\n\nThank you for your booking!\nService: ${serviceName}\nDate: ${formattedDate}\nTime: ${formattedTime} - ${formattedEndTime}`,
  });

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: process.env.EMAIL_USER,
    subject: 'Új foglalás érkezett',
      text: `Új foglalás érkezett:\n\nNév: ${name}\nEmail: ${email}\nTelefonszám: ${phone}\nSzolgáltatás: ${serviceName}\nDátum: ${formattedDate}\nIdőpont: ${formattedTime} - ${formattedEndTime}, \n\nKérjük, ellenőrizd az admin felületen!`,
  });
};

const getBookingPaymentContext = async (foglalasId) => {
  const result = await pool.query(
    `SELECT f.foglalasid,
            f.datum,
            f.status AS booking_status,
            u.name,
            u.email,
            u.phone,
              s.nev AS "serviceName",
            s.ar AS amount,
            t.starttime,
            t.endtime
     FROM foglalasok f
     JOIN ugyfelek u ON f.userid = u.userid
     JOIN szolgaltatasok s ON f.serviceid = s.serviceid
     JOIN timeslots t ON f.timeslotid = t.timeslotid
     WHERE f.foglalasid = $1`,
    [foglalasId]
  );

  return result.rows[0] || null;
};

// Fizetési tranzakció létrehozása és Stripe PaymentIntent
const createPaymentIntent = async (req, res) => {
  const { foglalasId } = req.body;

  try {
    const result = await pool.query(
      `SELECT szolgaltatasok.ar AS amount,
              szolgaltatasok.nev AS serviceName,
              foglalasok.datum,
              timeslots.starttime,
              timeslots.endtime
       FROM foglalasok
       JOIN szolgaltatasok ON foglalasok.serviceid = szolgaltatasok.serviceid
       JOIN timeslots ON foglalasok.timeslotid = timeslots.timeslotid
       WHERE foglalasok.foglalasid = $1`,
      [foglalasId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Foglalás nem található.' });
    }

    const amount = result.rows[0].amount * 100;

    
    const paymentIntent = await stripe.paymentIntents.create({
      amount, 
      currency: 'gbp',
      metadata: { foglalasId },
    });

    // Fizetés rögzítése az adatbázisban
    await pool.query(
      `INSERT INTO fizetesek (foglalasid, osszeg, datum, status, method)
       VALUES ($1, $2, NOW(), $3, $4)`,
      [foglalasId, amount, 'pending', 'card']
    );

    res.json({ clientSecret: paymentIntent.client_secret,amount });
  } catch (error) {
    console.error('Hiba a PaymentIntent létrehozásakor:', error.message);
    res.status(500).json({ error: 'Hiba történt a fizetés feldolgozása során.' });
  }
};

const finalizeSuccessfulPayment = async (req, res) => {
  const { foglalasId } = req.body;

  if (!foglalasId) {
    return res.status(400).json({ message: 'Foglalás azonosító megadása kötelező!' });
  }

  try {
    const context = await getBookingPaymentContext(foglalasId);

    if (!context) {
      return res.status(404).json({ message: 'Foglalás nem található.' });
    }

    const paymentStatusResult = await pool.query(
      'SELECT status FROM fizetesek WHERE foglalasid = $1 ORDER BY datum DESC LIMIT 1',
      [foglalasId]
    );

    const currentPaymentStatus = paymentStatusResult.rows[0]?.status;

    if (currentPaymentStatus !== 'confirmed') {
      await updatePaymentStatus(
        (await pool.query(
          'SELECT fizetesid FROM fizetesek WHERE foglalasid = $1 ORDER BY datum DESC LIMIT 1',
          [foglalasId]
        )).rows[0]?.fizetesid,
        'confirmed'
      );

      await pool.query(
        'UPDATE foglalasok SET status = $1 WHERE foglalasid = $2',
        ['confirmed', foglalasId]
      );

      await sendBookingEmails(context);
    }

    return res.status(200).json({
      message: 'Payment confirmed and booking email sent.',
      booking: {
        foglalasid: context.foglalasid,
        serviceName: context.serviceName,
        datum: context.datum,
        starttime: context.starttime,
        endtime: context.endtime,
        amount: context.amount,
      },
    });
  } catch (error) {
    console.error('Hiba a fizetés lezárása során:', error.message);
    res.status(500).json({ message: 'Hiba történt a fizetés lezárása során.' });
  }
};

 

// Fizetési tranzakció lekérdezése
const getPayment = async (req, res) => {
  const { fizetesId } = req.params;

  if (!fizetesId) {
    return res.status(400).json({ message: 'Fizetés azonosító megadása kötelező!' });
  }

  try {
    const payment = await getPaymentById(fizetesId);

    if (!payment) {
      return res.status(404).json({ message: 'Fizetési tranzakció nem található.' });
    }

    res.status(200).json(payment);
  } catch (error) {
    console.error('Hiba a fizetési tranzakció lekérdezése során:', error.message);
    res.status(500).json({ message: 'Hiba történt a fizetési tranzakció lekérdezése során.' });
  }
};

// Fizetési tranzakció státuszának frissítése
const confirmPayment = async (req, res) => {
  const { fizetesId } = req.body;

  if (!fizetesId) {
    return res.status(400).json({ message: 'Fizetés azonosító megadása kötelező!' });
  }

  try {
    const updatedPayment = await updatePaymentStatus(fizetesId, 'confirmed');

    if (!updatedPayment) {
      return res.status(404).json({ message: 'Fizetési tranzakció nem található.' });
    }

    res.status(200).json({ message: 'Fizetés sikeresen megerősítve!', updatedPayment });
  } catch (error) {
    console.error('Hiba a fizetési státusz frissítése során:', error.message);
    res.status(500).json({ message: 'Hiba történt a fizetési státusz frissítése során.' });
  }
};

module.exports = {
  createPaymentIntent,
  getPayment,
  confirmPayment,
  finalizeSuccessfulPayment,
};

