export const saveToken = (token, remember) => {
    const storage = remember ? localStorage : sessionStorage;
    storage.setItem('accessToken', token);
  };
  
  export const getToken = () => {
    // Buscar primero en sessionStorage, luego en localStorage
    return sessionStorage.getItem('accessToken') || localStorage.getItem('accessToken');
  };
  
  export const clearToken = () => {
    localStorage.removeItem('accessToken');
    sessionStorage.removeItem('accessToken');
  };
  