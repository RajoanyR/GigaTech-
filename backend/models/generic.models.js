const BaseModel = require('./base.model');

/** Modeles CRUD simples derives du modele de base. */
module.exports = {
  Category: new BaseModel('categories', {
    fillable: ['nom', 'description'],
    searchable: ['nom', 'description'],
    sortable: ['id', 'nom', 'created_at'],
  }),
  Brand: new BaseModel('marques', {
    fillable: ['nom', 'pays', 'logo', 'description'],
    searchable: ['nom', 'pays'],
    sortable: ['id', 'nom', 'created_at'],
  }),
  Supplier: new BaseModel('fournisseurs', {
    fillable: ['nom', 'telephone', 'email', 'adresse', 'societe', 'ville', 'pays'],
    searchable: ['nom', 'email', 'telephone', 'societe', 'ville'],
    sortable: ['id', 'nom', 'societe', 'created_at'],
  }),
  Client: new BaseModel('clients', {
    fillable: ['nom', 'prenom', 'telephone', 'email', 'adresse', 'type_client', 'ville'],
    searchable: ['nom', 'prenom', 'email', 'telephone'],
    sortable: ['id', 'nom', 'created_at'],
  }),
  Employee: new BaseModel('employes', {
    fillable: ['nom', 'prenom', 'poste', 'telephone', 'email', 'adresse', 'salaire', 'date_embauche', 'actif'],
    searchable: ['nom', 'prenom', 'poste', 'email'],
    sortable: ['id', 'nom', 'poste', 'date_embauche'],
  }),
  Payment: new BaseModel('paiements', {
    fillable: ['vente_id', 'montant', 'mode', 'statut', 'reference', 'utilisateur_id'],
    searchable: ['mode', 'statut', 'reference'],
    sortable: ['id', 'montant', 'created_at'],
  }),
};
