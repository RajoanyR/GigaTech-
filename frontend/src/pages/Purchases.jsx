import { useState } from 'react';
import { FiCheckCircle, FiPlus, FiShoppingBag, FiTrash2 } from 'react-icons/fi';
import { toast } from 'react-toastify';
import PageHeader from '../components/PageHeader';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import RoleGate from '../components/RoleGate';
import usePaginatedList from '../hooks/usePaginatedList';
import useFetch from '../hooks/useFetch';
import { productService, supplierService } from '../services/crud.service';
import { purchaseService } from '../services/business.service';
import { confirmAction, confirmDelete } from '../utils/confirm';
import { formatDateTime, formatMoney } from '../utils/format';

/** Achats fournisseurs : creation en brouillon puis validation (entree en stock). */
export default function Purchases() {
  const list = usePaginatedList({ list: (p) => purchaseService.list(p) });
  const { data: suppliers } = useFetch(() => supplierService.list({ limit: 200 }).then((r) => r.data), [], []);
  const { data: products } = useFetch(() => productService.list({ limit: 200 }).then((r) => r.data), [], []);
  const [open, setOpen] = useState(false);
  const [fournisseur, setFournisseur] = useState('');
  const [lignes, setLignes] = useState([{ produit_id: '', quantite: 1, prix_unitaire: 0 }]);

  const setLine = (i, key, value) => setLignes((l) => l.map((x, idx) => (idx === i ? { ...x, [key]: value } : x)));
  const total = lignes.reduce((s, l) => s + Number(l.quantite || 0) * Number(l.prix_unitaire || 0), 0);

  const submit = async () => {
    if (!fournisseur) return toast.warn('Selectionnez un fournisseur');
    const valides = lignes.filter((l) => l.produit_id && l.quantite > 0);
    if (!valides.length) return toast.warn('Ajoutez au moins une ligne');
    await purchaseService.create({
      fournisseur_id: Number(fournisseur),
      lignes: valides.map((l) => ({ produit_id: Number(l.produit_id), quantite: Number(l.quantite), prix_unitaire: Number(l.prix_unitaire) })),
    });
    toast.success('Achat enregistre en brouillon');
    setOpen(false); setLignes([{ produit_id: '', quantite: 1, prix_unitaire: 0 }]); list.reload();
  };

  const validate = async (row) => {
    if (!(await confirmAction('Valider cet achat ?', 'Les quantites seront ajoutees au stock.'))) return;
    await purchaseService.validate(row.id);
    toast.success('Achat valide, stock mis a jour');
    list.reload();
  };

  const remove = async (row) => {
    if (!(await confirmDelete(`Supprimer l'achat ${row.numero} ?`))) return;
    await purchaseService.remove(row.id);
    toast.success('Achat supprime');
    list.reload();
  };

  const columns = [
    { key: 'numero', label: 'N° Achat' },
    { key: 'fournisseur_nom', label: 'Fournisseur' },
    { key: 'total', label: 'Total', render: (r) => <b>{formatMoney(r.total)}</b> },
    { key: 'statut', label: 'Statut', render: (r) => <span className={r.statut === 'validee' ? 'badge-green' : r.statut === 'annulee' ? 'badge-red' : 'badge-amber'}>{r.statut}</span> },
    { key: 'date_achat', label: 'Date', render: (r) => formatDateTime(r.date_achat) },
    { key: 'actions', label: 'Actions', className: 'text-right', render: (r) => (
      <RoleGate roles={['administrateur', 'gestionnaire']}>
        <div className="flex justify-end gap-1.5">
          {r.statut === 'brouillon' && (
            <>
              <button className="rounded-lg p-2 text-slate-500 hover:bg-emerald-50 hover:text-emerald-600" title="Valider" onClick={() => validate(r)}><FiCheckCircle /></button>
              <button className="rounded-lg p-2 text-slate-500 hover:bg-rose-50 hover:text-rose-600" title="Supprimer" onClick={() => remove(r)}><FiTrash2 /></button>
            </>
          )}
        </div>
      </RoleGate>
    ) },
  ];

  return (
    <>
      <PageHeader title="Achats" subtitle="Approvisionnements fournisseurs" icon={FiShoppingBag}
        actions={<RoleGate roles={['administrateur', 'gestionnaire', 'magasinier']}>
          <button className="btn-primary" onClick={() => setOpen(true)}><FiPlus /> Nouvel achat</button>
        </RoleGate>} />

      <DataTable columns={columns} rows={list.rows} meta={list.meta} loading={list.loading} query={list.query}
        onSearch={list.setSearch} onPage={list.setPage} searchPlaceholder="N° d'achat ou fournisseur..." />

      <Modal open={open} onClose={() => setOpen(false)} size="lg" title="Nouvel achat"
        footer={<>
          <button className="btn-ghost" onClick={() => setOpen(false)}>Annuler</button>
          <button className="btn-primary" onClick={submit}>Enregistrer</button>
        </>}>
        <div className="space-y-4">
          <div>
            <label className="label">Fournisseur</label>
            <select className="input" value={fournisseur} onChange={(e) => setFournisseur(e.target.value)}>
              <option value="">— Choisir —</option>
              {suppliers?.map((s) => <option key={s.id} value={s.id}>{s.nom}</option>)}
            </select>
          </div>

          {lignes.map((l, i) => (
            <div key={i} className="grid grid-cols-12 gap-2">
              <select className="input col-span-6" value={l.produit_id} onChange={(e) => setLine(i, 'produit_id', e.target.value)}>
                <option value="">— Produit —</option>
                {products?.map((p) => <option key={p.id} value={p.id}>{p.nom}</option>)}
              </select>
              <input type="number" min={1} className="input col-span-2" value={l.quantite} onChange={(e) => setLine(i, 'quantite', e.target.value)} />
              <input type="number" step="0.01" className="input col-span-3" placeholder="Prix unitaire" value={l.prix_unitaire} onChange={(e) => setLine(i, 'prix_unitaire', e.target.value)} />
              <button className="col-span-1 text-rose-500" onClick={() => setLignes((x) => x.filter((_, idx) => idx !== i))}><FiTrash2 /></button>
            </div>
          ))}

          <button className="btn-ghost" onClick={() => setLignes((l) => [...l, { produit_id: '', quantite: 1, prix_unitaire: 0 }])}>
            <FiPlus /> Ajouter une ligne
          </button>
          <p className="text-right text-base font-semibold">Total : <span className="text-brand-600">{formatMoney(total)}</span></p>
        </div>
      </Modal>
    </>
  );
}
