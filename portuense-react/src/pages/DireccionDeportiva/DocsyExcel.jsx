// src/pages/DireccionDeportiva/DocsyExcel.jsx
import { useParams, useNavigate } from "react-router-dom";
import { Container, Button } from "react-bootstrap";
import AppHeader from "../../components/AppHeader";
import React from "react";
import BackButton  from '../../components/BackButton'
export default function DocsyExcel() {
  const { categoria, equipo,subcategoria } = useParams();
  const navigate = useNavigate();

  return (
    <>
      <AppHeader />
     <BackButton to="/direccion-deportiva" label="←" />
      <Container className="mt-4">
        <h2>Documentos y Excel – {categoria} {equipo}</h2>
        <Button
          className="me-2"
          onClick={() =>
            navigate(
              `/direccion-deportiva/primer-equipo/${categoria}/${equipo}/${subcategoria}/jugadores`
            )
          }
        >
          Ver PDFs
        </Button>
        <Button
          onClick={() =>
            navigate(
              `/direccion-deportiva/primer-equipo/${categoria}/${equipo}/${subcategoria}/excel`
            )
          }
        >
          Ver Excel
        </Button>
      </Container>
    </>
  );
}
