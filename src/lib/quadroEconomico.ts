import type { QuadroEconomico, Sottovoce } from '../types/api';

export function creaQuadroEconomicoVuoto(): QuadroEconomico {
  return { versione: 2, personale: [], servizi: [] };
}

export function nuovaSottovoce(nome = '', dotazione = 0, percentuale = 0): Sottovoce {
  return {
    id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `sv-${Date.now()}-${Math.random()}`,
    nome,
    percentuale,
    importo: dotazione > 0 ? (dotazione * percentuale) / 100 : 0,
  };
}

export function aggiornaSottovocePercentuale(sv: Sottovoce, percentuale: number, dotazione: number): Sottovoce {
  return {
    ...sv,
    percentuale,
    importo: Math.round(((dotazione * percentuale) / 100) * 100) / 100,
  };
}

export function aggiornaSottovoceImporto(sv: Sottovoce, importo: number, dotazione: number): Sottovoce {
  const percentuale = dotazione > 0 ? (importo / dotazione) * 100 : 0;
  return {
    ...sv,
    importo,
    percentuale: Math.round(percentuale * 100) / 100,
  };
}

export function sommaSottovoci(qe: QuadroEconomico): number {
  const all = [...qe.personale, ...qe.servizi];
  return all.reduce((s, v) => s + v.importo, 0);
}

export function residuoQuadro(qe: QuadroEconomico, dotazione: number): number {
  return Math.round((dotazione - sommaSottovoci(qe)) * 100) / 100;
}

export function quadroBilanciato(qe: QuadroEconomico, dotazione: number): boolean {
  return Math.abs(residuoQuadro(qe, dotazione)) < 0.01;
}

export function quadroSalvabile(qe: QuadroEconomico, dotazione: number): boolean {
  const totale = sommaSottovoci(qe);
  return totale <= dotazione + 0.01;
}

export function avanzoLibero(qe: QuadroEconomico, dotazione: number): number {
  return Math.max(0, Math.round((dotazione - sommaSottovoci(qe)) * 100) / 100);
}

export const SOTTOVOCE_GENERICO_ID = '__generico__';
export const SOTTOVOCE_INTERO_ID = '__intero__';

export function tutteSottovociConSpeciali(
  qe: QuadroEconomico,
  dotazione: number,
): Array<Sottovoce & { macroCategoria: 'personale' | 'servizi' }> {
  const base = tutteSottovoci(qe);
  const avanzo = avanzoLibero(qe, dotazione);
  const out = [...base];
  if (avanzo > 0.01) {
    out.push({
      id: SOTTOVOCE_GENERICO_ID,
      nome: 'Unallocated / General Surplus',
      percentuale: 0,
      importo: avanzo,
      macroCategoria: 'servizi',
    });
  }
  if (base.length === 0) {
    out.push({
      id: SOTTOVOCE_INTERO_ID,
      nome: 'Full Grant Allocation',
      percentuale: 100,
      importo: dotazione,
      macroCategoria: 'servizi',
    });
  }
  return out;
}

export function tutteSottovoci(qe: QuadroEconomico): Array<Sottovoce & { macroCategoria: 'personale' | 'servizi' }> {
  return [
    ...qe.personale.map((s) => ({ ...s, macroCategoria: 'personale' as const })),
    ...qe.servizi.map((s) => ({ ...s, macroCategoria: 'servizi' as const })),
  ];
}
