import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Row, Col, Button, Form } from "react-bootstrap";
import Panel from "../components/Panel";
import panelData from "../data/academiaPanels.json";
import BackButton from "../components/BackButton";
import AppHeader from "../components/AppHeader";
import React from "react";
import "../assets/styles/paneles.css";

export default function AcademiaDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState({});
  const [subcatsPorPanel, setSubcatsPorPanel] = useState({});

  useEffect(() => {
    const storedUser = JSON.parse(sessionStorage.getItem("user") || "{}");
    if (!storedUser.username) {
      navigate("/");
    } else {
      setUser(storedUser);

      // Inicializar subcategorías por panel
      const iniciales = {};
      panelData.forEach((panel) => {
        const subcats = storedUser.permisos
          ?.filter(
            (p) =>
              p.categoria === panel.categoria && p.equipo === panel.equipo
          )
          .map((p) => p.subcategoria);

        const unicas = [...new Set(subcats)];
        if (unicas.length) {
          iniciales[`${panel.categoria}-${panel.equipo}`] = unicas[0];
        }
      });

      setSubcatsPorPanel(iniciales);
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
                subcatsPorPanel[panelKey] || subcatsUnicas[0] || "A";

              const handleChange = (e) => {
                const nueva = e.target.value;
                setSubcatsPorPanel((prev) => ({
                  ...prev,
                  [panelKey]: nueva,
                }));
              };

              return (
                <Col md={6} lg={4} className="mb-4" key={index}>
                  <div className="academia-panel-wrapper">
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
                      redirect="/jugadores"
                      buttonText="Ver Jugadores"
                    />
                  </div>
                </Col>
              );
            })}
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
