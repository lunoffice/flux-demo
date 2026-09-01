import { useEffect, useState } from 'react';
import { Calendar, Link2, Wallet, AlertTriangle } from 'lucide-react';
import type { OperatoreUcs } from '../../types/api';
import { formatCurrency, totaleMese } from '../../lib/utils';
import { Modal } from '../../components/ui/Modal';
import { Select } from '../../components/ui/Select';

export function SetFondoMeseModal({
  operatore,
  annoUcs,
  mese,
  onClose,
  onSaved,
}: {
  operatore: OperatoreUcs;
  annoUcs: number;
  mese: number;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [anni, setAnni] = useState<number[]>([]);
  const [fondoAnno, setFondoAnno] = useState<number | ''>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dettaglio = operatore.consuntivoMensile[String(mese)] ?? { ore: 0, tariffa: 29.67 };

  useEffect(() => {
    async function load() {
      if (!window.api) return;
      const res = await window.api.stanziamenti.list();
      if (res.ok) {
        const list = (res.data ?? []).map((s) => s.anno).sort((a, b) => b - a);
        setAnni(list);
        if (list.length) setFondoAnno(list[0]);
      }
    }
    void load();
  }, []);

  async function save() {
    if (!window.api || fondoAnno === '') return;
    setLoading(true);
    setError(null);
    const res = await window.api.impegni.setMonthFondoAnnualita({
      operatoreUcsId: operatore.id,
      annoUcs,
      month: mese,
      fondoAnno: Number(fondoAnno),
    });
    setLoading(false);
    if (!res.ok) {
      setError(res.error ?? 'Errore collegamento');
      return;
    }
    onSaved();
    onClose();
  }

  return (
    <Modal
      title="Collega mese a Fondo Povertà"
      onClose={onClose}
      icon={<Link2 className="h-5 w-5" />}
      footerEnd={
        <button
          type="button"
          onClick={() => void save()}
          disabled={loading || fondoAnno === ''}
          className="modal-btn-primary"
        >
          {loading ? (
            <>
              <span className="h-3.5 w-3.5 rounded-full border-2 border-white border-t-transparent stanz-autosave-spin" />
              <span>Salvataggio...</span>
            </>
          ) : (
            <span>Collega / Crea impegno</span>
          )}
        </button>
      }
    >
      <div className="space-y-4">
        {error && (
          <div className="flex items-center gap-2.5 rounded-[var(--radius-lg)] border border-red-200 bg-red-50 p-3.5 text-xs font-semibold text-red-700">
            <AlertTriangle className="h-4 w-4 shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        <div className="modal-panel space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="stanz-dati-field">
              <span className="stanz-dati-label">
                <Wallet className="h-3.5 w-3.5" aria-hidden="true" />
                Importo stimato UCS
              </span>
              <div className="form-field font-mono font-bold">{formatCurrency(totaleMese(dettaglio))}</div>
            </div>

            <div className="stanz-dati-field">
              <label className="stanz-dati-label" htmlFor="fondo-anno-select">
                <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
                Annualità Fondo Povertà
              </label>
              <Select
                id="fondo-anno-select"
                value={fondoAnno === '' ? '' : String(fondoAnno)}
                onChange={(v) => setFondoAnno(Number(v))}
                options={anni.map((a) => ({
                  value: String(a),
                  label: `Anno Fondo ${a}`,
                }))}
                aria-label="Annualità Fondo Povertà"
              />
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
