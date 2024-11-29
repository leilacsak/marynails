const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { createPayment, getPaymentById, updatePaymentStatus } = require('../models/payment');

// Fizetési tranzakció létrehozása és Stripe PaymentIntent
const createPaymentIntent = async (req, res) => {
  const { foglalasId } = req.body;

  try {
    const result = await pool.query(
      `SELECT szolgaltatasok.ar AS amount FROM foglalasok
       JOIN szolgaltatasok ON foglalasok.serviceid = szolgaltatasok.serviceid
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
      `INSERT INTO fizetesek (foglalasid, osszeg, datum, status)
       VALUES ($1, $2, NOW(), $3)`,
      [foglalasId, amount, 'pending']
    );

    res.json({ clientSecret: paymentIntent.client_secret,amount });
  } catch (error) {
    console.error('Hiba a PaymentIntent létrehozásakor:', error.message);
    res.status(500).json({ error: 'Hiba történt a fizetés feldolgozása során.' });
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
};

