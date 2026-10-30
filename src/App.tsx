import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard, ListChecks, Calendar, FileUp, CheckSquare,
  AlertTriangle, Building2, FileSpreadsheet, History, ClipboardList,
  Settings, Moon, Sun, CloudUpload, ShieldCheck, ChevronLeft,
  ChevronRight, Users, Bell, ArrowRight
} from 'lucide-react';
import {
  Department, DrmIndicator, MonthlyRecord, CorrectiveAction,
  SapUpload, AuditLog, UserRole
} from './types/drm';
import {
  DEFAULT_DEPARTMENTS, DEFAULT_INDICATORS, FINANCIAL_YEARS,
  MONTHS, generateInitialRecords, INITIAL_CAPAS,
  INITIAL_UPLOADS, INITIAL_AUDIT_LOGS, evaluateCompliance
} from './data/drmMasterData';

import { ExecutiveDashboard } from './components/ExecutiveDashboard';
import { IndicatorRegister } from './components/IndicatorRegister';
import { MonthlyTracking } from './components/MonthlyTracking';
import { SapDataImport } from './components/SapDataImport';
import { ApprovalCenter } from './components/ApprovalCenter';
import { CorrectiveActionsView } from './components/CorrectiveActionsView';
import { DepartmentManagement } from './components/DepartmentManagement';
import { ReportsExports } from './components/ReportsExports';
import { AuditLogsView } from './components/AuditLogsView';
import { ApplicationSettings } from './components/ApplicationSettings';
import { GasDeploymentModal } from './components/GasDeploymentModal';

const STORAGE_KEYS = {
  RECORDS: 'sap_drm_records_v1',
  INDICATORS: 'sap_drm_indicators_v1',
  DEPARTMENTS: 'sap_drm_departments_v1',
  CAPAS: 'sap_drm_capas_v1',
  UPLOADS: 'sap_drm_uploads_v1',
  AUDIT: 'sap_drm_audit_v1'
};

export const App: React.FC = () => {
  // Navigation & Filtering State
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [selectedFy, setSelectedFy] = useState<string>('FY 2026-2027');
  const [selectedMonth, setSelectedMonth] = useState<string>('October');
  const [selectedDept, setSelectedDept] = useState<string>('ALL');
  const [userRole, setUserRole] = useState<UserRole>('ADMIN');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isGasModalOpen, setIsGasModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'info' | 'success' | 'error' } | null>(null);

  // Core Data State
  const [departments, setDepartments] = useState<Department[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.DEPARTMENTS);
    return saved ? JSON.parse(saved) : DEFAULT_DEPARTMENTS;
  });

  const [indicators, setIndicators] = useState<DrmIndicator[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.INDICATORS);
    return saved ? JSON.parse(saved) : DEFAULT_INDICATORS;
  });

  const [records, setRecords] = useState<MonthlyRecord[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.RECORDS);
    return saved ? JSON.parse(saved) : generateInitialRecords();
  });

  const [correctiveActions, setCorrectiveActions] = useState<CorrectiveAction[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CAPAS);
    return saved ? JSON.parse(saved) : INITIAL_CAPAS;
  });

  const [uploads, setUploads] = useState<SapUpload[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.UPLOADS);
    return saved ? JSON.parse(saved) : INITIAL_UPLOADS;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.AUDIT);
    return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
  });

  // Sync state to LocalStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DEPARTMENTS, JSON.stringify(departments));
  }, [departments]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.INDICATORS, JSON.stringify(indicators));
  }, [indicators]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(records));
  }, [records]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CAPAS, JSON.stringify(correctiveActions));
  }, [correctiveActions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.UPLOADS, JSON.stringify(uploads));
  }, [uploads]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.AUDIT, JSON.stringify(auditLogs));
  }, [auditLogs]);

  // Toast Helper
  const showToast = (text: string, type: 'info' | 'success' | 'error' = 'info') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3200);
  };

  // Add audit log helper
  const addAuditEntry = (module: string, action: string, recordId: string, details: string, prev?: string, next?: string) => {
    const newLog: AuditLog = {
      auditId: `AUD-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toISOString(),
      userEmail: userRole === 'ADMIN' ? 'admin@company.com' : userRole === 'DEPT_HEAD' ? 'quality.head@company.com' : 'user@company.com',
      module,
      action,
      recordId,
      previousValue: prev,
      newValue: next,
      details
    };
    setAuditLogs(prevLogs => [newLog, ...prevLogs]);
  };

  // Record Update Handler
  const handleUpdateActual = (recordId: string, actual: number | null, remarks: string) => {
    setRecords(prev => prev.map(r => {
      if (r.id !== recordId) return r;
      const ind = indicators.find(i => i.id === r.indicatorId);
      const evalRes = ind
        ? evaluateCompliance(ind.calculationMethod, actual, r.targetValue, ind.toleranceMin, ind.toleranceMax)
        : { status: 'Not Reported' as const, achievementPct: null, variance: null };

      return {
        ...r,
        actualValue: actual,
        variance: evalRes.variance,
        achievementPct: evalRes.achievementPct,
        complianceStatus: evalRes.status,
        remarks: remarks || r.remarks,
        updatedAt: new Date().toISOString(),
        updatedBy: userRole === 'ADMIN' ? 'admin@company.com' : 'suresh.kumar@company.com'
      };
    }));
    showToast(`Updated actual value for record ${recordId}`, 'success');
  };

  // Single Submit
  const handleSubmitRecord = (recordId: string) => {
    setRecords(prev => prev.map(r => {
      if (r.id !== recordId) return r;
      return {
        ...r,
        status: 'Submitted',
        submittedAt: new Date().toISOString(),
        submittedBy: 'suresh.kumar@company.com'
      };
    }));
    addAuditEntry('ACTUALS', 'SUBMIT', recordId, 'Submitted monthly actual for department review');
    showToast(`Record ${recordId} submitted for Department Head sign-off`, 'success');
  };

  // Batch Submit
  const handleBatchSubmit = () => {
    let count = 0;
    setRecords(prev => prev.map(r => {
      if (r.financialYear === selectedFy && r.month === selectedMonth && r.status === 'Draft' && r.actualValue !== null) {
        count++;
        return {
          ...r,
          status: 'Submitted',
          submittedAt: new Date().toISOString(),
          submittedBy: 'suresh.kumar@company.com'
        };
      }
      return r;
    }));
    addAuditEntry('ACTUALS', 'BATCH_SUBMIT', `${selectedMonth}-${selectedFy}`, `Batch submitted ${count} indicators`);
    showToast(`Successfully submitted ${count} draft records for review`, 'success');
  };

  // Reopen Record
  const handleReopenRecord = (recordId: string) => {
    setRecords(prev => prev.map(r => {
      if (r.id !== recordId) return r;
      return {
        ...r,
        status: 'Draft'
      };
    }));
    addAuditEntry('ACTUALS', 'REOPEN', recordId, 'Administrative reopening of locked record');
    showToast(`Record ${recordId} unlocked and returned to Draft for corrections`, 'info');
  };

  // Review / Sign-off
  const handleReviewRecord = (recordId: string, action: 'APPROVE' | 'REJECT', comments: string) => {
    const newStatus = action === 'APPROVE' ? 'Approved' : 'Rejected';
    setRecords(prev => prev.map(r => {
      if (r.id !== recordId) return r;
      return {
        ...r,
        status: newStatus,
        remarks: comments ? `${r.remarks ? r.remarks + ' | ' : ''}Reviewer: ${comments}` : r.remarks,
        approvedAt: action === 'APPROVE' ? new Date().toISOString() : undefined,
        approvedBy: action === 'APPROVE' ? 'approver@company.com' : undefined
      };
    }));
    addAuditEntry('APPROVALS', action, recordId, comments || `${action} by reviewer`);
    showToast(`Record ${recordId} marked as ${newStatus}`, action === 'APPROVE' ? 'success' : 'info');
  };

  // Save Indicator
  const handleSaveIndicator = (newInd: DrmIndicator) => {
    setIndicators(prev => {
      const idx = prev.findIndex(i => i.id === newInd.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = newInd;
        return copy;
      }
      return [...prev, newInd];
    });
    addAuditEntry('INDICATORS', 'SAVE', newInd.id, `Saved definition for ${newInd.name}`);
    showToast(`Indicator ${newInd.id} saved successfully`, 'success');
  };

  // Save Department
  const handleSaveDepartment = (newDept: Department) => {
    setDepartments(prev => {
      const idx = prev.findIndex(d => d.id === newDept.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = newDept;
        return copy;
      }
      return [...prev, newDept];
    });
    addAuditEntry('DEPARTMENTS', 'SAVE', newDept.id, `Saved department ${newDept.name}`);
    showToast(`Department ${newDept.name} saved successfully`, 'success');
  };

  // Save CAPA
  const handleSaveCapa = (action: CorrectiveAction) => {
    setCorrectiveActions(prev => {
      const idx = prev.findIndex(a => a.actionId === action.actionId);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = action;
        return copy;
      }
      return [action, ...prev];
    });
    addAuditEntry('CAPA', 'CREATE', action.actionId, `Created CAPA for ${action.indicatorId}`);
    showToast(`CAPA ${action.actionId} created`, 'success');
  };

  const handleUpdateCapaStatus = (actionId: string, newStatus: CorrectiveAction['status']) => {
    setCorrectiveActions(prev => prev.map(a => {
      if (a.actionId !== actionId) return a;
      return {
        ...a,
        status: newStatus,
        closedAt: newStatus === 'Closed' ? new Date().toISOString() : undefined
      };
    }));
    addAuditEntry('CAPA', 'STATUS_CHANGE', actionId, `Status updated to ${newStatus}`);
    showToast(`CAPA ${actionId} marked as ${newStatus}`, 'success');
  };

  // Import Success Callback
  const handleImportSuccess = (newUpload: SapUpload, count: number) => {
    setUploads(prev => [newUpload, ...prev]);
    addAuditEntry('SAP_UPLOADS', 'INGEST', newUpload.uploadId, `Ingested ${count} records from ${newUpload.fileName}`);
    showToast(`Successfully processed ${count} records from SAP export`, 'success');
  };

  const toggleDarkMode = () => {
    document.documentElement.classList.toggle('dark');
  };

  return (
    <div className="min-h-screen bg-[#F4F7FA] dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col antialiased">
      {/* TOP BAR CONTRACT: [Wordmark] — [Nav / Metadata / Role] — [Primary Action] */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 px-6 py-3 flex items-center justify-between gap-8 transition-colors">
        {/* Zone 1: Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-sky-600 to-teal-500 flex items-center justify-center text-white shadow-xs font-bold text-sm tracking-wider">
            DRM
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap">
              SAP DRM Digital System
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium whitespace-nowrap">
              Automotive Operations & Performance Management
            </span>
          </div>
        </div>

        {/* Zone 2: Navigation Links / Filters */}
        <div className="hidden lg:flex items-center gap-4 text-xs font-medium">
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800/60 px-3 py-1.5 rounded-lg border border-slate-200/60 dark:border-slate-800">
            <span className="text-slate-400">Financial Year:</span>
            <select
              value={selectedFy}
              onChange={e => setSelectedFy(e.target.value)}
              className="bg-transparent font-bold text-slate-800 dark:text-slate-200 focus:outline-hidden cursor-pointer"
            >
              {FINANCIAL_YEARS.map(f => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800/60 px-3 py-1.5 rounded-lg border border-slate-200/60 dark:border-slate-800">
            <span className="text-slate-400">Current Role:</span>
            <select
              value={userRole}
              onChange={e => setUserRole(e.target.value as UserRole)}
              className="bg-transparent font-bold text-sky-600 dark:text-sky-400 focus:outline-hidden cursor-pointer"
            >
              <option value="ADMIN">Administrator (Full Control)</option>
              <option value="DEPT_HEAD">Department Head (Approvals)</option>
              <option value="DEPT_USER">Department User (Data Entry)</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
            <ShieldCheck className="w-4 h-4 text-teal-500" />
            <span className="font-mono text-[11px]">
              {userRole === 'ADMIN' ? 'admin@company.com' : userRole === 'DEPT_HEAD' ? 'quality.head@company.com' : 'suresh.kumar@company.com'}
            </span>
          </div>
        </div>

        {/* Zone 3: Actions */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Toggle theme"
          >
            <Moon className="w-4 h-4 dark:hidden" />
            <Sun className="w-4 h-4 hidden dark:block" />
          </button>

          <button
            onClick={() => setIsGasModalOpen(true)}
            className="px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 dark:bg-sky-600 hover:bg-slate-800 dark:hover:bg-sky-500 rounded-lg shadow-xs flex items-center gap-2 transition-colors whitespace-nowrap shrink-0"
          >
            <CloudUpload className="w-4 h-4" />
            <span>GAS Setup & Deploy</span>
          </button>
        </div>
      </header>

      {/* WORKSPACE: Sidebar + Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* COLLAPSIBLE SIDEBAR */}
        <aside
          className={`bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800 flex flex-col shrink-0 transition-all duration-200 ${
            isSidebarCollapsed ? 'w-16' : 'w-64'
          }`}
        >
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            {!isSidebarCollapsed && (
              <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                OPERATIONAL MODULES
              </span>
            )}
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {isSidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>

          <nav className="flex-1 p-2 space-y-1 overflow-y-auto text-xs font-medium">
            {[
              { id: 'dashboard', label: 'Executive Dashboard', icon: LayoutDashboard, color: 'text-sky-600' },
              { id: 'indicators', label: 'DRM Indicator Register', icon: ListChecks, color: 'text-teal-600' },
              { id: 'monthly', label: 'Monthly Tracking', icon: Calendar, color: 'text-blue-600' },
              { id: 'sap_upload', label: 'SAP Data Import', icon: FileUp, color: 'text-cyan-600' },
              { id: 'approvals', label: 'Approval Center', icon: CheckSquare, color: 'text-emerald-600' },
              { id: 'capa', label: 'Corrective Actions (CAPA)', icon: AlertTriangle, color: 'text-amber-600' },
              { id: 'departments', label: 'Plant Departments', icon: Building2, color: 'text-indigo-600' },
              { id: 'reports', label: 'Reports & Exports', icon: FileSpreadsheet, color: 'text-slate-600' },
              { id: 'audit', label: 'System Audit Logs', icon: ClipboardList, color: 'text-rose-600' },
              { id: 'settings', label: 'Application Settings', icon: Settings, color: 'text-slate-600' }
            ].map(item => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentView(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left ${
                    isActive
                      ? 'bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 font-semibold shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                  title={isSidebarCollapsed ? item.label : undefined}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${item.color}`} />
                  {!isSidebarCollapsed && <span className="truncate">{item.label}</span>}
                </button>
              );
            })}
          </nav>

          {/* Sidebar Footer */}
          {!isSidebarCollapsed && (
            <div className="p-3.5 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500">
              <div className="flex items-center justify-between font-semibold mb-1">
                <span>Google Drive Storage</span>
                <span className="text-teal-600 font-mono text-[10px]">SAP_DRM_Data</span>
              </div>
              <p className="text-[10px] text-slate-400 leading-tight">
                Automotive plant IATF 16949 & ISO 9001 governance engine
              </p>
            </div>
          )}
        </aside>

        {/* MAIN VIEWPORT */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
          {currentView === 'dashboard' && (
            <ExecutiveDashboard
              records={records}
              indicators={indicators}
              departments={departments}
              selectedFy={selectedFy}
              selectedMonth={selectedMonth}
              selectedDept={selectedDept}
              onSelectFy={setSelectedFy}
              onSelectMonth={setSelectedMonth}
              onSelectDept={setSelectedDept}
              onRaiseCapa={(indId, deptId) => {
                setCurrentView('capa');
              }}
              onNavigateToTracking={() => setCurrentView('monthly')}
            />
          )}

          {currentView === 'indicators' && (
            <IndicatorRegister
              indicators={indicators}
              departments={departments}
              userRole={userRole}
              onSaveIndicator={handleSaveIndicator}
            />
          )}

          {currentView === 'monthly' && (
            <MonthlyTracking
              records={records}
              indicators={indicators}
              departments={departments}
              selectedFy={selectedFy}
              selectedMonth={selectedMonth}
              selectedDept={selectedDept}
              userRole={userRole}
              onSelectFy={setSelectedFy}
              onSelectMonth={setSelectedMonth}
              onSelectDept={setSelectedDept}
              onUpdateActual={handleUpdateActual}
              onSubmitRecord={handleSubmitRecord}
              onBatchSubmit={handleBatchSubmit}
              onReopenRecord={handleReopenRecord}
              onRaiseCapa={() => setCurrentView('capa')}
            />
          )}

          {currentView === 'sap_upload' && (
            <SapDataImport
              departments={departments}
              indicators={indicators}
              uploads={uploads}
              selectedFy={selectedFy}
              selectedMonth={selectedMonth}
              onImportSuccess={handleImportSuccess}
            />
          )}

          {currentView === 'approvals' && (
            <ApprovalCenter
              records={records}
              indicators={indicators}
              departments={departments}
              userRole={userRole}
              selectedFy={selectedFy}
              selectedMonth={selectedMonth}
              onReviewRecord={handleReviewRecord}
            />
          )}

          {currentView === 'capa' && (
            <CorrectiveActionsView
              actions={correctiveActions}
              indicators={indicators}
              departments={departments}
              userRole={userRole}
              selectedFy={selectedFy}
              selectedMonth={selectedMonth}
              onSaveAction={handleSaveCapa}
              onUpdateStatus={handleUpdateCapaStatus}
            />
          )}

          {currentView === 'departments' && (
            <DepartmentManagement
              departments={departments}
              userRole={userRole}
              onSaveDepartment={handleSaveDepartment}
            />
          )}

          {currentView === 'reports' && (
            <ReportsExports
              records={records}
              indicators={indicators}
              departments={departments}
              actions={correctiveActions}
              uploads={uploads}
              selectedFy={selectedFy}
              selectedMonth={selectedMonth}
            />
          )}

          {currentView === 'audit' && (
            <AuditLogsView
              logs={auditLogs}
              userRole={userRole}
            />
          )}

          {currentView === 'settings' && (
            <ApplicationSettings
              onReinitialize={() => {
                setRecords(generateInitialRecords());
                showToast('Master sheets and Drive structures re-synchronized', 'success');
              }}
            />
          )}
        </main>
      </div>

      {/* GAS DEPLOYMENT MODAL */}
      <GasDeploymentModal
        isOpen={isGasModalOpen}
        onClose={() => setIsGasModalOpen(false)}
      />

      {/* FLOATING TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-2.5 rounded-lg shadow-xl text-white text-xs font-semibold bg-slate-900 border border-slate-700 animate-in fade-in slide-in-from-bottom-2">
          <div className={`w-2 h-2 rounded-full ${
            toastMessage.type === 'success' ? 'bg-teal-400' :
            toastMessage.type === 'error' ? 'bg-rose-400' : 'bg-sky-400'
          }`} />
          <span>{toastMessage.text}</span>
        </div>
      )}
    </div>
  );
};

export default App;
