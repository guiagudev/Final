// src/pages/DireccionDeportiva/PrimerEquipoDireccion.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import AppHeader from "../../components/AppHeader";
import BackButton from "../../components/BackButton";
import React from "react";
import Panel from "../../components/Panel";
import panelData from "../../data/primerEquipoPanels.json";

export default function PrimerEquipoDireccion() {
  const navigate = useNavigate();
  const [user, setUser] = useState({});

  useEffect(() => {
    const storedUser = sessionStorage.getItem("user");
    if (!storedUser) {
      navigate("/");
      return;
    }

    const parsedUser = JSON.parse(storedUser);
    if (!parsedUser.username) {
      navigate("/");
      return;
    }

    if (!parsedUser.permisos || !Array.isArray(parsedUser.permisos)) {
      parsedUser.permisos = [];
    }

    setUser(parsedUser);
  }, [navigate]);

  const paneles = panelData.filter(
    (panel) =>
      user.permisos?.some(
        (permiso) =>
          permiso.categoria === panel.categoria &&
          permiso.equipo === panel.equipo &&
          permiso.subcategoria === panel.subcategoria
      )
  );
  const colSize = paneles.length > 0 ? Math.floor(12 / paneles.length) : 12;

  return (
    <>
      <AppHeader />
      <Container className="mt-4">
        <h2 className="mb-4">Documentación - Primer Equipo</h2>
        <BackButton to="/direccion-deportiva" label="←" />
        <Row className="mt-4 align-items-stretch" style={{ minHeight: '400px' }}>
          {paneles.map((panel, idx) => (
            <Col key={idx} xs={12} md={colSize} className="mb-4 d-flex align-items-stretch">
              <Card className="h-100 flex-fill d-flex">
                <Card.Body className="d-flex flex-column justify-content-center align-items-center text-center">
                  <Card.Title style={{ fontSize: paneles.length === 1 ? '2rem' : '1.5rem', fontWeight: 'bold' }}>{panel.title}</Card.Title>
                  <Card.Text style={{ fontSize: paneles.length === 1 ? '1.25rem' : '1rem', marginBottom: '2rem' }}>{`Documentos y PDFs del equipo ${panel.equipo} (${panel.subcategoria})`}</Card.Text>
                  <Button variant="primary" onClick={() => navigate(`/direccion-deportiva/primer-equipo/${panel.categoria}/${panel.equipo}/${panel.subcategoria}`)}>
                    Ver Documentos
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </>
  );
}
