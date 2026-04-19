import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { useStock } from '../context/StockContext';

const COLORS = [
  '#3b82f6', '#f59e0b', '#f97316', '#7c3aed',
  '#10b981', '#ef4444', '#06b6d4', '#ec4899',
];

const renderLabel = ({ cx, cy, midAngle, outerRadius, percent }) => {
  if (percent < 0.05) return null;
  const RADIAN = Math.PI / 180;
  const r = outerRadius * 0.65;
  const x = cx + r * Math.cos(-midAngle * RADIAN);
  const y = cy + r * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="#fff" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight="600">
      {(percent * 100).toFixed(0)}%
    </text>
  );
};

const CustomTooltip = ({ active, payload }) => {
  if (active && payload?.length) {
    const { sector, count } = payload[0].payload;
    return (
      <div className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs shadow-lg">
        <p className="font-semibold text-gray-800">{sector}</p>
        <p className="text-gray-500">{count} stocks</p>
      </div>
    );
  }
  return null;
};

export default function SectorChart() {
  const { sectors } = useStock();
  if (!sectors.length) return null;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <p className="text-sm font-semibold text-gray-700 mb-4">Sector Wise Distribution</p>
      <ResponsiveContainer width="100%" height={180}>
        <PieChart>
          <Pie
            data={sectors}
            dataKey="count"
            nameKey="sector"
            cx="50%"
            cy="50%"
            outerRadius={80}
            labelLine={false}
            label={renderLabel}
          >
            {sectors.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} strokeWidth={0} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      <div className="flex flex-wrap gap-x-3 gap-y-1.5 mt-3">
        {sectors.map((s, i) => (
          <div key={s.sector} className="flex items-center gap-1.5 text-xs">
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
            <span className="text-gray-600">{s.sector}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
