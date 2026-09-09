import React from 'react';
import {
  Inbox,
  Star,
  Send,
  FileText,
  Archive,
  AlertOctagon,
  Trash2,
  Folder,
  Users,
  HardDrive,
  Settings,
  HelpCircle,
  Plus,
  ShieldCheck,
  Server,
  Radio,
  ChevronRight
} from 'lucide-react';
import { SphereBrandLogo } from './SphereBrandLogo';

interface LeftSidebarProps {
  currentFolder: string;
  onSelectFolder: (folder: string) => void;
  onOpenCompose: () => void;
  onOpenStorage: () => void;
  onOpenContacts: () => void;
  onOpenSettings: () => void;
  onOpenHelp: () => void;
  onOpenAdmin: () => void;
  onOpenDispatch: () => void;
  onOpenInternalApi?: () => void;
  unreadCounts: { inbox: number; starred: number; spam: number };
  activeTag: string;
  onSelectTag: (tag: string) => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const LeftSidebar: React.FC<LeftSidebarProps> = ({
  currentFolder,
  onSelectFolder,
  onOpenCompose,
  onOpenStorage,
  onOpenContacts,
  onOpenSettings,
  onOpenHelp,
  onOpenAdmin,
  onOpenDispatch,
  onOpenInternalApi,
  unreadCounts,
  activeTag,
  onSelectTag,
  isMobileOpen,
  onCloseMobile,
}) => {
  const mainNav = [
    { id: 'inbox', label: 'Inbox', icon: Inbox, count: unreadCounts.inbox },
    { id: 'starred', label: 'Starred', icon: Star, count: unreadCounts.starred },
    { id: 'sent', label: 'Sent', icon: Send },
    { id: 'drafts', label: 'Drafts', icon: FileText },
    { id: 'archive', label: 'Archive', icon: Archive },
    { id: 'spam', label: 'Spam', icon: AlertOctagon, count: unreadCounts.spam },
    { id: 'trash', label: 'Trash', icon: Trash2 },
  ];

  const customFolders = [
    { id: 'Official', label: 'Sphere Platform', isOfficial: true },
    { id: 'Architecture', label: 'Architecture' },
    { id: 'Vault', label: 'Encrypted Vault' },
  ];

  const handleNavClick = (folderId: string) => {
    onSelectFolder(folderId);
    onSelectTag('');
    onCloseMobile();
  };

  const handleFolderTagClick = (tagId: string) => {
    onSelectFolder('all');
    onSelectTag(tagId);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        id="sphere-left-sidebar"
        className={`fixed lg:static top-0 left-0 bottom-0 z-50 w-64 md:w-72 bg-[#0d0f17] border-r border-slate-800/70 flex flex-col justify-between transition-transform duration-300 ease-in-out ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Top Header & Compose */}
        <div className="p-4 sm:p-5 flex flex-col gap-5 overflow-y-auto">
          {/* Logo */}
          <div className="flex items-center justify-between">
            <SphereBrandLogo showTagline={true} />
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              aria-label="Close sidebar"
            >
              ✕
            </button>
          </div>

          {/* Primary Action: Compose */}
          <button
            id="compose-email-button"
            onClick={() => {
              onOpenCompose();
              onCloseMobile();
            }}
            className="w-full flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-violet-700 text-white font-semibold text-sm shadow-lg shadow-violet-600/25 hover:shadow-violet-600/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 border border-violet-400/30 group"
          >
            <Plus className="w-4 h-4 text-white group-hover:rotate-90 transition-transform duration-200" />
            <span>Compose</span>
          </button>

          {/* Main Folders Navigation */}
          <nav className="flex flex-col gap-1" aria-label="Mailbox Folders">
            {mainNav.map((item) => {
              const Icon = item.icon;
              const isActive = currentFolder === item.id && !activeTag;
              return (
                <button
                  key={item.id}
                  id={`nav-${item.id}`}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-violet-950/60 text-violet-300 border border-violet-500/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-4 h-4 ${
                        isActive ? 'text-violet-400' : 'text-slate-400'
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>
                  {item.count && item.count > 0 ? (
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                        isActive
                          ? 'bg-violet-600 text-white'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {item.count}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </nav>

          <hr className="border-slate-800/80 my-1" />

          {/* Folders & Services Section */}
          <div className="flex flex-col gap-1">
            <div className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Folders & Labels
            </div>
            {customFolders.map((cf) => {
              const isTagActive = activeTag === cf.id;
              return (
                <button
                  key={cf.id}
                  id={`folder-tag-${cf.id}`}
                  onClick={() => handleFolderTagClick(cf.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isTagActive
                      ? 'bg-violet-950/60 text-violet-300 border border-violet-500/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Folder
                      className={`w-4 h-4 ${
                        cf.isOfficial ? 'text-violet-400' : 'text-indigo-400'
                      }`}
                    />
                    <span>{cf.label}</span>
                  </div>
                  {cf.isOfficial && (
                    <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex flex-col gap-1 mt-1">
            <div className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Personal Enclave
            </div>
            {/* Contacts */}
            <button
              id="sidebar-contacts-btn"
              onClick={() => {
                onOpenContacts();
                onCloseMobile();
              }}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/50 transition-colors"
            >
              <Users className="w-4 h-4 text-slate-400" />
              <span>Contacts</span>
            </button>

            {/* Personal Digital Server & Storage */}
            <button
              id="sidebar-storage-btn"
              onClick={() => {
                onOpenStorage();
                onCloseMobile();
              }}
              className="w-full text-left p-3 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-violet-500/40 transition-all group"
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2 text-xs font-semibold text-violet-300">
                  <HardDrive className="w-3.5 h-3.5 text-violet-400" />
                  <span>Personal Server</span>
                </div>
                <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Online
                </span>
              </div>
              <div className="text-[11px] text-slate-400 mb-2">
                24.3 MB / 50 GB baseline
              </div>
              {/* Storage progress bar */}
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-violet-500 to-indigo-500 h-full w-[8%]" />
              </div>
              <div className="mt-2 text-[10px] text-slate-400 flex items-center justify-between">
                <span>Expandable allocation</span>
                <ChevronRight className="w-3 h-3 text-slate-500 group-hover:text-violet-400 transition-colors" />
              </div>
            </button>
          </div>
        </div>

        {/* Bottom Preferences & Founder Enclave */}
        <div className="p-4 border-t border-slate-800/80 bg-[#090b10] flex flex-col gap-1">
          <button
            id="sidebar-settings-btn"
            onClick={() => {
              onOpenSettings();
              onCloseMobile();
            }}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-slate-800/50 transition-colors"
          >
            <Settings className="w-4 h-4 text-slate-400" />
            <span>Settings</span>
          </button>

          <button
            id="sidebar-help-btn"
            onClick={() => {
              onOpenHelp();
              onCloseMobile();
            }}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-slate-800/50 transition-colors"
          >
            <HelpCircle className="w-4 h-4 text-slate-400" />
            <span>Help & Support</span>
          </button>

          {/* Official Sphere Dispatch Simulator */}
          <button
            id="sidebar-dispatch-btn"
            onClick={() => {
              onOpenDispatch();
              onCloseMobile();
            }}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs text-indigo-300/80 hover:text-indigo-200 hover:bg-indigo-950/40 transition-colors"
          >
            <Radio className="w-3.5 h-3.5 text-indigo-400" />
            <span>Sphere Dispatch Hub</span>
          </button>

          {/* Loopin Internal API Enclave & Architecture */}
          <button
            id="sidebar-internal-api-btn"
            onClick={() => {
              onOpenInternalApi?.();
              onCloseMobile();
            }}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs text-purple-300 hover:text-purple-100 hover:bg-purple-950/40 transition-colors border border-purple-500/20 bg-purple-950/10"
          >
            <div className="flex items-center gap-2">
              <Server className="w-3.5 h-3.5 text-purple-400" />
              <span className="font-semibold">Loopin Internal API</span>
            </div>
            <span className="text-[9px] uppercase font-mono px-1.5 py-0.5 rounded bg-purple-900/60 text-purple-200 border border-purple-700/50">
              mTLS
            </span>
          </button>

          {/* Admin / Founder Enclave */}
          <button
            id="sidebar-admin-btn"
            onClick={() => {
              onOpenAdmin();
              onCloseMobile();
            }}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs text-slate-400 hover:text-violet-300 hover:bg-violet-950/20 transition-colors"
          >
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
              <span>Admin Enclave</span>
            </div>
            <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
              Zero-Knowledge
            </span>
          </button>
        </div>
      </aside>
    </>
  );
};
