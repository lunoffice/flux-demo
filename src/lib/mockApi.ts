import type {
  FluxApi,
  StanziamentoAnnuale,
  OperatoreUcs,
  UcsTariffa,
  ImpegnoSpesa,
  ReportBanner,
  ApiResponse,
} from '../types/api';
import {
  INITIAL_STANZIAMENTI,
  INITIAL_OPERATORI,
  INITIAL_TARIFFE,
  INITIAL_IMPEGNI,
  INITIAL_BANNERS,
} from './mockData';

const STORAGE_KEYS = {
  STANZIAMENTI: 'flux_demo_stanziamenti_v1',
  OPERATORI: 'flux_demo_operatori_v1',
  TARIFFE: 'flux_demo_tariffe_v1',
  IMPEGNI: 'flux_demo_impegni_v1',
  BANNERS: 'flux_demo_banners_v1',
};

function loadStorage<T>(key: string, fallback: T): T {
  try {
    if (typeof localStorage === 'undefined') return fallback;
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function saveStorage<T>(key: string, data: T) {
  try {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.warn('Failed to save to localStorage:', e);
  }
}

class MockDatabase {
  private stanziamenti: StanziamentoAnnuale[];
  private operatori: OperatoreUcs[];
  private tariffe: UcsTariffa[];
  private impegni: ImpegnoSpesa[];
  private banners: ReportBanner[];

  constructor() {
    this.stanziamenti = loadStorage(STORAGE_KEYS.STANZIAMENTI, INITIAL_STANZIAMENTI);
    this.operatori = loadStorage(STORAGE_KEYS.OPERATORI, INITIAL_OPERATORI);
    this.tariffe = loadStorage(STORAGE_KEYS.TARIFFE, INITIAL_TARIFFE);
    this.impegni = loadStorage(STORAGE_KEYS.IMPEGNI, INITIAL_IMPEGNI);
    this.banners = loadStorage(STORAGE_KEYS.BANNERS, INITIAL_BANNERS);
  }

  public resetAll() {
    this.stanziamenti = JSON.parse(JSON.stringify(INITIAL_STANZIAMENTI));
    this.operatori = JSON.parse(JSON.stringify(INITIAL_OPERATORI));
    this.tariffe = JSON.parse(JSON.stringify(INITIAL_TARIFFE));
    this.impegni = JSON.parse(JSON.stringify(INITIAL_IMPEGNI));
    this.banners = JSON.parse(JSON.stringify(INITIAL_BANNERS));
    this.persist();
  }

  private persist() {
    saveStorage(STORAGE_KEYS.STANZIAMENTI, this.stanziamenti);
    saveStorage(STORAGE_KEYS.OPERATORI, this.operatori);
    saveStorage(STORAGE_KEYS.TARIFFE, this.tariffe);
    saveStorage(STORAGE_KEYS.IMPEGNI, this.impegni);
    saveStorage(STORAGE_KEYS.BANNERS, this.banners);
  }

  private computeStanziamentoStats(s: StanziamentoAnnuale): StanziamentoAnnuale {
    const imps = this.impegni.filter((i) => i.stanziamentoAnnualeId === s.id);
    const impPers = imps
      .filter((i) => i.macroCategoria === 'personale')
      .reduce((sum, i) => sum + i.importo, 0);
    const impServ = imps
      .filter((i) => i.macroCategoria === 'servizi')
      .reduce((sum, i) => sum + i.importo, 0);
    const impTot = impPers + impServ;
    const residuo = Math.max(0, s.dotazioneTotale - impTot);

    let stato: 'disponibile' | 'bilanciato' | 'deficit' = 'disponibile';
    if (impTot >= s.dotazioneTotale) {
      stato = impTot > s.dotazioneTotale ? 'deficit' : 'bilanciato';
    }

    return {
      ...s,
      importoImpegnato: impTot,
      impegnatoPersonale: impPers,
      impegnatoServizi: impServ,
      residuo,
      stato,
    };
  }

  // Stanziamenti
  async listStanziamenti(): Promise<ApiResponse<StanziamentoAnnuale[]>> {
    return {
      ok: true,
      data: this.stanziamenti.map((s) => this.computeStanziamentoStats(s)),
    };
  }

  async getStanziamento(id: string): Promise<ApiResponse<StanziamentoAnnuale>> {
    const s = this.stanziamenti.find((x) => x.id === id);
    if (!s) return { ok: false, error: 'Grant allocation not found' };
    return { ok: true, data: this.computeStanziamentoStats(s) };
  }

  async getStanziamentoByAnno(anno: number): Promise<ApiResponse<StanziamentoAnnuale | null>> {
    const s = this.stanziamenti.find((x) => x.anno === anno);
    return {
      ok: true,
      data: s ? this.computeStanziamentoStats(s) : null,
    };
  }

  async createStanziamento(input: Partial<StanziamentoAnnuale>): Promise<ApiResponse<StanziamentoAnnuale>> {
    const newStz: StanziamentoAnnuale = {
      id: input.id || `stz-${Date.now()}`,
      anno: input.anno || new Date().getFullYear(),
      dotazioneTotale: input.dotazioneTotale || 0,
      codiceCup: input.codiceCup || '',
      dataEmissione: input.dataEmissione || new Date().toISOString().split('T')[0],
      quadroEconomico: input.quadroEconomico || { versione: 2, personale: [], servizi: [] },
      creatoIl: new Date().toISOString(),
      aggiornatoIl: new Date().toISOString(),
    };
    this.stanziamenti.push(newStz);
    this.persist();
    return { ok: true, data: this.computeStanziamentoStats(newStz) };
  }

  async updateStanziamento(id: string, input: Partial<StanziamentoAnnuale>): Promise<ApiResponse<StanziamentoAnnuale>> {
    const idx = this.stanziamenti.findIndex((x) => x.id === id);
    if (idx === -1) return { ok: false, error: 'Grant allocation not found' };
    this.stanziamenti[idx] = {
      ...this.stanziamenti[idx],
      ...input,
      aggiornatoIl: new Date().toISOString(),
    };
    this.persist();
    return { ok: true, data: this.computeStanziamentoStats(this.stanziamenti[idx]) };
  }

  async deleteStanziamento(id: string): Promise<ApiResponse<{ ok: boolean }>> {
    this.stanziamenti = this.stanziamenti.filter((x) => x.id !== id);
    this.impegni = this.impegni.filter((x) => x.stanziamentoAnnualeId !== id);
    this.persist();
    return { ok: true, data: { ok: true } };
  }

  // Operatori
  async listOperatoriByAnno(anno: number): Promise<ApiResponse<OperatoreUcs[]>> {
    const list = this.operatori.filter((x) => x.anno === anno);
    return { ok: true, data: list };
  }

  async getOperatore(id: string): Promise<ApiResponse<OperatoreUcs>> {
    const op = this.operatori.find((x) => x.id === id);
    if (!op) return { ok: false, error: 'Staff member not found' };
    return { ok: true, data: op };
  }

  async createOperatore(input: Partial<OperatoreUcs>): Promise<ApiResponse<OperatoreUcs>> {
    const op: OperatoreUcs = {
      id: input.id || `op-${Date.now()}`,
      nomeCompleto: input.nomeCompleto || 'New Staff Member',
      anno: input.anno || new Date().getFullYear(),
      pagaOrariaMedia: input.pagaOrariaMedia || 32.5,
      consuntivoMensile: input.consuntivoMensile || {},
      creatoIl: new Date().toISOString(),
      aggiornatoIl: new Date().toISOString(),
    };
    this.operatori.push(op);
    this.persist();
    return { ok: true, data: op };
  }

  async updateOperatore(id: string, input: Partial<OperatoreUcs>): Promise<ApiResponse<OperatoreUcs>> {
    const idx = this.operatori.findIndex((x) => x.id === id);
    if (idx === -1) return { ok: false, error: 'Staff member not found' };
    this.operatori[idx] = {
      ...this.operatori[idx],
      ...input,
      aggiornatoIl: new Date().toISOString(),
    };
    this.persist();
    return { ok: true, data: this.operatori[idx] };
  }

  async deleteOperatore(id: string): Promise<ApiResponse<{ ok: boolean }>> {
    this.operatori = this.operatori.filter((x) => x.id !== id);
    this.persist();
    return { ok: true, data: { ok: true } };
  }

  async listOperatoriAnni(): Promise<ApiResponse<number[]>> {
    const years = Array.from(new Set(this.operatori.map((o) => o.anno))).sort((a, b) => b - a);
    return { ok: true, data: years.length ? years : [new Date().getFullYear()] };
  }

  async copiaOperatoriDaAnno(annoDest: number, annoSorgente: number): Promise<ApiResponse<OperatoreUcs[]>> {
    const source = this.operatori.filter((o) => o.anno === annoSorgente);
    const existing = new Set(this.operatori.filter((o) => o.anno === annoDest).map((o) => o.nomeCompleto.toLowerCase()));
    const created: OperatoreUcs[] = [];

    for (const s of source) {
      if (!existing.has(s.nomeCompleto.toLowerCase())) {
        const newOp: OperatoreUcs = {
          id: `op-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          nomeCompleto: s.nomeCompleto,
          anno: annoDest,
          pagaOrariaMedia: s.pagaOrariaMedia,
          consuntivoMensile: {},
          creatoIl: new Date().toISOString(),
          aggiornatoIl: new Date().toISOString(),
        };
        this.operatori.push(newOp);
        created.push(newOp);
      }
    }
    this.persist();
    return { ok: true, data: this.operatori.filter((o) => o.anno === annoDest) };
  }

  async countUnici(): Promise<ApiResponse<{ ucs: number; fondo: number }>> {
    const ucsNames = new Set(this.operatori.map((o) => o.nomeCompleto.trim()));
    return { ok: true, data: { ucs: ucsNames.size, fondo: this.stanziamenti.length } };
  }

  // Tariffe
  async listTariffe(): Promise<ApiResponse<UcsTariffa[]>> {
    return { ok: true, data: [...this.tariffe] };
  }

  async createTariffa(input: { nome?: string; valore: number; isDefault?: boolean }): Promise<ApiResponse<UcsTariffa>> {
    const t: UcsTariffa = {
      id: `tar-${Date.now()}`,
      nome: input.nome || 'Custom Rate',
      valore: input.valore,
      isDefault: Boolean(input.isDefault),
      creatoIl: new Date().toISOString(),
      aggiornatoIl: new Date().toISOString(),
    };
    if (t.isDefault) {
      this.tariffe.forEach((x) => (x.isDefault = false));
    }
    this.tariffe.push(t);
    this.persist();
    return { ok: true, data: t };
  }

  async updateTariffa(id: string, input: { nome?: string; valore?: number }): Promise<ApiResponse<UcsTariffa>> {
    const idx = this.tariffe.findIndex((x) => x.id === id);
    if (idx === -1) return { ok: false, error: 'Rate not found' };
    this.tariffe[idx] = {
      ...this.tariffe[idx],
      ...input,
      aggiornatoIl: new Date().toISOString(),
    };
    this.persist();
    return { ok: true, data: this.tariffe[idx] };
  }

  async setDefaultTariffa(id: string): Promise<ApiResponse<UcsTariffa>> {
    const idx = this.tariffe.findIndex((x) => x.id === id);
    if (idx === -1) return { ok: false, error: 'Rate not found' };
    this.tariffe.forEach((x) => (x.isDefault = false));
    this.tariffe[idx].isDefault = true;
    this.persist();
    return { ok: true, data: this.tariffe[idx] };
  }

  async deleteTariffa(id: string): Promise<ApiResponse<{ id: string }>> {
    this.tariffe = this.tariffe.filter((x) => x.id !== id);
    this.persist();
    return { ok: true, data: { id } };
  }

  // Impegni
  async listImpegniByStanziamento(stanziamentoId: string): Promise<ApiResponse<ImpegnoSpesa[]>> {
    const list = this.impegni.filter((i) => i.stanziamentoAnnualeId === stanziamentoId);
    return { ok: true, data: list };
  }

  async createImpegno(input: Partial<ImpegnoSpesa>): Promise<ApiResponse<ImpegnoSpesa>> {
    const imp: ImpegnoSpesa = {
      id: input.id || `imp-${Date.now()}`,
      stanziamentoAnnualeId: input.stanziamentoAnnualeId || null,
      data: input.data || new Date().toISOString().split('T')[0],
      importo: input.importo || 0,
      causale: input.causale || '',
      sottovoceId: input.sottovoceId || '',
      sottovoceNome: input.sottovoceNome || '',
      macroCategoria: input.macroCategoria || 'servizi',
      collegamentoUcs: input.collegamentoUcs || null,
      creatoIl: new Date().toISOString(),
      aggiornatoIl: new Date().toISOString(),
    };
    this.impegni.push(imp);
    this.persist();
    return { ok: true, data: imp };
  }

  async updateImpegno(id: string, input: Partial<ImpegnoSpesa>): Promise<ApiResponse<ImpegnoSpesa>> {
    const idx = this.impegni.findIndex((x) => x.id === id);
    if (idx === -1) return { ok: false, error: 'Commitment not found' };
    this.impegni[idx] = {
      ...this.impegni[idx],
      ...input,
      aggiornatoIl: new Date().toISOString(),
    };
    this.persist();
    return { ok: true, data: this.impegni[idx] };
  }

  async deleteImpegno(id: string): Promise<ApiResponse<{ ok: boolean }>> {
    this.impegni = this.impegni.filter((x) => x.id !== id);
    this.persist();
    return { ok: true, data: { ok: true } };
  }

  async mesiAllocati(annoUcs: number, excludeImpegnoId?: string): Promise<ApiResponse<Record<string, number[]>>> {
    const out: Record<string, number[]> = {};
    for (const imp of this.impegni) {
      if (excludeImpegnoId && imp.id === excludeImpegnoId) continue;
      if (imp.collegamentoUcs && imp.collegamentoUcs.annoUcs === annoUcs) {
        for (const op of imp.collegamentoUcs.operatori) {
          if (!out[op.operatoreUcsId]) out[op.operatoreUcsId] = [];
          out[op.operatoreUcsId].push(...op.mesi);
        }
      }
    }
    return { ok: true, data: out };
  }

  async monthFondoAnnualita(
    annoUcs: number,
    operatoreUcsId: string,
    excludeImpegnoId?: string,
  ): Promise<ApiResponse<Record<number, string>>> {
    const out: Record<number, string> = {};
    for (const imp of this.impegni) {
      if (excludeImpegnoId && imp.id === excludeImpegnoId) continue;
      if (imp.collegamentoUcs && imp.collegamentoUcs.annoUcs === annoUcs) {
        const op = imp.collegamentoUcs.operatori.find((o) => o.operatoreUcsId === operatoreUcsId);
        if (op) {
          const stz = this.stanziamenti.find((s) => s.id === imp.stanziamentoAnnualeId);
          const annoLabel = stz ? String(stz.anno) : 'Fund';
          for (const m of op.mesi) {
            out[m] = annoLabel;
          }
        }
      }
    }
    return { ok: true, data: out };
  }

  async setMonthFondoAnnualita(input: {
    operatoreUcsId: string;
    annoUcs: number;
    month: number;
    fondoAnno: number;
  }): Promise<ApiResponse<{ updatedIds: string[]; fondoAnno: number; created: boolean; importo?: number }>> {
    return {
      ok: true,
      data: { updatedIds: [], fondoAnno: input.fondoAnno, created: true, importo: 0 },
    };
  }

  // Banners
  async listBanners(): Promise<ApiResponse<ReportBanner[]>> {
    return { ok: true, data: [...this.banners] };
  }
}

export const mockDb = new MockDatabase();

export function createMockFluxApi(): FluxApi {
  return {
    stanziamenti: {
      list: () => mockDb.listStanziamenti(),
      get: (id) => mockDb.getStanziamento(id),
      getByAnno: (anno) => mockDb.getStanziamentoByAnno(anno),
      create: (input) => mockDb.createStanziamento(input),
      update: (id, input) => mockDb.updateStanziamento(id, input),
      delete: (id) => mockDb.deleteStanziamento(id),
    },
    operatori: {
      listByAnno: (anno) => mockDb.listOperatoriByAnno(anno),
      get: (id) => mockDb.getOperatore(id),
      create: (input) => mockDb.createOperatore(input),
      update: (id, input) => mockDb.updateOperatore(id, input),
      delete: (id) => mockDb.deleteOperatore(id),
      listAnni: () => mockDb.listOperatoriAnni(),
      copiaDaAnno: (dest, src) => mockDb.copiaOperatoriDaAnno(dest, src),
      countUnici: () => mockDb.countUnici(),
      pickTimesheets: async () => ({
        ok: true,
        data: { canceled: false, files: [] },
      }),
      importTimesheets: async () => ({
        ok: true,
        data: { results: [], created: 0, updated: 0, skipped: 0 },
      }),
    },
    ucsTariffe: {
      list: () => mockDb.listTariffe(),
      create: (input) => mockDb.createTariffa(input),
      update: (id, input) => mockDb.updateTariffa(id, input),
      setDefault: (id) => mockDb.setDefaultTariffa(id),
      delete: (id) => mockDb.deleteTariffa(id),
    },
    reportBanners: {
      list: () => mockDb.listBanners(),
      pickImage: async () => ({ ok: true, data: { canceled: true } }),
      create: async () => ({ ok: false, error: 'Banner upload is supported in the desktop edition.' }),
      update: async () => ({ ok: false, error: 'Banner upload is supported in the desktop edition.' }),
      delete: async () => ({ ok: true, data: { id: '' } }),
    },
    impegni: {
      listByStanziamento: (id) => mockDb.listImpegniByStanziamento(id),
      create: (input) => mockDb.createImpegno(input),
      update: (id, input) => mockDb.updateImpegno(id, input),
      delete: (id) => mockDb.deleteImpegno(id),
      mesiAllocati: (anno, exc) => mockDb.mesiAllocati(anno, exc),
      monthFondoAnnualita: (anno, opId, exc) => mockDb.monthFondoAnnualita(anno, opId, exc),
      setMonthFondoAnnualita: (input) => mockDb.setMonthFondoAnnualita(input),
    },
    fondo: {
      saveReportDocx: async () => ({
        ok: true,
        data: { folderPath: 'Demo Downloads', paths: [], count: 1 },
      }),
    },
    export: {
      listAnni: async () => {
        const stz = await mockDb.listStanziamenti();
        const years = (stz.data || []).map((s) => s.anno);
        return { ok: true, data: years };
      },
      excel: async () => ({ ok: true, data: { canceled: false, filePath: 'grant_summary_demo.xlsx' } }),
      excelUcs: async () => ({ ok: true, data: { canceled: false, filePath: 'staff_ucs_report_demo.xlsx' } }),
      pdf: async () => ({ ok: true, data: { canceled: false, filePath: 'financial_statement_demo.pdf' } }),
      relazioneDocx: async () => ({ ok: true, data: { canceled: false, filePath: 'quarterly_report_demo.docx' } }),
    },
    database: {
      getPath: async () => ({ ok: true, data: 'flux_demo_localstorage' }),
      getConfig: async () => ({
        ok: true,
        data: { path: 'Browser localStorage (Sandbox Mode)', isCustom: false, defaultPath: 'Browser LocalStorage' },
      }),
      export: async () => ({ ok: true, data: { canceled: false, filePath: 'flux_demo_backup.json' } }),
      importMerge: async () => ({ ok: true, data: { canceled: false, summary: { records: 0 }, reload: false } }),
      exportJson: async () => ({
        ok: true,
        data: {
          canceled: false,
          filePath: 'flux_demo_export.json',
          counts: { stanziamenti: 4, operatori: 7, impegni: 5, tariffe: 4, banners: 0 },
        },
      }),
      importJson: async () => ({ ok: true, data: { canceled: false } }),
      restoreReplace: async () => ({ ok: true, data: { canceled: false, reload: true } }),
      pickPath: async () => ({ ok: true, data: { canceled: true } }),
      setPath: async (p) => ({ ok: true, data: { path: p, isCustom: true, defaultPath: '' } }),
      resetPath: async () => ({ ok: true, data: { path: 'Browser LocalStorage', isCustom: false, defaultPath: '' } }),
      showInFolder: async () => ({ ok: true, data: { path: 'localStorage' } }),
    },
  };
}

// Attach mock API to window if in browser
if (typeof window !== 'undefined' && !window.api) {
  window.api = createMockFluxApi();
}
