import React, { useState } from 'react';
import {
  X, Copy, Check, Download, ExternalLink, Terminal,
  Cloud, FileCode, CheckCircle2, ChevronRight
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const GasDeploymentModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'GUIDE' | 'CODE_GS' | 'INDEX_HTML'>('GUIDE');
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedHtml, setCopiedHtml] = useState(false);

  if (!isOpen) return null;

  const handleDownloadCodeGs = () => {
    fetch('/Code.gs')
      .then(r => r.text())
      .then(text => {
        const blob = new Blob([text], { type: 'text/javascript' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'Code.gs';
        a.click();
      })
      .catch(() => {
        window.open('/Code.gs', '_blank');
      });
  };

  const handleDownloadIndexHtml = () => {
    fetch('/Index.html')
      .then(r => r.text())
      .then(text => {
        const blob = new Blob([text], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'Index.html';
        a.click();
      })
      .catch(() => {
        window.open('/Index.html', '_blank');
      });
  };

  const handleCopyCodeGs = () => {
    fetch('/Code.gs')
      .then(r => r.text())
      .then(text => {
        navigator.clipboard.writeText(text);
        setCopiedCode(true);
        setTimeout(() => setCopiedCode(false), 2500);
      });
  };

  const handleCopyIndexHtml = () => {
    fetch('/Index.html')
      .then(r => r.text())
      .then(text => {
        navigator.clipboard.writeText(text);
        setCopiedHtml(true);
        setTimeout(() => setCopiedHtml(false), 2500);
      });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-sky-600 text-white flex items-center justify-center font-bold text-xs">
              GAS
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Google Apps Script Web App Deployment Hub</h2>
              <p className="text-xs text-slate-500">Standalone Code.gs & Index.html package ready for script.google.com</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Strip */}
        <div className="flex items-center gap-1 px-5 pt-3 border-b border-slate-100 dark:border-slate-800 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('GUIDE')}
            className={`px-4 py-2 border-b-2 transition-colors ${
              activeTab === 'GUIDE'
                ? 'border-sky-600 text-sky-600 dark:text-sky-400'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Deployment Walkthrough
          </button>
          <button
            onClick={() => setActiveTab('CODE_GS')}
            className={`px-4 py-2 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'CODE_GS'
                ? 'border-sky-600 text-sky-600 dark:text-sky-400'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>Code.gs</span>
          </button>
          <button
            onClick={() => setActiveTab('INDEX_HTML')}
            className={`px-4 py-2 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'INDEX_HTML'
                ? 'border-sky-600 text-sky-600 dark:text-sky-400'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>Index.html</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs flex-1">
          {activeTab === 'GUIDE' && (
            <div className="space-y-4">
              <div className="p-4 bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 rounded-xl">
                <h4 className="font-bold text-sky-900 dark:text-sky-200 mb-1">
                  100% Production Google Apps Script Web App
                </h4>
                <p className="text-sky-700 dark:text-sky-300 leading-relaxed">
                  Both required standalone source files (<span className="font-mono font-bold">Code.gs</span> and <span className="font-mono font-bold">Index.html</span>) are fully generated in the root of this project and packaged for direct deployment to Google Drive.
                </p>
              </div>

              <div className="space-y-3">
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">4-Step Deployment Instructions:</h3>

                <div className="space-y-2.5">
                  <div className="flex items-start gap-3 bg-slate-50 dark:bg-slate-800 p-3 rounded-xl">
                    <span className="w-5 h-5 rounded-full bg-sky-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0">1</span>
                    <div>
                      <strong className="text-slate-800 dark:text-slate-200 block">Open Google Apps Script</strong>
                      <span className="text-slate-500">
                        Visit <a href="https://script.google.com" target="_blank" rel="noreferrer" className="text-sky-600 underline font-semibold">script.google.com</a> and click <span className="font-semibold text-slate-700 dark:text-slate-300">New Project</span>.
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 bg-slate-50 dark:bg-slate-800 p-3 rounded-xl">
                    <span className="w-5 h-5 rounded-full bg-sky-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0">2</span>
                    <div>
                      <strong className="text-slate-800 dark:text-slate-200 block">Paste Code.gs</strong>
                      <span className="text-slate-500">
                        Copy the contents of <span className="font-mono font-semibold">Code.gs</span> and paste them into the default script file.
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 bg-slate-50 dark:bg-slate-800 p-3 rounded-xl">
                    <span className="w-5 h-5 rounded-full bg-sky-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0">3</span>
                    <div>
                      <strong className="text-slate-800 dark:text-slate-200 block">Add Index.html</strong>
                      <span className="text-slate-500">
                        Click <span className="font-semibold">+ &gt; HTML</span>, name the file <span className="font-mono font-semibold">Index</span> (or Index.html), and paste the contents of <span className="font-mono font-semibold">Index.html</span>.
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 bg-slate-50 dark:bg-slate-800 p-3 rounded-xl">
                    <span className="w-5 h-5 rounded-full bg-sky-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0">4</span>
                    <div>
                      <strong className="text-slate-800 dark:text-slate-200 block">Deploy as Web App</strong>
                      <span className="text-slate-500">
                        Click <span className="font-semibold">Deploy &gt; New deployment &gt; Select type: Web app</span>. Set <span className="font-semibold">Execute as: Me</span> and <span className="font-semibold">Who has access: Anyone with Google account</span> (or Anyone), then click <span className="font-semibold">Deploy</span>!
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 1-Click File Downloads */}
              <div className="pt-2 flex items-center gap-3">
                <button
                  onClick={handleDownloadCodeGs}
                  className="px-4 py-2 bg-slate-900 dark:bg-sky-600 hover:bg-slate-800 text-white font-semibold rounded-lg flex items-center gap-2 shadow-xs"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Code.gs</span>
                </button>
                <button
                  onClick={handleDownloadIndexHtml}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white font-semibold rounded-lg flex items-center gap-2 shadow-xs"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Index.html</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'CODE_GS' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-700 dark:text-slate-300">File: /Code.gs (Google Apps Script Backend)</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyCodeGs}
                    className="px-3 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded text-slate-700 dark:text-slate-300 font-medium flex items-center gap-1.5"
                  >
                    {copiedCode ? <Check className="w-3.5 h-3.5 text-teal-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCode ? 'Copied!' : 'Copy Code.gs'}</span>
                  </button>
                  <button
                    onClick={handleDownloadCodeGs}
                    className="px-3 py-1 bg-sky-600 hover:bg-sky-500 text-white rounded font-medium flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </button>
                </div>
              </div>
              <div className="bg-slate-950 text-slate-200 p-4 rounded-xl font-mono text-[11px] h-96 overflow-y-auto leading-relaxed border border-slate-800">
                <pre>{`/**
 * SAP DRM DIGITAL MANAGEMENT SYSTEM
 * Platform: Google Apps Script + Google Drive + Google Sheets
 * File: Code.gs
 */

// Initialized with full database creation, role-based security,
// 48 DRM indicators, 7 automotive departments, and audit logging.
// View full file directly at root: /Code.gs`}</pre>
              </div>
            </div>
          )}

          {activeTab === 'INDEX_HTML' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-700 dark:text-slate-300">File: /Index.html (Google Apps Script Frontend)</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyIndexHtml}
                    className="px-3 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded text-slate-700 dark:text-slate-300 font-medium flex items-center gap-1.5"
                  >
                    {copiedHtml ? <Check className="w-3.5 h-3.5 text-teal-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedHtml ? 'Copied!' : 'Copy Index.html'}</span>
                  </button>
                  <button
                    onClick={handleDownloadIndexHtml}
                    className="px-3 py-1 bg-teal-600 hover:bg-teal-500 text-white rounded font-medium flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </button>
                </div>
              </div>
              <div className="bg-slate-950 text-slate-200 p-4 rounded-xl font-mono text-[11px] h-96 overflow-y-auto leading-relaxed border border-slate-800">
                <pre>{`<!DOCTYPE html>
<html lang="en">
<head>
  <title>SAP DRM Digital Management System</title>
  <!-- Full self-contained Google Apps Script web app template -->
  <!-- View full file directly at root: /Index.html -->
</head>`}</pre>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Enterprise automotive standard IATF 16949 / ISO 9001 compliance</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
