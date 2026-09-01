import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import type { OperatoreUcs } from '../../types/api';
import { formatCurrency, formatEuroAmount, totaliOperatore } from '../../lib/utils';
import { Select } from '../../components/ui/Select';
import { useEsercizioUcs } from '../../context/EsercizioContext';

export function UcsReportPage() {
  const { anno, setAnno, anni } = useEsercizioUcs();
  const [operatori, setOperatori] = useState<OperatoreUcs[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const annoOptions = useMemo(() => {
    const list = anni.includes(anno) ? anni : [anno, ...anni];
    return [...new Set(list)]
      .sort((a, b) => b - a)
      .map((y) => ({ value: String(y), label: `FY ${y}` }));
  }, [anni, anno]);

  const metrics = useMemo(() => {
    let ore = 0;
    let importo = 0;
    let mesiValorizzati = 0;
    const trimestri: [number, number, number, number] = [0, 0, 0, 0];
    operatori.forEach((op) => {
      const t = totaliOperatore(op.consuntivoMensile);
      ore += t.oreAnnue;
      importo += t.totaleAnnuo;
      t.trimestri.forEach((v, i) => {
        trimestri[i] += v;
      });
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
      trimestri,
    };
  }, [operatori]);

  useEffect(() => {
    async function load() {
      if (!window.api) {
        setLoading(false);
        return;
      }
      setLoading(true);
      const resOps = await window.api.operatori.listByAnno(anno);
      if (!resOps.ok) {
        setError(resOps.error ?? 'Error loading report');
        setOperatori([]);
      } else {
        setOperatori(resOps.data ?? []);
        setError(null);
      }
      setLoading(false);
    }
    void load();
  }, [anno]);

  return (
    <div className="page-ucs-report page-surface">
      <section className="page-hero">
        <div className="min-w-0">
          <p className="page-hero-kicker">UCS Staff Costs · Reports</p>
          <h1 className="page-hero-title">UCS Quarterly Report</h1>
          <p className="page-hero-desc">
            Analytical breakdown of hours and standard unit costs by staff member.
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
          <Link to="/ucs" className="btn-page-secondary">
            Manage Staff
          </Link>
        </div>
      </section>

      <div className="metric-grid">
        <article className="metric-card">
          <div className="metric-card-top">
            <span className="metric-card-label">Active Staff</span>
            <span className="metric-chip">{metrics.operatori} staff</span>
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
          <div className="metric-card-meta">Timesheet sum</div>
        </article>

        <article className="metric-card is-accent">
          <div className="metric-card-top">
            <span className="metric-card-label">Total Expenditure</span>
            <span className="metric-chip is-brand">UCS</span>
          </div>
          <div className="metric-card-value">€ {formatEuroAmount(metrics.importo)}</div>
          <div className="metric-card-meta">Hours × unit rates</div>
        </article>

        <article className="metric-card">
          <div className="metric-card-top">
            <span className="metric-card-label">Logged Coverage</span>
            <span className="metric-chip is-ok">{metrics.coperturaPct}%</span>
          </div>
          <div className="metric-card-value">{metrics.mesiValorizzati}</div>
          <div className="metric-card-meta">Months with hours logged</div>
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
              <div className="data-shell-title">Staff Cost Statement</div>
              <div className="data-shell-meta">
                UCS Staff Roster · FY {anno} · Quarterly and annual aggregations
              </div>
            </div>
            <span className="data-shell-chip">{metrics.operatori} staff members</span>
          </div>

          <div className="data-shell-body">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Staff Member</th>
                  <th className="text-right">Q1</th>
                  <th className="text-right">Q2</th>
                  <th className="text-right">Q3</th>
                  <th className="text-right">Q4</th>
                  <th className="text-right">Total Hours</th>
                  <th className="text-right">Total Cost</th>
                </tr>
              </thead>
              <tbody>
                {operatori.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="data-table-empty">
                      No staff members registered for FY {anno}.
                    </td>
                  </tr>
                ) : (
                  operatori.map((op) => {
                    const t = totaliOperatore(op.consuntivoMensile);
                    return (
                      <tr key={op.id}>
                        <td className="is-strong">{op.nomeCompleto}</td>
                        <td className="is-mono text-right">{formatCurrency(t.trimestri[0])}</td>
                        <td className="is-mono text-right">{formatCurrency(t.trimestri[1])}</td>
                        <td className="is-mono text-right">{formatCurrency(t.trimestri[2])}</td>
                        <td className="is-mono text-right">{formatCurrency(t.trimestri[3])}</td>
                        <td className="is-mono is-strong text-right">{t.oreAnnue} hrs</td>
                        <td className="is-mono is-strong text-right">
                          {formatCurrency(t.totaleAnnuo)}
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
