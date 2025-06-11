// src/pages/DireccionDeportiva/ExcelPorCategoria.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Container,
  Spinner,
  Alert,
  Button,
  Form,
  Card,
} from "react-bootstrap";
import AppHeader from "../../components/AppHeader";
import BackButton from "../../components/BackButton";

export default function ExcelPorCategoria() {
  const { categoria, equipo } = useParams();
  const token = sessionStorage.getItem("accessToken");
  const [excel, setExcel] = useState(null);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchExcel = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `http://portuense-manager:8000/api/excels-categoria/?categoria=${categoria}&equipo=${equipo}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      setExcel(data[0] || null);
    } catch (err) {
      console.error("Error al obtener Excel:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    const formData = new FormData();
    formData.append("archivo", file);
    formData.append("categoria", categoria);
    formData.append("equipo", equipo);

    const method = excel ? "PUT" : "POST";
    const url = excel
      ? `http://portuense-manager:8000/api/excels-categoria/${excel.id}/`
      : "http://portuense-manager:8000/api/excels-categoria/";

    try {
      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (res.ok) {
        fetchExcel();
        setFile(null);
      } else {
        alert("Error al subir Excel");
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchExcel();
  }, [categoria, equipo]);

  return (
    <>
      <AppHeader />
      <BackButton to="/direccion-deportiva" label="←" />
      <Container className="mt-4">
        <h3>
          Excel – {categoria} {equipo}
        </h3>

        {loading ? (
          <Spinner animation="border" />
        ) : (
          <>
            {excel ? (
              <Card className="mb-4">
                <Card.Body>
                  <p><strong>Nombre:</strong> {excel.nombre || "Sin nombre"}</p>
                  <a
                    href={excel.archivo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline-primary"
                  >
                    Descargar Excel
                  </a>
                </Card.Body>
              </Card>
            ) : (
              <Alert variant="info">No hay Excel disponible aún.</Alert>
            )}

            <Form onSubmit={handleUpload}>
              <Form.Group>
                <Form.Label>Actualizar / Subir Excel</Form.Label>
                <Form.Control
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={(e) => setFile(e.target.files[0])}
                  required
                />
              </Form.Group>
              <Button className="mt-2" type="submit">
                {excel ? "Actualizar Excel" : "Subir Excel"}
              </Button>
            </Form>
          </>
        )}
      </Container>
    </>
  );
}
