// src/pages/DireccionDeportiva/DocsyExcel.jsx
import { useParams, useNavigate } from "react-router-dom";
import { Container, Button, Modal, Form, Alert, Card } from "react-bootstrap";
import AppHeader from "../../components/AppHeader";
import React, { useState, useEffect } from "react";
import BackButton  from '../../components/BackButton'
import { FileSpreadsheet, FileText, MessageSquare, Edit3 } from "lucide-react";
import { getToken } from "../../utils/auth";

export default function DocsyExcel() {
  const { categoria, equipo, subcategoria } = useParams();
  const navigate = useNavigate();
  
  // Estados para comentarios
  const [comentario, setComentario] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [titulo, setTitulo] = useState("");
  const [contenido, setContenido] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Cargar comentario existente al montar el componente
  useEffect(() => {
    cargarComentario();
  }, [categoria, equipo, subcategoria]);

  const cargarComentario = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/comentarios-direccion-deportiva/${categoria}/${subcategoria}/${equipo}/`,
        {
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        setComentario(data);
        if (data) {
          setTitulo(data.titulo || "");
          setContenido(data.contenido || "");
        }
      }
    } catch (error) {
      console.error("Error cargando comentario:", error);
    } finally {
      setLoading(false);
    }
  };

  const guardarComentario = async () => {
    if (!titulo.trim() || !contenido.trim()) {
      setError("El título y contenido son obligatorios");
      return;
    }

    try {
      setLoading(true);
      setError("");
      
      const method = comentario ? "PUT" : "POST";
      const url = comentario 
        ? `${import.meta.env.VITE_API_URL}/comentarios-direccion-deportiva/${categoria}/${subcategoria}/${equipo}/`
        : `${import.meta.env.VITE_API_URL}/comentarios-direccion-deportiva/`;
      
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          categoria,
          subcategoria,
          equipo,
          titulo: titulo.trim(),
          contenido: contenido.trim(),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setComentario(data);
        setShowModal(false);
        setError("");
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Error al guardar el comentario");
      }
    } catch (error) {
      console.error("Error guardando comentario:", error);
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  const eliminarComentario = async () => {
    if (!comentario) return;
    
    if (!window.confirm("¿Estás seguro de que quieres eliminar este comentario?")) {
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/comentarios-direccion-deportiva/${categoria}/${subcategoria}/${equipo}/`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        }
      );

      if (response.ok) {
        setComentario(null);
        setTitulo("");
        setContenido("");
        setError("");
      } else {
        setError("Error al eliminar el comentario");
      }
    } catch (error) {
      console.error("Error eliminando comentario:", error);
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AppHeader />
      <BackButton to="/direccion-deportiva" label="←" />
      <Container className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: '70vh' }}>
        <h2 className="mb-5 text-center" style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#ff3333' }}>
          Documentos y Excel – {categoria}-{subcategoria} {equipo}
        </h2>
        
        {/* Sección de comentarios */}
        <div className="w-100 mb-4" style={{ maxWidth: 600 }}>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h4 className="mb-0">
              <MessageSquare size={20} className="me-2" />
              Notas de Dirección Deportiva
            </h4>
            <Button
              variant={comentario ? "outline-primary" : "primary"}
              size="sm"
              onClick={() => setShowModal(true)}
            >
              <Edit3 size={16} className="me-1" />
              {comentario ? "Editar" : "Agregar"} Nota
            </Button>
          </div>
          
          {comentario ? (
            <Card className="mb-3">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <h6 className="mb-0">{comentario.titulo}</h6>
                  <small className="text-muted">
                    {new Date(comentario.fecha_creacion).toLocaleDateString()}
                  </small>
                </div>
                <p className="mb-0">{comentario.contenido}</p>
                <div className="mt-2">
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={eliminarComentario}
                    disabled={loading}
                  >
                    Eliminar
                  </Button>
                </div>
              </Card.Body>
            </Card>
          ) : (
            <Alert variant="info" className="text-center">
              No hay notas para esta categoría. Haz clic en "Agregar Nota" para crear una.
            </Alert>
          )}
        </div>

        <div className="d-flex flex-column flex-md-row gap-4 justify-content-center align-items-center w-100" style={{ maxWidth: 500 }}>
          <Button
            size="lg"
            className="flex-fill d-flex align-items-center justify-content-center"
            style={{ minWidth: 180 }}
            onClick={() =>
              navigate(
                `/direccion-deportiva/primer-equipo/${categoria}/${equipo}/${subcategoria}/jugadores`
              )
            }
          >
            <FileText size={22} className="me-2" /> Ver PDFs
          </Button>
          <Button
            size="lg"
            variant="success"
            className="flex-fill d-flex align-items-center justify-content-center"
            style={{ minWidth: 180 }}
            onClick={() =>
              navigate(
                `/direccion-deportiva/primer-equipo/${categoria}/${equipo}/${subcategoria}/excel`
              )
            }
          >
            <FileSpreadsheet size={22} className="me-2" /> Ver Excel
          </Button>
        </div>
      </Container>

      {/* Modal para editar/crear comentario */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {comentario ? "Editar" : "Agregar"} Nota - {categoria}-{subcategoria} {equipo}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Título *</Form.Label>
              <Form.Control
                type="text"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Título de la nota"
                maxLength={100}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Contenido *</Form.Label>
              <Form.Control
                as="textarea"
                rows={6}
                value={contenido}
                onChange={(e) => setContenido(e.target.value)}
                placeholder="Escribe aquí el contenido de la nota..."
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancelar
          </Button>
          <Button 
            variant="primary" 
            onClick={guardarComentario}
            disabled={loading || !titulo.trim() || !contenido.trim()}
          >
            {loading ? "Guardando..." : "Guardar"}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
