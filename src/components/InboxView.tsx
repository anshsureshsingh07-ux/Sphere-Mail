import React, { useState } from 'react';
import {
  Star,
  Paperclip,
  CheckSquare,
  Square,
  Mail,
  MailOpen,
  Archive,
  Trash2,
  AlertOctagon,
  FolderInput,
  ShieldCheck,
  RefreshCw,
  Clock,
  Send,
  AlertCircle
} from 'lucide-react';
import { Email } from '../types';

interface InboxViewProps {
  emails: Email[];
  selectedEmailId: string | null;
  onSelectEmail: (id: string) => void;
  folderTitle: string;
  onToggleStar: (id: string, currentStarred: boolean) => void;
  onBulkAction: (ids: string[], action: any, targetFolder?: string) => void;
  onRefresh: () => void;
  isLoading: boolean;
  filterOfficialOnly: boolean;
  onToggleFilterOfficial: () => void;
}

export const InboxView: React.FC<InboxViewProps> = ({
  emails,
  selectedEmailId,
  onSelectEmail,
  folderTitle,
  onToggleStar,
  onBulkAction,
  onRefresh,
  isLoading,
  filterOfficialOnly,
  onToggleFilterOfficial,
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [moveDropdownOpen, setMoveDropdownOpen] = useState(false);

  const allSelected = emails.length > 0 && selectedIds.length === emails.length;

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(emails.map((e) => e.id));
    }
  };

  const toggleSelectOne = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleBulk = (action: any, targetFolder?: string) => {
    if (selectedIds.length === 0) return;
    onBulkAction(selectedIds, action, targetFolder);
    setSelectedIds([]);
    setMoveDropdownOpen(false);
  };

  const formatEmailDate = (timestampStr: string) => {
    try {
      const date = new Date(timestampStr);
      const now = new Date();
      const isToday =
        date.getDate() === now.getDate() &&
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear();

      if (isToday) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } catch {
      return timestampStr;
    }
  };

  return (
    <div id="sphere-inbox-view" className="flex-1 flex flex-col h-full overflow-hidden bg-[#0a0c13]">
      {/* Inbox Action Toolbar */}
      <div className="p-3 sm:px-5 sm:py-3.5 bg-[#0e111a] border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3 sticky top-0 z-20">
        {/* Left: Selection & Bulk Actions */}
        <div className="flex items-center gap-2">
          {/* Select All Checkbox */}
          <button
            id="inbox-select-all-btn"
            onClick={toggleSelectAll}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors flex items-center gap-1.5"
            title={allSelected ? 'Deselect all' : 'Select all'}
          >
            {allSelected ? (
              <CheckSquare className="w-4 h-4 text-violet-400" />
            ) : (
              <Square className="w-4 h-4" />
            )}
          </button>

          {/* Refresh */}
          <button
            id="inbox-refresh-btn"
            onClick={onRefresh}
            className={`p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ${
              isLoading ? 'animate-spin text-violet-400' : ''
            }`}
            title="Refresh mailbox"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {/* Bulk Action Buttons (Visible when items selected) */}
          {selectedIds.length > 0 && (
            <div className="flex items-center gap-1 pl-2 border-l border-slate-800 animate-in fade-in duration-150">
              <button
                id="bulk-read-btn"
                onClick={() => handleBulk('mark_read')}
                className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                title="Mark as read"
              >
                <MailOpen className="w-4 h-4" />
              </button>

              <button
                id="bulk-unread-btn"
                onClick={() => handleBulk('mark_unread')}
                className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                title="Mark as unread"
              >
                <Mail className="w-4 h-4" />
              </button>

              <button
                id="bulk-star-btn"
                onClick={() => handleBulk('star')}
                className="p-1.5 rounded-lg text-slate-300 hover:text-amber-400 hover:bg-slate-800 transition-colors"
                title="Star selected"
              >
                <Star className="w-4 h-4" />
              </button>

              <button
                id="bulk-archive-btn"
                onClick={() => handleBulk('archive')}
                className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                title="Archive selected"
              >
                <Archive className="w-4 h-4" />
              </button>

              <button
                id="bulk-spam-btn"
                onClick={() => handleBulk('spam')}
                className="p-1.5 rounded-lg text-slate-300 hover:text-amber-400 hover:bg-slate-800 transition-colors"
                title="Report as spam"
              >
                <AlertOctagon className="w-4 h-4" />
              </button>

              {/* Move to folder dropdown */}
              <div className="relative">
                <button
                  id="bulk-move-btn"
                  onClick={() => setMoveDropdownOpen(!moveDropdownOpen)}
                  className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                  title="Move to folder"
                >
                  <FolderInput className="w-4 h-4" />
                </button>

                {moveDropdownOpen && (
                  <div className="absolute left-0 top-9 w-40 bg-[#141724] border border-slate-700 rounded-xl py-1 shadow-2xl z-30 flex flex-col text-xs">
                    <button
                      onClick={() => handleBulk('move', 'inbox')}
                      className="px-3 py-1.5 text-left text-slate-300 hover:bg-slate-800 hover:text-white"
                    >
                      Inbox
                    </button>
                    <button
                      onClick={() => handleBulk('move', 'archive')}
                      className="px-3 py-1.5 text-left text-slate-300 hover:bg-slate-800 hover:text-white"
                    >
                      Archive
                    </button>
                    <button
                      onClick={() => handleBulk('move', 'trash')}
                      className="px-3 py-1.5 text-left text-rose-300 hover:bg-rose-950/40"
                    >
                      Trash
                    </button>
                  </div>
                )}
              </div>

              <button
                id="bulk-delete-btn"
                onClick={() => handleBulk('trash')}
                className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 transition-colors"
                title="Move to trash"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <span className="text-xs text-slate-400 font-medium pl-1">
                {selectedIds.length} selected
              </span>
            </div>
          )}
        </div>

        {/* Right: Folder Name & Filter Pills */}
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleFilterOfficial}
            className={`px-2.5 py-1 rounded-full text-xs font-medium border flex items-center gap-1.5 transition-colors ${
              filterOfficialOnly
                ? 'bg-violet-950/80 text-violet-300 border-violet-500/50'
                : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-slate-300'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-violet-400" />
            <span>Loopin Official Only</span>
          </button>

          <span className="text-xs font-semibold text-slate-400 capitalize px-2">
            {folderTitle} ({emails.length})
          </span>
        </div>
      </div>

      {/* Mail List Scroll Area */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-800/50">
        {emails.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center p-8 text-center">
            <div className="w-14 h-14 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-center mb-3 text-slate-500">
              <Mail className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-slate-200 mb-1">
              No emails in {folderTitle}
            </h3>
            <p className="text-xs text-slate-400 max-w-sm">
              Your messages in this folder will appear here. All incoming Sphere Mail is isolated in your personal enclave.
            </p>
          </div>
        ) : (
          emails.map((email) => {
            const isSelected = selectedIds.includes(email.id);
            const isRowActive = selectedEmailId === email.id;

            return (
              <div
                key={email.id}
                id={`email-row-${email.id}`}
                onClick={() => onSelectEmail(email.id)}
                className={`group px-4 py-3 sm:py-3.5 flex items-center gap-3 cursor-pointer select-none transition-colors duration-150 ${
                  isRowActive
                    ? 'bg-violet-950/40 border-l-4 border-l-violet-500'
                    : email.isRead
                    ? 'bg-[#0a0c13] hover:bg-[#10131d]'
                    : 'bg-[#0e111a] hover:bg-[#141824] font-semibold'
                }`}
              >
                {/* Selection Checkbox */}
                <button
                  onClick={(e) => toggleSelectOne(email.id, e)}
                  className="text-slate-500 hover:text-slate-300 p-0.5 rounded transition-colors"
                  aria-label="Select message"
                >
                  {isSelected ? (
                    <CheckSquare className="w-4 h-4 text-violet-400" />
                  ) : (
                    <Square className="w-4 h-4 opacity-50 group-hover:opacity-100" />
                  )}
                </button>

                {/* Star Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleStar(email.id, email.isStarred);
                  }}
                  className="text-slate-500 hover:text-amber-400 p-0.5 rounded transition-colors"
                  aria-label="Star message"
                >
                  <Star
                    className={`w-4 h-4 ${
                      email.isStarred
                        ? 'fill-amber-400 text-amber-400'
                        : 'opacity-50 group-hover:opacity-100'
                    }`}
                  />
                </button>

                {/* Unread Indicator Dot */}
                <div className="w-2 flex-shrink-0 flex items-center justify-center">
                  {!email.isRead && (
                    <span className="w-2 h-2 rounded-full bg-violet-400 shadow-[0_0_6px_#a78bfa]" />
                  )}
                </div>

                {/* Sender Avatar & Name */}
                <div className="w-36 sm:w-44 flex-shrink-0 flex items-center gap-2 overflow-hidden">
                  <div
                    className={`w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center text-xs font-bold ${
                      email.security.isLoopinOfficial
                        ? 'bg-violet-900/60 border border-violet-400/40 text-violet-300'
                        : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {email.security?.isLoopinOfficial ? (
                      <ShieldCheck className="w-3.5 h-3.5 text-violet-400" />
                    ) : (
                      (email.sender?.name || email.sender?.address || 'S').slice(0, 1).toUpperCase()
                    )}
                  </div>
                  <div className="flex flex-col overflow-hidden">
                    <span
                      className={`text-xs truncate ${
                        email.isRead ? 'text-slate-300 font-normal' : 'text-slate-100 font-bold'
                      }`}
                    >
                      {email.sender?.name || email.sender?.address || 'Unknown Sender'}
                    </span>
                    {email.security.isLoopinOfficial && (
                      <span className="text-[9px] uppercase font-extrabold text-violet-400 tracking-wider">
                        Sphere Official
                      </span>
                    )}
                  </div>
                </div>

                {/* Subject & Preview */}
                <div className="flex-1 min-w-0 flex items-baseline gap-2 overflow-hidden">
                  <span
                    className={`text-xs truncate ${
                      email.isRead ? 'text-slate-200 font-normal' : 'text-white font-bold'
                    }`}
                  >
                    {email.subject}
                  </span>
                  <span className="text-slate-500 font-normal text-xs truncate hidden sm:inline">
                    — {email.preview}
                  </span>
                </div>

                {/* Status Badges & Transport diagnostics */}
                {email.deliveryStatus?.status === 'queued_smtp_unconfigured' && (
                  <span
                    className="hidden lg:flex items-center gap-1 text-[10px] px-2 py-0.5 rounded bg-amber-950/60 text-amber-300 border border-amber-800/40 font-medium"
                    title={email.deliveryStatus.transportDiagnostics}
                  >
                    <AlertCircle className="w-3 h-3" />
                    Queued (No SMTP)
                  </span>
                )}

                {/* Attachments Indicator */}
                {email.attachments && email.attachments.length > 0 && (
                  <div
                    className="flex-shrink-0 flex items-center gap-1 text-[11px] text-slate-400 bg-slate-900/80 px-2 py-0.5 rounded border border-slate-800"
                    title={`${email.attachments.length} attachment(s)`}
                  >
                    <Paperclip className="w-3 h-3 text-slate-400" />
                    <span className="hidden md:inline">{email.attachments.length}</span>
                  </div>
                )}

                {/* Date / Time */}
                <div className="w-16 sm:w-20 flex-shrink-0 text-right text-[11px] text-slate-400 whitespace-nowrap">
                  {formatEmailDate(email.timestamp)}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
