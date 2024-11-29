import React from 'react';
import './Home.css';
import ContactInfo from './ContactInfo';
import OpeningHours from './OpeningHours';
import { useNavigate } from 'react-router-dom';


const Home = () => {
  const navigate = useNavigate();

  const handleBookingClick = () => {
    navigate('/bookings');
  };
  return (
    <div className="home-container">
      
      <div className="top-section">
        <div className="image-container">
        <img src="/salon.jpg" alt="Nail Salon" />
        </div>
        <div className="text-container">
          <h1>MaryNails</h1>
          <p>Sheffield's premier Nail Salon</p>
          <button className="appointment-button" onClick={handleBookingClick}>
           Book an appointment</button>
        </div>
      </div>
      <div className="container">
        <ContactInfo />
        <OpeningHours />
      </div>

    </div>
  );
};

export default Home;
