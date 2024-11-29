import React from 'react';
import './Prices.css';
import { useNavigate } from 'react-router-dom';

const Prices = () => {
  const navigate = useNavigate();

  const services = [
    { id: 1, name: 'Manicure', price: '£20' },
    { id: 2, name: 'Extensions', price: '£60' },
    { id: 3, name: 'Gel Polish', price: '£40' },
    { id: 4, name: 'Extreme/Bridal', price: '£100' },
  ];

  const handleBookingClick = (serviceId) => {
    navigate('/booking', { state: { serviceId } }); 
  };

  return (
    <div className="prices-container">
      <div className="prices-wrapper">
        <h1 className="prices-title">Price List</h1>
        <div className="prices-list">
          {services.map((service) => (
            <div className="price-item" key={service.id}>
              <h2>{service.name}</h2>
              <p>{service.price}</p>
              <button
                className="appointment-button"
                onClick={() => handleBookingClick(service.id)}
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


