import React, { useState } from 'react';
import { Search, Plus, Edit2, ShieldAlert, Check, X, FileText } from 'lucide-react';
import { Department, DrmIndicator, CalculationMethod, UserRole } from '../types/drm';

interface Props {
  indicators: DrmIndicator[];
  departments: Department[];
  userRole: UserRole;
  onSaveIndicator: (indicator: DrmIndicator) => void;
}

export const IndicatorRegister: React.FC<Props> = ({
  indicators,
  departments,
  userRole,
  onSaveIndicator
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [editingIndicator, setEditingIndicator] = useState<DrmIndicator | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filtered = indicators.filter(ind => {
    const matchDept = selectedDept === 'ALL' || ind.departmentId === selectedDept;
    const term = searchTerm.toLowerCase();
    const matchSearch = ind.name.toLowerCase().includes(term) ||
      ind.id.toLowerCase().includes(term) ||
      ind.sapTCode.toLowerCase().includes(term);
    return matchDept && matchSearch;
  });

  const handleOpenAdd = () => {
    setEditingIndicator({
      id: `DRM-IND-${Math.floor(100 + Math.random() * 900)}`,
      name: '',
      description: '',
      departmentId: departments[0]?.id || 'DEP-01',
      sapTCode: '',
      unit: '%',
      frequency: 'Monthly',
      targetValue: 100,
      targetType: 'MIN',
      calculationMethod: 'HIGHER_IS_BETTER',
      toleranceMin: 95,
      toleranceMax: 100,
      responsibleUser: 'user@company.com',
      sapReportRequired: true,
      effectiveStart: '2026-04-01',
      effectiveEnd: '2027-03-31',
      status: 'ACTIVE',
      remarks: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (ind: DrmIndicator) => {
    setEditingIndicator({ ...ind });
    setIsModalOpen(true);
  };

  const handleSubmitModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingIndicator || !editingIndicator.name.trim()) return;
    onSaveIndicator(editingIndicator);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">DRM Indicator Master Register</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            48 Digitized Operational Key Performance Indicators mapped to SAP Transactions
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search ID, name, SAP code..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-hidden w-60"
            />
          </div>

          <select
            value={selectedDept}
            onChange={e => setSelectedDept(e.target.value)}
            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-hidden"
          >
            <option value="ALL">All Departments (7)</option>
            {departments.map(d => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>

          {userRole === 'ADMIN' && (
            <button
              onClick={handleOpenAdd}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 rounded-lg shadow-xs flex items-center gap-1.5 transition-colors whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Indicator</span>
            </button>
          )}
        </div>
      </div>

      {/* Indicators Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 border-b border-slate-200/80 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4 font-semibold">Indicator ID</th>
                <th className="py-3 px-4 font-semibold">Indicator Title & Purpose</th>
                <th className="py-3 px-4 font-semibold">Department</th>
                <th className="py-3 px-4 font-semibold">SAP T-Code</th>
                <th className="py-3 px-4 font-semibold">Unit</th>
                <th className="py-3 px-4 font-semibold text-right">Target</th>
                <th className="py-3 px-4 font-semibold">Calculation Rule</th>
                <th className="py-3 px-4 font-semibold text-center">SAP Doc Req.</th>
                <th className="py-3 px-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map(ind => {
                const dept = departments.find(d => d.id === ind.departmentId) || { code: ind.departmentId, name: ind.departmentId };
                return (
                  <tr key={ind.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-medium text-sky-700 dark:text-sky-400 whitespace-nowrap">
                      {ind.id}
                    </td>
                    <td className="py-3 px-4 max-w-sm">
                      <div className="font-semibold text-slate-900 dark:text-white leading-tight">
                        {ind.name}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate mt-0.5">
                        {ind.description}
                      </div>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="font-medium text-slate-700 dark:text-slate-300">{dept.code}</span>
                      <span className="text-[10px] text-slate-400 block">{dept.name}</span>
                    </td>
                    <td className="py-3 px-4 font-mono whitespace-nowrap">
                      <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-600 dark:text-slate-300 text-[11px]">
                        {ind.sapTCode}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300 font-mono whitespace-nowrap">
                      {ind.unit}
                    </td>
                    <td className="py-3 px-4 text-right tabular-nums font-bold text-slate-900 dark:text-white whitespace-nowrap">
                      {ind.targetValue}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap font-mono text-[11px] text-slate-500">
                      {ind.calculationMethod}
                    </td>
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      {ind.sapReportRequired ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-teal-600">
                          <Check className="w-3.5 h-3.5" />
                          <span>Required</span>
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-400">Optional</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      {userRole === 'ADMIN' ? (
                        <button
                          onClick={() => handleOpenEdit(ind)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-sky-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title="Edit Indicator Definition"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-400">View Only</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD / EDIT MODAL */}
      {isModalOpen && editingIndicator && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {editingIndicator.id ? `Configure Indicator: ${editingIndicator.id}` : 'Create New DRM Indicator'}
                </h3>
                <p className="text-xs text-slate-500">Define business rules, targets, and SAP reporting requirements</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitModal} className="p-5 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Indicator ID</label>
                  <input
                    type="text"
                    required
                    value={editingIndicator.id}
                    onChange={e => setEditingIndicator({ ...editingIndicator, id: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Target Department</label>
                  <select
                    value={editingIndicator.departmentId}
                    onChange={e => setEditingIndicator({ ...editingIndicator, departmentId: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2"
                  >
                    {departments.map(d => (
                      <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Indicator Title</label>
                <input
                  type="text"
                  required
                  value={editingIndicator.name}
                  onChange={e => setEditingIndicator({ ...editingIndicator, name: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2"
                  placeholder="e.g. Line Rejection / Defect Rate"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Description & SLA Criteria</label>
                <textarea
                  rows={2}
                  value={editingIndicator.description}
                  onChange={e => setEditingIndicator({ ...editingIndicator, description: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">SAP Transaction Code</label>
                  <input
                    type="text"
                    value={editingIndicator.sapTCode}
                    onChange={e => setEditingIndicator({ ...editingIndicator, sapTCode: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 font-mono"
                    placeholder="e.g. QA32, MB52, ZM088"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Measurement Unit</label>
                  <input
                    type="text"
                    value={editingIndicator.unit}
                    onChange={e => setEditingIndicator({ ...editingIndicator, unit: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 font-mono"
                    placeholder="%, Nos, Days, PPM, INR Lakhs"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Target Baseline</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={editingIndicator.targetValue}
                    onChange={e => setEditingIndicator({ ...editingIndicator, targetValue: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-right font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Calculation Method</label>
                  <select
                    value={editingIndicator.calculationMethod}
                    onChange={e => setEditingIndicator({ ...editingIndicator, calculationMethod: e.target.value as CalculationMethod })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 font-mono"
                  >
                    <option value="HIGHER_IS_BETTER">HIGHER_IS_BETTER</option>
                    <option value="LOWER_IS_BETTER">LOWER_IS_BETTER</option>
                    <option value="EQUAL_TO_TARGET">EQUAL_TO_TARGET</option>
                    <option value="WITHIN_RANGE">WITHIN_RANGE</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Tolerance Min</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingIndicator.toleranceMin}
                    onChange={e => setEditingIndicator({ ...editingIndicator, toleranceMin: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-right"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Tolerance Max</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingIndicator.toleranceMax}
                    onChange={e => setEditingIndicator({ ...editingIndicator, toleranceMax: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-right"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingIndicator.sapReportRequired}
                    onChange={e => setEditingIndicator({ ...editingIndicator, sapReportRequired: e.target.checked })}
                    className="rounded text-sky-600 focus:ring-sky-500"
                  />
                  <span className="font-medium text-slate-700 dark:text-slate-300">Mandate Supporting SAP Report Attachment</span>
                </label>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-semibold rounded-lg shadow-xs transition-colors"
                  >
                    Save Indicator
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
