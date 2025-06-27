import { Navbar, Container, Nav, Dropdown } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import React from "react";
import logo from "../assets/images/fondo rcportuense.png";

export default function AppHeader() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [vistas, setVistas] = useState([]);
  const [permisosRIV, setPermisosRIV] = useState({ M: false, F: false });

  useEffect(() => {
    const storedUser = JSON.parse(sessionStorage.getItem("user") || "{}");
    const storedVistas = JSON.parse(sessionStorage.getItem("userVistas") || "[]");
    const storedPermisos = JSON.parse(sessionStorage.getItem("userPermisos") || "[]");

    setUsername(storedUser.username || "");
    setVistas(storedVistas);

    const rivM = storedPermisos.some(p => p.categoria === "RIV" && p.equipo === "M");
    const rivF = storedPermisos.some(p => p.categoria === "RIV" && p.equipo === "F");
    setPermisosRIV({ M: rivM, F: rivF });
  }, []);

  const handleLogout = () => {
    sessionStorage.clear();
    navigate("/");
  };

  const puedeVer = (clave) => vistas.includes(clave);

  return (
    <Navbar style={{ backgroundColor: "#610b1c" }} expand="lg" className="shadow-sm mb-4">
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
          <img src={logo} alt="Logo Portuense" style={{ width: "50px", height: "50px" }} />
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
          {puedeVer("direccion-deportiva") && (
            <Nav.Link
              onClick={() => navigate("/direccion-deportiva")}
              style={{ color: "white", fontWeight: "500", fontSize: "1rem" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "black")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "white")}
            >
              Dirección Deportiva
            </Nav.Link>
          )}

          {puedeVer("rivales") && (permisosRIV.M || permisosRIV.F) && (
            <Dropdown as={Nav.Item}>
              <Dropdown.Toggle
                as={Nav.Link}
                style={{ color: "white", fontWeight: "500", fontSize: "1rem" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "black")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "white")}
              >
                Rivales
              </Dropdown.Toggle>
              <Dropdown.Menu>
                {permisosRIV.M && (
                  <Dropdown.Item onClick={() => navigate("/clubes-rivales/masculino")}>
                    Rivales Masculinos
                  </Dropdown.Item>
                )}
                {permisosRIV.F && (
                  <Dropdown.Item onClick={() => navigate("/clubes-rivales/femenino")}>
                    Rivales Femeninos
                  </Dropdown.Item>
                )}
              </Dropdown.Menu>
            </Dropdown>
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
