// src/pages/DireccionDeportiva/JugadoresPorCategoria.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Container, ListGroup, Spinner, Alert } from "react-bootstrap";
import AppHeader from "../../components/AppHeader";
import BackButton from "../../components/BackButton";
import ModalCarpetasPDFs from "../../components/ModalCarpetasPDFs";

export default function JugadoresPorCategoria() {
  const { categoria, equipo, subcategoria } = useParams();
  const token = sessionStorage.getItem("accessToken");

  const [jugadores, setJugadores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [jugadorSeleccionado, setJugadorSeleccionado] = useState(null);

  useEffect(() => {
    const fetchJugadores = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/jugadores?categoria=${categoria}&equipo=${equipo}&subcategoria=${subcategoria}`,
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
  }, [categoria, equipo, subcategoria, token]);

  return (
    <>
      <AppHeader />
      <BackButton to="/direccion-deportiva" />
      <Container className="mt-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4>
            Jugadores de <strong>{categoria}</strong> -{" "}
            <strong>{equipo === "M" ? "Masculino" : "Femenino"}</strong> -{" "}
            <strong>Subcategoría {subcategoria}</strong>
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
              <ListGroup.Item
                key={jugador.id}
                className="d-flex justify-content-between align-items-center"
              >
                <span>
                  {jugador.nombre} {jugador.apellidos}
                </span>
                <button
                  className="btn btn-outline-primary btn-sm"
                  onClick={() => {
                    setJugadorSeleccionado(jugador.id);
                    setShowModal(true);
                  }}
                >
                  Ver PDFs
                </button>
              </ListGroup.Item>
            ))}
          </ListGroup>
        )}
      </Container>

      {jugadorSeleccionado && (
        <ModalCarpetasPDFs
          show={showModal}
          onHide={() => {
            setShowModal(false);
            setJugadorSeleccionado(null);
          }}
          jugadorId={jugadorSeleccionado}
        />
      )}
    </>
  );
}
