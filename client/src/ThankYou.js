import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const ThankYou = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { amount, bookingDetails } = location.state || {};

  const serviceName = bookingDetails?.serviceName || bookingDetails?.service_name;
  const bookingDate = bookingDetails?.date || bookingDetails?.datum;
  const bookingStartTime = bookingDetails?.startTime || bookingDetails?.starttime;
  const bookingEndTime = bookingDetails?.endTime || bookingDetails?.endtime;
  const paidAmount = bookingDetails?.amount ?? amount;

  const formatTime = (value) => {
    if (!value) return '';
    return new Date(value).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (value) => {
    if (!value) return '';
    return new Date(value).toLocaleDateString('en-US', {
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
        {serviceName && (
          <p className="booking-details">You booked: {serviceName}</p>
        )}
        {bookingDate && (
          <p className="booking-details">When: {formatDate(bookingDate)} at {formatTime(bookingStartTime)} - {formatTime(bookingEndTime)}</p>
        )}
        {typeof paidAmount === 'number' && <p className="booking-amount">Paid: £{paidAmount.toFixed(2)}</p>}
        <button type="button" className="thank-you-button" onClick={() => navigate('/')}>Go to Home</button>
      </div>
    </div>
  );
};

export default ThankYou;
