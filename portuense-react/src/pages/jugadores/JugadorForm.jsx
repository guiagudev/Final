import React, { useEffect, useMemo, useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { getToken } from "../../utils/auth";
import { useSearchParams } from "react-router-dom";

export default function JugadorForm({
  show,
  onHide,
  mode = "crear",
  initialData = {},
  onSuccess,
}) {
  const [searchParams] = useSearchParams();
  const [nombre, setNombre] = useState("");
  const [equipo, setEquipo] = useState("M");
  const [categoria, setCategoria] = useState("PREBEN");
  const [subcategoria, setSubcategoria] = useState("A");
  const [posicion, setPosicion] = useState("");
  const [edad, setEdad] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [haPagadoCuota, setHaPagadoCuota] = useState(false);
  const [imagen, setImagen] = useState(null);
  const [permisos, setPermisos] = useState([]);

  useEffect(() => {
    const storedUser = JSON.parse(sessionStorage.getItem("user") || "{}");
    setPermisos(storedUser.permisos || []);
  }, []);

  // Leer parámetros de la URL
  const urlEquipo = searchParams.get('equipo');
  const urlCategoria = searchParams.get('categoria');
  const urlSubcategoria = searchParams.get('subcategoria');

  const equiposDisponibles = useMemo(() => {
    return [...new Set(permisos.map(p => p.equipo))];
  }, [permisos]);

  const categoriasDisponibles = useMemo(() => {
    return [...new Set(permisos.map(p => p.categoria))];
  }, [permisos]);

  const subcategoriasDisponibles = useMemo(() => {
    return [
      ...new Set(
        permisos
          .filter(p => p.categoria === categoria && p.equipo === equipo)
          .map(p => p.subcategoria)
      ),
    ];
  }, [permisos, categoria, equipo]);

  useEffect(() => {
    if (!show) return;

    if (mode === "editar" && initialData) {
      setNombre(initialData.nombre || "");
      setEquipo(initialData.equipo || "M");
      setCategoria(initialData.categoria || "PREBEN");
      setSubcategoria(initialData.subcategoria || "A");
      setPosicion(initialData.posicion || "");
      setEdad(initialData.edad || "");
      setDescripcion(initialData.descripcion || "");
      setHaPagadoCuota(initialData.ha_pagado_cuota || false);
      setImagen(null);
    } else {
      // Modo crear - usar parámetros de URL si están disponibles
      setNombre("");
      setEquipo(urlEquipo || equiposDisponibles[0] || "M");
      setCategoria(urlCategoria || categoriasDisponibles[0] || "PREBEN");
      setSubcategoria(urlSubcategoria || subcategoriasDisponibles[0] || "A");
      setPosicion("");
      setEdad("");
      setDescripcion("");
      setHaPagadoCuota(false);
      setImagen(null);
    }
  }, [show, mode, initialData, urlEquipo, urlCategoria, urlSubcategoria, equiposDisponibles, categoriasDisponibles, subcategoriasDisponibles]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = getToken();

    const formData = new FormData();
    formData.append("nombre", nombre);
    formData.append("equipo", equipo);
    formData.append("categoria", categoria);
    formData.append("subcategoria", subcategoria);
    formData.append("posicion", posicion);
    formData.append("edad", edad);
    formData.append("descripcion", descripcion);

    if (mode === "editar" && categoria !== "SEN") {
      formData.append("ha_pagado_cuota", haPagadoCuota);
    }

    if (imagen) {
      formData.append("imagen", imagen);
    }

    const response = await fetch(
      mode === "editar"
        ? `${import.meta.env.VITE_API_URL}/jugadores/${initialData.id}/`
        : `${import.meta.env.VITE_API_URL}/jugadores/`,
      {
        method: mode === "editar" ? "PUT" : "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      }
    );

    if (response.ok) {
      const data = await response.json();
      onSuccess(data);
      onHide();
    } else {
      alert("Error al guardar el jugador.");
    }
  };

  // Determinar si los campos deben estar deshabilitados (modo crear con parámetros de URL)
  const shouldDisableFields = mode === "crear" && (urlEquipo || urlCategoria || urlSubcategoria);

  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>{mode === "crear" ? "Nuevo Jugador" : "Editar Jugador"}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit} encType="multipart/form-data">
          <Form.Group className="mb-3">
            <Form.Label>Nombre</Form.Label>
            <Form.Control value={nombre} onChange={(e) => setNombre(e.target.value)} required />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Posición</Form.Label>
            <Form.Control value={posicion} onChange={(e) => setPosicion(e.target.value)} />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Año</Form.Label>
            <Form.Control type="number" value={edad} onChange={(e) => setEdad(e.target.value)} />
          </Form.Group>
          
          {/* Solo mostrar campos de equipo, categoría y subcategoría si no hay parámetros de URL */}
          {!shouldDisableFields && (
            <>
              <Form.Group className="mb-3">
                <Form.Label>Equipo</Form.Label>
                <Form.Select
                  value={equipo}
                  onChange={(e) => setEquipo(e.target.value)}
                  disabled={equiposDisponibles.length === 1}
                  required
                >
                  {equiposDisponibles.map(eq => (
                    <option key={eq} value={eq}>
                      {eq === "M" ? "Masculino" : "Femenino"}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Categoría</Form.Label>
                <Form.Select
                  value={categoria}
                  onChange={(e) => setCategoria(e.target.value)}
                  disabled={categoriasDisponibles.length === 1}
                  required
                >
                  {categoriasDisponibles.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </Form.Select>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Subcategoría</Form.Label>
                <Form.Select
                  value={subcategoria}
                  onChange={(e) => setSubcategoria(e.target.value)}
                  disabled={subcategoriasDisponibles.length === 1}
                  required
                >
                  {subcategoriasDisponibles.map(sub => (
                    <option key={sub} value={sub}>{sub}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </>
          )}

          {mode === "editar" && categoria !== "SEN" && (
            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                label="Cuota pagada este mes"
                checked={haPagadoCuota}
                onChange={(e) => setHaPagadoCuota(e.target.checked)}
              />
            </Form.Group>
          )}

          <Form.Group className="mb-3">
            <Form.Label>Imagen del Jugador</Form.Label>
            <Form.Control
              type="file"
              accept="image/*"
              onChange={(e) => setImagen(e.target.files[0])}
            />
          </Form.Group>

          <Button variant="primary" type="submit">
            {mode === "crear" ? "Agregar Jugador" : "Guardar Cambios"}
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
}
