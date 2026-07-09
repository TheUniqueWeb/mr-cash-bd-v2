import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  User as UserIcon, 
  Mail, 
  Phone, 
  Lock, 
  Eye, 
  EyeOff, 
  Save, 
  CheckCircle, 
  AlertCircle,
  Settings as SettingsIcon,
  ShieldCheck
} from 'lucide-react';
import { User } from '../types';

interface SettingsProps {
  user: User;
  onUpdateUser: (user: User) => void;
}

export default function Settings({ user, onUpdateUser }: SettingsProps) {
  const [name, setName] = useState(user.name || '');
  const [email, setEmail] = useState(user.email || '');
  const [phoneNumber, setPhoneNumber] = useState(user.phoneNumber || '');
  const [password, setPassword] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/v1/user/settings/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: user.username,
          name,
          email,
          phoneNumber,
          password: password.trim() !== '' ? password : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update settings');
      }

      // Update state in App.tsx
      onUpdateUser(data);
      setSuccessMsg('Settings updated successfully! 🎉');
      setPassword(''); // clear password input
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Something went wrong while saving settings.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6" id="settings-view-root">
      {/* HEADER SECTION */}
      <div className="space-y-1 text-center md:text-left">
        <h2 className="text-2xl font-black font-display text-slate-800 flex items-center justify-center md:justify-start gap-2">
          <SettingsIcon className="w-6 h-6 text-blue-600 animate-spin-slow" />
          Account Settings
        </h2>
        <p className="text-sm text-slate-400">
          Update your profile name, security credentials, contact email, and active wallet phone number.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* SIDE BAR / INFO */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs h-fit space-y-4">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full mx-auto flex items-center justify-center font-display font-black text-2xl border-4 border-blue-50">
              {user.username.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <h3 className="font-bold text-slate-800">{user.name || user.username}</h3>
              <p className="text-xs font-mono text-slate-400">@{user.username}</p>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-4 space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400 font-semibold">User Group</span>
              <span className={`px-2 py-0.5 rounded-md font-bold ${user.isAdmin ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-50 text-slate-600'}`}>
                {user.isAdmin ? 'Administrator' : 'Active Member'}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400 font-semibold">Total Referrals</span>
              <span className="font-bold text-slate-800">{user.totalReferred} friends</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400 font-semibold">Points Balance</span>
              <span className="font-bold font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                {user.balancePoints.toLocaleString()} PTS
              </span>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3 text-[10px] text-slate-400 leading-relaxed space-y-1">
            <p className="font-bold text-slate-500 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              Security Lock
            </p>
            <p>
              To maintain system integrity, you are permitted to change your display name, contact phone number, email address, and account password only. Point balances, referral lists, and transaction histories are locked.
            </p>
          </div>
        </div>

        {/* INPUT FORM SECTION */}
        <div className="md:col-span-2 bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-xs">
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {successMsg && (
              <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs font-bold rounded-2xl flex items-center gap-2">
                <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600 animate-bounce" />
                <span>{successMsg}</span>
              </div>
            )}

            {errorMsg && (
              <div className="p-4 bg-red-50 border border-red-100 text-red-800 text-xs font-bold rounded-2xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Name field */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                  Full Name
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Full Name"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50/50 border border-slate-200 focus:border-blue-500 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none transition focus:ring-1 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@example.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50/50 border border-slate-200 focus:border-blue-500 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none transition focus:ring-1 focus:ring-blue-500/20"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Phone Number */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="tel"
                    required
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="Active mobile wallet number"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50/50 border border-slate-200 focus:border-blue-500 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none transition focus:ring-1 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block flex items-center justify-between">
                  <span>New Password</span>
                  <span className="text-[9px] text-slate-400 font-normal normal-case">Leave blank to keep current</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50/50 border border-slate-200 focus:border-blue-500 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none transition focus:ring-1 focus:ring-blue-500/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition p-1"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-3 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold font-display rounded-xl text-xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-sm shadow-blue-500/10 hover:shadow-md"
                id="save-settings-btn"
              >
                {loading ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    Save Settings
                  </>
                )}
              </button>
            </div>

          </form>
        </div>

      </div>
    </div>
  );
}
