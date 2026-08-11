import { FiTruck } from 'react-icons/fi';
import CrudPage from '../components/CrudPage';
import { supplierService } from '../services/crud.service';

export default function Suppliers() {
  return (
    <CrudPage
      title="Fournisseurs" subtitle="Partenaires d approvisionnement" icon={FiTruck} service={supplierService}
      labelSingular="Fournisseur"
      writeRoles={['administrateur', 'gestionnaire']}
      columns={[{ key: 'nom', label: 'Nom', sortable: true }, { key: 'societe', label: 'Societe' }, { key: 'telephone', label: 'Telephone' }, { key: 'email', label: 'Email' }, { key: 'ville', label: 'Ville' }, { key: 'pays', label: 'Pays' }]}
      fields={[{ name: 'nom', label: 'Nom', required: true }, { name: 'societe', label: 'Societe' }, { name: 'telephone', label: 'Telephone', required: true }, { name: 'email', label: 'Email', type: 'email' }, { name: 'ville', label: 'Ville' }, { name: 'pays', label: 'Pays' }, { name: 'adresse', label: 'Adresse', colSpan: 2 }]}
    />
  );
}
