import { describe, it, expect, beforeEach } from 'vitest';
import { createMockFluxApi, mockDb } from '../lib/mockApi';

describe('In-Browser Mock API', () => {
  const api = createMockFluxApi();

  beforeEach(() => {
    mockDb.resetAll();
  });

  it('lists seeded grant allocations', async () => {
    const res = await api.stanziamenti.list();
    expect(res.ok).toBe(true);
    expect(res.data?.length).toBeGreaterThanOrEqual(4);
    const y2025 = res.data?.find((s) => s.anno === 2025);
    expect(y2025).toBeDefined();
    expect(y2025?.dotazioneTotale).toBe(390000);
  });

  it('creates and retrieves a new grant allocation', async () => {
    const createRes = await api.stanziamenti.create({
      anno: 2027,
      dotazioneTotale: 500000,
      codiceCup: 'J84E27000990006',
    });
    expect(createRes.ok).toBe(true);
    expect(createRes.data?.anno).toBe(2027);

    const getRes = await api.stanziamenti.getByAnno(2027);
    expect(getRes.ok).toBe(true);
    expect(getRes.data?.dotazioneTotale).toBe(500000);
  });

  it('lists staff operators and manages hourly rates', async () => {
    const opsRes = await api.operatori.listByAnno(2025);
    expect(opsRes.ok).toBe(true);
    expect(opsRes.data?.length).toBeGreaterThan(0);

    const tarRes = await api.ucsTariffe.list();
    expect(tarRes.ok).toBe(true);
    expect(tarRes.data?.some((t) => t.isDefault)).toBe(true);
  });
});
