import React from 'react';
import { useState, useCallback } from 'react';
import { toast } from 'react-toastify';

export const useUndoDelete = () => {
  const [deletedItems, setDeletedItems] = useState(new Map());

  const deleteItem = useCallback(async (
    itemId, 
    deleteFunction, 
    restoreFunction, 
    itemType = 'elemento',
    customMessage = null
  ) => {
    try {
      // Ejecutar la función de eliminación
      await deleteFunction();
      
      // Generar mensaje personalizado con capitalización
      const message = customMessage || `${itemType.charAt(0).toUpperCase() + itemType.slice(1)} eliminado correctamente`;
      
      // Crear toast con botón de deshacer
      const toastId = toast.success(
        <div>
          <div>{message}</div>
          <button
            onClick={() => restoreItem(itemId, restoreFunction, itemType)}
            style={{
              background: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              padding: '4px 8px',
              fontSize: '12px',
              cursor: 'pointer',
              marginTop: '8px'
            }}
          >
            Deshacer
          </button>
        </div>,
        {
          autoClose: 5000,
          closeOnClick: false,
          pauseOnHover: true,
          draggable: true,
        }
      );

      // Guardar la información del item eliminado para poder restaurarlo
      setDeletedItems(prev => new Map(prev).set(itemId, {
        toastId,
        restoreFunction,
        itemType,
        timestamp: Date.now()
      }));

      return true;
    } catch (error) {
      console.error('Error al eliminar:', error);
      toast.error(`Error al eliminar ${itemType}`);
      return false;
    }
  }, []);

  const restoreItem = useCallback(async (itemId, restoreFunction, itemType) => {
    try {
      // Ejecutar la función de restauración
      await restoreFunction();
      
      // Cerrar el toast
      const deletedItem = deletedItems.get(itemId);
      if (deletedItem?.toastId) {
        toast.dismiss(deletedItem.toastId);
      }
      
      // Mostrar mensaje de restauración exitosa con capitalización
      toast.success(`${itemType.charAt(0).toUpperCase() + itemType.slice(1)} restaurado correctamente`);
      
      // Remover del estado de items eliminados
      setDeletedItems(prev => {
        const newMap = new Map(prev);
        newMap.delete(itemId);
        return newMap;
      });
      
    } catch (error) {
      console.error('Error al restaurar:', error);
      toast.error(`Error al restaurar ${itemType}`);
    }
  }, [deletedItems]);

  const clearDeletedItems = useCallback(() => {
    setDeletedItems(new Map());
  }, []);

  return {
    deleteItem,
    restoreItem,
    clearDeletedItems,
    deletedItems
  };
};
