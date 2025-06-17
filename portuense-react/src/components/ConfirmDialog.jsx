// components/ConfirmDialog.jsx
import React from 'react';

export default function ConfirmDialog({ open, title, message, onConfirm, onCancel }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-xl font-semibold mb-4">{title}</h2>
        <p className="mb-6">{message}</p>
        <div className="flex justify-end gap-3">
          <button className="px-4 py-2 bg-gray-300 rounded" onClick={onCancel}>Cancelar</button>
          <button className="px-4 py-2 bg-red-500 text-white rounded" onClick={onConfirm}>Eliminar</button>
        </div>
      </div>
    </div>
  );
}
