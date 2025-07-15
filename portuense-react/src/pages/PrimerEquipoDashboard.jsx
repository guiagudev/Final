import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Form } from 'react-bootstrap';
import { hasAnyGroup, getUserGroups } from '../utils/roles';
import Panel from '../components/Panel';
import panelData from '../data/primerEquipoPanels.json';
import BackButton from '../components/BackButton';
import AppHeader from '../components/AppHeader';
import React from 'react';
import "../assets/styles/paneles.css";
export default function PrimerEquipoDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState({});
  const [subcatsPorPanel, setSubcatsPorPanel] = useState({});

  useEffect(() => {
    const storedUser = JSON.parse(sessionStorage.getItem('user') || '{}');
    if (!storedUser.username) {
      navigate('/');
      return;
    }

    if (!Array.isArray(storedUser.permisos)) {
      storedUser.permisos = [];
    }

    setUser(storedUser);

    // Inicializa subcategorías para cada panel permitido
    const iniciales = {};
    panelData.forEach((panel) => {
      const subcats = storedUser.permisos
        .filter(
          (p) =>
            p.categoria === panel.categoria &&
            p.equipo === panel.equipo
        )
        .map((p) => p.subcategoria);

      const unicas = [...new Set(subcats)];
      if (unicas.length) {
        iniciales[`${panel.categoria}-${panel.equipo}`] = unicas[0];
      }
    });

    setSubcatsPorPanel(iniciales);
  }, [navigate]);

  const userGroups = getUserGroups();
  const isVisible = (groups) => hasAnyGroup(groups, userGroups);

  return (
    <>
      <AppHeader />
      <Container className="mt-4">
        <h2 className="mb-4 text-center" style={{ fontSize: '2.5rem', fontWeight: 'bold', letterSpacing: '1px', color: '#ff3333' }}>
          Gestión del Primer Equipo
        </h2>
        <BackButton to="/dashboard" label="←" />
        <Row className="mt-4 align-items-stretch justify-content-center" style={{ minHeight: '400px' }}>
          {panelData
            .filter((panel) =>
              user.permisos?.some(
                (permiso) =>
                  permiso.categoria === panel.categoria &&
                  permiso.equipo === panel.equipo
              )
            )
            .map((panel, index, arr) => {
              const isSingle = arr.length === 1;
              const colSize = isSingle ? 8 : Math.floor(12 / arr.length);
              return (
                <Col key={index} xs={12} md={colSize} className={`mb-4 d-flex align-items-stretch justify-content-center ${isSingle ? 'mx-auto' : ''}`} style={isSingle ? { minHeight: '500px' } : {}}>
                  <Panel
                    title={<span style={{ fontSize: isSingle ? '2.8rem' : '2rem', fontWeight: 'bold', width: '100%', display: 'block', textAlign: 'center' }}>{panel.title}</span>}
                    text={<span style={{ fontSize: isSingle ? '1.7rem' : '1.25rem', display: 'block', textAlign: 'center', marginBottom: isSingle ? '6rem' : '2rem', marginTop: isSingle ? '6rem' : 0, width: '100%' }}>{panel.text}</span>}
                    query={{
                      categoria: panel.categoria,
                      equipo: panel.equipo,
                      subcategoria: 'A',
                    }}
                    cardClassName={`h-100 flex-fill d-flex ${isSingle ? 'justify-content-center align-items-center' : ''}`}
                    bodyClassName={`d-flex flex-column justify-content-center align-items-center text-center w-100 gap-5`}
                  />
                </Col>
              );
            })}
        </Row>
      </Container>
    </>
  );
}
