// src/pages/JugadorDocumentos.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Container, Card, Spinner, ListGroup } from "react-bootstrap";

export default function JugadorDocumentos() {
  const { id } = useParams();
  const [carpetas, setCarpetas] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = sessionStorage.getItem("accessToken");

  useEffect(() => {
    const fetchCarpetas = async () => {
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

    fetchCarpetas();
  }, [id]);

  if (loading) return <Spinner animation="border" />;

  return (
    <Container className="mt-4">
      <h3>Documentos del Jugador</h3>
      {carpetas.length === 0 ? (
        <p>No hay carpetas disponibles.</p>
      ) : (
        carpetas.map((carpeta) => (
          <Card key={carpeta.id} className="mb-3">
            <Card.Header>{carpeta.nombre}</Card.Header>
            <ListGroup variant="flush">
              {carpeta.pdfs.map((pdf) => (
                <ListGroup.Item key={pdf.id}>
                  <a href={pdf.archivo} target="_blank" rel="noreferrer">
                    {pdf.nombre || "Ver PDF"}
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
