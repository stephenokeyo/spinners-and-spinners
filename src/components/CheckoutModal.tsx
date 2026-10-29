import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ShoppingBag, ShieldCheck, CheckCircle2, Lock, ArrowRight } from 'lucide-react';

export const CheckoutModal: React.FC = () => {
  const {
    isCheckoutModalOpen,
    setIsCheckoutModalOpen,
    checkoutProduct,
    setCheckoutProduct,
    placeOrder,
    currentUser,
    navigateTo,
    openChatForPartner
  } = useApp();

  const [selectedSize, setSelectedSize] = useState<string>(checkoutProduct?.sizes[0] || 'Spinners&Spinners Custom Measurements');
  const [shippingAddress, setShippingAddress] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [orderResult, setOrderResult] = useState<{ success: boolean; orderId?: string } | null>(null);

  if (!isCheckoutModalOpen || !checkoutProduct) return null;

  const handleClose = () => {
    setIsCheckoutModalOpen(false);
    setCheckoutProduct(null);
    setOrderResult(null);
  };

  const handleConfirmPurchase = (e: React.FormEvent) => {
    e.preventDefault();
    const result = placeOrder(checkoutProduct.id, selectedSize, shippingAddress, notes);
    setOrderResult(result);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-neutral-950 border border-white/20 rounded max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl text-xs">
        {/* Modal Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-neutral-900/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded bg-[#c5a059]/10 text-[#c5a059] border border-[#c5a059]/30">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-editorial text-xl text-white font-medium">
                Spinners&Spinners Spinner Commission
              </h3>
              <p className="text-[11px] text-neutral-400">
                Direct order with {checkoutProduct.partnerName}
              </p>
            </div>
          </div>

          <button onClick={handleClose} className="text-neutral-400 hover:text-white text-sm">
            ✕
          </button>
        </div>

        {orderResult?.success ? (
          /* Confirmation Screen */
          <div className="p-8 text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className="text-[11px] font-mono text-emerald-400 uppercase tracking-wider">
                Commission Confirmed · Order #{orderResult.orderId}
              </span>
              <h4 className="font-editorial text-2xl text-white font-medium">
                Your order is secured with {checkoutProduct.partnerName}
              </h4>
              <p className="text-neutral-300 leading-relaxed max-w-md mx-auto font-light">
                Master artisans have received your commission for the <strong>{checkoutProduct.title}</strong>.
              </p>
            </div>

            {/* Strict Isolation Notice */}
            <div className="p-4 bg-neutral-900 border border-white/10 rounded text-left space-y-1.5 text-neutral-300">
              <div className="flex items-center gap-2 text-[#c5a059] font-medium text-[11px] uppercase tracking-wider">
                <Lock className="w-3.5 h-3.5" />
                <span>Transaction & Communication Quarantined</span>
              </div>
              <p className="text-[11px] text-neutral-400 leading-relaxed font-light">
                Per strict guild protocols, this order and its corresponding communication thread are strictly confidential between <strong>{currentUser.name}</strong> and <strong>{checkoutProduct.partnerName}</strong>. No other partner houses have clearance to view this order or customer message logs.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={() => {
                  handleClose();
                  openChatForPartner(checkoutProduct.partnerId, checkoutProduct.id);
                }}
                className="w-full sm:w-auto px-5 py-2.5 bg-[#c5a059] hover:bg-[#d4b069] text-black font-semibold uppercase tracking-wider rounded flex items-center justify-center gap-1.5"
              >
                <span>Open Spinner Chat Thread</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => {
                  handleClose();
                  navigateTo('orders');
                }}
                className="w-full sm:w-auto px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded font-medium"
              >
                View in My Orders
              </button>
            </div>
          </div>
        ) : (
          /* Checkout Form */
          <form onSubmit={handleConfirmPurchase} className="p-6 space-y-5">
            {/* Product Summary */}
            <div className="flex items-center gap-4 p-3.5 rounded bg-white/[0.02] border border-white/10">
              <img
                src={checkoutProduct.image}
                alt={checkoutProduct.title}
                className="w-16 h-16 rounded object-cover border border-white/10 shrink-0"
              />
              <div className="flex-1">
                <span className="text-[10px] uppercase tracking-wider text-[#c5a059] font-medium">
                  {checkoutProduct.partnerName}
                </span>
                <h4 className="font-editorial text-base text-white font-medium">
                  {checkoutProduct.title}
                </h4>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-neutral-400">{checkoutProduct.category}</span>
                  <span className="text-sm font-mono font-semibold text-white">
                    KSh {checkoutProduct.price.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Sizing Selection */}
            <div>
              <label className="block text-neutral-300 font-medium mb-1.5">
                Select Sizing or Spinners&Spinners Fit:
              </label>
              <select
                value={selectedSize}
                onChange={e => setSelectedSize(e.target.value)}
                className="w-full bg-neutral-900 border border-white/10 rounded px-3 py-2 text-white focus:outline-none focus:border-[#c5a059]"
              >
                {checkoutProduct.sizes.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Client / Delivery Info */}
            <div className="space-y-3">
              <div>
                <label className="block text-neutral-300 font-medium mb-1">
                  Commissioning Client:
                </label>
                <input
                  type="text"
                  disabled
                  value={`${currentUser.name} (${currentUser.email})`}
                  className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-neutral-400"
                />
              </div>

              <div>
                <label className="block text-neutral-300 font-medium mb-1">
                  Delivery Destination / Private Address:
                </label>
                <input
                  type="text"
                  required
                  value={shippingAddress}
                  onChange={e => setShippingAddress(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-white focus:outline-none focus:border-[#c5a059]"
                />
              </div>

              <div>
                <label className="block text-neutral-300 font-medium mb-1">
                  Spinners&Spinners Notes / Fitting Specifications:
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Specific waistline, shoulder drop, or event date..."
                  className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-white focus:outline-none focus:border-[#c5a059]"
                />
              </div>
            </div>

            {/* Strict Transaction Isolation Guarantee Callout */}
            <div className="p-3.5 bg-neutral-900 border border-[#c5a059]/30 rounded space-y-1">
              <div className="flex items-center gap-1.5 text-[#c5a059] font-medium text-[11px] uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Strict Partner Privacy Isolation Protocol</span>
              </div>
              <p className="text-[11px] text-neutral-300 font-light leading-relaxed">
                By commissioning this piece, your transaction record and all subsequent chat messages are sealed directly with <strong>{checkoutProduct.partnerName}</strong>. Competing partners have zero permission to inspect your communication.
              </p>
            </div>

            {/* Total and Submit */}
            <div className="pt-2 flex items-center justify-between border-t border-white/10">
              <div>
                <span className="text-[10px] uppercase text-neutral-400 block">Total Investment</span>
                <span className="text-xl font-mono font-semibold text-white">
                  KSh {checkoutProduct.price.toLocaleString()}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 text-neutral-300 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#c5a059] hover:bg-[#d4b069] text-black font-semibold uppercase tracking-wider rounded shadow-md"
                >
                  Place Commission
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
