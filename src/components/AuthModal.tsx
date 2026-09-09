import React, { useState, useEffect } from 'react';
import { Lock, Mail, User, Key, ShieldCheck, ArrowRight, AlertCircle, Sparkles, Globe, HardDrive, Check } from 'lucide-react';
import { api } from '../services/api';
import { SphereBrandLogo } from './SphereBrandLogo';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (session: { token: string; user: any }) => void;
  configuredDomain: string;
}

const DOMAIN_PRESETS = ['yourchoice.com', 'yourname.com', 'spheremail.net', 'loopin.com'];

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onAuthSuccess,
  configuredDomain,
}) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [emailInput, setEmailInput] = useState('');
  const [usernameInput, setUsernameInput] = useState('yourname');
  const [chosenDomain, setChosenDomain] = useState('yourchoice.com');
  const [customDomainInput, setCustomDomainInput] = useState('');
  const [isCustomDomain, setIsCustomDomain] = useState(false);
  const [displayNameInput, setDisplayNameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('SphereSecured2026!');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [identities, setIdentities] = useState<Array<{ email: string; displayName: string; tier: string }>>([]);

  useEffect(() => {
    if (isOpen) {
      api.getIdentities().then((res) => {
        if (res && Array.isArray(res.accounts)) {
          setIdentities(res.accounts);
        }
      }).catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const effectiveDomain = isCustomDomain
    ? customDomainInput.replace(/^@/, '').trim() || 'yourchoice.com'
    : chosenDomain;

  const fullRegisterEmail = usernameInput
    ? `${usernameInput.toLowerCase().replace(/[^a-z0-9._-]/g, '')}@${effectiveDomain.toLowerCase().replace(/[^a-z0-9.-]/g, '')}`
    : '';

  const handleQuickDemoLogin = async (email: string, pass: string) => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const res = await api.login(email, pass);
      onAuthSuccess(res);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Demo sign-in failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    try {
      if (mode === 'login') {
        const targetEmail = emailInput.trim() || 'yourname@yourchoice.com';
        const res = await api.login(targetEmail, passwordInput, twoFactorCode || undefined);
        onAuthSuccess(res);
        onClose();
      } else {
        const cleanUser = usernameInput.trim().toLowerCase().replace(/[^a-z0-9._-]/g, '');
        if (!cleanUser) throw new Error('Please enter a username');
        if (passwordInput.length < 6) throw new Error('Password must be at least 6 characters');
        
        let finalDomain = effectiveDomain.trim().toLowerCase().replace(/[^a-z0-9.-]/g, '');
        if (!finalDomain.includes('.')) {
          finalDomain = `${finalDomain}.com`;
        }

        const fullAddress = `${cleanUser}@${finalDomain}`;
        const res = await api.register(fullAddress, passwordInput, displayNameInput || cleanUser, finalDomain);
        onAuthSuccess(res);
        onClose();
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div
        id="auth-modal"
        className="w-full max-w-lg bg-[#10121d] border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header with Sphere Logo */}
        <div className="p-6 bg-[#0a0c13] border-b border-slate-800 flex flex-col items-center text-center gap-3">
          <SphereBrandLogo size="md" />
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">
              {mode === 'login' ? 'Access Your Sphere Mailbox' : 'Claim Your Sovereign Custom Domain'}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Decide your own domain without DNS config • Stored and persisted securely
            </p>
          </div>
        </div>

        {/* Quick Stored Accounts & Preset Banner */}
        <div className="px-5 py-3 bg-violet-950/40 border-b border-violet-800/30 flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <div className="text-[11px] text-violet-300 text-center sm:text-left">
            <span className="font-semibold text-white">Stored Accounts on Disk:</span> Click to populate & switch
          </div>
          <div className="flex items-center gap-1.5 flex-wrap justify-center sm:justify-end">
            {identities.length > 0 ? (
              identities.slice(0, 5).map((acc) => {
                const shortLabel = acc.email.length > 24 ? `${acc.email.slice(0, 16)}...` : acc.email;
                return (
                  <button
                    key={acc.email}
                    type="button"
                    onClick={() => {
                      setEmailInput(acc.email);
                      setMode('login');
                      setErrorMessage('');
                    }}
                    disabled={isLoading}
                    className="px-2.5 py-1.5 rounded-lg bg-indigo-900/60 hover:bg-indigo-700/80 text-indigo-100 text-[11px] font-mono whitespace-nowrap transition-colors border border-indigo-700/50 shadow-sm flex items-center gap-1"
                    title={`Select ${acc.email} (${acc.displayName})`}
                  >
                    <Sparkles className="w-3 h-3 text-indigo-300" />
                    <span>{shortLabel}</span>
                  </button>
                );
              })
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('yourname@yourchoice.com', 'SphereSecured2026!')}
                  disabled={isLoading}
                  className="px-2.5 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-[11px] font-bold whitespace-nowrap transition-colors shadow-sm flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3" />
                  yourname@yourchoice.com
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('alex.mercer@yourname.com', 'SphereSecured2026!')}
                  disabled={isLoading}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-medium whitespace-nowrap transition-colors border border-slate-700"
                >
                  @yourname.com
                </button>
              </>
            )}
          </div>
        </div>

        {/* Error message */}
        {errorMessage && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-xs text-rose-200 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4 text-xs">
          {mode === 'register' && (
            <>
              {/* Zero-Config Domain Explainer */}
              <div className="p-3 rounded-xl bg-indigo-950/30 border border-indigo-800/40 text-[11px] text-indigo-300 flex items-start gap-2.5">
                <Globe className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-white">Zero-Configuration Custom Domains</div>
                  <div className="text-slate-400 mt-0.5">
                    Decide any domain name (like <span className="text-indigo-300 font-mono">@yourchoice.com</span> or <span className="text-indigo-300 font-mono">@yourname.com</span>). No DNS or server configuration needed. All mail and user data are persisted to disk.
                  </div>
                </div>
              </div>

              {/* Username + Chosen Domain */}
              <div className="flex flex-col gap-1.5">
                <label className="text-slate-400 font-semibold flex items-center justify-between">
                  <span>Custom Sphere Address</span>
                  {fullRegisterEmail && (
                    <span className="text-violet-400 font-mono text-[11px] font-bold">
                      {fullRegisterEmail}
                    </span>
                  )}
                </label>
                
                <div className="flex items-center gap-2">
                  <div className="flex-1 flex items-center rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 text-slate-200 focus-within:border-violet-500">
                    <User className="w-3.5 h-3.5 text-slate-500 mr-2" />
                    <input
                      type="text"
                      placeholder="yourname"
                      value={usernameInput}
                      onChange={(e) => setUsernameInput(e.target.value.toLowerCase().replace(/[^a-z0-9._-]/g, ''))}
                      className="flex-1 bg-transparent outline-none text-xs text-white"
                      required
                    />
                  </div>

                  <span className="text-slate-500 font-bold">@</span>

                  {isCustomDomain ? (
                    <div className="flex-1 flex items-center rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 text-slate-200 focus-within:border-violet-500">
                      <input
                        type="text"
                        placeholder="yourchoice.com"
                        value={customDomainInput}
                        onChange={(e) => setCustomDomainInput(e.target.value.toLowerCase().replace(/[^a-z0-9.-]/g, ''))}
                        className="flex-1 bg-transparent outline-none text-xs text-violet-300 font-mono"
                        required
                      />
                    </div>
                  ) : (
                    <div className="flex-1 px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-violet-300 font-mono text-xs flex items-center justify-between">
                      <span>{chosenDomain}</span>
                      <Check className="w-3.5 h-3.5 text-violet-400" />
                    </div>
                  )}
                </div>

                {/* Domain Selector Chips */}
                <div className="flex items-center flex-wrap gap-1.5 mt-1">
                  {DOMAIN_PRESETS.map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => {
                        setChosenDomain(d);
                        setIsCustomDomain(false);
                      }}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-medium border transition-colors ${
                        !isCustomDomain && chosenDomain === d
                          ? 'bg-violet-600/30 border-violet-500 text-violet-200'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      @{d}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      setIsCustomDomain(true);
                      if (!customDomainInput) setCustomDomainInput('yourchoice.com');
                    }}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-medium border transition-colors ${
                      isCustomDomain
                        ? 'bg-violet-600/30 border-violet-500 text-violet-200'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    + Custom Domain
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-slate-400 font-semibold">Display Name</label>
                <input
                  type="text"
                  placeholder="e.g. Your Name"
                  value={displayNameInput}
                  onChange={(e) => setDisplayNameInput(e.target.value)}
                  className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 outline-none focus:border-violet-500 text-xs"
                />
              </div>
            </>
          )}

          {mode === 'login' && (
            <div className="flex flex-col gap-1.5">
              <label className="text-slate-400 font-semibold flex items-center justify-between">
                <span>Email or Username</span>
                <span className="text-[11px] text-slate-500 font-normal">Supports any @domain.com</span>
              </label>
              <div className="flex items-center rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 text-slate-200 focus-within:border-violet-500">
                <Mail className="w-4 h-4 text-slate-500 mr-2" />
                <input
                  type="text"
                  placeholder="yourname@yourchoice.com or yourname"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="flex-1 bg-transparent outline-none text-xs text-white"
                  required
                />
              </div>
            </div>
          )}

          <div className="flex flex-col gap-1">
            <label className="text-slate-400 font-semibold">Password</label>
            <div className="flex items-center rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 text-slate-200 focus-within:border-violet-500">
              <Lock className="w-4 h-4 text-slate-500 mr-2" />
              <input
                type="password"
                placeholder="••••••••••••"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="flex-1 bg-transparent outline-none text-xs text-white"
                required
              />
            </div>
            <div className="flex items-center gap-1 text-[10px] text-slate-500 mt-0.5">
              <HardDrive className="w-3 h-3 text-emerald-400" />
              <span>Encrypted on disk • Zero-Knowledge keys held locally</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="mt-2 w-full py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-violet-600/30 transition-all disabled:opacity-50"
          >
            <span>
              {isLoading
                ? 'Saving to enclave...'
                : mode === 'login'
                ? 'Sign In to Mailbox'
                : `Provision ${fullRegisterEmail || 'Custom Domain'}`}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Toggle mode */}
        <div className="p-4 bg-[#0d0f17] border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>
            {mode === 'login' ? "Want a custom domain address?" : 'Already have an address?'}
          </span>
          <button
            onClick={() => {
              setMode(mode === 'login' ? 'register' : 'login');
              setErrorMessage('');
            }}
            className="text-violet-400 hover:text-violet-300 font-bold"
          >
            {mode === 'login' ? 'Register Custom Domain' : 'Sign In'}
          </button>
        </div>
      </div>
    </div>
  );
};

