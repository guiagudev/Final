import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { getToken } from '../utils/auth';

export default function CrearSubcategoriaModal({ show, onHide, categoria, equipo, onSuccess }) {
  const [codigo, setCodigo] = useState('');
  const [nombre, setNombre] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!codigo.trim() || !nombre.trim()) {
      toast.error('Por favor, completa todos los campos');
      return;
    }

    setLoading(true);
    const token = getToken();

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/subcategorias/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          codigo: codigo.trim().toUpperCase(),
          nombre: nombre.trim(),
          categoria: categoria,
          equipo: equipo,
          activa: true
        }),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success('Subcategoría creada correctamente');
        setCodigo('');
        setNombre('');
        onSuccess(data);
        onHide();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Error al crear la subcategoría');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error de conexión al crear la subcategoría');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setCodigo('');
    setNombre('');
    onHide();
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Crear Nueva Subcategoría</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Código</Form.Label>
            <Form.Control
              type="text"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              placeholder="Ej: D, E, F..."
              maxLength={10}
              required
            />
            <Form.Text className="text-muted">
              Código único para la subcategoría (máximo 10 caracteres)
            </Form.Text>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Nombre</Form.Label>
            <Form.Control
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: Subcategoría D"
              maxLength={50}
              required
            />
            <Form.Text className="text-muted">
              Nombre descriptivo para la subcategoría
            </Form.Text>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Categoría</Form.Label>
            <Form.Control
              type="text"
              value={categoria}
              disabled
              className="bg-light"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Equipo</Form.Label>
            <Form.Control
              type="text"
              value={equipo === 'M' ? 'Masculino' : 'Femenino'}
              disabled
              className="bg-light"
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Cancelar
        </Button>
        <Button 
          variant="danger" 
          onClick={handleSubmit}
          disabled={loading || !codigo.trim() || !nombre.trim()}
        >
          {loading ? 'Creando...' : 'Crear Subcategoría'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
