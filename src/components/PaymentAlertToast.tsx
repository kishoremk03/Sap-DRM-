import React, { useEffect, useState } from 'react';
import { Volume2, CheckCircle2, X, Sparkles, ArrowUpRight, ShieldCheck } from 'lucide-react';
import { Transaction, SupportedLanguageCode } from '../types';
import { INDIAN_LANGUAGES } from '../data/languages';
import confetti from 'canvas-confetti';

interface PaymentAlertToastProps {
  transaction: Transaction | null;
  onDismiss: () => void;
  announcementLanguage: SupportedLanguageCode;
  isDark: boolean;
}

export const PaymentAlertToast: React.FC<PaymentAlertToastProps> = ({
  transaction,
  onDismiss,
  announcementLanguage,
  isDark,
}) => {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (!transaction) return;

    // Trigger celebration confetti for payments >= 200
    if (transaction.amount >= 200) {
      try {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.3 },
          colors: ['#00E599', '#00F2FE', '#F59E0B', '#3B82F6'],
        });
      } catch (_e) {
        // Confetti fallback
      }
    }

    setProgress(100);
    const duration = 8000;
    const intervalTime = 100;
    const step = (intervalTime / duration) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev <= 0) {
          clearInterval(timer);
          onDismiss();
          return 0;
        }
        return Math.max(0, prev - step);
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [transaction, onDismiss]);

  if (!transaction) return null;

  const langInfo = INDIAN_LANGUAGES.find((l) => l.code === announcementLanguage) || INDIAN_LANGUAGES[0];

  const getAppStyle = (app: string) => {
    const lower = app.toLowerCase();
    if (lower.includes('phonepe')) {
      return { bg: 'bg-[#5f259f]/20', border: 'border-[#5f259f]/50', text: 'text-[#a855f7]', name: 'PhonePe' };
    }
    if (lower.includes('google') || lower.includes('gpay')) {
      return { bg: 'bg-blue-500/20', border: 'border-blue-500/50', text: 'text-blue-400', name: 'Google Pay' };
    }
    if (lower.includes('paytm')) {
      return { bg: 'bg-cyan-500/20', border: 'border-cyan-500/50', text: 'text-cyan-400', name: 'Paytm' };
    }
    if (lower.includes('bhim')) {
      return { bg: 'bg-emerald-500/20', border: 'border-emerald-500/50', text: 'text-emerald-400', name: 'BHIM UPI' };
    }
    return { bg: 'bg-amber-500/20', border: 'border-amber-500/50', text: 'text-amber-400', name: app };
  };

  const appStyle = getAppStyle(transaction.sourceApp);

  return (
    <div className="fixed top-20 right-4 left-4 sm:left-auto sm:w-[440px] z-50 animate-in fade-in slide-in-from-top-6 duration-300">
      <div
        className={`relative overflow-hidden rounded-3xl border shadow-2xl backdrop-blur-xl ${
          isDark
            ? 'bg-slate-950/95 border-emerald-500/50 text-white shadow-emerald-500/20'
            : 'bg-white/95 border-emerald-500/40 text-slate-900 shadow-xl shadow-emerald-500/10'
        }`}
      >
        {/* Top Glowing Ambient Pulse Line */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-500" />

        {/* Progress bar */}
        <div
          className="absolute top-1.5 left-0 h-0.5 bg-emerald-500 transition-all duration-100 ease-linear"
          style={{ width: `${progress}%` }}
        />

        <div className="p-5 sm:p-6 space-y-4">
          {/* Header Row: Payment Status & Close */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
              </span>
              <span className="text-xs font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                Payment Received at QR
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${appStyle.bg} ${appStyle.border} ${appStyle.text}`}
              >
                {appStyle.name}
              </span>
              <button
                onClick={onDismiss}
                className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                aria-label="Dismiss alert"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Amount Hero */}
          <div className="flex items-baseline justify-between gap-4">
            <div>
              <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                Amount Credited
              </div>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono">₹</span>
                <span className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-emerald-400 tabular-nums">
                  {transaction.amount.toLocaleString('en-IN', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
            </div>

            {/* Sound Box Speaker Indicator */}
            <div className="flex flex-col items-end">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
                <Volume2 className="w-4 h-4 animate-bounce text-emerald-400" />
                <span>Audio Announcing</span>
              </div>
              <span className="text-[10px] text-slate-400 mt-1">
                Voice: <strong className="text-cyan-400">{langInfo.nativeName}</strong>
              </span>
            </div>
          </div>

          {/* Customer & Ref details */}
          <div
            className={`p-3 rounded-2xl text-xs space-y-1.5 border ${
              isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Customer:</span>
              <span className="font-bold text-slate-200">{transaction.senderName || 'UPI Customer'}</span>
            </div>
            {transaction.upiReference && (
              <div className="flex justify-between items-center">
                <span className="text-slate-400">UPI Ref:</span>
                <span className="font-mono text-[11px] text-slate-300">{transaction.upiReference}</span>
              </div>
            )}
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Time:</span>
              <span className="text-slate-300 font-medium">Just now</span>
            </div>
            {transaction.settledBankName && (
              <div className="flex justify-between items-center pt-1 border-t border-slate-800 text-emerald-400">
                <span className="text-slate-400">Settlement Bank:</span>
                <span className="font-semibold flex items-center gap-1 text-[11px]">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  {transaction.settledBankName} {transaction.settledAccountNumberMasked}
                </span>
              </div>
            )}
          </div>

          {/* Safety strip */}
          <div className="flex items-center gap-1.5 text-[10px] text-emerald-400/90">
            <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
            <span>
              {transaction.isBankVerified
                ? `Credited & Verified to ${transaction.settledBankName || 'Bank Account'}`
                : `Sound Box notification verified from ${transaction.sourceApp}`}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
