import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiAlertOctagon, FiLock, FiSearch } from 'react-icons/fi';

function ErrorShell({ code, title, message, icon: Icon }) {
  return (
    <div className="grid min-h-screen place-items-center bg-gradient-to-br from-slate-50 via-white to-brand-50/40 px-4 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="card card-pad max-w-md text-center sm:p-10">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-brand-500 to-violet-500 text-white shadow-sm">
          <Icon className="h-6 w-6" />
        </span>
        <h1 className="mt-5 text-5xl font-bold tracking-tight text-slate-900 dark:text-white">{code}</h1>
        <h2 className="mt-2 text-lg font-semibold">{title}</h2>
        <p className="mt-2 text-sm text-slate-500">{message}</p>
        <Link to="/" className="btn-primary mt-6 inline-flex">Retour au tableau de bord</Link>
      </motion.div>
    </div>
  );
}

export const NotFound = () => (
  <ErrorShell code="404" title="Page introuvable" icon={FiSearch}
    message="La page demandee n'existe pas ou a ete deplacee." />
);

export const ServerError = () => (
  <ErrorShell code="500" title="Erreur serveur" icon={FiAlertOctagon}
    message="Une erreur inattendue est survenue. Nos equipes ont ete notifiees." />
);

export const Forbidden = () => (
  <ErrorShell code="403" title="Acces refuse" icon={FiLock}
    message="Votre role ne vous autorise pas a consulter cette page." />
);
