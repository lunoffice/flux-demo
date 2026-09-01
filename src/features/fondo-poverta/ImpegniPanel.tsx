import { lazy, Suspense, useMemo, useState } from 'react';
import { CalendarDays, Clock, Handshake, Plus, Trash2, Users } from 'lucide-react';
import type { ImpegnoSpesa, StanziamentoAnnuale } from '../../types/api';
import { formatCurrency, formatPercent, percentOf } from '../../lib/utils';
import { cn } from '../../lib/cn';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { ImpegnoFormModal } from './ImpegnoFormModal';

const ImpegnoDettagliModal = lazy(() =>
  import('./ImpegnoDettagliModal').then((m) => ({ default: m.ImpegnoDettagliModal })),
);

function CausaleIcon({
  macro,
  className,
  size = 15,
}: {
  macro: ImpegnoSpesa['macroCategoria'];
  className?: string;
  size?: number;
}) {
  const Icon = macro === 'personale' ? Clock : Handshake;
  return (
    <Icon
      className={className ?? 'stanz-impegni-causale-icon'}
      size={size}
      strokeWidth={2}
      aria-hidden="true"
    />
  );
}

function opsSummary(imp: ImpegnoSpesa): { count: number; mesi: number } | null {
  const ops = imp.collegamentoUcs?.operatori ?? [];
  if (ops.length === 0) return null;
  return {
    count: ops.length,
    mesi: ops.reduce((sum, o) => sum + o.mesi.length, 0),
  };
}

export function ImpegniPanel({
  stanziamento,
  onUpdated,
}: {
  stanziamento: StanziamentoAnnuale;
  onUpdated: () => void;
}) {
  const [impegni, setImpegni] = useState<ImpegnoSpesa[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<ImpegnoSpesa | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [dettagliImpegno, setDettagliImpegno] = useState<ImpegnoSpesa | null>(null);
  const [editingImpegno, setEditingImpegno] = useState<ImpegnoSpesa | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  async function loadImpegni() {
    if (!window.api) return;
    try {
      const res = await window.api.impegni.listByStanziamento(stanziamento.id);
      if (res.ok && res.data) {
        setImpegni(res.data);
      }
    } catch {
      // Ignored
    }
  }

  useMemo(() => {
    void loadImpegni();
  }, [stanziamento.id]);

  const qe = stanziamento.quadroEconomico;

  const spentByVoce = useMemo(() => {
    const map = new Map<string, number>();
    for (const imp of impegni) {
      const key = imp.sottovoceNome || 'General';
      map.set(key, (map.get(key) ?? 0) + imp.importo);
    }
    return map;
  }, [impegni]);

  const sections = useMemo(() => {
    const personaleItems = impegni.filter((i) => i.macroCategoria === 'personale');
    const serviziItems = impegni.filter((i) => i.macroCategoria === 'servizi');

    return [
      {
        titolo: 'Personnel',
        tone: 'personale' as const,
        voci: qe.personale.map((sv) => ({
          nome: sv.nome,
          budget: sv.importo,
          speso: spentByVoce.get(sv.nome) ?? 0,
        })),
        items: personaleItems,
      },
      {
        titolo: 'Services & Support',
        tone: 'servizi' as const,
        voci: qe.servizi.map((sv) => ({
          nome: sv.nome,
          budget: sv.importo,
          speso: spentByVoce.get(sv.nome) ?? 0,
        })),
        items: serviziItems,
      },
    ];
  }, [impegni, qe.personale, qe.servizi, spentByVoce]);

  async function confirmDelete() {
    if (!window.api || !pendingDelete) return;
    setDeleting(true);
    const res = await window.api.impegni.delete(pendingDelete.id);
    setDeleting(false);
    if (!res.ok) {
      setError(res.error ?? 'Error deleting commitment');
      setPendingDelete(null);
      return;
    }
    setPendingDelete(null);
    await loadImpegni();
    onUpdated();
  }

  return (
    <div className="stanz-impegni space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-xs text-[var(--muted)]">
          {impegni.length} registered commitments on this allocation
        </span>
        <button
          type="button"
          onClick={() => setShowCreate(true)}
          className="modal-btn-primary !min-h-8 !py-1 !px-3 !text-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Commitment</span>
        </button>
      </div>

      {error && (
        <div className="rounded-[var(--radius-lg)] border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-700">
          {error}
        </div>
      )}

      <div className="stanz-quadro-shell">
        <div className="stanz-quadro-body">
          {sections.map((sec) => {
            if (sec.voci.length === 0 && sec.items.length === 0) return null;
            const totSpeso = sec.voci.reduce((s, v) => s + v.speso, 0);
            const totBudget = sec.voci.reduce((s, v) => s + v.budget, 0);
            const totItems =
              sec.items.length > 0
                ? sec.items.reduce((s, i) => s + i.importo, 0)
                : totSpeso;
            const pctSezione = percentOf(totSpeso || totItems, totBudget);

            return (
              <section key={sec.titolo} className={cn('stanz-quadro-section', `is-${sec.tone}`)}>
                <div className="stanz-quadro-section-head">
                  <div className="stanz-quadro-section-heading">
                    <span className="stanz-quadro-section-dot" aria-hidden="true" />
                    <div>
                      <h3 className="stanz-quadro-section-title">{sec.titolo}</h3>
                      <p className="stanz-quadro-section-sub">
                        Committed {formatCurrency(totSpeso || totItems)}
                        {totBudget > 0 ? ` · ${formatPercent(pctSezione)}% of category budget` : ''}
                        {sec.items.length > 0
                          ? ` · ${sec.items.length} ${sec.items.length === 1 ? 'transaction' : 'transactions'}`
                          : ''}
                      </p>
                    </div>
                  </div>
                </div>

                {sec.voci.length > 0 && (
                  <div className="stanz-utilizzo-table" role="table" aria-label={`Budget usage ${sec.titolo}`}>
                    <div className="stanz-utilizzo-cols" role="row">
                      <span role="columnheader">Line Item</span>
                      <span role="columnheader">Budget</span>
                      <span role="columnheader">Committed</span>
                      <span role="columnheader">Balance</span>
                      <span role="columnheader">Usage</span>
                    </div>
                    {sec.voci.map((v) => {
                      const residuo = v.budget - v.speso;
                      const pct = percentOf(v.speso, v.budget);
                      return (
                        <div key={v.nome} className="stanz-utilizzo-row" role="row">
                          <span className="stanz-utilizzo-name" role="cell">
                            <span className="stanz-utilizzo-icon" aria-hidden="true">
                              <CausaleIcon
                                macro={sec.tone}
                                className="stanz-utilizzo-icon-svg"
                                size={14}
                              />
                            </span>
                            <span className="stanz-utilizzo-name-text">{v.nome}</span>
                          </span>
                          <span className="stanz-utilizzo-num" role="cell">
                            {formatCurrency(v.budget)}
                          </span>
                          <span className="stanz-utilizzo-num is-muted" role="cell">
                            {formatCurrency(v.speso)}
                          </span>
                          <span
                            className={cn('stanz-utilizzo-num', residuo < 0 && 'is-danger')}
                            role="cell"
                          >
                            {formatCurrency(residuo)}
                          </span>
                          <span className="stanz-utilizzo-pct-cell" role="cell">
                            <span className="stanz-utilizzo-pct is-ok">
                              {formatPercent(pct)}%
                            </span>
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {sec.items.length > 0 && (
                  <div className="stanz-impegni-list">
                    <p className="stanz-impegni-list-label">
                      Transactions
                      <span>{sec.items.length}</span>
                    </p>
                    {sec.items.map((imp) => {
                      const summary = opsSummary(imp);
                      return (
                        <div
                          key={imp.id}
                          className="stanz-impegni-card"
                          role="button"
                          tabIndex={0}
                          onClick={() => setEditingImpegno(imp)}
                          title="Edit commitment"
                        >
                          <div className="stanz-impegni-card-main">
                            <div className="stanz-impegni-card-icon" aria-hidden="true">
                              <CausaleIcon
                                macro={imp.macroCategoria}
                                className="stanz-impegni-card-icon-svg"
                                size={18}
                              />
                            </div>

                            <div className="stanz-impegni-card-body">
                              <span className="stanz-impegni-causale-text">
                                {imp.causale || 'Commitment'}
                              </span>

                              {summary && (
                                <div className="stanz-impegni-card-meta">
                                  <span className="stanz-impegni-meta-chip">
                                    <Users size={12} strokeWidth={2} aria-hidden="true" />
                                    {summary.count}{' '}
                                    {summary.count === 1 ? 'staff member' : 'staff members'}
                                  </span>
                                  <span className="stanz-impegni-meta-chip">
                                    <CalendarDays size={12} strokeWidth={2} aria-hidden="true" />
                                    {summary.mesi} {summary.mesi === 1 ? 'month' : 'months'}
                                  </span>
                                  <button
                                    type="button"
                                    className="stanz-impegni-dettagli-link"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setDettagliImpegno(imp);
                                    }}
                                  >
                                    Details →
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="stanz-impegni-card-aside">
                            <span className="stanz-impegni-card-amount">
                              {formatCurrency(imp.importo)}
                            </span>
                            <button
                              type="button"
                              className="stanz-impegni-delete-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                setPendingDelete(imp);
                              }}
                              title="Delete"
                              aria-label="Delete commitment"
                            >
                              <Trash2 size={15} strokeWidth={2} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      </div>

      {pendingDelete && (
        <ConfirmDialog
          title="Delete Commitment"
          message={`Are you sure you want to delete the commitment "${pendingDelete.causale || 'Untitled'}" for ${formatCurrency(pendingDelete.importo)}?`}
          confirmLabel="Delete"
          loading={deleting}
          onConfirm={() => void confirmDelete()}
          onCancel={() => setPendingDelete(null)}
        />
      )}

      {dettagliImpegno && (
        <Suspense fallback={null}>
          <ImpegnoDettagliModal
            impegno={dettagliImpegno}
            stanziamento={stanziamento}
            onClose={() => setDettagliImpegno(null)}
          />
        </Suspense>
      )}

      {(showCreate || editingImpegno) && (
        <ImpegnoFormModal
          stanziamento={stanziamento}
          impegno={editingImpegno ?? undefined}
          onClose={() => {
            setShowCreate(false);
            setEditingImpegno(null);
          }}
          onSaved={() => {
            setShowCreate(false);
            setEditingImpegno(null);
            void loadImpegni();
            onUpdated();
          }}
        />
      )}
    </div>
  );
}
