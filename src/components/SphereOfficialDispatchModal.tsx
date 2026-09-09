import React, { useState } from 'react';
import { Radio, ShieldAlert, CheckCircle2, Send, AlertTriangle, UserCheck, Shield } from 'lucide-react';
import { api } from '../services/api';

interface SphereOfficialDispatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string;
  onNoticeDispatched: () => void;
}

export const SphereOfficialDispatchModal: React.FC<SphereOfficialDispatchModalProps> = ({
  isOpen,
  onClose,
  userEmail,
  onNoticeDispatched,
}) => {
  const [category, setCategory] = useState<'security_alert' | 'login_alert' | 'verification' | 'moderation' | 'account_activity'>('security_alert');
  const [title, setTitle] = useState('Personal Digital Server Enclave Re-Keying Notice');
  const [content, setContent] = useState(
    'Loopin Sovereign Infrastructure completed an automated verification handshake on your isolated storage node. Your zero-knowledge client keys remain intact and active.'
  );
  const [isSending, setIsSending] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  if (!isOpen) return null;

  const presets = [
    {
      category: 'security_alert' as const,
      name: 'Security Alert',
      title: 'Personal Digital Server Enclave Re-Keying Notice',
      text: 'Loopin Sovereign Infrastructure completed an automated verification handshake on your isolated storage node. Your zero-knowledge client keys remain intact and active.',
    },
    {
      category: 'login_alert' as const,
      name: 'Suspicious Login Alert',
      title: 'Suspicious Gateway Probe Filtered & Blocked',
      text: 'Sphere Mail security enclaves successfully blocked an unauthorized relay probe from an untrusted gateway. No access to your mailbox was permitted.',
    },
    {
      category: 'verification' as const,
      name: 'Account Verification',
      title: 'Sphere Sovereign Identity Verification Approved',
      text: 'Your Sphere social profile is now officially linked with your Sphere Mailbox ID with full hardware attestation.',
    },
    {
      category: 'moderation' as const,
      name: 'Moderation Decision',
      title: 'Platform Transparency & Moderation Notice',
      text: 'A moderation check on community guidelines was completed for your linked Sphere social identity. Note: Admins cannot read your private Sphere Mail messages.',
    },
  ];

  const handleApplyPreset = (p: typeof presets[0]) => {
    setCategory(p.category);
    setTitle(p.title);
    setContent(p.text);
  };

  const handleDispatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setIsSending(true);
    setStatusMessage('');
    try {
      await api.dispatchOfficialNotice(userEmail, category, title, content);
      setStatusMessage('Official communication dispatched to your Sphere Mail inbox.');
      setTimeout(() => {
        onNoticeDispatched();
        onClose();
      }, 1000);
    } catch (err: any) {
      setStatusMessage(`Error: ${err.message}`);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-[#121420] border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 bg-[#0d0f17] border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Radio className="w-5 h-5 text-violet-400" />
            <div>
              <h3 className="text-base font-bold text-white">Sphere Platform Dispatch Simulator</h3>
              <p className="text-xs text-slate-400">Test official system communications dispatched to your mailbox</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white">✕</button>
        </div>

        {/* Content */}
        <form onSubmit={handleDispatch} className="p-5 flex flex-col gap-4 text-xs">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Select Official Communication Type
            </span>
            <div className="grid grid-cols-2 gap-2">
              {presets.map((p) => (
                <button
                  type="button"
                  key={p.name}
                  onClick={() => handleApplyPreset(p)}
                  className={`p-2 rounded-lg border text-left font-medium transition-all ${
                    category === p.category && title === p.title
                      ? 'bg-violet-950/80 text-violet-200 border-violet-500/60'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-850'
                  }`}
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-slate-400 font-semibold">Recipient Target Mailbox</label>
            <input
              type="text"
              disabled
              value={userEmail}
              className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 font-mono text-xs"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-slate-400 font-semibold">Subject Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 text-xs outline-none focus:border-violet-500"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-slate-400 font-semibold">Official Notice Content</label>
            <textarea
              rows={3}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 text-xs outline-none focus:border-violet-500 resize-none"
            />
          </div>

          {statusMessage && (
            <div className="p-2.5 rounded-lg bg-emerald-950/70 border border-emerald-800 text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{statusMessage}</span>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSending}
              className="px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold flex items-center gap-2 shadow-lg shadow-violet-600/30"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSending ? 'Dispatching...' : 'Dispatch to Inbox'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
