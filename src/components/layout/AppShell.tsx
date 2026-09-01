import { lazy, Suspense, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { useEsercizio } from '../../context/EsercizioContext';
import { DemoNoticeModal } from '../ui/DemoNoticeModal';

const BackupModal = lazy(() =>
  import('../backup/BackupModal').then((m) => ({ default: m.BackupModal })),
);

export function AppShell() {
  const [showBackup, setShowBackup] = useState(false);
  const { refreshAnni } = useEsercizio();

  return (
    <div className="app-shell flex h-screen w-screen overflow-hidden text-slate-900 font-sans select-none">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <Sidebar onBackup={() => setShowBackup(true)} />

      <div className="app-shell-main flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <TopBar onOpenBackup={() => setShowBackup(true)} />
        <main
          id="main-content"
          className="app-shell-content flex-1 flex flex-col min-h-0 overflow-hidden p-4 md:p-6 focus:outline-none"
        >
          <Outlet />
        </main>
      </div>

      <DemoNoticeModal />

      {showBackup && (
        <Suspense fallback={null}>
          <BackupModal
            onClose={() => setShowBackup(false)}
            onReload={() => {
              void refreshAnni();
              window.location.reload();
            }}
          />
        </Suspense>
      )}
    </div>
  );
}
