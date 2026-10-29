import { SocialLinksManager } from './SocialLinksManager';
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Partner, PartnerFile, ChatThread, Order } from '../types';
import { ProductManager } from './ProductManager';
import { VideoButton } from './VideoButton';
import { formatPrice } from '../utils/helpers';
import {
  FolderLock,
  Upload,
  FileText,
  ShieldAlert,
  ShieldCheck,
  Lock,
  FileCheck,
  Download,
  Trash2,
  MessageSquare,
  ShoppingBag,
  ExternalLink,
  Plus,
  Send,
  Eye,
  Settings
} from 'lucide-react';

export const PartnerDashboard: React.FC = () => {
  const {
    currentUser,
    partners,
    products,
    selectedPartnerId,
    navigateTo,
    files,
    orders,
    chatThreads,
    canAccessPartnerFiles,
    canAccessCommunication,
    uploadPartnerFile,
    deletePartnerFile,
    sendChatMessage,
    updateOrderStatus
  } = useApp();

  // Determine which partner's dashboard is being viewed
  const targetPartnerId = selectedPartnerId || (currentUser.role === 'partner' ? currentUser.partnerId : partners[0].id);
  const partner = partners.find(p => p.id === targetPartnerId) || partners[0];

  // RBAC Access Check
  const hasAccess = canAccessPartnerFiles(partner.id);

  // Tabs: 'files' | 'chats' | 'orders' | 'settings'
  const [activeTab, setActiveTab] = useState<'files' | 'chats' | 'orders' | 'settings' | 'products'>('products');

  // File Upload State
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [newFileType, setNewFileType] = useState<PartnerFile['fileType']>('techpack');
  const [newClassification, setNewClassification] = useState<PartnerFile['classification']>('Confidential - Spinner Internal');
  const [newFileNotes, setNewFileNotes] = useState('');

  // Selected chat thread for viewing inside partner dashboard
  const partnerThreads = chatThreads.filter(t => t.partnerId === partner.id && canAccessCommunication(t));
  const [activeThreadId, setActiveThreadId] = useState<string | null>(partnerThreads[0]?.id || null);
  const [replyText, setReplyText] = useState('');

  // Orders for this partner
  const partnerOrders = orders.filter(o => o.partnerId === partner.id);

  // Files for this partner (only available if hasAccess is true)
  const partnerFiles = files.filter(f => f.partnerId === partner.id);

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFileName.trim()) return;

    uploadPartnerFile({
      partnerId: partner.id,
      fileName: newFileName,
      fileType: newFileType,
      fileSize: `${(Math.random() * 15 + 2).toFixed(1)} MB`,
      classification: newClassification,
      notes: newFileNotes || 'Internal spinner documentation'
    });

    setNewFileName('');
    setNewFileNotes('');
    setIsUploadModalOpen(false);
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !activeThreadId) return;

    sendChatMessage(activeThreadId, replyText);
    setReplyText('');
  };

  // If user does not have RBAC access to this partner's private dashboard
  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-[#0a0b0d] text-[#f4f2ee] p-6 lg:p-12 flex items-center justify-center">
        <div className="max-w-xl w-full bg-red-950/20 border border-red-500/30 rounded p-8 text-center space-y-6">
          <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 mx-auto flex items-center justify-center">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="text-[11px] uppercase tracking-widest text-red-400 font-mono">
              HTTP 403 · Access Quarantined
            </span>
            <h2 className="text-2xl font-editorial font-medium text-white">
              Role-Based Access Control Rejection
            </h2>
            <p className="text-xs text-neutral-300 leading-relaxed max-w-md mx-auto font-light">
              You are currently authenticated as{' '}
              <strong className="text-white">{currentUser.name}</strong> ({currentUser.role === 'partner' ? currentUser.partnerName : currentUser.role}).
              Under guild security protocols, each partner may <strong>only view their own files and client communications</strong>.
            </p>
          </div>

          <div className="p-4 bg-black/50 border border-white/5 rounded text-left text-xs font-mono space-y-1.5 text-neutral-400">
            <div>Target Resource: <span className="text-red-300">{partner.name} Vault & Direct Messages</span></div>
            <div>Current Clearance: <span className="text-amber-300">{currentUser.partnerName || currentUser.role}</span></div>
            <div>Enforced Policy: <span className="text-emerald-400">ISO-27001 Partner Multi-Tenant Isolation</span></div>
            <div>Action Required: <span className="text-white">Authenticate as {partner.name} Director or Platform Admin</span></div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            {currentUser.role === 'partner' && currentUser.partnerId && (
              <button
                onClick={() => navigateTo('dashboard', currentUser.partnerId)}
                className="px-4 py-2 bg-[#c5a059] text-black font-semibold text-xs tracking-wider uppercase rounded hover:bg-[#d4b069] transition-colors"
              >
                Go to My Spinners&Spinners ({currentUser.partnerName})
              </button>
            )}
            <button
              onClick={() => navigateTo('catalog')}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-medium rounded transition-colors"
            >
              Back to Catalog
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentActiveThread = partnerThreads.find(t => t.id === activeThreadId) || partnerThreads[0];

  return (
    <div className="min-h-screen bg-[#0a0b0d] text-[#f4f2ee]">
      {/* Dashboard Top Header */}
      <section className="bg-[#121417] border-b border-white/10 px-6 py-6">
        <div className="w-full flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-[#c5a059] uppercase tracking-wider mb-1">
              <FolderLock className="w-4 h-4" />
              <span>Partner Private Spinners&Spinners Terminal</span>
              {currentUser.role === 'admin' && (
                <span className="text-amber-400 font-mono text-[10px] bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                  Admin Supervisory Mode
                </span>
              )}
            </div>
            <h1 className="text-3xl font-editorial font-medium text-white">
              {partner.name} Spinners&Spinners Console
            </h1>
            <p className="text-xs text-neutral-400 font-light mt-0.5">
              Secure repository for {partner.location} · Isolated from all competing partner houses
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigateTo('partner', partner.id)}
              className="px-3.5 py-2 bg-white/5 hover:bg-white/10 border border-white/15 text-white text-xs font-medium rounded flex items-center gap-1.5 transition-colors"
            >
              <Eye className="w-3.5 h-3.5 text-[#c5a059]" />
              <span>View Public Boutique Page</span>
            </button>

            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="px-3.5 py-2 bg-[#c5a059] hover:bg-[#d4b069] text-black font-semibold text-xs tracking-wider uppercase rounded flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Technical File</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="w-full flex items-center gap-4 mt-6 pt-2 border-t border-white/5 overflow-x-auto text-xs font-medium">
          <button
            onClick={() => setActiveTab('products')}
            className={`pb-2 border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'products'
                ? 'border-[#c5a059] text-white font-semibold'
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            <Plus className="w-4 h-4 text-[#c5a059]" />
            <span>My Products</span>
            <span className="font-mono text-[11px] text-[#c5a059]">({products.filter(p => p.partnerId === partner.id).length})</span>
          </button>

          <button
            onClick={() => setActiveTab('files')}
            className={`pb-2 border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'files'
                ? 'border-[#c5a059] text-white font-semibold'
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            <FolderLock className="w-4 h-4 text-[#c5a059]" />
            <span>Proprietary File Vault</span>
            <span className="font-mono text-[11px] text-[#c5a059]">({partnerFiles.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('chats')}
            className={`pb-2 border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'chats'
                ? 'border-[#c5a059] text-white font-semibold'
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            <MessageSquare className="w-4 h-4 text-sky-400" />
            <span>Client Communications</span>
            <span className="font-mono text-[11px] text-sky-400">({partnerThreads.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`pb-2 border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'orders'
                ? 'border-[#c5a059] text-white font-semibold'
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            <ShoppingBag className="w-4 h-4 text-emerald-400" />
            <span>Spinners&Spinners Commissions</span>
            <span className="font-mono text-[11px] text-emerald-400">({partnerOrders.length})</span>
          </button>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="w-full px-6 py-8">
        {/* TAB 0: Products */}
        {activeTab === 'products' && (
          <div className="space-y-10">
            <ProductManager partnerId={partner.id} />
            <div>
              <h3 className="font-editorial text-xl text-white mb-1">All marketplace products ({products.length})</h3>
              <p className="text-[11px] text-neutral-500 mb-4">Everything live on the main catalog, including items uploaded by the admin and other partners.</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {products.filter(p => p.stock !== 0).map(p => (
                  <div key={p.id} className="bg-neutral-950 border border-white/10 rounded overflow-hidden">
                    <div className="relative">
                      <img src={p.image} alt={p.title} className="w-full aspect-[3/4] object-cover" />
                      {p.videoId && <div className="absolute top-2 right-2"><VideoButton videoId={p.videoId} title={p.title} className="bg-black/75" /></div>}
                    </div>
                    <div className="p-3 space-y-0.5">
                      <p className="text-xs text-white font-medium truncate">{p.title}</p>
                      <p className="text-[10px] text-[#c5a059]">{p.partnerName}{p.partnerId === partner.id ? ' (you)' : ''}</p>
                      <p className="text-[11px] text-neutral-400">{formatPrice(p)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 1: Proprietary Files */}
        {activeTab === 'files' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-emerald-950/20 border border-emerald-500/20 rounded text-xs text-neutral-300">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>
                  <strong>Strict Multi-Tenant Isolation Active:</strong> Only authenticated personnel of{' '}
                  <strong className="text-white">{partner.name}</strong> and Global Platform Admins have decryption rights for these files.
                </span>
              </div>
              <span className="text-[11px] text-emerald-400 font-mono">Quarantine Status: Enforced</span>
            </div>

            {/* Files Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {partnerFiles.map(file => (
                <div
                  key={file.id}
                  className="p-5 rounded bg-neutral-950 border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between space-y-4 group"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="p-2.5 rounded bg-white/5 border border-white/10 text-[#c5a059]">
                        <FileText className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-white/5 text-neutral-300 border border-white/10">
                        {file.classification}
                      </span>
                    </div>

                    <h3 className="text-sm font-semibold text-white group-hover:text-[#c5a059] transition-colors break-words">
                      {file.fileName}
                    </h3>

                    <p className="text-xs text-neutral-400 line-clamp-2 mt-2 leading-relaxed font-light">
                      {file.notes}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-neutral-400">
                    <div className="space-y-0.5">
                      <span className="font-mono text-neutral-300">{file.fileSize}</span>
                      <span className="block text-[10px] text-neutral-500">Uploaded: {file.uploadedAt}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => alert(`Simulating secure decrypted download for: ${file.fileName}\nClearance Verified: ${currentUser.name}`)}
                        title="Download file"
                        className="p-1.5 rounded bg-white/5 hover:bg-white/15 text-neutral-200 transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => deletePartnerFile(file.id)}
                        title="Delete file"
                        className="p-1.5 rounded bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {partnerFiles.length === 0 && (
              <div className="text-center py-16 border border-dashed border-white/10 rounded p-8">
                <FolderLock className="w-8 h-8 text-neutral-600 mx-auto mb-2" />
                <p className="text-neutral-400 text-sm">No files uploaded yet for {partner.name}.</p>
                <button
                  onClick={() => setIsUploadModalOpen(true)}
                  className="mt-4 px-4 py-2 bg-[#c5a059] text-black text-xs font-semibold uppercase rounded"
                >
                  Upload First Tech Pack
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: Client Communications & Privacy Isolation */}
        {activeTab === 'chats' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[550px]">
            {/* Sidebar List of Threads */}
            <div className="lg:col-span-4 bg-neutral-950 border border-white/10 rounded flex flex-col overflow-hidden">
              <div className="p-3.5 border-b border-white/10 text-xs font-semibold text-neutral-300 flex items-center justify-between">
                <span>Inquiries & Conversations</span>
                <span className="text-[11px] font-mono text-[#c5a059]">{partnerThreads.length}</span>
              </div>

              <div className="flex-1 overflow-y-auto divide-y divide-white/5">
                {partnerThreads.map(thread => (
                  <button
                    key={thread.id}
                    onClick={() => setActiveThreadId(thread.id)}
                    className={`w-full text-left p-3.5 transition-colors flex flex-col gap-1 ${
                      activeThreadId === thread.id
                        ? 'bg-white/10 border-l-2 border-[#c5a059]'
                        : 'hover:bg-white/[0.03]'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-white">{thread.clientName}</span>
                      <span className="text-[10px] text-neutral-500 font-mono">{thread.lastMessageAt}</span>
                    </div>

                    {thread.hasPurchase && (
                      <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                        <Lock className="w-2.5 h-2.5" />
                        <span>Confidential Purchase</span>
                      </span>
                    )}

                    {thread.productTitle && (
                      <p className="text-[11px] text-[#c5a059] truncate font-editorial">
                        Piece: {thread.productTitle}
                      </p>
                    )}

                    <p className="text-[11px] text-neutral-400 truncate">
                      {thread.messages[thread.messages.length - 1]?.content || 'New inquiry'}
                    </p>
                  </button>
                ))}

                {partnerThreads.length === 0 && (
                  <div className="p-8 text-center text-xs text-neutral-500">
                    No active client conversations for {partner.name}.
                  </div>
                )}
              </div>
            </div>

            {/* Conversation Window */}
            <div className="lg:col-span-8 bg-neutral-950 border border-white/10 rounded flex flex-col overflow-hidden">
              {currentActiveThread ? (
                <>
                  {/* Thread Header */}
                  <div className="p-3.5 border-b border-white/10 flex items-center justify-between text-xs bg-white/[0.02]">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white">{currentActiveThread.clientName}</span>
                        <span className="text-neutral-500">({currentActiveThread.clientEmail})</span>
                      </div>
                      {currentActiveThread.productTitle && (
                        <span className="text-[11px] text-[#c5a059] block font-editorial">
                          Discussion regarding: {currentActiveThread.productTitle}
                        </span>
                      )}
                    </div>

                    <div className="text-right">
                      {currentActiveThread.hasPurchase ? (
                        <span className="px-2 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded text-[10px] font-mono uppercase tracking-wider flex items-center gap-1">
                          <Lock className="w-3 h-3" />
                          <span>Sealed Purchase Thread</span>
                        </span>
                      ) : (
                        <span className="text-[11px] text-neutral-400 font-mono">Pre-Purchase Inquiry</span>
                      )}
                    </div>
                  </div>

                  {/* Message Stream */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {currentActiveThread.messages.map(msg => (
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

                  {/* Reply Form */}
                  <form onSubmit={handleSendReply} className="p-3 border-t border-white/10 flex items-center gap-2 bg-neutral-900/50">
                    <input
                      type="text"
                      value={replyText}
                      onChange={e => setReplyText(e.target.value)}
                      placeholder={`Reply as ${partner.name} Spinner...`}
                      className="flex-1 bg-white/5 border border-white/10 rounded px-3.5 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#c5a059]"
                    />
                    <button
                      type="submit"
                      disabled={!replyText.trim()}
                      className="px-4 py-2 bg-[#c5a059] hover:bg-[#d4b069] disabled:opacity-40 text-black font-semibold text-xs rounded transition-colors flex items-center gap-1.5"
                    >
                      <span>Send Reply</span>
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </form>
                </>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-neutral-500">
                  Select a client thread to inspect communication.
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: Spinner Orders */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-editorial text-xl text-white font-medium">
                Confirmed Commissions for {partner.name}
              </h3>
              <span className="text-xs text-neutral-400">
                {partnerOrders.length} order{partnerOrders.length === 1 ? '' : 's'} placed
              </span>
            </div>

            <div className="space-y-4">
              {partnerOrders.map(order => (
                <div
                  key={order.id}
                  className="p-5 rounded bg-neutral-950 border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-6"
                >
                  <div className="flex items-start gap-4">
                    <img
                      src={order.productImage}
                      alt={order.productTitle}
                      className="w-20 h-20 rounded object-cover border border-white/10 shrink-0"
                    />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-[#c5a059] font-medium">{order.id}</span>
                        <span className="text-white/20">·</span>
                        <span className="text-xs text-neutral-400 font-mono">{order.createdAt}</span>
                      </div>
                      <h4 className="font-editorial text-lg text-white font-medium">
                        {order.productTitle}
                      </h4>
                      <p className="text-xs text-neutral-300">
                        Client: <strong className="text-white">{order.clientName}</strong> ({order.clientEmail})
                      </p>
                      <p className="text-xs text-neutral-400 font-mono">
                        Size: {order.selectedSize} · Price: {order.productPrice.toLocaleString()} KSh
                      </p>
                      <p className="text-[11px] text-neutral-500 truncate max-w-md">
                        Shipping: {order.shippingAddress}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row md:flex-col items-end gap-3 shrink-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-neutral-400">Fulfillment State:</span>
                      <select
                        value={order.status}
                        onChange={e => updateOrderStatus(order.id, e.target.value as Order['status'])}
                        className="bg-neutral-900 border border-white/10 rounded px-2.5 py-1 text-xs text-white focus:outline-none focus:border-[#c5a059]"
                      >
                        <option value="Confirmed">Confirmed</option>
                        <option value="In Production">In Production</option>
                        <option value="Spinners&Spinners QA">Spinners&Spinners QA</option>
                        <option value="Dispatched">Dispatched</option>
                      </select>
                    </div>

                    <button
                      onClick={() => {
                        setActiveTab('chats');
                        setActiveThreadId(order.chatThreadId);
                      }}
                      className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-neutral-200 rounded flex items-center gap-1.5 transition-colors"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-[#c5a059]" />
                      <span>Open Sealed Chat Thread</span>
                    </button>
                  </div>
                </div>
              ))}

              {partnerOrders.length === 0 && (
                <div className="text-center py-16 border border-dashed border-white/10 rounded p-8">
                  <ShoppingBag className="w-8 h-8 text-neutral-600 mx-auto mb-2" />
                  <p className="text-neutral-400 text-sm">No commissions placed for {partner.name} yet.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Upload File Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-950 border border-white/20 rounded p-6 max-w-md w-full space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="font-editorial text-lg text-white font-medium flex items-center gap-2">
                <Upload className="w-4 h-4 text-[#c5a059]" />
                <span>Upload to {partner.name} Vault</span>
              </h3>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="text-neutral-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-neutral-300 font-medium mb-1">File Name / Document Title:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. MA-Bespoke-GoldWeft-Specs-v2.pdf"
                  value={newFileName}
                  onChange={e => setNewFileName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-white focus:outline-none focus:border-[#c5a059]"
                />
              </div>

              <div>
                <label className="block text-neutral-300 font-medium mb-1">Document Category:</label>
                <select
                  value={newFileType}
                  onChange={e => setNewFileType(e.target.value as any)}
                  className="w-full bg-neutral-900 border border-white/10 rounded px-3 py-2 text-white focus:outline-none focus:border-[#c5a059]"
                >
                  <option value="techpack">Tech Pack / Pattern Book</option>
                  <option value="cad">CAD / 3D Schematic</option>
                  <option value="certification">Material Audit / Provenance Certificate</option>
                  <option value="lookbook">Private Lookbook</option>
                  <option value="invoice">Wholesale Invoice / Contract</option>
                </select>
              </div>

              <div>
                <label className="block text-neutral-300 font-medium mb-1">Security Classification:</label>
                <select
                  value={newClassification}
                  onChange={e => setNewClassification(e.target.value as any)}
                  className="w-full bg-neutral-900 border border-white/10 rounded px-3 py-2 text-white focus:outline-none focus:border-[#c5a059]"
                >
                  <option value="Confidential - Spinner Internal">Confidential - Spinner Internal</option>
                  <option value="Tech Spec">Tech Spec</option>
                  <option value="Material Audit">Material Audit</option>
                  <option value="Wholesale Tier">Wholesale Tier</option>
                </select>
              </div>

              <div>
                <label className="block text-neutral-300 font-medium mb-1">Technical Notes:</label>
                <textarea
                  rows={3}
                  placeholder="Specific handcrafting notes or restricted access instructions..."
                  value={newFileNotes}
                  onChange={e => setNewFileNotes(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-white focus:outline-none focus:border-[#c5a059]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-3.5 py-2 bg-white/5 hover:bg-white/10 text-white rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#c5a059] hover:bg-[#d4b069] text-black font-semibold uppercase tracking-wider rounded"
                >
                  Save to Vault
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <div className="w-full px-6 pb-10"><SocialLinksManager partnerId={partner.id} title={`${partner.name} social media pages`} /></div>
    </div>
  );
};
