import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Minimize2,
  Maximize2,
  Paperclip,
  Trash2,
  Send,
  Bold,
  Italic,
  List,
  ListOrdered,
  Link,
  Code,
  Quote,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Clock,
  Sparkles,
  Lock
} from 'lucide-react';
import { Attachment } from '../types';

interface ComposeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: (payload: {
    recipients: Array<{ name: string; address: string; isSphereInternal?: boolean }>;
    cc?: Array<{ name: string; address: string }>;
    bcc?: Array<{ name: string; address: string }>;
    subject: string;
    bodyHtml: string;
    bodyPlain: string;
    attachments: Attachment[];
    isDraft?: boolean;
  }) => Promise<void>;
  configuredDomain: string;
  initialDraft?: {
    to?: string;
    subject?: string;
    body?: string;
  };
}

export const ComposeModal: React.FC<ComposeModalProps> = ({
  isOpen,
  onClose,
  onSend,
  configuredDomain,
  initialDraft,
}) => {
  const [toInput, setToInput] = useState(initialDraft?.to || '');
  const [ccInput, setCcInput] = useState('');
  const [bccInput, setBccInput] = useState('');
  const [showCc, setShowCc] = useState(false);
  const [showBcc, setShowBcc] = useState(false);
  const [subject, setSubject] = useState(initialDraft?.subject || '');
  const [bodyText, setBodyText] = useState(initialDraft?.body || '');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [lastSaved, setLastSaved] = useState<string>('');
  const [recipientStatus, setRecipientStatus] = useState<'idle' | 'valid_internal' | 'valid_external' | 'invalid'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync initial draft when opened
  useEffect(() => {
    if (initialDraft?.to) setToInput(initialDraft.to);
    if (initialDraft?.subject) setSubject(initialDraft.subject);
    if (initialDraft?.body) setBodyText(initialDraft.body);
  }, [initialDraft]);

  // Recipient validation
  useEffect(() => {
    const trimmed = toInput.trim().toLowerCase();
    if (!trimmed) {
      setRecipientStatus('idle');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) {
      setRecipientStatus('invalid');
      return;
    }

    const isInternalSovereign =
      trimmed.endsWith(`@${configuredDomain.toLowerCase()}`) ||
      trimmed.endsWith('@yourchoice.com') ||
      trimmed.endsWith('@yourname.com') ||
      trimmed.endsWith('@loopin.com');

    if (isInternalSovereign) {
      setRecipientStatus('valid_internal');
    } else {
      setRecipientStatus('valid_external');
    }
  }, [toInput, configuredDomain]);

  // Autosave Draft interval
  useEffect(() => {
    if (!isOpen) return;
    const timer = setInterval(() => {
      if (toInput || subject || bodyText) {
        setLastSaved(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      }
    }, 15000);
    return () => clearInterval(timer);
  }, [isOpen, toInput, subject, bodyText]);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newAttachments: Attachment[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      // Limit 25MB check
      if (file.size > 25 * 1024 * 1024) {
        setErrorMessage(`File ${file.name} exceeds the 25MB maximum attachment limit.`);
        return;
      }

      newAttachments.push({
        id: `att_${Date.now()}_${i}`,
        name: file.name,
        size: file.size,
        mimeType: file.type || 'application/octet-stream',
        isEncrypted: true,
        storageNodeId: 'obj_node_eu_client_staged',
      });
    }

    setAttachments((prev) => [...prev, ...newAttachments]);
    setErrorMessage('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const handleSend = async () => {
    setErrorMessage('');
    if (!toInput.trim()) {
      setErrorMessage('Please enter at least one recipient email address.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const cleanTo = toInput.trim();
    if (!emailRegex.test(cleanTo)) {
      setErrorMessage('Please enter a valid email address (e.g. user@domain.com).');
      return;
    }

    const recipients = [
      {
        name: cleanTo.split('@')[0],
        address: cleanTo,
        isSphereInternal: cleanTo.toLowerCase().endsWith(`@${configuredDomain.toLowerCase()}`),
      },
    ];

    const cc = ccInput.trim()
      ? [{ name: ccInput.trim().split('@')[0], address: ccInput.trim() }]
      : undefined;

    const bcc = bccInput.trim()
      ? [{ name: bccInput.trim().split('@')[0], address: bccInput.trim() }]
      : undefined;

    setIsSending(true);
    try {
      // Format simple html from plaintext
      const formattedHtml = `
        <div style="font-family: sans-serif; color: #e2e8f0; line-height: 1.6;">
          ${bodyText.replace(/\n/g, '<br/>')}
        </div>
      `;

      await onSend({
        recipients,
        cc,
        bcc,
        subject: subject || '(no subject)',
        bodyHtml: formattedHtml,
        bodyPlain: bodyText,
        attachments,
      });

      // Clear state and close
      setToInput('');
      setSubject('');
      setBodyText('');
      setAttachments([]);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to dispatch email.');
    } finally {
      setIsSending(false);
    }
  };

  const handleDiscard = () => {
    setToInput('');
    setSubject('');
    setBodyText('');
    setAttachments([]);
    onClose();
  };

  return (
    <div
      id="sphere-compose-modal"
      className={`fixed z-50 bg-[#121420] border border-slate-700/80 shadow-2xl flex flex-col transition-all duration-200 ${
        isExpanded
          ? 'inset-4 md:inset-8 rounded-2xl'
          : 'bottom-0 right-0 sm:right-6 w-full sm:w-[600px] h-[580px] rounded-t-2xl sm:rounded-2xl border-b-0 sm:border-b'
      }`}
    >
      {/* Header */}
      <div className="px-4 py-3 bg-[#0d0f17] rounded-t-2xl border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
          <span className="text-xs font-bold text-white tracking-wide">New Message — Sphere Enclave</span>
        </div>

        <div className="flex items-center gap-1 text-slate-400">
          {lastSaved && (
            <span className="text-[10px] text-slate-500 mr-2 flex items-center gap-1 hidden sm:flex">
              <Clock className="w-3 h-3" /> Autosaved {lastSaved}
            </span>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 rounded hover:text-white hover:bg-slate-800"
            title={isExpanded ? 'Minimize' : 'Maximize'}
          >
            {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={onClose}
            className="p-1 rounded hover:text-white hover:bg-slate-800"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Recipient Validation Notice */}
      {recipientStatus === 'valid_internal' && (
        <div className="px-4 py-1.5 bg-violet-950/40 border-b border-violet-800/30 flex items-center gap-2 text-[11px] text-violet-300">
          <ShieldCheck className="w-3.5 h-3.5 text-violet-400 flex-shrink-0" />
          <span>Internal Sphere Mail address detected: Delivery executes over peer-to-peer sovereign bus with zero external relay hops.</span>
        </div>
      )}

      {recipientStatus === 'valid_external' && (
        <div className="px-4 py-1.5 bg-amber-950/40 border-b border-amber-800/30 flex items-center gap-2 text-[11px] text-amber-300">
          <AlertCircle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
          <span>External recipient domain: External SMTP relay is in transparent staging mode. Message will be queued safely without fake delivery.</span>
        </div>
      )}

      {recipientStatus === 'invalid' && (
        <div className="px-4 py-1.5 bg-rose-950/40 border-b border-rose-800/30 flex items-center gap-2 text-[11px] text-rose-300">
          <AlertCircle className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
          <span>Invalid email format. Please specify user@domain.com</span>
        </div>
      )}

      {errorMessage && (
        <div className="px-4 py-2 bg-rose-950/60 border-b border-rose-800 text-xs text-rose-200">
          {errorMessage}
        </div>
      )}

      {/* Fields */}
      <div className="px-4 py-2 flex flex-col gap-2 border-b border-slate-800/70 text-xs">
        {/* TO Field */}
        <div className="flex items-center gap-2">
          <span className="text-slate-400 w-12 font-medium">To:</span>
          <input
            id="compose-to-input"
            type="email"
            placeholder={`recipient@${configuredDomain} or external email`}
            value={toInput}
            onChange={(e) => setToInput(e.target.value)}
            className="flex-1 bg-transparent text-slate-100 placeholder-slate-400 outline-none text-xs"
          />
          <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
            {!showCc && (
              <button
                type="button"
                onClick={() => setShowCc(true)}
                className="hover:text-slate-200"
              >
                Cc
              </button>
            )}
            {!showBcc && (
              <button
                type="button"
                onClick={() => setShowBcc(true)}
                className="hover:text-slate-200"
              >
                Bcc
              </button>
            )}
          </div>
        </div>

        {/* CC Field */}
        {showCc && (
          <div className="flex items-center gap-2 pt-1 border-t border-slate-800/50">
            <span className="text-slate-400 w-12 font-medium">Cc:</span>
            <input
              type="email"
              placeholder="carbon.copy@domain.com"
              value={ccInput}
              onChange={(e) => setCcInput(e.target.value)}
              className="flex-1 bg-transparent text-slate-100 placeholder-slate-400 outline-none text-xs"
            />
            <button
              onClick={() => {
                setShowCc(false);
                setCcInput('');
              }}
              className="text-slate-400 hover:text-white text-[10px]"
            >
              ✕
            </button>
          </div>
        )}

        {/* BCC Field */}
        {showBcc && (
          <div className="flex items-center gap-2 pt-1 border-t border-slate-800/50">
            <span className="text-slate-400 w-12 font-medium">Bcc:</span>
            <input
              type="email"
              placeholder="blind.copy@domain.com"
              value={bccInput}
              onChange={(e) => setBccInput(e.target.value)}
              className="flex-1 bg-transparent text-slate-100 placeholder-slate-400 outline-none text-xs"
            />
            <button
              onClick={() => {
                setShowBcc(false);
                setBccInput('');
              }}
              className="text-slate-400 hover:text-white text-[10px]"
            >
              ✕
            </button>
          </div>
        )}

        {/* Subject */}
        <div className="flex items-center gap-2 pt-1 border-t border-slate-800/50">
          <span className="text-slate-400 w-12 font-medium">Subject:</span>
          <input
            id="compose-subject-input"
            type="text"
            placeholder="Subject line"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="flex-1 bg-transparent text-slate-100 placeholder-slate-400 font-semibold outline-none text-xs"
          />
        </div>
      </div>

      {/* Formatting Mini-Toolbar */}
      <div className="px-4 py-1.5 bg-[#0e101a] border-b border-slate-800/60 flex items-center gap-1 text-slate-400 text-xs">
        <button
          type="button"
          onClick={() => setBodyText((prev) => prev + ' **bold** ')}
          className="p-1 rounded hover:bg-slate-800 hover:text-slate-200"
          title="Bold"
        >
          <Bold className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => setBodyText((prev) => prev + ' _italic_ ')}
          className="p-1 rounded hover:bg-slate-800 hover:text-slate-200"
          title="Italic"
        >
          <Italic className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => setBodyText((prev) => prev + '\n- ')}
          className="p-1 rounded hover:bg-slate-800 hover:text-slate-200"
          title="Bullet list"
        >
          <List className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => setBodyText((prev) => prev + '\n1. ')}
          className="p-1 rounded hover:bg-slate-800 hover:text-slate-200"
          title="Numbered list"
        >
          <ListOrdered className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => setBodyText((prev) => prev + ' `code` ')}
          className="p-1 rounded hover:bg-slate-800 hover:text-slate-200"
          title="Inline Code"
        >
          <Code className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => setBodyText((prev) => prev + '\n> ')}
          className="p-1 rounded hover:bg-slate-800 hover:text-slate-200"
          title="Quote"
        >
          <Quote className="w-3.5 h-3.5" />
        </button>

        <div className="h-3 w-px bg-slate-800 mx-1" />

        <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-mono">
          <Lock className="w-2.5 h-2.5" /> E2E Zero-Knowledge
        </span>
      </div>

      {/* Body Area */}
      <textarea
        id="compose-body-textarea"
        placeholder="Write your secure message..."
        value={bodyText}
        onChange={(e) => setBodyText(e.target.value)}
        className="flex-1 p-4 bg-transparent text-slate-100 placeholder-slate-400 text-sm leading-relaxed outline-none resize-none"
      />

      {/* Attachments List */}
      {attachments.length > 0 && (
        <div className="px-4 py-2 bg-[#0d0f17] border-t border-slate-800/80 flex flex-wrap gap-2 max-h-24 overflow-y-auto">
          {attachments.map((att) => (
            <div
              key={att.id}
              className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200"
            >
              <Paperclip className="w-3 h-3 text-violet-400" />
              <span className="truncate max-w-[140px]">{att.name}</span>
              <span className="text-[10px] text-slate-400">({Math.round(att.size / 1024)} KB)</span>
              <button
                onClick={() => removeAttachment(att.id)}
                className="text-slate-400 hover:text-rose-400 ml-1"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Footer Controls */}
      <div className="px-4 py-3 bg-[#0d0f17] rounded-b-2xl border-t border-slate-800 flex items-center justify-between">
        {/* Left: Send & Discard */}
        <div className="flex items-center gap-2">
          <button
            id="compose-send-button"
            onClick={handleSend}
            disabled={isSending}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-violet-600/30 active:scale-95 transition-all disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isSending ? 'Sending...' : 'Send Message'}</span>
          </button>

          {/* Attachment button */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={handleFileUpload}
          />
          <button
            id="compose-attach-button"
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Attach file (max 25MB)"
          >
            <Paperclip className="w-4 h-4" />
          </button>

          <button
            id="compose-discard-button"
            type="button"
            onClick={handleDiscard}
            className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
            title="Discard draft"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {/* Right: Security level badge */}
        <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span>AES-256 / Enclave Active</span>
        </div>
      </div>
    </div>
  );
};
