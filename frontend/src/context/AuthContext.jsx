import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { authService } from '../services/auth.service';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('gigatech_user');
    return raw ? JSON.parse(raw) : null;
  });
  const [loading, setLoading] = useState(Boolean(localStorage.getItem('gigatech_token')));

  // Revalide la session au chargement (le token peut avoir expire).
  useEffect(() => {
    if (!localStorage.getItem('gigatech_token')) return setLoading(false);
    authService.me()
      .then((u) => { setUser(u); localStorage.setItem('gigatech_user', JSON.stringify(u)); })
      .catch(() => { localStorage.removeItem('gigatech_token'); setUser(null); })
      .finally(() => setLoading(false));
  }, []);

  const login = async (credentials) => {
    const { token, user: u } = await authService.login(credentials);
    localStorage.setItem('gigatech_token', token);
    localStorage.setItem('gigatech_user', JSON.stringify(u));
    setUser(u);
    toast.success(`Bienvenue ${u.prenom || u.nom} !`);
    return u;
  };

  const logout = async () => {
    await authService.logout();
    localStorage.removeItem('gigatech_token');
    localStorage.removeItem('gigatech_user');
    setUser(null);
  };

  const value = useMemo(() => ({
    user, loading, login, logout, setUser,
    isAuthenticated: Boolean(user),
    hasRole: (...roles) => Boolean(user) && (roles.length === 0 || roles.includes(user.role)),
  }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
