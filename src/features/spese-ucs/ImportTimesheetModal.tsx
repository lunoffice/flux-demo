import { useState } from 'react';
import { FileSpreadsheet, Upload } from 'lucide-react';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { useDemo } from '../../context/DemoContext';

interface ImportTimesheetModalProps {
  onClose: () => void;
  onImported: (res: { operatori: number }) => void;
}

export function ImportTimesheetModal({
  onClose,
  onImported,
}: ImportTimesheetModalProps) {
  const { showDemoNotice } = useDemo();
  const [simulating, setSimulating] = useState(false);

  const handleSimulate = () => {
    setSimulating(true);
    setTimeout(() => {
      setSimulating(false);
      showDemoNotice('Excel Timesheet Parsing Engine');
      onImported({ operatori: 3 });
      onClose();
    }, 600);
  };

  return (
    <Modal
      title="Import Staff Timesheets (.xlsx)"
      icon={<FileSpreadsheet className="h-5 w-5 text-[var(--modal-text)]" />}
      onClose={onClose}
      footerEnd={
        <Button variant="primary" onClick={handleSimulate} disabled={simulating}>
          {simulating ? 'Parsing sheets…' : 'Simulate Sheet Import'}
        </Button>
      }
    >
      <div className="space-y-4">
        <p className="text-xs text-[var(--muted)] leading-relaxed">
          In the full desktop application, Flux reads operator timesheet Excel workbooks, parses monthly hours per worker, and synchronizes the records into your local database.
        </p>

        <div className="p-4 rounded-xl border-2 border-dashed border-[var(--line)] bg-[var(--surface-sunken)] text-center space-y-2">
          <Upload className="w-8 h-8 text-[var(--muted)] mx-auto" />
          <div className="text-xs font-bold text-[var(--text-primary)]">
            Timesheet Parser (Demo Simulation)
          </div>
          <p className="text-[11px] text-[var(--muted)]">
            Click &quot;Simulate Sheet Import&quot; to test the ingestion flow in this web sandbox.
          </p>
        </div>
      </div>
    </Modal>
  );
}
