import { useEffect, useState } from 'react';
import { Tags, Plus, Trash2 } from 'lucide-react';
import type { UcsTariffa } from '../../types/api';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';

interface GestioneUcsTariffeModalProps {
  onClose: () => void;
  onChanged: () => void;
}

export function GestioneUcsTariffeModal({
  onClose,
  onChanged,
}: GestioneUcsTariffeModalProps) {
  const [tariffe, setTariffe] = useState<UcsTariffa[]>([]);
  const [nome, setNome] = useState('');
  const [valore, setValore] = useState(32.5);

  async function load() {
    if (!window.api) return;
    const res = await window.api.ucsTariffe.list();
    if (res.ok && res.data) setTariffe(res.data);
  }

  useEffect(() => {
    void load();
  }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!window.api || !nome.trim() || !(valore > 0)) return;
    await window.api.ucsTariffe.create({
      nome: nome.trim(),
      valore,
      isDefault: tariffe.length === 0,
    });
    setNome('');
    await load();
    onChanged();
  }

  async function handleSetDefault(id: string) {
    if (!window.api) return;
    await window.api.ucsTariffe.setDefault(id);
    await load();
    onChanged();
  }

  async function handleDelete(id: string) {
    if (!window.api) return;
    await window.api.ucsTariffe.delete(id);
    await load();
    onChanged();
  }

  return (
    <Modal
      title="Standard Unit Cost (UCS) Rates"
      icon={<Tags className="h-5 w-5 text-[var(--modal-text)]" />}
      onClose={onClose}
    >
      <div className="space-y-4">
        <form onSubmit={(e) => void handleAdd(e)} className="p-3.5 rounded-lg border border-[var(--line)] bg-[var(--surface-sunken)] flex items-end gap-3">
          <Input
            type="text"
            required
            label="Rate Profile Name"
            placeholder="e.g. Senior Social Worker"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="flex-1"
          />
          <Input
            type="number"
            step="0.5"
            required
            label="Hourly Rate (€/h)"
            value={valore}
            onChange={(e) => setValore(Number(e.target.value))}
            className="w-32"
          />
          <button type="submit" className="modal-btn-primary !h-10 !px-4">
            <Plus className="w-4 h-4" />
            <span>Add Rate</span>
          </button>
        </form>

        <div className="space-y-2">
          {tariffe.map((t) => (
            <div
              key={t.id}
              className="p-3 rounded-lg border border-[var(--line)] bg-white flex items-center justify-between gap-3"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[var(--charcoal)]">{t.nome}</span>
                  {t.isDefault && (
                    <span className="px-1.5 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-800 rounded">
                      Default Rate
                    </span>
                  )}
                </div>
                <div className="text-xs font-mono font-bold text-emerald-700 mt-0.5">
                  €{t.valore.toFixed(2)} / hour
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                {!t.isDefault && (
                  <button
                    type="button"
                    onClick={() => void handleSetDefault(t.id)}
                    className="px-2.5 py-1 rounded text-xs font-medium border border-[var(--line)] hover:bg-slate-50"
                  >
                    Set as Default
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => void handleDelete(t.id)}
                  title="Delete rate"
                  className="icon-btn is-danger"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
}
