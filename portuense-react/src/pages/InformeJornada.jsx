import React, { useEffect, useState } from "react";
import { Container, Button, Table, Alert, Form, Card, Row, Col, Modal } from "react-bootstrap";
import { useSearchParams, useNavigate } from "react-router-dom";
import { getToken } from "../utils/auth";
import { toast } from "react-toastify";

export default function InformeJornada() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [informes, setInformes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingInforme, setEditingInforme] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedInforme, setSelectedInforme] = useState(null);
  const [formData, setFormData] = useState({
    jornada: "",
    fecha_partido: "",
    equipo_rival: "",
    contenido: ""
  });
  
  const categoria = searchParams.get("categoria");
  const subcategoria = searchParams.get("subcategoria");
  const equipo = searchParams.get("equipo");

  // Función simple para verificar permisos - por ahora permitimos a todos
  const hasPermission = true; // TODO: Implementar verificación real de permisos

  // Función para formatear la información de categoría, subcategoría y equipo
  const getFormattedTitle = () => {
    if (!categoria && !subcategoria && !equipo) {
      return "Informes de Jornada";
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
    
    return `Informes de Jornada: ${parts.join(' ')}`;
  };

  // Función para convertir texto a bulletpoints
  const formatContentToBulletpoints = (content) => {
    if (!content) return [];
    
    // Dividir por líneas y filtrar líneas vacías
    const lines = content.split('\n').filter(line => line.trim());
    
    // Si no hay líneas o solo una línea, dividir por puntos
    if (lines.length <= 1) {
      return content.split('.').filter(sentence => sentence.trim()).map(sentence => sentence.trim());
    }
    
    // Si hay múltiples líneas, usar cada línea como bulletpoint
    return lines.map(line => line.trim());
  };

  const handleViewDetail = (informe) => {
    setSelectedInforme(informe);
    setShowDetailModal(true);
  };

  const handleCloseDetailModal = () => {
    setShowDetailModal(false);
    setSelectedInforme(null);
  };

  useEffect(() => {
    const fetchInformes = async () => {
      try {
        setLoading(true);
        const queryString = new URLSearchParams({
          categoria: categoria || "",
          subcategoria: subcategoria || "",
          equipo: equipo || ""
        }).toString();

        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/informes-jornada/?${queryString}`,
          {
            headers: {
              Authorization: `Bearer ${getToken()}`,
            },
          }
        );
        
        if (!response.ok) {
          throw new Error(`Error al obtener informes: ${response.status}`);
        }
        
        const data = await response.json();
        setInformes(data);
      } catch (error) {
        console.error("Error fetching informes:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (categoria && subcategoria && equipo) {
      fetchInformes();
    } else {
      setLoading(false);
    }
  }, [categoria, subcategoria, equipo]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const url = editingInforme 
        ? `${import.meta.env.VITE_API_URL}/informes-jornada/${editingInforme.id}/`
        : `${import.meta.env.VITE_API_URL}/informes-jornada/`;
      
      const method = editingInforme ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          ...formData,
          categoria,
          subcategoria,
          equipo
        }),
      });

      if (!response.ok) throw new Error("Error al guardar informe");
      
      toast.success(editingInforme ? "Informe actualizado" : "Informe creado");
      setShowForm(false);
      setEditingInforme(null);
      setFormData({ jornada: "", fecha_partido: "", equipo_rival: "", contenido: "" });
      
      // Recargar informes
      const queryString = new URLSearchParams({
        categoria: categoria || "",
        subcategoria: subcategoria || "",
        equipo: equipo || ""
      }).toString();
      
      const refreshResponse = await fetch(
        `${import.meta.env.VITE_API_URL}/informes-jornada/?${queryString}`,
        {
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        }
      );
      
      if (refreshResponse.ok) {
        const data = await refreshResponse.json();
        setInformes(data);
      }
    } catch (error) {
      console.error("Error saving informe:", error);
      toast.error("Error al guardar informe");
    }
  };

  const handleEdit = (informe) => {
    setEditingInforme(informe);
    setFormData({
      jornada: informe.jornada.toString(),
      fecha_partido: informe.fecha_partido || "",
      equipo_rival: informe.equipo_rival,
      contenido: informe.contenido
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Estás seguro de que quieres eliminar este informe?")) return;
    
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/informes-jornada/${id}/`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        }
      );

      if (!response.ok) throw new Error("Error al eliminar informe");
      
      toast.success("Informe eliminado");
      
      // Recargar informes
      const queryString = new URLSearchParams({
        categoria: categoria || "",
        subcategoria: subcategoria || "",
        equipo: equipo || ""
      }).toString();
      
      const refreshResponse = await fetch(
        `${import.meta.env.VITE_API_URL}/informes-jornada/?${queryString}`,
        {
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        }
      );
      
      if (refreshResponse.ok) {
        const data = await refreshResponse.json();
        setInformes(data);
      }
    } catch (error) {
      console.error("Error deleting informe:", error);
      toast.error("Error al eliminar informe");
    }
  };

  const handleCreate = () => {
    setEditingInforme(null);
    setFormData({ jornada: "", fecha_partido: "", equipo_rival: "", contenido: "" });
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingInforme(null);
    setFormData({ jornada: "", fecha_partido: "", equipo_rival: "", contenido: "" });
  };

  if (loading) {
    return (
      <Container className="mt-4">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="mt-2">Cargando informes...</p>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-4">
        <Alert variant="danger">
          <strong>Error:</strong> {error}
        </Alert>
        <Button onClick={() => navigate("/dashboard")} variant="secondary">
          ← Volver al Dashboard
        </Button>
      </Container>
    );
  }

  if (!categoria || !subcategoria || !equipo) {
    return (
      <Container className="mt-4">
        <Alert variant="warning">
          Faltan parámetros de URL. Debes acceder desde la página de jugadores.
        </Alert>
        <Button onClick={() => navigate("/dashboard")} variant="secondary">
          ← Volver al Dashboard
        </Button>
      </Container>
    );
  }

  if (!hasPermission) {
    return (
      <Container className="mt-4">
        <Alert variant="danger">
          <strong>Error:</strong> No tienes permisos para acceder a esta página.
        </Alert>
        <Button onClick={() => navigate("/dashboard")} variant="secondary">
          ← Volver al Dashboard
        </Button>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <Button
        variant="secondary"
        onClick={() => navigate(`/jugadores?categoria=${categoria}&subcategoria=${subcategoria}&equipo=${equipo}`)}
        className="mb-3"
      >
        ← Volver a Jugadores
      </Button>

      <h2>{getFormattedTitle()}</h2>

      {hasPermission && (
        <Button variant="danger" className="mb-3" onClick={handleCreate}>
          + Nuevo Informe de Jornada
        </Button>
      )}

      {/* Formulario Modal */}
      {showForm && hasPermission && (
        <Card className="mb-4">
          <Card.Header>
            <h5>{editingInforme ? "Editar Informe" : "Nuevo Informe de Jornada"}</h5>
          </Card.Header>
          <Card.Body>
            <Form onSubmit={handleSubmit}>
              <Row>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Jornada *</Form.Label>
                    <Form.Control
                      type="number"
                      min="1"
                      value={formData.jornada}
                      onChange={(e) => setFormData({...formData, jornada: e.target.value})}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Fecha del Partido *</Form.Label>
                    <Form.Control
                      type="date"
                      value={formData.fecha_partido}
                      onChange={(e) => setFormData({...formData, fecha_partido: e.target.value})}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Equipo Rival *</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.equipo_rival}
                      onChange={(e) => setFormData({...formData, equipo_rival: e.target.value})}
                      placeholder="Nombre del equipo rival"
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>
              
              <Form.Group className="mb-3">
                <Form.Label>Contenido del Informe *</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={8}
                  value={formData.contenido}
                  onChange={(e) => setFormData({...formData, contenido: e.target.value})}
                  placeholder="Escribe cada punto en una línea separada. Ejemplo:&#10;• El equipo jugó muy bien en la primera parte&#10;• Marcamos dos goles en el primer tiempo&#10;• En la segunda parte bajamos el ritmo&#10;• El rival marcó un gol en el minuto 75"
                  required
                />
                <Form.Text className="text-muted">
                  Escribe cada punto en una línea separada. El sistema automáticamente los convertirá en bulletpoints.
                </Form.Text>
              </Form.Group>

              <div className="d-flex gap-2">
                <Button type="submit" variant="primary">
                  {editingInforme ? "Actualizar" : "Crear"} Informe
                </Button>
                <Button type="button" variant="secondary" onClick={handleCancel}>
                  Cancelar
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>
      )}

      {/* Lista de Informes */}
      {informes.length === 0 ? (
        <Alert variant="info">
          No hay informes de jornada para esta categoría.
        </Alert>
      ) : (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Jornada</th>
              <th>Fecha Partido</th>
              <th>Equipo Rival</th>
              <th>Creado por</th>
              <th>Fecha Creación</th>
              {hasPermission && <th>Acciones</th>}
            </tr>
          </thead>
          <tbody>
            {informes.map((informe) => (
              <tr key={informe.id}>
                <td><strong>Jornada {informe.jornada}</strong></td>
                <td>
                  {informe.fecha_partido 
                    ? new Date(informe.fecha_partido).toLocaleDateString('es-ES')
                    : 'No especificada'
                  }
                </td>
                <td>{informe.equipo_rival}</td>
                <td>{informe.creado_por_nombre || 'Usuario'}</td>
                <td>{new Date(informe.fecha_creacion).toLocaleDateString('es-ES')}</td>
                {hasPermission && (
                  <td>
                    <div className="d-flex gap-1">
                      <Button
                        size="sm"
                        variant="outline-info"
                        onClick={() => handleViewDetail(informe)}
                        title="Ver detalle"
                      >
                        👁️
                      </Button>
                      <Button
                        size="sm"
                        variant="outline-primary"
                        onClick={() => handleEdit(informe)}
                      >
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline-danger"
                        onClick={() => handleDelete(informe.id)}
                      >
                        Eliminar
                      </Button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {/* Modal de Detalle */}
      <Modal show={showDetailModal} onHide={handleCloseDetailModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            Detalle de Jornada {selectedInforme?.jornada} - {getFormattedTitle().replace('Informes de Jornada: ', '')}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedInforme && (
            <div>
              <Row className="mb-3">
                <Col md={6}>
                  <strong>Jornada:</strong> {selectedInforme.jornada}
                </Col>
                <Col md={6}>
                  <strong>Fecha del Partido:</strong> {
                    selectedInforme.fecha_partido 
                      ? new Date(selectedInforme.fecha_partido).toLocaleDateString('es-ES')
                      : 'No especificada'
                  }
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md={6}>
                  <strong>Equipo Rival:</strong> {selectedInforme.equipo_rival}
                </Col>
                <Col md={6}>
                  <strong>Creado por:</strong> {selectedInforme.creado_por_nombre || 'Usuario'}
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md={6}>
                  <strong>Fecha de Creación:</strong> {new Date(selectedInforme.fecha_creacion).toLocaleDateString('es-ES')}
                </Col>
                <Col md={6}>
                  <strong>Última Actualización:</strong> {new Date(selectedInforme.fecha_actualizacion).toLocaleDateString('es-ES')}
                </Col>
              </Row>
              
              <hr />
              
              <div>
                <strong>Contenido del Informe:</strong>
                <div className="mt-2">
                  {formatContentToBulletpoints(selectedInforme.contenido).map((point, index) => (
                    <div key={index} style={{ marginBottom: "8px", paddingLeft: "20px" }}>
                      • {point}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseDetailModal}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}
