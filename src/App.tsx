import { lazy, Suspense } from 'react';
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';

const DashboardPage = lazy(() =>
  import('./features/dashboard/DashboardPage').then((m) => ({ default: m.DashboardPage })),
);
const FondoPovertaPage = lazy(() =>
  import('./features/fondo-poverta/FondoPovertaPage').then((m) => ({ default: m.FondoPovertaPage })),
);
const FondoReportPage = lazy(() =>
  import('./features/fondo-poverta/FondoReportPage').then((m) => ({ default: m.FondoReportPage })),
);
const SpeseUcsPage = lazy(() =>
  import('./features/spese-ucs/SpeseUcsPage').then((m) => ({ default: m.SpeseUcsPage })),
);
const UcsReportPage = lazy(() =>
  import('./features/spese-ucs/UcsReportPage').then((m) => ({ default: m.UcsReportPage })),
);

function RouteFallback() {
  return (
    <div className="flex h-64 w-full items-center justify-center text-xs font-semibold text-[var(--muted)]">
      Loading view…
    </div>
  );
}

export default function App() {
  return (
    <HashRouter>
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route element={<AppShell />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/fondo" element={<FondoPovertaPage />} />
            <Route path="/fondo/report" element={<FondoReportPage />} />
            <Route path="/ucs" element={<SpeseUcsPage />} />
            <Route path="/ucs/report" element={<UcsReportPage />} />
          </Route>
        </Routes>
      </Suspense>
    </HashRouter>
  );
}
