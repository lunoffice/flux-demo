import { useEsercizio } from '../../context/EsercizioContext';

export function SidebarEsercizio() {
  const { esercizioUcs, setEsercizioUcs, anniUcs } = useEsercizio();

  return (
    <div className="p-3 border-t border-[#1F2128]">
      <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#5A5F6D] mb-1.5">
        Fiscal Year
      </label>
      <select
        value={esercizioUcs}
        onChange={(e) => setEsercizioUcs(Number(e.target.value))}
        className="w-full bg-[#16171B] border border-[#22242B] text-white text-xs rounded-md px-2.5 py-1.5 focus:outline-none focus:border-[var(--brand-yellow)]"
      >
        {anniUcs.map((anno) => (
          <option key={anno} value={anno}>
            FY {anno}
          </option>
        ))}
      </select>
    </div>
  );
}
