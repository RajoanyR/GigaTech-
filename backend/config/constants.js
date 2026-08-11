/** Constantes metier partagees par toute l'application. */
module.exports = {
  ROLES: { ADMIN: 'administrateur', MANAGER: 'gestionnaire', CASHIER: 'caissier', STOCK: 'magasinier' },
  MOVEMENT_TYPES: ['entree', 'sortie', 'ajustement'],
  PAYMENT_METHODS: ['especes', 'mobile_money', 'carte_bancaire', 'virement'],
  SALE_STATUS: ['brouillon', 'validee', 'annulee'],
  PURCHASE_STATUS: ['brouillon', 'validee', 'annulee'],
  DEFAULT_PAGE_SIZE: 10,
};
