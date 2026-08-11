import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import FormField from '../components/FormField';
import { authService } from '../services/auth.service';

export default function ForgotPassword() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();

  const onSubmit = async ({ email }) => {
    const res = await authService.forgotPassword(email);
    toast.success(res.message);
    if (res.data?.resetUrl) console.info('Lien de reinitialisation (dev) :', res.data.resetUrl);
  };

  return (
    <div className="card card-pad sm:p-8 shadow-soft">
      <h1 className="text-xl font-bold sm:text-2xl tracking-tight text-slate-900 dark:text-white">Mot de passe oublie</h1>
      <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
        Nous vous envoyons un lien de reinitialisation.
      </p>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-7 space-y-4" noValidate>
        <FormField label="Adresse email" error={errors.email}>
          <input
            type="email"
            className="input"
            placeholder="vous@gigatech.com"
            {...register('email', { required: 'Email obligatoire' })}
          />
        </FormField>
        <button className="btn-primary w-full justify-center py-2.5" disabled={isSubmitting}>
          Envoyer le lien
        </button>
      </form>
      <Link
        to="/login"
        className="mt-6 block text-center text-sm font-semibold text-brand-600 hover:text-brand-700 hover:underline"
      >
        Retour a la connexion
      </Link>
    </div>
  );
}
