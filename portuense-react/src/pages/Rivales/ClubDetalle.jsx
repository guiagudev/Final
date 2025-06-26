import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Container, Card, Button, Spinner, Modal, Form } from "react-bootstrap";
import BackButton from "../../components/BackButton";
import { toast } from "react-toastify";

export default function ClubDetalle() {
  const { id, genero } = useParams();
  const [club, setClub] = useState(null);
  const [comentarios, setComentarios] = useState([]);
  const [hoveredComentarioId, setHoveredComentarioId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ titulo: "", contenido: "" });
  const token = sessionStorage.getItem("accessToken");

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/clubes-rivales/${id}/`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then(setClub)
      .catch(() => toast.error("Error al cargar el club."));

    fetch(`${import.meta.env.VITE_API_URL}/comentarios-club-rival/?club=${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then(setComentarios)
      .catch(() => toast.error("Error al cargar comentarios."));
  }, [id, token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      club: id,
    };

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/comentarios-club-rival/`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (res.ok) {
        const nuevo = await res.json();
        setComentarios((prev) => [nuevo, ...prev]);
        setShowModal(false);
        setFormData({ titulo: "", contenido: "" });
        toast.success("Comentario añadido correctamente.");
      } else {
        toast.error("No se pudo guardar el comentario.");
      }
    } catch {
      toast.error("Error al conectar con el servidor.");
    }
  };

  const eliminarComentario = async (comentarioId) => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/comentarios-club-rival/${comentarioId}/`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.ok) {
        setComentarios((prev) =>
          prev.filter((comentario) => comentario.id !== comentarioId)
        );
        toast.success("Comentario eliminado.");
      } else {
        toast.error("No se pudo eliminar el comentario.");
      }
    } catch (err) {
      console.error("Error al eliminar comentario:", err);
      toast.error("Error de red.");
    }
  };

  if (!club) {
    return (
      <Container className="p-4">
        <Spinner animation="border" />
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <BackButton to={`/clubes-rivales/${genero}`} />
      <Card className="mb-4">
        <Card.Body>
          <h3>{club.nombre}</h3>
          <p>
            <strong>Ciudad:</strong> {club.ciudad}
          </p>
          {club.imagen && (
            <img
              src={club.imagen}
              alt={club.nombre}
              style={{ maxWidth: "150px" }}
            />
          )}
        </Card.Body>
      </Card>

      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="mb-0">Comentarios del club</h5>
        <Button size="sm" onClick={() => setShowModal(true)}>
          Nuevo Comentario
        </Button>
      </div>

      {comentarios.length === 0 ? (
        <p className="text-muted">No hay comentarios todavía.</p>
      ) : (
        comentarios.map((c) => (
          <div
            key={c.id}
            className="mb-3 p-3 position-relative border rounded"
            onMouseEnter={() => setHoveredComentarioId(c.id)}
            onMouseLeave={() => setHoveredComentarioId(null)}
          >
            <h6>{c.titulo}</h6>
            <p>{c.contenido}</p>
            <small className="text-muted">
              {new Date(c.fecha_creacion).toLocaleString()} -{" "}
              {c.autor?.username || "Anónimo"}
            </small>

            {hoveredComentarioId === c.id && (
              <Button
                variant="danger"
                size="sm"
                style={{
                  position: "absolute",
                  top: "8px",
                  right: "8px",
                  zIndex: 10,
                }}
                onClick={() => eliminarComentario(c.id)}
              >
                Eliminar
              </Button>
            )}
          </div>
        ))
      )}

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Nuevo Comentario</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group>
              <Form.Label>Título</Form.Label>
              <Form.Control
                name="titulo"
                value={formData.titulo}
                onChange={(e) =>
                  setFormData({ ...formData, titulo: e.target.value })
                }
                required
              />
            </Form.Group>
            <Form.Group className="mt-3">
              <Form.Label>Contenido</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="contenido"
                value={formData.contenido}
                onChange={(e) =>
                  setFormData({ ...formData, contenido: e.target.value })
                }
                required
              />
            </Form.Group>
            <div className="d-flex justify-content-end mt-3">
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="ms-2">
                Guardar
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
}
