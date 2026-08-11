import axios from 'axios';
import { toast } from 'react-toastify';

/** Instance Axios centralisee : token JWT + gestion globale des erreurs. */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 30000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('gigatech_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;

  // Ne jamais forcer un Content-Type sur un FormData :
  // le navigateur genere lui-meme le boundary multipart.
  if (config.data instanceof FormData && config.headers) {
    delete config.headers['Content-Type'];
  }

  return config;
});

/** Les reponses d'erreur d'un telechargement (responseType: 'blob') sont des Blob JSON. */
async function readBlobMessage(data) {
  try {
    const text = await data.text();
    return JSON.parse(text)?.message;
  } catch {
    return null;
  }
}

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const status = error.response?.status;
    let message = 'Erreur reseau, verifiez que le backend est demarre';

    if (error.response?.data instanceof Blob) {
      message = (await readBlobMessage(error.response.data)) || message;
    } else if (error.response?.data) {
      const data = error.response.data;
      message = data.message || message;

      // Erreurs de validation express-validator
      if (Array.isArray(data.errors) && data.errors.length) {
        message = data.errors
          .map((e) => e.msg || e.message)
          .join(' · ');
      }
    }

    const url = error.config?.url || '';

    if (status === 401 && !url.includes('/auth/login')) {
      localStorage.removeItem('gigatech_token');
      localStorage.removeItem('gigatech_user');

      toast.error('Session expiree, veuillez vous reconnecter');

      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    } else {
      // Ne pas afficher une erreur reseau generique pendant un telechargement fichier
      if (error.config?.responseType !== 'blob') {
        toast.error(message);
      }
    }

    error.uiMessage = message;
    return Promise.reject(error);
  }
);

export default api;