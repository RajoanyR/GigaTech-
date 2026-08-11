import { FiMoon, FiSun } from 'react-icons/fi';
import { useTheme } from '../context/ThemeContext';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      aria-label={isDark ? 'Passer en mode clair' : 'Passer en mode sombre'}
      title={isDark ? 'Mode clair' : 'Mode sombre'}
      className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-2.5 py-2 text-slate-600
                 transition-all duration-200 hover:bg-slate-50 hover:border-slate-300
                 dark:border-slate-700/60 dark:bg-[#172033] dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:border-slate-600"
    >
      {isDark ? (
        <>
          <FiSun className="h-4 w-4 text-amber-400" />
          <span className="hidden text-xs font-medium sm:inline">Light</span>
        </>
      ) : (
        <>
          <FiMoon className="h-4 w-4 text-slate-500" />
          <span className="hidden text-xs font-medium sm:inline">Dark</span>
        </>
      )}
    </button>
  );
}
