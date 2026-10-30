import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Fulfilment, buildWhatsAppUrl, formatPrice } from '../utils/helpers';
import { X, MapPin, Truck, Store } from 'lucide-react';

export const FulfilmentModal: React.FC = () => {
  const { whatsappProduct, setWhatsappProduct, partners, globalWhatsapp } = useApp();
  const [choice, setChoice] = useState<Fulfilment>('visit');
  const [deliveryLocation, setDeliveryLocation] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const inputCls = 'w-full bg-neutral-900 border border-white/10 rounded px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#c5a059]';
  const [error, setError] = useState('');

  if (!whatsappProduct) return null;
  const partner = partners.find(p => p.id === whatsappProduct.partnerId);
  if (!partner) return null;

  const close = () => {
    setWhatsappProduct(null);
    setError('');
  };

  const proceed = () => {
    if (choice === 'delivery' && (!deliveryLocation.trim() || !clientName.trim() || !clientPhone.trim())) {
      setError('Enter your name, phone number and delivery location.');
      return;
    }
    const isHouse = partner.id === 'spinners-and-spinners';
    const number = isHouse ? (globalWhatsapp || partner.whatsapp) : (partner.whatsapp || globalWhatsapp);
    const url = buildWhatsAppUrl({ ...partner, whatsapp: number }, whatsappProduct, choice, deliveryLocation.trim(), { name: clientName.trim(), phone: clientPhone.trim() });
    if (url) window.open(url, '_blank', 'noopener,noreferrer');
    close();
  };

  const options: { id: Fulfilment; label: string; hint: string; icon: React.ReactNode; show: boolean }[] = [
    { id: 'visit', label: 'Visit & buy in person', hint: partner.address || 'Address shared on chat', icon: <Store className="w-4 h-4" />, show: true },
    { id: 'collect', label: 'Self collection', hint: partner.address || 'Address shared on chat', icon: <MapPin className="w-4 h-4" />, show: true },
    {
      id: 'delivery',
      label: 'By delivery',
      hint: partner.deliveryFee > 0 ? `Delivery charge: KSh ${partner.deliveryFee.toLocaleString()} (paid by you)` : 'Delivery charge confirmed on chat',
      icon: <Truck className="w-4 h-4" />,
      show: true
    }
  ];

  return (
    <div className="fixed inset-0 z-[70] bg-black/70 flex items-center justify-center p-4" onClick={close}>
      <div className="bg-neutral-950 border border-white/10 rounded w-full max-w-md p-5 space-y-4" onClick={e => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-editorial text-xl text-white">{whatsappProduct.title}</h3>
            <p className="text-[11px] text-neutral-400">{partner.name} · {formatPrice(whatsappProduct)}</p>
          </div>
          <button onClick={close} className="text-neutral-400 hover:text-white"><X className="w-4 h-4" /></button>
        </div>

        <p className="text-xs text-neutral-300">How would you like to get this item?</p>
        <div className="space-y-2">
          {options.filter(o => o.show).map(o => (
            <button
              key={o.id}
              onClick={() => setChoice(o.id)}
              className={`w-full text-left p-3 rounded border flex items-start gap-3 text-xs ${
                choice === o.id ? 'border-[#c5a059] bg-[#c5a059]/10 text-white' : 'border-white/10 text-neutral-300 hover:bg-white/5'
              }`}
            >
              <span className="text-[#c5a059] mt-0.5">{o.icon}</span>
              <span>
                <span className="block font-medium">{o.label}</span>
                <span className="block text-[11px] text-neutral-400">{o.hint}</span>
              </span>
            </button>
          ))}
        </div>

        {choice === 'delivery' && (
          <div className="space-y-2">
            <input value={clientName} onChange={e => setClientName(e.target.value)} placeholder="Your name" className={inputCls} />
            <input value={clientPhone} onChange={e => setClientPhone(e.target.value)} placeholder="Your phone number" inputMode="tel" className={inputCls} />
            <input value={deliveryLocation} onChange={e => setDeliveryLocation(e.target.value)} placeholder="Your delivery location" className={inputCls} />
          </div>
        )}
        {error && <p className="text-xs text-red-300">{error}</p>}

        <button
          onClick={proceed}
          className="w-full py-2.5 text-xs font-semibold tracking-wider uppercase text-black bg-[#c5a059] hover:bg-[#d4b069] rounded"
        >
          Continue to WhatsApp
        </button>
      </div>
    </div>
  );
};
