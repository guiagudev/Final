import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import { useAuth } from "../hooks/useAuth";
import AppHeader from "../components/AppHeader";
import React from "react";

export default function DireccionDeportiva() {
  const navigate = useNavigate();
  const { isInGroup } = useAuth();
  const [permisos, setPermisos] = useState([]);

  useEffect(() => {
    const storedPerms = JSON.parse(sessionStorage.getItem("userPermisos") || "[]");
    setPermisos(storedPerms);
  }, []);

  const tienePermisoSen = permisos.some((p) => p.categoria === "SEN");
  const tienePermisoAcademia = permisos.some((p) => p.categoria !== "SEN");

  // Calcula los paneles visibles
  const paneles = [];
  if (tienePermisoSen) {
    paneles.push({
      key: 'primer-equipo',
      title: 'Primer Equipo',
      text: 'Ver Excel y documentos del Primer Equipo',
      button: (
        <Button variant="primary" onClick={() => navigate("/direccion-deportiva/primer-equipo")}>Acceder</Button>
      ),
    });
  }
  if (tienePermisoAcademia) {
    paneles.push({
      key: 'academia',
      title: 'Academia',
      text: 'Ver Excel y documentos de la Academia',
      button: (
        <Button variant="primary" onClick={() => navigate("/direccion-deportiva/academia")}>Acceder</Button>
      ),
    });
  }
  const colSize = paneles.length > 0 ? Math.floor(12 / paneles.length) : 12;

  return (
    <>
      <AppHeader />
      <Container className="mt-4">
        <h2 className="mb-4 text-center" style={{ fontSize: '2.5rem', fontWeight: 'bold', letterSpacing: '1px', color: '#ff3333' }}>
          Dirección Deportiva
        </h2>
        <Row className="mt-4 align-items-stretch" style={{ minHeight: '400px' }}>
          {paneles.map((panel) => (
            <Col key={panel.key} xs={12} md={colSize} className="mb-4 d-flex align-items-stretch">
              <Card className="h-100 flex-fill d-flex">
                <Card.Body className="d-flex flex-column justify-content-center align-items-center text-center">
                  <Card.Title style={{ fontSize: '2rem', fontWeight: 'bold' }}>{panel.title}</Card.Title>
                  <Card.Text style={{ fontSize: '1.25rem', marginBottom: '2rem' }}>{panel.text}</Card.Text>
                  {panel.button}
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </>
  );
}
