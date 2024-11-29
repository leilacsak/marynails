import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from "./Navbar";
import Home from './Home';
import About from './About';
import Services from "./Services";
import Booking from "./Booking";
import Prices from "./Prices";
import Contact from "./Contact";
import Login from "./Login";
import AdminDashboard from "./AdminDashboard"
import Payment from './Payment';


const App = () => {
  return (
    <Router>
       <Navbar />
      <Routes>
        <Route path="/" element={<Home />} /> 
        <Route path="/about" element={<About />} /> 
        <Route path="/services" element={<Services />} />
        <Route path="/bookings" element={<Booking />} />
        <Route path="/prices" element={<Prices />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/admin/login" element={<Login />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/payment" element={<Payment />} />
      </Routes>
    </Router>
  );
};

export default App;
