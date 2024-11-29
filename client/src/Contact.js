import React from 'react';
import ContactInfo from './ContactInfo';
import OpeningHours from './OpeningHours';
import './Contact.css';

const Contact = () => {
  return (
    <div className="contact-container">
      <div className="map-container">
        <iframe
          title="Google Maps"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2378.614205303366!2d-1.470085284152353!3d53.38112828082959!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x487982ee4a89b2d5%3A0xdb20c75c0d8b79c8!2sSheffield%2C%20UK!5e0!3m2!1sen!2suk!4v1691524243871!5m2!1sen!2suk"
          className="map"
          allowFullScreen=""
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        ></iframe>
      </div>
      <div className="container">
        <ContactInfo />
        <OpeningHours />
      </div>
    </div>
  );
};

export default Contact;







