import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

const AdminCalendar = () => {
  const [bookings, setBookings] = useState([]);

  // Foglalások lekérdezése
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/bookings');
        if (!response.ok) throw new Error('Foglalások lekérdezése sikertelen!');
        const data = await response.json();
        setBookings(data.bookings);
      } catch (error) {
        console.error('Hiba a foglalások lekérdezése során:', error);
      }
    };

    fetchBookings();
  }, []);

  // Foglalás törlése
  const deleteBooking = async (bookingId) => {
    if (!window.confirm('Biztosan törölni szeretnéd ezt a foglalást?')) return;

    try {
      const response = await fetch(`http://localhost:3000/api/bookings/${bookingId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Foglalás törlése sikertelen!');
      alert('Foglalás törölve!');
      setBookings((prev) => prev.filter((booking) => booking.foglalasid !== bookingId));
    } catch (error) {
      console.error('Hiba a foglalás törlése során:', error);
    }
  };

  // Foglalás státuszának frissítése
  const updateBookingStatus = async (bookingId, newStatus) => {
    try {
      const response = await fetch(`http://localhost:3000/api/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!response.ok) throw new Error('Foglalás státuszának frissítése sikertelen!');
      alert('Foglalás státusza frissítve!');
      setBookings((prev) =>
        prev.map((booking) =>
          booking.foglalasid === bookingId ? { ...booking, status: newStatus } : booking
        )
      );
    } catch (error) {
      console.error('Hiba a foglalás frissítése során:', error);
    }
  };

  // Foglalások megjelenítése egy adott napon
  const renderBookings = (date) => {
    const dayBookings = bookings.filter(
      (booking) => new Date(booking.datum).toDateString() === date.toDateString()
    );

    return dayBookings.map((booking) => {
      const startTime = new Date(booking.timeslotid.starttime).toLocaleTimeString('hu-HU', {
        hour: '2-digit',
        minute: '2-digit',
      });
      const endTime = new Date(booking.timeslotid.endtime).toLocaleTimeString('hu-HU', {
        hour: '2-digit',
        minute: '2-digit',
      });
      return (
        <div key={booking.foglalasid} className="booking-item">
          <strong>{booking.name}</strong>: {startTime} - {endTime}
          <div>
            <button onClick={() => updateBookingStatus(booking.foglalasid, 'approved')}>
              Jóváhagyás
            </button>
            <button onClick={() => updateBookingStatus(booking.foglalasid, 'rejected')}>
              Elutasítás
            </button>
            <button onClick={() => deleteBooking(booking.foglalasid)}>Törlés</button>
          </div>
        </div>
      );
    });
  };

  return (
    <div>
      <h2>Foglalások naptára</h2>
      <Calendar
        tileContent={({ date }) => (
          <div className="tile-content">{renderBookings(date)}</div>
        )}
      />
    </div>
  );
};

export default AdminCalendar;
