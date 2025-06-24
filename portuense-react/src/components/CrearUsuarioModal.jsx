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
import React from "react";

const categorias = ["PREBEN", "BEN", "ALE", "INF", "CAD", "JUV", "SEN"];
const equipos = ["M", "F"];
const gruposDisponibles = ["admin", "usuario"];
const vistasDisponibles = ["direccion-deportiva", "rivales", "calendario"];

export default function CrearUsuarioModal({ show, onClose }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [grupo, setGrupo] = useState(""); // ← vacío por defecto
  const [permisos, setPermisos] = useState([]);
  const [vistas, setVistas] = useState([]);

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

  const toggleVista = (vista) => {
    setVistas((prev) =>
      prev.includes(vista)
        ? prev.filter((v) => v !== vista)
        : [...prev, vista]
    );
  };

  const resetFormulario = () => {
    setUsername("");
    setPassword("");
    setGrupo(""); // ← vacío
    setPermisos([]);
    setVistas([]);
  };

  useEffect(() => {
    if (show) resetFormulario();
  }, [show]);

  const handleSubmit = async () => {
    const permisosData = permisos.map((p) => {
      const [categoria, equipo] = p.split("-");
      return { categoria, equipo };
    });

    const payload = {
      username,
      password,
      grupo,
      permisos: permisosData,
      vistas,
    };

    const token = sessionStorage.getItem("accessToken");

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/crear-usuario/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const result = await res.json();

      if (res.ok) {
        setToastMessage(`Usuario "${username}" creado con éxito`);
        setShowToast(true);
        onClose(true);
      } else {
        alert("❌ Error al crear usuario (ver consola)");
        console.error(result);
      }
    } catch (error) {
      console.error("❌ Error de red:", error);
      alert("❌ Error inesperado al crear usuario");
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
                <option value="">Seleccionar grupo</option>
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

            <hr />
            <h5>Vistas permitidas</h5>
            {vistasDisponibles.map((vista) => (
              <Form.Check
                key={vista}
                type="checkbox"
                id={`vista-${vista}`}
                label={vista
                  .replace(/_/g, " ")
                  .replace(/\b\w/g, (l) => l.toUpperCase())}
                checked={vistas.includes(vista)}
                onChange={() => toggleVista(vista)}
              />
            ))}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => onClose(false)}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={!username || !password || !grupo}
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
