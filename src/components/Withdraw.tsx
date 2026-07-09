import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Check, 
  HelpCircle, 
  Smartphone, 
  CreditCard, 
  DollarSign, 
  Wallet, 
  Send, 
  Clock, 
  ShieldAlert, 
  Activity, 
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { User, Withdrawal } from '../types';

interface WithdrawProps {
  user: User;
  onRefreshProfile: () => void;
}

export default function Withdraw({ user, onRefreshProfile }: WithdrawProps) {
  const [method, setMethod] = useState<'bKash' | 'Nagad' | 'Rocket' | 'Upay' | 'Mobile Recharge'>('bKash');
  const [accountNumber, setAccountNumber] = useState('');
  const [points, setPoints] = useState<number>(10000); // Default 100 BDT
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const fetchWithdrawHistory = async () => {
    try {
      const res = await fetch(`/api/v1/withdrawals/${user.username}`);
      if (res.ok) {
        const data = await res.json();
        setWithdrawals(data);
      }
    } catch (err) {
      console.error('History fetch error:', err);
    }
  };

  useEffect(() => {
    fetchWithdrawHistory();
  }, [user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    // Inputs Validation
    if (!accountNumber) {
      setMessage({ type: 'error', text: 'Please enter your account or mobile number.' });
      return;
    }

    if (isNaN(points) || points <= 0) {
      setMessage({ type: 'error', text: 'Please enter a valid amount of points.' });
      return;
    }

    if (user.balancePoints < points) {
      setMessage({ type: 'error', text: 'Insufficient points in your available balance.' });
      return;
    }

    const isRecharge = method === 'Mobile Recharge';
    const minPoints = isRecharge ? 2000 : 10000; // 20 BDT vs 100 BDT

    if (points < minPoints) {
      setMessage({ 
        type: 'error', 
        text: `Minimum withdrawal is ${minPoints} PTS (${minPoints / 100} BDT) for ${method}.` 
      });
      return;
    }

    // Open formal confirmation dialog
    setShowConfirmDialog(true);
  };

  const handleConfirmWithdraw = async () => {
    setShowConfirmDialog(false);
    setLoading(true);

    try {
      const res = await fetch('/api/v1/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: user.username,
          method,
          accountNumber,
          points
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Withdrawal submission failed.');
      }

      setMessage({ type: 'success', text: data.message });
      setAccountNumber('');
      onRefreshProfile(); // Sync new balance immediately
      fetchWithdrawHistory(); // Reload history log
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const getMethodDetails = (m: string) => {
    switch (m) {
      case 'bKash':
        return { color: 'bg-[#D12053]', textColor: 'text-[#D12053]', label: 'bKash Wallet', desc: 'Min: 10,000 PTS (100 TK)' };
      case 'Nagad':
        return { color: 'bg-gradient-to-r from-[#EC1C24] to-[#F37021]', textColor: 'text-[#EC1C24]', label: 'Nagad Wallet', desc: 'Min: 10,000 PTS (100 TK)' };
      case 'Rocket':
        return { color: 'bg-[#8C3494]', textColor: 'text-[#8C3494]', label: 'Rocket Wallet', desc: 'Min: 10,000 PTS (100 TK)' };
      case 'Upay':
        return { color: 'bg-[#005B94]', textColor: 'text-[#005B94]', label: 'Upay Wallet', desc: 'Min: 10,000 PTS (100 TK)' };
      default:
        return { color: 'bg-[#0EA5E9]', textColor: 'text-[#0EA5E9]', label: 'Mobile Recharge', desc: 'Min: 2,000 PTS (20 TK)' };
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-8" id="withdraw-root">
      
      {/* Page Header */}
      <div className="border-b border-slate-100 pb-6">
        <h2 className="text-2xl font-black font-display text-slate-800 flex items-center gap-2">
          <CreditCard className="w-6 h-6 text-emerald-500" />
          Bangladesh Secure Cash Out Portal
        </h2>
        <p className="text-sm text-slate-500">Withdraw your points into real BDT currency instantly. 1000 Points = 10 BDT. Safe escrow payouts.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* WITHDRAW FORM AND SELECTOR (8 Cols on desktop) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Methods Selector Grid */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">
              1. Choose Payment Channel
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {(['bKash', 'Nagad', 'Rocket', 'Upay', 'Mobile Recharge'] as const).map((m) => {
                const det = getMethodDetails(m);
                const isSelected = method === m;
                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => {
                      setMethod(m);
                      setPoints(m === 'Mobile Recharge' ? 2000 : 10000);
                    }}
                    className={`p-4 rounded-xl border text-left transition relative cursor-pointer flex flex-col justify-between h-28 overflow-hidden ${
                      isSelected 
                        ? 'border-blue-600 ring-2 ring-blue-500/10 shadow-sm bg-blue-50/10' 
                        : 'border-slate-100 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className={`px-2 py-1 text-[10px] font-extrabold text-white rounded ${det.color}`}>
                        {m.substring(0, 2)}
                      </span>
                      {isSelected && <span className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center text-white"><Check className="w-3 h-3" /></span>}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold font-display text-slate-800 leading-tight">{m}</h4>
                      <p className="text-[10px] font-semibold text-slate-400 mt-1">{det.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Form */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-5">
              
              {message && (
                <div className={`p-4 rounded-xl border text-sm font-semibold flex items-start gap-2.5 ${
                  message.type === 'success' 
                    ? 'bg-emerald-50 border-emerald-100 text-emerald-700' 
                    : 'bg-red-50 border-red-100 text-red-700'
                }`}>
                  {message.type === 'success' ? <CheckCircle className="w-5 h-5 shrink-0 text-emerald-600" /> : <AlertCircle className="w-5 h-5 shrink-0 text-red-600" />}
                  <span>{message.text}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                  2. Account / Wallet Mobile Number
                </label>
                <div className="relative">
                  <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                  <input
                    type="tel"
                    required
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    placeholder={method === 'Mobile Recharge' ? 'e.g., 01712XXXXXX' : 'e.g., 01923XXXXXX (11 digits)'}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm font-semibold transition text-slate-800 bg-slate-50/50"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1.5">Make sure this is an active mobile number. Rocket numbers must include the 12th digit if applicable.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                    3. Withdrawal Points
                  </label>
                  <input
                    type="number"
                    required
                    min={method === 'Mobile Recharge' ? 2000 : 10000}
                    step={1000}
                    value={points}
                    onChange={(e) => setPoints(parseInt(e.target.value) || 0)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm font-semibold transition text-slate-800 bg-slate-50/50"
                  />
                </div>

                <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex flex-col justify-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Calculated payout</span>
                  <h4 className="text-xl font-extrabold font-display text-emerald-600 mt-0.5">
                    ৳ {(points / 100).toFixed(2)} BDT
                  </h4>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold font-display rounded-xl shadow-md transition disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 text-sm"
                id="submit-withdraw-button"
              >
                {loading ? (
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <>
                    Request Secure Cash Out
                    <Send className="w-4 h-4" />
                  </>
                )}
              </button>

            </form>
          </div>

        </div>

        {/* ACCOUNT LIMITS & RULES CARD (5 Cols on desktop) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Quick Balance Check */}
          <div className="bg-slate-900 text-white rounded-2xl p-6 relative overflow-hidden shadow-md">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-bl-full"></div>
            <div className="space-y-4">
              <span className="px-2.5 py-1 bg-white/10 text-white font-bold text-[10px] uppercase rounded-full">Your Wallet Balance</span>
              <div className="space-y-1">
                <p className="text-3xl font-black font-display text-white">
                  {user.balancePoints.toLocaleString()} <span className="text-base font-medium">PTS</span>
                </p>
                <p className="text-sm font-semibold text-emerald-400">
                  Equivalent: ৳ {(user.balancePoints / 100).toFixed(2)} BDT
                </p>
              </div>
            </div>
          </div>

          {/* Rules and guidelines card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
              <ShieldAlert className="w-4 h-4 text-orange-500" />
              BD Cash Out Guidelines
            </h4>
            <div className="text-xs text-slate-500 space-y-3 leading-relaxed">
              <p>
                <strong>Withdrawal Processing Hours:</strong> Payout verification logs are reviewed by the BD admin team daily between <strong>9:00 AM and 11:00 PM</strong> Bangladesh Time.
              </p>
              <p>
                <strong>Pending Approval Times:</strong> Mobile recharges are cleared automatically within <strong>1-2 hours</strong>. Mobile wallets (bKash, Nagad, Rocket, Upay) are processed in <strong>4-8 hours</strong>.
              </p>
              <p>
                <strong>System Integrity Checks:</strong> Multiple accounts, proxy VPN routing, or artificial clicks will lead to instant cashout cancelations and account suspensions.
              </p>
            </div>
          </div>

        </div>

      </div>

      {/* WITHDRAWAL HISTORY LEDGER */}
      <div className="space-y-4" id="withdraw-history-section">
        <div>
          <h3 className="text-lg font-bold font-display text-slate-800 flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-500" />
            Transaction History
          </h3>
          <p className="text-xs text-slate-500">Track and monitor your past cashout requests and their current status (Pending/Approved/Rejected).</p>
        </div>

        {withdrawals.length === 0 ? (
          <div className="bg-white border border-slate-100 p-8 rounded-2xl text-center text-slate-400 text-sm">
            You haven't requested any cashouts yet. Complete tasks to earn points and request payouts.
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-400 text-[10px] font-bold uppercase tracking-wider border-b border-slate-100">
                    <th className="px-6 py-4">Transaction ID</th>
                    <th className="px-6 py-4">Channel Method</th>
                    <th className="px-6 py-4">Recipient Account</th>
                    <th className="px-6 py-4">Points Deducted</th>
                    <th className="px-6 py-4">BDT Amount</th>
                    <th className="px-6 py-4">Request Date</th>
                    <th className="px-6 py-4">Ledger Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                  {withdrawals.map((wd) => (
                    <tr key={wd.id} className="hover:bg-slate-50/50 transition">
                      <td className="px-6 py-4 font-mono font-bold text-xs text-slate-500">{wd.id}</td>
                      <td className="px-6 py-4">
                        <span className="font-bold">{wd.method}</span>
                      </td>
                      <td className="px-6 py-4 font-mono text-xs">{wd.accountNumber}</td>
                      <td className="px-6 py-4 text-slate-500">{wd.amountPoints.toLocaleString()} PTS</td>
                      <td className="px-6 py-4 font-bold text-emerald-600">৳ {wd.amountBDT.toFixed(2)}</td>
                      <td className="px-6 py-4 text-xs text-slate-400">
                        {new Date(wd.createdAt).toLocaleDateString()} {new Date(wd.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold font-display ${
                          wd.status === 'approved' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                          wd.status === 'rejected' ? 'bg-red-50 text-red-600 border border-red-100' :
                          'bg-orange-50 text-orange-600 border border-orange-100'
                        }`}>
                          {wd.status.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {showConfirmDialog && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50" id="confirm-withdraw-modal">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full border border-slate-100 shadow-xl space-y-6">
            <div className="space-y-2">
              <h3 className="text-lg font-black font-display text-slate-900 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-orange-500 animate-pulse" />
                Confirm Cash Out Request
              </h3>
              <p className="text-xs text-slate-400">
                Please review your payment details carefully. Once submitted, request details cannot be altered or refunded.
              </p>
            </div>

            {/* Recipient Details Card */}
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-400 uppercase tracking-wider">Payment Channel</span>
                <span className="font-extrabold text-slate-800 bg-white px-2.5 py-1 rounded-md border border-slate-100 shadow-xs">
                  {method}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs border-t border-slate-200/50 pt-3">
                <span className="font-semibold text-slate-400 uppercase tracking-wider">Recipient Number</span>
                <span className="font-mono font-extrabold text-slate-800 bg-white px-2.5 py-1 rounded-md border border-slate-100 shadow-xs">
                  {accountNumber}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs border-t border-slate-200/50 pt-3">
                <span className="font-semibold text-slate-400 uppercase tracking-wider">Points Deducted</span>
                <span className="font-mono font-extrabold text-indigo-600 bg-white px-2.5 py-1 rounded-md border border-slate-100 shadow-xs">
                  {points.toLocaleString()} PTS
                </span>
              </div>
              <div className="flex justify-between items-center text-xs border-t border-slate-200/50 pt-3">
                <span className="font-semibold text-slate-400 uppercase tracking-wider">Calculated Payout</span>
                <span className="font-extrabold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100 shadow-xs">
                  ৳ {(points / 100).toFixed(2)} BDT
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-3.5 bg-orange-50 border border-orange-100 rounded-xl text-orange-800 text-[10px] leading-relaxed">
              <ShieldAlert className="w-4 h-4 shrink-0 text-orange-600 mt-0.5" />
              <span>
                <strong>Escrow Notice:</strong> Mobile wallets must be fully active to receive incoming escrow transfers. Accidental transfers to incorrect numbers or dormant accounts are non-refundable.
              </span>
            </div>

            {/* Modal actions */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmDialog(false)}
                className="flex-1 py-3 bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold font-display rounded-xl text-xs border border-slate-200 transition cursor-pointer"
                id="cancel-withdraw-modal-btn"
              >
                Go Back
              </button>
              <button
                type="button"
                onClick={handleConfirmWithdraw}
                className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold font-display rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-1.5"
                id="confirm-withdraw-modal-btn"
              >
                Confirm Cash Out
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
