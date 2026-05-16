import React, { useState, useEffect } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import CheckoutForm from './CheckoutForm'; 
import { useLocation, useNavigate } from 'react-router-dom';

const stripePromise = loadStripe('pk_test_51QMuXRRv0Kv9OdBBQaB0LlR4h5CWGxmU9xpqwZwLyeprJt9RSHWMiUXdQrwe6nYrVSPG0sBlxOJhWjSM5lkgK7qo00rQpVajFi'); 

const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { bookingId } = location.state || {};
  const [clientSecret, setClientSecret] = useState('');
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState(0); 
  const [bookingDetails, setBookingDetails] = useState(null);


  useEffect(() => {
    if (bookingId) {
      fetch('http://localhost:3001/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ foglalasId: bookingId }),
      })
        .then((response) => response.json())
        .then((data) => {
          setClientSecret(data.clientSecret); 
          setAmount(data.amount / 100);
          setBookingDetails({
            serviceName: data.serviceName,
            date: data.datum,
            startTime: data.starttime,
            endTime: data.endtime,
          });
          setLoading(false);
        })
        .catch((error) => {
          console.error('Error creating payment intent:', error);
          setLoading(false);
        });
    }
  }, [bookingId]);  

  const handlePaymentSuccess = async () => {
    const response = await fetch('http://localhost:3001/api/payments/success', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ foglalasId: bookingId }),
    });

    if (!response.ok) {
      throw new Error('Failed to finalize payment.');
    }

    const data = await response.json();

    navigate('/thank-you', {
      state: {
        bookingId,
        amount,
        bookingDetails: data.booking
          ? {
              serviceName: data.booking.serviceName,
              date: data.booking.datum,
              startTime: data.booking.starttime,
              endTime: data.booking.endtime,
              amount: data.booking.amount,
            }
          : bookingDetails,
      },
      replace: true,
    });
  };

  if (loading) {
    return <div>Loading payment details...</div>;
  }

  if (!clientSecret) {
    return <div>Failed to initialize payment. Please try again.</div>;
  }

  return (
    <div className="payment-container">
      <h1>Complete Your Payment</h1>
      {<h2>Total Amount: £{amount.toFixed(2)}</h2>}
      {loading ? (
      <p>Loading payment details...</p>
    ) : clientSecret ? (
      <Elements stripe={stripePromise} options={{ clientSecret }}>
        <CheckoutForm clientSecret={clientSecret} onPaymentSuccess={handlePaymentSuccess} />
      </Elements>
       ) : (
        <p>Failed to initialize payment. Please try again.</p>
       )}
    </div>
  );
};

export default Payment;
