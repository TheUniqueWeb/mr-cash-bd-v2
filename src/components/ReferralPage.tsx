import React, { useState, useEffect } from 'react';
import { 
  Share2, 
  Copy, 
  Check, 
  Users, 
  Trophy, 
  Gift, 
  ArrowRight, 
  ShieldAlert,
  Search,
  UserCheck,
  Download,
  ClipboardList
} from 'lucide-react';
import { User } from '../types';

interface ReferralPageProps {
  user: User;
}

export default function ReferralPage({ user }: ReferralPageProps) {
  const [copied, setCopied] = useState(false);
  const [referrals, setReferrals] = useState<User[]>([]);
  const [loadingReferrals, setLoadingReferrals] = useState(true);

  const referralLink = `${window.location.origin}?ref=${user.username}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    const fetchReferrals = async () => {
      try {
        const res = await fetch(`/api/v1/user/referrals/${encodeURIComponent(user.username)}`);
        if (res.ok) {
          setReferrals(await res.json());
        }
      } catch (err) {
        console.error('Failed to fetch referrals:', err);
      } finally {
        setLoadingReferrals(false);
      }
    };
    fetchReferrals();
  }, [user.username]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-10 animate-fadeIn" id="referral-page-container">
      
      {/* Hero Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-100 rounded-full text-blue-600 text-xs font-black tracking-widest uppercase">
          <Share2 className="w-4 h-4" />
          Affiliate Program
        </div>
        <h1 className="text-4xl font-black font-display text-slate-800 tracking-tight">
          Invite Friends. <span className="text-blue-600">Earn Together.</span>
        </h1>
        <p className="text-slate-500 max-w-xl mx-auto leading-relaxed">
          Unlock passive income streams! For every task your friends complete, you receive a <span className="font-bold text-slate-800">5% commission</span> instantly. No limits, no caps.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left: Referral Link & Stats */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm space-y-6">
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">
                  Your Unique Referral Link
                </label>
                <div className="relative">
                  <input
                    type="text"
                    readOnly
                    value={referralLink}
                    className="w-full pl-3 pr-20 py-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-500 font-mono focus:outline-none"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="absolute right-1 top-1 bottom-1 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold font-display rounded-lg text-xs transition flex items-center gap-1.5 cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100/30 text-center space-y-1">
                  <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Network Size</p>
                  <p className="text-2xl font-black text-emerald-700 font-display">{referrals.length}</p>
                </div>
                <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100/30 text-center space-y-1">
                  <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Active Rate</p>
                  <p className="text-2xl font-black text-blue-700 font-display">
                    {referrals.length > 0 ? Math.round((referrals.filter(u => u.status === 'active').length / referrals.length) * 100) : 0}%
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
                <Gift className="w-4 h-4 text-orange-500" />
                How it works
              </h3>
              <ul className="space-y-4">
                {[
                  { icon: Share2, text: 'Share your link on Facebook, WhatsApp or Telegram' },
                  { icon: ArrowRight, text: 'Your friends join and start completing tasks' },
                  { icon: Trophy, text: 'Earn 5% points of whatever they earn forever' }
                ].map((item, i) => (
                  <li key={i} className="flex gap-3 text-xs text-slate-500 leading-relaxed">
                    <div className="w-5 h-5 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                      <item.icon className="w-3 h-3 text-slate-600" />
                    </div>
                    {item.text}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="p-5 bg-orange-50 border border-orange-100 rounded-3xl text-orange-800 text-xs leading-relaxed flex gap-3">
            <ShieldAlert className="w-5 h-5 shrink-0 text-orange-600" />
            <span>
              <strong>Fair Play Policy:</strong> Self-referrals or using proxies to create fake accounts will lead to permanent account suspension and loss of all earnings.
            </span>
          </div>
        </div>

        {/* Right: Referral Network List */}
        <div className="lg:col-span-2 bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-white sticky top-0 z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-black font-display text-slate-800">Your Invite Network</h3>
                <p className="text-xs text-slate-400">Live tracker for your referred members</p>
              </div>
            </div>
            
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search network..."
                className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 w-48"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto max-h-[600px]">
            {loadingReferrals ? (
              <div className="p-20 text-center space-y-4">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Syncing network data...</p>
              </div>
            ) : referrals.length === 0 ? (
              <div className="p-20 text-center space-y-6">
                <div className="w-20 h-20 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mx-auto border border-slate-100 shadow-sm">
                  <Users className="w-10 h-10 text-slate-200" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-black font-display text-slate-800">Your Network is Empty</h3>
                  <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
                    Start sharing your link to build a passive income network! New members will appear here instantly.
                  </p>
                </div>
                <button 
                  onClick={handleCopyLink}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold font-display rounded-2xl text-xs tracking-wider uppercase transition shadow-lg shadow-blue-200"
                >
                  Get Started Now
                </button>
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {referrals.map((refUser, index) => (
                  <div key={refUser.username} className="p-5 hover:bg-slate-50/50 transition flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-white border border-slate-100 flex items-center justify-center font-black text-slate-400 text-xs shadow-xs group-hover:border-blue-100 group-hover:text-blue-500 transition">
                        {index + 1}
                      </div>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <p className="font-black text-slate-800 font-display">{refUser.username}</p>
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tighter ${
                            refUser.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {refUser.status}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 font-medium">
                          Joined on {new Date(refUser.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="text-right space-y-1">
                      <div className="flex items-center gap-1.5 justify-end">
                        <Trophy className="w-3 h-3 text-amber-500" />
                        <p className="text-xs font-black text-slate-800">
                          {refUser.balancePoints.toLocaleString()} <span className="text-[10px] text-slate-400">PTS</span>
                        </p>
                      </div>
                      <p className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg inline-block">
                        +{refUser.todayWorkPoints.toLocaleString()} today
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-6 bg-slate-50/50 border-t border-slate-50">
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Signup Reward', value: 'Instant', icon: UserCheck },
                { label: 'Commission', value: '5% Lifetime', icon: Download },
                { label: 'Task Bonuses', value: 'Recurring', icon: ClipboardList }
              ].map((stat, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <stat.icon className="w-3 h-3" />
                    <span className="text-[9px] font-bold uppercase tracking-widest">{stat.label}</span>
                  </div>
                  <p className="text-xs font-black text-slate-700">{stat.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
