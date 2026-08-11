import { useAuth } from '../context/AuthContext';

/** Affiche ses enfants uniquement si l'utilisateur possede un des roles. */
export default function RoleGate({ roles = [], children }) {
  const { hasRole } = useAuth();
  return hasRole(...roles) ? children : null;
}
