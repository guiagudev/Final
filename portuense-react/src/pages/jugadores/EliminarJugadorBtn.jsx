import { getToken } from '../../utils/auth';
import React from 'react';


export const eliminarJugador = async (id, onDeleted) => {
    const confirmed = window.confirm("¿Seguro que quieres eliminar este jugador?");
    if(!confirmed) return;

    const response = await fetch(`http://portuense-manager.ddns.net:8000/api/jugadores/${id}/`, {
        method: 'DELETE',
        headers: {
            Authorization: `Bearer ${getToken()}`,
        },
    });
    if (response.ok) {
        onDeleted(id);
    } else {
        alert("Error al eliminar jugador");
    }
;
}