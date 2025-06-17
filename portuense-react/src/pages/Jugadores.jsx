import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { Table, Container, Button, Form, Row, Col } from "react-bootstrap";
import JugadorForm from "./jugadores/JugadorForm";
import { eliminarJugador } from "./jugadores/EliminarJugadorBtn";
import { getToken } from "../utils/auth";
import React from "react";

const categorias = ["PREBEN", "BEN", "ALE", "INF", "CAD", "JUV", "SEN"];
const equipos = ["M", "F"];

export default function Jugadores() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [jugadores, setJugadores] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingJugador, setEditingJugador] = useState(null);
  const [user, setUser] = useState({});
  const navigate = useNavigate();

  const fetchJugadores = useCallback(async () => {
    try {
      const queryString = searchParams.toString();
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/jugadores/?${queryString}`,
        {
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        }
      );
      if (!response.ok) throw new Error("Error al obtener jugadores");
      const data = await response.json();
      setJugadores(data);
    } catch (error) {
      console.error("Error fetching jugadores:", error);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchJugadores();
    const storedUser = JSON.parse(sessionStorage.getItem("user") || "{}");
    setUser(storedUser);
  }, [fetchJugadores]);

  const handleCreate = () => {
    setEditingJugador(null);
    setShowForm(true);
  };

  const handleEdit = (jugador) => {
    setEditingJugador(jugador);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    await eliminarJugador(id, fetchJugadores);
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

  // Admin y categoría ≠ SEN
  const mostrarCuota =
    user.groups?.includes("admin") && searchParams.get("categoria") !== "SEN";

  return (
    <Container className="mt-4">
      <Button
        variant="secondary"
        onClick={() => navigate("/dashboard")}
        className="mb-3"
      >
        ← Volver al Dashboard
      </Button>

      <h2>Listado de Jugadores</h2>

      <Form className="mb-4">
        <Row className="align-items-end">
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
            <Form.Label>Edad mínima</Form.Label>
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
            <Form.Label>Edad máxima</Form.Label>
            <Form.Control
              type="number"
              name="edad_max"
              value={searchParams.get("edad_max") || ""}
              onChange={handleFilterChange}
            />
          </Col>
        </Row>
      </Form>

      <Button variant="success" className="mb-3" onClick={handleCreate}>
        Añadir Jugador
      </Button>

      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Posición</th>
            <th>Edad</th>
            <th>Equipo</th>
            <th>Categoría</th>
            <th>Cuota</th> {/* Siempre presente, visible o con placeholder */}
            <th>Acciones</th>
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
              <td>{jugador.equipo}</td>
              <td>{jugador.categoria}</td>
              <td>
                {mostrarCuota ? (
                  <span
                    style={{ color: jugador.ha_pagado_cuota ? "green" : "red" }}
                  >
                    {jugador.ha_pagado_cuota ? "Pagada" : "Pendiente"}
                  </span>
                ) : (
                  <span className="text-muted">—</span>
                )}
              </td>
              <td>
                <Button
                  size="sm"
                  onClick={() => handleEdit(jugador)}
                  className="me-2"
                >
                  Editar
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => handleDelete(jugador.id)}
                >
                  Eliminar
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

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
