# Deploy ParRaLux Digital to Vercel

The previous configuration produced a standalone Node server. Vercel deployments now use `@astrojs/vercel` to generate `.vercel/output`, including seven static pages and the `/api/forms` serverless endpoint. Local builds continue using the Node adapter.

## Redeploy

1. Commit and push the changed `astro.config.mjs`, `vercel.json`, `package.json`, and `package-lock.json` files to the GitHub branch connected to Vercel. Include the remaining source changes if not already committed. Never commit `.env`.
2. In Vercel Project Settings → Build and Deployment, use Framework Preset **Astro**, Build Command **npm run build**, and Output Directory **dist** (the Astro adapter supplies Vercel's final output). Remove conflicting old overrides.
3. Set Root Directory to the directory containing `package.json` and `astro.config.mjs`. Leave it at the repository root if these files are at the top level; do not select `src`, `public`, or `dist`.
4. Redeploy the latest connected commit. For the first corrected deployment, disable the existing build cache. Verify the deployment is Ready and assigned to `parralux-digital.vercel.app` in Domains.
5. Check `/`, `/about`, `/services`, `/portfolio`, `/contact`, `/privacy`, and `/terms`. A GET to `/api/forms` should return method-not-allowed, not a Vercel 404. Do not use a catch-all rewrite to `/index.html`; this site has individual routes and a server endpoint.

The live Vercel settings and deployment logs must be checked separately if a platform `NOT_FOUND` remains after deploying the corrected commit.

## SMTP environment variables

Add these in Vercel Project Settings → Environment Variables for Production, then redeploy:

```dotenv
SITE_URL=https://parralux-digital.vercel.app
SMTP_HOST=your-provider-smtp-host
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-smtp-username
SMTP_PASS=your-smtp-password-or-app-password
SMTP_FROM=your-verified-sender-address
MAIL_TO=your-company-recipient-address
```

Use the provider's exact settings. Port 587 uses required STARTTLS; port 465 uses `SMTP_SECURE=true`. All variables are private: do not prefix credentials with `PUBLIC_`. Local `.env` files are not uploaded to Vercel. The production origin must match the domain visitors use; change `SITE_URL` if adding a custom domain. For preview deployments, set its matching origin or leave `SITE_URL` unset to validate against the request origin.

Contact, Quote, and Email Signup all send to `MAIL_TO`. Newsletter submissions are signup requests for the owner to review, not automatic mailing-list enrollment. If credentials are absent or delivery fails, the form shows an error and retains entered details.

## Verify locally

```sh
npm ci
npm run check
VERCEL=1 npm run build
python3 scripts/validate-build.py .vercel/output/static
npm test
```

The mail tests use a local TLS SMTP server and do not send live email. For standalone local hosting, run `npm run build` without `VERCEL=1`, then `npm start`.

Reference: [Astro's official Vercel adapter documentation](https://docs.astro.build/en/guides/integrations-guide/vercel/).
