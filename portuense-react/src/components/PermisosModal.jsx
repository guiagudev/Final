import React, { useEffect, useState } from "react";
import { Modal, Button, Form, Accordion } from "react-bootstrap";
import "../assets/styles/UserManager.css";

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
  // Estado para controlar qué categoría y subcategoría están abiertas
  const [categoriaActiva, setCategoriaActiva] = useState(null);
  const [subcategoriaActiva, setSubcategoriaActiva] = useState({});

  useEffect(() => {
    if (show && user) {
      setPermisosSeleccionados(user.permisos || []);
      setCategoriaActiva(null);
      setSubcategoriaActiva({});
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
      <Modal.Header closeButton style={{ backgroundColor: '#8b0000', color: 'white' }}>
        <Modal.Title>Permisos de {user.username}</Modal.Title>
      </Modal.Header>
      <Modal.Body className="permisos-modal" style={{ backgroundColor: '#181818', color: '#8b0000' }}>
        <Accordion activeKey={categoriaActiva} onSelect={setCategoriaActiva} alwaysOpen style={{ backgroundColor: '#000' }}>
          {categorias.map((cat) => (
            <Accordion.Item eventKey={cat} key={cat}>
              <Accordion.Header className="dark-accordion-btn" style={{ backgroundColor: '#232323', color: 'black' }}>
                <span style={{ color: '#8b0000', fontWeight: 'bold' }}>{categoriasLabels[cat]}</span>
              </Accordion.Header>
              <Accordion.Body style={{ backgroundColor: '#181818', color: '#fff' }}>
                <Accordion activeKey={subcategoriaActiva[cat] || null} onSelect={(sub) => setSubcategoriaActiva((prev) => ({ ...prev, [cat]: sub }))} alwaysOpen>
                  {subcategorias.map((sub) => (
                    <Accordion.Item eventKey={sub} key={sub}>
                      <Accordion.Header className="dark-accordion-btn" style={{ backgroundColor: '#222', color: '#8b0000' }}>
                        <span style={{ color: '#8b0000', fontWeight: 'normal' }}>Subcategoría {sub}</span>
                      </Accordion.Header>
                      <Accordion.Body style={{ backgroundColor: '#181818', color: '#fff' }}>
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
                                label={<span style={{ color: '#fff' }}>{eq === "M" ? "Masculino" : "Femenino"}</span>}
                                checked={checked}
                                onChange={() => togglePermiso(cat, sub, eq)}
                                style={{ color: '#fff' }}
                              />
                            );
                          })}
                        </div>
                      </Accordion.Body>
                    </Accordion.Item>
                  ))}
                </Accordion>
              </Accordion.Body>
            </Accordion.Item>
          ))}
        </Accordion>
      </Modal.Body>
      <Modal.Footer style={{ backgroundColor: '#181818' }}>
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
