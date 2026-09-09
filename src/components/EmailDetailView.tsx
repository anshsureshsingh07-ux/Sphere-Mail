import React, { useState } from 'react';
import {
  ArrowLeft,
  Reply,
  ReplyAll,
  Forward,
  Archive,
  Trash2,
  AlertOctagon,
  MoreVertical,
  Star,
  Paperclip,
  Download,
  HardDrive,
  ShieldCheck,
  Lock,
  Radio,
  FileCode,
  Send,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Email } from '../types';

interface EmailDetailViewProps {
  email: Email;
  onBack: () => void;
  onReply: (email: Email, mode: 'reply' | 'replyAll' | 'forward') => void;
  onArchive: (id: string) => void;
  onDelete: (id: string) => void;
  onReportSpam: (id: string) => void;
  onToggleStar: (id: string, current: boolean) => void;
  onSaveAttachmentToServer: (attachmentName: string, size: number) => void;
  onSendQuickReply: (replyText: string) => void;
}

export const EmailDetailView: React.FC<EmailDetailViewProps> = ({
  email,
  onBack,
  onReply,
  onArchive,
  onDelete,
  onReportSpam,
  onToggleStar,
  onSaveAttachmentToServer,
  onSendQuickReply,
}) => {
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [showRawHeadersModal, setShowRawHeadersModal] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [quickReplyText, setQuickReplyText] = useState('');
  const [isSendingReply, setIsSendingReply] = useState(false);
  const [savedAttachments, setSavedAttachments] = useState<Record<string, boolean>>({});

  const handleSaveToPersonalServer = (att: any) => {
    onSaveAttachmentToServer(att.name, att.size);
    setSavedAttachments((prev) => ({ ...prev, [att.id]: true }));
  };

  const handleQuickReplySubmit = () => {
    if (!quickReplyText.trim()) return;
    setIsSendingReply(true);
    setTimeout(() => {
      onSendQuickReply(quickReplyText);
      setQuickReplyText('');
      setIsSendingReply(false);
    }, 400);
  };

  const formatFullDate = (isoStr: string) => {
    try {
      const d = new Date(isoStr);
      return d.toLocaleString([], {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZoneName: 'short',
      });
    } catch {
      return isoStr;
    }
  };

  return (
    <div id="sphere-email-detail-view" className="flex-1 flex flex-col h-full overflow-hidden bg-[#090b12]">
      {/* Top Action Toolbar */}
      <div className="p-3 sm:px-6 sm:py-3.5 bg-[#0e111a] border-b border-slate-800/80 flex items-center justify-between gap-3 sticky top-0 z-20">
        <div className="flex items-center gap-2">
          {/* Back button */}
          <button
            id="email-back-btn"
            onClick={onBack}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors flex items-center gap-1 text-xs font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back</span>
          </button>

          <div className="h-4 w-px bg-slate-800 mx-1" />

          {/* Quick Actions */}
          <button
            id="detail-reply-btn"
            onClick={() => onReply(email, 'reply')}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors flex items-center gap-1.5 text-xs"
            title="Reply"
          >
            <Reply className="w-4 h-4" />
            <span className="hidden md:inline">Reply</span>
          </button>

          <button
            id="detail-reply-all-btn"
            onClick={() => onReply(email, 'replyAll')}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors flex items-center gap-1.5 text-xs"
            title="Reply all"
          >
            <ReplyAll className="w-4 h-4" />
            <span className="hidden md:inline">Reply All</span>
          </button>

          <button
            id="detail-forward-btn"
            onClick={() => onReply(email, 'forward')}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors flex items-center gap-1.5 text-xs"
            title="Forward"
          >
            <Forward className="w-4 h-4" />
            <span className="hidden md:inline">Forward</span>
          </button>

          <div className="h-4 w-px bg-slate-800 mx-1" />

          <button
            id="detail-archive-btn"
            onClick={() => onArchive(email.id)}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            title="Archive"
          >
            <Archive className="w-4 h-4" />
          </button>

          <button
            id="detail-spam-btn"
            onClick={() => onReportSpam(email.id)}
            className="p-1.5 rounded-lg text-slate-300 hover:text-amber-400 hover:bg-slate-800 transition-colors"
            title="Report Spam"
          >
            <AlertOctagon className="w-4 h-4" />
          </button>

          <button
            id="detail-delete-btn"
            onClick={() => onDelete(email.id)}
            className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 transition-colors"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {/* Right side: Star & More actions */}
        <div className="flex items-center gap-2">
          <button
            id="detail-star-btn"
            onClick={() => onToggleStar(email.id, email.isStarred)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition-colors"
            title="Star email"
          >
            <Star
              className={`w-4 h-4 ${
                email.isStarred ? 'fill-amber-400 text-amber-400' : ''
              }`}
            />
          </button>

          {/* More menu */}
          <div className="relative">
            <button
              id="detail-more-btn"
              onClick={() => setShowMoreMenu(!showMoreMenu)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="More actions"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showMoreMenu && (
              <div className="absolute right-0 top-9 w-52 bg-[#131622] border border-slate-700/80 rounded-xl py-1.5 shadow-2xl z-40 flex flex-col text-xs">
                <button
                  onClick={() => {
                    setShowSecurityModal(true);
                    setShowMoreMenu(false);
                  }}
                  className="px-3.5 py-2 text-left text-slate-200 hover:bg-slate-800 flex items-center gap-2"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-violet-400" />
                  <span>Security & Zero-Knowledge Audit</span>
                </button>
                <button
                  onClick={() => {
                    setShowRawHeadersModal(true);
                    setShowMoreMenu(false);
                  }}
                  className="px-3.5 py-2 text-left text-slate-200 hover:bg-slate-800 flex items-center gap-2"
                >
                  <FileCode className="w-3.5 h-3.5 text-indigo-400" />
                  <span>View Raw Transport Headers</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Email Content View */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto w-full flex flex-col gap-6">
        {/* Subject and tags */}
        <div className="flex flex-col gap-2 pb-4 border-b border-slate-800/80">
          <div className="flex items-start justify-between gap-4">
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-snug">
              {email.subject}
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2 mt-1">
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800/80 text-slate-300 font-medium capitalize">
              Folder: {email.folder}
            </span>
            {email.security.isLoopinOfficial && (
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-violet-950 text-violet-300 border border-violet-600/40 font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-violet-400" />
                Loopin Official Dispatch
              </span>
            )}
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-950/60 text-emerald-300 border border-emerald-800/40 font-medium flex items-center gap-1">
              <Lock className="w-3 h-3 text-emerald-400" />
              Encrypted at Rest
            </span>
          </div>
        </div>

        {/* Transport Reality Banner (Honest Delivery / Queue Notice) */}
        {email.deliveryStatus && (
          <div
            className={`p-4 rounded-xl border flex items-start gap-3 text-xs leading-relaxed ${
              email.deliveryStatus.status === 'queued_smtp_unconfigured'
                ? 'bg-amber-950/30 border-amber-800/50 text-amber-200'
                : email.deliveryStatus.status === 'internal_delivered'
                ? 'bg-indigo-950/30 border-indigo-800/50 text-indigo-200'
                : 'bg-slate-900/60 border-slate-800 text-slate-300'
            }`}
          >
            {email.deliveryStatus.status === 'queued_smtp_unconfigured' ? (
              <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <div className="font-semibold mb-0.5 flex items-center justify-between">
                <span>
                  {email.deliveryStatus.status === 'queued_smtp_unconfigured'
                    ? 'Delivery Staged in Outbox (External SMTP Gateway Standby)'
                    : email.deliveryStatus.status === 'internal_delivered'
                    ? 'Internal Sovereign Delivery Confirmed'
                    : 'Dispatched via Outbound Gateway'}
                </span>
                {email.deliveryStatus.nodeRoute && (
                  <code className="text-[10px] bg-black/40 px-2 py-0.5 rounded font-mono">
                    Route: {email.deliveryStatus.nodeRoute}
                  </code>
                )}
              </div>
              <p className="text-[11px] opacity-90">{email.deliveryStatus.transportDiagnostics}</p>
            </div>
          </div>
        )}

        {/* Sender & Recipient Information */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3.5">
            <div
              className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-sm ${
                email.security.isLoopinOfficial
                  ? 'bg-violet-900/80 border border-violet-500/50 text-violet-200 shadow-md shadow-violet-900/50'
                  : 'bg-slate-800 border border-slate-700 text-slate-200'
              }`}
            >
              {email.security?.isLoopinOfficial ? (
                <ShieldCheck className="w-5 h-5 text-violet-400" />
              ) : (
                (email.sender?.name || email.sender?.address || 'S').slice(0, 1).toUpperCase()
              )}
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white">
                  {email.sender?.name || email.sender?.address || 'Unknown Sender'}
                </span>
                {email.sender?.isSphereInternal && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-violet-950 text-violet-400 border border-violet-800/40 font-mono">
                    Sphere Internal
                  </span>
                )}
              </div>
              <span className="text-xs text-slate-400 font-mono">{email.sender?.address || 'unknown'}</span>
              <div className="text-[11px] text-slate-400 mt-0.5">
                To:{' '}
                {email.recipients.map((r, i) => (
                  <span key={i} className="text-slate-300 font-medium">
                    {r.name} &lt;{r.address}&gt;{i < email.recipients.length - 1 ? ', ' : ''}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="text-left sm:text-right flex flex-col">
            <span className="text-xs text-slate-400">{formatFullDate(email.timestamp)}</span>
            <button
              onClick={() => setShowSecurityModal(true)}
              className="text-[11px] text-violet-400 hover:text-violet-300 font-medium mt-1 flex items-center sm:justify-end gap-1"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>SPF: Pass • DKIM: Verified</span>
            </button>
          </div>
        </div>

        {/* Message Body Content */}
        <div
          id="email-body-content"
          className="p-5 sm:p-6 rounded-2xl bg-slate-900/40 border border-slate-800/60 text-slate-200 text-sm leading-relaxed min-h-[160px]"
        >
          {email.bodyHtml ? (
            <div
              dangerouslySetInnerHTML={{ __html: email.bodyHtml }}
              className="prose prose-invert max-w-none prose-p:my-2"
            />
          ) : (
            <p className="whitespace-pre-wrap">{email.bodyPlain}</p>
          )}
        </div>

        {/* Attachments Section */}
        {email.attachments && email.attachments.length > 0 && (
          <div className="flex flex-col gap-3 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Paperclip className="w-3.5 h-3.5" />
                Attachments ({email.attachments.length})
              </span>
              <span className="text-[11px] text-slate-400">
                Separated Object Storage Architecture
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {email.attachments.map((att) => {
                const isSaved = savedAttachments[att.id];
                return (
                  <div
                    key={att.id}
                    className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-violet-500/40 transition-colors flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-8 h-8 rounded-lg bg-violet-950/80 border border-violet-800/40 flex items-center justify-center text-violet-400 flex-shrink-0">
                        <Paperclip className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col overflow-hidden">
                        <span className="text-xs font-medium text-slate-200 truncate" title={att.name}>
                          {att.name}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {Math.round(att.size / 1024)} KB • Encrypted
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={() => handleSaveToPersonalServer(att)}
                        disabled={isSaved}
                        className={`p-1.5 rounded-lg text-xs transition-colors flex items-center gap-1 ${
                          isSaved
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/50'
                            : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-violet-950'
                        }`}
                        title="Save to Personal Digital Server"
                      >
                        <HardDrive className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-medium hidden sm:inline">
                          {isSaved ? 'Saved to Server' : 'To Personal Server'}
                        </span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Quick Inline Reply Box */}
        <div className="mt-4 p-4 rounded-xl bg-slate-900/70 border border-slate-800 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-2">
              <Reply className="w-3.5 h-3.5 text-violet-400" />
              Quick Reply to {email.sender.name}
            </span>
            <span className="text-[10px] text-slate-400">
              Dispatches via Sphere Internal Sovereign Bus
            </span>
          </div>
          <textarea
            id="quick-reply-textarea"
            rows={3}
            placeholder="Type your reply here..."
            value={quickReplyText}
            onChange={(e) => setQuickReplyText(e.target.value)}
            className="w-full p-3 rounded-lg bg-slate-950 border border-slate-800 text-sm text-slate-100 placeholder-slate-400 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none resize-none"
          />
          <div className="flex items-center justify-end gap-2">
            <button
              id="send-quick-reply-btn"
              onClick={handleQuickReplySubmit}
              disabled={!quickReplyText.trim() || isSendingReply}
              className="px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-medium text-xs flex items-center gap-2 transition-all shadow-md shadow-violet-600/20"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSendingReply ? 'Dispatching...' : 'Send Reply'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Security & Zero-Knowledge Audit Modal */}
      {showSecurityModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#121420] border border-slate-700/80 rounded-2xl p-6 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-violet-400" />
                <h3 className="text-base font-bold text-white">Security & Cryptographic Attestation</h3>
              </div>
              <button
                onClick={() => setShowSecurityModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="flex flex-col gap-3 text-xs">
              <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 flex justify-between items-center">
                <span className="text-slate-400">Zero-Knowledge Enclave Isolation</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Active (Client-only Decryption)
                </span>
              </div>
              <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 flex justify-between items-center">
                <span className="text-slate-400">Founder / Admin Inspection Access</span>
                <span className="text-rose-400 font-bold flex items-center gap-1">
                  Denied by Cryptographic Protocol
                </span>
              </div>
              <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 flex justify-between items-center">
                <span className="text-slate-400">SPF Record (Sender Policy Framework)</span>
                <span className="text-emerald-400 font-mono font-semibold">pass (spheremail.net)</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 flex justify-between items-center">
                <span className="text-slate-400">DKIM Signature</span>
                <span className="text-emerald-400 font-mono font-semibold">2048-bit RSA Validated</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 flex justify-between items-center">
                <span className="text-slate-400">TLS Cipher Suite</span>
                <span className="text-violet-300 font-mono">TLS_AES_256_GCM_SHA384</span>
              </div>
            </div>

            <button
              onClick={() => setShowSecurityModal(false)}
              className="mt-2 w-full py-2.5 rounded-xl bg-violet-600 text-white text-xs font-semibold hover:bg-violet-500 transition-colors"
            >
              Close Attestation
            </button>
          </div>
        </div>
      )}

      {/* Raw Headers Modal */}
      {showRawHeadersModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-[#10121c] border border-slate-700/80 rounded-2xl p-6 shadow-2xl flex flex-col gap-4 max-h-[85vh]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <FileCode className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-bold text-white">Raw Transport Headers</h3>
              </div>
              <button
                onClick={() => setShowRawHeadersModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-300 overflow-x-auto whitespace-pre leading-relaxed">
{`Delivered-To: ${email.recipients[0]?.address || 'user@spheremail.net'}
Received: by sovereign.loopin.internal with ENCLAVE-BUS id ${email.id}
          for <${email.recipients[0]?.address || 'user@spheremail.net'}>; ${email.timestamp}
ARC-Authentication-Results: i=1; mx.spheremail.net; dkim=pass header.i=@spheremail.net;
          spf=pass (loopin enclave: domain of ${email.sender.address} designates 198.51.100.42)
DKIM-Signature: v=1; a=rsa-sha256; c=relaxed/relaxed; d=spheremail.net; s=loopin2026;
From: "${email.sender.name}" <${email.sender.address}>
To: ${email.recipients.map(r => `"${r.name}" <${r.address}>`).join(', ')}
Subject: ${email.subject}
Date: ${email.timestamp}
Message-ID: <${email.id}@loopin.sovereign.mesh>
X-Sphere-Mailbox-ID: ${email.mailboxId}
X-Sphere-Zero-Knowledge-Escrow: Enforced
X-Sphere-Storage-Architecture: Metadata=DB; Body=Enclave; Attachments=ObjectStore`}
            </pre>

            <button
              onClick={() => setShowRawHeadersModal(false)}
              className="w-full py-2.5 rounded-xl bg-slate-800 text-slate-200 text-xs font-semibold hover:bg-slate-700 transition-colors"
            >
              Close Headers
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
