import React, { useMemo } from 'react';
import {
  ResponsiveContainer, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip,
} from 'recharts';
import { useStock } from '../context/StockContext';

function generateHistory(currentValue) {
  const months = ["Jun '23", "Aug '23", "Oct '23", "Dec '23", "Feb '24", "Apr '24", "Jun '24"];
  const start = currentValue * 0.72;
  return months.map((m, i) => {
    const t = i / (months.length - 1);
    const trend = start + (currentValue - start) * t;
    const noise = (Math.random() - 0.5) * currentValue * 0.04;
    return { month: m, value: Math.round(trend + noise) };
  });
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs shadow-lg">
        <p className="text-gray-500 mb-0.5">{label}</p>
        <p className="font-semibold text-gray-800">
          {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(payload[0].value)}
        </p>
      </div>
    );
  }
  return null;
};

export default function PortfolioChart() {
  const { totalPortfolioValue, totalGainLoss } = useStock();
  const data = useMemo(() => generateHistory(totalPortfolioValue), [totalPortfolioValue]);

  const fmtAxis = (v) =>
    new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(v);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <p className="text-sm font-semibold text-gray-700 mb-4">Total Gain/Loss</p>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="purpleGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#7C3AED" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" vertical={false} />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 11, fill: '#94a3b8' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tickFormatter={fmtAxis}
            tick={{ fontSize: 11, fill: '#94a3b8' }}
            axisLine={false}
            tickLine={false}
            width={55}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#7C3AED"
            strokeWidth={2.5}
            fill="url(#purpleGrad)"
            dot={false}
            activeDot={{ r: 4, fill: '#7C3AED', strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
