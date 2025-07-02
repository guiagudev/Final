import React, { useState, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function EditarEventoModal({ show, onClose, evento }) {
  const [descripcion, setDescripcion] = useState("");
  const [equipo2, setEquipo2] = useState("");
  const [localizacion, setLocalizacion] = useState("");
  const [fechaInput, setFechaInput] = useState("");
  const [tipo, setTipo] = useState("Entrenamiento");
  const [categoriaEquipo, setCategoriaEquipo] = useState("");
  const [subcategoriaEquipo, setSubcategoriaEquipo] = useState("");
  const [equipoGenero, setEquipoGenero] = useState("");

  const token = sessionStorage.getItem("accessToken");

  useEffect(() => {
    const fetchEvento = async () => {
      if (!evento?.id || !show) return;
      if (!token) {
        toast.error("No hay token. Por favor, inicia sesión.");
        return;
      }

      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/eventos/${evento.id}/`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) throw new Error("No se pudo obtener el evento");

        const data = await res.json();

        setDescripcion(data.descripcion || "");
        setEquipo2(data.equipo2 || "");
        setLocalizacion(data.localizacion || "");
        setTipo(data.categoria || "Entrenamiento");
        setCategoriaEquipo(data.categoria_equipo || "");
        setSubcategoriaEquipo(data.subcategoria_equipo || "");
        setEquipoGenero(data.equipo_genero || "");

        const date = new Date(data.fecha);
        const iso = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
          .toISOString()
          .slice(0, 16);
        setFechaInput(iso);
      } catch (err) {
        console.error("Error al cargar evento:", err);
        toast.error("No se pudo cargar el evento.");
      }
    };

    fetchEvento();
  }, [evento?.id, show, token]);

  const handleUpdate = async () => {
    if (!token) {
      toast.error("No hay token de sesión. Por favor, inicia sesión nuevamente.");
      return;
    }

    const body = {
      descripcion,
      fecha: new Date(fechaInput).toISOString(),
      categoria: tipo,
      equipo1: evento.equipo1 || "Portuense F.C.",
      equipo2: tipo === "Partido" ? equipo2 : "",
      localizacion,
      categoria_equipo:
        tipo === "Partido" || tipo === "Entrenamiento" ? categoriaEquipo : null,
      subcategoria_equipo:
        tipo === "Partido" || tipo === "Entrenamiento" ? subcategoriaEquipo : null,
      equipo_genero:
        tipo === "Partido" || tipo === "Entrenamiento" ? equipoGenero : null,
    };

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/eventos/${evento.id}/`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(body),
        }
      );

      if (res.ok) {
        toast.success("Evento actualizado correctamente");
        onClose(true);
      } else {
        toast.error("No se pudo actualizar el evento.");
      }
    } catch (err) {
      console.error("Error de red:", err);
      toast.error("Error al conectarse con el servidor.");
    }
  };

  const handleDelete = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/eventos/${evento.id}/`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.ok) {
        toast.success("Evento eliminado");
        onClose(true);
      } else {
        toast.error("Error al eliminar el evento");
      }
    } catch (err) {
      console.error("Error al eliminar evento:", err);
      toast.error("Error al conectarse con el servidor.");
    }
  };

  return (
    <Modal show={show} onHide={() => onClose(false)}>
      <Modal.Header closeButton>
        <Modal.Title>Editar Evento</Modal.Title>
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

          {tipo === "Partido" && (
            <Form.Group className="mt-3">
              <Form.Label>Equipo contrario</Form.Label>
              <Form.Control
                type="text"
                value={equipo2}
                onChange={(e) => setEquipo2(e.target.value)}
              />
            </Form.Group>
          )}

          {(tipo === "Partido" || tipo === "Entrenamiento") && (
            <>
              <Form.Group className="mt-3">
                <Form.Label>Categoría</Form.Label>
                <Form.Select
                  value={categoriaEquipo}
                  onChange={(e) => setCategoriaEquipo(e.target.value)}
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
                >
                  <option value="">Selecciona el género</option>
                  <option value="M">Masculino</option>
                  <option value="F">Femenino</option>
                </Form.Select>
              </Form.Group>
            </>
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
        <Button variant="danger" onClick={handleDelete}>
          Eliminar
        </Button>
        <Button variant="secondary" onClick={() => onClose(false)}>
          Cancelar
        </Button>
        <Button variant="primary" onClick={handleUpdate}>
          Guardar Cambios
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
