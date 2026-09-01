import type React from 'react';

export const focusRing = 'focus:outline-none focus:ring-2 focus:ring-[var(--brand-yellow)] focus:ring-offset-1';

export function handleActionKey(
  e: React.KeyboardEvent,
  action: () => void,
) {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    action();
  }
}
