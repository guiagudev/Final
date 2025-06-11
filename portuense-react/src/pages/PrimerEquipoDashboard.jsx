import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';
import { hasAnyGroup, getUserGroups } from '../utils/roles';
import Panel from '../components/Panel';
import panelData from '../data/primerEquipoPanels.json';
import BackButton from '../components/BackButton';
import AppHeader from '../components/AppHeader';
import React from 'react';

export default function PrimerEquipoDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState({});

  useEffect(() => {
    const storedUser = JSON.parse(sessionStorage.getItem('user') || '{}');
    if (!storedUser.username) {
      navigate('/');
    } else {
      setUser(storedUser);
    }
  }, [navigate]);

  const userGroups = getUserGroups();
  const isVisible = (groups) => hasAnyGroup(groups, userGroups);

  return (
    <>
    <AppHeader />
    <Container className="mt-4">
      <h2 className="mb-4">Gestión del Primer Equipo</h2>
      <BackButton to="/dashboard" label="←"/>
      <Row>
        {panelData
           .filter((panel) =>
              user.permisos?.some(
                (permiso) =>
                  permiso.categoria === panel.categoria &&
                  permiso.equipo === panel.equipo
              )
            )
          .map((panel, index) => (
            <Col md={6} lg={4} className="mb-4" key={index}>
              <Panel
                title={panel.title}
                text={panel.text}
                query={{ categoria: panel.categoria, equipo: panel.equipo }}
              />
            </Col>
          ))}
      </Row>
    </Container>
    </>
  );
}
