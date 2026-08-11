# GigaTech — Guide d'installation (pas à pas)

## 0. Prérequis

| Outil | Version conseillée |
| --- | --- |
| Node.js | 18 ou 20 LTS |
| npm | 9+ |
| MySQL | 8.0 (ou MariaDB 10.6+) |
| Navigateur | Chrome / Edge / Firefox à jour |

Vérification :

```bash
node -v
npm -v
mysql --version
```

---

## 1. Base de données MySQL

```bash
mysql -u root -p < database/gigatech_mysql.sql
```

Le script crée la base `gigatech`, toutes les tables, les vues, les procédures, les
déclencheurs et les données de démonstration.

Vérification :

```sql
USE gigatech;
SHOW TABLES;
SELECT COUNT(*) FROM produits;
```

---

## 2. Backend

```bash
cd backend
npm install
cp .env.example .env
```

Éditez `.env` :

```env
PORT=5000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=votre_mot_de_passe
DB_NAME=gigatech

JWT_SECRET=changez_cette_valeur_par_une_chaine_longue_et_aleatoire
JWT_EXPIRES_IN=7d

CLIENT_URL=http://localhost:5173
UPLOAD_DIR=uploads
MAX_FILE_SIZE=5242880
```

Créez les dossiers d'upload (créés automatiquement au démarrage, mais au cas où) :

```bash
mkdir -p uploads/produits uploads/avatars uploads/logos backups
```

Démarrage :

```bash
npm run dev      # nodemon
# ou
npm start
```

Vérification :

```bash
curl http://localhost:5000/api/health
# {"success":true,"message":"API GigaTech operationnelle"}
```

---

## 3. Frontend

```bash
cd frontend
npm install
cp .env.example .env
```

`frontend/.env` :

```env
VITE_API_URL=http://localhost:5000/api
```

Démarrage :

```bash
npm run dev
```

Ouvrez http://localhost:5173

---

## 4. Comptes de démonstration

| Rôle | Email | Mot de passe |
| --- | --- | --- |
| Administrateur | admin@gigatech.mg | Admin@123 |
| Gestionnaire | gestion@gigatech.mg | Gestion@123 |
| Vendeur | vente@gigatech.mg | Vente@123 |
| Comptable | compta@gigatech.mg | Compta@123 |

> Changez ces mots de passe avant toute mise en production.

---

## 5. Tester les fonctionnalités corrigées

1. **Photo de profil** — menu utilisateur → *Profil* → cliquez sur l'icône appareil photo →
   choisissez une image → *Enregistrer*. L'avatar change immédiatement dans la barre du haut.
2. **Image produit** — *Produits* → *Nouveau* → renseignez le produit + image → la miniature
   apparaît dans la liste. En modification, l'image reste inchangée si vous n'en choisissez pas.
3. **Export PDF** — *Rapports* → *Exporter PDF*. Le fichier se télécharge (aperçu :
   `docs/apercu/rapport-pdf-page1.jpg`).
4. **Facture** — *Ventes* → icône facture d'une ligne → PDF avec QR Code.
5. **Sauvegarde** — *Paramètres* → *Télécharger la sauvegarde*. Un `.sql` est téléchargé
   sans jamais quitter l'application.

---

## 6. Build de production

```bash
cd frontend && npm run build       # génère frontend/dist
cd ../backend && NODE_ENV=production npm start
```

Servez `frontend/dist` derrière Nginx (ou tout serveur statique) et proxifiez `/api` et
`/uploads` vers le port 5000.

---

## 7. Scripts SQL Server (exercices T-SQL)

`database/sqlserver_tsql.sql` s'exécute dans SSMS ou Azure Data Studio. Il est indépendant
de l'application MySQL et couvre les exercices avancés (CTE, fonctions de fenêtrage,
procédures, transactions, index).
