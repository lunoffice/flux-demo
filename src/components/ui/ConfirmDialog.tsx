import { AlertTriangle, Trash2 } from 'lucide-react';
import type { ReactNode } from 'react';
import { Modal } from './Modal';
import { cn } from '../../lib/cn';

export interface ConfirmDialogProps {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning';
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  icon?: ReactNode;
}

export function ConfirmDialog({
  title,
  message,
  confirmLabel = 'Elimina',
  cancelLabel = 'Annulla',
  variant = 'danger',
  loading = false,
  onConfirm,
  onCancel,
  icon,
}: ConfirmDialogProps) {
  const handleClose = () => {
    if (!loading) onCancel();
  };

  const defaultIcon =
    variant === 'danger' ? (
      <Trash2 className="h-5 w-5 text-red-600" />
    ) : (
      <AlertTriangle className="h-5 w-5 text-amber-600" />
    );

  return (
    <Modal
      title={title}
      onClose={handleClose}
      icon={icon ?? defaultIcon}
      footer={
        <button type="button" className="modal-btn-secondary" onClick={handleClose} disabled={loading}>
          {cancelLabel}
        </button>
      }
      footerEnd={
        <button
          type="button"
          onClick={onConfirm}
          disabled={loading}
          className={cn(
            variant === 'danger' ? 'modal-btn-danger' : 'modal-btn-primary',
            loading && 'opacity-60 cursor-not-allowed',
          )}
        >
          {loading && (
            <span className="h-3 w-3 rounded-full border-2 border-white border-t-transparent stanz-autosave-spin" />
          )}
          <span>{confirmLabel}</span>
        </button>
      }
    >
      <div className="modal-panel space-y-3.5">
        <p className="text-sm font-medium leading-relaxed text-[var(--modal-text)]">{message}</p>
        <div className="flex items-center gap-2.5 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs font-semibold text-amber-900">
          <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600" />
          <span>Questa azione è irreversibile e non potrà essere annullata.</span>
        </div>
      </div>
    </Modal>
  );
}
