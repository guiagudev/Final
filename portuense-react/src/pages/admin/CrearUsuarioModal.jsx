import { useState, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { getToken } from "../../utils/auth";
import React from 'react';

export default function CrearUsuarioModal({ show, onHide, onSuccess }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [groups, setGroups] = useState("");
  const [availableGroups, setAvailableGroups] = useState([]);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/groups/`, {
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        });
        const data = await response.json();
        setAvailableGroups(data);
      } catch (err) {
        console.error("Error al obtener grupos", err);
      }
    };
    fetchGroups();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await fetch(`${import.meta.env.VITE_API_URL}/usuarios/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({ username, password, groups }),
    });
    if (response.ok) {
      setUsername("");
      setPassword("");
      setGroups([]);
      onSuccess();
      onHide();
    } else {
      const err = await response.json();
      alert("Error al crear usuario: " + (err?.detail || "Desconocido"));
    }
  };

  const handleCheckboxChange = (groupName) => {
    setGroups((prev) =>
      prev.includes(groupName)
        ? prev.filter((g) => g !== groupName)
        : [...prev, groupName]
    );
  };

  return (
    <Modal show={show} onHide={onHide} >
      <Modal.Header closeButton>
        <Modal.Title>Crear nuevo usuario</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group classname="mb-3">
            <Form.Label>Nombre de usuario</Form.Label>
            <Form.Control
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            ></Form.Control>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Grupos</Form.Label>
            {availableGroups.map((group) => (
              <Form.Check
                key={group.name}
                type="checkbox"
                label={group.name}
                checked={groups.includes(group.name)}
                onChange={() => handleCheckboxChange(group.name)}
              />
            ))}
          </Form.Group>
          <Button variant="primary" type="submit">
            Crear Usuario
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
}
