import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, Button, Modal, Form } from "react-bootstrap";

import AppHeader from "../components/AppHeader";
import React from "react";
import ModalCarpetasPDFs from "../components/ModalCarpetasPDFs";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { hasGroup } from "../utils/roles";

export default function DetalleJugador() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [jugador, setJugador] = useState(null);
  const [comentarios, setComentarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [hoveredComentarioId, setHoveredComentarioId] = useState(null);
  
  // Estados para el manejo de informes PDF
  const [informe, setInforme] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const isAdmin = hasGroup('admin');

  useEffect(() => {
    const token = sessionStorage.getItem("accessToken");

    fetch(`${import.meta.env.VITE_API_URL}/jugadores/${id}/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setJugador(data);
        setLoading(false);
        
        // Cargar informe del jugador para todas las categorías
        fetch(`${import.meta.env.VITE_API_URL}/informes-jugador/jugador/${id}/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
          .then((res) => {
            if (res.ok) {
              return res.json();
            }
            return null;
          })
          .then((informeData) => setInforme(informeData))
          .catch((err) => console.error("Error al obtener informe:", err));
      })
      .catch(() => setLoading(false));

    fetch(`${import.meta.env.VITE_API_URL}/comentarios-jugador/jugador/${id}/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setComentarios(data))
      .catch((err) => console.error("Error al obtener comentarios:", err));
  }, [id]);

  if (loading) return <p className="p-4">Cargando datos del jugador...</p>;
  if (!jugador) return <p className="p-4">Jugador no encontrado</p>;

  const nombreCompleto = `${jugador.nombre}`;
  

  const eliminarComentario = async (comentarioId) => {
    const token = sessionStorage.getItem("accessToken");

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/comentarios-jugador/${comentarioId}/`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.ok) {
        setComentarios((prev) =>
          prev.filter((comentario) => comentario.id !== comentarioId)
        );
        toast.success("Comentario eliminado");
      } else {
        toast.error("Error al eliminar el comentario.");
      }
    } catch {
      toast.error("Error al conectar con el servidor.");
    }
  };

  // Funciones para manejar informes PDF
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
    } else {
      toast.error("Por favor, selecciona un archivo PDF válido.");
      setSelectedFile(null);
    }
  };

  const handleUploadInforme = async () => {
    if (!selectedFile) {
      toast.error("Por favor, selecciona un archivo PDF.");
      return;
    }

    setUploading(true);
    const token = sessionStorage.getItem("accessToken");
    const formData = new FormData();
    formData.append('archivo_pdf', selectedFile);
    formData.append('jugador', jugador.id); // Agregar el ID del jugador

    try {
      const url = informe 
        ? `${import.meta.env.VITE_API_URL}/informes-jugador/${informe.id}/`
        : `${import.meta.env.VITE_API_URL}/informes-jugador/`;
      
      const method = informe ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method: method,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setInforme(data);
        setShowUploadModal(false);
        setSelectedFile(null);
        toast.success(informe ? "Informe actualizado correctamente" : "Informe subido correctamente");
      } else {
        const errorData = await res.json();
        toast.error(errorData.error || "Error al subir el informe.");
      }
    } catch {
      toast.error("Error al conectar con el servidor.");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteInforme = async () => {
    if (!informe) return;

    const token = sessionStorage.getItem("accessToken");
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/informes-jugador/${informe.id}/`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.ok) {
        setInforme(null);
        toast.success("Informe eliminado correctamente");
      } else {
        toast.error("Error al eliminar el informe.");
      }
    } catch {
      toast.error("Error al conectar con el servidor.");
    }
  };

  const handleViewInforme = () => {
    if (informe?.archivo_pdf) {
      window.open(informe.archivo_pdf, '_blank');
    }
  };

  return (
    <>
      <AppHeader />
      <div className="p-4">
        <Button
          variant="outline-secondary"
          size="sm"
          className="mb-3"
          onClick={() => navigate(-1)}
        >
          ← Volver
        </Button>

        <Card
          className="shadow mx-auto"
          style={{ width: "700px", height: "auto" }}
        >
          <Card.Body>
            <div className="d-flex align-items-center mb-4">
              {jugador.imagen ? (
                <img
                  src={jugador.imagen}
                  alt={nombreCompleto}
                  style={{
                    width: "150px",
                    height: "150px",
                    objectFit: "cover",
                    borderRadius: "50%",
                    marginRight: "1rem",
                  }}
                />
              ) : (
                <div
                  style={{
                    width: "120px",
                    height: "120px",
                    backgroundColor: "#eee",
                    borderRadius: "50%",
                    marginRight: "1rem",
                  }}
                />
              )}

              <div>
                <h3 className="mb-1">{nombreCompleto}</h3>
                <p className="mb-0 text-muted">
                  {jugador.categoria} {jugador.subcategoria} - {jugador.equipo}
                </p>
              </div>
            </div>

            <p>
              <strong>Posición:</strong> {jugador.posicion}
            </p>
            <p>
              <strong>Año de nacimiento:</strong> {jugador.edad} 
            </p>

            {/* Sección de Informe PDF para todas las categorías */}
            {isAdmin && (
              <div className="mt-4 p-3" style={{ backgroundColor: '#1a1a1a', borderRadius: '8px', border: '1px solid #ff1e5630' }}>
                <h6 className="mb-3" style={{ color: '#ff1e56' }}>
                  <i className="fas fa-file-pdf me-2"></i>
                  Informe del Jugador
                </h6>
                
                {informe ? (
                  <div className="d-flex gap-2 align-items-center">
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={handleViewInforme}
                    >
                      <i className="fas fa-eye me-1"></i>
                      Ver Informe
                    </Button>
                    <Button
                      variant="outline-warning"
                      size="sm"
                      onClick={() => setShowUploadModal(true)}
                    >
                      <i className="fas fa-edit me-1"></i>
                      Modificar
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={handleDeleteInforme}
                    >
                      <i className="fas fa-trash me-1"></i>
                      Eliminar
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="outline-success"
                    size="sm"
                    onClick={() => setShowUploadModal(true)}
                  >
                    <i className="fas fa-upload me-1"></i>
                    Subir Informe PDF
                  </Button>
                )}
              </div>
            )}

            <hr className="my-4" />

            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="mb-0">Comentarios</h5>
              <Button
                variant="outline-primary"
                size="sm"
                onClick={() =>
                  navigate(`/jugadores/${jugador.id}/comentario-nuevo`)
                }
              >
                Añadir Comentario
              </Button>
            </div>

            {comentarios.length === 0 ? (
              <p className="text-muted">No hay comentarios todavía.</p>
            ) : (
              comentarios.map((comentario) => (
                <div
                  key={comentario.id}
                  className="mb-3 p-3 position-relative"
                  style={{
                    backgroundColor: "#1a1a1a",
                    border: "1px solid #ff1e5630",
                    borderRadius: "8px",
                  }}
                  onMouseEnter={() => setHoveredComentarioId(comentario.id)}
                  onMouseLeave={() => setHoveredComentarioId(null)}
                >
                  <h6 className="mb-1" style={{ color: "#ff1e56" }}>
                    {comentario.titulo}
                  </h6>
                  <p style={{ whiteSpace: "pre-wrap" }}>
                    {comentario.contenido}
                  </p>
                  <div className="d-flex justify-content-between mt-2">
                    <small style={{ color: "#ff1e56" }}>
                      {new Date(comentario.fecha_creacion).toLocaleString()}
                    </small>
                    <small>
                      <strong>{comentario.autor.username}</strong>
                    </small>
                  </div>

                  {hoveredComentarioId === comentario.id && (
                    <Button
                      variant="danger"
                      size="sm"
                      style={{
                        position: "absolute",
                        top: "8px",
                        right: "8px",
                        zIndex: 2,
                      }}
                      onClick={() => eliminarComentario(comentario.id)}
                    >
                      Eliminar
                    </Button>
                  )}
                </div>
              ))
            )}
          </Card.Body>
        </Card>
      </div>
      <ModalCarpetasPDFs
        show={showModal}
        onHide={() => setShowModal(false)}
        jugadorId={jugador.id}
      />

      {/* Modal para subir/modificar informe PDF */}
      <Modal show={showUploadModal} onHide={() => setShowUploadModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            {informe ? 'Modificar Informe PDF' : 'Subir Informe PDF'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="formFile" className="mb-3">
              <Form.Label>Seleccionar archivo PDF</Form.Label>
              <Form.Control
                type="file"
                accept=".pdf"
                onChange={handleFileSelect}
              />
              <Form.Text className="text-muted">
                Solo se permiten archivos PDF.
              </Form.Text>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowUploadModal(false)}>
            Cancelar
          </Button>
          <Button 
            variant="primary" 
            onClick={handleUploadInforme}
            disabled={!selectedFile || uploading}
          >
            {uploading ? 'Subiendo...' : (informe ? 'Actualizar' : 'Subir')}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
