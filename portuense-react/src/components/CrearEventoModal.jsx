import { Modal, Button, Form } from "react-bootstrap";
import { useState, useEffect } from "react";
import React from "react";

export default function CrearEventoModal({ show, onClose, fecha, tipo: tipoInicial }) {
  const [descripcion, setDescripcion] = useState("");
  const [equipo1, setEquipo1] = useState("R.C. Portuense");
  const [equipo2, setEquipo2] = useState("");
  const [localizacion, setLocalizacion] = useState("");
  const [tipo, setTipo] = useState(tipoInicial || "Entrenamiento");
  const [fechaInput, setFechaInput] = useState("");

  const [categoriaEquipo, setCategoriaEquipo] = useState("");
  const [subcategoriaEquipo, setSubcategoriaEquipo] = useState("");
  const [equipoGenero, setEquipoGenero] = useState("");

  const token = sessionStorage.getItem("accessToken");

  useEffect(() => {
    if (show) {
      setDescripcion("");
      setEquipo1("R.C. Portuense");
      setEquipo2("");
      setLocalizacion("");
      setTipo(tipoInicial || "Entrenamiento");
      setCategoriaEquipo("");
      setSubcategoriaEquipo("");
      setEquipoGenero("");

      if (fecha) {
        const localDate = new Date(fecha);
        const isoString = new Date(
          localDate.getTime() - localDate.getTimezoneOffset() * 60000
        )
          .toISOString()
          .slice(0, 16);
        setFechaInput(isoString);
      } else {
        setFechaInput("");
      }
    }
  }, [show, tipoInicial, fecha]);

  const handleSubmit = async () => {
    const evento = {
      descripcion,
      fecha: new Date(fechaInput).toISOString(),
      categoria: tipo,
      localizacion,
      ...(tipo === "Partido" || tipo === "Entrenamiento"
        ? {
            equipo1,
            categoria_equipo: categoriaEquipo,
            subcategoria_equipo: subcategoriaEquipo,
            equipo_genero: equipoGenero,
          }
        : {}),
      ...(tipo === "Partido" ? { equipo2 } : {}),
    };

    const res = await fetch(`${import.meta.env.VITE_API_URL}/eventos/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(evento),
    });

    if (res.ok) {
      onClose(true);
    } else {
      console.error("Error al crear evento");
      alert("No se pudo crear el evento.");
    }
  };

  return (
    <Modal show={show} onHide={() => onClose(false)}>
      <Modal.Header closeButton>
        <Modal.Title>Nuevo Evento</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form>
          <Form.Group>
            <Form.Label>Tipo de evento</Form.Label>
            <Form.Select value={tipo} onChange={(e) => setTipo(e.target.value)}>
              <option value="Entrenamiento">Entrenamiento</option>
              <option value="Partido">Partido</option>
              <option value="Reunion">Reunión</option>
            </Form.Select>
          </Form.Group>

          <Form.Group className="mt-3">
            <Form.Label>Fecha y hora</Form.Label>
            <Form.Control
              type="datetime-local"
              value={fechaInput}
              onChange={(e) => setFechaInput(e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group className="mt-3">
            <Form.Label>Descripción</Form.Label>
            <Form.Control
              type="text"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
            />
          </Form.Group>

          {(tipo === "Partido" || tipo === "Entrenamiento") && (
            <>
              <Form.Group className="mt-3">
                <Form.Label>Equipo propio</Form.Label>
                <Form.Control
                  type="text"
                  value={equipo1}
                  onChange={(e) => setEquipo1(e.target.value)}
                  required
                />
              </Form.Group>

              <Form.Group className="mt-3">
                <Form.Label>Categoría</Form.Label>
                <Form.Select
                  value={categoriaEquipo}
                  onChange={(e) => setCategoriaEquipo(e.target.value)}
                  required
                >
                  <option value="">Selecciona una categoría</option>
                  <option value="PREBEN">Prebenjamín</option>
                  <option value="BEN">Benjamín</option>
                  <option value="ALE">Alevín</option>
                  <option value="INF">Infantil</option>
                  <option value="CAD">Cadete</option>
                  <option value="JUV">Juvenil</option>
                  <option value="SEN">Sénior</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mt-3">
                <Form.Label>Subcategoría</Form.Label>
                <Form.Select
                  value={subcategoriaEquipo}
                  onChange={(e) => setSubcategoriaEquipo(e.target.value)}
                  required
                >
                  <option value="">Selecciona subcategoría</option>
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mt-3">
                <Form.Label>Equipo (Género)</Form.Label>
                <Form.Select
                  value={equipoGenero}
                  onChange={(e) => setEquipoGenero(e.target.value)}
                  required
                >
                  <option value="">Selecciona el género</option>
                  <option value="M">Masculino</option>
                  <option value="F">Femenino</option>
                </Form.Select>
              </Form.Group>
            </>
          )}

          {tipo === "Partido" && (
            <Form.Group className="mt-3">
              <Form.Label>Equipo rival</Form.Label>
              <Form.Control
                type="text"
                value={equipo2}
                onChange={(e) => setEquipo2(e.target.value)}
                required
              />
            </Form.Group>
          )}

          <Form.Group className="mt-3">
            <Form.Label>Localización</Form.Label>
            <Form.Control
              type="text"
              value={localizacion}
              onChange={(e) => setLocalizacion(e.target.value)}
            />
          </Form.Group>
        </Form>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={() => onClose(false)}>
          Cancelar
        </Button>
        <Button variant="primary" onClick={handleSubmit}>
          Crear
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
