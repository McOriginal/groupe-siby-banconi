import React from 'react';
import { Navigate } from 'react-router-dom';

const ConnectedUserRoute = ({ children }) => {
  const authUser = localStorage.getItem('authUser');
  const role = authUser ? JSON.parse(authUser)?.user?.role : null;

  if (role === 'admin') return <Navigate to='/dashboard' />;
  if (role === 'user') return <Navigate to='/dashboard-user' />;

  // Sinon (non connecté), accéder à la page publique (ex: login)
  return children;
};

export default ConnectedUserRoute;
