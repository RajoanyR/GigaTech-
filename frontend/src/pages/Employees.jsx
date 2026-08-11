import { FiUserCheck } from 'react-icons/fi';
import CrudPage from '../components/CrudPage';
import { employeeService } from '../services/crud.service';
import { formatMoney } from '../utils/format';

export default function Employees() {
  return (
    <CrudPage
      title="Employes" subtitle="Personnel de l entreprise" icon={FiUserCheck} service={employeeService}
      labelSingular="Employe"
      writeRoles={['administrateur', 'gestionnaire']}
      columns={[{ key: 'nom', label: 'Nom', sortable: true }, { key: 'prenom', label: 'Prenom' }, { key: 'poste', label: 'Poste', sortable: true }, { key: 'telephone', label: 'Telephone' }, { key: 'salaire', label: 'Salaire', render: (r) => formatMoney(r.salaire) }]}
      fields={[{ name: 'nom', label: 'Nom', required: true }, { name: 'prenom', label: 'Prenom' }, { name: 'poste', label: 'Poste', required: true }, { name: 'telephone', label: 'Telephone' }, { name: 'email', label: 'Email', type: 'email' }, { name: 'salaire', label: 'Salaire', type: 'number', step: '0.01', min: 0 }, { name: 'date_embauche', label: "Date d'embauche", type: 'date' }, { name: 'adresse', label: 'Adresse', colSpan: 2 }]}
    />
  );
}
