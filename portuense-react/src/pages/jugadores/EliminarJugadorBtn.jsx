import { getToken } from "../../utils/auth";
import React from "react";
import { useConfirm } from "../../hooks/useConfirm";

export const eliminarJugador = async (id, onDeleted, confirm) => {
  const confirmed = await confirm({
    title: "¿Eliminar jugador?",
    message: "¿Seguro que quieres eliminar este jugador?",
  });
  if (!confirmed) return;

  

  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/jugadores/${id}/`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    }
  );
  if (response.ok) {
    onDeleted(id);
  } else {
    alert("Error al eliminar jugador");
  }
};
