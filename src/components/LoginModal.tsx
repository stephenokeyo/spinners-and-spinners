import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { MIN_PASSWORD_LENGTH } from '../utils/auth';
import { X, Lock } from 'lucide-react';
import { api } from '../utils/api';

export const LoginModal: React.FC = () => {
  const { isLoginModalOpen, setIsLoginModalOpen, hasAdmin, login, setupAdmin } = useApp();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [setupCode, setSetupCode] = useState('');
  const [code, setCode] = useState('');
  const [needsCode, setNeedsCode] = useState(false);
  const [byEmail, setByEmail] = useState(false);
  const [resetMode, setResetMode] = useState(false);
  const [resetCode, setResetCode] = useState('');
  const [notice, setNotice] = useState<string | null>(null);

  const resetTwoFactor = async () => {
    setBusy(true);
    setError(null);
    const r = await api('POST', '/api/2fa/reset', { email: email.trim(), password, setupCode: resetCode });
    setBusy(false);
    if (r.success) {
      setResetMode(false);
      setNeedsCode(false);
      setCode('');
      setResetCode('');
      setNotice('Two-factor was reset. Sign in with your password, then set up your authenticator again.');
    } else {
      setError(r.error || 'Reset failed.');
    }
  };
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (!isLoginModalOpen) return null;

  const close = () => {
    setIsLoginModalOpen(false);
    setPassword('');
    setCode('');
    setNeedsCode(false);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const result = hasAdmin ? await login(email, password, needsCode ? code : undefined) : await setupAdmin(name, email, password, setupCode);
    setBusy(false);
    if (result.needsCode) { setNeedsCode(true); setByEmail(result.channel === 'email'); }
    if (result.success) {
          setPassword('');
          setCode('');
          setNeedsCode(false);
          setSetupCode('');
    } else {
      setError(result.error || 'Something went wrong.');
    }
  };

  const inputCls = 'w-full bg-neutral-900 border border-white/10 rounded px-3 py-2 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#c5a059]';

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4" onClick={close}>
      <form
        onSubmit={handleSubmit}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-sm bg-[#121417] border border-white/10 rounded p-6 space-y-4"
      >
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-[#c5a059]">
              <Lock className="w-4 h-4" />
              <span>{hasAdmin ? 'Partner / Admin Login' : 'First-time Setup'}</span>
            </div>
            <h2 className="font-editorial text-2xl text-white mt-1">
              {hasAdmin ? 'Sign in' : 'Create the admin account'}
            </h2>
          </div>
          <button type="button" onClick={close} className="text-neutral-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {!hasAdmin && (
          <>
            <p className="text-xs text-neutral-400">
              No admin exists yet. Create the global admin account — it can then add partners and give them logins.
            </p>
            <input required value={name} onChange={e => setName(e.target.value)} placeholder="Your name" className={inputCls} />
            <input
              required
              type="password"
              autoComplete="off"
              value={setupCode}
              onChange={e => setSetupCode(e.target.value)}
              placeholder="Setup code (from your server settings)"
              className={inputCls}
            />
          </>
        )}

        <input
          required
          type="email"
          autoComplete="username"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="Email"
          className={inputCls}
        />
        <input
          required
          type="password"
          autoComplete={hasAdmin ? 'current-password' : 'new-password'}
          minLength={hasAdmin ? undefined : MIN_PASSWORD_LENGTH}
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder={hasAdmin ? 'Password' : `Password (min ${MIN_PASSWORD_LENGTH} characters)`}
          className={inputCls}
        />

        {hasAdmin && needsCode && !resetMode && (
          <input
            required
            autoFocus
            inputMode="numeric"
            autoComplete="one-time-code"
            value={code}
            onChange={e => setCode(e.target.value)}
            placeholder={byEmail ? '6-digit code from your email' : 'Authenticator code (or recovery code)'}
            className={inputCls}
          />
        )}

        {hasAdmin && needsCode && !resetMode && !byEmail && (
          <button type="button" onClick={() => { setResetMode(true); setError(null); }} className="text-xs text-neutral-400 underline hover:text-white">
            Lost your authenticator and recovery codes?
          </button>
        )}

        {resetMode && (
          <div className="space-y-2">
            <p className="text-xs text-neutral-400">
              Enter your email and password above, plus the server setup code (the SETUP_TOKEN set in Render), then reset.
            </p>
            <input type="password" autoComplete="off" value={resetCode} onChange={e => setResetCode(e.target.value)} placeholder="Server setup code" className={inputCls} />
            <button
              type="button"
              disabled={busy || !resetCode || !email || !password}
              onClick={resetTwoFactor}
              className="w-full py-2 text-xs font-semibold tracking-wider uppercase text-white bg-red-700 hover:bg-red-600 disabled:opacity-60 rounded"
            >
              Reset two-factor
            </button>
            <button type="button" onClick={() => setResetMode(false)} className="text-xs text-neutral-400 underline hover:text-white">
              Back
            </button>
          </div>
        )}

        {notice && <p className="text-xs text-emerald-300">{notice}</p>}
        {error && <p className="text-xs text-red-300">{error}</p>}

        <button
          type="submit"
          disabled={busy}
          className="w-full py-2.5 text-xs font-semibold tracking-wider uppercase text-black bg-[#c5a059] hover:bg-[#d4b069] disabled:opacity-60 rounded transition-colors"
        >
          {busy ? 'Please wait…' : hasAdmin ? 'Sign in' : 'Create admin & sign in'}
        </button>
      </form>
    </div>
  );
};
