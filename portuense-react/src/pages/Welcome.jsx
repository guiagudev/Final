import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getToken, clearToken } from '../utils/auth';
import React from 'react';

export default function Welcome() {
  const navigate = useNavigate();

  useEffect(() => {
    if (!getToken()) {
      navigate('/');
    }
  }, [navigate]);

  const handleLogout = () => {
    clearToken();
    navigate('/');
  };

  return (
    <div>
      <h1>Welcome, socio 🔥</h1>
      <button onClick={handleLogout}>Cerrar sesión</button>
    </div>
  );
}