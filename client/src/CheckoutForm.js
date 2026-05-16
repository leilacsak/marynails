import React, { useState } from 'react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import './CheckoutFrom.css';

const CheckoutForm = ({ clientSecret, onPaymentSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState('');
  const [paid, setPaid] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage('');

    if (!stripe || !elements) {
      setMessage('Stripe is still loading. Please try again in a moment.');
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setMessage('Card input is not ready yet. Please refresh the page and try again.');
      return;
    }

    setProcessing(true);

    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: cardElement,
      },
    });

    if (error) {
      console.error('Payment failed:', error.message);
      setMessage(error.message || 'Payment failed.');
      setProcessing(false);
    } else if (paymentIntent.status === 'succeeded') {
      console.log('Payment succeeded!');
      setMessage('Payment succeeded.');
      setPaid(true);
      setProcessing(false);
      if (onPaymentSuccess) {
        await onPaymentSuccess(paymentIntent);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="checkout-form">
      <CardElement className="card-element" />
      {message && <p className="payment-message">{message}</p>}
      {!paid && (
        <button type="submit" className="submit-button" disabled={!stripe || processing}>
          {processing ? 'Processing...' : 'Pay'}
        </button>
      )}
    </form>
  );
};

export default CheckoutForm;
