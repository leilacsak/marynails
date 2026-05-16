import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './ThankYou.css';

const ThankYou = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { amount, bookingDetails } = location.state || {};

  const formatTime = (value) => {
    if (!value) return '';
    return new Date(value).toLocaleTimeString('hu-HU', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (value) => {
    if (!value) return '';
    return new Date(value).toLocaleDateString('hu-HU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="thank-you-container">
      <div className="thank-you-card">
        <h1>Booking confirmed</h1>
        <p>Your payment was successful.</p>
        <p>Booking confirmation has been sent to your email.</p>
        {bookingDetails?.serviceName && (
          <p className="booking-details">You booked: {bookingDetails.serviceName}</p>
        )}
        {bookingDetails?.date && (
          <p className="booking-details">When: {formatDate(bookingDetails.date)} at {formatTime(bookingDetails.startTime)} - {formatTime(bookingDetails.endTime)}</p>
        )}
        {typeof amount === 'number' && <p className="booking-amount">Paid: £{amount.toFixed(2)}</p>}
        <button type="button" className="thank-you-button" onClick={() => navigate('/')}>Go to Home</button>
      </div>
    </div>
  );
};

export default ThankYou;
