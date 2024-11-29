import React, { useState } from 'react';
import './Login.css';
import { useNavigate } from "react-router-dom";


const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault(); // Az alapértelmezett form beküldésének megakadályozása

    const loginData = {
      email,
      password,
    };

    try {
      const response = await fetch('http://localhost:3000/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData),
      });

      const result = await response.json();

      if (response.ok) {
        // Token tárolása a helyi tárolóban
        localStorage.setItem('authToken', result.token);
        navigate("/admin");
      } else {
        console.error('Bejelentkezési hiba:', result.message);
        alert(result.message);
      }
    } catch (error) {
      console.error('Hiba a bejelentkezés során:', error);
      alert('Hiba történt a bejelentkezés során, kérjük próbálja újra.');
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h2>Admin Login</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email address</label>
            <input
              type="email"
              id="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="login-button">Login</button>
        </form>
      </div>
    </div>
  );
};

export default Login;


