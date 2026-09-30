import type { APIRoute } from 'astro';
import { createFormHandler } from '../../server/forms';
import { sendSubmission } from '../../server/mail';
export const prerender = false;
const handler = createFormHandler({
  send: sendSubmission,
  origin: () => process.env.SITE_URL,
  // Do not log SMTP credentials, provider responses, or visitor form content.
  onError: () => console.error('[forms] Email delivery failed; check the server SMTP configuration.'),
});
export const ALL: APIRoute = ({request, clientAddress}) => handler(request, clientAddress);
