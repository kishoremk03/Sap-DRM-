import React, { useState } from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import {
  CheckCircle2, AlertTriangle, XCircle, Clock,
  FileSpreadsheet, ArrowUpRight, TrendingUp, Filter, RefreshCw
} from 'lucide-react';
import { Department, DrmIndicator, MonthlyRecord } from '../types/drm';
import { MONTHS, FINANCIAL_YEARS } from '../data/drmMasterData';

interface Props {
  records: MonthlyRecord[];
  indicators: DrmIndicator[];
  departments: Department[];
  selectedFy: string;
  selectedMonth: string;
  selectedDept: string;
  onSelectFy: (fy: string) => void;
  onSelectMonth: (month: string) => void;
  onSelectDept: (dept: string) => void;
  onRaiseCapa: (indicatorId: string, deptId: string) => void;
  onNavigateToTracking: () => void;
}

export const ExecutiveDashboard: React.FC<Props> = ({
  records,
  indicators,
  departments,
  selectedFy,
  selectedMonth,
  selectedDept,
  onSelectFy,
  onSelectMonth,
  onSelectDept,
  onRaiseCapa,
  onNavigateToTracking
}) => {
  const [selectedChartIndicatorId, setSelectedChartIndicatorId] = useState<string>('DRM-MM-03');

  // Filter records for selected Month & FY
  const monthRecords = records.filter(r => {
    const matchFy = r.financialYear === selectedFy;
    const matchMonth = r.month === selectedMonth;
    const matchDept = selectedDept === 'ALL' || r.departmentId === selectedDept;
    return matchFy && matchMonth && matchDept;
  });

  const relevantIndicators = indicators.filter(i => selectedDept === 'ALL' || i.departmentId === selectedDept);

  // 8 Dynamic KPI Calculations
  const totalIndicators = relevantIndicators.length;
  const reported = monthRecords.filter(r => r.actualValue !== null).length;
  const approved = monthRecords.filter(r => r.status === 'Approved').length;
  const pending = monthRecords.filter(r => r.status === 'Submitted' || r.status === 'Under Review').length;
  const compliant = monthRecords.filter(r => r.complianceStatus === 'Compliant').length;
  const nonCompliant = monthRecords.filter(r => r.complianceStatus === 'Non-Compliant').length;
  const actionRequired = monthRecords.filter(r => r.complianceStatus === 'Action Required').length;
  const completionPct = totalIndicators > 0 ? Math.round((reported / totalIndicators) * 100) : 0;

  // Chart 1: Monthly Reporting Completion Trend (Apr to Mar)
  const monthlyTrendData = MONTHS.map(m => {
    const recs = records.filter(r => r.financialYear === selectedFy && r.month === m && (selectedDept === 'ALL' || r.departmentId === selectedDept));
    const rep = recs.filter(r => r.actualValue !== null).length;
    const app = recs.filter(r => r.status === 'Approved').length;
    const total = totalIndicators || 1;
    return {
      month: m.slice(0, 3),
      reportedPct: Math.round((rep / total) * 100),
      approvedPct: Math.round((app / total) * 100)
    };
  });

  // Chart 2: Department-Wise Compliance %
  const deptComplianceData = departments.map(d => {
    const dRecs = records.filter(r => r.financialYear === selectedFy && r.month === selectedMonth && r.departmentId === d.id);
    const dReported = dRecs.filter(r => r.actualValue !== null);
    const dCompliant = dReported.filter(r => r.complianceStatus === 'Compliant').length;
    const rate = dReported.length > 0 ? Math.round((dCompliant / dReported.length) * 100) : 0;
    return {
      name: d.code,
      fullName: d.name,
      complianceRate: rate,
      total: dRecs.length
    };
  });

  // Chart 3: Target vs Actual for Selected Indicator across months
  const selectedIndObj = indicators.find(i => i.id === selectedChartIndicatorId) || indicators[0];
  const targetVsActualData = MONTHS.map(m => {
    const rec = records.find(r => r.financialYear === selectedFy && r.month === m && r.indicatorId === selectedIndObj.id);
    return {
      month: m.slice(0, 3),
      target: rec ? rec.targetValue : selectedIndObj.targetValue,
      actual: rec && rec.actualValue !== null ? rec.actualValue : null
    };
  });

  // Chart 4: Indicator Status Distribution
  const statusPieData = [
    { name: 'Compliant', value: compliant, color: '#0D9488' },
    { name: 'Action Required', value: actionRequired, color: '#D97706' },
    { name: 'Non-Compliant', value: nonCompliant, color: '#DC2626' },
    { name: 'Not Reported', value: Math.max(0, totalIndicators - reported), color: '#94A3B8' }
  ].filter(d => d.value > 0);

  // Chart 5: Department Operational Ranking
  const deptRankingData = [...deptComplianceData]
    .sort((a, b) => b.complianceRate - a.complianceRate);

  // Deviations requiring immediate management focus
  const deviationRecords = monthRecords.filter(r => r.complianceStatus === 'Non-Compliant' || r.complianceStatus === 'Action Required');

  return (
    <div className="space-y-6">
      {/* Top Filter and Context Ribbon */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Executive DRM Dashboard</h1>
            <span className="text-xs text-sky-600 dark:text-sky-400 font-semibold bg-sky-50 dark:bg-sky-950/60 px-2 py-0.5 rounded border border-sky-200/60 dark:border-sky-800">
              IATF 16949 Standard
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time digital monitoring matrix for automotive plant operations
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
            <span className="text-slate-400 font-medium">FY:</span>
            <select
              value={selectedFy}
              onChange={e => onSelectFy(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 font-semibold text-slate-800 dark:text-slate-200 focus:outline-hidden"
            >
              {FINANCIAL_YEARS.map(fy => (
                <option key={fy} value={fy}>{fy}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
            <span className="text-slate-400 font-medium">Month:</span>
            <select
              value={selectedMonth}
              onChange={e => onSelectMonth(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 font-semibold text-slate-800 dark:text-slate-200 focus:outline-hidden"
            >
              {MONTHS.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
            <span className="text-slate-400 font-medium">Dept:</span>
            <select
              value={selectedDept}
              onChange={e => onSelectDept(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 font-semibold text-slate-800 dark:text-slate-200 focus:outline-hidden"
            >
              <option value="ALL">All Departments (7)</option>
              {departments.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          <button
            onClick={onNavigateToTracking}
            className="px-3.5 py-1.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 rounded-lg shadow-xs flex items-center gap-1.5 transition-colors whitespace-nowrap"
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Enter Actuals</span>
          </button>
        </div>
      </div>

      {/* 8 DYNAMIC KPI CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block mb-1">Total DRM</span>
          <div className="text-2xl font-bold text-slate-900 dark:text-white tabular-nums">{totalIndicators}</div>
          <span className="text-[10px] text-slate-400">Target metrics</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block mb-1">Reported</span>
          <div className="text-2xl font-bold text-sky-600 tabular-nums">{reported}</div>
          <span className="text-[10px] text-slate-400">{completionPct}% coverage</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block mb-1">Approved</span>
          <div className="text-2xl font-bold text-teal-600 tabular-nums">{approved}</div>
          <span className="text-[10px] text-slate-400">Signed off</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block mb-1">Pending</span>
          <div className="text-2xl font-bold text-amber-500 tabular-nums">{pending}</div>
          <span className="text-[10px] text-slate-400">Under review</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block mb-1">Compliant</span>
          <div className="text-2xl font-bold text-emerald-600 tabular-nums">{compliant}</div>
          <span className="text-[10px] text-emerald-600 font-medium">Achieved target</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block mb-1">Non-Compliant</span>
          <div className="text-2xl font-bold text-rose-600 tabular-nums">{nonCompliant}</div>
          <span className="text-[10px] text-rose-600 font-medium">Off target</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block mb-1">Action Req.</span>
          <div className="text-2xl font-bold text-amber-600 tabular-nums">{actionRequired}</div>
          <span className="text-[10px] text-amber-600 font-medium">Tolerance zone</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block mb-1">Completion</span>
          <div className="text-2xl font-bold text-blue-700 dark:text-sky-400 tabular-nums">{completionPct}%</div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
            <div className="bg-blue-600 h-full transition-all duration-300" style={{ width: `${completionPct}%` }}></div>
          </div>
        </div>
      </div>

      {/* 6 CHARTS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Monthly Reporting Completion Trend (Apr to Mar) */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Chart 1: Monthly DRM Completion Velocity</h3>
              <p className="text-[11px] text-slate-500">April to March financial reporting cycle coverage</p>
            </div>
            <span className="text-xs font-mono text-slate-400">{selectedFy}</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.6} />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} unit="%" />
                <Tooltip formatter={(value) => `${value}%`} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Bar dataKey="reportedPct" name="Reported %" fill="#0284C7" radius={[4, 4, 0, 0]} />
                <Bar dataKey="approvedPct" name="Approved %" fill="#0D9488" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Department-Wise Compliance % */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Chart 2: Department Compliance Comparison</h3>
              <p className="text-[11px] text-slate-500">Target compliance rate across the 7 plant divisions</p>
            </div>
            <span className="text-xs text-teal-600 font-semibold">{selectedMonth}</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptComplianceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.6} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} unit="%" />
                <Tooltip formatter={(val, name, item) => [`${val}% compliance`, item.payload.fullName]} />
                <Bar dataKey="complianceRate" name="Compliance Rate" fill="#0D9488" radius={[4, 4, 0, 0]}>
                  {deptComplianceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.complianceRate >= 90 ? '#0D9488' : entry.complianceRate >= 80 ? '#0284C7' : '#D97706'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Target vs Actual for Selected Indicator */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Chart 3: Target vs Actual Indicator Deep-Dive</h3>
              <p className="text-[11px] text-slate-500">Inspect historical performance curve by indicator</p>
            </div>
            <select
              value={selectedChartIndicatorId}
              onChange={e => setSelectedChartIndicatorId(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-xs font-medium text-slate-700 dark:text-slate-300 max-w-xs focus:outline-hidden"
            >
              {indicators.map(ind => (
                <option key={ind.id} value={ind.id}>{ind.id} - {ind.name.slice(0, 32)}...</option>
              ))}
            </select>
          </div>
          <div className="text-xs text-slate-500 mb-2 flex items-center gap-2">
            <span className="font-semibold text-slate-700 dark:text-slate-300">{selectedIndObj.name}</span>
            <span>·</span>
            <span>Unit: {selectedIndObj.unit}</span>
            <span>·</span>
            <span>Rule: {selectedIndObj.calculationMethod}</span>
          </div>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={targetVsActualData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.6} />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }} />
                <Line type="monotone" dataKey="target" name={`Target (${selectedIndObj.unit})`} stroke="#94A3B8" strokeDasharray="5 5" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="actual" name={`Actual (${selectedIndObj.unit})`} stroke="#0284C7" strokeWidth={2.5} connectNulls={false} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Indicator Status Distribution */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Chart 4: Indicator Status Distribution</h3>
              <p className="text-[11px] text-slate-500">{selectedMonth} performance health breakdown</p>
            </div>
            <span className="text-xs font-mono text-slate-400">{reported}/{totalIndicators} Reported</span>
          </div>
          <div className="h-60 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {statusPieData.map((entry, index) => (
                    <Cell key={`pie-cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name) => [`${value} indicators`, name]} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '4px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 5: Department Operational Ranking */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Chart 5: Department Operational Score Ranking</h3>
              <p className="text-[11px] text-slate-500">Weighted compliance and on-time data completion index</p>
            </div>
          </div>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={deptRankingData}
                margin={{ top: 10, right: 20, left: 20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" opacity={0.6} />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} unit="%" />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} />
                <Tooltip formatter={(val, name, item) => [`${val}% Score`, item.payload.fullName]} />
                <Bar dataKey="complianceRate" name="Operational Index" fill="#0369A1" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 6: Historical Performance (FY Comparison) */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Chart 6: Year-over-Year Performance Trajectory</h3>
              <p className="text-[11px] text-slate-500">Benchmark comparison: FY 2026-2027 vs FY 2025-2026</p>
            </div>
          </div>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={[
                  { month: 'Apr', current: 91.2, prior: 84.5 },
                  { month: 'May', current: 92.4, prior: 86.0 },
                  { month: 'Jun', current: 89.8, prior: 85.2 },
                  { month: 'Jul', current: 93.1, prior: 87.4 },
                  { month: 'Aug', current: 94.0, prior: 88.0 },
                  { month: 'Sep', current: 92.5, prior: 87.2 },
                  { month: 'Oct', current: 90.8, prior: 86.9 },
                  { month: 'Nov', current: null, prior: 89.1 },
                  { month: 'Dec', current: null, prior: 90.2 },
                  { month: 'Jan', current: null, prior: 89.5 },
                  { month: 'Feb', current: null, prior: 91.0 },
                  { month: 'Mar', current: null, prior: 91.4 }
                ]}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.6} />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis domain={[70, 100]} tick={{ fontSize: 11 }} unit="%" />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }} />
                <Line type="monotone" dataKey="current" name="FY 2026-2027 (Current)" stroke="#0284C7" strokeWidth={2.5} connectNulls={false} />
                <Line type="monotone" dataKey="prior" name="FY 2025-2026 (Baseline)" stroke="#94A3B8" strokeDasharray="4 4" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Priority Focus Table: Deviations & Tolerance Alerts */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Priority Focus: Target Deviations & Action Alerts</h3>
            <p className="text-xs text-slate-500">
              Indicators failing SLA or falling in tolerance warning zone in {selectedMonth} {selectedFy}
            </p>
          </div>
          <span className="text-xs font-semibold text-rose-600 bg-rose-50 dark:bg-rose-950/40 px-2 py-1 rounded">
            {deviationRecords.length} Items Require Review
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 border-b border-slate-200/80 dark:border-slate-800">
              <tr>
                <th className="py-2.5 px-4 font-semibold">Indicator ID</th>
                <th className="py-2.5 px-4 font-semibold">Indicator Name</th>
                <th className="py-2.5 px-4 font-semibold">Department</th>
                <th className="py-2.5 px-4 font-semibold">SAP T-Code</th>
                <th className="py-2.5 px-4 font-semibold text-right">Target</th>
                <th className="py-2.5 px-4 font-semibold text-right">Actual</th>
                <th className="py-2.5 px-4 font-semibold text-right">Variance</th>
                <th className="py-2.5 px-4 font-semibold">Status</th>
                <th className="py-2.5 px-4 font-semibold text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {deviationRecords.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-8 text-slate-400">
                    No active target deviations found for this selection. All reported indicators are compliant!
                  </td>
                </tr>
              ) : (
                deviationRecords.slice(0, 8).map(r => {
                  const ind = indicators.find(i => i.id === r.indicatorId) || { name: r.indicatorId, unit: '', sapTCode: '' };
                  const dept = departments.find(d => d.id === r.departmentId) || { code: r.departmentId };
                  const isNonCompliant = r.complianceStatus === 'Non-Compliant';

                  return (
                    <tr key={r.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-2.5 px-4 font-mono font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">
                        {r.indicatorId}
                      </td>
                      <td className="py-2.5 px-4 font-medium text-slate-900 dark:text-white max-w-xs truncate">
                        {ind.name}
                      </td>
                      <td className="py-2.5 px-4 text-slate-500 whitespace-nowrap">
                        {dept.code}
                      </td>
                      <td className="py-2.5 px-4 font-mono text-slate-500 whitespace-nowrap">
                        {ind.sapTCode}
                      </td>
                      <td className="py-2.5 px-4 text-right tabular-nums text-slate-600 dark:text-slate-300 whitespace-nowrap">
                        {r.targetValue} {ind.unit}
                      </td>
                      <td className={`py-2.5 px-4 text-right tabular-nums font-bold whitespace-nowrap ${isNonCompliant ? 'text-rose-600' : 'text-amber-600'}`}>
                        {r.actualValue !== null ? r.actualValue : 'N/A'} {ind.unit}
                      </td>
                      <td className="py-2.5 px-4 text-right tabular-nums font-medium text-slate-500 whitespace-nowrap">
                        {r.variance !== null ? (r.variance > 0 ? `+${r.variance}` : r.variance) : '-'}
                      </td>
                      <td className="py-2.5 px-4 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          isNonCompliant
                            ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/50'
                            : 'bg-amber-50 text-amber-700 dark:bg-amber-950/50'
                        }`}>
                          {r.complianceStatus}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-center whitespace-nowrap">
                        <button
                          onClick={() => onRaiseCapa(r.indicatorId, r.departmentId)}
                          className="px-2.5 py-1 text-[11px] font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded transition-colors"
                        >
                          Raise CAPA
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
