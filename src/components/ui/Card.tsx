import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../../lib/cn';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-line bg-paper shadow-[0_2px_8px_-2px_rgba(26,24,30,0.06)]',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  subtitle,
  action,
  className,
}: {
  title: string;
  subtitle?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex items-center justify-between gap-4 rounded-t-xl border-b border-line bg-paper px-4 py-3.5 sm:px-5',
        className,
      )}
    >
      <div className="space-y-0.5">
        <h2 className="text-sm font-bold tracking-tight text-ink">{title}</h2>
        {subtitle && <div className="text-xs font-medium text-muted">{subtitle}</div>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function CardBody({ children, className, ...props }: CardProps) {
  return (
    <div className={cn('p-4 sm:p-5', className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-between rounded-b-xl border-t border-line bg-card-inset px-4 py-3 sm:px-5',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
