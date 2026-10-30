import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { Key, LogIn, LogOut, Clock } from 'lucide-react';

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
          <span className="text-[#a1a1aa] text-[11px] tracking-wide">Welcome to texStyle</span>
        )}

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
            className="px-3 py-1 bg-[#c5a059] hover:bg-[#d4b069] text-black rounded text-[11px] font-semibold flex items-center gap-1.5 transition-colors"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Partner / Admin Login</span>
          </button>
        )}
      </div>
    </div>
  );
};
