import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

const WEEKDAYS = ['Lu', 'Ma', 'Me', 'Gi', 'Ve', 'Sa', 'Do'] as const;
const MONTHS = [
  'Gennaio',
  'Febbraio',
  'Marzo',
  'Aprile',
  'Maggio',
  'Giugno',
  'Luglio',
  'Agosto',
  'Settembre',
  'Ottobre',
  'Novembre',
  'Dicembre',
] as const;

function parseIsoDate(iso: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso.trim());
  if (!m) return null;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return Number.isNaN(d.getTime()) ? null : d;
}

function toIsoDate(d: Date): string {
  const y = d.getFullYear();
  const mo = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${mo}-${day}`;
}

function formatDateIt(iso: string): string {
  const d = parseIsoDate(iso);
  if (!d) return '';
  return d.toLocaleDateString('it-IT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function monthMatrix(year: number, month: number): (Date | null)[] {
  const first = new Date(year, month, 1);
  const startPad = (first.getDay() + 6) % 7; // Monday-first
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (Date | null)[] = [];
  for (let i = 0; i < startPad; i += 1) cells.push(null);
  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(new Date(year, month, day));
  }
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

type PopoverPos = { top: number; left: number; width: number };

export function DateInput({
  value,
  onChange,
  className = '',
  disabled,
  required,
  'aria-label': ariaLabel = 'Data',
  id,
}: {
  value: string;
  onChange: (isoDate: string) => void;
  className?: string;
  disabled?: boolean;
  required?: boolean;
  'aria-label'?: string;
  id?: string;
}) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const wrapRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<PopoverPos | null>(null);

  const selected = parseIsoDate(value);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [view, setView] = useState(() => {
    const base = selected ?? today;
    return { year: base.getFullYear(), month: base.getMonth() };
  });

  useEffect(() => {
    if (!open) return;
    const base = selected ?? today;
    setView({ year: base.getFullYear(), month: base.getMonth() });
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps -- sync view only on open

  useLayoutEffect(() => {
    if (!open || !wrapRef.current) return;

    function place() {
      const el = wrapRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const panelW = 288;
      const panelH = 340;
      const gap = 6;
      let left = rect.left;
      let top = rect.bottom + gap;
      if (left + panelW > window.innerWidth - 8) {
        left = Math.max(8, window.innerWidth - panelW - 8);
      }
      if (top + panelH > window.innerHeight - 8 && rect.top > panelH + gap) {
        top = rect.top - panelH - gap;
      }
      setPos({ top, left, width: Math.max(rect.width, panelW) });
    }

    place();
    window.addEventListener('resize', place);
    window.addEventListener('scroll', place, true);
    return () => {
      window.removeEventListener('resize', place);
      window.removeEventListener('scroll', place, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(e: MouseEvent) {
      const t = e.target as Node;
      if (wrapRef.current?.contains(t) || panelRef.current?.contains(t)) return;
      setOpen(false);
    }

    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  function selectDay(d: Date) {
    onChange(toIsoDate(d));
    setOpen(false);
  }

  function shiftMonth(delta: number) {
    setView((v) => {
      const d = new Date(v.year, v.month + delta, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });
  }

  const cells = monthMatrix(view.year, view.month);
  const display = value ? formatDateIt(value) : '';

  return (
    <div className={`date-input ${className}`.trim()} ref={wrapRef}>
      <button
        type="button"
        id={inputId}
        className="date-input-trigger input-field"
        disabled={disabled}
        aria-label={ariaLabel}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-required={required || undefined}
        onClick={() => {
          if (!disabled) setOpen((o) => !o);
        }}
      >
        <span className={display ? 'date-input-value' : 'date-input-placeholder'}>
          {display || 'Seleziona data'}
        </span>
        <Calendar size={16} strokeWidth={2} className="date-input-icon" aria-hidden="true" />
      </button>

      {open &&
        pos &&
        createPortal(
          <div
            ref={panelRef}
            className="date-input-popover"
            role="dialog"
            aria-label="Calendario"
            style={{ top: pos.top, left: pos.left, minWidth: pos.width }}
          >
            <div className="date-input-nav">
              <button
                type="button"
                className="date-input-nav-btn"
                onClick={() => shiftMonth(-1)}
                aria-label="Mese precedente"
              >
                <ChevronLeft size={16} strokeWidth={2} />
              </button>
              <p className="date-input-month">
                {MONTHS[view.month]} {view.year}
              </p>
              <button
                type="button"
                className="date-input-nav-btn"
                onClick={() => shiftMonth(1)}
                aria-label="Mese successivo"
              >
                <ChevronRight size={16} strokeWidth={2} />
              </button>
            </div>

            <div className="date-input-weekdays" aria-hidden="true">
              {WEEKDAYS.map((w) => (
                <span key={w}>{w}</span>
              ))}
            </div>

            <div className="date-input-grid">
              {cells.map((d, i) => {
                if (!d) {
                  return <span key={`e-${i}`} className="date-input-day is-empty" />;
                }
                const iso = toIsoDate(d);
                const isSelected = selected ? sameDay(d, selected) : false;
                const isToday = sameDay(d, today);
                return (
                  <button
                    key={iso}
                    type="button"
                    className={[
                      'date-input-day',
                      isSelected ? 'is-selected' : '',
                      isToday ? 'is-today' : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    onClick={() => selectDay(d)}
                  >
                    {d.getDate()}
                  </button>
                );
              })}
            </div>

            <div className="date-input-footer">
              <button
                type="button"
                className="date-input-footer-btn"
                onClick={() => {
                  const now = new Date();
                  now.setHours(0, 0, 0, 0);
                  setView({ year: now.getFullYear(), month: now.getMonth() });
                  selectDay(now);
                }}
              >
                Oggi
              </button>
              {!required && (
                <button
                  type="button"
                  className="date-input-footer-btn"
                  onClick={() => {
                    onChange('');
                    setOpen(false);
                  }}
                >
                  Cancella
                </button>
              )}
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
