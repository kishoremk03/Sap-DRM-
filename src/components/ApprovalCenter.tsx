import React, { useState } from 'react';
import { CheckSquare, XCircle, CheckCircle, Clock, AlertCircle, MessageSquare } from 'lucide-react';
import { Department, DrmIndicator, MonthlyRecord, UserRole } from '../types/drm';
import { MONTHS, FINANCIAL_YEARS } from '../data/drmMasterData';

interface Props {
  records: MonthlyRecord[];
  indicators: DrmIndicator[];
  departments: Department[];
  userRole: UserRole;
  selectedFy: string;
  selectedMonth: string;
  onReviewRecord: (recordId: string, action: 'APPROVE' | 'REJECT', comments: string) => void;
}

export const ApprovalCenter: React.FC<Props> = ({
  records,
  indicators,
  departments,
  userRole,
  selectedFy,
  selectedMonth,
  onReviewRecord
}) => {
  const [filterDept, setFilterDept] = useState('ALL');
  const [activeTab, setActiveTab] = useState<'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');
  const [selectedRecordToReject, setSelectedRecordToReject] = useState<MonthlyRecord | null>(null);
  const [rejectionComment, setRejectionComment] = useState('');

  const monthlyRecords = records.filter(r => {
    const matchPeriod = r.financialYear === selectedFy && r.month === selectedMonth;
    const matchDept = filterDept === 'ALL' || r.departmentId === filterDept;
    return matchPeriod && matchDept;
  });

  const pendingRecords = monthlyRecords.filter(r => r.status === 'Submitted' || r.status === 'Under Review');
  const approvedRecords = monthlyRecords.filter(r => r.status === 'Approved');
  const rejectedRecords = monthlyRecords.filter(r => r.status === 'Rejected');

  const displayedRecords = activeTab === 'PENDING'
    ? pendingRecords
    : activeTab === 'APPROVED'
    ? approvedRecords
    : rejectedRecords;

  const handleConfirmReject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRecordToReject || !rejectionComment.trim()) return;
    onReviewRecord(selectedRecordToReject.id, 'REJECT', rejectionComment);
    setSelectedRecordToReject(null);
    setRejectionComment('');
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Department Approval & Sign-Off Center</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Operational review workflow for Department Heads and Operations Management
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={filterDept}
            onChange={e => setFilterDept(e.target.value)}
            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-hidden"
          >
            <option value="ALL">All Departments</option>
            {departments.map(d => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('PENDING')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 ${
            activeTab === 'PENDING'
              ? 'bg-amber-500 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Pending Review ({pendingRecords.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('APPROVED')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 ${
            activeTab === 'APPROVED'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <CheckCircle className="w-4 h-4" />
          <span>Approved ({approvedRecords.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('REJECTED')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 ${
            activeTab === 'REJECTED'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <XCircle className="w-4 h-4" />
          <span>Returned / Rejected ({rejectedRecords.length})</span>
        </button>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 border-b border-slate-200/80 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4 font-semibold">Record ID</th>
                <th className="py-3 px-4 font-semibold">Indicator Name</th>
                <th className="py-3 px-4 font-semibold">Department</th>
                <th className="py-3 px-4 font-semibold text-right">Target</th>
                <th className="py-3 px-4 font-semibold text-right">Reported Actual</th>
                <th className="py-3 px-4 font-semibold">Compliance Status</th>
                <th className="py-3 px-4 font-semibold">Submitted By</th>
                <th className="py-3 px-4 font-semibold text-center">Decision</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {displayedRecords.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-slate-400">
                    No records found in this category for {selectedMonth} {selectedFy}.
                  </td>
                </tr>
              ) : (
                displayedRecords.map(r => {
                  const ind = indicators.find(i => i.id === r.indicatorId) || { name: r.indicatorId, unit: '' };
                  const dept = departments.find(d => d.id === r.departmentId) || { code: r.departmentId };

                  return (
                    <tr key={r.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 font-mono font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">
                        {r.id}
                      </td>
                      <td className="py-3 px-4 max-w-xs font-semibold text-slate-900 dark:text-white truncate">
                        {ind.name}
                      </td>
                      <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                        {dept.code}
                      </td>
                      <td className="py-3 px-4 text-right tabular-nums text-slate-600 dark:text-slate-300 whitespace-nowrap font-medium">
                        {r.targetValue} {ind.unit}
                      </td>
                      <td className="py-3 px-4 text-right tabular-nums font-bold text-sky-600 whitespace-nowrap">
                        {r.actualValue !== null ? r.actualValue : 'N/A'} {ind.unit}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          r.complianceStatus === 'Compliant'
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40'
                            : 'bg-rose-50 text-rose-700 dark:bg-rose-950/40'
                        }`}>
                          {r.complianceStatus}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                        {r.submittedBy || r.updatedBy}
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap space-x-2">
                        {r.status !== 'Approved' && (userRole === 'ADMIN' || userRole === 'DEPT_HEAD') ? (
                          <>
                            <button
                              onClick={() => onReviewRecord(r.id, 'APPROVE', 'Approved by Department Head')}
                              className="px-3 py-1 bg-teal-600 hover:bg-teal-500 text-white font-semibold rounded text-xs shadow-xs transition-colors"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => setSelectedRecordToReject(r)}
                              className="px-3 py-1 bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-950/40 font-semibold rounded text-xs transition-colors"
                            >
                              Reject
                            </button>
                          </>
                        ) : (
                          <span className="text-[11px] text-teal-600 font-semibold flex items-center justify-center gap-1">
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>Signed Off</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* REJECTION REASON MODAL */}
      {selectedRecordToReject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center gap-2 text-rose-600">
              <AlertCircle className="w-5 h-5" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Reject / Return Submission</h3>
            </div>
            <p className="text-xs text-slate-500">
              Please state mandatory justification for returning record <span className="font-mono font-semibold">{selectedRecordToReject.id}</span> to Draft.
            </p>

            <form onSubmit={handleConfirmReject} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Reviewer Feedback & Corrective Request *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. Please attach matching SAP ZM088 export verifying vendor OTIF calculation."
                  value={rejectionComment}
                  onChange={e => setRejectionComment(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 focus:outline-rose-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedRecordToReject(null)}
                  className="px-4 py-2 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-lg hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-semibold rounded-lg shadow-xs"
                >
                  Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
