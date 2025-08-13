import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Row, Col, Button, Form } from "react-bootstrap";
import Panel from "../components/Panel";
import panelData from "../data/academiaPanels.json";
import BackButton from "../components/BackButton";
import AppHeader from "../components/AppHeader";
import CrearSubcategoriaModal from "../components/CrearSubcategoriaModal";
import React from "react";
import "../assets/styles/paneles.css";
import { toast } from "react-toastify";
import { getToken } from "../utils/auth";

export default function AcademiaDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState({});
  const [categoria, setCategoria] = useState("");
  const [equipo, setEquipo] = useState("");
  const [subcategoria, setSubcategoria] = useState("A");
  const [showCrearSubcategoria, setShowCrearSubcategoria] = useState(false);

  const [categoriasDisponibles, setCategoriasDisponibles] = useState([]);
  const [equiposDisponibles, setEquiposDisponibles] = useState([]);
  const [subcategoriasDisponibles, setSubcategoriasDisponibles] = useState([]);
  const [loadingSubcategorias, setLoadingSubcategorias] = useState(false);

  useEffect(() => {
    const storedUser = JSON.parse(sessionStorage.getItem("user") || "{}");
    if (!storedUser.username) {
      navigate("/");
      return;
    }

    const permisosFiltrados = (storedUser.permisos || []).filter(
      (p) => p.categoria !== "RIV"
    );

    setUser({ ...storedUser, permisos: permisosFiltrados });

    const categorias = [...new Set(permisosFiltrados.map((p) => p.categoria))];
    const defaultCategoria = categorias[0] || "";

    const equipos = [
      ...new Set(
        permisosFiltrados
          .filter((p) => p.categoria === defaultCategoria)
          .map((p) => p.equipo)
      ),
    ];
    const defaultEquipo = equipos[0] || "";

    const subcats = ["A", "B", "C"];
    setSubcategoriasDisponibles(subcats);

    setCategoriasDisponibles(categorias);
    setCategoria(defaultCategoria);
    setEquiposDisponibles(equipos);
    setEquipo(defaultEquipo);
    setSubcategoria(subcats[0]);
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
    
  }, [categoria, user.permisos]);

  useEffect(() => {
    if (categoria && equipo) {
      fetchSubcategorias(categoria, equipo);
    }
  }, [categoria, equipo]);

  const handleCuotasClick = () => {
    navigate("/cuotas");
  };

  const handleCrearSubcategoria = () => {
    setShowCrearSubcategoria(true);
  };

  const fetchSubcategorias = async (categoria, equipo) => {
    if (!categoria || !equipo) return;
    
    setLoadingSubcategorias(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/subcategorias/dropdown/${categoria}/${equipo}/`,
        {
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        console.log("🔍 Subcategorías obtenidas:", data);
        
        // Mapear las subcategorías del backend al formato esperado
        const subcats = data.map(sub => sub.codigo);
        setSubcategoriasDisponibles(subcats);
        
        // Si la subcategoría actual no está en las disponibles, seleccionar la primera
        if (subcats.length > 0 && !subcats.includes(subcategoria)) {
          setSubcategoria(subcats[0]);
        }
      } else {
        console.error("❌ Error al obtener subcategorías:", response.status);
        // Fallback a las subcategorías hardcodeadas
        const fallbackSubcats = categoria === "SEN" ? ["B"] : ["A", "B", "C"];
        setSubcategoriasDisponibles(fallbackSubcats);
      }
    } catch (error) {
      console.error("❌ Error al fetchear subcategorías:", error);
      // Fallback a las subcategorías hardcodeadas
      const fallbackSubcats = categoria === "SEN" ? ["B"] : ["A", "B", "C"];
      setSubcategoriasDisponibles(fallbackSubcats);
    } finally {
      setLoadingSubcategorias(false);
    }
  };

  const handleSubcategoriaCreada = () => {
    // Actualizar la lista de subcategorías después de crear una nueva
    fetchSubcategorias(categoria, equipo);
    toast.success('Subcategoría creada correctamente');
  };

  const isAdmin = user.groups?.includes("admin");

  // Buscar panel en el JSON estático
  const panelEstatico = panelData.find(
    (p) =>
      p.categoria === categoria &&
      p.equipo === equipo &&
      p.subcategoria === subcategoria
  );
  
  // Si no hay panel estático, generar uno dinámico
  const panelSeleccionado = panelEstatico || {
    title: `${categoria === 'PREBEN' ? 'Prebenjamín' : 
            categoria === 'BEN' ? 'Benjamín' : 
            categoria === 'ALE' ? 'Alevín' : 
            categoria === 'INF' ? 'Infantil' : 
            categoria === 'CAD' ? 'Cadete' : 
            categoria === 'JUV' ? 'Juvenil' : 
            categoria === 'SEN' ? 'Sénior' : categoria} ${equipo === 'M' ? 'Masculino' : 'Femenino'} ${subcategoria}`,
    text: `Jugadores ${categoria === 'PREBEN' ? 'Prebenjamín' : 
            categoria === 'BEN' ? 'Benjamín' : 
            categoria === 'ALE' ? 'Alevín' : 
            categoria === 'INF' ? 'Infantil' : 
            categoria === 'CAD' ? 'Cadete' : 
            categoria === 'JUV' ? 'Juvenil' : 
            categoria === 'SEN' ? 'Sénior' : categoria} ${equipo === 'M' ? 'Masculino' : 'Femenino'} ${subcategoria}`,
    categoria: categoria,
    equipo: equipo,
    subcategoria: subcategoria
  };
  
  // Debug: mostrar qué panel se está usando
  console.log('🔍 AcademiaDashboard: Panel seleccionado:', panelSeleccionado);
  console.log('🔍 AcademiaDashboard: Panel estático encontrado:', !!panelEstatico);

  return (
    <>
      <AppHeader />
      <Container className="mt-4" fluid>
        <Row className="justify-content-center">
          <Col xs={12} lg={10} xl={8}>
            <BackButton to="/dashboard" label="←" />
            <h4 className="mb-4 text-center" style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ff3333' }}>
              Gestión de la Academia
            </h4>

            <Row className="mb-4 justify-content-center">
              <Col md={4}>
                <Form.Label className="fw-bold">Categoría</Form.Label>
                <Form.Select
                  value={categoria}
                  onChange={(e) => setCategoria(e.target.value)}
                  disabled={categoriasDisponibles.length <= 1}
                  className="form-select-lg"
                >
                  {categoriasDisponibles.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </Form.Select>
              </Col>
              <Col md={4}>
                <Form.Label className="fw-bold">Equipo</Form.Label>
                <Form.Select
                  value={equipo}
                  onChange={(e) => setEquipo(e.target.value)}
                  disabled={equiposDisponibles.length <= 1}
                  className="form-select-lg"
                >
                  {equiposDisponibles.map((e) => (
                    <option key={e} value={e}>
                      {e === "M" ? "Masculino" : "Femenino"}
                    </option>
                  ))}
                </Form.Select>
              </Col>
              <Col md={4}>
                <Form.Label className="fw-bold">Subcategoría</Form.Label>
                <Form.Select
                  value={subcategoria}
                  onChange={(e) => setSubcategoria(e.target.value)}
                  disabled={subcategoriasDisponibles.length <= 1 || loadingSubcategorias}
                  className="form-select-lg"
                >
                  {loadingSubcategorias ? (
                    <option>Cargando...</option>
                  ) : subcategoriasDisponibles.length === 0 ? (
                    <option>No hay subcategorías</option>
                  ) : (
                    subcategoriasDisponibles.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))
                  )}
                </Form.Select>
              </Col>
            </Row>

            {panelSeleccionado && (
              <Row className="justify-content-center">
                <Col md={8} lg={6} xl={5}>
                  <div className="academia-panel-wrapper position-relative h-100" style={{ minHeight: '50vh' }}>
                    <Panel
                      title={
                        <span style={{ 
                          fontSize: '2.5rem', 
                          fontWeight: 'bold', 
                          textAlign: 'center',
                          lineHeight: '1.2',
                          display: 'block',
                          width: '100%'
                        }}>
                          {panelSeleccionado.title}
                        </span>
                      }
                      text={
                        <span style={{ 
                          fontSize: '1.4rem', 
                          textAlign: 'center',
                          lineHeight: '1.4',
                          display: 'block',
                          width: '100%',
                          padding: '0 1rem',
                          marginTop: '2rem'
                        }}>
                          {panelSeleccionado.text}
                        </span>
                      }
                      query={{ categoria, equipo, subcategoria }}
                      redirect="/jugadores"
                      buttonText="Ver Jugadores"
                      cardClassName="h-100"
                      bodyClassName="d-flex flex-column justify-content-center align-items-center text-center w-100 h-100"
                    />
                    {isAdmin && (
                      <Button
                        variant="danger"
                        size="sm"
                        className="position-absolute"
                        style={{ top: '15px', right: '15px', zIndex: 10 }}
                        onClick={handleCrearSubcategoria}
                      >
                        <i className="fas fa-plus me-1"></i>
                        Añadir Subcategoría
                      </Button>
                    )}
                  </div>
                </Col>
              </Row>
            )}

            {isAdmin && (
              <div className="text-center mt-4">
                <Button variant="danger" size="lg" onClick={handleCuotasClick}>
                  Ver Cuotas
                </Button>
              </div>
            )}
          </Col>
        </Row>
      </Container>

      <CrearSubcategoriaModal
        show={showCrearSubcategoria}
        onHide={() => setShowCrearSubcategoria(false)}
        categoria={categoria}
        equipo={equipo}
        onSuccess={handleSubcategoriaCreada}
      />
    </>
  );
}
