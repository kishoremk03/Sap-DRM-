import React from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  X,
  ExternalLink,
  Award,
  Sparkles,
  ArrowRight,
  FileCheck,
} from 'lucide-react';
import { auditUpiCompliance } from '../data/upiComplianceRules';

interface UpiComplianceModalProps {
  isOpen: boolean;
  onClose: () => void;
  merchantUpiId?: string;
  merchantName?: string;
  isUserLoggedIn?: boolean;
  isBankVerified?: boolean;
  onOpenAuth: () => void;
  onOpenBank: () => void;
  isDark: boolean;
}

export const UpiComplianceModal: React.FC<UpiComplianceModalProps> = ({
  isOpen,
  onClose,
  merchantUpiId,
  merchantName,
  isUserLoggedIn,
  isBankVerified,
  onOpenAuth,
  onOpenBank,
  isDark,
}) => {
  if (!isOpen) return null;

  const audit = auditUpiCompliance({
    merchantUpiId,
    merchantName,
    isUserLoggedIn,
    isBankVerified,
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in">
      <div
        className={`w-full max-w-2xl rounded-3xl p-6 sm:p-7 border shadow-2xl relative overflow-hidden max-h-[90vh] overflow-y-auto ${
          isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Top ambient highlight */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-500" />

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base">NPCI UPI 2.0 Compliance &amp; Rule Engine</h3>
              <p className="text-xs text-slate-400">
                Official Regulatory Guidelines &amp; Audit Status
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Score Card Banner */}
        <div
          className={`p-5 rounded-3xl border mb-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
            audit.isFullyCompliant
              ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
              : 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300'
          }`}
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-2xl sm:text-3xl font-black font-mono">
                {audit.score}%
              </span>
              <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-black/20">
                {audit.isFullyCompliant ? '100% Fully Compliant' : 'Compliant — Minor Actions Pending'}
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed max-w-md">
              {audit.isFullyCompliant
                ? 'All NPCI UPI 2.0 specifications, RBI merchant settlement protocols, dual-factor authentication, and IFSC penny-drop standards are fulfilled.'
                : 'Complete the remaining items below to ensure full compliance with NPCI digital payment safety mandates.'}
            </p>
          </div>

          <div className="flex sm:flex-col gap-2 shrink-0">
            {!isUserLoggedIn && (
              <button
                onClick={() => {
                  onClose();
                  onOpenAuth();
                }}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-500 text-slate-950 text-xs font-bold cursor-pointer hover:bg-emerald-400"
              >
                Complete Mobile OTP
              </button>
            )}
            {!isBankVerified && (
              <button
                onClick={() => {
                  onClose();
                  onOpenBank();
                }}
                className="px-3.5 py-1.5 rounded-xl bg-cyan-500 text-slate-950 text-xs font-bold cursor-pointer hover:bg-cyan-400"
              >
                Verify Bank (₹1.00)
              </button>
            )}
          </div>
        </div>

        {/* Rules Breakdown List */}
        <div className="space-y-3">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            NPCI UPI Mandatory Rules Checklist ({audit.passedCount}/{audit.totalCount} Passed)
          </div>

          <div className="space-y-2">
            {audit.rules.map((rule) => (
              <div
                key={rule.id}
                className={`p-3.5 rounded-2xl border text-xs transition-all ${
                  rule.isCompliant
                    ? isDark
                      ? 'bg-slate-950/60 border-slate-800'
                      : 'bg-slate-50 border-slate-200'
                    : 'bg-amber-500/10 border-amber-500/40 text-amber-300'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    {rule.isCompliant ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-200">{rule.title}</span>
                        <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700">
                          {rule.ruleCode}
                        </span>
                      </div>
                      <p className="text-slate-400 mt-0.5 text-[11px] leading-relaxed">
                        {rule.description}
                      </p>
                      <div className="text-[10px] text-cyan-400 font-mono mt-1">
                        Status: {rule.details}
                      </div>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 border ${
                      rule.isCompliant
                        ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                        : 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                    }`}
                  >
                    {rule.isCompliant ? 'PASS' : 'ACTION'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Authority: National Payments Corporation of India (NPCI)</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold cursor-pointer"
          >
            Close Audit
          </button>
        </div>
      </div>
    </div>
  );
};
