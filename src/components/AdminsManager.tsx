import React, { useCallback, useEffect, useState } from 'react';
import { ShieldCheck, ShieldAlert, Trash2, UserPlus, RotateCcw } from 'lucide-react';
import { api } from '../utils/api';
import { MIN_PASSWORD_LENGTH } from '../utils/auth';

interface AdminRow { id: string; name: string; email: string; twoFactor: boolean; you: boolean }

export const AdminsManager: React.FC = () => {
  const [admins, setAdmins] = useState<AdminRow[]>([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const r = await api('GET', '/api/admins');
    if (r.success) setAdmins(r.admins);
  }, []);
  useEffect(() => { void load(); }, [load]);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    const r = await api('POST', '/api/admins', { name, email, password });
    setBusy(false);
    if (!r.success) return setMsg({ ok: false, text: r.error || 'Could not add the admin.' });
    setMsg({ ok: true, text: `${email} is now a global admin. Share the password with them privately. On first login they must set up their authenticator app before they can use admin features.` });
    setName(''); setEmail(''); setPassword('');
    void load();
  };

  const remove = async (a: AdminRow) => {
    if (!window.confirm(`Remove ${a.name} (${a.email}) as global admin?`)) return;
    const r = await api('DELETE', `/api/admins/${encodeURIComponent(a.id)}`);
    if (!r.success) return setMsg({ ok: false, text: r.error || 'Could not remove.' });
    void load();
  };

  const reset2fa = async (a: AdminRow) => {
    if (!window.confirm(`Reset the authenticator for ${a.email}? They will be signed out and must set it up again.`)) return;
    const r = await api('POST', `/api/admins/${encodeURIComponent(a.id)}/reset-2fa`);
    setMsg({ ok: r.success, text: r.success ? `Authenticator reset for ${a.email}.` : r.error || 'Could not reset.' });
    void load();
  };

  return (
    <section className="bg-[#121417] border border-white/10 rounded-lg p-5 space-y-4 mt-8">
      <div>
        <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Global admins</h3>
        <p className="text-[11px] text-neutral-400 mt-1">
          A global admin has exactly the same rights as you. Each one must sign in and set up an authenticator app (two-factor) before any admin feature works.
        </p>
      </div>

      <form onSubmit={add} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end text-xs">
        <label className="sm:col-span-3 space-y-1">
          <span className="text-neutral-400">Full name</span>
          <input value={name} onChange={e => setName(e.target.value)} required className="w-full bg-white/5 border border-white/10 rounded px-2 py-2 text-white" />
        </label>
        <label className="sm:col-span-4 space-y-1">
          <span className="text-neutral-400">Login email</span>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full bg-white/5 border border-white/10 rounded px-2 py-2 text-white" />
        </label>
        <label className="sm:col-span-3 space-y-1">
          <span className="text-neutral-400">Temporary password (min {MIN_PASSWORD_LENGTH})</span>
          <input type="text" value={password} onChange={e => setPassword(e.target.value)} required minLength={MIN_PASSWORD_LENGTH} autoComplete="off" className="w-full bg-white/5 border border-white/10 rounded px-2 py-2 text-white" />
        </label>
        <button type="submit" disabled={busy} className="sm:col-span-2 flex items-center justify-center gap-1 px-3 py-2 bg-amber-500 hover:bg-amber-400 text-black font-semibold uppercase tracking-wider rounded disabled:opacity-60">
          <UserPlus className="w-3.5 h-3.5" /> Add admin
        </button>
      </form>
      {msg && <p className={`text-xs ${msg.ok ? 'text-emerald-400' : 'text-red-400'}`}>{msg.text}</p>}

      <ul className="divide-y divide-white/5 text-xs">
        {admins.map(a => (
          <li key={a.id} className="flex flex-wrap items-center gap-3 py-2">
            <span className="text-white font-medium">{a.name}{a.you && <span className="ml-1 text-neutral-500">(you)</span>}</span>
            <span className="text-neutral-400 truncate min-w-0 flex-1">{a.email}</span>
            <span className={`flex items-center gap-1 ${a.twoFactor ? 'text-emerald-400' : 'text-amber-400'}`}>
              {a.twoFactor ? <ShieldCheck className="w-3.5 h-3.5" /> : <ShieldAlert className="w-3.5 h-3.5" />}
              {a.twoFactor ? '2FA active' : 'Awaiting 2FA setup'}
            </span>
            {!a.you && (
              <>
                <button onClick={() => void reset2fa(a)} className="text-neutral-400 hover:text-white" title="Reset authenticator" aria-label={`Reset authenticator for ${a.email}`}>
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button onClick={() => void remove(a)} className="text-neutral-500 hover:text-red-400" title="Remove admin" aria-label={`Remove ${a.email}`}>
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
};
