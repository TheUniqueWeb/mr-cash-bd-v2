import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  ArrowDownLeft, 
  ArrowUpRight, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Calendar, 
  Smartphone, 
  TrendingUp, 
  DollarSign, 
  HelpCircle,
  RefreshCw,
  Wallet
} from 'lucide-react';

interface TransactionHistoryProps {
  username: string;
}

interface EarningLog {
  id: string;
  userId: string;
  username: string;
  payout: number;
  pointsCredited: number;
  ip: string;
  campaignName: string;
  createdAt: number;
}

interface WithdrawalLog {
  id: string;
  userId: string;
  username: string;
  email: string;
  method: string;
  accountNumber: string;
  amountPoints: number;
  amountBDT: number;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: number;
}

export default function TransactionHistory({ username }: TransactionHistoryProps) {
  const [activeTab, setActiveTab] = useState<'earnings' | 'withdrawals'>('earnings');
  const [earnings, setEarnings] = useState<EarningLog[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch concurrently
      const [earningsRes, withdrawalsRes] = await Promise.all([
        fetch(`/api/v1/earnings/${username}`),
        fetch(`/api/v1/withdrawals/${username}`)
      ]);

      if (!earningsRes.ok) throw new Error('Failed to load past task earnings.');
      if (!withdrawalsRes.ok) throw new Error('Failed to load withdrawal records.');

      const [earningsData, withdrawalsData] = await Promise.all([
        earningsRes.json(),
        withdrawalsRes.json()
      ]);

      setEarnings(earningsData);
      setWithdrawals(withdrawalsData);
    } catch (err: any) {
      console.error('Error fetching transactions:', err);
      setError(err.message || 'An error occurred while loading transaction logs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [username]);

  // Compute total task earnings
  const totalTaskPoints = earnings.reduce((sum, item) => sum + (item.pointsCredited || 0), 0);
  const totalWithdrawnPoints = withdrawals
    .filter(w => w.status === 'approved')
    .reduce((sum, item) => sum + (item.amountPoints || 0), 0);

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-6" id="transaction-history-root">
      
      {/* HEADER WITH TABS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div className="space-y-1">
          <h3 className="text-lg font-black font-display text-slate-800 flex items-center gap-2">
            <ArrowDownLeft className="w-5 h-5 text-emerald-500" />
            Transaction Ledger
          </h3>
          <p className="text-xs text-slate-400">
            Past verified task earnings and automated withdrawal ledger.
          </p>
        </div>

        {/* Tab triggers */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('earnings')}
            className={`px-4 py-2 rounded-xl text-xs font-bold font-display transition cursor-pointer ${
              activeTab === 'earnings'
                ? 'bg-slate-800 text-white shadow-xs'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
            id="tab-trigger-earnings"
          >
            Earnings ({earnings.length})
          </button>
          <button
            onClick={() => setActiveTab('withdrawals')}
            className={`px-4 py-2 rounded-xl text-xs font-bold font-display transition cursor-pointer ${
              activeTab === 'withdrawals'
                ? 'bg-slate-800 text-white shadow-xs'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
            id="tab-trigger-withdrawals"
          >
            Withdrawals ({withdrawals.length})
          </button>
          <button
            onClick={fetchTransactions}
            disabled={loading}
            className="p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition cursor-pointer disabled:opacity-50 shrink-0"
            id="refresh-transactions-btn"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-500' : ''}`} />
          </button>
        </div>
      </div>

      {/* QUICK SUMMARY METRICS */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Task Income</p>
          <h4 className="text-lg font-black font-display text-slate-800">
            {loading ? '...' : totalTaskPoints.toLocaleString()} <span className="text-[10px] font-semibold text-slate-500">PTS</span>
          </h4>
          <p className="text-[9px] text-slate-400 font-mono">≈ ৳ {((totalTaskPoints || 0) / 100).toFixed(2)} BDT</p>
        </div>
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Successfully Paid Out</p>
          <h4 className="text-lg font-black font-display text-slate-800">
            {loading ? '...' : totalWithdrawnPoints.toLocaleString()} <span className="text-[10px] font-semibold text-slate-500">PTS</span>
          </h4>
          <p className="text-[9px] text-slate-400 font-mono">≈ ৳ {((totalWithdrawnPoints || 0) / 100).toFixed(2)} BDT</p>
        </div>
      </div>

      {/* CONTENT LIST */}
      <div className="space-y-4">
        {loading ? (
          <div className="space-y-3 py-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-slate-100 animate-pulse">
                <div className="space-y-1 flex-1">
                  <div className="h-3 bg-slate-100 rounded w-1/3" />
                  <div className="h-2 bg-slate-100 rounded w-1/4" />
                </div>
                <div className="w-16 h-4 bg-slate-100 rounded" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-8 text-xs text-red-500 font-semibold bg-red-50 rounded-2xl border border-red-100">
            {error}
          </div>
        ) : activeTab === 'earnings' ? (
          /* EARNINGS LIST */
          earnings.length === 0 ? (
            <div className="text-center py-10 border border-dashed border-slate-100 rounded-3xl space-y-2">
              <span className="text-2xl">⚡</span>
              <p className="text-xs font-bold text-slate-500">No earnings logged yet</p>
              <p className="text-[10px] text-slate-400 leading-relaxed max-w-xs mx-auto">
                Once you complete premium offers or survey tasks from the offerwall, rewards will credit here instantly.
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[450px] overflow-y-auto pr-1">
              {earnings.map((earn) => (
                <div key={earn.id} className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-slate-100 hover:border-emerald-100 hover:bg-emerald-50/10 transition gap-4">
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="w-5 h-5 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                        <ArrowDownLeft className="w-3.5 h-3.5" />
                      </span>
                      <h4 className="text-xs font-black text-slate-800 truncate leading-tight">
                        {earn.campaignName}
                      </h4>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-400 font-semibold">
                      <span className="flex items-center gap-0.5">
                        <Calendar className="w-3 h-3" />
                        {new Date(earn.createdAt).toLocaleString()}
                      </span>
                      <span className="font-mono">IP: {earn.ip}</span>
                      <span className="font-mono text-[9px] bg-slate-100 px-1 py-0.2 rounded">ID: {earn.id}</span>
                    </div>
                  </div>
                  
                  <div className="text-right shrink-0">
                    <p className="text-xs font-mono font-black text-emerald-600">
                      +{earn.pointsCredited.toLocaleString()} PTS
                    </p>
                    <p className="text-[9px] text-slate-400 font-bold font-sans">
                      ৳ {(earn.pointsCredited / 100).toFixed(2)} TK
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          /* WITHDRAWALS LIST */
          withdrawals.length === 0 ? (
            <div className="text-center py-10 border border-dashed border-slate-100 rounded-3xl space-y-2">
              <span className="text-2xl">💸</span>
              <p className="text-xs font-bold text-slate-500">No withdrawals requested yet</p>
              <p className="text-[10px] text-slate-400 leading-relaxed max-w-xs mx-auto">
                Accrued points can be withdrawn instantly to your bKash, Nagad, Rocket, Upay, or Mobile Recharge account.
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[450px] overflow-y-auto pr-1">
              {withdrawals.map((withdraw) => {
                const isApproved = withdraw.status === 'approved';
                const isRejected = withdraw.status === 'rejected';
                const isPending = withdraw.status === 'pending';

                const statusColor = isApproved 
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                  : isRejected 
                  ? 'bg-red-50 text-red-700 border-red-100' 
                  : 'bg-orange-50 text-orange-700 border-orange-100';

                const StatusIcon = isApproved 
                  ? CheckCircle 
                  : isRejected 
                  ? XCircle 
                  : Clock;

                return (
                  <div key={withdraw.id} className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100 hover:bg-slate-50 transition space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="w-5 h-5 rounded-md bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </span>
                          <h4 className="text-xs font-black text-slate-800">
                            Cash Out via {withdraw.method}
                          </h4>
                        </div>
                        <p className="text-[10px] text-slate-500 font-mono font-semibold">
                          Account: {withdraw.accountNumber}
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <p className="text-xs font-mono font-black text-slate-800">
                          {withdraw.amountPoints.toLocaleString()} PTS
                        </p>
                        <p className="text-[10px] text-emerald-600 font-bold font-sans">
                          ৳ {withdraw.amountBDT.toFixed(2)} TK
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100/60 text-[10px]">
                      <span className="text-slate-400 font-mono flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(withdraw.createdAt).toLocaleString()}
                      </span>

                      <span className={`px-2 py-0.5 rounded-full border flex items-center gap-1 font-bold ${statusColor}`}>
                        <StatusIcon className="w-3 h-3" />
                        {withdraw.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        )}
      </div>
    </div>
  );
}
