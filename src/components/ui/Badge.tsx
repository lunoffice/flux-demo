import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';

export type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'primary';

export interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  icon?: ReactNode;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-paper-muted text-ink border border-line',
  primary: 'bg-charcoal text-white border border-charcoal',
  success: 'bg-sage-soft text-sage border border-sage/20',
  warning: 'bg-warning-100 text-warning-600 border border-warning-600/20',
  danger: 'bg-danger-100 text-danger-600 border border-danger-600/20',
  info: 'bg-pastel-lavender text-ink border border-line',
};

export function Badge({ children, variant = 'default', icon, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-sm border px-2 py-0.5 text-[11px] font-semibold',
        variantStyles[variant],
        className,
      )}
    >
      {icon && (
        <span className="shrink-0" aria-hidden="true">
          {icon}
        </span>
      )}
      <span>{children}</span>
    </span>
  );
}

export function statoBadgeVariant(stato?: string): BadgeVariant {
  if (stato === 'deficit') return 'danger';
  if (stato === 'bilanciato') return 'success';
  return 'info';
}
