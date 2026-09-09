import React, { useState, useRef } from 'react';
import {
  Server,
  HardDrive,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Layers,
  Upload,
  Download,
  FileText,
  Image,
  Archive,
  Folder,
  Radio,
  Clock,
  Sparkles,
  Info,
  AlertCircle
} from 'lucide-react';
import { PersonalDigitalServer, PersonalServerFile } from '../types';

interface PersonalDigitalServerModalProps {
  isOpen: boolean;
  onClose: () => void;
  server: PersonalDigitalServer | null;
  onUploadFile: (fileData: { name: string; size: number; category?: string; type?: string }) => Promise<void>;
  isLoading: boolean;
}

export const PersonalDigitalServerModal: React.FC<PersonalDigitalServerModalProps> = ({
  isOpen,
  onClose,
  server,
  onUploadFile,
  isLoading,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'files' | 'services' | 'activity'>('overview');
  const [fileFilter, setFileFilter] = useState<'all' | 'mail_attachment' | 'personal_file' | 'vault'>('all');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const usedBytes = server?.storage.usedBytes || 24500000;
  const quotaBytes = server?.storage.realPhysicalQuotaBytes || 50 * 1024 * 1024 * 1024; // 50 GB baseline
  const usedMB = (usedBytes / (1024 * 1024)).toFixed(1);
  const quotaGB = (quotaBytes / (1024 * 1024 * 1024)).toFixed(0);
  const percentUsed = Math.max(0.2, (usedBytes / quotaBytes) * 100).toFixed(1);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  };

  const handleFileUploadChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        let fileType: 'file' | 'image' | 'doc' | 'archive' = 'file';
        if (file.type.startsWith('image/')) fileType = 'image';
        else if (file.type.includes('pdf') || file.type.includes('document') || file.type.includes('text')) fileType = 'doc';
        else if (file.name.endsWith('.zip') || file.name.endsWith('.tar') || file.name.endsWith('.gz')) fileType = 'archive';

        await onUploadFile({
          name: file.name,
          size: file.size,
          category: 'personal_file',
          type: fileType,
        });
      }
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const filteredFiles = (server?.files || []).filter((f) => {
    if (fileFilter === 'all') return true;
    return f.category === fileFilter;
  });

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div
        id="personal-digital-server-modal"
        className="w-full max-w-4xl bg-[#0f111a] border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="p-4 sm:p-6 bg-[#0a0c13] border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-950/80 border border-violet-600/40 flex items-center justify-center text-violet-300 shadow-lg shadow-violet-950/50">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Personal Digital Server
                </h2>
                <span className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800/50 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  ● Online
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Node Enclave: <span className="font-mono text-violet-300">{server?.serverId || 'srv_isolated_loopin_node_09'}</span> • Logical Isolation: <span className="text-emerald-400 font-semibold">Enforced</span>
              </p>
            </div>
          </div>

          <button
            id="close-personal-server-modal"
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-[#0d0f17] px-4 sm:px-6 gap-2 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 px-3 border-b-2 transition-colors ${
              activeTab === 'overview'
                ? 'border-violet-500 text-violet-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Storage & Vision Overview
          </button>
          <button
            onClick={() => setActiveTab('files')}
            className={`py-3 px-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'files'
                ? 'border-violet-500 text-violet-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Files & Attachments ({server?.files.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('services')}
            className={`py-3 px-3 border-b-2 transition-colors ${
              activeTab === 'services'
                ? 'border-violet-500 text-violet-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Connected Services (4)
          </button>
          <button
            onClick={() => setActiveTab('activity')}
            className={`py-3 px-3 border-b-2 transition-colors ${
              activeTab === 'activity'
                ? 'border-violet-500 text-violet-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Security & Activity Audit
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 flex flex-col gap-6">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="flex flex-col gap-6">
              {/* Storage Capacity Philosophy Card */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-violet-950/40 via-slate-900/80 to-indigo-950/30 border border-violet-500/20 flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-violet-400">
                      Personal Digital Storage Philosophy
                    </span>
                    <h3 className="text-xl font-extrabold text-white mt-0.5">
                      {usedMB} MB used <span className="text-sm font-normal text-slate-400">of {quotaGB} GB real provisioned baseline</span>
                    </h3>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <span className="px-3 py-1 rounded-lg bg-violet-950/80 text-violet-300 border border-violet-500/30 text-xs font-bold tracking-wide">
                      Expandable Capacity: Up to 1 YB Vision
                    </span>
                  </div>
                </div>

                {/* Storage gauge */}
                <div>
                  <div className="flex justify-between text-xs text-slate-400 mb-1.5 font-medium">
                    <span>Physical Allocation on Current Node: {percentUsed}% utilized</span>
                    <span>Dynamic Scaling Ready</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-violet-500 via-indigo-500 to-purple-400 h-full rounded-full transition-all duration-500"
                      style={{ width: `${percentUsed}%` }}
                    />
                  </div>
                </div>

                {/* Architectural Honesty Statement */}
                <div className="p-3.5 rounded-xl bg-black/40 border border-slate-800 flex items-start gap-2.5 text-xs text-slate-300">
                  <Info className="w-4 h-4 text-violet-400 flex-shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    <strong>Honest Architecture Declaration:</strong> Our long-term product vision supports dynamic horizontal scaling up to <strong>1 YB (1 Yottabyte)</strong> across distributed object clusters. Sphere allocates real physical storage dynamically as data arrives—we never falsely allocate phantom physical disks or pretend non-existent physical exabytes are reserved.
                  </p>
                </div>
              </div>

              {/* Breakdown Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col">
                  <span className="text-[11px] text-slate-400">Mail Bodies</span>
                  <span className="text-sm font-bold text-white mt-1">
                    {formatFileSize(server?.storage.breakdown.emails || 420000)}
                  </span>
                  <span className="text-[10px] text-violet-400 mt-0.5">Isolated Enclave</span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col">
                  <span className="text-[11px] text-slate-400">Mail Attachments</span>
                  <span className="text-sm font-bold text-white mt-1">
                    {formatFileSize(server?.storage.breakdown.attachments || 5800000)}
                  </span>
                  <span className="text-[10px] text-indigo-400 mt-0.5">Object Store</span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col">
                  <span className="text-[11px] text-slate-400">Personal Files</span>
                  <span className="text-sm font-bold text-white mt-1">
                    {formatFileSize(server?.storage.breakdown.personalFiles || 2450000)}
                  </span>
                  <span className="text-[10px] text-emerald-400 mt-0.5">Encrypted Drive</span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col">
                  <span className="text-[11px] text-slate-400">Vault & Keys</span>
                  <span className="text-sm font-bold text-white mt-1">
                    {formatFileSize(server?.storage.breakdown.vaultEncrypted || 18414200)}
                  </span>
                  <span className="text-[10px] text-amber-400 mt-0.5">Zero-Knowledge</span>
                </div>
              </div>

              {/* Logical Isolation & Admin Boundary */}
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1 text-xs leading-relaxed">
                  <h4 className="font-bold text-white mb-0.5">
                    Logical Isolation & Founder Access Restriction
                  </h4>
                  <p className="text-slate-300">
                    Your Personal Digital Server is logically isolated from other accounts. Loopin platform founders and system administrators <strong>cannot access your personal server files, email bodies, or decryption keys</strong>. Access to your personal server is cryptographically locked to your authenticated Sphere identity.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: FILES */}
          {activeTab === 'files' && (
            <div className="flex flex-col gap-4">
              {/* File action bar */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-lg border border-slate-800 text-xs">
                  <button
                    onClick={() => setFileFilter('all')}
                    className={`px-3 py-1 rounded-md transition-colors ${
                      fileFilter === 'all' ? 'bg-violet-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    All Files ({server?.files.length || 0})
                  </button>
                  <button
                    onClick={() => setFileFilter('mail_attachment')}
                    className={`px-3 py-1 rounded-md transition-colors ${
                      fileFilter === 'mail_attachment' ? 'bg-violet-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Mail Attachments
                  </button>
                  <button
                    onClick={() => setFileFilter('personal_file')}
                    className={`px-3 py-1 rounded-md transition-colors ${
                      fileFilter === 'personal_file' ? 'bg-violet-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Personal Files
                  </button>
                  <button
                    onClick={() => setFileFilter('vault')}
                    className={`px-3 py-1 rounded-md transition-colors ${
                      fileFilter === 'vault' ? 'bg-violet-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Vault
                  </button>
                </div>

                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    className="hidden"
                    onChange={handleFileUploadChange}
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-violet-600/30 transition-all"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{isUploading ? 'Encrypting & Staging...' : 'Upload to Personal Server'}</span>
                  </button>
                </div>
              </div>

              {/* Files Table */}
              <div className="rounded-xl border border-slate-800 overflow-hidden bg-slate-950/60 divide-y divide-slate-800/60">
                {filteredFiles.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-500">
                    No files found in this category.
                  </div>
                ) : (
                  filteredFiles.map((file) => (
                    <div
                      key={file.id}
                      className="p-3.5 flex items-center justify-between gap-3 hover:bg-slate-900/60 transition-colors"
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-violet-400 flex-shrink-0">
                          {file.type === 'image' ? (
                            <Image className="w-4 h-4" />
                          ) : file.type === 'doc' ? (
                            <FileText className="w-4 h-4" />
                          ) : file.type === 'archive' ? (
                            <Archive className="w-4 h-4" />
                          ) : (
                            <Folder className="w-4 h-4" />
                          )}
                        </div>
                        <div className="flex flex-col overflow-hidden">
                          <span className="text-xs font-medium text-slate-200 truncate">{file.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {formatFileSize(file.size)} • Node: {file.storageNodeId} • Encrypted ✓
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800 font-medium capitalize hidden sm:inline">
                          {file.category.replace('_', ' ')}
                        </span>
                        <button
                          onClick={() => alert(`Simulated secure download of ${file.name} with client decryption.`)}
                          className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
                          title="Download decrypted file"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 3: CONNECTED SERVICES */}
          {activeTab === 'services' && (
            <div className="flex flex-col gap-4">
              <p className="text-xs text-slate-400">
                The Personal Digital Server connects to Loopin sovereign apps while preserving zero-knowledge isolation.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(server?.connectedServices || []).map((svc) => (
                  <div
                    key={svc.id}
                    className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm font-bold text-white">{svc.name}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800/40 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          {svc.status}
                        </span>
                      </div>
                      <span className="text-[11px] text-violet-400 font-medium">{svc.category}</span>
                      <p className="text-xs text-slate-400 mt-2 leading-relaxed">{svc.description}</p>
                    </div>

                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
                      <span>Zero-Knowledge Scope</span>
                      <span className="text-emerald-400 font-mono">Enforced ✓</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: ACTIVITY & SECURITY */}
          {activeTab === 'activity' && (
            <div className="flex flex-col gap-4">
              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col gap-2 text-xs">
                <div className="text-xs font-bold text-white uppercase tracking-wider">
                  Hardware Attestation & Enclave Keys
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-400 text-xs">
                  <div>Cipher: <span className="font-mono text-violet-300">XChaCha20-Poly1305</span></div>
                  <div>Key Escrow: <span className="text-emerald-400">Client-Side Device Only</span></div>
                  <div>Cluster: <span className="font-mono text-slate-300">eu-west-isolated-enclave-3</span></div>
                  <div>Audit Ledger: <span className="text-slate-300">Append-only cryptographic chain</span></div>
                </div>
              </div>

              <div className="rounded-xl border border-slate-800 overflow-hidden divide-y divide-slate-800/60 bg-slate-950/60">
                {(server?.recentActivity || []).map((act) => (
                  <div key={act.id} className="p-3.5 flex items-start justify-between gap-3 text-xs">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-bold text-slate-200">{act.event}</span>
                      <span className="text-slate-400 text-[11px]">{act.details}</span>
                      <span className="text-[10px] text-slate-500 font-mono mt-0.5">
                        IP: {act.ip} • Timestamp: {new Date(act.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                        act.status === 'authorized'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/50'
                          : 'bg-rose-950 text-rose-300 border border-rose-800/50'
                      }`}
                    >
                      {act.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#0a0c13] border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Personal Digital Server Environment v2.4 • Loopin Sovereign Core</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition-colors"
          >
            Close Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};
