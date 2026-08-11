import { useCallback, useEffect, useState } from 'react';

/** Hook de chargement generique avec etat loading / error / refetch. */
export default function useFetch(fetcher, deps = [], initial = null) {
  const [data, setData] = useState(initial);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const run = useCallback(() => {
    setLoading(true);
    return Promise.resolve(fetcher())
      .then((res) => { setData(res); setError(null); return res; })
      .catch((e) => setError(e))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => { run(); }, [run]);

  return { data, loading, error, refetch: run, setData };
}
