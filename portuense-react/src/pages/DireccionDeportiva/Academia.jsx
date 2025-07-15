import React, { useEffect, useState } from "react";
import { Container, Row, Col, Form } from "react-bootstrap";
import AppHeader from "../../components/AppHeader";
import BackButton from "../../components/BackButton";
import Panel from "../../components/Panel";
import academiaPanels from "../../data/academiaPanels.json";
import { useNavigate } from "react-router-dom";

export default function AcademiaDireccion() {
  const navigate = useNavigate();
  const [user, setUser] = useState({});
  const [categoria, setCategoria] = useState("");
  const [equipo, setEquipo] = useState("");
  const [subcategoria, setSubcategoria] = useState("A");

  const [categoriasDisponibles, setCategoriasDisponibles] = useState([]);
  const [equiposDisponibles, setEquiposDisponibles] = useState([]);
  const [subcategoriasDisponibles, setSubcategoriasDisponibles] = useState(["A"]);

  useEffect(() => {
    const storedUser = JSON.parse(sessionStorage.getItem("user") || "{}");
    if (!storedUser.username) {
      navigate("/");
      return;
    }

    const permisosFiltrados = (storedUser.permisos || []).filter(
      (p) => p.categoria !== "RIV" && p.categoria !== "SEN"
    );

    setUser({ ...storedUser, permisos: permisosFiltrados });

    const categorias = [...new Set(permisosFiltrados.map((p) => p.categoria))];
    const defaultCategoria = categorias[0] || "";
    setCategoriasDisponibles(categorias);
    setCategoria(defaultCategoria);

    const equipos = [
      ...new Set(
        permisosFiltrados
          .filter((p) => p.categoria === defaultCategoria)
          .map((p) => p.equipo)
      ),
    ];
    const defaultEquipo = equipos[0] || "";
    setEquiposDisponibles(equipos);
    setEquipo(defaultEquipo);
    setSubcategoria("A");
  }, [navigate]);

  useEffect(() => {
    if (!user.permisos) return;

    const equipos = [
      ...new Set(
        user.permisos
          .filter((p) => p.categoria === categoria)
          .map((p) => p.equipo)
      ),
    ];
    setEquiposDisponibles(equipos);
    if (!equipos.includes(equipo)) {
      setEquipo(equipos[0] || "");
    }
  }, [categoria]);

  // Actualiza subcategoriasDisponibles según permisos y categoría seleccionada
  useEffect(() => {
    if (!user.permisos) return;
    const subs = [
      ...new Set(
        user.permisos
          .filter((p) => p.categoria === categoria)
          .map((p) => p.subcategoria)
      ),
    ];
    setSubcategoriasDisponibles(subs.length ? subs : ["A"]);
    if (!subs.includes(subcategoria)) {
      setSubcategoria(subs[0] || "A");
    }
  }, [categoria, user.permisos]);

  const panelSeleccionado = academiaPanels.find(
    (p) =>
      p.categoria === categoria &&
      p.equipo === equipo &&
      p.subcategoria === subcategoria
  );

  return (
    <>
      <AppHeader />
      <Container className="mt-4">
        <h2 className="mb-4">Documentación - Academia</h2>
        <BackButton to="/direccion-deportiva" label="←" />

        <Row className="mb-4">
          <Col md={4}>
            <Form.Label>Categoría</Form.Label>
            <Form.Select
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              disabled={categoriasDisponibles.length <= 1}
            >
              {categoriasDisponibles.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
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
                <option key={s} value={s}>
                  Subcategoría {s}
                </option>
              ))}
            </Form.Select>
          </Col>
        </Row>

        {panelSeleccionado && (
          <Row>
            <Col md={6} lg={5} className="mx-auto">
              <Panel
                title={panelSeleccionado.title}
                text={panelSeleccionado.text}
                query={{ categoria, equipo, subcategoria }}
                redirect={`/direccion-deportiva/academia/${categoria}/${equipo}/${subcategoria}`}
                buttonText="Mostrar Documentos"
              />
            </Col>
          </Row>
        )}
      </Container>
    </>
  );
}
