import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { FiLayers, FiPlus } from 'react-icons/fi';
import { toast } from 'react-toastify';
import PageHeader from '../components/PageHeader';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import FormField from '../components/FormField';
import RoleGate from '../components/RoleGate';
import usePaginatedList from '../hooks/usePaginatedList';
import useFetch from '../hooks/useFetch';
import { productService } from '../services/crud.service';
import { stockService } from '../services/business.service';
import { formatDateTime } from '../utils/format';

/** Entrees, sorties, ajustements et historique des mouvements. */
export default function Stock() {
  const list = usePaginatedList({ list: (p) => stockService.history(p) });
  const { data: alerts, refetch: reloadAlerts } = useFetch(() => stockService.alerts(), [], []);
  const { data: products } = useFetch(() => productService.list({ limit: 200 }).then((r) => r.data), [], []);
  const [open, setOpen] = useState(false);
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();

  const submit = async (values) => {
    await stockService.move(values);
    toast.success('Mouvement enregistre');
    setOpen(false); reset({}); list.reload(); reloadAlerts();
  };

  const columns = [
    { key: 'created_at', label: 'Date', render: (r) => formatDateTime(r.created_at) },
    { key: 'produit_nom', label: 'Produit' },
    { key: 'type', label: 'Type', render: (r) => (
      <span className={r.type === 'entree' ? 'badge-green' : r.type === 'sortie' ? 'badge-red' : 'badge-amber'}>{r.type}</span>
    ) },
    { key: 'quantite', label: 'Quantite' },
    { key: 'motif', label: 'Motif' },
    { key: 'agent', label: 'Agent' },
  ];

  return (
    <>
      <PageHeader title="Gestion du stock" subtitle="Mouvements, ajustements et alertes automatiques" icon={FiLayers}
        actions={<RoleGate roles={['administrateur', 'gestionnaire', 'magasinier']}>
          <button className="btn-primary" onClick={() => setOpen(true)}><FiPlus /> Nouveau mouvement</button>
        </RoleGate>} />

      {alerts?.length > 0 && (
        <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {alerts.slice(0, 8).map((a) => (
            <div key={a.id} className="card card-pad">
              <p className="truncate text-sm font-medium">{a.nom}</p>
              <p className="mt-1 text-xs text-slate-400">{a.reference}</p>
              <span className={`mt-3 inline-block ${a.niveau === 'rupture' ? 'badge-red' : 'badge-amber'}`}>
                {a.niveau === 'rupture' ? 'Rupture' : `Stock faible : ${a.quantite}`}
              </span>
            </div>
          ))}
        </div>
      )}

      <DataTable columns={columns} rows={list.rows} meta={list.meta} loading={list.loading} query={list.query}
        onSearch={list.setSearch} onPage={list.setPage}
        toolbar={
          <select className="input w-40" onChange={(e) => list.setFilter('type', e.target.value)}>
            <option value="">Tous les types</option>
            <option value="entree">Entrees</option>
            <option value="sortie">Sorties</option>
            <option value="ajustement">Ajustements</option>
          </select>
        } />

      <Modal open={open} onClose={() => setOpen(false)} title="Mouvement de stock"
        footer={<>
          <button className="btn-ghost" onClick={() => setOpen(false)}>Annuler</button>
          <button className="btn-primary" disabled={isSubmitting} onClick={handleSubmit(submit)}>Valider</button>
        </>}>
        <form className="grid gap-4 sm:grid-cols-2" onSubmit={handleSubmit(submit)}>
          <FormField label="Produit" error={errors.produit_id} className="sm:col-span-2">
            <select className="input" {...register('produit_id', { required: 'Obligatoire' })}>
              <option value="">— Choisir —</option>
              {products?.map((p) => <option key={p.id} value={p.id}>{p.nom} (stock : {p.quantite})</option>)}
            </select>
          </FormField>
          <FormField label="Type" error={errors.type}>
            <select className="input" {...register('type', { required: 'Obligatoire' })}>
              <option value="entree">Entree</option><option value="sortie">Sortie</option><option value="ajustement">Ajustement</option>
            </select>
          </FormField>
          <FormField label="Quantite" error={errors.quantite}>
            <input type="number" min={0} className="input" {...register('quantite', { required: 'Obligatoire', min: 0 })} />
          </FormField>
          <FormField label="Motif" className="sm:col-span-2"><input className="input" placeholder="Inventaire, casse, retour client..." {...register('motif')} /></FormField>
        </form>
      </Modal>
    </>
  );
}
