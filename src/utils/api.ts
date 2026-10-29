const TOKEN_KEY = 'spinners_token';

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (t: string | null) =>
  t ? localStorage.setItem(TOKEN_KEY, t) : localStorage.removeItem(TOKEN_KEY);

export interface ApiResult {
  success: boolean;
  error?: string;
  [key: string]: any;
}

export const api = async (method: string, url: string, body?: unknown, raw?: { blob: Blob; type: string }): Promise<ApiResult> => {
  const headers: Record<string, string> = {};
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  let payload: BodyInit | undefined;
  if (raw) {
    headers['Content-Type'] = raw.type;
    payload = raw.blob;
  } else if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
    payload = JSON.stringify(body);
  }
  try {
    const res = await fetch(url, { method, headers, body: payload });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return { ...data, success: false, error: data.error || `Request failed (${res.status}).` };
    return { success: true, ...data };
  } catch {
    return { success: false, error: 'Cannot reach the server. Check your connection and try again.' };
  }
};

export const MAX_VIDEO_MB = 50;
export const videoUrl = (id: string) => `/api/videos/${encodeURIComponent(id)}`;
