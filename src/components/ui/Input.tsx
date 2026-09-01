import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';
import { cn } from '../../lib/cn';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  labelIcon?: ReactNode;
  labelRight?: ReactNode;
  error?: string;
  helperText?: ReactNode;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    { className, label, labelIcon, labelRight, error, helperText, leftIcon, rightIcon, id, disabled, ...props },
    ref,
  ) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
    const errorId = error && inputId ? `${inputId}-error` : undefined;
    const helperId = helperText && inputId ? `${inputId}-helper` : undefined;
    const describedBy = [errorId, helperId].filter(Boolean).join(' ') || undefined;
    const showMeta = Boolean(error || helperText);

    return (
      <div className="ui-field-wrap">
        {label && (
          <div className="ui-field-label-row">
            <label htmlFor={inputId} className="ui-field-label">
              {labelIcon}
              <span>{label}</span>
              {props.required && (
                <span className="ui-field-required" aria-hidden="true">
                  *
                </span>
              )}
            </label>
            {labelRight}
          </div>
        )}

        <div className="ui-field-control">
          {leftIcon && <div className="ui-field-affix is-left">{leftIcon}</div>}
          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            aria-invalid={Boolean(error)}
            aria-describedby={describedBy}
            className={cn(
              'ui-field',
              leftIcon && 'has-left',
              rightIcon && 'has-right',
              error && 'is-error',
              className,
            )}
            {...props}
          />
          {rightIcon && <div className="ui-field-affix is-right">{rightIcon}</div>}
        </div>

        <div className={cn('ui-field-meta', !showMeta && 'is-empty')}>
          {error ? (
            <p id={errorId} className="ui-field-error" role="alert">
              {error}
            </p>
          ) : helperText ? (
            <div id={helperId} className="ui-field-helper">
              {helperText}
            </div>
          ) : null}
        </div>
      </div>
    );
  },
);

Input.displayName = 'Input';

export { Select } from './Select';
export type { SelectOption } from './Select';

export function Label({
  children,
  className,
  htmlFor,
}: {
  children: ReactNode;
  className?: string;
  htmlFor?: string;
}) {
  return (
    <label htmlFor={htmlFor} className={cn('ui-field-label', className)}>
      {children}
    </label>
  );
}

export function FieldLabel({ children, required }: { children: ReactNode; required?: boolean }) {
  return (
    <span className="ui-field-label">
      {children}
      {required && (
        <span className="ui-field-required" aria-hidden="true">
          *
        </span>
      )}
    </span>
  );
}
