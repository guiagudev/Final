import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  Spinner,
  Container,
  Button,
  Modal,
  Form,
} from "react-bootstrap";
import BackButton from "../../components/BackButton";

export default function DetalleJugadorRival() {
  const { jugadorId } = useParams();
  const navigate = useNavigate();
  const [jugador, setJugador] = useState(null);
  const [comentarios, setComentarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredComentarioId, setHoveredComentarioId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    titulo: "",
    contenido: "",
  });

  const token = sessionStorage.getItem("accessToken");

  useEffect(() => {
    // Obtener datos del jugador rival
    fetch(`http://portuense-manager.ddns.net:8000/api/jugadores-rivales/${jugadorId}/`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setJugador(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    // Obtener comentarios del jugador rival
    fetch(`http://portuense-manager.ddns.net:8000/api/comentarios-rivales/jugador/${jugadorId}/`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setComentarios(data))
      .catch((err) => console.error("Error al obtener comentarios:", err));
  }, [jugadorId, token]);

  const eliminarComentario = (comentarioId) => {
    if (window.confirm("¿Eliminar este comentario?")) {
      fetch(`http://portuense-manager.ddns.net:8000/api/comentarios-rivales/${comentarioId}/`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => {
          if (res.ok) {
            setComentarios((prev) =>
              prev.filter((c) => c.id !== comentarioId)
            );
          } else {
            alert("No se pudo eliminar.");
          }
        })
        .catch(() => alert("Error de red al eliminar."));
    }
  };

  const eliminarJugador = async () => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar este jugador rival?")) return;

    try {
      const res = await fetch(`http://portuense-manager.ddns.net:8000/api/jugadores-rivales/${jugadorId}/`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        alert("Jugador eliminado correctamente.");
        navigate(-1); // volver atrás
      } else {
        alert("No se pudo eliminar el jugador.");
      }
    } catch (error) {
      alert("Error al conectar con el servidor.");
    }
  };

  const handleInputChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmitComentario = async (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      jugador: jugadorId,
      fecha_emision: new Date().toISOString().split("T")[0],
      fecha_creacion: new Date().toISOString().split("T")[0],
    };

    const res = await fetch(`http://portuense-manager.ddns.net:8000/api/comentarios-rivales/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      const nuevoComentario = await res.json();
      setComentarios((prev) => [nuevoComentario, ...prev]);
      setFormData({ titulo: "", contenido: "" });
      setShowModal(false);
    } else {
      alert("Error al crear el comentario.");
    }
  };

  if (loading) {
    return (
      <Container className="p-4">
        <Spinner animation="border" />
      </Container>
    );
  }

  if (!jugador) {
    return (
      <Container className="p-4">
        <p>Jugador no encontrado.</p>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <BackButton to={-1} />
      <Card className="shadow-sm mb-4">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-start">
            <div>
              <h3>{jugador.nombre}</h3>
              <p><strong>Edad:</strong> {jugador.edad}</p>
              <p><strong>Posición:</strong> {jugador.posicion}</p>
              <p><strong>Club:</strong> {jugador.club_nombre || "N/D"}</p>
            </div>
           
          </div>
        </Card.Body>
      </Card>

      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="mb-0">Comentarios</h5>
        <Button size="sm" onClick={() => setShowModal(true)}>
          Añadir Comentario
        </Button>
      </div>

      {comentarios.length === 0 ? (
        <p className="text-muted">No hay comentarios todavía.</p>
      ) : (
        comentarios.map((comentario) => (
          <div
            key={comentario.id}
            className="mb-3 p-3 position-relative"
            style={{
              backgroundColor: "#f9f9f9",
              border: "1px solid #ddd",
              borderRadius: "8px",
            }}
            onMouseEnter={() => setHoveredComentarioId(comentario.id)}
            onMouseLeave={() => setHoveredComentarioId(null)}
          >
            <h6 className="mb-1">{comentario.titulo}</h6>
            <p style={{ whiteSpace: "pre-wrap" }}>{comentario.contenido}</p>
            <div className="d-flex justify-content-between mt-2">
              <small className="text-muted">
                {new Date(comentario.fecha_creacion).toLocaleDateString()}
              </small>
              <small>
                <strong>{comentario.autor?.username || "Anónimo"}</strong>
              </small>
            </div>
            {hoveredComentarioId === comentario.id && (
              <Button
                variant="danger"
                size="sm"
                style={{ position: "absolute", top: "8px", right: "8px" }}
                onClick={() => eliminarComentario(comentario.id)}
              >
                Eliminar
              </Button>
            )}
          </div>
        ))
      )}

      {/* Modal para nuevo comentario */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Nuevo Comentario</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmitComentario}>
            <Form.Group className="mb-3">
              <Form.Label>Título</Form.Label>
              <Form.Control
                name="titulo"
                value={formData.titulo}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Contenido</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                name="contenido"
                value={formData.contenido}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <div className="d-flex justify-content-end">
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="ms-2" variant="primary">
                Guardar
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
}
