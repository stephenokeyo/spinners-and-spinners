import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Printer, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Order } from '../types';

interface Props {
  order?: Order;
  partnerId?: string;
  onClose: () => void;
}

const money = (n: number) => `KSh ${n.toLocaleString()}`;

// Delivery receipt. Seller and buyer details are editable so the sender can complete them before printing.
export const ReceiptModal: React.FC<Props> = ({ order, partnerId, onClose }) => {
  const { partners, products, globalWhatsapp, currentUser } = useApp();
  const pid = order?.partnerId || partnerId || (currentUser.role === 'partner' ? currentUser.partnerId : undefined) || partners[0]?.id;
  const partner = partners.find(p => p.id === pid) || partners[0];
  const partnerProducts = products.filter(p => p.partnerId === partner?.id);

  const [clientName, setClientName] = useState(order?.clientName || '');
  const [clientPhone, setClientPhone] = useState('');
  const [clientEmail, setClientEmail] = useState(order?.clientEmail || '');
  const [address, setAddress] = useState(order?.shippingAddress || '');
  const [item, setItem] = useState(order?.productTitle || '');
  const [size, setSize] = useState(order?.selectedSize || '');
  const [qty, setQty] = useState(1);
  const [price, setPrice] = useState(order?.productPrice || 0);
  const [fee, setFee] = useState(partner?.deliveryFee || 0);
  const [payment, setPayment] = useState('M-Pesa');
  const [notes, setNotes] = useState(order?.notes || '');
  const [receiptNo] = useState(() => `RCP-${Date.now().toString().slice(-8)}`);

  if (!partner) return null;
  const subtotal = price * qty;
  const total = subtotal + fee;
  const sellerPhone = partner.whatsapp || globalWhatsapp;
  const cls = 'w-full bg-neutral-900 border border-white/10 rounded px-2.5 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#c5a059]';

  const pickProduct = (id: string) => {
    const p = partnerProducts.find(x => x.id === id);
    if (p) {
      setItem(p.title);
      setPrice(p.price);
    }
  };

  return createPortal(
    <div className="receipt-overlay fixed inset-0 z-[90] bg-black/80 overflow-y-auto p-4" onClick={onClose}>
      <div className="max-w-3xl mx-auto space-y-4" onClick={e => e.stopPropagation()}>
        <div className="no-print bg-neutral-950 border border-white/10 rounded p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Delivery purchase receipt</h3>
            <button onClick={onClose} aria-label="Close" className="text-neutral-400 hover:text-white"><X className="w-4 h-4" /></button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <input value={clientName} onChange={e => setClientName(e.target.value)} placeholder="Client name" className={cls} />
            <input value={clientPhone} onChange={e => setClientPhone(e.target.value)} placeholder="Client phone" className={cls} />
            <input value={clientEmail} onChange={e => setClientEmail(e.target.value)} placeholder="Client email (optional)" className={cls} />
            <input value={address} onChange={e => setAddress(e.target.value)} placeholder="Delivery address / location" className={cls} />
            {!order && partnerProducts.length > 0 && (
              <select onChange={e => pickProduct(e.target.value)} defaultValue="" className={`${cls} sm:col-span-2`}>
                <option value="">Pick a product (optional)</option>
                {partnerProducts.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
              </select>
            )}
            <input value={item} onChange={e => setItem(e.target.value)} placeholder="Item" className={cls} />
            <input value={size} onChange={e => setSize(e.target.value)} placeholder="Size (optional)" className={cls} />
            <label className="text-[11px] text-neutral-400">Quantity
              <input type="number" min={1} value={qty} onChange={e => setQty(Math.max(1, Number(e.target.value) || 1))} className={cls} />
            </label>
            <label className="text-[11px] text-neutral-400">Unit price (KSh)
              <input type="number" min={0} value={price} onChange={e => setPrice(Math.max(0, Number(e.target.value) || 0))} className={cls} />
            </label>
            <label className="text-[11px] text-neutral-400">Delivery fee (KSh)
              <input type="number" min={0} value={fee} onChange={e => setFee(Math.max(0, Number(e.target.value) || 0))} className={cls} />
            </label>
            <label className="text-[11px] text-neutral-400">Payment method
              <select value={payment} onChange={e => setPayment(e.target.value)} className={cls}>
                <option>M-Pesa</option><option>Cash on delivery</option><option>Bank transfer</option><option>Card</option>
              </select>
            </label>
            <input value={notes} onChange={e => setNotes(e.target.value)} placeholder="Notes (optional)" className={`${cls} sm:col-span-2`} />
          </div>
          <button onClick={() => window.print()} className="px-4 py-2 bg-[#c5a059] hover:bg-[#d4b069] text-black text-xs font-semibold uppercase tracking-wider rounded flex items-center gap-1.5">
            <Printer className="w-3.5 h-3.5" /> Print receipt
          </button>
          <p className="text-[11px] text-neutral-500">Your browser's print window lets you choose any printer, or save as PDF.</p>
        </div>

        <div id="receipt-print" className="bg-white text-black p-8 rounded text-sm">
          <div className="flex justify-between items-start border-b-2 border-black pb-4">
            <div>
              <h1 className="text-2xl font-bold tracking-wide">{partner.name}</h1>
              {partner.address && <p className="text-xs">{partner.address}</p>}
              {sellerPhone && <p className="text-xs">Tel / WhatsApp: {sellerPhone}</p>}
              {partner.kraPin && <p className="text-xs">KRA PIN: {partner.kraPin}</p>}
            </div>
            <div className="text-right">
              <h2 className="text-lg font-bold uppercase">Delivery Receipt</h2>
              <p className="text-xs">No: {receiptNo}</p>
              <p className="text-xs">Date: {new Date().toLocaleDateString()}</p>
              {order && <p className="text-xs">Order: {order.id}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 py-4 text-xs">
            <div>
              <h3 className="font-bold uppercase mb-1">Client details</h3>
              <p>{clientName || '—'}</p>
              {clientPhone && <p>Tel: {clientPhone}</p>}
              {clientEmail && <p>{clientEmail}</p>}
            </div>
            <div>
              <h3 className="font-bold uppercase mb-1">Delivery to</h3>
              <p>{address || '—'}</p>
              <p className="mt-1">Fulfilment: By delivery</p>
            </div>
          </div>

          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="border-y border-black text-left">
                <th className="py-2">Item</th><th>Size</th><th className="text-right">Qty</th><th className="text-right">Unit price</th><th className="text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-neutral-300">
                <td className="py-2">{item || '—'}</td><td>{size || '—'}</td><td className="text-right">{qty}</td><td className="text-right">{money(price)}</td><td className="text-right">{money(subtotal)}</td>
              </tr>
            </tbody>
          </table>

          <div className="flex justify-end pt-3">
            <table className="text-xs w-64">
              <tbody>
                <tr><td className="py-0.5">Subtotal</td><td className="text-right">{money(subtotal)}</td></tr>
                <tr><td className="py-0.5">Delivery fee</td><td className="text-right">{money(fee)}</td></tr>
                <tr className="border-t-2 border-black font-bold text-sm"><td className="py-1">Total</td><td className="text-right">{money(total)}</td></tr>
                <tr><td className="py-0.5">Payment</td><td className="text-right">{payment}</td></tr>
              </tbody>
            </table>
          </div>

          {notes && <p className="text-xs pt-3"><strong>Notes:</strong> {notes}</p>}

          <div className="grid grid-cols-2 gap-10 pt-14 text-xs">
            <div className="border-t border-black pt-1">Issued by (name &amp; signature)</div>
            <div className="border-t border-black pt-1">Received by client (name, signature &amp; date)</div>
          </div>
          <p className="text-center text-[10px] pt-8 text-neutral-600">Thank you for shopping with {partner.name} · texStyle marketplace</p>
        </div>
      </div>
    </div>,
    document.body
  );
};
