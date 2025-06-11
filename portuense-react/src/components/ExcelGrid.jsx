// src/components/ExcelGrid.jsx
import React, { useEffect, useState } from "react";
import { Table, Form, Button, Spinner } from "react-bootstrap";
import BackButton from "./BackButton";
import { useParams } from "react-router-dom";

export default function ExcelGrid() {
  const { categoria, equipo } = useParams();
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const token = sessionStorage.getItem("accessToken");

  const filas = 30;
  const columnas = ["A", "B", "C", "D", "E", "F", "H", "I", "J", "K", "L", "M", "N"];

  const makeKey = (categoria, equipo, fila, columna) =>
    `${categoria}-${equipo}-${fila}-${columna}`;

  useEffect(() => {
    if (categoria && equipo) {
      setLoading(true);
      fetch(`http://portuense-manager:8000/api/excel/?categoria=${categoria}&equipo=${equipo}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => res.json())
        .then((celdas) => {
          const structured = {};
          celdas.forEach((celda) => {
            const key = makeKey(categoria, equipo, celda.fila, celda.columna);
            structured[key] = { ...celda };
          });
          setData(structured);
        })
        .catch((err) => console.error("Error al cargar celdas:", err))
        .finally(() => setLoading(false));
    }
  }, [categoria, equipo, token]);

  const handleChange = (key, value) => {
    setData((prev) => ({
      ...prev,
      [key]: { ...prev[key], valor: value, changed: true },
    }));
  };

  const handleSaveAll = async () => {
    setSaving(true);
    const cambios = Object.entries(data).filter(([_, celda]) => celda.changed);

    try {
      for (const [key, celda] of cambios) {
        const [cat, eq, fila, columna] = key.split("-");
        const { id, changed, ...payload } = celda;
        payload.categoria = cat;
        payload.equipo = eq;
        payload.fila = parseInt(fila);
        payload.columna = columna;

        console.log(`➡️ Guardando celda ${key}:`, payload);

        const res = await fetch(
          id
            ? `http://portuense-manager:8000/api/excel/${id}/`
            : `http://portuense-manager:8000/api/excel/`,
          {
            method: id ? "PUT" : "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(payload),
          }
        );

        if (res.ok) {
          const updated = await res.json();
          const newKey = makeKey(cat, eq, updated.fila, updated.columna);
          setData((prev) => ({
            ...prev,
            [newKey]: updated,
          }));
        } else {
          const errorText = await res.text();
          console.error(`❌ Error al guardar celda ${key}:`, errorText);
        }
      }
    } catch (error) {
      console.error("🔥 Error guardando cambios:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-3">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <BackButton to="/direccion-deportiva/primer-equipo" />
        <h5 className="mb-0">
          Excel de categoría <strong>{categoria}</strong> - equipo <strong>{equipo}</strong>
        </h5>
        <Button variant="success" size="sm" onClick={handleSaveAll} disabled={saving}>
          {saving ? <Spinner animation="border" size="sm" /> : "Guardar todo"}
        </Button>
      </div>

      {loading ? (
        <div className="text-center">Cargando datos...</div>
      ) : (
        <div className="table-responsive">
          <Table bordered hover className="table-sm text-center">
            <thead className="table-light">
              <tr>
                <th>#</th>
                {columnas.map((col) => (
                  <th key={col}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: filas }, (_, i) => {
                const fila = i + 1;
                return (
                  <tr key={fila}>
                    <td><strong>{fila}</strong></td>
                    {columnas.map((col) => {
                      const key = makeKey(categoria, equipo, fila, col);
                      return (
                        <td key={key} style={{ padding: "4px" }}>
                          <Form.Control
                            type="text"
                            size="sm"
                            value={data[key]?.valor || ""}
                            onChange={(e) => handleChange(key, e.target.value)}
                            className="text-center"
                          />
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </div>
      )}
    </div>
  );
}
