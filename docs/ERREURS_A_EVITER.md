# Erreurs fréquentes à éviter (et comment les résoudre)

## Uploads de fichiers

1. **Ne jamais définir `Content-Type: multipart/form-data` à la main.**
   Sans le `boundary`, Multer ne parse rien et `req.file` est `undefined`.
   Laissez Axios/le navigateur écrire l'en-tête à partir du `FormData`.
2. **Ne pas envoyer un champ image vide en modification.** Un `FormData` avec une valeur
   vide écrase le chemin existant en base : n'ajoutez le champ que si un fichier est choisi.
3. **Validation `notEmpty()` sur un PUT** → `422` incompréhensible. Utilisez `.optional()`
   pour les mises à jour partielles.
4. **Chemins d'images** : stockez un chemin relatif (`uploads/produits/x.jpg`) en base et
   construisez l'URL absolue côté client (`utils/media.js`), jamais l'inverse.

## Téléchargements protégés (PDF, Excel, backup)

5. **Ne jamais utiliser `<a href="http://localhost:5000/api/...">`** pour une route protégée :
   la navigation native ignore l'intercepteur JWT → `401` et sortie de l'application SPA.
   Utilisez Axios avec `responseType: 'blob'` puis un téléchargement programmatique.
6. **`URL.revokeObjectURL()` trop tôt** annule le téléchargement. Insérez l'ancre dans le DOM,
   cliquez, puis révoquez dans un `setTimeout`.
7. **Erreurs en `responseType: 'blob'`** : le message d'erreur JSON arrive en `Blob`.
   Relisez-le (`await error.response.data.text()`) sinon vous affichez `[object Blob]`.

## PDFKit

8. **Écrire du texte trop bas dans la page crée une page vide** : PDFKit ajoute
   automatiquement une page si `y` dépasse `height - margin`. Gardez le pied de page au-dessus
   de cette limite (`lineBreak: false` en prime).
9. **`toLocaleString('fr-FR')` contient une espace insécable étroite (U+202F)** absente des
   polices PDF standard : elle s'affiche comme `/`. Normalisez-la en espace simple.
10. **Répétez l'en-tête du tableau après chaque saut de page**, sinon les pages 2+ sont
    illisibles.

## Authentification / API

11. **`Cannot GET /`** : ce n'est pas un bug, le backend n'est pas un site web. Ajoutez une
    route racine informative et travaillez sur `http://localhost:5173`.
12. **CORS** : `CLIENT_URL` du backend doit correspondre exactement à l'origine du frontend
    (port compris), sinon les requêtes authentifiées échouent en préflight.
13. **Token expiré** : traitez le `401` dans l'intercepteur (déconnexion + redirection),
    jamais dans chaque page.
14. **N'affichez pas seulement la première erreur de validation** : listez toutes les entrées
    de `errors[]`, sinon l'utilisateur corrige un champ à la fois.

## Base de données

15. **`ER_ACCESS_DENIED_ERROR` / `ECONNREFUSED`** : mot de passe MySQL ou service arrêté.
    Le `errorHandler` renvoie désormais un message explicite au lieu d'un `500` opaque.
16. **Ventes et mouvements de stock doivent être transactionnels** (`beginTransaction` /
    `rollback`), sinon un échec partiel laisse un stock incohérent.
17. **Ne supprimez jamais physiquement** une ligne référencée (client avec ventes, catégorie
    avec produits) : contrainte FK → utilisez la désactivation logique.

## Frontend

18. **`useEffect` sans tableau de dépendances** sur un appel API → boucle de requêtes infinie.
19. **Aperçu d'image** : révoquez l'`objectURL` au démontage pour éviter les fuites mémoire.
20. **Ne stockez pas le JWT dans le state seul** : au rafraîchissement la session est perdue —
    `localStorage` + réhydratation au démarrage.
