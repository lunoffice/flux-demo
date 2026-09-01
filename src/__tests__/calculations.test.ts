import { describe, it, expect } from 'vitest';
import { formatEuroAmount, percentOf, totaliOperatore } from '../lib/utils';
import {
  creaQuadroEconomicoVuoto,
  nuovaSottovoce,
  sommaSottovoci,
  residuoQuadro,
  quadroSalvabile,
} from '../lib/quadroEconomico';
import { importoMeseUcs, importoMesiUcs, suggerisciMesiPerResiduo } from '../lib/ucs';

describe('Financial Utils & Calculations', () => {
  it('calculates percentage correctly with rounding', () => {
    expect(percentOf(50, 100)).toBe(50);
    expect(percentOf(1, 3)).toBe(33.33);
    expect(percentOf(0, 100)).toBe(0);
  });

  it('formats euro amounts properly', () => {
    expect(formatEuroAmount(1250.5)).toBe('1,250.50');
    expect(formatEuroAmount(0)).toBe('0.00');
  });

  it('aggregates staff operator hours and quarterly sums', () => {
    const consuntivo = {
      '1': { ore: 100, tariffa: 30 },
      '2': { ore: 50, tariffa: 30 },
      '4': { ore: 80, tariffa: 30 },
    };
    const totals = totaliOperatore(consuntivo);
    expect(totals.oreAnnue).toBe(230);
    expect(totals.totaleAnnuo).toBe(6900);
    expect(totals.trimestri[0]).toBe(4500);
    expect(totals.trimestri[1]).toBe(2400);
  });
});

describe('Economic Plan (Quadro Economico) Logic', () => {
  it('computes line items and remaining budget correctly', () => {
    const qe = creaQuadroEconomicoVuoto();
    const dotazione = 100000;
    qe.personale.push(nuovaSottovoce('Social Workers', dotazione, 60));
    qe.servizi.push(nuovaSottovoce('Transport', dotazione, 30));

    expect(sommaSottovoci(qe)).toBe(90000);
    expect(residuoQuadro(qe, dotazione)).toBe(10000);
    expect(quadroSalvabile(qe, dotazione)).toBe(true);
  });

  it('detects when budget is exceeded', () => {
    const qe = creaQuadroEconomicoVuoto();
    const dotazione = 50000;
    qe.personale.push(nuovaSottovoce('Staff', dotazione, 80));
    qe.servizi.push(nuovaSottovoce('Services', dotazione, 30));

    expect(sommaSottovoci(qe)).toBe(55000);
    expect(residuoQuadro(qe, dotazione)).toBe(-5000);
    expect(quadroSalvabile(qe, dotazione)).toBe(false);
  });
});

describe('UCS Rates & Residual Matching Algorithm', () => {
  it('calculates monthly cost using operator hourly rates', () => {
    const op = {
      id: 'op-test',
      nomeCompleto: 'Test User',
      anno: 2025,
      pagaOrariaMedia: 35,
      consuntivoMensile: {
        '1': { ore: 100, tariffa: 35 },
        '2': { ore: 120, tariffa: 35 },
      },
      creatoIl: '',
      aggiornatoIl: '',
    };
    expect(importoMeseUcs(op.consuntivoMensile, 1)).toBe(3500);
    expect(importoMesiUcs(op, [1, 2])).toBe(7700);
  });

  it('suggests optimal candidate months to match remaining balance', () => {
    const candidates = [
      { operatoreUcsId: 'op-1', mese: 1, importo: 3000 },
      { operatoreUcsId: 'op-1', mese: 2, importo: 2000 },
      { operatoreUcsId: 'op-2', mese: 1, importo: 4000 },
    ];
    const picked = suggerisciMesiPerResiduo(candidates, 5000);
    const sum = picked.reduce((acc, p) => acc + p.importo, 0);
    expect(sum).toBe(5000);
  });
});
