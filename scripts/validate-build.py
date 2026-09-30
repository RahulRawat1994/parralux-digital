"""Audit the static site's routes, metadata, assets, and form configuration."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit
import sys

root = Path(sys.argv[1] if len(sys.argv) > 1 else 'dist/client')
class Page(HTMLParser):
    def __init__(self):
        super().__init__(); self.tags=[]; self.ids=[]; self.nav=[]; self.in_nav=False
    def handle_starttag(self, tag, attrs):
        a=dict(attrs); self.tags.append((tag,a))
        if 'id' in a: self.ids.append(a['id'])
        if tag=='nav' and a.get('aria-label')=='Main navigation': self.in_nav=True
        if self.in_nav and tag=='a' and 'nav-link' in a.get('class',''): self.nav.append(a['href'])
    def handle_endtag(self, tag):
        if tag=='nav': self.in_nav=False

routes=['/', '/about', '/services', '/portfolio', '/contact', '/privacy', '/terms']
pages={}
for route in routes:
    p=Page(); file=root / (route.strip('/')+'/index.html' if route!='/' else 'index.html'); p.feed(file.read_text()); pages[route]=p
for route,p in pages.items():
    assert p.nav==routes[:5], (route,'menu order')
    assert sum(tag=='h1' for tag,a in p.tags)==1, (route,'H1')
    assert sum(tag=='main' for tag,a in p.tags)==1, (route,'main landmark')
    assert len(p.ids)==len(set(p.ids)), (route,'duplicate IDs')
    assert sum(tag=='link' and a.get('rel')=='canonical' for tag,a in p.tags)==1
    assert sum(tag=='meta' and a.get('name')=='description' and bool(a.get('content')) for tag,a in p.tags)==1
    assert not any(tag=='iframe' or 'counter-up'==a.get('data-toggle') for tag,a in p.tags)
    assert all('team' not in a.get('href','') and 'blog' not in a.get('href','') for tag,a in p.tags)
    if route in ['/privacy','/terms']: assert any(a.get('name')=='robots' and 'noindex' in a.get('content','') for tag,a in p.tags)
    for tag,a in p.tags:
        if tag=='fieldset': assert 'disabled' not in a, (route,'form must be enabled')
        if tag=='form':
            assert a.get('method','').upper()=='POST'
            assert a.get('action')=='/api/forms', (route,'form destination')
        target=a.get('src') or a.get('href')
        if not target or not target.startswith(('/', '#')): continue
        url=urlsplit(target)
        if url.path.startswith('/images/') or url.path.startswith('/_astro/'):
            assert (root/url.path.lstrip('/')).is_file(), target
        elif not url.path or url.path in pages:
            dest=pages.get(url.path,p)
            if url.fragment: assert url.fragment in dest.ids, target
        else: raise AssertionError((route,'missing route',target))
    print(f'PASS {route}: navigation, landmarks, metadata, assets, links, form state')
for route in ['/','/services']:
    assert sum(tag=='article' and a.get('class')=='prl-service' for tag,a in pages[route].tags)==6
assert all(x in pages['/'].ids for x in ['about','services','portfolio','request-quote'])
for route in ['/','/portfolio']:
    assert sum(tag=='article' and 'portfolio-card' in a.get('class','') for tag,a in pages[route].tags)==3
print('PASS: six services, portfolio grids, anchor compatibility, and removed blocks.')
