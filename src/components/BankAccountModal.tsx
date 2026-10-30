import React, { useState, useEffect } from 'react';
import {
  Building2,
  CheckCircle2,
  X,
  ShieldCheck,
  AlertCircle,
  RefreshCw,
  Coins,
  ArrowRight,
  Eye,
  EyeOff,
  HelpCircle,
} from 'lucide-react';
import { BankAccount } from '../types';
import {
  POPULAR_INDIAN_BANKS,
  lookupIfscBranch,
  validateIfsc,
  simulatePennyDropVerification,
} from '../data/indianBanks';

interface BankAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  bankAccount: BankAccount | null;
  defaultHolderName?: string;
  onSaveBankAccount: (account: BankAccount) => void;
  isDark: boolean;
}

export const BankAccountModal: React.FC<BankAccountModalProps> = ({
  isOpen,
  onClose,
  bankAccount,
  defaultHolderName,
  onSaveBankAccount,
  isDark,
}) => {
  const [selectedBank, setSelectedBank] = useState<string>('State Bank of India');
  const [accountNumber, setAccountNumber] = useState('');
  const [confirmAccountNumber, setConfirmAccountNumber] = useState('');
  const [showAccountNumber, setShowAccountNumber] = useState(false);
  const [ifscCode, setIfscCode] = useState('SBIN0000691');
  const [holderName, setHolderName] = useState(defaultHolderName || 'Kishore M');
  const [accountType, setAccountType] = useState<'CURRENT' | 'SAVINGS'>('CURRENT');

  const [ifscLookup, setIfscLookup] = useState({
    bankName: 'State Bank of India',
    branch: 'Mumbai Main Branch, Fort',
    isValid: true,
  });

  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationStep, setVerificationStep] = useState<string>('');
  const [verificationResult, setVerificationResult] = useState<{
    success: boolean;
    utr?: string;
    message?: string;
  } | null>(null);

  useEffect(() => {
    if (bankAccount) {
      setSelectedBank(bankAccount.bankName);
      setAccountNumber(bankAccount.accountNumber);
      setConfirmAccountNumber(bankAccount.accountNumber);
      setIfscCode(bankAccount.ifscCode);
      setHolderName(bankAccount.accountHolderName);
      setAccountType(bankAccount.accountType);
    } else if (defaultHolderName) {
      setHolderName(defaultHolderName);
    }
  }, [bankAccount, defaultHolderName]);

  // Real-time IFSC lookup
  useEffect(() => {
    if (ifscCode.length >= 4) {
      const result = lookupIfscBranch(ifscCode);
      setIfscLookup(result);
    }
  }, [ifscCode]);

  if (!isOpen) return null;

  const isAccountMatch =
    accountNumber.length >= 9 &&
    accountNumber === confirmAccountNumber;

  const handleSelectBankChip = (name: string, sampleIfsc: string) => {
    setSelectedBank(name);
    setIfscCode(sampleIfsc);
  };

  const handleStartPennyDropVerification = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAccountMatch) {
      alert('Account numbers do not match. Please verify your account number.');
      return;
    }

    if (!validateIfsc(ifscCode)) {
      alert('Please enter a valid 11-character Indian IFSC code (e.g. SBIN0000691).');
      return;
    }

    setIsVerifying(true);
    setVerificationStep('Connecting to NPCI IMPS Clearing Network…');

    try {
      await new Promise((r) => setTimeout(r, 600));
      setVerificationStep('Initiating ₹1.00 Penny-Drop IMPS credit test…');
      await new Promise((r) => setTimeout(r, 700));
      setVerificationStep('Verifying Beneficiary Account Name match…');

      const result = await simulatePennyDropVerification({
        bankName: selectedBank,
        accountNumber,
        ifscCode,
        holderName,
      });

      const masked = `•••• •••• ${accountNumber.slice(-4)}`;
      const verifiedAccount: BankAccount = {
        id: bankAccount?.id || `bank_${Date.now()}`,
        bankName: selectedBank,
        accountNumber,
        accountNumberMasked: masked,
        ifscCode: ifscCode.trim().toUpperCase(),
        branchName: ifscLookup.branch,
        accountHolderName: holderName.trim().toUpperCase(),
        accountType,
        isVerified: true,
        verifiedAt: Date.now(),
        pennyDropAmount: 1.0,
        pennyDropUtr: result.utr,
        status: 'VERIFIED',
      };

      setVerificationResult({
        success: true,
        utr: result.utr,
        message: result.message,
      });

      onSaveBankAccount(verifiedAccount);
      setTimeout(() => {
        setIsVerifying(false);
      }, 500);
    } catch (_err) {
      setIsVerifying(false);
      alert('Penny drop verification timed out. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in">
      <div
        className={`w-full max-w-lg rounded-3xl p-6 sm:p-7 border shadow-2xl relative overflow-hidden max-h-[90vh] overflow-y-auto ${
          isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Top ambient highlight */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-500" />

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base">Register &amp; Verify Bank Account</h3>
              <p className="text-xs text-slate-400">
                Penny-Drop IMPS Verification for Audio Settlement Notifications
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

        {/* Existing verified banner if any */}
        {bankAccount?.isVerified && !verificationResult && (
          <div className="mb-4 p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-xs text-emerald-300 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Active Verified Bank Account
              </span>
              <span className="font-mono text-[10px] bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/30">
                UTR: {bankAccount.pennyDropUtr}
              </span>
            </div>
            <div className="text-slate-300">
              {bankAccount.bankName} ({bankAccount.accountNumberMasked}) — {bankAccount.branchName}
            </div>
          </div>
        )}

        {/* Verification Success Screen */}
        {verificationResult?.success ? (
          <div className="py-6 text-center space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 border-2 border-emerald-500/50 flex items-center justify-center text-emerald-400 mx-auto animate-bounce">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-emerald-400">
                Bank Account Verified Successfully!
              </h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                NPCI penny-drop IMPS credit of ₹1.00 succeeded. Your merchant payouts and received payment announcements are now linked to this bank account!
              </p>
            </div>

            <div
              className={`p-4 rounded-2xl border text-xs space-y-2 text-left ${
                isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex justify-between">
                <span className="text-slate-400">Bank:</span>
                <span className="font-bold text-slate-200">{selectedBank}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Account:</span>
                <span className="font-mono text-emerald-400">•••• •••• {accountNumber.slice(-4)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">IFSC Code:</span>
                <span className="font-mono text-slate-300">{ifscCode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">NPCI IMPS UTR:</span>
                <span className="font-mono text-[11px] text-cyan-400">{verificationResult.utr}</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 cursor-pointer"
            >
              Done &amp; Return to Sound Box
            </button>
          </div>
        ) : (
          /* Bank Registration Form */
          <form onSubmit={handleStartPennyDropVerification} className="space-y-4">
            {/* Quick Bank Chips */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                Select Popular Bank
              </label>
              <div className="flex flex-wrap gap-1.5">
                {POPULAR_INDIAN_BANKS.slice(0, 8).map((b) => (
                  <button
                    key={b.code}
                    type="button"
                    onClick={() => handleSelectBankChip(b.name, b.sampleIfsc)}
                    className={`px-2.5 py-1 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                      selectedBank === b.name
                        ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-bold shadow-md shadow-emerald-500/20'
                        : isDark
                        ? 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750'
                        : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                    }`}
                  >
                    {b.shortName}
                  </button>
                ))}
              </div>
            </div>

            {/* Bank Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                Bank Name
              </label>
              <input
                type="text"
                required
                value={selectedBank}
                onChange={(e) => setSelectedBank(e.target.value)}
                placeholder="e.g. State Bank of India"
                className={`w-full px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all ${
                  isDark
                    ? 'bg-slate-950 border-slate-800 text-white focus:border-emerald-500'
                    : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-emerald-500'
                } focus:outline-none`}
              />
            </div>

            {/* Account Holder Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                Account Holder Name (As per Bank Records)
              </label>
              <input
                type="text"
                required
                value={holderName}
                onChange={(e) => setHolderName(e.target.value)}
                placeholder="e.g. Kishore M"
                className={`w-full px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all ${
                  isDark
                    ? 'bg-slate-950 border-slate-800 text-white focus:border-emerald-500'
                    : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-emerald-500'
                } focus:outline-none`}
              />
            </div>

            {/* Account Numbers (With Confirmation Check) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Account Number
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowAccountNumber(!showAccountNumber)}
                    className="text-slate-400 hover:text-slate-200 text-[10px] flex items-center gap-1 cursor-pointer"
                  >
                    {showAccountNumber ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    <span>{showAccountNumber ? 'Hide' : 'Show'}</span>
                  </button>
                </div>
                <input
                  type={showAccountNumber ? 'text' : 'password'}
                  required
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))}
                  placeholder="11 to 16 digits"
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm font-mono font-bold transition-all ${
                    isDark
                      ? 'bg-slate-950 border-slate-800 text-white focus:border-emerald-500'
                      : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-emerald-500'
                  } focus:outline-none`}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                  Confirm Account Number
                </label>
                <input
                  type="text"
                  required
                  value={confirmAccountNumber}
                  onChange={(e) => setConfirmAccountNumber(e.target.value.replace(/\D/g, ''))}
                  placeholder="Re-enter to verify"
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm font-mono font-bold transition-all ${
                    confirmAccountNumber && !isAccountMatch
                      ? 'border-rose-500/80 bg-rose-500/10 text-rose-300'
                      : isAccountMatch
                      ? 'border-emerald-500/80 bg-emerald-500/10 text-emerald-300'
                      : isDark
                      ? 'bg-slate-950 border-slate-800 text-white'
                      : 'bg-slate-50 border-slate-200 text-slate-900'
                  } focus:outline-none`}
                />
              </div>
            </div>

            {/* Account Type Toggle */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setAccountType('CURRENT')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  accountType === 'CURRENT'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-sm'
                    : isDark
                    ? 'bg-slate-950 border-slate-800 text-slate-400'
                    : 'bg-slate-100 border-slate-200 text-slate-600'
                }`}
              >
                Current Account (Sound Box Recommended)
              </button>
              <button
                type="button"
                onClick={() => setAccountType('SAVINGS')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  accountType === 'SAVINGS'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-sm'
                    : isDark
                    ? 'bg-slate-950 border-slate-800 text-slate-400'
                    : 'bg-slate-100 border-slate-200 text-slate-600'
                }`}
              >
                Savings Account
              </button>
            </div>

            {/* IFSC Code with instant auto-lookup branch */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                Bank IFSC Code
              </label>
              <input
                type="text"
                required
                maxLength={11}
                value={ifscCode}
                onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                placeholder="e.g. SBIN0000691"
                className={`w-full px-4 py-2.5 rounded-xl border text-sm font-mono font-bold uppercase transition-all ${
                  ifscLookup.isValid
                    ? 'border-emerald-500/50'
                    : 'border-slate-800'
                } ${isDark ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'} focus:outline-none`}
              />
              {ifscLookup.isValid && (
                <div className="flex items-center gap-1.5 text-xs text-emerald-400 mt-1">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>
                    {ifscLookup.bankName} — {ifscLookup.branch}
                  </span>
                </div>
              )}
            </div>

            {/* Verification Action */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isVerifying || !isAccountMatch}
                className={`w-full py-3.5 px-4 rounded-xl font-black text-xs shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  isAccountMatch
                    ? 'bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-slate-950 shadow-emerald-500/20'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                }`}
              >
                {isVerifying ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                    <span>{verificationStep || 'Verifying Penny Drop…'}</span>
                  </>
                ) : (
                  <>
                    <Coins className="w-4 h-4" />
                    <span>Verify Bank Account with ₹1.00 Penny-Drop</span>
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
