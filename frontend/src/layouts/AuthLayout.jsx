import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiCheckCircle, FiBox, FiBarChart2, FiShield } from 'react-icons/fi';

/** Layout des ecrans publics (connexion, mot de passe oublie). */
export default function AuthLayout() {
  const points = [
    { icon: FiBox, text: 'Gestion complete du stock et inventaire' },
    { icon: FiBarChart2, text: 'Rapports et statistiques en temps reel' },
    { icon: FiShield, text: 'Facturation professionnelle securisee' },
  ];

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Panneau gauche */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-grad-auth p-10 text-white xl:p-12 lg:flex">
        <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-blue-400/20 blur-3xl" />
        <div className="pointer-events-none absolute right-1/3 top-1/2 h-48 w-48 rounded-full bg-indigo-400/15 blur-2xl" />

        <div className="relative flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-white/20 text-base font-bold shadow-lg backdrop-blur-sm ring-1 ring-white/20">
            GT
          </span>
          <div>
            <span className="block text-lg font-bold tracking-tight">GigaTech</span>
            <span className="block text-xs text-white/70">ERP Commercial</span>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative"
        >
          <h2 className="max-w-md text-[1.75rem] font-bold leading-snug tracking-tight">
            Le logiciel de gestion des professionnels du materiel informatique.
          </h2>
          <p className="mt-3 max-w-sm text-sm text-white/75 leading-relaxed">
            Pilotez vos ventes, achats, stock et equipes depuis une interface unique et moderne.
          </p>
          <ul className="mt-8 space-y-3.5">
            {points.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-sm font-medium text-white/90">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-white/15 ring-1 ring-white/10">
                  <Icon className="h-4 w-4" />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </motion.div>

        <p className="relative text-xs text-white/50">
          © {new Date().getFullYear()} GigaTech — Tous droits reserves.
        </p>
      </div>

      {/* Panneau droit formulaire */}
      <div className="flex items-center justify-center bg-[#F8FAFC] p-5 dark:bg-[#080F1C] sm:p-8">
        <div className="w-full max-w-[420px]">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
