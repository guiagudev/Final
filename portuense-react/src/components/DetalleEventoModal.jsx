import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

export default function DetallesEventoModal({ show, evento, onClose, onEliminar }) {
  const [modoEdicion, setModoEdicion] = useState(false);

  const [tipo, setTipo] = useState('Entrenamiento');
  const [fecha, setFecha] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [localizacion, setLocalizacion] = useState('');
  const [equipo2, setEquipo2] = useState('');
  const [categoriaEquipo, setCategoriaEquipo] = useState('');
  const [equipoGenero, setEquipoGenero] = useState('');

  const token = sessionStorage.getItem('accessToken');

  useEffect(() => {
    if (evento && show) {
      setTipo(evento.categoria || evento.tipo || 'Entrenamiento');
      setDescripcion(evento.descripcion || evento.title || '');
      setLocalizacion(evento.localizacion || '');
      setEquipo2(evento.equipo2 || '');
      setCategoriaEquipo(evento.categoria_equipo || '');
      setEquipoGenero(evento.equipo_genero || '');

      const date = new Date(evento.start);
      const iso = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);
      setFecha(iso);
    }
  }, [evento, show]);

  const handleGuardar = async () => {
    const body = {
      descripcion,
      fecha: new Date(fecha).toISOString(),
      categoria: tipo,
      equipo1: evento.equipo1 || 'Portuense F.C.',
      equipo2: tipo === 'Partido' ? equipo2 : '',
      localizacion,
      categoria_equipo: (tipo === 'Partido' || tipo === 'Entrenamiento') ? categoriaEquipo : null,
      equipo_genero: (tipo === 'Partido' || tipo === 'Entrenamiento') ? equipoGenero : null,
    };

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/eventos/${evento.id}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        setModoEdicion(false);
        onClose(true);
      } else {
        alert('Error al guardar los cambios');
      }
    } catch (err) {
      console.error(err);
      alert('No se pudo conectar al servidor');
    }
  };

  if (!evento) return null;

  return (
    <Modal show={show} onHide={() => onClose(false)}>
      <Modal.Header closeButton>
        <Modal.Title>Detalles del Evento</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {modoEdicion ? (
          <Form>
            <Form.Group className="mb-2">
              <Form.Label>Tipo</Form.Label>
              <Form.Select value={tipo} onChange={(e) => setTipo(e.target.value)}>
                <option value="Entrenamiento">Entrenamiento</option>
                <option value="Partido">Partido</option>
                <option value="Reunion">Reunión</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>Fecha</Form.Label>
              <Form.Control
                type="datetime-local"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>Descripción</Form.Label>
              <Form.Control
                type="text"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
              />
            </Form.Group>

            {tipo === 'Partido' && (
              <Form.Group className="mb-2">
                <Form.Label>Equipo contrario</Form.Label>
                <Form.Control
                  type="text"
                  value={equipo2}
                  onChange={(e) => setEquipo2(e.target.value)}
                />
              </Form.Group>
            )}

            {(tipo === 'Partido' || tipo === 'Entrenamiento') && (
              <>
                <Form.Group className="mb-2">
                  <Form.Label>Categoría</Form.Label>
                  <Form.Select
                    value={categoriaEquipo}
                    onChange={(e) => setCategoriaEquipo(e.target.value)}
                  >
                    <option value="">Selecciona una categoría</option>
                    <option value="PREBEN">Prebenjamín</option>
                    <option value="BEN">Benjamín</option>
                    <option value="ALE">Alevín</option>
                    <option value="INF">Infantil</option>
                    <option value="CAD">Cadete</option>
                    <option value="JUV">Juvenil</option>
                    <option value="SEN">Sénior</option>
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-2">
                  <Form.Label>Equipo (Género)</Form.Label>
                  <Form.Select
                    value={equipoGenero}
                    onChange={(e) => setEquipoGenero(e.target.value)}
                  >
                    <option value="">Selecciona el género</option>
                    <option value="M">Masculino</option>
                    <option value="F">Femenino</option>
                  </Form.Select>
                </Form.Group>
              </>
            )}

            <Form.Group className="mb-2">
              <Form.Label>Ubicación</Form.Label>
              <Form.Control
                type="text"
                value={localizacion}
                onChange={(e) => setLocalizacion(e.target.value)}
              />
            </Form.Group>
          </Form>
        ) : (
          <>
            <p><strong>Tipo:</strong> {tipo}</p>
            <p><strong>Fecha:</strong> {new Date(evento.start).toLocaleString()}</p>
            <p><strong>Descripción:</strong> {descripcion}</p>

            {tipo === 'Partido' && equipo2 && (
              <p><strong>Equipo contrario:</strong> {equipo2}</p>
            )}

            {(tipo === 'Partido' || tipo === 'Entrenamiento') && categoriaEquipo && (
              <p><strong>Categoría:</strong> {categoriaEquipo}</p>
            )}

            {(tipo === 'Partido' || tipo === 'Entrenamiento') && equipoGenero && (
              <p><strong>Equipo:</strong> {equipoGenero === 'M' ? 'Masculino' : 'Femenino'}</p>
            )}

            {localizacion && (
              <p><strong>Ubicación:</strong> {localizacion}</p>
            )}
          </>
        )}
      </Modal.Body>
      <Modal.Footer>
        {modoEdicion ? (
          <>
            <Button variant="secondary" onClick={() => setModoEdicion(false)}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={handleGuardar}>
              Guardar Cambios
            </Button>
          </>
        ) : (
          <>
            <Button variant="secondary" onClick={() => onClose(false)}>Cerrar</Button>
            <Button variant="warning" onClick={() => setModoEdicion(true)}>Editar</Button>
            <Button variant="danger" onClick={onEliminar}>Eliminar</Button>
          </>
        )}
      </Modal.Footer>
    </Modal>
  );
}
