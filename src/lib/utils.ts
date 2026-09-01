const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const;

export const NOMI_MESI = MONTHS;
export const MONTH_NAMES = MONTHS;

export const TARIFFA_DEFAULT = 32.50;

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-IE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatEuroAmount(value: number): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number.isFinite(value) ? value : 0);
}

export function parseEuroAmount(raw: string): number {
  const cleaned = raw.replace(/[^\d.-]/g, '');
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : 0;
}

export function percentOf(part: number, total: number, decimals = 2): number {
  if (!(total > 0) || !Number.isFinite(part)) return 0;
  const factor = 10 ** decimals;
  return Math.round((part / total) * 100 * factor) / factor;
}

export function usoPercentPreciso(impegnato: number, assegnato: number, decimals = 2): number {
  if (!(assegnato > 0) || !Number.isFinite(impegnato) || impegnato <= 0) return 0;
  const factor = 10 ** decimals;
  const raw = (impegnato / assegnato) * 100;
  if (impegnato >= assegnato) {
    return Math.round(raw * factor) / factor;
  }
  const floored = Math.floor(raw * factor) / factor;
  const maxUnder = 100 - 1 / factor;
  return Math.min(maxUnder, floored);
}

export function percentBarWidth(pct: number): number {
  if (!Number.isFinite(pct) || pct <= 0) return 0;
  return Math.min(100, pct);
}

export function formatPercent(value: number, decimals = 2): string {
  const n = Number.isFinite(value) ? value : 0;
  return n.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function creaConsuntivoVuoto(): Record<string, { ore: number; tariffa: number }> {
  return {};
}

export function totaleMese(dettaglio?: { ore?: number; tariffa?: number }) {
  if (!dettaglio || !(dettaglio.ore && dettaglio.ore > 0)) return 0;
  return dettaglio.ore * (dettaglio.tariffa ?? TARIFFA_DEFAULT);
}

export function totaliOperatore(consuntivo?: Record<string, { ore?: number; tariffa?: number }>) {
  let oreAnnue = 0;
  let totaleAnnuo = 0;
  const trimestri: [number, number, number, number] = [0, 0, 0, 0];

  if (consuntivo) {
    for (let i = 1; i <= 12; i += 1) {
      const mese = consuntivo[String(i)];
      if (mese && typeof mese.ore === 'number' && mese.ore > 0) {
        const tariffa = mese.tariffa ?? TARIFFA_DEFAULT;
        const tot = mese.ore * tariffa;
        oreAnnue += mese.ore;
        totaleAnnuo += tot;

        const trimestre = Math.floor((i - 1) / 3);
        trimestri[trimestre] += tot;
      }
    }
  }

  return { oreAnnue, totaleAnnuo, trimestri };
}

export function statoLabel(stato?: string) {
  switch (stato) {
    case 'bilanciato':
      return 'Balanced';
    case 'deficit':
      return 'Deficit';
    default:
      return 'Available';
  }
}
