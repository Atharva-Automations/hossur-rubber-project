'use client';

import {
  PieChart as RePieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from 'recharts';

const COLORS = ['#22c55e', '#ef4444'];

interface PieChartProps {
  data: { label: string; value: number }[];
}

export default function PieChart({ data }: PieChartProps) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <RePieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="label"
          innerRadius={70}
          outerRadius={100}
          paddingAngle={4}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
      </RePieChart>
    </ResponsiveContainer>
  );
}
