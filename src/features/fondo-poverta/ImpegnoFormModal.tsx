import { useEffect, useMemo, useState } from 'react';
import { Coins } from 'lucide-react';
import type {
  CollegamentoOperatore,
  ImpegnoSpesa,
  OperatoreUcs,
  StanziamentoAnnuale,
} from '../../types/api';
import { tutteSottovociConSpeciali } from '../../lib/quadroEconomico';
import { formatCurrency } from '../../lib/utils';
import { importoMeseUcs, importoMesiUcs } from '../../lib/ucs';
import { EuroInput } from '../../components/ui/EuroInput';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';

const MONTHS_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

interface ImpegnoFormModalProps {
  stanziamento: StanziamentoAnnuale;
  impegno?: ImpegnoSpesa;
  onClose: () => void;
  onSaved: () => void;
}

export function ImpegnoFormModal({
  stanziamento,
  impegno,
  onClose,
  onSaved,
}: ImpegnoFormModalProps) {
  const sottovoci = useMemo(
    () => tutteSottovociConSpeciali(stanziamento.quadroEconomico, stanziamento.dotazioneTotale),
    [stanziamento],
  );

  const [data, setData] = useState(impegno?.data || new Date().toISOString().split('T')[0]);
  const [causale, setCausale] = useState(impegno?.causale || '');
  const [sottovoceId, setSottovoceId] = useState(impegno?.sottovoceId || sottovoci[0]?.id || '');
  const [macroCategoria, setMacroCategoria] = useState<'personale' | 'servizi'>(
    impegno?.macroCategoria || (sottovoci[0]?.macroCategoria ?? 'servizi'),
  );
  const [importoManuale, setImportoManuale] = useState(impegno?.importo || 0);
  const [annoUcs] = useState(impegno?.collegamentoUcs?.annoUcs || stanziamento.anno);
  const [operatori, setOperatori] = useState<OperatoreUcs[]>([]);
  const [assegnazioni, setAssegnazioni] = useState<CollegamentoOperatore[]>(
    impegno?.collegamentoUcs?.operatori || [],
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!window.api) return;
    void window.api.operatori.listByAnno(annoUcs).then((res) => {
      if (res.ok && res.data) {
        setOperatori(res.data);
      }
    });
  }, [annoUcs]);

  const importoCalcolatoUcs = useMemo(() => {
    if (macroCategoria !== 'personale') return 0;
    return assegnazioni.reduce((tot, a) => {
      if (a.mesi.length === 0) return tot;
      const op = operatori.find((o) => o.id === a.operatoreUcsId);
      if (!op) return tot;
      return tot + importoMesiUcs(op, a.mesi);
    }, 0);
  }, [assegnazioni, macroCategoria, operatori]);

  const finalAmount = macroCategoria === 'personale' && assegnazioni.length > 0 ? importoCalcolatoUcs : importoManuale;

  function toggleMonth(opId: string, month: number, opName: string) {
    setAssegnazioni((prev) => {
      const existing = prev.find((a) => a.operatoreUcsId === opId);
      if (!existing) {
        return [...prev, { operatoreUcsId: opId, nomeCompleto: opName, mesi: [month] }];
      }
      const newMesi = existing.mesi.includes(month)
        ? existing.mesi.filter((m) => m !== month)
        : [...existing.mesi, month].sort((a, b) => a - b);

      if (newMesi.length === 0) {
        return prev.filter((a) => a.operatoreUcsId !== opId);
      }
      return prev.map((a) => (a.operatoreUcsId === opId ? { ...a, mesi: newMesi } : a));
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!window.api) return;
    if (finalAmount <= 0) {
      setError('Please provide a valid commitment amount or select staff timesheet months.');
      return;
    }

    setSaving(true);
    setError(null);

    const chosenSv = sottovoci.find((s) => s.id === sottovoceId);
    const payload: Partial<ImpegnoSpesa> = {
      stanziamentoAnnualeId: stanziamento.id,
      data,
      causale: causale.trim() || `Commitment (${chosenSv?.nome || 'General'})`,
      importo: finalAmount,
      sottovoceId,
      sottovoceNome: chosenSv?.nome || 'General',
      macroCategoria,
      collegamentoUcs:
        macroCategoria === 'personale' && assegnazioni.length > 0
          ? {
              annoUcs,
              operatori: assegnazioni,
              importoCalcolato: finalAmount,
            }
          : null,
    };

    try {
      const res = impegno
        ? await window.api.impegni.update(impegno.id, payload)
        : await window.api.impegni.create(payload);

      if (!res.ok) {
        setError(res.error ?? 'Error saving commitment');
        return;
      }
      onSaved();
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      extraWide
      title={impegno ? 'Edit Expenditure Commitment' : 'New Expenditure Commitment'}
      icon={<Coins className="h-5 w-5 text-[var(--modal-text)]" />}
      onClose={onClose}
      footerEnd={
        <button
          type="submit"
          form="impegno-form"
          disabled={saving}
          className="modal-btn-primary"
        >
          {saving ? 'Saving...' : impegno ? 'Save Changes' : 'Record Commitment'}
        </button>
      }
    >
      <form id="impegno-form" onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-lg">
            {error}
          </div>
        )}

        <div className="modal-panel space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input
              type="date"
              required
              label="Registration Date"
              value={data}
              onChange={(e) => setData(e.target.value)}
            />

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[var(--muted)]">Budget Line Item</label>
              <select
                value={sottovoceId}
                onChange={(e) => {
                  const id = e.target.value;
                  setSottovoceId(id);
                  const sv = sottovoci.find((s) => s.id === id);
                  if (sv) setMacroCategoria(sv.macroCategoria);
                }}
                className="w-full h-10 px-3 border border-[var(--line)] rounded-md text-xs font-bold bg-white"
              >
                {sottovoci.map((sv) => (
                  <option key={sv.id} value={sv.id}>
                    [{sv.macroCategoria.toUpperCase()}] {sv.nome} — Budget: {formatCurrency(sv.importo)}
                  </option>
                ))}
              </select>
            </div>

            <Input
              type="text"
              label="Description / Purpose"
              placeholder="e.g. Q1 Staff Timesheet Allocation"
              value={causale}
              onChange={(e) => setCausale(e.target.value)}
            />
          </div>

          <div className="quadro-sections-divider" />

          {macroCategoria === 'personale' ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-[var(--charcoal)] uppercase tracking-wider">
                    Staff Timesheet Allocation (UCS Rate)
                  </h4>
                  <p className="text-[11px] text-[var(--muted)]">
                    Select active staff roster months for FY {annoUcs} to link cost pools automatically.
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-[var(--muted)] font-medium">Calculated Cost: </span>
                  <span className="text-sm font-black font-mono text-[var(--charcoal)]">
                    {formatCurrency(finalAmount)}
                  </span>
                </div>
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {operatori.length === 0 ? (
                  <p className="text-xs text-[var(--muted)] italic p-4 text-center">
                    No staff members registered for FY {annoUcs}.
                  </p>
                ) : (
                  operatori.map((op) => {
                    const assigned = assegnazioni.find((a) => a.operatoreUcsId === op.id)?.mesi || [];
                    return (
                      <div
                        key={op.id}
                        className="p-2.5 rounded-lg border border-[var(--line)] bg-[var(--surface-sunken)] flex items-center justify-between gap-3"
                      >
                        <div className="min-w-0 w-44">
                          <div className="text-xs font-bold text-[var(--text-primary)] truncate">
                            {op.nomeCompleto}
                          </div>
                          <div className="text-[10px] text-[var(--muted)] font-mono">
                            €{op.pagaOrariaMedia.toFixed(2)}/h
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-1 flex-1">
                          {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => {
                            const selected = assigned.includes(m);
                            const val = importoMeseUcs(op.consuntivoMensile, m);
                            return (
                              <button
                                key={m}
                                type="button"
                                onClick={() => toggleMonth(op.id, m, op.nomeCompleto)}
                                className={`px-2 py-1 text-[11px] font-bold rounded transition-colors ${
                                  selected
                                    ? 'bg-[var(--charcoal)] text-white'
                                    : val > 0
                                      ? 'bg-white border border-[var(--line)] text-[var(--text-primary)] hover:border-black'
                                      : 'bg-slate-100 text-slate-400 border border-transparent'
                                }`}
                                title={`${MONTHS_SHORT[m - 1]}: €${val.toFixed(2)}`}
                              >
                                {MONTHS_SHORT[m - 1]}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <EuroInput
                label="Direct Service Amount (€)"
                value={importoManuale}
                onCommit={setImportoManuale}
                className="font-bold font-mono"
              />
            </div>
          )}
        </div>
      </form>
    </Modal>
  );
}
