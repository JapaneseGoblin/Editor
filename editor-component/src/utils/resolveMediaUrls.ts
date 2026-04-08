import type { JSONContent } from '@tiptap/core';
import { getToken, getMediaUrl, isMediaUrl, extractMediaId } from './apiClient';

async function resolveNodeSrc(src: string): Promise<string> {
  if (!isMediaUrl(src)) return src;
  const mediaId = extractMediaId(src);
  if (!mediaId) return src;
  const token = getToken();
  if (!token) return src;
  const authValue = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
  try {
    const res = await fetch(getMediaUrl(mediaId), { headers: { Authorization: authValue } });
    if (!res.ok) return src;
    const blob = await res.blob();
    return URL.createObjectURL(blob);
  } catch {
    return src;
  }
}

export async function resolveMediaUrls(doc: JSONContent): Promise<JSONContent> {
  if (!doc) return doc;
  if (doc.type === 'resizableImage' && doc.attrs?.src) {
    const resolved = await resolveNodeSrc(doc.attrs.src);
    return { ...doc, attrs: { ...doc.attrs, src: resolved } };
  }
  if (doc.content?.length) {
    const resolvedContent = await Promise.all(doc.content.map(resolveMediaUrls));
    return { ...doc, content: resolvedContent };
  }
  return doc;
}

// Modul szintű cache – StrictMode kettős mountnál nem fut le kétszer
const _cache = new Map<string, Promise<JSONContent>>();

export function resolveMediaUrlsCached(doc: JSONContent, cacheKey: string): Promise<JSONContent> {
  if (!_cache.has(cacheKey)) {
    _cache.set(cacheKey, resolveMediaUrls(doc));
  }
  return _cache.get(cacheKey)!;
}

export function clearMediaCache(cacheKey: string): void {
  _cache.delete(cacheKey);
}