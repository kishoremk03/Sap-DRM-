import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import {
  QrCode as QrIcon,
  Sparkles,
  Smartphone,
  Printer,
  Download,
  Edit3,
  CheckCircle2,
  Volume2,
  ShieldCheck,
  Maximize2,
  Minimize2,
  Bell,
  RefreshCw,
  Coins,
  ArrowRight,
  Store,
  Wallet,
  Building2,
  Award,
  UserCheck,
} from 'lucide-react';
import { SoundBoxSettings, Transaction, BankAccount, MerchantUser } from '../types';
import { INDIAN_LANGUAGES } from '../data/languages';

interface MerchantQrViewProps {
  settings: SoundBoxSettings;
  todayTotal: number;
  todayCount: number;
  bankAccount: BankAccount | null;
  currentUser: MerchantUser | null;
  onOpenBank: () => void;
  onOpenAuth: () => void;
  onOpenCompliance: () => void;
  onUpdateSettings: (updated: Partial<SoundBoxSettings>) => void;
  onSimulateCustomerPayment: (data: {
    amount: number;
    appName: string;
    senderName: string;
    upiReference: string;
    rawText: string;
  }) => void;
  isDark: boolean;
}

const SAMPLE_CUSTOMERS = [
  'Rajesh Kumar',
  'Priya Sundaram',
  'Murugan V',
  'Anita Sharma',
  'Karthik Raja',
  'Geetha Ramaswamy',
  'Suresh Babu',
  'Deepak Verma',
  'Lakshmi Narayanan',
  'Vikramaditya S',
];

const QUICK_AMOUNTS = [20, 50, 100, 200, 500, 1000, 2000];

export const MerchantQrView: React.FC<MerchantQrViewProps> = ({
  settings,
  todayTotal,
  todayCount,
  bankAccount,
  currentUser,
  onOpenBank,
  onOpenAuth,
  onOpenCompliance,
  onUpdateSettings,
  onSimulateCustomerPayment,
  isDark,
}) => {
  const [dynamicAmount, setDynamicAmount] = useState<string>('');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [isEditingMerchant, setIsEditingMerchant] = useState(false);
  const [tempMerchantName, setTempMerchantName] = useState(settings.merchantName || 'SmartPay Digital Store');
  const [tempMerchantUpi, setTempMerchantUpi] = useState(settings.merchantUpiId || 'smartpay.store@upi');
  const [isKioskMode, setIsKioskMode] = useState(false);
  const [simulatedApp, setSimulatedApp] = useState<'PhonePe' | 'Google Pay' | 'Paytm' | 'BHIM UPI'>('PhonePe');
  const [simulatedSender, setSimulatedSender] = useState(SAMPLE_CUSTOMERS[0]);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>(() => {
    return typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'default';
  });

  const standeeRef = useRef<HTMLDivElement>(null);

  // Compute actual NPCI UPI URI
  const amountNumber = parseFloat(dynamicAmount);
  const hasValidAmount = !isNaN(amountNumber) && amountNumber > 0;

  const upiUri = React.useMemo(() => {
    const upiId = settings.merchantUpiId || 'smartpay.store@upi';
    const name = encodeURIComponent(settings.merchantName || 'SmartPay Store');
    const note = encodeURIComponent(`Payment at ${settings.merchantName || 'SmartPay'}`);
    const mcc = settings.mccCode || '5411';

    let uri = `upi://pay?pa=${upiId}&pn=${name}&mc=${mcc}&mode=02&tn=${note}&cu=INR`;
    if (hasValidAmount) {
      uri += `&am=${amountNumber.toFixed(2)}`;
    }
    return uri;
  }, [settings.merchantUpiId, settings.merchantName, settings.mccCode, hasValidAmount, amountNumber]);

  // Generate QR Code data URL
  useEffect(() => {
    let isMounted = true;
    QRCode.toDataURL(
      upiUri,
      {
        errorCorrectionLevel: 'H',
        margin: 2,
        width: 400,
        color: {
          dark: '#030712',
          light: '#FFFFFF',
        },
      },
      (err, url) => {
        if (!err && isMounted) {
          setQrDataUrl(url);
        }
      }
    );
    return () => {
      isMounted = false;
    };
  }, [upiUri]);

  // Request browser notification permission
  const handleRequestNotificationPermission = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const permission = await Notification.requestPermission();
        setNotificationPermission(permission);
        if (permission === 'granted') {
          onUpdateSettings({ browserNotificationsEnabled: true });
          new Notification('SmartPay Sound Box Alert Active', {
            body: 'You will receive instant voice and notification alerts whenever a customer pays this QR code!',
            icon: '/favicon.ico',
          });
        }
      } catch (err) {
        console.warn('Notification permission error', err);
      }
    }
  };

  const handleSaveMerchantDetails = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings({
      merchantName: tempMerchantName.trim() || 'SmartPay Digital Store',
      merchantUpiId: tempMerchantUpi.trim() || 'smartpay.store@upi',
    });
    setIsEditingMerchant(false);
  };

  const handleSimulatePayment = (amountToPay: number) => {
    const randomCustomer = SAMPLE_CUSTOMERS[Math.floor(Math.random() * SAMPLE_CUSTOMERS.length)];
    const upiRef = `UPI${Math.floor(100000000000 + Math.random() * 900000000000)}`;

    const bankNote = bankAccount?.isVerified
      ? ` Credited to ${bankAccount.bankName} (${bankAccount.accountNumberMasked}).`
      : '';

    let rawText = '';
    if (simulatedApp === 'PhonePe') {
      rawText = `Received ₹${amountToPay.toFixed(2)} from ${randomCustomer} on PhonePe.${bankNote} Ref: ${upiRef}`;
    } else if (simulatedApp === 'Google Pay') {
      rawText = `₹${amountToPay.toFixed(2)} received from ${randomCustomer} via Google Pay.${bankNote}`;
    } else if (simulatedApp === 'Paytm') {
      rawText = `Paytm received payment of ₹${amountToPay.toFixed(2)} from ${randomCustomer}.${bankNote}`;
    } else {
      rawText = `Received Rs. ${amountToPay.toFixed(2)} from ${randomCustomer} on BHIM UPI.${bankNote}`;
    }

    onSimulateCustomerPayment({
      amount: amountToPay,
      appName: simulatedApp,
      senderName: randomCustomer,
      upiReference: upiRef,
      rawText,
    });

    // Also trigger Web Notification if supported and granted
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(`₹${amountToPay.toFixed(2)} Received at QR!`, {
          body: `Received from ${randomCustomer} via ${simulatedApp}.${bankAccount?.isVerified ? ` Settled to ${bankAccount.bankName}` : ''}`,
          icon: '/favicon.ico',
        });
      } catch (_e) {
        // Notification API fallback
      }
    }
  };

  const handleDownloadQr = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `${(settings.merchantName || 'SmartPay').replace(/\s+/g, '_')}_UPI_QR.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handlePrintStandee = () => {
    window.print();
  };

  const langInfo = INDIAN_LANGUAGES.find((l) => l.code === settings.announcementLanguage) || INDIAN_LANGUAGES[0];

  return (
    <div className={`space-y-6 ${isKioskMode ? 'fixed inset-0 z-50 overflow-y-auto p-4 sm:p-8 bg-slate-950 text-white' : ''}`}>
      {/* Top Controls & Banner */}
      <div
        className={`p-5 sm:p-6 rounded-3xl border ${
          isDark
            ? 'bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/40 border-emerald-500/30 shadow-xl'
            : 'bg-gradient-to-br from-emerald-50 via-white to-cyan-50 border-emerald-200 shadow-md'
        }`}
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                Live Merchant QR Standee
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                Audio Notifier Linked
              </span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight">
              UPI QR Code &amp; Sound Box Receiver
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
              Customers scan this QR code using Google Pay, PhonePe, Paytm, BHIM, or any UPI app.
              Whenever a payment is made, SmartPay instantly announces the credited amount in{' '}
              <strong className="text-emerald-400">{langInfo.nativeName} ({langInfo.englishName})</strong>!
            </p>
          </div>

          <div className="flex items-center flex-wrap gap-2 w-full md:w-auto">
            <button
              onClick={() => setIsKioskMode(!isKioskMode)}
              className="px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer"
            >
              {isKioskMode ? <Minimize2 className="w-4 h-4 text-cyan-400" /> : <Maximize2 className="w-4 h-4 text-cyan-400" />}
              <span>{isKioskMode ? 'Exit Kiosk' : 'Counter Standee Mode'}</span>
            </button>
            <button
              onClick={handlePrintStandee}
              className="px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4 text-emerald-400" />
              <span>Print Standee</span>
            </button>
            <button
              onClick={handleDownloadQr}
              className="px-4 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download QR</span>
            </button>
          </div>
        </div>

        {/* Compliance, Bank & Auth Badges */}
        <div className="mt-4 pt-4 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {/* Badge 1: Bank Account */}
          <button
            onClick={onOpenBank}
            className={`p-2.5 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
              bankAccount?.isVerified
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/15'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/15'
            }`}
          >
            <div className="flex items-center gap-2 min-w-0">
              <Building2 className="w-4 h-4 shrink-0" />
              <div className="min-w-0">
                <div className="text-[10px] uppercase font-bold tracking-wider">Settlement Bank</div>
                <div className="text-xs font-semibold truncate">
                  {bankAccount?.isVerified ? `${bankAccount.bankName} (${bankAccount.accountNumberMasked})` : 'Link & Verify Bank (₹1.00)'}
                </div>
              </div>
            </div>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-black/20 shrink-0 ml-2">
              {bankAccount?.isVerified ? 'VERIFIED' : 'ACTION'}
            </span>
          </button>

          {/* Badge 2: Merchant Dual-Factor Auth */}
          <button
            onClick={onOpenAuth}
            className={`p-2.5 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
              currentUser?.isLoggedIn
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/15'
                : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/15'
            }`}
          >
            <div className="flex items-center gap-2 min-w-0">
              <UserCheck className="w-4 h-4 shrink-0" />
              <div className="min-w-0">
                <div className="text-[10px] uppercase font-bold tracking-wider">Merchant OTP Auth</div>
                <div className="text-xs font-semibold truncate">
                  {currentUser?.isLoggedIn ? `${currentUser.ownerName} (${currentUser.mobileNumber})` : 'Login with Mobile OTP'}
                </div>
              </div>
            </div>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-black/20 shrink-0 ml-2">
              {currentUser?.isLoggedIn ? 'ACTIVE' : 'LOGIN'}
            </span>
          </button>

          {/* Badge 3: NPCI Compliance */}
          <button
            onClick={onOpenCompliance}
            className="p-2.5 rounded-2xl border bg-cyan-500/10 border-cyan-500/30 text-cyan-300 text-left flex items-center justify-between transition-all cursor-pointer hover:bg-cyan-500/15"
          >
            <div className="flex items-center gap-2 min-w-0">
              <Award className="w-4 h-4 shrink-0 text-cyan-400" />
              <div className="min-w-0">
                <div className="text-[10px] uppercase font-bold tracking-wider text-cyan-400">NPCI UPI 2.0</div>
                <div className="text-xs font-semibold truncate">Rules &amp; Safety Audit</div>
              </div>
            </div>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 shrink-0 ml-2">
              INSPECT
            </span>
          </button>
        </div>

        {/* Browser Background Alert Banner if not granted */}
        {notificationPermission !== 'granted' && (
          <div className="mt-4 pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-cyan-950/20 p-3 rounded-2xl border-cyan-500/20">
            <div className="flex items-center gap-2 text-xs text-cyan-300">
              <Bell className="w-4 h-4 text-cyan-400 shrink-0 animate-bounce" />
              <span>
                Want alerts when phone is locked or on other apps? Enable background notifications.
              </span>
            </div>
            <button
              onClick={handleRequestNotificationPermission}
              className="px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-all shrink-0 cursor-pointer"
            >
              Enable Background Alerts
            </button>
          </div>
        )}
      </div>

      {/* Main Grid: Standee Display (Left) + Interactive Station & Charge Calculator (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: The Physical Sound Box Counter Standee */}
        <div className="lg:col-span-6 flex justify-center">
          <div
            ref={standeeRef}
            className={`w-full max-w-md rounded-3xl overflow-hidden border-2 transition-all duration-300 relative shadow-2xl ${
              isDark
                ? 'bg-slate-900 border-emerald-500/40 shadow-emerald-500/10'
                : 'bg-white border-slate-300 shadow-2xl'
            }`}
          >
            {/* Top Physical Standee Arch Header */}
            <div className="bg-gradient-to-r from-[#10b981] via-[#059669] to-[#047857] p-5 text-white text-center relative shadow-md">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5 bg-black/20 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
                  <span>BHIM UPI Verified</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-300 animate-ping" />
                  <span className="text-[10px] font-bold text-emerald-100 uppercase tracking-widest">
                    Sound Box Active
                  </span>
                </div>
              </div>

              <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white drop-shadow-sm">
                {settings.merchantName || 'SmartPay Digital Store'}
              </h3>
              <div className="flex items-center justify-center gap-2 mt-1">
                <span className="text-xs font-mono bg-black/20 px-2.5 py-0.5 rounded-full text-emerald-100">
                  {settings.merchantUpiId || 'smartpay.store@upi'}
                </span>
                <button
                  onClick={() => setIsEditingMerchant(true)}
                  className="p-1 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors cursor-pointer"
                  title="Edit Merchant Name & UPI ID"
                >
                  <Edit3 className="w-3 h-3" />
                </button>
              </div>

              {/* Linked Bank Account Settlement Tag */}
              <div className="mt-2.5 flex items-center justify-center">
                <button
                  onClick={onOpenBank}
                  className="px-2.5 py-1 rounded-full bg-black/25 hover:bg-black/40 border border-white/20 text-[11px] text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Building2 className="w-3 h-3 text-emerald-300" />
                  <span>
                    {bankAccount?.isVerified
                      ? `Settled to ${bankAccount.bankName} (${bankAccount.accountNumberMasked})`
                      : 'Link Bank Account for Settlements'}
                  </span>
                  {bankAccount?.isVerified && <CheckCircle2 className="w-3 h-3 text-emerald-300" />}
                </button>
              </div>
            </div>

            {/* Standee Body with QR Code */}
            <div className="p-6 text-center space-y-4">
              {/* Dynamic Amount Banner if set */}
              {hasValidAmount ? (
                <div className="p-3 rounded-2xl bg-emerald-500/15 border-2 border-emerald-500/50 text-emerald-400">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                    SCAN TO PAY EXACT BILL AMOUNT
                  </div>
                  <div className="text-3xl font-black font-mono tracking-tight text-emerald-400">
                    ₹{amountNumber.toFixed(2)}
                  </div>
                </div>
              ) : (
                <div className="p-2.5 rounded-2xl bg-slate-800/40 border border-slate-700/60 text-slate-300 text-xs">
                  <span className="font-semibold text-emerald-400">Scan &amp; Enter Any Amount</span> — Instant Voice Notification
                </div>
              )}

              {/* The QR Code Container */}
              <div className="flex justify-center my-2">
                <div className="p-4 bg-white rounded-3xl shadow-xl border-4 border-emerald-500/30 inline-block relative group">
                  {qrDataUrl ? (
                    <img
                      src={qrDataUrl}
                      alt="Merchant UPI QR Code"
                      className="w-56 h-56 sm:w-64 sm:h-64 object-contain rounded-xl"
                    />
                  ) : (
                    <div className="w-56 h-56 flex items-center justify-center bg-slate-100 rounded-xl">
                      <RefreshCw className="w-8 h-8 text-slate-400 animate-spin" />
                    </div>
                  )}

                  {/* Centered UPI logo badge */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-12 h-12 rounded-xl bg-white p-1.5 shadow-lg border border-slate-200 flex items-center justify-center">
                      <div className="w-full h-full rounded-lg bg-gradient-to-tr from-emerald-600 to-cyan-500 flex items-center justify-center text-white font-black text-xs">
                        UPI
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Accepted UPI Apps Brand Bar */}
              <div className="space-y-2">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Accepted On All UPI Applications
                </div>
                <div className="flex items-center justify-center flex-wrap gap-2 text-xs font-semibold">
                  <span className="px-2.5 py-1 rounded-lg bg-blue-500/15 border border-blue-500/30 text-blue-400">
                    Google Pay
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-purple-500/15 border border-purple-500/30 text-purple-400">
                    PhonePe
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-cyan-500/15 border border-cyan-500/30 text-cyan-400">
                    Paytm
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                    BHIM
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-400">
                    Amazon Pay
                  </span>
                </div>
              </div>

              {/* Bottom Live Sound Box Beacon */}
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-emerald-400 animate-pulse" />
                  <span>
                    Audio Alert: <strong className="text-cyan-400">{langInfo.nativeName}</strong>
                  </span>
                </div>
                <div className="font-mono text-[11px] text-emerald-400 font-bold">
                  Today: ₹{todayTotal.toFixed(0)} ({todayCount})
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Dynamic Charge Keypad & Simulator Station */}
        <div className="lg:col-span-6 space-y-6">
          {/* Card 1: Dynamic Amount Generator (Merchant Bill Charge) */}
          <div
            className={`p-6 rounded-3xl border transition-all ${
              isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Coins className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-base">Generate Exact Bill Amount QR</h3>
              </div>
              {hasValidAmount && (
                <button
                  onClick={() => setDynamicAmount('')}
                  className="text-xs text-rose-400 hover:text-rose-300 font-semibold cursor-pointer"
                >
                  Reset to General QR
                </button>
              )}
            </div>

            <p className="text-xs text-slate-400 mb-4">
              Enter the customer&apos;s bill amount. The QR code on the left will immediately encode this exact amount so the customer does not have to type it manually.
            </p>

            {/* Custom Amount Input */}
            <div className="relative mb-4">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-bold font-mono text-emerald-400">
                ₹
              </span>
              <input
                type="number"
                min="1"
                step="any"
                value={dynamicAmount}
                onChange={(e) => setDynamicAmount(e.target.value)}
                placeholder="Enter bill amount (e.g. 150)"
                className={`w-full pl-9 pr-4 py-3.5 rounded-2xl text-lg font-bold font-mono border transition-all ${
                  isDark
                    ? 'bg-slate-950 border-slate-800 text-white focus:border-emerald-500'
                    : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-emerald-500'
                } focus:outline-none`}
              />
            </div>

            {/* Quick Preset Buttons */}
            <div className="space-y-1.5">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Quick Amount Presets
              </div>
              <div className="flex flex-wrap gap-2">
                {QUICK_AMOUNTS.map((amt) => (
                  <button
                    key={amt}
                    onClick={() => setDynamicAmount(amt.toString())}
                    className={`px-3 py-2 rounded-xl text-xs font-bold font-mono border transition-all cursor-pointer ${
                      dynamicAmount === amt.toString()
                        ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md shadow-emerald-500/20'
                        : isDark
                        ? 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750'
                        : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                    }`}
                  >
                    +₹{amt}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Card 2: Interactive "Simulate Customer Paid at this QR" Station */}
          <div
            className={`p-6 rounded-3xl border transition-all ${
              isDark
                ? 'bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-950/30 border-cyan-500/30 shadow-xl'
                : 'bg-gradient-to-br from-white via-cyan-50/30 to-emerald-50/30 border-cyan-200 shadow-sm'
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-cyan-400" />
              <h3 className="font-bold text-base">Test QR Payment &amp; Voice Notification</h3>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Tap below to simulate a real customer scanning this QR code and completing payment.
              You will hear the high-pitch sound chime, clear Indian voice announcement, and see the live notification alert!
            </p>

            {/* Simulated App Selection */}
            <div className="space-y-3 mb-5">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Customer Payment App:
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(['PhonePe', 'Google Pay', 'Paytm', 'BHIM UPI'] as const).map((app) => (
                  <button
                    key={app}
                    onClick={() => setSimulatedApp(app)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      simulatedApp === app
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-md shadow-cyan-500/10'
                        : isDark
                        ? 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-slate-200'
                        : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {app}
                  </button>
                ))}
              </div>
            </div>

            {/* Test Payment Trigger Buttons */}
            <div className="space-y-2.5">
              <button
                onClick={() => handleSimulatePayment(hasValidAmount ? amountNumber : 150)}
                className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-emerald-500 via-emerald-400 to-cyan-400 hover:from-emerald-400 hover:to-cyan-300 text-slate-950 font-black text-sm tracking-wide shadow-xl shadow-emerald-500/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Smartphone className="w-4 h-4" />
                <span>
                  Simulate Customer Scanned &amp; Paid ₹{hasValidAmount ? amountNumber.toFixed(2) : '150.00'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="grid grid-cols-3 gap-2">
                {[50, 200, 500].map((amt) => (
                  <button
                    key={amt}
                    onClick={() => handleSimulatePayment(amt)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      isDark
                        ? 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-700'
                        : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    Test Pay ₹{amt}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Merchant Details Modal */}
      {isEditingMerchant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div
            className={`w-full max-w-md rounded-3xl p-6 border shadow-2xl ${
              isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <div className="flex items-center gap-2 mb-4">
              <Store className="w-5 h-5 text-emerald-400" />
              <h3 className="font-bold text-lg">Edit Merchant &amp; UPI Details</h3>
            </div>

            <form onSubmit={handleSaveMerchantDetails} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                  Store / Business Name
                </label>
                <input
                  type="text"
                  required
                  value={tempMerchantName}
                  onChange={(e) => setTempMerchantName(e.target.value)}
                  placeholder="e.g. Kishore Stores"
                  className={`w-full px-4 py-3 rounded-xl border text-sm font-semibold transition-all ${
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
                  required
                  value={tempMerchantUpi}
                  onChange={(e) => setTempMerchantUpi(e.target.value)}
                  placeholder="e.g. 9876543210@paytm or shop@okaxis"
                  className={`w-full px-4 py-3 rounded-xl border text-sm font-mono transition-all ${
                    isDark
                      ? 'bg-slate-950 border-slate-800 text-white focus:border-emerald-500'
                      : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-emerald-500'
                  } focus:outline-none`}
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Enter your real PhonePe, Google Pay, or Paytm Merchant UPI ID to receive payments directly to your bank account.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditingMerchant(false)}
                  className="px-4 py-2.5 rounded-xl text-slate-400 hover:text-slate-200 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 cursor-pointer"
                >
                  Save &amp; Update QR
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
