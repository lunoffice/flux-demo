import { useEffect, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '../../lib/cn';

export interface ModalProps {
  title: string;
  subtitle?: ReactNode;
  onClose: () => void;
  children: ReactNode;
  isOpen?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl' | string;
  footer?: ReactNode;
  footerCenter?: ReactNode;
  footerEnd?: ReactNode;
  headerCenter?: ReactNode;
  headerRight?: ReactNode;
  wide?: boolean;
  extraWide?: boolean;
  narrow?: boolean;
  fullscreen?: boolean;
  icon?: ReactNode;
  className?: string;
  hideDefaultClose?: boolean;
}

function getFocusable(container: HTMLElement): HTMLElement[] {
  return Array.from(
    container.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ),
  ).filter((el) => !el.hasAttribute('disabled') && el.tabIndex !== -1);
}

export function Modal({
  title,
  subtitle,
  onClose,
  children,
  isOpen = true,
  size,
  footer,
  footerCenter,
  footerEnd,
  headerCenter,
  headerRight,
  wide = false,
  extraWide = false,
  narrow = false,
  fullscreen = false,
  icon,
  className,
  hideDefaultClose = false,
}: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const prevActiveElement = useRef<Element | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    prevActiveElement.current = document.activeElement;
    const panel = panelRef.current;
    if (panel) {
      const focusables = getFocusable(panel);
      if (focusables.length > 0) {
        focusables[0].focus();
      } else {
        panel.focus();
      }
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key !== 'Tab') return;
      const el = panelRef.current;
      if (!el) return;
      const focusables = getFocusable(el);
      if (focusables.length === 0) {
        e.preventDefault();
        return;
      }
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
      if (prevActiveElement.current instanceof HTMLElement) {
        prevActiveElement.current.focus();
      }
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const widthClass =
    size === 'sm' || narrow
      ? 'modal-narrow max-w-md'
      : size === 'lg' || wide
        ? 'modal-wide max-w-3xl'
        : size === 'xl' || extraWide
          ? 'modal-extra-wide max-w-5xl'
          : 'max-w-2xl';

  return createPortal(
    <div
      className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
        className={cn(
          'modal-panel relative w-full rounded-2xl bg-[var(--paper)] border border-[var(--line)] shadow-2xl overflow-hidden flex flex-col my-auto',
          widthClass,
          fullscreen && 'modal-fullscreen h-full max-w-none rounded-none',
          className,
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[var(--line)] bg-[var(--surface-raised)]">
          <div className="flex items-center gap-3 min-w-0">
            {icon && <div className="shrink-0">{icon}</div>}
            <div className="min-w-0">
              <h2 className="text-base font-bold text-[var(--modal-text)] truncate">{title}</h2>
              {subtitle && <p className="text-xs text-[var(--modal-muted)] mt-0.5">{subtitle}</p>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {headerCenter}
            {headerRight}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-[var(--muted)] hover:bg-[var(--line)] hover:text-black transition-colors"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto max-h-[calc(85vh-120px)]">{children}</div>

        {/* Footer */}
        {(footer || footerCenter || footerEnd || !hideDefaultClose) && (
          <div className="flex items-center justify-between p-4 border-t border-[var(--line)] bg-[var(--surface-sunken)]">
            <div>
              {footer ? (
                footer
              ) : !hideDefaultClose ? (
                <button
                  type="button"
                  onClick={onClose}
                  className="modal-btn-secondary !min-h-9 !px-3 !text-xs"
                >
                  Close
                </button>
              ) : null}
            </div>
            <div>{footerCenter}</div>
            <div>{footerEnd}</div>
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
