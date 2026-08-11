import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiMinus, FiPlus, FiShoppingCart, FiTrash2 } from 'react-icons/fi';
import { toast } from 'react-toastify';
import PageHeader from '../components/PageHeader';
import Loader from '../components/Loader';
import useFetch from '../hooks/useFetch';
import { clientService, productService } from '../services/crud.service';
import { saleService, settingService } from '../services/business.service';
import { downloadBlob, formatMoney } from '../utils/format';

/** Point de vente : panier, remise, TVA, mode de paiement. */
export default function NewSale() {
  const navigate = useNavigate();
  const { data: products, loading } = useFetch(() => productService.list({ limit: 200 }).then((r) => r.data), [], []);
  const { data: clients } = useFetch(() => clientService.list({ limit: 200 }).then((r) => r.data), [], []);
  const { data: settings } = useFetch(() => settingService.get(), [], null);
  const [cart, setCart] = useState([]);
  const [clientId, setClientId] = useState('');
  const [remise, setRemise] = useState(0);
  const [tva, setTva] = useState(16);
  const [mode, setMode] = useState('especes');
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState(false);

  const devise = settings?.devise || 'USD';
  const filtered = useMemo(
    () => (products || []).filter((p) => p.nom.toLowerCase().includes(search.toLowerCase()) || p.reference?.toLowerCase().includes(search.toLowerCase())),
    [products, search]
  );

  const add = (p) => setCart((c) => {
    const found = c.find((l) => l.produit_id === p.id);
    if (found) return c.map((l) => (l.produit_id === p.id ? { ...l, quantite: Math.min(l.quantite + 1, p.quantite) } : l));
    if (p.quantite <= 0) { toast.warn('Produit en rupture de stock'); return c; }
    return [...c, { produit_id: p.id, nom: p.nom, prix_unitaire: Number(p.prix_vente), quantite: 1, stock: p.quantite }];
  });

  const setQty = (id, q) => setCart((c) => c.map((l) => (l.produit_id === id ? { ...l, quantite: Math.max(1, Math.min(q, l.stock)) } : l)));
  const removeLine = (id) => setCart((c) => c.filter((l) => l.produit_id !== id));

  const sousTotal = cart.reduce((s, l) => s + l.prix_unitaire * l.quantite, 0);
  const montantRemise = (sousTotal * Number(remise || 0)) / 100;
  const montantTva = ((sousTotal - montantRemise) * Number(tva || 0)) / 100;
  const total = sousTotal - montantRemise + montantTva;

  const submit = async () => {
    if (!cart.length) return toast.warn('Le panier est vide');
    setSaving(true);
    try {
      const res = await saleService.create({
        client_id: clientId || null, remise: Number(remise), tva: Number(tva), mode_paiement: mode,
        lignes: cart.map((l) => ({ produit_id: l.produit_id, quantite: l.quantite, prix_unitaire: l.prix_unitaire })),
      });
      toast.success('Vente enregistree avec succes');
      try {
        const blob = await saleService.invoicePdf(res.data.id);
        downloadBlob(blob, `facture-${res.data.numero || res.data.id}.pdf`);
      } catch { /* la vente est enregistree meme si le PDF echoue */ }
      navigate('/ventes');
    } finally { setSaving(false); }
  };

  if (loading) return <Loader label="Chargement du catalogue..." />;

  return (
    <>
      <PageHeader title="Nouvelle vente" subtitle="Point de vente et facturation immediate" icon={FiShoppingCart} />

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="card lg:col-span-2">
          <div className="border-b border-slate-100 p-4 dark:border-slate-800">
            <input className="input" placeholder="Rechercher un produit..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="grid max-h-[560px] gap-3 overflow-y-auto p-4 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((p) => (
              <button key={p.id} onClick={() => add(p)} disabled={p.quantite <= 0}
                className="card card-pad text-left transition hover:-translate-y-0.5 hover:shadow-float disabled:opacity-50">
                <p className="truncate text-sm font-medium">{p.nom}</p>
                <p className="text-xs text-slate-400">{p.reference}</p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="font-semibold text-brand-600">{formatMoney(p.prix_vente, devise)}</span>
                  <span className={p.quantite <= 0 ? 'badge-red' : 'badge-green'}>{p.quantite}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="card card-pad space-y-4">
          <h3 className="text-sm font-semibold">Panier ({cart.length})</h3>
          <div className="max-h-64 space-y-2 overflow-y-auto">
            {cart.map((l) => (
              <div key={l.produit_id} className="flex items-center gap-2 rounded-xl border border-slate-100 p-2.5 dark:border-slate-800">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{l.nom}</p>
                  <p className="text-xs text-slate-400">{formatMoney(l.prix_unitaire, devise)}</p>
                </div>
                <button className="btn-ghost px-2 py-1" onClick={() => setQty(l.produit_id, l.quantite - 1)}><FiMinus /></button>
                <span className="w-6 text-center text-sm font-semibold">{l.quantite}</span>
                <button className="btn-ghost px-2 py-1" onClick={() => setQty(l.produit_id, l.quantite + 1)}><FiPlus /></button>
                <button className="p-2 text-rose-500" onClick={() => removeLine(l.produit_id)}><FiTrash2 /></button>
              </div>
            ))}
            {!cart.length && <p className="py-6 text-center text-sm text-slate-400">Aucun article selectionne</p>}
          </div>

          <div>
            <label className="label">Client</label>
            <select className="input" value={clientId} onChange={(e) => setClientId(e.target.value)}>
              <option value="">Client comptant</option>
              {clients?.map((c) => <option key={c.id} value={c.id}>{c.prenom} {c.nom}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">Remise (%)</label><input type="number" min={0} max={100} className="input" value={remise} onChange={(e) => setRemise(e.target.value)} /></div>
            <div><label className="label">TVA (%)</label><input type="number" min={0} max={100} className="input" value={tva} onChange={(e) => setTva(e.target.value)} /></div>
          </div>

          <div>
            <label className="label">Mode de paiement</label>
            <select className="input" value={mode} onChange={(e) => setMode(e.target.value)}>
              <option value="especes">Especes</option><option value="mobile_money">Mobile Money</option>
              <option value="carte_bancaire">Carte bancaire</option><option value="virement">Virement</option>
            </select>
          </div>

          <div className="space-y-1.5 border-t border-slate-100 pt-3 text-sm dark:border-slate-800">
            <Row label="Sous-total" value={formatMoney(sousTotal, devise)} />
            <Row label={`Remise (${remise || 0}%)`} value={`- ${formatMoney(montantRemise, devise)}`} />
            <Row label={`TVA (${tva || 0}%)`} value={formatMoney(montantTva, devise)} />
            <div className="flex justify-between pt-2 text-base font-semibold"><span>Total</span><span className="text-brand-600">{formatMoney(total, devise)}</span></div>
          </div>

          <button className="btn-primary w-full justify-center" disabled={saving || !cart.length} onClick={submit}>
            {saving ? 'Enregistrement...' : 'Valider et facturer'}
          </button>
        </div>
      </div>
    </>
  );
}

const Row = ({ label, value }) => (
  <div className="flex justify-between text-slate-500 dark:text-slate-400"><span>{label}</span><span>{value}</span></div>
);
