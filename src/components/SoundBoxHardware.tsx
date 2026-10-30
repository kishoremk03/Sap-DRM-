import React from 'react';
import { Volume2, ShieldAlert, Sparkles, QrCode } from 'lucide-react';
import { SupportedLanguageCode } from '../types';
import { INDIAN_LANGUAGES } from '../data/languages';

interface SoundBoxHardwareProps {
  todayTotal: number;
  todayCount: number;
  isSpeaking: boolean;
  announcementLang: SupportedLanguageCode;
  onTestSound: () => void;
  onSimulatePayment: () => void;
  onNavigateToQr?: () => void;
  isDark: boolean;
}

export const SoundBoxHardware: React.FC<SoundBoxHardwareProps> = ({
  todayTotal,
  todayCount,
  isSpeaking,
  announcementLang,
  onTestSound,
  onSimulatePayment,
  onNavigateToQr,
  isDark,
}) => {
  const currentLang = INDIAN_LANGUAGES.find((l) => l.code === announcementLang) || INDIAN_LANGUAGES[0];

  return (
    <div
      className={`relative overflow-hidden rounded-3xl border transition-all duration-300 ${
        isDark
          ? 'bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 border-emerald-500/30 shadow-2xl shadow-emerald-500/10'
          : 'bg-gradient-to-b from-white via-slate-50 to-slate-100 border-slate-200 shadow-xl shadow-slate-200/50'
      }`}
    >
      {/* Ambient Top Glow Line */}
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-cyan-500 via-emerald-400 to-emerald-500" />

      <div className="p-5 sm:p-7">
        {/* Hardware Status Header */}
        <div className="flex items-center justify-between gap-4 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-sm tracking-wider">
              SP
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>
                  SmartPay Sound Box 4G
                </span>
                <span className="text-[10px] text-emerald-500 font-medium">Ready</span>
              </div>
              <div className="text-[11px] text-slate-400">
                Voice: <span className="text-cyan-400 font-medium">{currentLang.nativeName}</span> ({currentLang.englishName})
              </div>
            </div>
          </div>

          {/* Audio Speaker Grille with Live Visualizer Waves */}
          <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-slate-800/40 border border-slate-700/50">
            {[40, 70, 100, 60, 30].map((h, i) => (
              <span
                key={i}
                className={`w-1 rounded-full transition-all duration-200 ${
                  isSpeaking
                    ? 'bg-emerald-400 animate-pulse'
                    : 'bg-slate-600'
                }`}
                style={{
                  height: isSpeaking ? `${Math.max(8, Math.round(h * Math.random()))}px` : '8px',
                }}
              />
            ))}
            <Volume2 className={`w-3.5 h-3.5 ml-1 ${isSpeaking ? 'text-emerald-400 animate-bounce' : 'text-slate-500'}`} />
          </div>
        </div>

        {/* Futuristic Digital LED Display */}
        <div
          className={`relative rounded-2xl p-5 border transition-all ${
            isDark
              ? 'bg-slate-950/80 border-emerald-500/20 shadow-inner'
              : 'bg-slate-900 border-slate-800 text-white shadow-lg'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="tracking-wide">TODAY&apos;S DETECTED TOTAL</span>
            <span className="font-mono text-emerald-400 font-semibold">{todayCount} PAYMENTS</span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-emerald-400 font-mono">₹</span>
            <span className="text-4xl sm:text-5xl font-extrabold font-mono tracking-tight text-white tabular-nums">
              {todayTotal.toLocaleString('en-IN', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>

          {/* Mandatory Payment Safety Strip */}
          <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between gap-2 text-[11px]">
            <div className="flex items-center gap-1.5 text-amber-400 font-medium">
              <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
              <span>Detected — Not Bank Verified</span>
            </div>
            <span className="text-slate-500 text-[10px] hidden sm:inline">UPI Notification Listener</span>
          </div>
        </div>

        {/* Large Tactile Buttons Designed for One-Hand Phone Ergonomics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mt-5">
          <button
            onClick={onTestSound}
            className="flex items-center justify-center gap-2 px-3.5 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-slate-950 font-bold text-xs tracking-tight shadow-lg shadow-emerald-500/25 active:scale-[0.98] transition-all cursor-pointer"
          >
            <Volume2 className="w-4 h-4 shrink-0" />
            <span>Test Sound</span>
          </button>

          {onNavigateToQr && (
            <button
              onClick={onNavigateToQr}
              className={`flex items-center justify-center gap-2 px-3.5 py-3 rounded-2xl font-bold text-xs border transition-all active:scale-[0.98] cursor-pointer ${
                isDark
                  ? 'bg-emerald-500/15 hover:bg-emerald-500/25 border-emerald-500/40 text-emerald-300'
                  : 'bg-emerald-50 hover:bg-emerald-100 border-emerald-300 text-emerald-800 shadow-sm'
              }`}
            >
              <QrCode className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Show QR Stand</span>
            </button>
          )}

          <button
            onClick={onSimulatePayment}
            className={`flex items-center justify-center gap-2 px-3.5 py-3 rounded-2xl font-semibold text-xs border transition-all active:scale-[0.98] cursor-pointer ${
              isDark
                ? 'bg-slate-800/60 hover:bg-slate-800 border-slate-700/80 text-cyan-300 hover:border-cyan-500/40'
                : 'bg-white hover:bg-slate-50 border-slate-300 text-slate-800 shadow-sm'
            }`}
          >
            <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>Simulate Payment</span>
          </button>
        </div>
      </div>
    </div>
  );
};
