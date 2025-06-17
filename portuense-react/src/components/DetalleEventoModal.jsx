import React, { useEffect, useState } from 'react';
import { Modal, Button } from 'react-bootstrap';

export default function DetallesEventoModal({ show, evento, onClose, onEliminar }) {
  const [datos, setDatos] = useState({
    tipo: '',
    fecha: '',
    descripcion: '',
    localizacion: '',
    equipo2: '',
    categoriaEquipo: '',
    equipoGenero: '',
  });

  useEffect(() => {
    if (evento && show) {
      const tipo = evento.categoria || evento.tipo || 'Entrenamiento';
      const descripcion = evento.descripcion || evento.title || '';
      const localizacion = evento.localizacion || '';
      const equipo2 = evento.equipo2 || '';
      const categoriaEquipo = evento.categoria_equipo || '';
      const equipoGenero = evento.equipo_genero || '';

      const fecha = new Date(evento.start).toLocaleString();

      setDatos({ tipo, descripcion, localizacion, equipo2, categoriaEquipo, equipoGenero, fecha });
    }
  }, [evento, show]);

  if (!evento) return null;

  return (
    <Modal show={show} onHide={() => onClose(false)}>
      <Modal.Header closeButton>
        <Modal.Title>Detalles del Evento</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p><strong>Tipo:</strong> {datos.tipo}</p>
        <p><strong>Fecha:</strong> {datos.fecha}</p>
        <p><strong>Descripción:</strong> {datos.descripcion}</p>

        {datos.tipo === 'Partido' && datos.equipo2 && (
          <p><strong>Equipo contrario:</strong> {datos.equipo2}</p>
        )}

        {(datos.tipo === 'Partido' || datos.tipo === 'Entrenamiento') && datos.categoriaEquipo && (
          <p><strong>Categoría:</strong> {datos.categoriaEquipo}</p>
        )}

        {(datos.tipo === 'Partido' || datos.tipo === 'Entrenamiento') && datos.equipoGenero && (
          <p><strong>Equipo:</strong> {datos.equipoGenero === 'M' ? 'Masculino' : 'Femenino'}</p>
        )}

        {datos.localizacion && (
          <p><strong>Ubicación:</strong> {datos.localizacion}</p>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => onClose(false)}>
          Cerrar
        </Button>
        <Button variant="danger" onClick={onEliminar}>
          Eliminar
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
