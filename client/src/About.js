import React from 'react';
import ContactInfo from './ContactInfo';
import OpeningHours from './OpeningHours';
import './About.css';

const About = () => {
  return (
    <div className="about-container">
      <div className="content-section">
        <div className="image-container">
          <img src="/headshot.jpg" alt="About MaryNails" />
        </div>
        <div className="text-container">
          <h1>About Me</h1>
          <p>
            Hi there, and thank you for visiting! My journey in the nail industry began over 8 years ago in Budapest. 
            What started as a personal interest in learning how to do my own nails quickly grew into a true passion, 
            and it wasn’t long before I decided to turn it into my profession.
          </p>
          <p>
            I trained in Budapest, where I had the privilege of learning from some of the best professionals in the industry. 
            Over the years, I’ve completed many private courses to further refine my skills and stay up to date with the 
            latest techniques and trends.
          </p>
          <p>
            For the past 5 years, I’ve been living and working in England, specializing in bespoke, extreme wedding nails. 
            While I love the creativity and detail of designing unique nails for special occasions, I equally enjoy creating 
            simple, elegant looks for everyday wear.
          </p>
        </div>
      </div>
      <div className="container">
        <ContactInfo />
        <OpeningHours />
      </div>
      </div>
  );
};

export default About;
