const { pool } = require('../config/db');

/** Rapports agreges par periode. */
class ReportModel {
  sales({ from, to, groupBy = 'day' }) {
    const fmt = { day: '%Y-%m-%d', week: '%x-S%v', month: '%Y-%m', year: '%Y' }[groupBy] || '%Y-%m-%d';
    return pool.query(
      `SELECT DATE_FORMAT(v.date_vente, ?) AS periode, COUNT(*) AS nb_ventes,
              SUM(v.sous_total) AS sous_total, SUM(v.montant_remise) AS remises,
              SUM(v.montant_tva) AS tva, SUM(v.total) AS total
       FROM ventes v WHERE v.statut='validee' AND v.date_vente BETWEEN ? AND ?
       GROUP BY periode ORDER BY periode ASC`, [fmt, from, to]).then(([r]) => r);
  }

  purchases({ from, to }) {
    return pool.query(
      `SELECT DATE_FORMAT(a.date_achat, '%Y-%m-%d') AS periode, COUNT(*) AS nb_achats, SUM(a.total) AS total
       FROM achats a WHERE a.statut='validee' AND a.date_achat BETWEEN ? AND ?
       GROUP BY periode ORDER BY periode ASC`, [from, to]).then(([r]) => r);
  }

  /** Marge brute = ventes - cout d'achat des produits vendus. */
  profit({ from, to }) {
    return pool.query(
      `SELECT COALESCE(SUM(lv.total_ligne),0) AS chiffre,
              COALESCE(SUM(lv.quantite * p.prix_achat),0) AS cout,
              COALESCE(SUM(lv.total_ligne - lv.quantite * p.prix_achat),0) AS marge
       FROM lignes_vente lv
       JOIN ventes v ON v.id = lv.vente_id AND v.statut='validee'
       JOIN produits p ON p.id = lv.produit_id
       WHERE v.date_vente BETWEEN ? AND ?`, [from, to]).then(([r]) => r[0]);
  }
}
module.exports = new ReportModel();
