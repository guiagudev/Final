// hooks/useConfirm.js
import { useState } from 'react';
import ConfirmDialog from '../components/ConfirmDialog.js';

console.log("✅ useConfirm hook cargado");
console.log("🧩 ConfirmDialog es:", ConfirmDialog);

export function useConfirm() {
  const [options, setOptions] = useState(null);

  const confirm = ({ title, message }) => {
    console.log("📨 confirm() llamado con:", { title, message });

    return new Promise((resolve) => {
      console.log("🧷 Seteando opciones...");
      setOptions({
        open: true,
        title,
        message,
        onConfirm: () => {
          console.log("✅ Confirmado");
          setOptions(null);
          resolve(true);
        },
        onCancel: () => {
          console.log("❌ Cancelado");
          setOptions(null);
          resolve(false);
        },
      });
    });
  };

  const ConfirmUI = options
    ? (() => {
        console.log("🎨 Renderizando ConfirmDialog con:", options);
        return <ConfirmDialog {...options} />;
      })()
    : null;

  return { confirm, ConfirmUI };
}
