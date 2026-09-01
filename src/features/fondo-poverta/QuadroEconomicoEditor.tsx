import { useEffect, useState } from 'react';
import { GripVertical, Plus, Trash2 } from 'lucide-react';
import type { QuadroEconomico, Sottovoce } from '../../types/api';
import {
  aggiornaSottovoceImporto,
  aggiornaSottovocePercentuale,
  nuovaSottovoce,
  quadroSalvabile,
  residuoQuadro,
  sommaSottovoci,
} from '../../lib/quadroEconomico';
import { formatCurrency, formatEuroAmount, formatPercent, parseEuroAmount, percentOf } from '../../lib/utils';
import { cn } from '../../lib/cn';

function QuadroVocePercentuale({
  value,
  onCommit,
}: {
  value: number;
  onCommit: (n: number) => void;
}) {
  const [focused, setFocused] = useState(false);
  const [draft, setDraft] = useState(String(value || ''));

  useEffect(() => {
    if (!focused) setDraft(value ? String(value) : '');
  }, [value, focused]);

  return (
    <input
      type="text"
      inputMode="decimal"
      className="quadro-voce-pct"
      value={focused ? draft : value ? `${formatPercent(value)}%` : ''}
      placeholder="0%"
      aria-label="Percentage"
      onFocus={(e) => {
        setFocused(true);
        setDraft(value ? String(value) : '');
        requestAnimationFrame(() => e.currentTarget.select());
      }}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={() => {
        setFocused(false);
        const raw = draft.replace('%', '').replace(',', '.').trim();
        onCommit(Number(raw) || 0);
      }}
    />
  );
}

function QuadroVoceImporto({
  value,
  onCommit,
}: {
  value: number;
  onCommit: (n: number) => void;
}) {
  const [focused, setFocused] = useState(false);
  const [draft, setDraft] = useState(formatEuroAmount(value));

  useEffect(() => {
    if (!focused) setDraft(formatEuroAmount(value));
  }, [value, focused]);

  return (
    <input
      type="text"
      inputMode="decimal"
      className="quadro-voce-importo"
      value={focused ? draft : value === 0 ? '' : formatCurrency(value)}
      placeholder="€0.00"
      aria-label="Amount in euros"
      onFocus={(e) => {
        setFocused(true);
        const next = value === 0 ? '' : formatEuroAmount(value);
        setDraft(next);
        requestAnimationFrame(() => {
          if (next) e.currentTarget.select();
        });
      }}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={() => {
        setFocused(false);
        onCommit(parseEuroAmount(draft));
      }}
    />
  );
}

function SottovociSection({
  titolo,
  tone,
  items,
  dotazione,
  onChange,
  hideAddButton = false,
}: {
  titolo: string;
  tone: 'personale' | 'servizi';
  items: Sottovoce[];
  dotazione: number;
  onChange: (items: Sottovoce[]) => void;
  hideAddButton?: boolean;
}) {
  function updateItem(id: string, patch: Partial<Sottovoce>) {
    onChange(items.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  }

  function updatePercentuale(id: string, percentuale: number) {
    onChange(
      items.map((s) => (s.id === id ? aggiornaSottovocePercentuale(s, percentuale, dotazione) : s)),
    );
  }

  function updateImporto(id: string, importo: number) {
    onChange(items.map((s) => (s.id === id ? aggiornaSottovoceImporto(s, importo, dotazione) : s)));
  }

  const subtotale = items.reduce((s, v) => s + v.importo, 0);

  return (
    <div className="quadro-section-block">
      <div className="modal-section-head">
        <div className="modal-section-title">
          <span className={cn('modal-section-accent', tone === 'personale' ? 'is-personale' : 'is-servizi')} />
          <h3 className="modal-section-name">{titolo}</h3>
          <span className="modal-section-subtotal">
            Subtotal:{' '}
            <span className="modal-section-subtotal-value">{formatCurrency(subtotale)}</span>
          </span>
        </div>
        {!hideAddButton && (
          <button
            type="button"
            onClick={() => onChange([...items, nuovaSottovoce('', dotazione, 0)])}
            className="modal-btn-secondary !min-h-9 !px-3 !text-xs"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Line Item</span>
          </button>
        )}
      </div>

      <div className="quadro-voce-list">
        {items.length === 0 ? (
          <p className="quadro-voce-empty">
            No line items in this category. Click &quot;Add&quot; to create one.
          </p>
        ) : (
          items.map((sv) => (
            <div key={sv.id} className="quadro-voce-card">
              <div className="quadro-voce-main">
                <GripVertical className="quadro-voce-grip" size={16} strokeWidth={2} aria-hidden="true" />
                <input
                  type="text"
                  className="quadro-voce-nome"
                  placeholder="Line item description"
                  value={sv.nome}
                  onChange={(e) => updateItem(sv.id, { nome: e.target.value })}
                  aria-label="Line item description"
                />
              </div>
              <div className="quadro-voce-aside">
                <QuadroVocePercentuale
                  value={sv.percentuale}
                  onCommit={(pct) => updatePercentuale(sv.id, pct)}
                />
                <QuadroVoceImporto
                  value={sv.importo}
                  onCommit={(importo) => updateImporto(sv.id, importo)}
                />
                <button
                  type="button"
                  onClick={() => onChange(items.filter((s) => s.id !== sv.id))}
                  aria-label="Delete line item"
                  title="Delete"
                  className="quadro-voce-delete"
                >
                  <Trash2 size={15} strokeWidth={2} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export function QuadroEconomicoEditor({
  quadro,
  dotazione,
  onChange,
}: {
  quadro: QuadroEconomico;
  dotazione: number;
  onChange: (qe: QuadroEconomico) => void;
}) {
  const residuo = residuoQuadro(quadro, dotazione);
  const salvabile = quadroSalvabile(quadro, dotazione);
  const totale = sommaSottovoci(quadro);
  const totPersonale = quadro.personale.reduce((s, v) => s + v.importo, 0);
  const totServizi = quadro.servizi.reduce((s, v) => s + v.importo, 0);
  const pctPersonale = percentOf(totPersonale, dotazione);
  const pctServizi = percentOf(totServizi, dotazione);
  const pctResiduo = Math.max(0, percentOf(residuo, dotazione));

  return (
    <div className="space-y-4">
      <div className="quadro-sections-panel space-y-4">
        <div className="space-y-3.5">
          <div className="quadro-summary">
            <div className="quadro-summary-item">
              <span className="quadro-summary-label">Total Grant Budget</span>
              <span className="quadro-summary-value">{formatCurrency(dotazione)}</span>
            </div>
            <div className="quadro-summary-sep" aria-hidden="true" />
            <div className="quadro-summary-item">
              <span className="quadro-summary-label">Planned</span>
              <span className="quadro-summary-value">{formatCurrency(totale)}</span>
            </div>
            <div className="quadro-summary-sep" aria-hidden="true" />
            <div className="quadro-summary-item is-residuo">
              <span className="quadro-summary-label">Unallocated</span>
              <span className="quadro-summary-value">{formatCurrency(residuo)}</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex h-3 overflow-hidden rounded-xl border border-[rgba(213,222,234,0.7)] bg-[rgba(232,238,246,0.85)]">
              {pctPersonale > 0 && (
                <div
                  className="h-full bg-[var(--modal-navy)]"
                  style={{ width: `${pctPersonale}%` }}
                  title={`Personnel: ${formatPercent(pctPersonale)}%`}
                />
              )}
              {pctServizi > 0 && (
                <div
                  className="h-full bg-[var(--modal-yellow)]"
                  style={{ width: `${pctServizi}%` }}
                  title={`Services: ${formatPercent(pctServizi)}%`}
                />
              )}
              {pctResiduo > 0.01 && (
                <div
                  className="h-full bg-[var(--modal-green)]"
                  style={{ width: `${pctResiduo}%` }}
                  title={`Unallocated: ${formatCurrency(residuo)}`}
                />
              )}
            </div>

            <div className="flex items-center justify-between gap-3 pt-0.5 text-xs font-bold text-[var(--modal-text)]">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-[var(--modal-navy)]" />
                <span>Personnel {formatPercent(pctPersonale)}%</span>
              </div>
              <div className="flex items-center gap-1.5 text-[var(--modal-green)]">
                <span className="h-2.5 w-2.5 rounded-full bg-[var(--modal-green)]" />
                <span>Unallocated {formatPercent(pctResiduo)}%</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-[var(--modal-yellow)]" />
                <span>Services {formatPercent(pctServizi)}%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="quadro-sections-divider" aria-hidden="true" />

        <div className="quadro-sections-head">
          <div className="quadro-sections-head-title">Economic Plan Line Items</div>
          <div className="quadro-sections-head-actions">
            <button
              type="button"
              onClick={() => onChange({ ...quadro, personale: [...quadro.personale, nuovaSottovoce('', dotazione, 0)] })}
              className="quadro-link-action"
            >
              <span>+ Add Personnel</span>
            </button>
            <button
              type="button"
              onClick={() => onChange({ ...quadro, servizi: [...quadro.servizi, nuovaSottovoce('', dotazione, 0)] })}
              className="quadro-link-action"
            >
              <span>+ Add Services</span>
            </button>
          </div>
        </div>

        <SottovociSection
          titolo="Personnel"
          tone="personale"
          items={quadro.personale}
          dotazione={dotazione}
          onChange={(personale) => onChange({ ...quadro, personale })}
          hideAddButton
        />

        <SottovociSection
          titolo="Services & Support"
          tone="servizi"
          items={quadro.servizi}
          dotazione={dotazione}
          onChange={(servizi) => onChange({ ...quadro, servizi })}
          hideAddButton
        />
      </div>

      {!salvabile && (
        <div className="mt-4 flex items-center justify-between rounded-lg border border-red-200 bg-red-50 p-4 text-xs font-semibold text-red-800">
          <div>
            <p className="text-sm font-extrabold text-red-950">Budget Exceeded</p>
            <p className="mt-0.5">Line items cannot exceed total grant budget.</p>
          </div>
          <span className="font-mono text-sm font-extrabold text-red-700">{formatCurrency(residuo)}</span>
        </div>
      )}
    </div>
  );
}
