// hooks/useConfirm.js
import { useState } from 'react';
import ConfirmDialog from '../components/ConfirmDialog';

export function useConfirm() {
  const [options, setOptions] = useState(null);

  const confirm = ({ title, message }) =>
    new Promise((resolve) => {
      setOptions({
        open: true,
        title,
        message,
        onConfirm: () => {
          setOptions(null);
          resolve(true);
        },
        onCancel: () => {
          setOptions(null);
          resolve(false);
        },
      });
    });

  const ConfirmUI = options ? <ConfirmDialog {...options} /> : null;

  return { confirm, ConfirmUI };
}
