import React from 'react';
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Router from './router';

export default function App() {
  return (
    <>
      <Router />
      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
}
