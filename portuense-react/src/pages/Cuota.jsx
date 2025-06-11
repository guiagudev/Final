import React, { useEffect, useState } from 'react';

export default function PaginaCuotas() {
  const [jugadores, setJugadores] = useState([]);

  useEffect(() => {
    const token = sessionStorage.getItem('token');
    fetch('/api/jugadores/cuota-pendiente/', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(res => res.json())
      .then(data => setJugadores(data))
      .catch(err => console.error('Error cargando cuotas:', err));
  }, []);

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Jugadores con cuota pendiente</h2>
      {jugadores.length === 0 ? (
        <p>Todos han pagado 💸</p>
      ) : (
        <table className="table table-striped">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Equipo</th>
              <th>Categoría</th>
              <th>Edad</th>
            </tr>
          </thead>
          <tbody>
            {jugadores.map(j => (
              <tr key={j.id}>
                <td>{j.nombre} {j.p_apellido} {j.s_apellido}</td>
                <td>{j.equipo}</td>
                <td>{j.categoria}</td>
                <td>{j.edad}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
