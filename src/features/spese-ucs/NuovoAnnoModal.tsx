import { useState } from 'react';
import { Modal } from '../../components/ui/Modal';
import { Input, Select } from '../../components/ui/Input';
import { Calendar, AlertTriangle, Copy } from 'lucide-react';

const SELECT_TRIGGER =
  '!min-w-0 w-full h-10 rounded-md border border-line bg-paper px-3 py-2 text-sm font-bold shadow-none';

export function NuovoAnnoModal({
  anniEsistenti,
  onClose,
  onCreated,
}: {
  anniEsistenti: number[];
  onClose: () => void;
  onCreated: (anno: number) => void;
}) {
  const maxAnno = anniEsistenti.length ? Math.max(...anniEsistenti) : new Date().getFullYear();
  const [annoDest, setAnnoDest] = useState(maxAnno + 1);
  const [annoSorgente, setAnnoSorgente] = useState(maxAnno);
  const [copiaOperatori, setCopiaOperatori] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate() {
    if (!window.api) return;
    setLoading(true);
    setError(null);

    if (copiaOperatori) {
      const res = await window.api.operatori.copiaDaAnno(annoDest, annoSorgente);
      setLoading(false);
      if (!res.ok) {
        setError(res.error ?? 'Errore creazione annualità');
        return;
      }
    }

    setLoading(false);
    onCreated(annoDest);
    onClose();
  }

  return (
    <Modal
      title="Nuova Annualità Spese UCS"
      onClose={onClose}
      icon={<Calendar className="h-5 w-5 text-[var(--modal-text)]" />}
      footerEnd={
        <button
          type="button"
          disabled={loading || (copiaOperatori && annoDest === annoSorgente)}
          onClick={() => void handleCreate()}
          className="modal-btn-primary"
        >
          {loading ? (
            <>
              <span className="h-3.5 w-3.5 rounded-full border-2 border-white border-t-transparent stanz-autosave-spin" />
              <span>Creazione...</span>
            </>
          ) : (
            <span>Crea Annualità</span>
          )}
        </button>
      }
    >
      <div className="space-y-4">
        {error && (
          <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs font-semibold flex items-center gap-2.5">
            <AlertTriangle className="h-4 w-4 shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        <div className="modal-panel space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              type="number"
              label="Nuovo Anno"
              labelIcon={<Calendar className="h-3.5 w-3.5" aria-hidden="true" />}
              value={annoDest}
              onChange={(e) => setAnnoDest(Number(e.target.value))}
              className="font-bold"
            />

            {copiaOperatori ? (
              <div className="grid w-full items-center gap-1.5">
                <label className="flex items-center gap-1.5 text-sm font-medium leading-none text-[var(--muted)]">
                  <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                  Copia da Annualità
                </label>
                <Select
                  value={String(annoSorgente)}
                  onChange={(v) => setAnnoSorgente(Number(v))}
                  options={anniEsistenti.map((a) => ({
                    value: String(a),
                    label: `Anno ${a}`,
                  }))}
                  aria-label="Copia da Annualità"
                  className="w-full"
                  triggerClassName={SELECT_TRIGGER}
                />
              </div>
            ) : (
              <div />
            )}
          </div>

          <div className="quadro-sections-divider" aria-hidden="true" />

          <label className="flex items-center gap-2.5 text-sm font-medium text-[var(--modal-text)] cursor-pointer select-none">
            <input
              type="checkbox"
              checked={copiaOperatori}
              onChange={(e) => setCopiaOperatori(e.target.checked)}
              className="h-4 w-4 rounded-[var(--radius)] border-[var(--line)] text-[var(--charcoal)] cursor-pointer"
            />
            <span>Copia operatori da annualità precedente (ore azzerate)</span>
          </label>
        </div>
      </div>
    </Modal>
  );
}
