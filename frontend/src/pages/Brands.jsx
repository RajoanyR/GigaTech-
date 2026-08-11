import { FiAward } from 'react-icons/fi';
import CrudPage from '../components/CrudPage';
import { brandService } from '../services/crud.service';

export default function Brands() {
  return (
    <CrudPage
      title="Marques" subtitle="Constructeurs et fabricants" icon={FiAward} service={brandService}
      labelSingular="Marque"
      writeRoles={['administrateur', 'gestionnaire']}
      columns={[{ key: 'nom', label: 'Marque', sortable: true }, { key: 'pays', label: 'Pays' }, { key: 'description', label: 'Description' }]}
      fields={[{ name: 'nom', label: 'Nom de la marque', required: true }, { name: 'pays', label: 'Pays' }, { name: 'description', label: 'Description', type: 'textarea', colSpan: 2 }]}
    />
  );
}
