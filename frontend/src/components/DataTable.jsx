import { FiChevronLeft, FiChevronRight, FiInbox, FiSearch } from 'react-icons/fi';
import { SkeletonRows } from './Skeleton';

/**
 * Tableau moderne : recherche, tri, pagination, etat vide, skeleton.
 * columns = [{ key, label, sortable, render(row) , className }]
 */
export default function DataTable({
  columns, rows, meta, loading, query,
  onSearch, onPage, onSort, toolbar, searchPlaceholder = 'Rechercher...',
}) {
  return (
    <div className="card overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100/80 p-4 dark:border-slate-800/60">
        <div className="relative w-full max-w-xs">
          <FiSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            className="input pl-9"
            placeholder={searchPlaceholder}
            defaultValue={query?.search}
            onChange={(e) => onSearch?.(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">{toolbar}</div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="table-head">
            <tr>
              {columns.map((col) => (
                <th key={col.key} className={`px-4 py-3 whitespace-nowrap ${col.className || ''}`}>
                  {col.sortable ? (
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 hover:text-brand-600 dark:hover:text-brand-400"
                      onClick={() => onSort?.(col.key)}
                    >
                      {col.label}
                      {query?.sortBy === col.key && (
                        <span className="text-[10px]">{query.order === 'asc' ? '▲' : '▼'}</span>
                      )}
                    </button>
                  ) : col.label}
                </th>
              ))}
            </tr>
          </thead>

          {loading ? (
            <SkeletonRows cols={columns.length} />
          ) : rows.length === 0 ? (
            <tbody>
              <tr>
                <td colSpan={columns.length} className="px-4 py-16 text-center">
                  <FiInbox className="mx-auto mb-3 h-8 w-8 text-slate-300 dark:text-slate-600" />
                  <p className="text-sm text-slate-500 dark:text-slate-400">Aucune donnee a afficher</p>
                </td>
              </tr>
            </tbody>
          ) : (
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="table-row">
                  {columns.map((col) => (
                    <td key={col.key} className={`px-4 py-3.5 ${col.className || ''}`}>
                      {col.render ? col.render(row) : (row[col.key] ?? '—')}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          )}
        </table>
      </div>

      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between gap-3 border-t border-slate-100/80 px-4 py-3 dark:border-slate-800/60">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Page {meta.page} sur {meta.totalPages} · {meta.total} resultat{meta.total > 1 ? 's' : ''}
          </p>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              className="btn-ghost btn-sm px-2.5"
              disabled={meta.page <= 1}
              onClick={() => onPage?.(meta.page - 1)}
            >
              <FiChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              className="btn-ghost btn-sm px-2.5"
              disabled={meta.page >= meta.totalPages}
              onClick={() => onPage?.(meta.page + 1)}
            >
              <FiChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
