#!/usr/bin/env python3
"""Constrói fitary-homepage.html a partir de um export standalone do Claude Design.

Uso: python3 build.py <export-do-claude-design.html>

O que faz (sempre o mesmo processo, repetível a cada atualização do design):
1. Extrai o template real e os assets do bundle do Claude Design.
2. Troca o script de editor do <image-slot> por um renderizador mínimo de produção.
3. Remove o painel de tweaks (ferramenta interna do editor, invisível ao público).
4. Remove âncoras de comentário do editor.
5. Aponta o vídeo do reel para a cópia hospedada no www.fitary.at.
6. Embute todos os assets como data URIs (página auto-contida e indexável).
7. Injeta o pacote de SEO local (meta description, OG/Twitter, geo, canonical,
   JSON-LD LocalBusiness + FAQPage gerada das perguntas reais da página).
8. Aplica as correções mobile (CTA de reserva empilhada; transformações em
   1 coluna; cargos dos depoimentos com quebra de linha).

Conteúdo visível, fotos e links ficam 1:1 com o design.
"""
import re, json, sys, os, html as htmlmod

SRC = sys.argv[1]
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'fitary-homepage.html')

bundle = open(SRC, encoding='utf-8').read()

def grab(kind):
    m = re.search(r'<script type="__bundler/%s">(.*?)</script>' % kind, bundle, re.S)
    if not m:
        sys.exit(f'ERRO: bloco __bundler/{kind} não encontrado — isto é um export standalone do Claude Design?')
    return m.group(1)

manifest = json.loads(grab('manifest'))
t = grab('template').strip()
if t.startswith('"'):
    t = json.loads(t)

# 1. image-slot de produção
start = t.find('<script>\n/**\n * <image-slot>')
assert start > 0, 'script do image-slot não encontrado'
end = t.find('</script>', start) + len('</script>')
prod_slot = '''<script>
  // <image-slot> — production renderer: shows the slot's src image (cover-fit).
  customElements.define('image-slot', class extends HTMLElement {
    connectedCallback(){
      if (this.__filled) return; this.__filled = true;
      var src = this.getAttribute('src');
      this.style.overflow = 'hidden';
      if (this.getAttribute('shape') === 'circle') this.style.borderRadius = '50%';
      var mask = this.getAttribute('mask');
      if (mask) this.style.clipPath = mask;
      if (!src){ this.style.background = 'var(--is-bg, #e8e8e8)'; return; }
      var img = document.createElement('img');
      img.src = src;
      img.alt = this.getAttribute('alt') || '';
      img.draggable = false;
      img.style.cssText = 'width:100%;height:100%;display:block;object-fit:' +
        (this.getAttribute('fit') || 'cover') + ';object-position:' +
        (this.getAttribute('position') || '50% 50%') + ';';
      this.appendChild(img);
    }
  });
</script>'''
t = t[:start] + prod_slot + t[end:]

# 2. Painel de tweaks (comentário + style + grain + aside + script)
i = t.find('<!-- ========== TWEAKS PANEL ========== -->')
if i < 0:
    i = t.find('<aside id="tweaksPanel"')
k = t.find('TWEAK_DEFAULTS', i)
assert i > 0 and k > 0, 'bloco de tweaks não encontrado'
j = t.find('</script>', k) + len('</script>')
t = t[:i] + t[j:]
assert 'tweaksPanel' not in t

# 3. Âncoras de comentário do editor
t = re.sub(r'\s+data-comment-anchor="[^"]*"', '', t)

# 4. Vídeo do reel hospedado
t = t.replace('data-video-src="assets/studio-reel.mp4"',
              'data-video-src="https://www.fitary.at/wp-content/uploads/2026/08/studio-reel.mp4"')

# 5. Assets embutidos
for uid, meta in manifest.items():
    t = t.replace(uid, 'data:%s;base64,%s' % (meta['mime'], meta['data']))
left = re.findall(r'(?:src="|url\(")([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})', t)
assert not left, f'assets sem substituição: {left}'

# 6. SEO
i2 = t.find('<section class="faq"'); j2 = t.find('</section>', i2)
pairs = re.findall(r'<summary[^>]*>(.*?)</summary>\s*<div class="ans"[^>]*>(.*?)</div>', t[i2:j2], re.S)
def clean(s):
    s = re.sub(r'<[^>]+>', ' ', s)
    s = htmlmod.unescape(s).replace('­', '')
    return re.sub(r'\s+', ' ', s).strip()
faq_items = [{"@type": "Question", "name": clean(q),
              "acceptedAnswer": {"@type": "Answer", "text": clean(a)}} for q, a in pairs]

desc = ("Personal Training in Wels: FITARY ist das erste Boutique Personal Training "
        "Studio in Wels (Plobergerstraße 7). 1:1 Coaching mit Yalcin Arslan — Boxing, "
        "Functional, Athletic & Medizinisches Fitnesstraining. Jetzt kostenloses "
        "Kennenlern-Training sichern.")
title = "FITARY · Das erste Boutique Personal Training Studio in Wels"
ogimg = "https://www.fitary.at/wp-content/uploads/2026/08/fitary3-a4b6e152.jpg"
business = {
  "@context": "https://schema.org", "@type": ["HealthClub", "LocalBusiness"],
  "@id": "https://www.fitary.at/#studio", "name": "FITARY",
  "alternateName": "FITARY Personal Training Wels", "description": desc,
  "url": "https://www.fitary.at/", "telephone": "+43 670 3565006", "email": "office@fitary.at",
  "image": ogimg,
  "address": {"@type": "PostalAddress", "streetAddress": "Plobergerstraße 7", "postalCode": "4600",
              "addressLocality": "Wels", "addressRegion": "Oberösterreich", "addressCountry": "AT"},
  "founder": {"@type": "Person", "name": "Yalcin Arslan", "jobTitle": "Coach & Inhaber"},
  "priceRange": "€79–€790", "currenciesAccepted": "EUR",
  "areaServed": [{"@type": "City", "name": "Wels"}, {"@type": "AdministrativeArea", "name": "Oberösterreich"}],
  "sameAs": ["https://www.instagram.com/fitary.at/", "https://www.facebook.com/people/Fitary/61570920103651/"],
  "makesOffer": [
    {"@type": "Offer", "name": "Einzeltraining (50 Min 1:1)", "price": "79", "priceCurrency": "EUR"},
    {"@type": "Offer", "name": "FITARY Block (10 Sessions)", "price": "790", "priceCurrency": "EUR"},
    {"@type": "Offer", "name": "Kleingruppen-Training (bis 4 Personen)", "price": "100", "priceCurrency": "EUR"},
    {"@type": "Offer", "name": "Medizinisches Fitnesstraining", "priceCurrency": "EUR"}]}
faqpage = {"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": faq_items}
seo = f'''<title>{title}</title>
<meta name="viewport" content="width=device-width,initial-scale=1">
<!-- ===== SEO (lokal · Wels/Oberösterreich) ===== -->
<meta name="description" content="{desc}">
<meta name="robots" content="index, follow, max-image-preview:large">
<meta name="theme-color" content="#06302B">
<meta name="geo.region" content="AT-4">
<meta name="geo.placename" content="Wels, Oberösterreich">
<link rel="canonical" href="https://www.fitary.at/">
<meta property="og:type" content="website">
<meta property="og:site_name" content="FITARY">
<meta property="og:locale" content="de_AT">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{desc}">
<meta property="og:url" content="https://www.fitary.at/">
<meta property="og:image" content="{ogimg}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{title}">
<meta name="twitter:description" content="{desc}">
<script type="application/ld+json">{json.dumps(business, ensure_ascii=False)}</script>
<script type="application/ld+json">{json.dumps(faqpage, ensure_ascii=False)}</script>
<!-- ===== /SEO ===== -->'''
old_head = '''<title>FITARY · Das erste Boutique Personal Training Studio in Wels</title>
<meta name="viewport" content="width=device-width,initial-scale=1">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="">'''
assert old_head in t, 'head do template mudou — ajustar build.py'
t = t.replace(old_head, seo)

# 7. Correções mobile
polish = '''<style id="mobile-polish">
  /* Correções mínimas de layout mobile — nenhum conteúdo é alterado. */
  @media (max-width: 700px){
    .ba-grid{ grid-template-columns: 1fr !important; gap: 16px !important; }
  }
  @media (max-width: 640px){
    .bookhub-cta{ flex-direction: column; align-items: stretch; }
    .bookhub-cta .btn{
      width: 100%; min-width: 0; justify-content: center;
      white-space: normal; text-align: center;
      height: auto; min-height: 52px; padding: 12px 16px;
    }
  }
  .voice .person > div:not(.avatar){ min-width: 0; flex: 1 1 auto; }
  .voice .person .role{ white-space: normal; overflow-wrap: break-word; }
</style>
</head>'''
assert t.count('</head>') == 1
t = t.replace('</head>', polish)

open(OUT, 'w', encoding='utf-8').write(t)
print(f'OK: {OUT} ({os.path.getsize(OUT)} bytes)')
