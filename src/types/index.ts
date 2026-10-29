export type UserRole = 'client' | 'partner' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  partnerId?: string; // set if role is 'partner'
  partnerName?: string;
  avatar: string;
  title: string;
}

export interface Partner {
  id: string;
  name: string;
  location: string;
  ethos: string;
  tagline: string;
  accentColor: string;
  heroImage: string;
  founded: number;
  leadDesigner: string;
  specialty: string;
  story: string;
  bannerText: string;
  whatsapp: string; // international format, e.g. +33612345678
  kraPin: string;
  address: string; // physical business location for visits and self collection
  deliveryAvailable: boolean;
  deliveryFee: number; // KSh, paid by the customer
}

export interface Product {
  id: string;
  partnerId: string;
  partnerName: string;
  title: string;
  category: string;
  price: number;
  currency: string;
  image: string;
  description: string;
  details: string[];
  materials: string[];
  sizes: string[];
  leadTime: string;
  featured: boolean;
  stock?: number;
  videoId?: string;
}

export interface PartnerFile {
  id: string;
  partnerId: string;
  fileName: string;
  fileType: 'techpack' | 'lookbook' | 'cad' | 'invoice' | 'certification';
  fileSize: string;
  uploadedAt: string;
  classification: 'Confidential - Spinner Internal' | 'Tech Spec' | 'Material Audit' | 'Wholesale Tier';
  uploadedBy: string;
  notes: string;
  downloadUrl?: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  content: string;
  timestamp: string;
  isSystemNotice?: boolean;
}

export interface ChatThread {
  id: string;
  partnerId: string;
  partnerName: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  productId?: string;
  productTitle?: string;
  productImage?: string;
  createdAt: string;
  lastMessageAt: string;
  messages: ChatMessage[];
  hasPurchase: boolean;
  orderId?: string;
}

export interface Order {
  id: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  partnerId: string;
  partnerName: string;
  productId: string;
  productTitle: string;
  productPrice: number;
  productImage: string;
  selectedSize: string;
  shippingAddress: string;
  notes?: string;
  status: 'Confirmed' | 'In Production' | 'Spinner QA' | 'Dispatched';
  createdAt: string;
  chatThreadId: string;
  confidentialLock: boolean;
}
