import { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { FileText, FileSpreadsheet } from 'lucide-react';
import { useDemo } from '../../context/DemoContext';

interface ReportFormatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (format: 'docx' | 'pdf') => void;
  title?: string;
}

export function ReportFormatModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Select Report Format',
}: ReportFormatModalProps) {
  const [format, setFormat] = useState<'docx' | 'pdf'>('docx');
  const { showDemoNotice } = useDemo();

  const handleConfirm = () => {
    onConfirm(format);
    showDemoNotice(`Automated ${format.toUpperCase()} Generation`);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="space-y-4">
        <p className="text-xs text-[var(--muted)]">
          Choose the document format to generate for this staff timesheet report.
        </p>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setFormat('docx')}
            className={`p-3 rounded-lg border text-left transition-all ${
              format === 'docx'
                ? 'border-[var(--charcoal)] bg-[var(--charcoal)] text-white'
                : 'border-[var(--line)] bg-[var(--surface-raised)] text-[var(--text-primary)]'
            }`}
          >
            <FileText className="w-5 h-5 mb-2 text-[var(--brand-yellow)]" />
            <div className="text-xs font-bold">Word (.docx)</div>
            <div className="text-[10px] opacity-80 mt-0.5">Editable document</div>
          </button>

          <button
            type="button"
            onClick={() => setFormat('pdf')}
            className={`p-3 rounded-lg border text-left transition-all ${
              format === 'pdf'
                ? 'border-[var(--charcoal)] bg-[var(--charcoal)] text-white'
                : 'border-[var(--line)] bg-[var(--surface-raised)] text-[var(--text-primary)]'
            }`}
          >
            <FileSpreadsheet className="w-5 h-5 mb-2 text-[var(--brand-yellow)]" />
            <div className="text-xs font-bold">PDF Document</div>
            <div className="text-[10px] opacity-80 mt-0.5">Standardized layout</div>
          </button>
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-[var(--line)]">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" onClick={handleConfirm}>
            Generate Document
          </Button>
        </div>
      </div>
    </Modal>
  );
}
