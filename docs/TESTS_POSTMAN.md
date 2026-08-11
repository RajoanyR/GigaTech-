# Tests Postman — API GigaTech

Base URL : `http://localhost:5000/api`
Variables de collection : `{{baseUrl}}`, `{{token}}`

## 1. Authentification
| Methode | URL | Corps |
|---|---|---|
| POST | /auth/login | `{"email":"admin@gigatech.com","mot_de_passe":"Admin@123"}` |
| GET | /auth/me | — (Bearer {{token}}) |
| PUT | /auth/password | `{"ancien_mot_de_passe":"Admin@123","nouveau_mot_de_passe":"Nouveau@123"}` |
| POST | /auth/forgot-password | `{"email":"admin@gigatech.com"}` |
| POST | /auth/reset-password | `{"token":"...","nouveau_mot_de_passe":"Nouveau@123"}` |
| POST | /auth/logout | — |

Script de test (onglet Tests du login) :
```js
pm.test("Connexion OK", () => pm.response.to.have.status(200));
pm.collectionVariables.set("token", pm.response.json().data.token);
```

## 2. Modules CRUD (meme schema pour tous)
`categories`, `brands`, `suppliers`, `clients`, `employees`, `users`, `payments`
| Methode | URL |
|---|---|
| GET | /categories?page=1&limit=10&search=PC&sortBy=nom&order=asc |
| GET | /categories/1 |
| POST | /categories — `{"nom":"Webcams","description":"Cameras USB"}` |
| PUT | /categories/1 — `{"nom":"Webcams HD"}` |
| DELETE | /categories/1 |

## 3. Produits
- GET `/products?search=hp&categorie_id=1&stock=faible&page=1`
- GET `/products/low-stock`
- POST `/products` (form-data : reference, nom, categorie_id, prix_achat, prix_vente, quantite, image)
- PUT `/products/:id`, DELETE `/products/:id`

## 4. Stock
- GET `/stock/history?type=entree`
- GET `/stock/alerts`
- POST `/stock/move` — `{"produit_id":1,"type":"entree","quantite":10,"motif":"Reappro"}`

## 5. Achats
- POST `/purchases` — `{"fournisseur_id":1,"lignes":[{"produit_id":1,"quantite":5,"prix_unitaire":700}]}`
- PATCH `/purchases/:id/validate`  → le stock augmente
- DELETE `/purchases/:id` (brouillon uniquement)

## 6. Ventes et facturation
- POST `/sales` — `{"client_id":1,"remise":5,"tva":16,"mode_paiement":"especes","lignes":[{"produit_id":1,"quantite":2}]}`
- GET `/sales/:id` — detail avec lignes et paiements
- GET `/sales/:id/invoice` — facture PDF (Send and Download)
- PATCH `/sales/:id/cancel` — restitue le stock

## 7. Dashboard et rapports
- GET `/dashboard`
- GET `/reports/sales?from=2026-01-01&to=2026-12-31&groupBy=month`
- GET `/reports/purchases`
- GET `/reports/export/excel`, GET `/reports/export/pdf`

## 8. Parametres
- GET `/settings`, PUT `/settings` (form-data avec logo), GET `/settings/backup`

## Cas d'erreur a verifier
| Scenario | Attendu |
|---|---|
| Login avec mauvais mot de passe | 401 « Identifiants incorrects » |
| Requete sans token | 401 « Non authentifie » |
| Caissier qui supprime un produit | 403 « Role non autorise » |
| Produit sans reference | 400 + liste des champs invalides |
| Vente avec quantite > stock | 500/400 « Stock insuffisant » |
| Categorie deja existante | 409 « Cet enregistrement existe deja » |
