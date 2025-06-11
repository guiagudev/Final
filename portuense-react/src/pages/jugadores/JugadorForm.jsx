import { useEffect, useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { getToken } from "../../utils/auth";
import React from 'react';

export default function JugadorForm({
  show,
  onHide,
  mode = "crear",
  initialData = {},
  onSuccess,
}) {
  const [nombre, setNombre] = useState("");
  const [p_apellido, setP_apellido] = useState("");
  const [s_apellido, setS_apellido] = useState("");
  const [equipo, setEquipo] = useState("M");
  const [categoria, setCategoria] = useState("PREBEN");
  const [subcategoria, setSubcategoria] = useState("A");
  const [posicion, setPosicion] = useState("");
  const [edad, setEdad] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [haPagadoCuota, setHaPagadoCuota] = useState(false);
  const [imagen, setImagen] = useState(null);

  useEffect(() => {
    if (mode === "editar" && initialData) {
      setNombre(initialData.nombre || "");
      setP_apellido(initialData.p_apellido || "");
      setS_apellido(initialData.s_apellido || "");
      setEquipo(initialData.equipo || "M");
      setCategoria(initialData.categoria || "PREBEN");
      setSubcategoria(initialData.subcategoria || "A");
      setPosicion(initialData.posicion || "");
      setEdad(initialData.edad || "");
      setDescripcion(initialData.descripcion || "");
      setHaPagadoCuota(initialData.ha_pagado_cuota || false);
      setImagen(null);  // Solo se sube si cambia
    } else {
      setNombre("");
      setP_apellido("");
      setS_apellido("");
      setEquipo("M");
      setCategoria("PREBEN");
      setSubcategoria("A");
      setPosicion("");
      setEdad("");
      setDescripcion("");
      setHaPagadoCuota(false);
      setImagen(null);
    }
  }, [mode, initialData, show]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = getToken();

    const formData = new FormData();
    formData.append("nombre", nombre);
    formData.append("p_apellido", p_apellido);
    formData.append("s_apellido", s_apellido);
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
        ? `http://portuense-manager:8000/api/jugadores/${initialData.id}/`
        : "http://portuense-manager:8000/api/jugadores/",
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
            <Form.Label>Primer Apellido</Form.Label>
            <Form.Control value={p_apellido} onChange={(e) => setP_apellido(e.target.value)} required />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Segundo Apellido</Form.Label>
            <Form.Control value={s_apellido} onChange={(e) => setS_apellido(e.target.value)} />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Posición</Form.Label>
            <Form.Control value={posicion} onChange={(e) => setPosicion(e.target.value)} />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Edad</Form.Label>
            <Form.Control type="number" value={edad} onChange={(e) => setEdad(e.target.value)} />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Equipo</Form.Label>
            <Form.Select value={equipo} onChange={(e) => setEquipo(e.target.value)} required>
              <option value="M">Masculino</option>
              <option value="F">Femenino</option>
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Categoría</Form.Label>
            <Form.Select value={categoria} onChange={(e) => setCategoria(e.target.value)} required>
              <option value="PREBEN">Prebenjamín</option>
              <option value="BEN">Benjamín</option>
              <option value="ALE">Alevín</option>
              <option value="INF">Infantil</option>
              <option value="CAD">Cadete</option>
              <option value="JUV">Juvenil</option>
              <option value="SEN">Sénior</option>
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Subcategoría</Form.Label>
            <Form.Select value={subcategoria} onChange={(e) => setSubcategoria(e.target.value)} required>
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="C">C</option>
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Observaciones</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
            />
          </Form.Group>

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
