const BASE_URL   = 'https://localhost:7269';
const MEDIA_PATH = '/evoHumusz/Media';

export function getMediaUrl(mediaId: string): string {
  return `${BASE_URL}${MEDIA_PATH}/GetMedia?mediaId=${encodeURIComponent(mediaId)}`;
}

export function isMediaUrl(src: string): boolean {
  return src.includes(`${MEDIA_PATH}/GetMedia`);
}

export function extractMediaId(src: string): string | null {
  const match = src.match(/[?&]mediaId=([^&]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

const TOKEN_KEY = 'humusz_auth_token';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

function authHeaders(): HeadersInit {
  const token = getToken();
  if (!token) return {};
  const value = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
  return { Authorization: value };
}

export interface UploadResult {
  mediaId: string;
  url: string;
}

export async function uploadMedia(file: File): Promise<UploadResult> {
  const formData = new FormData();
  formData.append('File', file);

  let res: Response;
  try {
    res = await fetch(`${BASE_URL}${MEDIA_PATH}/Upload`, {
      method: 'POST',
      headers: authHeaders(),
      body: formData,
    });
  } catch (networkErr) {
    throw new Error(`NETWORK_ERROR: ${String(networkErr)}`);
  }

  if (res.status === 401) throw new Error('AUTH_REQUIRED');
  if (!res.ok) throw new Error(`Feltöltés sikertelen: ${res.status}`);

  const contentType = res.headers.get('content-type') ?? '';
  if (contentType.includes('application/json')) {
    const data = await res.json();
    const mediaId: string = typeof data === 'string' ? data : (data.mediaId ?? data.id ?? data);
    return { mediaId, url: getMediaUrl(mediaId) };
  }
  const mediaId = (await res.text()).trim();
  return { mediaId, url: getMediaUrl(mediaId) };
}