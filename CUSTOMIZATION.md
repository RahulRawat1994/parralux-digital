# ParRaLux Digital template blocks

The pages are already updated. For another copy of the template, retain its Bootstrap 5 and Font Awesome 5 stylesheets and Bootstrap bundle. Load `css/parralux.css` after `css/style.css`. Copy `img/parralux-logo.png` alongside the template assets.

## Navigation
```html
<nav class="navbar navbar-expand-lg navbar-dark px-3 px-lg-5 py-3 py-lg-0" aria-label="Main navigation">
<a href="index.html" class="navbar-brand p-0"><img class="brand-logo" src="img/parralux-logo.png" width="2172" height="724" alt="ParRaLux Digital — Home"></a>
<button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarCollapse" aria-controls="navbarCollapse" aria-expanded="false" aria-label="Toggle navigation"><span class="fa fa-bars" aria-hidden="true"></span></button>
<div class="collapse navbar-collapse" id="navbarCollapse"><div class="navbar-nav ms-auto py-0"><a href="index.html" class="nav-item nav-link active" aria-current="page">Home</a>
<a href="about.html" class="nav-item nav-link">About</a>
<a href="service.html" class="nav-item nav-link">Services</a>
<a href="portfolio.html" class="nav-item nav-link">Portfolio</a>
<a href="contact.html" class="nav-item nav-link">Contact</a></div></div>
</nav>
```

## Six services
```html
<!-- Service Start -->
<section class="container py-5" id="services" aria-labelledby="services-title">
<div class="section-title text-center position-relative pb-3 mb-5"><h2 id="services-title">Our Services</h2><p>Digital expertise for your next stage of growth.</p></div>
<div class="prl-services"><article class="prl-service"><i class="fas fa-pencil-ruler" aria-hidden="true"></i><h3>Designing</h3><p>Thoughtful brand identities and intuitive interfaces for your business.</p></article><article class="prl-service"><i class="fas fa-code" aria-hidden="true"></i><h3>Web Development</h3><p>Responsive, accessible websites built around your business goals.</p></article><article class="prl-service"><i class="fas fa-mobile-alt" aria-hidden="true"></i><h3>App Development</h3><p>User-friendly mobile applications that connect you with your customers.</p></article><article class="prl-service"><i class="fas fa-shopping-cart" aria-hidden="true"></i><h3>E-commerce</h3><p>Online storefronts with clear product journeys and smooth shopping experiences.</p></article><article class="prl-service"><i class="fas fa-search" aria-hidden="true"></i><h3>SEO</h3><p>Search-focused content and technical improvements to help customers find you.</p></article><article class="prl-service"><i class="fas fa-headset" aria-hidden="true"></i><h3>Help & Support</h3><p>Practical technical support and ongoing website maintenance.</p></article></div></section>
<!-- Service End -->
```

## Contact layout
```html
<!-- Contact Start -->
<main class="container py-5" id="contact">
<div class="section-title position-relative pb-3 mb-5"><h2>Let’s talk about your project</h2></div>
<div class="prl-contact-layout">
<section class="prl-contact-panel" aria-labelledby="form-title">
<h2 id="form-title">Send us a message</h2>
<form class="prl-contact-form" action="contact.php" method="post">
<label for="contact-name">Name</label><input id="contact-name" name="name" type="text" autocomplete="name" maxlength="120" required>
<label for="contact-email">Email</label><input id="contact-email" name="email" type="email" autocomplete="email" maxlength="254" required>
<label for="contact-subject">Subject</label><input id="contact-subject" name="subject" type="text" maxlength="200" required>
<label for="contact-message">Message</label><textarea id="contact-message" name="message" rows="6" maxlength="5000" required></textarea>
<button class="btn btn-primary py-3 px-4" type="submit">Send Message</button>
</form></section>
<aside class="prl-contact-panel prl-contact-info" aria-labelledby="info-title">
<h2 id="info-title">Contact information</h2><p>Replace these placeholders with your company’s contact details.</p>
<div><i class="fas fa-envelope" aria-hidden="true"></i><h3>Email</h3><p>hello@example.com</p></div>
<div><i class="fas fa-phone-alt" aria-hidden="true"></i><h3>Phone Number</h3><p>[Your phone number]</p></div>
<div><i class="fas fa-map-marker-alt" aria-hidden="true"></i><h3>Physical Address</h3><address>[Street address]<br>[City, State, Postal code]<br>[Country]</address></div>
</aside></div></main>
<!-- Contact End -->
```

## CSS
```css
/* ParRaLux Digital: reusable layout utilities */
.brand-logo { display: block; width: 240px; max-width: 100%; height: auto; }
.prl-services { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 1.5rem; }
.prl-service { padding: 2rem; background: var(--light, #eef9ff); border-radius: .75rem; }
.prl-service > i { color: #007da8; font-size: 2rem; margin-bottom: 1.25rem; }
.prl-service h3 { font-size: 1.4rem; }
.prl-contact-layout { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 2rem; align-items: start; }
.prl-contact-panel { min-width: 0; padding: clamp(1.25rem, 3vw, 2.5rem); background: var(--light, #eef9ff); border-radius: .75rem; }
.prl-contact-panel h2 { font-size: 1.65rem; margin-bottom: 1.5rem; }
.prl-contact-form { display: grid; gap: .65rem; }
.prl-contact-form label { font-weight: 600; color: var(--dark, #091e3e); }
.prl-contact-form input, .prl-contact-form textarea { box-sizing: border-box; width: 100%; min-width: 0; padding: .85rem 1rem; border: 1px solid #8ba7b6; border-radius: .3rem; background: #fff; color: #091e3e; font: inherit; margin-bottom: .6rem; }
.prl-contact-form textarea { resize: vertical; min-height: 10rem; }
.prl-contact-form button { justify-self: start; background: #007da8; border-color: #007da8; }
.prl-contact-form :focus-visible, .navbar a:focus-visible, .prl-footer-links a:focus-visible { outline: 3px solid #007da8; outline-offset: 3px; }
.prl-contact-info > div { position: relative; padding-left: 2.5rem; margin-top: 2rem; overflow-wrap: anywhere; }
.prl-contact-info i { position: absolute; left: 0; top: .25rem; color: #007da8; }
.prl-contact-info h3 { font-size: 1.15rem; }
.prl-contact-info address { font-style: normal; }
.prl-footer-links { display: flex; flex-wrap: wrap; gap: 1rem 1.5rem; }
@media (max-width: 991.98px) { .prl-services { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (max-width: 767.98px) { .prl-contact-layout, .prl-services { grid-template-columns: minmax(0, 1fr); } }

/* Shared header and restored template footer */
.prl-topbar { display: flex; justify-content: space-between; align-items: center; gap: .75rem 1.5rem; min-height: 45px; padding-top: .4rem; padding-bottom: .4rem; }
.prl-topbar-contact { display: flex; flex-wrap: wrap; gap: .4rem 1.25rem; font-size: .8rem; }
.prl-social { display: flex; flex-wrap: wrap; gap: .4rem; }
.navbar.navbar-dark { background: #fff; align-items: center; }
.navbar .navbar-brand { display: flex; align-items: center; margin-right: 2rem; flex-shrink: 0; }
.navbar-dark .navbar-nav .nav-link { color: var(--dark); }
.navbar-dark .navbar-nav .nav-link.active, .navbar-dark .navbar-nav .nav-link:hover { color: #007da8; }
.prl-footer-signup { display: flex; flex-direction: column; justify-content: center; min-height: 360px; }
.prl-footer-brand { display: block; padding: .75rem; background: white; border-radius: .25rem; }
.prl-footer-brand .brand-logo { margin-inline: auto; }
.prl-footer p { overflow-wrap: anywhere; }
.prl-copyright { background: #061429; }
.prl-signup-form input { min-width: 0; }
@media (min-width: 992px) {
    .navbar.navbar-dark { min-height: 96px; }
    .navbar-dark .navbar-nav .nav-link, .sticky-top.navbar-dark .navbar-nav .nav-link { padding: 34px 0; }
}
@media (max-width: 991.98px) {
    .prl-topbar { flex-wrap: wrap; }
    .navbar .brand-logo { width: 210px; }
    .navbar-dark .navbar-nav .nav-link { margin-left: 0; }
}
@media (max-width: 359.98px) { .navbar .brand-logo { width: 180px; } .navbar .navbar-brand { margin-right: .5rem; } }

```

## Integration
Remove old services/contact blocks before pasting their replacements. Delete Blog, Team, Facts/counter and map blocks and any associated footer links. The legacy team page now redirects to About. Portfolio is an honest placeholder awaiting real projects.

The header and footer use the existing transparent PNG in `img/parralux-logo.png`.

The form posts to `contact.php`. Configure server environment variables `PARRALUX_CONTACT_TO` and `PARRALUX_CONTACT_FROM` with real email addresses, and configure PHP mail transport before deployment. The handler validates inputs and reports unavailable delivery honestly. Run under PHP (for example XAMPP), not a static file server. For a public deployment, add rate limiting/spam protection at your hosting layer. Replace contact information placeholders before publishing.

## Header and footer restoration
All pages now use the existing transparent PNG logo, aligned with the navigation. Menu order: Home, About, Services, Portfolio, Contact. The address/social top bar and original four-column footer arrangement are restored, without blog/team links.

Top bar contact details and social URLs are placeholders. Replace `href="#"` on social icons with real profile URLs. Email Signup has email validation and an honest unavailable message; connect your newsletter provider in `js/main.js` before launch. The current shared layout rules are in `css/parralux.css`.
