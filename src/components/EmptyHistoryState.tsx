import React from 'react';
import { Sparkles, Volume2, RotateCcw, QrCode, BellRing, ShieldCheck } from 'lucide-react';

interface EmptyHistoryStateProps {
  isFilterEmpty: boolean;
  searchQuery: string;
  selectedApp: string;
  onResetFilters: () => void;
  onSimulatePayment?: () => void;
  onTestSound?: () => void;
  isDark: boolean;
}

export const EmptyHistoryState: React.FC<EmptyHistoryStateProps> = ({
  isFilterEmpty,
  searchQuery,
  selectedApp,
  onResetFilters,
  onSimulatePayment,
  onTestSound,
  isDark,
}) => {
  if (isFilterEmpty) {
    return (
      <div
        className={`p-8 sm:p-12 text-center rounded-3xl border transition-all ${
          isDark
            ? 'bg-slate-900/60 border-slate-800'
            : 'bg-white border-slate-200 shadow-sm'
        }`}
      >
        <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mx-auto mb-4">
          <RotateCcw className="w-8 h-8" />
        </div>
        <h4 className="font-bold text-lg mb-1.5 text-slate-100">No Matching Transactions</h4>
        <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto leading-relaxed mb-6">
          No detected records found
          {searchQuery ? ` matching "${searchQuery}"` : ''}
          {selectedApp !== 'All' ? ` for ${selectedApp}` : ''}.
          Try adjusting your search query, selecting another UPI app, or clearing the timeframe.
        </p>
        <button
          onClick={onResetFilters}
          className="px-5 py-2.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-bold transition-all active:scale-[0.98] cursor-pointer inline-flex items-center gap-2"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset All Filters</span>
        </button>
      </div>
    );
  }

  return (
    <div
      className={`p-6 sm:p-10 rounded-3xl border overflow-hidden relative transition-all ${
        isDark
          ? 'bg-gradient-to-b from-slate-900/90 via-slate-950/80 to-slate-950 border-slate-800/80 shadow-2xl'
          : 'bg-gradient-to-b from-white via-slate-50 to-emerald-50/20 border-slate-200 shadow-lg'
      }`}
    >
      {/* Ambient background glow */}
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-xl mx-auto text-center">
        {/* Custom Hand-crafted Futuristic Sound Box & Payment Beam SVG Illustration */}
        <div className="w-56 h-48 sm:w-64 sm:h-52 mx-auto mb-6 flex items-center justify-center">
          <svg
            viewBox="0 0 320 260"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full drop-shadow-xl"
          >
            <defs>
              {/* Device body gradient */}
              <linearGradient id="boxBody" x1="60" y1="90" x2="260" y2="240" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor={isDark ? '#1E293B' : '#0F172A'} />
                <stop offset="100%" stopColor={isDark ? '#0F172A' : '#020617'} />
              </linearGradient>

              {/* Accent neon gradient */}
              <linearGradient id="neonGreenCyan" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#00E599" />
                <stop offset="100%" stopColor="#00F2FE" />
              </linearGradient>

              {/* Speaker mesh pattern */}
              <pattern id="speakerPattern" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
                <circle cx="4" cy="4" r="1.5" fill={isDark ? '#334155' : '#475569'} opacity="0.6" />
              </pattern>

              {/* Beam fade */}
              <linearGradient id="beamFade" x1="160" y1="20" x2="160" y2="110" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#00F2FE" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#00E599" stopOpacity="0.05" />
              </linearGradient>
            </defs>

            {/* Wireless / UPI Incoming Pulse Rings */}
            <circle cx="160" cy="120" r="115" stroke="#00E599" strokeWidth="1" strokeDasharray="4 6" opacity="0.25" />
            <circle cx="160" cy="120" r="95" stroke="#00F2FE" strokeWidth="1.2" strokeDasharray="3 4" opacity="0.4" />
            <circle cx="160" cy="120" r="75" stroke="#10B981" strokeWidth="1.5" opacity="0.3" />

            {/* Floating Incoming Digital UPI Coin */}
            <g transform="translate(160, 42)">
              <circle cx="0" cy="0" r="22" fill={isDark ? '#064E3B' : '#047857'} stroke="#00E599" strokeWidth="2.5" />
              <circle cx="0" cy="0" r="18" fill="url(#neonGreenCyan)" opacity="0.2" />
              <text
                x="0"
                y="7"
                fill="#00E599"
                fontSize="20"
                fontWeight="bold"
                fontFamily="JetBrains Mono, monospace"
                textAnchor="middle"
              >
                ₹
              </text>
            </g>

            {/* Vertical transmission dashed beam */}
            <line x1="160" y1="66" x2="160" y2="105" stroke="#00E599" strokeWidth="2" strokeDasharray="3 3" opacity="0.8" />

            {/* Triangular Sound Box Console Body */}
            {/* Base shadow */}
            <ellipse cx="160" cy="225" rx="75" ry="12" fill={isDark ? '#000000' : '#CBD5E1'} opacity="0.5" />

            {/* Main enclosure */}
            <rect
              x="95"
              y="110"
              width="130"
              height="105"
              rx="22"
              fill="url(#boxBody)"
              stroke={isDark ? '#334155' : '#1E293B'}
              strokeWidth="2"
            />

            {/* Neon accent top trim */}
            <path
              d="M105 110 C105 110, 160 112, 215 110"
              stroke="url(#neonGreenCyan)"
              strokeWidth="3"
              strokeLinecap="round"
            />

            {/* LED Display on Sound Box */}
            <rect
              x="112"
              y="124"
              width="96"
              height="36"
              rx="10"
              fill={isDark ? '#020617' : '#0F172A'}
              stroke="#00E599"
              strokeWidth="1.2"
              opacity="0.9"
            />
            {/* LED Screen Text */}
            <text
              x="160"
              y="146"
              fill="#00E599"
              fontSize="13"
              fontWeight="bold"
              fontFamily="JetBrains Mono, monospace"
              letterSpacing="0.5"
              textAnchor="middle"
            >
              STANDBY
            </text>

            {/* Speaker Grille section */}
            <rect
              x="112"
              y="168"
              width="96"
              height="34"
              rx="8"
              fill="url(#speakerPattern)"
            />

            {/* Status indicator lights */}
            <circle cx="126" cy="185" r="2.5" fill="#00E599" />
            <circle cx="160" cy="185" r="2.5" fill="#00F2FE" />
            <circle cx="194" cy="185" r="2.5" fill="#10B981" />

            {/* Left Soundwave Arc */}
            <path
              d="M80 135 A 40 40 0 0 0 80 190"
              fill="none"
              stroke="#00E599"
              strokeWidth="2.5"
              strokeLinecap="round"
              opacity="0.75"
            />
            <path
              d="M68 125 A 58 58 0 0 0 68 200"
              fill="none"
              stroke="#00F2FE"
              strokeWidth="1.8"
              strokeLinecap="round"
              opacity="0.45"
            />

            {/* Right Soundwave Arc */}
            <path
              d="M240 135 A 40 40 0 0 1 240 190"
              fill="none"
              stroke="#00E599"
              strokeWidth="2.5"
              strokeLinecap="round"
              opacity="0.75"
            />
            <path
              d="M252 125 A 58 58 0 0 1 252 200"
              fill="none"
              stroke="#00F2FE"
              strokeWidth="1.8"
              strokeLinecap="round"
              opacity="0.45"
            />
          </svg>
        </div>

        {/* Informative & Encouraging Copy */}
        <h3 className={`font-bold text-xl sm:text-2xl tracking-tight mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
          No Payments Detected Yet
        </h3>

        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-md mx-auto mb-6">
          Your SmartPay Sound Box is active and listening for incoming UPI push alerts. When customers pay via
          PhonePe, Google Pay, Paytm, BHIM, or Cred, records will appear here with instant voice announcements.
        </p>

        {/* Primary Interactive CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8">
          {onSimulatePayment && (
            <button
              onClick={onSimulatePayment}
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 via-emerald-400 to-cyan-400 hover:from-emerald-400 hover:to-cyan-300 text-slate-950 font-bold text-sm shadow-xl shadow-emerald-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Simulate a Test Payment</span>
            </button>
          )}

          {onTestSound && (
            <button
              onClick={onTestSound}
              className={`w-full sm:w-auto px-5 py-3 rounded-2xl border text-xs sm:text-sm font-semibold transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer ${
                isDark
                  ? 'bg-slate-800/80 border-slate-700 text-slate-200 hover:bg-slate-800'
                  : 'bg-white border-slate-300 text-slate-800 hover:bg-slate-50'
              }`}
            >
              <Volume2 className="w-4 h-4 text-cyan-400" />
              <span>Test Hardware Chime</span>
            </button>
          )}
        </div>

        {/* 3-Step Merchant Workflow Micro-Guide */}
        <div
          className={`grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl border text-left ${
            isDark ? 'bg-slate-950/60 border-slate-800/80' : 'bg-slate-100/70 border-slate-200'
          }`}
        >
          <div className="flex items-start gap-2.5 p-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
              <QrCode className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-200">1. Customer Scans QR</div>
              <div className="text-[11px] text-slate-400 leading-tight mt-0.5">Pays using any Indian UPI application</div>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-2">
            <div className="w-7 h-7 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center shrink-0 mt-0.5">
              <BellRing className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-200">2. Intercepts Alert</div>
              <div className="text-[11px] text-slate-400 leading-tight mt-0.5">Android Notification Listener extracts amount</div>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-200">3. Speaks &amp; Logs</div>
              <div className="text-[11px] text-slate-400 leading-tight mt-0.5">Announces in Tamil/English &amp; stores locally</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
