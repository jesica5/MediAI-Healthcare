'use client';

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { AcuityCategory } from '@/shared/types/triage';
import { ACUITY_CONFIGS } from '@/shared/constants/doctorAcuity';

interface AcuityPieChartProps {
  data: {
    category: AcuityCategory;
    count: number;
    percentage: number;
  }[];
}

export function AcuityPieChart({ data }: AcuityPieChartProps) {
  const chartData = data.map(item => ({
    name: ACUITY_CONFIGS[item.category]?.label || item.category,
    value: item.count,
    color: ACUITY_CONFIGS[item.category]?.colorHex || '#64748b',
  }));

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={80}
            paddingAngle={4}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} stroke="#ffffff" strokeWidth={2} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', border: 'none', color: '#fff', fontSize: '12px' }}
            formatter={(val: number) => [`${val} Patients`, 'Volume']}
          />
          <Legend wrapperStyle={{ fontSize: '12px' }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
