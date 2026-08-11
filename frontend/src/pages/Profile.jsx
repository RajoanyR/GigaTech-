import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { FiCamera, FiUser } from 'react-icons/fi';
import { toast } from 'react-toastify';
import PageHeader from '../components/PageHeader';
import FormField from '../components/FormField';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/auth.service';
import { roleLabel } from '../utils/format';
import { ACCEPTED_IMAGES, fileUrl, validateImage } from '../utils/media';

/** Profil utilisateur : informations, photo de profil, mot de passe. */
export default function Profile() {
  const { user, setUser } = useAuth();
  const profileForm = useForm({ defaultValues: user || {} });
  const passwordForm = useForm();
  const [preview, setPreview] = useState('');

  const avatarValue = profileForm.watch('avatar');
  const avatarFile = avatarValue instanceof FileList ? avatarValue[0] : null;

  // Apercu immediat de l'image choisie (avant meme l'envoi au backend).
    useEffect(() => {
    if (!avatarFile) {
    setPreview('');
    return;
    }
    const error = validateImage(avatarFile);
    if (error) { toast.error(error); profileForm.setValue('avatar', null); return setPreview(''); }
    const url = URL.createObjectURL(avatarFile);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [avatarFile, profileForm]);

  const saveProfile = async (values) => {
    const fd = new FormData();
    ['nom', 'prenom', 'telephone'].forEach((k) => fd.append(k, values[k] || ''));
    if (values.avatar?.[0]) fd.append('avatar', values.avatar[0]);
    try {
      const updated = await authService.updateProfile(fd);
      setUser(updated);
      localStorage.setItem('gigatech_user', JSON.stringify(updated));
      profileForm.reset({ ...updated, avatar: null });
      setPreview('');
      toast.success('Profil mis a jour');
    } catch { /* notification deja affichee */ }
  };

  const savePassword = async (values) => {
    try {
      await authService.changePassword(values);
      toast.success('Mot de passe modifie');
      passwordForm.reset();
    } catch { /* notification deja affichee */ }
  };

  const avatarSrc = preview || fileUrl(user?.avatar);

  return (
    <>
      <PageHeader title="Mon profil" subtitle={`${user?.email} — ${roleLabel[user?.role] || ''}`} icon={FiUser} />

      <div className="grid max-w-4xl gap-5 lg:grid-cols-2">
        <form onSubmit={profileForm.handleSubmit(saveProfile)} className="card card-pad space-y-4">
          <h3 className="text-sm font-semibold">Informations personnelles</h3>

          <div className="flex items-center gap-4">
            {avatarSrc
              ? <img src={avatarSrc} alt="Photo de profil" className="h-20 w-20 rounded-full border border-slate-200 object-cover dark:border-slate-700" />
              : <span className="grid h-20 w-20 place-items-center rounded-full bg-brand-600 text-xl font-bold text-white">
                  {(user?.prenom?.[0] || user?.nom?.[0] || 'U').toUpperCase()}
                </span>}
            <div>
              <label className="btn-ghost cursor-pointer">
                <FiCamera /> Modifier la photo
                <input type="file" accept={ACCEPTED_IMAGES} className="hidden" {...profileForm.register('avatar')} />
              </label>
              <p className="mt-1.5 text-xs text-slate-400">JPG, PNG ou WEBP — 3 Mo maximum</p>
            </div>
          </div>

          <FormField label="Nom"><input className="input" {...profileForm.register('nom')} /></FormField>
          <FormField label="Prenom"><input className="input" {...profileForm.register('prenom')} /></FormField>
          <FormField label="Telephone"><input className="input" {...profileForm.register('telephone')} /></FormField>
          <button className="btn-primary" disabled={profileForm.formState.isSubmitting}>Enregistrer</button>
        </form>

        <form onSubmit={passwordForm.handleSubmit(savePassword)} className="card card-pad space-y-4">
          <h3 className="text-sm font-semibold">Changer le mot de passe</h3>
          <FormField label="Ancien mot de passe" error={passwordForm.formState.errors.ancien_mot_de_passe}>
            <input type="password" className="input" {...passwordForm.register('ancien_mot_de_passe', { required: 'Obligatoire' })} />
          </FormField>
          <FormField label="Nouveau mot de passe" error={passwordForm.formState.errors.nouveau_mot_de_passe}>
            <input type="password" className="input" {...passwordForm.register('nouveau_mot_de_passe', { required: 'Obligatoire', minLength: { value: 6, message: '6 caracteres minimum' } })} />
          </FormField>
          <button className="btn-primary">Mettre a jour</button>
        </form>
      </div>
    </>
  );
}
