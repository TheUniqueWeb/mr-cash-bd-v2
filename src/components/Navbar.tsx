import React from 'react';
import { motion } from 'motion/react';
import { 
  DollarSign, 
  User, 
  LogOut, 
  Sliders, 
  Menu, 
  X, 
  Wallet, 
  Award, 
  Briefcase, 
  Home, 
  UserCheck,
  Bell,
  CheckCircle2,
  Gift,
  Settings,
  Share2,
  Headset
} from 'lucide-react';
import { User as UserType, Notification } from '../types';

interface NavbarProps {
  user: UserType | null;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onOpenAuth: () => void;
  onLogout: () => void;
  supportLink?: string;
}

export default function Navbar({ user, activeTab, onTabChange, onOpenAuth, onLogout, supportLink }: NavbarProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [notifications, setNotifications] = React.useState<Notification[]>([]);
  const [isNotifOpen, setIsNotifOpen] = React.useState(false);

  const fetchNotifications = React.useCallback(async () => {
    if (!user || !user.username || typeof user.username !== 'string' || user.username.trim() === '') return;
    try {
      const response = await fetch(`/api/v1/notifications/${encodeURIComponent(user.username.trim())}`);
      if (response.ok) {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const data = await response.json();
          setNotifications(Array.isArray(data) ? data : []);
        } else {
          console.warn("Expected JSON response from notifications API, but got:", contentType);
        }
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  }, [user]);

  React.useEffect(() => {
    fetchNotifications();
    if (!user) {
      setNotifications([]);
      return;
    }
    const interval = setInterval(fetchNotifications, 15000); // 15s poll
    return () => clearInterval(interval);
  }, [user, fetchNotifications]);

  const handleMarkAsRead = async (id: string) => {
    try {
      const response = await fetch('/api/v1/notifications/read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: user?.username, notificationId: id })
      });
      if (response.ok) {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const response = await fetch('/api/v1/notifications/read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: user?.username, readAll: true })
      });
      if (response.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const navigationItems = [
    { id: 'home', label: 'Home', icon: <Home className="w-4 h-4" /> },
    { id: 'dashboard', label: 'Dashboard', icon: <Wallet className="w-4 h-4" />, authRequired: true },
    { id: 'work', label: 'Offerwall', icon: <Briefcase className="w-4 h-4" /> },
    { id: 'referral', label: 'Refer & Earn', icon: <Share2 className="w-4 h-4" />, authRequired: true },
    { id: 'withdraw', label: 'Cash Out', icon: <DollarSign className="w-4 h-4" />, authRequired: true },
    { id: 'redeem', label: 'Redeem Code', icon: <Gift className="w-4 h-4" />, authRequired: true },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" />, authRequired: true },
    { id: 'admin', label: 'Admin Desk', icon: <Sliders className="w-4 h-4" />, adminRequired: true },
  ];

  const handleTabClick = (tabId: string) => {
    onTabChange(tabId);
    setIsOpen(false);
  };

  return (
    <nav className="sticky top-0 z-40 bg-white border-b border-slate-100 shadow-sm" id="main-navigation-navbar">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer select-none" onClick={() => handleTabClick('home')}>
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/10">
              <span className="font-display font-black text-lg tracking-wider">MR</span>
            </div>
            <div className="leading-none">
              <span className="font-display font-black text-lg tracking-tight text-slate-800">MR CASH</span>
              <span className="text-xs font-bold text-blue-600 block tracking-widest font-mono">BD</span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-1">
            {navigationItems.map((item) => {
              if (item.authRequired && !user) return null;
              if (item.adminRequired && (!user || !user.isAdmin)) return null;

              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition cursor-pointer ${
                    isActive 
                      ? 'bg-blue-50 text-blue-600' 
                      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50/50'
                  }`}
                  id={`nav-tab-${item.id}`}
                >
                  {item.icon}
                  {item.label}
                </button>
              );
            })}

            {/* Support External Button */}
            <a
              href={supportLink || 'https://t.me/mrcashbd'}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-slate-500 hover:text-emerald-600 hover:bg-emerald-50/50 transition cursor-pointer"
            >
              <Headset className="w-4 h-4" />
              Support
            </a>
          </div>

          {/* User profile section / Auth triggers */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4">
                {/* Header points status */}
                <div className="px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-xl flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="font-mono text-xs font-black text-slate-800">
                    {user.balancePoints.toLocaleString()} <span className="text-slate-400 font-medium">PTS</span>
                  </span>
                </div>

                {/* Notification Bell */}
                <div className="relative">
                  <button
                    onClick={() => setIsNotifOpen(!isNotifOpen)}
                    className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-xl transition relative cursor-pointer font-bold"
                    id="desktop-notifications-bell"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 w-4.5 h-4.5 bg-red-500 text-[9px] font-black text-white rounded-full flex items-center justify-center animate-pulse">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Dropdown menu */}
                  {isNotifOpen && (
                    <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200/80 rounded-2xl shadow-xl z-50 overflow-hidden py-1">
                      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-50 bg-slate-50/50">
                        <span className="font-bold text-xs text-slate-800 uppercase tracking-wider">Alert Center</span>
                        {unreadCount > 0 && (
                          <button
                            onClick={handleMarkAllAsRead}
                            className="text-[11px] font-bold text-blue-600 hover:text-blue-800 transition cursor-pointer"
                          >
                            Mark all read
                          </button>
                        )}
                      </div>

                      <div className="max-h-72 overflow-y-auto divide-y divide-slate-50">
                        {notifications.length === 0 ? (
                          <div className="p-6 text-center text-slate-400 space-y-1">
                            <p className="text-sm font-semibold">All caught up! 🎉</p>
                            <p className="text-xs">No alerts received yet.</p>
                          </div>
                        ) : (
                          notifications.map((notif) => {
                            let icon = <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
                            let bgIcon = "bg-emerald-50";
                            if (notif.type === 'withdrawal') {
                              icon = <DollarSign className="w-4 h-4 text-blue-500" />;
                              bgIcon = "bg-blue-50";
                            } else if (notif.type === 'referral') {
                              icon = <Gift className="w-4 h-4 text-purple-500" />;
                              bgIcon = "bg-purple-50";
                            }

                            return (
                              <div
                                key={notif.id}
                                onClick={() => !notif.isRead && handleMarkAsRead(notif.id)}
                                className={`p-4 flex gap-3 hover:bg-slate-50/80 transition cursor-pointer text-left ${!notif.isRead ? 'bg-blue-50/30' : ''}`}
                              >
                                <span className={`w-8 h-8 rounded-lg ${bgIcon} flex items-center justify-center shrink-0`}>
                                  {icon}
                                </span>
                                <div className="space-y-0.5 min-w-0 flex-1">
                                  <div className="flex items-center justify-between gap-2">
                                    <h4 className={`text-xs font-bold truncate ${!notif.isRead ? 'text-slate-800' : 'text-slate-500'}`}>
                                      {notif.title}
                                    </h4>
                                    {!notif.isRead && (
                                      <span className="w-1.5 h-1.5 bg-blue-500 rounded-full shrink-0"></span>
                                    )}
                                  </div>
                                  <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
                                    {notif.message}
                                  </p>
                                  <span className="text-[9px] text-slate-300 font-mono block">
                                    {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <p className="text-xs font-bold text-slate-800 leading-tight flex items-center gap-1">
                      {user.isAdmin && (
                        <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-[9px] font-bold rounded">
                          ADMIN
                        </span>
                      )}
                      {user.username}
                    </p>
                  </div>

                  <button
                    onClick={onLogout}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition cursor-pointer"
                    title="Sign Out"
                    id="desktop-logout-button"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold font-display rounded-xl text-sm shadow-md shadow-blue-600/5 hover:shadow-lg hover:shadow-blue-600/10 transition cursor-pointer"
                id="desktop-login-button"
              >
                Sign In / Register
              </button>
            )}
          </div>

          {/* Mobile menu trigger */}
          <div className="md:hidden flex items-center gap-2">
            {user && (
              <>
                <div className="px-2.5 py-1.5 bg-slate-50 border border-slate-100 rounded-lg font-mono text-[11px] font-black text-slate-800">
                  {(user.balancePoints / 100).toFixed(0)}৳
                </div>
                {/* Mobile Notification Bell */}
                <div className="relative">
                  <button
                    onClick={() => setIsNotifOpen(!isNotifOpen)}
                    className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-xl transition relative cursor-pointer"
                    id="mobile-notifications-bell"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-red-500 text-[8px] font-black text-white rounded-full flex items-center justify-center animate-pulse">
                        {unreadCount}
                      </span>
                    )}
                  </button>
                </div>
              </>
            )}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-xl hover:bg-slate-50 text-slate-500 hover:text-slate-800 transition cursor-pointer"
              id="mobile-menu-toggle"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-slate-100 py-3 px-4 space-y-3 shadow-inner" id="mobile-navigation-dropdown">
          <div className="space-y-1">
            {navigationItems.map((item) => {
              if (item.authRequired && !user) return null;
              if (item.adminRequired && (!user || !user.isAdmin)) return null;

              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-bold transition text-left cursor-pointer ${
                    isActive 
                      ? 'bg-blue-50 text-blue-600' 
                      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                  }`}
                  id={`nav-tab-mobile-${item.id}`}
                >
                  {item.icon}
                  {item.label}
                </button>
              );
            })}

            {/* Mobile Support Link */}
            <a
              href={supportLink || 'https://t.me/mrcashbd'}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-bold text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 transition text-left cursor-pointer"
            >
              <Headset className="w-4 h-4" />
              Help & Support
            </a>
          </div>

          <div className="pt-3 border-t border-slate-100">
            {user ? (
              <div className="space-y-3">
                <div className="px-4 py-2.5 bg-slate-50 rounded-xl flex items-center justify-between text-xs text-slate-500 font-semibold">
                  <span>Balance PTS:</span>
                  <span className="font-mono font-bold text-slate-800">{user.balancePoints.toLocaleString()} PTS</span>
                </div>
                <button
                  onClick={() => {
                    onLogout();
                    setIsOpen(false);
                  }}
                  className="flex items-center justify-center gap-2 w-full py-3 bg-red-50 hover:bg-red-100 text-red-600 font-bold text-sm rounded-xl transition cursor-pointer"
                  id="mobile-logout-button"
                >
                  <LogOut className="w-4 h-4" />
                  Logout Account
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  onOpenAuth();
                  setIsOpen(false);
                }}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold font-display rounded-xl text-sm text-center shadow transition cursor-pointer"
                id="mobile-login-button"
              >
                Sign In or Register
              </button>
            )}
          </div>
        </div>
      )}
      {/* Mobile Notifications Drawer/Modal */}
      {isNotifOpen && (
        <div className="fixed inset-0 z-50 md:hidden bg-slate-900/40 backdrop-blur-xs flex items-end justify-center animate-fade-in" onClick={() => setIsNotifOpen(false)}>
          <div className="bg-white w-full rounded-t-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-blue-600" />
                <span className="font-bold font-display text-slate-800 text-sm">Alerts & Status</span>
              </div>
              <div className="flex items-center gap-3">
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="text-xs font-bold text-blue-600 hover:text-blue-800 transition cursor-pointer"
                  >
                    Mark all read
                  </button>
                )}
                <button
                  onClick={() => setIsNotifOpen(false)}
                  className="p-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="overflow-y-auto divide-y divide-slate-100 flex-1 max-h-[60vh]">
              {notifications.length === 0 ? (
                <div className="p-10 text-center text-slate-400 space-y-1">
                  <p className="text-sm font-semibold">All caught up! 🎉</p>
                  <p className="text-xs">No notifications received yet.</p>
                </div>
              ) : (
                notifications.map((notif) => {
                  let icon = <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
                  let bgIcon = "bg-emerald-50";
                  if (notif.type === 'withdrawal') {
                    icon = <DollarSign className="w-4 h-4 text-blue-500" />;
                    bgIcon = "bg-blue-50";
                  } else if (notif.type === 'referral') {
                    icon = <Gift className="w-4 h-4 text-purple-500" />;
                    bgIcon = "bg-purple-50";
                  }

                  return (
                    <div
                      key={notif.id}
                      onClick={() => {
                        if (!notif.isRead) handleMarkAsRead(notif.id);
                      }}
                      className={`p-5 flex gap-4 hover:bg-slate-50 transition cursor-pointer text-left ${!notif.isRead ? 'bg-blue-50/10' : ''}`}
                    >
                      <span className={`w-10 h-10 rounded-xl ${bgIcon} flex items-center justify-center shrink-0`}>
                        {icon}
                      </span>
                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className={`text-xs font-bold ${!notif.isRead ? 'text-slate-800' : 'text-slate-500'}`}>
                            {notif.title}
                          </h4>
                          {!notif.isRead && (
                            <span className="w-2 h-2 bg-blue-500 rounded-full shrink-0"></span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed font-medium">
                          {notif.message}
                        </p>
                        <span className="text-[10px] text-slate-300 font-mono block">
                          {new Date(notif.createdAt).toLocaleDateString()} {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
