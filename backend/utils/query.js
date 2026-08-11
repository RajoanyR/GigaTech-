const { DEFAULT_PAGE_SIZE } = require('../config/constants');

/** Normalise pagination / tri / recherche depuis la query string. */
function parseListQuery(query, allowedSort = ['id'], defaultSort = 'id') {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || DEFAULT_PAGE_SIZE));
  const sortBy = allowedSort.includes(query.sortBy) ? query.sortBy : defaultSort;
  const order = String(query.order || 'desc').toLowerCase() === 'asc' ? 'ASC' : 'DESC';
  const search = (query.search || '').trim();
  return { page, limit, offset: (page - 1) * limit, sortBy, order, search };
}
module.exports = { parseListQuery };
