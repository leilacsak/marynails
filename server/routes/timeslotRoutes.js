const express = require('express');
const { getTimeslots, createTimeslot, updateTimeslot, deleteTimeslot } = require('../controllers/timeslotController');
const authenticateAdmin = require('../middleware/authAdmin');
const pool = require('../db'); 
const router = express.Router();


router.get('/', getTimeslots);

router.post('/', authenticateAdmin, createTimeslot);

router.patch('/:timeslotId', authenticateAdmin, updateTimeslot);

router.delete('/:timeslotId', authenticateAdmin, deleteTimeslot);

router.get('/generate', getTimeslots);

  module.exports = router;
