import { Button } from 'react-bootstrap';
import React from 'react';

// import { useNavigate } from 'react-router-dom';
export default function JugadorRow({ jugador, onEdit, onDelete }) {
    // const navigate = useNavigate();
     const nombreCompleto = `${jugador.nombre} ${jugador.p_apellido || ''} ${jugador.s_apellido || ''}`;
       
    return (
    <tr
      style={{ cursor: 'pointer' }}
      onClick={() => (window.location.href = `/jugadores/${jugador.id}`)}
    >
            <td>{nombreCompleto}</td>
            <td>{jugador.posicion}</td>
            <td>{jugador.edad}</td>
            <td>{jugador.equipo}</td>
            <td>{jugador.categoria} - {jugador.subcategoria}</td>
            

            <td>
                <Button
          variant="warning"
          size="sm"
          className="me-2"
          onClick={(e) => {
            e.stopPropagation(); // ⛔ evita navegar
            onEdit(jugador);
          }}
        >
          Editar
        </Button>
                <Button
          variant="danger"
          size="sm"
          onClick={(e) => {
            e.stopPropagation(); // ⛔ evita navegar
            onDelete(jugador.id);
          }}
        >
          Eliminar
        </Button>
            </td>
        </tr>
    );
}