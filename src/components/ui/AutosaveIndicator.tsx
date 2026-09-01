import { Check, Cloud, Loader2 } from 'lucide-react';

export type AutosaveStatus = 'idle' | 'pending' | 'saving' | 'saved' | 'error' | 'blocked';

export function AutosaveIndicator({ status }: { status: AutosaveStatus }) {
  if (status === 'idle') {
    return (
      <span className="stanz-autosave is-idle" aria-live="polite">
        <Cloud size={14} strokeWidth={2} aria-hidden="true" />
        Salvataggio automatico
      </span>
    );
  }
  if (status === 'pending') {
    return (
      <span className="stanz-autosave is-pending" aria-live="polite">
        <Cloud size={14} strokeWidth={2} aria-hidden="true" />
        Modifiche in sospeso…
      </span>
    );
  }
  if (status === 'saving') {
    return (
      <span className="stanz-autosave is-saving" aria-live="polite">
        <Loader2 size={14} strokeWidth={2} className="stanz-autosave-spin" aria-hidden="true" />
        Salvataggio in corso…
      </span>
    );
  }
  if (status === 'saved') {
    return (
      <span className="stanz-autosave is-saved" aria-live="polite">
        <Check size={14} strokeWidth={2.5} aria-hidden="true" />
        Modifiche salvate
      </span>
    );
  }
  if (status === 'blocked') {
    return (
      <span className="stanz-autosave is-blocked" aria-live="polite">
        <Cloud size={14} strokeWidth={2} aria-hidden="true" />
        In attesa di dati validi…
      </span>
    );
  }
  return (
    <span className="stanz-autosave is-error" aria-live="assertive">
      Errore salvataggio
    </span>
  );
}
