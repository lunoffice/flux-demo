import { useState } from 'react';
import { UserPlus } from 'lucide-react';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';

interface NuovoOperatoreModalProps {
  annoDefault: number;
  anniDisponibili?: number[];
  onClose: () => void;
  onSaved: () => void;
}

export function NuovoOperatoreModal({
  annoDefault,
  onClose,
  onSaved,
}: NuovoOperatoreModalProps) {
  const [nomeCompleto, setNomeCompleto] = useState('');
  const [anno, setAnno] = useState(annoDefault);
  const [pagaOrariaMedia, setPagaOrariaMedia] = useState(32.5);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!window.api || !nomeCompleto.trim()) return;
    setSaving(true);
    try {
      const res = await window.api.operatori.create({
        nomeCompleto: nomeCompleto.trim(),
        anno,
        pagaOrariaMedia,
        consuntivoMensile: {},
      });
      if (res.ok) {
        onSaved();
        onClose();
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      title="Add New Staff Member"
      icon={<UserPlus className="h-5 w-5 text-[var(--modal-text)]" />}
      onClose={onClose}
      footerEnd={
        <button
          type="submit"
          form="nuovo-op-form"
          disabled={saving || !nomeCompleto.trim()}
          className="modal-btn-primary"
        >
          {saving ? 'Adding...' : 'Add Staff Member'}
        </button>
      }
    >
      <form id="nuovo-op-form" onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
        <Input
          type="text"
          required
          label="Full Name & Role"
          placeholder="e.g. Sarah Jenkins (Social Worker)"
          value={nomeCompleto}
          onChange={(e) => setNomeCompleto(e.target.value)}
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            type="number"
            label="Fiscal Year"
            value={anno}
            onChange={(e) => setAnno(Number(e.target.value))}
          />
          <Input
            type="number"
            step="0.5"
            label="Default Hourly Rate (€/h)"
            value={pagaOrariaMedia}
            onChange={(e) => setPagaOrariaMedia(Number(e.target.value))}
          />
        </div>
      </form>
    </Modal>
  );
}
