import { useState } from 'react';
import {
  ChevronRight,
  Coins,
  Hash,
  Trash2,
  Users,
} from 'lucide-react';
import type { StanziamentoAnnuale } from '../../types/api';
import { formatCurrency, percentOf, statoLabel } from '../../lib/utils';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';

interface StanziamentoCardProps {
  stanziamento: StanziamentoAnnuale;
  onOpen: () => void;
  onDeleted: () => void;
}

export function StanziamentoCard({ stanziamento, onOpen, onDeleted }: StanziamentoCardProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const dotazione = stanziamento.dotazioneTotale || 0;
  const impegnato = stanziamento.importoImpegnato || 0;
  const residuo = stanziamento.residuo ?? Math.max(0, dotazione - impegnato);
  const utilizzoPct = percentOf(impegnato, dotazione);

  const qe = stanziamento.quadroEconomico;
  const budgetPersonale = qe?.personale?.reduce((s, v) => s + v.importo, 0) || 0;
  const budgetServizi = qe?.servizi?.reduce((s, v) => s + v.importo, 0) || 0;

  async function handleDelete() {
    if (!window.api) return;
    setDeleting(true);
    try {
      const res = await window.api.stanziamenti.delete(stanziamento.id);
      if (res.ok) {
        setConfirmDelete(false);
        onDeleted();
      }
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <div className="card-elevated group relative flex flex-col justify-between overflow-hidden rounded-[var(--radius-xl)] border border-[var(--line)] bg-[var(--paper)] p-5 transition-all hover:border-[var(--charcoal)]/30 hover:shadow-lg">
        <div>
          <div className="flex items-start justify-between gap-3 border-b border-[var(--line)] pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-black tracking-tight text-[var(--charcoal)]">
                  FY {stanziamento.anno}
                </span>
                <span className="rounded-[var(--radius)] bg-emerald-100 px-2 py-0.5 text-[10.5px] font-bold text-emerald-800">
                  {statoLabel(stanziamento.stato)}
                </span>
              </div>
              <div className="mt-1 flex items-center gap-2 text-xs font-medium text-[var(--muted)]">
                <Hash className="h-3 w-3" />
                <span className="font-mono">{stanziamento.codiceCup || 'No CUP assigned'}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              title="Delete allocation"
              className="text-[var(--muted)] hover:text-red-600 transition-colors p-1"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            <div className="rounded-lg bg-[var(--surface-sunken)] p-2">
              <div className="text-[10px] font-bold uppercase text-[var(--muted)]">Budget</div>
              <div className="text-xs font-bold text-[var(--charcoal)] font-mono mt-0.5 truncate">
                {formatCurrency(dotazione)}
              </div>
            </div>
            <div className="rounded-lg bg-[var(--surface-sunken)] p-2">
              <div className="text-[10px] font-bold uppercase text-[var(--muted)]">Committed</div>
              <div className="text-xs font-bold text-[var(--charcoal)] font-mono mt-0.5 truncate">
                {formatCurrency(impegnato)}
              </div>
            </div>
            <div className="rounded-lg bg-[var(--surface-sunken)] p-2">
              <div className="text-[10px] font-bold uppercase text-[var(--muted)]">Balance</div>
              <div className="text-xs font-bold text-emerald-700 font-mono mt-0.5 truncate">
                {formatCurrency(residuo)}
              </div>
            </div>
          </div>

          <div className="mt-4">
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-[var(--muted)]">Budget Utilization</span>
              <span className="text-[var(--charcoal)] font-mono">{Math.round(utilizzoPct)}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-[var(--brand-yellow)]"
                style={{ width: `${Math.min(100, utilizzoPct)}%` }}
              />
            </div>
          </div>

          <div className="mt-3.5 flex items-center justify-between text-xs text-[var(--muted)] pt-3 border-t border-[var(--line)]">
            <div className="flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5" />
              <span>Personnel: {formatCurrency(budgetPersonale)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Coins className="h-3.5 w-3.5" />
              <span>Services: {formatCurrency(budgetServizi)}</span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpen}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--charcoal)] py-2 text-xs font-bold text-white transition-colors hover:bg-black"
        >
          <span>Inspect Allocation & Commitments</span>
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>

      {confirmDelete && (
        <ConfirmDialog
          title={`Delete Fiscal Year ${stanziamento.anno}`}
          message={`Are you sure you want to delete the grant allocation for FY ${stanziamento.anno}?`}
          confirmLabel="Delete"
          variant="danger"
          loading={deleting}
          onConfirm={() => void handleDelete()}
          onCancel={() => setConfirmDelete(false)}
        />
      )}
    </>
  );
}
