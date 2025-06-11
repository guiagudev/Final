import { useState, useEffect } from "react";
import {
  Modal,
  Button,
  Form,
  Row,
  Col,
  Toast,
  ToastContainer,
} from "react-bootstrap";
// import { getToken } from '../utils/auth';
import React from "react";

const categorias = ["PREBEN", "BEN", "ALE", "INF", "CAD", "JUV", "SEN"];
const equipos = ["M", "F"];
const gruposDisponibles = ["admin", "coordinador", "entrenador"];

export default function CrearUsuarioModal({ show, onClose }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [grupo, setGrupo] = useState("entrenador");
  const [permisos, setPermisos] = useState([]);

  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const allPermisos = categorias.flatMap((cat) =>
    equipos.map((eq) => `${cat}-${eq}`)
  );

  const togglePermiso = (cat, eq) => {
    const key = `${cat}-${eq}`;
    setPermisos((prev) =>
      prev.includes(key) ? prev.filter((p) => p !== key) : [...prev, key]
    );
  };

  const toggleTodos = () => {
    const hasAll = allPermisos.every((p) => permisos.includes(p));
    setPermisos(hasAll ? [] : allPermisos);
  };

  const resetFormulario = () => {
    setUsername("");
    setPassword("");
    setGrupo("entrenador");
    setPermisos([]);
  };

  useEffect(() => {
    if (show) resetFormulario();
  }, [show]);

  const handleSubmit = async () => {
    const permisosData = permisos.map((p) => {
      const [categoria, equipo] = p.split("-");
      return { categoria, equipo };
    });
    const token = sessionStorage.getItem("accessToken");
    const res = await fetch(
      "http://portuense-manager.ddns.net:8000/api/crear-usuario/",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          username,
          password,
          grupo,
          permisos: permisosData,
        }),
      }
    );

    if (res.ok) {
      setToastMessage(`Usuario "${username}" creado con éxito`);
      setShowToast(true);
      onClose(true);
    } else {
      alert("Error al crear el usuario");
    }
  };

  return (
    <>
      <Modal
        show={show}
        onHide={() => onClose(false)}
        size="lg"
        backdrop="static"
      >
        <Modal.Header closeButton>
          <Modal.Title>Crear Nuevo Usuario</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Nombre de usuario</Form.Label>
              <Form.Control
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Contraseña</Form.Label>
              <Form.Control
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label>Grupo</Form.Label>
              <Form.Select
                value={grupo}
                onChange={(e) => setGrupo(e.target.value)}
              >
                {gruposDisponibles.map((g) => (
                  <option key={g} value={g}>
                    {g.charAt(0).toUpperCase() + g.slice(1)}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <hr />
            <h5 className="d-flex justify-content-between align-items-center">
              Permisos de acceso
              <Button
                size="sm"
                variant="outline-secondary"
                onClick={toggleTodos}
              >
                {permisos.length === allPermisos.length
                  ? "Desmarcar todos"
                  : "Seleccionar todos"}
              </Button>
            </h5>

            <Row>
              {categorias.map((cat) => (
                <Col md={6} key={cat}>
                  <strong>{cat}</strong>
                  {equipos.map((eq) => {
                    const key = `${cat}-${eq}`;
                    return (
                      <Form.Check
                        key={key}
                        type="checkbox"
                        id={key}
                        label={eq === "M" ? "Masculino" : "Femenino"}
                        checked={permisos.includes(key)}
                        onChange={() => togglePermiso(cat, eq)}
                      />
                    );
                  })}
                </Col>
              ))}
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => onClose(false)}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={!username || !password}
          >
            Crear Usuario
          </Button>
        </Modal.Footer>
      </Modal>

      <ToastContainer position="bottom-end" className="p-3">
        <Toast
          onClose={() => setShowToast(false)}
          show={showToast}
          delay={3000}
          autohide
          bg="success"
        >
          <Toast.Header>
            <strong className="me-auto">Éxito</strong>
          </Toast.Header>
          <Toast.Body className="text-white">{toastMessage}</Toast.Body>
        </Toast>
      </ToastContainer>
    </>
  );
}
