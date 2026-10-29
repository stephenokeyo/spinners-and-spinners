import React from 'react';
import { useApp } from '../context/AppContext';
import { Key, LogIn, LogOut } from 'lucide-react';

export const PersonaBar: React.FC = () => {
  const { currentUser, logout, setIsLoginModalOpen } = useApp();
  const signedIn = currentUser.role !== 'client';

  return (
    <div className="bg-[#121417] border-b border-white/10 px-4 py-2 text-xs">
      <div className="w-full flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-[#a1a1aa] uppercase tracking-wider text-[11px] font-medium flex items-center gap-1.5">
            <Key className="w-3.5 h-3.5 text-[#c5a059]" />
            {signedIn ? 'Signed in:' : 'Browsing as:'}
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

        {signedIn ? (
          <button
            onClick={logout}
            className="px-3 py-1 bg-white/5 hover:bg-white/10 text-white/80 border border-white/10 rounded text-[11px] font-medium flex items-center gap-1.5 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Log out</span>
          </button>
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
