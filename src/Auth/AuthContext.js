import React, { createContext, useState } from 'react';
import jwtDecode from 'jwt-decode';
import { useNavigate } from 'react-router-dom';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(() => {
    const user = localStorage.getItem('authUser');
    return user ? JSON.parse(user) : null;
  });

  // State de navigation
  const navigate = useNavigate();

  const login = (data) => {
    localStorage.setItem('authUser', JSON.stringify(data));
    setAuth(data);
  };

  const logout = () => {
    localStorage.removeItem('authUser');
    setAuth(null);
    navigate('/login'); // Redirection vers la page de connexion
  };

  const getRole = () => {
    return auth?.user?.role || null;
  };

  return (
    <AuthContext.Provider value={{ auth, login, logout, getRole }}>
      {children}
    </AuthContext.Provider>
  );
};
