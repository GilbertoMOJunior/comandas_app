import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RestrictedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return null;
  return !isAuthenticated ? children : <Navigate to="/home" replace />;
}
