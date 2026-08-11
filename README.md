# GigaTech — Gestion de vente de matériels informatiques

Application full stack professionnelle (MVC) :
- **backend/** : NodeJS + ExpressJS + MySQL (JWT, Bcrypt, Multer, Helmet, Morgan, Cors, express-validator)
- **frontend/** : ReactJS + React Router DOM + Axios + Tailwind CSS + React Icons + Framer Motion + Recharts + React Hook Form + SweetAlert2 + React Toastify
- **database/** : script MySQL complet (contraintes, index, vues, procédures, triggers) + exercices SQL Server (T-SQL)
- **docs/** : MCD / MLD / MPD, diagramme relationnel, tests Postman, guide étape par étape

## Installation rapide

```bash
# 1) Base de données
# Importer le fichier SQL fourni dans phpMyAdmin
# Base de données : gigatech
# Fichier : gigatech.sql

# 2) Backend
cd backend
cp .env.example .env      # renseigner DB_* et JWT_SECRET
npm install
npm run dev               # http://localhost:5000

# 3) Frontend
cd ../frontend
cp .env.example .env
npm install
npm run dev               # http://localhost:5173
```

## Comptes de démonstration
| Rôle | Email | Mot de passe |
|---|---|---|
| Administrateur | admin@gigatech.com | Admin@123 |
| Gestionnaire | gestionnaire@gigatech.com | Gest@123 |
| Caissier | caissier@gigatech.com | Caisse@123 |
| Magasinier | magasinier@gigatech.com | Magasin@123 |

Voir `docs/GUIDE_ETAPES.md` pour la démarche complète module par module.
