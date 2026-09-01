import { formatPercent, percentBarWidth, percentOf } from '../../lib/utils';

export function YearTabs({
  anni,
  selected,
  onSelect,
}: {
  anni: number[];
  selected: number | null;
  onSelect: (anno: number | null) => void;
}) {
  return (
    <div className="year-tabs">
      <button
        type="button"
        onClick={() => onSelect(null)}
        className={`year-tab ${selected === null ? 'year-tab-active' : 'year-tab-inactive'}`}
      >
        Tutti
      </button>
      {anni.map((anno) => (
        <button
          key={anno}
          type="button"
          onClick={() => onSelect(anno)}
          className={`year-tab ${selected === anno ? 'year-tab-active' : 'year-tab-inactive'}`}
        >
          {anno}
        </button>
      ))}
    </div>
  );
}

export function ProgressBar({
  label,
  impegnato,
  totale,
}: {
  label: string;
  impegnato: number;
  totale: number;
}) {
  const pct = percentOf(impegnato, totale);
  const over = totale > 0 && impegnato > totale;
  const fillClass = over ? 'over' : 'ok';

  return (
    <div className="progress-block">
      <div className="progress-header">
        <span className="progress-label">{label}</span>
        <span className={`progress-pct${over ? 'over' : ''}`}>{formatPercent(pct)}%</span>
      </div>
      <div className="progress-track">
        <div
          className={`progress-fill ${fillClass}`}
          style={{ width: `${percentBarWidth(pct)}%` }}
        />
      </div>
      <p className="progress-amount">
        {new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(impegnato)} /{''}
        {new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(totale)}
      </p>
    </div>
  );
}
