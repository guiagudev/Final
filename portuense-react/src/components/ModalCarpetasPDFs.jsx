import React, { useEffect, useRef, useState } from "react";
import {
  Modal,
  Button,
  ListGroup,
  Form,
  Spinner,
  Alert,
} from "react-bootstrap";

export default function ModalCarpetasPDFs({ show, onHide, jugadorId }) {
  const token = sessionStorage.getItem("accessToken");
  const [carpetas, setCarpetas] = useState([]);
  const [nuevaCarpeta, setNuevaCarpeta] = useState("");
  const [subiendo, setSubiendo] = useState(false);
  const [pdfs, setPdfs] = useState({});
  const [fileInputs, setFileInputs] = useState({});
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
      .then((data) =>
        setPdfs((prev) => ({ ...prev, [carpetaId]: data }))
      );
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
        <Modal.Title>Gestión de Carpetas y PDFs</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {carpetas.length === 0 ? (
          <Alert variant="info">No hay carpetas. Crea una nueva.</Alert>
        ) : (
          <ListGroup>
            {carpetas.map((carpeta) => (
              <ListGroup.Item key={carpeta.id}>
                <strong>{carpeta.nombre}</strong>

                {/* Input oculto + botón visible para subir PDF */}
                <div className="mt-2 mb-1 d-flex align-items-center gap-2">
                  <input
                    type="file"
                    ref={(el) => (inputRefs.current[carpeta.id] = el)}
                    style={{ display: "none" }}
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        setFileInputs((prev) => ({
                          ...prev,
                          [carpeta.id]: file,
                        }));
                        subirPDF(carpeta.id, file);
                      }
                    }}
                  />
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() =>
                      inputRefs.current[carpeta.id] &&
                      inputRefs.current[carpeta.id].click()
                    }
                    disabled={subiendo}
                  >
                    {subiendo ? (
                      <Spinner size="sm" animation="border" />
                    ) : (
                      "Subir PDF"
                    )}
                  </Button>
                </div>

                <Button
                  variant="link"
                  size="sm"
                  onClick={() => fetchPDFs(carpeta.id)}
                >
                  Ver PDFs
                </Button>
                <ul className="mt-2">
                  {(pdfs[carpeta.id] || []).map((pdf) => (
                    <li key={pdf.id}>
                      <a
                        href={pdf.archivo}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {pdf.nombre || "Documento"}
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
            Crear
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
