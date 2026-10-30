import React, { useState } from 'react';
import { X, BellRing, Sparkles, AlertCircle } from 'lucide-react';
import { parseIncomingNotification } from '../utils/notificationParser';
import confetti from 'canvas-confetti';

interface NotificationSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReceiveTransaction: (data: {
    amount: number;
    appName: string;
    senderName: string;
    upiReference: string;
    rawText: string;
  }) => void;
  isDark: boolean;
}

const SAMPLE_PRESETS = [
  { app: 'PhonePe', amount: 500, sender: 'Rajesh Kumar', text: 'Received ₹500.00 from Rajesh Kumar on PhonePe' },
  { app: 'Google Pay', amount: 1250, sender: 'Anita Sharma', text: '₹1,250.00 received from Anita Sharma via Google Pay' },
  { app: 'Paytm', amount: 350, sender: 'Vignesh Sundaram', text: 'Paytm accepted payment of ₹350 from Vignesh' },
  { app: 'BHIM UPI', amount: 750, sender: 'Karthik Raja', text: 'Received Rs. 750 from UPI/Karthik Raja Ref: 412389102918' },
  { app: 'CRED', amount: 2000, sender: 'Priya Narayanan', text: '₹2,000 credited to your account via CRED Pay' },
  { app: 'Amazon Pay', amount: 150, sender: 'Arun M', text: 'You received Rs. 150.00 on Amazon Pay from Arun M' },
];

export const NotificationSimulatorModal: React.FC<NotificationSimulatorModalProps> = ({
  isOpen,
  onClose,
  onReceiveTransaction,
  isDark,
}) => {
  const [customText, setCustomText] = useState('');
  const [selectedApp, setSelectedApp] = useState('PhonePe');
  const [customAmount, setCustomAmount] = useState('500');
  const [customSender, setCustomSender] = useState('Murugan Supermarket');
  const [activeTab, setActiveTab] = useState<'presets' | 'custom'>('presets');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleApplyPreset = (preset: typeof SAMPLE_PRESETS[0]) => {
    onReceiveTransaction({
      amount: preset.amount,
      appName: preset.app,
      senderName: preset.sender,
      upiReference: `UPI${Math.floor(100000000000 + Math.random() * 900000000000)}`,
      rawText: preset.text,
    });
    try {
      confetti({ particleCount: 35, spread: 60, origin: { y: 0.8 } });
    } catch (_e) {}
    onClose();
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (customText.trim()) {
      const parsed = parseIncomingNotification(selectedApp, customText);
      if (!parsed) {
        setErrorMsg('Could not detect a valid incoming payment or amount from this text. Ensure it contains keywords like "received" or "credited" and an amount (e.g. ₹500 or Rs. 500).');
        return;
      }

      onReceiveTransaction({
        amount: parsed.amount,
        appName: parsed.appName || selectedApp,
        senderName: parsed.senderName || customSender,
        upiReference: parsed.upiReference,
        rawText: `${selectedApp}: ${customText}`,
      });
    } else {
      const amt = parseFloat(customAmount);
      if (isNaN(amt) || amt <= 0) {
        setErrorMsg('Please enter a valid amount greater than ₹0');
        return;
      }

      onReceiveTransaction({
        amount: amt,
        appName: selectedApp,
        senderName: customSender.trim() || 'UPI Customer',
        upiReference: `UPI${Math.floor(100000000000 + Math.random() * 900000000000)}`,
        rawText: `Received ₹${amt} from ${customSender} on ${selectedApp}`,
      });
    }

    try {
      confetti({ particleCount: 40, spread: 70, origin: { y: 0.8 } });
    } catch (_e) {}
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
      <div
        className={`w-full max-w-lg rounded-t-3xl sm:rounded-3xl border overflow-hidden shadow-2xl max-h-[90vh] flex flex-col ${
          isDark
            ? 'bg-slate-900 border-slate-700/80 text-white'
            : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <BellRing className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">Simulate UPI Notification</h3>
              <p className="text-xs text-slate-400">Test sound box voice announcement & detection</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 px-5 pt-3 gap-6">
          <button
            onClick={() => setActiveTab('presets')}
            className={`pb-3 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'presets'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Instant Presets (1-Tap)
          </button>
          <button
            onClick={() => setActiveTab('custom')}
            className={`pb-3 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'custom'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Custom Amount / Text
          </button>
        </div>

        {/* Body content */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {errorMsg && (
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {activeTab === 'presets' ? (
            <div className="space-y-2.5">
              <p className="text-xs text-slate-400">
                Tap any sample payment to trigger the hardware chime and localized voice announcement immediately:
              </p>
              {SAMPLE_PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => handleApplyPreset(preset)}
                  className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-center justify-between hover:scale-[1.01] active:scale-[0.99] cursor-pointer ${
                    isDark
                      ? 'bg-slate-800/60 border-slate-700/80 hover:border-emerald-500/50 hover:bg-slate-800'
                      : 'bg-slate-50 border-slate-200 hover:border-emerald-500 hover:bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center font-bold text-xs text-emerald-400">
                      ₹
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm">{preset.app}</span>
                        <span className="text-xs text-slate-400">· {preset.sender}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 truncate max-w-[200px] sm:max-w-xs">
                        {preset.text}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-emerald-400 text-base">
                      +₹{preset.amount}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <form onSubmit={handleCustomSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1.5 text-slate-300">UPI Application</label>
                <div className="grid grid-cols-3 gap-2">
                  {['PhonePe', 'Google Pay', 'Paytm', 'BHIM UPI', 'CRED', 'Amazon Pay'].map((app) => (
                    <button
                      key={app}
                      type="button"
                      onClick={() => setSelectedApp(app)}
                      className={`py-2 px-2.5 text-xs font-medium rounded-xl border transition-all ${
                        selectedApp === app
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold'
                          : isDark
                          ? 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800'
                          : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {app}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1 text-slate-300">Amount (₹)</label>
                  <input
                    type="number"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    placeholder="e.g. 500"
                    step="0.01"
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-mono ${
                      isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1 text-slate-300">Customer Name</label>
                  <input
                    type="text"
                    value={customSender}
                    onChange={(e) => setCustomSender(e.target.value)}
                    placeholder="e.g. Priya R"
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm ${
                      isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-300">Or Paste Full Notification Text</label>
                  <span className="text-[10px] text-slate-400">Tests exact regex parser</span>
                </div>
                <textarea
                  rows={2}
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  placeholder="e.g. Received ₹850 from Senthil Kumar on PhonePe. Ref: UPI492019"
                  className={`w-full px-3.5 py-2 rounded-xl border text-xs font-mono ${
                    isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Simulate &amp; Speak Announcement</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
