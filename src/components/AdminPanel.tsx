import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Settings, 
  Users, 
  CreditCard, 
  Activity, 
  CheckCircle, 
  XCircle, 
  ShieldAlert, 
  Search, 
  Trash, 
  DollarSign, 
  Percent, 
  BarChart, 
  Info,
  Sliders,
  ShieldCheck,
  RefreshCw,
  Trophy,
  Crown
} from 'lucide-react';
import { User, Withdrawal, PostbackLog, SystemStats } from '../types';

interface AdminPanelProps {
  adminUser: User;
}

export default function AdminPanel({ adminUser }: AdminPanelProps) {
  const [activeSubTab, setActiveSubTab] = useState<'stats' | 'withdrawals' | 'users' | 'postbacks' | 'settings' | 'leaderboard'>('stats');
  
  // States
  const [stats, setStats] = useState<SystemStats>({ totalMembers: 0, totalPaidBDT: 0, totalPointsEarned: 0, pendingWithdrawalsCount: 0 });
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [postbacks, setPostbacks] = useState<PostbackLog[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Leaderboard states
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);
  const [rewardsList, setRewardsList] = useState<number[]>([10000, 7500, 5000, 4000, 3000, 2500, 2000, 1500, 1000, 500]);
  const [rewardingInProgress, setRewardingInProgress] = useState(false);
  
  // Settings States
  const [vpnCheckEnabled, setVpnCheckEnabled] = useState(true);
  const [conversionRate, setConversionRate] = useState(10000);
  const [pointsToBdtRate, setPointsToBdtRate] = useState(100);
  const [minWithdrawRechargePoints, setMinWithdrawRechargePoints] = useState(2000);
  const [minWithdrawBankPoints, setMinWithdrawBankPoints] = useState(10000);
  const [adsenseCode, setAdsenseCode] = useState('');
  const [supportLink, setSupportLink] = useState('https://t.me/mrcashbd');

  const [loading, setLoading] = useState(false);
  const [actionMsg, setActionMsg] = useState('');

  // Fetch all admin data
  const fetchAllAdminData = async () => {
    setLoading(true);
    setLoadingLeaderboard(true);
    try {
      // Fetch statistics
      const statsRes = await fetch('/api/v1/admin/stats');
      if (statsRes.ok) {
        setStats(await statsRes.json());
      }

      // Fetch withdrawals
      const wdRes = await fetch('/api/v1/admin/withdrawals');
      if (wdRes.ok) {
        setWithdrawals(await wdRes.json());
      }

      // Fetch users
      const usersRes = await fetch('/api/v1/admin/users');
      if (usersRes.ok) {
        setUsers(await usersRes.json());
      }

      // Fetch postbacks
      const pbRes = await fetch('/api/v1/admin/postbacks');
      if (pbRes.ok) {
        setPostbacks(await pbRes.json());
      }

      // Fetch leaderboard
      const lbRes = await fetch('/api/v1/leaderboard');
      if (lbRes.ok) {
        setLeaderboard(await lbRes.json());
      }

      // Fetch system settings
      const settingsRes = await fetch('/api/v1/admin/settings');
      if (settingsRes.ok) {
        const setts = await settingsRes.json();
        setVpnCheckEnabled(setts.vpnCheckEnabled);
        setConversionRate(setts.conversionRate);
        setPointsToBdtRate(setts.pointsToBdtRate);
        setMinWithdrawRechargePoints(setts.minWithdrawRechargePoints);
        setMinWithdrawBankPoints(setts.minWithdrawBankPoints);
        setAdsenseCode(setts.adsenseCode || '');
        setSupportLink(setts.supportLink || 'https://t.me/mrcashbd');
      }
    } catch (e) {
      console.error('Failed to load admin panel details', e);
    } finally {
      setLoading(false);
      setLoadingLeaderboard(false);
    }
  };

  useEffect(() => {
    fetchAllAdminData();
  }, []);

  // Handle Withdrawal approval or rejection
  const handleWithdrawalAction = async (withdrawalId: string, action: 'approve' | 'reject') => {
    setActionMsg('Processing...');
    try {
      const res = await fetch('/api/v1/admin/withdrawals/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ withdrawalId, action }),
      });
      const data = await res.json();
      if (res.ok) {
        setActionMsg(`Withdrawal ${withdrawalId} successfully ${action}d!`);
        fetchAllAdminData();
      } else {
        setActionMsg(`Action failed: ${data.error}`);
      }
    } catch (err: any) {
      setActionMsg(`Action error: ${err.message}`);
    }
    setTimeout(() => setActionMsg(''), 4000);
  };

  // Handle User action: edit balance or ban status
  const handleUserAction = async (username: string, action: 'ban' | 'unban' | 'setPoints', value?: number) => {
    setActionMsg('Saving user alterations...');
    try {
      const res = await fetch('/api/v1/admin/users/edit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, action, value }),
      });
      const data = await res.json();
      if (res.ok) {
        setActionMsg(`User ${username} status altered successfully!`);
        fetchAllAdminData();
      } else {
        setActionMsg(`Altering failed: ${data.error}`);
      }
    } catch (err: any) {
      setActionMsg(`Error: ${err.message}`);
    }
    setTimeout(() => setActionMsg(''), 4000);
  };

  // Save Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionMsg('Updating settings...');
    try {
      const res = await fetch('/api/v1/admin/settings/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vpnCheckEnabled,
          conversionRate,
          pointsToBdtRate,
          minWithdrawRechargePoints,
          minWithdrawBankPoints,
          adsenseCode,
          supportLink
        }),
      });
      if (res.ok) {
        setActionMsg('System parameters successfully saved!');
        fetchAllAdminData();
      } else {
        setActionMsg('Failed to save parameters.');
      }
    } catch (err: any) {
      setActionMsg(`Error: ${err.message}`);
    }
    setTimeout(() => setActionMsg(''), 4000);
  };

  const filteredUsers = users.filter((u) => 
    (u.username || '').toLowerCase().includes((searchQuery || '').toLowerCase()) || 
    (u.email || '').toLowerCase().includes((searchQuery || '').toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-8" id="admin-panel-root">
      
      {/* Title Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-100 pb-6">
        <div>
          <h2 className="text-2xl font-black font-display text-slate-800 flex items-center gap-2">
            <Sliders className="w-6 h-6 text-blue-600 animate-pulse" />
            MR CASH BD - System Administrator Panel
          </h2>
          <p className="text-sm text-slate-500">Welcome, <strong>{adminUser.username}</strong> ({adminUser.email}). Modify withdrawal tickets, system rates, or ban fraudsters.</p>
        </div>
        <button 
          onClick={fetchAllAdminData}
          className="px-4 py-2 bg-blue-50 border border-blue-100 text-blue-600 font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer hover:bg-blue-100/50"
          id="admin-sync-button"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Force Sync Database
        </button>
      </div>

      {actionMsg && (
        <div className="p-3 text-sm font-semibold bg-blue-50 border border-blue-100 text-blue-800 rounded-xl animate-bounce">
          {actionMsg}
        </div>
      )}

      {/* ADMIN SUB NAVIGATION */}
      <div className="flex flex-wrap border-b border-slate-200 gap-1.5 pb-0.5">
        <button
          onClick={() => setActiveSubTab('stats')}
          className={`px-5 py-3 font-bold font-display text-xs cursor-pointer tracking-wider uppercase border-b-2 transition ${
            activeSubTab === 'stats' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          Stats & Revenue
        </button>
        <button
          onClick={() => setActiveSubTab('withdrawals')}
          className={`px-5 py-3 font-bold font-display text-xs cursor-pointer tracking-wider uppercase border-b-2 transition flex items-center gap-1.5 ${
            activeSubTab === 'withdrawals' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          Withdrawals ({withdrawals.filter(w => w.status === 'pending').length})
        </button>
        <button
          onClick={() => setActiveSubTab('users')}
          className={`px-5 py-3 font-bold font-display text-xs cursor-pointer tracking-wider uppercase border-b-2 transition ${
            activeSubTab === 'users' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          Users list ({users.length})
        </button>
        <button
          onClick={() => setActiveSubTab('postbacks')}
          className={`px-5 py-3 font-bold font-display text-xs cursor-pointer tracking-wider uppercase border-b-2 transition ${
            activeSubTab === 'postbacks' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          Postback Leads ({postbacks.length})
        </button>
        <button
          onClick={() => setActiveSubTab('settings')}
          className={`px-5 py-3 font-bold font-display text-xs cursor-pointer tracking-wider uppercase border-b-2 transition ${
            activeSubTab === 'settings' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          Global Configuration
        </button>
        <button
          onClick={() => setActiveSubTab('leaderboard')}
          className={`px-5 py-3 font-bold font-display text-xs cursor-pointer tracking-wider uppercase border-b-2 transition flex items-center gap-1.5 ${
            activeSubTab === 'leaderboard' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <Trophy className="w-3.5 h-3.5" />
          Leaderboard Rewards
        </button>
      </div>

      {/* SUB-TABS INTERFACE */}

      {/* 1. STATS TAB */}
      {activeSubTab === 'stats' && (
        <div className="space-y-8 animate-fadeIn">
          {/* Card stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-1">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Total Members</p>
              <h3 className="text-3xl font-black font-display text-slate-800">{stats.totalMembers}</h3>
              <p className="text-xs text-slate-400">Database entries</p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-1">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Approved Paid</p>
              <h3 className="text-3xl font-black font-display text-emerald-500">৳ {stats.totalPaidBDT.toFixed(2)}</h3>
              <p className="text-xs text-emerald-400">Cleared BDT cashout</p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-1">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Points Credited</p>
              <h3 className="text-3xl font-black font-display text-blue-600">{stats.totalPointsEarned.toLocaleString()}</h3>
              <p className="text-xs text-blue-400">Total postback leads</p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-1">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Pending Payouts</p>
              <h3 className="text-3xl font-black font-display text-orange-500">{stats.pendingWithdrawalsCount}</h3>
              <p className="text-xs text-orange-400">Requires manual review</p>
            </div>
          </div>

          {/* Graphical Representation */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                <BarChart className="w-4 h-4 text-blue-500" />
                Registrations & Point Generation (Last 7 Days)
              </h3>
              <p className="text-xs text-slate-500">Dynamic ledger visualization from the platform engine.</p>
            </div>
            
            {/* Elegant SVG/CSS Area Chart representing statistics */}
            <div className="h-64 flex items-end justify-between gap-4 border-b border-l border-slate-100 pt-8 px-4 relative">
              <div className="absolute inset-0 flex flex-col justify-between py-8 pl-4 pointer-events-none text-[10px] font-mono text-slate-300">
                <div className="border-t border-slate-50/50 w-full text-right pr-2">100% Volume</div>
                <div className="border-t border-slate-50/50 w-full text-right pr-2">50% Volume</div>
                <div className="border-t border-slate-50/50 w-full text-right pr-2">Base</div>
              </div>
              
              {[
                { label: 'Day 1', signups: 12, points: '45k', heightSignups: '30%', heightPoints: '40%' },
                { label: 'Day 2', signups: 18, points: '80k', heightSignups: '45%', heightPoints: '55%' },
                { label: 'Day 3', signups: 28, points: '120k', heightSignups: '65%', heightPoints: '75%' },
                { label: 'Day 4', signups: 22, points: '95k', heightSignups: '50%', heightPoints: '60%' },
                { label: 'Day 5', signups: 35, points: '180k', heightSignups: '80%', heightPoints: '90%' },
                { label: 'Day 6', signups: 42, points: '210k', heightSignups: '95%', heightPoints: '100%' },
                { label: 'Today', signups: 48, points: '240k', heightSignups: '100%', heightPoints: '98%' },
              ].map((day, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end relative z-10 group">
                  <div className="flex gap-2.5 items-end justify-center w-full h-4/5 pb-1">
                    {/* Signups bar */}
                    <div 
                      className="w-4 sm:w-6 bg-blue-500 rounded-t-md hover:bg-blue-600 transition-all cursor-pointer relative"
                      style={{ height: day.heightSignups }}
                    >
                      <span className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[9px] font-mono px-1.5 py-0.5 rounded shadow whitespace-nowrap z-50">
                        {day.signups} Regs
                      </span>
                    </div>
                    {/* Points bar */}
                    <div 
                      className="w-4 sm:w-6 bg-emerald-500 rounded-t-md hover:bg-emerald-600 transition-all cursor-pointer relative"
                      style={{ height: day.heightPoints }}
                    >
                      <span className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[9px] font-mono px-1.5 py-0.5 rounded shadow whitespace-nowrap z-50">
                        {day.points} Pts
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold text-slate-400 font-mono">{day.label}</span>
                </div>
              ))}
            </div>

            <div className="flex justify-center gap-6 text-xs font-semibold">
              <span className="flex items-center gap-1.5 text-blue-500">
                <span className="w-3 h-3 bg-blue-500 rounded"></span>
                Daily Member Registrations
              </span>
              <span className="flex items-center gap-1.5 text-emerald-500">
                <span className="w-3 h-3 bg-emerald-500 rounded"></span>
                Completed Task Revenue Points
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 2. WITHDRAWALS TAB */}
      {activeSubTab === 'withdrawals' && (
        <div className="space-y-4 animate-fadeIn" id="admin-withdrawals-ledger">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold font-display text-slate-800">Pending & Historic Withdrawal Tickets</h3>
            <span className="text-xs font-semibold text-slate-400">Click Approve to verify user lead logs & pay</span>
          </div>

          {withdrawals.length === 0 ? (
            <div className="bg-white p-8 border border-slate-100 rounded-2xl text-center text-slate-400">
              No withdrawals in database record.
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-400 text-[10px] font-bold uppercase tracking-wider border-b border-slate-100">
                      <th className="px-6 py-4">Transaction ID</th>
                      <th className="px-6 py-4">User Details</th>
                      <th className="px-6 py-4">Payment Channel</th>
                      <th className="px-6 py-4">Recipient Account</th>
                      <th className="px-6 py-4">Requested Points</th>
                      <th className="px-6 py-4">BDT Value</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                    {withdrawals.map((wd) => (
                      <tr key={wd.id} className="hover:bg-slate-50/50 transition">
                        <td className="px-6 py-4 font-mono font-bold text-xs text-slate-500">{wd.id}</td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-bold">{wd.username}</p>
                            <p className="text-[10px] text-slate-400">{wd.email}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-semibold">{wd.method}</td>
                        <td className="px-6 py-4 font-mono text-xs">{wd.accountNumber}</td>
                        <td className="px-6 py-4 text-slate-500">{wd.amountPoints.toLocaleString()} PTS</td>
                        <td className="px-6 py-4 font-black text-emerald-600">৳ {wd.amountBDT.toFixed(2)}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            wd.status === 'approved' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                            wd.status === 'rejected' ? 'bg-red-50 text-red-600 border border-red-100' :
                            'bg-orange-50 text-orange-600 border border-orange-100'
                          }`}>
                            {wd.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          {wd.status === 'pending' ? (
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => handleWithdrawalAction(wd.id, 'approve')}
                                className="p-1 text-emerald-600 hover:bg-emerald-50 rounded-lg transition cursor-pointer"
                                title="Approve Withdrawal"
                                id={`approve-${wd.id}`}
                              >
                                <CheckCircle className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => handleWithdrawalAction(wd.id, 'reject')}
                                className="p-1 text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                                title="Reject & Return Points"
                                id={`reject-${wd.id}`}
                              >
                                <XCircle className="w-5 h-5" />
                              </button>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400 font-medium">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. USERS TAB */}
      {activeSubTab === 'users' && (
        <div className="space-y-4 animate-fadeIn" id="admin-users-ledger">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h3 className="text-base font-bold font-display text-slate-800">User Profiles Registry</h3>
            <div className="relative max-w-xs w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search username or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-400 text-[10px] font-bold uppercase tracking-wider border-b border-slate-100">
                    <th className="px-6 py-4">Username</th>
                    <th className="px-6 py-4">Email</th>
                    <th className="px-6 py-4">Points Balance</th>
                    <th className="px-6 py-4">Today Pts</th>
                    <th className="px-6 py-4">Referrals</th>
                    <th className="px-6 py-4">IP Address</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Balance Edit / Ban actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                  {filteredUsers.map((u) => (
                    <tr key={u.uid} className="hover:bg-slate-50/50 transition">
                      <td className="px-6 py-4 font-bold">{u.username}</td>
                      <td className="px-6 py-4 font-mono">{u.email}</td>
                      <td className="px-6 py-4 font-bold font-mono text-slate-800">{u.balancePoints.toLocaleString()} PTS</td>
                      <td className="px-6 py-4 font-mono">{u.todayWorkPoints.toLocaleString()}</td>
                      <td className="px-6 py-4 font-mono">{u.totalReferred}</td>
                      <td className="px-6 py-4 font-mono text-slate-400">{u.ipAddress || '0.0.0.0'}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded font-bold uppercase ${
                          u.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                        }`}>
                          {u.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="inline-flex items-center gap-3">
                          {/* Set Points inline Form */}
                          <form 
                            onSubmit={(e) => {
                              e.preventDefault();
                              const pts = (e.target as any).elements.ptsVal.value;
                              handleUserAction(u.username, 'setPoints', Number(pts));
                            }}
                            className="flex gap-1"
                          >
                            <input
                              type="number"
                              name="ptsVal"
                              defaultValue={u.balancePoints}
                              className="w-16 px-1.5 py-0.5 border border-slate-200 rounded font-mono text-[10px] focus:outline-none"
                            />
                            <button
                              type="submit"
                              className="px-2 py-0.5 bg-blue-600 text-white font-bold text-[10px] rounded cursor-pointer hover:bg-blue-700"
                              id={`set-points-btn-${u.username}`}
                            >
                              Set
                            </button>
                          </form>

                          {/* Ban Button */}
                          {u.status === 'active' ? (
                            <button
                              onClick={() => handleUserAction(u.username, 'ban')}
                              className="px-2 py-1 bg-red-50 text-red-600 font-bold text-[10px] rounded hover:bg-red-100 cursor-pointer"
                              id={`ban-btn-${u.username}`}
                            >
                              Ban
                            </button>
                          ) : (
                            <button
                              onClick={() => handleUserAction(u.username, 'unban')}
                              className="px-2 py-1 bg-emerald-50 text-emerald-600 font-bold text-[10px] rounded hover:bg-emerald-100 cursor-pointer"
                              id={`unban-btn-${u.username}`}
                            >
                              Unban
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 4. POSTBACK LEADS TAB */}
      {activeSubTab === 'postbacks' && (
        <div className="space-y-4 animate-fadeIn" id="admin-postback-ledger">
          <div>
            <h3 className="text-base font-bold font-display text-slate-800">CPA Postback Lead Registry</h3>
            <p className="text-xs text-slate-500">View real-time conversions received from CPALead redirect networks.</p>
          </div>

          {postbacks.length === 0 ? (
            <div className="bg-white p-8 border border-slate-100 rounded-2xl text-center text-slate-400">
              No conversion leads received in database logs yet.
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-400 text-[10px] font-bold uppercase tracking-wider border-b border-slate-100">
                      <th className="px-6 py-4">Lead ID / Log</th>
                      <th className="px-6 py-4">Credited User</th>
                      <th className="px-6 py-4">Campaign Name</th>
                      <th className="px-6 py-4">Advertiser Payout</th>
                      <th className="px-6 py-4">Points Awarded</th>
                      <th className="px-6 py-4">Device IP</th>
                      <th className="px-6 py-4">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs text-slate-700 font-mono">
                    {postbacks.map((pb) => (
                      <tr key={pb.id} className="hover:bg-slate-50/50 transition">
                        <td className="px-6 py-4 font-bold text-slate-500">{pb.id}</td>
                        <td className="px-6 py-4">
                          <span className="font-bold text-slate-800 font-sans">{pb.username || pb.userId}</span>
                        </td>
                        <td className="px-6 py-4 font-sans font-medium">{pb.campaignName}</td>
                        <td className="px-6 py-4 text-blue-600">${pb.payout.toFixed(2)} USD</td>
                        <td className="px-6 py-4 text-emerald-600 font-bold">+{pb.pointsCredited.toLocaleString()} PTS</td>
                        <td className="px-6 py-4 text-slate-400">{pb.ip}</td>
                        <td className="px-6 py-4 text-slate-400 font-sans">
                          {new Date(pb.createdAt).toLocaleDateString()} {new Date(pb.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 5. SYSTEM SETTINGS TAB */}
      {activeSubTab === 'settings' && (
        <div className="bg-white rounded-2xl p-8 border border-slate-100 shadow-sm animate-fadeIn" id="admin-settings-portal">
          <form onSubmit={handleSaveSettings} className="space-y-6">
            <h3 className="text-base font-bold font-display text-slate-800">System Parameter Settings</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* VPN Check Toggle */}
              <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={vpnCheckEnabled}
                    onChange={(e) => setVpnCheckEnabled(e.target.checked)}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
                  />
                  <span className="font-bold text-slate-800 font-display text-sm">Anti-VPN & Location Verification</span>
                </label>
                <p className="text-xs text-slate-500 leading-relaxed">
                  When enabled, standard users with VPN connections or users outside of Bangladesh will be locked out from completing tasks on the Offerwall.
                </p>
                {vpnCheckEnabled ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-600 uppercase tracking-wider bg-red-50 px-2 py-0.5 rounded">
                    <ShieldAlert className="w-3.5 h-3.5" /> High Security active
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider bg-slate-100 px-2 py-0.5 rounded">
                    Security Disabled
                  </span>
                )}
              </div>

              {/* Conversion Rate */}
              <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 space-y-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest">
                  CPA Payout Exchange Rate ($1.00 USD)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={conversionRate}
                    onChange={(e) => setConversionRate(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm font-semibold"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-slate-400">PTS</span>
                </div>
                <p className="text-[10px] text-slate-400">Points credited to user for every dollar payout. Default: 10,000 Points.</p>
              </div>

              {/* BDT Value Rate */}
              <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 space-y-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest">
                  Points To BDT Exchange Rate (1৳ BDT)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={pointsToBdtRate}
                    onChange={(e) => setPointsToBdtRate(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm font-semibold"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-slate-400">PTS</span>
                </div>
                <p className="text-[10px] text-slate-400">Points needed to withdraw 1 Taka. Default: 100 Points = 1 TK (so 1000 PTS = 10 TK).</p>
              </div>

              {/* Min Withdrawals */}
              <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 space-y-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Minimum Withdrawal Thresholds</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1">Mobile Recharge</label>
                    <input
                      type="number"
                      value={minWithdrawRechargePoints}
                      onChange={(e) => setMinWithdrawRechargePoints(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-slate-200 bg-white rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1">bKash / Wallets</label>
                    <input
                      type="number"
                      value={minWithdrawBankPoints}
                      onChange={(e) => setMinWithdrawBankPoints(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-slate-200 bg-white rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Support Link */}
              <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 space-y-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest">
                  Official Support Link (Telegram/URL)
                </label>
                <div className="relative">
                  <input
                    type="url"
                    value={supportLink}
                    onChange={(e) => setSupportLink(e.target.value)}
                    placeholder="https://t.me/mrcashbd"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm font-semibold"
                  />
                </div>
                <p className="text-[10px] text-slate-400">The link users will open when clicking the "Support" button in menu.</p>
              </div>

              {/* AdSense Code Block */}
              <div className="md:col-span-2 bg-slate-50 p-6 rounded-xl border border-slate-100 space-y-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest">
                  Google AdSense / Banner HTML Code
                </label>
                <textarea
                  value={adsenseCode}
                  onChange={(e) => setAdsenseCode(e.target.value)}
                  placeholder='<script async src="..." ...></script>'
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs font-mono"
                />
                <p className="text-[10px] text-slate-400">Paste your Google AdSense banner code here. It will be displayed throughout the application. Leave empty to hide ads.</p>
              </div>

            </div>

            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold font-display rounded-xl text-sm transition cursor-pointer shadow"
              id="save-settings-button"
            >
              Save Configurations
            </button>
          </form>
        </div>
      )}

      {activeSubTab === 'leaderboard' && (
        <div className="space-y-8 animate-fadeIn" id="admin-leaderboard-tab">
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xs space-y-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-50 pb-6">
              <div>
                <h3 className="text-lg font-black font-display text-slate-800 flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-500" />
                  Leaderboard Rewards Distribution
                </h3>
                <p className="text-xs text-slate-400">
                  Configure and distribute custom point rewards to users who rank within the top 10.
                </p>
              </div>
              <button
                type="button"
                onClick={fetchAllAdminData}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 text-slate-600 font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer hover:bg-slate-100"
              >
                <RefreshCw className={`w-3 h-3 ${loadingLeaderboard ? 'animate-spin' : ''}`} />
                Refresh Standings
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Leaderboard Config Form */}
              <div className="lg:col-span-7 space-y-4">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Configure Points Per Rank</h4>
                <div className="space-y-2.5 max-h-[440px] overflow-y-auto pr-2">
                  {rewardsList.map((reward, i) => (
                    <div key={i} className="flex items-center gap-4 bg-slate-50/50 p-3 rounded-2xl border border-slate-100/50">
                      <div className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200/50 flex items-center justify-center font-black text-slate-700 text-xs">
                        #{i + 1}
                      </div>
                      <div className="flex-1">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          Rank #{i + 1} Reward
                        </label>
                        <p className="text-[10px] text-slate-500 font-bold font-display">
                          {i === 0 ? '🥇 First Place' : i === 1 ? '🥈 Second Place' : i === 2 ? '🥉 Third Place' : `🎖️ Place #${i + 1}`}
                        </p>
                      </div>
                      <div className="w-40 relative">
                        <input
                          type="number"
                          value={reward}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            const updated = [...rewardsList];
                            updated[i] = val;
                            setRewardsList(updated);
                          }}
                          className="w-full px-3 py-1.5 pr-8 text-xs font-mono font-bold border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-bold text-slate-400 font-sans">PTS</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-slate-50 flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-700">Total Points to Distribute</p>
                    <p className="text-[10px] text-slate-400 font-medium">Sum of all points awarded to qualifying ranks</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-mono font-black text-blue-600">
                      {rewardsList.reduce((a, b) => a + b, 0).toLocaleString()} PTS
                    </p>
                    <p className="text-[10px] text-slate-400 font-bold">
                      ৳ {(rewardsList.reduce((a, b) => a + b, 0) / 100).toFixed(2)} BDT Total Value
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={rewardingInProgress}
                  onClick={async () => {
                    setRewardingInProgress(true);
                    setActionMsg('Distributing leaderboard rewards to qualifying members...');
                    try {
                      const res = await fetch('/api/v1/admin/leaderboard/reward', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ rewards: rewardsList }),
                      });
                      const data = await res.json();
                      if (res.ok) {
                        setActionMsg(`Successfully distributed rewards! ${data.message || ''}`);
                        fetchAllAdminData();
                      } else {
                        setActionMsg(`Distribution failed: ${data.error || 'Server error'}`);
                      }
                    } catch (err: any) {
                      setActionMsg(`Error: ${err.message}`);
                    } finally {
                      setRewardingInProgress(false);
                      setTimeout(() => setActionMsg(''), 5000);
                    }
                  }}
                  className={`w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold font-display rounded-2xl text-xs tracking-wider uppercase transition cursor-pointer shadow flex items-center justify-center gap-1.5 ${
                    rewardingInProgress ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <Trophy className="w-4 h-4 animate-bounce" />
                  {rewardingInProgress ? 'Distributing Point Rewards...' : 'Distribute Rewards to Top 10'}
                </button>
              </div>

              {/* Leaderboard Standings Preview */}
              <div className="lg:col-span-5 bg-slate-50/50 p-6 rounded-3xl border border-slate-100 space-y-4">
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Standings & Award Recipients</h4>
                  <p className="text-[10px] text-slate-400">
                    See who will receive points based on current standings. Default/mock users (marked with MOCK) are skipped.
                  </p>
                </div>

                <div className="space-y-2 divide-y divide-slate-100 max-h-[380px] overflow-y-auto pr-1">
                  {loadingLeaderboard ? (
                    <div className="py-6 text-center text-xs text-slate-400">Loading standings...</div>
                  ) : leaderboard.length === 0 ? (
                    <div className="py-6 text-center text-xs text-slate-400">No active standings</div>
                  ) : (
                    leaderboard.slice(0, 10).map((item, index) => {
                      // Check if user is a real user or a mock user by looking if we have them in user array
                      const isRealUser = users.some(u => u.username.toLowerCase() === item.username.toLowerCase());
                      const ptsToGet = rewardsList[index] || 0;

                      return (
                        <div key={item.username} className="flex items-center justify-between py-2.5 first:pt-0">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="w-5 h-5 rounded-lg bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-500 font-mono shrink-0">
                              {index + 1}
                            </span>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-slate-800 truncate flex items-center gap-1 leading-none">
                                {item.username}
                                <span className={`text-[8px] px-1 py-0.1 font-bold rounded shrink-0 ${
                                  isRealUser ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                                }`}>
                                  {isRealUser ? 'REAL' : 'MOCK'}
                                </span>
                              </p>
                              <p className="text-[9px] text-slate-400 font-mono mt-1">
                                {item.balancePoints.toLocaleString()} PTS balance
                              </p>
                            </div>
                          </div>
                          
                          <div className="text-right shrink-0">
                            <span className="text-[10px] font-mono font-extrabold text-blue-600 bg-blue-50/50 border border-blue-100/30 px-2 py-0.5 rounded-lg">
                              +{ptsToGet.toLocaleString()} PTS
                            </span>
                            <p className="text-[8px] text-slate-400 font-bold uppercase mt-1">
                              {isRealUser ? 'Will credit' : 'Skipped'}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
