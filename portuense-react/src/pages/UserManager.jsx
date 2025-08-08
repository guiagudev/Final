import { useEffect, useState, useCallback } from "react";
import { Modal, Table, Button, Form, Spinner } from "react-bootstrap";
import { getToken } from "../utils/auth";
import { useAuth } from "../hooks/useAuth";
import CrearUsuarioModal from "../components/CrearUsuarioModal";
import PermisosModal from "../components/PermisosModal";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import React from "react";
import "../assets/styles/UserManager.css";

const vistasDisponibles = ["direccion-deportiva","calendario"];
const vistaCondicional = "DD-comentarios";

export default function UserManager({ show, onClose }) {
  const { user } = useAuth();
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCrearModal, setShowCrearModal] = useState(false);
  const [showPermisosModal, setShowPermisosModal] = useState(false);
  const [usuarioActivo, setUsuarioActivo] = useState(null);
  const [subcategorias, setSubcategorias] = useState([]);

  const isAdmin = user?.groups?.includes("admin");

  const fetchSubcategorias = useCallback(async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/subcategorias/`, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setSubcategorias(data);
      }
    } catch (error) {
      console.error("Error al cargar subcategorías:", error);
    }
  }, []);

  const fetchUsuarios = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/usuarios/`, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setUsuarios(
          data.map((u) => ({
            ...u,
            grupo: u.groups?.[0] || "",     // extrae el primer grupo para el select
            vistas: u.vistas || [],         // asegura que no sea undefined
            permisos: u.permisos || [],     // asegura que no sea undefined
            password: ""                    // permite editar desde el frontend
          }))
        );
      } else {
        toast.error("Error al obtener usuarios");
      }
    } catch (error) {
      toast.error("Error de red al cargar usuarios");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (show && isAdmin) {
      fetchUsuarios();
      fetchSubcategorias();
    }
  }, [show, isAdmin, fetchUsuarios, fetchSubcategorias]);

  const handleUpdate = async (user) => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/actualizar-usuario/${user.id}/`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
          },
          body: JSON.stringify({
            username: user.username,
            groups: user.grupo ? [user.grupo] : [], // Enviar como array
            permisos: user.permisos,
            vistas: user.vistas,
            password: user.password || undefined,
          }),
        }
      );

      if (res.ok) {
        toast.success("Usuario actualizado");
        fetchUsuarios();
      } else {
        toast.error("Error al actualizar usuario");
      }
    } catch {
      toast.error("Error de red al actualizar usuario");
    }
  };

  const handleDelete = async (userId) => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/usuarios/${userId}/`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        }
      );

      if (res.ok) {
        toast.success("Usuario eliminado");
        fetchUsuarios();
      } else {
        toast.error("Error al eliminar usuario");
      }
    } catch {
      toast.error("Error de red al eliminar usuario");
    }
  };

  const toggleVista = (user, vista) => {
    const vistas = user.vistas || [];
    const updated = vistas.includes(vista)
      ? vistas.filter((v) => v !== vista)
      : [...vistas, vista];

    user.vistas = updated;
    setUsuarios([...usuarios]);
  };

  // Función para obtener subcategorías disponibles para una categoría y equipo específicos
  const getSubcategoriasDisponibles = (categoria, equipo) => {
    return subcategorias.filter(
      (sub) => sub.categoria === categoria && sub.equipo === equipo && sub.activa
    ).map(sub => sub.codigo);
  };

  if (!isAdmin) return null;

  return (
    <Modal show={show} onHide={onClose} size="xl" backdrop="static" fullscreen>
      <Modal.Header closeButton>
        <Modal.Title>Gestión de Usuarios</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {loading ? (
          <div className="text-center">
            <Spinner animation="border" />
          </div>
        ) : (
          <>
            <div className="d-flex justify-content-end mb-3">
              <Button variant="primary" onClick={() => setShowCrearModal(true)}>
                Crear nuevo usuario
              </Button>
            </div>

            <Table striped bordered hover responsive className="dark-table">
              <thead>
                <tr>
                  <th>Usuario</th>
                  <th>Grupo</th>
                  <th>Permisos</th>
                  <th>Vistas</th>
                  <th>Contraseña</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map((user) => (
                  <tr key={user.id}>
                    <td>{user.username}</td>
                    <td>
                      <Form.Select
                        size="sm"
                        value={user.grupo || ""}
                        onChange={(e) => {
                          user.groups = e.target.value;
                          user.grupo = e.target.value; // Sincroniza el valor mostrado
                          setUsuarios([...usuarios]);
                        }}
                      >
                        <option value="">Sin grupo</option>
                        <option value="admin">Administrador</option>
                        <option value="usuario">Usuario</option>
                      </Form.Select>
                    </td>
                    <td>
                      <Button
                        size="sm"
                        variant="outline-primary"
                        onClick={() => {
                          setUsuarioActivo(user);
                          setShowPermisosModal(true);
                        }}
                      >
                        Gestionar permisos
                      </Button>
                    </td>
                    <td>
                      {vistasDisponibles.map((vista) => (
                        <Form.Check
                          key={vista}
                          type="checkbox"
                          label={vista.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                          checked={user.vistas?.includes(vista) || false}
                          onChange={() => toggleVista(user, vista)}
                          className="small"
                        />
                      ))}
                      {/* Checkbox condicional: solo si 'direccion-deportiva' está marcada */}
                      {user.vistas?.includes("direccion-deportiva") && (
                        <Form.Check
                          key={vistaCondicional}
                          type="checkbox"
                          label={vistaCondicional.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                          checked={user.vistas?.includes(vistaCondicional) || false}
                          onChange={() => toggleVista(user, vistaCondicional)}
                          className="small"
                        />
                      )}
                    </td>
                    <td>
                      <Form.Control
                        type="password"
                        placeholder="••••••••••••••••"
                        onChange={(e) => {
                          user.password = e.target.value;
                        }}
                      />
                    </td>
                    <td>
                      <Button
                        size="sm"
                        variant="success"
                        onClick={() => handleUpdate(user)}
                        className="me-2"
                      >
                        Guardar
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleDelete(user.id)}
                      >
                        Eliminar
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Cerrar
        </Button>
      </Modal.Footer>

      <CrearUsuarioModal
        show={showCrearModal}
        onClose={(shouldReload) => {
          setShowCrearModal(false);
          if (shouldReload) fetchUsuarios();
        }}
      />

      {usuarioActivo && (
        <PermisosModal
          show={showPermisosModal}
          user={usuarioActivo}
          onClose={() => setShowPermisosModal(false)}
          onPermisosUpdate={(newPermisos) => {
            usuarioActivo.permisos = newPermisos;
            setUsuarios([...usuarios]);
          }}
          subcategorias={subcategorias}
          getSubcategoriasDisponibles={getSubcategoriasDisponibles}
        />
      )}
    </Modal>
  );
}
