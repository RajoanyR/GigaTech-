import { useForm } from 'react-hook-form';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FiLock, FiMail } from 'react-icons/fi';
import { motion } from 'framer-motion';
import FormField from '../components/FormField';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();

  const onSubmit = async (values) => {
    try {
      await login(values);
      navigate(location.state?.from || '/', { replace: true });
    } catch { /* toast affiche par l'intercepteur */ }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="card card-pad sm:p-8 shadow-soft"
    >
      <div className="mb-5 flex items-center gap-2.5 lg:hidden">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-600 text-sm font-bold text-white">
          GT
        </span>
        <span className="font-semibold text-slate-900 dark:text-white">GigaTech</span>
      </div>

      <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-2xl">
        Connexion
      </h1>
      <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
        Accedez a votre espace de gestion GigaTech.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-7 space-y-4" noValidate>
        <FormField label="Adresse email" error={errors.email}>
          <div className="relative">
            <FiMail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="email"
              autoComplete="email"
              placeholder="admin@gigatech.com"
              className="input pl-10"
              {...register('email', {
                required: 'Email obligatoire',
                pattern: { value: /^\S+@\S+$/, message: 'Email invalide' },
              })}
            />
          </div>
        </FormField>

        <FormField label="Mot de passe" error={errors.mot_de_passe}>
          <div className="relative">
            <FiLock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              className="input pl-10"
              {...register('mot_de_passe', {
                required: 'Mot de passe obligatoire',
                minLength: { value: 6, message: '6 caracteres minimum' },
              })}
            />
          </div>
        </FormField>

        <div className="flex justify-end">
          <Link
            to="/mot-de-passe-oublie"
            className="text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400"
          >
            Mot de passe oublie ?
          </Link>
        </div>

        <button type="submit" className="btn-primary w-full justify-center py-2.5" disabled={isSubmitting}>
          {isSubmitting ? 'Connexion...' : 'Se connecter'}
        </button>
      </form>

      <div className="mt-6 rounded-xl border border-brand-100 bg-brand-50/70 p-3.5 text-xs text-slate-600 dark:border-brand-800/40 dark:bg-brand-900/20 dark:text-slate-300">
        Compte de demonstration : <b className="text-brand-700 dark:text-brand-300">admin@gigatech.com</b> /{' '}
        <b className="text-brand-700 dark:text-brand-300">Admin@123</b>
      </div>
    </motion.div>
  );
}
