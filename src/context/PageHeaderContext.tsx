import { useLayoutEffect, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

export function PageHeaderExtras({
  metrics,
  actions,
}: {
  metrics?: ReactNode;
  actions?: ReactNode;
}) {
  const [slots, setSlots] = useState<{ metrics: HTMLElement | null; actions: HTMLElement | null }>({
    metrics: null,
    actions: null,
  });

  useLayoutEffect(() => {
    setSlots({
      metrics: document.getElementById('page-header-metrics'),
      actions: document.getElementById('page-header-actions'),
    });
  }, []);

  return (
    <>
      {slots.metrics && metrics != null ? createPortal(metrics, slots.metrics) : null}
      {slots.actions && actions != null ? createPortal(actions, slots.actions) : null}
    </>
  );
}
