import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export const FulfilmentSettings: React.FC<{ partnerId: string }> = ({ partnerId }) => {
  const { partners, updatePartnerFulfilment } = useApp();
  const partner = partners.find(p => p.id === partnerId);
  const [address, setAddress] = useState(partner?.address ?? '');
  const [delivery, setDelivery] = useState(!!partner?.deliveryAvailable);
  const [fee, setFee] = useState(String(partner?.deliveryFee ?? 0));
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  if (!partner) return null;
  const cls = 'w-full bg-neutral-900 border border-white/10 rounded px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#c5a059]';

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const r = await updatePartnerFulfilment(partnerId, { address, deliveryAvailable: delivery, deliveryFee: Number(fee) });
    setMsg({ ok: r.success, text: r.success ? 'Saved.' : r.error || 'Could not save.' });
  };

  return (
    <form onSubmit={save} className="bg-neutral-950 border border-white/10 rounded p-5 space-y-3 mb-6">
      <h3 className="font-editorial text-lg text-white">Pickup & delivery settings</h3>
      <p className="text-[11px] text-neutral-500">KRA PIN: <span className="font-mono text-neutral-300">{partner.kraPin || 'not set'}</span></p>
      <input required value={address} onChange={e => setAddress(e.target.value)} placeholder="Business location / address (for visits and self collection)" className={cls} />
      <label className="flex items-center gap-2 text-xs text-neutral-300">
        <input type="checkbox" checked={delivery} onChange={e => setDelivery(e.target.checked)} />
        Offer delivery (customer pays the delivery charge)
      </label>
      {delivery && (
        <input type="number" min="0" step="1" value={fee} onChange={e => setFee(e.target.value)} placeholder="Delivery charge in KSh" className={cls} />
      )}
      {msg && <p className={`text-xs ${msg.ok ? 'text-emerald-300' : 'text-red-300'}`}>{msg.text}</p>}
      <button type="submit" className="px-4 py-2 text-xs font-semibold tracking-wider uppercase text-black bg-[#c5a059] hover:bg-[#d4b069] rounded">
        Save settings
      </button>
    </form>
  );
};
