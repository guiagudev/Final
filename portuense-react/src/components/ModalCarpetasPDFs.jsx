import React, { useEffect, useRef, useState } from "react";
import {
  Modal,
  Button,
  ListGroup,
  Form,
  Spinner,
  Alert,
  Row,
  Col,
} from "react-bootstrap";

export default function ModalCarpetasPDFs({ show, onHide, jugadorId }) {
  const token = sessionStorage.getItem("accessToken");
  const [carpetas, setCarpetas] = useState([]);
  const [nuevaCarpeta, setNuevaCarpeta] = useState("");
  const [editando, setEditando] = useState(null);
  const [nuevoNombre, setNuevoNombre] = useState("");
  const [subiendo, setSubiendo] = useState(false);
  const [pdfs, setPdfs] = useState({});
  const inputRefs = useRef({});

  const fetchCarpetas = () => {
    fetch(`${import.meta.env.VITE_API_URL}/carpetas/?jugador_id=${jugadorId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then(setCarpetas);
  };

  const fetchPDFs = (carpetaId) => {
    fetch(`${import.meta.env.VITE_API_URL}/pdfs/?carpeta=${carpetaId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setPdfs((prev) => ({ ...prev, [carpetaId]: data })));
  };

  const crearCarpeta = () => {
    if (!nuevaCarpeta.trim()) return;
    fetch(`${import.meta.env.VITE_API_URL}/carpetas/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ jugador: jugadorId, nombre: nuevaCarpeta }),
    })
      .then((res) => res.json())
      .then(() => {
        setNuevaCarpeta("");
        fetchCarpetas();
      });
  };

  const borrarCarpeta = async (carpetaId) => {
    await fetch(`${import.meta.env.VITE_API_URL}/carpetas/${carpetaId}/`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchCarpetas();
  };

  const editarCarpeta = async (carpetaId) => {
    await fetch(`${import.meta.env.VITE_API_URL}/carpetas/${carpetaId}/`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ nombre: nuevoNombre }),
    });
    setEditando(null);
    fetchCarpetas();
  };

  const subirPDF = async (carpetaId, file) => {
    if (!file) return;
    const formData = new FormData();
    formData.append("archivo", file);
    formData.append("carpeta", carpetaId);

    setSubiendo(true);
    await fetch(`${import.meta.env.VITE_API_URL}/pdfs/`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    setSubiendo(false);
    fetchPDFs(carpetaId);
  };

  useEffect(() => {
    if (show) {
      fetchCarpetas();
    }
  }, [show]);

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>📁 Gestión de Carpetas y PDFs</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {carpetas.length === 0 ? (
          <Alert variant="info">No hay carpetas. Crea una nueva.</Alert>
        ) : (
          <ListGroup>
            {carpetas.map((carpeta) => (
              <ListGroup.Item key={carpeta.id}>
                <Row className="align-items-center">
                  <Col xs={12} md={6}>
                    {editando === carpeta.id ? (
                      <Form
                        onSubmit={(e) => {
                          e.preventDefault();
                          editarCarpeta(carpeta.id);
                        }}
                      >
                        <Form.Control
                          size="sm"
                          value={nuevoNombre}
                          onChange={(e) => setNuevoNombre(e.target.value)}
                          required
                        />
                      </Form>
                    ) : (
                      <span>📁 {carpeta.nombre}</span>
                    )}
                  </Col>
                  <Col xs="auto">
                    {editando === carpeta.id ? (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setEditando(null)}
                      >
                        ❌ Cancelar
                      </Button>
                    ) : (
                      <>
                        <Button
                          size="sm"
                          variant="outline-primary"
                          onClick={() => {
                            setEditando(carpeta.id);
                            setNuevoNombre(carpeta.nombre);
                          }}
                        >
                          📝
                        </Button>{" "}
                        <Button
                          size="sm"
                          variant="outline-danger"
                          onClick={() => borrarCarpeta(carpeta.id)}
                        >
                          🗑️
                        </Button>
                      </>
                    )}
                  </Col>
                </Row>

                <div className="mt-2 mb-2">
                  <Button
                    size="sm"
                    variant="link"
                    onClick={() => fetchPDFs(carpeta.id)}
                  >
                    📄 Ver PDFs
                  </Button>{" "}
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => inputRefs.current[carpeta.id]?.click()}
                    disabled={subiendo}
                  >
                    {subiendo ? <Spinner size="sm" animation="border" /> : "📤 Subir PDF"}
                  </Button>
                  <input
                    type="file"
                    ref={(el) => (inputRefs.current[carpeta.id] = el)}
                    style={{ display: "none" }}
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) subirPDF(carpeta.id, file);
                    }}
                  />
                </div>

                <ul className="mt-2">
                  {(pdfs[carpeta.id] || []).map((pdf) => (
                    <li key={pdf.id}>
                      <a href={pdf.archivo} target="_blank" rel="noreferrer">
                        📎 {pdf.nombre || "Documento"}
                      </a>
                    </li>
                  ))}
                </ul>
              </ListGroup.Item>
            ))}
          </ListGroup>
        )}

        <hr />
        <Form.Group className="d-flex">
          <Form.Control
            placeholder="Nueva carpeta"
            value={nuevaCarpeta}
            onChange={(e) => setNuevaCarpeta(e.target.value)}
          />
          <Button variant="success" onClick={crearCarpeta} className="ms-2">
            ➕ Crear
          </Button>
        </Form.Group>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cerrar
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
