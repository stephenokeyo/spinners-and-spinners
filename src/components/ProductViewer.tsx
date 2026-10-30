import React, { useEffect } from 'react';
import { X, MessageSquare, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Product } from '../types';
import { formatPrice } from '../utils/helpers';
import { VideoButton } from './VideoButton';

export const ProductViewer: React.FC<{ product: Product; onClose: () => void }> = ({ product, onClose }) => {
  const { partners, setWhatsappProduct, openChatForPartner } = useApp();
  const partner = partners.find(p => p.id === product.partnerId);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[65] bg-black/85 flex items-center justify-center p-3 sm:p-6" onClick={onClose}>
      <div
        className="bg-neutral-950 border border-white/10 rounded w-full max-w-5xl max-h-[92vh] overflow-y-auto grid grid-cols-1 md:grid-cols-5"
        onClick={e => e.stopPropagation()}
      >
        <div className="md:col-span-3 bg-neutral-900 flex items-center justify-center">
          <img src={product.image} alt={product.title} referrerPolicy="no-referrer" className="w-full max-h-[85vh] object-contain" />
        </div>

        <div className="md:col-span-2 p-5 space-y-4 flex flex-col">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] uppercase tracking-wider text-[#c5a059]">{product.partnerName}</p>
              <h3 className="font-editorial text-2xl text-white">{product.title}</h3>
              <p className="text-[11px] text-neutral-400 mt-1">{product.category}{partner?.location ? ` · ${partner.location}` : ''}</p>
            </div>
            <button onClick={onClose} aria-label="Close" className="text-neutral-400 hover:text-white shrink-0">
              <X className="w-5 h-5" />
            </button>
          </div>

          <p className="text-xs text-neutral-300 leading-relaxed whitespace-pre-line">{product.description}</p>

          {product.videoId && <VideoButton videoId={product.videoId} title={product.title} className="bg-white/10 self-start" />}

          <div className="mt-auto pt-4 border-t border-white/10 space-y-3">
            <span className="text-xl font-mono font-medium text-white">{formatPrice(product)}</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => { onClose(); openChatForPartner(product.partnerId, product.id); }}
                title={`Chat with ${product.partnerName}`}
                className="p-2.5 rounded bg-white/5 hover:bg-white/15 border border-white/10"
              >
                <MessageSquare className="w-4 h-4 text-[#c5a059]" />
              </button>
              <button
                onClick={() => { onClose(); setWhatsappProduct(product); }}
                className="flex-1 px-4 py-2.5 text-xs font-semibold tracking-wider uppercase text-black bg-[#c5a059] hover:bg-[#d4b069] rounded flex items-center justify-center gap-1.5"
              >
                Proceed <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
