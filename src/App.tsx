import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import Offerwall from './components/Offerwall';
import Withdraw from './components/Withdraw';
import ReferralPage from './components/ReferralPage';
import AdminPanel from './components/AdminPanel';
import AuthModal from './components/AuthModal';
import Settings from './components/Settings';
import AdBanner from './components/AdBanner';
import { User, SystemSettings } from './types';
import { Sparkles, Heart, AlertCircle, ShieldCheck, Headset } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<string>('home');
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [systemSettings, setSystemSettings] = useState<SystemSettings | null>(null);

  // 1. Initial State Load
  useEffect(() => {
    const fetchGlobalSettings = async () => {
      try {
        const res = await fetch('/api/v1/admin/settings');
        if (res.ok) {
          setSystemSettings(await res.json());
        }
      } catch (err) {
        console.error('Failed to load global settings:', err);
      }
    };
    fetchGlobalSettings();

    const savedUser = localStorage.getItem('mr_cash_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (err) {
        localStorage.removeItem('mr_cash_user');
      }
    }

    // Capture referrer parameter from URL (?ref=username)
    const urlParams = new URLSearchParams(window.location.search);
    const ref = urlParams.get('ref');
    if (ref) {
      sessionStorage.setItem('mr_cash_referrer', ref);
      // Trigger login/signup modal instantly if visitor clicked an affiliate referral link
      setIsAuthOpen(true);
    }
  }, []);

  // 2. Synchronize user profile balance
  const handleRefreshProfile = async () => {
    if (!user) return;
    try {
      const res = await fetch(`/api/v1/user/profile/${encodeURIComponent(user.username)}`);
      if (res.ok) {
        const freshData = await res.json();
        setUser(freshData);
        localStorage.setItem('mr_cash_user', JSON.stringify(freshData));
      }
    } catch (err) {
      console.warn('Failed to sync user stats:', err);
    }
  };

  // Sync profile when changing tabs to capture passive postback completions
  useEffect(() => {
    if (user) {
      handleRefreshProfile();
    }
  }, [activeTab]);

  const handleAuthSuccess = (loggedInUser: User) => {
    setUser(loggedInUser);
    localStorage.setItem('mr_cash_user', JSON.stringify(loggedInUser));
    // Route new logins directly to Dashboard
    setActiveTab(loggedInUser.isAdmin ? 'admin' : 'dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('mr_cash_user');
    setActiveTab('home');
  };

  // Render Page Content conditionally
  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <LandingPage onGetStarted={() => user ? setActiveTab('dashboard') : setIsAuthOpen(true)} />;
      case 'dashboard':
        return user ? (
          <Dashboard 
            user={user} 
            onNavigate={(tab) => setActiveTab(tab)} 
            onRefreshProfile={handleRefreshProfile}
          />
        ) : null;
      case 'work':
        return <Offerwall user={user} onOpenAuth={() => setIsAuthOpen(true)} />;
      case 'referral':
        return user ? <ReferralPage user={user} /> : null;
      case 'withdraw':
        return user ? (
          <Withdraw 
            user={user} 
            onRefreshProfile={handleRefreshProfile}
          />
        ) : null;
      case 'settings':
        return user ? (
          <Settings 
            user={user} 
            onUpdateUser={(updatedUser) => {
              setUser(updatedUser);
              localStorage.setItem('mr_cash_user', JSON.stringify(updatedUser));
            }}
          />
        ) : null;
      case 'admin':
        return user && user.isAdmin ? <AdminPanel adminUser={user} /> : null;
      default:
        return <LandingPage onGetStarted={() => user ? setActiveTab('dashboard') : setIsAuthOpen(true)} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-[#1E293B] antialiased" id="applet-viewport">
      
      {/* 1. Header Navigation */}
      <Navbar 
        user={user} 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
        onOpenAuth={() => setIsAuthOpen(true)} 
        onLogout={handleLogout}
        supportLink={systemSettings?.supportLink}
      />

      {/* 2. Main Tab View Area */}
      <main className="flex-grow pb-16">
        <AdBanner />
        {renderContent()}
        <AdBanner />
      </main>

      {/* 3. Footer */}
      <footer className="bg-white border-t border-slate-100 py-8 text-center text-xs text-slate-400 space-y-3 mt-auto" id="main-app-footer">
        <div className="flex items-center justify-center gap-1.5 font-semibold text-slate-500">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          MR CASH BD v1.4.0 Secured Escrow Ledger
        </div>
        <p className="max-w-md mx-auto leading-relaxed">
          The white-label CPA marketing platform. All transactions and micro-rewards are monitored under strict anti-vpn security rules. Authorized by CPALead Integration Network.
        </p>
        <div className="pt-2 flex items-center justify-center gap-1 text-[10px] text-slate-300">
          <span>Made with</span>
          <Heart className="w-3 h-3 text-red-500 fill-current animate-pulse" />
          <span>in Bangladesh</span>
        </div>
      </footer>

      {/* 4. Auth Modal Dialog */}
      <AuthModal 
        isOpen={isAuthOpen} 
        onClose={() => setIsAuthOpen(false)} 
        onAuthSuccess={handleAuthSuccess}
      />

    </div>
  );
}
