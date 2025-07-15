// src/pages/DireccionDeportiva/DocsyExcel.jsx
import { useParams, useNavigate } from "react-router-dom";
import { Container, Button } from "react-bootstrap";
import AppHeader from "../../components/AppHeader";
import React from "react";
import BackButton  from '../../components/BackButton'
import { FileSpreadsheet, FileText } from "lucide-react";
export default function DocsyExcel() {
  const { categoria, equipo,subcategoria } = useParams();
  const navigate = useNavigate();

  // TODO: Hacer la llamada a la API de caretas aquí cuando se implemente

  return (
    <>
      <AppHeader />
      <BackButton to="/direccion-deportiva" label="←" />
      <Container className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: '70vh' }}>
        <h2 className="mb-5 text-center" style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#ff3333' }}>
          Documentos y Excel – {categoria}-{subcategoria} {equipo}
        </h2>
        <div className="d-flex flex-column flex-md-row gap-4 justify-content-center align-items-center w-100" style={{ maxWidth: 500 }}>
          <Button
            size="lg"
            className="flex-fill d-flex align-items-center justify-content-center"
            style={{ minWidth: 180 }}
            onClick={() =>
              navigate(
                `/direccion-deportiva/primer-equipo/${categoria}/${equipo}/${subcategoria}/jugadores`
              )
            }
          >
            <FileText size={22} className="me-2" /> Ver PDFs
          </Button>
          <Button
            size="lg"
            variant="success"
            className="flex-fill d-flex align-items-center justify-content-center"
            style={{ minWidth: 180 }}
            onClick={() =>
              navigate(
                `/direccion-deportiva/primer-equipo/${categoria}/${equipo}/${subcategoria}/excel`
              )
            }
          >
            <FileSpreadsheet size={22} className="me-2" /> Ver Excel
          </Button>
        </div>
      </Container>
    </>
  );
}
