import { FiTag } from 'react-icons/fi';
import CrudPage from '../components/CrudPage';
import { categoryService } from '../services/crud.service';

export default function Categories() {
  return (
    <CrudPage
      title="Categories" subtitle="Organisation du catalogue produits" icon={FiTag} service={categoryService}
      labelSingular="Categorie"
      writeRoles={['administrateur', 'gestionnaire']}
      columns={[{ key: 'nom', label: 'Nom', sortable: true }, { key: 'description', label: 'Description' }]}
      fields={[{ name: 'nom', label: 'Nom de la categorie', required: true }, { name: 'description', label: 'Description', type: 'textarea', colSpan: 2 }]}
    />
  );
}
