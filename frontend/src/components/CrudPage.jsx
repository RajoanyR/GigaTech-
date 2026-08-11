import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { FiEdit2, FiPlus, FiTrash2 } from 'react-icons/fi';
import { toast } from 'react-toastify';
import PageHeader from './PageHeader';
import DataTable from './DataTable';
import Modal from './Modal';
import FormField from './FormField';
import RoleGate from './RoleGate';
import usePaginatedList from '../hooks/usePaginatedList';
import { confirmDelete } from '../utils/confirm';

/**
 * Page CRUD generique pilotee par configuration : mutualise le tableau,
 * la modale de formulaire, la validation et la confirmation de suppression.
 *
 * fields = [{ name, label, type, required, options, colSpan, ... }]
 */
export default function CrudPage({
  title, subtitle, icon, service, columns, fields,
  writeRoles = ['administrateur', 'gestionnaire'],
  deleteRoles = ['administrateur'],
  labelSingular = 'element',
}) {
  const list = usePaginatedList(service);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();

  const openCreate = () => { setEditing(null); reset({}); setOpen(true); };
  const openEdit = (row) => { setEditing(row); reset(row); setOpen(true); };

  const onSubmit = async (values) => {
    try {
      if (editing) {
        await service.update(editing.id, values);
        toast.success(`${labelSingular} modifie avec succes`);
      } else {
        await service.create(values);
        toast.success(`${labelSingular} ajoute avec succes`);
      }
      setOpen(false);
      list.reload();
    } catch { /* le message est deja affiche par l'intercepteur Axios */ }
  };

  const onDelete = async (row) => {
    if (!(await confirmDelete(`Supprimer definitivement : ${row.nom || row.id} ?`))) return;
    await service.remove(row.id);
    toast.success(`${labelSingular} supprime`);
    list.reload();
  };

  const allColumns = [
    ...columns,
    {
      key: 'actions', label: 'Actions', className: 'text-right',
      render: (row) => (
        <div className="flex justify-end gap-1.5">
          <RoleGate roles={writeRoles}>
            <button onClick={() => openEdit(row)} title="Modifier"
              className="rounded-lg p-2 text-slate-500 hover:bg-brand-50 hover:text-brand-600 dark:hover:bg-slate-800">
              <FiEdit2 />
            </button>
          </RoleGate>
          <RoleGate roles={deleteRoles}>
            <button onClick={() => onDelete(row)} title="Supprimer"
              className="rounded-lg p-2 text-slate-500 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-slate-800">
              <FiTrash2 />
            </button>
          </RoleGate>
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title={title} subtitle={subtitle} icon={icon}
        actions={<RoleGate roles={writeRoles}><button className="btn-primary" onClick={openCreate}><FiPlus /> Ajouter</button></RoleGate>}
      />

      <DataTable
        columns={allColumns} rows={list.rows} meta={list.meta} loading={list.loading}
        query={list.query} onSearch={list.setSearch} onPage={list.setPage} onSort={list.setSort}
      />

      <Modal
        open={open} onClose={() => setOpen(false)}
        title={editing ? `Modifier : ${title}` : `Nouveau : ${title}`}
        footer={
          <>
            <button className="btn-ghost" onClick={() => setOpen(false)}>Annuler</button>
            <button className="btn-primary" disabled={isSubmitting} onClick={handleSubmit(onSubmit)}>
              {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </>
        }
      >
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 sm:grid-cols-2">
          {fields.map((f) => (
            <FormField key={f.name} label={f.label} error={errors[f.name]} className={f.colSpan === 2 ? 'sm:col-span-2' : ''}>
              {f.type === 'select' ? (
                <select className="input" {...register(f.name, { required: f.required && 'Champ obligatoire' })}>
                  <option value="">— Choisir —</option>
                  {f.options?.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              ) : f.type === 'textarea' ? (
                <textarea rows={3} className="input" placeholder={f.placeholder}
                  {...register(f.name, { required: f.required && 'Champ obligatoire' })} />
              ) : (
                <input type={f.type || 'text'} step={f.step} className="input" placeholder={f.placeholder}
                  {...register(f.name, {
                    required: f.required && 'Champ obligatoire',
                    ...(f.type === 'email' ? { pattern: { value: /^\S+@\S+$/, message: 'Email invalide' } } : {}),
                    ...(f.min !== undefined ? { min: { value: f.min, message: `Minimum ${f.min}` } } : {}),
                  })} />
              )}
            </FormField>
          ))}
        </form>
      </Modal>
    </>
  );
}
