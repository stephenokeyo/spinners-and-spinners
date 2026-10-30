import { Partner, Product } from '../types';

export const normalizeWhatsApp = (raw: string): string => raw.replace(/\D/g, '');

export const isValidWhatsApp = (raw: string): boolean => {
  const digits = normalizeWhatsApp(raw);
  return digits.length >= 8 && digits.length <= 15;
};

export type Fulfilment = 'visit' | 'collect' | 'delivery';

export const isValidKraPin = (pin: string): boolean => /^[AP]\d{9}[A-Z]$/.test(pin.trim().toUpperCase());

// Opens a chat with this specific partner only, pre-filled with the product and how the customer wants to receive it.
export const buildWhatsAppUrl = (
  partner: Partner | undefined,
  product?: Product,
  fulfilment?: Fulfilment,
  deliveryLocation?: string,
  client?: { name?: string; phone?: string }
): string | null => {
  if (!partner || !isValidWhatsApp(partner.whatsapp)) return null;
  let text = product
    ? `Hello ${partner.name}, I'm interested in "${product.title}" that I saw on Spinners&Spinners.`
    : `Hello ${partner.name}, I found you on Spinners&Spinners.`;
  if (fulfilment === 'visit') text += ` I would like to visit your business at ${partner.address} and buy in person.`;
  if (fulfilment === 'collect') text += ` I would like to buy it and collect it myself from ${partner.address}.`;
  if (fulfilment === 'delivery') {
    text += ` I would like it delivered${deliveryLocation ? ` to ${deliveryLocation}` : ''}.`;
    text += partner.deliveryFee > 0
      ? ` I understand the delivery charge is KSh ${partner.deliveryFee.toLocaleString()}.`
      : ' Please confirm the delivery charge.';
    if (client?.name) text += ` My name is ${client.name}.`;
    if (client?.phone) text += ` You can reach me on ${client.phone}.`;
  }
  return `https://wa.me/${normalizeWhatsApp(partner.whatsapp)}?text=${encodeURIComponent(text)}`;
};

export const formatPrice = (product: Pick<Product, 'price' | 'currency'>): string =>
  product.price > 0
    ? `KSh ${product.price.toLocaleString()}`
    : 'Price on request';

// Downscales an uploaded photo so it fits comfortably in localStorage.
export const fileToCompressedDataUrl = (file: File, maxSize = 1000, quality = 0.8): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Could not read the image file.'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('The selected file is not a valid image.'));
      img.onload = () => {
        const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('Canvas is not supported.'));
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
