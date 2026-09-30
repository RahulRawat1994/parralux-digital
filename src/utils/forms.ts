// Public POST destinations, never API keys. Reject example or malformed endpoints.
export function formEndpoint(value: string | undefined): string | undefined {
  if (!value) return undefined;
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' || url.username || url.password || /(^|\.)(example\.(com|org|net)|example)$/.test(url.hostname)) return undefined;
    return url.href;
  } catch { return undefined; }
}
