import React, { useEffect, useState } from "react";
import {
  Container,
  Card,
  Button,
  Spinner,
  Row,
  Col,
  Modal,
  Form,
} from "react-bootstrap";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import AppHeader from "../../components/AppHeader";
import BackButton from "../../components/BackButton";

const token = sessionStorage.getItem("accessToken");
const userPermisos = JSON.parse(sessionStorage.getItem("userPermisos") || "[]");

export default function JugadoresDelClub() {
  const { genero, clubId } = useParams();


  const generoActivo = genero === "masculino" ? "M" : "F";
  const generoNombre = genero === "masculino" ? "Masculino" : "Femenino";
console.log("✅ Buscando permiso RIV para equipo:", generoActivo);
console.log("🧾 Permisos RIV:", userPermisos.filter(p => p.categoria === "RIV"));

const tienePermiso = userPermisos.some(
  (p) =>
    p.categoria === "RIV" &&
    p.equipo.toUpperCase() === generoActivo.toUpperCase().trim()
);


  const [clubNombre, setClubNombre] = useState("");
  const [jugadores, setJugadores] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [jugadorSeleccionado, setJugadorSeleccionado] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    nombre: "",
    dorsal: "",
    posicion: "",
    edad: "",
    imagen: null,
  });

  useEffect(() => {
    if (!tienePermiso) return;

    const fetchClub = fetch(`${import.meta.env.VITE_API_URL}/clubes-rivales/${clubId}/`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then((res) => res.json());

    const fetchJugadores = fetch(
      `${import.meta.env.VITE_API_URL}/jugadores-rivales/?club=${clubId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    ).then((res) => res.json());

    Promise.all([fetchClub, fetchJugadores])
      .then(([club, jugadoresData]) => {
        setClubNombre(club.nombre);

        const listaJugadores = Array.isArray(jugadoresData)
          ? jugadoresData
          : jugadoresData.results || [];

        setJugadores(listaJugadores);
        setLoading(false);
      })
      .catch(() => toast.error("Error al cargar datos."));
  }, [clubId, genero]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formPayload = new FormData();
    formPayload.append("club", clubId);
    formPayload.append("nombre", formData.nombre);
    formPayload.append("equipo", generoActivo);
    if (formData.dorsal) formPayload.append("dorsal", formData.dorsal);
    if (formData.posicion) formPayload.append("posicion", formData.posicion);
    if (formData.edad) formPayload.append("edad", formData.edad);
    if (formData.imagen) formPayload.append("imagen", formData.imagen);

    const url = isEditing
      ? `${import.meta.env.VITE_API_URL}/jugadores-rivales/${jugadorSeleccionado.id}/`
      : `${import.meta.env.VITE_API_URL}/jugadores-rivales/`;

    const method = isEditing ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}` },
        body: formPayload,
      });

      if (res.ok) {
        fetch(`${import.meta.env.VITE_API_URL}/jugadores-rivales/?club=${clubId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
          .then((r) => r.json())
          .then((data) => {
            const lista = Array.isArray(data) ? data : data.results || [];
            setJugadores(lista);
          });

        setShowAddModal(false);
        setFormData({ nombre: "", dorsal: "", posicion: "", edad: "", imagen: null });
        setIsEditing(false);
        setJugadorSeleccionado(null);
        toast.success(isEditing ? "Jugador actualizado" : "Jugador creado");
      } else {
        toast.error("Error al guardar jugador");
      }
    } catch {
      toast.error("Error de conexión");
    }
  };

  const eliminarJugador = async (id) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/jugadores-rivales/${id}/`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setJugadores((prev) => prev.filter((j) => j.id !== id));
        toast.success("Jugador eliminado");
      } else {
        toast.error("No se pudo eliminar");
      }
    } catch {
      toast.error("Error al conectar con el servidor");
    }
  };

  const jugadoresFiltrados = Array.isArray(jugadores)
    ? jugadores.filter((j) => j.equipo === generoActivo)
    : [];

  if (!tienePermiso) {
    return (
      <>
        <AppHeader />
        <Container className="mt-4">
          <h4>No tienes permisos para ver esta sección.</h4>
        </Container>
      </>
    );
  }

  return (
    <>
      <AppHeader />
      <Container className="mt-4">
        <BackButton to={`/clubes-rivales/${genero}`} />
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h3 className="mb-0">
            Jugadores del Club {clubNombre} ({generoNombre})
          </h3>
          <Button variant="success" onClick={() => setShowAddModal(true)}>
            Añadir Jugador
          </Button>
        </div>

        {loading ? (
          <Spinner animation="border" />
        ) : (
          <Row>
            {jugadoresFiltrados.map((jugador) => (
              <Col md={4} key={jugador.id} className="mb-4">
                <Card>
                  <Card.Body>
                    <Card.Title>{jugador.nombre}</Card.Title>
                    <Card.Text>
                      <strong>Posición:</strong> {jugador.posicion} <br />
                      <strong>Edad:</strong> {jugador.edad}
                    </Card.Text>
                    <div className="d-flex justify-content-between">
                      <Button
                        variant="info"
                        size="sm"
                        onClick={() => {
                          setJugadorSeleccionado(jugador);
                          setShowDetailModal(true);
                        }}
                      >
                        Ver Detalle
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => eliminarJugador(jugador.id)}
                      >
                        Eliminar
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Container>

      <Modal
        show={showAddModal || showDetailModal}
        onHide={() => {
          setShowAddModal(false);
          setShowDetailModal(false);
          setIsEditing(false);
          setFormData({ nombre: "", dorsal: "", posicion: "", edad: "", imagen: null });
        }}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {isEditing ? "Editar Jugador" : showAddModal ? "Nuevo Jugador" : "Detalle del Jugador"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {(showAddModal || isEditing) ? (
            <Form onSubmit={handleSubmit} encType="multipart/form-data">
              <Form.Group className="mb-3">
                <Form.Label>Nombre</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Dorsal</Form.Label>
                <Form.Control
                  type="number"
                  value={formData.dorsal}
                  onChange={(e) => setFormData({ ...formData, dorsal: e.target.value })}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Posición</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.posicion}
                  onChange={(e) => setFormData({ ...formData, posicion: e.target.value })}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Edad</Form.Label>
                <Form.Control
                  type="number"
                  value={formData.edad}
                  onChange={(e) => setFormData({ ...formData, edad: e.target.value })}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Imagen</Form.Label>
                <Form.Control
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFormData({ ...formData, imagen: e.target.files[0] })}
                />
              </Form.Group>
              <div className="d-flex justify-content-end">
                <Button variant="secondary" onClick={() => setShowAddModal(false)} className="me-2">
                  Cancelar
                </Button>
                <Button variant="primary" type="submit">
                  Guardar
                </Button>
              </div>
            </Form>
          ) : (
            jugadorSeleccionado && (
              <>
                <p><strong>Nombre:</strong> {jugadorSeleccionado.nombre}</p>
                <p><strong>Dorsal:</strong> {jugadorSeleccionado.dorsal || "N/A"}</p>
                <p><strong>Posición:</strong> {jugadorSeleccionado.posicion || "N/A"}</p>
                <p><strong>Edad:</strong> {jugadorSeleccionado.edad || "N/A"}</p>
                {jugadorSeleccionado.imagen && (
                  <img
                    src={jugadorSeleccionado.imagen}
                    alt="Imagen del jugador"
                    style={{ width: "100%", borderRadius: "8px" }}
                  />
                )}
                <div className="d-flex justify-content-end mt-3">
                  <Button variant="primary" onClick={() => {
                    setIsEditing(true);
                    setShowDetailModal(false);
                    setShowAddModal(true);
                    setFormData({
                      nombre: jugadorSeleccionado.nombre,
                      dorsal: jugadorSeleccionado.dorsal,
                      posicion: jugadorSeleccionado.posicion,
                      edad: jugadorSeleccionado.edad,
                      imagen: null,
                    });
                  }}>
                    Editar
                  </Button>
                </div>
              </>
            )
          )}
        </Modal.Body>
      </Modal>
    </>
  );
}
