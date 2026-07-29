"use client";

import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";

interface Slice {
  name: string;
  value: number;
  color: string;
}

export function DonutChart({ data, centerLabel, centerValue, size = 180 }: { data: Slice[]; centerLabel?: string; centerValue?: string; size?: number }) {
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" innerRadius="70%" outerRadius="100%" paddingAngle={2} stroke="none">
            {data.map((slice) => (
              <Cell key={slice.name} fill={slice.color} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      {(centerLabel || centerValue) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {centerLabel && <span className="text-xs text-slate-400">{centerLabel}</span>}
          {centerValue && <span className="text-lg font-semibold text-slate-900">{centerValue}</span>}
        </div>
      )}
    </div>
  );
}

export function DonutLegend({ data }: { data: Slice[] }) {
  return (
    <ul className="space-y-2.5">
      {data.map((slice) => (
        <li key={slice.name} className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-2 text-slate-600">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: slice.color }} />
            {slice.name}
          </span>
          <span className="font-medium text-slate-900">%{slice.value}</span>
        </li>
      ))}
    </ul>
  );
}
