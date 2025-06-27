import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import { useAuth } from "../hooks/useAuth";
import AppHeader from "../components/AppHeader";
import CrearUsuarioModal from "../components/CrearUsuarioModal";
import React from "react";
import UserManager from "./UserManager";

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

  const tienePermisoSen = permisos.some((p) => p.categoria === "SEN");
  const tienePermisoAcademia = permisos.some((p) => p.categoria !== "SEN");

  return (
    <>
      <AppHeader />
      <Container className="mt-4">
        <h2 className="mb-4">Panel de gestión</h2>

        <Row className="mt-4">
          {tienePermisoSen && (
            <Col md={6} lg={4} className="mb-4">
              <Card className="h-100">
                <Card.Body>
                  <Card.Title>Primer Equipo</Card.Title>
                  <Card.Text>Gestiona los datos del Primer Equipo</Card.Text>
                  <Button
                    variant="primary"
                    onClick={() => navigate("/primer-equipo")}
                  >
                    Ir a Primer Equipo
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          )}

          {tienePermisoAcademia && (
            <Col md={6} lg={4} className="mb-4">
              <Card className="h-100">
                <Card.Body>
                  <Card.Title>Academia</Card.Title>
                  <Card.Text>Accede a la gestión de la cantera</Card.Text>
                  <Button
                    variant="primary"
                    onClick={() => navigate("/academia")}
                  >
                    Ir a Academia
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          )}

          {vistas.includes("calendario") && (
            <Col md={6} lg={4} className="mb-4">
              <Card className="h-100">
                <Card.Body>
                  <Card.Title>Calendario</Card.Title>
                  <Card.Text>Gestiona partidos y entrenamientos</Card.Text>
                  <Button
                    variant="success"
                    onClick={() => navigate("/calendario")}
                  >
                    Ir al Calendario
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          )}
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
