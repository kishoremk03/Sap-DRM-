import React, { useState } from 'react';
import { ClipboardList, Search, ShieldCheck } from 'lucide-react';
import { AuditLog, UserRole } from '../types/drm';

interface Props {
  logs: AuditLog[];
  userRole: UserRole;
}

export const AuditLogsView: React.FC<Props> = ({ logs, userRole }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [moduleFilter, setModuleFilter] = useState('ALL');

  const filtered = logs.filter(l => {
    const term = searchTerm.toLowerCase();
    const matchSearch = l.auditId.toLowerCase().includes(term) ||
      l.details.toLowerCase().includes(term) ||
      l.recordId.toLowerCase().includes(term) ||
      l.userEmail.toLowerCase().includes(term);
    const matchModule = moduleFilter === 'ALL' || l.module === moduleFilter;
    return matchSearch && matchModule;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Immutable System Audit Trail</h1>
            <span className="text-xs text-teal-600 bg-teal-50 dark:bg-teal-950/50 px-2 py-0.5 rounded font-semibold border border-teal-200 dark:border-teal-800 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Tamper-Proof Ledger</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Synchronized log of all database mutations, SAP uploads, indicator modifications, and executive approvals
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search user, record ID, details..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-hidden w-60"
            />
          </div>

          <select
            value={moduleFilter}
            onChange={e => setModuleFilter(e.target.value)}
            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-hidden"
          >
            <option value="ALL">All Modules</option>
            <option value="INDICATORS">INDICATORS</option>
            <option value="ACTUALS">ACTUALS</option>
            <option value="APPROVALS">APPROVALS</option>
            <option value="SAP_UPLOADS">SAP_UPLOADS</option>
            <option value="CAPA">CAPA</option>
            <option value="DEPARTMENTS">DEPARTMENTS</option>
          </select>
        </div>
      </div>

      {/* Audit Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 border-b border-slate-200/80 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4 font-semibold">Audit ID</th>
                <th className="py-3 px-4 font-semibold">Timestamp</th>
                <th className="py-3 px-4 font-semibold">User Identity</th>
                <th className="py-3 px-4 font-semibold">Module</th>
                <th className="py-3 px-4 font-semibold">Action</th>
                <th className="py-3 px-4 font-semibold">Record ID</th>
                <th className="py-3 px-4 font-semibold">Change Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map(l => (
                <tr key={l.auditId} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 font-mono font-medium text-slate-400 whitespace-nowrap">{l.auditId}</td>
                  <td className="py-3 px-4 text-slate-500 tabular-nums whitespace-nowrap">{new Date(l.timestamp).toLocaleString()}</td>
                  <td className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-200 whitespace-nowrap">{l.userEmail}</td>
                  <td className="py-3 px-4 font-mono whitespace-nowrap">
                    <span className="bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 px-2 py-0.5 rounded text-[10px] font-bold">
                      {l.module}
                    </span>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap font-bold text-slate-700 dark:text-slate-300">{l.action}</td>
                  <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-400 whitespace-nowrap">{l.recordId}</td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400 max-w-md">
                    {l.details}
                    {l.previousValue && (
                      <span className="block text-[10px] text-slate-400 font-mono mt-0.5">
                        Old: {l.previousValue} → New: {l.newValue}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
