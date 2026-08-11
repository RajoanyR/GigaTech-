const asyncHandler = require('../utils/asyncHandler');
const { ok } = require('../utils/response');
const Dashboard = require('../models/dashboard.model');

/** GET /api/dashboard — tous les indicateurs en une seule requete HTTP. */
exports.overview = asyncHandler(async (_req, res) => {
  const [stats, topProduits, revenusMensuels, dernieresVentes, derniersAchats, activites] = await Promise.all([
    Dashboard.stats(),
    Dashboard.topProducts(5),
    Dashboard.monthlyRevenue(),
    Dashboard.latestSales(5),
    Dashboard.latestPurchases(5),
    Dashboard.recentActivity(8),
  ]);
  ok(res, { stats, topProduits, revenusMensuels, dernieresVentes, derniersAchats, activites });
});
