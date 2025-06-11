// src/pages/CategoriaOpciones.jsx
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Button } from 'react-bootstrap';
import React from 'react';

export default function CategoriaOpciones() {
  const { categoria } = useParams();
  const navigate = useNavigate();

  const irA = (equipo) => {
    navigate(`/categoria/${categoria.toLowerCase()}/${equipo}`);
  };

  return (
    <Container className="mt-4">
      <h3>Categoría: {categoria}</h3>
      <p>Selecciona una opción:</p>
      <Button variant="primary" className="me-2" onClick={() => irA('M')}>Masculino</Button>
      <Button variant="danger" className="me-2" onClick={() => irA('F')}>Femenino</Button>
      <Button variant="secondary" onClick={() => irA('todos')}>Todos</Button>
    </Container>
  );
}
