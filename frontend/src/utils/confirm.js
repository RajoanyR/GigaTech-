import Swal from 'sweetalert2';

/** Confirmation avant suppression (SweetAlert2), theme GigaTech. */
export const confirmDelete = async (text = 'Cette action est irreversible.') => {
  const res = await Swal.fire({
    title: 'Confirmer la suppression ?',
    text,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Oui, supprimer',
    cancelButtonText: 'Annuler',
    confirmButtonColor: '#e11d48',
    cancelButtonColor: '#64748b',
    reverseButtons: true,
  });
  return res.isConfirmed;
};

export const confirmAction = async (title, text) => {
  const res = await Swal.fire({
    title, text, icon: 'question', showCancelButton: true,
    confirmButtonText: 'Confirmer', cancelButtonText: 'Annuler',
    confirmButtonColor: '#1a5eeb', reverseButtons: true,
  });
  return res.isConfirmed;
};
