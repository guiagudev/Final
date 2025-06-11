export const saveToken = (token, remember) => {
    const storage = remember ? localStorage : sessionStorage;
    storage.setItem('accessToken', token);
  };
  
  export const getToken = () => {
    return localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
  };
  
  export const clearToken = () => {
    localStorage.removeItem('accessToken');
    sessionStorage.removeItem('accessToken');
  };
  