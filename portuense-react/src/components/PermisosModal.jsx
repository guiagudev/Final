import React, { useEffect, useState } from "react";
import { Modal, Button, Row, Col, Form } from "react-bootstrap";

const categorias = ["PREBEN", "BEN", "ALE", "INF", "CAD", "JUV", "SEN","RIV"];
const categoriasLabels = {
  PREBEN: "Prebenjamín",
  BEN: "Benjamín",
  ALE: "Alevín",
  INF: "Infantil",
  CAD: "Cadete",
  JUV: "Juvenil",
  SEN: "Senior",
  RIV: "Rivales"
};
const equipos = ["M", "F"];

export default function PermisosModal({ show, onClose, user, onPermisosUpdate }) {
  const [permisosSeleccionados, setPermisosSeleccionados] = useState([]);

  // Cuando se abra el modal o cambie el usuario, se cargan los permisos
  useEffect(() => {
    if (show && user) {
      setPermisosSeleccionados(user.permisos || []);
    }
  }, [show, user]);

  const togglePermiso = (cat, eq) => {
    const exists = permisosSeleccionados.some(
      (p) => p.categoria === cat && p.equipo === eq
    );

    if (exists) {
      setPermisosSeleccionados((prev) =>
        prev.filter((p) => !(p.categoria === cat && p.equipo === eq))
      );
    } else {
      setPermisosSeleccionados((prev) => [...prev, { categoria: cat, equipo: eq }]);
    }
  };

  const handleGuardar = () => {
    onPermisosUpdate(permisosSeleccionados);
    onClose();
  };

  return (
    <Modal show={show} onHide={onClose} size="lg" centered backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>Permisos de {user.username}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Row className="gy-3">
          {categorias.map((cat) => (
            <Col key={cat} md={6}>
              <strong>{categoriasLabels[cat]}</strong>
              <div className="d-flex gap-3 mt-1">
                {equipos.map((eq) => {
                  const checked = permisosSeleccionados.some(
                    (p) => p.categoria === cat && p.equipo === eq
                  );
                  return (
                    <Form.Check
                      key={`${cat}-${eq}`}
                      type="checkbox"
                      label={eq}
                      checked={checked}
                      onChange={() => togglePermiso(cat, eq)}
                    />
                  );
                })}
              </div>
            </Col>
          ))}
        </Row>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Cancelar
        </Button>
        <Button variant="primary" onClick={handleGuardar}>
          Guardar
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
