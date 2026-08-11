/** Indicateur de chargement centré. */
export default function Loader({ full = false, label = 'Chargement...' }) {
  const spinner = (
    <div className="flex flex-col items-center gap-3">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-200 border-t-brand-600 dark:border-brand-800 dark:border-t-brand-400" />
      {label && <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>}
    </div>
  );

  if (full) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">{spinner}</div>
    );
  }
  return <div className="flex items-center justify-center py-12">{spinner}</div>;
}
