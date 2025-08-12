import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Button, Modal, Form } from 'react-bootstrap';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getToken } from '../utils/auth';
import AppHeader from '../components/AppHeader';
import BackButton from '../components/BackButton';
import { Plus, Calendar, Save, X } from 'lucide-react';
import '../assets/styles/calendario-entrenamientos.css';

export default function CalendarioEntrenamientos() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [showEntrenamientoModal, setShowEntrenamientoModal] = useState(false);
  const [selectedEntrenamiento, setSelectedEntrenamiento] = useState(null);
  const [entrenamientos, setEntrenamientos] = useState([]);
  const [formData, setFormData] = useState({
    fecha: '',
    tipo: '',
    descripcion: ''
  });
  
  const categoria = searchParams.get('categoria');
  const equipo = searchParams.get('equipo');

  // Cargar entrenamientos desde el backend
  const fetchEntrenamientos = useCallback(async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/entrenamientos/?categoria=${categoria}&equipo=${equipo}`,
        {
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        setEntrenamientos(data);
      }
    } catch (error) {
      console.error('Error fetching entrenamientos:', error);
    }
  }, [categoria, equipo]);

  useEffect(() => {
    console.log('CalendarioEntrenamientos mounted');
    console.log('Categoria:', categoria);
    console.log('Equipo:', equipo);
    
    // Solo permitir acceso para categoría SEN
    if (categoria !== 'SEN') {
      navigate('/jugadores');
      return;
    }
    
    // Cargar entrenamientos
    console.log('Iniciando carga de entrenamientos...');
    fetchEntrenamientos();
  }, [categoria, navigate, fetchEntrenamientos]);

  const handleDateClick = (date) => {
    setFormData({
      ...formData,
      fecha: date
    });
    setShowModal(true);
  };

  const handleEntrenamientoClick = (entrenamiento, e) => {
    e.stopPropagation();
    setSelectedEntrenamiento(entrenamiento);
    setShowEntrenamientoModal(true);
  };

  const handleDeleteEntrenamiento = async () => {
    if (!selectedEntrenamiento) return;
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/entrenamientos/${selectedEntrenamiento.id}/`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });

      if (response.ok) {
        toast.success('Entrenamiento eliminado correctamente');
        setShowEntrenamientoModal(false);
        setSelectedEntrenamiento(null);
        // Recargar entrenamientos después de eliminar
        fetchEntrenamientos();
      } else {
        toast.error('Error al eliminar el entrenamiento');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error de conexión');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.tipo) {
      toast.error('Por favor escribe un tipo de entrenamiento');
      return;
    }
    
    if (!formData.fecha) {
      toast.error('Por favor selecciona una fecha');
      return;
    }
    
    console.log('Enviando datos:', {
      ...formData,
      fecha: formData.fecha,
      categoria: categoria,
      equipo: equipo
    });
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/entrenamientos/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          ...formData,
          fecha: formData.fecha,
          categoria: categoria,
          equipo: equipo
        }),
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (response.ok) {
        toast.success('Entrenamiento creado correctamente');
        setShowModal(false);
        setFormData({
          fecha: '',
          tipo: '',
          descripcion: ''
        });
        // Recargar entrenamientos después de crear uno nuevo
        fetchEntrenamientos();
      } else {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        toast.error(`Error al crear entrenamiento: ${errorData.detail || errorData.non_field_errors || 'Error desconocido'}`);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error de conexión');
    }
  };

  // Generar fechas para el mes actual
  const generateCalendarDays = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    
    const days = [];
    
    // Días vacíos al inicio
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    
    // Días del mes
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateString = date.toISOString().split('T')[0];
      
      // Filtrar entrenamientos para este día
      const entrenamientosDelDia = entrenamientos.filter(entrenamiento => entrenamiento.fecha === dateString);
      
      days.push({
        date: dateString,
        day: day,
        entrenamientos: entrenamientosDelDia
      });
    }
    
    return days;
  };

  const calendarDays = generateCalendarDays();

  // Solo mostrar para primer equipo (SEN)
  if (categoria !== 'SEN') {
    return null;
  }

  return (
    <>
      <AppHeader />
      <Container className="mt-4">
        <BackButton 
          to={`/jugadores?categoria=${categoria}&subcategoria=A&equipo=${equipo}`} 
          label="←" 
        />
        <h2 className="mb-4 text-center">
          Calendario de Entrenamientos - {equipo === 'M' ? 'Masculino' : 'Femenino'}
        </h2>

        <Row className="justify-content-center">
          <Col md={10}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <h3 className="mb-0">Calendario del Mes</h3>
                <small className="text-muted">
                  Haz clic en cualquier día para crear un entrenamiento o usa el botón de arriba
                </small>
              </div>
              <Button 
                variant="success" 
                onClick={() => setShowModal(true)}
              >
                <Plus className="me-2" size={16} />
                Crear Entrenamiento
              </Button>
            </div>
            
            <Card>
              <Card.Body>
                <div className="calendar-grid">
                  {/* Días de la semana */}
                  <div className="calendar-header">
                    {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
                      <div key={day} className="calendar-day-header">{day}</div>
                    ))}
                  </div>
                  
                  {/* Días del mes */}
                  <div className="calendar-days">
                    {calendarDays.map((day, index) => (
                      <div
                        key={index}
                        className={`calendar-day ${day ? 'has-date' : 'empty'}`}
                        onClick={() => day && handleDateClick(day.date)}
                      >
                        {day && (
                          <>
                            <div className="day-number">{day.day}</div>
                            {day.entrenamientos.length > 0 && (
                              <div className="entrenamientos-container">
                                {day.entrenamientos.map((entrenamiento, idx) => (
                                  <div
                                    key={idx}
                                    className="entrenamiento-badge"
                                    style={{
                                      backgroundColor: '#007bff',
                                      color: 'white',
                                      fontSize: '0.7rem',
                                      padding: '2px 4px',
                                      margin: '1px 0',
                                      borderRadius: '3px',
                                      cursor: 'pointer'
                                    }}
                                    onClick={(e) => handleEntrenamientoClick(entrenamiento, e)}
                                  >
                                    {entrenamiento.tipo}
                                  </div>
                                ))}
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Modal para crear entrenamiento */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            <Calendar className="me-2" size={20} />
            Crear Entrenamiento
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form id="entrenamientoForm">
            <Form.Group className="mb-3">
              <Form.Label><strong>Fecha</strong></Form.Label>
              <Form.Control
                type="date"
                value={formData.fecha}
                onChange={(e) => setFormData({...formData, fecha: e.target.value})}
                required
              />
              <Form.Text className="text-muted">
                Selecciona la fecha para el entrenamiento
              </Form.Text>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label><strong>Tipo de Entrenamiento</strong></Form.Label>
              <Form.Control
                type="text"
                value={formData.tipo}
                onChange={(e) => setFormData({...formData, tipo: e.target.value})}
                placeholder="Ej: Balón parado, Recuperación, Físico, Táctico..."
                required
              />
              <Form.Text className="text-muted">
                Escribe el tipo de entrenamiento que quieres crear
              </Form.Text>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label><strong>Descripción (Opcional)</strong></Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={formData.descripcion}
                onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                placeholder="Describe los detalles del entrenamiento, ejercicios específicos, objetivos, etc..."
              />
              <Form.Text className="text-muted">
                Puedes agregar detalles adicionales sobre el entrenamiento
              </Form.Text>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            <X className="me-2" size={16} />
            Cancelar
          </Button>
          <Button variant="success" onClick={handleSubmit}>
            <Save className="me-2" size={16} />
            Crear Entrenamiento
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal para ver/eliminar entrenamiento */}
      <Modal show={showEntrenamientoModal} onHide={() => setShowEntrenamientoModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            <Calendar className="me-2" size={20} />
            Detalles del Entrenamiento
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedEntrenamiento && (
            <div>
              <div className="mb-3">
                <strong>Fecha:</strong> {new Date(selectedEntrenamiento.fecha).toLocaleDateString('es-ES')}
              </div>
              <div className="mb-3">
                <strong>Tipo:</strong> {selectedEntrenamiento.tipo}
              </div>
              {selectedEntrenamiento.descripcion && (
                <div className="mb-3">
                  <strong>Descripción:</strong>
                  <p className="mt-1">{selectedEntrenamiento.descripcion}</p>
                </div>
              )}
              <div className="mb-3">
                <strong>Categoría:</strong> {selectedEntrenamiento.categoria_nombre || selectedEntrenamiento.categoria}
              </div>
              <div className="mb-3">
                <strong>Equipo:</strong> {selectedEntrenamiento.equipo_nombre || (selectedEntrenamiento.equipo === 'M' ? 'Masculino' : 'Femenino')}
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEntrenamientoModal(false)}>
            <X className="me-2" size={16} />
            Cerrar
          </Button>
          <Button variant="danger" onClick={handleDeleteEntrenamiento}>
            <X className="me-2" size={16} />
            Eliminar Entrenamiento
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
