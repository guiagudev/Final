import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, Button, Modal, Form, Container, Row, Col, Image } from "react-bootstrap";

import AppHeader from "../components/AppHeader";
import { toast } from "react-toastify";
import { getToken } from "../utils/auth";
import "react-toastify/dist/ReactToastify.css";
import ComentarioModal from "../components/ComentarioModal";

export default function DetalleJugador() {
  console.log("🚀 DETALLEJUGADOR: Componente iniciando");
  
  const { id } = useParams();
  console.log("🚀 DETALLEJUGADOR: ID del jugador:", id);
  
  const [jugador, setJugador] = useState(null);
  const [comentarios, setComentarios] = useState([]);
  const [showComentarioModal, setShowComentarioModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const user = null; // TEMPORAL: arreglar después
  const navigate = useNavigate();
  
  console.log("🚀 DETALLEJUGADOR: Estados inicializados");

  const fetchJugador = useCallback(async () => {
    console.log("🚀 DETALLEJUGADOR: fetchJugador iniciando");
    try {
      console.log("🚀 DETALLEJUGADOR: Haciendo fetch a:", `${import.meta.env.VITE_API_URL}/jugadores/${id}/`);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/jugadores/${id}/`, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });
      console.log("🚀 DETALLEJUGADOR: Response status:", response.status);
      console.log("🚀 DETALLEJUGADOR: Response ok:", response.ok);
      if (response.ok) {
        const data = await response.json();
        console.log("🚀 DETALLEJUGADOR: Jugador recibido:", data);
        setJugador(data);
      } else {
        console.error("🚀 DETALLEJUGADOR: Response no ok:", response.status);
      }
    } catch (error) {
      console.error("🚀 DETALLEJUGADOR: Error en fetchJugador:", error);
    }
  }, [id]);

  const fetchComentarios = useCallback(async () => {
    console.log("🚀 DETALLEJUGADOR: fetchComentarios iniciando");
    try {
      console.log("🚀 DETALLEJUGADOR: Haciendo fetch comentarios a:", `${import.meta.env.VITE_API_URL}/comentarios-jugador/?jugador=${id}`);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/comentarios-jugador/?jugador=${id}`, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });
      console.log("🚀 DETALLEJUGADOR: Comentarios response status:", response.status);
      if (response.ok) {
        const data = await response.json();
        console.log("🚀 DETALLEJUGADOR: Comentarios recibidos:", data);
        setComentarios(data);
      } else {
        console.error("🚀 DETALLEJUGADOR: Comentarios response no ok:", response.status);
      }
    } catch (error) {
      console.error("🚀 DETALLEJUGADOR: Error en fetchComentarios:", error);
    }
  }, [id]);

  useEffect(() => {
    console.log("🚀 DETALLEJUGADOR: useEffect ejecutándose");
    fetchJugador();
    fetchComentarios();
    setLoading(false);
    console.log("🚀 DETALLEJUGADOR: useEffect completado");
  }, [fetchJugador, fetchComentarios]);

  const handleDeleteComentario = async (comentarioId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/comentarios-jugador/${comentarioId}/`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });
      if (response.ok) {
        toast.success("Comentario eliminado correctamente");
        fetchComentarios();
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al eliminar comentario");
    }
  };

  console.log("🚀 DETALLEJUGADOR: Render - loading:", loading, "jugador:", jugador);
  
  if (loading) {
    console.log("🚀 DETALLEJUGADOR: Mostrando loading");
    return <div>Cargando...</div>;
  }

  if (!jugador) {
    console.log("🚀 DETALLEJUGADOR: No hay jugador, mostrando error");
    return <div>Jugador no encontrado</div>;
  }
  
  console.log("🚀 DETALLEJUGADOR: Renderizando componente completo");

  return (
    <Container className="mt-4">
      <Button
        variant="secondary"
        onClick={() => navigate("/jugadores")}
        className="mb-3"
      >
        ← Volver a Jugadores
      </Button>

      <Row>
        <Col md={4}>
          <Card>
            <Card.Body className="text-center">
              {jugador.imagen ? (
                <Image
                  src={`${import.meta.env.VITE_API_URL}${jugador.imagen}`}
                  alt={jugador.nombre}
                  fluid
                  className="mb-3"
                  style={{ maxHeight: "200px" }}
                />
              ) : (
                <div
                  className="mb-3 mx-auto"
                  style={{
                    width: "200px",
                    height: "200px",
                    backgroundColor: "#f8f9fa",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "8px",
                  }}
                >
                  <span className="text-muted">Sin imagen</span>
                </div>
              )}
              <h3>{jugador.nombre} {jugador.p_apellido} {jugador.s_apellido}</h3>
              <p className="text-muted">
                {jugador.categoria_display} {jugador.subcategoria_display} - {jugador.equipo_display}
              </p>
            </Card.Body>
          </Card>
        </Col>

        <Col md={8}>
          <Card>
            <Card.Header>
              <h4>Información del Jugador</h4>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <p><strong>Posición:</strong> {jugador.posicion}</p>
                  <p><strong>Edad:</strong> {jugador.edad} años</p>
                </Col>
                <Col md={6}>
                  <p><strong>Categoría:</strong> {jugador.categoria_display}</p>
                  <p><strong>Subcategoría:</strong> {jugador.subcategoria_display}</p>
                  <p><strong>Equipo:</strong> {jugador.equipo_display}</p>
                </Col>
              </Row>
              {jugador.descripcion && (
                <div className="mt-3">
                  <strong>Descripción:</strong>
                  <p className="mt-1">{jugador.descripcion}</p>
                </div>
              )}
            </Card.Body>
          </Card>

          {/* Sección de Comentarios */}
          <Card className="mt-4">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h4>Comentarios</h4>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setShowComentarioModal(true)}
              >
                Nuevo Comentario
              </Button>
            </Card.Header>
            <Card.Body>
              {comentarios.length === 0 ? (
                <p className="text-muted">No hay comentarios aún.</p>
              ) : (
                comentarios.map((comentario) => (
                  <div key={comentario.id} className="border-bottom pb-3 mb-3">
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <h6>{comentario.titulo}</h6>
                        <p className="mb-1">{comentario.contenido}</p>
                        <small className="text-muted">
                          Por {comentario.autor_nombre} el {new Date(comentario.fecha_emision).toLocaleDateString('es-ES')}
                        </small>
                      </div>
                      {(user && (user.permisos?.some(p => p.categoria === jugador.categoria && p.subcategoria === jugador.subcategoria && p.equipo === jugador.equipo) || 
                        user.groups?.includes('admin'))) && (
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDeleteComentario(comentario.id)}
                        >
                          Eliminar
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <ComentarioModal
        show={showComentarioModal}
        onHide={() => setShowComentarioModal(false)}
        jugadorId={id}
        onSuccess={() => {
          setShowComentarioModal(false);
          fetchComentarios();
        }}
      />
    </Container>
  );
}
