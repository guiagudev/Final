import { useEffect, useState, useCallback } from "react";
import { Modal, Table, Button, Form, Spinner } from "react-bootstrap";
import { getToken } from "../utils/auth";
import { useAuth } from "../hooks/useAuth";
import CrearUsuarioModal from "../components/CrearUsuarioModal";
import "../assets/styles/UserManager.css";
import PermisosModal from "../components/PermisosModal";

import React from "react";

const categorias = ["PREBEN", "BEN", "ALE", "INF", "CAD", "JUV", "SEN"];
const equipos = ["M", "F"];
const vistasDisponibles = ["direccion_deportiva", "rivales","calendario"];

export default function UserManager({ show, onClose }) {
  const { user } = useAuth();
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCrearModal, setShowCrearModal] = useState(false);
  const [showPermisosModal, setShowPermisosModal] = useState(false);
  const [usuarioActivo, setUsuarioActivo] = useState(null);

  const isAdmin = user?.groups?.includes("admin");

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
        setUsuarios(data);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (show && isAdmin) {
      fetchUsuarios();
    }
  }, [show, isAdmin, fetchUsuarios]);

  const handleUpdate = async (user) => {
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
          grupo: user.grupo,
          permisos: user.permisos,
          vistas: user.vistas,
          password: user.password || undefined,
        }),
      }
    );

    if (res.ok) {
      alert("Usuario actualizado");
      fetchUsuarios();
    } else {
      alert("Error al actualizar usuario");
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm("¿Estás seguro de que quieres eliminar este usuario?"))
      return;

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
      alert("Usuario eliminado");
      fetchUsuarios();
    } else {
      alert("Error al eliminar usuario");
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
                          user.grupo = e.target.value;
                          setUsuarios([...usuarios]);
                        }}
                      >
                        <option value="">Sin grupo</option>
                        <option value="admin">Admin</option>
                        <option value="coordinador">Coordinador</option>
                        <option value="entrenador">Entrenador</option>
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
                    </td>
                    <td>
                      <Form.Control
                        type="password"
                        placeholder="Nueva contraseña"
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
        />
      )}
    </Modal>
  );
}
