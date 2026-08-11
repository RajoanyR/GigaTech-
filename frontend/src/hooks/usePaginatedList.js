import { useCallback, useEffect, useState } from 'react';

/** Gere pagination + recherche + tri + filtres pour les tableaux. */
export default function usePaginatedList(service, { limit = 10, filters = {} } = {}) {
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState({ page: 1, limit, search: '', sortBy: 'id', order: 'desc', ...filters });

  const load = useCallback(() => {
    setLoading(true);
    service.list(query)
      .then((res) => { setRows(res.data || []); setMeta(res.meta || { total: 0, page: 1, limit, totalPages: 1 }); })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(query)]);

  useEffect(() => {
    const t = setTimeout(load, query.search ? 350 : 0); // debounce sur la recherche
    return () => clearTimeout(t);
  }, [load, query.search]);

  const setSearch = (search) => setQuery((q) => ({ ...q, search, page: 1 }));
  const setPage = (page) => setQuery((q) => ({ ...q, page }));
  const setFilter = (key, value) => setQuery((q) => ({ ...q, [key]: value || undefined, page: 1 }));
  const setSort = (sortBy) =>
    setQuery((q) => ({ ...q, sortBy, order: q.sortBy === sortBy && q.order === 'asc' ? 'desc' : 'asc' }));

  return { rows, meta, loading, query, setSearch, setPage, setFilter, setSort, reload: load };
}
