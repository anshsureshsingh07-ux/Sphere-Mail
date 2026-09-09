import React, { useState, useEffect } from 'react';
import {
  Shield,
  Key,
  Lock,
  Server,
  Send,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Database,
  Activity,
  Copy,
  Check,
  RefreshCw,
  EyeOff,
  Radio,
  Cpu,
  Terminal,
  ExternalLink,
} from 'lucide-react';
import { api } from '../services/api';
import { UserAccount } from '../types';

interface LoopinInternalApiModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserAccount | null;
  onEmailDispatched?: () => void;
}

export const LoopinInternalApiModal: React.FC<LoopinInternalApiModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onEmailDispatched,
}) => {
  const [activeTab, setActiveTab] = useState<'console' | 'templates' | 'models' | 'storage' | 'audit'>('console');
  const [selectedEndpoint, setSelectedEndpoint] = useState<'send_otp' | 'confirm_otp' | 'send_system' | 'get_mailbox'>(
    'send_otp'
  );

  // Endpoint 1: Send OTP state
  const [otpTarget, setOtpTarget] = useState(currentUser?.sphereEmail || 'alex.mercer@yourname.com');
  const [otpPurpose, setOtpPurpose] = useState('sphere_registration');
  const [otpExpiry, setOtpExpiry] = useState(10);
  const [sendOtpLoading, setSendOtpLoading] = useState(false);
  const [sendOtpResult, setSendOtpResult] = useState<any>(null);

  // Endpoint 2: Confirm OTP state
  const [confirmVerificationId, setConfirmVerificationId] = useState('');
  const [confirmCode, setConfirmCode] = useState('');
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [confirmResult, setConfirmResult] = useState<any>(null);

  // Endpoint 3: Send System Email state
  const [systemTo, setSystemTo] = useState(currentUser?.sphereEmail || 'alex.mercer@yourname.com');
  const [systemTemplateId, setSystemTemplateId] = useState('VERIFICATION');
  const [systemPriority, setSystemPriority] = useState('normal');
  const [systemVariables, setSystemVariables] = useState<Record<string, string>>({
    otp: '849201',
    expiry: '10',
    username: currentUser?.username || 'alex.mercer',
    device: 'Chrome on macOS (M3 Max / San Francisco, US)',
    time: new Date().toUTCString(),
    case_id: 'SPH-SEC-99824',
    features: 'Direct Messaging & Group Invites',
    reason: 'Suspicious rapid cross-cluster outbound requests',
  });
  const [systemSendLoading, setSystemSendLoading] = useState(false);
  const [systemSendResult, setSystemSendResult] = useState<any>(null);

  // Endpoint 4: Get Mailbox Metadata state
  const [mailboxQueryId, setMailboxQueryId] = useState(currentUser?.userId || 'usr_sph_alexmercer');
  const [mailboxLoading, setMailboxLoading] = useState(false);
  const [mailboxResult, setMailboxResult] = useState<any>(null);

  // Telemetry & Docs state
  const [services, setServices] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [templatesList, setTemplatesList] = useState<any[]>([]);
  const [storageTelemetry, setStorageTelemetry] = useState<any>(null);
  const [docs, setDocs] = useState<any>(null);
  const [loadingGeneral, setLoadingGeneral] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    if (currentUser?.sphereEmail) {
      setOtpTarget(currentUser.sphereEmail);
      setSystemTo(currentUser.sphereEmail);
      setMailboxQueryId(currentUser.userId || currentUser.sphereEmail);
    }
  }, [currentUser]);

  const loadBackendData = async () => {
    setLoadingGeneral(true);
    try {
      const [svcRes, logsRes, tplRes, storeRes, docsRes] = await Promise.allSettled([
        api.getInternalServices(),
        api.getInternalAuditLogs(),
        api.getInternalTemplates(),
        api.getVirtualStorageArchitecture(),
        api.getInternalDocs(),
      ]);

      if (svcRes.status === 'fulfilled') setServices(svcRes.value.services || []);
      if (logsRes.status === 'fulfilled') setAuditLogs(logsRes.value.logs || []);
      if (tplRes.status === 'fulfilled') setTemplatesList(tplRes.value.templates || []);
      if (storeRes.status === 'fulfilled') setStorageTelemetry(storeRes.value);
      if (docsRes.status === 'fulfilled') setDocs(docsRes.value);
    } catch (e) {
      console.error('Failed to load internal API data', e);
    } finally {
      setLoadingGeneral(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadBackendData();
    }
  }, [isOpen]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Execution: Endpoint 1
  const executeSendOtp = async () => {
    setSendOtpLoading(true);
    setSendOtpResult(null);
    try {
      const res = await api.sendVerificationOtp({
        to: otpTarget,
        purpose: otpPurpose,
        expiry_minutes: Number(otpExpiry),
        user_id: currentUser?.userId,
      });
      setSendOtpResult(res);
      if (res.verification_id) {
        setConfirmVerificationId(res.verification_id);
      }
      onEmailDispatched?.();
      loadBackendData();
    } catch (err: any) {
      setSendOtpResult({ error: err.message });
    } finally {
      setSendOtpLoading(false);
    }
  };

  // Execution: Endpoint 2
  const executeConfirmOtp = async () => {
    setConfirmLoading(true);
    setConfirmResult(null);
    try {
      const res = await api.confirmVerificationOtp({
        verification_id: confirmVerificationId,
        code: confirmCode,
      });
      setConfirmResult(res);
      loadBackendData();
    } catch (err: any) {
      setConfirmResult({ error: err.message });
    } finally {
      setConfirmLoading(false);
    }
  };

  // Execution: Endpoint 3
  const executeSendSystem = async () => {
    setSystemSendLoading(true);
    setSystemSendResult(null);
    try {
      const res = await api.sendSystemMail({
        to: systemTo,
        template_id: systemTemplateId,
        variables: systemVariables,
        priority: systemPriority,
        case_id: systemVariables.case_id,
      });
      setSystemSendResult(res);
      onEmailDispatched?.();
      loadBackendData();
    } catch (err: any) {
      setSystemSendResult({ error: err.message });
    } finally {
      setSystemSendLoading(false);
    }
  };

  // Execution: Endpoint 4
  const executeGetMailbox = async () => {
    setMailboxLoading(true);
    setMailboxResult(null);
    try {
      const res = await api.getUserMailboxMetadata(mailboxQueryId);
      setMailboxResult(res);
      loadBackendData();
    } catch (err: any) {
      setMailboxResult({ error: err.message });
    } finally {
      setMailboxLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      id="loopin-internal-api-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md"
    >
      <div
        id="loopin-internal-api-modal"
        className="bg-slate-900 border border-purple-500/30 w-full max-w-5xl max-h-[92vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-200"
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-gradient-to-r from-slate-950 via-purple-950/20 to-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-400 shadow-inner">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-tight">Loopin Private Internal API</h2>
                <span className="px-2 py-0.5 text-[10px] font-mono tracking-wide uppercase bg-purple-500/10 border border-purple-500/30 text-purple-300 rounded-full">
                  Zero-Knowledge Enclave
                </span>
                <span className="px-2 py-0.5 text-[10px] font-mono tracking-wide uppercase bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  mTLS Authenticated
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Connecting Sphere Social Platform to Sphere Sovereign Mailbox without exposing private contents
              </p>
            </div>
          </div>
          <button
            id="close-internal-api-modal"
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-5 border-b border-slate-800/80 bg-slate-950/60 overflow-x-auto text-xs font-medium">
          <button
            onClick={() => setActiveTab('console')}
            className={`py-3 px-4 flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'console'
                ? 'border-purple-500 text-purple-300 font-semibold bg-purple-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-4 h-4" />
            Interactive API Console
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={`py-3 px-4 flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'templates'
                ? 'border-purple-500 text-purple-300 font-semibold bg-purple-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            12 Official Templates
          </button>
          <button
            onClick={() => setActiveTab('storage')}
            className={`py-3 px-4 flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'storage'
                ? 'border-purple-500 text-purple-300 font-semibold bg-purple-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Cpu className="w-4 h-4" />
            1 YB Virtual Architecture
          </button>
          <button
            onClick={() => setActiveTab('models')}
            className={`py-3 px-4 flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'models'
                ? 'border-purple-500 text-purple-300 font-semibold bg-purple-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Database className="w-4 h-4" />
            Database Models & Schemas
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`py-3 px-4 flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'audit'
                ? 'border-purple-500 text-purple-300 font-semibold bg-purple-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="w-4 h-4" />
            Live Audit Stream ({auditLogs.length})
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: INTERACTIVE API CONSOLE */}
          {activeTab === 'console' && (
            <div className="space-y-6">
              {/* Endpoint Selector Pills */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <button
                  onClick={() => setSelectedEndpoint('send_otp')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    selectedEndpoint === 'send_otp'
                      ? 'border-purple-500/60 bg-purple-500/10 text-white shadow-lg'
                      : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400">
                      POST
                    </span>
                    <Key className="w-3.5 h-3.5 text-purple-400" />
                  </div>
                  <div className="text-xs font-semibold text-slate-200">/verification/send</div>
                  <div className="text-[10px] text-slate-400 truncate">Generate & hash OTP code</div>
                </button>

                <button
                  onClick={() => setSelectedEndpoint('confirm_otp')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    selectedEndpoint === 'confirm_otp'
                      ? 'border-purple-500/60 bg-purple-500/10 text-white shadow-lg'
                      : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400">
                      POST
                    </span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <div className="text-xs font-semibold text-slate-200">/verification/confirm</div>
                  <div className="text-[10px] text-slate-400 truncate">Timing-safe hash check</div>
                </button>

                <button
                  onClick={() => setSelectedEndpoint('send_system')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    selectedEndpoint === 'send_system'
                      ? 'border-purple-500/60 bg-purple-500/10 text-white shadow-lg'
                      : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400">
                      POST
                    </span>
                    <Send className="w-3.5 h-3.5 text-indigo-400" />
                  </div>
                  <div className="text-xs font-semibold text-slate-200">/mail/send-system</div>
                  <div className="text-[10px] text-slate-400 truncate">12 Official Templates</div>
                </button>

                <button
                  onClick={() => setSelectedEndpoint('get_mailbox')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    selectedEndpoint === 'get_mailbox'
                      ? 'border-purple-500/60 bg-purple-500/10 text-white shadow-lg'
                      : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                      GET
                    </span>
                    <EyeOff className="w-3.5 h-3.5 text-amber-400" />
                  </div>
                  <div className="text-xs font-semibold text-slate-200">/users/{'{id}'}/mailbox</div>
                  <div className="text-[10px] text-slate-400 truncate">Zero-knowledge enclave</div>
                </button>
              </div>

              {/* ENDPOINT 1: SEND VERIFICATION */}
              {selectedEndpoint === 'send_otp' && (
                <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                        <span>POST /internal/verification/send</span>
                        <span className="text-[10px] font-mono bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded">
                          Scope: verification:send
                        </span>
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Generates secure numeric OTP, stores salted cryptographic hash (never plaintext), and dispatches
                        VERIFICATION system email into recipient inbox.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">Target Address or User ID</label>
                      <input
                        type="text"
                        value={otpTarget}
                        onChange={(e) => setOtpTarget(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-purple-500 font-mono"
                        placeholder="user@spheremail.net or usr_sph_..."
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">Purpose</label>
                      <select
                        value={otpPurpose}
                        onChange={(e) => setOtpPurpose(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-purple-500"
                      >
                        <option value="sphere_registration">sphere_registration</option>
                        <option value="login_2fa">login_2fa</option>
                        <option value="password_reset">password_reset</option>
                        <option value="enclave_rekey">enclave_rekey</option>
                        <option value="email_bind">email_bind</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">Expiry (Minutes)</label>
                      <input
                        type="number"
                        value={otpExpiry}
                        onChange={(e) => setOtpExpiry(Number(e.target.value))}
                        min={1}
                        max={60}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-purple-500 font-mono"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-emerald-400" />
                      Salted HMAC-SHA256 will be saved; plaintext code is NEVER returned in response.
                    </div>
                    <button
                      onClick={executeSendOtp}
                      disabled={sendOtpLoading}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs font-medium rounded-lg shadow transition flex items-center gap-2"
                    >
                      {sendOtpLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                      Execute /internal/verification/send
                    </button>
                  </div>

                  {sendOtpResult && (
                    <div className="mt-4 p-4 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono space-y-2">
                      <div className="flex items-center justify-between text-slate-300 border-b border-slate-800 pb-2">
                        <span className="font-semibold text-emerald-400 flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4" />
                          HTTP 200 OK — Verification Dispatched
                        </span>
                        <button
                          onClick={() => handleCopy(JSON.stringify(sendOtpResult, null, 2), 'otp_res')}
                          className="text-[10px] text-slate-400 hover:text-white flex items-center gap-1"
                        >
                          {copiedKey === 'otp_res' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          Copy JSON
                        </button>
                      </div>
                      <pre className="text-slate-300 overflow-x-auto p-2 bg-slate-950 rounded text-[11px] leading-relaxed">
                        {JSON.stringify(sendOtpResult, null, 2)}
                      </pre>
                      <div className="text-[11px] text-purple-300 bg-purple-950/40 p-2.5 rounded border border-purple-800/40 flex items-center justify-between">
                        <span>Check your inbox for the official verification email!</span>
                        <button
                          onClick={() => {
                            setSelectedEndpoint('confirm_otp');
                          }}
                          className="underline hover:text-white"
                        >
                          Proceed to /internal/verification/confirm →
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ENDPOINT 2: CONFIRM VERIFICATION */}
              {selectedEndpoint === 'confirm_otp' && (
                <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-5 space-y-4">
                  <div>
                    <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                      <span>POST /internal/verification/confirm</span>
                      <span className="text-[10px] font-mono bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded">
                        Scope: verification:confirm
                      </span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Performs constant-time HMAC-SHA256 comparison of submitted OTP code against salted cryptographic hash.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">Verification ID</label>
                      <input
                        type="text"
                        value={confirmVerificationId}
                        onChange={(e) => setConfirmVerificationId(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-purple-500 font-mono"
                        placeholder="vfc_..."
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">Submitted 6-Digit Code</label>
                      <input
                        type="text"
                        value={confirmCode}
                        onChange={(e) => setConfirmCode(e.target.value)}
                        maxLength={6}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-purple-500 font-mono tracking-widest text-center font-bold"
                        placeholder="123456"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5 text-blue-400" />
                      Constant-time verification prevents side-channel timing analysis attacks.
                    </div>
                    <button
                      onClick={executeConfirmOtp}
                      disabled={confirmLoading || !confirmVerificationId || !confirmCode}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-medium rounded-lg shadow transition flex items-center gap-2"
                    >
                      {confirmLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                      Execute /internal/verification/confirm
                    </button>
                  </div>

                  {confirmResult && (
                    <div className="mt-4 p-4 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono space-y-2">
                      <div className="flex items-center justify-between text-slate-300 border-b border-slate-800 pb-2">
                        <span
                          className={`font-semibold flex items-center gap-1.5 ${
                            confirmResult.verified ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {confirmResult.verified ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                          {confirmResult.verified ? 'HTTP 200 OK — Code Confirmed & User Verified' : 'Verification Failed'}
                        </span>
                      </div>
                      <pre className="text-slate-300 overflow-x-auto p-2 bg-slate-950 rounded text-[11px] leading-relaxed">
                        {JSON.stringify(confirmResult, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              )}

              {/* ENDPOINT 3: SEND SYSTEM MAIL */}
              {selectedEndpoint === 'send_system' && (
                <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-5 space-y-4">
                  <div>
                    <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                      <span>POST /internal/mail/send-system</span>
                      <span className="text-[10px] font-mono bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded">
                        Scope: mail:system:send
                      </span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Dispatches official authenticated system email using any of the 12 verified Loopin templates into target
                      user mailbox enclave.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">Recipient</label>
                      <input
                        type="text"
                        value={systemTo}
                        onChange={(e) => setSystemTo(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-purple-500 font-mono"
                        placeholder="user@spheremail.net"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">Select Template (12 Total)</label>
                      <select
                        value={systemTemplateId}
                        onChange={(e) => setSystemTemplateId(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-purple-500 font-semibold"
                      >
                        <option value="VERIFICATION">1. VERIFICATION (Verify your Sphere account)</option>
                        <option value="WELCOME">2. WELCOME (Welcome to Sphere)</option>
                        <option value="SECURITY">3. SECURITY (New login detected)</option>
                        <option value="WARNING">4. WARNING (Warning regarding your account)</option>
                        <option value="RESTRICTION">5. RESTRICTION (Features restricted)</option>
                        <option value="BAN">6. BAN (Your account has been suspended)</option>
                        <option value="REMOVAL">7. REMOVAL (Your account has been removed)</option>
                        <option value="APPEAL_RECEIVED">8. APPEAL_RECEIVED (Appeal received)</option>
                        <option value="APPEAL_APPROVED">9. APPEAL_APPROVED (Appeal approved)</option>
                        <option value="APPEAL_REJECTED">10. APPEAL_REJECTED (Appeal decision)</option>
                        <option value="REPORT_RESULT_ACTION">11. REPORT_RESULT_ACTION (Report reviewed)</option>
                        <option value="REPORT_RESULT_NO_ACTION">12. REPORT_RESULT_NO_ACTION (Report recorded)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">Priority</label>
                      <select
                        value={systemPriority}
                        onChange={(e) => setSystemPriority(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-purple-500"
                      >
                        <option value="normal">normal</option>
                        <option value="high">high</option>
                        <option value="urgent">urgent</option>
                      </select>
                    </div>
                  </div>

                  {/* Variables Customizer */}
                  <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 space-y-2">
                    <div className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                      <span>Template Variables Injection</span>
                      <span className="text-[10px] text-slate-400 font-mono">Dynamic Payload</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400">case_id:</span>
                        <input
                          type="text"
                          value={systemVariables.case_id}
                          onChange={(e) => setSystemVariables({ ...systemVariables, case_id: e.target.value })}
                          className="w-full px-2 py-1 bg-slate-950 border border-slate-700 rounded text-xs text-slate-200"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400">username:</span>
                        <input
                          type="text"
                          value={systemVariables.username}
                          onChange={(e) => setSystemVariables({ ...systemVariables, username: e.target.value })}
                          className="w-full px-2 py-1 bg-slate-950 border border-slate-700 rounded text-xs text-slate-200"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400">reason:</span>
                        <input
                          type="text"
                          value={systemVariables.reason}
                          onChange={(e) => setSystemVariables({ ...systemVariables, reason: e.target.value })}
                          className="w-full px-2 py-1 bg-slate-950 border border-slate-700 rounded text-xs text-slate-200"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400">device:</span>
                        <input
                          type="text"
                          value={systemVariables.device}
                          onChange={(e) => setSystemVariables({ ...systemVariables, device: e.target.value })}
                          className="w-full px-2 py-1 bg-slate-950 border border-slate-700 rounded text-xs text-slate-200"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-purple-400" />
                      Loopin Official seal & cryptographic delivery guarantee attached automatically.
                    </div>
                    <button
                      onClick={executeSendSystem}
                      disabled={systemSendLoading || !systemTo}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-medium rounded-lg shadow transition flex items-center gap-2"
                    >
                      {systemSendLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                      Dispatch System Email via Loopin Bus
                    </button>
                  </div>

                  {systemSendResult && (
                    <div className="mt-4 p-4 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono space-y-2">
                      <div className="flex items-center justify-between text-slate-300 border-b border-slate-800 pb-2">
                        <span className="font-semibold text-emerald-400 flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4" />
                          HTTP 200 OK — Email Dispatched to User Mailbox
                        </span>
                      </div>
                      <pre className="text-slate-300 overflow-x-auto p-2 bg-slate-950 rounded text-[11px] leading-relaxed">
                        {JSON.stringify(systemSendResult, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              )}

              {/* ENDPOINT 4: GET USER MAILBOX */}
              {selectedEndpoint === 'get_mailbox' && (
                <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-5 space-y-4">
                  <div>
                    <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                      <span>GET /internal/users/{'{user_id}'}/mailbox</span>
                      <span className="text-[10px] font-mono bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded">
                        Scope: mailbox:read
                      </span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Retrieves permanent User ID + Mailbox ID linkage and storage enclave metadata.
                      <strong className="text-amber-300 ml-1">
                        Zero-Knowledge Enforced: Mailbox contents & email bodies are strictly inaccessible to Sphere.
                      </strong>
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={mailboxQueryId}
                      onChange={(e) => setMailboxQueryId(e.target.value)}
                      className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-purple-500 font-mono"
                      placeholder="User ID, Mailbox ID, or Email Address"
                    />
                    <button
                      onClick={executeGetMailbox}
                      disabled={mailboxLoading || !mailboxQueryId}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs font-medium rounded-lg shadow transition flex items-center gap-2 shrink-0"
                    >
                      {mailboxLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <EyeOff className="w-3.5 h-3.5" />}
                      Query Mailbox Enclave
                    </button>
                  </div>

                  {mailboxResult && (
                    <div className="mt-4 p-4 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono space-y-3">
                      <div className="flex items-center justify-between text-slate-300 border-b border-slate-800 pb-2">
                        <span className="font-semibold text-emerald-400 flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4" />
                          HTTP 200 OK — Sovereign Enclave Metadata Verified
                        </span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] bg-slate-950 p-3 rounded">
                        <div>
                          <div className="text-slate-400">Permanent User ID</div>
                          <div className="font-bold text-white truncate">{mailboxResult.user_id}</div>
                        </div>
                        <div>
                          <div className="text-slate-400">Permanent Mailbox ID</div>
                          <div className="font-bold text-white truncate">{mailboxResult.mailbox_id}</div>
                        </div>
                        <div>
                          <div className="text-slate-400">Loopin Sovereign ID</div>
                          <div className="font-bold text-purple-400 truncate">{mailboxResult.loopin_account_id}</div>
                        </div>
                        <div>
                          <div className="text-slate-400">Privacy Status</div>
                          <div className="font-bold text-emerald-400">Zero-Knowledge Isolated</div>
                        </div>
                      </div>
                      <pre className="text-slate-300 overflow-x-auto p-2 bg-slate-950 rounded text-[11px] leading-relaxed">
                        {JSON.stringify(mailboxResult, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: 12 OFFICIAL TEMPLATES */}
          {activeTab === 'templates' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">12 Verified System Email Templates</h3>
                  <p className="text-xs text-slate-400">
                    Pre-compiled according to Sphere Integrity, Verification, and Community Safety protocols
                  </p>
                </div>
                <button
                  onClick={() => {
                    setActiveTab('console');
                    setSelectedEndpoint('send_system');
                  }}
                  className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-medium flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  Dispatch via API Console
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {templatesList.map((tpl) => (
                  <div
                    key={tpl.id}
                    className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 hover:border-purple-500/40 transition-colors space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className="px-2 py-0.5 text-[10px] font-mono font-bold rounded"
                        style={{ backgroundColor: `${tpl.badgeColor}22`, color: tpl.badgeColor }}
                      >
                        {tpl.badgeLabel}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">{tpl.id}</span>
                    </div>
                    <div className="text-xs font-semibold text-white">{tpl.defaultSubject}</div>
                    <div className="text-[11px] text-slate-300 bg-slate-900/90 p-2.5 rounded font-mono border border-slate-800/80">
                      {tpl.plainTextTemplate}
                    </div>
                    <div className="text-[10px] text-slate-400 flex items-center gap-1">
                      <span>Variables:</span>
                      {tpl.requiredVariables.length > 0 ? (
                        tpl.requiredVariables.map((v: string) => (
                          <span key={v} className="bg-slate-800 px-1.5 py-0.5 rounded text-purple-300 font-mono">
                            {`{{${v}}}`}
                          </span>
                        ))
                      ) : (
                        <span className="text-slate-400 italic">None required</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: 1 YB VIRTUAL ARCHITECTURE */}
          {activeTab === 'storage' && storageTelemetry && (
            <div className="space-y-5">
              <div className="bg-gradient-to-r from-purple-950/40 via-slate-900 to-indigo-950/40 border border-purple-500/30 p-5 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Cpu className="w-5 h-5 text-purple-400" />
                    <h3 className="text-base font-bold text-white">
                      {storageTelemetry.architecture.visionaryCapacityTitle}
                    </h3>
                  </div>
                  <span className="text-xs font-mono font-bold text-purple-300 px-2.5 py-1 rounded bg-purple-500/20 border border-purple-500/30">
                    2⁸⁰ Bit Addressing Space
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {storageTelemetry.architecture.transparencyNotice}
                </p>

                {/* Transparency Metric Comparison */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                    <div className="text-[10px] text-slate-400 uppercase font-mono">Visionary Address Space</div>
                    <div className="text-sm font-bold text-purple-300 mt-0.5">1 YB (Yottabyte)</div>
                    <div className="text-[10px] text-slate-400">10²⁴ Bytes • 1,000,000,000 TB</div>
                  </div>
                  <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                    <div className="text-[10px] text-slate-400 uppercase font-mono">Real Physical Quota</div>
                    <div className="text-sm font-bold text-emerald-400 mt-0.5">50.00 GB</div>
                    <div className="text-[10px] text-slate-400">Guaranteed physical NVMe/Mesh baseline</div>
                  </div>
                  <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                    <div className="text-[10px] text-slate-400 uppercase font-mono">Honest Physical Allocation</div>
                    <div className="text-sm font-bold text-white mt-0.5">
                      {(storageTelemetry.telemetry.realUsedBytes / (1024 * 1024)).toFixed(2)} MB Real Used
                    </div>
                    <div className="text-[10px] text-slate-400">0 falsely allocated physical blocks</div>
                  </div>
                </div>
              </div>

              {/* Tiers Breakdown */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Multi-Tier Storage Mesh</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {storageTelemetry.architecture.tiers.map((t: any) => (
                    <div key={t.tierId} className="p-4 rounded-xl border border-slate-800 bg-slate-950/50 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">{t.name}</span>
                        <span className="text-[10px] font-mono text-purple-300 bg-purple-950 px-2 py-0.5 rounded border border-purple-800">
                          {t.latencyProfile}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400">{t.description}</p>
                      <div className="pt-2 border-t border-slate-900 text-[10px] space-y-1 text-slate-400">
                        <div>
                          <strong className="text-slate-300">Encryption:</strong> {t.encryptionStandard}
                        </div>
                        <div>
                          <strong className="text-slate-300">Redundancy:</strong> {t.redundancy}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: DATABASE MODELS */}
          {activeTab === 'models' && docs && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-white">Database Models & Entity Relational Schema</h3>
                <p className="text-xs text-slate-400">
                  Strict schema definitions for User, Mailbox, Verification, Email, Service, ServiceCredential, and AuditLog
                </p>
              </div>

              <div className="space-y-3">
                {Object.entries(docs.database_models).map(([modelName, def]: [string, any]) => (
                  <div key={modelName} className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-bold text-purple-300 font-mono flex items-center gap-2">
                        <Database className="w-3.5 h-3.5" />
                        Model: {modelName}
                      </div>
                      <span className="text-[10px] text-slate-400">{def.description}</span>
                    </div>
                    <div className="bg-slate-900 p-3 rounded-lg border border-slate-800/80 font-mono text-[11px] text-slate-300 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
                      {Object.entries(def.fields).map(([field, type]: [string, any]) => (
                        <div key={field} className="truncate">
                          <span className="text-purple-400 font-semibold">{field}:</span>{' '}
                          <span className="text-slate-400">{type}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: LIVE AUDIT LOGS */}
          {activeTab === 'audit' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">Immutable Internal Audit Log Feed</h3>
                  <p className="text-xs text-slate-400">
                    Captures all server-to-server calls. Guarantees zero-knowledge compliance and tracks latency.
                  </p>
                </div>
                <button
                  onClick={loadBackendData}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition text-xs flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" /> Refresh
                </button>
              </div>

              <div className="space-y-2 max-h-[400px] overflow-y-auto font-mono text-xs">
                {auditLogs.length === 0 ? (
                  <div className="p-6 text-center text-slate-400">No audit records logged yet. Trigger an endpoint!</div>
                ) : (
                  auditLogs.map((log) => (
                    <div
                      key={log.id}
                      className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 text-slate-300 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              log.status === 'success'
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : 'bg-rose-500/20 text-rose-400'
                            }`}
                          >
                            {log.status.toUpperCase()}
                          </span>
                          <span className="font-semibold text-white">{log.action}</span>
                          <span className="text-slate-400 text-[10px]">({log.serviceId})</span>
                        </div>
                        <div className="text-[11px] text-slate-400">{log.details}</div>
                      </div>
                      <div className="text-right text-[10px] text-slate-400 shrink-0">
                        <div>{new Date(log.timestamp).toLocaleTimeString()}</div>
                        <div className="text-purple-400">{log.latencyMs} ms</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-purple-400" />
            <span>Sphere Mail by Loopin • Sovereign Zero-Knowledge Infrastructure</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition"
          >
            Close Enclave
          </button>
        </div>
      </div>
    </div>
  );
};
