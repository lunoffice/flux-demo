import { useState } from 'react';
import { FileText, Download } from 'lucide-react';
import type { OperatoreUcs } from '../../types/api';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { useDemo } from '../../context/DemoContext';

interface RelazionePeriodicaModalProps {
  anno: number;
  operatori: OperatoreUcs[];
  fondoAnnoPerMese?: Record<string, Record<number, string>>;
  onClose: () => void;
}

export function RelazionePeriodicaModal({
  anno,
  onClose,
}: RelazionePeriodicaModalProps) {
  const { showDemoNotice } = useDemo();
  const [trimestre, setTrimestre] = useState('1');

  const handleGenerate = () => {
    showDemoNotice(`Quarterly Narrative Report (Q${trimestre} - FY ${anno})`);
    onClose();
  };

  return (
    <Modal
      title="Generate Quarterly Narrative Statement"
      icon={<FileText className="h-5 w-5 text-[var(--modal-text)]" />}
      onClose={onClose}
      footerEnd={
        <Button variant="primary" onClick={handleGenerate}>
          <Download className="w-3.5 h-3.5" />
          <span>Compile Word Report (.docx)</span>
        </Button>
      }
    >
      <div className="space-y-4">
        <p className="text-xs text-[var(--muted)]">
          Generate an official quarterly monitoring document summarizing personnel expenditures, hours, and grant milestones.
        </p>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-[var(--muted)]">Quarter</label>
            <Select
              value={trimestre}
              onChange={setTrimestre}
              options={[
                { value: '1', label: 'Q1 (Jan – Mar)' },
                { value: '2', label: 'Q2 (Apr – Jun)' },
                { value: '3', label: 'Q3 (Jul – Sep)' },
                { value: '4', label: 'Q4 (Oct – Dec)' },
              ]}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-[var(--muted)]">Fiscal Year</label>
            <div className="h-10 px-3 flex items-center font-bold text-xs bg-slate-50 border border-[var(--line)] rounded-md">
              FY {anno}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
