import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import { useAuth } from "../hooks/useAuth";
import AppHeader from "../components/AppHeader";
import CrearUsuarioModal from "../components/CrearUsuarioModal";
import React from "react";
import UserManager from "./UserManager";
import "../assets/styles/paneles.css";

export default function Dashboard() {
  const navigate = useNavigate();
  const { isInGroup } = useAuth();
  const [showUserModal, setShowUserModal] = useState(false);
  const [showUserManager, setShowUserManager] = useState(false);

  const [permisos, setPermisos] = useState([]);
  const [vistas, setVistas] = useState([]);
  useEffect(() => {
    const storedPerms = JSON.parse(
      sessionStorage.getItem("userPermisos") || "[]"
    );
    const storedVistas = JSON.parse(sessionStorage.getItem("userVistas") || "[]");
    setPermisos(storedPerms);
    setVistas(storedVistas);
  }, []);

  const tienePermisoSen = permisos.some((p) => p.categoria === "SEN" && p.subcategoria === "A");
  const tienePermisoAcademia = permisos.some((p) => p.categoria !== "SEN" || (p.categoria === "SEN" && p.subcategoria !== "A"));

  // Calcula los paneles visibles
  const paneles = [];
  if (tienePermisoSen) {
    paneles.push({
      key: 'primer-equipo',
      title: 'Primer Equipo',
      text: 'Gestiona los datos del Primer Equipo',
      button: (
        <Button variant="primary" onClick={() => navigate("/primer-equipo")}>Ir a Primer Equipo</Button>
      ),
    });
  }
  if (tienePermisoAcademia) {
    paneles.push({
      key: 'academia',
      title: 'Academia',
      text: 'Accede a la gestión de la cantera',
      button: (
        <Button variant="primary" onClick={() => navigate("/academia")}>Ir a Academia</Button>
      ),
    });
  }
  if (vistas.includes("calendario")) {
    paneles.push({
      key: 'calendario',
      title: 'Calendario',
      text: 'Gestiona partidos y entrenamientos',
      button: (
        <Button variant="success" onClick={() => navigate("/calendario")}>Ir al Calendario</Button>
      ),
    });
  }
  const colSize = paneles.length > 0 ? Math.floor(12 / paneles.length) : 12;

  return (
    <>
      <AppHeader />
      <Container className="mt-4">
        <h2 className="mb-4 text-center" style={{ fontSize: '2.5rem', fontWeight: 'bold', letterSpacing: '1px', color: '#ff3333' }}>
          Panel de gestión
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

        {isInGroup("admin") && (
          <>
            <CrearUsuarioModal
              show={showUserModal}
              onClose={() => setShowUserModal(false)}
            />
            <div className="text-center mt-4">
              <Button
                variant="outline-warning"
                onClick={() => 
                  setShowUserManager(true)}
                className="mt-3"
              >
                Gestionar usuarios
              </Button>

              <UserManager
                show={showUserManager}
                onClose={() => setShowUserManager(false)}
              />
            </div>
          </>
        )}
      </Container>
    </>
  );
}
