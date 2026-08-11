import { FiCreditCard } from 'react-icons/fi';
import CrudPage from '../components/CrudPage';
import { paymentService } from '../services/crud.service';
import { formatDateTime, formatMoney, paymentLabel } from '../utils/format';

export default function Payments() {
  return (
    <CrudPage
      title="Paiements" subtitle="Encaissements par mode de reglement" icon={FiCreditCard} service={paymentService}
      labelSingular="Paiement"
      writeRoles={['administrateur', 'gestionnaire', 'caissier']}
      columns={[{ key: 'id', label: '#' }, { key: 'vente_id', label: 'Vente' }, { key: 'montant', label: 'Montant', render: (r) => formatMoney(r.montant) }, { key: 'mode', label: 'Mode', render: (r) => <span className="badge-blue">{paymentLabel[r.mode]}</span> }, { key: 'statut', label: 'Statut' }, { key: 'created_at', label: 'Date', render: (r) => formatDateTime(r.created_at) }]}
      fields={[{ name: 'vente_id', label: 'ID de la vente', type: 'number', required: true }, { name: 'montant', label: 'Montant', type: 'number', step: '0.01', required: true }, { name: 'mode', label: 'Mode de paiement', type: 'select', required: true, options: [{ value: 'especes', label: 'Especes' }, { value: 'mobile_money', label: 'Mobile Money' }, { value: 'carte_bancaire', label: 'Carte bancaire' }, { value: 'virement', label: 'Virement' }] }, { name: 'reference', label: 'Reference' }]}
    />
  );
}
