const express = require('express');
const {
  getServices,
  getServiceByIdHandler,
  createServiceHandler,
  updateServiceHandler,
  deleteServiceHandler,
} = require('../controllers/serviceController');
const authenticateAdmin = require('../middleware/authAdmin');

const router = express.Router();

// Publikus szolgáltatások
router.get('/', getServices);
router.get('/:serviceId', getServiceByIdHandler);

// Adminisztrátor műveletek
router.post('/', authenticateAdmin, createServiceHandler);
router.put('/:serviceId', authenticateAdmin, updateServiceHandler);
router.delete('/:serviceId', authenticateAdmin, deleteServiceHandler);

module.exports = router;

