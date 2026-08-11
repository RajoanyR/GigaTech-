# Modelisation de la base GigaTech

## MCD (entites / associations)
```text
UTILISATEUR (id, nom, prenom, email, mot_de_passe, role, telephone, actif)
EMPLOYE (id, nom, prenom, poste, telephone, email, salaire, date_embauche)
CATEGORIE (id, nom, description)
MARQUE (id, nom, pays, logo)
FOURNISSEUR (id, nom, telephone, email, adresse, societe, ville, pays)
CLIENT (id, nom, prenom, telephone, email, adresse, ville, type_client)
PRODUIT (id, reference, code_barres, nom, description, prix_achat, prix_vente,
         quantite, seuil_alerte, image, garantie_mois)
VENTE (id, numero, sous_total, remise, tva, total, statut, mode_paiement, date_vente)
ACHAT (id, numero, total, statut, date_achat)
PAIEMENT (id, montant, mode, statut, reference)
MOUVEMENT_STOCK (id, type, quantite, motif, reference, date)
PARAMETRES (id, entreprise, adresse, devise, tva, logo, rccm, nif)

Associations :
  CATEGORIE   1,N ── classe ──   1,1 PRODUIT
  MARQUE      0,N ── fabrique ── 0,1 PRODUIT
  FOURNISSEUR 0,N ── fournit ──  0,1 PRODUIT
  CLIENT      0,N ── passe ──    0,1 VENTE
  UTILISATEUR 0,N ── saisit ──   0,1 VENTE / ACHAT / MOUVEMENT
  VENTE       1,N ── contient (quantite, prix_unitaire) ── 1,N PRODUIT
  ACHAT       1,N ── contient (quantite, prix_unitaire) ── 1,N PRODUIT
  VENTE       1,N ── reglee par ── 1,1 PAIEMENT
  PRODUIT     1,N ── genere ──     1,1 MOUVEMENT_STOCK / ALERTE
```

## MLD (relationnel)
```text
utilisateurs(#id, nom, prenom, email, mot_de_passe, role, telephone, avatar, actif)
employes(#id, nom, prenom, poste, telephone, email, adresse, salaire, date_embauche, actif)
categories(#id, nom, description)
marques(#id, nom, pays, logo, description)
fournisseurs(#id, nom, telephone, email, adresse, societe, ville, pays)
clients(#id, nom, prenom, telephone, email, adresse, ville, type_client)
produits(#id, reference, code_barres, nom, description, prix_achat, prix_vente,
         quantite, seuil_alerte, image, garantie_mois, actif,
         categorie_id=>categories, marque_id=>marques, fournisseur_id=>fournisseurs)
achats(#id, numero, total, statut, note, date_achat,
       fournisseur_id=>fournisseurs, utilisateur_id=>utilisateurs)
lignes_achat(#id, quantite, prix_unitaire, total_ligne, achat_id=>achats, produit_id=>produits)
ventes(#id, numero, sous_total, remise, montant_remise, tva, montant_tva, total,
       statut, mode_paiement, note, date_vente,
       client_id=>clients, utilisateur_id=>utilisateurs)
lignes_vente(#id, quantite, prix_unitaire, total_ligne, vente_id=>ventes, produit_id=>produits)
paiements(#id, montant, mode, statut, reference, vente_id=>ventes, utilisateur_id=>utilisateurs)
mouvements_stock(#id, type, quantite, motif, reference, created_at,
                 produit_id=>produits, utilisateur_id=>utilisateurs)
alertes_stock(#id, message, niveau, vue, produit_id=>produits)
parametres(#id, entreprise, adresse, telephone, email, site_web, rccm, nif, devise, tva, logo)
```

## MPD
Implementation physique complete (types, CHECK, ON DELETE/UPDATE, index,
vues, procedures, triggers) : `database/gigatech_mysql.sql`.

## Diagramme relationnel (simplifie)
```text
categories ─┐
marques ────┼──> produits ──┬──> lignes_vente ──> ventes ──> paiements
fournisseurs┘               ├──> lignes_achat ──> achats
                            ├──> mouvements_stock
                            └──> alertes_stock
utilisateurs ──> ventes / achats / mouvements_stock
clients ──> ventes
```
