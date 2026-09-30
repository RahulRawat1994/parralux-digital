import 'dotenv/config';
import nodemailer from 'nodemailer';
import type SMTPTransport from 'nodemailer/lib/smtp-transport/index.js';

export interface Submission {
  type: 'contact' | 'quote' | 'newsletter';
  email: string;
  name?: string;
  subject?: string;
  service?: string;
  message?: string;
}
export function validEmail(value: string): boolean {
  return value.length <= 254 && /^[^\s@<>(),;:"\\\[\]\x00-\x1f\x7f]+@[a-z\d](?:[a-z\d.-]*[a-z\d])?\.[a-z]{2,}$/i.test(value);
}
export class MailConfigurationError extends Error {}

export function smtpConfiguration(env: NodeJS.ProcessEnv = process.env) {
  const host = env.SMTP_HOST?.trim();
  const port = Number(env.SMTP_PORT || '587');
  const user = env.SMTP_USER?.trim();
  const pass = env.SMTP_PASS;
  const from = env.SMTP_FROM?.trim() || '';
  const to = env.MAIL_TO?.trim() || '';
  const secure = env.SMTP_SECURE ? env.SMTP_SECURE === 'true' : port === 465;
  if (!host || /[\s\r\n]/.test(host) || !Number.isInteger(port) || port < 1 || port > 65535 ||
      !user || !pass || !validEmail(from) || !validEmail(to) ||
      (env.SMTP_SECURE && !['true', 'false'].includes(env.SMTP_SECURE))) {
    throw new MailConfigurationError('SMTP configuration is incomplete.');
  }
  const transport: SMTPTransport.Options = {
    host, port, secure, requireTLS: !secure,
    auth: {user, pass},
    tls: {minVersion: 'TLSv1.2'},
    connectionTimeout: 10000, greetingTimeout: 10000, socketTimeout: 15000,
    logger: false, debug: false,
  };
  return {transport, from, to};
}
export function messageFor(submission: Submission, from: string, to: string) {
  const labels = {contact: 'Contact enquiry', quote: 'Quote request', newsletter: 'Email signup request'};
  const lines = [
    `Form: ${labels[submission.type]}`,
    ...(submission.name ? [`Name: ${submission.name}`] : []),
    `Email: ${submission.email}`,
    ...(submission.subject ? [`Subject: ${submission.subject}`] : []),
    ...(submission.service ? [`Service: ${submission.service}`] : []),
    '',
    submission.type === 'newsletter'
      ? 'This visitor requested email updates from ParRaLux Digital. This is a signup request for your review; no mailing-list enrollment has been performed.'
      : submission.message || '',
  ];
  return {
    from: {name: 'ParRaLux Digital', address: from}, to,
    replyTo: submission.email,
    subject: `[ParRaLux Digital] ${labels[submission.type]}`,
    text: lines.join('\n'),
    disableFileAccess: true, disableUrlAccess: true,
  };
}
export async function sendSubmission(submission: Submission): Promise<void> {
  const {transport, from, to} = smtpConfiguration();
  const mailer = nodemailer.createTransport(transport);
  try {
    const result = await mailer.sendMail(messageFor(submission, from, to));
    if (!result.accepted?.length || result.rejected?.length) throw new Error('SMTP recipient was not accepted.');
  } finally {
    mailer.close();
  }
}
