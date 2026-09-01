import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { formatCurrency } from '../../lib/utils';

const TRIM_LABELS = ['I trim.', 'II trim.', 'III trim.', 'IV trim.'];

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number; name: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="report-chart-tooltip">
      {label && <p className="report-chart-tooltip-label">{label}</p>}
      {payload.map((p) => (
        <p key={p.name} className="report-chart-tooltip-value">
          {formatCurrency(p.value)}
        </p>
      ))}
    </div>
  );
}

export function UcsCharts({
  trimestri,
  anno,
}: {
  trimestri: [number, number, number, number];
  anno: number;
}) {
  const data = trimestri.map((v, i) => ({ trimestre: TRIM_LABELS[i], importo: v }));
  const totale = trimestri.reduce((a, b) => a + b, 0);
  const maxVal = Math.max(...trimestri, 1);

  return (
    <section className="report-chart-panel">
      <header className="report-chart-head">
        <div>
          <div className="report-chart-title">Andamento trimestrale</div>
          <div className="report-chart-meta">
            Costi UCS {anno} · {formatCurrency(totale)}
          </div>
        </div>
      </header>
      <div className="report-chart-body">
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" vertical={false} />
            <XAxis
              dataKey="trimestre"
              tick={{ fontSize: 11, fill: 'var(--muted)' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              domain={[0, maxVal]}
              tick={{ fontSize: 10, fill: 'var(--muted)' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => (maxVal < 1000 ? `${v}` : `${(v / 1000).toFixed(0)}k`)}
            />
            <Tooltip content={<ChartTooltip />} isAnimationActive={false} />
            <Bar
              dataKey="importo"
              name="Costo"
              fill="var(--charcoal)"
              radius={[4, 4, 0, 0]}
              isAnimationActive={false}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
