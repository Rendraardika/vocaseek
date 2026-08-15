export function normalizeAssetUrl(value) {
  if (!value) return "";

  let raw = String(value).trim();
  if (!raw) return "";

  if (/^http:\/\//i.test(raw) && typeof window !== 'undefined' && window.location.protocol === 'https:') {
    raw = raw.replace(/^http:\/\//i, 'https://');
  }

  if (/^https?:\/\//i.test(raw) || raw.startsWith("data:") || raw.startsWith("blob:")) {
    return raw;
  }

  const apiBase =
    import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api";

  try {
    const apiUrl = new URL(apiBase, window.location.origin);
    const origin = apiUrl.origin;
    const trimmed = raw.replace(/^\/+/, "");
    const normalizedPath = trimmed.startsWith("storage/")
      ? trimmed
      : `storage/${trimmed}`;

    return `${origin}/${normalizedPath}`;
  } catch {
    return raw;
  }
}

export function pickFirstMediaValue(...values) {
  for (const value of values) {
    if (value === null || value === undefined) continue;

    const normalized = normalizeAssetUrl(value);
    if (normalized) {
      return normalized;
    }
  }

  return "";
}
