import { useEffect, useState } from 'react';
import { Coins, FileText, Wallet } from 'lucide-react';
import type { StanziamentoAnnuale } from '../../types/api';
import { Modal } from '../../components/ui/Modal';
import { StanziamentoDatiPanel } from './StanziamentoDatiPanel';
import { ImpegniPanel } from './ImpegniPanel';

type Tab = 'dati' | 'impegni';

interface StanziamentoDetailModalProps {
  stanziamento: StanziamentoAnnuale;
  onClose: () => void;
  onUpdated: () => void;
}

export function StanziamentoDetailModal({
  stanziamento: initialStanziamento,
  onClose,
  onUpdated,
}: StanziamentoDetailModalProps) {
  const [activeTab, setActiveTab] = useState<Tab>('dati');
  const [stz, setStz] = useState<StanziamentoAnnuale>(initialStanziamento);

  async function reloadStanziamento() {
    if (!window.api) return;
    const res = await window.api.stanziamenti.get(stz.id);
    if (res.ok && res.data) {
      setStz(res.data);
      onUpdated();
    }
  }

  useEffect(() => {
    setStz(initialStanziamento);
  }, [initialStanziamento]);

  return (
    <Modal
      extraWide
      title={`Grant Allocation — FY ${stz.anno}`}
      icon={<Wallet className="h-5 w-5 text-[var(--modal-text)]" />}
      onClose={onClose}
    >
      <div className="space-y-4">
        <div className="flex border-b border-[var(--line)] gap-6 text-sm font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('dati')}
            className={`pb-2.5 flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'dati'
                ? 'border-[var(--brand-yellow)] text-[var(--charcoal)]'
                : 'border-transparent text-[var(--muted)] hover:text-[var(--charcoal)]'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Economic Plan & Setup</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('impegni')}
            className={`pb-2.5 flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'impegni'
                ? 'border-[var(--brand-yellow)] text-[var(--charcoal)]'
                : 'border-transparent text-[var(--muted)] hover:text-[var(--charcoal)]'
            }`}
          >
            <Coins className="w-4 h-4" />
            <span>Commitments & Timesheet Links</span>
          </button>
        </div>

        {activeTab === 'dati' ? (
          <StanziamentoDatiPanel
            stanziamento={stz}
            onSaved={() => void reloadStanziamento()}
          />
        ) : (
          <ImpegniPanel
            stanziamento={stz}
            onUpdated={() => void reloadStanziamento()}
          />
        )}
      </div>
    </Modal>
  );
}
