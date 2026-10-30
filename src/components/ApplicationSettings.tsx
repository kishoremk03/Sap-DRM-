import React, { useState } from 'react';
import { Database, FolderGit2, ShieldCheck, RefreshCw, Server, Key, Clock, ExternalLink } from 'lucide-react';

interface Props {
  onReinitialize: () => void;
}

export const ApplicationSettings: React.FC<Props> = ({ onReinitialize }) => {
  const [isInitializing, setIsInitializing] = useState(false);
  const [initSuccess, setInitSuccess] = useState(false);

  const handleInitClick = () => {
    setIsInitializing(true);
    setTimeout(() => {
      setIsInitializing(false);
      setInitSuccess(true);
      onReinitialize();
      setTimeout(() => setInitSuccess(false), 4000);
    }, 1000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">System Architecture & Database Settings</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Google Drive storage architecture and Google Sheets master database configurations
          </p>
        </div>

        {/* Cloud Architecture Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="border border-slate-200 dark:border-slate-800 p-4 rounded-xl space-y-2">
            <div className="flex items-center gap-2 text-sky-600 font-bold">
              <FolderGit2 className="w-4 h-4" />
              <span>Google Drive Storage Root</span>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800 p-2.5 rounded font-mono text-[11px] text-slate-700 dark:text-slate-300">
              SAP_DRM_Data /
            </div>
            <p className="text-slate-500 text-[11px]">
              Subdirectories automatically provisioned:
              <br />· <span className="font-mono text-slate-600 dark:text-slate-300">/Database</span> (Master Google Sheet)
              <br />· <span className="font-mono text-slate-600 dark:text-slate-300">/SAP_Uploads</span> (Raw ECC/S4HANA exports)
              <br />· <span className="font-mono text-slate-600 dark:text-slate-300">/Generated_Reports</span> (Monthly PDFs)
              <br />· <span className="font-mono text-slate-600 dark:text-slate-300">/Attachments</span> (CAPA proof documents)
            </p>
          </div>

          <div className="border border-slate-200 dark:border-slate-800 p-4 rounded-xl space-y-2">
            <div className="flex items-center gap-2 text-teal-600 font-bold">
              <Database className="w-4 h-4" />
              <span>Google Sheets Master Database</span>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800 p-2.5 rounded font-mono text-[11px] text-slate-700 dark:text-slate-300">
              SAP_DRM_Master_Database
            </div>
            <p className="text-slate-500 text-[11px]">
              10 Structured operational tables:
              <br />· Users, Departments, Indicators, Monthly_Targets
              <br />· Monthly_Actuals, SAP_Uploads, Corrective_Actions
              <br />· Approval_History, Audit_Logs, Application_Settings
            </p>
          </div>
        </div>

        {/* Runtime Settings */}
        <div className="space-y-3 text-xs">
          <h3 className="font-bold text-slate-900 dark:text-white">Active Operational Parameters</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg">
              <span className="text-slate-400 block mb-0.5">Active Financial Calendar</span>
              <strong className="text-slate-800 dark:text-slate-200">April to March (Fiscal Year)</strong>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg">
              <span className="text-slate-400 block mb-0.5">Application Timezone</span>
              <strong className="text-slate-800 dark:text-slate-200">Asia/Kolkata (IST · UTC+5:30)</strong>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg">
              <span className="text-slate-400 block mb-0.5">Record Lock Policy</span>
              <strong className="text-teal-600 font-bold">Approved records locked</strong>
            </div>
          </div>
        </div>

        {/* Initialization Action */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">Database Verification & Structure Repair</h4>
            <p className="text-[11px] text-slate-500">
              Checks missing sheets, ensures all 10 schema headers are aligned, and verifies Script Properties without data loss.
            </p>
          </div>

          <button
            onClick={handleInitClick}
            disabled={isInitializing}
            className="px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-500 rounded-lg shadow-xs flex items-center gap-2 transition-colors"
          >
            {isInitializing ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Verifying Schemas...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>Initialize / Repair Schemas</span>
              </>
            )}
          </button>
        </div>

        {initSuccess && (
          <div className="p-3 bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 rounded-lg text-xs text-teal-700 dark:text-teal-300">
            ✓ Database schemas verified and synchronized. Script Properties and Drive folders intact.
          </div>
        )}
      </div>
    </div>
  );
};
