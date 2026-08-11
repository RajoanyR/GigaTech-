/** Helpers de formatage (montants, dates, libelles). */
export const formatMoney = (value, devise = 'USD') =>
  `${Number(value || 0).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${devise}`;

export const formatDate = (value) =>
  value ? new Date(value).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : '-';

export const formatDateTime = (value) =>
  value ? new Date(value).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-';

export const paymentLabel = {
  especes: 'Especes', mobile_money: 'Mobile Money',
  carte_bancaire: 'Carte bancaire', virement: 'Virement',
};

export const roleLabel = {
  administrateur: 'Administrateur', gestionnaire: 'Gestionnaire',
  caissier: 'Caissier', magasinier: 'Magasinier',
};

export const downloadBlob = (blob, filename) => {
  // L'ancre doit etre attachee au DOM et l'URL ne doit etre revoquee qu'APRES le clic,
  // sinon certains navigateurs annulent le telechargement et naviguent hors de l'app React.
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.rel = 'noopener';
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 1000);
};
