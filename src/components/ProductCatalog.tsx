import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Product, Partner } from '../types';
import { VideoButton } from './VideoButton';
import { formatPrice } from '../utils/helpers';
import { Sparkles, MessageSquare, ArrowRight, ShieldCheck, SlidersHorizontal, Search, CheckCircle } from 'lucide-react';

export const ProductCatalog: React.FC = () => {
  const { products, partners, siteHeroImage, navigateTo, openChatForPartner, setCheckoutProduct, setIsCheckoutModalOpen, setWhatsappProduct } = useApp();
  
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedPartnerFilter, setSelectedPartnerFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categories = ['All', ...new Set(products.filter(p => p.stock !== 0).map(p => p.category))];

  const openWhatsApp = (product: Product) => setWhatsappProduct(product);

  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    const matchesPartner = selectedPartnerFilter === 'All' || product.partnerId === selectedPartnerFilter;
    const matchesSearch =
      product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.partnerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.materials.some(m => m.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesPartner && matchesSearch && product.stock !== 0;
  });

  return (
    <div className="min-h-screen bg-[#0c0d0e] text-[#f4f2ee]">
      {/* Editorial Hero Campaign */}
      <section className="relative border-b border-white/10 overflow-hidden">
        <div className="w-full px-6 py-14 lg:py-20 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-[#c5a059] font-medium">
              <span className="w-6 h-[1px] bg-[#c5a059]" />
              <span>Spinners&Spinners Haute House & Fashion Portals</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-editorial font-light tracking-tight leading-[1.08] text-white text-balance">
              Where independent spinners open their private boutiques.
            </h1>

            <p className="text-base text-neutral-300 leading-relaxed max-w-xl font-light">
              Explore the master catalog of all collective fashions. Select any design to message that partner directly on WhatsApp, with your chosen piece already filled in.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-neutral-400">
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-[#c5a059]" />
                <span>Dedicated Partner Boutiques</span>
              </div>
              <span className="text-white/20">·</span>
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-[#c5a059]" />
                <span>Direct Live Spinner Concierge</span>
              </div>
              <span className="text-white/20">·</span>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#c5a059]" />
                <span>Purchase Isolation Guarantee</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 relative">
            <div className="relative aspect-[16/10] overflow-hidden rounded-sm border border-white/15 shadow-2xl bg-neutral-900 group">
              <img
                src={siteHeroImage}
                alt="Haute couture collective editorial"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center group-hover:scale-102 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent pointer-events-none" />
              
              <div className="absolute bottom-4 left-5 right-5 flex items-end justify-between">
                <div>
                  <span className="text-[10px] uppercase tracking-widest text-[#c5a059]">Spinners&amp;Spinners Partner Houses</span>
                  <p className="text-sm font-editorial text-white">{partners.length} Partner {partners.length === 1 ? 'House' : 'Houses'}</p>
                </div>
                <span className="text-xs text-white/70 font-mono tracking-wider uppercase">
                  {[...new Set(partners.map(p => p.location.split(',').pop()?.trim()).filter(Boolean))].join(' · ')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Partner Houses Selector Strip */}
      <section className="border-b border-white/10 bg-[#121417]/60 py-8 px-6">
        <div className="w-full">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs uppercase tracking-[0.2em] text-[#a1a1aa] font-semibold">
              Partner Houses in the Guild (Click to visit webpage directly)
            </h2>
            <span className="text-xs text-[#c5a059]">Independent brand pages & isolated vaults</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {partners.map(partner => (
              <button
                key={partner.id}
                onClick={() => navigateTo('partner', partner.id)}
                className="text-left p-4 rounded bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 hover:border-[#c5a059]/40 transition-all group flex flex-col justify-between h-36"
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs uppercase tracking-wider text-[#a1a1aa] group-hover:text-[#c5a059] transition-colors">
                      {partner.location}
                    </span>
                    <span className="text-[10px] font-mono text-white/40">Est. {partner.founded}</span>
                  </div>
                  <h3 className="font-editorial text-lg text-white font-medium group-hover:translate-x-0.5 transition-transform">
                    {partner.name}
                  </h3>
                  <p className="text-xs text-neutral-400 line-clamp-2 mt-1 leading-relaxed">
                    {partner.specialty}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[11px] text-[#c5a059]">
                  <span>Visit Boutique Page</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Catalog Filtering & Controls */}
      <section className="w-full px-6 pt-10 pb-6">
        {/* Partner tabs: every partner added by the admin appears here */}
        <div className="flex items-center gap-1 overflow-x-auto pb-4 mb-4 border-b border-white/10">
          {['All', ...partners.map(p => p.id)].map(id => {
            const label = id === 'All' ? 'All Partners' : partners.find(p => p.id === id)?.name;
            return (
              <button
                key={id}
                onClick={() => setSelectedPartnerFilter(id)}
                className={`px-4 py-2 text-xs font-semibold tracking-wider uppercase rounded transition-all whitespace-nowrap ${
                  selectedPartnerFilter === id
                    ? 'bg-white text-black'
                    : 'text-neutral-300 hover:text-white hover:bg-white/5 border border-white/10'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
          {/* Category Tabs (Clean button controls) */}
          <div className="flex items-center gap-1 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 text-xs font-medium rounded transition-all whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-[#c5a059] text-black font-semibold shadow-sm'
                    : 'text-neutral-300 hover:text-white hover:bg-white/5'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search & Partner filter dropdown */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none min-w-0">
              <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search materials, silk, coats..."
                className="bg-white/5 border border-white/10 rounded pl-8 pr-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#c5a059] w-full sm:w-56"
              />
            </div>

            <select
              value={selectedPartnerFilter}
              onChange={e => setSelectedPartnerFilter(e.target.value)}
              className="bg-neutral-900 border border-white/10 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#c5a059] min-w-0 max-w-[45%] sm:max-w-none"
            >
              <option value="All">All Partner Houses</option>
              {partners.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Section Notice */}
        <div className="mt-4 flex items-center justify-between text-xs text-neutral-400">
          <span>
            Showing <strong className="text-white font-mono">{filteredProducts.length}</strong> masterworks across partner houses
          </span>
          <span className="text-neutral-500 italic">
            Clicking any product opens that partner's WhatsApp directly
          </span>
        </div>
      </section>

      {/* Main Products Grid */}
      <section className="w-full px-6 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProducts.map(product => {
            const partner = partners.find(p => p.id === product.partnerId);

            return (
              <div
                key={product.id}
                className="group flex flex-col justify-between bg-neutral-950/60 border border-white/10 hover:border-[#c5a059]/50 rounded-sm overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                {/* Product Image Area - clicking redirects to partner page */}
                <div
                  onClick={() => openWhatsApp(product)}
                  className="relative aspect-[4/3] bg-neutral-900 overflow-hidden cursor-pointer"
                >
                  <img
                    src={product.image}
                    alt={product.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover object-center group-hover:scale-104 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />

                  {/* Partner House Tag Overlay */}
                  {product.videoId && (
                    <div className="absolute top-3 right-3">
                      <VideoButton videoId={product.videoId} title={product.title} className="bg-black/75" />
                    </div>
                  )}
                  <div className="absolute top-3 left-3 bg-black/75 backdrop-blur-sm border border-white/10 px-2.5 py-1 text-[11px] text-[#c5a059] uppercase tracking-wider font-medium">
                    {product.partnerName}
                  </div>

                  {/* Category Pill replacement: quiet clean text */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white">
                    <span className="text-white/80 font-light">{product.category}</span>
                    <span className="text-[11px] text-[#c5a059] opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 font-medium">
                      Chat on WhatsApp <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>

                {/* Content Area */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center justify-between gap-2 text-xs text-neutral-400 mb-1">
                      <span>{partner?.location || 'Paris Spinner'}</span>
                      {product.leadTime !== 'On request' && (
                        <span className="font-mono text-[11px] text-neutral-400">Lead time: {product.leadTime.split(' ')[0]}</span>
                      )}
                    </div>

                    <h3
                      onClick={() => openWhatsApp(product)}
                      className="font-editorial text-xl text-white font-medium hover:text-[#c5a059] transition-colors cursor-pointer line-clamp-1"
                    >
                      {product.title}
                    </h3>

                    <p className="text-xs text-neutral-300 line-clamp-2 mt-2 leading-relaxed font-light">
                      {product.description}
                    </p>

                    {/* Materials list */}
                    <div className="mt-3 flex flex-wrap gap-1 text-[11px] text-neutral-400">
                      {product.materials.map((mat, i) => (
                        <span key={i} className="after:content-['·'] after:ml-1 last:after:content-none text-neutral-400">
                          {mat}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Price and Primary Actions */}
                  <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-3">
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-neutral-400 block">Spinner Spinners&Spinners</span>
                      <span className="text-lg font-mono font-medium text-white tracking-tight">
                        {formatPrice(product)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Chat with this Partner */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openChatForPartner(product.partnerId, product.id);
                        }}
                        title={`Chat directly with ${product.partnerName} about this piece`}
                        className="p-2 rounded bg-white/5 hover:bg-white/15 text-neutral-300 hover:text-white border border-white/10 transition-colors"
                      >
                        <MessageSquare className="w-4 h-4 text-[#c5a059]" />
                      </button>

                      {/* Opens WhatsApp of this product's partner only */}
                      <button
                        onClick={() => openWhatsApp(product)}
                        className="px-3.5 py-2 text-xs font-semibold tracking-wider uppercase text-black bg-[#c5a059] hover:bg-[#d4b069] rounded transition-all whitespace-nowrap flex items-center gap-1.5"
                      >
                        <span>WhatsApp Partner</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredProducts.length === 0 && partners.length === 0 && (
          <div className="text-center py-20 border border-dashed border-white/10 rounded p-8">
            <p className="text-neutral-400 font-editorial text-xl">No partner houses have joined yet.</p>
            <p className="text-xs text-neutral-500 mt-2">Check back soon.</p>
          </div>
        )}

        {filteredProducts.length === 0 && partners.length > 0 && (
          <div className="text-center py-20 border border-dashed border-white/10 rounded p-8">
            <p className="text-neutral-400 font-editorial text-xl">No couture pieces match this criterion.</p>
            <button
              onClick={() => { setSelectedCategory('All'); setSelectedPartnerFilter('All'); setSearchQuery(''); }}
              className="mt-4 px-4 py-2 text-xs bg-white/10 hover:bg-white/20 text-white rounded font-medium"
            >
              Reset All Filters
            </button>
          </div>
        )}
      </section>
    </div>
  );
};
