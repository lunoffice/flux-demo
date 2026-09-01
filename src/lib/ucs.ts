import type { ConsuntivoMensile, OperatoreUcs } from '../types/api';
import { TARIFFA_DEFAULT, totaleMese } from './utils';

export function importoMeseUcs(consuntivo: ConsuntivoMensile, mese: number): number {
  const dettaglio = consuntivo[String(mese)] ?? { ore: 0, tariffa: TARIFFA_DEFAULT };
  return Math.round(totaleMese(dettaglio) * 100) / 100;
}

export function fondoAnnoDominanteTrimestre(
  mesi: number[],
  fondoByMese?: Record<number, string>,
): string | null {
  if (!fondoByMese) return null;
  const counts = new Map<string, number>();
  for (const m of mesi) {
    const a = fondoByMese[m];
    if (!a) continue;
    counts.set(a, (counts.get(a) ?? 0) + 1);
  }
  if (counts.size === 0) return null;

  let best: string | null = null;
  let bestCount = 0;
  let tied = false;
  for (const [anno, count] of counts) {
    if (count > bestCount) {
      best = anno;
      bestCount = count;
      tied = false;
    } else if (count === bestCount) {
      tied = true;
    }
  }
  return tied ? null : best;
}

export function totaliTrimestreUcs(
  consuntivo: ConsuntivoMensile | undefined,
  mesi: number[],
  fondoByMese?: Record<number, string>,
): { ore: number; importo: number; fondoDominante: string | null } {
  const dominante = fondoAnnoDominanteTrimestre(mesi, fondoByMese);
  let ore = 0;
  let importo = 0;

  for (const m of mesi) {
    if (dominante != null) {
      const linked = fondoByMese?.[m];
      if (linked && linked !== dominante) continue;
    }
    const rec = consuntivo?.[String(m)];
    if (!rec || typeof rec.ore !== 'number' || rec.ore <= 0) continue;
    const t = rec.tariffa ?? TARIFFA_DEFAULT;
    ore += rec.ore;
    importo += rec.ore * t;
  }

  return {
    ore,
    importo: Math.round(importo * 100) / 100,
    fondoDominante: dominante,
  };
}

export function importoMesiUcs(operatore: OperatoreUcs, mesi: number[]): number {
  return Math.round(mesi.reduce((s, m) => s + importoMeseUcs(operatore.consuntivoMensile, m), 0) * 100) / 100;
}

export function meseOccupato(
  mesiAllocati: Record<string, number[]>,
  operatoreId: string,
  mese: number,
): boolean {
  return (mesiAllocati[operatoreId] ?? []).includes(mese);
}

export function mesiLiberi(
  mesiAllocati: Record<string, number[]>,
  operatoreId: string,
  keepSelected: number[] = [],
): number[] {
  const keep = new Set(keepSelected);
  return Array.from({ length: 12 }, (_, i) => i + 1).filter(
    (m) => keep.has(m) || !meseOccupato(mesiAllocati, operatoreId, m),
  );
}

export function mesiConImporto(operatore: OperatoreUcs, mesi: number[]): number[] {
  return mesi.filter((m) => importoMeseUcs(operatore.consuntivoMensile, m) > 0);
}

export function mesiDisponibili(
  mesiAllocati: Record<string, number[]>,
  operatoreId: string,
): number[] {
  return mesiLiberi(mesiAllocati, operatoreId);
}

export type MeseCandidatoUcs = {
  operatoreUcsId: string;
  mese: number;
  importo: number;
};

function greedyFill(
  items: Array<MeseCandidatoUcs & { cents: number }>,
  targetCents: number,
): MeseCandidatoUcs[] {
  const sorted = [...items].sort((a, b) => b.cents - a.cents);
  const picked: Array<MeseCandidatoUcs & { cents: number }> = [];
  let sum = 0;
  for (const it of sorted) {
    if (sum + it.cents <= targetCents) {
      picked.push(it);
      sum += it.cents;
    }
  }
  const used = new Set(picked.map((p) => `${p.operatoreUcsId}:${p.mese}`));
  const rest = items
    .filter((it) => !used.has(`${it.operatoreUcsId}:${it.mese}`))
    .sort((a, b) => a.cents - b.cents);
  for (const it of rest) {
    if (sum + it.cents <= targetCents) {
      picked.push(it);
      sum += it.cents;
    }
  }
  return picked.map(({ operatoreUcsId, mese, importo }) => ({
    operatoreUcsId,
    mese,
    importo,
  }));
}

export function suggerisciMesiPerResiduo(
  candidati: MeseCandidatoUcs[],
  residuoEuro: number,
): MeseCandidatoUcs[] {
  const target = Math.round(residuoEuro * 100);
  if (!(target > 0) || candidati.length === 0) return [];

  const items = candidati
    .map((c) => ({ ...c, cents: Math.round(c.importo * 100) }))
    .filter((c) => c.cents > 0 && c.cents <= target);

  if (items.length === 0) return [];

  const work = items.length * (target + 1);
  if (target > 2_500_000 || work > 40_000_000) {
    return greedyFill(items, target);
  }

  const reachable = new Uint8Array(target + 1);
  const fromItem = new Int16Array(target + 1).fill(-1);
  const fromSum = new Int32Array(target + 1).fill(-1);
  reachable[0] = 1;

  for (let i = 0; i < items.length; i += 1) {
    const w = items[i].cents;
    for (let s = target - w; s >= 0; s -= 1) {
      if (reachable[s] && !reachable[s + w]) {
        reachable[s + w] = 1;
        fromItem[s + w] = i;
        fromSum[s + w] = s;
      }
    }
  }

  let best = 0;
  for (let s = target; s >= 0; s -= 1) {
    if (reachable[s]) {
      best = s;
      break;
    }
  }

  const picked: MeseCandidatoUcs[] = [];
  const usedIdx = new Set<number>();
  let cur = best;
  while (cur > 0) {
    const i = fromItem[cur];
    if (i < 0 || usedIdx.has(i)) break;
    usedIdx.add(i);
    const it = items[i];
    picked.push({
      operatoreUcsId: it.operatoreUcsId,
      mese: it.mese,
      importo: it.importo,
    });
    cur = fromSum[cur];
  }

  return picked;
}

export function chiaveMeseUcs(operatoreUcsId: string, mese: number) {
  return `${operatoreUcsId}:${mese}`;
}
