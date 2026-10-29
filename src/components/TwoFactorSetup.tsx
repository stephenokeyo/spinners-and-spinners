import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { ShieldCheck } from 'lucide-react';
import { api } from '../utils/api';

export const TwoFactorSetup: React.FC = () => {
  const [secret, setSecret] = useState('');
  const [qr, setQr] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [recovery, setRecovery] = useState<string[] | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void (async () => {
      const r = await api('POST', '/api/2fa/setup');
      if (!r.success) return setError(r.error || 'Could not start setup.');
      setSecret(r.secret);
      setQr(await QRCode.toDataURL(r.otpauth, { margin: 1, width: 220 }));
    })();
  }, []);

  const enable = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const r = await api('POST', '/api/2fa/enable', { code });
    setBusy(false);
    if (r.success) setRecovery(r.recoveryCodes);
    else setError(r.error || 'Something went wrong.');
  };

  return (
    <div className="max-w-md mx-auto my-12 p-6 bg-[#121417] border border-white/10 rounded space-y-4 text-white">
      <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-[#c5a059]">
        <ShieldCheck className="w-4 h-4" />
        <span>Admin security</span>
      </div>
      <h2 className="font-editorial text-2xl">Set up two-factor authentication</h2>

      {recovery ? (
        <>
          <p className="text-sm text-neutral-300">
            Two-factor is on. Save these one-time recovery codes somewhere safe — they are the only way in if you lose your phone. They will not be shown again.
          </p>
          <div className="grid grid-cols-2 gap-2 font-mono text-sm bg-neutral-900 p-3 rounded">
            {recovery.map(c => <span key={c}>{c}</span>)}
          </div>
          <button
            onClick={() => window.location.reload()}
            className="w-full py-2.5 text-xs font-semibold tracking-wider uppercase text-black bg-[#c5a059] hover:bg-[#d4b069] rounded"
          >
            I have saved them — continue
          </button>
        </>
      ) : (
        <form onSubmit={enable} className="space-y-4">
          <p className="text-sm text-neutral-300">
            Admin access requires a code from an authenticator app (Google Authenticator, Microsoft Authenticator, Authy). Scan this QR code, then enter the 6-digit code it shows.
          </p>
          {qr && <img src={qr} alt="Authenticator QR code" className="mx-auto bg-white p-2 rounded" />}
          {secret && (
            <p className="text-xs text-neutral-400 break-all">
              Can't scan? Enter this key manually: <span className="font-mono text-neutral-200">{secret}</span>
            </p>
          )}
          <input
            required
            inputMode="numeric"
            autoComplete="one-time-code"
            value={code}
            onChange={e => setCode(e.target.value)}
            placeholder="6-digit code"
            className="w-full bg-neutral-900 border border-white/10 rounded px-3 py-2 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#c5a059]"
          />
          {error && <p className="text-xs text-red-300">{error}</p>}
          <button
            type="submit"
            disabled={busy || !secret}
            className="w-full py-2.5 text-xs font-semibold tracking-wider uppercase text-black bg-[#c5a059] hover:bg-[#d4b069] disabled:opacity-60 rounded"
          >
            {busy ? 'Checking…' : 'Turn on two-factor'}
          </button>
        </form>
      )}
    </div>
  );
};
