import { useCallback, useEffect, useMemo, useState } from 'react';
import type { UcsTariffa } from '../../types/api';
import { TARIFFA_DEFAULT } from '../../lib/utils';
import type { SelectOption } from '../../components/ui/Select';

function roundTariffa(value: number) {
  return Math.round(value * 100) / 100;
}

function formatValoreLabel(valore: number) {
  return `${valore.toLocaleString('it-IT', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} €`;
}

export function useUcsTariffe() {
  const [tariffe, setTariffe] = useState<UcsTariffa[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!window.api?.ucsTariffe) {
      setError('API UCS non disponibile.');
      setTariffe([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const res = await window.api.ucsTariffe.list();
    if (!res.ok) {
      setError(res.error ?? 'Errore caricamento UCS');
      setTariffe([]);
    } else {
      setError(null);
      setTariffe(res.data ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const options: SelectOption[] = useMemo(
    () =>
      tariffe.map((t) => ({
        value: String(roundTariffa(t.valore)),
        label: formatValoreLabel(t.valore),
      })),
    [tariffe],
  );

  const defaultValore = useMemo(() => {
    const hit = tariffe.find((t) => t.isDefault);
    if (hit) return roundTariffa(hit.valore);
    if (tariffe[0]) return roundTariffa(tariffe[0].valore);
    return TARIFFA_DEFAULT;
  }, [tariffe]);

  return { tariffe, options, defaultValore, loading, error, reload };
}
