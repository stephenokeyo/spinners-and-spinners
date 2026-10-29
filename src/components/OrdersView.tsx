import React from 'react';
import { useApp } from '../context/AppContext';
import { ShoppingBag, Lock, MessageSquare, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';

export const OrdersView: React.FC = () => {
  const {
    currentUser,
    orders,
    navigateTo,
    openChatForPartner,
    canAccessOrder,
    updateOrderStatus
  } = useApp();

  // Filter orders according to RBAC
  const visibleOrders = orders.filter(o => canAccessOrder(o));

  return (
    <div className="min-h-screen bg-[#0a0b0d] text-[#f4f2ee] px-6 py-10">
      <div className="w-full space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-[#c5a059] mb-1">
              <ShoppingBag className="w-4 h-4" />
              <span>
                {currentUser.role === 'admin'
                  ? 'Guild-Wide Transaction Ledger'
                  : currentUser.role === 'partner'
                  ? `${currentUser.partnerName} Client Commissions`
                  : 'My Bespoke Commissions & Orders'}
              </span>
            </div>
            <h1 className="text-3xl font-editorial font-medium text-white">
              Spinners Commissions & Fulfilments
            </h1>
            <p className="text-xs text-neutral-400 font-light mt-0.5">
              {currentUser.role === 'client' && 'All orders and conversations are isolated directly between you and the respective partner spinner.'}
              {currentUser.role === 'partner' && `Displaying commissions placed exclusively for ${currentUser.partnerName}. Isolated from competing houses.`}
              {currentUser.role === 'admin' && 'Omni-access view across all partner houses and transactions.'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-neutral-400 font-mono">
              Total Visible: <strong className="text-white">{visibleOrders.length}</strong>
            </span>
          </div>
        </div>

        {/* Order Privacy Isolation Guarantee Banner */}
        <div className="p-4 bg-neutral-900 border border-white/10 rounded flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-[#c5a059] shrink-0" />
            <div>
              <span className="font-semibold text-white">Transactional Isolation Enforcement:</span>
              <p className="text-neutral-400 font-light text-[11px] mt-0.5">
                Every purchase creates a locked communication channel between the client and that specific partner. Competing partners have zero permission to view order data or chat messages.
              </p>
            </div>
          </div>
          <span className="text-[11px] font-mono text-emerald-400 shrink-0 uppercase tracking-wider">
            RBAC Quarantine Active
          </span>
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {visibleOrders.map(order => (
            <div
              key={order.id}
              className="p-6 rounded bg-neutral-950 border border-white/10 flex flex-col lg:flex-row lg:items-center justify-between gap-6 hover:border-white/20 transition-all"
            >
              <div className="flex flex-col sm:flex-row items-start gap-5">
                <img
                  src={order.productImage}
                  alt={order.productTitle}
                  className="w-24 h-24 rounded object-cover border border-white/10 shrink-0"
                />

                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="font-mono text-[#c5a059] font-medium">{order.id}</span>
                    <span className="text-white/20">·</span>
                    <span className="text-neutral-400 font-mono">{order.createdAt}</span>
                    <span className="text-white/20">·</span>
                    <span className="text-xs font-semibold text-white">{order.partnerName}</span>
                  </div>

                  <h3 className="font-editorial text-xl text-white font-medium">
                    {order.productTitle}
                  </h3>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-300">
                    <span>Size: <strong className="text-white font-mono">{order.selectedSize}</strong></span>
                    <span className="text-white/20">·</span>
                    <span>Client: <strong className="text-white">{order.clientName}</strong></span>
                    <span className="text-white/20">·</span>
                    <span className="font-mono text-white">KSh {order.productPrice.toLocaleString()}</span>
                  </div>

                  <p className="text-[11px] text-neutral-400">
                    Shipping Destination: <span className="text-neutral-300">{order.shippingAddress}</span>
                  </p>

                  {order.notes && (
                    <p className="text-[11px] text-neutral-500 italic">
                      Fitting Notes: "{order.notes}"
                    </p>
                  )}
                </div>
              </div>

              {/* Status and Action Buttons */}
              <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end gap-3 shrink-0 pt-4 lg:pt-0 border-t lg:border-t-0 border-white/5">
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-neutral-400">Status:</span>
                  {currentUser.role === 'partner' || currentUser.role === 'admin' ? (
                    <select
                      value={order.status}
                      onChange={e => updateOrderStatus(order.id, e.target.value as any)}
                      className="bg-neutral-900 border border-white/10 rounded px-2.5 py-1 text-xs text-white focus:outline-none focus:border-[#c5a059]"
                    >
                      <option value="Confirmed">Confirmed</option>
                      <option value="In Production">In Production</option>
                      <option value="Spinner QA">Spinner QA</option>
                      <option value="Dispatched">Dispatched</option>
                    </select>
                  ) : (
                    <span className="px-2.5 py-1 rounded bg-white/5 text-emerald-400 font-mono text-[11px] border border-white/10 uppercase">
                      {order.status}
                    </span>
                  )}
                </div>

                <button
                  onClick={() => openChatForPartner(order.partnerId, order.productId)}
                  className="px-4 py-2 bg-white/5 hover:bg-white/15 border border-white/10 text-xs text-white rounded flex items-center gap-1.5 transition-colors"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-[#c5a059]" />
                  <span>Open Sealed Spinner Chat</span>
                </button>
              </div>
            </div>
          ))}

          {visibleOrders.length === 0 && (
            <div className="text-center py-20 border border-dashed border-white/10 rounded p-8">
              <ShoppingBag className="w-8 h-8 text-neutral-600 mx-auto mb-2" />
              <p className="text-neutral-400 text-sm">No commissions recorded yet.</p>
              <button
                onClick={() => navigateTo('catalog')}
                className="mt-4 px-4 py-2 bg-[#c5a059] text-black text-xs font-semibold uppercase tracking-wider rounded"
              >
                Browse Haute Catalog
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
