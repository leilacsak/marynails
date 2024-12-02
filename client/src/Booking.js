import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './Booking.css';
import {useLocation, useNavigate} from 'react-router-dom';

const Booking = () => {
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);
  const [availableTimeslots, setAvailableTimeslots] = useState([]);
  const [selectedTimeslot, setSelectedTimeslot] = useState(undefined);
  const [customerDetails, setCustomerDetails] = useState({ name: '', email: '', phone: '' });
  const [bookingSummary, setBookingSummary] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');


  const location = useLocation();
  const serviceId = location.state?.serviceId

  useEffect(() => {
    if (serviceId) setSelectedService(serviceId)
  }, [serviceId])

  const navigate = useNavigate(); // Navigáció inicializálása

  // Szolgáltatások betöltése
  useEffect(() => {
    fetch('http://localhost:3000/api/services')
      .then((response) => {
        if (!response.ok) throw new Error('Szolgáltatások lekérdezése sikertelen!');
        return response.json();
      })
      .then((data) => setServices(data.services || []))
      .catch((error) => console.error('Hiba a szolgáltatások lekérdezése során:', error));
  }, []);

  // Idősávok betöltése
  useEffect(() => {
    if (selectedService && selectedDate) {
      const formattedDate = selectedDate.toISOString().split('T')[0];
      fetch(`http://localhost:3000/api/timeslots?serviceId=${selectedService}&date=${formattedDate}`)
        .then((response) => {
          if (!response.ok) throw new Error('Idősávok lekérdezése sikertelen!');
          return response.json();
        })
        .then((data) =>{
          console.log(data.timeslots); 
          setAvailableTimeslots(data.timeslots || []);
        })
        .catch((error) => console.error('Hiba az idősávok lekérdezése során:', error));
    }
  }, [selectedService, selectedDate]);

  // Foglalás elküldése
  const handleBookingSubmit = async () => {
    if (!selectedService || !selectedDate || !selectedTimeslot || !customerDetails.name || !customerDetails.email || !customerDetails.phone) {
      alert('Please fill in all fields!');
      return;
    }

    setErrorMessage('');
  

    const bookingData = {
      serviceid: selectedService,
      datum: selectedDate.toISOString().split('T')[0],
      timeslotid: selectedTimeslot,
      name: customerDetails.name,
      email: customerDetails.email,
      phone: customerDetails.phone,
    };

    console.log('Küldött adatok:', bookingData);


    try {
      const response = await fetch('http://localhost:3000/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData),
      });

      const result = await response.json();
      if (response.ok) {
        setBookingSummary(result.booking);
        setSuccessMessage('Successful booking! Please check your email for confirmation.');
        console.log('Navigáció indítása a Payment oldalra:', result.booking.foglalasid);
        // Navigáció a Payment oldalra a foglalás sikeressége után
        navigate('/payment', { state: { bookingId: result.booking.foglalasid } });

      } else {
        console.error('Foglalási hiba:', result.message);
      }
    } catch (error) {
      console.error('Hiba a foglalás során:', error);
      setErrorMessage('Hiba történt a foglalás során.');
    }
  };

  return (
    <div className="booking-container">
      <h1>Book Your Appointment</h1>
      <div className="error-message">
      {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
     </div>
      {successMessage && <p className="success-message">{successMessage}</p>}
      {bookingSummary ? (
        <div className="booking-summary">
          <h2>Booking Confirmed!</h2>
          <p>Service: {bookingSummary.serviceName}</p>
          <p>Date: {bookingSummary.date}</p>
          <p>Time: {bookingSummary.timeslot}</p>
        </div>
      ) : (
        <>
          <div className="step">
            <label htmlFor="service">Choose a Service</label>
            <select
              id="service"
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
            >
              <option value="">-- Select a Service --</option>
              {services.map((service) => (
                <option key={service.serviceid} value={service.serviceid}>
                  {service.nev}
                </option>
              ))}
            </select>
          </div>

          {selectedService && (
            <div className="step">
              <label htmlFor="date">Choose a Date</label>
              <DatePicker
                selected={selectedDate}
                onChange={(date) => setSelectedDate(date)}
                dateFormat="yyyy.MM.dd"
                minDate={new Date()}
              />
            </div>
          )}

          {selectedService && selectedDate && (
             <div className="step">
               <label htmlFor="timeslot">Choose an Available Time</label>
               <select
                 id="timeslot"
                  value={selectedTimeslot}
                  onChange={(e) => {
                    const timeslotId = parseInt(e.target.value, 10);
                    setSelectedTimeslot(timeslotId);
                    console.log('Selected Timeslot ID:', timeslotId);
                  }}
                >
                  <option value="">-- Select a Time --</option>
                  {availableTimeslots.map((timeslot, index) => (
                    <option key={`${timeslot.timeslotid}-${index}`} value={timeslot.timeslotid}>
                      {new Date(timeslot.starttime).toLocaleTimeString('hu-HU', { hour: '2-digit', minute: '2-digit' })}
                    </option>
                  ))}
              </select>  
             </div>
          )}


          {selectedTimeslot && (
            <div className="step">
              <label htmlFor="customer-name">Your Name</label>
              <input
                type="text"
                id="customer-name"
                value={customerDetails.name}
                onChange={(e) =>
                  setCustomerDetails((prev) => ({ ...prev, name: e.target.value }))
                }
              />
              <label htmlFor="customer-email">Your Email</label>
              <input
                type="email"
                id="customer-email"
                value={customerDetails.email}
                onChange={(e) =>
                  setCustomerDetails((prev) => ({ ...prev, email: e.target.value }))
                }
              />
              <label htmlFor="customer-phone">Your Phone</label>
              <input
                type="text"
                id="customer-phone"
                value={customerDetails.phone}
                onChange={(e) =>
                  setCustomerDetails((prev) => ({ ...prev, phone: e.target.value }))
                }
              />
            </div>
          )}

          {customerDetails.name && customerDetails.email && customerDetails.phone && (
            <button className="submit-button" onClick={handleBookingSubmit}>
              Submit Booking
            </button>
          )}
        </>
      )}
    </div>
  );
};

export default Booking;
