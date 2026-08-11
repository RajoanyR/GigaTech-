const { pool, withTransaction } = require('../config/db');
const ProductModel = require('./product.model');

class StockModel {
  async history({ page, limit, offset, search, produit_id, type }) {
    const where = [];
    const params = [];
    if (search) { where.push('(p.nom LIKE ? OR ms.reference LIKE ?)'); params.push(`%${search}%`, `%${search}%`); }
    if (produit_id) { where.push('ms.produit_id = ?'); params.push(produit_id); }
    if (type) { where.push('ms.type = ?'); params.push(type); }
    const clause = where.length ? ` WHERE ${where.join(' AND ')}` : '';
    const [rows] = await pool.query(
      `SELECT ms.*, p.nom AS produit_nom, p.reference, u.nom AS agent FROM mouvements_stock ms
       JOIN produits p ON p.id = ms.produit_id
       LEFT JOIN utilisateurs u ON u.id = ms.utilisateur_id
       ${clause} ORDER BY ms.created_at DESC LIMIT ? OFFSET ?`, [...params, limit, offset]);
    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total FROM mouvements_stock ms JOIN produits p ON p.id = ms.produit_id${clause}`, params);
    return { rows, total, page, limit };
  }

  /** entree / sortie / ajustement (ajustement = valeur absolue cible). */
  async move({ produit_id, type, quantite, motif }, utilisateurId) {
    return withTransaction(async (conn) => {
      const [[prod]] = await conn.query('SELECT * FROM produits WHERE id = ? FOR UPDATE', [produit_id]);
      if (!prod) throw new Error('Produit introuvable');
      let delta = Number(quantite);
      if (type === 'sortie') delta = -Math.abs(delta);
      if (type === 'entree') delta = Math.abs(delta);
      if (type === 'ajustement') delta = Number(quantite) - Number(prod.quantite);
      await ProductModel.adjustStock(conn, produit_id, delta);
      await conn.query(
        'INSERT INTO mouvements_stock (produit_id, type, quantite, motif, utilisateur_id) VALUES (?,?,?,?,?)',
        [produit_id, type, Math.abs(delta), motif || null, utilisateurId]
      );
      return true;
    });
  }

  alerts() {
    return pool.query(
      `SELECT id, nom, reference, quantite, seuil_alerte,
        CASE WHEN quantite <= 0 THEN 'rupture' ELSE 'faible' END AS niveau
       FROM produits WHERE quantite <= seuil_alerte ORDER BY quantite ASC`
    ).then(([r]) => r);
  }
}
module.exports = new StockModel();
