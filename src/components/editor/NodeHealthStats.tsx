import { useEffect, useState } from "react";
import { Area, AreaChart, ResponsiveContainer } from "recharts";

function generateData(count: number) {
  return Array.from({ length: count }, () => ({
    value: Math.random() * 80 + 20,
  }));
}

function Sparkline({ color, label }: { color: string; label: string }) {
  const [data, setData] = useState(generateData(20));

  useEffect(() => {
    const interval = setInterval(() => {
      setData((prev) => [...prev.slice(1), { value: Math.random() * 80 + 20 }]);
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">{label}</span>
        <span className="text-xs font-mono" style={{ color }}>
          {data[data.length - 1].value.toFixed(0)}%
        </span>
      </div>
      <div className="h-10">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id={`grad-${label}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.3} />
                <stop offset="100%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={1.5}
              fill={`url(#grad-${label})`}
              dot={false}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function NodeHealthStats() {
  return (
    <div className="glass-card p-4 space-y-3">
      <h3 className="text-xs font-mono tracking-widest uppercase text-muted-foreground">Node Health</h3>
      <Sparkline color="hsl(190, 95%, 50%)" label="Farm CPU Load" />
      <Sparkline color="hsl(145, 80%, 45%)" label="Network I/O" />
    </div>
  );
}
