import React, { useState } from 'react';
import { PlusCircle, AlertTriangle, CheckCircle, Clock, Search, Filter } from 'lucide-react';
import { CorrectiveAction, Department, DrmIndicator, UserRole } from '../types/drm';
import { MONTHS, FINANCIAL_YEARS } from '../data/drmMasterData';

interface Props {
  actions: CorrectiveAction[];
  indicators: DrmIndicator[];
  departments: Department[];
  userRole: UserRole;
  selectedFy: string;
  selectedMonth: string;
  onSaveAction: (action: CorrectiveAction) => void;
  onUpdateStatus: (actionId: string, newStatus: CorrectiveAction['status']) => void;
}

export const CorrectiveActionsView: React.FC<Props> = ({
  actions,
  indicators,
  departments,
  userRole,
  selectedFy,
  selectedMonth,
  onSaveAction,
  onUpdateStatus
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAction, setEditingAction] = useState<CorrectiveAction | null>(null);

  const filtered = actions.filter(a => {
    const term = searchTerm.toLowerCase();
    const matchSearch = a.actionId.toLowerCase().includes(term) ||
      a.problemDescription.toLowerCase().includes(term) ||
      a.indicatorId.toLowerCase().includes(term);
    const matchStatus = statusFilter === 'ALL' || a.status === statusFilter;
    const matchPriority = priorityFilter === 'ALL' || a.priority === priorityFilter;
    return matchSearch && matchStatus && matchPriority;
  });

  const handleOpenAdd = () => {
    setEditingAction({
      actionId: `CAPA-2026-${Math.floor(100 + Math.random() * 900)}`,
      indicatorId: indicators[0]?.id || 'DRM-MM-03',
      departmentId: departments[0]?.id || 'DEP-01',
      financialYear: selectedFy,
      month: selectedMonth,
      problemDescription: '',
      rootCause: '',
      correctiveAction: '',
      preventiveAction: '',
      assignedOwner: 'quality.head@company.com',
      priority: 'High',
      dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      status: 'Open',
      reviewerComments: '',
      createdAt: new Date().toISOString()
    });
    setIsModalOpen(true);
  };

  const handleSubmitModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAction || !editingAction.problemDescription.trim()) return;
    onSaveAction(editingAction);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Corrective & Preventive Action (CAPA) Log</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Automotive 8D Problem Solving Matrix for target failures and audit deviations
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search CAPA ID or problem..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-hidden w-60"
            />
          </div>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-hidden"
          >
            <option value="ALL">All Statuses</option>
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Pending Review">Pending Review</option>
            <option value="Closed">Closed</option>
            <option value="Overdue">Overdue</option>
          </select>

          <button
            onClick={handleOpenAdd}
            className="px-3.5 py-1.5 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-500 rounded-lg shadow-xs flex items-center gap-1.5 transition-colors whitespace-nowrap"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>New 8D CAPA</span>
          </button>
        </div>
      </div>

      {/* Grid of CAPA Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map(c => {
          const isClosed = c.status === 'Closed';
          const isOverdue = c.status === 'Overdue' || (!isClosed && new Date(c.dueDate) < new Date());

          return (
            <div
              key={c.actionId}
              className={`bg-white dark:bg-slate-900 p-5 rounded-xl border shadow-xs space-y-3.5 ${
                isOverdue
                  ? 'border-rose-300 dark:border-rose-900/60'
                  : 'border-slate-200/80 dark:border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-amber-600 text-xs">{c.actionId}</span>
                  <span className="text-slate-300">·</span>
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">{c.indicatorId}</span>
                  <span className="text-slate-300">·</span>
                  <span className="text-[11px] text-slate-500">{c.departmentId}</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    c.priority === 'Critical' ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300' :
                    c.priority === 'High' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300' :
                    'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                  }`}>
                    {c.priority}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                    isClosed ? 'bg-teal-50 text-teal-700 dark:bg-teal-950/40' :
                    isOverdue ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/40' :
                    'bg-amber-50 text-amber-700 dark:bg-amber-950/40'
                  }`}>
                    {isOverdue && !isClosed ? 'Overdue' : c.status}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-semibold text-slate-400 tracking-wider block mb-1">PROBLEM STATEMENT</span>
                <p className="text-xs font-medium text-slate-900 dark:text-white leading-relaxed">{c.problemDescription}</p>
              </div>

              <div>
                <span className="text-[10px] font-semibold text-slate-400 tracking-wider block mb-1">ROOT CAUSE ANALYSIS</span>
                <p className="text-xs text-slate-600 dark:text-slate-400">{c.rootCause || 'Under investigation'}</p>
              </div>

              <div>
                <span className="text-[10px] font-semibold text-slate-400 tracking-wider block mb-1">CORRECTIVE & PREVENTIVE ACTIONS</span>
                <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">{c.correctiveAction}</p>
                {c.preventiveAction && (
                  <p className="text-xs text-slate-500 mt-1 italic">Preventive: {c.preventiveAction}</p>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
                <div>
                  <span>Owner: <strong className="text-slate-800 dark:text-slate-200">{c.assignedOwner.split('@')[0]}</strong></span>
                  <span className="mx-2">·</span>
                  <span>Due: <strong className={isOverdue && !isClosed ? 'text-rose-600 font-bold' : 'text-slate-800 dark:text-slate-200'}>{c.dueDate}</strong></span>
                </div>

                {!isClosed ? (
                  <button
                    onClick={() => onUpdateStatus(c.actionId, 'Closed')}
                    className="px-2.5 py-1 text-[11px] font-semibold bg-teal-50 text-teal-700 hover:bg-teal-100 dark:bg-teal-950/50 dark:text-teal-300 rounded transition-colors"
                  >
                    Mark Resolved
                  </button>
                ) : (
                  <span className="text-[11px] text-teal-600 font-medium">Closed & Audited</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* CREATE MODAL */}
      {isModalOpen && editingAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl max-w-xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Raise 8D Corrective Action (CAPA)</h3>
            <p className="text-xs text-slate-500">Initiate structured root cause elimination for indicator SLA failure</p>

            <form onSubmit={handleSubmitModal} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Related Indicator</label>
                  <select
                    value={editingAction.indicatorId}
                    onChange={e => {
                      const ind = indicators.find(i => i.id === e.target.value);
                      setEditingAction({
                        ...editingAction,
                        indicatorId: e.target.value,
                        departmentId: ind?.departmentId || editingAction.departmentId
                      });
                    }}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 font-mono"
                  >
                    {indicators.map(i => (
                      <option key={i.id} value={i.id}>{i.id} - {i.name.slice(0, 30)}...</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Priority</label>
                  <select
                    value={editingAction.priority}
                    onChange={e => setEditingAction({ ...editingAction, priority: e.target.value as any })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Problem Description *</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Detail the failure mode, deviation amount, and customer/plant impact..."
                  value={editingAction.problemDescription}
                  onChange={e => setEditingAction({ ...editingAction, problemDescription: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Root Cause (5-Why Analysis)</label>
                <textarea
                  rows={2}
                  placeholder="State the primary technical and systemic root cause..."
                  value={editingAction.rootCause}
                  onChange={e => setEditingAction({ ...editingAction, rootCause: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Corrective Action (Immediate Containment)</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Immediate remedial action taken..."
                  value={editingAction.correctiveAction}
                  onChange={e => setEditingAction({ ...editingAction, correctiveAction: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Preventive Action (Systemic Poka-Yoke)</label>
                <textarea
                  rows={2}
                  placeholder="Long-term error-proofing to prevent recurrence..."
                  value={editingAction.preventiveAction}
                  onChange={e => setEditingAction({ ...editingAction, preventiveAction: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Assigned Owner Email</label>
                  <input
                    type="email"
                    required
                    value={editingAction.assignedOwner}
                    onChange={e => setEditingAction({ ...editingAction, assignedOwner: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Target Closure Due Date</label>
                  <input
                    type="date"
                    required
                    value={editingAction.dueDate}
                    onChange={e => setEditingAction({ ...editingAction, dueDate: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-semibold hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg font-semibold shadow-xs"
                >
                  Save CAPA Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
