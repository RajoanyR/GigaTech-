/** Skeleton loading pour les tableaux et cartes. */
export function SkeletonRows({ rows = 5, cols = 5 }) {
  return (
    <tbody>
      {Array.from({ length: rows }).map((_, r) => (
        <tr key={r} className="table-row">
          {Array.from({ length: cols }).map((__, c) => (
            <td key={c} className="px-4 py-3.5"><div className="skeleton h-4 w-full" /></td>
          ))}
        </tr>
      ))}
    </tbody>
  );
}

export function SkeletonCards({ count = 4 }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card card-pad space-y-3">
          <div className="skeleton h-3 w-24" />
          <div className="skeleton h-7 w-32" />
          <div className="skeleton h-3 w-20" />
        </div>
      ))}
    </div>
  );
}
