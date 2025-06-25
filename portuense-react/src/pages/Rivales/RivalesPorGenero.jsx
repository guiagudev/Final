// /src/pages/RivalesPorGenero.jsx
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Container, Spinner, Card, Row, Col } from "react-bootstrap";
import AppHeader from "../../components/AppHeader";

export default function RivalesPorGenero() {
  const { genero } = useParams(); // "M" o "F"
  const token = sessionStorage.getItem("accessToken");

  const [clubes, setClubes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/jugadores-rivales/?equipo=${genero}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((jugadores) => {
        const clubesMap = {};
        jugadores.forEach((j) => {
          if (!clubesMap[j.club.id]) {
            clubesMap[j.club.id] = j.club;
          }
        });
        setClubes(Object.values(clubesMap));
        setLoading(false);
      });
  }, [genero]);

  return (
    <>
      <AppHeader />
      <Container className="mt-4">
        <h3>Rivales {genero === "M" ? "Masculinos" : "Femeninos"}</h3>

        {loading ? (
          <Spinner animation="border" />
        ) : (
          <Row>
            {clubes.map((club) => (
              <Col md={4} key={club.id} className="mb-4">
                <Card>
                  <Card.Body>
                    <Card.Title>{club.nombre}</Card.Title>
                    <Card.Text>{club.ciudad}</Card.Text>
                    <Link to={`/clubes-rivales/${club.id}/jugadores/${genero}`} className="btn btn-primary">
                      Ver Jugadores
                    </Link>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Container>
    </>
  );
}
