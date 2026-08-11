const router = require('express').Router();
const { body } = require('express-validator');
const validate = require('../middlewares/validate');
const { protect, authorize } = require('../middlewares/auth');
const upload = require('../middlewares/upload');
const c = require('../controllers/product.controller');
const { ROLES } = require('../config/constants');

const rules = [
  body('nom').trim().notEmpty().withMessage('Nom requis'),
  body('reference').trim().notEmpty().withMessage('Reference requise'),
  body('categorie_id').isInt({ min: 1 }).withMessage('Categorie requise'),
  body('marque_id').optional({ values: 'falsy' }).isInt({ min: 1 }),
  body('fournisseur_id').optional({ values: 'falsy' }).isInt({ min: 1 }),
  body('prix_achat').isFloat({ min: 0 }).withMessage("Prix d'achat invalide"),
  body('prix_vente').isFloat({ min: 0 }).withMessage('Prix de vente invalide'),
  body('quantite').optional().isInt({ min: 0 }).withMessage('Quantite invalide'),
  body('seuil_alerte').optional().isInt({ min: 0 }),
  body('garantie_mois').optional().isInt({ min: 0 }),
];

router.use(protect);
router.get('/', c.list);
router.get('/low-stock', c.lowStock);
router.get('/:id', c.detail);
router.post('/', authorize(ROLES.ADMIN, ROLES.MANAGER, ROLES.STOCK), upload.single('image'), rules, validate, c.create);
// En modification, seuls les champs reellement envoyes sont valides :
// une regle "required" sur un PUT partiel renvoyait un 422 silencieux cote client.
const updateRules = rules.map((rule) => rule.optional({ values: 'falsy' }));
router.put('/:id', authorize(ROLES.ADMIN, ROLES.MANAGER, ROLES.STOCK), upload.single('image'), updateRules, validate, c.update);
router.delete('/:id', authorize(ROLES.ADMIN, ROLES.MANAGER), c.remove);

module.exports = router;
