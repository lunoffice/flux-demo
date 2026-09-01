import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { Check, ChevronDown } from 'lucide-react';
import { cn } from '../../lib/cn';

export type SelectOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

type PopoverPos = {
  top: number;
  left: number;
  width: number;
  openUp: boolean;
};

export function Select({
  value,
  onChange,
  options,
  placeholder = 'Seleziona…',
  disabled,
  className = '',
  triggerClassName = '',
  leftIcon,
  id,
  'aria-label': ariaLabel,
}: {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  triggerClassName?: string;
  leftIcon?: ReactNode;
  id?: string;
  'aria-label'?: string;
}) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const wrapRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<PopoverPos | null>(null);

  const selected = options.find((o) => String(o.value) === String(value));
  const display = selected?.label ?? '';

  function updatePos() {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const trigger = wrap.querySelector('.select-trigger') as HTMLElement | null;
    const el = trigger ?? wrap;
    const rect = el.getBoundingClientRect();
    const width = rect.width;
    const spaceBelow = window.innerHeight - rect.bottom - 8;
    const openUp = spaceBelow < 160 && rect.top > spaceBelow;
    setPos({
      top: openUp ? rect.top - 4 : rect.bottom + 4,
      left: Math.min(Math.max(8, rect.left), Math.max(8, window.innerWidth - width - 8)),
      width,
      openUp,
    });
  }

  useLayoutEffect(() => {
    if (!open) return;
    updatePos();
  }, [open]);

  useEffect(() => {
    if (!open) return;

    function onDocDown(e: MouseEvent) {
      const t = e.target as Node;
      if (wrapRef.current?.contains(t) || panelRef.current?.contains(t)) return;
      setOpen(false);
    }

    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }

    function onScrollOrResize() {
      updatePos();
    }

    document.addEventListener('mousedown', onDocDown);
    document.addEventListener('keydown', onKey);
    window.addEventListener('resize', onScrollOrResize);
    window.addEventListener('scroll', onScrollOrResize, true);
    return () => {
      document.removeEventListener('mousedown', onDocDown);
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', onScrollOrResize);
      window.removeEventListener('scroll', onScrollOrResize, true);
    };
  }, [open]);

  function pick(next: string) {
    onChange(next);
    setOpen(false);
  }

  return (
    <div className={cn('select-root', className)} ref={wrapRef}>
      <button
        type="button"
        id={inputId}
        className={cn(
          'select-trigger',
          open && 'is-open',
          disabled && 'is-disabled',
          leftIcon && 'has-icon',
          triggerClassName,
        )}
        disabled={disabled}
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => {
          if (disabled) return;
          if (open) {
            setOpen(false);
            return;
          }
          updatePos();
          setOpen(true);
        }}
      >
        {leftIcon && <span className="select-trigger-icon">{leftIcon}</span>}
        <span className={cn('select-trigger-label', !display && 'is-placeholder')}>
          {display || placeholder}
        </span>
        <ChevronDown
          size={14}
          strokeWidth={2.25}
          className={cn('select-trigger-chevron', open && 'is-open')}
          aria-hidden="true"
        />
      </button>

      {open &&
        pos &&
        createPortal(
          <div
            ref={panelRef}
            className={cn('select-popover', pos.openUp && 'is-up')}
            role="listbox"
            aria-label={ariaLabel ?? 'Opzioni'}
            style={
              pos.openUp
                ? {
                    bottom: window.innerHeight - pos.top,
                    left: pos.left,
                    width: pos.width,
                    top: 'auto',
                  }
                : { top: pos.top, left: pos.left, width: pos.width }
            }
          >
            {options.length === 0 ? (
              <p className="select-empty">Nessuna opzione</p>
            ) : (
              options.map((opt) => {
                const isSelected = String(opt.value) === String(value);
                return (
                  <button
                    key={opt.value || '__empty__'}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    disabled={opt.disabled}
                    className={cn(
                      'select-option',
                      isSelected && 'is-selected',
                      opt.disabled && 'is-disabled',
                    )}
                    onClick={() => {
                      if (!opt.disabled) pick(opt.value);
                    }}
                  >
                    <span className="select-option-label">{opt.label}</span>
                    {isSelected && (
                      <Check
                        size={14}
                        strokeWidth={2.5}
                        className="select-option-check"
                        aria-hidden="true"
                      />
                    )}
                  </button>
                );
              })
            )}
          </div>,
          document.body,
        )}
    </div>
  );
}
