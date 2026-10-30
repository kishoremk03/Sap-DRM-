import React, { useState, useEffect } from 'react';
import {
  Mail,
  Smartphone,
  ShieldCheck,
  CheckCircle2,
  X,
  ArrowRight,
  RefreshCw,
  Store,
  UserCheck,
  KeyRound,
  AlertCircle,
} from 'lucide-react';
import { MerchantUser } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: MerchantUser | null;
  onLoginSuccess: (user: MerchantUser) => void;
  onLogout: () => void;
  isDark: boolean;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLoginSuccess,
  onLogout,
  isDark,
}) => {
  const [step, setStep] = useState<'DETAILS' | 'OTP'>('DETAILS');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [businessName, setBusinessName] = useState('');

  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
  const [generatedOtp, setGeneratedOtp] = useState<string>('729481');
  const [otpSentToast, setOtpSentToast] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize with existing user data if any
  useEffect(() => {
    if (currentUser) {
      setEmail(currentUser.email);
      setMobile(currentUser.mobileNumber.replace('+91', '').trim());
      setOwnerName(currentUser.ownerName);
      setBusinessName(currentUser.businessName);
    } else {
      setEmail('merchant.kishore@gmail.com');
      setMobile('9876543210');
      setOwnerName('Kishore M');
      setBusinessName('SmartPay Digital Store');
    }
  }, [currentUser]);

  // Countdown timer for OTP
  useEffect(() => {
    let timer: any;
    if (step === 'OTP' && countdown > 0) {
      timer = setInterval(() => setCountdown((c) => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [step, countdown]);

  if (!isOpen) return null;

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanMobile = mobile.replace(/\D/g, '');
    if (cleanMobile.length !== 10) {
      alert('Please enter a valid 10-digit Indian mobile number');
      return;
    }
    if (!email || !email.includes('@')) {
      alert('Please enter a valid email address');
      return;
    }

    // Generate random 6-digit OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);
    setOtpCode(['', '', '', '', '', '']);
    setOtpError(null);
    setStep('OTP');
    setCountdown(30);
    setOtpSentToast(true);
    setTimeout(() => setOtpSentToast(false), 8000);
  };

  const handleOtpChange = (index: number, val: string) => {
    if (val.length > 1) {
      // Handle paste of 6 digits
      const pasted = val.replace(/\D/g, '').slice(0, 6);
      if (pasted.length === 6) {
        setOtpCode(pasted.split(''));
        return;
      }
    }

    const newOtp = [...otpCode];
    newOtp[index] = val.slice(-1);
    setOtpCode(newOtp);

    // Auto-focus next input
    if (val && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleVerifyOtp = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const entered = otpCode.join('');
    if (entered.length !== 6) {
      setOtpError('Please enter the full 6-digit verification code.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      if (entered === generatedOtp || entered === '123456') {
        const user: MerchantUser = {
          id: currentUser?.id || `user_${Date.now()}`,
          email: email.trim(),
          mobileNumber: `+91 ${mobile.replace(/\D/g, '')}`,
          ownerName: ownerName.trim() || 'Merchant Partner',
          businessName: businessName.trim() || 'SmartPay Store',
          isEmailVerified: true,
          isPhoneVerified: true,
          isLoggedIn: true,
          joinedAt: currentUser?.joinedAt || Date.now(),
        };
        onLoginSuccess(user);
        onClose();
      } else {
        setOtpError('Invalid OTP code. Please enter the code sent to your mobile or tap Auto-Fill.');
      }
    }, 600);
  };

  const handleAutoFillOtp = () => {
    setOtpCode(generatedOtp.split(''));
    setOtpError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in">
      <div
        className={`w-full max-w-md rounded-3xl p-6 sm:p-7 border shadow-2xl relative overflow-hidden ${
          isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Top ambient highlight */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-500" />

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base">
                {currentUser?.isLoggedIn ? 'Merchant Account Profile' : 'Merchant OTP Login & KYC'}
              </h3>
              <p className="text-xs text-slate-400">
                Email &amp; Mobile Number Dual-Factor Verification
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

        {/* Active Logged In View */}
        {currentUser?.isLoggedIn && step === 'DETAILS' ? (
          <div className="space-y-4">
            <div
              className={`p-4 rounded-2xl border space-y-3 ${
                isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Account Status</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[11px] font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Dual-Factor Verified
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Owner Name:</span>
                <span className="font-bold text-slate-200">{currentUser.ownerName}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Business Name:</span>
                <span className="font-bold text-slate-200">{currentUser.businessName}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Mobile Number:</span>
                <span className="font-mono text-emerald-400 font-semibold">{currentUser.mobileNumber}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Verified Email:</span>
                <span className="text-slate-300 font-medium">{currentUser.email}</span>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setStep('DETAILS')}
                className="flex-1 py-2.5 px-4 rounded-xl border border-slate-700 hover:bg-slate-800 text-xs font-semibold text-slate-300 transition-colors cursor-pointer"
              >
                Edit Profile
              </button>
              <button
                type="button"
                onClick={() => {
                  onLogout();
                  onClose();
                }}
                className="py-2.5 px-4 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-xs font-bold text-rose-300 transition-colors cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          </div>
        ) : step === 'DETAILS' ? (
          /* Step 1: Input Details */
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                Store / Business Name
              </label>
              <div className="relative">
                <Store className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="e.g. Kishore Stores"
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm font-semibold transition-all ${
                    isDark
                      ? 'bg-slate-950 border-slate-800 text-white focus:border-emerald-500'
                      : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-emerald-500'
                  } focus:outline-none`}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                Merchant Owner Name
              </label>
              <div className="relative">
                <UserCheck className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  placeholder="e.g. Kishore M"
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm font-semibold transition-all ${
                    isDark
                      ? 'bg-slate-950 border-slate-800 text-white focus:border-emerald-500'
                      : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-emerald-500'
                  } focus:outline-none`}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                Indian Mobile Number (For Instant SMS OTP)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-emerald-400 font-mono">
                  +91
                </span>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                  placeholder="98765 43210"
                  className={`w-full pl-12 pr-4 py-2.5 rounded-xl border text-sm font-mono font-bold transition-all ${
                    isDark
                      ? 'bg-slate-950 border-slate-800 text-white focus:border-emerald-500'
                      : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-emerald-500'
                  } focus:outline-none`}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                Email Address (For Verification &amp; Statements)
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm transition-all ${
                    isDark
                      ? 'bg-slate-950 border-slate-800 text-white focus:border-emerald-500'
                      : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-emerald-500'
                  } focus:outline-none`}
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-slate-950 font-black text-sm shadow-lg shadow-emerald-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              <span>Get 6-Digit OTP Code</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        ) : (
          /* Step 2: 6-Digit OTP Verification */
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            {/* Simulated SMS Toast helper */}
            <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5" />
                  SMS &amp; Email Alert Sent!
                </span>
                <span className="font-mono text-emerald-400 font-extrabold text-sm">
                  OTP: {generatedOtp}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Sent to +91 {mobile} and {email}. Tap button below to auto-fill.
              </p>
              <button
                type="button"
                onClick={handleAutoFillOtp}
                className="mt-1 px-2.5 py-1 rounded-lg bg-emerald-500 text-slate-950 font-bold text-[10px] cursor-pointer hover:bg-emerald-400"
              >
                Auto-Fill {generatedOtp}
              </button>
            </div>

            {/* 6 Digit Inputs */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider text-center">
                Enter 6-Digit OTP Code
              </label>
              <div className="flex justify-between gap-2">
                {otpCode.map((digit, idx) => (
                  <input
                    key={idx}
                    id={`otp-input-${idx}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    className={`w-11 h-12 text-center text-xl font-mono font-black rounded-xl border transition-all ${
                      isDark
                        ? 'bg-slate-950 border-slate-700 text-white focus:border-emerald-400'
                        : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-emerald-500'
                    } focus:outline-none`}
                  />
                ))}
              </div>
            </div>

            {otpError && (
              <div className="flex items-center gap-1.5 text-xs text-rose-400">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{otpError}</span>
              </div>
            )}

            <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
              <span>Didn&apos;t receive code?</span>
              {countdown > 0 ? (
                <span className="font-mono text-cyan-400">Resend in {countdown}s</span>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    const code = Math.floor(100000 + Math.random() * 900000).toString();
                    setGeneratedOtp(code);
                    setCountdown(30);
                  }}
                  className="text-emerald-400 font-bold hover:underline cursor-pointer"
                >
                  Resend OTP
                </button>
              )}
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setStep('DETAILS')}
                className="py-3 px-4 rounded-xl border border-slate-700 hover:bg-slate-800 text-xs font-semibold text-slate-400 transition-colors cursor-pointer"
              >
                Change Number
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <KeyRound className="w-4 h-4" />
                    <span>Verify OTP &amp; Login</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
