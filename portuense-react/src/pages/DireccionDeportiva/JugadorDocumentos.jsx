import React, { useEffect, useState } from "react";
import {
  Container,
  Card,
  Spinner,
  ListGroup,
  Button,
  Form,
  Row,
  Col,
} from "react-bootstrap";
import { useParams } from "react-router-dom";

export default function JugadorDocumentos() {
  const { id } = useParams();
  const token = sessionStorage.getItem("accessToken");

  const [carpetas, setCarpetas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nuevaCarpeta, setNuevaCarpeta] = useState("");
  const [archivosPDF, setArchivosPDF] = useState({}); // {carpetaId: File}

  useEffect(() => {
    fetchCarpetas();
  }, [id]);

  const fetchCarpetas = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/jugadores/${id}/carpetas/`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      setCarpetas(data);
    } catch (err) {
      console.error("Error al obtener carpetas:", err);
    } finally {
      setLoading(false);
    }
  };

  const crearCarpeta = async (e) => {
    e.preventDefault();
    if (!nuevaCarpeta.trim()) return;

    try {
      await fetch(`${import.meta.env.VITE_API_URL}/carpetas/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nombre: nuevaCarpeta,
          jugador: id,
        }),
      });
      setNuevaCarpeta("");
      fetchCarpetas();
    } catch (err) {
      console.error("Error creando carpeta:", err);
    }
  };

  const eliminarCarpeta = async (carpetaId) => {
    if (!window.confirm("¿Eliminar esta carpeta y sus PDFs?")) return;
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/carpetas/${carpetaId}/`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchCarpetas();
    } catch (err) {
      console.error("Error eliminando carpeta:", err);
    }
  };

  const subirPDF = async (e, carpetaId) => {
    e.preventDefault();
    const archivo = archivosPDF[carpetaId];
    if (!archivo) return;

    const formData = new FormData();
    formData.append("archivo", archivo);
    formData.append("carpeta", carpetaId);

    try {
      await fetch(`${import.meta.env.VITE_API_URL}/pdfs/`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      fetchCarpetas();
      setArchivosPDF({ ...archivosPDF, [carpetaId]: null });
    } catch (err) {
      console.error("Error subiendo PDF:", err);
    }
  };

  const eliminarPDF = async (pdfId) => {
    if (!window.confirm("¿Eliminar este PDF?")) return;
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/pdfs/${pdfId}/`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchCarpetas();
    } catch (err) {
      console.error("Error eliminando PDF:", err);
    }
  };

  if (loading) return <Spinner animation="border" />;

  return (
    <Container className="mt-4">
      <h3>Documentos del Jugador</h3>

      <Form onSubmit={crearCarpeta} className="mb-4">
        <Row>
          <Col>
            <Form.Control
              placeholder="Nombre de nueva carpeta"
              value={nuevaCarpeta}
              onChange={(e) => setNuevaCarpeta(e.target.value)}
            />
          </Col>
          <Col xs="auto">
            <Button type="submit">Crear Carpeta</Button>
          </Col>
        </Row>
      </Form>

      {carpetas.length === 0 ? (
        <p>No hay carpetas disponibles.</p>
      ) : (
        carpetas.map((carpeta) => (
          <Card key={carpeta.id} className="mb-4">
            <Card.Header>
              <Row>
                <Col>{carpeta.nombre}</Col>
                <Col xs="auto">
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => eliminarCarpeta(carpeta.id)}
                  >
                    Eliminar carpeta
                  </Button>
                </Col>
              </Row>
            </Card.Header>
            <ListGroup variant="flush">
              {carpeta.pdfs.map((pdf) => (
                <ListGroup.Item key={pdf.id}>
                  <Row className="align-items-center">
                    <Col>
                      <a
                        href={pdf.archivo}
                        target="_blank"
                        rel="noreferrer"
                        className="me-2"
                      >
                        {pdf.nombre || "Ver PDF"}
                      </a>
                    </Col>
                    <Col xs="auto">
                      <Button
                        size="sm"
                        variant="outline-danger"
                        onClick={() => eliminarPDF(pdf.id)}
                      >
                        Eliminar
                      </Button>
                    </Col>
                  </Row>
                </ListGroup.Item>
              ))}
              <ListGroup.Item>
                <Form onSubmit={(e) => subirPDF(e, carpeta.id)}>
                  <Row>
                    <Col>
                      <Form.Control
                        type="file"
                        accept=".pdf"
                        onChange={(e) =>
                          setArchivosPDF({
                            ...archivosPDF,
                            [carpeta.id]: e.target.files[0],
                          })
                        }
                      />
                    </Col>
                    <Col xs="auto">
                      <Button type="submit" size="sm">
                        Subir PDF
                      </Button>
                    </Col>
                  </Row>
                </Form>
              </ListGroup.Item>
            </ListGroup>
          </Card>
        ))
      )}
    </Container>
  );
}
