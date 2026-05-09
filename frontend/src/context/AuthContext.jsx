import { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import { tokenStorage, setUnauthorizedHandler } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const isAuthenticated = !!usuario;

  const carregarUsuario = useCallback(async () => {
    if (!tokenStorage.getAccess()) {
      setUsuario(null);
      setLoading(false);
      return;
    }
    try {
      const me = await authService.me();
      setUsuario(me);
    } catch {
      tokenStorage.clear();
      setUsuario(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregarUsuario();
  }, [carregarUsuario]);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      setUsuario(null);
      navigate('/login', { replace: true });
    });
  }, [navigate]);

  const login = async (cpf, senha) => {
    await authService.login(cpf, senha);
    const me = await authService.me();
    setUsuario(me);
    navigate('/home');
  };

  const logout = async () => {
    await authService.logout();
    setUsuario(null);
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, usuario, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
