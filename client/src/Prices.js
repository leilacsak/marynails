import React, {useEffect, useState} from 'react';
import './Prices.css';
import { useNavigate } from 'react-router-dom';

const Prices = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);


  useEffect(() => {
    fetch('http://localhost:3000/api/services')
        .then((response) => {
          if (!response.ok) throw new Error('Szolgáltatások lekérdezése sikertelen!');
          return response.json();
        })
        .then((data) => setServices(data.services))
        .catch((error) => console.error('Hiba a szolgáltatások lekérdezése során:', error));
  }, []);


  useEffect(() => {
    console.log({services})
  }, [services]);
  const handleBookingClick = (serviceId) => {
    navigate('/bookings', { state: { serviceId } });
  };

  return (
    <div className="prices-container">
      <div className="prices-wrapper">
        <h1 className="prices-title">Price List</h1>
        <div className="prices-list">
          {services.map((service) => (
            <div className="price-item" key={service.serviceid}>
              <h2>{service.nev}</h2>
              <p>{service.ar}</p>
              <button
                className="appointment-button"
                onClick={() => handleBookingClick(service.serviceid)}
              >
                Book {service.name}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Prices;


