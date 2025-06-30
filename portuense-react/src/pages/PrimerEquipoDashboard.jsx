import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Form } from 'react-bootstrap';
import { hasAnyGroup, getUserGroups } from '../utils/roles';
import Panel from '../components/Panel';
import panelData from '../data/primerEquipoPanels.json';
import BackButton from '../components/BackButton';
import AppHeader from '../components/AppHeader';
import React from 'react';

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
        <h2 className="mb-4">Gestión del Primer Equipo</h2>
        <BackButton to="/dashboard" label="←" />
        <Row>
          {panelData
            .filter((panel) =>
              user.permisos?.some(
                (permiso) =>
                  permiso.categoria === panel.categoria &&
                  permiso.equipo === panel.equipo
              )
            )
            .map((panel, index) => {
              const panelKey = `${panel.categoria}-${panel.equipo}`;
              const subcats = user.permisos
                .filter(
                  (p) =>
                    p.categoria === panel.categoria &&
                    p.equipo === panel.equipo
                )
                .map((p) => p.subcategoria);

              const subcatsUnicas = [...new Set(subcats)];
              const subcatActual =
                subcatsPorPanel[panelKey] || subcatsUnicas[0] || 'A';

              const handleChange = (e) => {
                const nueva = e.target.value;
                setSubcatsPorPanel((prev) => ({
                  ...prev,
                  [panelKey]: nueva,
                }));
              };

              return (
                <Col md={6} lg={4} className="mb-4" key={index}>
                  <Panel
                    title={panel.title}
                    text={
                      <>
                        {panel.text}
                        <Form.Select
                          size="sm"
                          value={subcatActual}
                          onChange={handleChange}
                          className="mt-3"
                        >
                          {subcatsUnicas.map((s) => (
                            <option key={s} value={s}>
                              Subcategoría {s}
                            </option>
                          ))}
                        </Form.Select>
                      </>
                    }
                    query={{
                      categoria: panel.categoria,
                      equipo: panel.equipo,
                      subcategoria: subcatActual,
                    }}
                  />
                </Col>
              );
            })}
        </Row>
      </Container>
    </>
  );
}
