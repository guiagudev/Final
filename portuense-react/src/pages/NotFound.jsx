import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Alert, Spinner } from 'react-bootstrap';

export default function NotFound() {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirigir al login después de 3 segundos
    const timer = setTimeout(() => {
      navigate('/');
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <Container className="mt-5 text-center">
      <Alert variant="danger">
        <h1>404 - Página No Encontrada</h1>
        <p>Acceso denegado. No tienes permisos para ver esta página.</p>
        <p>Redirigiendo al login en 3 segundos...</p>
        <Spinner animation="border" variant="danger" />
      </Alert>
    </Container>
  );
}
