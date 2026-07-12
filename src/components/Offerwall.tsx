import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { 
  Sparkles, 
  ShieldAlert, 
  Tv, 
  Smartphone, 
  Laptop, 
  CheckCircle, 
  AlertCircle,
  TrendingUp,
  Award,
  ChevronRight,
  ExternalLink,
  RotateCw,
  Zap,
  ClipboardList,
  Download,
  UserCheck,
  Layers
} from 'lucide-react';
import { CPAOffer, User } from '../types';

interface OfferwallProps {
  user: User | null;
  onOpenAuth: () => void;
}

export default function Offerwall({ user, onOpenAuth }: OfferwallProps) {
  const [offers, setOffers] = useState<CPAOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const [ipInfo, setIpInfo] = useState<any>({ ip: '', isBD: true, isProxy: false, country: '' });
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const fetchOffers = async () => {
    setLoading(true);
    setError(null);
    try {
      const url = user 
        ? `/api/v1/offers?username=${encodeURIComponent(user.username)}` 
        : `/api/v1/offers`;
      const res = await fetch(url);
      const data = await res.json();
      
      if (!res.ok) {
        throw {
          status: res.status,
          error: data.error || 'Failed to load offers',
          message: data.message || 'An error occurred while loading'
        };
      }

      setOffers(data.offers || []);
      setIpInfo({
        ip: data.ip,
        isBD: data.isBD,
        isProxy: data.isProxy,
        country: data.country
      });
    } catch (err: any) {
      console.error('Fetch offers error:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, [user]);

  // Generate redirect link
  const getRedirectLink = (offer: CPAOffer) => {
    if (!user) return '';
    const maskedRedirect = `/api/v1/redirect?offerId=${encodeURIComponent(offer.campid)}&userId=${encodeURIComponent(user.username)}&originalLink=${encodeURIComponent(offer.link)}`;
    return maskedRedirect;
  };

  const getDeviceIcon = (device?: string) => {
    if (!device) return <Smartphone className="w-4 h-4 text-slate-500" />;
    switch (device.toLowerCase()) {
      case 'mobile':
      case 'android':
      case 'ios':
        return <Smartphone className="w-4 h-4 text-slate-500" />;
      case 'desktop':
        return <Laptop className="w-4 h-4 text-slate-500" />;
      default:
        return <Tv className="w-4 h-4 text-slate-500" />;
    }
  };

  const filteredOffers = selectedCategory === 'All'
    ? offers
    : offers.filter(offer => offer.category === selectedCategory);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-8" id="offerwall-root">
      
      {/* Top Title Section */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-100 pb-6">
        <div>
          <h2 className="text-2xl font-black font-display text-slate-800 flex items-center gap-2">
            <Award className="w-6 h-6 text-blue-600 animate-pulse" />
            MR CASH Premium Task Wall
          </h2>
          <p className="text-sm text-slate-500">Earn points for completing micro-tasks. Every 10,000 Points = $1.00 (100৳ BDT) exchange</p>
        </div>
        <button 
          onClick={fetchOffers}
          className="px-4 py-2 bg-white border border-slate-200 text-slate-700 font-bold text-sm rounded-xl transition hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer"
          id="refresh-offers-button"
        >
          <RotateCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Reload Tasks
        </button>
      </div>

      {/* ERROR / VPN DETECTED ALERTS */}
      {error ? (
        <div className="max-w-xl mx-auto bg-white border-2 border-red-100 rounded-2xl p-8 text-center space-y-6 shadow-md" id="offerwall-error-alert">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold font-display text-slate-800 uppercase tracking-tight">{error.error || 'Access Blocked'}</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              {error.message || 'MR CASH is only accessible inside Bangladesh. VPNs, proxies, and emulator connections are strictly prohibited.'}
            </p>
          </div>
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 font-mono text-xs text-slate-500 text-left space-y-1">
            <p><strong>Your IP:</strong> {error.ip || 'Detecting...'}</p>
            <p><strong>Detected Country:</strong> {error.country || 'Unknown'}</p>
            <p><strong>Status:</strong> Security Filter Active</p>
          </div>
          <button 
            onClick={fetchOffers}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold font-display rounded-xl text-sm transition shadow-md cursor-pointer"
            id="retry-offers-button"
          >
            Retry Connection
          </button>
        </div>
      ) : (
        <>
          {/* IP Safety Indicator / Skeleton */}
          {loading ? (
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs animate-pulse">
              <div className="flex items-center gap-2 flex-grow">
                <div className="w-4 h-4 bg-slate-200 rounded-full shrink-0" />
                <div className="h-4 bg-slate-200 rounded w-1/2" />
              </div>
              <div className="w-24 h-5 bg-slate-200 rounded-md" />
            </div>
          ) : (
            <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-emerald-800 text-xs">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  Verified connection from <strong>{ipInfo.country || 'Bangladesh'}</strong>. IP: <code>{ipInfo.ip}</code> (Safe, No VPN detected).
                </span>
              </div>
              <span className="bg-emerald-200/50 font-bold px-2 py-0.5 rounded uppercase">SECURE PORTAL</span>
            </div>
          )}

          {/* Category Tabs / Skeleton */}
          {loading ? (
            <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 pb-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-8 w-24 bg-slate-100/80 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 pb-2" id="category-tabs-container">
              <button
                onClick={() => setSelectedCategory('All')}
                className={`px-4 py-2 rounded-xl text-xs font-bold font-display flex items-center gap-1.5 transition cursor-pointer border ${
                  selectedCategory === 'All' 
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm' 
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-800'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                All Tasks
              </button>
              <button
                onClick={() => setSelectedCategory('Surveys')}
                className={`px-4 py-2 rounded-xl text-xs font-bold font-display flex items-center gap-1.5 transition cursor-pointer border ${
                  selectedCategory === 'Surveys' 
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm' 
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-800'
                }`}
              >
                <ClipboardList className="w-3.5 h-3.5" />
                Surveys
              </button>
              <button
                onClick={() => setSelectedCategory('App Installs')}
                className={`px-4 py-2 rounded-xl text-xs font-bold font-display flex items-center gap-1.5 transition cursor-pointer border ${
                  selectedCategory === 'App Installs' 
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm' 
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-800'
                }`}
              >
                <Download className="w-3.5 h-3.5" />
                App Installs
              </button>
              <button
                onClick={() => setSelectedCategory('Signups')}
                className={`px-4 py-2 rounded-xl text-xs font-bold font-display flex items-center gap-1.5 transition cursor-pointer border ${
                  selectedCategory === 'Signups' 
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm' 
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-800'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                Signups
              </button>
            </div>
          )}

          {/* Offers Grid / Skeleton */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="offerwall-loading-grid">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 space-y-4 animate-pulse">
                  <div className="flex justify-between items-center">
                    <div className="w-10 h-10 bg-slate-100 rounded-xl"></div>
                    <div className="w-20 h-6 bg-slate-100 rounded-lg"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="w-3/4 h-5 bg-slate-100 rounded-md"></div>
                    <div className="w-full h-10 bg-slate-100 rounded-md"></div>
                  </div>
                  <div className="w-full h-11 bg-slate-100 rounded-xl"></div>
                </div>
              ))}
            </div>
          ) : filteredOffers.length === 0 ? (
            <div className="text-center py-12 space-y-3 bg-white rounded-3xl border border-slate-100 p-8" id="offers-empty">
              <AlertCircle className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-lg font-bold font-display text-slate-800">No active {selectedCategory.toLowerCase()} available</h3>
              <p className="text-sm text-slate-500">Check back shortly as our premium advertisers reload their campaigns.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="offers-grid">
              {filteredOffers.map((offer) => (
                <div 
                  key={offer.campid} 
                  className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition flex flex-col justify-between group hover:border-blue-100"
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-black font-display text-base">
                        {offer.title.charAt(0)}
                      </div>
                      <span className="flex items-center gap-1 bg-slate-50 border border-slate-100 px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        {getDeviceIcon(offer.device)}
                        {offer.device}
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <h3 className="text-base font-bold font-display text-slate-800 leading-snug group-hover:text-blue-600 transition">
                        {offer.title}
                      </h3>
                      <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                        {offer.description}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-50 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Payout reward</p>
                      <h4 className="text-lg font-black font-display text-emerald-500">
                        +{(offer.payoutPoints || 0).toLocaleString()} <span className="text-xs font-semibold">PTS</span>
                      </h4>
                    </div>

                    {user ? (
                      <a
                        href={getRedirectLink(offer)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold font-display rounded-xl text-xs shadow-md transition flex items-center gap-1 group/btn cursor-pointer"
                        id={`earn-now-${offer.campid}`}
                      >
                        Earn Now
                        <ExternalLink className="w-3.5 h-3.5 transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
                      </a>
                    ) : (
                      <button
                        onClick={onOpenAuth}
                        className="px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-bold font-display rounded-xl text-xs transition cursor-pointer"
                        id={`auth-required-earn-${offer.campid}`}
                      >
                        Login to Earn
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Tips Section */}
          <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
              <Zap className="w-4 h-4 text-orange-500 fill-current" />
              Pro Earning Guidelines
            </h4>
            <ul className="text-xs text-slate-500 space-y-2 list-disc list-inside leading-relaxed">
              <li>Always use real, active information when completing registration offers to prevent advertiser rejections.</li>
              <li>Points are automatically added to your wallet within <strong>5-15 minutes</strong> after advertiser validation triggers the postback.</li>
              <li>Attempts to bypass or farm offers with multiple accounts will lead to instant balance resets.</li>
            </ul>
          </div>
        </>
      )}

    </div>
  );
}
