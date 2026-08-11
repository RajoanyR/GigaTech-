import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { FiBox, FiEdit2, FiPlus, FiTrash2 } from 'react-icons/fi';
import { toast } from 'react-toastify';
import PageHeader from '../components/PageHeader';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import FormField from '../components/FormField';
import RoleGate from '../components/RoleGate';
import usePaginatedList from '../hooks/usePaginatedList';
import useFetch from '../hooks/useFetch';
import api from '../services/api';
import { brandService, categoryService, supplierService } from '../services/crud.service';
import { confirmDelete } from '../utils/confirm';
import { formatMoney } from '../utils/format';
import { ACCEPTED_IMAGES, fileUrl, validateImage } from '../utils/media';

/** Gestion des produits : recherche, filtres, tri, pagination, upload image. */
export default function Products() {
  const list = usePaginatedList({ list: (p) => api.get('/products', { params: p }).then((r) => r.data) });
  const { data: cats } = useFetch(() => categoryService.list({ limit: 100 }).then((r) => r.data), [], []);
  const { data: brands } = useFetch(() => brandService.list({ limit: 100 }).then((r) => r.data), [], []);
  const { data: suppliers } = useFetch(() => supplierService.list({ limit: 100 }).then((r) => r.data), [], []);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const { register, handleSubmit, reset, watch, setValue, formState: { errors, isSubmitting } } = useForm();
  const [preview, setPreview] = useState('');

  const imageFile = watch('image')?.[0];

  // Apercu immediat de l'image selectionnee + validation JPG / PNG / WEBP.
  useEffect(() => {
    if (!imageFile) return setPreview('');
    const error = validateImage(imageFile);
    if (error) { toast.error(error); setValue('image', null); return setPreview(''); }
    const url = URL.createObjectURL(imageFile);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [imageFile, setValue]);

  const submit = async (values) => {
    const fd = new FormData();
    Object.entries(values).forEach(([k, v]) => {
      // Le fichier est le seul champ traite a part : il doit etre ajoute en binaire.
      if (k === 'image') { if (v?.[0]) fd.append('image', v[0]); }
      else if (v !== '' && v !== undefined && v !== null) fd.append(k, v);
    });
    try {
      // Aucun Content-Type manuel : Axios genere le boundary multipart attendu par Multer.
      if (editing) await api.put(`/products/${editing.id}`, fd);
      else await api.post('/products', fd);
      toast.success(editing ? 'Produit modifie' : 'Produit ajoute');
      setOpen(false);
      setPreview('');
      reset({});
      list.reload();
    } catch { /* notification deja affichee par l'intercepteur Axios */ }
  };

  const remove = async (row) => {
    if (!(await confirmDelete(`Supprimer le produit : ${row.nom} ?`))) return;
    await api.delete(`/products/${row.id}`);
    toast.success('Produit supprime');
    list.reload();
  };

  const columns = [
    { key: 'reference', label: 'Reference', sortable: true },
    { key: 'nom', label: 'Produit', sortable: true, render: (r) => (
      <div className="flex items-center gap-3">
        {r.image
          ? <img src={fileUrl(r.image)} alt={r.nom} className="h-9 w-9 rounded-lg object-cover" />
          : <span className="grid h-9 w-9 place-items-center rounded-lg bg-slate-100 text-slate-400 dark:bg-slate-800"><FiBox /></span>}
        <div><p className="font-medium">{r.nom}</p><p className="text-xs text-slate-400">{r.marque_nom || '-'}</p></div>
      </div>
    ) },
    { key: 'categorie_nom', label: 'Categorie' },
    { key: 'prix_vente', label: 'Prix de vente', sortable: true, render: (r) => formatMoney(r.prix_vente) },
    { key: 'quantite', label: 'Stock', sortable: true, render: (r) => (
      <span className={r.quantite <= 0 ? 'badge-red' : r.quantite <= r.seuil_alerte ? 'badge-amber' : 'badge-green'}>{r.quantite}</span>
    ) },
    { key: 'actions', label: 'Actions', className: 'text-right', render: (r) => (
      <div className="flex justify-end gap-1.5">
        <RoleGate roles={['administrateur', 'gestionnaire', 'magasinier']}>
          <button className="rounded-lg p-2 text-slate-500 hover:bg-brand-50 hover:text-brand-600"
            onClick={() => { setEditing(r); reset({ ...r, image: null }); setPreview(''); setOpen(true); }}><FiEdit2 /></button>
        </RoleGate>
        <RoleGate roles={['administrateur', 'gestionnaire']}>
          <button className="rounded-lg p-2 text-slate-500 hover:bg-rose-50 hover:text-rose-600" onClick={() => remove(r)}><FiTrash2 /></button>
        </RoleGate>
      </div>
    ) },
  ];

  return (
    <>
      <PageHeader title="Produits" subtitle="Catalogue et niveaux de stock" icon={FiBox}
        actions={<RoleGate roles={['administrateur', 'gestionnaire', 'magasinier']}>
          <button className="btn-primary" onClick={() => { setEditing(null); reset({}); setPreview(''); setOpen(true); }}><FiPlus /> Nouveau produit</button>
        </RoleGate>} />

      <DataTable columns={columns} rows={list.rows} meta={list.meta} loading={list.loading} query={list.query}
        onSearch={list.setSearch} onPage={list.setPage} onSort={list.setSort}
        searchPlaceholder="Nom, reference ou code-barres..."
        toolbar={
          <>
            <select className="input w-44" onChange={(e) => list.setFilter('categorie_id', e.target.value)}>
              <option value="">Toutes categories</option>
              {cats?.map((c) => <option key={c.id} value={c.id}>{c.nom}</option>)}
            </select>
            <select className="input w-40" onChange={(e) => list.setFilter('stock', e.target.value)}>
              <option value="">Tout le stock</option>
              <option value="faible">Stock faible</option>
              <option value="rupture">En rupture</option>
            </select>
          </>
        } />

      <Modal open={open} onClose={() => setOpen(false)} size="lg" title={editing ? 'Modifier le produit' : 'Nouveau produit'}
        footer={<>
          <button className="btn-ghost" onClick={() => setOpen(false)}>Annuler</button>
          <button className="btn-primary" disabled={isSubmitting} onClick={handleSubmit(submit)}>Enregistrer</button>
        </>}>
        <form className="grid gap-4 sm:grid-cols-2" onSubmit={handleSubmit(submit)}>
          <FormField label="Reference" error={errors.reference}><input className="input" {...register('reference', { required: 'Obligatoire' })} /></FormField>
          <FormField label="Code-barres"><input className="input" {...register('code_barres')} /></FormField>
          <FormField label="Nom du produit" error={errors.nom} className="sm:col-span-2"><input className="input" {...register('nom', { required: 'Obligatoire' })} /></FormField>
          <FormField label="Categorie" error={errors.categorie_id}>
            <select className="input" {...register('categorie_id', { required: 'Obligatoire' })}>
              <option value="">— Choisir —</option>{cats?.map((c) => <option key={c.id} value={c.id}>{c.nom}</option>)}
            </select>
          </FormField>
          <FormField label="Marque">
            <select className="input" {...register('marque_id')}>
              <option value="">— Choisir —</option>{brands?.map((b) => <option key={b.id} value={b.id}>{b.nom}</option>)}
            </select>
          </FormField>
          <FormField label="Fournisseur">
            <select className="input" {...register('fournisseur_id')}>
              <option value="">— Choisir —</option>{suppliers?.map((s) => <option key={s.id} value={s.id}>{s.nom}</option>)}
            </select>
          </FormField>
          <FormField label="Garantie (mois)"><input type="number" className="input" defaultValue={12} {...register('garantie_mois')} /></FormField>
          <FormField label="Prix d'achat" error={errors.prix_achat}><input type="number" step="0.01" className="input" {...register('prix_achat', { required: 'Obligatoire', min: 0 })} /></FormField>
          <FormField label="Prix de vente" error={errors.prix_vente}><input type="number" step="0.01" className="input" {...register('prix_vente', { required: 'Obligatoire', min: 0 })} /></FormField>
          <FormField label="Quantite"><input type="number" className="input" defaultValue={0} {...register('quantite')} /></FormField>
          <FormField label="Seuil d'alerte"><input type="number" className="input" defaultValue={5} {...register('seuil_alerte')} /></FormField>
          <FormField label="Description" className="sm:col-span-2"><textarea rows={3} className="input" {...register('description')} /></FormField>
          <FormField label="Image du produit (JPG, PNG, WEBP)" className="sm:col-span-2">
            <div className="flex items-center gap-4">
              {(preview || fileUrl(editing?.image))
                ? <img src={preview || fileUrl(editing?.image)} alt="Apercu" className="h-16 w-16 rounded-xl border border-slate-200 object-cover dark:border-slate-700" />
                : <span className="grid h-16 w-16 place-items-center rounded-xl bg-slate-100 text-slate-400 dark:bg-slate-800"><FiBox /></span>}
              <input type="file" accept={ACCEPTED_IMAGES} className="input" {...register('image')} />
            </div>
          </FormField>
        </form>
      </Modal>
    </>
  );
}
