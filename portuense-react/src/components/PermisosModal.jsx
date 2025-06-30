import React, { useEffect, useState } from "react";
import { Modal, Button, Row, Col, Form } from "react-bootstrap";

const categorias = ["PREBEN", "BEN", "ALE", "INF", "CAD", "JUV", "SEN", "RIV"];
const categoriasLabels = {
  PREBEN: "Prebenjamín",
  BEN: "Benjamín",
  ALE: "Alevín",
  INF: "Infantil",
  CAD: "Cadete",
  JUV: "Juvenil",
  SEN: "Sénior",
  RIV: "Rivales",
};
const subcategorias = ["A", "B", "C"];
const equipos = ["M", "F"];

export default function PermisosModal({ show, onClose, user, onPermisosUpdate }) {
  const [permisosSeleccionados, setPermisosSeleccionados] = useState([]);

  useEffect(() => {
    if (show && user) {
      setPermisosSeleccionados(user.permisos || []);
    }
  }, [show, user]);

  const togglePermiso = (categoria, subcategoria, equipo) => {
    const exists = permisosSeleccionados.some(
      (p) =>
        p.categoria === categoria &&
        p.subcategoria === subcategoria &&
        p.equipo === equipo
    );

    if (exists) {
      setPermisosSeleccionados((prev) =>
        prev.filter(
          (p) =>
            !(
              p.categoria === categoria &&
              p.subcategoria === subcategoria &&
              p.equipo === equipo
            )
        )
      );
    } else {
      setPermisosSeleccionados((prev) => [
        ...prev,
        { categoria, subcategoria, equipo },
      ]);
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
        {categorias.map((cat) => (
          <div key={cat} className="mb-4">
            <strong>{categoriasLabels[cat]}</strong>
            {subcategorias.map((sub) => (
              <div key={`${cat}-${sub}`} className="ms-3">
                <span className="fw-light">Subcategoría {sub}</span>
                <div className="d-flex gap-3 mt-1 mb-2">
                  {equipos.map((eq) => {
                    const checked = permisosSeleccionados.some(
                      (p) =>
                        p.categoria === cat &&
                        p.subcategoria === sub &&
                        p.equipo === eq
                    );
                    return (
                      <Form.Check
                        key={`${cat}-${sub}-${eq}`}
                        type="checkbox"
                        label={eq}
                        checked={checked}
                        onChange={() => togglePermiso(cat, sub, eq)}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        ))}
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
