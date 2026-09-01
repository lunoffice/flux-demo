import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { useDemo } from '../../context/DemoContext';
import {
  Database,
  Download,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

interface BackupModalProps {
  onClose: () => void;
  onReload: () => void;
}

export function BackupModal({ onClose, onReload }: BackupModalProps) {
  const { resetDemoData } = useDemo();

  const handleExportJson = () => {
    try {
      const exportObj = {
        stanziamenti: localStorage.getItem('flux_demo_stanziamenti_v1'),
        operatori: localStorage.getItem('flux_demo_operatori_v1'),
        tariffe: localStorage.getItem('flux_demo_tariffe_v1'),
        impegni: localStorage.getItem('flux_demo_impegni_v1'),
        exportedAt: new Date().toISOString(),
      };
      const blob = new Blob([JSON.stringify(exportObj, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `flux_demo_export_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <Modal isOpen onClose={onClose} title="Sandbox Storage & Backup" size="lg">
      <div className="space-y-5">
        <div className="flex items-center gap-3 p-3.5 rounded-lg border border-[var(--line)] bg-[var(--surface-sunken)]">
          <div className="p-2.5 rounded-lg bg-[var(--brand-yellow)] text-[var(--charcoal)] shrink-0 font-bold">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-[var(--text-primary)]">In-Browser Demo Sandbox</h4>
              <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-blue-100 text-blue-800 rounded">
                localStorage
              </span>
            </div>
            <p className="text-xs text-[var(--muted)] mt-0.5">
              All records you add or edit in this web session are saved locally in your browser cache.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div className="p-4 rounded-lg border border-[var(--line)] bg-[var(--surface-raised)] space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-[var(--text-primary)]">
              <Download className="w-4 h-4 text-emerald-600" />
              <span>Export Sandbox JSON</span>
            </div>
            <p className="text-xs text-[var(--muted)]">
              Download your current demo records (grants, staff, and commitments) as a portable JSON file.
            </p>
            <Button variant="secondary" size="sm" onClick={handleExportJson} className="w-full">
              Export Data (.json)
            </Button>
          </div>

          <div className="p-4 rounded-lg border border-[var(--line)] bg-[var(--surface-raised)] space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-[var(--text-primary)]">
              <RotateCcw className="w-4 h-4 text-amber-600" />
              <span>Reset Sample Data</span>
            </div>
            <p className="text-xs text-[var(--muted)]">
              Restore default multi-year grants, staff timesheets, and hourly rates to the initial clean state.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                resetDemoData();
                onReload();
              }}
              className="w-full"
            >
              Reset to Default Dataset
            </Button>
          </div>
        </div>

        <div className="p-3.5 rounded-lg border border-[var(--line)] bg-[var(--surface-sunken)]">
          <div className="flex items-center gap-2 font-semibold text-xs text-[var(--text-primary)] mb-1.5">
            <Sparkles className="w-4 h-4 text-[var(--accent)]" />
            <span>Desktop Application Highlights</span>
          </div>
          <p className="text-xs text-[var(--muted)] leading-relaxed">
            In the native desktop edition of Flux, data is stored in an encrypted local <strong>SQLite database</strong> with automatic snapshotting, cross-machine migration, and direct Word (.docx) & Excel (.xlsx) compile engines.
          </p>
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-[var(--line)]">
          <Button variant="primary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}
