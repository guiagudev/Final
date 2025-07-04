import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Card,
  Button,
  Spinner,
  Form,
  Alert,
  Modal,
} from "react-bootstrap";
import { toast } from "react-toastify";



export default function DetalleJugadorRival() {
  const { jugadorId, genero, clubId } = useParams();
  const navigate = useNavigate();
const token = sessionStorage.getItem("accessToken");
  const [jugador, setJugador] = useState(null);
  const [comentarios, setComentarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [comentarioForm, setComentarioForm] = useState({
    titulo: "",
    contenido: "",
  });
  const [showComentarioModal, setShowComentarioModal] = useState(false);

  useEffect(() => {
    console.log("Cargando jugador y comentarios para ID:", jugadorId);

    const fetchJugador = fetch(
      `${import.meta.env.VITE_API_URL}/jugadores-rivales/${jugadorId}/`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    ).then(async (res) => {
      if (!res.ok) {
        const text = await res.text();
        console.error("Error al obtener jugador:", res.status, text);
        throw new Error(`Jugador error ${res.status}`);
      }
      return res.json();
    });

    const fetchComentarios = fetch(
      `${
        import.meta.env.VITE_API_URL
      }/comentarios-rivales/jugador/${jugadorId}/`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    ).then(async (res) => {
      if (!res.ok) {
        const text = await res.text();
        console.error("Error al obtener comentarios:", res.status, text);
        throw new Error(`Comentarios error ${res.status}`);
      }
      return res.json();
    });

    Promise.all([fetchJugador, fetchComentarios])
      .then(([jugadorData, comentariosData]) => {
        setJugador(jugadorData);
        setComentarios(Array.isArray(comentariosData) ? comentariosData : []);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error general al cargar:", error);
        toast.error("Error al cargar los datos del jugador.");
        setLoading(false);
      });
  }, [jugadorId]);

  const enviarComentario = async () => {
    const payload = {
      jugador: parseInt(jugadorId),
      titulo: comentarioForm.titulo,
      contenido: comentarioForm.contenido,
    };

    console.log("Intentando enviar comentario con payload:", payload);

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/comentarios-rivales/`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      console.log("Respuesta status:", res.status);
      const responseText = await res.text();
      console.log("Texto de respuesta:", responseText);

      if (res.ok) {
        const nuevo = JSON.parse(responseText);
        console.log("Comentario creado OK:", nuevo);
        setComentarios((prev) => [nuevo, ...prev]);
        setComentarioForm({ titulo: "", contenido: "" });
        setShowComentarioModal(false);
      } else {
        console.error("Error al enviar comentario:", res.status, responseText);
        toast.error("Error al enviar comentario.");
      }
    } catch (err) {
      console.error("Excepción al enviar comentario:", err);
      toast.error("Fallo de red.");
    }
  };

  const eliminarComentario = async (id) => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/comentarios-rivales/${id}/`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.ok) {
        setComentarios((prev) => prev.filter((c) => c.id !== id));
      } else {
        toast.error("No se pudo eliminar el comentario.");
      }
    } catch {
      toast.error("Error al conectar con el servidor.");
    }
  };

  if (loading) {
    return (
      <Container className="mt-4 text-center">
        <Spinner animation="border" />
        <p className="mt-3">Cargando jugador...</p>
      </Container>
    );
  }

  if (!jugador) {
    return (
      <Container className="mt-4">
        <Alert variant="danger">Jugador no encontrado.</Alert>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <Button
        variant="secondary"
        onClick={() =>
          navigate(`/clubes-rivales/${genero}/${clubId}/jugadores`)
        }
      >
        Volver a la lista
      </Button>

      <Card className="mt-4">
        <Card.Body>
          <Card.Title>{jugador.nombre}</Card.Title>
          <Card.Text>
            <strong>Posición:</strong> {jugador.posicion || "N/A"} <br />
            <strong>Edad:</strong> {jugador.edad || "N/A"} <br />
            <strong>Dorsal:</strong> {jugador.dorsal || "N/A"} <br />
            <strong>Observaciones:</strong> {jugador.observaciones || "N/A"}
          </Card.Text>
          {jugador.imagen && (
            <img
              src={jugador.imagen}
              alt="Imagen del jugador"
              style={{ width: "100%", maxHeight: 300, objectFit: "cover" }}
            />
          )}
        </Card.Body>
      </Card>

      <div className="d-flex justify-content-between align-items-center mt-4">
        <h4>Comentarios</h4>
        <Button variant="primary" onClick={() => setShowComentarioModal(true)}>
          Añadir Comentario
        </Button>
      </div>

      {comentarios.length === 0 ? (
        <p>No hay comentarios aún.</p>
      ) : (
        comentarios.map((c) => (
          <Card key={c.id} className="mb-2">
            <Card.Body>
              <Card.Title>{c.titulo}</Card.Title>
              <Card.Text>{c.contenido}</Card.Text>
              <Button
                variant="outline-danger"
                size="sm"
                onClick={() => eliminarComentario(c.id)}
              >
                Eliminar
              </Button>
            </Card.Body>
          </Card>
        ))
      )}

      <Modal
        show={showComentarioModal}
        onHide={() => setShowComentarioModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Nuevo Comentario</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Título</Form.Label>
              <Form.Control
                type="text"
                value={comentarioForm.titulo}
                onChange={(e) =>
                  setComentarioForm({
                    ...comentarioForm,
                    titulo: e.target.value,
                  })
                }
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Contenido</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={comentarioForm.contenido}
                onChange={(e) =>
                  setComentarioForm({
                    ...comentarioForm,
                    contenido: e.target.value,
                  })
                }
              />
            </Form.Group>
            <div className="d-flex justify-content-end">
              <Button
                variant="secondary"
                onClick={() => setShowComentarioModal(false)}
                className="me-2"
              >
                Cancelar
              </Button>
              <Button variant="primary" onClick={enviarComentario}>
                Publicar
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
}
