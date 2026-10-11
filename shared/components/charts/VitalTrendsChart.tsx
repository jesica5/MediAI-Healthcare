'use client';

import React, { useState } from 'react';
import { VitalSigns } from '@/shared/types/triage';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface VitalTrendsChartProps {
  history: VitalSigns[];
}

export function VitalTrendsChart({ history }: VitalTrendsChartProps) {
  const [selectedVital, setSelectedVital] = useState<'heart_rate' | 'systolic_bp' | 'oxygen_saturation' | 'respiratory_rate'>('heart_rate');

  if (!history || history.length === 0) {
    return (
      <div className="py-8 text-center text-xs text-slate-500 bg-slate-50 rounded-xl border border-slate-200">
        No historical vital signs trends recorded for this patient.
      </div>
    );
  }

  const chartData = history.map(item => ({
    time: new Date(item.recorded_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    heart_rate: item.heart_rate,
    systolic_bp: item.systolic_bp,
    oxygen_saturation: item.oxygen_saturation,
    respiratory_rate: item.respiratory_rate,
  }));

  const vitalConfigs = {
    heart_rate: { name: 'Heart Rate', unit: 'bpm', color: '#E53E3E', min: 40, max: 160 },
    systolic_bp: { name: 'Systolic BP', unit: 'mmHg', color: '#0284C7', min: 70, max: 200 },
    oxygen_saturation: { name: 'SpO2', unit: '%', color: '#0F766E', min: 80, max: 100 },
    respiratory_rate: { name: 'Respiratory Rate', unit: 'bpm', color: '#ED8936', min: 10, max: 40 },
  };

  const currentConfig = vitalConfigs[selectedVital];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <h4 className="text-xs font-semibold text-slate-700">Select Parameter Trajectory:</h4>
        <div className="flex items-center gap-1.5">
          {(Object.keys(vitalConfigs) as Array<keyof typeof vitalConfigs>).map(key => (
            <button
              key={key}
              onClick={() => setSelectedVital(key)}
              className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors ${
                selectedVital === key
                  ? 'bg-slate-900 text-white font-semibold shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {vitalConfigs[key].name}
            </button>
          ))}
        </div>
      </div>

      <div className="h-64 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="time" stroke="#94a3b8" fontSize={11} tickLine={false} />
            <YAxis stroke="#94a3b8" fontSize={11} domain={[currentConfig.min, currentConfig.max]} tickLine={false} />
            <Tooltip
              contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', border: 'none', color: '#fff', fontSize: '12px' }}
              itemStyle={{ color: '#fff' }}
              formatter={(val: number) => [`${val} ${currentConfig.unit}`, currentConfig.name]}
            />
            <Legend wrapperStyle={{ fontSize: '12px' }} />
            <Line
              type="monotone"
              dataKey={selectedVital}
              name={`${currentConfig.name} (${currentConfig.unit})`}
              stroke={currentConfig.color}
              strokeWidth={3}
              dot={{ r: 5, fill: currentConfig.color, strokeWidth: 2, stroke: '#fff' }}
              activeDot={{ r: 7 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
