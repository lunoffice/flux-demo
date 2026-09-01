import { NavLink, useLocation } from 'react-router-dom';
import {
  Coins,
  Database,
  FileChartColumn,
  HeartHandshake,
  LayoutGrid,
  Users,
  UsersRound,
} from 'lucide-react';
import { useEsercizio } from '../../context/EsercizioContext';
import { cn } from '../../lib/cn';

interface SidebarProps {
  onBackup?: () => void;
}

export function Sidebar({ onBackup }: SidebarProps) {
  const { anniFondo, numOperatoriUniciUcs } = useEsercizio();
  const { pathname } = useLocation();

  const isFondoActive = pathname.startsWith('/fondo');
  const isUcsActive = pathname.startsWith('/ucs');
  const numAnniFondo = anniFondo.length;

  return (
    <aside className="sidebar relative z-30 flex h-full shrink-0 select-none flex-col overflow-hidden border-r border-[#1F2128] bg-[var(--sidebar-bg)] text-[#8E94A0] w-[var(--sidebar-width)]">
      {/* Brand */}
      <div className="app-drag-region relative flex h-[96px] shrink-0 items-end justify-between border-b border-[#1F2128]/50 px-4 pb-3.5 pt-9">
        <div className="app-no-drag flex min-w-0 items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-xl)] bg-[var(--brand-yellow)] font-extrabold text-[var(--charcoal)] shadow-md shadow-[#FFCA18]/10">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M12 2.75c.66 4.72 4.16 8.22 8.88 8.88a.38.38 0 0 1 0 .74c-4.72.66-8.22 4.16-8.88 8.88a.38.38 0 0 1-.74 0c-.66-4.72-4.16-8.22-8.88-8.88a.38.38 0 0 1 0-.74c4.72-.66 8.22-4.16 8.88-8.88a.38.38 0 0 1 .74 0Z"
                fill="currentColor"
              />
            </svg>
          </div>
          <div className="min-w-0 leading-tight">
            <div className="flex items-baseline gap-2.5">
              <span className="text-[17px] font-bold tracking-tight text-white">Flux</span>
              <span className="text-[10.5px] font-medium text-[#8E94A0]">Demo</span>
            </div>
            <span className="block truncate text-[11px] font-medium text-[#6C727F]">
              Grants & UCS Staff Costs
            </span>
          </div>
        </div>
      </div>

      <nav className="flex flex-1 flex-col overflow-y-auto px-3 pb-4 pt-6 scrollbar-thin">
        <div>
          <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-[#5A5F6D]">
            Main Menu
          </p>
          <div className="space-y-1">
            <NavLink
              to="/dashboard"
              end
              className={({ isActive }) =>
                cn(
                  'group relative flex items-center justify-between rounded-[var(--radius-xl)] px-3 py-2.5 text-[13.5px] font-medium',
                  isActive
                    ? 'bg-[var(--charcoal-elevated)] font-semibold text-white'
                    : 'text-[#8E94A0] hover:bg-[#191A1F] hover:text-[#D1D5DB]',
                )
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span className="absolute bottom-2 left-0 top-2 w-[3.5px] rounded-r-[var(--radius)] bg-[var(--brand-yellow)]" />
                  )}
                  <div className="flex items-center gap-3">
                    <LayoutGrid
                      className={cn(
                        'h-[18px] w-[18px]',
                        isActive ? 'text-[var(--brand-yellow)]' : 'text-[#8E94A0] group-hover:text-white',
                      )}
                      strokeWidth={1.8}
                    />
                    <span>Dashboard</span>
                  </div>
                </>
              )}
            </NavLink>

            <div>
              <div
                className={cn(
                  'flex w-full items-center justify-between rounded-[var(--radius-xl)] px-3 py-2.5 text-[13.5px] font-medium',
                  isFondoActive ? 'font-semibold text-[var(--brand-yellow)]' : 'text-[#8E94A0]',
                )}
              >
                <div className="flex items-center gap-3">
                  <HeartHandshake
                    className={cn(
                      'h-[18px] w-[18px]',
                      isFondoActive ? 'text-[var(--brand-yellow)]' : 'text-[#8E94A0]',
                    )}
                    strokeWidth={1.8}
                  />
                  <span>Social Grants</span>
                </div>
                {numAnniFondo > 0 && (
                  <span
                    className="rounded-[var(--radius)] bg-[var(--brand-yellow)] px-2 py-0.5 text-[10.5px] font-bold text-[var(--charcoal)]"
                    title="Active grant fiscal years"
                  >
                    {numAnniFondo}
                  </span>
                )}
              </div>

              <div className="ml-5 mt-1 space-y-0.5 border-l border-[#22242B]/60 pl-4">
                <NavLink
                  to="/fondo"
                  end
                  className={({ isActive }) =>
                    cn(
                      'group relative flex items-center justify-between rounded-[var(--radius-lg)] px-3 py-2 text-[13px] font-medium',
                      isActive ? 'font-semibold text-white' : 'text-[#8E94A0] hover:text-white',
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <span className="absolute -left-[17px] bottom-1.5 top-1.5 w-[3px] rounded-r-[var(--radius)] bg-[var(--brand-yellow)]" />
                      )}
                      <span className="flex items-center gap-2.5">
                        <Coins className="h-3.5 w-3.5 text-[#6C727F] group-hover:text-white" strokeWidth={1.8} />
                        <span>Allocations & Commitments</span>
                      </span>
                    </>
                  )}
                </NavLink>

                <NavLink
                  to="/fondo/report"
                  className={({ isActive }) =>
                    cn(
                      'group relative flex items-center justify-between rounded-[var(--radius-lg)] px-3 py-2 text-[13px] font-medium',
                      isActive ? 'font-semibold text-white' : 'text-[#8E94A0] hover:text-white',
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <span className="absolute -left-[17px] bottom-1.5 top-1.5 w-[3px] rounded-r-[var(--radius)] bg-[var(--brand-yellow)]" />
                      )}
                      <span className="flex items-center gap-2.5">
                        <FileChartColumn className="h-3.5 w-3.5 text-[#6C727F] group-hover:text-white" strokeWidth={1.8} />
                        <span>Grants Overview Report</span>
                      </span>
                    </>
                  )}
                </NavLink>
              </div>
            </div>

            <div>
              <div
                className={cn(
                  'flex w-full items-center justify-between rounded-[var(--radius-xl)] px-3 py-2.5 text-[13.5px] font-medium',
                  isUcsActive ? 'font-semibold text-[var(--brand-yellow)]' : 'text-[#8E94A0]',
                )}
              >
                <div className="flex items-center gap-3">
                  <UsersRound
                    className={cn(
                      'h-[18px] w-[18px]',
                      isUcsActive ? 'text-[var(--brand-yellow)]' : 'text-[#8E94A0]',
                    )}
                    strokeWidth={1.8}
                  />
                  <span>UCS Staff Costs</span>
                </div>
                {numOperatoriUniciUcs > 0 && (
                  <span
                    className="rounded-[var(--radius)] bg-[var(--brand-yellow)] px-2 py-0.5 text-[10.5px] font-bold text-[var(--charcoal)]"
                    title="Active roster staff"
                  >
                    {numOperatoriUniciUcs}
                  </span>
                )}
              </div>

              <div className="ml-5 mt-1 space-y-0.5 border-l border-[#22242B]/60 pl-4">
                <NavLink
                  to="/ucs"
                  end
                  className={({ isActive }) =>
                    cn(
                      'group relative flex items-center justify-between rounded-[var(--radius-lg)] px-3 py-2 text-[13px] font-medium',
                      isActive ? 'font-semibold text-white' : 'text-[#8E94A0] hover:text-white',
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <span className="absolute -left-[17px] bottom-1.5 top-1.5 w-[3px] rounded-r-[var(--radius)] bg-[var(--brand-yellow)]" />
                      )}
                      <span className="flex items-center gap-2.5">
                        <Users className="h-3.5 w-3.5 text-[#6C727F] group-hover:text-white" strokeWidth={1.8} />
                        <span>Staff Roster & Hours</span>
                      </span>
                    </>
                  )}
                </NavLink>

                <NavLink
                  to="/ucs/report"
                  className={({ isActive }) =>
                    cn(
                      'group relative flex items-center justify-between rounded-[var(--radius-lg)] px-3 py-2 text-[13px] font-medium',
                      isActive ? 'font-semibold text-white' : 'text-[#8E94A0] hover:text-white',
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <span className="absolute -left-[17px] bottom-1.5 top-1.5 w-[3px] rounded-r-[var(--radius)] bg-[var(--brand-yellow)]" />
                      )}
                      <span className="flex items-center gap-2.5">
                        <FileChartColumn className="h-3.5 w-3.5 text-[#6C727F] group-hover:text-white" strokeWidth={1.8} />
                        <span>UCS Quarterly Report</span>
                      </span>
                    </>
                  )}
                </NavLink>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-auto pb-1 pt-2">
          <button
            type="button"
            onClick={onBackup}
            className="group flex w-full items-center justify-between rounded-[var(--radius-xl)] px-3 py-2.5 text-[13.5px] font-medium text-[#8E94A0] hover:bg-[#191A1F] hover:text-white"
          >
            <div className="flex items-center gap-3">
              <Database
                className="h-[18px] w-[18px] text-[#8E94A0] group-hover:text-[var(--brand-yellow)]"
                strokeWidth={1.8}
              />
              <span>Sandbox Storage</span>
            </div>
            <span className="rounded-[var(--radius-lg)] border border-white/10 bg-white/5 px-1.5 py-0.5 text-[10px] text-[#8E94A0] group-hover:text-white">
              Local
            </span>
          </button>
        </div>
      </nav>

      <div className="shrink-0 border-t border-[#1F2128] p-3">
        <div className="flex items-center justify-between rounded-[var(--radius-xl)] bg-[var(--charcoal-elevated)] p-2.5">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-[var(--radius-xl)] bg-[var(--brand-yellow)] text-xs font-bold text-[var(--charcoal)] shadow-md shadow-[#FFCA18]/10">
              <span className="font-extrabold">FX</span>
            </div>
            <div className="min-w-0 leading-tight">
              <span className="block truncate text-[13px] font-bold text-white">Demo User</span>
              <span className="block truncate text-[11px] font-medium text-[#6C727F]">Administrator</span>
            </div>
          </div>

          <button
            type="button"
            onClick={onBackup}
            title="Sandbox Storage Settings"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--radius-lg)] text-[#6C727F] hover:bg-white/10 hover:text-white"
          >
            <Database className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
