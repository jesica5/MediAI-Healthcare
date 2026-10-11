'use client';

import React from 'react';
import { ExplainabilityPayload } from '@/shared/types/triage';

interface ExplainabilityChartProps {
  payload: ExplainabilityPayload;
}

export function ExplainabilityChart({ payload }: ExplainabilityChartProps) {
  const drivers = payload?.top_risk_drivers || [];

  if (drivers.length === 0) {
    return <div className="text-xs text-slate-500 py-4 text-center">No TreeSHAP attribution data returned.</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-xs text-slate-500 font-medium pb-1 border-b border-slate-100">
        <span>Attribution Feature</span>
        <span>Risk Contribution Score (% SHAP)</span>
      </div>
      <div className="space-y-3">
        {drivers.map((driver, i) => {
          const isPositive = driver.direction === 'positive' || driver.contribution_percent > 0;
          const percent = Math.abs(driver.contribution_percent);

          return (
            <div key={i} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-800">{driver.feature}</span>
                <span className={`font-mono font-bold ${isPositive ? 'text-red-600' : 'text-emerald-600'}`}>
                  {isPositive ? `+${percent}%` : `-${percent}%`}
                </span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden flex">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isPositive ? 'bg-red-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.min(percent, 100)}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-500">{driver.description}</p>
            </div>
          );
        })}
      </div>
      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-400">
        <span>Model: {payload.model_version || 'MediAI-XGB-v2.1'}</span>
        <span>TreeSHAP Latency: {payload.latency_ms || 40} ms</span>
      </div>
    </div>
  );
}
