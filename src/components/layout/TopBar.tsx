import { RefreshCw, Database } from 'lucide-react';
import { useDemo } from '../../context/DemoContext';

interface TopBarProps {
  onOpenBackup: () => void;
}

export function TopBar({ onOpenBackup }: TopBarProps) {
  const { resetDemoData } = useDemo();

  return (
    <header className="h-12 border-b border-white/10 bg-[#16171c] px-3 sm:px-4 flex items-center justify-between shrink-0 select-none">
      <div className="flex items-center gap-2.5 mr-auto">
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Interactive Web Demo
        </span>
        <span className="text-xs text-zinc-400 hidden sm:inline font-medium">
          In-browser sandbox state (localStorage)
        </span>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={resetDemoData}
          title="Reset sandbox to initial sample dataset"
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-md border border-white/15 bg-white/5 text-zinc-200 hover:bg-white/10 hover:text-white transition-all cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
          <span>Reset Sample Data</span>
        </button>

        <button
          type="button"
          onClick={onOpenBackup}
          title="Inspect Sandbox Database"
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-md border border-white/15 bg-white/5 text-zinc-200 hover:bg-white/10 hover:text-white transition-all cursor-pointer"
        >
          <Database className="w-3.5 h-3.5 text-blue-400" />
          <span className="hidden md:inline">Sandbox Storage</span>
        </button>
      </div>
    </header>
  );
}
