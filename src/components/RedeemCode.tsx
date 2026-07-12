import React, { useState, useEffect } from 'react';
import { Gift, Calendar, Users, Clock, CheckCircle, AlertTriangle, ArrowRight } from 'lucide-react';
import { User as UserType, RedeemCode as RedeemCodeType } from '../types';

interface RedeemCodeProps {
  user: UserType;
  onRefreshProfile: () => void;
  onNavigate?: (tab: string) => void;
}

export default function RedeemCode({ user, onRefreshProfile, onNavigate }: RedeemCodeProps) {
  const [code, setCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [events, setEvents] = useState<RedeemCodeType[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);

  const fetchEvents = async () => {
    try {
      const res = await fetch('/api/v1/redeem/events');
      if (res.ok) {
        const data = await res.json();
        setEvents(data);
      }
    } catch (err) {
      console.error('Failed to load events:', err);
    } finally {
      setLoadingEvents(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    setSubmitting(true);
    setStatus(null);

    try {
      const res = await fetch('/api/v1/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: user.username, code: code.trim() }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus({ type: 'success', message: data.message || `Success! You earned ${data.pointsCredited} PTS!` });
        setCode('');
        onRefreshProfile();
        fetchEvents(); // update counts
      } else {
        setStatus({ type: 'error', message: data.error || 'Failed to redeem code.' });
      }
    } catch (err) {
      console.error(err);
      setStatus({ type: 'error', message: 'Network error. Please try again later.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8" id="redeem-code-container">
      {/* Nice Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 rounded-3xl text-white p-8 md:p-12 shadow-xl shadow-blue-500/10">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/3 -mb-20 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="relative flex flex-col md:flex-row items-center justify-between gap-8 z-10">
          <div className="space-y-4 max-w-lg text-center md:text-left">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white/15 backdrop-blur-md text-yellow-300 rounded-full text-xs font-bold tracking-wider uppercase border border-white/10">
              <Gift className="w-3.5 h-3.5" /> Special Rewards & Events
            </span>
            <h1 className="text-3xl md:text-4xl font-black font-display tracking-tight leading-tight">
              Redeem Event Codes for Free Points!
            </h1>
            <p className="text-sm text-blue-100 font-medium leading-relaxed">
              Enter official event promotional codes, telegram announcements, or community codes below to instantly credit bonus points to your wallet balance.
            </p>
          </div>
          
          <div className="w-24 h-24 md:w-32 md:h-32 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 shadow-inner shrink-0 rotate-3 hover:rotate-0 transition duration-300">
            <Gift className="w-12 h-12 md:w-16 md:h-16 text-yellow-300 animate-bounce" />
          </div>
        </div>
      </div>

      {/* Redemption Form */}
      <div className="bg-white rounded-3xl border border-slate-100 p-6 md:p-8 shadow-sm space-y-6">
        <div className="max-w-md mx-auto space-y-4">
          <h2 className="text-xl font-bold font-display text-slate-800 text-center">
            Have a promo code? Enter it below
          </h2>
          
          <form onSubmit={handleRedeem} className="flex gap-2">
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="e.g. WELCOME1000"
              disabled={submitting}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold tracking-wider placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={submitting || !code.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-2xl text-sm shadow-md shadow-blue-500/10 hover:shadow-lg transition cursor-pointer disabled:opacity-50 flex items-center gap-2 shrink-0"
            >
              {submitting ? 'Verifying...' : 'Redeem'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {status && (
            <div className={`p-4 rounded-2xl flex items-start gap-3 border text-sm font-semibold ${
              status.type === 'success' 
                ? 'bg-emerald-50 border-emerald-100 text-emerald-800' 
                : 'bg-red-50 border-red-100 text-red-800'
            }`}>
              {status.type === 'success' ? (
                <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              )}
              <div className="flex-1 leading-relaxed">
                {status.message}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Ongoing Events */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black font-display text-slate-800 tracking-tight flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            Ongoing Promo Events
          </h2>
          {onNavigate && (
            <button 
              onClick={() => onNavigate('work')}
              className="text-xs font-bold text-blue-600 hover:text-blue-800 transition cursor-pointer"
            >
              Back to Offerwall
            </button>
          )}
        </div>

        {loadingEvents ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="bg-white border border-slate-100 rounded-3xl p-6 space-y-4 animate-pulse">
                <div className="h-44 bg-slate-100 rounded-2xl"></div>
                <div className="space-y-2">
                  <div className="h-5 w-2/3 bg-slate-100 rounded"></div>
                  <div className="h-4 w-full bg-slate-100 rounded"></div>
                  <div className="h-4 w-5/6 bg-slate-100 rounded"></div>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <div className="h-8 w-24 bg-slate-100 rounded-xl"></div>
                  <div className="h-8 w-20 bg-slate-100 rounded-xl"></div>
                </div>
              </div>
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center space-y-3">
            <Gift className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-lg font-bold font-display text-slate-800">No ongoing code events right now</h3>
            <p className="text-sm text-slate-400 max-w-sm mx-auto leading-relaxed">
              Check back later or join our Telegram channel to grab promotional redemption codes as soon as they drop!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {events.map((event) => {
              const isExpired = event.expiresAt < Date.now();
              const isFullyRedeemed = event.eligibilityType === 'limited' && event.redeemedCount >= event.maxUsers;
              const hasImage = event.image && event.image.startsWith('http');

              return (
                <div 
                  key={event.code} 
                  className={`bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition duration-300 flex flex-col justify-between ${
                    isExpired || isFullyRedeemed ? 'opacity-70' : ''
                  }`}
                >
                  <div>
                    {hasImage ? (
                      <div className="relative h-48 bg-slate-100 overflow-hidden">
                        <img 
                          src={event.image} 
                          alt={event.name} 
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                        {isExpired && (
                          <div className="absolute inset-0 bg-slate-900/65 backdrop-blur-xs flex items-center justify-center text-white font-bold text-sm tracking-wide">
                            EXPIRED EVENT
                          </div>
                        )}
                        {isFullyRedeemed && !isExpired && (
                          <div className="absolute inset-0 bg-slate-900/65 backdrop-blur-xs flex items-center justify-center text-white font-bold text-sm tracking-wide">
                            FULLY REDEEMED
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="h-28 bg-gradient-to-br from-slate-50 to-slate-100 border-b border-slate-50 relative flex items-center justify-center">
                        <Gift className="w-10 h-10 text-slate-300" />
                        {isExpired && (
                          <div className="absolute inset-0 bg-slate-900/65 backdrop-blur-xs flex items-center justify-center text-white font-bold text-sm tracking-wide">
                            EXPIRED EVENT
                          </div>
                        )}
                        {isFullyRedeemed && !isExpired && (
                          <div className="absolute inset-0 bg-slate-900/65 backdrop-blur-xs flex items-center justify-center text-white font-bold text-sm tracking-wide">
                            FULLY REDEEMED
                          </div>
                        )}
                      </div>
                    )}

                    <div className="p-6 space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-black font-mono rounded-lg border border-blue-100">
                          {event.rewardPoints.toLocaleString()} PTS
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Exp: {new Date(event.expiresAt).toLocaleDateString()}
                        </span>
                      </div>

                      <h3 className="text-lg font-bold font-display text-slate-800 line-clamp-1">
                        {event.name}
                      </h3>
                      
                      <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">
                        {event.description}
                      </p>
                    </div>
                  </div>

                  <div className="p-6 pt-0 border-t border-slate-50/50 bg-slate-50/20 flex items-center justify-between text-xs text-slate-400 font-semibold">
                    <span className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      {event.eligibilityType === 'limited' ? (
                        <span>{event.redeemedCount} / {event.maxUsers} Claimed</span>
                      ) : (
                        <span>Unlimited Claims ({event.redeemedCount} redemptions)</span>
                      )}
                    </span>
                    
                    {!isExpired && !isFullyRedeemed && (
                      <button 
                        onClick={() => {
                          setCode(event.code);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="text-xs font-bold text-blue-600 hover:text-blue-800 transition cursor-pointer flex items-center gap-1"
                      >
                        Use Code
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
