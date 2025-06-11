import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Table, Button, Container, Form } from 'react-bootstrap';
import { useAuth } from '../hooks/useAuth';
import { getToken } from '../utils/auth';
import AppHeader from '../components/AppHeader';
import BackButton from '../components/BackButton';
import React from 'react';

export default function ContratoJugador() {
  const { id } = useParams();
  const { isInGroup } = useAuth();

  const [contrato, setContrato] = useState(null);
  const [jugadorNombre, setJugadorNombre] = useState('');
  const [modoEdicion, setModoEdicion] = useState(false);
  const [contratoEditado, setContratoEditado] = useState({
    contrato_fijo: '',
    contrato_por_gol: '',
    fijo_ganado: ''
  });

  const token = getToken();

  useEffect(() => {
    fetch(`http://portuense-manager.ddns.net:8000/api/contratos/jugador/${id}/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (res) => {
        if (res.status === 404) {
          setContrato(null);
        } else {
          const data = await res.json();
          setContrato(data);
          setContratoEditado({
            contrato_fijo: data.contrato_fijo,
            contrato_por_gol: data.contrato_por_gol,
            fijo_ganado: data.fijo_ganado,
          });
          setJugadorNombre(data.jugador_nombre || 'Jugador');
        }
      })
      .catch((err) => console.error('Error al cargar contrato:', err));
  }, [id]);

  const handleGuardar = async () => {
    const isNuevo = contrato === null;

    const url = isNuevo
      ? `http://portuense-manager.ddns.net:8000/api/contratos/`
      : `http://portuense-manager.ddns.net:8000/api/contratos/${contrato.id}/`;

    const method = isNuevo ? 'POST' : 'PATCH';
    const body = isNuevo
      ? { jugador: id, ...contratoEditado }
      : contratoEditado;

    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      const updated = await res.json();
      setContrato(updated);
      setModoEdicion(false);
    } else {
      alert('Error al guardar el contrato');
    }
  };

  if (!isInGroup('admin')) {
    return <p className="p-4 text-danger">Acceso restringido.</p>;
  }

  return (
    <>
      <AppHeader />
      <Container className="p-4">
        <BackButton to="/jugadores" label="←" />

        <h3>Contrato de {jugadorNombre || `jugador ${id}`}</h3>

        <Table striped bordered hover size="sm" className="mt-3">
          <thead>
            <tr>
              <th>Concepto</th>
              <th>Importe (€)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Contrato fijo</td>
              <td>
                <Form.Control
                  size="sm"
                  type="number"
                  value={contratoEditado.contrato_fijo || ''}
                  onChange={(e) =>
                    setContratoEditado((prev) => ({
                      ...prev,
                      contrato_fijo: e.target.value,
                    }))
                  }
                />
              </td>
            </tr>
            <tr>
              <td>Contrato por gol</td>
              <td>
                <Form.Control
                  size="sm"
                  type="number"
                  value={contratoEditado.contrato_por_gol || ''}
                  onChange={(e) =>
                    setContratoEditado((prev) => ({
                      ...prev,
                      contrato_por_gol: e.target.value,
                    }))
                  }
                />
              </td>
            </tr>
            <tr>
              <td>Fijo ganado</td>
              <td>
                <Form.Control
                  size="sm"
                  type="number"
                  value={contratoEditado.fijo_ganado || ''}
                  onChange={(e) =>
                    setContratoEditado((prev) => ({
                      ...prev,
                      fijo_ganado: e.target.value,
                    }))
                  }
                />
              </td>
            </tr>
          </tbody>
        </Table>

        <div className="mt-2">
          <Button size="sm" variant="primary" onClick={handleGuardar} className="me-2">
            {contrato ? 'Guardar cambios' : 'Crear contrato'}
          </Button>

          {contrato && (
            <Button
              size="sm"
              variant="outline-secondary"
              onClick={() => setModoEdicion(false)}
            >
              Cancelar
            </Button>
          )}
        </div>

        {!contrato && (
          <p className="text-muted mt-3">
            Este jugador aún no tenía contrato. Puedes crear uno rellenando los campos y pulsando "Crear contrato".
          </p>
        )}
      </Container>
    </>
  );
}
