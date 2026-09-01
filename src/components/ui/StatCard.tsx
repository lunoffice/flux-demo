import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { Card } from './Card';
import { Badge } from './Badge';
import { cn } from '../../lib/cn';

export type StatCardAccent = 'primary' | 'success' | 'warning' | 'danger' | 'neutral';

export interface StatCardProps {
  label: string;
  value: string | number;
  sub?: ReactNode;
  icon?: LucideIcon;
  accent?: StatCardAccent;
  badgeText?: string;
  badgeVariant?: 'success' | 'warning' | 'danger' | 'info' | 'primary';
  className?: string;
  pastel?: 'peach' | 'lavender' | 'mint';
}

const accentIconColors: Record<StatCardAccent, string> = {
  primary: 'text-charcoal',
  success: 'text-sage',
  warning: 'text-warning-600',
  danger: 'text-danger-600',
  neutral: 'text-muted',
};

const pastelBg: Record<NonNullable<StatCardProps['pastel']>, string> = {
  peach: 'bg-pastel-peach',
  lavender: 'bg-pastel-lavender',
  mint: 'bg-pastel-mint',
};

export function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  accent = 'primary',
  badgeText,
  badgeVariant = 'primary',
  className,
  pastel,
}: StatCardProps) {
  return (
    <Card
      className={cn(
        'flex flex-col justify-between space-y-2 rounded-xl border border-line p-4 shadow-none',
        pastel ? pastelBg[pastel] : 'bg-paper',
        className,
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="truncate text-[11px] font-bold uppercase tracking-wider text-muted">
          {label}
        </span>
        {Icon && (
          <Icon className={cn('h-5 w-5 shrink-0', accentIconColors[accent])} aria-hidden="true" />
        )}
      </div>

      <div className="overflow-hidden text-ellipsis whitespace-nowrap font-mono text-xl font-bold tabular-nums tracking-tight text-ink sm:text-2xl">
        {value}
      </div>

      <div className="flex items-center justify-between gap-2 border-t border-line/80 pt-2 text-xs text-muted">
        <span className="truncate">{sub}</span>
        {badgeText && (
          <Badge
            variant={badgeVariant}
            className="shrink-0 rounded-sm px-1.5 py-0.5 text-[10px] font-medium"
          >
            {badgeText}
          </Badge>
        )}
      </div>
    </Card>
  );
}
