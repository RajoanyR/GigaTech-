/** Champ de formulaire (react-hook-form) avec message d'erreur. */
export default function FormField({ label, error, children, className = '' }) {
  return (
    <div className={className}>
      {label && <label className="label">{label}</label>}
      {children}
      {error && (
        <p className="mt-1.5 text-xs font-medium text-rose-600 dark:text-rose-400">
          {error.message || error}
        </p>
      )}
    </div>
  );
}
