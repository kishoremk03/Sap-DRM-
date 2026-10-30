import React, { useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from 'recharts';
import { Calendar, TrendingUp, ShieldAlert } from 'lucide-react';
import { Transaction } from '../types';

interface WeeklyFinancialOverviewProps {
  transactions: Transaction[];
  isDark: boolean;
}

interface DayData {
  dayKey: string;
  shortLabel: string;
  fullDate: string;
  amount: number;
  count: number;
  isToday: boolean;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: DayData }>;
  isDark: boolean;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, isDark }) => {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0].payload;

  return (
    <div
      className={`p-3 rounded-2xl border shadow-xl backdrop-blur-md text-xs font-sans min-w-[160px] ${
        isDark
          ? 'bg-slate-900/95 border-emerald-500/30 text-white'
          : 'bg-white/95 border-slate-200 text-slate-900 shadow-slate-200/50'
      }`}
    >
      <div className="flex items-center justify-between gap-2 mb-1.5 pb-1 border-b border-slate-700/50">
        <span className="font-semibold text-slate-400">{data.fullDate}</span>
        {data.isToday && (
          <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
            TODAY
          </span>
        )}
      </div>

      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-slate-400">Total Detected:</span>
          <span className="font-mono font-bold text-emerald-400 text-sm">
            ₹{data.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-slate-400">Transactions:</span>
          <span className="font-semibold">{data.count}</span>
        </div>
        {data.count > 0 && (
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Average:</span>
            <span className="font-mono text-cyan-400 font-medium">
              ₹{(data.amount / data.count).toFixed(0)}
            </span>
          </div>
        )}
      </div>

      <div className="mt-2 pt-1 border-t border-slate-800 text-[9px] text-amber-400 flex items-center gap-1">
        <ShieldAlert className="w-2.5 h-2.5 shrink-0" />
        <span>Detected — Not Bank Verified</span>
      </div>
    </div>
  );
};

export const WeeklyFinancialOverview: React.FC<WeeklyFinancialOverviewProps> = ({
  transactions,
  isDark,
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Compute 7 days bucketed data (oldest to newest: 6 days ago -> today)
  const chartData = useMemo<DayData[]>(() => {
    const days: DayData[] = [];
    const now = new Date();

    // Iterate 6 days ago to today
    for (let i = 6; i >= 0; i--) {
      const targetDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const startOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate()).getTime();
      const endOfDay = startOfDay + 24 * 60 * 60 * 1000 - 1;

      const dayTxns = transactions.filter((t) => t.timestamp >= startOfDay && t.timestamp <= endOfDay);
      const amount = dayTxns.reduce((sum, t) => sum + t.amount, 0);

      const dayName = i === 0 ? 'Today' : i === 1 ? 'Yest' : targetDate.toLocaleDateString('en-US', { weekday: 'short' });
      const dayNum = targetDate.getDate();

      days.push({
        dayKey: `${targetDate.getFullYear()}-${targetDate.getMonth() + 1}-${dayNum}`,
        shortLabel: `${dayName} ${dayNum}`,
        fullDate: targetDate.toLocaleDateString('en-IN', {
          weekday: 'short',
          day: 'numeric',
          month: 'short',
        }),
        amount,
        count: dayTxns.length,
        isToday: i === 0,
      });
    }

    return days;
  }, [transactions]);

  // Aggregate stats
  const { total7Days, totalCount7Days, dailyAverage, peakDay } = useMemo(() => {
    let sum = 0;
    let count = 0;
    let peak = chartData[0];

    for (const d of chartData) {
      sum += d.amount;
      count += d.count;
      if (d.amount > (peak?.amount || 0)) {
        peak = d;
      }
    }

    return {
      total7Days: sum,
      totalCount7Days: count,
      dailyAverage: sum / 7,
      peakDay: peak,
    };
  }, [chartData]);

  return (
    <div
      className={`p-5 sm:p-6 rounded-3xl border transition-all ${
        isDark
          ? 'bg-slate-900/90 border-slate-800'
          : 'bg-white border-slate-200 shadow-sm'
      }`}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">7-Day Financial Overview</h3>
              <p className="text-xs text-slate-400">Detected payment trends across the last 7 days</p>
            </div>
          </div>
        </div>

        {/* 7-Day KPI Badges */}
        <div className="flex items-center gap-4 text-right">
          <div className="border-r border-slate-700/50 pr-4 hidden sm:block">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">7-Day Volume</span>
            <span className="font-mono font-bold text-emerald-400 text-sm">
              ₹{total7Days.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </span>
          </div>

          <div className="hidden sm:block">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Daily Avg</span>
            <span className="font-mono font-bold text-cyan-400 text-sm">
              ₹{dailyAverage.toFixed(0)}
            </span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800/60 border border-slate-700/80 text-xs">
            <Calendar className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-slate-300 font-medium">{totalCount7Days} Payments</span>
          </div>
        </div>
      </div>

      {/* Main Bar Chart Container */}
      <div className="h-64 sm:h-72 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%" minWidth={280} minHeight={240}>
          <BarChart
            data={chartData}
            margin={{ top: 12, right: 10, left: -15, bottom: 4 }}
            onMouseMove={(state) => {
              if (state && state.activeTooltipIndex !== undefined && state.activeTooltipIndex !== null) {
                const idx = typeof state.activeTooltipIndex === 'number'
                  ? state.activeTooltipIndex
                  : parseInt(String(state.activeTooltipIndex), 10);
                if (!isNaN(idx)) {
                  setHoveredIndex(idx);
                }
              }
            }}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <defs>
              {/* Gradient for regular bars */}
              <linearGradient id="barGradientRegular" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10B981" stopOpacity={0.85} />
                <stop offset="100%" stopColor="#059669" stopOpacity={0.35} />
              </linearGradient>
              {/* Gradient for Today / Active bar */}
              <linearGradient id="barGradientToday" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#00E599" stopOpacity={1} />
                <stop offset="100%" stopColor="#00F2FE" stopOpacity={0.65} />
              </linearGradient>
              {/* Subtle hover gradient */}
              <linearGradient id="barGradientHover" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#34D399" stopOpacity={1} />
                <stop offset="100%" stopColor="#059669" stopOpacity={0.6} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke={isDark ? 'rgba(51, 65, 85, 0.4)' : 'rgba(226, 232, 240, 0.8)'}
            />

            <XAxis
              dataKey="shortLabel"
              tickLine={false}
              axisLine={{ stroke: isDark ? '#334155' : '#cbd5e1' }}
              tick={{
                fill: isDark ? '#94a3b8' : '#64748b',
                fontSize: 11,
                fontFamily: 'inherit',
              }}
            />

            <YAxis
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => (value >= 1000 ? `₹${(value / 1000).toFixed(1)}k` : `₹${value}`)}
              tick={{
                fill: isDark ? '#94a3b8' : '#64748b',
                fontSize: 10,
                fontFamily: 'JetBrains Mono, monospace',
              }}
            />

            <Tooltip
              content={<CustomTooltip isDark={isDark} />}
              cursor={{ fill: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.03)' }}
            />

            <Bar
              dataKey="amount"
              radius={[8, 8, 2, 2]}
              maxBarSize={44}
              animationDuration={700}
            >
              {chartData.map((entry, index) => {
                const isHovered = hoveredIndex === index;
                let fillUrl = 'url(#barGradientRegular)';
                if (entry.isToday) {
                  fillUrl = 'url(#barGradientToday)';
                } else if (isHovered) {
                  fillUrl = 'url(#barGradientHover)';
                }

                return (
                  <Cell
                    key={`cell-${index}`}
                    fill={fillUrl}
                    stroke={entry.isToday ? '#00E599' : isHovered ? '#34D399' : 'transparent'}
                    strokeWidth={entry.isToday ? 1.5 : isHovered ? 1 : 0}
                  />
                );
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Footer details strip */}
      <div className="mt-4 pt-3 border-t border-slate-700/40 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400" />
            <span>Today</span>
          </span>
          <span className="flex items-center gap-1.5 ml-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/70" />
            <span>Previous 6 Days</span>
          </span>
        </div>

        {peakDay && peakDay.amount > 0 && (
          <div className="text-[11px]">
            Peak day was <strong className="text-white">{peakDay.fullDate}</strong> with{' '}
            <span className="text-emerald-400 font-mono font-semibold">₹{peakDay.amount.toLocaleString('en-IN')}</span>
          </div>
        )}
      </div>
    </div>
  );
};
