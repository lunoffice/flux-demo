import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { UserPlus, Users, FileSpreadsheet, Tags, Download, FileText } from 'lucide-react';
import type { OperatoreUcs } from '../../types/api';
import { formatCurrency, formatEuroAmount, totaliOperatore } from '../../lib/utils';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Select } from '../../components/ui/Select';
import { AppToast } from '../../components/ui/AppToast';
import { UcsExcelExportModal } from '../../components/export/UcsExcelExportModal';
import { useEsercizioUcs, useEsercizio } from '../../context/EsercizioContext';
import { NuovoOperatoreModal } from './NuovoOperatoreModal';
import { ImportTimesheetModal } from './ImportTimesheetModal';
import { OperatoreUcsCard } from './OperatoreUcsCard';
import { UcsOperatoreModal } from './UcsOperatoreModal';
import { GestioneUcsTariffeModal } from './GestioneUcsTariffeModal';
import { RelazionePeriodicaModal } from './RelazionePeriodicaModal';

export function SpeseUcsPage() {
  const { anno, setAnno, anni } = useEsercizioUcs();
  const { refreshAnni } = useEsercizio();
  const [searchParams, setSearchParams] = useSearchParams();
  const [operatori, setOperatori] = useState<OperatoreUcs[]>([]);
  const [mesiAllocati, setMesiAllocati] = useState<Record<string, number[]>>({});
  const [fondoAnnoPerMese, setFondoAnnoPerMese] = useState<
    Record<string, Record<number, string>>
  >({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [modalOperatore, setModalOperatore] = useState<OperatoreUcs | null>(null);
  const [showNuovoOperatoreModal, setShowNuovoOperatoreModal] = useState(false);
  const [showImportTimesheetModal, setShowImportTimesheetModal] = useState(false);
  const [showGestioneUcsModal, setShowGestioneUcsModal] = useState(false);
  const [showRelazioneModal, setShowRelazioneModal] = useState(false);
  const [showExcelExportModal, setShowExcelExportModal] = useState(false);
  const [importToast, setImportToast] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<OperatoreUcs | null>(null);
  const [deleting, setDeleting] = useState(false);

  const metrics = useMemo(() => {
    let ore = 0;
    let importo = 0;
    let mesiValorizzati = 0;
    operatori.forEach((op) => {
      const t = totaliOperatore(op.consuntivoMensile);
      ore += t.oreAnnue;
      importo += t.totaleAnnuo;
      for (let m = 1; m <= 12; m++) {
        const dett = op.consuntivoMensile[String(m)];
        if (dett && typeof dett.ore === 'number' && dett.ore > 0) mesiValorizzati += 1;
      }
    });
    const mesiPossibili = Math.max(1, operatori.length * 12);
    const coperturaPct = Math.round((mesiValorizzati / mesiPossibili) * 100);
    return {
      operatori: operatori.length,
      ore,
      importo,
      mesiValorizzati,
      coperturaPct,
    };
  }, [operatori]);

  const annoOptions = useMemo(() => {
    const list = anni.includes(anno) ? anni : [anno, ...anni];
    return [...new Set(list)]
      .sort((a, b) => b - a)
      .map((y) => ({ value: String(y), label: `FY ${y}` }));
  }, [anni, anno]);

  async function load() {
    if (!window.api) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const [resOps, resAlloc] = await Promise.all([
      window.api.operatori.listByAnno(anno),
      window.api.impegni.mesiAllocati(anno),
    ]);
    if (!resOps.ok) {
      setError(resOps.error ?? 'Error loading staff members');
      setOperatori([]);
      setFondoAnnoPerMese({});
      setLoading(false);
      return;
    }

    const list = resOps.data ?? [];
    setOperatori(list);
    setError(null);
    if (resAlloc.ok && resAlloc.data) {
      setMesiAllocati(resAlloc.data);
    }

    const fondoMap: Record<string, Record<number, string>> = {};
    await Promise.all(
      list.map(async (op) => {
        const res = await window.api!.impegni.monthFondoAnnualita(anno, op.id);
        if (res.ok && res.data) {
          const byMonth: Record<number, string> = {};
          for (const [k, v] of Object.entries(res.data)) {
            const m = Number(k);
            if (Number.isFinite(m) && v) byMonth[m] = String(v);
          }
          if (Object.keys(byMonth).length > 0) fondoMap[op.id] = byMonth;
        }
      }),
    );
    setFondoAnnoPerMese(fondoMap);
    setLoading(false);
  }

  useEffect(() => {
    void load();
  }, [anno]);

  useEffect(() => {
    if (searchParams.get('nuovo') !== '1') return;
    setShowNuovoOperatoreModal(true);
    const next = new URLSearchParams(searchParams);
    next.delete('nuovo');
    setSearchParams(next, { replace: true });
  }, [searchParams, setSearchParams]);

  async function eliminaOperatore() {
    if (!deleteTarget || !window.api) return;
    setDeleting(true);
    try {
      const res = await window.api.operatori.delete(deleteTarget.id);
      if (!res.ok) {
        setError(res.error ?? 'Error deleting staff member');
      } else {
        setDeleteTarget(null);
        await load();
        await refreshAnni();
      }
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="page-ucs page-surface">
      <section className="page-hero page-hero-ucs">
        <div className="page-hero-topline">
          <p className="page-hero-kicker">UCS Staff Costs · Operations</p>
          <div className="page-hero-topline-actions">
            <button
              type="button"
              className="btn-page-secondary page-hero-topline-action"
              onClick={() => setShowRelazioneModal(true)}
            >
              <FileText className="h-3.5 w-3.5" />
              <span>Quarterly Statement</span>
            </button>
            <button
              type="button"
              className="btn-page-secondary page-hero-topline-action"
              onClick={() => setShowGestioneUcsModal(true)}
            >
              <Tags className="h-3.5 w-3.5" />
              <span>Standard Rates</span>
            </button>
          </div>
        </div>

        <div className="page-hero-ucs-main">
          <div className="min-w-0">
            <h1 className="page-hero-title">Staff Roster & Hours</h1>
            <p className="page-hero-desc">
              Monthly timesheets, hourly rate calculations, and grant budget allocations.
            </p>
            <div className="page-hero-meta">
              <div className="page-hero-meta-item">
                <span>Active Staff</span>
                {metrics.operatori}
              </div>
              <div className="page-hero-meta-item">
                <span>Logged Hours</span>
                {metrics.ore.toLocaleString('en-US')} hrs
              </div>
              <div className="page-hero-meta-item">
                <span>Total Costs</span>
                {formatCurrency(metrics.importo)}
              </div>
            </div>
          </div>

          <div className="page-hero-actions">
            <div className="page-ucs-anno">
              <span className="page-ucs-anno-label">Fiscal Year</span>
              <Select
                value={String(anno)}
                onChange={(v) => setAnno(Number(v))}
                options={annoOptions}
                aria-label="UCS Fiscal Year"
              />
            </div>
            <button
              type="button"
              className="btn-page-secondary"
              onClick={() => setShowExcelExportModal(true)}
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export Excel</span>
            </button>
            <button
              type="button"
              className="btn-page-secondary"
              onClick={() => setShowImportTimesheetModal(true)}
            >
              <FileSpreadsheet className="h-3.5 w-3.5" />
              <span>Import Timesheets</span>
            </button>
            <button
              type="button"
              className="btn-page-primary"
              onClick={() => setShowNuovoOperatoreModal(true)}
            >
              <UserPlus className="h-3.5 w-3.5" />
              <span>Add Staff Member</span>
            </button>
          </div>
        </div>
      </section>

      <div className="metric-grid">
        <article className="metric-card">
          <div className="metric-card-top">
            <span className="metric-card-label">Staff Members</span>
            <span className="metric-chip">{metrics.operatori} active</span>
          </div>
          <div className="metric-card-value">{metrics.operatori}</div>
          <div className="metric-card-meta">Fiscal Year {anno}</div>
        </article>

        <article className="metric-card is-ok">
          <div className="metric-card-top">
            <span className="metric-card-label">Annual Hours</span>
            <span className="metric-chip is-ok">Total</span>
          </div>
          <div className="metric-card-value">{metrics.ore.toLocaleString('en-US')} hrs</div>
          <div className="metric-card-meta">Aggregated timesheet sum</div>
        </article>

        <article className="metric-card is-accent">
          <div className="metric-card-top">
            <span className="metric-card-label">Total Expenditure</span>
            <span className="metric-chip is-brand">UCS</span>
          </div>
          <div className="metric-card-value">€ {formatEuroAmount(metrics.importo)}</div>
          <div className="metric-card-meta">Hours × assigned unit rate</div>
        </article>

        <article className="metric-card">
          <div className="metric-card-top">
            <span className="metric-card-label">Logged Coverage</span>
            <span className="metric-chip is-ok">{metrics.coperturaPct}%</span>
          </div>
          <div className="metric-card-value">{metrics.mesiValorizzati}</div>
          <div className="metric-card-meta">
            Active months with hours logged
          </div>
        </article>
      </div>

      {error && (
        <div className="shrink-0 rounded-[var(--radius-lg)] border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-700">
          {error}
        </div>
      )}

      <div className="fondo-cards-area">
        {loading ? (
          <div className="modal-panel p-12 text-center text-xs font-semibold text-[var(--muted)]">
            Loading staff roster…
          </div>
        ) : operatori.length === 0 ? (
          <div className="modal-panel space-y-4 p-12 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-[var(--radius-lg)] border border-[var(--line)] bg-[var(--paper-muted)] text-[var(--ink)]">
              <Users className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-[var(--ink)]">No Staff Members Registered</h3>
              <p className="mx-auto max-w-sm text-xs font-medium text-[var(--muted)]">
                Add staff to FY {anno} or copy the roster from a previous year.
              </p>
            </div>
            <button
              type="button"
              className="btn-page-primary"
              onClick={() => setShowNuovoOperatoreModal(true)}
            >
              <UserPlus className="h-4 w-4" />
              <span>Add Staff Member</span>
            </button>
          </div>
        ) : (
          <div className="fondo-cards-grid">
            {operatori.map((op) => (
              <OperatoreUcsCard
                key={op.id}
                operatore={op}
                anno={anno}
                fondoAnnoPerMese={fondoAnnoPerMese}
                onOpenEdit={() => setModalOperatore(op)}
                onDelete={() => setDeleteTarget(op)}
              />
            ))}
          </div>
        )}
      </div>

      {deleteTarget && (
        <ConfirmDialog
          title="Delete Staff Member"
          message={`Are you sure you want to delete ${deleteTarget.nomeCompleto} from FY ${anno}?`}
          confirmLabel="Delete"
          variant="danger"
          loading={deleting}
          onConfirm={() => void eliminaOperatore()}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {modalOperatore && (
        <UcsOperatoreModal
          operatore={modalOperatore}
          anno={anno}
          mesiAllocati={mesiAllocati}
          fondoAnnoPerMese={fondoAnnoPerMese}
          onClose={() => setModalOperatore(null)}
          onSaved={() => void load()}
        />
      )}

      {showNuovoOperatoreModal && (
        <NuovoOperatoreModal
          annoDefault={anno}
          onClose={() => setShowNuovoOperatoreModal(false)}
          onSaved={() => {
            void load();
            void refreshAnni();
          }}
        />
      )}

      {showImportTimesheetModal && (
        <ImportTimesheetModal
          onClose={() => setShowImportTimesheetModal(false)}
          onImported={({ operatori }) => {
            void load();
            void refreshAnni();
            setImportToast(`Import completed: ${operatori} staff members updated.`);
          }}
        />
      )}

      {showExcelExportModal && (
        <UcsExcelExportModal isOpen={showExcelExportModal} currentYear={anno} onClose={() => setShowExcelExportModal(false)} />
      )}

      {showGestioneUcsModal && (
        <GestioneUcsTariffeModal
          onClose={() => setShowGestioneUcsModal(false)}
          onChanged={() => void load()}
        />
      )}

      {showRelazioneModal && (
        <RelazionePeriodicaModal
          anno={anno}
          operatori={operatori}
          fondoAnnoPerMese={fondoAnnoPerMese}
          onClose={() => setShowRelazioneModal(false)}
        />
      )}

      {importToast && (
        <AppToast message={importToast} onClose={() => setImportToast(null)} />
      )}
    </div>
  );
}
