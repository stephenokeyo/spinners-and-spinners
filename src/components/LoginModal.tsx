import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { MIN_PASSWORD_LENGTH } from '../utils/auth';
import { X, Lock } from 'lucide-react';

export const LoginModal: React.FC = () => {
  const { isLoginModalOpen, setIsLoginModalOpen, hasAdmin, login, setupAdmin } = useApp();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [setupCode, setSetupCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (!isLoginModalOpen) return null;

  const close = () => {
    setIsLoginModalOpen(false);
    setPassword('');
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const result = hasAdmin ? await login(email, password) :     await setupAdmin(name, email, password, setupCode);
    setBusy(false);
    if (result.success) {
      setPassword('');
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
