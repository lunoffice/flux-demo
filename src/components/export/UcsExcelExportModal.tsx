import { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { useDemo } from '../../context/DemoContext';

export interface UcsExcelExportModalProps {
  isOpen?: boolean;
  currentYear: number;
  onClose: () => void;
}

export function UcsExcelExportModal({
  isOpen = true,
  currentYear,
  onClose,
}: UcsExcelExportModalProps) {
  const [mode, setMode] = useState<'anno' | 'tutti'>('anno');
  const { showDemoNotice } = useDemo();

  const handleExport = () => {
    showDemoNotice('Excel Spreadsheet Generation (.xlsx)');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Export Staff UCS Spreadsheet" size="sm">
      <div className="space-y-4">
        <p className="text-xs text-[var(--muted)]">
          Export monthly timesheet hours, assigned hourly rates, and aggregated costs into an Excel workbook.
        </p>

        <div className="space-y-2">
          <label className="flex items-center gap-2 p-2.5 rounded-lg border border-[var(--line)] cursor-pointer">
            <input
              type="radio"
              name="exportMode"
              checked={mode === 'anno'}
              onChange={() => setMode('anno')}
            />
            <div className="text-xs font-medium">Current Fiscal Year (FY {currentYear})</div>
          </label>

          <label className="flex items-center gap-2 p-2.5 rounded-lg border border-[var(--line)] cursor-pointer">
            <input
              type="radio"
              name="exportMode"
              checked={mode === 'tutti'}
              onChange={() => setMode('tutti')}
            />
            <div className="text-xs font-medium">All Fiscal Years (Consolidated)</div>
          </label>
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-[var(--line)]">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" onClick={handleExport}>
            Export Excel
          </Button>
        </div>
      </div>
    </Modal>
  );
}
