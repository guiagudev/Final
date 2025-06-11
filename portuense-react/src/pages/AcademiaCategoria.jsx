import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Button } from 'react-bootstrap';
import AppHeader from '../components/AppHeader';
import BackButton from '../components/BackButton';
import panelData from '../data/academiaPanels.json';
import React from 'react';

export default function AcademiaCategoria() {
  const { categoria } = useParams();
  const navigate = useNavigate();
  const user = JSON.parse(sessionStorage.getItem('user') || '{}');

  const equipos = ['M', 'F'];

  const puedeVer = (equipo) =>
    user.permisos?.some(
      (p) => p.categoria === categoria && p.equipo === equipo
    );

  const handleEquipoClick = (equipo) => {
    // Redirige a una ruta con los filtros aplicados
    navigate(`/jugadores?categoria=${categoria}&equipo=${equipo}`);
  };

  return (
    <>
      <AppHeader />
      <Container className="mt-4">
        <BackButton to="/academia" label="← Volver" />
        <h3 className="mb-4 text-center">Categoría {categoria}</h3>
        <Row className="justify-content-center">
          {equipos.map(
            (eq) =>
              puedeVer(eq) && (
                <Col md={4} key={eq} className="mb-3 text-center">
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={() => handleEquipoClick(eq)}
                  >
                    {eq === 'M' ? 'Masculino' : 'Femenino'}
                  </Button>
                </Col>
              )
          )}
        </Row>
      </Container>
    </>
  );
}
