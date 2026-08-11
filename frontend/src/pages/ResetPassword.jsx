import { useForm } from 'react-hook-form';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import FormField from '../components/FormField';
import { authService } from '../services/auth.service';

export default function ResetPassword() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm();

  const onSubmit = async ({ nouveau_mot_de_passe }) => {
    await authService.resetPassword({ token: params.get('token'), nouveau_mot_de_passe });
    toast.success('Mot de passe reinitialise');
    navigate('/login', { replace: true });
  };

  return (
    <div className="card card-pad sm:p-8">
      <h1 className="text-2xl font-semibold tracking-tight">Nouveau mot de passe</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-7 space-y-4" noValidate>
        <FormField label="Nouveau mot de passe" error={errors.nouveau_mot_de_passe}>
          <input type="password" className="input"
            {...register('nouveau_mot_de_passe', { required: 'Obligatoire', minLength: { value: 6, message: '6 caracteres minimum' } })} />
        </FormField>
        <FormField label="Confirmer le mot de passe" error={errors.confirmation}>
          <input type="password" className="input"
            {...register('confirmation', { validate: (v) => v === watch('nouveau_mot_de_passe') || 'Les mots de passe ne correspondent pas' })} />
        </FormField>
        <button className="btn-primary w-full justify-center" disabled={isSubmitting}>Reinitialiser</button>
      </form>
      <Link to="/login" className="mt-6 block text-center text-sm font-medium text-brand-600 hover:underline">Retour a la connexion</Link>
    </div>
  );
}
