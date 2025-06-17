import React from "react";
import { Modal, Button, Row, Col, Form } from "react-bootstrap";

const categorias = ["PREBEN", "BEN", "ALE", "INF", "CAD", "JUV", "SEN"];
const equipos = ["M", "F"];

export default function PermisosModal({ show, onClose, user, onPermisosUpdate }) {
  const permisos = user.permisos || [];

  const togglePermiso = (cat, eq) => {
    const key = `${cat}-${eq}`;
    const current = permisos.map((p) => `${p.categoria}-${p.equipo}`);
    const updated = current.includes(key)
      ? current.filter((k) => k !== key)
      : [...current, key];

    const nuevos = updated.map((k) => {
      const [categoria, equipo] = k.split("-");
      return { categoria, equipo };
    });

    onPermisosUpdate(nuevos);
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
              <strong>{cat}</strong>
              <div className="d-flex gap-3 mt-1">
                {equipos.map((eq) => {
                  const checked = permisos.some(
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
          Cerrar
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
