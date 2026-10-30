import React, { useState } from 'react';
import { FileSpreadsheet, Download, Printer, Filter, Calendar } from 'lucide-react';
import { Department, DrmIndicator, MonthlyRecord, CorrectiveAction, SapUpload } from '../types/drm';
import { MONTHS, FINANCIAL_YEARS } from '../data/drmMasterData';

interface Props {
  records: MonthlyRecord[];
  indicators: DrmIndicator[];
  departments: Department[];
  actions: CorrectiveAction[];
  uploads: SapUpload[];
  selectedFy: string;
  selectedMonth: string;
}

export const ReportsExports: React.FC<Props> = ({
  records,
  indicators,
  departments,
  actions,
  uploads,
  selectedFy,
  selectedMonth
}) => {
  const [reportType, setReportType] = useState<number>(1);
  const [reportFy, setReportFy] = useState(selectedFy);
  const [reportMonth, setReportMonth] = useState(selectedMonth);
  const [reportDept, setReportDept] = useState('ALL');

  const reportTitles = [
    { id: 1, title: '1. Monthly Plant DRM Report', desc: 'All 48 indicators for selected month and FY with targets, actuals, and variances.' },
    { id: 2, title: '2. Department Performance Scorecard', desc: 'Summary of compliance rates and completion across all 7 automotive divisions.' },
    { id: 3, title: '3. Indicator-Wise Performance Report', desc: 'Full-year monthly trend for each indicator across the 12 calendar months.' },
    { id: 4, title: '4. Target vs Actual Report', desc: 'Variance analysis identifying metrics above/below approved SLA limits.' },
    { id: 5, title: '5. Non-Compliance Report', desc: 'Filtered view of metrics failing targets or entering tolerance risk zones.' },
    { id: 6, title: '6. Pending Submission Report', desc: 'Draft and under-review submissions awaiting department head sign-off.' },
    { id: 7, title: '7. Corrective Action (CAPA) Report', desc: 'Open and closed 8D problem-solving items with assigned owners and due dates.' },
    { id: 8, title: '8. Financial-Year Summary', desc: 'Executive high-level annual roll-up of operational performance.' },
    { id: 9, title: '9. SAP Report Upload History', desc: 'Archive of ingested SAP ECC / S4HANA files and Google Drive links.' }
  ];

  const handleDownloadCsv = () => {
    let csv = '';
    let filename = `Report_${reportType}_${reportMonth}_${reportFy.replace(/\s+/g, '_')}.csv`;

    if (reportType === 1 || reportType === 4 || reportType === 5 || reportType === 6) {
      csv = 'Record_ID,Financial_Year,Month,Indicator_ID,Indicator_Name,Department,Target,Actual,Variance,Achievement_Pct,Compliance_Status,Workflow_Status\n';
      const filtered = records.filter(r => {
        const matchFy = r.financialYear === reportFy;
        const matchMonth = r.month === reportMonth;
        const matchDept = reportDept === 'ALL' || r.departmentId === reportDept;
        const matchStatus = reportType === 5
          ? (r.complianceStatus === 'Non-Compliant' || r.complianceStatus === 'Action Required')
          : reportType === 6
          ? (r.status === 'Draft' || r.status === 'Submitted')
          : true;
        return matchFy && matchMonth && matchDept && matchStatus;
      });

      filtered.forEach(r => {
        const ind = indicators.find(i => i.id === r.indicatorId);
        csv += `"${r.id}","${r.financialYear}","${r.month}","${r.indicatorId}","${ind?.name || ''}","${r.departmentId}",${r.targetValue},${r.actualValue ?? ''},${r.variance ?? ''},${r.achievementPct ?? ''},"${r.complianceStatus}","${r.status}"\n`;
      });
    } else if (reportType === 2) {
      csv = 'Department_ID,Department_Name,Code,Head,Indicators_Count,Compliance_Rate_Pct\n';
      departments.forEach(d => {
        const dRecs = records.filter(r => r.financialYear === reportFy && r.month === reportMonth && r.departmentId === d.id);
        const comp = dRecs.filter(r => r.complianceStatus === 'Compliant').length;
        const rate = dRecs.length > 0 ? Math.round((comp / dRecs.length) * 100) : 0;
        csv += `"${d.id}","${d.name}","${d.code}","${d.headName}",${d.indicatorCount},${rate}%\n`;
      });
      filename = `Dept_Scorecard_${reportMonth}_${reportFy}.csv`;
    } else if (reportType === 7) {
      csv = 'Action_ID,Indicator_ID,Department,Priority,Problem,Root_Cause,Corrective_Action,Owner,Status,Due_Date\n';
      actions.forEach(a => {
        csv += `"${a.actionId}","${a.indicatorId}","${a.departmentId}","${a.priority}","${a.problemDescription}","${a.rootCause}","${a.correctiveAction}","${a.assignedOwner}","${a.status}","${a.dueDate}"\n`;
      });
      filename = `CAPA_Log_${reportFy}.csv`;
    } else if (reportType === 9) {
      csv = 'Upload_ID,File_Name,SAP_TCode,Period,Rows_Processed,Uploaded_By,Status,Date\n';
      uploads.forEach(u => {
        csv += `"${u.uploadId}","${u.fileName}","${u.sapTCode}","${u.month} ${u.financialYear}",${u.rowsProcessed},"${u.uploadedBy}","${u.status}","${u.uploadedAt}"\n`;
      });
      filename = `SAP_Upload_History.csv`;
    } else {
      csv = 'Indicator_ID,Indicator_Name,Target,Unit,Calculation_Method\n';
      indicators.forEach(i => {
        csv += `"${i.id}","${i.name}",${i.targetValue},"${i.unit}","${i.calculationMethod}"\n`;
      });
    }

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">DRM Reports & Data Exports</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Generate formal executive summaries, IATF audit returns, and CSV exports
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-400 font-medium">FY:</span>
            <select
              value={reportFy}
              onChange={e => setReportFy(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 font-semibold text-slate-800 dark:text-slate-200"
            >
              {FINANCIAL_YEARS.map(f => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-400 font-medium">Month:</span>
            <select
              value={reportMonth}
              onChange={e => setReportMonth(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 font-semibold text-slate-800 dark:text-slate-200"
            >
              {MONTHS.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          <button
            onClick={handleDownloadCsv}
            className="px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 dark:bg-sky-600 hover:bg-slate-800 rounded-lg shadow-xs flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download CSV</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-3 py-1.5 text-xs font-medium border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Report Selector Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {reportTitles.map(r => (
          <div
            key={r.id}
            onClick={() => setReportType(r.id)}
            className={`p-4 rounded-xl border transition-all cursor-pointer space-y-2 ${
              reportType === r.id
                ? 'bg-sky-50 dark:bg-sky-950/40 border-sky-500 shadow-xs ring-1 ring-sky-500'
                : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-slate-300'
            }`}
          >
            <h3 className={`text-sm font-bold ${reportType === r.id ? 'text-sky-800 dark:text-sky-300' : 'text-slate-900 dark:text-white'}`}>
              {r.title}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {r.desc}
            </p>
          </div>
        ))}
      </div>

      {/* Formatted Report Preview Box */}
      <div className="bg-white dark:bg-slate-900 p-8 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6">
        {/* Company Header */}
        <div className="border-b border-slate-200 dark:border-slate-800 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold tracking-widest text-sky-600 uppercase block mb-1">AUTOMOTIVE OPERATIONS EXECUTIVE REVIEW</span>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              {reportTitles.find(t => t.id === reportType)?.title}
            </h2>
            <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
              <span>Period: <strong className="text-slate-800 dark:text-slate-200">{reportMonth} {reportFy}</strong></span>
              <span>·</span>
              <span>Classification: <strong>Confidential Internal DRM</strong></span>
              <span>·</span>
              <span>Generated: <strong className="tabular-nums">{new Date().toLocaleString()}</strong></span>
            </div>
          </div>

          <div className="text-right">
            <span className="font-mono text-xs font-bold text-slate-400">PLANT OPERATIONS #1001</span>
            <span className="block text-[11px] text-teal-600 font-semibold">IATF 16949 / ISO 9001</span>
          </div>
        </div>

        {/* Dynamic Preview Summary */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="py-2.5 px-3 font-semibold">Indicator Code</th>
                <th className="py-2.5 px-3 font-semibold">Performance Metric</th>
                <th className="py-2.5 px-3 font-semibold">Dept</th>
                <th className="py-2.5 px-3 text-right font-semibold">Target</th>
                <th className="py-2.5 px-3 text-right font-semibold">Actual</th>
                <th className="py-2.5 px-3 text-right font-semibold">Variance</th>
                <th className="py-2.5 px-3 font-semibold">Compliance Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {indicators.slice(0, 10).map(ind => {
                const rec = records.find(r => r.financialYear === reportFy && r.month === reportMonth && r.indicatorId === ind.id);
                return (
                  <tr key={ind.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-2.5 px-3 font-mono font-medium text-slate-700 dark:text-slate-300">{ind.id}</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-white">{ind.name}</td>
                    <td className="py-2.5 px-3 text-slate-500">{ind.departmentId}</td>
                    <td className="py-2.5 px-3 text-right tabular-nums text-slate-600 dark:text-slate-300">{ind.targetValue} {ind.unit}</td>
                    <td className="py-2.5 px-3 text-right tabular-nums font-bold text-sky-600">{rec?.actualValue ?? 'N/A'} {ind.unit}</td>
                    <td className="py-2.5 px-3 text-right tabular-nums text-slate-500">{rec?.variance ?? '-'}</td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        rec?.complianceStatus === 'Compliant' ? 'bg-emerald-50 text-emerald-700' :
                        rec?.complianceStatus === 'Action Required' ? 'bg-amber-50 text-amber-700' :
                        rec?.complianceStatus === 'Non-Compliant' ? 'bg-rose-50 text-rose-700' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {rec?.complianceStatus || 'Not Reported'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
