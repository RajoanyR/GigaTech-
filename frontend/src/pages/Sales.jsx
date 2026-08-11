import { Link } from 'react-router-dom';
import { FiFileText, FiPlus, FiShoppingCart, FiXCircle } from 'react-icons/fi';
import { toast } from 'react-toastify';
import PageHeader from '../components/PageHeader';
import DataTable from '../components/DataTable';
import RoleGate from '../components/RoleGate';
import usePaginatedList from '../hooks/usePaginatedList';
import { saleService } from '../services/business.service';
import { confirmAction } from '../utils/confirm';
import { downloadBlob, formatDateTime, formatMoney, paymentLabel } from '../utils/format';

export default function Sales() {
  const list = usePaginatedList({ list: (p) => saleService.list(p) });

  const cancel = async (row) => {
    if (!(await confirmAction('Annuler cette vente ?', 'Le stock sera restitue automatiquement.'))) return;
    await saleService.cancel(row.id);
    toast.success('Vente annulee');
    list.reload();
  };

  /** La route /sales/:id/invoice est protegee : elle doit etre appelee avec le token JWT. */
  const downloadInvoice = async (row) => {
    try {
      const blob = await saleService.invoicePdf(row.id);
      downloadBlob(blob, `facture-${row.numero || row.id}.pdf`);
    } catch { /* notification deja affichee */ }
  };

  const columns = [
    { key: 'numero', label: 'N° Vente' },
    { key: 'client_nom', label: 'Client', render: (r) => r.client_nom || 'Client comptant' },
    { key: 'total', label: 'Total', render: (r) => <b>{formatMoney(r.total)}</b> },
    { key: 'mode_paiement', label: 'Paiement', render: (r) => <span className="badge-blue">{paymentLabel[r.mode_paiement]}</span> },
    { key: 'statut', label: 'Statut', render: (r) => <span className={r.statut === 'validee' ? 'badge-green' : 'badge-red'}>{r.statut}</span> },
    { key: 'date_vente', label: 'Date', render: (r) => formatDateTime(r.date_vente) },
    { key: 'actions', label: 'Actions', className: 'text-right', render: (r) => (
      <div className="flex justify-end gap-1.5">
        <button type="button" onClick={() => downloadInvoice(r)} title="Facture PDF"
          className="rounded-lg p-2 text-slate-500 hover:bg-brand-50 hover:text-brand-600"><FiFileText /></button>
        <RoleGate roles={['administrateur', 'gestionnaire']}>
          {r.statut === 'validee' && (
            <button onClick={() => cancel(r)} title="Annuler"
              className="rounded-lg p-2 text-slate-500 hover:bg-rose-50 hover:text-rose-600"><FiXCircle /></button>
          )}
        </RoleGate>
      </div>
    ) },
  ];

  return (
    <>
      <PageHeader title="Ventes" subtitle="Historique et facturation" icon={FiShoppingCart}
        actions={<RoleGate roles={['administrateur', 'gestionnaire', 'caissier']}>
          <Link to="/ventes/nouvelle" className="btn-primary"><FiPlus /> Nouvelle vente</Link>
        </RoleGate>} />
      <DataTable columns={columns} rows={list.rows} meta={list.meta} loading={list.loading} query={list.query}
        onSearch={list.setSearch} onPage={list.setPage} searchPlaceholder="N° de vente ou client..." />
    </>
  );
}
