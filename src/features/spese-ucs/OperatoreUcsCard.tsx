import { Edit3, Trash2 } from 'lucide-react';
import type { OperatoreUcs } from '../../types/api';
import { formatCurrency, totaliOperatore } from '../../lib/utils';

interface OperatoreUcsCardProps {
  operatore: OperatoreUcs;
  anno: number;
  fondoAnnoPerMese?: Record<string, Record<number, string>>;
  onOpenEdit: () => void;
  onDelete: () => void;
}

export function OperatoreUcsCard({
  operatore,
  onOpenEdit,
  onDelete,
}: OperatoreUcsCardProps) {
  const totals = totaliOperatore(operatore.consuntivoMensile);

  return (
    <div className="card-elevated group relative flex flex-col justify-between overflow-hidden rounded-[var(--radius-xl)] border border-[var(--line)] bg-[var(--paper)] p-4 transition-all hover:border-[var(--charcoal)]/30 hover:shadow-md">
      <div>
        <div className="flex items-start justify-between gap-3 border-b border-[var(--line)] pb-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-lg)] bg-[var(--surface-sunken)] font-black text-sm text-[var(--charcoal)]">
              {operatore.nomeCompleto.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h3 className="text-sm font-bold text-[var(--charcoal)]">
                {operatore.nomeCompleto}
              </h3>
              <div className="text-[11px] font-mono text-[var(--muted)]">
                Assigned Rate: €{operatore.pagaOrariaMedia.toFixed(2)}/h
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={onOpenEdit}
              title="Edit monthly hours"
              className="icon-btn"
            >
              <Edit3 className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={onDelete}
              title="Delete staff member"
              className="icon-btn is-danger"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="mt-3.5 grid grid-cols-2 gap-2 text-center">
          <div className="rounded-lg bg-[var(--surface-sunken)] p-2">
            <div className="text-[10px] font-bold uppercase text-[var(--muted)]">Logged Hours</div>
            <div className="text-xs font-bold text-[var(--charcoal)] font-mono mt-0.5">
              {totals.oreAnnue} hrs
            </div>
          </div>
          <div className="rounded-lg bg-[var(--surface-sunken)] p-2">
            <div className="text-[10px] font-bold uppercase text-[var(--muted)]">Total Cost</div>
            <div className="text-xs font-bold text-[var(--charcoal)] font-mono mt-0.5">
              {formatCurrency(totals.totaleAnnuo)}
            </div>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={onOpenEdit}
        className="mt-3.5 flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--surface-sunken)] py-2 text-xs font-bold text-[var(--charcoal)] transition-colors hover:bg-[var(--charcoal)] hover:text-white"
      >
        <span>Manage Monthly Hours</span>
      </button>
    </div>
  );
}
