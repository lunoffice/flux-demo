import { RefreshCw, Database } from 'lucide-react';
import { useDemo } from '../../context/DemoContext';

interface TopBarProps {
  onOpenBackup: () => void;
}

export function TopBar({ onOpenBackup }: TopBarProps) {
  const { resetDemoData } = useDemo();

  return (
    <header className="h-12 border-b border-[var(--line)] bg-[var(--surface-sunken)] px-4 flex items-center justify-between shrink-0 select-none">
      <div className="flex items-center gap-2.5">
        <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Interactive Web Demo
        </span>
        <span className="text-xs text-[var(--muted)] hidden sm:inline">
          In-browser sandbox state (localStorage)
        </span>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={resetDemoData}
          title="Reset sandbox to initial sample dataset"
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md border border-[var(--line)] bg-[var(--surface-raised)] text-[var(--text-primary)] hover:bg-[var(--line)] hover:text-black transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reset Sample Data</span>
        </button>

        <button
          type="button"
          onClick={onOpenBackup}
          title="Inspect Sandbox Database"
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md border border-[var(--line)] bg-[var(--surface-raised)] text-[var(--text-primary)] hover:bg-[var(--line)] transition-colors"
        >
          <Database className="w-3.5 h-3.5 text-blue-500" />
          <span className="hidden md:inline">Sandbox Storage</span>
        </button>
      </div>
    </header>
  );
}
