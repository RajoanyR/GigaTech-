import { motion } from 'framer-motion';

/** En-tete de page : titre, sous-titre, actions. */
export default function PageHeader({ title, subtitle, icon: Icon, actions }) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28 }}
      className="mb-5 flex flex-wrap items-center justify-between gap-3"
    >
      <div className="flex items-center gap-3">
        {Icon && (
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-600 text-white shadow-sm">
            <Icon className="h-5 w-5" />
          </span>
        )}
        <div>
          <h1 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white sm:text-xl">{title}</h1>
          {subtitle && <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </motion.header>
  );
}
