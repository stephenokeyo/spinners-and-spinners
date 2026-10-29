import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Partner, Product } from '../types';
import { formatPrice } from '../utils/helpers';
import { VideoButton } from './VideoButton';
import {
  MessageSquare,
  ShieldCheck,
  Lock,
  ArrowLeft,
  ShoppingBag,
  Sparkles,
  Scissors,
  Check,
  ExternalLink,
  ShieldAlert,
  Send,
  Eye,
  FolderLock
} from 'lucide-react';

export const PartnerWebpage: React.FC = () => {
  const {
    currentUser,
    partners,
    products,
    selectedPartnerId,
    selectedProductId,
    navigateTo,
    openChatForPartner,
    setCheckoutProduct,
    setIsCheckoutModalOpen,
    chatThreads,
    sendChatMessage,
    canAccessCommunication,
    canAccessPartnerFiles
  } = useApp();
  const { setWhatsappProduct } = useApp();

  const partner = partners.find(p => p.id === selectedPartnerId) || partners[0];
  const partnerProducts = products.filter(p => p.partnerId === partner.id && p.stock !== 0);
  const activeProduct = partnerProducts.find(p => p.id === selectedProductId) || partnerProducts[0];

  const [selectedSize, setSelectedSize] = useState<string>(activeProduct?.sizes[0] || 'Standard Spinners&Spinners');
  const [inlineMessage, setInlineMessage] = useState<string>('');

  // Find active chat thread between current user and this partner
  const currentThread = chatThreads.find(
    t => t.partnerId === partner.id && t.clientId === currentUser.id
  );

  const isOwnerPartner = currentUser.role === 'partner' && currentUser.partnerId === partner.id;
  const isOtherPartner = currentUser.role === 'partner' && currentUser.partnerId !== partner.id;
  const isAdmin = currentUser.role === 'admin';

  const handleSendInlineChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inlineMessage.trim()) return;

    if (!currentThread) {
      openChatForPartner(partner.id, activeProduct?.id);
    } else {
      sendChatMessage(currentThread.id, inlineMessage);
    }
    setInlineMessage('');
  };

  return (
    <div className="min-h-screen bg-[#0a0b0d] text-[#f4f2ee]">
      {/* Top Breadcrumb & Partner Switcher */}
      <div className="bg-[#121417] border-b border-white/10 px-6 py-3">
        <div className="w-full flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigateTo('catalog')}
              className="text-neutral-400 hover:text-white flex items-center gap-1 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Global Catalog</span>
            </button>
            <span className="text-white/20">/</span>
            <span className="text-[#c5a059] font-medium">{partner.name} Boutique</span>
          </div>

          {/* Quick House Switcher */}
          <div className="flex items-center gap-2">
            <span className="text-neutral-400">Switch House Boutique:</span>
            <div className="flex items-center gap-1">
              {partners.map(p => (
                <button
                  key={p.id}
                  onClick={() => navigateTo('partner', p.id)}
                  className={`px-2.5 py-1 rounded text-[11px] transition-colors ${
                    p.id === partner.id
                      ? 'bg-white/15 text-white font-medium border border-white/20'
                      : 'text-neutral-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* RBAC Cross-Partner Warning Banner (if another partner is browsing) */}
      {isOtherPartner && (
        <div className="bg-amber-950/40 border-b border-amber-500/30 px-6 py-2.5 text-xs text-amber-200">
          <div className="w-full flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                <strong>RBAC Quarantined:</strong> You are currently authenticated as{' '}
                <span className="underline font-semibold">{currentUser.name} ({currentUser.partnerName})</span>. You are viewing {partner.name}’s public boutique. You have <strong>zero access</strong> to {partner.name}’s internal files, tech packs, or private client purchase communications.
              </span>
            </div>
            <button
              onClick={() => navigateTo('dashboard', currentUser.partnerId)}
              className="px-3 py-1 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-100 rounded text-[11px] font-medium whitespace-nowrap"
            >
              Return to My Spinner ({currentUser.partnerName})
            </button>
          </div>
        </div>
      )}

      {/* Partner Brand Hero & Ethos Banner */}
      <section className="relative border-b border-white/10 bg-gradient-to-b from-neutral-900/60 to-[#0a0b0d] py-12 px-6">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-8 space-y-4">
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <span className="uppercase tracking-[0.25em] text-[#c5a059] font-medium">
                {partner.location}
              </span>
              <span className="text-white/20">·</span>
              <span className="text-neutral-400 font-mono">Established {partner.founded}</span>
              <span className="text-white/20">·</span>
              <span className="text-neutral-300">Lead Artisan: {partner.leadDesigner}</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-editorial font-light text-white tracking-tight">
              {partner.name}
            </h1>

            {partner.ethos && (
              <p className="text-lg font-editorial italic text-neutral-300 max-w-2xl leading-relaxed">
                "{partner.ethos}"
              </p>
            )}

            {partner.story && (
              <p className="text-sm text-neutral-400 max-w-2xl leading-relaxed font-light">
                {partner.story}
              </p>
            )}

            {/* Direct Vault Entry CTA for Owner or Admin */}
            <div className="pt-2 flex items-center gap-3">
              {(isOwnerPartner || isAdmin) ? (
                <button
                  onClick={() => navigateTo('dashboard', partner.id)}
                  className="px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 rounded text-xs font-medium flex items-center gap-2 transition-colors"
                >
                  <FolderLock className="w-4 h-4 text-emerald-400" />
                  <span>Open {partner.name} Private File Vault & Spinner Console</span>
                </button>
              ) : (
                <div className="text-xs text-neutral-400 flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded border border-white/10">
                  <Lock className="w-3.5 h-3.5 text-[#c5a059]" />
                  <span>Partner internal vault restricted to {partner.name} directors and Platform Admin.</span>
                </div>
              )}
            </div>
          </div>

          {/* Right Partner Showcase Card */}
          <div className="lg:col-span-4">
            <div className="relative aspect-[4/3] rounded overflow-hidden border border-white/15 shadow-xl bg-neutral-900">
              <img
                src={partner.heroImage}
                alt={partner.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-3 left-3 right-3 text-xs">
                <span className="text-[10px] uppercase tracking-wider text-[#c5a059]">Boutique Showroom</span>
                <p className="text-sm font-editorial text-white">{partner.tagline}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contiguous Purchase Module & Product Spotlight */}
      {activeProduct && (
        <section className="w-full px-6 py-12 border-b border-white/10">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-[#c5a059]">
              <Scissors className="w-4 h-4" />
              <span>Selected Spinners&Spinners Piece from {partner.name}</span>
            </div>
            <span className="text-xs text-neutral-400">
              Direct spinner order · Hand-cut to client specifications
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            {/* Gallery Left */}
            <div className="lg:col-span-7 space-y-4">
              <div className="relative aspect-[4/3] rounded-sm overflow-hidden border border-white/10 bg-neutral-900 group">
                <img
                  src={activeProduct.image}
                  alt={activeProduct.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-sm border border-white/10 px-3 py-1 text-xs text-[#c5a059] uppercase tracking-wider">
                  {partner.name} Spinner Original
                </div>
              </div>

              {/* Handcrafting Details & Materials */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 bg-white/[0.02] border border-white/10 rounded">
                <div>
                  <h4 className="text-xs uppercase tracking-wider text-neutral-400 font-semibold mb-2">
                    Spinner Specifications
                  </h4>
                  <ul className="space-y-1.5 text-xs text-neutral-300">
                    {activeProduct.details.map((detail, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-[#c5a059] mt-0.5">•</span>
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="text-xs uppercase tracking-wider text-neutral-400 font-semibold mb-2">
                    Fabric & Material Provenance
                  </h4>
                  <ul className="space-y-1.5 text-xs text-neutral-300">
                    {activeProduct.materials.map((mat, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-[#c5a059] shrink-0 mt-0.5" />
                        <span>{mat}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4 pt-3 border-t border-white/5 text-[11px] text-neutral-400">
                    Lead time: <strong className="text-white">{activeProduct.leadTime}</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Purchase & Spinner Concierge Module Right */}
            <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
              <div className="p-6 rounded bg-neutral-950 border border-white/15 space-y-6">
                <div>
                  <div className="flex items-center justify-between text-xs text-neutral-400 mb-1">
                    <span>{activeProduct.category}</span>
                    <span className="text-[#c5a059] font-mono">Spinners&Spinners Couture</span>
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-editorial font-medium text-white">
                    {activeProduct.title}
                  </h2>

                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="text-2xl font-mono font-semibold text-white">
                      {formatPrice(activeProduct)}
                    </span>
                    <span className="text-xs text-neutral-400">including Spinners&Spinners fitting consultation</span>
                  </div>
                </div>

                <p className="text-xs text-neutral-300 leading-relaxed font-light">
                  {activeProduct.description}
                </p>

                {/* Sizing Selection */}
                <div>
                  <label className="block text-xs uppercase tracking-wider text-neutral-400 font-medium mb-2">
                    Select Sizing or Spinners&Spinners Fitting:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {activeProduct.sizes.map(size => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setSelectedSize(size)}
                        className={`px-3 py-2 text-xs rounded border text-left transition-all ${
                          selectedSize === size
                            ? 'bg-[#c5a059]/15 border-[#c5a059] text-white font-medium'
                            : 'bg-white/5 border-white/10 text-neutral-300 hover:border-white/20'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Primary Actions: Order & Chat */}
                <div className="space-y-3 pt-2">
                  {activeProduct.price > 0 && (
                    <button
                      onClick={() => {
                        setCheckoutProduct(activeProduct);
                        setIsCheckoutModalOpen(true);
                      }}
                      className="w-full py-3 px-4 bg-[#c5a059] hover:bg-[#d4b069] text-black font-semibold text-xs tracking-wider uppercase rounded transition-all flex items-center justify-center gap-2 shadow-lg"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      <span>Commission this Piece ({formatPrice(activeProduct)})</span>
                    </button>
                  )}

                  {partner.whatsapp && (
                    <button
                      onClick={() => setWhatsappProduct(activeProduct)}
                      className="w-full py-2.5 px-4 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-200 font-medium text-xs tracking-wider uppercase rounded transition-all flex items-center justify-center gap-2"
                    >
                      <span>Chat with {partner.name} on WhatsApp</span>
                    </button>
                  )}

                  <button
                    onClick={() => openChatForPartner(partner.id, activeProduct.id)}
                    className="w-full py-2.5 px-4 bg-white/5 hover:bg-white/10 border border-white/15 text-white font-medium text-xs tracking-wider uppercase rounded transition-all flex items-center justify-center gap-2"
                  >
                    <MessageSquare className="w-4 h-4 text-[#c5a059]" />
                    <span>Inquire with {partner.name} Concierge</span>
                  </button>
                </div>

                {/* Privacy & Communication Isolation Guarantee */}
                <div className="p-3.5 bg-[#121417] border border-white/10 rounded space-y-1.5 text-xs">
                  <div className="flex items-center gap-1.5 text-[#c5a059] font-medium text-[11px] uppercase tracking-wider">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Strict Transactional Isolation Guarantee</span>
                  </div>
                  <p className="text-[11px] text-neutral-300 leading-relaxed font-light">
                    When you purchase or converse regarding this piece, all chat transcripts, Spinners&amp;Spinners fashions, and order logs are strictly restricted to <strong>you</strong> and <strong>{partner.name}</strong>. No competing partner can view your dialogues at all unless logged in as Platform Admin.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Embedded Live Spinner Chat directly on this Partner Webpage */}
      <section className="w-full px-6 py-12 border-b border-white/10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4 space-y-3">
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-[#c5a059]">
              <MessageSquare className="w-4 h-4" />
              <span>Live Partner Concierge</span>
            </div>
            <h3 className="text-2xl font-editorial font-medium text-white">
              Chat directly with {partner.name}
            </h3>
            <p className="text-xs text-neutral-400 leading-relaxed font-light">
              Ask {partner.leadDesigner} and the {partner.name} spinner team about custom tailoring, rush gala deadlines, fabric weight, or private fittings in {partner.location}.
            </p>

            <div className="p-3 bg-white/[0.02] border border-white/10 rounded text-xs space-y-2">
              <span className="text-[10px] uppercase tracking-wider text-[#a1a1aa] block font-semibold">
                Quick Inquiries:
              </span>
              <button
                type="button"
                onClick={() => {
                  if (!currentThread) openChatForPartner(partner.id, activeProduct?.id);
                  sendChatMessage(currentThread?.id || `thread-${currentUser.id}-${partner.id}`, `Hello ${partner.leadDesigner}, I would like to request silk swatches for this collection.`);
                }}
                className="w-full text-left p-2 rounded bg-white/5 hover:bg-white/10 text-[11px] text-neutral-300 transition-colors"
              >
                "Request fabric and swatch sample set"
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!currentThread) openChatForPartner(partner.id, activeProduct?.id);
                  sendChatMessage(currentThread?.id || `thread-${currentUser.id}-${partner.id}`, `Could you accommodate custom chest and sleeve measurements for our next gala?`);
                }}
                className="w-full text-left p-2 rounded bg-white/5 hover:bg-white/10 text-[11px] text-neutral-300 transition-colors"
              >
                "Custom measurement & shoulder fit consultation"
              </button>
            </div>
          </div>

          {/* Chat Stream Box */}
          <div className="lg:col-span-8 bg-neutral-950 border border-white/15 rounded-sm p-5 flex flex-col h-[400px]">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="font-medium text-white">{partner.name} Spinner Concierge</span>
                <span className="text-neutral-500 font-mono text-[11px]">({partner.leadDesigner})</span>
              </div>
              <span className="text-[11px] text-neutral-400 flex items-center gap-1 font-mono">
                <Lock className="w-3 h-3 text-[#c5a059]" />
                {currentThread?.hasPurchase ? 'Confidential Purchase Lock Active' : 'Direct Encrypted Channel'}
              </span>
            </div>

            {/* Message History */}
            <div className="flex-1 overflow-y-auto py-4 space-y-3 pr-2">
              {currentThread && currentThread.messages.length > 0 ? (
                currentThread.messages.map(msg => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${
                      msg.isSystemNotice
                        ? 'items-center my-3'
                        : msg.senderId === currentUser.id
                        ? 'items-end'
                        : 'items-start'
                    }`}
                  >
                    {msg.isSystemNotice ? (
                      <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs rounded max-w-lg text-center leading-relaxed">
                        {msg.content}
                      </div>
                    ) : (
                      <div
                        className={`max-w-[80%] rounded px-3.5 py-2.5 text-xs leading-relaxed ${
                          msg.senderId === currentUser.id
                            ? 'bg-[#c5a059] text-black font-medium'
                            : 'bg-white/10 text-neutral-200 border border-white/10'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3 text-[10px] opacity-75 mb-1">
                          <span className="font-semibold">{msg.senderName}</span>
                          <span>{msg.timestamp}</span>
                        </div>
                        <p>{msg.content}</p>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center text-neutral-500 text-xs p-6 space-y-2">
                  <MessageSquare className="w-8 h-8 text-neutral-600 stroke-1" />
                  <p>No conversation initiated yet with {partner.name}.</p>
                  <p className="text-[11px] text-neutral-600">Send an inquiry below to chat with {partner.leadDesigner} and the team.</p>
                </div>
              )}
            </div>

            {/* Input Form */}
            <form onSubmit={handleSendInlineChat} className="pt-3 border-t border-white/10 flex items-center gap-2">
              <input
                type="text"
                value={inlineMessage}
                onChange={e => setInlineMessage(e.target.value)}
                placeholder={`Message ${partner.name} spinner...`}
                className="flex-1 bg-white/5 border border-white/10 rounded px-3.5 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#c5a059]"
              />
              <button
                type="submit"
                disabled={!inlineMessage.trim()}
                className="px-4 py-2 bg-[#c5a059] hover:bg-[#d4b069] disabled:opacity-40 text-black font-semibold text-xs rounded transition-colors flex items-center gap-1.5"
              >
                <span>Send</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Complete Partner Catalog Collection */}
      <section className="w-full px-6 py-14">
        <div className="flex items-center justify-between mb-8 border-b border-white/10 pb-4">
          <div>
            <h3 className="font-editorial text-2xl text-white font-medium">
              Complete {partner.name} Collection
            </h3>
            <p className="text-xs text-neutral-400 mt-1">
              Handmade exclusively in their {partner.location} workshop
            </p>
          </div>
          <span className="text-xs font-mono text-neutral-400">
            {partnerProducts.length} pieces available
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {partnerProducts.map(p => (
            <div
              key={p.id}
              onClick={() => navigateTo('partner', partner.id, p.id)}
              className={`p-4 rounded border transition-all cursor-pointer ${
                p.id === activeProduct?.id
                  ? 'bg-white/[0.06] border-[#c5a059]'
                  : 'bg-white/[0.02] border-white/10 hover:border-white/20'
              }`}
            >
              <div className="relative aspect-[4/3] rounded overflow-hidden bg-neutral-900 mb-3">
                <img
                  src={p.image}
                  alt={p.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                {p.videoId && <div className="absolute top-2 right-2"><VideoButton videoId={p.videoId} title={p.title} className="bg-black/75" /></div>}
              </div>
              <div className="flex items-center justify-between text-xs text-neutral-400 mb-1">
                <span>{p.category}</span>
                <span className="font-mono text-white font-medium">
                  {formatPrice(p)}
                </span>
              </div>
              <h4 className="font-editorial text-lg text-white font-medium hover:text-[#c5a059] transition-colors">
                {p.title}
              </h4>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
