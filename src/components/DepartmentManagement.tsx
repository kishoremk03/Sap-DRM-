import React, { useState } from 'react';
import { Building2, Plus, Edit3, CheckCircle, XCircle } from 'lucide-react';
import { Department, UserRole } from '../types/drm';

interface Props {
  departments: Department[];
  userRole: UserRole;
  onSaveDepartment: (dept: Department) => void;
}

export const DepartmentManagement: React.FC<Props> = ({
  departments,
  userRole,
  onSaveDepartment
}) => {
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenAdd = () => {
    setEditingDept({
      id: `DEP-0${departments.length + 1}`,
      name: '',
      code: '',
      headEmail: 'dept.head@company.com',
      headName: '',
      active: true,
      description: '',
      indicatorCount: 0
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (d: Department) => {
    setEditingDept({ ...d });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDept || !editingDept.name.trim()) return;
    onSaveDepartment(editingDept);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Department Hierarchy & Leadership</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Operational divisions, assigned department heads, and DRM indicator distribution
          </p>
        </div>

        {userRole === 'ADMIN' && (
          <button
            onClick={handleOpenAdd}
            className="px-3.5 py-1.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 rounded-lg shadow-xs flex items-center gap-1.5 transition-colors whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Department</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {departments.map(d => (
          <div
            key={d.id}
            className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-sky-600 bg-sky-50 dark:bg-sky-950/60 px-2 py-0.5 rounded">
                {d.code}
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                d.active ? 'bg-teal-50 text-teal-700 dark:bg-teal-950/40' : 'bg-slate-100 text-slate-500'
              }`}>
                {d.active ? 'Active' : 'Deactivated'}
              </span>
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">{d.name}</h3>
              <p className="text-xs text-slate-500 mt-1">{d.description}</p>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Department Head:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{d.headName || d.headEmail}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Email:</span>
                <span className="font-mono text-slate-500 text-[11px]">{d.headEmail}</span>
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="text-slate-400">Indicators Assigned:</span>
                <span className="font-mono font-bold text-sky-600">{d.indicatorCount} DRM</span>
              </div>
            </div>

            {userRole === 'ADMIN' && (
              <div className="pt-2 text-right">
                <button
                  onClick={() => handleOpenEdit(d)}
                  className="px-3 py-1 text-xs font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg transition-colors"
                >
                  Edit Configuration
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {isModalOpen && editingDept && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Department Details</h3>
            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Department Name *</label>
                <input
                  type="text"
                  required
                  value={editingDept.name}
                  onChange={e => setEditingDept({ ...editingDept, name: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Department Code</label>
                <input
                  type="text"
                  required
                  value={editingDept.code}
                  onChange={e => setEditingDept({ ...editingDept, code: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 font-mono"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Head of Department Name</label>
                <input
                  type="text"
                  value={editingDept.headName}
                  onChange={e => setEditingDept({ ...editingDept, headName: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Head Email</label>
                <input
                  type="email"
                  required
                  value={editingDept.headEmail}
                  onChange={e => setEditingDept({ ...editingDept, headEmail: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Operational Scope</label>
                <textarea
                  rows={2}
                  value={editingDept.description}
                  onChange={e => setEditingDept({ ...editingDept, description: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingDept.active}
                    onChange={e => setEditingDept({ ...editingDept, active: e.target.checked })}
                    className="rounded text-sky-600 focus:ring-sky-500"
                  />
                  <span className="font-medium text-slate-700 dark:text-slate-300">Active Status</span>
                </label>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg font-semibold shadow-xs"
                  >
                    Save
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
