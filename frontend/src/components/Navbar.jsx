import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiBell, FiChevronDown, FiLogOut, FiMenu, FiSidebar, FiUser } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { stockService } from '../services/business.service';
import useFetch from '../hooks/useFetch';
import ThemeToggle from './ThemeToggle';
import { roleLabel } from '../utils/format';
import { fileUrl } from '../utils/media';

/** Barre de navigation superieure : menu, alertes stock, profil, theme. */
export default function Navbar({ onToggleSidebar, onCollapse }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [openMenu, setOpenMenu] = useState(false);
  const [openAlerts, setOpenAlerts] = useState(false);
  const { data: alerts } = useFetch(() => stockService.alerts(), [], []);

  const handleLogout = async () => {
    await logout();
    toast.info('Vous etes deconnecte');
    navigate('/login', { replace: true });
  };

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center justify-between gap-3
                       border-b border-slate-200/70 bg-white/90 px-4 backdrop-blur-md
                       dark:border-slate-800/80 dark:bg-[#111827]/90 sm:px-6">
      <div className="flex items-center gap-1.5">
        <button
          className="btn-ghost px-2.5 py-2 lg:hidden"
          onClick={onToggleSidebar}
          aria-label="Ouvrir le menu"
        >
          <FiMenu className="h-4 w-4" />
        </button>
        <button
          className="btn-ghost hidden px-2.5 py-2 lg:inline-flex"
          onClick={onCollapse}
          aria-label="Replier la barre laterale"
        >
          <FiSidebar className="h-4 w-4" />
        </button>
      </div>

      <div className="flex items-center gap-2">
        {/* Alertes stock */}
        <div className="relative">
          <button
            className="btn-ghost relative px-2.5 py-2"
            onClick={() => { setOpenAlerts((v) => !v); setOpenMenu(false); }}
            aria-label="Alertes de stock"
          >
            <FiBell className="h-4 w-4" />
            {alerts?.length > 0 && (
              <span className="absolute -right-0.5 -top-0.5 grid h-4.5 min-w-[18px] place-items-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
                {alerts.length}
              </span>
            )}
          </button>
          {openAlerts && (
            <div className="dropdown-panel w-80">
              <p className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Alertes de stock
              </p>
              <div className="max-h-72 overflow-y-auto">
                {alerts?.length ? alerts.map((a) => (
                  <Link
                    key={a.id}
                    to="/stock"
                    onClick={() => setOpenAlerts(false)}
                    className="flex items-center justify-between rounded-lg px-3 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                  >
                    <span className="truncate text-sm text-slate-700 dark:text-slate-200">{a.nom}</span>
                    <span className={a.niveau === 'rupture' ? 'badge-red' : 'badge-amber'}>{a.quantite}</span>
                  </Link>
                )) : (
                  <p className="px-3 py-5 text-center text-sm text-slate-500">Aucune alerte, tout va bien.</p>
                )}
              </div>
            </div>
          )}
        </div>

        <ThemeToggle />

        {/* Profil */}
        <div className="relative">
          <button
            className="btn-ghost gap-2 px-2 py-1.5"
            onClick={() => { setOpenMenu((v) => !v); setOpenAlerts(false); }}
          >
            {user?.avatar ? (
              <img src={fileUrl(user.avatar)} alt="Photo de profil" className="h-7 w-7 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700" />
            ) : (
              <span className="grid h-7 w-7 place-items-center rounded-full bg-brand-600 text-[11px] font-bold text-white">
                {(user?.prenom?.[0] || user?.nom?.[0] || 'U').toUpperCase()}
              </span>
            )}
            <span className="hidden text-left sm:block">
              <span className="block text-sm font-semibold leading-tight text-slate-800 dark:text-slate-100">
                {user?.prenom || user?.nom}
              </span>
              <span className="block text-[11px] text-slate-400">
                {roleLabel[user?.role] || user?.role}
              </span>
            </span>
            <FiChevronDown className="hidden h-3.5 w-3.5 text-slate-400 sm:block" />
          </button>
          {openMenu && (
            <div className="dropdown-panel w-52">
              <Link to="/profil" onClick={() => setOpenMenu(false)} className="nav-link">
                <FiUser className="h-4 w-4" /> Mon profil
              </Link>
              <button
                onClick={handleLogout}
                className="nav-link w-full text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-500/10"
              >
                <FiLogOut className="h-4 w-4" /> Se deconnecter
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
