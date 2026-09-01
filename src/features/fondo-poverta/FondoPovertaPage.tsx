import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Landmark, Plus } from 'lucide-react';
import type { StanziamentoAnnuale } from '../../types/api';
import { formatCurrency, formatEuroAmount, percentOf } from '../../lib/utils';
import { StanziamentoCard } from './StanziamentoCard';
import { StanziamentoCreateModal } from './StanziamentoCreateModal';
import { StanziamentoDetailModal } from './StanziamentoDetailModal';

export function FondoPovertaPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [stanziamenti, setStanziamenti] = useState<StanziamentoAnnuale[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<StanziamentoAnnuale | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  async function load() {
    if (!window.api) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await window.api.stanziamenti.list();
      if (res.ok && res.data) setStanziamenti(res.data);
      else if (!res.ok) setError(res.error ?? 'Error loading grant allocations');
    } catch {
      setError('Database connection error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  useEffect(() => {
    if (searchParams.get('nuovo') !== '1') return;
    setShowCreate(true);
    const next = new URLSearchParams(searchParams);
    next.delete('nuovo');
    setSearchParams(next, { replace: true });
  }, [searchParams, setSearchParams]);

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

  async function openDetail(s: StanziamentoAnnuale) {
    if (!window.api) return;
    const res = await window.api.stanziamenti.get(s.id);
    setSelected(res.ok && res.data ? res.data : s);
  }

  async function handleCreated(created: StanziamentoAnnuale) {
    await load();
    if (!window.api) {
      setSelected(created);
      return;
    }
    const res = await window.api.stanziamenti.get(created.id);
    setSelected(res.ok && res.data ? res.data : created);
  }

  return (
    <div className="page-fondo page-surface">
      <section className="page-hero">
        <div className="min-w-0">
          <p className="page-hero-kicker">Social Fund · Management</p>
          <h1 className="page-hero-title">Grant Allocations</h1>
          <p className="page-hero-desc">
            Manage multi-year budgets, economic plans, and expenditure commitments.
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
          <button type="button" className="btn-page-primary" onClick={() => setShowCreate(true)}>
            <Plus className="h-3.5 w-3.5" />
            <span>New Allocation</span>
          </button>
        </div>
      </section>

      <div className="metric-grid">
        <article className="metric-card is-accent">
          <div className="metric-card-top">
            <span className="metric-card-label">Total Grant Budget</span>
            <span className="metric-chip is-brand">{Math.round(metrics.utilizzoPct)}% committed</span>
          </div>
          <div className="metric-card-value">€ {formatEuroAmount(metrics.dotazione)}</div>
          <div className="metric-card-meta">
            Active CUPs: {metrics.cupCount > 0 ? metrics.cupCount : 'none'}
          </div>
        </article>

        <article className="metric-card">
          <div className="metric-card-top">
            <span className="metric-card-label">Committed Amount</span>
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
          <div className="metric-card-meta">
            Total Fund: {formatCurrency(metrics.dotazione)}
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
            Loading allocations…
          </div>
        ) : ordinati.length === 0 ? (
          <div className="modal-panel space-y-4 p-12 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-[var(--radius-lg)] border border-[var(--line)] bg-[var(--paper-muted)] text-[var(--ink)]">
              <Landmark className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-[var(--ink)]">No Allocations Recorded</h3>
              <p className="mx-auto max-w-sm text-xs font-medium text-[var(--muted)]">
                Create the first annual grant allocation to begin planning budgets and commitments.
              </p>
            </div>
            <button type="button" className="btn-page-primary" onClick={() => setShowCreate(true)}>
              <Plus className="h-4 w-4" />
              <span>Create First Allocation</span>
            </button>
          </div>
        ) : (
          <div className="fondo-cards-grid">
            {ordinati.map((s) => (
              <StanziamentoCard
                key={s.id}
                stanziamento={s}
                onOpen={() => void openDetail(s)}
                onDeleted={load}
              />
            ))}
          </div>
        )}
      </div>

      {showCreate && (
        <StanziamentoCreateModal
          anniEsistenti={stanziamenti.map((s) => s.anno)}
          onClose={() => setShowCreate(false)}
          onCreated={(st) => void handleCreated(st)}
        />
      )}

      {selected && (
        <StanziamentoDetailModal
          stanziamento={selected}
          onClose={() => setSelected(null)}
          onUpdated={load}
        />
      )}
    </div>
  );
}
