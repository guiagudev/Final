import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Row, Col, Button } from "react-bootstrap";
import Panel from "../components/Panel";
import panelData from "../data/academiaPanels.json";
import BackButton from "../components/BackButton";
import AppHeader from "../components/AppHeader";
import React from "react";
import "../assets/styles/paneles.css"

export default function AcademiaDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState({});

  useEffect(() => {
    const storedUser = JSON.parse(sessionStorage.getItem("user") || "{}");
    if (!storedUser.username) {
      navigate("/");
    } else {
      setUser(storedUser);
    }
  }, [navigate]);

  const handleCuotasClick = () => {
    navigate("/cuotas");
  };

  return (
    <>
      <AppHeader />
      <Container className="mt-4">
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
            .map((panel, index) => (
              <Col md={6} lg={4} className="mb-4" key={index}>
                <div className="academia-panel-wrapper">
                  <Panel
                    title={panel.title}
                    text={panel.text}
                    query={{ categoria: panel.categoria, equipo: panel.equipo }}
                    redirect="/jugadores"
                    buttonText="Ver Jugadores"
                  />
                </div>
              </Col>
            ))}
        </Row>

        {user.groups?.includes("admin") && (
          <div className="text-center mt-4">
            <Button variant="danger" onClick={handleCuotasClick}>
              Ver Cuotas
            </Button>
          </div>
        )}
      </Container>
    </>
  );
}
