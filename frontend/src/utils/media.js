/** Construit l'URL absolue d'un fichier servi par le backend (/uploads/...). */
const SERVER = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';

export const fileUrl = (path) => {
  if (!path) return '';
  if (/^(https?:|blob:|data:)/.test(path)) return path;
  return `${SERVER}${path.startsWith('/') ? '' : '/'}${path}`;
};

export const ACCEPTED_IMAGES = 'image/jpeg,image/jpg,image/png,image/webp';

/** Valide un fichier image cote client (type + taille) avant envoi. */
export const validateImage = (file, maxMo = 3) => {
  if (!file) return null;
  const types = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!types.includes(file.type)) return 'Format non supporte : utilisez JPG, PNG ou WEBP';
  if (file.size > maxMo * 1024 * 1024) return `Image trop lourde (max ${maxMo} Mo)`;
  return null;
};
