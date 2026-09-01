import { useEffect, useState, type ReactNode } from 'react';
import { formatEuroAmount, parseEuroAmount } from '../../lib/utils';
import { Input } from './Input';
import { cn } from '../../lib/cn';

export interface EuroInputProps {
  value: number;
  onCommit: (importo: number) => void;
  className?: string;
  label?: string;
  labelIcon?: ReactNode;
  error?: string;
  placeholder?: string;
  'aria-label'?: string;
  disabled?: boolean;
}

export function EuroInput({
  value,
  onCommit,
  className,
  label,
  labelIcon,
  error,
  placeholder,
  'aria-label': ariaLabel = 'Importo in euro',
  disabled,
}: EuroInputProps) {
  const [focused, setFocused] = useState(false);
  const [draft, setDraft] = useState(formatEuroAmount(value));

  useEffect(() => {
    if (!focused) setDraft(formatEuroAmount(value));
  }, [value, focused]);

  return (
    <Input
      type="text"
      inputMode="decimal"
      label={label}
      labelIcon={labelIcon}
      error={error}
      disabled={disabled}
      placeholder={placeholder ?? '0,00'}
      value={focused ? draft : value === 0 ? '' : formatEuroAmount(value)}
      onFocus={(e) => {
        setFocused(true);
        const nextDraft = value === 0 ? '' : formatEuroAmount(value);
        setDraft(nextDraft);
        requestAnimationFrame(() => {
          if (nextDraft) {
            e.currentTarget.setSelectionRange(0, e.currentTarget.value.length);
          }
        });
      }}
      onChange={(e) => {
        setDraft(e.target.value);
      }}
      onBlur={() => {
        setFocused(false);
        onCommit(parseEuroAmount(draft));
      }}
      aria-label={ariaLabel}
      leftIcon={<span className="ui-field-euro">€</span>}
      className={cn('font-mono tabular-nums text-right font-bold', className)}
    />
  );
}
