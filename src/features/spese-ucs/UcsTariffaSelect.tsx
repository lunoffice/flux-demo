import { Select } from '../../components/ui/Select';
import type { SelectOption } from '../../components/ui/Select';

function roundTariffa(value: number) {
  return Math.round(value * 100) / 100;
}

export function UcsTariffaSelect({
  value,
  onChange,
  options,
  'aria-label': ariaLabel,
}: {
  value: number;
  onChange: (valore: number) => void;
  options: SelectOption[];
  'aria-label'?: string;
}) {
  const rounded = roundTariffa(value);
  const valueKey = String(rounded);
  const hasOption = options.some((o) => o.value === valueKey);
  const mergedOptions =
    hasOption || !Number.isFinite(rounded)
      ? options
      : [
          {
            value: valueKey,
            label: `${rounded.toLocaleString('it-IT', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })} €`,
          },
          ...options,
        ];

  return (
    <Select
      className="ucs-rendiconto-tariffa-select"
      value={valueKey}
      options={mergedOptions}
      onChange={(v) => onChange(Number(v))}
      aria-label={ariaLabel ?? 'UCS'}
      placeholder="UCS…"
    />
  );
}
