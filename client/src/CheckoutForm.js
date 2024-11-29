import React from 'react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';

const CheckoutForm = ({ clientSecret }) => {
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    const cardElement = elements.getElement(CardElement);

    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: cardElement,
      },
    });

    if (error) {
      console.error('Payment failed:', error.message);
    } else if (paymentIntent.status === 'succeeded') {
      console.log('Payment succeeded!');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="checkout-form">
      <CardElement className="card-element" />
      <button type="submit" className="submit-button" disabled={!stripe}>
        Pay
      </button>
    </form>
  );
};

export default CheckoutForm;
