import { useNavigate } from 'react-router-dom';
import { Button } from 'react-bootstrap';
import React from 'react';

export default function BackButton({ to = '/dashboard', label = '← Volver', size = 'sm' }) {
  const navigate = useNavigate();

  return (
    <Button variant="outline-secondary" size={size} onClick={() => navigate(to)}>
      {label}
    </Button>
  );
}
