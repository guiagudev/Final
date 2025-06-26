import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Form, Button, Container, Alert } from "react-bootstrap";
import { getToken } from "../utils/auth";
import React from 'react';
import BackButton from "../components/BackButton"

export default function NuevoComentario() {
  const { id } = useParams(); // ID del jugador desde la URL
  const navigate = useNavigate();
  const [titulo, setTitulo] = useState("");
  const [contenido, setContenido] = useState("");
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const comentario = {
      titulo,
      contenido
    };

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/comentarios-jugador/jugador/${id}/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`
        },
        body: JSON.stringify(comentario)
      });

      if (!res.ok) {
        const errData = await res.json();
        console.error("Detalles del error:", errData);
        throw new Error("Error al enviar el comentario");
      }

      navigate(`/jugadores/${id}`);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Container className="mt-4" style={{ maxWidth: "600px" }}>
      <BackButton to="/dashboard" label="←" />
      <h3>Nuevo Comentario</h3>
      {error && <Alert variant="danger">{error}</Alert>}
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Título</Form.Label>
          <Form.Control
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Contenido</Form.Label>
          <Form.Control
            as="textarea"
            rows={6}
            value={contenido}
            onChange={(e) => setContenido(e.target.value)}
            required
          />
        </Form.Group>

        

        <Button type="submit" variant="primary">
          Publicar Comentario
        </Button>
      </Form>
    </Container>
  );
}
