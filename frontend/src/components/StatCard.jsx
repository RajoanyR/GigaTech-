import { motion } from 'framer-motion';

const tones = {
  blue: {
    card: 'bg-gradient-to-br from-brand-500 to-brand-700',
    icon: 'bg-white/20 text-white',
  },
  green: {
    card: 'bg-gradient-to-br from-emerald-500 to-teal-600',
    icon: 'bg-white/20 text-white',
  },
  amber: {
    card: 'bg-gradient-to-br from-amber-400 to-orange-500',
    icon: 'bg-white/20 text-white',
  },
  red: {
    card: 'bg-gradient-to-br from-rose-500 to-pink-600',
    icon: 'bg-white/20 text-white',
  },
  slate: {
    card: 'bg-gradient-to-br from-slate-600 to-slate-800',
    icon: 'bg-white/20 text-white',
  },
  violet: {
    card: 'bg-gradient-to-br from-violet-500 to-indigo-600',
    icon: 'bg-white/20 text-white',
  },
};

/** Carte statistique premium du tableau de bord. */
export default function StatCard({ label, value, hint, icon: Icon, tone = 'blue', index = 0 }) {
  const t = tones[tone] || tones.blue;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.3 }}
      whileHover={{ y: -3 }}
      className={`card-gradient ${t.card} p-4 sm:p-5 shadow-float`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-white/75">{label}</p>
          <p className="mt-1.5 truncate text-xl font-bold tracking-tight text-white sm:text-2xl">{value}</p>
          {hint && <p className="mt-1 text-xs text-white/65">{hint}</p>}
        </div>
        {Icon && (
          <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${t.icon}`}>
            <Icon className="h-5 w-5" />
          </span>
        )}
      </div>
    </motion.div>
  );
}
