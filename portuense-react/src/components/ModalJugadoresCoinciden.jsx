// src/components/ModalJugadoresCoinciden.jsx
import React, { useEffect, useState } from "react";
import { Modal, Button, Spinner, ListGroup } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

export default function ModalJugadoresCoinciden({ show, onHide, clubId, filtros }) {
  const [jugadores, setJugadores] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const token = sessionStorage.getItem("accessToken");

  useEffect(() => {
    if (!show || !clubId) return;

    const params = new URLSearchParams({ club: clubId });
    Object.entries(filtros).forEach(([key, val]) => {
      if (val) params.append(key, val);
    });

    setLoading(true);
    fetch(`${import.meta.env.VITE_API_URL}/jugadores-rivales/?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(setJugadores)
      .finally(() => setLoading(false));
  }, [show, clubId, filtros, token]);

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Jugadores del Club</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {loading ? (
          <Spinner animation="border" />
        ) : jugadores.length === 0 ? (
          <p>No hay jugadores que coincidan con los filtros.</p>
        ) : (
          <ListGroup>
            {jugadores.map((jugador) => (
              <ListGroup.Item
                key={jugador.id}
                action
                onClick={() => {
                  onHide(); // cerramos modal
                  navigate(`/clubes-rivales/${clubId}/jugadores/${jugador.id}`);
                }}
              >
                {jugador.nombre}
              </ListGroup.Item>
            ))}
          </ListGroup>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>Cerrar</Button>
      </Modal.Footer>
    </Modal>
  );
}
