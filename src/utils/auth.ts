const toB64 = (buf: ArrayBuffer | Uint8Array): string =>
  btoa(String.fromCharCode(...new Uint8Array(buf)));

const fromB64 = (b64: string): Uint8Array<ArrayBuffer> =>
  Uint8Array.from(atob(b64), c => c.charCodeAt(0));

export const generateSalt = (): string => toB64(crypto.getRandomValues(new Uint8Array(16)));

// PBKDF2-SHA256. Requires a secure context (https or localhost).
export const hashPassword = async (password: string, saltB64: string): Promise<string> => {
  if (!globalThis.crypto?.subtle) {
    throw new Error('Secure login requires HTTPS or localhost.');
  }
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt: fromB64(saltB64), iterations: 150_000 },
    key,
    256
  );
  return toB64(bits);
};

export const isValidEmail = (email: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

export const MIN_PASSWORD_LENGTH = 8;
