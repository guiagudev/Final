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
        `${import.meta.env.VITE_API_URL}/excels-categoria/?categoria=${categoria}&equipo=${equipo}`,
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

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
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
      ? `${import.meta.env.VITE_API_URL}/excels-categoria/${excel.id}/`
      : `${import.meta.env.VITE_API_URL}/excels-categoria/`;

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
          <Card className="p-3">
            {excel?.archivo ? (
              <div className="mb-3">
                <strong>Archivo actual:</strong>{" "}
                <a href={excel.archivo} target="_blank" rel="noopener noreferrer">
                  Descargar Excel
                </a>
              </div>
            ) : (
              <Alert variant="info">No hay archivo subido aún.</Alert>
            )}

            <Form onSubmit={handleUpload}>
              <Form.Group controlId="formFile">
                <Form.Label>Subir nuevo archivo Excel</Form.Label>
                <Form.Control
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileChange}
                  required
                />
              </Form.Group>
              <Button type="submit" className="mt-2">
                {excel ? "Actualizar Excel" : "Subir Excel"}
              </Button>
            </Form>
          </Card>
        )}
      </Container>
    </>
  );
}
