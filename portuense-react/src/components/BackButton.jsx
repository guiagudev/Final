import { useNavigate } from 'react-router-dom';
import { Button } from 'react-bootstrap';
import React from 'react';
import '../assets/styles/BackButton.css';

export default function BackButton({ to = '/dashboard', label = '← Volver', size = 'sm' }) {
  const navigate = useNavigate();

  return (
    <div className="back-button-wrapper">
      <Button variant="outline-secondary" size={size} onClick={() => navigate(to)}>
        {label}
      </Button>
    </div>
  );
}
