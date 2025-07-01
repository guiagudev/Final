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
  const [categoria, setCategoria] = useState("");
  const [equipo, setEquipo] = useState("");
  const [subcategoria, setSubcategoria] = useState("");

  const [categoriasDisponibles, setCategoriasDisponibles] = useState([]);
  const [equiposDisponibles, setEquiposDisponibles] = useState([]);
  const [subcategoriasDisponibles, setSubcategoriasDisponibles] = useState([]);

  useEffect(() => {
    const storedUser = JSON.parse(sessionStorage.getItem("user") || "{}");
    if (!storedUser.username) {
      navigate("/");
      return;
    }

    // Excluir RIV y SEN
    const permisosFiltrados = (storedUser.permisos || []).filter(
      (p) => p.categoria !== "RIV" 
    );

    setUser({ ...storedUser, permisos: permisosFiltrados });

    const cats = [...new Set(permisosFiltrados.map((p) => p.categoria))];
    setCategoriasDisponibles(cats);
    const defaultCategoria = cats[0] || "";
    setCategoria(defaultCategoria);

    const equipos = [...new Set(
      permisosFiltrados
        .filter((p) => p.categoria === defaultCategoria)
        .map((p) => p.equipo)
    )];
    setEquiposDisponibles(equipos);
    const defaultEquipo = equipos[0] || "";
    setEquipo(defaultEquipo);

    const subcats = [...new Set(
      permisosFiltrados
        .filter((p) => p.categoria === defaultCategoria && p.equipo === defaultEquipo)
        .map((p) => p.subcategoria)
    )];
    setSubcategoriasDisponibles(subcats);
    setSubcategoria(subcats[0] || "");
  }, [navigate]);

  useEffect(() => {
    const permisos = user.permisos || [];
    const equipos = [...new Set(
      permisos
        .filter((p) => p.categoria === categoria)
        .map((p) => p.equipo)
    )];
    setEquiposDisponibles(equipos);
    if (!equipos.includes(equipo)) {
      setEquipo(equipos[0] || "");
    }
  }, [categoria]);

  useEffect(() => {
    const permisos = user.permisos || [];
    const subcats = [...new Set(
      permisos
        .filter((p) => p.categoria === categoria && p.equipo === equipo)
        .map((p) => p.subcategoria)
    )];
    setSubcategoriasDisponibles(subcats);
    if (!subcats.includes(subcategoria)) {
      setSubcategoria(subcats[0] || "");
    }
  }, [categoria, equipo]);

  const handleCuotasClick = () => {
    navigate("/cuotas");
  };

  const panelSeleccionado = panelData.find(
    (p) =>
      p.categoria === categoria &&
      p.equipo === equipo &&
      p.subcategoria === subcategoria
  );

  return (
    <>
      <AppHeader />
      <Container className="mt-4">
        <BackButton to="/dashboard" label="←" />
        <h4 className="mb-4">Gestión de la Academia</h4>

        <Row className="mb-4">
          <Col md={4}>
            <Form.Label>Categoría</Form.Label>
            <Form.Select
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              disabled={categoriasDisponibles.length <= 1}
            >
              {categoriasDisponibles.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </Form.Select>
          </Col>
          <Col md={4}>
            <Form.Label>Equipo</Form.Label>
            <Form.Select
              value={equipo}
              onChange={(e) => setEquipo(e.target.value)}
              disabled={equiposDisponibles.length <= 1}
            >
              {equiposDisponibles.map((e) => (
                <option key={e} value={e}>
                  {e === "M" ? "Masculino" : "Femenino"}
                </option>
              ))}
            </Form.Select>
          </Col>
          <Col md={4}>
            <Form.Label>Subcategoría</Form.Label>
            <Form.Select
              value={subcategoria}
              onChange={(e) => setSubcategoria(e.target.value)}
              disabled={subcategoriasDisponibles.length <= 1}
            >
              {subcategoriasDisponibles.map((s) => (
                <option key={s} value={s}>Subcategoría {s}</option>
              ))}
            </Form.Select>
          </Col>
        </Row>

        {panelSeleccionado && (
          <Row>
            <Col md={6} lg={5} className="mx-auto">
              <div className="academia-panel-wrapper">
                <Panel
                  title={panelSeleccionado.title}
                  text={panelSeleccionado.text}
                  query={{ categoria, equipo, subcategoria }}
                  redirect="/jugadores"
                  buttonText="Ver Jugadores"
                />
              </div>
            </Col>
          </Row>
        )}

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
