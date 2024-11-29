import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  
  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <Link to="/">MaryNails</Link> 
      </div>
      <ul className="navbar-menu">
      
        <li>
          <Link to="/">Home</Link>
        </li>
        <li>
          <Link to="/about">About</Link>
        </li>
        <li>
          <Link to="/services">Services</Link>
        </li>
        <li>
          <Link to="/bookings">Booking</Link>
        </li>
        <li>
          <Link to="/prices">Prices</Link>
        </li>
        <li>
          <Link to="/contact">Contact</Link>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
