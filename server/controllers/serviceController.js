const { createService, updateService, deleteService, getServiceById, getAllServices } = require('../models/service');

// Szolgáltatások listázása
const getServices = async (req, res) => {
  try {
    const services = await getAllServices();
    res.status(200).json({ services });
  } catch (error) {
    console.error('Szolgáltatások lekérdezési hiba:', error.message);
    res.status(500).json({ message: 'Hiba történt a szolgáltatások lekérdezése során.' });
  }
};

// Egy szolgáltatás részleteinek lekérdezése
const getServiceByIdHandler = async (req, res) => {
  try {
    const { serviceId } = req.params;
    const service = await getServiceById(serviceId);
    if (!service) {
      return res.status(404).json({ message: 'Szolgáltatás nem található.' });
    }
    res.status(200).json({ service });
  } catch (error) {
    console.error('Szolgáltatás lekérdezési hiba:', error.message);
    res.status(500).json({ message: 'Hiba történt a szolgáltatás lekérdezése során.' });
  }
};

// Új szolgáltatás létrehozása
const createServiceHandler = async (req, res) => {
  try {
    const { nev, description, ar, idotartam } = req.body;
    const service = await createService(nev, description, ar, idotartam);
    res.status(201).json({ message: 'Szolgáltatás sikeresen létrehozva!', service });
  } catch (error) {
    console.error('Szolgáltatás létrehozási hiba:', error.message);
    res.status(500).json({ message: 'Hiba történt a szolgáltatás létrehozása során.' });
  }
};

// Szolgáltatás frissítése
const updateServiceHandler = async (req, res) => {
  try {
    const { serviceId } = req.params;
    const { nev, description, ar, idotartam } = req.body;

    if (!nev && !description && !ar && !idotartam) {
      return res.status(400).json({ message: 'Legalább egy mezőt meg kell adni!' });
    }

    const updatedService = await updateService(serviceId, nev, description, ar, idotartam);
    res.status(200).json({ message: 'Szolgáltatás sikeresen frissítve!', service: updatedService });
  } catch (error) {
    console.error('Szolgáltatás frissítési hiba:', error.message);
    res.status(500).json({ message: 'Hiba történt a szolgáltatás frissítése során.' });
  }
};

// Szolgáltatás törlése
const deleteServiceHandler = async (req, res) => {
  try {
    const { serviceId } = req.params;
    const deletedService = await deleteService(serviceId);
    res.status(200).json({ message: 'Szolgáltatás sikeresen törölve!', service: deletedService });
  } catch (error) {
    console.error('Szolgáltatás törlési hiba:', error.message);
    res.status(500).json({ message: 'Hiba történt a szolgáltatás törlése során.' });
  }
};

module.exports = {
  getServices,
  getServiceByIdHandler,
  createServiceHandler,
  updateServiceHandler,
  deleteServiceHandler,
};
