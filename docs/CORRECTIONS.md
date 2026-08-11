# GigaTech — Rapport de corrections

Tous les bugs signalés ont été corrigés, testés et documentés ci-dessous.

---

## 1. Sauvegarde (Paramètres) : demande d'authentification / sort de l'application

### Cause
`Settings.jsx` utilisait un lien natif :

```jsx
<a href="http://localhost:5000/api/settings/backup">Sauvegarder</a>
```

Un `<a href>` provoque une **navigation navigateur complète** : React est déchargé et la
requête part **sans l'en-tête `Authorization`** (l'intercepteur Axios n'est jamais appelé).
Le backend répond alors `401 Non authentifié`, d'où l'impression de « déconnexion ».

### Correction
- `backend/routes/setting.routes.js` : la route de backup reste protégée (`admin`).
- `frontend/src/services/business.service.js` : ajout de
  `settingsService.backup()` avec `responseType: 'blob'`.
- `frontend/src/pages/Settings.jsx` : bouton (et non lien) → appel Axios authentifié +
  `downloadBlob()`, avec état de chargement et toast d'erreur.

```js
// business.service.js
backup: () => api.get('/settings/backup', { responseType: 'blob' })
```

---

## 2. Photo de profil : l'avatar ne se met pas à jour

### Causes
1. `auth.service.js` forçait `Content-Type: multipart/form-data` **sans boundary** :
   Multer ne pouvait pas parser le corps → aucun fichier reçu.
2. Aucun aperçu local, aucune mise à jour du contexte `auth` après réponse :
   l'ancienne image restait affichée (et le `Navbar` n'affichait pas d'avatar du tout).

### Correction
- `frontend/src/services/api.js` : l'intercepteur **supprime** tout `Content-Type` manuel
  quand le corps est un `FormData` (Axios/navigateur écrit alors le boundary correct).
- `frontend/src/pages/Profile.jsx` : aperçu instantané (`URL.createObjectURL`),
  validation type/taille, puis `setUser()` avec la réponse serveur.
- `frontend/src/components/Navbar.jsx` : affichage de l'avatar (fallback initiales).
- `frontend/src/utils/media.js` (nouveau) : `fileUrl()` construit l'URL absolue
  `${API_ORIGIN}/uploads/...` de façon centralisée.

---

## 3. Images produits : ajout / modification non fonctionnels

### Causes
1. Même problème de `Content-Type` manuel sur le `FormData`.
2. `product.routes.js` imposait `notEmpty()` sur les champs en **PUT** : modifier un produit
   sans re-sélectionner l'image renvoyait un `422` silencieux.
3. Aucun aperçu ni affichage de l'image dans la liste.

### Correction
- `backend/routes/product.routes.js` : règles `.optional()` pour la mise à jour
  (validation stricte conservée en création).
- `backend/middlewares/upload.js` : `multer.single()` encapsulé pour convertir les erreurs
  Multer (`LIMIT_FILE_SIZE`, type refusé…) en messages clairs `400`.
- `frontend/src/pages/Products.jsx` : miniature dans le tableau, aperçu dans la modale,
  suppression de l'aperçu après enregistrement, envoi du champ image **seulement s'il change**.

---

## 4. Export PDF : « Route introuvable »

### Causes
1. Le téléchargement passait par un lien/`window.open` → mauvaise URL et pas de token.
2. `downloadBlob()` révoquait l'URL objet **avant** que le navigateur ait lancé le
   téléchargement, et l'ancre n'était pas insérée dans le DOM (bloqué sur Firefox/Safari).
3. Les erreurs renvoyées en `Blob` (car `responseType: 'blob'`) affichaient
   `[object Blob]` au lieu du message réel.

### Correction
- `frontend/src/utils/format.js` : `downloadBlob()` insère l'ancre dans le DOM et révoque
  l'URL dans un `setTimeout`.
- `frontend/src/services/api.js` : les réponses d'erreur de type `Blob` sont relues en texte
  et re-parsées en JSON pour afficher le vrai message.
- `frontend/src/pages/Reports.jsx`, `Sales.jsx`, `NewSale.jsx` : téléchargements Axios
  authentifiés avec état de chargement.
- `backend/app.js` : route `GET /` + `GET /api/health` (fin des `Cannot GET /`), et le
  handler 404 précise la route fautive : `Route introuvable : /api/xxx`.

### Générateur PDF réécrit (`backend/services/export.service.js`)
- En-tête avec logo/entreprise, titre, période et date d'édition **répétés sur chaque page**.
- Tableau à colonnes alignées, lignes zébrées, en-têtes en gras.
- Pagination automatique + pied de page « Page x / y ».
- Bloc TOTAL mis en évidence.
- Correctif typographique : `toLocaleString('fr-FR')` produit une espace insécable étroite
  absente des polices PDF standard — elle s'affichait comme `/` (`1 /234,50`). Elle est
  désormais normalisée (`1 234,50`). Même correctif dans `invoice.service.js`.

Aperçus réels : `docs/apercu/rapport-pdf-page1.jpg` et `page2.jpg`.

---

## 5. Robustesse générale

| Fichier | Correction |
| --- | --- |
| `backend/middlewares/errorHandler.js` | Messages explicites pour `ER_ACCESS_DENIED_ERROR`, `ECONNREFUSED`, erreurs Multer |
| `backend/app.js` | Route racine, health check, 404 détaillé, `/uploads` servi en statique |
| `frontend/src/services/api.js` | Affichage de **toutes** les erreurs de validation (422), pas seulement la première |
| `frontend/src/utils/media.js` | Validation type/poids côté client avant upload |

---

## 6. UI / UX

- Cartes : ombre douce animée au survol, coins arrondis 2xl.
- Boutons : micro-interaction `active:scale`, focus ring accessible, curseur `not-allowed`.
- Champs : ombre légère, transitions, contraste renforcé en Dark Mode.
- Tableaux : en-têtes translucides, lignes au survol, miniatures d'images.
- Skeletons de chargement conservés, transitions Framer Motion sur les pages.

---

## Vérifications effectuées

- `node --check` sur **tous** les fichiers backend : OK.
- Chargement complet de `app.js` (toutes routes/middlewares) : OK.
- Smoke-test HTTP : `/` → 200, `/api/health` → 200, route inconnue → 404 explicite,
  routes protégées → 401, préflight CORS → 204.
- Build frontend de production (Vite) : OK.
- PDF généré sur 40 et 60 lignes, converti en images et inspecté page par page : layout,
  pagination, alignement et formats numériques validés.
