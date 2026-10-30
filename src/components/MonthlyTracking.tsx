import React, { useState } from 'react';
import {
  Send, Lock, Unlock, Download, CheckCircle, AlertTriangle,
  XCircle, Clock, Eye, Edit3, ArrowRight, FileCheck
} from 'lucide-react';
import { Department, DrmIndicator, MonthlyRecord, UserRole } from '../types/drm';
import { MONTHS, FINANCIAL_YEARS, evaluateCompliance } from '../data/drmMasterData';

interface Props {
  records: MonthlyRecord[];
  indicators: DrmIndicator[];
  departments: Department[];
  selectedFy: string;
  selectedMonth: string;
  selectedDept: string;
  userRole: UserRole;
  onSelectFy: (fy: string) => void;
  onSelectMonth: (month: string) => void;
  onSelectDept: (dept: string) => void;
  onUpdateActual: (recordId: string, actual: number | null, remarks: string) => void;
  onSubmitRecord: (recordId: string) => void;
  onBatchSubmit: () => void;
  onReopenRecord: (recordId: string) => void;
  onRaiseCapa: (indicatorId: string, deptId: string) => void;
}

export const MonthlyTracking: React.FC<Props> = ({
  records,
  indicators,
  departments,
  selectedFy,
  selectedMonth,
  selectedDept,
  userRole,
  onSelectFy,
  onSelectMonth,
  onSelectDept,
  onUpdateActual,
  onSubmitRecord,
  onBatchSubmit,
  onReopenRecord,
  onRaiseCapa
}) => {
  const [selectedRecordForDetail, setSelectedRecordForDetail] = useState<MonthlyRecord | null>(null);

  const filteredRecords = records.filter(r => {
    const matchFy = r.financialYear === selectedFy;
    const matchMonth = r.month === selectedMonth;
    const matchDept = selectedDept === 'ALL' || r.departmentId === selectedDept;
    return matchFy && matchMonth && matchDept;
  });

  const draftCount = filteredRecords.filter(r => r.status === 'Draft' && r.actualValue !== null).length;

  const handleDownloadCsv = () => {
    let csv = 'Record_ID,Financial_Year,Month,Indicator_ID,Indicator_Name,Department,SAP_TCode,Target,Actual,Variance,Achievement_Pct,Compliance_Status,Workflow_Status,Remarks\n';
    filteredRecords.forEach(r => {
      const ind = indicators.find(i => i.id === r.indicatorId);
      csv += `"${r.id}","${r.financialYear}","${r.month}","${r.indicatorId}","${ind?.name || ''}","${r.departmentId}","${ind?.sapTCode || ''}",${r.targetValue},${r.actualValue !== null ? r.actualValue : ''},${r.variance !== null ? r.variance : ''},${r.achievementPct !== null ? r.achievementPct : ''},"${r.complianceStatus}","${r.status}","${r.remarks || ''}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SAP_DRM_${selectedMonth}_${selectedFy}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Monthly DRM Performance Entry</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Record actual operational metrics, review automatic variance compliance, and submit monthly returns
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
            onClick={onBatchSubmit}
            disabled={draftCount === 0}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg shadow-xs flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              draftCount > 0
                ? 'bg-teal-600 hover:bg-teal-500 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>Submit {draftCount} Drafts</span>
          </button>

          <button
            onClick={handleDownloadCsv}
            className="px-3 py-1.5 text-xs font-medium border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>CSV</span>
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 border-b border-slate-200/80 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4 font-semibold">ID</th>
                <th className="py-3 px-4 font-semibold">Indicator Title</th>
                <th className="py-3 px-4 font-semibold">SAP Code</th>
                <th className="py-3 px-4 font-semibold text-right">Target</th>
                <th className="py-3 px-4 font-semibold text-right">Actual Entry</th>
                <th className="py-3 px-4 font-semibold text-right">Variance</th>
                <th className="py-3 px-4 font-semibold text-right">Achieve %</th>
                <th className="py-3 px-4 font-semibold">Compliance</th>
                <th className="py-3 px-4 font-semibold">Workflow Status</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredRecords.map(r => {
                const ind = indicators.find(i => i.id === r.indicatorId) || { name: r.indicatorId, unit: '', sapTCode: '', calculationMethod: 'HIGHER_IS_BETTER' };
                const isLocked = r.status === 'Approved';

                return (
                  <tr key={r.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">
                      {r.indicatorId}
                    </td>
                    <td className="py-3 px-4 max-w-xs">
                      <div className="font-semibold text-slate-900 dark:text-white truncate">{ind.name}</div>
                      <div className="text-[10px] text-slate-400">{r.departmentId} · {ind.calculationMethod}</div>
                    </td>
                    <td className="py-3 px-4 font-mono whitespace-nowrap text-slate-500">
                      {ind.sapTCode}
                    </td>
                    <td className="py-3 px-4 text-right tabular-nums text-slate-600 dark:text-slate-300 font-medium whitespace-nowrap">
                      {r.targetValue} {ind.unit}
                    </td>
                    <td className="py-2 px-4 text-right whitespace-nowrap">
                      {isLocked ? (
                        <div className="flex items-center justify-end gap-1 font-bold text-slate-900 dark:text-white tabular-nums">
                          <Lock className="w-3 h-3 text-slate-400" />
                          <span>{r.actualValue !== null ? r.actualValue : 'N/A'} {ind.unit}</span>
                        </div>
                      ) : (
                        <input
                          type="number"
                          step="0.01"
                          placeholder="Enter..."
                          value={r.actualValue !== null ? r.actualValue : ''}
                          onChange={e => {
                            const val = e.target.value === '' ? null : parseFloat(e.target.value);
                            onUpdateActual(r.id, val, r.remarks);
                          }}
                          className="w-28 px-2.5 py-1 text-right bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded text-xs font-bold text-slate-900 dark:text-white focus:outline-sky-500 tabular-nums"
                        />
                      )}
                    </td>
                    <td className="py-3 px-4 text-right tabular-nums text-slate-500 whitespace-nowrap">
                      {r.variance !== null ? (r.variance > 0 ? `+${r.variance}` : r.variance) : '-'}
                    </td>
                    <td className="py-3 px-4 text-right tabular-nums font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">
                      {r.achievementPct !== null ? `${r.achievementPct}%` : 'N/A'}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        r.complianceStatus === 'Compliant' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40' :
                        r.complianceStatus === 'Action Required' ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40' :
                        r.complianceStatus === 'Non-Compliant' ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/40' :
                        'bg-slate-100 text-slate-600 dark:bg-slate-800'
                      }`}>
                        {r.complianceStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${
                          r.status === 'Approved' ? 'bg-teal-500' :
                          r.status === 'Submitted' ? 'bg-sky-500' :
                          r.status === 'Under Review' ? 'bg-amber-500' :
                          r.status === 'Rejected' ? 'bg-rose-500' : 'bg-slate-400'
                        }`} />
                        <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{r.status}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap space-x-1.5">
                      <button
                        onClick={() => setSelectedRecordForDetail(r)}
                        className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        title="View Details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      {r.status === 'Draft' && r.actualValue !== null && (
                        <button
                          onClick={() => onSubmitRecord(r.id)}
                          className="px-2 py-0.5 bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 hover:bg-sky-100 rounded text-[11px] font-semibold transition-colors"
                        >
                          Submit
                        </button>
                      )}

                      {isLocked && userRole === 'ADMIN' && (
                        <button
                          onClick={() => onReopenRecord(r.id)}
                          className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded text-[11px] font-medium transition-colors"
                          title="Reopen for administrative correction"
                        >
                          Reopen
                        </button>
                      )}

                      {(r.complianceStatus === 'Non-Compliant' || r.complianceStatus === 'Action Required') && (
                        <button
                          onClick={() => onRaiseCapa(r.indicatorId, r.departmentId)}
                          className="px-2 py-0.5 bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 hover:bg-amber-100 rounded text-[11px] font-semibold transition-colors"
                        >
                          CAPA
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Inspection Modal */}
      {selectedRecordForDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Record Details: {selectedRecordForDetail.id}</h3>
                <p className="text-xs text-slate-500">{selectedRecordForDetail.month} · {selectedRecordForDetail.financialYear}</p>
              </div>
              <button
                onClick={() => setSelectedRecordForDetail(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-slate-50 dark:bg-slate-800 p-3 rounded-lg">
                <div>
                  <span className="text-slate-400 block mb-0.5">Target Value</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 tabular-nums">{selectedRecordForDetail.targetValue}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Actual Value</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 tabular-nums">{selectedRecordForDetail.actualValue ?? 'Not Reported'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Achievement Rate</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 tabular-nums">{selectedRecordForDetail.achievementPct ? `${selectedRecordForDetail.achievementPct}%` : 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Compliance Status</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{selectedRecordForDetail.complianceStatus}</span>
                </div>
              </div>

              <div>
                <span className="text-slate-400 block mb-1">Remarks & Observations</span>
                <p className="bg-slate-50 dark:bg-slate-800 p-2.5 rounded text-slate-700 dark:text-slate-300">
                  {selectedRecordForDetail.remarks || 'No remarks provided'}
                </p>
              </div>

              <div className="border-t border-slate-100 dark:border-slate-800 pt-3 flex items-center justify-between text-[11px] text-slate-400">
                <span>Updated By: {selectedRecordForDetail.updatedBy}</span>
                <span>Status: {selectedRecordForDetail.status}</span>
              </div>
            </div>

            <div className="pt-2 text-right">
              <button
                onClick={() => setSelectedRecordForDetail(null)}
                className="px-4 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
