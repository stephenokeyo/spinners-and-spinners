import React from 'react';
import { useApp } from '../context/AppContext';
import { ShoppingBag, Lock, FolderLock, ShieldCheck, Compass, Sparkles } from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    currentUser,
    currentView,
    navigateTo,
    orders,
    chatThreads,
    partners,
    canAccessCommunication
  } = useApp();

  // Calculate unread or active orders for client or partner
  const relevantOrders = orders.filter(o => {
    if (currentUser.role === 'admin') return true;
    if (currentUser.role === 'client') return o.clientId === currentUser.id;
    if (currentUser.role === 'partner') return o.partnerId === currentUser.partnerId;
    return false;
  });

  const accessibleChats = chatThreads.filter(t => canAccessCommunication(t));

  return (
    <header className="sticky top-0 z-40 bg-[#0c0d0e]/95 backdrop-blur-md border-b border-white/10">
      <div className="w-full flex flex-wrap md:flex-nowrap items-center justify-between gap-x-4 gap-y-3 md:gap-8 px-4 md:px-6 py-3 md:py-4">
        {/* Zone 1: Single text element wordmark */}
        <button
          onClick={() => navigateTo('catalog')}
          className="text-left group cursor-pointer min-w-0"
        >
          <span className="font-editorial text-xl sm:text-2xl tracking-[0.12em] sm:tracking-[0.2em] font-medium text-white group-hover:text-[#c5a059] transition-colors whitespace-nowrap shrink-0 block">
           texStyle
          </span>
          <span className="text-[10px] uppercase tracking-[0.3em] text-[#a1a1aa] block -mt-1 font-sans">
            Haute Couture Guild & Direct Brand Webpages
          </span>
        </button>

        {/* Zone 2: 4–5 clean single-line text navigation links */}
        <nav className="flex order-last md:order-none w-full md:w-auto overflow-x-auto md:overflow-visible items-center gap-5 md:gap-7 text-sm font-medium text-neutral-300">
          <button
            onClick={() => navigateTo('catalog')}
            className={`hover:text-white transition-colors whitespace-nowrap shrink-0 pb-0.5 border-b-2 ${
              currentView === 'catalog' ? 'border-[#c5a059] text-white' : 'border-transparent text-neutral-400'
            }`}
          >
            All Products
          </button>

          {/* Partner Houses Quick Dropdown / Link */}
          <button
            onClick={() => navigateTo('partner', '')}
            className={`hover:text-white transition-colors whitespace-nowrap shrink-0 pb-0.5 border-b-2 ${
              currentView === 'partner' ? 'border-[#c5a059] text-white' : 'border-transparent text-neutral-400'
            }`}
          >
            Partner Boutiques
          </button>

          {/* Partner File Vault link: partners and admin only */}
          {currentUser.role !== 'client' && (
            <button
              onClick={() => {
                if (currentUser.role === 'partner' && currentUser.partnerId) {
                  navigateTo('dashboard', currentUser.partnerId);
                } else {
                  navigateTo('dashboard');
                }
              }}
              className={`hover:text-white transition-colors whitespace-nowrap shrink-0 pb-0.5 border-b-2 flex items-center gap-1.5 ${
                currentView === 'dashboard' ? 'border-[#c5a059] text-white' : 'border-transparent text-neutral-400'
              }`}
            >
              <FolderLock className="w-3.5 h-3.5 text-[#c5a059]" />
              <span>Partner Files Vault</span>
            </button>
          )}

          {/* Orders / Commissions */}
          <button
            onClick={() => navigateTo('orders')}
            className={`hover:text-white transition-colors whitespace-nowrap shrink-0 pb-0.5 border-b-2 flex items-center gap-1.5 ${
              currentView === 'orders' ? 'border-[#c5a059] text-white' : 'border-transparent text-neutral-400'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5 text-neutral-400" />
            <span>Orders & Fulfillments</span>
            {relevantOrders.length > 0 && (
              <span className="text-[11px] font-mono text-[#c5a059] ml-0.5">
                ({relevantOrders.length})
              </span>
            )}
          </button>

          {/* About */}
          <button
            onClick={() => navigateTo('about')}
            className={`hover:text-white transition-colors whitespace-nowrap shrink-0 pb-0.5 border-b-2 ${
              currentView === 'about' ? 'border-[#c5a059] text-white' : 'border-transparent text-neutral-400'
            }`}
          >
            About Us
          </button>

          {/* Contact */}
          <button
            onClick={() => navigateTo('contact')}
            className={`hover:text-white transition-colors whitespace-nowrap shrink-0 pb-0.5 border-b-2 ${
              currentView === 'contact' ? 'border-[#c5a059] text-white' : 'border-transparent text-neutral-400'
            }`}
          >
            Contact Us
          </button>

          {/* Admin link if Admin */}
          {currentUser.role === 'admin' && (
            <button
              onClick={() => navigateTo('dashboard')}
              className="text-amber-400 hover:text-amber-300 font-semibold text-xs tracking-wider uppercase border border-amber-500/30 px-2 py-0.5 rounded bg-amber-500/10 whitespace-nowrap"
            >
              Executive Console
            </button>
          )}
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-3 min-w-0 max-w-full">
          {currentUser.role === 'partner' ? (
            <button
              onClick={() => navigateTo('dashboard', currentUser.partnerId)}
              className="px-4 py-2 text-xs font-semibold tracking-wider uppercase text-black bg-[#c5a059] hover:bg-[#d4b069] rounded transition-all md:whitespace-nowrap shadow-sm"
            >
              Enter {currentUser.partnerName} Spinner
            </button>
          ) : currentUser.role === 'admin' ? (
            <button
              onClick={() => navigateTo('dashboard')}
              className="px-4 py-2 text-xs font-semibold tracking-wider uppercase text-white bg-neutral-800 hover:bg-neutral-700 border border-white/20 rounded transition-all md:whitespace-nowrap"
            >
              Omni Admin Oversight
            </button>
          ) : (
            <button
              onClick={() => navigateTo('partner', '')}
              className="px-4 py-2 text-xs font-semibold tracking-wider uppercase text-black bg-[#c5a059] hover:bg-[#d4b069] rounded transition-all md:whitespace-nowrap shadow-sm"
            >
              Visit Partner Boutiques
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
