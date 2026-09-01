import { useMemo, useState } from 'react';
import { AlertCircle, Calendar, Check, Hash, Wallet } from 'lucide-react';
import type { QuadroEconomico, StanziamentoAnnuale } from '../../types/api';
import {
  aggiornaSottovocePercentuale,
  creaQuadroEconomicoVuoto,
  quadroSalvabile,
} from '../../lib/quadroEconomico';
import { EuroInput } from '../../components/ui/EuroInput';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { QuadroEconomicoEditor } from './QuadroEconomicoEditor';

function ricalcolaQuadro(quadro: QuadroEconomico, dotazione: number): QuadroEconomico {
  return {
    ...quadro,
    personale: quadro.personale.map((sv) =>
      aggiornaSottovocePercentuale(sv, sv.percentuale, dotazione),
    ),
    servizi: quadro.servizi.map((sv) =>
      aggiornaSottovocePercentuale(sv, sv.percentuale, dotazione),
    ),
  };
}

export function StanziamentoCreateModal({
  anniEsistenti: _anniEsistenti,
  onClose,
  onCreated,
}: {
  anniEsistenti: number[];
  onClose: () => void;
  onCreated: (stanziamento: StanziamentoAnnuale) => void;
}) {
  const annoDefault = new Date().getFullYear();
  const [anno, setAnno] = useState(annoDefault);
  const [codiceCup, setCodiceCup] = useState('');
  const [dotazioneTotale, setDotazioneTotale] = useState(0);
  const [quadro, setQuadro] = useState<QuadroEconomico>(creaQuadroEconomicoVuoto);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSave = useMemo(() => {
    if (!(dotazioneTotale > 0)) return false;
    const nomiVuoti = [...quadro.personale, ...quadro.servizi].some((s) => !s.nome.trim());
    if (nomiVuoti) return false;
    return quadroSalvabile(quadro, dotazioneTotale);
  }, [dotazioneTotale, quadro]);

  function commitDotazione(importo: number) {
    if (importo === dotazioneTotale) return;
    setDotazioneTotale(importo);
    setQuadro((q) => ricalcolaQuadro(q, importo));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!window.api || !canSave || saving) return;

    setSaving(true);
    setError(null);

    const res = await window.api.stanziamenti.create({
      anno: Number(anno),
      dotazioneTotale,
      codiceCup: codiceCup.trim(),
      dataEmissione: new Date().toISOString().slice(0, 10),
      quadroEconomico: quadro,
    });

    setSaving(false);
    if (!res.ok || !res.data) {
      setError(res.error ?? 'Error creating allocation');
      return;
    }

    onCreated(res.data);
    onClose();
  }

  return (
    <Modal
      extraWide
      title="New Grant Allocation"
      icon={<Wallet className="h-5 w-5 text-[var(--modal-text)]" />}
      onClose={onClose}
      footerEnd={
        <button
          type="submit"
          form="stanziamento-create-form"
          disabled={saving || !canSave}
          className="modal-btn-primary"
        >
          {saving ? (
            <>
              <span className="h-3.5 w-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            <span>Save Allocation</span>
          )}
        </button>
      }
    >
      {error && (
        <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs font-semibold">
          {error}
        </div>
      )}

      <form
        id="stanziamento-create-form"
        onSubmit={(e) => void handleSubmit(e)}
        className="space-y-5"
      >
        <div className="modal-panel space-y-4">
          <div className="grid grid-cols-1 items-start gap-4 sm:grid-cols-3">
            <Input
              type="number"
              required
              label="Fiscal Year"
              labelIcon={<Calendar className="h-3.5 w-3.5" aria-hidden="true" />}
              value={anno}
              onChange={(e) => setAnno(Number(e.target.value))}
              className="font-bold"
            />

            {(() => {
              const cupTrimmed = codiceCup.trim();
              const cupLen = cupTrimmed.length;
              let cupHelperText: React.ReactNode = null;
              let cupRightIcon: React.ReactNode = null;

              if (cupLen === 15) {
                cupHelperText = <span className="text-emerald-600 font-medium">Valid code (15 chars)</span>;
                cupRightIcon = <Check className="h-4 w-4 text-emerald-600 shrink-0" />;
              } else if (cupLen > 0 && cupLen < 15) {
                const diff = 15 - cupLen;
                cupHelperText = (
                  <span className="text-amber-600 font-medium">
                    {cupLen}/15 chars - {diff} remaining
                  </span>
                );
                cupRightIcon = <AlertCircle className="h-4 w-4 text-amber-500 shrink-0" />;
              } else {
                cupHelperText = <span className="text-[var(--muted)] font-medium">Optional grant code (CUP)</span>;
                cupRightIcon = null;
              }

              return (
                <Input
                  type="text"
                  label="Grant Code (CUP)"
                  labelIcon={<Hash className="h-3.5 w-3.5" aria-hidden="true" />}
                  rightIcon={cupRightIcon}
                  helperText={cupHelperText}
                  value={codiceCup}
                  onChange={(e) => setCodiceCup(e.target.value)}
                  placeholder="e.g. J84E25000340006"
                  className="font-mono font-bold uppercase"
                />
              );
            })()}

            <EuroInput
              label="Total Allocation (€)"
              labelIcon={<Wallet className="h-3.5 w-3.5" aria-hidden="true" />}
              value={dotazioneTotale}
              onCommit={commitDotazione}
              aria-label="Total Allocation"
              className="font-mono font-bold"
            />
          </div>

          <div className="quadro-sections-divider" aria-hidden="true" />

          <QuadroEconomicoEditor
            quadro={quadro}
            dotazione={dotazioneTotale > 0 ? dotazioneTotale : 0}
            onChange={setQuadro}
          />
        </div>
      </form>
    </Modal>
  );
}
