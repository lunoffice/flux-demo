import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Download,
  Eye,
  Trash2,
  Upload,
  UserPlus,
  Wallet,
} from 'lucide-react';
import type { OperatoreUcs, StanziamentoAnnuale } from '../../types/api';
import { useEsercizio } from '../../context/EsercizioContext';
import { useDemo } from '../../context/DemoContext';
import { formatCurrency, formatEuroAmount, percentOf, totaliOperatore } from '../../lib/utils';
import { cn } from '../../lib/cn';
import { StanziamentoDetailModal } from '../fondo-poverta/StanziamentoDetailModal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';

function usageTone(pct: number): 'is-mid' | 'is-high' | 'is-over' | undefined {
  if (pct > 100) return 'is-over';
  if (pct > 85) return 'is-high';
  if (pct > 0) return 'is-mid';
  return undefined;
}

export function DashboardPage() {
  const { esercizioUcs } = useEsercizio();
  const { showDemoNotice } = useDemo();
  const [selectedAnno] = useState<number | 'tutti'>('tutti');
  const [stanziamenti, setStanziamenti] = useState<StanziamentoAnnuale[]>([]);
  const [operatori, setOperatori] = useState<OperatoreUcs[]>([]);
  const [selectedStanziamento, setSelectedStanziamento] = useState<StanziamentoAnnuale | null>(null);
  const [stanziamentoToDelete, setStanziamentoToDelete] = useState<StanziamentoAnnuale | null>(null);
  const [deletingStanziamento, setDeletingStanziamento] = useState(false);

  async function handleDeleteStanziamento() {
    if (!stanziamentoToDelete || !window.api) return;
    setDeletingStanziamento(true);
    try {
      const res = await window.api.stanziamenti.delete(stanziamentoToDelete.id);
      if (res.ok) {
        setStanziamentoToDelete(null);
        await loadData();
      }
    } catch (err) {
      console.error('Error deleting grant:', err);
    } finally {
      setDeletingStanziamento(false);
    }
  }

  async function loadData() {
    if (!window.api) return;
    try {
      const targetAnno = selectedAnno === 'tutti' ? esercizioUcs : selectedAnno;
      const [resStanz, resOps] = await Promise.all([
        window.api.stanziamenti.list(),
        window.api.operatori.listByAnno(targetAnno),
      ]);
      if (resStanz.ok && resStanz.data) setStanziamenti(resStanz.data);
      if (resOps.ok && resOps.data) setOperatori(resOps.data);
    } catch (err) {
      console.error('Error loading dashboard:', err);
    }
  }

  async function openStanziamento(row: StanziamentoAnnuale) {
    if (!window.api) {
      setSelectedStanziamento(row);
      return;
    }
    const res = await window.api.stanziamenti.get(row.id);
    setSelectedStanziamento(res.ok && res.data ? res.data : row);
  }

  useEffect(() => {
    void loadData();
  }, [selectedAnno, esercizioUcs]);

  const metricsFondo = useMemo(() => {
    if (stanziamenti.length === 0) {
      return {
        dotazione: 0,
        impegnato: 0,
        personale: 0,
        residuo: 0,
        stato: 'Available',
        cupCount: 0,
        utilizzoPct: 0,
      };
    }

    if (selectedAnno === 'tutti') {
      const dotazione = stanziamenti.reduce((acc, s) => acc + (s.dotazioneTotale || 0), 0);
      const impegnato = stanziamenti.reduce((acc, s) => acc + (s.importoImpegnato || 0), 0);
      const personale = stanziamenti.reduce(
        (acc, s) =>
          acc +
          (s.impegnatoPersonale ||
            (s.quadroEconomico?.personale
              ? s.quadroEconomico.personale.reduce((v, x) => v + x.importo, 0)
              : 0)),
        0,
      );
      const residuo = Math.max(0, dotazione - impegnato);
      const cups = Array.from(
        new Set(stanziamenti.map((s) => s.codiceCup?.trim()).filter(Boolean)),
      );
      return {
        dotazione,
        impegnato,
        personale,
        residuo,
        stato: residuo <= 0 ? 'Balanced' : 'Available',
        cupCount: cups.length,
        utilizzoPct: percentOf(impegnato, dotazione),
      };
    }

    const stanz = stanziamenti.find((s) => s.anno === selectedAnno) ?? stanziamenti[0];
    const dotazione = stanz?.dotazioneTotale || 0;
    const impegnato = stanz?.importoImpegnato ?? 0;
    const personale = stanz?.impegnatoPersonale ?? 0;
    const residuo = stanz?.residuo ?? Math.max(0, dotazione - impegnato);
    const cup = stanz?.codiceCup?.trim();

    return {
      dotazione,
      impegnato,
      personale,
      residuo,
      stato: stanz?.stato === 'bilanciato' ? 'Balanced' : residuo <= 0 ? 'Balanced' : 'Available',
      cupCount: cup && cup.length > 0 ? 1 : 0,
      utilizzoPct: percentOf(impegnato, dotazione),
    };
  }, [stanziamenti, selectedAnno]);

  const metricsUcs = useMemo(() => {
    let oreTotali = 0;
    let importoTotale = 0;
    operatori.forEach((op) => {
      const t = totaliOperatore(op.consuntivoMensile);
      oreTotali += t.oreAnnue;
      importoTotale += t.totaleAnnuo;
    });
    return {
      oreTotali,
      importoTotale,
      operatoriCount: operatori.length,
    };
  }, [operatori]);

  const ordinati = useMemo(
    () => [...stanziamenti].sort((a, b) => b.anno - a.anno),
    [stanziamenti],
  );

  return (
    <div className="page-dashboard page-surface">
      <section className="page-hero page-hero-ucs">
        <div className="page-hero-topline">
          <p className="page-hero-kicker">Flux · Executive Overview</p>
          <div className="page-hero-topline-actions">
            <button
              type="button"
              className="btn-page-secondary page-hero-topline-action is-import"
              onClick={() => showDemoNotice('JSON Data Import & Merge')}
            >
              <Upload className="h-3.5 w-3.5" />
              <span>Import</span>
            </button>
            <button
              type="button"
              className="btn-page-secondary page-hero-topline-action is-export"
              onClick={() => showDemoNotice('Database Snapshot Export')}
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export</span>
            </button>
          </div>
        </div>

        <div className="page-hero-ucs-main">
          <div className="min-w-0">
            <h1 className="page-hero-title">Financial & Staff Overview</h1>
            <p className="page-hero-desc">
              Summary of multi-year social grant allocations and Standard Unit Cost (UCS) staff timesheets.
            </p>
            <div className="page-hero-meta">
              <div className="page-hero-meta-item">
                <span>Fiscal Years</span>
                {ordinati.length}
              </div>
              <div className="page-hero-meta-item">
                <span>Active Grants (CUP)</span>
                {metricsFondo.cupCount > 0 ? metricsFondo.cupCount : '—'}
              </div>
              <div className="page-hero-meta-item">
                <span>Staff Roster</span>
                {metricsUcs.operatoriCount}
              </div>
              <div className="page-hero-meta-item">
                <span>Active FY</span>
                {esercizioUcs}
              </div>
            </div>
          </div>

          <div className="page-hero-actions">
            <Link to="/ucs?nuovo=1" className="btn-page-secondary">
              <UserPlus className="h-3.5 w-3.5" />
              <span>Add Staff Member</span>
            </Link>
            <Link to="/fondo?nuovo=1" className="btn-page-primary">
              <Wallet className="h-3.5 w-3.5" />
              <span>New Grant Allocation</span>
            </Link>
          </div>
        </div>
      </section>

      <div className="metric-grid">
        <article className="metric-card is-accent">
          <div className="metric-card-top">
            <span className="metric-card-label">Total Grant Budget</span>
            <span className="metric-chip is-brand">
              {Math.round(metricsFondo.utilizzoPct)}% committed
            </span>
          </div>
          <div className="metric-card-value">€ {formatEuroAmount(metricsFondo.dotazione)}</div>
          <div className="metric-card-meta">
            Active Grants (CUP): {metricsFondo.cupCount > 0 ? metricsFondo.cupCount : 'none'}
          </div>
        </article>

        <article className="metric-card">
          <div className="metric-card-top">
            <span className="metric-card-label">Committed Funds</span>
            <span className="metric-chip is-ok">On Track</span>
          </div>
          <div className="metric-card-value">€ {formatEuroAmount(metricsFondo.impegnato)}</div>
          <div className="metric-card-meta">Personnel: {formatCurrency(metricsFondo.personale)}</div>
        </article>

        <article className={cn('metric-card', metricsFondo.residuo > 0 ? 'is-ok' : undefined)}>
          <div className="metric-card-top">
            <span className="metric-card-label">Available Balance</span>
            <span className={cn('metric-chip', metricsFondo.residuo <= 0 ? 'is-warn' : 'is-ok')}>
              {metricsFondo.residuo <= 0 ? 'Fully Allocated' : 'Available'}
            </span>
          </div>
          <div className="metric-card-value">€ {formatEuroAmount(metricsFondo.residuo)}</div>
          <div className="metric-card-meta">Status: {metricsFondo.stato}</div>
        </article>

        <article className="metric-card is-accent">
          <div className="metric-card-top">
            <span className="metric-card-label">Total UCS Staff Costs</span>
            <span className="metric-chip">{metricsUcs.operatoriCount} staff active</span>
          </div>
          <div className="metric-card-value">€ {formatEuroAmount(metricsUcs.importoTotale)}</div>
          <div className="metric-card-meta">
            Logged hours: {metricsUcs.oreTotali.toLocaleString('en-US')} hrs
          </div>
        </article>
      </div>

      <section className="data-shell">
        <div className="data-shell-head">
          <div>
            <div className="data-shell-title">Multi-Year Grant Allocations</div>
            <div className="data-shell-meta">Public welfare fund · budget utilization overview</div>
          </div>
          <span className="data-shell-chip">{ordinati.length} fiscal years</span>
        </div>

        <div className="data-shell-body">
          <table className="data-table">
            <thead>
              <tr>
                <th>Fiscal Year</th>
                <th>Grant Code (CUP)</th>
                <th>Total Budget</th>
                <th>Committed</th>
                <th>Remaining Balance</th>
                <th>Utilization</th>
                <th className="text-center">Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {ordinati.length === 0 ? (
                <tr>
                  <td colSpan={8} className="data-table-empty">
                    No grant allocations recorded.
                  </td>
                </tr>
              ) : (
                ordinati.map((row) => {
                  const imp = row.importoImpegnato || 0;
                  const dot = row.dotazioneTotale || 1;
                  const res = row.residuo ?? Math.max(0, dot - imp);
                  const pct = percentOf(imp, dot);
                  const isAvailable = res > 0;
                  const tone = usageTone(pct);

                  return (
                    <tr key={row.id}>
                      <td className="is-strong is-mono">FY-{row.anno}</td>
                      <td className="is-mono is-muted text-xs">{row.codiceCup || 'N/A'}</td>
                      <td className="is-mono is-strong">{formatCurrency(dot)}</td>
                      <td className="is-mono is-strong">{formatCurrency(imp)}</td>
                      <td className="is-mono is-strong">{formatCurrency(res)}</td>
                      <td>
                        <div className="usage-bar">
                          <div className="usage-bar-track">
                            <div
                              className={cn('usage-bar-fill', tone)}
                              style={{ width: `${Math.min(100, pct)}%` }}
                            />
                          </div>
                          <span className="usage-bar-pct">{Math.round(pct)}%</span>
                        </div>
                      </td>
                      <td className="text-center">
                        <span className={cn('status-pill', isAvailable ? 'is-yes' : 'is-no')}>
                          {isAvailable ? 'Available' : 'Balanced'}
                        </span>
                      </td>
                      <td className="text-right">
                        <div className="inline-flex items-center justify-end gap-0.5">
                          <button
                            type="button"
                            title="Inspect grant allocation"
                            onClick={() => void openStanziamento(row)}
                            className="icon-btn"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            title={`Delete FY ${row.anno} allocation`}
                            onClick={() => setStanziamentoToDelete(row)}
                            className="icon-btn is-danger"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      {selectedStanziamento && (
        <StanziamentoDetailModal
          stanziamento={selectedStanziamento}
          onClose={() => setSelectedStanziamento(null)}
          onUpdated={() => void loadData()}
        />
      )}

      {stanziamentoToDelete && (
        <ConfirmDialog
          title={`Delete Fiscal Year ${stanziamentoToDelete.anno}`}
          message={`Are you sure you want to delete the grant allocation for FY ${stanziamentoToDelete.anno}? Associated commitments will be unlinked.`}
          confirmLabel="Delete Allocation"
          variant="danger"
          loading={deletingStanziamento}
          onConfirm={() => void handleDeleteStanziamento()}
          onCancel={() => setStanziamentoToDelete(null)}
        />
      )}
    </div>
  );
}
