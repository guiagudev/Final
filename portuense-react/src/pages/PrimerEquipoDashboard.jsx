import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import { getUserGroups } from '../utils/roles';
import Panel from '../components/Panel';
import panelData from '../data/primerEquipoPanels.json';
import BackButton from '../components/BackButton';
import AppHeader from '../components/AppHeader';
import CrearSubcategoriaModal from '../components/CrearSubcategoriaModal';
import React from 'react';
import "../assets/styles/paneles.css";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function PrimerEquipoDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState({});
  const [showCrearSubcategoria, setShowCrearSubcategoria] = useState(false);
  const [selectedPanel, setSelectedPanel] = useState(null);

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
  }, [navigate]);

  const userGroups = getUserGroups();
  const isAdmin = userGroups.includes('admin');

  const handleCrearSubcategoria = (panel) => {
    setSelectedPanel(panel);
    setShowCrearSubcategoria(true);
  };

  const handleSubcategoriaCreada = () => {
    // Actualizar la lista de subcategorías si es necesario
    toast.success('Subcategoría creada correctamente');
  };

  return (
    <>
      <AppHeader />
      <Container className="mt-4" fluid>
        <Row className="justify-content-center">
          <Col xs={12} lg={10} xl={8}>
            <h2 className="mb-4 text-center" style={{ fontSize: '2.5rem', fontWeight: 'bold', letterSpacing: '1px', color: '#ff3333' }}>
              Gestión del Primer Equipo
            </h2>
            <BackButton to="/dashboard" label="←" />
            <Row className="mt-4 align-items-stretch justify-content-center" style={{ minHeight: '60vh' }}>
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
                    <Col key={index} xs={12} md={colSize} className={`mb-4 d-flex align-items-stretch justify-content-center ${isSingle ? 'mx-auto' : ''}`} style={isSingle ? { minHeight: '60vh' } : {}}>
                      <div className="w-100 position-relative h-100">
                        <Panel
                          title={
                            <span style={{ 
                              fontSize: isSingle ? '3rem' : '2.2rem', 
                              fontWeight: 'bold', 
                              width: '100%', 
                              display: 'block', 
                              textAlign: 'center',
                              lineHeight: '1.2'
                            }}>
                              {panel.title}
                            </span>
                          }
                          text={
                            <span style={{ 
                              fontSize: isSingle ? '1.8rem' : '1.4rem', 
                              display: 'block', 
                              textAlign: 'center', 
                              marginBottom: isSingle ? '4rem' : '2rem', 
                              marginTop: isSingle ? '4rem' : '1rem', 
                              width: '100%',
                              lineHeight: '1.4',
                              padding: '0 1rem'
                            }}>
                              {panel.text}
                            </span>
                          }
                          query={{
                            categoria: panel.categoria,
                            equipo: panel.equipo,
                            subcategoria: 'A',
                          }}
                          cardClassName={`h-100 flex-fill d-flex ${isSingle ? 'justify-content-center align-items-center' : ''}`}
                          bodyClassName={`d-flex flex-column justify-content-center align-items-center text-center w-100 h-100`}
                        />
                        {isAdmin && (
                          <Button
                            variant="danger"
                            size="sm"
                            className="position-absolute"
                            style={{ top: '15px', right: '15px', zIndex: 10 }}
                            onClick={() => handleCrearSubcategoria(panel)}
                          >
                            <i className="fas fa-plus me-1"></i>
                            Añadir Subcategoría
                          </Button>
                        )}
                      </div>
                    </Col>
                  );
                })}
            </Row>
          </Col>
        </Row>
      </Container>

      {selectedPanel && (
        <CrearSubcategoriaModal
          show={showCrearSubcategoria}
          onHide={() => setShowCrearSubcategoria(false)}
          categoria={selectedPanel.categoria}
          equipo={selectedPanel.equipo}
          onSuccess={handleSubcategoriaCreada}
        />
      )}
    </>
  );
}
