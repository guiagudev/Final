import { Navbar, Container, Nav, Dropdown } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import React from "react";
import logo from "../assets/images/fondo rcportuense.png"; // Cambia si es otro tipo de imagen

export default function AppHeader() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [groups, setGroups] = useState([]);

  useEffect(() => {
    const storedUser = JSON.parse(sessionStorage.getItem("user") || "{}");
    const storedGroups = JSON.parse(sessionStorage.getItem("userGroups") || "[]");
    setUsername(storedUser.username || "");
    setGroups(storedGroups);
  }, []);

  const handleLogout = () => {
    sessionStorage.clear();
    navigate("/");
  };

  const gruposPermitidos = ["admin", "coordinador"];
  const puedeVerLinks = groups.some((g) => gruposPermitidos.includes(g));

  return (
    <Navbar
      style={{ backgroundColor: "#610b1c" }}
      expand="lg"
      className="shadow-sm mb-4"
    >
      <Container fluid>
        <Navbar.Brand
          onClick={() => navigate("/dashboard")}
          style={{
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "1rem",
          }}
        >
          <img
            src={logo}
            alt="Logo Portuense"
            style={{ width: "50px", height: "50px" }}
          />
          <span
            style={{
              fontWeight: "bold",
              fontSize: "1.25rem",
              color: "white",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "black")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "white")}
          >
            Portuense Manager
          </span>
        </Navbar.Brand>

        <Nav className="me-auto">
          {puedeVerLinks && (
            <>
              <Nav.Link
                onClick={() => navigate("/direccion-deportiva")}
                style={{
                  color: "white",
                  fontWeight: "500",
                  fontSize: "1rem",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "black")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "white")}
              >
                Dirección Deportiva
              </Nav.Link>
              <Nav.Link
                onClick={() => navigate("/clubes-rivales")}
                style={{
                  color: "white",
                  fontWeight: "500",
                  fontSize: "1rem",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "black")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "white")}
              >
                Rivales
              </Nav.Link>
            </>
          )}
        </Nav>

        <Nav className="ms-auto">
          <Dropdown align="end">
            <Dropdown.Toggle
              variant="outline-secondary"
              id="dropdown-user"
              className="d-flex align-items-center gap-2"
            >
              <span role="img" aria-label="user">👤</span> {username}
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item onClick={handleLogout}>Cerrar sesión</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </Nav>
      </Container>
    </Navbar>
  );
}
