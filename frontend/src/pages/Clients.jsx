import { FiUsers } from 'react-icons/fi';
import CrudPage from '../components/CrudPage';
import { clientService } from '../services/crud.service';

export default function Clients() {
  return (
    <CrudPage
      title="Clients" subtitle="Portefeuille clients et historique" icon={FiUsers} service={clientService}
      labelSingular="Client"
      writeRoles={['administrateur', 'gestionnaire', 'caissier']}
      columns={[{ key: 'nom', label: 'Nom', sortable: true }, { key: 'prenom', label: 'Prenom' }, { key: 'telephone', label: 'Telephone' }, { key: 'email', label: 'Email' }, { key: 'type_client', label: 'Type', render: (r) => <span className="badge-blue">{r.type_client}</span> }]}
      fields={[{ name: 'nom', label: 'Nom', required: true }, { name: 'prenom', label: 'Prenom' }, { name: 'telephone', label: 'Telephone', required: true }, { name: 'email', label: 'Email', type: 'email' }, { name: 'ville', label: 'Ville' }, { name: 'type_client', label: 'Type de client', type: 'select', options: [{ value: 'particulier', label: 'Particulier' }, { value: 'entreprise', label: 'Entreprise' }, { value: 'revendeur', label: 'Revendeur' }] }, { name: 'adresse', label: 'Adresse', colSpan: 2 }]}
    />
  );
}
