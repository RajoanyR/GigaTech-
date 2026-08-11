const BaseModel = require('./base.model');
const { pool } = require('../config/db');

const SELECT_JOIN = `
  SELECT p.*, c.nom AS categorie_nom, m.nom AS marque_nom, f.nom AS fournisseur_nom
  FROM produits p
  LEFT JOIN categories c ON c.id = p.categorie_id
  LEFT JOIN marques m ON m.id = p.marque_id
  LEFT JOIN fournisseurs f ON f.id = p.fournisseur_id`;

class ProductModel extends BaseModel {
  constructor() {
    super('produits', {
      fillable: ['reference', 'code_barres', 'nom', 'description', 'categorie_id', 'marque_id',
        'fournisseur_id', 'prix_achat', 'prix_vente', 'quantite', 'seuil_alerte', 'image', 'garantie_mois', 'actif'],
      searchable: ['p.nom', 'p.reference', 'p.code_barres'],
      sortable: ['id', 'nom', 'reference', 'prix_vente', 'quantite', 'created_at'],
    });
  }

  /** Liste filtrable : recherche, categorie, marque, fournisseur, stock faible. */
  async search({ page, limit, offset, sortBy, order, search, categorie_id, marque_id, fournisseur_id, stock }) {
    const where = [];
    const params = [];
    if (search) { where.push('(p.nom LIKE ? OR p.reference LIKE ? OR p.code_barres LIKE ?)'); params.push(`%${search}%`, `%${search}%`, `%${search}%`); }
    if (categorie_id) { where.push('p.categorie_id = ?'); params.push(categorie_id); }
    if (marque_id) { where.push('p.marque_id = ?'); params.push(marque_id); }
    if (fournisseur_id) { where.push('p.fournisseur_id = ?'); params.push(fournisseur_id); }
    if (stock === 'rupture') where.push('p.quantite <= 0');
    if (stock === 'faible') where.push('p.quantite > 0 AND p.quantite <= p.seuil_alerte');
    const clause = where.length ? ` WHERE ${where.join(' AND ')}` : '';
    const sort = this.sortable.includes(sortBy) ? `p.${sortBy}` : 'p.id';

    const [rows] = await pool.query(`${SELECT_JOIN}${clause} ORDER BY ${sort} ${order} LIMIT ? OFFSET ?`, [...params, limit, offset]);
    const [[{ total }]] = await pool.query(`SELECT COUNT(*) AS total FROM produits p${clause}`, params);
    return { rows, total, page, limit };
  }

  async findById(id) {
    const [rows] = await pool.query(`${SELECT_JOIN} WHERE p.id = ? LIMIT 1`, [id]);
    return rows[0] || null;
  }

  /** Variation de stock atomique + garde-fou anti stock negatif. */
  async adjustStock(conn, produitId, delta) {
    const [res] = await conn.query(
      'UPDATE produits SET quantite = quantite + ? WHERE id = ? AND quantite + ? >= 0',
      [delta, produitId, delta]
    );
    if (res.affectedRows === 0) throw new Error(`Stock insuffisant pour le produit #${produitId}`);
  }

  lowStock(limit = 10) {
    return pool.query(
      'SELECT id, nom, reference, quantite, seuil_alerte FROM produits WHERE quantite <= seuil_alerte ORDER BY quantite ASC LIMIT ?',
      [limit]
    ).then(([r]) => r);
  }
}
module.exports = new ProductModel();
