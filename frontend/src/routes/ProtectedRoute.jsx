import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/Loader';

/** Garde de route : session obligatoire + controle des roles. */
export default function ProtectedRoute({ children, roles = [] }) {
  const { isAuthenticated, loading, hasRole } = useAuth();
  const location = useLocation();

  if (loading) return <Loader full label="Verification de la session..." />;
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  if (roles.length && !hasRole(...roles)) return <Navigate to="/403" replace />;
  return children;
}
