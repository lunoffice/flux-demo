import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle2, X } from 'lucide-react';

interface AppToastProps {
  message: string;
  onClose: () => void;
  durationMs?: number;
}

export function AppToast({ message, onClose, durationMs = 4000 }: AppToastProps) {
  useEffect(() => {
    const t = window.setTimeout(onClose, durationMs);
    return () => window.clearTimeout(t);
  }, [onClose, durationMs]);

  return createPortal(
    <div className="app-toast" role="status" aria-live="polite">
      <CheckCircle2 className="app-toast-icon" size={16} strokeWidth={2.25} />
      <span className="app-toast-msg">{message}</span>
      <button type="button" className="app-toast-close" aria-label="Chiudi" onClick={onClose}>
        <X size={14} strokeWidth={2.25} />
      </button>
    </div>,
    document.body,
  );
}
