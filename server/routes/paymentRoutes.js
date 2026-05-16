const authenticateAdmin = require('../middleware/authAdmin');
const express = require('express');
const { createPaymentIntent, confirmPayment, finalizeSuccessfulPayment } = require('../controllers/paymentController');


const router = express.Router();

router.post('/', createPaymentIntent); // Fizetési tranzakció létrehozása
router.post('/success', finalizeSuccessfulPayment); // Fizetés utáni lezárás és email küldés
router.post('/confirm', authenticateAdmin, confirmPayment); // Fizetés megerősítése admin által


module.exports = router;
