import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { Table, Container, Button, Form, Row, Col, Alert } from "react-bootstrap";
import JugadorForm from "./jugadores/JugadorForm";
import { toast } from "react-toastify";
import { getToken } from "../utils/auth";
import { Calendar, FileText } from "lucide-react";
import React from "react";

export default function Jugadores() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [jugadores, setJugadores] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingJugador, setEditingJugador] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchJugadores = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const queryString = searchParams.toString();
      const categoria = searchParams.get("categoria");
      const subcategoria = searchParams.get("subcategoria");
      const equipo = searchParams.get("equipo");
      
      console.log("🔍 URL de búsqueda:", queryString);
      console.log("🔍 Parámetros:", { categoria, subcategoria, equipo });
      console.log("🔍 API URL:", `${import.meta.env.VITE_API_URL}/jugadores/?${queryString}`);
      
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/jugadores/?${queryString}`,
        {
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        }
      );
      
      console.log("🔍 Response status:", response.status);
      console.log("🔍 Response ok:", response.ok);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("🔍 Error response:", errorText);
        throw new Error(`Error al obtener jugadores: ${response.status} ${errorText}`);
      }
      
      const data = await response.json();
      console.log("🔍 Jugadores recibidos:", data);
      setJugadores(data);
    } catch (error) {
      console.error("❌ Error fetching jugadores:", error);
      setError(error.message);
      toast.error("Error al cargar jugadores.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchJugadores();
  }, [searchParams.toString()]);

  const handleCreate = () => {
    setEditingJugador(null);
    setShowForm(true);
  };

  const handleEdit = (jugador) => {
    setEditingJugador(jugador);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/jugadores/${id}/`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        }
      );

      if (res.ok) {
        toast.success("Jugador eliminado");
        fetchJugadores();
      } else {
        toast.error("Error al eliminar jugador");
      }
    } catch (error) {
      console.error("Error al eliminar jugador:", error);
      toast.error("Error de red al eliminar jugador");
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(name, value);
    } else {
      newParams.delete(name);
    }
    setSearchParams(newParams);
  };

  // Función para formatear la información de categoría, subcategoría y equipo
  const getFormattedTitle = () => {
    const categoria = searchParams.get("categoria");
    const subcategoria = searchParams.get("subcategoria");
    const equipo = searchParams.get("equipo");
    
    if (!categoria && !subcategoria && !equipo) {
      return "Listado de Jugadores";
    }
    
    const parts = [];
    
    if (categoria) {
      const categoriaNames = {
        'PREBEN': 'Prebenjamín',
        'BEN': 'Benjamín',
        'ALE': 'Alevín',
        'INF': 'Infantil',
        'CAD': 'Cadete',
        'JUV': 'Juvenil',
        'SEN': 'Sénior'
      };
      parts.push(categoriaNames[categoria] || categoria);
    }
    
    if (subcategoria) {
      parts.push(subcategoria);
    }
    
    if (equipo) {
      const equipoNames = {
        'M': 'Masculino',
        'F': 'Femenino'
      };
      parts.push(equipoNames[equipo] || equipo);
    }
    
    return `Listado de Jugadores: ${parts.join(' ')}`;
  };

  return (
    <Container className="mt-4">
      <Button
        variant="secondary"
        onClick={() => navigate("/dashboard")}
        className="mb-3"
      >
        ← Volver al Dashboard
      </Button>

      <h2>{getFormattedTitle()}</h2>

      {loading && (
        <div className="text-center my-4">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="mt-2">Cargando jugadores...</p>
        </div>
      )}

      {error && (
        <Alert variant="danger" className="mb-3">
          <strong>Error al cargar jugadores:</strong> {error}
        </Alert>
      )}

      <Form className="mb-4 d-flex justify-content-center">
        <Row className="align-items-end w-95 mx-auto" style={{ width: "95%" }}>
          <Col md={3}>
            <Form.Label>Nombre</Form.Label>
            <Form.Control
              name="nombre"
              placeholder="Buscar por nombre"
              value={searchParams.get("nombre") || ""}
              onChange={handleFilterChange}
            />
          </Col>
          <Col md={2}>
            <Form.Label>Edad mínima(año de nacimiento)</Form.Label>
            <Form.Control
              type="number"
              name="edad_min"
              value={searchParams.get("edad_min") || ""}
              onChange={handleFilterChange}
            />
          </Col>
          <Col md={2}>
            <Form.Label>Posición</Form.Label>
            <Form.Control
              name="posicion"
              placeholder="Ej: portero"
              value={searchParams.get("posicion") || ""}
              onChange={handleFilterChange}
            />
          </Col>
          <Col md={2}>
            <Form.Label>Edad máxima(año de nacimiento)</Form.Label>
            <Form.Control
              type="number"
              name="edad_max"
              value={searchParams.get("edad_max") || ""}
              onChange={handleFilterChange}
            />
          </Col>
        </Row>
      </Form>

      <Button variant="danger" className="mb-3" onClick={handleCreate}>
        Añadir Jugador
      </Button>

      {/* Botón para calendario de entrenamientos solo para primer equipo */}
      {searchParams.get("categoria") === "SEN" && (
        <Button 
          variant="warning" 
          className="mb-3 ms-2"
          onClick={() => navigate(`/calendario-entrenamientos?categoria=${searchParams.get("categoria")}&equipo=${searchParams.get("equipo")}`)}
        >
          <Calendar className="me-1" size={16} />
          Calendario de Entrenamientos
        </Button>
      )}

      {/* Botón para Informe de Jornada */}
      <Button 
        variant="info" 
        className="mb-3 ms-2"
        onClick={() => navigate(`/informe-jornada?categoria=${searchParams.get("categoria")}&subcategoria=${searchParams.get("subcategoria")}&equipo=${searchParams.get("equipo")}`)}
      >
        <FileText className="me-1" size={16} />
        Informe de Jornada
      </Button>

      {!loading && (
        <Table striped bordered hover responsive className="text-center" style={{ width: "98%", margin: "40px auto 0 auto", background: "white" }}>
        <thead>
          <tr>
            <th style={{ width: "30%" }}>Nombre</th>
            <th style={{ width: "25%" }}>Posición</th>
            <th style={{ width: "15%" }}>Año</th>
            <th style={{ width: "20%" }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {jugadores.map((jugador) => (
            <tr key={jugador.id}>
              <td>
                <Link to={`/jugadores/${jugador.id}`}>{jugador.nombre}</Link>
              </td>
              <td>{jugador.posicion}</td>
              <td>{jugador.edad}</td>
              
             
              <td>
                <Button
                  size="sm"
                  style={{ padding: "0.15rem 0.4rem", fontSize: "0.8rem" }}
                  onClick={() => handleEdit(jugador)}
                  className="me-1"
                >
                  Editar
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  style={{ padding: "0.15rem 0.4rem", fontSize: "0.8rem" }}
                  onClick={() => handleDelete(jugador.id)}
                >
                  Eliminar
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      )}

      <JugadorForm
        show={showForm}
        onHide={() => setShowForm(false)}
        mode={editingJugador ? "editar" : "crear"}
        initialData={editingJugador || {}}
        onSuccess={() => {
          setShowForm(false);
          fetchJugadores();
        }}
      />
    </Container>
  );
}
