const authenticateAdmin = require('../middleware/authAdmin');
const express = require('express');
const { createPaymentIntent, confirmPayment } = require('../controllers/paymentController');


const router = express.Router();

router.post('/', createPaymentIntent); // Fizetési tranzakció létrehozása
router.post('/confirm', authenticateAdmin, confirmPayment); // Fizetés megerősítése admin által


module.exports = router;
