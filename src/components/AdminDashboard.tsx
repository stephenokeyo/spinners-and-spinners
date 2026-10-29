import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Shield,
  ShieldCheck,
  FolderLock,
  MessageSquare,
  Lock,
  ShoppingBag,
  Eye,
  FileText,
  AlertTriangle,
  ArrowRight,
  Plus
} from 'lucide-react';
import { ProductManager } from './ProductManager';
import { fileToCompressedDataUrl } from '../utils/helpers';

export const AdminDashboard: React.FC = () => {
  const {
    currentUser,
    partners,
    files,
    orders,
    chatThreads,
    navigateTo,
    addPartner,
    resetPartnerPassword,
    deletePartner,
    siteHeroImage,
    setSiteHeroImage
  } = useApp();
  const [bannerMsg, setBannerMsg] = useState('');

  const [activeTab, setActiveTab] = useState<'overview' | 'partners' | 'communications' | 'files' | 'orders'>('overview');
  const [managedPartnerId, setManagedPartnerId] = useState<string | null>(null);
  const emptyForm = {
    name: '', location: '', tagline: '', ethos: '', specialty: '', story: '', bannerText: '',
    leadDesigner: '', founded: '', whatsapp: '', email: '', password: '', heroImage: '',
    kraPin: '', address: '', deliveryAvailable: false, deliveryFee: ''
  };
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  const activeManagedId = managedPartnerId && partners.some(p => p.id === managedPartnerId)
    ? managedPartnerId
    : partners[0]?.id;

  const handleAddPartner = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const founded = parseInt(form.founded, 10);
    const result = await addPartner({
      ...form,
      founded: Number.isFinite(founded) ? founded : undefined,
      deliveryFee: Number(form.deliveryFee) || 0,
      heroImage: form.heroImage || undefined
    });
    setSubmitting(false);
    if (result.success && result.partner) {
      setManagedPartnerId(result.partner.id);
      setForm(emptyForm);
      setFormError(null);
      setFormSuccess(`${result.partner.name} was added. They can now log in with ${form.email}.`);
    } else {
      setFormSuccess(null);
      setFormError(result.error || 'Could not add partner.');
    }
  };

  const handleHeroFile = async (file?: File) => {
    if (!file) return;
    try {
      const data = await fileToCompressedDataUrl(file, 1600);
      setForm(f => ({ ...f, heroImage: data }));
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Could not read image.');
    }
  };

  const handleResetPassword = async (partnerId: string) => {
    const pw = window.prompt('Enter a new password for this partner (min 8 characters):');
    if (!pw) return;
    const r = await resetPartnerPassword(partnerId, pw);
    window.alert(r.success ? 'Password updated.' : r.error || 'Could not update password.');
  };

  const handleDeletePartner = (partnerId: string, name: string) => {
    if (window.confirm(`Delete ${name}? This removes their login, products, files, orders and chats.`)) {
      void deletePartner(partnerId);
    }
  };

  const fieldCls = 'w-full bg-neutral-900 border border-white/10 rounded px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#c5a059]';
  const [inspectedThreadId, setInspectedThreadId] = useState<string | null>(chatThreads[0]?.id || null);

  // Calculate platform totals
  const totalGMV = orders.reduce((sum, o) => sum + o.productPrice, 0);
  const purchasedThreads = chatThreads.filter(t => t.hasPurchase);

  const inspectedThread = chatThreads.find(t => t.id === inspectedThreadId) || chatThreads[0];

  return (
    <div className="min-h-screen bg-[#0a0b0d] text-[#f4f2ee]">
      {/* Top Banner */}
      <section className="bg-neutral-900 border-b border-amber-500/20 px-6 py-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-amber-400 uppercase tracking-widest font-mono mb-1">
              <Shield className="w-4 h-4" />
              <span>Executive Platform Control & Audit Oversight</span>
            </div>
            <h1 className="text-3xl font-editorial font-medium text-white">
              Global Platform Executive Console
            </h1>
            <p className="text-xs text-neutral-400 font-light mt-0.5">
              Super Admin clearance: Omni-visibility over all partner houses, client communications, and isolated vaults
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-emerald-400 font-mono bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              <span>Full Audit Clearance Active</span>
            </span>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="max-w-7xl mx-auto flex items-center gap-4 mt-6 pt-2 border-t border-white/5 overflow-x-auto text-xs font-medium">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-2 border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'overview' ? 'border-amber-400 text-white font-semibold' : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            <span>Guild Overview</span>
          </button>

          <button
            onClick={() => setActiveTab('partners')}
            className={`pb-2 border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'partners' ? 'border-amber-400 text-white font-semibold' : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            <Plus className="w-4 h-4 text-[#c5a059]" />
            <span>Partners & Products</span>
            <span className="font-mono text-[11px] text-[#c5a059]">({partners.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('communications')}
            className={`pb-2 border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'communications' ? 'border-amber-400 text-white font-semibold' : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            <MessageSquare className="w-4 h-4 text-sky-400" />
            <span>Universal Communications Auditor</span>
            <span className="font-mono text-[11px] text-sky-400">({chatThreads.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('files')}
            className={`pb-2 border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'files' ? 'border-amber-400 text-white font-semibold' : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            <FolderLock className="w-4 h-4 text-[#c5a059]" />
            <span>All Partner Files Registry</span>
            <span className="font-mono text-[11px] text-[#c5a059]">({files.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`pb-2 border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'orders' ? 'border-amber-400 text-white font-semibold' : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            <ShoppingBag className="w-4 h-4 text-emerald-400" />
            <span>All Orders & Transactions</span>
            <span className="font-mono text-[11px] text-emerald-400">({orders.length})</span>
          </button>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* TAB: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Homepage banner image */}
            <div className="p-5 rounded bg-neutral-950 border border-white/10 flex flex-col sm:flex-row gap-4 items-start">
              <img src={siteHeroImage} alt="Homepage banner" className="w-full sm:w-64 aspect-[16/10] object-cover rounded border border-white/10" />
              <div className="space-y-2">
                <h3 className="font-editorial text-white">Homepage banner image</h3>
                <p className="text-[11px] text-neutral-400">This picture is shown on the home page of the website. Upload your own to replace it.</p>
                <label className="inline-block cursor-pointer px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-black bg-[#c5a059] hover:bg-[#d4b069] rounded">
                  Upload new image
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async e => {
                      const file = e.target.files?.[0];
                      e.target.value = '';
                      if (!file) return;
                      try {
                        const r = await setSiteHeroImage(await fileToCompressedDataUrl(file, 1600));
                        setBannerMsg(r.success ? 'Banner updated.' : r.error || 'Could not update banner.');
                      } catch (err) {
                        setBannerMsg((err as Error).message);
                      }
                    }}
                  />
                </label>
                {bannerMsg && <p className="text-[11px] text-emerald-300">{bannerMsg}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded bg-neutral-950 border border-white/10 space-y-1">
                <span className="text-[11px] uppercase tracking-wider text-neutral-400">Total Guild GMV</span>
                <p className="text-2xl font-mono font-medium text-white">KSh {totalGMV.toLocaleString()}</p>
                <span className="text-[10px] text-neutral-500">Across {orders.length} bespoke commissions</span>
              </div>

              <div className="p-5 rounded bg-neutral-950 border border-white/10 space-y-1">
                <span className="text-[11px] uppercase tracking-wider text-neutral-400">Partner Houses</span>
                <p className="text-2xl font-mono font-medium text-[#c5a059]">{partners.length}</p>
                <span className="text-[10px] text-neutral-500">All operating dedicated boutique pages</span>
              </div>

              <div className="p-5 rounded bg-neutral-950 border border-white/10 space-y-1">
                <span className="text-[11px] uppercase tracking-wider text-neutral-400">Proprietary Files</span>
                <p className="text-2xl font-mono font-medium text-emerald-400">{files.length}</p>
                <span className="text-[10px] text-neutral-500">Isolated across {partners.length} partner vaults</span>
              </div>

              <div className="p-5 rounded bg-neutral-950 border border-white/10 space-y-1">
                <span className="text-[11px] uppercase tracking-wider text-neutral-400">Confidential Purchases</span>
                <p className="text-2xl font-mono font-medium text-amber-400">{purchasedThreads.length}</p>
                <span className="text-[10px] text-neutral-500">Communications sealed from other partners</span>
              </div>
            </div>

            {/* The 4 Houses Status Grid */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-editorial text-xl text-white font-medium">
                  Active Partner Houses
                </h3>
                <span className="text-xs text-neutral-400">Inspect vault, reset password or remove a partner</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                {partners.map(p => {
                  const houseFiles = files.filter(f => f.partnerId === p.id);
                  const houseOrders = orders.filter(o => o.partnerId === p.id);

                  return (
                    <div
                      key={p.id}
                      className="p-5 rounded bg-neutral-950 border border-white/10 space-y-4 flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-[#c5a059] font-medium uppercase text-[10px] tracking-wider">{p.location}</span>
                          <span className="font-mono text-neutral-500 text-[10px]">Est. {p.founded}</span>
                        </div>
                        <h4 className="font-editorial text-lg text-white font-medium">{p.name}</h4>
                        <p className="text-xs text-neutral-400 line-clamp-2">{p.specialty}</p>

                        <div className="pt-2 text-[11px] text-neutral-300 space-y-1 border-t border-white/5">
                          <div className="flex justify-between">
                            <span>Vault Files:</span>
                            <span className="font-mono text-white font-medium">{houseFiles.length}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Commissions:</span>
                            <span className="font-mono text-white font-medium">{houseOrders.length}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Lead Artisan:</span>
                            <span className="text-neutral-400">{p.leadDesigner}</span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-white/10 space-y-2">
                        <button
                          onClick={() => navigateTo('dashboard', p.id)}
                          className="w-full py-1.5 px-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded text-xs transition-colors flex items-center justify-center gap-1.5"
                        >
                          <FolderLock className="w-3.5 h-3.5 text-[#c5a059]" />
                          <span>Inspect Vault</span>
                        </button>

                        <div className="flex gap-2">
                          <button
                            onClick={() => handleResetPassword(p.id)}
                            className="flex-1 py-1.5 px-2 bg-[#c5a059]/10 hover:bg-[#c5a059]/20 text-[#c5a059] border border-[#c5a059]/30 rounded text-[11px]"
                          >
                            Reset password
                          </button>
                          <button
                            onClick={() => handleDeletePartner(p.id, p.name)}
                            className="flex-1 py-1.5 px-2 bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/30 rounded text-[11px]"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB: PARTNERS & PRODUCTS */}
        {activeTab === 'partners' && (
          <div className="space-y-8">
            <form onSubmit={handleAddPartner} className="bg-neutral-950 border border-white/10 rounded p-5 space-y-4">
              <h3 className="font-editorial text-xl text-white">Add a new partner</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Partner name *" className={fieldCls} />
                <input required value={form.leadDesigner} onChange={e => setForm({ ...form, leadDesigner: e.target.value })} placeholder="Lead designer / contact name *" className={fieldCls} />
                <input required value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} placeholder="Location * (City, Country)" className={fieldCls} />
                <input required value={form.whatsapp} onChange={e => setForm({ ...form, whatsapp: e.target.value })} placeholder="WhatsApp number * (e.g. +33612345678)" className={fieldCls} />
                <input required value={form.kraPin} onChange={e => setForm({ ...form, kraPin: e.target.value.toUpperCase() })} maxLength={11} placeholder="KRA PIN * (e.g. A123456789Z)" className={fieldCls} />
                <input required value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="Business location / address * (for visits & collection)" className={`${fieldCls} md:col-span-2`} />
                <label className="text-[11px] text-neutral-300 flex items-center gap-2">
                  <input type="checkbox" checked={form.deliveryAvailable} onChange={e => setForm({ ...form, deliveryAvailable: e.target.checked })} />
                  Offers delivery
                </label>
                {form.deliveryAvailable && (
                  <input required type="number" min="0" value={form.deliveryFee} onChange={e => setForm({ ...form, deliveryFee: e.target.value })} placeholder="Delivery charge in KSh *" className={fieldCls} />
                )}
                <input required type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="Partner login email *" className={fieldCls} />
                <input required type="password" autoComplete="new-password" minLength={8} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="Partner password * (min 8 chars)" className={fieldCls} />
                <input required value={form.tagline} onChange={e => setForm({ ...form, tagline: e.target.value })} placeholder="Tagline *" className={`${fieldCls} md:col-span-2`} />
                <input type="number" value={form.founded} onChange={e => setForm({ ...form, founded: e.target.value })} placeholder="Year founded" className={fieldCls} />
                <input required value={form.specialty} onChange={e => setForm({ ...form, specialty: e.target.value })} placeholder="Specialty *" className={`${fieldCls} md:col-span-2`} />
                <input required value={form.bannerText} onChange={e => setForm({ ...form, bannerText: e.target.value })} placeholder="Banner text *" className={fieldCls} />
                <textarea required value={form.ethos} onChange={e => setForm({ ...form, ethos: e.target.value })} placeholder="Ethos *" rows={3} className={fieldCls} />
                <textarea required value={form.story} onChange={e => setForm({ ...form, story: e.target.value })} placeholder="Story *" rows={3} className={`${fieldCls} md:col-span-2`} />
                <label className="text-[11px] text-neutral-400 flex items-center gap-2 md:col-span-3">
                  Hero image (optional)
                  <input type="file" accept="image/*" onChange={e => handleHeroFile(e.target.files?.[0])} className="text-[11px]" />
                  {form.heroImage && <img src={form.heroImage} alt="" className="h-10 rounded" />}
                </label>
              </div>
              {formError && <p className="text-xs text-red-300">{formError}</p>}
              {formSuccess && <p className="text-xs text-emerald-300">{formSuccess}</p>}
              <button type="submit" disabled={submitting} className="disabled:opacity-50 px-4 py-2 text-xs font-semibold tracking-wider uppercase text-black bg-[#c5a059] hover:bg-[#d4b069] rounded transition-colors">
                Add Partner
              </button>
              <p className="text-[11px] text-neutral-500">
                Customers who click any of this partner's products are sent to this WhatsApp number only. The partner signs in with the email and password above to upload products.
              </p>
            </form>

            <div>
              <div className="flex items-center gap-2 overflow-x-auto border-b border-white/10 pb-2 mb-6">
                {partners.map(p => (
                  <button
                    key={p.id}
                    onClick={() => setManagedPartnerId(p.id)}
                    className={`px-3.5 py-1.5 text-xs font-medium rounded whitespace-nowrap transition-all ${
                      activeManagedId === p.id ? 'bg-[#c5a059] text-black font-semibold' : 'text-neutral-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {p.name}
                  </button>
                ))}
              </div>
              {activeManagedId && <ProductManager key={activeManagedId} partnerId={activeManagedId} />}
            </div>
          </div>
        )}

        {/* TAB: COMMUNICATIONS AUDITOR (Fulfilling admin-only privilege) */}
        {activeTab === 'communications' && (
          <div className="space-y-6">
            <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded text-xs text-amber-200">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  <strong>Admin Privacy Oversight Privilege:</strong> Competing partners are strictly locked out of client purchase threads. As Platform Admin, you possess universal oversight to inspect dialogues, verify trade compliance, and mediate bespoke commissions.
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[550px]">
              {/* Thread selector */}
              <div className="lg:col-span-5 bg-neutral-950 border border-white/10 rounded flex flex-col overflow-hidden">
                <div className="p-3.5 border-b border-white/10 text-xs font-semibold text-neutral-300">
                  All Client-Partner Communication Channels
                </div>
                <div className="flex-1 overflow-y-auto divide-y divide-white/5">
                  {chatThreads.map(t => (
                    <button
                      key={t.id}
                      onClick={() => setInspectedThreadId(t.id)}
                      className={`w-full text-left p-3.5 transition-colors flex flex-col gap-1 ${
                        inspectedThreadId === t.id ? 'bg-white/10 border-l-2 border-amber-400' : 'hover:bg-white/[0.03]'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-white">{t.clientName}</span>
                        <span className="text-[10px] text-neutral-500 font-mono">{t.lastMessageAt}</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-[#c5a059] font-medium">{t.partnerName}</span>
                        {t.hasPurchase ? (
                          <span className="text-emerald-400 font-mono text-[10px] flex items-center gap-1">
                            <Lock className="w-2.5 h-2.5" />
                            <span>Purchase Sealed</span>
                          </span>
                        ) : (
                          <span className="text-neutral-500 text-[10px]">Inquiry</span>
                        )}
                      </div>
                      <p className="text-[11px] text-neutral-400 truncate">
                        {t.messages[t.messages.length - 1]?.content || 'Empty channel'}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Thread Inspector Window */}
              <div className="lg:col-span-7 bg-neutral-950 border border-white/10 rounded flex flex-col overflow-hidden">
                {inspectedThread ? (
                  <>
                    <div className="p-3.5 border-b border-white/10 bg-white/[0.02] flex items-center justify-between text-xs">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-white">{inspectedThread.clientName}</span>
                          <span className="text-neutral-500">↔</span>
                          <span className="text-[#c5a059] font-semibold">{inspectedThread.partnerName}</span>
                        </div>
                        <span className="text-[11px] text-neutral-400">
                          Channel ID: <span className="font-mono">{inspectedThread.id}</span>
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="px-2 py-0.5 bg-amber-500/10 border border-amber-500/30 text-amber-300 rounded text-[10px] font-mono uppercase">
                          Admin Decryption View
                        </span>
                      </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                      {inspectedThread.messages.map(msg => (
                        <div
                          key={msg.id}
                          className={`flex flex-col ${
                            msg.isSystemNotice
                              ? 'items-center my-2'
                              : msg.senderRole === 'partner'
                              ? 'items-end'
                              : 'items-start'
                          }`}
                        >
                          {msg.isSystemNotice ? (
                            <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs rounded text-center max-w-lg leading-relaxed">
                              {msg.content}
                            </div>
                          ) : (
                            <div
                              className={`max-w-[80%] rounded px-3.5 py-2.5 text-xs leading-relaxed ${
                                msg.senderRole === 'partner'
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
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="h-full flex items-center justify-center text-xs text-neutral-500">
                    Select a channel to inspect.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB: ALL FILES */}
        {activeTab === 'files' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-editorial text-xl text-white font-medium">
                Universal Partner Document Vaults
              </h3>
              <span className="text-xs text-neutral-400 font-mono">
                {files.length} total technical files registered across {partners.length} houses
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {files.map(file => {
                const house = partners.find(p => p.id === file.partnerId);

                return (
                  <div
                    key={file.id}
                    className="p-5 rounded bg-neutral-950 border border-white/10 space-y-3 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs text-neutral-400 mb-2">
                        <span className="text-[#c5a059] font-medium uppercase text-[10px] tracking-wider">
                          {house?.name || file.partnerId}
                        </span>
                        <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-white/5 text-neutral-300">
                          {file.classification}
                        </span>
                      </div>

                      <h4 className="text-sm font-semibold text-white break-words">{file.fileName}</h4>
                      <p className="text-xs text-neutral-400 line-clamp-2 mt-1.5 font-light">{file.notes}</p>
                    </div>

                    <div className="pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-neutral-500 font-mono">
                      <span>Size: {file.fileSize}</span>
                      <span>By: {file.uploadedBy}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB: ALL ORDERS */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-editorial text-xl text-white font-medium">
                Guild Transaction Ledger
              </h3>
              <span className="text-xs text-neutral-400 font-mono">
                Total Volume: KSh {totalGMV.toLocaleString()}
              </span>
            </div>

            {orders.map(order => (
              <div
                key={order.id}
                className="p-4 rounded bg-neutral-950 border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={order.productImage}
                    alt={order.productTitle}
                    className="w-16 h-16 rounded object-cover border border-white/10"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[#c5a059] font-medium">{order.id}</span>
                      <span className="text-white/20">·</span>
                      <span className="text-neutral-400">{order.partnerName}</span>
                    </div>
                    <h4 className="font-editorial text-base text-white font-medium">{order.productTitle}</h4>
                    <p className="text-neutral-400">
                      Buyer: <strong className="text-white">{order.clientName}</strong> · Size: {order.selectedSize}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-base font-mono font-medium text-white block">
                    KSh {order.productPrice.toLocaleString()}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-white/5 text-emerald-400 font-mono text-[10px] border border-white/10 uppercase">
                    Status: {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
