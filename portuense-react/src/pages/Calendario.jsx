import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "react-bootstrap";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import es from "date-fns/locale/es";
import "react-big-calendar/lib/css/react-big-calendar.css";

import CrearEventoModal from "../components/CrearEventoModal";
import EditarEventoModal from "../components/EditarEventoModal";
import DetallesEventoModal from "../components/DetalleEventoModal";
import BackButton from "../components/BackButton";
import AppHeader from "../components/AppHeader";
import "../assets/styles/calendar.css";

// 📅 Localizador para fechas en español
const locales = { es };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

export default function Calendario() {
  const [eventos, setEventos] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [nuevoTipo, setNuevoTipo] = useState(null);
  const [eventoSeleccionado, setEventoSeleccionado] = useState(null);
  const [mostrarEditar, setMostrarEditar] = useState(false);
  const [mostrarDetalles, setMostrarDetalles] = useState(false);

  // 🧭 Control de vista y fecha
  const [vistaActual, setVistaActual] = useState("month");
  const [fechaActual, setFechaActual] = useState(new Date());

  const navigate = useNavigate();
  const token = sessionStorage.getItem("accessToken");
  const user = JSON.parse(sessionStorage.getItem("user") || "{}");
  const isAdmin = user.groups?.includes("admin");

  // 🧲 Obtener eventos del backend
  const fetchEventos = useCallback(() => {
    fetch("http://portuense-manager.ddns.net:8000/api/eventos/", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (!Array.isArray(data)) return;
        const eventosFormateados = data.map((ev) => ({
          id: ev.id,
          title:
            ev.categoria === "Partido"
              ? `⚽ ${ev.equipo1} vs ${ev.equipo2}`
              : ev.categoria === "Entrenamiento"
              ? `🏋️ Entrenamiento (${ev.equipo1})`
              : `📋 ${ev.descripcion}`,
          start: new Date(ev.fecha),
          end: new Date(new Date(ev.fecha).getTime() + 2 * 60 * 60 * 1000),
          tipo: ev.categoria,
          equipo1: ev.equipo1,
          equipo2: ev.equipo2,
        }));
        setEventos(eventosFormateados);
      });
  }, [token]);

  useEffect(() => {
    if (!isAdmin) {
      navigate("/");
    } else {
      fetchEventos();
    }
  }, [isAdmin, navigate, token, fetchEventos]);

  // 📆 Textos del calendario en español
  const calendarMessages = useMemo(
    () => ({
      allDay: "Todo el día",
      previous: "<",
      next: ">",
      today: "Hoy",
      month: "Mes",
      week: "Semana",
      day: "Día",
      agenda: "Agenda",
      date: "Fecha",
      time: "Hora",
      event: "Evento",
      noEventsInRange: "No hay eventos en este rango",
    }),
    []
  );

  // 🎨 Estilos por tipo de evento
  const eventPropGetter = (event) => {
    let backgroundColor = "#333";

    if (event.tipo === "Reunión" || event.tipo === "Reunion") {
      backgroundColor = "#f39c12";
    } else if (event.tipo === "Entrenamiento") {
      backgroundColor = "#007bff";
    } else if (event.tipo === "Partido") {
      const nombresPortu = [
        "portuense",
        "r.c. portuense",
        "racing club portuense",
        "racing portuense",
      ];
      const eq1 = event.equipo1?.toLowerCase() || "";
      const eq2 = event.equipo2?.toLowerCase() || "";

      if (
        nombresPortu.some((nombre) => eq1.includes(nombre)) ||
        nombresPortu.some((nombre) => eq2.includes(nombre))
      ) {
        backgroundColor = "#ff1e56";
      } else {
        backgroundColor = "#444";
      }
    }

    return {
      style: {
        backgroundColor,
        color: "white",
        borderRadius: "5px",
        padding: "2px 6px",
        border: "none",
      },
    };
  };

  return (
    <>
      <AppHeader />
      <div className="p-4">
        <h2 className="mb-4">Calendario de Eventos</h2>
        <BackButton to="/dashboard" label="←" />

        <Calendar
          localizer={localizer}
          events={eventos}
          startAccessor="start"
          endAccessor="end"
          selectable
          style={{ height: 600 }}
          messages={calendarMessages}
          eventPropGetter={eventPropGetter}
          onSelectEvent={(event) => {
            setEventoSeleccionado(event);
            setMostrarDetalles(true);
          }}
          // ✅ Control de navegación y vista
          date={fechaActual}
          onNavigate={setFechaActual}
          view={vistaActual}
          onView={setVistaActual}
        />

        <Button
          variant="success"
          className="mt-3"
          onClick={() => {
            setNuevoTipo("Entrenamiento");
            setShowModal(true);
          }}
        >
          + Crear nuevo evento
        </Button>

        <CrearEventoModal
          show={showModal}
          onClose={(refresh) => {
            setShowModal(false);
            if (refresh) fetchEventos();
          }}
          fecha={fechaActual}
          tipo={nuevoTipo}
        />

        <EditarEventoModal
          show={mostrarEditar}
          evento={eventoSeleccionado}
          onClose={(refresh) => {
            setMostrarEditar(false);
            if (refresh) fetchEventos();
          }}
        />

        <DetallesEventoModal
          show={mostrarDetalles}
          evento={eventoSeleccionado}
          onClose={() => setMostrarDetalles(false)}
          onEditar={() => {
            setMostrarDetalles(false);
            setMostrarEditar(true);
          }}
          onEliminar={async () => {
            const confirm = window.confirm("¿Estás seguro de eliminar este evento?");
            if (!confirm) return;

            try {
              await fetch(`http://portuense-manager.ddns.net:8000/api/eventos/${eventoSeleccionado.id}/`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
              });
              setMostrarDetalles(false);
              fetchEventos();
            } catch (err) {
              console.error("Error al eliminar evento:", err);
            }
          }}
        />
      </div>
    </>
  );
}
