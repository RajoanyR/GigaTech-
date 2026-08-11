const asyncHandler = require('../utils/asyncHandler');
const { ok } = require('../utils/response');
const { pool } = require('../config/db');

/** GET /api/settings — table cle/valeur (une seule ligne logique). */
exports.get = asyncHandler(async (_req, res) => {
  const [rows] = await pool.query('SELECT * FROM parametres WHERE id = 1');
  ok(res, rows[0] || null);
});

/** PUT /api/settings */
exports.update = asyncHandler(async (req, res) => {
  const allowed = ['entreprise', 'adresse', 'telephone', 'email', 'devise', 'tva', 'logo', 'rccm', 'nif', 'site_web'];
  const payload = {};
  for (const k of allowed) if (req.body[k] !== undefined) payload[k] = req.body[k];
  if (req.file) payload.logo = `/uploads/${req.file.filename}`;
  if (Object.keys(payload).length) await pool.query('UPDATE parametres SET ? WHERE id = 1', [payload]);
  const [rows] = await pool.query('SELECT * FROM parametres WHERE id = 1');
  ok(res, rows[0], 'Parametres mis a jour');
});

/** GET /api/settings/backup — sauvegarde JSON des tables metier. */
exports.backup = asyncHandler(async (_req, res) => {
  const tables = ['categories', 'marques', 'fournisseurs', 'clients', 'employes', 'produits',
    'ventes', 'lignes_vente', 'achats', 'lignes_achat', 'mouvements_stock', 'paiements', 'parametres'];
  const dump = {};
  for (const t of tables) {
    const [rows] = await pool.query(`SELECT * FROM ${t}`);
    dump[t] = rows;
  }
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename="gigatech-backup-${Date.now()}.json"`);
  res.send(JSON.stringify({ generatedAt: new Date().toISOString(), data: dump }, null, 2));
});
