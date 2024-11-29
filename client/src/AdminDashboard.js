import React, { useEffect, useState } from 'react';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [services, setServices] = useState([]);

  // Foglalások lekérdezése
  useEffect(() => {
    fetch('http://localhost:3000/api/bookings', {
      headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` },
    })
      .then((response) => {
        if (!response.ok) throw new Error('Foglalások lekérdezése sikertelen!');
        return response.json();
      })
      .then((data) => setBookings(data.bookings))
      .catch((error) => console.error('Hiba a foglalások lekérdezése során:', error));
  }, []);

  // Szolgáltatások lekérdezése
  useEffect(() => {
    fetch('http://localhost:3000/api/services', {
      headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` },
    })
      .then((response) => {
        if (!response.ok) throw new Error('Szolgáltatások lekérdezése sikertelen!');
        return response.json();
      })
      .then((data) => setServices(data.services))
      .catch((error) => console.error('Hiba a szolgáltatások lekérdezése során:', error));
  }, []);

  // Foglalás státuszának frissítése
  const updateBookingStatus = (bookingId, newStatus) => {
    fetch(`http://localhost:3000/api/bookings/${bookingId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('authToken')}`,
      },
      body: JSON.stringify({ status: newStatus }),
    })
      .then((response) => {
        if (!response.ok) throw new Error('Foglalás státuszának frissítése sikertelen!');
        return response.json();
      })
      .then((data) => {
        alert(data.message);
        setBookings((prev) =>
          prev.map((booking) =>
            booking.foglalasid === bookingId ? { ...booking, status: newStatus } : booking
          )
        );
      })
      .catch((error) => console.error('Hiba a foglalás frissítése során:', error));
  };

  // Foglalás törlése
  const deleteBooking = (bookingId) => {
    if (!window.confirm('Biztosan törölni szeretnéd ezt a foglalást?')) return;

    fetch(`http://localhost:3000/api/bookings/${bookingId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` },
    })
      .then((response) => {
        if (!response.ok) throw new Error('Foglalás törlése sikertelen!');
        return response.json();
      })
      .then((data) => {
        alert(data.message);
        setBookings((prev) => prev.filter((booking) => booking.foglalasid !== bookingId));
      })
      .catch((error) => console.error('Hiba a foglalás törlése során:', error));
  };

  // Foglalás frissítése 
  const updateBooking = (bookingId, updatedData) => {
    fetch(`http://localhost:3000/api/bookings/${bookingId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('authToken')}`,
      },
      body: JSON.stringify(updatedData),
    })
      .then((response) => {
        if (!response.ok) throw new Error('Foglalás frissítése sikertelen!');
        return response.json();
      })
      .then((data) => {
        alert(data.message);
        setBookings((prev) =>
          prev.map((booking) =>
            booking.foglalasid === bookingId ? { ...booking, ...updatedData } : booking
          )
        );
      })
      .catch((error) => console.error('Hiba a foglalás frissítése során:', error));
  };

  const formatInterval = (interval) => {
    if (typeof interval === 'object' && interval !== null) {
      const { hours = 0, minutes = 0 } = interval;
      let formatted = '';
      if (hours > 0) formatted += `${hours} óra `;
      if (minutes > 0) formatted += `${minutes} perc`;
      return formatted || '0 perc';
    }
  
    if (typeof interval === 'string') {
      const [hours, minutes] = interval.split(':').map(Number);
      let formatted = '';
      if (hours > 0) formatted += `${hours} óra `;
      if (minutes > 0) formatted += `${minutes} perc`;
      return formatted || '0 perc';
    }
  
    console.error('Nem várt formátumú idotartam:', interval);
    return 'Érvénytelen időtartam';
  };
  
  
  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>

      <section>
        <h2>Foglalások</h2>
        {bookings.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Id</th>
                <th>Ügyfél neve</th>
                <th>Szolgáltatás</th>
                <th>Dátum</th>
                <th>Státusz</th>
                <th>Műveletek</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={booking.foglalasid}>
                  <td>{booking.foglalasid}</td>
                  <td>{booking.name}</td>
                  <td>{booking.serviceName}</td>
                  <td>{booking.datum}</td>
                  <td>{booking.status}</td>
                  <td>
                    <button onClick={() => updateBookingStatus(booking.foglalasid, 'approved')}>
                      Jóváhagyás
                    </button>
                    <button onClick={() => updateBookingStatus(booking.foglalasid, 'rejected')}>
                      Elutasítás
                    </button>
                    <button onClick={() => deleteBooking(booking.foglalasid)}>Törlés</button>
                    <button
                      onClick={() =>
                        updateBooking(booking.foglalasid, { name: 'Új név', datum: '2024-12-01' })
                      }
                    >
                      Frissítés
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>Nincsenek foglalások.</p>
        )}
      </section>

      <section>
        <h2>Szolgáltatások</h2>
        {services.length > 0 ? (
          <ul>
            {services.map((service) => (
              <li key={service.serviceid}>
                {service.nev} - {formatInterval(service.idotartam)}
              </li>
            ))}
          </ul>
        ) : (
          <p>Nincsenek szolgáltatások.</p>
        )}
      </section>
    </div>
  );
};

export default AdminDashboard;
