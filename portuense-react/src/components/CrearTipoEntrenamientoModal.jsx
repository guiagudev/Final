import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { getToken } from '../utils/auth';
import { Save, X } from 'lucide-react';

export default function CrearTipoEntrenamientoModal({ show, onHide, onSuccess }) {
  const [formData, setFormData] = useState({
    codigo: '',
    nombre: '',
    descripcion: '',
    color: '#007bff'
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.codigo.trim() || !formData.nombre.trim()) {
      toast.error('Por favor, completa todos los campos obligatorios');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/tipos-entrenamiento/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          ...formData,
          activo: true
        }),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success('Tipo de entrenamiento creado correctamente');
        setFormData({
          codigo: '',
          nombre: '',
          descripcion: '',
          color: '#007bff'
        });
        onSuccess(data);
        onHide();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Error al crear el tipo de entrenamiento');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error de conexión al crear el tipo de entrenamiento');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      codigo: '',
      nombre: '',
      descripcion: '',
      color: '#007bff'
    });
    onHide();
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Crear Nuevo Tipo de Entrenamiento</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Código</Form.Label>
            <Form.Control
              type="text"
              value={formData.codigo}
              onChange={(e) => setFormData({...formData, codigo: e.target.value})}
              placeholder="Ej: tactico, fisico, tecnico..."
              maxLength={20}
              required
            />
            <Form.Text className="text-muted">
              Código único para el tipo de entrenamiento (máximo 20 caracteres)
            </Form.Text>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Nombre</Form.Label>
            <Form.Control
              type="text"
              value={formData.nombre}
              onChange={(e) => setFormData({...formData, nombre: e.target.value})}
              placeholder="Ej: Táctico, Físico, Técnico..."
              maxLength={100}
              required
            />
            <Form.Text className="text-muted">
              Nombre descriptivo para el tipo de entrenamiento
            </Form.Text>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Descripción</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={formData.descripcion}
              onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
              placeholder="Describe el tipo de entrenamiento..."
            />
            <Form.Text className="text-muted">
              Descripción opcional del tipo de entrenamiento
            </Form.Text>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Color</Form.Label>
            <Form.Control
              type="color"
              value={formData.color}
              onChange={(e) => setFormData({...formData, color: e.target.value})}
              required
            />
            <Form.Text className="text-muted">
              Color para identificar este tipo de entrenamiento en el calendario
            </Form.Text>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          <X className="me-2" size={16} />
          Cancelar
        </Button>
        <Button
          variant="success"
          onClick={handleSubmit}
          disabled={loading || !formData.codigo.trim() || !formData.nombre.trim()}
        >
          <Save className="me-2" size={16} />
          {loading ? 'Creando...' : 'Crear Tipo'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
