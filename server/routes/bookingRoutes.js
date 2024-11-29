const express = require('express');
const { createBooking, updateBookingStatusHandler, deleteBooking, getAllBookingsHandler } = require('../controllers/bookingController');
const authenticateAdmin = require('../middleware/authAdmin');

const router = express.Router();


router.post('/', createBooking);

router.patch('/:id', updateBookingStatusHandler);

router.get('/',  getAllBookingsHandler);

router.delete('/:bookingId', authenticateAdmin, deleteBooking);

module.exports = router;

