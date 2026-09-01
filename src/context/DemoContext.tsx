import { createContext, useContext, useState, type ReactNode } from 'react';
import { mockDb } from '../lib/mockApi';

interface DemoContextType {
  isDemoNoticeOpen: boolean;
  demoNoticeFeature: string;
  showDemoNotice: (featureName: string) => void;
  closeDemoNotice: () => void;
  resetDemoData: () => void;
}

const DemoContext = createContext<DemoContextType | null>(null);

export function DemoProvider({ children }: { children: ReactNode }) {
  const [isDemoNoticeOpen, setIsDemoNoticeOpen] = useState(false);
  const [demoNoticeFeature, setDemoNoticeFeature] = useState('');

  const showDemoNotice = (featureName: string) => {
    setDemoNoticeFeature(featureName);
    setIsDemoNoticeOpen(true);
  };

  const closeDemoNotice = () => {
    setIsDemoNoticeOpen(false);
    setDemoNoticeFeature('');
  };

  const resetDemoData = () => {
    mockDb.resetAll();
    window.location.reload();
  };

  return (
    <DemoContext.Provider
      value={{
        isDemoNoticeOpen,
        demoNoticeFeature,
        showDemoNotice,
        closeDemoNotice,
        resetDemoData,
      }}
    >
      {children}
    </DemoContext.Provider>
  );
}

export function useDemo() {
  const ctx = useContext(DemoContext);
  if (!ctx) throw new Error('useDemo must be used within DemoProvider');
  return ctx;
}
