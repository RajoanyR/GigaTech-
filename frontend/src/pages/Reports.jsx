import { useState } from 'react';
import { FiBarChart2, FiDownload, FiFileText } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import PageHeader from '../components/PageHeader';
import StatCard from '../components/StatCard';
import Loader from '../components/Loader';
import useFetch from '../hooks/useFetch';
import { reportService } from '../services/business.service';
import { downloadBlob, formatMoney } from '../utils/format';

const today = new Date().toISOString().slice(0, 10);
const monthAgo = new Date(Date.now() - 30 * 864e5).toISOString().slice(0, 10);

/** Rapports journalier / hebdomadaire / mensuel / annuel + exports. */
export default function Reports() {
  const [from, setFrom] = useState(monthAgo);
  const [to, setTo] = useState(today);
  const [groupBy, setGroupBy] = useState('day');
  const { data, loading, refetch } = useFetch(() => reportService.sales({ from, to, groupBy }),[from, to, groupBy],null);

  const lignes = (data?.lignes || []).map((l) => ({ ...l, total: Number(l.total) }));
  const totalCA = lignes.reduce((s, l) => s + l.total, 0);

  const [exporting, setExporting] = useState('');

  const exportFile = async (type) => {
    const params = { from, to, groupBy };
    setExporting(type);
    try {
      const blob = type === 'excel' ? await reportService.exportExcel(params) : await reportService.exportPdf(params);
      downloadBlob(blob, `rapport-ventes-${from}_${to}.${type === 'excel' ? 'xlsx' : 'pdf'}`);
      toast.success(`Export ${type === 'excel' ? 'Excel' : 'PDF'} telecharge`);
    } catch {
      /* notification deja affichee par l'intercepteur Axios */
    } finally {
      setExporting('');
    }
  };

  return (
    <>
      <PageHeader title="Rapports" subtitle="Analyse des ventes, marges et performances" icon={FiBarChart2}
        actions={<>
          <button type="button" className="btn-ghost" disabled={exporting === 'excel'} onClick={() => exportFile('excel')}><FiDownload /> {exporting === 'excel' ? 'Export...' : 'Excel'}</button>
          <button type="button" className="btn-ghost" disabled={exporting === 'pdf'} onClick={() => exportFile('pdf')}><FiFileText /> {exporting === 'pdf' ? 'Export...' : 'PDF'}</button>
        </>} />

      <div className="card card-pad mb-5 flex flex-wrap items-end gap-3">
        <div><label className="label">Du</label><input type="date" className="input" value={from} onChange={(e) => setFrom(e.target.value)} /></div>
        <div><label className="label">Au</label><input type="date" className="input" value={to} onChange={(e) => setTo(e.target.value)} /></div>
        <div>
          <label className="label">Periodicite</label>
          <select className="input" value={groupBy} onChange={(e) => setGroupBy(e.target.value)}>
            <option value="day">Journalier</option><option value="week">Hebdomadaire</option>
            <option value="month">Mensuel</option><option value="year">Annuel</option>
          </select>
        </div>
        <button className="btn-primary" onClick={refetch}>Actualiser</button>
      </div>

      {loading ? <Loader /> : (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard label="Chiffre d'affaires" value={formatMoney(totalCA)} tone="blue" index={0} />
            <StatCard label="Cout d'achat" value={formatMoney(data?.marge?.cout)} tone="amber" index={1} />
            <StatCard label="Marge brute" value={formatMoney(data?.marge?.marge)} tone="green" index={2} />
          </div>

          <div className="card card-pad mt-5">
            <h3 className="mb-4 text-sm font-semibold">Chiffre d'affaires par periode</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={lignes}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="periode" fontSize={11} stroke="#94a3b8" />
                <YAxis fontSize={11} stroke="#94a3b8" />
                <Tooltip formatter={(v) => formatMoney(v)} />
                <Bar dataKey="total" fill="#1a5eeb" radius={[6, 6, 0, 0]} name="Total" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="card mt-5 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="table-head">
                <tr><th className="px-4 py-3">Periode</th><th className="px-4 py-3">Ventes</th><th className="px-4 py-3">Remises</th><th className="px-4 py-3">TVA</th><th className="px-4 py-3">Total</th></tr>
              </thead>
              <tbody>
                {lignes.map((l) => (
                  <tr key={l.periode} className="table-row">
                    <td className="px-4 py-3">{l.periode}</td><td className="px-4 py-3">{l.nb_ventes}</td>
                    <td className="px-4 py-3">{formatMoney(l.remises)}</td><td className="px-4 py-3">{formatMoney(l.tva)}</td>
                    <td className="px-4 py-3 font-semibold">{formatMoney(l.total)}</td>
                  </tr>
                ))}
                {!lignes.length && <tr><td colSpan={5} className="px-4 py-10 text-center text-slate-500">Aucune vente sur la periode</td></tr>}
              </tbody>
            </table>
          </div>
        </>
      )}
    </>
  );
}
