import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { Key, LogOut, Clock, User } from 'lucide-react';

const LiveClock: React.FC = () => {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <span className="flex items-center gap-1.5 text-neutral-300 font-mono text-[11px] whitespace-nowrap" title={Intl.DateTimeFormat().resolvedOptions().timeZone}>
      <Clock className="w-3.5 h-3.5 text-[#c5a059]" />
      <span className="hidden sm:inline">{now.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })} ·</span>
      <span>{now.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
    </span>
  );
};

const MESSAGES = [
  { label: 'Purpose', text: 'Empower Authentic African Fashion' },
  { label: 'Vision', text: 'To become the premier brand for all seasonal apparel in the East African region, ensuring that every wardrobe and every household around the globe includes a piece of texStyle.' },
  { label: 'Values', text: 'Honesty & Integrity, Long-term forward-thinking, Continuous learning, Exceeding expectations, and Resilience & Determination.' }
];

const BrandTicker: React.FC = () => {
  const [i, setI] = useState(0);
  const m = MESSAGES[i];
  const seconds = Math.max(10, Math.round((m.label.length + m.text.length) * 0.17) + 8);
  return (
    <div className="flex-1 min-w-0 overflow-hidden whitespace-nowrap" aria-live="off">
      <span
        key={i}
        className="ticker-rtl inline-block text-[12px] text-neutral-200"
        style={{ animationDuration: `${seconds}s` }}
        onAnimationEnd={() => setI(n => (n + 1) % MESSAGES.length)}
      >
        <strong className="text-[#c5a059] uppercase tracking-wider mr-2">{m.label}:</strong>{m.text}
      </span>
    </div>
  );
};

export const PersonaBar: React.FC = () => {
  const { currentUser, logout, setIsLoginModalOpen } = useApp();
  const signedIn = currentUser.role !== 'client';

  return (
    <div className="bg-[#121417] border-b border-white/10 px-4 py-2 text-xs">
      <div className="w-full flex flex-wrap items-center justify-between gap-3">
        {signedIn ? (
        <div className="flex items-center gap-2">
          <span className="text-[#a1a1aa] uppercase tracking-wider text-[11px] font-medium flex items-center gap-1.5">
            <Key className="w-3.5 h-3.5 text-[#c5a059]" />
            Signed in:
          </span>
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded px-2 py-1">
            <span className="w-5 h-5 rounded-full bg-[#c5a059]/20 text-[#c5a059] flex items-center justify-center font-bold text-[10px]">
              {currentUser.avatar}
            </span>
            <span className="font-semibold text-white">{currentUser.name}</span>
            <span className="text-white/40">·</span>
            <span className={`uppercase font-mono text-[10px] tracking-wider ${
              currentUser.role === 'admin' ? 'text-amber-400 font-bold' : currentUser.role === 'partner' ? 'text-emerald-400 font-medium' : 'text-sky-300 font-medium'
            }`}>
              {currentUser.role === 'admin' ? 'Global Admin' : currentUser.role === 'partner' ? `Partner (${currentUser.partnerName})` : 'Customer'}
            </span>
          </div>
        </div>
        ) : (
          <BrandTicker />
        )}

        {signedIn && <div className="hidden md:flex flex-1 min-w-0"><BrandTicker /></div>}

        {signedIn ? (
          <div className="flex items-center gap-3">
            <LiveClock />
            <button
              onClick={logout}
              className="px-3 py-1 bg-white/5 hover:bg-white/10 text-white/80 border border-white/10 rounded text-[11px] font-medium flex items-center gap-1.5 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log out</span>
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsLoginModalOpen(true)}
            title="Partner / Admin login"
            aria-label="Partner / Admin login"
            className="w-8 h-8 rounded-full bg-neutral-300 hover:bg-white text-neutral-500 flex items-center justify-center overflow-hidden transition-colors"
          >
            <User className="w-5 h-5 fill-current" />
          </button>
        )}
      </div>
    </div>
  );
};
