import React from 'react';
import { HelpCircle, ShieldCheck, Server, HardDrive, CheckCircle2, Lock, Radio } from 'lucide-react';
import { SphereBrandLogo } from './SphereBrandLogo';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  configuredDomain: string;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose, configuredDomain }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div
        id="help-modal"
        className="w-full max-w-2xl bg-[#0f111a] border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden"
      >
        {/* Header */}
        <div className="p-5 bg-[#0a0c13] border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <SphereBrandLogo size="sm" />
            <div>
              <h3 className="text-base font-bold text-white">Sphere Mail Architecture & Philosophy</h3>
              <p className="text-xs text-slate-400">By Loopin • Your mail for Sphere</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white">✕</button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 flex flex-col gap-5 text-xs text-slate-300 leading-relaxed">
          {/* Section 1: Brand & Purpose */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col gap-2">
            <h4 className="font-bold text-white text-sm flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-violet-400" />
              Privacy & Sovereign Communication
            </h4>
            <p>
              Sphere Mail is a modern personal digital communication platform engineered around privacy, security, reliability, and user control. It is designed so users are not data-mined and do not surrender their sovereignty to centralized advertising monoliths.
            </p>
          </div>

          {/* Section 2: Personal Digital Server & Storage Philosophy */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col gap-2">
            <h4 className="font-bold text-white text-sm flex items-center gap-2">
              <Server className="w-4 h-4 text-emerald-400" />
              Personal Digital Server: 1 YB Vision vs Honest Physical Allocation
            </h4>
            <p>
              Every Sphere Mail user receives an isolated <strong>Personal Digital Server</strong>.
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-400">
              <li>
                <strong>Visionary Target:</strong> Up to <strong>1 YB (1 yottabyte)</strong> capacity represents our long-term architectural scaling ceiling across distributed node clusters.
              </li>
              <li>
                <strong>No Fake Physical Allocation:</strong> We do not allocate phantom physical exabytes to empty accounts. Storage is dynamically expanded as your encrypted data grows, backed by verified physical nodes.
              </li>
              <li>
                <strong>Isolated Environment:</strong> Your personal server manages emails, attachments, personal files, photos, documents, and contacts in private zero-knowledge vaults.
              </li>
            </ul>
          </div>

          {/* Section 3: Loopin Account Integration */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col gap-2">
            <h4 className="font-bold text-white text-sm flex items-center gap-2">
              <Radio className="w-4 h-4 text-indigo-400" />
              Sphere Social & Loopin Architecture
            </h4>
            <p>
              Sphere Mail integrates cleanly with the Loopin ecosystem:
            </p>
            <pre className="p-2.5 rounded-lg bg-black/50 border border-slate-800 font-mono text-[11px] text-violet-300">
{`LOOPIN ACCOUNT
       |
       +---- Sphere (Social)
       |
       +---- Sphere Mail (Communication Enclave)
       |
       +---- Sphere Storage (Object Clusters)
       |
       +---- Loopin AI (Private Assistant)`}
            </pre>
            <p className="text-slate-400">
              User identity is separated: Loopin Account ID ↔ Internal Mailbox ID. Sphere social moderators and administrators have <strong>zero visibility</strong> into your private email contents.
            </p>
          </div>

          {/* Section 4: Founder Privilege Restriction */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col gap-2">
            <h4 className="font-bold text-white text-sm flex items-center gap-2">
              <Lock className="w-4 h-4 text-rose-400" />
              Founder & Administrative Privilege Restriction
            </h4>
            <p>
              Founders and system operators can inspect infrastructure metrics, server node health, and queue latency—but cannot decrypt user passwords, private emails, or personal digital server disks. Sensitive operational actions require legitimate security justifications and are permanently logged to an immutable audit ledger.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#0a0c13] border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs transition-colors"
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  );
};
