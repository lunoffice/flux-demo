import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import type { StanziamentoAnnuale } from '../../types/api';
import {
  formatCurrency,
  formatEuroAmount,
  percentOf,
  statoLabel,
} from '../../lib/utils';
import { cn } from '../../lib/cn';

function usageTone(pct: number): 'is-mid' | 'is-high' | 'is-over' | undefined {
  if (pct > 100) return 'is-over';
  if (pct > 85) return 'is-high';
  if (pct > 0) return 'is-mid';
  return undefined;
}

export function FondoReportPage() {
  const [stanziamenti, setStanziamenti] = useState<StanziamentoAnnuale[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      if (!window.api) {
        setLoading(false);
        return;
      }
      setLoading(true);
      const res = await window.api.stanziamenti.list();
      if (!res.ok) {
        setError(res.error ?? 'Error loading allocations');
        setStanziamenti([]);
      } else {
        const list = res.data ?? [];
        setStanziamenti(list);
        setError(null);
      }
      setLoading(false);
    }
    void load();
  }, []);

  const ordinati = useMemo(
    () => [...stanziamenti].sort((a, b) => b.anno - a.anno),
    [stanziamenti],
  );

  const metrics = useMemo(() => {
    const dotazione = stanziamenti.reduce((acc, s) => acc + (s.dotazioneTotale || 0), 0);
    const impegnato = stanziamenti.reduce((acc, s) => acc + (s.importoImpegnato || 0), 0);
    const residuo = Math.max(0, dotazione - impegnato);
    const cupCount = new Set(
      stanziamenti.map((s) => s.codiceCup?.trim()).filter(Boolean),
    ).size;
    return {
      dotazione,
      impegnato,
      residuo,
      cupCount,
      utilizzoPct: percentOf(impegnato, dotazione),
      annualita: stanziamenti.length,
    };
  }, [stanziamenti]);

  return (
    <div className="page-fondo-report page-surface">
      <section className="page-hero">
        <div className="min-w-0">
          <p className="page-hero-kicker">Social Fund · Reports</p>
          <h1 className="page-hero-title">Grant Overview Report</h1>
          <p className="page-hero-desc">
            Consolidated statement of grant allocations, commitments, and remaining balances.
          </p>
          <div className="page-hero-meta">
            <div className="page-hero-meta-item">
              <span>Fiscal Years</span>
              {metrics.annualita}
            </div>
            <div className="page-hero-meta-item">
              <span>Active CUPs</span>
              {metrics.cupCount > 0 ? metrics.cupCount : '—'}
            </div>
            <div className="page-hero-meta-item">
              <span>Committed</span>
              {Math.round(metrics.utilizzoPct)}%
            </div>
          </div>
        </div>

        <div className="page-hero-actions">
          <Link to="/fondo" className="btn-page-secondary">
            Manage Allocations
          </Link>
        </div>
      </section>

      <div className="metric-grid">
        <article className="metric-card is-accent">
          <div className="metric-card-top">
            <span className="metric-card-label">Total Grant Budget</span>
            <span className="metric-chip is-brand">
              {Math.round(metrics.utilizzoPct)}% committed
            </span>
          </div>
          <div className="metric-card-value">€ {formatEuroAmount(metrics.dotazione)}</div>
          <div className="metric-card-meta">
            Active CUPs: {metrics.cupCount > 0 ? metrics.cupCount : 'none'}
          </div>
        </article>

        <article className="metric-card">
          <div className="metric-card-top">
            <span className="metric-card-label">Committed Funds</span>
            <span className="metric-chip is-ok">On Track</span>
          </div>
          <div className="metric-card-value">€ {formatEuroAmount(metrics.impegnato)}</div>
          <div className="metric-card-meta">Across {metrics.annualita} fiscal years</div>
        </article>

        <article className="metric-card">
          <div className="metric-card-top">
            <span className="metric-card-label">Remaining Balance</span>
            <span className="metric-chip is-ok">
              {metrics.residuo <= 0 ? 'Fully Allocated' : 'Available'}
            </span>
          </div>
          <div className="metric-card-value">€ {formatEuroAmount(metrics.residuo)}</div>
          <div className="metric-card-meta">Total Budget − Committed</div>
        </article>

        <article className="metric-card is-accent">
          <div className="metric-card-top">
            <span className="metric-card-label">Fiscal Years</span>
            <span className="metric-chip">{metrics.annualita} active</span>
          </div>
          <div className="metric-card-value">{metrics.annualita}</div>
          <div className="metric-card-meta">Total: {formatCurrency(metrics.dotazione)}</div>
        </article>
      </div>

      {error && (
        <div className="shrink-0 rounded-[var(--radius-lg)] border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="modal-panel p-12 text-center text-xs font-semibold text-[var(--muted)]">
          Loading report…
        </div>
      ) : (
        <section className="data-shell report-data-shell">
          <div className="data-shell-head">
            <div>
              <div className="data-shell-title">Grant Allocations Summary</div>
              <div className="data-shell-meta">
                Historical record · budgets, commitments, balances, and operational status
              </div>
            </div>
            <span className="data-shell-chip">{ordinati.length} fiscal years</span>
          </div>

          <div className="data-shell-body">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Fiscal Year</th>
                  <th>Grant Code (CUP)</th>
                  <th className="text-right">Total Budget</th>
                  <th className="text-right">Committed</th>
                  <th className="text-right">Remaining Balance</th>
                  <th>Utilization</th>
                  <th className="text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {ordinati.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="data-table-empty">
                      No grant allocations recorded.
                    </td>
                  </tr>
                ) : (
                  ordinati.map((s) => {
                    const imp = s.importoImpegnato ?? 0;
                    const dot = s.dotazioneTotale || 1;
                    const res = s.residuo ?? Math.max(0, s.dotazioneTotale - imp);
                    const pct = percentOf(imp, dot);
                    return (
                      <tr key={s.id}>
                        <td className="is-strong is-mono">FY-{s.anno}</td>
                        <td className="is-mono is-muted text-xs">{s.codiceCup?.trim() || '—'}</td>
                        <td className="is-mono is-strong text-right">
                          {formatCurrency(s.dotazioneTotale)}
                        </td>
                        <td className="is-mono is-strong text-right">{formatCurrency(imp)}</td>
                        <td className="is-mono is-strong text-right">{formatCurrency(res)}</td>
                        <td>
                          <div className="usage-bar">
                            <div className="usage-bar-track">
                              <div
                                className={cn('usage-bar-fill', usageTone(pct))}
                                style={{ width: `${Math.min(100, pct)}%` }}
                              />
                            </div>
                            <span className="usage-bar-pct">{Math.round(pct)}%</span>
                          </div>
                        </td>
                        <td className="text-center">
                          <span className="status-pill is-yes">
                            {statoLabel(s.stato)}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
