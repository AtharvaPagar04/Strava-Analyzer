import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { StravaActivity } from '../types';

interface ChartsProps {
  activities: StravaActivity[];
}

const Charts: React.FC<ChartsProps> = ({ activities }) => {
  // Process data: Last 7 activities distance
  const data = activities.slice(0, 7).reverse().map(act => ({
    name: new Date(act.start_date).toLocaleDateString('en-US', { weekday: 'short' }),
    distance: parseFloat((act.distance / 1000).toFixed(2)), // km
    elevation: act.total_elevation_gain
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-800 border border-slate-700 p-3 rounded-lg shadow-xl">
          <p className="text-slate-200 font-semibold mb-1">{label}</p>
          <p className="text-orange-400 text-sm">
            {payload[0].value} km
          </p>
          <p className="text-emerald-400 text-sm">
            {payload[0].payload.elevation}m elev
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <XAxis 
            dataKey="name" 
            stroke="#64748b" 
            fontSize={12} 
            tickLine={false} 
            axisLine={false}
          />
          <YAxis 
            stroke="#64748b" 
            fontSize={12} 
            tickLine={false} 
            axisLine={false}
            tickFormatter={(value) => `${value}km`}
          />
          <Tooltip content={<CustomTooltip />} cursor={{fill: '#334155', opacity: 0.4}} />
          <Bar dataKey="distance" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill="#f97316" />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default Charts;
