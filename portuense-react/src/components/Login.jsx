import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { saveToken } from '../utils/auth';
import styles from '../assets/styles/Login.module.css';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/token/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) throw new Error('Login failed');

      const data = await response.json();
      const token = data.access;

      saveToken(token, false);

      const meRes = await fetch(`${import.meta.env.VITE_API_URL}/me/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!meRes.ok) throw new Error('Error al obtener datos del usuario');

      const userData = await meRes.json();

      sessionStorage.setItem('user', JSON.stringify(userData));
      sessionStorage.setItem('userGroups', JSON.stringify(userData.groups || []));
      sessionStorage.setItem('userPermisos', JSON.stringify(userData.permisos || []));
      sessionStorage.setItem('userVistas', JSON.stringify(userData.vistas || []));

      navigate('/dashboard');
    } catch (err) {
      console.error('❌ Error en login:', err);
      setError('Usuario o contraseña incorrectos');
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.cardCustom}>
        <h2 className="text-center mb-4">Login</h2>
        <form onSubmit={handleSubmit} autoComplete="off">
          <div className="mb-3">
            <input
              type="text"
              className="form-control"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <input
              type="password"
              className="form-control"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="d-grid">
            <button type="submit" className="btn btn-primary">
              Entrar
            </button>
          </div>
          {error && <p className="text-danger text-center mt-3">{error}</p>}
        </form>
      </div>
    </div>
  );
}
