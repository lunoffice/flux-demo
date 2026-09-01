import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '../../lib/cn';

export interface PageHeaderProps {
  title: string;
  /** Badge opzionale accanto al titolo (conteggio, anno, ecc.) */
  badge?: ReactNode;
  /** Contenuto a destra: azioni, metriche compatte, tab anno */
  actions?: ReactNode;
  className?: string;
  /** Variante chiara (Office UI). Default: eredita dallo shell (scuro sulle pagine non migrate). */
  tone?: 'inherit' | 'light';
}

/** Header pagina — titolo a sinistra, azioni a destra. */
export function PageHeader({
  title,
  badge,
  actions,
  className,
  tone = 'inherit',
}: PageHeaderProps) {
  const isLight = tone === 'light';

  return (
    <header
      className={cn(
        isLight
          ? 'page-header is-light'
          : 'flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shrink-0',
        className,
      )}
    >
      <div className="flex min-w-0 items-center gap-2.5">
        <h1 className={cn(isLight ? 'page-header-title' : 'text-2xl font-extrabold tracking-tight truncate')}>
          {title}
        </h1>
        {badge != null && badge !== false && (
          <span className="page-header-badge shrink-0">{badge}</span>
        )}
      </div>

      {actions != null && (
        <div className="flex w-full flex-wrap items-center justify-end gap-2.5 md:w-auto md:flex-nowrap">
          {actions}
        </div>
      )}
    </header>
  );
}

/** Pulsante secondario header. */
export function PageHeaderButton({
  children,
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type="button" className={cn('btn-page-secondary', className)} {...props}>
      {children}
    </button>
  );
}

/** Pulsante primario header (giallo brand). */
export function PageHeaderButtonPrimary({
  children,
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type="button" className={cn('btn-page-primary', className)} {...props}>
      {children}
    </button>
  );
}

/** Link stilizzato come pulsante secondario. */
export const pageHeaderLinkSecondary = 'btn-page-secondary';

/** Link stilizzato come pulsante primario (giallo brand). */
export const pageHeaderLinkPrimary = 'btn-page-primary';
