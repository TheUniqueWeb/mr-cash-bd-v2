import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Wallet, 
  TrendingUp, 
  Users, 
  Clock, 
  ArrowRightLeft, 
  Sparkles, 
  HelpCircle,
  Smartphone,
  Play,
  ArrowRight,
  Send,
  Trophy,
  Crown
} from 'lucide-react';
import { User } from '../types';
import TransactionHistory from './TransactionHistory';

interface DashboardProps {
  user: User;
  onNavigate: (tab: string) => void;
  onRefreshProfile: () => void;
  isRefreshing?: boolean;
}

export const LEVELS = [
  { name: 'Bronze', minPoints: 0, color: 'from-amber-600 to-amber-800', textColor: 'text-amber-700 bg-amber-50 border-amber-200', icon: '🥉' },
  { name: 'Silver', minPoints: 10000, color: 'from-slate-400 to-slate-600', textColor: 'text-slate-600 bg-slate-50 border-slate-200', icon: '🥈' },
  { name: 'Gold', minPoints: 50000, color: 'from-amber-400 to-yellow-600', textColor: 'text-amber-600 bg-amber-50 border-amber-300', icon: '🥇' },
  { name: 'Platinum', minPoints: 150000, color: 'from-indigo-400 to-indigo-600', textColor: 'text-indigo-600 bg-indigo-50 border-indigo-300', icon: '💎' },
  { name: 'Diamond', minPoints: 500000, color: 'from-cyan-400 to-blue-600', textColor: 'text-cyan-600 bg-cyan-50 border-cyan-300', icon: '👑' },
];

export default function Dashboard({ user, onNavigate, onRefreshProfile, isRefreshing = false }: DashboardProps) {
  const [supportMessage, setSupportMessage] = useState('');
  const [supportStatus, setSupportStatus] = useState('');
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(true);

  // Fetch top earners
  useEffect(() => {
    let active = true;
    const fetchLeaderboard = async () => {
      try {
        const res = await fetch('/api/v1/leaderboard');
        if (res.ok && active) {
          const data = await res.json();
          setLeaderboard(data);
        }
      } catch (err) {
        console.error('Failed to load leaderboard:', err);
      } finally {
        if (active) {
          setLoadingLeaderboard(false);
        }
      }
    };
    fetchLeaderboard();
    return () => {
      active = false;
    };
  }, []);

  const handleSupportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supportMessage.trim()) return;
    setSupportStatus('Sending...');
    setTimeout(() => {
      setSupportStatus('Message sent successfully! Our BD support team will contact you within 2 hours.');
      setSupportMessage('');
      setTimeout(() => setSupportStatus(''), 4000);
    }, 1200);
  };

  // Convert points to BDT: 1000 Points = 10 BDT (so BDT = points / 100)
  const bdtBalance = (user.balancePoints / 100).toFixed(2);
  const pendingBdt = (user.pendingCashoutPoints / 100).toFixed(2);
  const todayBdt = (user.todayWorkPoints / 100).toFixed(2);

  // Compute leveling status
  const totalEarnedPoints = user.balancePoints + (user.pendingCashoutPoints || 0);
  const currentLevel = [...LEVELS].reverse().find(l => totalEarnedPoints >= l.minPoints) || LEVELS[0];
  const nextLevelIndex = LEVELS.findIndex(l => l.name === currentLevel.name) + 1;
  const nextLevel = nextLevelIndex < LEVELS.length ? LEVELS[nextLevelIndex] : null;

  const pointsForCurrentLevel = currentLevel.minPoints;
  const pointsForNextLevel = nextLevel ? nextLevel.minPoints : currentLevel.minPoints;
  const progressPercent = nextLevel 
    ? Math.min(((totalEarnedPoints - pointsForCurrentLevel) / (pointsForNextLevel - pointsForCurrentLevel)) * 100, 100)
    : 100;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-8" id="dashboard-root">
      
      {/* HEADER WITH LEVEL BADGE */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6" id="dashboard-header-block">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl md:text-3xl font-black font-display text-slate-800 tracking-tight">
              Welcome back, {user.username}!
            </h1>
            <span className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 shadow-xs ${currentLevel.textColor}`} id="user-level-badge">
              <span className="text-sm">{currentLevel.icon}</span>
              {currentLevel.name} Tier
            </span>
          </div>
          <p className="text-sm text-slate-400 font-medium">
            Monitor your earnings, invite friends, and request direct cashouts in real-time.
          </p>
        </div>

        {/* Dynamic Milestone Progress */}
        <div className="md:w-72 space-y-2 shrink-0">
          <div className="flex justify-between text-xs font-semibold text-slate-500">
            <span>Next Tier: {nextLevel ? nextLevel.name : 'Max Level'}</span>
            <span className="font-mono text-slate-600">{totalEarnedPoints.toLocaleString()} / {nextLevel ? nextLevel.minPoints.toLocaleString() : 'MAX'} PTS</span>
          </div>
          <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-50">
            <div 
              className={`h-full bg-gradient-to-r ${currentLevel.color} rounded-full transition-all duration-500`}
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
          {nextLevel && (
            <p className="text-[10px] text-slate-400 font-bold leading-none">
              Earn <strong className="text-slate-600">{(nextLevel.minPoints - totalEarnedPoints).toLocaleString()} PTS</strong> more to level up!
            </p>
          )}
        </div>
      </div>
      
      {/* WALLET & MAIN STATS ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Large Wallet Card */}
        <div className="lg:col-span-2 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-8 text-white relative overflow-hidden shadow-lg shadow-blue-600/10">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-bl-full -z-10"></div>
          
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <span className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur">
                <Wallet className="w-6 h-6 text-blue-200" />
              </span>
              <div>
                <p className="text-xs font-semibold text-blue-100 uppercase tracking-widest">Available Balance</p>
                <h4 className="text-lg font-bold font-display text-white">{user.username}</h4>
              </div>
            </div>
            <button 
              onClick={onRefreshProfile}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold font-display transition cursor-pointer"
              id="refresh-profile-button"
            >
              Refresh Account
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-blue-200 uppercase tracking-wider">Points Balance</p>
              {isRefreshing ? (
                <div className="h-9 w-32 bg-white/20 rounded-xl animate-pulse mt-1" />
              ) : (
                <h2 className="text-3xl md:text-4xl font-black font-display text-white tracking-tight">
                  {user.balancePoints.toLocaleString()} <span className="text-sm font-semibold">PTS</span>
                </h2>
              )}
            </div>
            <div className="space-y-1 border-l border-white/10 pl-6">
              <p className="text-xs font-semibold text-blue-200 uppercase tracking-wider">BDT Equivalent</p>
              {isRefreshing ? (
                <div className="h-9 w-24 bg-white/20 rounded-xl animate-pulse mt-1" />
              ) : (
                <h2 className="text-3xl md:text-4xl font-black font-display text-emerald-300 tracking-tight">
                  {bdtBalance} <span className="text-sm font-semibold text-white">৳</span>
                </h2>
              )}
            </div>
          </div>

          <div className="pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
            <p className="text-xs text-blue-100 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-orange-400 fill-current animate-pulse" />
              1000 Points = 10 TK (Instant Cashout)
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => onNavigate('work')}
                className="px-5 py-2.5 bg-white text-blue-600 font-bold font-display rounded-xl text-sm hover:bg-slate-50 shadow-md transition cursor-pointer flex items-center gap-1.5"
                id="wallet-tasks-button"
              >
                Go to Tasks
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => onNavigate('withdraw')}
                className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold font-display rounded-xl text-sm shadow-md transition cursor-pointer"
                id="wallet-withdraw-button"
              >
                Cash Out
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic Daily Goals Card */}
        <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-lg font-bold font-display text-slate-800">Earning Targets</h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between items-center text-xs text-slate-500 font-semibold mb-1">
                  <span>Today's Progress</span>
                  {isRefreshing ? (
                    <div className="h-4 w-28 bg-slate-100 rounded-md animate-pulse" />
                  ) : (
                    <span>{user.todayWorkPoints} / 5,000 PTS</span>
                  )}
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full bg-blue-500 rounded-full transition-all duration-500 ${isRefreshing ? 'animate-pulse' : ''}`} 
                    style={{ width: `${Math.min((user.todayWorkPoints / 5000) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Complete tasks totaling <strong>5,000 Points</strong> today to lock in a special <strong>500 PTS</strong> bonus from the system!
              </p>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
              <span>Account Status</span>
              <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
                Active & Verified
              </span>
            </div>
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
              <span>IP Country</span>
              <span className="text-slate-800 font-mono">Bangladesh (BD)</span>
            </div>
          </div>
        </div>

      </div>

      {/* STATS MATRIX SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6" id="dashboard-stats-matrix">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between group hover:border-blue-100 transition">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Today's Work</p>
            {isRefreshing ? (
              <div className="space-y-1.5 py-1">
                <div className="h-6 w-28 bg-slate-100 rounded-md animate-pulse" />
                <div className="h-3.5 w-16 bg-slate-100 rounded-md animate-pulse" />
              </div>
            ) : (
              <>
                <h3 className="text-2xl font-black font-display text-slate-800">{user.todayWorkPoints.toLocaleString()} PTS</h3>
                <p className="text-xs font-bold text-emerald-500 font-display">+{todayBdt} TK today</p>
              </>
            )}
          </div>
          <span className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </span>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between group hover:border-emerald-100 transition">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Referrals</p>
            {isRefreshing ? (
              <div className="space-y-1.5 py-1">
                <div className="h-6 w-20 bg-slate-100 rounded-md animate-pulse" />
                <div className="h-3.5 w-28 bg-slate-100 rounded-md animate-pulse" />
              </div>
            ) : (
              <>
                <h3 className="text-2xl font-black font-display text-slate-800">{user.totalReferred} Users</h3>
                <p className="text-xs font-bold text-blue-500 font-display">Earn 10% commission</p>
              </>
            )}
          </div>
          <span className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </span>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between group hover:border-orange-100 transition">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pending Cashout</p>
            {isRefreshing ? (
              <div className="space-y-1.5 py-1">
                <div className="h-6 w-24 bg-slate-100 rounded-md animate-pulse" />
                <div className="h-3.5 w-28 bg-slate-100 rounded-md animate-pulse" />
              </div>
            ) : (
              <>
                <h3 className="text-2xl font-black font-display text-slate-800">{user.pendingCashoutPoints.toLocaleString()} PTS</h3>
                <p className="text-xs font-bold text-orange-500 font-display">{pendingBdt} TK in progress</p>
              </>
            )}
          </div>
          <span className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </span>
        </div>
      </div>

      {/* LEDGERS SECTION */}
      <div className="grid grid-cols-1" id="dashboard-enhanced-ledgers">
        <TransactionHistory username={user.username} isRefreshing={isRefreshing} />
      </div>

      {/* LEADERBOARD, REFERRAL SYSTEM & SUPPORT FORM */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8" id="dashboard-lower-widgets">
        
        {/* Top Earners Leaderboard Widget */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4 flex flex-col justify-between" id="dashboard-leaderboard-widget">
          <div className="space-y-1">
            <h3 className="text-base font-extrabold font-display text-slate-800 flex items-center gap-1.5">
              <Trophy className="w-5 h-5 text-amber-500 animate-bounce" />
              Weekly Top 10 Earners
            </h3>
            <p className="text-xs text-slate-400">
              Complete tasks to rank high! Top 10 users receive custom points bonuses from Admin.
            </p>
          </div>

          <div className="space-y-2 flex-1 overflow-y-auto max-h-[380px] pr-1" id="leaderboard-items-list">
            {loadingLeaderboard ? (
              <div className="space-y-3 py-2">
                {[...Array(10)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3 animate-pulse">
                    <div className="w-8 h-8 rounded-xl bg-slate-50 shrink-0 border border-slate-100" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3 bg-slate-100 rounded w-1/2" />
                      <div className="h-2 bg-slate-100 rounded w-1/3" />
                    </div>
                    <div className="w-12 h-3 bg-slate-100 rounded" />
                  </div>
                ))}
              </div>
            ) : leaderboard.length === 0 ? (
              <div className="text-center text-xs text-slate-400 py-6">
                No active earners found.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {leaderboard.map((item, index) => {
                  const isFirst = index === 0;
                  const isSecond = index === 1;
                  const isThird = index === 2;

                  const badgeColor = isFirst ? 'bg-amber-50 text-amber-600 border border-amber-200/50' :
                                    isSecond ? 'bg-slate-50 text-slate-500 border border-slate-200/50' :
                                    isThird ? 'bg-orange-50 text-orange-600 border border-orange-200/50' :
                                    'bg-slate-50/50 text-slate-400 border border-slate-100';

                  return (
                    <div key={item.username} className="flex items-center gap-3 py-2 first:pt-0 last:pb-0">
                      {/* Rank Indicator */}
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${badgeColor}`}>
                        {isFirst ? <Crown className="w-3.5 h-3.5 text-amber-500" /> : index + 1}
                      </div>

                      {/* Username */}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-black text-slate-800 truncate flex items-center gap-1 leading-tight">
                          {item.username}
                          {item.username && user?.username && item.username.toLowerCase() === user.username.toLowerCase() && (
                            <span className="px-1 py-0.2 bg-blue-100 text-blue-700 text-[8px] font-bold rounded">
                              YOU
                            </span>
                          )}
                        </p>
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider leading-none mt-1">
                          {item.totalReferred || 0} REFS
                        </p>
                      </div>

                      {/* Points / Earnings */}
                      <div className="text-right shrink-0">
                        <p className="text-xs font-mono font-black text-slate-800">
                          {item.balancePoints.toLocaleString()} <span className="text-[9px] text-slate-400 font-bold font-sans">PTS</span>
                        </p>
                        <p className="text-[9px] text-emerald-600 font-bold">
                          ৳ {(item.balancePoints / 100).toFixed(0)} TK
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="p-3 bg-amber-50/50 rounded-2xl border border-amber-100/30 text-[10px] text-amber-800 leading-relaxed shrink-0">
            🥇 1st - 3rd rank: <strong>Highest payout bonus</strong>.
            <br />
            🎖️ 4th - 10th rank: <strong>Tier multiplier bonus</strong>. Distributed weekly!
          </div>
        </div>

        {/* AdSense Banner Placement */}
        <div className="bg-white rounded-3xl p-1 border border-slate-100 shadow-sm overflow-hidden min-h-[100px] flex items-center justify-center">
          <div className="text-[10px] text-slate-300 font-bold uppercase tracking-widest">Sponsored Advertisement</div>
        </div>

        {/* Support Section */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
          <div className="space-y-1">
            <h3 className="text-base font-extrabold font-display text-slate-800 flex items-center gap-1.5">
              <HelpCircle className="w-5 h-5 text-emerald-500" />
              Instant Support
            </h3>
            <p className="text-xs text-slate-400">
              Facing issues with payouts? Submit a message to our local support desk.
            </p>
          </div>

          {supportStatus && (
            <div className="p-2.5 text-xs text-emerald-700 bg-emerald-50 rounded-xl border border-emerald-100 font-semibold">
              {supportStatus}
            </div>
          )}

          <form onSubmit={handleSupportSubmit} className="space-y-3">
            <div>
              <textarea
                required
                value={supportMessage}
                onChange={(e) => setSupportMessage(e.target.value)}
                placeholder="Describe your issue with withdrawal, account, or tasks..."
                rows={2}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 text-xs font-semibold transition text-slate-800 bg-slate-50/50"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-bold font-display rounded-xl text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
              id="submit-support-button"
            >
              Submit Support Ticket
              <Send className="w-3 h-3" />
            </button>
          </form>
        </div>

      </div>

    </div>
  );
}
