import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

type EsercizioContextValue = {
  esercizioUcs: number;
  setEsercizioUcs: (anno: number) => void;
  anniUcs: number[];
  anniFondo: number[];
  numOperatoriUniciUcs: number;
  numOperatoriUniciFondo: number;
  refreshAnni: () => Promise<void>;
};

const EsercizioContext = createContext<EsercizioContextValue | null>(null);
const currentYear = new Date().getFullYear();

export function EsercizioProvider({ children }: { children: React.ReactNode }) {
  const [esercizioUcs, setEsercizioUcs] = useState(2025);
  const [anniUcs, setAnniUcs] = useState<number[]>([2026, 2025, 2024, 2023]);
  const [anniFondo, setAnniFondo] = useState<number[]>([2026, 2025, 2024, 2023]);
  const [numOperatoriUniciUcs, setNumOperatoriUniciUcs] = useState<number>(6);
  const [numOperatoriUniciFondo, setNumOperatoriUniciFondo] = useState<number>(4);

  const refreshAnni = useCallback(async () => {
    if (!window.api) return;

    const [resOps, resStanz, resCount] = await Promise.all([
      window.api.operatori.listAnni(),
      window.api.stanziamenti.list(),
      window.api.operatori.countUnici(),
    ]);

    const ucs =
      resOps.ok && resOps.data?.length ? [...new Set(resOps.data)].sort((a, b) => b - a) : [currentYear];
    setAnniUcs(ucs);
    setEsercizioUcs((prev) => (ucs.includes(prev) ? prev : ucs[0]));

    const fondo =
      resStanz.ok && resStanz.data?.length
        ? [...new Set(resStanz.data.map((s) => s.anno))].sort((a, b) => b - a)
        : [];
    setAnniFondo(fondo);

    if (resCount.ok && resCount.data) {
      setNumOperatoriUniciUcs(resCount.data.ucs);
      setNumOperatoriUniciFondo(resCount.data.fondo);
    }
  }, []);

  useEffect(() => {
    void refreshAnni();
  }, [refreshAnni]);

  const value = useMemo(
    () => ({
      esercizioUcs,
      setEsercizioUcs,
      anniUcs,
      anniFondo,
      numOperatoriUniciUcs,
      numOperatoriUniciFondo,
      refreshAnni,
    }),
    [esercizioUcs, anniUcs, anniFondo, numOperatoriUniciUcs, numOperatoriUniciFondo, refreshAnni],
  );

  return <EsercizioContext.Provider value={value}>{children}</EsercizioContext.Provider>;
}

export function useEsercizio() {
  const ctx = useContext(EsercizioContext);
  if (!ctx) throw new Error('useEsercizio must be used within EsercizioProvider');
  return ctx;
}

export function useEsercizioUcs() {
  const { esercizioUcs, setEsercizioUcs, anniUcs } = useEsercizio();
  return { anno: esercizioUcs, setAnno: setEsercizioUcs, anni: anniUcs };
}
