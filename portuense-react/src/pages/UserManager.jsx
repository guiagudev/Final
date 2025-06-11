import { useEffect, useState, useCallback } from "react";
import { Modal, Table, Button, Form, Row, Col, Spinner } from "react-bootstrap";
import { getToken } from "../utils/auth";
import { useAuth } from "../hooks/useAuth";
import CrearUsuarioModal from "../components/CrearUsuarioModal";
import React from "react";

const categorias = ["PREBEN", "BEN", "ALE", "INF", "CAD", "JUV", "SEN"];
const equipos = ["M", "F"];

export default function UserManager({ show, onClose }) {
  const { user } = useAuth();
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCrearModal, setShowCrearModal] = useState(false);

  const isAdmin = user?.groups?.includes("admin");

  const fetchUsuarios = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("http://portuense-manager:8000/api/usuarios/", {
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

  const togglePermiso = (cat, eq, user) => {
    const key = `${cat}-${eq}`;
    const permisos =
      user.permisos?.map((p) => `${p.categoria}-${p.equipo}`) || [];
    const updated = permisos.includes(key)
      ? permisos.filter((p) => p !== key)
      : [...permisos, key];

    user.permisos = updated.map((p) => {
      const [categoria, equipo] = p.split("-");
      return { categoria, equipo };
    });

    setUsuarios([...usuarios]);
  };

  const toggleAllPermisos = (user) => {
    const allKeys = categorias.flatMap((cat) =>
      equipos.map((eq) => `${cat}-${eq}`)
    );
    const currentKeys =
      user.permisos?.map((p) => `${p.categoria}-${p.equipo}`) || [];

    const isAllSelected = allKeys.every((k) => currentKeys.includes(k));

    user.permisos = isAllSelected
      ? []
      : allKeys.map((k) => {
          const [categoria, equipo] = k.split("-");
          return { categoria, equipo };
        });

    setUsuarios([...usuarios]);
  };

  const handleUpdate = async (user) => {
    const res = await fetch(
      `http://portuense-manager:8000/api/actualizar-usuario/${user.id}/`,
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

    const res = await fetch(`http://portuense-manager:8000/api/usuarios/${userId}/`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });

    if (res.ok) {
      alert("Usuario eliminado");
      fetchUsuarios();
    } else {
      alert("Error al eliminar usuario");
    }
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

            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>Usuario</th>
                  <th>Grupo</th> {/* ← Añadido */}
                  <th>Permisos</th>
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
                        {/* Añade aquí los que tengas en tu sistema */}
                      </Form.Select>
                    </td>
                    <td>
                      <div className="text-end mb-2">
                        <Button
                          size="sm"
                          variant="outline-secondary"
                          onClick={() => toggleAllPermisos(user)}
                        >
                          {user.permisos?.length ===
                          categorias.length * equipos.length
                            ? "Desmarcar todos"
                            : "Seleccionar todos"}
                        </Button>
                      </div>
                      <Row>
                        {categorias.map((cat) => (
                          <Col key={cat} md={6}>
                            <strong>{cat}</strong>
                            {equipos.map((eq) => {
                              const key = `${cat}-${eq}`;
                              const checked =
                                user.permisos?.some(
                                  (p) => p.categoria === cat && p.equipo === eq
                                ) || false;

                              return (
                                <Form.Check
                                  key={key}
                                  type="checkbox"
                                  label={eq}
                                  checked={checked}
                                  onChange={() => togglePermiso(cat, eq, user)}
                                />
                              );
                            })}
                          </Col>
                        ))}
                      </Row>
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
    </Modal>
  );
}
