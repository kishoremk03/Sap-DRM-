import React, { useState, useMemo } from 'react';
import {
  Search,
  Download,
  Trash2,
  ShieldAlert,
  Calendar,
  Sparkles,
  CheckCircle2,
  Building2,
} from 'lucide-react';
import { Transaction } from '../types';
import { EmptyHistoryState } from './EmptyHistoryState';

interface HistoryViewProps {
  transactions: Transaction[];
  onClearAll: () => void;
  onClearDemo: () => void;
  onSimulatePayment?: () => void;
  onTestSound?: () => void;
  isDark: boolean;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  transactions,
  onClearAll,
  onClearDemo,
  onSimulatePayment,
  onTestSound,
  isDark,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedApp, setSelectedApp] = useState('All');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'month'>('all');
  const [showConfirmClear, setShowConfirmClear] = useState(false);

  const filteredTransactions = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

    return transactions.filter((t) => {
      // Date filter
      if (dateFilter === 'today' && t.timestamp < startOfToday) return false;
      if (dateFilter === 'month' && t.timestamp < startOfMonth) return false;

      // App filter
      if (selectedApp !== 'All' && t.sourceApp !== selectedApp) return false;

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesApp = t.sourceApp.toLowerCase().includes(query);
        const matchesSender = t.senderName.toLowerCase().includes(query);
        const matchesRef = t.upiReference.toLowerCase().includes(query);
        const matchesAmount = t.amount.toString().includes(query);
        if (!matchesApp && !matchesSender && !matchesRef && !matchesAmount) return false;
      }

      return true;
    });
  }, [transactions, searchQuery, selectedApp, dateFilter]);

  const totalFilteredSum = useMemo(() => {
    return filteredTransactions.reduce((acc, curr) => acc + curr.amount, 0);
  }, [filteredTransactions]);

  const exportCsv = () => {
    const headers = ['Timestamp', 'Date', 'Source App', 'Sender Name', 'Amount (INR)', 'UPI Reference', 'Status', 'Is Sample Demo'];
    const rows = filteredTransactions.map((t) => [
      t.timestamp,
      new Date(t.timestamp).toLocaleString('en-IN'),
      `"${t.sourceApp}"`,
      `"${t.senderName}"`,
      t.amount,
      `"${t.upiReference}"`,
      `"${t.detectionStatus}"`,
      t.isSampleDemo ? 'YES' : 'NO',
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `SmartPay-Transactions-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5">
      {/* Search and Quick Filters */}
      <div
        className={`p-4 sm:p-5 rounded-3xl border ${
          isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}
      >
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between mb-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search sender, app, ref, or amount…"
              className={`w-full pl-10 pr-4 py-2.5 rounded-2xl border text-sm transition-all ${
                isDark
                  ? 'bg-slate-800/80 border-slate-700/80 text-white placeholder-slate-500 focus:border-emerald-500'
                  : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:border-emerald-500'
              }`}
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={exportCsv}
              disabled={filteredTransactions.length === 0}
              className={`px-3.5 py-2.5 rounded-2xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                isDark
                  ? 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
                  : 'bg-slate-100 border-slate-200 text-slate-700 hover:text-slate-900'
              }`}
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={onClearDemo}
              className={`px-3.5 py-2.5 rounded-2xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                isDark
                  ? 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
                  : 'bg-slate-100 border-slate-200 text-slate-700 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Clear Demo</span>
            </button>

            <button
              onClick={() => setShowConfirmClear(true)}
              disabled={transactions.length === 0}
              className="px-3.5 py-2.5 rounded-2xl border border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear All</span>
            </button>
          </div>
        </div>

        {/* Date Tabs & App Horizontal Filter Carousel */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Calendar className="w-3 h-3" /> Timeframe:
            </span>
            <div className="flex items-center gap-1.5">
              {(['all', 'today', 'month'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setDateFilter(tab)}
                  className={`px-3 py-1 rounded-xl text-xs font-semibold capitalize transition-all cursor-pointer ${
                    dateFilter === tab
                      ? 'bg-emerald-500 text-slate-950 font-bold'
                      : isDark
                      ? 'bg-slate-800 text-slate-400 hover:text-slate-200'
                      : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tab === 'all' ? 'All Time' : tab === 'today' ? 'Today' : 'This Month'}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <span className="text-xs text-slate-400 shrink-0">App:</span>
            {['All', 'PhonePe', 'Google Pay', 'Paytm', 'BHIM UPI', 'CRED', 'Amazon Pay'].map((app) => (
              <button
                key={app}
                onClick={() => setSelectedApp(app)}
                className={`px-3 py-1 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                  selectedApp === app
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                    : isDark
                    ? 'bg-slate-800/60 text-slate-400 hover:text-slate-200 border border-slate-700/60'
                    : 'bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200'
                }`}
              >
                {app}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Aggregate Bar */}
      <div className="flex items-center justify-between text-xs px-2 text-slate-400">
        <div>
          Showing <span className="font-bold text-white">{filteredTransactions.length}</span> records
        </div>
        <div>
          Filtered Total:{' '}
          <span className="font-mono font-bold text-emerald-400 text-sm">
            ₹
            {totalFilteredSum.toLocaleString('en-IN', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
        </div>
      </div>

      {/* Transaction Feed */}
      {filteredTransactions.length === 0 ? (
        <EmptyHistoryState
          isFilterEmpty={transactions.length > 0}
          searchQuery={searchQuery}
          selectedApp={selectedApp}
          onResetFilters={() => {
            setSearchQuery('');
            setSelectedApp('All');
            setDateFilter('all');
          }}
          onSimulatePayment={onSimulatePayment}
          onTestSound={onTestSound}
          isDark={isDark}
        />
      ) : (
        <div className="space-y-3">
          {filteredTransactions.map((txn) => (
            <div
              key={txn.id}
              className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                isDark
                  ? 'bg-slate-900/80 border-slate-800/90 hover:border-slate-700'
                  : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
              }`}
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                    txn.isSampleDemo
                      ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                      : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  }`}
                >
                  <span className="font-bold font-mono text-base">₹</span>
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm truncate">{txn.sourceApp}</span>
                    <span className="text-xs text-slate-400 truncate">· {txn.senderName}</span>
                    {txn.isSampleDemo && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-semibold">
                        DEMO
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                    <span>{new Date(txn.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                    <span>·</span>
                    <span className="font-mono text-[10px] truncate max-w-[140px] sm:max-w-none">{txn.upiReference}</span>
                  </div>

                  {/* Settlement Status / Safety Notice */}
                  {txn.isBankVerified ? (
                    <div className="mt-1 flex items-center gap-1.5 text-[10px] text-emerald-400 font-semibold">
                      <CheckCircle2 className="w-3 h-3 shrink-0 text-emerald-400" />
                      <span>
                        Bank Verified Settlement
                        {txn.settledBankName ? ` (${txn.settledBankName} ${txn.settledAccountNumberMasked || ''})` : ''}
                      </span>
                    </div>
                  ) : (
                    <div className="mt-1 flex items-center gap-1 text-[10px] text-amber-400">
                      <ShieldAlert className="w-3 h-3 shrink-0" />
                      <span>{txn.detectionStatus}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="text-right shrink-0">
                <div className="font-mono font-bold text-emerald-400 text-lg sm:text-xl tabular-nums">
                  +₹{txn.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className="text-[10px] text-slate-400">
                  {new Date(txn.timestamp).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmClear && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div
            className={`w-full max-w-sm rounded-3xl p-6 border shadow-2xl space-y-4 ${
              isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <h3 className="font-bold text-lg">Clear All Transactions?</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              This will permanently delete all stored payment notification records from this device. This action cannot be undone.
            </p>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowConfirmClear(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-700 text-xs font-semibold text-slate-300 hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onClearAll();
                  setShowConfirmClear(false);
                }}
                className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-xs font-bold shadow-lg shadow-red-500/20"
              >
                Delete All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
