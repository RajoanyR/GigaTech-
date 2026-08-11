import { FiShield } from 'react-icons/fi';
import CrudPage from '../components/CrudPage';
import { userService } from '../services/crud.service';
import { roleLabel } from '../utils/format';

export default function Users() {
  return (
    <CrudPage
      title="Utilisateurs" subtitle="Comptes et permissions" icon={FiShield} service={userService}
      labelSingular="Utilisateur"
      writeRoles={['administrateur']}
      columns={[{ key: 'nom', label: 'Nom', sortable: true }, { key: 'email', label: 'Email', sortable: true }, { key: 'role', label: 'Role', render: (r) => <span className="badge-blue">{roleLabel[r.role]}</span> }, { key: 'actif', label: 'Statut', render: (r) => (r.actif ? <span className="badge-green">Actif</span> : <span className="badge-red">Inactif</span>) }]}
      fields={[{ name: 'nom', label: 'Nom', required: true }, { name: 'prenom', label: 'Prenom' }, { name: 'email', label: 'Email', type: 'email', required: true }, { name: 'telephone', label: 'Telephone' }, { name: 'mot_de_passe', label: 'Mot de passe', type: 'password' }, { name: 'role', label: 'Role', type: 'select', required: true, options: [{ value: 'administrateur', label: 'Administrateur' }, { value: 'gestionnaire', label: 'Gestionnaire' }, { value: 'caissier', label: 'Caissier' }, { value: 'magasinier', label: 'Magasinier' }] }]}
    />
  );
}
