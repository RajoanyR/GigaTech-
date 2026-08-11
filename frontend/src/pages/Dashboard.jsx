import {
  FiActivity, FiAlertTriangle, FiBox, FiDollarSign, FiShoppingBag,
  FiShoppingCart, FiTrendingUp, FiTruck, FiUsers, FiXCircle,
} from 'react-icons/fi';
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import { Link } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import StatCard from '../components/StatCard';
import { SkeletonCards } from '../components/Skeleton';
import useFetch from '../hooks/useFetch';
import { dashboardService } from '../services/business.service';
import { formatDateTime, formatMoney } from '../utils/format';

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#f43f5e', '#8b5cf6', '#06b6d4'];

export default function Dashboard() {
  const { data, loading } = useFetch(() => dashboardService.overview(), []);

  if (loading || !data) {
    return (
      <>
        <PageHeader title="Tableau de bord" subtitle="Chargement des indicateurs..." icon={FiActivity} />
        <SkeletonCards count={8} />
      </>
    );
  }

  const s = data.stats;
  const cards = [
    { label: 'Total produits', value: s.totalProduits, icon: FiBox, tone: 'blue' },
    { label: 'Ruptures de stock', value: s.produitsRupture, icon: FiXCircle, tone: 'red' },
    { label: 'Stock faible', value: s.produitsStockFaible, icon: FiAlertTriangle, tone: 'amber' },
    { label: 'Clients', value: s.totalClients, icon: FiUsers, tone: 'green' },
    { label: 'Fournisseurs', value: s.totalFournisseurs, icon: FiTruck, tone: 'slate' },
    { label: 'Ventes', value: s.totalVentes, icon: FiShoppingCart, tone: 'blue' },
    { label: 'Achats', value: s.totalAchats, icon: FiShoppingBag, tone: 'slate' },
    { label: "Chiffre d'affaires du jour", value: formatMoney(s.caJour), icon: FiDollarSign, tone: 'green' },
    { label: "Chiffre d'affaires du mois", value: formatMoney(s.caMois), icon: FiTrendingUp, tone: 'blue' },
    { label: 'Revenus annuels', value: formatMoney(s.caAnnee), icon: FiTrendingUp, tone: 'green' },
  ];

  const revenus = (data.revenusMensuels || []).map((r) => ({ mois: r.mois, chiffre: Number(r.chiffre) }));
  const top = (data.topProduits || []).map((p) => ({ nom: p.nom, quantite: Number(p.quantite_vendue) }));

  return (
    <>
      <PageHeader title="Tableau de bord" subtitle="Vue d'ensemble de l'activite GigaTech" icon={FiActivity} />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {cards.map((c, i) => <StatCard key={c.label} {...c} index={i} />)}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="card card-pad lg:col-span-2">
          <h3 className="mb-4 text-sm font-semibold text-slate-900 dark:text-white">Evolution du chiffre d'affaires (12 mois)</h3>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={revenus}>
              <defs>
                <linearGradient id="ca" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-slate-200 dark:text-slate-700" vertical={false} />
              <XAxis dataKey="mois" fontSize={12} stroke="#94a3b8" />
              <YAxis fontSize={12} stroke="#94a3b8" />
              <Tooltip formatter={(v) => formatMoney(v)} />
              <Area type="monotone" dataKey="chiffre" stroke="#2563eb" strokeWidth={2.5} fill="url(#ca)" name="Chiffre d'affaires" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card card-pad">
          <h3 className="mb-4 text-sm font-semibold text-slate-900 dark:text-white">Repartition des meilleures ventes</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={top} dataKey="quantite" nameKey="nom" innerRadius={55} outerRadius={95} paddingAngle={3}>
                {top.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Legend fontSize={11} />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="card card-pad">
          <h3 className="mb-4 text-sm font-semibold text-slate-900 dark:text-white">Produits les plus vendus</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={top}>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-slate-200 dark:text-slate-700" vertical={false} />
              <XAxis dataKey="nom" fontSize={10} stroke="#94a3b8" interval={0} tickFormatter={(v) => v.slice(0, 12)} />
              <YAxis fontSize={12} stroke="#94a3b8" />
              <Tooltip />
              <Bar dataKey="quantite" fill="#2563eb" radius={[6, 6, 0, 0]} name="Quantite vendue" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card card-pad">
          <h3 className="mb-3 text-sm font-semibold text-slate-900 dark:text-white">Activites recentes</h3>
          <ul className="divide-y divide-slate-100 dark:divide-slate-800">
            {(data.activites || []).map((a, i) => (
              <li key={i} className="flex items-center justify-between py-2.5 text-sm">
                <span className="truncate">
                  <span className={a.type === 'entree' ? 'badge-green mr-2' : a.type === 'sortie' ? 'badge-red mr-2' : 'badge-amber mr-2'}>{a.type}</span>
                  {a.produit_nom} <span className="text-slate-400">×{a.quantite}</span>
                </span>
                <span className="shrink-0 text-xs text-slate-400">{formatDateTime(a.created_at)}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <RecentTable title="Dernieres ventes" to="/ventes" rows={data.dernieresVentes}
          cols={[['numero', 'N°'], ['client_nom', 'Client'], ['total', 'Total'], ['date_vente', 'Date']]} />
        <RecentTable title="Derniers achats" to="/achats" rows={data.derniersAchats}
          cols={[['numero', 'N°'], ['fournisseur_nom', 'Fournisseur'], ['total', 'Total'], ['date_achat', 'Date']]} />
      </div>
    </>
  );
}

function RecentTable({ title, rows = [], cols, to }) {
  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-slate-800">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{title}</h3>
        <Link to={to} className="text-xs font-medium text-brand-600 hover:underline">Tout voir</Link>
      </div>
      <table className="w-full text-sm">
        <thead className="table-head">
          <tr>{cols.map(([k, l]) => <th key={k} className="px-4 py-2.5">{l}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="table-row">
              {cols.map(([k]) => (
                <td key={k} className="px-4 py-3">
                  {k.includes('total') ? formatMoney(r[k]) : k.includes('date') ? formatDateTime(r[k]) : r[k] || '-'}
                </td>
              ))}
            </tr>
          ))}
          {!rows.length && <tr><td colSpan={cols.length} className="px-4 py-8 text-center text-slate-500">Aucune donnee</td></tr>}
        </tbody>
      </table>
    </div>
  );
}
