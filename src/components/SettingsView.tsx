import React, { useState } from 'react';
import {
  Globe,
  Sliders,
  Moon,
  Sun,
  ShieldAlert,
  Smartphone,
  Check,
  AlertTriangle,
  Play,
  Music,
  Sparkles,
  Volume2,
  Coins,
  Flame,
} from 'lucide-react';
import { SoundBoxSettings, SupportedLanguageCode, SuccessToneStyle } from '../types';
import { INDIAN_LANGUAGES } from '../data/languages';
import { soundEngine } from '../utils/soundEngine';

interface SettingsViewProps {
  settings: SoundBoxSettings;
  onUpdateSettings: (newSettings: Partial<SoundBoxSettings>) => void;
  onTestVoice: (langCode: SupportedLanguageCode) => void;
  isDark: boolean;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
  onTestVoice,
  isDark,
}) => {
  const [voiceCheckResult, setVoiceCheckResult] = useState<{
    code: SupportedLanguageCode;
    available: boolean;
    voiceName?: string;
  } | null>(null);

  const handleTestTtsLanguage = (code: SupportedLanguageCode) => {
    const result = soundEngine.checkVoiceAvailability(code);
    setVoiceCheckResult({
      code,
      available: result.available,
      voiceName: result.voiceName,
    });
    onTestVoice(code);
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Language Settings Card */}
      <div
        className={`p-5 sm:p-6 rounded-3xl border ${
          isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}
      >
        <div className="flex items-center gap-2.5 mb-2">
          <div className="w-8 h-8 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400">
            <Globe className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-base">Language &amp; Speech Customization</h3>
            <p className="text-xs text-slate-400">
              Independent display language and voice announcement language
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
          {/* Display Language */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
              Display Language ({INDIAN_LANGUAGES.length} Indian Languages)
            </label>
            <select
              value={settings.displayLanguage}
              onChange={(e) =>
                onUpdateSettings({ displayLanguage: e.target.value as SupportedLanguageCode })
              }
              className={`w-full p-3 rounded-2xl border text-sm font-medium transition-all ${
                isDark
                  ? 'bg-slate-800/90 border-slate-700 text-white'
                  : 'bg-slate-50 border-slate-300 text-slate-900'
              }`}
            >
              {INDIAN_LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.nativeName} ({lang.englishName})
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-400">
              Controls buttons, titles, and UI text across the application.
            </p>
          </div>

          {/* Announcement Language */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                Voice Announcement Language
              </label>
              <button
                type="button"
                onClick={() => handleTestTtsLanguage(settings.announcementLanguage)}
                className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Play className="w-3 h-3" /> Test Voice
              </button>
            </div>
            <select
              value={settings.announcementLanguage}
              onChange={(e) => {
                const code = e.target.value as SupportedLanguageCode;
                onUpdateSettings({ announcementLanguage: code });
                handleTestTtsLanguage(code);
              }}
              className={`w-full p-3 rounded-2xl border text-sm font-medium transition-all ${
                isDark
                  ? 'bg-slate-800/90 border-slate-700 text-emerald-400 font-bold'
                  : 'bg-slate-50 border-slate-300 text-emerald-700 font-bold'
              }`}
            >
              {INDIAN_LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.nativeName} ({lang.englishName})
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-400">
              Spoken aloud when a payment notification arrives.
            </p>
          </div>
        </div>

        {/* Device TTS Voice Diagnostic */}
        {voiceCheckResult && (
          <div
            className={`mt-4 p-3.5 rounded-2xl border flex items-start gap-3 text-xs ${
              voiceCheckResult.available
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
            }`}
          >
            {voiceCheckResult.available ? (
              <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            )}
            <div>
              <div className="font-semibold">
                {voiceCheckResult.available
                  ? 'Native Speech Engine Available on Device'
                  : 'Native Voice Missing on This Device'}
              </div>
              <div className="text-[11px] opacity-80 mt-0.5">
                Active engine: {voiceCheckResult.voiceName || 'System Default'}. If missing on your phone, Android settings allows installing localized voice data under Settings &gt; System &gt; Text-to-Speech.
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Voice Announcement Controls */}
      <div
        className={`p-5 sm:p-6 rounded-3xl border ${
          isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}
      >
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-base">Sound &amp; Speech Controls</h3>
            <p className="text-xs text-slate-400">Fine-tune speech rate, pitch, and hardware chime</p>
          </div>
        </div>

        <div className="space-y-5">
          {/* Speech Rate Slider */}
          <div>
            <div className="flex items-center justify-between text-xs font-semibold mb-2">
              <span className="text-slate-300">Speech Speed Rate</span>
              <span className="font-mono text-emerald-400 font-bold">{settings.speechRate.toFixed(1)}x</span>
            </div>
            <input
              type="range"
              min="0.6"
              max="1.6"
              step="0.1"
              value={settings.speechRate}
              onChange={(e) => onUpdateSettings({ speechRate: parseFloat(e.target.value) })}
              className="w-full accent-emerald-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1">
              <span>Slower (0.6x)</span>
              <span>Normal (1.0x)</span>
              <span>Fast (1.6x)</span>
            </div>
          </div>

          {/* Speech Pitch Slider */}
          <div>
            <div className="flex items-center justify-between text-xs font-semibold mb-2">
              <span className="text-slate-300">Voice Pitch</span>
              <span className="font-mono text-cyan-400 font-bold">{settings.speechPitch.toFixed(1)}</span>
            </div>
            <input
              type="range"
              min="0.7"
              max="1.4"
              step="0.1"
              value={settings.speechPitch}
              onChange={(e) => onUpdateSettings({ speechPitch: parseFloat(e.target.value) })}
              className="w-full accent-cyan-500 cursor-pointer"
            />
          </div>

          {/* Hardware Chime Switch */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-800">
            <div>
              <div className="font-semibold text-sm">Alert Chime / Tone</div>
              <div className="text-xs text-slate-400">Play alert sound effect before speaking the amount</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.chimeSoundEnabled}
                onChange={(e) => onUpdateSettings({ chimeSoundEnabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
            </label>
          </div>

          {/* Custom Success Sound Effects Selector */}
          {settings.chimeSoundEnabled && (
            <div className="space-y-3 pt-3 border-t border-slate-800/80">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-xs uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                    <Music className="w-3.5 h-3.5" />
                    <span>Custom Success Sound Effect</span>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Choose the chime played when a payment is detected
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {[
                  {
                    id: 'classic' as SuccessToneStyle,
                    name: 'Classic Merchant Chirp',
                    desc: 'Dual-frequency standard shop beep',
                    icon: Volume2,
                    badge: 'Standard',
                  },
                  {
                    id: 'upbeat_synth' as SuccessToneStyle,
                    name: 'Upbeat Synth Arpeggio',
                    desc: 'Bright ascending 3-note electronic chime',
                    icon: Sparkles,
                    badge: 'Upbeat',
                  },
                  {
                    id: 'coin_drop' as SuccessToneStyle,
                    name: 'Golden Coin Drop',
                    desc: 'Crisp metallic cash register bell pings',
                    icon: Coins,
                    badge: 'Cash Register',
                  },
                  {
                    id: 'celebration' as SuccessToneStyle,
                    name: 'Festive Fanfare',
                    desc: 'Lively 4-note celebratory sound',
                    icon: Flame,
                    badge: 'Fanfare',
                  },
                ].map((tone) => {
                  const isSelected = (settings.successToneStyle || 'upbeat_synth') === tone.id;
                  const IconComp = tone.icon;
                  return (
                    <div
                      key={tone.id}
                      onClick={() => onUpdateSettings({ successToneStyle: tone.id })}
                      className={`p-3 rounded-2xl border text-left cursor-pointer transition-all flex items-start justify-between gap-3 ${
                        isSelected
                          ? 'bg-emerald-500/15 border-emerald-500 text-white shadow-lg shadow-emerald-500/10'
                          : isDark
                          ? 'bg-slate-800/50 border-slate-700/60 hover:bg-slate-800 text-slate-300'
                          : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-800'
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <div
                          className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                            isSelected
                              ? 'bg-emerald-500 text-slate-950 font-bold'
                              : 'bg-slate-700/50 text-slate-400'
                          }`}
                        >
                          <IconComp className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-xs">{tone.name}</span>
                            {isSelected && <Check className="w-3 h-3 text-emerald-400" />}
                          </div>
                          <p className="text-[10px] text-slate-400 leading-tight mt-0.5">{tone.desc}</p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          soundEngine.playTone(tone.id);
                        }}
                        className="px-2 py-1 rounded-lg bg-slate-950/80 hover:bg-slate-900 border border-slate-700/60 text-[10px] text-emerald-300 font-semibold flex items-center gap-1 shrink-0 cursor-pointer active:scale-95 transition-all"
                        title="Preview sound"
                      >
                        <Play className="w-2.5 h-2.5 fill-current" />
                        <span>Play</span>
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* High-Value Payment Upbeat Celebration Toggle */}
              <div
                className={`p-4 rounded-2xl border mt-3 transition-all ${
                  settings.highAmountCelebrationEnabled
                    ? 'bg-cyan-500/10 border-cyan-500/30'
                    : isDark
                    ? 'bg-slate-800/30 border-slate-800'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0 mt-0.5">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-xs sm:text-sm text-cyan-300 flex items-center gap-1.5">
                        <span>High-Value Upbeat Flourish</span>
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-cyan-500/20 text-cyan-300 uppercase tracking-wider">
                          VIP Sound
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed mt-0.5">
                        Play an elevated, triumphant ascending flourish when a payment equals or exceeds your threshold.
                      </p>
                    </div>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={settings.highAmountCelebrationEnabled}
                      onChange={(e) =>
                        onUpdateSettings({ highAmountCelebrationEnabled: e.target.checked })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-400"></div>
                  </label>
                </div>

                {settings.highAmountCelebrationEnabled && (
                  <div className="mt-3 pt-3 border-t border-cyan-500/20 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-semibold text-slate-300">Trigger Threshold:</span>
                      <div className="flex items-center gap-1.5">
                        {[200, 500, 1000, 2000].map((threshold) => (
                          <button
                            key={threshold}
                            type="button"
                            onClick={() => onUpdateSettings({ highAmountThreshold: threshold })}
                            className={`px-2.5 py-1 rounded-xl text-xs font-mono font-bold border transition-all cursor-pointer ${
                              settings.highAmountThreshold === threshold
                                ? 'bg-cyan-500 text-slate-950 border-cyan-400'
                                : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
                            }`}
                          >
                            ₹{threshold}
                          </button>
                        ))}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => soundEngine.playTone('celebration', true)}
                      className="px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-xs font-semibold text-cyan-300 flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>Preview Flourish</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Merchant UPI QR Profile */}
      <div
        className={`p-5 sm:p-6 rounded-3xl border ${
          isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}
      >
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
            <Coins className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-base">Merchant UPI QR &amp; Sound Receiver</h3>
            <p className="text-xs text-slate-400">
              Your business identity and VPA address printed on the counter QR standee
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
              Business / Store Display Name
            </label>
            <input
              type="text"
              value={settings.merchantName || ''}
              onChange={(e) => onUpdateSettings({ merchantName: e.target.value })}
              placeholder="e.g. Kishore Stores &amp; Services"
              className={`w-full px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all ${
                isDark
                  ? 'bg-slate-950 border-slate-800 text-white focus:border-emerald-500'
                  : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-emerald-500'
              } focus:outline-none`}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
              Merchant UPI ID (VPA)
            </label>
            <input
              type="text"
              value={settings.merchantUpiId || ''}
              onChange={(e) => onUpdateSettings({ merchantUpiId: e.target.value })}
              placeholder="e.g. kishore@okaxis or 9876543210@paytm"
              className={`w-full px-4 py-2.5 rounded-xl border text-sm font-mono transition-all ${
                isDark
                  ? 'bg-slate-950 border-slate-800 text-white focus:border-emerald-500'
                  : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-emerald-500'
              } focus:outline-none`}
            />
          </div>

          <div
            className={`p-3.5 rounded-2xl border flex items-center justify-between ${
              isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div>
              <div className="text-xs font-bold text-emerald-400">Background Web Alerts</div>
              <div className="text-[11px] text-slate-400">
                Play sound and show notifications even when phone is locked or browser is minimized
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={settings.browserNotificationsEnabled}
                onChange={(e) => {
                  const checked = e.target.checked;
                  onUpdateSettings({ browserNotificationsEnabled: checked });
                  if (checked && typeof window !== 'undefined' && 'Notification' in window) {
                    Notification.requestPermission();
                  }
                }}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Theme & Display Options */}
      <div
        className={`p-5 sm:p-6 rounded-3xl border ${
          isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
              {isDark ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </div>
            <div>
              <div className="font-bold text-sm">Interface Theme</div>
              <div className="text-xs text-slate-400">
                {isDark ? 'Obsidian Dark (Daylight Shop Contrast)' : 'Clean Pearl White'}
              </div>
            </div>
          </div>

          <button
            onClick={() => onUpdateSettings({ isDarkMode: !isDark })}
            className={`px-4 py-2 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
              isDark
                ? 'bg-slate-800 border-slate-700 text-white hover:bg-slate-750'
                : 'bg-slate-100 border-slate-300 text-slate-900 hover:bg-slate-200'
            }`}
          >
            {isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          </button>
        </div>
      </div>

      {/* Monitored UPI Applications */}
      <div
        className={`p-5 sm:p-6 rounded-3xl border ${
          isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}
      >
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-8 h-8 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400">
            <Smartphone className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-base">Supported UPI Applications</h3>
            <p className="text-xs text-slate-400">
              Select which UPI apps SmartPay should detect notifications from
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { key: 'phonepe', name: 'PhonePe & Business' },
            { key: 'gpay', name: 'Google Pay (GPay)' },
            { key: 'paytm', name: 'Paytm & Business' },
            { key: 'bhim', name: 'BHIM NPCI UPI' },
            { key: 'cred', name: 'CRED App' },
            { key: 'amazon', name: 'Amazon Pay' },
          ].map(({ key, name }) => {
            const isChecked = settings.enabledApps[key as keyof typeof settings.enabledApps];
            return (
              <label
                key={key}
                className={`p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                  isChecked
                    ? isDark
                      ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                      : 'bg-emerald-50 border-emerald-300 text-emerald-800'
                    : isDark
                    ? 'bg-slate-800/40 border-slate-800 text-slate-400'
                    : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                <span className="text-xs font-semibold">{name}</span>
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={(e) =>
                    onUpdateSettings({
                      enabledApps: {
                        ...settings.enabledApps,
                        [key]: e.target.checked,
                      },
                    })
                  }
                  className="rounded text-emerald-500 focus:ring-emerald-400 w-4 h-4"
                />
              </label>
            );
          })}
        </div>
      </div>

      {/* Safety Notice Footer */}
      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-3 text-xs text-amber-300">
        <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Payment Safety Law: </span>
          An Android push notification does not legally prove that money was credited to your bank account. Always check your bank statement for large transaction settlements.
        </div>
      </div>
    </div>
  );
};
