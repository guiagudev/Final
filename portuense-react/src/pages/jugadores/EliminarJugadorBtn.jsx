import { getToken } from "../../utils/auth";
import { toast } from "react-toastify";
import React from "react";

export const eliminarJugador = async (id, onDeleted) => {
  try {
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
      toast.success("Jugador eliminado correctamente");
    } else {
      toast.error("Error al eliminar el jugador");
    }
  } catch (error) {
    console.error("Error de red:", error);
    toast.error("Error de red al eliminar el jugador");
  }
};
