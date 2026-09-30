import test from 'node:test';
import assert from 'node:assert/strict';
import { createFormHandler, createLimiter, validateSubmission } from '../src/server/forms.ts';
import { smtpConfiguration, messageFor, type Submission } from '../src/server/mail.ts';

const base = {form_type: 'contact', name: 'Local Test', email: 'test@example.com', subject: 'Website project', message: 'Hello\nI would like a website.', website: ''};
function request(fields: Record<string,string> = base, overrides: RequestInit = {}) {
  return new Request('https://parralux.test/api/forms', {method:'POST', body:new URLSearchParams(fields), headers:{'Accept':'application/json','Origin':'https://parralux.test'}, ...overrides});
}

test('validates contact, quote and signup field sets', () => {
  assert.equal(validateSubmission(new URLSearchParams(base)).type, 'contact');
  assert.equal(validateSubmission(new URLSearchParams({...base,form_type:'quote',service:'Designing'})).service, 'Designing');
  assert.deepEqual(validateSubmission(new URLSearchParams({form_type:'newsletter',email:'signup@example.com'})), {type:'newsletter',email:'signup@example.com'});
});
test('rejects invalid email, header injection, invalid service, duplicates, oversize text and honeypot', () => {
  for (const fields of [
    {...base,email:'not-email'}, {...base,email:'a@example.com\r\nBcc: spam@example.com'},
    {...base,subject:'Hello\r\nBcc: spam@example.com'}, {...base,name:'a\nb'},
    {...base,message:'x'.repeat(5001)}, {...base,website:'https://bot.test'},
    {...base,form_type:'quote',service:'unknown'}, {...base,form_type:'arbitrary'},
  ]) assert.throws(()=>validateSubmission(new URLSearchParams(fields)));
  const duplicate = new URLSearchParams(base);duplicate.append('email','other@example.com');
  assert.throws(()=>validateSubmission(duplicate));
});
test('mail goes only to the configured company recipient, with visitor as Reply-To', () => {
  const message = messageFor(validateSubmission(new URLSearchParams({...base,to:'attacker@example.com'})), 'sender@parralux.test', 'owner@parralux.test');
  assert.equal(message.to,'owner@parralux.test');
  assert.equal(message.from.address,'sender@parralux.test');
  assert.equal(message.replyTo,base.email);
  assert.match(message.text,/Website project/);
  assert.equal(message.disableUrlAccess,true);
});
test('requires valid SMTP config and TLS; credentials stay in server transport settings', () => {
  const env = {SMTP_HOST:'smtp.example.com', SMTP_USER:'user', SMTP_PASS:'test-only-secret', SMTP_FROM:'sender@example.com',MAIL_TO:'owner@example.com'};
  const starttls = smtpConfiguration(env);
  assert.equal(starttls.transport.requireTLS,true);assert.equal(starttls.transport.secure,false);
  const ssl = smtpConfiguration({...env, SMTP_PORT:'465'});
  assert.equal(ssl.transport.secure,true);
  assert.throws(()=>smtpConfiguration({...env,SMTP_PASS:''}));
  assert.throws(()=>smtpConfiguration({...env,MAIL_TO:'owner@example.com,other@example.com'}));
  assert.throws(()=>smtpConfiguration({...env,SMTP_SECURE:'oops'}));
});
test('returns success only after the mailer accepts a message', async () => {
  const sent: Submission[] = [];
  const handler = createFormHandler({send:async data=>{sent.push(data)}});
  const result=await handler(request(),'client');
  assert.equal(result.status,200);assert.equal((await result.json()).ok,true);assert.equal(sent.length,1);
});
test('SMTP errors are not exposed and never report success', async () => {
  const handler=createFormHandler({send:async()=>{throw new Error('password=private')}});
  const result=await handler(request(),'client'); const body=await result.text();
  assert.equal(result.status,503);assert.doesNotMatch(body,/private/);assert.match(body,/"ok":false/);
});
test('rejects cross-origin, unsupported methods/content types, oversized bodies without sending', async () => {
  let calls=0;
  const handler=createFormHandler({send:async()=>{calls++}});
  assert.equal((await handler(request(base,{headers:{Origin:'https://evil.test'}}),'a')).status,403);
  assert.equal((await handler(new Request('https://parralux.test/api/forms'),'a')).status,405);
  assert.equal((await handler(request(base,{headers:{'Content-Type':'application/json'}}),'b')).status,415);
  assert.equal((await handler(request({...base,message:'x'.repeat(70000)}),'c')).status,413);
  assert.equal(calls,0);
});
test('rate limits repeat requests and permits them after the window expires', () => {
  let time=0;const allow=createLimiter(()=>time);
  for(let i=0;i<5;i++) assert.equal(allow('one'),true);
  assert.equal(allow('one'),false);assert.equal(allow('two'),true);
  time=600001;assert.equal(allow('one'),true);
});
test('rate-limited responses include Retry-After and do not call SMTP', async () => {
  const handler=createFormHandler({send:async()=>{throw new Error('must not send')},allow:()=>false});
  const result=await handler(request(),'a');assert.equal(result.status,429);assert.equal(result.headers.get('Retry-After'),'600');
});
test('native no-JavaScript forms get an accessible HTML confirmation', async () => {
  const handler=createFormHandler({send:async()=>{}});
  const result=await handler(request({...base,form_type:'quote',service:'SEO'},{headers:{'Content-Type':'application/x-www-form-urlencoded'}}),'client');
  assert.equal(result.status,200);assert.match(result.headers.get('Content-Type')!,/text\/html/);
  const html=await result.text();assert.match(html,/#request-quote/);assert.match(html,/accepted for email delivery/);
});
test('signup confirmation describes a request, not automatic mailing-list enrollment', async () => {
  const handler=createFormHandler({send:async()=>{}});
  const result=await handler(request({form_type:'newsletter',email:'test@example.com'}),'client');
  assert.match((await result.json()).message,/for review/);
});
