import { Modal } from './Modal';
import { Button } from './Button';
import { useDemo } from '../../context/DemoContext';
import { Sparkles, Monitor, HardDrive } from 'lucide-react';

export function DemoNoticeModal() {
  const { isDemoNoticeOpen, demoNoticeFeature, closeDemoNotice } = useDemo();

  return (
    <Modal
      isOpen={isDemoNoticeOpen}
      onClose={closeDemoNotice}
      title="Interactive Showcase Notice"
      size="md"
    >
      <div className="space-y-4">
        <div className="flex items-start gap-3 p-3.5 rounded-lg bg-[var(--surface-sunken)] border border-[var(--line)]">
          <div className="p-2 rounded-md bg-[var(--surface-raised)] border border-[var(--line)] text-[var(--accent)] shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-[var(--text-primary)]">
              {demoNoticeFeature || 'Desktop Application Feature'}
            </h4>
            <p className="text-xs text-[var(--muted)] mt-1 leading-relaxed">
              You are experiencing the standalone browser showcase of <strong>Flux</strong>. This feature utilizes local OS system calls in the desktop Electron build.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-lg border border-[var(--line)] bg-[var(--surface-raised)] space-y-1.5">
            <div className="flex items-center gap-1.5 font-semibold text-[var(--text-primary)]">
              <HardDrive className="w-3.5 h-3.5 text-blue-500" />
              <span>In This Web Demo</span>
            </div>
            <ul className="text-[var(--muted)] space-y-1 pl-4 list-disc">
              <li>Local in-browser sandbox state</li>
              <li>Real-time calculations & forms</li>
              <li>Pre-seeded realistic sample dataset</li>
            </ul>
          </div>

          <div className="p-3 rounded-lg border border-[var(--line)] bg-[var(--surface-raised)] space-y-1.5">
            <div className="flex items-center gap-1.5 font-semibold text-[var(--text-primary)]">
              <Monitor className="w-3.5 h-3.5 text-emerald-500" />
              <span>Full Desktop Edition</span>
            </div>
            <ul className="text-[var(--muted)] space-y-1 pl-4 list-disc">
              <li>Encrypted local SQLite storage</li>
              <li>Direct Word & Excel export engines</li>
              <li>Automated document generation</li>
            </ul>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button variant="primary" onClick={closeDemoNotice}>
            Got it, continue demo
          </Button>
        </div>
      </div>
    </Modal>
  );
}
