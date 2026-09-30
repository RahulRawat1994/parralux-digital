import { services } from '../data/site.ts';
import { validEmail, type Submission } from './mail.ts';

const MAX_BODY_BYTES = 65536;
const WINDOWS_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 5;
export class FormError extends Error {
  status: number;
  constructor(status: number, message: string) { super(message); this.status = status; }
}
function field(data: URLSearchParams, name: string, max: number, required = true): string {
  const values = data.getAll(name);
  if (values.length > 1) throw new FormError(422, 'Please use a single value for each field.');
  const value = (values[0] || '').trim();
  if ((required && !value) || Array.from(value).length > max || /[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/.test(value)) {
    throw new FormError(422, 'Please complete all required fields within their length limits.');
  }
  return value;
}
export function validateSubmission(data: URLSearchParams): Submission {
  if (field(data, 'website', 200, false)) throw new FormError(422, 'Unable to accept this submission.');
  const type = field(data, 'form_type', 20);
  if (!['contact', 'quote', 'newsletter'].includes(type)) throw new FormError(422, 'Please choose a valid form.');
  const email = field(data, 'email', 254);
  if (!validEmail(email)) throw new FormError(422, 'Please enter a valid email address.');
  if (type === 'newsletter') return {type, email};
  const name = field(data, 'name', 120);
  const message = field(data, 'message', 5000);
  if (/[\r\n]/.test(name)) throw new FormError(422, 'Please enter your name on one line.');
  if (type === 'quote') {
    const service = field(data, 'service', 100);
    if (!services.some((item) => item.title === service)) throw new FormError(422, 'Please select one of our services.');
    return {type, name, email, service, message};
  }
  const subject = field(data, 'subject', 200);
  if (/[\r\n]/.test(subject)) throw new FormError(422, 'Please enter a single-line subject.');
  return {type: 'contact', name, email, subject, message};
}
export function createLimiter(now = Date.now) {
  const attempts = new Map<string, {count: number; expires: number}>();
  return (key: string): boolean => {
    const time = now();
    for (const [address, value] of attempts) if (value.expires <= time) attempts.delete(address);
    const record = attempts.get(key);
    if (record) { if (record.count >= MAX_ATTEMPTS) return false; record.count++; return true; }
    if (attempts.size >= 10000) return false;
    attempts.set(key, {count: 1, expires: time + WINDOWS_MS});
    return true;
  };
}
async function readBody(request: Request): Promise<URLSearchParams> {
  if (request.headers.get('content-type')?.split(';')[0]?.trim() !== 'application/x-www-form-urlencoded') {
    throw new FormError(415, 'Please submit this request using the website form.');
  }
  if (Number(request.headers.get('content-length')) > MAX_BODY_BYTES) throw new FormError(413, 'Your message is too large.');
  if (!request.body) throw new FormError(422, 'Please complete the form.');
  const reader = request.body.getReader();
  const decoder = new TextDecoder('utf-8', {fatal: true});
  let bytes = 0, text = '';
  try {
    while (true) {
      const {value, done} = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > MAX_BODY_BYTES) { await reader.cancel(); throw new FormError(413, 'Your message is too large.'); }
      text += decoder.decode(value, {stream: true});
    }
    text += decoder.decode();
  } catch (error) {
    if (error instanceof FormError) throw error;
    throw new FormError(400, 'The form could not be read. Please try again.');
  } finally { reader.releaseLock(); }
  return new URLSearchParams(text);
}
const escapeHtml = (value: string) => value.replace(/[&<>"']/g, (char) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]!));
function response(request: Request, status: number, message: string, type = 'contact'): Response {
  const headers = new Headers({'Cache-Control':'no-store', 'X-Content-Type-Options':'nosniff'});
  if (status === 405) headers.set('Allow', 'POST');
  if (status === 429) headers.set('Retry-After', '600');
  const ok = status === 200;
  if (request.headers.get('accept')?.includes('application/json')) {
    headers.set('Content-Type', 'application/json; charset=utf-8');
    return new Response(JSON.stringify({ok, message}), {status, headers});
  }
  headers.set('Content-Type', 'text/html; charset=utf-8');
  const back = type === 'quote' ? '/#request-quote' : type === 'newsletter' ? '/#signup-title' : '/contact';
  return new Response(`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>${ok ? 'Request received' : 'Message not sent'} | ParRaLux Digital</title><style>body{font:18px/1.65 system-ui,sans-serif;color:#091e3e;background:#eef9ff;margin:0}main{max-width:650px;margin:10vh auto;padding:2rem;background:white;border-radius:12px}img{max-width:240px;width:100%;height:auto}a{color:#007da8}h1{line-height:1.2}</style></head><body><main><a href="/"><img src="/images/parralux-logo.png" alt="ParRaLux Digital home"></a><h1>${ok ? 'Thank you for getting in touch' : 'Your message was not sent'}</h1><p>${escapeHtml(message)}</p>${ok ? '' : '<p>Use your browser’s Back button to return to your entered details.</p>'}<a href="${back}">Return to the form</a></main></body></html>`, {status, headers});
}
export function createFormHandler(options: {
  send: (submission: Submission) => Promise<void>;
  allow?: (client: string) => boolean;
  origin?: () => string | undefined;
  onError?: (error: unknown) => void;
}) {
  const allow = options.allow || createLimiter();
  return async (request: Request, client: string): Promise<Response> => {
    let type = 'contact';
    try {
      if (request.method !== 'POST') return response(request, 405, 'Please submit your request using a website form.');
      const origin = request.headers.get('origin');
      const expectedOrigin = options.origin?.() || new URL(request.url).origin;
      if (origin && origin !== new URL(expectedOrigin).origin) throw new FormError(403, 'Please submit this form from our website.');
      if (!allow(client)) throw new FormError(429, 'Too many requests. Please wait ten minutes before trying again.');
      const data = await readBody(request);
      type = data.get('form_type') || type;
      const submission = validateSubmission(data);
      await options.send(submission);
      const message = submission.type === 'newsletter'
        ? 'Your email signup request has been sent to our team for review.'
        : 'Your request has been accepted for email delivery to our team. Thank you for getting in touch.';
      return response(request, 200, message, type);
    } catch (error) {
      if (error instanceof FormError) return response(request, error.status, error.message, type);
      options.onError?.(error);
      return response(request, 503, 'We could not send your request right now. Please try again later.', type);
    }
  };
}
