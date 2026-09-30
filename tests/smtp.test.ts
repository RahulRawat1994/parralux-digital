// Integration test: a private TLS SMTP sink accepts mail locally; no external mail is sent.
import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:tls';
import { mkdtempSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync, spawn } from 'node:child_process';

test('Nodemailer authenticates over verified TLS and sends all three forms to the company inbox', async () => {
  const directory = mkdtempSync(join(tmpdir(),'parralux-smtp-'));
  const cert = join(directory,'cert.pem'), key = join(directory,'key.pem'), config = join(directory,'openssl.cnf');
  writeFileSync(config, '[req]\ndistinguished_name=dn\nx509_extensions=ext\nprompt=no\n[dn]\nCN=localhost\n[ext]\nsubjectAltName=DNS:localhost,IP:127.0.0.1\nbasicConstraints=critical,CA:TRUE\n');
  execFileSync('openssl',['req','-x509','-newkey','rsa:2048','-nodes','-days','1','-keyout',key,'-out',cert,'-config',config],{stdio:'ignore'});
  const envelopes: string[] = [], messages: string[] = [];
  let authentications=0;
  const server = createServer({key:readFileSync(key),cert:readFileSync(cert)}, socket => {
    socket.setEncoding('utf8');
    socket.write('220 localhost SMTP test sink\r\n');
    let buffered='', dataMode=false, data='';
    socket.on('data', (chunk:string) => {
      buffered+=chunk;
      let end;
      while((end=buffered.indexOf('\r\n'))>=0) {
        const line=buffered.slice(0,end);buffered=buffered.slice(end+2);
        if(dataMode) {
          if(line==='.') {messages.push(data);data='';dataMode=false;socket.write('250 accepted locally\r\n');}
          else data+=line+'\r\n';
        } else if(line.startsWith('EHLO')) socket.write('250-localhost\r\n250 AUTH PLAIN\r\n');
        else if(line.startsWith('AUTH PLAIN')) {authentications++;socket.write('235 authenticated\r\n');}
        else if(line.startsWith('MAIL FROM:')||line.startsWith('RCPT TO:')) {envelopes.push(line);socket.write('250 OK\r\n');}
        else if(line==='DATA') {dataMode=true;socket.write('354 end with dot\r\n');}
        else if(line==='QUIT') {socket.end('221 bye\r\n');}
        else socket.write('250 OK\r\n');
      }
    });
  });
  try {
    await new Promise<void>((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve)});
    const address=server.address();assert.ok(address && typeof address!=='string');
    const code=`import {sendSubmission} from './src/server/mail.ts';
      await sendSubmission({type:'contact',name:'Local Test',email:'visitor@example.com',subject:'Local contact',message:'Local test body'});
      await sendSubmission({type:'quote',name:'Local Test',email:'visitor@example.com',service:'SEO',message:'Local quote'});
      await sendSubmission({type:'newsletter',email:'visitor@example.com'});`;
    await new Promise<void>((resolve,reject)=>{
      const child=spawn(process.execPath,['--experimental-strip-types','--input-type=module','-e',code],{env:{...process.env,NODE_EXTRA_CA_CERTS:cert,SMTP_HOST:'127.0.0.1',SMTP_PORT:String(address.port),SMTP_SECURE:'true',SMTP_USER:'local-test',SMTP_PASS:'local-test-only',SMTP_FROM:'sender@parralux.test',MAIL_TO:'owner@parralux.test'},stdio:['ignore','ignore','pipe']});
      let error='';child.stderr.on('data',chunk=>error+=chunk);child.on('error',reject);child.on('exit',status=>status===0?resolve():reject(new Error(error)));
    });
    assert.equal(authentications,3);assert.equal(messages.length,3);
    assert.equal(envelopes.filter(line=>line==='RCPT TO:<owner@parralux.test>').length,3);
    assert.ok(messages.every(message=>message.includes('Reply-To: visitor@example.com')));
    assert.ok(messages.every(message=>!message.includes('local-test-only')));
  } finally {
    await new Promise<void>(resolve=>server.close(()=>resolve()));
    rmSync(directory,{recursive:true,force:true});
  }
});
