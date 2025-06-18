import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Outlet } from "react-router-dom";
import {
  Container,
  Card,
  Button,
  Spinner,
  Row,
  Col,
  Modal,
  Form,
  Tabs,
  Tab,
  Alert,
} from "react-bootstrap";
import { toast } from "react-toastify";
import AppHeader from "../../components/AppHeader";
import BackButton from "../../components/BackButton";


const token = sessionStorage.getItem("accessToken");
const userPermisos = JSON.parse(sessionStorage.getItem("userPermisos") || "[]");

export default function JugadoresDelClub() {
  const { clubId } = useParams();
  const navigate = useNavigate();

  const [jugadores, setJugadores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const tieneMasculino = userPermisos.some((p) => p.categoria === "SEN" && p.equipo === "M");
  const tieneFemenino = userPermisos.some((p) => p.categoria === "SEN" && p.equipo === "F");
  const [generoActivo, setGeneroActivo] = useState(tieneMasculino ? "M" : "F");

  const [formData, setFormData] = useState({
    nombre: "",
    dorsal: "",
    posicion: "",
    edad: "",
    imagen: null,
    observaciones: "",
    equipo: tieneMasculino ? "M" : "F",
  });


  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/jugadores-rivales/?club=${clubId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setJugadores(data);
        setLoading(false);
      });
  }, [clubId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formPayload = new FormData();
    formPayload.append("club", clubId);
    formPayload.append("nombre", formData.nombre);
    formPayload.append("equipo", formData.equipo);
    if (formData.dorsal) formPayload.append("dorsal", formData.dorsal);
    if (formData.posicion) formPayload.append("posicion", formData.posicion);
    if (formData.edad) formPayload.append("edad", formData.edad);
    if (formData.imagen) formPayload.append("imagen", formData.imagen);
    if (formData.observaciones) formPayload.append("observaciones", formData.observaciones);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/jugadores-rivales/`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formPayload,
      });

      if (res.ok) {
        const nuevo = await res.json();
        setJugadores((prev) => [...prev, nuevo]);
        setShowModal(false);
        setFormData({
          nombre: "",
          dorsal: "",
          posicion: "",
          edad: "",
          imagen: null,
          observaciones: "",
          equipo: generoActivo,
        });
        toast.success("Jugador creado correctamente");
      } else {
        toast.error("Error al crear jugador");
      }
    } catch (err) {
      toast.error("Error al conectar con el servidor");
    }
  };

  const eliminarJugador = async (id) => {
    const confirmed = await confirm({
      title: "Eliminar jugador",
      message: "¿Seguro que deseas eliminar este jugador?",
    });

    if (!confirmed) return;

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/jugadores-rivales/${id}/`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setJugadores((prev) => prev.filter((j) => j.id !== id));
        toast.success("Jugador eliminado");
      } else {
        toast.error("No se pudo eliminar el jugador.");
      }
    } catch (err) {
      toast.error("Error al conectar con el servidor.");
    }
  };

  const jugadoresFiltrados = jugadores.filter((j) => j.equipo === generoActivo);

  return (
    <>
      <AppHeader />
      <Container className="mt-4">
        <BackButton to="/clubes-rivales" />
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h3 className="mb-0">Jugadores del Club</h3>
          <Button variant="success" onClick={() => setShowModal(true)}>
            Añadir Jugador
          </Button>
        </div>

        {(tieneMasculino || tieneFemenino) ? (
          <>
            <Tabs
              activeKey={generoActivo}
              onSelect={(k) => {
                setGeneroActivo(k);
                setFormData((prev) => ({ ...prev, equipo: k }));
              }}
              className="mb-3"
            >
              {tieneMasculino && <Tab eventKey="M" title="Masculino" />}
              {tieneFemenino && <Tab eventKey="F" title="Femenino" />}
            </Tabs>

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
                            onClick={() => navigate(`${jugador.id}`)}
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
          </>
        ) : (
          <Alert variant="warning">
            No tienes permisos para ver jugadores rivales en esta categoría.
          </Alert>
        )}

        <Outlet />
      </Container>


      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Nuevo Jugador Rival</Modal.Title>
        </Modal.Header>
        <Modal.Body>
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
              <Form.Label>Género</Form.Label>
              <Form.Select
                value={formData.equipo}
                onChange={(e) => setFormData({ ...formData, equipo: e.target.value })}
              >
                <option value="M">Masculino</option>
                <option value="F">Femenino</option>
              </Form.Select>
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

            <Form.Group className="mb-3">
              <Form.Label>Observaciones</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={formData.observaciones}
                onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
              />
            </Form.Group>

            <div className="d-flex justify-content-end">
              <Button variant="secondary" onClick={() => setShowModal(false)} className="me-2">
                Cancelar
              </Button>
              <Button variant="primary" type="submit">
                Guardar
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
}
