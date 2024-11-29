const express = require('express');
const authenticateAdmin = require('../middleware/authAdmin');
const {adminLogin} = require('../controllers/adminController');
const {createServiceHandler, updateServiceHandler, deleteServiceHandler} = require('../controllers/serviceController');
const {getServices, getServiceByIdHandler} = require('../controllers/serviceController');


const router = express.Router();

// Admin bejelentkezés
router.post('/login', adminLogin);

// Szolgáltatás kezelése admin által
router.post('/services', authenticateAdmin, createServiceHandler);
router.put('/services/:serviceId', authenticateAdmin, updateServiceHandler);
router.delete('/services/:serviceId', authenticateAdmin, deleteServiceHandler);

// Publikus szolgáltatás megjelenítése
router.get('/services', getServices); // Minden felhasználó hozzáférhet
router.get('/services/:serviceId', getServiceByIdHandler); // Minden felhasználó hozzáférhet

module.exports = router;


