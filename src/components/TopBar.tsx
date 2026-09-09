import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  SlidersHorizontal,
  Bell,
  HelpCircle,
  Sun,
  Moon,
  Shield,
  CheckCircle2,
  AlertTriangle,
  Menu,
  ChevronDown,
  LogOut,
  User,
  HardDrive,
  ExternalLink,
  ShieldCheck,
  Radio,
  Server
} from 'lucide-react';
import { UserAccount, MailSystemConfig } from '../types';

interface TopBarProps {
  user: UserAccount | null;
  config: MailSystemConfig | null;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenHelp: () => void;
  onOpenSettings: () => void;
  onOpenStorage: () => void;
  onOpenAuth: () => void;
  onOpenInternalApi?: () => void;
  onLogout: () => void;
  onToggleMobileMenu: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  onQuickFilter: (filter: { hasAttachment?: boolean; unreadOnly?: boolean; officialOnly?: boolean }) => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  user,
  config,
  searchQuery,
  onSearchChange,
  onOpenHelp,
  onOpenSettings,
  onOpenStorage,
  onOpenAuth,
  onOpenInternalApi,
  onLogout,
  onToggleMobileMenu,
  theme,
  onToggleTheme,
  onQuickFilter,
}) => {
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);

  const filterRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setShowFilterDropdown(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifMenu(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const notifications = [
    {
      id: 'n1',
      title: 'Personal Digital Server Active',
      time: '10m ago',
      category: 'Security',
      text: 'Hardware attestation verified. Zero-knowledge enclave isolation is online.',
    },
    {
      id: 'n2',
      title: 'Loopin Identity Linked',
      time: '2h ago',
      category: 'Sphere',
      text: 'Mailbox bound to Loopin Account ID: lpn_acc_449210.',
    },
  ];

  return (
    <header
      id="sphere-topbar"
      className="h-16 px-4 md:px-6 bg-[#0d0f17]/90 backdrop-blur-md border-b border-slate-800/70 flex items-center justify-between gap-4 sticky top-0 z-30"
    >
      {/* Left side: Mobile menu & Search */}
      <div className="flex items-center gap-3 flex-1 max-w-2xl">
        <button
          onClick={onToggleMobileMenu}
          className="lg:hidden p-2 rounded-lg text-slate-300 hover:bg-slate-800/60 hover:text-white"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Search Bar */}
        <div className="relative flex-1 flex items-center" ref={filterRef}>
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
          <input
            id="search-mail-input"
            type="text"
            placeholder="Search mail, senders, subjects or attachments..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-10 py-2 rounded-xl bg-slate-900/90 text-slate-100 placeholder-slate-400 text-sm border border-slate-800 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none transition-all"
          />

          {/* Filter options toggle */}
          <button
            id="search-filter-button"
            onClick={() => setShowFilterDropdown(!showFilterDropdown)}
            className={`absolute right-2.5 p-1 rounded-md text-slate-400 hover:text-slate-200 transition-colors ${
              showFilterDropdown ? 'text-violet-400 bg-violet-950/60' : ''
            }`}
            title="Filter search options"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>

          {/* Search Filter Dropdown */}
          {showFilterDropdown && (
            <div className="absolute top-12 left-0 right-0 bg-[#12141f] border border-slate-700/80 rounded-xl p-4 shadow-2xl z-50 flex flex-col gap-3">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Quick Search Filters
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <button
                  onClick={() => {
                    onQuickFilter({ unreadOnly: true });
                    setShowFilterDropdown(false);
                  }}
                  className="px-3 py-2 rounded-lg bg-slate-800/60 hover:bg-violet-950/60 hover:border-violet-500/40 border border-slate-700/60 text-xs text-left text-slate-300 font-medium"
                >
                  Unread Messages
                </button>
                <button
                  onClick={() => {
                    onQuickFilter({ hasAttachment: true });
                    setShowFilterDropdown(false);
                  }}
                  className="px-3 py-2 rounded-lg bg-slate-800/60 hover:bg-violet-950/60 hover:border-violet-500/40 border border-slate-700/60 text-xs text-left text-slate-300 font-medium"
                >
                  Has Attachments
                </button>
                <button
                  onClick={() => {
                    onQuickFilter({ officialOnly: true });
                    setShowFilterDropdown(false);
                  }}
                  className="px-3 py-2 rounded-lg bg-slate-800/60 hover:bg-violet-950/60 hover:border-violet-500/40 border border-slate-700/60 text-xs text-left text-slate-300 font-medium"
                >
                  Official Loopin
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right side: Infrastructure pills, Notifications, Theme, User Menu */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Loopin Internal API Console Button */}
        <button
          id="topbar-internal-api-btn"
          onClick={onOpenInternalApi}
          className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-purple-950/40 border border-purple-500/30 text-purple-300 hover:text-white hover:bg-purple-900/50 transition-all text-xs font-medium shadow-sm"
          title="Open Loopin Private Internal API Console & Architecture"
        >
          <Server className="w-3.5 h-3.5 text-purple-400" />
          <span className="hidden lg:inline">Loopin Internal API</span>
          <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-purple-900/80 text-purple-200 border border-purple-600/40">
            mTLS
          </span>
        </button>

        {/* Real Network Status Pill */}
        <div
          className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-[11px]"
          title="Transport Status: Sphere Bus is active. External SMTP relay is in transparent standby mode."
        >
          <div className="flex items-center gap-1.5 text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
            <span className="font-semibold text-slate-200">Sphere Bus:</span>
            <span className="text-emerald-400">Online</span>
          </div>
          <span className="text-slate-600">|</span>
          <div className="flex items-center gap-1.5 text-slate-400">
            <Radio className="w-3 h-3 text-amber-400" />
            <span>SMTP:</span>
            <span className="text-amber-400 font-medium">Transparent Queue</span>
          </div>
        </div>

        {/* Theme Toggle */}
        <button
          id="theme-toggle-btn"
          onClick={onToggleTheme}
          className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors"
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            id="notifications-btn"
            onClick={() => setShowNotifMenu(!showNotifMenu)}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors relative"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="w-2 h-2 rounded-full bg-violet-500 absolute top-1.5 right-1.5 ring-2 ring-[#0d0f17]" />
          </button>

          {showNotifMenu && (
            <div className="absolute right-0 top-12 w-80 bg-[#131520] border border-slate-700/80 rounded-xl p-3 shadow-2xl z-50 flex flex-col gap-2">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800 px-1">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Sphere Security Alerts
                </span>
                <span className="text-[10px] text-violet-400 bg-violet-950/60 px-1.5 py-0.5 rounded border border-violet-800/40">
                  Enclave Verified
                </span>
              </div>
              <div className="flex flex-col gap-2 max-h-60 overflow-y-auto">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800/80 text-xs"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-slate-200">{n.title}</span>
                      <span className="text-[10px] text-slate-500">{n.time}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">{n.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Help */}
        <button
          id="topbar-help-btn"
          onClick={onOpenHelp}
          className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors hidden sm:block"
          title="Help & Architecture"
        >
          <HelpCircle className="w-4 h-4" />
        </button>

        {/* User Account / Sphere Profile Menu */}
        <div className="relative" ref={userMenuRef}>
          <button
            id="sphere-account-menu-button"
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-1.5 sm:px-2 sm:py-1 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-violet-500/50 transition-all"
          >
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center font-bold text-xs text-white shadow">
              {(user?.displayName || user?.username || 'Sphere').slice(0, 1).toUpperCase()}
            </div>
            <div className="hidden md:flex flex-col text-left">
              <span className="text-xs font-semibold text-slate-200 leading-tight">
                {user?.displayName || user?.username || 'Alex Mercer'}
              </span>
              <span className="text-[10px] text-violet-400 font-mono leading-tight">
                {user?.sphereEmail || `user@${config?.domain || 'spheremail.net'}`}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {/* Sphere Account Popover Menu */}
          {showUserMenu && (
            <div className="absolute right-0 top-12 w-80 bg-[#12141f] border border-slate-700/80 rounded-xl p-4 shadow-2xl z-50 flex flex-col gap-3">
              {/* Profile Card */}
              <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center font-bold text-sm text-white shadow-lg">
                  {(user?.displayName || user?.username || 'Sphere').slice(0, 1).toUpperCase()}
                </div>
                <div className="flex flex-col overflow-hidden">
                  <span className="text-sm font-bold text-white truncate">
                    {user?.displayName || 'Alex Mercer'}
                  </span>
                  <span className="text-xs text-violet-300 font-mono truncate">
                    {user?.sphereEmail || `alex.mercer@${config?.domain || 'spheremail.net'}`}
                  </span>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-violet-950 text-violet-300 border border-violet-800/40 font-semibold uppercase">
                      {user?.tier || 'Founder'} Tier
                    </span>
                    <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" /> Zero-Knowledge
                    </span>
                  </div>
                </div>
              </div>

              {/* Secure Identity Hierarchy */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-3 flex flex-col gap-1.5 text-xs">
                <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                  Loopin Security Mapping
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Loopin Account ID:</span>
                  <code className="text-violet-300 font-mono">
                    {user?.loopinAccountId || 'lpn_acc_449210'}
                  </code>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Sphere Mailbox ID:</span>
                  <code className="text-indigo-300 font-mono">
                    {user?.mailboxId || 'mbx_sph_77491'}
                  </code>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Personal Digital Server:</span>
                  <span className="text-emerald-400 font-medium">Node 09 (Isolated)</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Data & Mail Storage:</span>
                  <span className="text-emerald-400 font-medium flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse"></span>
                    Persisted to Disk
                  </span>
                </div>
              </div>

              {/* Menu Actions */}
              <div className="flex flex-col gap-1 pt-1">
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    onOpenStorage();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-slate-300 hover:bg-slate-800 hover:text-white transition-colors text-left"
                >
                  <HardDrive className="w-4 h-4 text-violet-400" />
                  <span>Personal Digital Server & Storage</span>
                </button>

                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    onOpenSettings();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-slate-300 hover:bg-slate-800 hover:text-white transition-colors text-left"
                >
                  <User className="w-4 h-4 text-slate-400" />
                  <span>Account & Enclave Settings</span>
                </button>

                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    onOpenAuth();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-indigo-300 hover:bg-indigo-950/40 transition-colors text-left"
                >
                  <ExternalLink className="w-4 h-4 text-indigo-400" />
                  <span>Switch / Register New Sphere Mailbox</span>
                </button>

                <hr className="border-slate-800 my-1" />

                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    onLogout();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-rose-400 hover:bg-rose-950/30 transition-colors text-left font-medium"
                >
                  <LogOut className="w-4 h-4 text-rose-400" />
                  <span>Sign Out Session</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
