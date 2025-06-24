import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import * as XLSX from "xlsx";
import {
  Container,
  Spinner,
  Alert,
  Button,
  Form,
  Card,
  Table,
} from "react-bootstrap";
import AppHeader from "../../components/AppHeader";
import BackButton from "../../components/BackButton";

export default function ExcelPorCategoria() {
  const { categoria, equipo } = useParams();
  const token = sessionStorage.getItem("accessToken");
  const [excel, setExcel] = useState(null);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [excelData, setExcelData] = useState([]);

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

      // Si existe archivo, descargarlo y procesarlo
      if (data[0]?.archivo) {
        const response = await fetch(data[0].archivo);
        const blob = await response.blob();
        const arrayBuffer = await blob.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: "array" });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        setExcelData(jsonData);
      }
    } catch (err) {
      console.error("Error al obtener Excel:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);

    // Leer el contenido del Excel
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      setExcelData(jsonData);
    };
    reader.readAsArrayBuffer(selectedFile);
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
          <>
            {excelData.length > 0 ? (
              <Card className="mb-4">
                <Card.Body>
                  <Table striped bordered hover responsive>
                    <tbody>
                      {excelData.map((row, rowIndex) => (
                        <tr key={rowIndex}>
                          {row.map((cell, colIndex) => (
                            <td key={colIndex}>{cell}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>
            ) : (
              <Alert variant="info">No hay datos para mostrar.</Alert>
            )}

            <Form onSubmit={handleUpload}>
              <Form.Group>
                <Form.Label>Actualizar / Subir Excel</Form.Label>
                <Form.Control
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileChange}
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
