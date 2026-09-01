import { useEffect, useMemo, useState } from 'react';
import { Clock, Download } from 'lucide-react';
import type { ImpegnoSpesa, StanziamentoAnnuale } from '../../types/api';
import { Modal } from '../../components/ui/Modal';
import { ReportFormatModal } from '../../components/export/ReportFormatModal';

const MONTHS_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

export function ImpegnoDettagliModal({
  impegno,
  stanziamento: _stanziamento,
  onClose,
}: {
  impegno: ImpegnoSpesa;
  stanziamento: StanziamentoAnnuale;
  onClose: () => void;
}) {
  const [formatModalOpen, setFormatModalOpen] = useState(false);
  const [consuntivo, setConsuntivo] = useState<
    Record<string, Record<string, { ore: number }>>
  >({});

  const annoUcs = impegno.collegamentoUcs?.annoUcs;

  useEffect(() => {
    if (!window.api || !annoUcs) return;
    void window.api.operatori.listByAnno(annoUcs).then((res) => {
      if (!res.ok || !res.data) return;
      const map: Record<string, Record<string, { ore: number }>> = {};
      for (const op of res.data) {
        map[op.id] = op.consuntivoMensile as Record<string, { ore: number }>;
      }
      setConsuntivo(map);
    });
  }, [annoUcs]);

  const ops = useMemo(() => {
    const raw = impegno.collegamentoUcs?.operatori ?? [];
    return raw
      .map((o) => ({
        operatoreUcsId: o.operatoreUcsId,
        nomeCompleto: o.nomeCompleto,
        mesi: [...(o.mesi ?? [])].sort((a, b) => a - b),
      }))
      .filter((o) => o.mesi.length > 0);
  }, [impegno]);

  return (
    <>
      <Modal
        wide
        title={impegno.causale || 'Commitment Timesheet Breakdown'}
        icon={<Clock className="h-5 w-5 text-[var(--modal-text)]" />}
        onClose={onClose}
        footerEnd={
          ops.length > 0 ? (
            <button
              type="button"
              onClick={() => setFormatModalOpen(true)}
              className="modal-btn-primary"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Download Staff Statements ({ops.length})</span>
            </button>
          ) : undefined
        }
      >
        <div className="space-y-4">
          {ops.length === 0 ? (
            <div className="modal-panel py-8 text-center text-xs font-medium text-[var(--modal-muted)]">
              No staff members or months linked to this commitment.
            </div>
          ) : (
            <div className="modal-panel !p-0 overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[var(--line)] bg-[var(--paper-muted)] text-[10px] font-extrabold uppercase tracking-wider text-[var(--muted)]">
                    <th className="py-3 px-4 w-12 text-center">Export</th>
                    <th className="py-3 px-4">Staff Member</th>
                    <th className="py-3 px-4">Linked Months</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--line)] text-xs font-semibold text-[var(--modal-text)]">
                  {ops.map((o) => {
                    const sortedMesi = [...o.mesi].sort((a, b) => a - b);
                    const cons = consuntivo[o.operatoreUcsId];
                    return (
                      <tr key={o.operatoreUcsId}>
                        <td className="py-3 px-4 text-center">
                          <button
                            type="button"
                            onClick={() => setFormatModalOpen(true)}
                            title={`Generate statement for ${o.nomeCompleto}`}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-[var(--radius-lg)] text-[var(--muted)] hover:text-[var(--modal-text)] cursor-pointer"
                          >
                            <Download className="h-4 w-4" />
                          </button>
                        </td>
                        <td className="py-3 px-4">
                          <strong className="text-sm font-extrabold text-[var(--modal-text)]">
                            {o.nomeCompleto}
                          </strong>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex flex-wrap gap-1.5">
                            {sortedMesi.map((m) => {
                              const ore = Number(cons?.[String(m)]?.ore) || 0;
                              const isZero = !(ore > 0);
                              return (
                                <span
                                  key={m}
                                  className={`status-pill ${isZero ? 'is-warn' : 'is-yes'}`}
                                  title={isZero ? '0 hours logged' : `${ore} hours logged`}
                                >
                                  {MONTHS_SHORT[m - 1]}
                                </span>
                              );
                            })}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Modal>

      <ReportFormatModal
        isOpen={formatModalOpen}
        onClose={() => setFormatModalOpen(false)}
        onConfirm={() => {}}
      />
    </>
  );
}
