const { pool } = require('../config/db');

/** Agregations du tableau de bord (une requete par indicateur, toutes indexees). */
class DashboardModel {
  async stats() {
    const q = (sql, p = []) => pool.query(sql, p).then(([r]) => r);
    const [
      produits, rupture, faible, clients, fournisseurs, ventes, achats, caJour, caMois, caAnnee,
    ] = await Promise.all([
      q('SELECT COUNT(*) AS v FROM produits'),
      q('SELECT COUNT(*) AS v FROM produits WHERE quantite <= 0'),
      q('SELECT COUNT(*) AS v FROM produits WHERE quantite > 0 AND quantite <= seuil_alerte'),
      q('SELECT COUNT(*) AS v FROM clients'),
      q('SELECT COUNT(*) AS v FROM fournisseurs'),
      q("SELECT COUNT(*) AS v FROM ventes WHERE statut = 'validee'"),
      q("SELECT COUNT(*) AS v FROM achats WHERE statut = 'validee'"),
      q("SELECT COALESCE(SUM(total),0) AS v FROM ventes WHERE statut='validee' AND DATE(date_vente)=CURDATE()"),
      q("SELECT COALESCE(SUM(total),0) AS v FROM ventes WHERE statut='validee' AND YEAR(date_vente)=YEAR(CURDATE()) AND MONTH(date_vente)=MONTH(CURDATE())"),
      q("SELECT COALESCE(SUM(total),0) AS v FROM ventes WHERE statut='validee' AND YEAR(date_vente)=YEAR(CURDATE())"),
    ]);
    return {
      totalProduits: produits[0].v, produitsRupture: rupture[0].v, produitsStockFaible: faible[0].v,
      totalClients: clients[0].v, totalFournisseurs: fournisseurs[0].v,
      totalVentes: ventes[0].v, totalAchats: achats[0].v,
      caJour: Number(caJour[0].v), caMois: Number(caMois[0].v), caAnnee: Number(caAnnee[0].v),
    };
  }

  topProducts(limit = 5) {
    return pool.query(
      `SELECT p.id, p.nom, SUM(lv.quantite) AS quantite_vendue, SUM(lv.total_ligne) AS chiffre
       FROM lignes_vente lv JOIN produits p ON p.id = lv.produit_id
       JOIN ventes v ON v.id = lv.vente_id AND v.statut = 'validee'
       GROUP BY p.id, p.nom ORDER BY quantite_vendue DESC LIMIT ?`, [limit]).then(([r]) => r);
  }

  monthlyRevenue() {
    return pool.query(
      `SELECT DATE_FORMAT(date_vente, '%Y-%m') AS mois, SUM(total) AS chiffre, COUNT(*) AS nb
       FROM ventes WHERE statut='validee' AND date_vente >= DATE_SUB(CURDATE(), INTERVAL 11 MONTH)
       GROUP BY mois ORDER BY mois ASC`).then(([r]) => r);
  }

  latestSales(limit = 5) {
    return pool.query(
      `SELECT v.id, v.numero, v.total, v.date_vente, CONCAT(cl.prenom,' ',cl.nom) AS client_nom
       FROM ventes v LEFT JOIN clients cl ON cl.id = v.client_id
       ORDER BY v.date_vente DESC LIMIT ?`, [limit]).then(([r]) => r);
  }

  latestPurchases(limit = 5) {
    return pool.query(
      `SELECT a.id, a.numero, a.total, a.date_achat, f.nom AS fournisseur_nom
       FROM achats a LEFT JOIN fournisseurs f ON f.id = a.fournisseur_id
       ORDER BY a.date_achat DESC LIMIT ?`, [limit]).then(([r]) => r);
  }

  recentActivity(limit = 8) {
    return pool.query(
      `SELECT ms.type, ms.quantite, ms.motif, ms.created_at, p.nom AS produit_nom, u.nom AS agent
       FROM mouvements_stock ms JOIN produits p ON p.id = ms.produit_id
       LEFT JOIN utilisateurs u ON u.id = ms.utilisateur_id
       ORDER BY ms.created_at DESC LIMIT ?`, [limit]).then(([r]) => r);
  }
}
module.exports = new DashboardModel();
