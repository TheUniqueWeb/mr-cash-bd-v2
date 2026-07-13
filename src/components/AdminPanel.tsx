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
  const [activeSubTab, setActiveSubTab] = useState<'stats' | 'withdrawals' | 'users' | 'postbacks' | 'settings' | 'leaderboard' | 'redeem_codes'>('stats');
  
  // States
  const [stats, setStats] = useState<SystemStats>({ totalMembers: 0, totalPaidBDT: 0, totalPointsEarned: 0, pendingWithdrawalsCount: 0 });
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [postbacks, setPostbacks] = useState<PostbackLog[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Redeem code states
  const [adminRedeemCodes, setAdminRedeemCodes] = useState<any[]>([]);
  const [newCode, setNewCode] = useState('');
  const [newName, setNewName] = useState('');
  const [newRewardPoints, setNewRewardPoints] = useState(500);
  const [newDescription, setNewDescription] = useState('');
  const [newImage, setNewImage] = useState('');
  const [newEligibilityType, setNewEligibilityType] = useState<'all' | 'limited'>('all');
  const [newMaxUsers, setNewMaxUsers] = useState(100);
  const [newExpiresAt, setNewExpiresAt] = useState('');
  
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
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState('System is undergoing maintenance. Please check back shortly.');
  const [broadcastMessage, setBroadcastMessage] = useState('');

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
        setMaintenanceMode(setts.maintenanceMode || false);
        setMaintenanceMessage(setts.maintenanceMessage || '');
        setBroadcastMessage(setts.broadcastMessage || '');
      }

      // Fetch redeem codes
      const codesRes = await fetch('/api/v1/admin/redeem-codes');
      if (codesRes.ok) {
        setAdminRedeemCodes(await codesRes.json());
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

  // Create / Save Redeem Code
  const handleSaveRedeemCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode || !newName || !newRewardPoints || !newExpiresAt) {
      setActionMsg('Please fill in all required redeem code details.');
      setTimeout(() => setActionMsg(''), 4000);
      return;
    }

    setActionMsg('Saving redeem code...');
    try {
      
      const expirationTimestamp = new Date(newExpiresAt).getTime();
      const res = await fetch('/api/v1/admin/redeem-codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: newCode,
          name: newName,
          rewardPoints: Number(newRewardPoints),
          description: newDescription,
          image: newImage,
          eligibilityType: newEligibilityType,
          maxUsers: Number(newMaxUsers),
          expiresAt: expirationTimestamp,
        }),
      });

      if (res.ok) {
        setActionMsg('Redemption code successfully saved!');
        setNewCode('');
        setNewName('');
        setNewRewardPoints(500);
        setNewDescription('');
        setNewImage('');
        setNewEligibilityType('all');
        setNewMaxUsers(100);
        setNewExpiresAt('');
        fetchAllAdminData();
      } else {
        const err = await res.json();
        setActionMsg(`Failed to save code: ${err.error || 'Unknown error'}`);
      }
    } catch (err: any) {
      setActionMsg(`Save error: ${err.message}`);
    }
    setTimeout(() => setActionMsg(''), 4000);
  };

  // Delete Redeem Code
  const handleDeleteRedeemCode = async (code: string) => {
    if (!confirm(`Are you sure you want to delete redemption code: ${code}?`)) return;
    setActionMsg('Deleting redeem code...');
    try {
      const res = await fetch('/api/v1/admin/redeem-codes/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
      if (res.ok) {
        setActionMsg('Redemption code successfully deleted!');
        fetchAllAdminData();
      } else {
        setActionMsg('Failed to delete redemption code.');
      }
    } catch (err: any) {
      setActionMsg(`Delete error: ${err.message}`);
    }
    setTimeout(() => setActionMsg(''), 4000);
  };

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

  // Handle Delete User
  const handleDeleteUser = async (username: string) => {
    if (!confirm(`Are you sure you want to completely delete user: ${username}?`)) return;
    setActionMsg('Deleting user...');
    try {
      const res = await fetch(`/api/v1/admin/users/${username}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setActionMsg(`User ${username} successfully deleted!`);
        fetchAllAdminData();
      } else {
        setActionMsg('Failed to delete user.');
      }
    } catch (err: any) {
      setActionMsg(`Error: ${err.message}`);
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
          vpnCheckEnabled, conversionRate, pointsToBdtRate, 
          minWithdrawRechargePoints, minWithdrawBankPoints, 
          adsenseCode, supportLink,
          maintenanceMode, maintenanceMessage, broadcastMessage
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
        
        {loading && (
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 bg-slate-50 px-3 py-1.5 rounded-full">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            SYNCING
          </div>
        )}
      </div>

      {actionMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-xl font-bold flex items-center gap-2 animate-fadeIn shadow-sm">
          <CheckCircle className="w-5 h-5" />
          {actionMsg}
        </div>
      )}

      {/* Primary Navigation Tabs */}
      <div className="flex flex-wrap gap-2">
        {[
          { id: 'overview', label: 'Platform Stats', icon: TrendingUp },
          { id: 'withdrawals', label: 'Withdrawal Tickets', icon: Wallet },
          { id: 'users', label: 'Manage Users', icon: Users },
          { id: 'postbacks', label: 'CPA Lead Logs', icon: Target },
          { id: 'redeem', label: 'Redeem Codes', icon: Gift },
          { id: 'settings', label: 'Global Settings', icon: Settings }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id)}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${
              activeSubTab === tab.id
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50 hover:text-slate-700'
            }`}
            id={`admin-tab-${tab.id}`}
          >
            <tab.icon className={`w-4 h-4 ${activeSubTab === tab.id ? 'text-blue-200' : 'text-slate-400'}`} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* 1. OVERVIEW TAB */}
      {activeSubTab === 'overview' && (
        <div className="space-y-6 animate-fadeIn" id="admin-overview">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Users className="w-16 h-16" />
              </div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Users</h4>
              <p className="text-3xl font-black font-display text-slate-800">{stats?.totalUsers.toLocaleString() || 0}</p>
            </div>
            
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Target className="w-16 h-16" />
              </div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">CPA Leads Received</h4>
              <p className="text-3xl font-black font-display text-slate-800">{stats?.totalLeads.toLocaleString() || 0}</p>
            </div>
            
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <DollarSign className="w-16 h-16 text-emerald-500" />
              </div>
              <h4 className="text-xs font-bold text-emerald-500 uppercase tracking-widest mb-1">Pending Payouts</h4>
              <p className="text-3xl font-black font-display text-emerald-600">৳ {stats?.pendingWithdrawalsBdt.toFixed(2) || '0.00'}</p>
            </div>
            
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Wallet className="w-16 h-16" />
              </div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Paid (Approved)</h4>
              <p className="text-3xl font-black font-display text-slate-800">৳ {stats?.approvedWithdrawalsBdt.toFixed(2) || '0.00'}</p>
            </div>
          </div>
        </div>
      )}

      {/* 2. WITHDRAWALS TAB */}
      {activeSubTab === 'withdrawals' && (
        <div className="space-y-4 animate-fadeIn" id="admin-withdrawals-ledger">
          <div>
            <h3 className="text-base font-bold font-display text-slate-800">Withdrawal Tickets Queue</h3>
            <p className="text-xs text-slate-500">Approve or reject pending cashout requests from users.</p>
          </div>
          
          {withdrawals.length === 0 ? (
            <div className="bg-white p-8 border border-slate-100 rounded-2xl text-center text-slate-400">
              No withdrawal requests logged yet.
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-400 text-[10px] font-bold uppercase tracking-wider border-b border-slate-100">
                      <th className="px-6 py-4">Ticket ID</th>
                      <th className="px-6 py-4">User Details</th>
                      <th className="px-6 py-4">Method</th>
                      <th className="px-6 py-4">Account Number</th>
                      <th className="px-6 py-4">Points</th>
                      <th className="px-6 py-4">Est. BDT</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
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
                    <th className="px-6 py-4 text-right">Balance Edit / Actions</th>
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
                          <button
                            onClick={() => handleDeleteUser(u.username)}
                            className="px-2 py-1 bg-slate-100 text-slate-600 font-bold text-[10px] rounded hover:bg-red-500 hover:text-white cursor-pointer transition"
                            id={`delete-user-${u.username}`}
                          >
                            Delete
                          </button>
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
      {/* 4. POSTBACK LEADS TAB */
}
      {activeSubTab === 'postbacks' && (
        <div className="space-y-4 animate-fadeIn" id="admin-postback-ledger">
          <div>
            <h3 className="text-base font-bold font-display text-slate-800">CPA Postback Lead Registry</h3>
            <p className="text-xs text-slate-500">View real-time conversions received from premium partner networks.</p>
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

      {activeSubTab === 'redeem_codes' && (
        <div className="space-y-8 animate-fadeIn" id="admin-redeem-codes-tab">
          {/* Header */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h3 className="text-lg font-black font-display text-slate-800 flex items-center gap-2">
                <Crown className="w-5 h-5 text-blue-600 animate-bounce" />
                Redemption Codes & Ongoing Events
              </h3>
              <p className="text-xs text-slate-500">Configure promotional reward codes, define maximum claim capacities, set expirations, and write descriptions for active events.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Form Section */}
            <form onSubmit={handleSaveRedeemCode} className="lg:col-span-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4 h-fit" id="admin-add-code-form">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 border-b border-slate-100 pb-2">Create Promo Code</h4>
              
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Redeem Code (No spaces)</label>
                <input 
                  type="text"
                  placeholder="e.g. WELCOME2026"
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value.toUpperCase().replace(/\s+/g, ''))}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-black font-mono focus:bg-white focus:ring-1 focus:ring-blue-500 transition outline-none"
                  required
                />
                <p className="text-[9px] text-slate-400 font-medium">This code must be typed exactly by members. e.g. WELCOME1000</p>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Event Name</label>
                <input 
                  type="text"
                  placeholder="e.g. Ramadan Mubarak Special Bonus"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold focus:bg-white focus:ring-1 focus:ring-blue-500 transition outline-none"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Points Reward</label>
                <input 
                  type="number"
                  placeholder="e.g. 500"
                  value={newRewardPoints}
                  onChange={(e) => setNewRewardPoints(Math.max(1, Number(e.target.value)))}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold focus:bg-white focus:ring-1 focus:ring-blue-500 transition outline-none"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Subject/Description</label>
                <textarea 
                  placeholder="Details of the event or qualification guidelines..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs focus:bg-white focus:ring-1 focus:ring-blue-500 transition outline-none resize-none leading-relaxed"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Banner Image Link (Optional)</label>
                <input 
                  type="text"
                  placeholder="e.g. https://images.unsplash.com/photo-..."
                  value={newImage}
                  onChange={(e) => setNewImage(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs focus:bg-white focus:ring-1 focus:ring-blue-500 transition outline-none font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Eligibility Rules</label>
                <select
                  value={newEligibilityType}
                  onChange={(e) => setNewEligibilityType(e.target.value as 'all' | 'limited')}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold focus:bg-white focus:ring-1 focus:ring-blue-500 transition outline-none"
                >
                  <option value="all">Open to all (Limit 1 claim per user)</option>
                  <option value="limited">First come, first served (Limited claims count)</option>
                </select>
              </div>

              {newEligibilityType === 'limited' && (
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Claims Limit (Number of Users)</label>
                  <input 
                    type="number"
                    value={newMaxUsers}
                    onChange={(e) => setNewMaxUsers(Math.max(1, Number(e.target.value)))}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold focus:bg-white focus:ring-1 focus:ring-blue-500 transition outline-none"
                    required
                  />
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Expiration Date & Time</label>
                <input 
                  type="datetime-local"
                  value={newExpiresAt}
                  onChange={(e) => setNewExpiresAt(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold focus:bg-white focus:ring-1 focus:ring-blue-500 transition outline-none"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold font-display rounded-2xl text-xs tracking-widest uppercase transition cursor-pointer shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
              >
                Create Coupon Code
              </button>
            </form>

            {/* List Section */}
            <div className="lg:col-span-8 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2 mb-2">Configured Coupon Codes</h4>

              {adminRedeemCodes.length === 0 ? (
                <div className="py-16 text-center text-xs text-slate-400 font-medium">
                  No active redemption codes or ongoing event promotions found in DB. Use the configuration engine to create some!
                </div>
              ) : (
                <div className="space-y-4 max-h-[700px] overflow-y-auto pr-2">
                  {adminRedeemCodes.map((item) => {
                    const isExpired = item.expiresAt < Date.now();
                    const formattedExpiry = new Date(item.expiresAt).toLocaleString();
                    const hasCap = item.eligibilityType === 'limited';

                    return (
                      <div key={item.code} className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition hover:bg-slate-50">
                        <div className="flex gap-4 items-start min-w-0">
                          {item.image ? (
                            <img 
                              src={item.image} 
                              alt={item.name} 
                              className="w-14 h-14 rounded-xl object-cover border border-slate-100 shrink-0"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shrink-0 shadow-sm">
                              <Crown className="w-5 h-5" />
                            </div>
                          )}
                          <div className="space-y-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-[10px] font-black font-mono">
                                {item.code}
                              </span>
                              <span className={`text-[8px] px-1.5 py-0.5 font-black rounded tracking-wider uppercase ${
                                isExpired ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'
                              }`}>
                                {isExpired ? 'EXPIRED' : 'ACTIVE'}
                              </span>
                            </div>
                            <h5 className="text-xs font-black text-slate-800 truncate">{item.name}</h5>
                            <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">{item.description}</p>
                            
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-1 text-[10px] text-slate-400 font-bold">
                              <span className="text-blue-600 font-extrabold bg-blue-50/70 border border-blue-100/30 px-1.5 py-0.5 rounded leading-none shrink-0">
                                {item.rewardPoints.toLocaleString()} PTS
                              </span>
                              <span className="text-slate-200">•</span>
                              <span>
                                Expiry: <span className="text-slate-500">{formattedExpiry}</span>
                              </span>
                              <span className="text-slate-200">•</span>
                              <span>
                                Claimed: <span className="text-blue-600 font-extrabold">{item.redeemedCount}</span>
                                {hasCap && <span className="text-slate-400">/{item.maxUsers}</span>}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="shrink-0 flex items-center self-end sm:self-center">
                          <button
                            type="button"
                            onClick={() => handleDeleteRedeemCode(item.code)}
                            className="p-2.5 bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 rounded-xl transition border border-red-100 cursor-pointer"
                            title="Delete Coupon Code"
                          >
                            <Trash className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
