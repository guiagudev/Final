// src/pages/DireccionDeportiva/JugadorDocumentos.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
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
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function JugadorDocumentos() {
  const { id } = useParams();
  const [carpetas, setCarpetas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editando, setEditando] = useState(null);
  const [nuevoNombre, setNuevoNombre] = useState("");
  const token = sessionStorage.getItem("accessToken");

  const fetchCarpetas = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/jugadores/${id}/carpetas/`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      setCarpetas(data);
    } catch (err) {
      toast.error("Error al obtener carpetas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCarpetas();
  }, [id]);

  const handleBorrar = async (carpetaId) => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/carpetas/${carpetaId}/`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.ok) {
        toast.success("Carpeta eliminada");
        fetchCarpetas();
      } else {
        throw new Error();
      }
    } catch (err) {
      toast.error("No se pudo borrar la carpeta");
    }
  };

  const handleEditar = async (carpetaId) => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/carpetas/${carpetaId}/`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ nombre: nuevoNombre }),
        }
      );

      if (res.ok) {
        toast.success("Nombre actualizado");
        setEditando(null);
        fetchCarpetas();
      } else {
        throw new Error();
      }
    } catch (err) {
      toast.error("Error al actualizar el nombre");
    }
  };

  if (loading) return <Spinner animation="border" className="m-4" />;

  return (
    <Container className="mt-4">
      <ToastContainer />
      <h3>📂 Documentos del Jugador</h3>

      {carpetas.length === 0 ? (
        <p>No hay carpetas disponibles.</p>
      ) : (
        carpetas.map((carpeta) => (
          <Card key={carpeta.id} className="mb-3">
            <Card.Header>
              <Row className="align-items-center">
                <Col xs={12} md={6}>
                  {editando === carpeta.id ? (
                    <Form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleEditar(carpeta.id);
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
                    <strong>📁 {carpeta.nombre}</strong>
                  )}
                </Col>
                <Col xs="auto" className="mt-2 mt-md-0">
                  {editando === carpeta.id ? (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setEditando(null)}
                    >
                      ❌ Cancelar
                    </Button>
                  ) : (
                    <>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="me-2"
                        onClick={() => {
                          setEditando(carpeta.id);
                          setNuevoNombre(carpeta.nombre);
                        }}
                      >
                        ✏️ Editar
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleBorrar(carpeta.id)}
                      >
                        🗑️ Borrar
                      </Button>
                    </>
                  )}
                </Col>
              </Row>
            </Card.Header>

            <ListGroup variant="flush">
              {carpeta.pdfs.map((pdf) => (
                <ListGroup.Item key={pdf.id}>
                  <a href={pdf.archivo} target="_blank" rel="noreferrer">
                    📄 {pdf.nombre || "Ver PDF"}
                  </a>
                </ListGroup.Item>
              ))}
            </ListGroup>
          </Card>
        ))
      )}
    </Container>
  );
}
