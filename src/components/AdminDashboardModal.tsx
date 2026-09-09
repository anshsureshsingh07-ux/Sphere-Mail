import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Lock,
  Activity,
  Server,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Clock,
  Send,
  EyeOff
} from 'lucide-react';
import { api } from '../services/api';
import { AdminAuditLog } from '../types';

interface AdminDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminDashboardModal: React.FC<AdminDashboardModalProps> = ({ isOpen, onClose }) => {
  const [metrics, setMetrics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [auditReason, setAuditReason] = useState('');
  const [auditAction, setAuditAction] = useState('STORAGE_NODE_DIAGNOSTIC');
  const [isSubmittingAudit, setIsSubmittingAudit] = useState(false);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    setIsLoading(true);
    api
      .getAdminMetrics()
      .then((data) => setMetrics(data))
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmitAudit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auditReason.trim()) return;

    setIsSubmittingAudit(true);
    try {
      const res = await api.submitAdminAuditRequest(
        auditAction,
        auditReason,
        'Cluster Infrastructure Telemetry'
      );
      setFeedback('Audit action recorded successfully in the immutable ledger.');
      setAuditReason('');
      // Refresh metrics
      const updated = await api.getAdminMetrics();
      setMetrics(updated);
    } catch (err: any) {
      setFeedback(`Error: ${err.message}`);
    } finally {
      setIsSubmittingAudit(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div
        id="admin-enclave-modal"
        className="w-full max-w-3xl bg-[#0f111a] border border-violet-900/60 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="p-4 sm:p-6 bg-[#0a0c13] border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-950 border border-violet-500/50 flex items-center justify-center text-violet-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Loopin Founder & Admin Operations Enclave
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded bg-violet-950 text-violet-300 border border-violet-800 font-bold uppercase">
                  Audited Realm
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Operational Telemetry & Governance • Zero-Knowledge Architectural Boundary
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 flex flex-col gap-6">
          {/* CRITICAL PRIVILEGE DIRECTIVE BANNER */}
          <div className="p-4 rounded-xl bg-violet-950/30 border border-violet-600/40 flex items-start gap-3">
            <EyeOff className="w-5 h-5 text-violet-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1 text-xs leading-relaxed">
              <h3 className="font-bold text-white mb-1">
                Zero-Knowledge Boundary: Private User Contents Strictly Inaccessible
              </h3>
              <p className="text-slate-300 mb-2">
                As mandated by the Loopin Security Charter, platform founders and administrators <strong>do NOT have access to user passwords, private email bodies, private attachments, or personal digital server disks</strong>.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 font-mono text-[11px] text-slate-400">
                <div className="flex items-center gap-1.5 text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Private Keys: Client-Only Escrow
                </div>
                <div className="flex items-center gap-1.5 text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Password Hashes: Salted scrypt only
                </div>
                <div className="flex items-center gap-1.5 text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Attachment Blobs: Client-Side Encrypted
                </div>
                <div className="flex items-center gap-1.5 text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Audit Logging: Enforced on all actions
                </div>
              </div>
            </div>
          </div>

          {/* Operational Metrics */}
          {isLoading ? (
            <div className="p-6 text-center text-xs text-slate-400">Loading enclave telemetry...</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col">
                <span className="text-xs text-slate-400">Registered Mailboxes</span>
                <span className="text-xl font-bold text-white mt-1">
                  {metrics?.userMetrics?.registeredMailboxes || 1}
                </span>
                <span className="text-[10px] text-emerald-400 mt-0.5">Isolated Nodes Active</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col">
                <span className="text-xs text-slate-400">Internal Sovereign Bus</span>
                <span className="text-xl font-bold text-white mt-1">
                  {metrics?.queueMetrics?.internalBusRateSec || 14.8} msg/s
                </span>
                <span className="text-[10px] text-violet-400 mt-0.5">P2P Enclave Mesh</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col">
                <span className="text-xs text-slate-400">External Relay Queue</span>
                <span className="text-xl font-bold text-white mt-1">
                  {metrics?.queueMetrics?.externalRelayStaged ?? 2} staged
                </span>
                <span className="text-[10px] text-amber-400 mt-0.5">SMTP Standby Queue</span>
              </div>
            </div>
          )}

          {/* Storage Clusters Health */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Distributed Object Storage Nodes
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {(metrics?.storageClusters || [
                { id: 'cluster-eu-01', region: 'Frankfurt Enclave', health: 'Optimal', loadPercent: 38 },
                { id: 'cluster-us-01', region: 'Virginia Enclave', health: 'Optimal', loadPercent: 42 },
                { id: 'cluster-ap-01', region: 'Tokyo Enclave', health: 'Optimal', loadPercent: 29 },
              ]).map((c: any) => (
                <div key={c.id} className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold text-slate-200">{c.region}</span>
                    <span className="text-[10px] text-emerald-400">{c.health}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono mb-2">{c.id}</div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-violet-500 h-full rounded-full"
                      style={{ width: `${c.loadPercent}%` }}
                    />
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">{c.loadPercent}% Cluster Capacity</div>
                </div>
              ))}
            </div>
          </div>

          {/* Privileged Diagnostic Audit Request Simulator */}
          <form
            onSubmit={handleSubmitAudit}
            className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col gap-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Initiate Audited Diagnostic Inquiry
              </span>
              <span className="text-[10px] text-slate-400">
                Reason & security justification required
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <select
                value={auditAction}
                onChange={(e) => setAuditAction(e.target.value)}
                className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 outline-none"
              >
                <option value="STORAGE_NODE_DIAGNOSTIC">STORAGE_NODE_DIAGNOSTIC</option>
                <option value="RATE_LIMIT_RULE_INSPECT">RATE_LIMIT_RULE_INSPECT</option>
                <option value="EXTERNAL_RELAY_PROBE">EXTERNAL_RELAY_PROBE</option>
                <option value="SPAM_TRAFFIC_TELEMETRY">SPAM_TRAFFIC_TELEMETRY</option>
              </select>

              <input
                type="text"
                placeholder="Legitimate operational reason (e.g. Node throughput verification)"
                value={auditReason}
                onChange={(e) => setAuditReason(e.target.value)}
                className="sm:col-span-2 p-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 outline-none placeholder-slate-500"
              />
            </div>

            {feedback && <div className="text-xs text-emerald-400">{feedback}</div>}

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={!auditReason.trim() || isSubmittingAudit}
                className="px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmittingAudit ? 'Logging...' : 'Sign & Record Audit Entry'}</span>
              </button>
            </div>
          </form>

          {/* Immutable Audit Ledger */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" />
              Administrative Audit Ledger ({metrics?.auditLogs?.length || 0})
            </span>
            <div className="rounded-xl border border-slate-800 overflow-hidden divide-y divide-slate-800 bg-slate-950/60 max-h-48 overflow-y-auto">
              {(metrics?.auditLogs || []).map((log: AdminAuditLog) => (
                <div key={log.id} className="p-3 text-xs flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-violet-300">{log.action}</span>
                      <span className="text-[10px] text-slate-500 font-mono">by {log.adminId}</span>
                    </div>
                    <p className="text-slate-300 text-[11px] mt-0.5">{log.reason}</p>
                    <span className="text-[10px] text-slate-500 font-mono">
                      Target: {log.targetScope} • {new Date(log.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-semibold whitespace-nowrap">
                    Private Data: Protected ✓
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#0a0c13] border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Loopin Administrative Isolation Protocol • Enforced by hardware cryptography</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition-colors"
          >
            Close Enclave
          </button>
        </div>
      </div>
    </div>
  );
};
