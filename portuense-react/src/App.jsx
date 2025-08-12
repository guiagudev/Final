import React from 'react';
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { UserProvider } from './context/UserContext';

import Router from './router';

export default function App() {
  return (
    <UserProvider>
      <Router />
      <ToastContainer position="top-right" autoClose={3000} />
    </UserProvider>
  );
}
