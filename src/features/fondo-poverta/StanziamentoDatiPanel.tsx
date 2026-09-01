import { useState } from 'react';
import { Calendar, Check, Hash, Save, Wallet } from 'lucide-react';
import type { QuadroEconomico, StanziamentoAnnuale } from '../../types/api';
import { EuroInput } from '../../components/ui/EuroInput';
import { Input } from '../../components/ui/Input';
import { QuadroEconomicoEditor } from './QuadroEconomicoEditor';

interface StanziamentoDatiPanelProps {
  stanziamento: StanziamentoAnnuale;
  onSaved: () => void;
}

export function StanziamentoDatiPanel({
  stanziamento,
  onSaved,
}: StanziamentoDatiPanelProps) {
  const [codiceCup, setCodiceCup] = useState(stanziamento.codiceCup || '');
  const [dotazioneTotale, setDotazioneTotale] = useState(stanziamento.dotazioneTotale || 0);
  const [quadro, setQuadro] = useState<QuadroEconomico>(
    stanziamento.quadroEconomico || { versione: 2, personale: [], servizi: [] },
  );
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  async function handleSave() {
    if (!window.api) return;
    setSaving(true);
    setSavedSuccess(false);

    try {
      const res = await window.api.stanziamenti.update(stanziamento.id, {
        codiceCup: codiceCup.trim(),
        dotazioneTotale,
        quadroEconomico: quadro,
      });

      if (res.ok) {
        setSavedSuccess(true);
        onSaved();
        setTimeout(() => setSavedSuccess(false), 2500);
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="modal-panel space-y-4">
        <div className="grid grid-cols-1 items-start gap-4 sm:grid-cols-3">
          <Input
            type="number"
            disabled
            label="Fiscal Year"
            labelIcon={<Calendar className="h-3.5 w-3.5" aria-hidden="true" />}
            value={stanziamento.anno}
            className="font-bold bg-slate-50"
          />

          <Input
            type="text"
            label="Grant Code (CUP)"
            labelIcon={<Hash className="h-3.5 w-3.5" aria-hidden="true" />}
            value={codiceCup}
            onChange={(e) => setCodiceCup(e.target.value)}
            placeholder="e.g. J84E25000340006"
            className="font-mono font-bold uppercase"
          />

          <EuroInput
            label="Total Allocation (€)"
            labelIcon={<Wallet className="h-3.5 w-3.5" aria-hidden="true" />}
            value={dotazioneTotale}
            onCommit={setDotazioneTotale}
            aria-label="Total Allocation"
            className="font-mono font-bold"
          />
        </div>

        <div className="quadro-sections-divider" aria-hidden="true" />

        <QuadroEconomicoEditor
          quadro={quadro}
          dotazione={dotazioneTotale}
          onChange={setQuadro}
        />
      </div>

      <div className="flex items-center justify-between pt-2">
        {savedSuccess ? (
          <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
            <Check className="w-4 h-4" />
            Changes saved to sandbox!
          </span>
        ) : <div />}

        <button
          type="button"
          disabled={saving}
          onClick={() => void handleSave()}
          className="modal-btn-primary"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving...' : 'Save Changes'}</span>
        </button>
      </div>
    </div>
  );
}
