'use client';

interface BarChartProps {
  title: string;
  data: { label: string; value: number; color?: string }[];
  maxValue?: number;
}

export function BarChart({ title, data, maxValue: customMax }: BarChartProps) {
  const maxVal = customMax || Math.max(...data.map(d => d.value), 1);

  return (
    <div className="border-3 border-white bg-surface p-4">
      <div className="text-xs text-fg opacity-50 tracking-widest mb-4">{title}</div>

      {data.length === 0 ? (
        <div className="text-center py-6 text-xs opacity-30">NO DATA</div>
      ) : (
        <div className="space-y-2">
          {data.map((item, i) => {
            const width = (item.value / maxVal) * 100;
            const barColor = item.color || '#00FF41';

            return (
              <div key={i} className="flex items-center gap-3">
                <div className="w-20 text-xs text-right truncate opacity-60">
                  {item.label}
                </div>
                <div className="flex-1 h-4 bg-bg border border-white/10 relative">
                  <div
                    className="h-full transition-all duration-500"
                    style={{ width: `${width}%`, background: barColor }}
                  />
                </div>
                <div className="w-8 text-xs text-right font-bold" style={{ color: barColor }}>
                  {item.value}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  color?: string;
  large?: boolean;
}

export function StatCard({ label, value, subtitle, color = '#00FF41', large = false }: StatCardProps) {
  return (
    <div className="border-3 border-white bg-surface p-4 hover:bg-surface-hover transition-colors duration-100">
      <div className="text-xs text-fg opacity-50 tracking-widest mb-2">{label}</div>
      <div
        className={`font-extrabold tabular-nums ${large ? 'text-4xl' : 'text-2xl'}`}
        style={{ color }}
      >
        {value}
      </div>
      {subtitle && (
        <div className="text-xs opacity-40 mt-1">{subtitle}</div>
      )}
    </div>
  );
}

interface BlockProgressProps {
  label: string;
  current: number;
  total: number;
  color?: string;
}

export function BlockProgress({ label, current, total, color = '#00FF41' }: BlockProgressProps) {
  const filled = Math.round((current / Math.max(total, 1)) * 30);
  const empty = 30 - filled;
  const blocks = '\u2588'.repeat(filled) + '\u2591'.repeat(empty);

  return (
    <div className="border-3 border-white bg-surface p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="text-xs text-fg opacity-50 tracking-widest">{label}</div>
        <div className="text-xs font-bold" style={{ color }}>
          {current}/{total}
        </div>
      </div>
      <div className="progress-blocks text-sm tracking-tighter" style={{ color }}>
        [{blocks}]
      </div>
    </div>
  );
}

interface SparklineProps {
  data: number[];
  color?: string;
  width?: number;
  height?: number;
}

export function Sparkline({ data, color = '#00FF41', width = 200, height = 40 }: SparklineProps) {
  if (data.length === 0) return null;

  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;

  const points = data.map((val, i) => {
    const x = (i / Math.max(data.length - 1, 1)) * width;
    const y = height - ((val - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
      />
      {/* End dot */}
      {data.length > 0 && (
        <circle
          cx={(data.length - 1) / Math.max(data.length - 1, 1) * width}
          cy={height - ((data[data.length - 1] - min) / range) * height}
          r="3"
          fill={color}
        />
      )}
    </svg>
  );
}
