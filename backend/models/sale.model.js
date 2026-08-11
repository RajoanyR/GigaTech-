const { pool, withTransaction } = require('../config/db');
const ProductModel = require('./product.model');

/** Ventes + lignes de vente + mouvements de stock (operation transactionnelle). */
class SaleModel {
  async list({ page, limit, offset, search, order = 'DESC', from, to, statut }) {
    const where = [];
    const params = [];
    if (search) { where.push('(v.numero LIKE ? OR cl.nom LIKE ?)'); params.push(`%${search}%`, `%${search}%`); }
    if (from) { where.push('v.date_vente >= ?'); params.push(from); }
    if (to) { where.push('v.date_vente <= ?'); params.push(to); }
    if (statut) { where.push('v.statut = ?'); params.push(statut); }
    const clause = where.length ? ` WHERE ${where.join(' AND ')}` : '';

    const [rows] = await pool.query(
      `SELECT v.*, CONCAT(cl.prenom,' ',cl.nom) AS client_nom, u.nom AS vendeur
       FROM ventes v
       LEFT JOIN clients cl ON cl.id = v.client_id
       LEFT JOIN utilisateurs u ON u.id = v.utilisateur_id
       ${clause} ORDER BY v.date_vente ${order} LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );
    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total FROM ventes v LEFT JOIN clients cl ON cl.id = v.client_id${clause}`, params);
    return { rows, total, page, limit };
  }

  async findById(id) {
    const [[vente]] = await pool.query(
      `SELECT v.*, CONCAT(cl.prenom,' ',cl.nom) AS client_nom, cl.telephone AS client_telephone,
              cl.email AS client_email, cl.adresse AS client_adresse, u.nom AS vendeur
       FROM ventes v LEFT JOIN clients cl ON cl.id = v.client_id
       LEFT JOIN utilisateurs u ON u.id = v.utilisateur_id WHERE v.id = ?`, [id]);
    if (!vente) return null;
    const [lignes] = await pool.query(
      `SELECT lv.*, p.nom AS produit_nom, p.reference FROM lignes_vente lv
       JOIN produits p ON p.id = lv.produit_id WHERE lv.vente_id = ?`, [id]);
    const [paiements] = await pool.query('SELECT * FROM paiements WHERE vente_id = ?', [id]);
    return { ...vente, lignes, paiements };
  }

  /** Cree une vente complete : calcule les totaux serveur (jamais ceux du client). */
  async create(payload, utilisateurId) {
    return withTransaction(async (conn) => {
      const { client_id = null, lignes = [], remise = 0, tva = 18, mode_paiement = 'especes', note = null } = payload;
      if (!lignes.length) throw new Error('La vente doit contenir au moins une ligne');

      let sousTotal = 0;
      const detail = [];
      for (const l of lignes) {
        const [[prod]] = await conn.query('SELECT id, prix_vente, quantite FROM produits WHERE id = ? FOR UPDATE', [l.produit_id]);
        if (!prod) throw new Error(`Produit #${l.produit_id} introuvable`);
        const qte = Number(l.quantite);
        if (qte <= 0) throw new Error('Quantite invalide');
        if (prod.quantite < qte) throw new Error(`Stock insuffisant pour le produit #${prod.id}`);
        const pu = l.prix_unitaire != null ? Number(l.prix_unitaire) : Number(prod.prix_vente);
        const total = pu * qte;
        sousTotal += total;
        detail.push({ produit_id: prod.id, quantite: qte, prix_unitaire: pu, total_ligne: total });
      }

      const montantRemise = (sousTotal * Number(remise)) / 100;
      const baseHt = sousTotal - montantRemise;
      const montantTva = (baseHt * Number(tva)) / 100;
      const totalTtc = baseHt + montantTva;
      const numero = `VNT-${Date.now()}`;

      const [res] = await conn.query(
        `INSERT INTO ventes (numero, client_id, utilisateur_id, sous_total, remise, montant_remise, tva, montant_tva, total, statut, mode_paiement, note)
         VALUES (?,?,?,?,?,?,?,?,?, 'validee', ?, ?)`,
        [numero, client_id, utilisateurId, sousTotal, remise, montantRemise, tva, montantTva, totalTtc, mode_paiement, note]
      );
      const venteId = res.insertId;

      for (const d of detail) {
        await conn.query(
          'INSERT INTO lignes_vente (vente_id, produit_id, quantite, prix_unitaire, total_ligne) VALUES (?,?,?,?,?)',
          [venteId, d.produit_id, d.quantite, d.prix_unitaire, d.total_ligne]
        );
        await ProductModel.adjustStock(conn, d.produit_id, -d.quantite);
        await conn.query(
          `INSERT INTO mouvements_stock (produit_id, type, quantite, motif, reference, utilisateur_id)
           VALUES (?, 'sortie', ?, 'Vente', ?, ?)`,
          [d.produit_id, d.quantite, numero, utilisateurId]
        );
      }

      await conn.query(
        'INSERT INTO paiements (vente_id, montant, mode, statut, utilisateur_id) VALUES (?,?,?,?,?)',
        [venteId, totalTtc, mode_paiement, 'paye', utilisateurId]
      );
      return venteId;
    });
  }

  /** Annulation : restitue le stock. */
  async cancel(id, utilisateurId) {
    return withTransaction(async (conn) => {
      const [[vente]] = await conn.query('SELECT * FROM ventes WHERE id = ? FOR UPDATE', [id]);
      if (!vente) throw new Error('Vente introuvable');
      if (vente.statut === 'annulee') throw new Error('Vente deja annulee');
      const [lignes] = await conn.query('SELECT * FROM lignes_vente WHERE vente_id = ?', [id]);
      for (const l of lignes) {
        await ProductModel.adjustStock(conn, l.produit_id, l.quantite);
        await conn.query(
          `INSERT INTO mouvements_stock (produit_id, type, quantite, motif, reference, utilisateur_id)
           VALUES (?, 'entree', ?, 'Annulation vente', ?, ?)`,
          [l.produit_id, l.quantite, vente.numero, utilisateurId]
        );
      }
      await conn.query("UPDATE ventes SET statut = 'annulee' WHERE id = ?", [id]);
      return true;
    });
  }
}
module.exports = new SaleModel();
