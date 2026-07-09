import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Users, Gift, Share2, Copy, Check, Calendar, ArrowUpRight, TrendingUp, RefreshCw } from 'lucide-react';

interface ReferralDashboardProps {
  username: string;
}

export default function ReferralDashboard({ username }: ReferralDashboardProps) {
  const [data, setData] = useState<{
    totalReferred: number;
    totalBonusPoints: number;
    referrals: any[];
    bonusLogs: any[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const fetchReferralStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/v1/user/referrals-detailed/${username}`);
      if (!res.ok) throw new Error('Failed to fetch detailed referral statistics.');
      const json = await res.json();
      setData(json);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred while loading referral data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReferralStats();
  }, [username]);

  const referralLink = `${window.location.origin}?ref=${username}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const bdtEarned = data ? (data.totalBonusPoints / 100).toFixed(2) : '0.00';

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-6" id="referral-dashboard-root">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-lg font-black font-display text-slate-800 flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-500" />
            Referral Dashboard
          </h3>
          <p className="text-xs text-slate-400">
            Track user signups, commission bonuses, and share your unique referral link.
          </p>
        </div>
        <button
          onClick={fetchReferralStats}
          disabled={loading}
          className="p-2 text-slate-400 hover:text-indigo-600 rounded-xl hover:bg-slate-50 transition cursor-pointer disabled:opacity-50"
          id="refresh-referrals-btn"
          title="Refresh stats"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-indigo-500' : ''}`} />
        </button>
      </div>

      {/* QUICK STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Total Referred Users */}
        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100/50 p-5 rounded-2xl border border-indigo-100/40 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-indigo-600/80 uppercase tracking-wider">Signed Up Users</p>
            <h4 className="text-2xl font-black font-display text-indigo-950">
              {loading ? '...' : data?.totalReferred || 0} <span className="text-xs font-semibold text-indigo-600/70">Users</span>
            </h4>
            <p className="text-[10px] text-indigo-600 font-medium">Joined using your code</p>
          </div>
          <span className="w-12 h-12 rounded-xl bg-indigo-500 text-white flex items-center justify-center shadow-sm shadow-indigo-500/10">
            <Users className="w-5 h-5" />
          </span>
        </div>

        {/* Total Bonus Commission Earned */}
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 p-5 rounded-2xl border border-emerald-100/40 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-emerald-600/80 uppercase tracking-wider">Bonuses Earned</p>
            <h4 className="text-2xl font-black font-display text-emerald-950">
              {loading ? '...' : (data?.totalBonusPoints || 0).toLocaleString()} <span className="text-xs font-semibold text-emerald-600/70">PTS</span>
            </h4>
            <p className="text-[10px] text-emerald-600 font-bold font-display">
              ≈ ৳ {loading ? '0.00' : bdtEarned} TK
            </p>
          </div>
          <span className="w-12 h-12 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-sm shadow-emerald-500/10">
            <Gift className="w-5 h-5" />
          </span>
        </div>
      </div>

      {/* REFERRAL LINK COPY CONTAINER */}
      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Your Invite Code & Link
          </label>
          <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
            5% Commission
          </span>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            readOnly
            value={referralLink}
            className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-500 font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500/30"
          />
          <button
            onClick={handleCopyLink}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold font-display rounded-xl text-xs transition flex items-center gap-1.5 cursor-pointer shrink-0"
            id="copy-referral-dashboard-btn"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
      </div>

      {/* REFERRALS AND LOGS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
        {/* Referred Friends */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-slate-600 flex items-center justify-between">
            <span>Referred Network ({data?.referrals?.length || 0})</span>
          </h4>
          <div className="max-h-56 overflow-y-auto divide-y divide-slate-100 pr-1 space-y-2">
            {loading ? (
              <div className="text-center text-xs text-slate-400 py-6">Loading network list...</div>
            ) : !data || data.referrals.length === 0 ? (
              <div className="text-center text-xs text-slate-400 py-8 border border-dashed border-slate-100 rounded-2xl">
                No friends have registered yet.
              </div>
            ) : (
              data.referrals.map((refUser, i) => (
                <div key={`${refUser.username}-${i}`} className="flex items-center justify-between py-2 text-xs">
                  <div className="space-y-0.5">
                    <p className="font-bold text-slate-700">{refUser.username}</p>
                    <p className="text-[10px] text-slate-400">
                      Joined: {new Date(refUser.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right space-y-1">
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${refUser.status === 'active' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100/30' : 'bg-red-50 text-red-600 border border-red-100/30'}`}>
                      {refUser.status === 'active' ? 'Active' : 'Banned'}
                    </span>
                    <p className="text-[10px] text-slate-400 font-mono">
                      +{refUser.todayWorkPoints.toLocaleString()} PTS today
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Bonus Income Logs */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-slate-600 flex items-center justify-between">
            <span>Recent Commission Bonuses ({data?.bonusLogs?.length || 0})</span>
          </h4>
          <div className="max-h-56 overflow-y-auto divide-y divide-slate-100 pr-1 space-y-2">
            {loading ? (
              <div className="text-center text-xs text-slate-400 py-6">Loading bonus logs...</div>
            ) : !data || data.bonusLogs.length === 0 ? (
              <div className="text-center text-xs text-slate-400 py-8 border border-dashed border-slate-100 rounded-2xl">
                No referral bonuses earned yet.
              </div>
            ) : (
              data.bonusLogs.map((log, i) => (
                <div key={`${log.id}-${i}`} className="flex items-start justify-between py-2 text-xs gap-3">
                  <div className="space-y-0.5 min-w-0 flex-1">
                    <p className="font-bold text-slate-700 truncate">{log.title}</p>
                    <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed">
                      {log.message}
                    </p>
                    <p className="text-[9px] text-slate-400 font-mono flex items-center gap-1">
                      <Calendar className="w-2.5 h-2.5" />
                      {new Date(log.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 font-bold rounded text-[10px] font-mono flex items-center gap-0.5">
                      <TrendingUp className="w-3 h-3 text-emerald-500" />
                      +{log.points} PTS
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
