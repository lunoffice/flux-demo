import { useEffect, useState } from 'react';
import {
  Download,
  FileSpreadsheet,
  FileText,
  CheckCircle2,
  Calendar,
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Select } from '../ui/Input';
import { cn } from '../../lib/cn';
import { useDemo } from '../../context/DemoContext';

type Formato = 'excel' | 'pdf';

const SELECT_TRIGGER =
  '!min-w-0 w-full h-10 rounded-md border border-line bg-paper px-3 py-2 text-sm font-bold shadow-none';

export function ExportModal({ onClose }: { onClose: () => void }) {
  const [anni, setAnni] = useState<number[]>([2026, 2025, 2024, 2023]);
  const [anno, setAnno] = useState(2025);
  const [formato, setFormato] = useState<Formato>('pdf');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const { showDemoNotice } = useDemo();

  useEffect(() => {
    if (!window.api) return;
    void window.api.export.listAnni().then((res) => {
      if (res.ok && res.data?.length) {
        setAnni(res.data);
        setAnno(res.data[0]);
      }
    });
  }, []);

  async function handleExport() {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setMessage(`Demo report generated for Fiscal Year ${anno} (${formato.toUpperCase()}).`);
      showDemoNotice(`Export Report (${formato.toUpperCase()})`);
    }, 400);
  }

  return (
    <Modal
      title="Export Financial Reports"
      onClose={onClose}
      icon={<Download className="h-5 w-5 text-[var(--modal-text)]" />}
      footerEnd={
        <button
          type="button"
          disabled={loading}
          onClick={() => void handleExport()}
          className="modal-btn-primary"
        >
          {loading ? (
            <>
              <span className="h-3.5 w-3.5 rounded-full border-2 border-white border-t-transparent stanz-autosave-spin" />
              <span>Generating...</span>
            </>
          ) : (
            <>
              <Download className="h-3.5 w-3.5" />
              <span>Generate Report</span>
            </>
          )}
        </button>
      }
    >
      <div className="space-y-4">
        {message && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-semibold flex items-center gap-2.5">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
            <span>{message}</span>
          </div>
        )}

        <div className="modal-panel space-y-4">
          <div className="grid w-full items-center gap-1.5">
            <label className="flex items-center gap-1.5 text-sm font-medium leading-none text-[var(--muted)]">
              <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
              Fiscal Year
            </label>
            <Select
              value={String(anno)}
              onChange={(v) => setAnno(Number(v))}
              options={anni.map((a) => ({ value: String(a), label: `FY ${a}` }))}
              aria-label="Fiscal Year"
              className="w-full"
              triggerClassName={SELECT_TRIGGER}
            />
          </div>

          <div className="quadro-sections-divider" aria-hidden="true" />

          <div className="space-y-2">
            <span className="flex items-center gap-1.5 text-sm font-medium leading-none text-[var(--muted)]">
              Export Format
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label
                className={cn(
                  'flex items-start gap-3 p-3.5 rounded-[var(--radius-lg)] border cursor-pointer select-none',
                  formato === 'pdf'
                    ? 'border-[var(--charcoal)] bg-[var(--charcoal)] text-white'
                    : 'border-[var(--line)] bg-paper text-[var(--modal-text)]',
                )}
              >
                <input
                  type="radio"
                  name="formato"
                  checked={formato === 'pdf'}
                  onChange={() => setFormato('pdf')}
                  className="sr-only"
                />
                <div
                  className={cn(
                    'flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-lg)]',
                    formato === 'pdf'
                      ? 'bg-[var(--brand-yellow)] text-[var(--charcoal)]'
                      : 'bg-[var(--paper-muted)] text-[var(--muted)]',
                  )}
                >
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <span className="block text-xs font-extrabold">PDF Statement</span>
                  <span
                    className={cn(
                      'block text-[11px] font-medium mt-0.5',
                      formato === 'pdf' ? 'text-white/70' : 'text-[var(--modal-muted)]',
                    )}
                  >
                    Official financial overview
                  </span>
                </div>
              </label>

              <label
                className={cn(
                  'flex items-start gap-3 p-3.5 rounded-[var(--radius-lg)] border cursor-pointer select-none',
                  formato === 'excel'
                    ? 'border-[var(--charcoal)] bg-[var(--charcoal)] text-white'
                    : 'border-[var(--line)] bg-paper text-[var(--modal-text)]',
                )}
              >
                <input
                  type="radio"
                  name="formato"
                  checked={formato === 'excel'}
                  onChange={() => setFormato('excel')}
                  className="sr-only"
                />
                <div
                  className={cn(
                    'flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-lg)]',
                    formato === 'excel'
                      ? 'bg-[var(--brand-yellow)] text-[var(--charcoal)]'
                      : 'bg-[var(--paper-muted)] text-[var(--muted)]',
                  )}
                >
                  <FileSpreadsheet className="h-5 w-5" />
                </div>
                <div>
                  <span className="block text-xs font-extrabold">Excel Workbook</span>
                  <span
                    className={cn(
                      'block text-[11px] font-medium mt-0.5',
                      formato === 'excel' ? 'text-white/70' : 'text-[var(--modal-muted)]',
                    )}
                  >
                    Full budget, sheets & hours
                  </span>
                </div>
              </label>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
