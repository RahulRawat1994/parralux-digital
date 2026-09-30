# ParRaLux Digital — restored Astro template

The Astro site now follows the customized HTML template: Nunito headings, Rubik body text, cyan/navy colors, photograph banners, the address/social top bar, and four-column footer. The original root HTML, CSS, PHP, and image files remain untouched as the design reference. Only `src/` and `public/` are used to produce the new static site.

## Run and verify

```sh
npm install
npm run dev
npm run check
npm run build
python3 scripts/validate-build.py
npm run preview
```

If the environment prevents Astro's telemetry preferences from being written, prefix npm commands with `ASTRO_TELEMETRY_DISABLED=1`. Publish only `dist/`, not the project root. The installed Astro 5 version is locked in `package-lock.json`.

## Organization

```text
src/
  layouts/BaseLayout.astro       # SEO, styles, top bar, header, main slot, footer
  components/
    TopBar.astro                 # Address, phone, email, social icons
    Navbar.astro                 # Five route links; progressive mobile menu
    SocialLinks.astro            # Shared configured/profile placeholder icons
    Footer.astro                 # Signup, contact, quick/popular and legal links
    PageBanner.astro             # Photo background, H1, breadcrumb
    SectionHeading.astro         # Template typography and cyan underline
    Hero.astro                   # Two photographs, one H1, manual slide controls
    AboutSection.astro
    PhoneBlock.astro
    FeaturesSection.astro
    ServicesSection.astro
    ServiceCard.astro
    PortfolioSection.astro
    QuoteSection.astro
    TestimonialsSection.astro
    VendorStrip.astro
  data/site.ts                   # Navigation, contact, social URLs, services, projects
  utils/forms.ts                 # Public HTTPS form destination validation
  pages/
    index.astro
    about.astro
    services.astro
    portfolio.astro
    contact.astro
    privacy.astro
    terms.astro
  styles/
    bootstrap.css                # Original template's Bootstrap CSS only
    template.css                 # Original visual rules; adjusted asset path
    global.css                   # Customized styling and Astro overrides
public/images/                   # Logo and original template photographs/logos
scripts/validate-build.py         # Static output acceptance checks
```

The layout imports Bootstrap CSS, template CSS, and customization overrides in that order. FontAwesome's solid and brand icons are local CSS/fonts; there is no external JavaScript kit. Nunito and Rubik load from Google Fonts with `display=swap`.

## Pages and section order

| Route | Sections between shared header/footer |
|---|---|
| `/` | Hero → About → Why Choose Us → Services → Portfolio → Quote → Testimonials → Vendor strip |
| `/about` | About Us banner → About → Vendor strip |
| `/services` | Services banner → six service cards → Testimonials → Vendor strip |
| `/portfolio` | Portfolio banner → upcoming-project grid and Contact CTA → Vendor strip |
| `/contact` | Contact Us banner → introductory heading → two-column form/contact information → Vendor strip |
| `/privacy`, `/terms` | Existing unfinished legal templates; remain `noindex` |

Main navigation is Home, About, Services, Portfolio, Contact. Existing homepage anchors `/#about`, `/#services`, and `/#portfolio` still work. Quote CTAs go to `/contact`; secondary legacy pages are not migrated. Team, blog, counters, and map sections remain absent.

## Shared interfaces

- `BaseLayout`: required `title` and `description`; optional `noindex`; page content through its default slot. Canonical links use `Astro.url.href`.
- `ServiceCard`: `icon`, `title`, `description`.
- `SectionHeading`: `id`, `title`, optional `eyebrow`, `description`, and `centered`.
- `PageBanner`: `title` and optional `breadcrumb`.
- Other section components read shared data or contain presentation copy and require no page-specific props.

## Configure content and forms

1. Set the real production origin in `astro.config.mjs` before publishing. `https://example.com` remains a placeholder; links assume hosting at the domain root.
2. Replace the contact details and empty social URLs in `src/data/site.ts`. Empty social destinations render labeled, non-clickable icons rather than broken links.
3. Replace project and sample testimonial/vendor content with approved material. No actual client, partnership, award, or experience claims are implied by these examples.
4. Copy `.env.example` to `.env` and supply public HTTPS POST URLs:

```dotenv
PUBLIC_CONTACT_FORM_ACTION=https://your-provider.com/your-contact-form
PUBLIC_NEWSLETTER_FORM_ACTION=https://your-provider.com/your-newsletter-form
```

Contact and Quote share the contact endpoint. Contact submits `name`, `email`, `subject`, `message`; Quote submits `name`, `email`, `service`, `message`; signup submits `email`. Configure each form's fields, server-side validation, spam controls, delivery, and success/error responses in the provider. Never place API secrets in these public values. Rebuild after configuration changes.

Missing, malformed, non-HTTPS, or example-domain URLs disable the entire form fieldset and show an honest unavailable message. Configured forms use normal HTML POST and native validation; no client-side form scripts or legacy PHP files are included. The design migration does not configure email delivery.

## Responsive behavior and scripts

- Desktop navbar: 96px tall, 240px logo; mobile logo: 210px (180px below 360px).
- Mobile menu below 992px: button with `aria-expanded`, Escape-to-close, and viewport-change synchronization. Without JavaScript, links remain visible and the mobile header scrolls with the page.
- Hero: manual previous/next controls, keyboard arrow support, one H1, live slide status, no timer. Without JavaScript, the first image remains visible and controls stay hidden.
- Services: three columns on desktop, two below 992px, one below 768px. Contact stacks below 768px.
- Testimonials: three visible desktop cards, two on tablet, one on mobile; horizontally scrollable with a keyboard-focusable region. Vendor logos also scroll horizontally.
- Footer preserves the template's desktop and tablet column structure and stacks on mobile.
- Reduced-motion CSS removes transitions and smooth scrolling. Sticky header and back-to-top use CSS.
- No Bootstrap JavaScript, jQuery, Owl Carousel, WOW, spinner, or counter library is loaded. Only Navbar and Hero contain scripts.

## Acceptance checks

`validate-build.py` checks routes, navigation order, one H1/main per page, unique IDs, metadata, legal noindex, local assets/links/anchors, six services, portfolio counts, absent map/counters/team/blog links, and disabled form states.

A separate configured build can be checked without delivering any messages:

```sh
PUBLIC_CONTACT_FORM_ACTION=https://forms.parralux.test/contact \
PUBLIC_NEWSLETTER_FORM_ACTION=https://forms.parralux.test/newsletter \
ASTRO_TELEMETRY_DISABLED=1 npm run build -- --outDir /tmp/parralux-forms-check
python3 scripts/validate-build.py /tmp/parralux-forms-check --configured
```

The `.test` URLs are validation-only endpoints; do not deploy them. This build verifies enabled fields and POST destinations without replacing the normal `dist/` output.

Visual QA targets 1440, 1024, 768, and 375px. The local `file://` HTML reference cannot be opened by the browser tool under its URL policy; matching is based on the original source, assets, styles, and inspection of the restored Astro pages rather than a claimed pixel-diff comparison.
