import { useMemo, useState } from 'react';
import { Calendar, Search, Check } from 'lucide-react';
import { Modal } from './Modal';
import { Input } from './Input';
import { cn } from '../../lib/cn';

export function EsercizioModal({
  title = 'Annualità',
  years,
  selected,
  onSelect,
  onClose,
}: {
  title?: string;
  years: number[];
  selected: number;
  onSelect: (year: number) => void;
  onClose: () => void;
}) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim();
    if (!q) return years;
    return years.filter((y) => String(y).includes(q));
  }, [years, query]);

  return (
    <Modal
      title={title}
      onClose={onClose}
      icon={<Calendar className="h-5 w-5 text-[var(--modal-text)]" />}
    >
      <div className="modal-panel space-y-4">
        <Input
          type="text"
          label="Cerca annualità"
          labelIcon={<Search className="h-3.5 w-3.5" aria-hidden="true" />}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Es. 2024"
          autoFocus
        />

        <div className="quadro-sections-divider" aria-hidden="true" />

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-60 overflow-y-auto">
          {filtered.length === 0 ? (
            <p className="col-span-full py-6 text-center text-xs font-medium text-[var(--modal-muted)]">
              Nessun anno trovato.
            </p>
          ) : (
            filtered.map((y) => {
              const isSelected = y === selected;
              return (
                <button
                  key={y}
                  type="button"
                  onClick={() => {
                    onSelect(y);
                    onClose();
                  }}
                  className={cn(
                    'group relative flex items-center justify-between rounded-[var(--radius-lg)] border p-3 text-sm font-bold cursor-pointer',
                    isSelected
                      ? 'border-[var(--charcoal)] bg-[var(--charcoal)] text-white'
                      : 'border-[var(--line)] bg-paper text-[var(--modal-text)]',
                  )}
                >
                  <span>{y}</span>
                  {isSelected && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-[var(--radius)] bg-[var(--brand-yellow)] text-[var(--charcoal)]">
                      <Check className="h-3 w-3" strokeWidth={3} />
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>
    </Modal>
  );
}
