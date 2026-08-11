# GigaTech — Guide de developpement etape par etape

## Etape 0 — Analyse
Application de gestion commerciale pour la vente de materiels informatiques :
authentification par roles, catalogue, stock, achats, ventes, facturation,
paiements, rapports, parametres. Architecture MVC, API REST, MySQL.

## Etape 1 — Arborescence
```
gigatech/
├─ backend/   (config, controllers, middlewares, models, routes, services, utils, uploads)
├─ frontend/  (src: assets, components, layouts, pages, hooks, services, context, routes, utils)
├─ database/  (gigatech_mysql.sql, sqlserver_tsql.sql)
└─ docs/      (MCD/MLD/MPD, tests Postman, ce guide)
```

## Etape 2 — Installation / commandes npm
```bash
# Base de donnees
mysql -u root -p < database/gigatech_mysql.sql

# Backend
cd backend && cp .env.example .env
npm install
npm run seed
npm run dev            # http://localhost:5000/api/health

# Frontend
cd ../frontend && cp .env.example .env
npm install
npm run dev            # http://localhost:5173
```

## Etape 3 — Configuration
`backend/.env` : DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, JWT_SECRET, CLIENT_URL.
`frontend/.env` : VITE_API_URL, VITE_SERVER_URL.

## Etape 4 — Base de donnees
14 tables, contraintes CHECK, cles etrangeres, index, 5 vues,
4 procedures stockees, 4 triggers. Voir `database/gigatech_mysql.sql`.
Version T-SQL et exercices analytiques : `database/sqlserver_tsql.sql`.

## Etape 5 — Backend (MVC)
- `models/` : acces MySQL parametre (anti injection), transactions pour ventes/achats/stock.
- `controllers/` : logique HTTP, fabrique CRUD generique.
- `routes/` : validation express-validator + middlewares `protect` / `authorize`.
- `services/` : facture PDF (QR code) et exports Excel/PDF.
- Securite : Helmet, CORS, rate limiting sur le login, Bcrypt (12 rounds), JWT.

## Etape 6 — Frontend
- Contextes : `AuthContext` (session JWT), `ThemeContext` (clair/sombre).
- Design system dans `src/index.css` + `tailwind.config.js` (aucun style ad hoc).
- Composants : DataTable, Modal, StatCard, Loader, Skeleton, Sidebar retractable, Navbar.
- Pages : dashboard Recharts, catalogue, stock, POS, achats, paiements, rapports, parametres.
- UX : Toastify, SweetAlert2 (confirmation avant suppression), Framer Motion, pages 403/404/500.

## Etape 7 — Verification
1. `GET /api/health` repond `success: true`.
2. Connexion `admin@gigatech.com` / `Admin@123`.
3. Creer une categorie, une marque, un produit avec image.
4. Enregistrer un achat puis le valider → le stock augmente.
5. Enregistrer une vente → stock diminue, facture PDF generee.
6. Consulter les rapports puis exporter en Excel et PDF.

## Roles et permissions
| Module | Admin | Gestionnaire | Caissier | Magasinier |
|---|---|---|---|---|
| Tableau de bord | ✅ | ✅ | ✅ | ✅ |
| Produits (ecriture) | ✅ | ✅ | lecture | ✅ |
| Stock | ✅ | ✅ | — | ✅ |
| Ventes | ✅ | ✅ | ✅ | lecture |
| Achats | ✅ | ✅ | — | creation |
| Rapports | ✅ | ✅ | — | — |
| Utilisateurs / Parametres | ✅ | — | — | — |
