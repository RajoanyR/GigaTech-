import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { FiDownload, FiImage, FiSettings } from 'react-icons/fi';
import { toast } from 'react-toastify';
import PageHeader from '../components/PageHeader';
import FormField from '../components/FormField';
import Loader from '../components/Loader';
import useFetch from '../hooks/useFetch';
import { settingService } from '../services/business.service';
import { downloadBlob } from '../utils/format';
import { ACCEPTED_IMAGES, fileUrl, validateImage } from '../utils/media';

/** Parametres de l'entreprise : identite, devise, TVA, logo, sauvegarde. */
export default function Settings() {
  const { data, loading, refetch } = useFetch(() => settingService.get(), [], null);
  const { register, handleSubmit, reset, watch, formState: { isSubmitting } } = useForm();
  const [backuping, setBackuping] = useState(false);
  const [preview, setPreview] = useState('');

  useEffect(() => {
  if (data) {
    const { logo, ...rest } = data;
    reset(rest);
  }
  }, [data, reset]);

  const logoFile = watch('logo')?.[0];
  useEffect(() => {
    if (!logoFile) return setPreview('');
    const error = validateImage(logoFile);
    if (error) { toast.error(error); return setPreview(''); }
    const url = URL.createObjectURL(logoFile);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [logoFile]);

  const submit = async (values) => {
    const fd = new FormData();
    Object.entries(values).forEach(([k, v]) => {
      if (k === 'logo') { if (v?.[0]) fd.append('logo', v[0]); }
      else if (v !== null && v !== undefined) fd.append(k, v);
    });
    try {
      await settingService.update(fd);
      toast.success('Parametres enregistres');
      setPreview('');
      refetch();
    } catch { /* notification deja affichee par l'intercepteur Axios */ }
  };

  /** Sauvegarde JSON : requete Axios authentifiee puis telechargement du blob. */
  const backup = async () => {
    setBackuping(true);
    try {
      const blob = await settingService.backup();
      downloadBlob(blob, `gigatech-sauvegarde-${new Date().toISOString().slice(0, 10)}.json`);
      toast.success('Sauvegarde telechargee');
    } catch {
      /* message deja affiche */
    } finally {
      setBackuping(false);
    }
  };

  if (loading) return <Loader />;

  const currentLogo = preview || fileUrl(data?.logo);

  return (
    <>
      <PageHeader title="Parametres" subtitle="Informations de l'entreprise et configuration" icon={FiSettings}
        actions={
          <button type="button" className="btn-ghost" onClick={backup} disabled={backuping}>
            <FiDownload /> {backuping ? 'Sauvegarde...' : 'Sauvegarder'}
          </button>
        } />

      <form onSubmit={handleSubmit(submit)} className="card card-pad grid max-w-4xl gap-4 sm:grid-cols-2">
        <FormField label="Nom de l'entreprise"><input className="input" {...register('entreprise')} /></FormField>
        <FormField label="Site web"><input className="input" {...register('site_web')} /></FormField>
        <FormField label="Telephone"><input className="input" {...register('telephone')} /></FormField>
        <FormField label="Email"><input type="email" className="input" {...register('email')} /></FormField>
        <FormField label="RCCM"><input className="input" {...register('rccm')} /></FormField>
        <FormField label="NIF"><input className="input" {...register('nif')} /></FormField>
        <FormField label="Devise"><input className="input" placeholder="USD" {...register('devise')} /></FormField>
        <FormField label="Taux de TVA (%)"><input type="number" step="0.01" className="input" {...register('tva')} /></FormField>
        <FormField label="Adresse" className="sm:col-span-2"><input className="input" {...register('adresse')} /></FormField>

        <FormField label="Logo de l'entreprise (JPG, PNG, WEBP)" className="sm:col-span-2">
          <div className="flex items-center gap-4">
            {currentLogo
              ? <img src={currentLogo} alt="Logo" className="h-16 w-16 rounded-xl border border-slate-200 object-contain dark:border-slate-700" />
              : <span className="grid h-16 w-16 place-items-center rounded-xl bg-slate-100 text-slate-400 dark:bg-slate-800"><FiImage /></span>}
            <input type="file" accept={ACCEPTED_IMAGES} className="input" {...register('logo')} />
          </div>
        </FormField>

        <div className="sm:col-span-2"><button className="btn-primary" disabled={isSubmitting}>Enregistrer les parametres</button></div>
      </form>
    </>
  );
}
