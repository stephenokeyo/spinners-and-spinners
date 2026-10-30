import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Product } from '../types';
import { formatPrice } from '../utils/helpers';
import { MessageCircle } from 'lucide-react';
import { VideoButton } from './VideoButton';

export const BoutiquesView: React.FC = () => {
  const { partners, products, navigateTo } = useApp();
  const [filter, setFilter] = useState<string>('All');

  const visible = products.filter(p => p.stock !== 0 && (filter === 'All' || p.partnerId === filter));
  const activePartner = partners.find(p => p.id === filter);

  const { setWhatsappProduct } = useApp();
  const openWhatsApp = (product: Product) => setWhatsappProduct(product);

  return (
    <div className="min-h-screen bg-[#0c0d0e] text-[#f4f2ee] px-6 py-10">
      <div className="w-full space-y-6">
        <div>
          <h1 className="font-editorial text-3xl text-white">Partner Boutiques</h1>
          <p className="text-xs text-neutral-400 mt-1">Every product from every partner and the global admin, in one place.</p>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto border-b border-white/10 pb-3">
          {[{ id: 'All', name: 'All Products' }, ...partners].map(p => (
            <button
              key={p.id}
              onClick={() => setFilter(p.id)}
              className={`px-3.5 py-1.5 text-xs font-medium rounded whitespace-nowrap transition-all ${
                filter === p.id ? 'bg-[#c5a059] text-black font-semibold' : 'text-neutral-300 hover:text-white hover:bg-white/5'
              }`}
            >
              {p.name}
            </button>
          ))}
        </div>

        {activePartner && (
          <button onClick={() => navigateTo('partner', activePartner.id)} className="text-xs text-[#c5a059] hover:underline">
            Open {activePartner.name} boutique page →
          </button>
        )}

        {visible.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-white/10 rounded text-sm text-neutral-500">
            No products available yet.
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {visible.map(p => (
              <div key={p.id} className="bg-neutral-950 border border-white/10 rounded overflow-hidden flex flex-col">
                <div className="relative">
                  <img src={p.image} alt={p.title} className="w-full aspect-[3/4] object-contain bg-neutral-900" />
                  {p.videoId && <div className="absolute top-2 right-2"><VideoButton videoId={p.videoId} title={p.title} className="bg-black/75" /></div>}
                </div>
                <div className="p-3 space-y-1 flex-1 flex flex-col">
                  <p className="text-[10px] uppercase tracking-wider text-[#c5a059]">{p.partnerName}</p>
                  <h3 className="font-editorial text-white">{p.title}</h3>
                  <p className="text-[11px] text-neutral-400 line-clamp-2">{p.description}</p>
                  <div className="flex items-center justify-between pt-1 mt-auto">
                    <span className="text-xs font-mono text-white">{formatPrice(p)}</span>
                    {p.stock !== undefined && <span className="text-[10px] text-emerald-300">{p.stock} in stock</span>}
                  </div>
                  <button
                    onClick={() => openWhatsApp(p)}
                    className="mt-2 w-full py-1.5 text-[11px] font-semibold uppercase tracking-wider text-black bg-[#c5a059] hover:bg-[#d4b069] rounded flex items-center justify-center gap-1.5"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    WhatsApp Partner
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
