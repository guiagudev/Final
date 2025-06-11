// src/pages/DireccionDeportiva/JugadoresPorCategoria.jsx
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Container, ListGroup, Spinner, Alert } from "react-bootstrap";
import AppHeader from "../../components/AppHeader";
import BackButton from "../../components/BackButton";

export default function JugadoresPorCategoria() {
  const { categoria, equipo } = useParams();
  const token = sessionStorage.getItem("accessToken");
  const [jugadores, setJugadores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchJugadores = async () => {
      try {
        const res = await fetch(
          `http://portuense-manager:8000/api/jugadores?categoria=${categoria}&equipo=${equipo}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!res.ok) throw new Error("Error al cargar jugadores");

        const data = await res.json();
        setJugadores(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchJugadores();
  }, [categoria, equipo, token]);

  return (
    <>
      <AppHeader />
      <BackButton to="/direccion-deportiva/" />
      <Container className="mt-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4>
            Jugadores de <strong>{categoria}</strong> - <strong>{equipo}</strong>
          </h4>
          
        </div>

        {loading ? (
          <Spinner animation="border" />
        ) : error ? (
          <Alert variant="danger">{error}</Alert>
        ) : jugadores.length === 0 ? (
          <p>No hay jugadores registrados.</p>
        ) : (
          <ListGroup>
            {jugadores.map((jugador) => (
              <ListGroup.Item key={jugador.id}>
                <Link to={`/jugadores/${jugador.id}`}>
                  {jugador.nombre} {jugador.apellidos}
                </Link>
              </ListGroup.Item>
            ))}
          </ListGroup>
        )}
      </Container>
    </>
  );
}
