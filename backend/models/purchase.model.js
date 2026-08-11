const { pool, withTransaction } = require('../config/db');
const ProductModel = require('./product.model');

/** Achats fournisseurs : la validation incremente le stock. */
class PurchaseModel {
  async list({ page, limit, offset, search, order = 'DESC', statut }) {
    const where = [];
    const params = [];
    if (search) { where.push('(a.numero LIKE ? OR f.nom LIKE ?)'); params.push(`%${search}%`, `%${search}%`); }
    if (statut) { where.push('a.statut = ?'); params.push(statut); }
    const clause = where.length ? ` WHERE ${where.join(' AND ')}` : '';
    const [rows] = await pool.query(
      `SELECT a.*, f.nom AS fournisseur_nom, u.nom AS agent FROM achats a
       LEFT JOIN fournisseurs f ON f.id = a.fournisseur_id
       LEFT JOIN utilisateurs u ON u.id = a.utilisateur_id
       ${clause} ORDER BY a.date_achat ${order} LIMIT ? OFFSET ?`, [...params, limit, offset]);
    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total FROM achats a LEFT JOIN fournisseurs f ON f.id = a.fournisseur_id${clause}`, params);
    return { rows, total, page, limit };
  }

  async findById(id) {
    const [[achat]] = await pool.query(
      `SELECT a.*, f.nom AS fournisseur_nom FROM achats a
       LEFT JOIN fournisseurs f ON f.id = a.fournisseur_id WHERE a.id = ?`, [id]);
    if (!achat) return null;
    const [lignes] = await pool.query(
      `SELECT la.*, p.nom AS produit_nom, p.reference FROM lignes_achat la
       JOIN produits p ON p.id = la.produit_id WHERE la.achat_id = ?`, [id]);
    return { ...achat, lignes };
  }

  async create(payload, utilisateurId) {
    return withTransaction(async (conn) => {
      const { fournisseur_id, lignes = [], note = null } = payload;
      if (!lignes.length) throw new Error("L'achat doit contenir au moins une ligne");
      let total = 0;
      const detail = lignes.map((l) => {
        const t = Number(l.prix_unitaire) * Number(l.quantite);
        total += t;
        return { ...l, total_ligne: t };
      });
      const numero = `ACH-${Date.now()}`;
      const [res] = await conn.query(
        "INSERT INTO achats (numero, fournisseur_id, utilisateur_id, total, statut, note) VALUES (?,?,?,?,'brouillon',?)",
        [numero, fournisseur_id, utilisateurId, total, note]
      );
      for (const d of detail) {
        await conn.query(
          'INSERT INTO lignes_achat (achat_id, produit_id, quantite, prix_unitaire, total_ligne) VALUES (?,?,?,?,?)',
          [res.insertId, d.produit_id, d.quantite, d.prix_unitaire, d.total_ligne]
        );
      }
      return res.insertId;
    });
  }

  /** Validation : entree en stock + mouvements traces. */
  async validate(id, utilisateurId) {
    return withTransaction(async (conn) => {
      const [[achat]] = await conn.query('SELECT * FROM achats WHERE id = ? FOR UPDATE', [id]);
      if (!achat) throw new Error('Achat introuvable');
      if (achat.statut === 'validee') throw new Error('Achat deja valide');
      const [lignes] = await conn.query('SELECT * FROM lignes_achat WHERE achat_id = ?', [id]);
      for (const l of lignes) {
        await ProductModel.adjustStock(conn, l.produit_id, l.quantite);
        await conn.query('UPDATE produits SET prix_achat = ? WHERE id = ?', [l.prix_unitaire, l.produit_id]);
        await conn.query(
          `INSERT INTO mouvements_stock (produit_id, type, quantite, motif, reference, utilisateur_id)
           VALUES (?, 'entree', ?, 'Achat fournisseur', ?, ?)`,
          [l.produit_id, l.quantite, achat.numero, utilisateurId]
        );
      }
      await conn.query("UPDATE achats SET statut = 'validee' WHERE id = ?", [id]);
      return true;
    });
  }

  async remove(id) {
    const [[achat]] = await pool.query('SELECT statut FROM achats WHERE id = ?', [id]);
    if (!achat) throw new Error('Achat introuvable');
    if (achat.statut === 'validee') throw new Error('Un achat valide ne peut pas etre supprime');
    await pool.query('DELETE FROM achats WHERE id = ?', [id]);
    return true;
  }
}
module.exports = new PurchaseModel();
