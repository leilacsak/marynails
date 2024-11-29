import React from 'react';
import './Services.css';

const Services = () => {
  return (
    <div className="services-container">
      <h1 className="services-title">My Services</h1>
      <div className="services-list">
        <div className="service-item">
          <div className="service-image">
            <img src="/manicure.jpg" alt="Manicure" />
          </div>
          <div className="service-description">
            <h2>Manicure</h2>
            <p>Professional care for natural nails, ensuring a clean and polished look.</p>
          </div>
        </div>

        <div className="service-item">
          <div className="service-image">
            <img src="/extensions.jpg" alt="Gel Polish" />
          </div>
          <div className="service-description">
            <h2>Gel Extensions - Full Set</h2>
            <p>"Transform your nails with beautifully shaped, long-lasting enhancements crafted using strong and durable builder gel.
                <br/> Choose any design and color to perfectly express your style!".</p>
          </div>
        </div>

        <div className="service-item">
          <div className="service-image">
            <img src="gellakk.jpg" alt="Gel Refills" />
          </div>
          <div className="service-description">
            <h2>Gel Polish</h2>
            <p>Long-lasting, high-gloss finish with a variety of colors to choose from.</p>
          </div>
        </div>

        <div className="service-item">
          <div className="service-image">
            <img src="/bridal.jpg" alt="Wedding Nails" />
          </div>
          <div className="service-description">
            <h2>Extreme/Wedding Nails</h2>
            <p>Customized nail designs for special occasions, with bold and intricate styles.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Services;
