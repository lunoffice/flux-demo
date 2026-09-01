export type MacroCategoria = 'personale' | 'servizi';

export type StatoStanziamento = 'disponibile' | 'bilanciato' | 'deficit';

export interface Sottovoce {
  id: string;
  nome: string;
  percentuale: number;
  importo: number;
}

export interface QuadroEconomico {
  versione: number;
  personale: Sottovoce[];
  servizi: Sottovoce[];
}

export interface StanziamentoAnnuale {
  id: string;
  anno: number;
  dotazioneTotale: number;
  codiceCup: string;
  dataEmissione: string;
  quadroEconomico: QuadroEconomico;
  creatoIl: string;
  aggiornatoIl: string;
  importoImpegnato?: number;
  impegnatoPersonale?: number;
  impegnatoServizi?: number;
  residuo?: number;
  stato?: StatoStanziamento;
}

export interface MeseDettaglio {
  ore: number;
  tariffa: number;
}

export type ConsuntivoMensile = Record<string, MeseDettaglio>;

export interface OperatoreUcs {
  id: string;
  nomeCompleto: string;
  anno: number;
  pagaOrariaMedia: number;
  consuntivoMensile: ConsuntivoMensile;
  creatoIl: string;
  aggiornatoIl: string;
}

export interface UcsTariffa {
  id: string;
  nome: string;
  valore: number;
  isDefault: boolean;
  creatoIl: string;
  aggiornatoIl: string;
}

export interface ReportBanner {
  id: string;
  from: number;
  to: number;
  anniLabel: string;
  fileName: string;
  ext: string;
  cx: string;
  cy: string;
  srcRect: string | null;
  creatoIl: string;
  aggiornatoIl: string;
  previewDataUrl?: string;
}

export interface TimesheetImportFile {
  filePath: string;
  fileName: string;
  nomeCompleto: string;
  anno: number;
  orePerMese: Record<string, number>;
  error?: string;
}

export interface TimesheetImportResult {
  nomeCompleto: string;
  anno: number | null;
  action: 'created' | 'updated' | 'skipped' | 'error';
  id?: string;
  mesiScritti?: number;
  error?: string;
}

export interface CollegamentoOperatore {
  operatoreUcsId: string;
  nomeCompleto: string;
  mesi: number[];
}

export interface CollegamentoUcs {
  annoUcs: number;
  operatori: CollegamentoOperatore[];
  importoCalcolato: number;
}

export interface ImpegnoSpesa {
  id: string;
  stanziamentoAnnualeId: string | null;
  data: string;
  importo: number;
  causale: string;
  sottovoceId: string;
  sottovoceNome: string;
  macroCategoria: MacroCategoria;
  collegamentoUcs: CollegamentoUcs | null;
  creatoIl: string;
  aggiornatoIl: string;
}

export interface ApiResponse<T> {
  ok: boolean;
  data?: T;
  error?: string;
}

export interface ExportResult {
  canceled: boolean;
  filePath?: string;
}

export interface FluxApi {
  stanziamenti: {
    list: () => Promise<ApiResponse<StanziamentoAnnuale[]>>;
    get: (id: string) => Promise<ApiResponse<StanziamentoAnnuale>>;
    getByAnno: (anno: number) => Promise<ApiResponse<StanziamentoAnnuale | null>>;
    create: (input: Partial<StanziamentoAnnuale>) => Promise<ApiResponse<StanziamentoAnnuale>>;
    update: (id: string, input: Partial<StanziamentoAnnuale>) => Promise<ApiResponse<StanziamentoAnnuale>>;
    delete: (id: string) => Promise<ApiResponse<{ ok: boolean }>>;
  };
  operatori: {
    listByAnno: (anno: number) => Promise<ApiResponse<OperatoreUcs[]>>;
    get: (id: string) => Promise<ApiResponse<OperatoreUcs>>;
    create: (input: Partial<OperatoreUcs>) => Promise<ApiResponse<OperatoreUcs>>;
    update: (id: string, input: Partial<OperatoreUcs>) => Promise<ApiResponse<OperatoreUcs>>;
    delete: (id: string) => Promise<ApiResponse<{ ok: boolean }>>;
    listAnni: () => Promise<ApiResponse<number[]>>;
    copiaDaAnno: (annoDest: number, annoSorgente: number) => Promise<ApiResponse<OperatoreUcs[]>>;
    countUnici: () => Promise<ApiResponse<{ ucs: number; fondo: number }>>;
    pickTimesheets: () => Promise<
      ApiResponse<{
        canceled: boolean;
        files: TimesheetImportFile[];
      }>
    >;
    importTimesheets: (input: {
      mesi: number[];
      files: TimesheetImportFile[];
    }) => Promise<
      ApiResponse<{
        results: TimesheetImportResult[];
        created: number;
        updated: number;
        skipped: number;
      }>
    >;
  };
  ucsTariffe: {
    list: () => Promise<ApiResponse<UcsTariffa[]>>;
    create: (input: {
      nome?: string;
      valore: number;
      isDefault?: boolean;
    }) => Promise<ApiResponse<UcsTariffa>>;
    update: (
      id: string,
      input: { nome?: string; valore?: number },
    ) => Promise<ApiResponse<UcsTariffa>>;
    setDefault: (id: string) => Promise<ApiResponse<UcsTariffa>>;
    delete: (id: string) => Promise<ApiResponse<{ id: string }>>;
  };
  reportBanners: {
    list: () => Promise<ApiResponse<ReportBanner[]>>;
    pickImage: () => Promise<
      ApiResponse<{
        canceled: boolean;
        fileName?: string;
        ext?: string;
        bytesBase64?: string;
        previewDataUrl?: string;
      }>
    >;
    create: (input: {
      anniInput: string;
      bytesBase64: string;
      ext: string;
      fileName?: string;
    }) => Promise<ApiResponse<ReportBanner>>;
    update: (
      id: string,
      input: { anniInput?: string; bytesBase64?: string; ext?: string },
    ) => Promise<ApiResponse<ReportBanner>>;
    delete: (id: string) => Promise<ApiResponse<{ id: string }>>;
  };
  impegni: {
    listByStanziamento: (stanziamentoId: string) => Promise<ApiResponse<ImpegnoSpesa[]>>;
    create: (input: Partial<ImpegnoSpesa>) => Promise<ApiResponse<ImpegnoSpesa>>;
    update: (id: string, input: Partial<ImpegnoSpesa>) => Promise<ApiResponse<ImpegnoSpesa>>;
    delete: (id: string) => Promise<ApiResponse<{ ok: boolean }>>;
    mesiAllocati: (
      annoUcs: number,
      excludeImpegnoId?: string,
    ) => Promise<ApiResponse<Record<string, number[]>>>;
    monthFondoAnnualita: (
      annoUcs: number,
      operatoreUcsId: string,
      excludeImpegnoId?: string,
    ) => Promise<ApiResponse<Record<number, string>>>;
    setMonthFondoAnnualita: (input: {
      operatoreUcsId: string;
      annoUcs: number;
      month: number;
      fondoAnno: number;
    }) => Promise<ApiResponse<{ updatedIds: string[]; fondoAnno: number; created: boolean; importo?: number }> & { code?: string }>;
  };
  fondo: {
    saveReportDocx: (input: {
      nomeOperatoreRiferimento: string;
      annoUcs: number;
      annoFondo?: number;
      cup?: string;
      importoRicevuto?: number;
      mesiUcsOperatore?: number[];
      mesiReport?: Array<{
        mese: number;
        annoFondo: number;
        cup: string;
        importoRicevuto: number;
      }>;
      orePerMese?: Record<number, number>;
      formato?: 'docx' | 'pdf';
    }) => Promise<ApiResponse<{ folderPath: string; paths: string[]; count: number }>>;
  };
  export: {
    listAnni: () => Promise<ApiResponse<number[]>>;
    excel: (anno: number) => Promise<ApiResponse<ExportResult>>;
    excelUcs: (input: {
      mode: 'anno' | 'tutti';
      anno?: number;
    }) => Promise<ApiResponse<ExportResult>>;
    pdf: (anno: number) => Promise<ApiResponse<ExportResult>>;
    relazioneDocx: (input: {
      annoUcs: number;
      annoFondo: string | number;
      trimestreNumero: number;
      trimestreLabel?: string;
      dataInizio: string;
      dataFine: string;
      cup?: string;
      dotazioneTotale?: number;
      fileName?: string;
    }) => Promise<ApiResponse<ExportResult>>;
  };
  database?: {
    getPath: () => Promise<ApiResponse<string>>;
    getConfig: () => Promise<ApiResponse<{ path: string; isCustom: boolean; defaultPath: string }>>;
    export: () => Promise<ApiResponse<ExportResult>>;
    importMerge: () => Promise<ApiResponse<{ canceled: boolean; summary?: Record<string, number>; reload?: boolean }>>;
    exportJson: () => Promise<ApiResponse<{ canceled: boolean; filePath?: string; counts?: Record<string, number> }>>;
    importJson: () => Promise<ApiResponse<{ canceled: boolean; filePath?: string; summary?: Record<string, number> }>>;
    restoreReplace: () => Promise<ApiResponse<{ canceled: boolean; filePath?: string; reload?: boolean; mode?: string }>>;
    pickPath: () => Promise<ApiResponse<{ canceled: boolean; filePath?: string }>>;
    setPath: (filePath: string) => Promise<ApiResponse<{ path: string; isCustom: boolean; defaultPath: string }>>;
    resetPath: () => Promise<ApiResponse<{ path: string; isCustom: boolean; defaultPath: string }>>;
    showInFolder: (filePath?: string) => Promise<ApiResponse<{ path: string }>>;
  };
}

declare global {
  interface Window {
    api?: FluxApi;
  }
}
