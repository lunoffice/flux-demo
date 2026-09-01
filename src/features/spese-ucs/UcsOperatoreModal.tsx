import { useState } from 'react';
import { Clock, Save } from 'lucide-react';
import type { OperatoreUcs } from '../../types/api';
import { formatCurrency, totaleMese, totaliOperatore } from '../../lib/utils';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

interface UcsOperatoreModalProps {
  operatore: OperatoreUcs;
  anno: number;
  mesiAllocati?: Record<string, number[]>;
  fondoAnnoPerMese?: Record<string, Record<number, string>>;
  onClose: () => void;
  onSaved: () => void;
}

export function UcsOperatoreModal({
  operatore,
  anno,
  onClose,
  onSaved,
}: UcsOperatoreModalProps) {
  const [nomeCompleto, setNomeCompleto] = useState(operatore.nomeCompleto);
  const [pagaOrariaMedia, setPagaOrariaMedia] = useState(operatore.pagaOrariaMedia);
  const [consuntivo, setConsuntivo] = useState(operatore.consuntivoMensile || {});
  const [saving, setSaving] = useState(false);

  function updateMonthHours(monthNum: number, hours: number) {
    setConsuntivo((prev) => ({
      ...prev,
      [String(monthNum)]: {
        ore: hours,
        tariffa: pagaOrariaMedia,
      },
    }));
  }

  async function handleSave() {
    if (!window.api) return;
    setSaving(true);
    try {
      const res = await window.api.operatori.update(operatore.id, {
        nomeCompleto: nomeCompleto.trim(),
        pagaOrariaMedia,
        consuntivoMensile: consuntivo,
      });
      if (res.ok) {
        onSaved();
        onClose();
      }
    } finally {
      setSaving(false);
    }
  }

  const totals = totaliOperatore(consuntivo);

  return (
    <Modal
      extraWide
      title={`Staff Timesheet — ${operatore.nomeCompleto} (FY ${anno})`}
      icon={<Clock className="h-5 w-5 text-[var(--modal-text)]" />}
      onClose={onClose}
      footerEnd={
        <button
          type="button"
          disabled={saving}
          onClick={() => void handleSave()}
          className="modal-btn-primary"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving...' : 'Save Timesheet'}</span>
        </button>
      }
    >
      <div className="space-y-4">
        <div className="modal-panel grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            type="text"
            label="Full Name"
            value={nomeCompleto}
            onChange={(e) => setNomeCompleto(e.target.value)}
          />
          <Input
            type="number"
            step="0.5"
            label="Hourly Rate (€/h)"
            value={pagaOrariaMedia}
            onChange={(e) => {
              const r = Number(e.target.value);
              setPagaOrariaMedia(r);
              setConsuntivo((prev) => {
                const copy: typeof prev = {};
                for (const [k, v] of Object.entries(prev)) {
                  copy[k] = { ...v, tariffa: r };
                }
                return copy;
              });
            }}
          />
        </div>

        <div className="modal-panel">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--charcoal)]">
              Monthly Worked Hours Log
            </h4>
            <div className="text-xs font-bold text-[var(--muted)]">
              Total: <span className="font-mono text-[var(--charcoal)]">{totals.oreAnnue} hrs</span> (
              <span className="font-mono text-emerald-700">{formatCurrency(totals.totaleAnnuo)}</span>)
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {MONTHS.map((monthName, idx) => {
              const monthNum = idx + 1;
              const dett = consuntivo[String(monthNum)] ?? { ore: 0, tariffa: pagaOrariaMedia };
              const monthCost = totaleMese(dett);

              return (
                <div
                  key={monthNum}
                  className="p-3 rounded-lg border border-[var(--line)] bg-[var(--surface-sunken)] space-y-1.5"
                >
                  <div className="flex justify-between items-center text-xs font-bold text-[var(--charcoal)]">
                    <span>{monthName}</span>
                    <span className="font-mono text-[10px] text-[var(--muted)]">
                      {formatCurrency(monthCost)}
                    </span>
                  </div>
                  <input
                    type="number"
                    min="0"
                    max="220"
                    value={dett.ore || ''}
                    placeholder="0"
                    onChange={(e) => updateMonthHours(monthNum, Number(e.target.value) || 0)}
                    className="w-full h-8 px-2 border border-[var(--line)] rounded bg-white text-xs font-bold font-mono focus:outline-none focus:border-[var(--charcoal)]"
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Modal>
  );
}
