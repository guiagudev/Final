import React, { useState } from 'react';
import { Modal, Form, Button, Alert } from 'react-bootstrap';
import { getToken } from '../utils/auth';
import { toast } from 'react-toastify';

export default function ComentarioModal({ show, onHide, jugadorId, onSuccess }) {
  const [titulo, setTitulo] = useState('');
  const [contenido, setContenido] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/comentarios-jugador/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          jugador: jugadorId,
          titulo,
          contenido
        }),
      });

      if (response.ok) {
        toast.success('Comentario creado correctamente');
        setTitulo('');
        setContenido('');
        onSuccess();
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Error al crear el comentario');
      }
    } catch (error) {
      setError('Error de conexión');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setTitulo('');
    setContenido('');
    setError(null);
    onHide();
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Nuevo Comentario</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Título *</Form.Label>
            <Form.Control
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Título del comentario"
              required
            />
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label>Contenido *</Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              value={contenido}
              onChange={(e) => setContenido(e.target.value)}
              placeholder="Escribe tu comentario aquí..."
              required
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Cancelar
        </Button>
        <Button 
          variant="primary" 
          onClick={handleSubmit}
          disabled={submitting || !titulo || !contenido}
        >
          {submitting ? 'Creando...' : 'Crear Comentario'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
