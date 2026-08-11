import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiGrid, FiBox, FiTag, FiAward, FiTruck, FiUsers, FiUserCheck, FiShield,
  FiLayers, FiShoppingCart, FiShoppingBag, FiCreditCard, FiBarChart2, FiSettings, FiX,
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { settingService } from '../services/business.service';
import { fileUrl } from '../utils/media';

const ALL = ['administrateur', 'gestionnaire', 'caissier', 'magasinier'];

export const MENU = [
  { section: 'Pilotage', items: [
    { to: '/', label: 'Tableau de bord', icon: FiGrid, roles: ALL },
    { to: '/rapports', label: 'Rapports', icon: FiBarChart2, roles: ['administrateur', 'gestionnaire'] },
  ]},
  { section: 'Catalogue', items: [
    { to: '/produits', label: 'Produits', icon: FiBox, roles: ALL },
    { to: '/categories', label: 'Categories', icon: FiTag, roles: ['administrateur', 'gestionnaire', 'magasinier'] },
    { to: '/marques', label: 'Marques', icon: FiAward, roles: ['administrateur', 'gestionnaire', 'magasinier'] },
    { to: '/stock', label: 'Stock', icon: FiLayers, roles: ['administrateur', 'gestionnaire', 'magasinier'] },
  ]},
  { section: 'Commercial', items: [
    { to: '/ventes', label: 'Ventes', icon: FiShoppingCart, roles: ALL },
    { to: '/achats', label: 'Achats', icon: FiShoppingBag, roles: ['administrateur', 'gestionnaire', 'magasinier'] },
    { to: '/paiements', label: 'Paiements', icon: FiCreditCard, roles: ['administrateur', 'gestionnaire', 'caissier'] },
    { to: '/clients', label: 'Clients', icon: FiUsers, roles: ALL },
    { to: '/fournisseurs', label: 'Fournisseurs', icon: FiTruck, roles: ['administrateur', 'gestionnaire', 'magasinier'] },
  ]},
  { section: 'Administration', items: [
    { to: '/employes', label: 'Employes', icon: FiUserCheck, roles: ['administrateur', 'gestionnaire'] },
    { to: '/utilisateurs', label: 'Utilisateurs', icon: FiShield, roles: ['administrateur'] },
    { to: '/parametres', label: 'Parametres', icon: FiSettings, roles: ['administrateur'] },
  ]},
];

/** Barre laterale retractable, filtree par role. */
export default function Sidebar({ open, collapsed, onClose }) {
  const { user } = useAuth();
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    settingService.get()
      .then(setSettings)
      .catch(() => {});
  }, []);

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-[2px] lg:hidden"
          onClick={onClose}
        />
      )}

      <motion.aside
        animate={{ width: collapsed ? 72 : 260 }}
        transition={{ duration: 0.22, ease: 'easeInOut' }}
        className={`fixed inset-y-0 left-0 z-40 flex flex-col
          border-r border-slate-200/80 bg-white
          dark:border-slate-800/80 dark:bg-[#111827]
          ${open ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 lg:translate-x-0`}
      >
        {/* Brand */}
        <div className="flex h-16 shrink-0 items-center justify-between gap-2 border-b border-slate-100 px-4 dark:border-slate-800/80">
          <div className="flex min-w-0 items-center gap-2.5 overflow-hidden">
            {settings?.logo ? (
              <img
                src={`${fileUrl(settings.logo)}?t=${Date.now()}`}
                alt="GigaTech logo"
                className="h-9 w-9 shrink-0 rounded-xl object-cover ring-1 ring-slate-200/80 dark:ring-slate-700"
              />
            ) : (
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand-600 text-sm font-bold text-white shadow-sm">
                GT
              </span>
            )}

            {!collapsed && (
              <div className="min-w-0 leading-tight">
                <p className="truncate text-sm font-bold text-slate-900 dark:text-white">
                  {settings?.entreprise || 'GigaTech'}
                </p>
                <p className="truncate text-[11px] font-medium text-slate-400">
                  Gestion commerciale
                </p>
              </div>
            )}
          </div>

          <button
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200 lg:hidden"
            onClick={onClose}
            aria-label="Fermer le menu"
          >
            <FiX className="h-4 w-4" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-4 scrollbar-thin">
          {MENU.map((group) => {
            const items = group.items.filter((i) => !user || i.roles.includes(user.role));
            if (!items.length) return null;

            return (
              <div key={group.section}>
                {!collapsed && (
                  <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-400 dark:text-slate-500">
                    {group.section}
                  </p>
                )}

                <div className="space-y-0.5">
                  {items.map(({ to, label, icon: Icon }) => (
                    <NavLink
                      key={to}
                      to={to}
                      end={to === '/'}
                      onClick={onClose}
                      className={({ isActive }) =>
                        `nav-link ${isActive ? 'nav-link-active' : ''} ${collapsed ? 'justify-center px-0' : ''}`
                      }
                      title={label}
                    >
                      <Icon className="h-[18px] w-[18px] shrink-0" />
                      {!collapsed && <span className="truncate">{label}</span>}
                    </NavLink>
                  ))}
                </div>
              </div>
            );
          })}
        </nav>

        {/* Footer hint */}
        {!collapsed && (
          <div className="shrink-0 border-t border-slate-100 px-4 py-3 dark:border-slate-800/80">
            <p className="text-[10px] text-slate-400 dark:text-slate-500">
              © {new Date().getFullYear()} GigaTech
            </p>
          </div>
        )}
      </motion.aside>
    </>
  );
}
