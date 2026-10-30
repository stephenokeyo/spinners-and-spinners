import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, Partner, Product, PartnerFile, ChatThread, ChatMessage, Order, UserRole } from '../types';
import { HERO_IMAGE } from '../data/mockData';
import { api, getToken, setToken } from '../utils/api';
import { isValidEmail, MIN_PASSWORD_LENGTH } from '../utils/auth';
import { isValidWhatsApp, isValidKraPin } from '../utils/helpers';

export interface NewPartnerInput {
  name: string;
  location: string;
  tagline: string;
  ethos: string;
  specialty: string;
  story: string;
  bannerText: string;
  leadDesigner: string;
  founded?: number;
  heroImage?: string;
  whatsapp: string;
  kraPin: string;
  address: string;
  deliveryAvailable: boolean;
  deliveryFee: number;
  email: string;
  password: string;
}

export interface NewProductInput {
  title: string;
  description: string;
  image: string;
  category?: Product['category'];
  price?: number;
  stock: number;
  videoId?: string;
}

type AuthResult = { success: boolean; error?: string; needsCode?: boolean; channel?: string };

export interface SocialLink {
  id: string;
  partnerId: string | null;
  platform: string;
  label: string;
  url: string;
  icon?: string;
}

export interface ShowcaseVideo {
  id: string;
  videoId: string;
  title: string;
  description: string;
}

interface AppContextType {
  showcaseVideos: ShowcaseVideo[];
  globalWhatsapp: string;
  refreshSite: () => Promise<void>;
  addShowcaseVideo: (input: { file: File; title: string; description: string }) => Promise<AuthResult>;
  deleteShowcaseVideo: (id: string) => Promise<void>;
  currentUser: User;
  partners: Partner[];
  products: Product[];
  files: PartnerFile[];
  orders: Order[];
  chatThreads: ChatThread[];

  // Authentication
  hasAdmin: boolean;
  setupAdmin: (name: string, email: string, password: string, setupCode: string) => Promise<AuthResult>;
  login: (email: string, password: string, code?: string) => Promise<AuthResult>;
  logout: () => void;
  isLoading: boolean;

  // Partner & Product management
  addPartner: (input: NewPartnerInput) => Promise<AuthResult & { partner?: Partner }>;
  resetPartnerPassword: (partnerId: string, newPassword: string) => Promise<AuthResult>;
  deletePartner: (partnerId: string) => Promise<void>;
  addProduct: (partnerId: string, input: NewProductInput) => Promise<AuthResult>;
  uploadVideo: (file: File) => Promise<AuthResult & { videoId?: string }>;
  deleteProduct: (productId: string) => Promise<void>;
  markProductSold: (productId: string, quantity?: number) => Promise<void>;
  setProductStock: (productId: string, stock: number) => Promise<void>;
  siteHeroImage: string;
  socialLinks: SocialLink[];
  addSocialLink: (input: { partnerId: string | null; platform: string; label: string; url: string; icon?: string }) => Promise<AuthResult>;
  deleteSocialLink: (id: string) => Promise<void>;
  setSiteHeroImage: (image: string) => Promise<AuthResult>;
  // Navigation & View State
  currentView: 'catalog' | 'partner' | 'product' | 'dashboard' | 'orders' | 'security';
  selectedPartnerId: string | null;
  selectedProductId: string | null;
  navigateTo: (view: 'catalog' | 'partner' | 'product' | 'dashboard' | 'orders' | 'security', partnerId?: string, productId?: string) => void;
  
  // RBAC Access Control checks
  canAccessPartnerFiles: (partnerId: string) => boolean;
  canAccessCommunication: (thread: ChatThread) => boolean;
  canAccessOrder: (order: Order) => boolean;
  
  // Partner File Actions
  getPartnerFiles: (partnerId: string) => PartnerFile[];
  uploadPartnerFile: (file: Omit<PartnerFile, 'id' | 'uploadedAt' | 'uploadedBy'>) => void;
  deletePartnerFile: (fileId: string) => void;
  
  // Chat Actions
  activeChatThreadId: string | null;
  openChatForPartner: (partnerId: string, productId?: string) => void;
  closeChat: () => void;
  sendChatMessage: (threadId: string, content: string) => void;
  
  // Commerce & Purchase Action
  placeOrder: (productId: string, selectedSize: string, shippingAddress: string, notes?: string) => { success: boolean; orderId?: string; error?: string };
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  
  // Modals & UI Controls
  isLoginModalOpen: boolean;
  setIsLoginModalOpen: (open: boolean) => void;
  isCheckoutModalOpen: boolean;
  setIsCheckoutModalOpen: (open: boolean) => void;
  checkoutProduct: Product | null;
  setCheckoutProduct: (product: Product | null) => void;
  whatsappProduct: Product | null;
  setWhatsappProduct: (product: Product | null) => void;
  updatePartnerFulfilment: (
    partnerId: string,
    data: { address: string; deliveryAvailable: boolean; deliveryFee: number }
  ) => Promise<AuthResult>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const KEY_PREFIX = 'atelier2_';

const readStored = <T,>(key: string, fallback: T): T => {
  try {
    const saved = localStorage.getItem(KEY_PREFIX + key);
    return saved ? (JSON.parse(saved) as T) : fallback;
  } catch {
    return fallback;
  }
};

const persist = (key: string, value: unknown) => {
  try {
    localStorage.setItem(KEY_PREFIX + key, JSON.stringify(value));
  } catch (e) {
    console.warn(`Could not persist ${key} (storage full?)`, e);
  }
};

// Anonymous customer identity, unique per browser so chats and orders are never shared between customers.
const getGuestUser = (): User => {
  let id = localStorage.getItem(KEY_PREFIX + 'guest_id');
  if (!id) {
    id = `guest-${crypto.randomUUID()}`;
    localStorage.setItem(KEY_PREFIX + 'guest_id', id);
  }
  return { id, name: 'Guest Customer', email: '', role: 'client', avatar: 'G', title: 'Customer' };
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [guestUser] = useState<User>(getGuestUser);
  const [me, setMe] = useState<User | null>(null);
  const [hasAdmin, setHasAdmin] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [siteHeroImage, setSiteHeroImageState] = useState<string>(HERO_IMAGE);
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [showcaseVideos, setShowcaseVideos] = useState<ShowcaseVideo[]>([]);
  const [globalWhatsapp, setGlobalWhatsapp] = useState('');
  const [files, setFiles] = useState<PartnerFile[]>(() => readStored<PartnerFile[]>('files', []));
  const [orders, setOrders] = useState<Order[]>(() => readStored<Order[]>('orders', []));
  const [chatThreads, setChatThreads] = useState<ChatThread[]>(() => readStored<ChatThread[]>('chats', []));

  const currentUser: User = me || guestUser;

  // Navigation State
  const [currentView, setCurrentView] = useState<'catalog' | 'partner' | 'product' | 'dashboard' | 'orders' | 'security'>('catalog');
  const [selectedPartnerId, setSelectedPartnerId] = useState<string | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

  // Chat Widget State
  const [activeChatThreadId, setActiveChatThreadId] = useState<string | null>(null);

  // Modals
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [checkoutProduct, setCheckoutProduct] = useState<Product | null>(null);
  const [whatsappProduct, setWhatsappProduct] = useState<Product | null>(null);

  // Sync to localStorage (and drop the old demo-data keys from earlier versions)
  useEffect(() => {
    Object.keys(localStorage)
      .filter(k => k.startsWith('atelier_') || ['atelier2_users', 'atelier2_credentials', 'atelier2_partners', 'atelier2_products', 'atelier2_session', 'atelier2_site_hero'].includes(k))
      .forEach(k => localStorage.removeItem(k));
  }, []);

  useEffect(() => { persist('files', files); }, [files]);
  useEffect(() => { persist('orders', orders); }, [orders]);
  useEffect(() => { persist('chats', chatThreads); }, [chatThreads]);

  // Partners, products, accounts and the banner live in the shared database; this pulls the latest copy.
  const refresh = useCallback(async () => {
    const r = await api('GET', '/api/bootstrap');
    if (r.success) {
      setHasAdmin(r.hasAdmin);
      setPartners(r.partners);
      setProducts(r.products);
      setSiteHeroImageState(r.heroImage || HERO_IMAGE);
      setSocialLinks(r.socialLinks || []);
      setShowcaseVideos(r.showcaseVideos || []);
      setGlobalWhatsapp(r.globalWhatsapp || '');(r.me);
      if (!r.me && getToken()) setToken(null);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    void refresh();
    const timer = setInterval(() => { if (!document.hidden) void refresh(); }, 30000);
    return () => clearInterval(timer);
  }, [refresh]);

  const startSession = (user: User, token: string) => {
    setToken(token);
    setMe(user);
    setHasAdmin(true);
    setIsLoginModalOpen(false);
    if (user.role === 'partner' && user.partnerId) {
      setSelectedPartnerId(user.partnerId);
    } else {
      setSelectedPartnerId(null);
    }
    setCurrentView('dashboard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    void refresh();
  };

  const setupAdmin = async (name: string, email: string, password: string, setupCode: string): Promise<AuthResult> => {
    if (hasAdmin) return { success: false, error: 'An admin account already exists.' };
    if (!name.trim()) return { success: false, error: 'Name is required.' };
    if (!isValidEmail(email)) return { success: false, error: 'Enter a valid email address.' };
    if (password.length < MIN_PASSWORD_LENGTH) return { success: false, error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters.` };
    const r = await api('POST', '/api/setup-admin', { name: name.trim(), email: email.trim(), password, setupCode });
    if (!r.success) return { success: false, error: r.error };
    startSession(r.user, r.token);
    return { success: true };
  };

  const login = async (email: string, password: string, code?: string): Promise<AuthResult> => {
    const r = await api('POST', '/api/login', { email: email.trim(), password, code });
    if (!r.success) return { success: false, error: r.error, needsCode: !!r.needsCode, channel: r.channel };
    startSession(r.user, r.token);
    return { success: true };
  };

  const logout = () => {
    void api('POST', '/api/logout');
    setToken(null);
    setMe(null);
    setSelectedPartnerId(null);
    setCurrentView('catalog');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const addPartner = async (input: NewPartnerInput): Promise<AuthResult & { partner?: Partner }> => {
    if (currentUser.role !== 'admin') return { success: false, error: 'Only the global admin can add partners.' };
    const name = input.name.trim();
    const email = input.email.trim().toLowerCase();
    if (!name) return { success: false, error: 'Partner name is required.' };
    if (!input.leadDesigner.trim()) return { success: false, error: 'Lead designer / partner admin name is required.' };
    if (!isValidWhatsApp(input.whatsapp)) {
      return { success: false, error: 'Enter a valid WhatsApp number with country code (e.g. +33612345678).' };
    }
    if (!isValidKraPin(input.kraPin)) {
      return { success: false, error: 'Enter a valid KRA PIN (e.g. A123456789Z).' };
    }
    if (!input.address.trim()) return { success: false, error: 'Business location / address is required.' };
    if (input.deliveryAvailable && !(input.deliveryFee >= 0)) {
      return { success: false, error: 'Enter a valid delivery charge.' };
    }
    if (!isValidEmail(email)) return { success: false, error: 'Enter a valid login email for the partner.' };
    if (input.password.length < MIN_PASSWORD_LENGTH) {
      return { success: false, error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters.` };
    }
    const r = await api('POST', '/api/partners', { ...input, name, email });
    if (!r.success) return { success: false, error: r.error };
    setPartners(prev => [...prev, r.partner]);
    return { success: true, partner: r.partner };
  };

  const resetPartnerPassword = async (partnerId: string, newPassword: string): Promise<AuthResult> => {
    if (currentUser.role !== 'admin') return { success: false, error: 'Only the global admin can reset passwords.' };
    if (newPassword.length < MIN_PASSWORD_LENGTH) return { success: false, error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters.` };
    const r = await api('POST', `/api/partners/${encodeURIComponent(partnerId)}/password`, { password: newPassword });
    return { success: r.success, error: r.error };
  };

  const deletePartner = async (partnerId: string) => {
    if (currentUser.role !== 'admin') return;
    const r = await api('DELETE', `/api/partners/${encodeURIComponent(partnerId)}`);
    if (!r.success) return;
    setFiles(prev => prev.filter(f => f.partnerId !== partnerId));
    if (selectedPartnerId === partnerId) setSelectedPartnerId(null);
    await refresh();
  };
  const navigateTo = (view: 'catalog' | 'partner' | 'product' | 'dashboard' | 'orders' | 'security', partnerId?: string, productId?: string) => {
    setCurrentView(view);
    if (partnerId !== undefined) setSelectedPartnerId(partnerId);
    if (productId !== undefined) setSelectedProductId(productId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /**
   * RBAC: Can the current user access files of a specific partner?
   * Rule:
   * - Admin can view all partner files.
   * - A partner can ONLY view their own files (user.partnerId === partnerId).
   * - Other partners are strictly denied.
   * - General clients are denied access to private technical files.
   */
  const canAccessPartnerFiles = (partnerId: string): boolean => {
    if (currentUser.role === 'admin') return true;
    if (currentUser.role === 'partner' && currentUser.partnerId === partnerId) return true;
    return false;
  };

  /**
   * RBAC & Privacy Isolation: Can the current user access a specific communication thread?
   * Rule:
   * - Admin: Full supervisory and audit access (True)
   * - Client: Can access if they are the initiator (user.id === thread.clientId)
   * - Partner: Can access ONLY if they are the recipient partner (user.partnerId === thread.partnerId)
   * - NO other partner can see the communication at all!
   */
  const canAccessCommunication = (thread: ChatThread): boolean => {
    if (currentUser.role === 'admin') return true;
    if (currentUser.role === 'client' && currentUser.id === thread.clientId) return true;
    if (currentUser.role === 'partner' && currentUser.partnerId === thread.partnerId) return true;
    return false;
  };

  /**
   * RBAC: Can the current user view an order and its confidential record?
   */
  const canAccessOrder = (order: Order): boolean => {
    if (currentUser.role === 'admin') return true;
    if (currentUser.role === 'client' && currentUser.id === order.clientId) return true;
    if (currentUser.role === 'partner' && currentUser.partnerId === order.partnerId) return true;
    return false;
  };

  const getPartnerFiles = (partnerId: string): PartnerFile[] => {
    if (!canAccessPartnerFiles(partnerId)) {
      return [];
    }
    return files.filter(f => f.partnerId === partnerId);
  };

  const uploadPartnerFile = (fileData: Omit<PartnerFile, 'id' | 'uploadedAt' | 'uploadedBy'>) => {
    const newFile: PartnerFile = {
      ...fileData,
      id: `file-${Date.now()}`,
      uploadedAt: new Date().toISOString().split('T')[0],
      uploadedBy: currentUser.name
    };
    setFiles(prev => [newFile, ...prev]);
  };

  const deletePartnerFile = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const openChatForPartner = (partnerId: string, productId?: string) => {
    const partner = partners.find(p => p.id === partnerId);
    if (!partner) return;

    // Check if an existing thread exists between this client and partner
    const existingThread = chatThreads.find(
      t => t.partnerId === partnerId && t.clientId === currentUser.id
    );

    if (existingThread) {
      setActiveChatThreadId(existingThread.id);
    } else {
      // Create a fresh thread
      const product = productId ? products.find(p => p.id === productId) : undefined;
      const newThreadId = `thread-${currentUser.id}-${partnerId}-${Date.now()}`;
      const newThread: ChatThread = {
        id: newThreadId,
        partnerId: partner.id,
        partnerName: partner.name,
        clientId: currentUser.id,
        clientName: currentUser.name,
        clientEmail: currentUser.email,
        productId: product?.id,
        productTitle: product?.title,
        productImage: product?.image,
        createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
        lastMessageAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
        hasPurchase: false,
        messages: [
          {
            id: `msg-sys-${Date.now()}`,
            senderId: 'system',
            senderName: `${partner.name} Concierge`,
            senderRole: 'partner',
            content: `Welcome to the ${partner.name} Spinners&Spinners spinner. Our artisan directors are available for sizing inquiries, fabric consultations, and private appointments.`,
            timestamp: 'Just now',
            isSystemNotice: true
          }
        ]
      };
      setChatThreads(prev => [newThread, ...prev]);
      setActiveChatThreadId(newThreadId);
    }
  };

  const closeChat = () => {
    setActiveChatThreadId(null);
  };

  const sendChatMessage = (threadId: string, content: string) => {
    const thread = chatThreads.find(t => t.id === threadId);
    if (!thread) return;

    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderRole: currentUser.role,
      content,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatThreads(prev =>
      prev.map(t => {
        if (t.id === threadId) {
          return {
            ...t,
            lastMessageAt: 'Just now',
            messages: [...t.messages, newMessage]
          };
        }
        return t;
      })
    );

    // If sent by client, simulate a realistic tailored partner response after 1.5s
    if (currentUser.role === 'client') {
      setTimeout(() => {
        const partner = partners.find(p => p.id === thread.partnerId);
        const replies = [
          `Thank you for your inquiry regarding this piece. We would be pleased to hand-prepare tailored swatches for you.`,
          `Our master patternmaker has received your note. Each silhouette is hand-fitted with Spinners&Spinners precision.`,
          `We will gladly arrange white-glove direct courier delivery for this commission.`,
          `Understood. We have logged your Spinners&Spinners specifications with the Paris & Milan spinners.`
        ];
        const randomReply = replies[Math.floor(Math.random() * replies.length)];

        const partnerReply: ChatMessage = {
          id: `msg-reply-${Date.now()}`,
          senderId: `partner-${thread.partnerId}`,
          senderName: partner ? `${partner.leadDesigner} (${partner.name})` : 'Spinner Director',
          senderRole: 'partner',
          content: randomReply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setChatThreads(current =>
          current.map(t => {
            if (t.id === threadId) {
              return {
                ...t,
                lastMessageAt: 'Just now',
                messages: [...t.messages, partnerReply]
              };
            }
            return t;
          })
        );
      }, 1400);
    }
  };

  const placeOrder = (productId: string, selectedSize: string, shippingAddress: string, notes?: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return { success: false, error: 'Product not found' };

    const partner = partners.find(p => p.id === product.partnerId);
    if (!partner) return { success: false, error: 'Partner not found' };

    const orderId = `ORD-${partner.id.toUpperCase().slice(0, 5)}-${Math.floor(1000 + Math.random() * 9000)}`;

    // Find or create chat thread with this partner
    let thread = chatThreads.find(t => t.partnerId === product.partnerId && t.clientId === currentUser.id);
    let targetThreadId = thread?.id;

    if (!thread) {
      targetThreadId = `thread-${currentUser.id}-${partner.id}-${Date.now()}`;
      thread = {
        id: targetThreadId,
        partnerId: partner.id,
        partnerName: partner.name,
        clientId: currentUser.id,
        clientName: currentUser.name,
        clientEmail: currentUser.email,
        productId: product.id,
        productTitle: product.title,
        productImage: product.image,
        createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        lastMessageAt: 'Just now',
        hasPurchase: true,
        orderId: orderId,
        messages: []
      };
      setChatThreads(prev => [thread!, ...prev]);
    }

    const orderNotice: ChatMessage = {
      id: `msg-order-${Date.now()}`,
      senderId: 'system',
      senderName: 'Spinner Security Protocol',
      senderRole: 'admin',
      content: `🔒 CONFIDENTIAL TRANSACTION CONFIRMED: Order #${orderId} (${product.title}, Size: ${selectedSize}) has been registered. Pursuant to strict partner isolation protocols, this communication and customer record are locked solely to ${currentUser.name} and ${partner.name}. No competing partner can view this thread unless authenticated as Platform Admin.`,
      timestamp: 'Just now',
      isSystemNotice: true
    };

    // Update the thread to record the purchase and lockdown
    setChatThreads(prev =>
      prev.map(t => {
        if (t.id === targetThreadId) {
          return {
            ...t,
            hasPurchase: true,
            orderId: orderId,
            productId: product.id,
            productTitle: product.title,
            messages: [...t.messages, orderNotice]
          };
        }
        return t;
      })
    );

    const newOrder: Order = {
      id: orderId,
      clientId: currentUser.id,
      clientName: currentUser.name,
      clientEmail: currentUser.email,
      partnerId: partner.id,
      partnerName: partner.name,
      productId: product.id,
      productTitle: product.title,
      productPrice: product.price,
      productImage: product.image,
      selectedSize,
      shippingAddress,
      notes,
      status: 'Confirmed',
      createdAt: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
      chatThreadId: targetThreadId!,
      confidentialLock: true
    };

    setOrders(prev => [newOrder, ...prev]);

    return { success: true, orderId };
  };

  const addProduct = async (partnerId: string, input: NewProductInput): Promise<AuthResult> => {
    if (!input.title.trim() || !input.description.trim()) return { success: false, error: 'Item name and description are required.' };
    if (!input.image) return { success: false, error: 'Please upload a photo.' };
    if (!Number.isInteger(input.stock) || input.stock < 1) return { success: false, error: 'Quantity must be a whole number of at least 1.' };
    const r = await api('POST', '/api/products', { ...input, partnerId });
    if (!r.success) return { success: false, error: r.error };
    setProducts(prev => [r.product, ...prev]);
    return { success: true };
  };

  const uploadVideo = async (file: File): Promise<AuthResult & { videoId?: string }> => {
    const r = await api('POST', '/api/videos', undefined, { blob: file, type: file.type || 'video/mp4' });
    return { success: r.success, error: r.error, videoId: r.videoId };
  };

  const deleteProduct = async (productId: string) => {
    const r = await api('DELETE', `/api/products/${encodeURIComponent(productId)}`);
    if (r.success) setProducts(prev => prev.filter(p => p.id !== productId));
  };

  const setSiteHeroImage = async (image: string): Promise<AuthResult> => {
    if (currentUser.role !== 'admin') return { success: false, error: 'Only the global admin can change this image.' };
    const r = await api('PUT', '/api/hero', { image: image || null });
    if (r.success) setSiteHeroImageState(image || HERO_IMAGE);
    return { success: r.success, error: r.error };
  };

  const addSocialLink: AppContextType['addSocialLink'] = async input => {
    const r = await api('POST', '/api/social', input);
    if (r.success) setSocialLinks(prev => [...prev, r.link]);
    return { success: r.success, error: r.error };
  };

  const addShowcaseVideo: AppContextType['addShowcaseVideo'] = async ({ file, title, description }) => {
    const up = await uploadVideo(file);
    if (!up.success) return { success: false, error: up.error || 'Could not upload the video.' };
    const r = await api('POST', '/api/showcase', { videoId: up.videoId, title, description });
    if (r.success) setShowcaseVideos(prev => [r.video, ...prev]);
    return { success: r.success, error: r.error };
  };

  const deleteShowcaseVideo = async (id: string) => {
    const r = await api('DELETE', `/api/showcase/${encodeURIComponent(id)}`);
    if (r.success) setShowcaseVideos(prev => prev.filter(v => v.id !== id));
  };

  const deleteSocialLink = async (id: string) => {
    const r = await api('DELETE', `/api/social/${encodeURIComponent(id)}`);
    if (r.success) setSocialLinks(prev => prev.filter(l => l.id !== id));
  };

  const updatePartnerFulfilment = async (
    partnerId: string,
    data: { address: string; deliveryAvailable: boolean; deliveryFee: number }
  ): Promise<AuthResult> => {
    if (!data.address.trim()) return { success: false, error: 'Business location / address is required.' };
    if (data.deliveryAvailable && !(data.deliveryFee >= 0)) return { success: false, error: 'Enter a valid delivery charge.' };
    const r = await api('PATCH', `/api/partners/${encodeURIComponent(partnerId)}/fulfilment`, data);
    if (r.success) setPartners(prev => prev.map(p => (p.id === partnerId ? r.partner : p)));
    return { success: r.success, error: r.error };
  };

  const markProductSold = async (productId: string, quantity = 1) => {
    const r = await api('POST', `/api/products/${encodeURIComponent(productId)}/sold`, { quantity });
    if (r.success) setProducts(prev => prev.map(p => (p.id === productId ? r.product : p)));
  };

  const setProductStock = async (productId: string, stock: number) => {
    if (!Number.isInteger(stock) || stock < 0) return;
    const r = await api('PATCH', `/api/products/${encodeURIComponent(productId)}/stock`, { stock });
    if (r.success) setProducts(prev => prev.map(p => (p.id === productId ? r.product : p)));
  };

  const updateOrderStatus = (orderId: string, status: Order['status']) => {
    setOrders(prev =>
      prev.map(o => (o.id === orderId ? { ...o, status } : o))
    );
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        isLoading,
        uploadVideo,
        hasAdmin,
        setupAdmin,
        login,
        logout,
        partners,
        products,
        addPartner,
        resetPartnerPassword,
        deletePartner,
        addProduct,
        deleteProduct,
        markProductSold,
        setProductStock,
        siteHeroImage,
        setSiteHeroImage,
        showcaseVideos,
        globalWhatsapp,
        refreshSite: refresh,
        addShowcaseVideo,
        deleteShowcaseVideo,
        socialLinks,
        addSocialLink,
        deleteSocialLink,
        files,
        orders,
        chatThreads,
        currentView,
        selectedPartnerId,
        selectedProductId,
        navigateTo,
        canAccessPartnerFiles,
        canAccessCommunication,
        canAccessOrder,
        getPartnerFiles,
        uploadPartnerFile,
        deletePartnerFile,
        activeChatThreadId,
        openChatForPartner,
        closeChat,
        sendChatMessage,
        placeOrder,
        updateOrderStatus,
        isLoginModalOpen,
        setIsLoginModalOpen,
        isCheckoutModalOpen,
        setIsCheckoutModalOpen,
        checkoutProduct,
        setCheckoutProduct,
        whatsappProduct,
        setWhatsappProduct,
        updatePartnerFulfilment
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
