// src/hooks/useAuth.js
import { useEffect, useState } from 'react';

export function useAuth() {
  const [user, setUser] = useState({});
  const [userPermisos, setUserPermisos] = useState([]);

  useEffect(() => {
    const storedUser = JSON.parse(sessionStorage.getItem('user') || '{}');
    const storedPermisos = JSON.parse(sessionStorage.getItem('userPermisos') || '[]');

    setUser(storedUser);
    setUserPermisos(storedPermisos);
  }, []);

  const isInGroup = (groupName) => {
    return user.groups?.includes(groupName);
  };

  const hasPermiso = (categoria, equipo) => {
    return userPermisos.some(p => p.categoria === categoria && p.equipo === equipo);
  };

  return { user, isInGroup, hasPermiso, userPermisos };
}
