"""Restyle only the stylist page with the approved revision's shared visual shell."""
from pathlib import Path
import re

ROOT=Path(__file__).resolve().parents[1]
source=(ROOT/'stylist.html').read_text(encoding='utf-8')
revision=(ROOT/'revision-02.html').read_text(encoding='utf-8')
header=re.search(r'<header class="r-header">.*?</header>',revision,re.S).group()
footer=re.search(r'<footer class="r-footer">.*?</footer>',revision,re.S).group()
footer=footer.replace('<footer class="r-footer">','<footer class="r-footer" id="contacts">')
for anchor in ['collection','academy','brand','partners']:
    header=header.replace('href="#'+anchor+'"','href="revision-02.html#'+anchor+'"')
    footer=footer.replace('href="#'+anchor+'"','href="revision-02.html#'+anchor+'"')
header=header.replace('href="#personal" class="r-nav-stylist"','href="#consultation" class="r-nav-stylist" aria-current="page"')
header=header.replace('href="stylist.html" class="r-ticker"','href="#consultation" class="r-ticker"')
consultation=re.search(r'<section class="consultation".*?</section>',source,re.S).group()
consultation=consultation.replace('<section class="consultation"','<section class="consultation" id="consultation"') if 'id="consultation"' not in consultation.split('>')[0] else consultation
selection=re.search(r'<section id="stylist-selection".*?</section>',source,re.S).group()

def icon(path):
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+path+'</svg>'
arrow=icon('<path d="M4 12h16m-6-6 6 6-6 6"/>')
reset=icon('<path d="M3 10a9 9 0 1 1 2 8M3 4v6h6"/>')
close=icon('<path d="m6 6 12 12M6 18 18 6"/>')
consultation=consultation.replace('>D.</span>','>D</span>').replace('>↺</button>','>'+reset+'</button>').replace('disabled>↗</button>','disabled>'+arrow+'</button>').replace('>×</button>','>'+close+'</button>')
consultation=consultation.replace('Попробовать ещё раз ↗','Попробовать ещё раз '+arrow).replace('Продолжить ↗','Продолжить '+arrow)
selection=selection.replace('ПЕРЕЙТИ В КОРЗИНУ ↗','Перейти в корзину '+arrow)
page='''<!doctype html>
<html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#263e9b"><title>Твой стилист — DASHU</title><meta name="description" content="Персональный подбор стайлинга и ухода DASHU. Расскажи о волосах или добавь фото — найдём средство для твоей укладки."><link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'%3E%3Crect width='40' height='40' fill='%23263e9b'/%3E%3Ctext x='9' y='29' font-family='Arial' font-weight='700' font-size='27' fill='white'%3ED%3C/text%3E%3C/svg%3E"><link rel="stylesheet" href="assets/revision-02/design.css?v=3"><link rel="stylesheet" href="assets/stylist.css?v=2"><link rel="stylesheet" href="assets/revision-02/stylist.css?v=1"></head>
<body class="revision-two revision-stylist"><a class="skip-link" href="#consultation">Перейти к подбору</a>
__HEADER__
<main class="r-container stylist-main"><div class="breadcrumbs"><a href="revision-02.html">Главная</a><span aria-hidden="true">/</span><span aria-current="page">Твой стилист</span></div>
<div class="stylist-layout"><aside class="stylist-intro"><span class="r-kicker">DASHU / PERSONAL SELECTION</span><h1>Твой стиль.<br><span>Начнём с тебя.</span></h1><p>Расскажи о волосах и желаемой укладке. Найдём твою текстуру, фиксацию и средство из коллекции DASHU.</p><div class="stylist-steps" aria-label="Как проходит подбор"><div><span>01</span><p><strong>Покажи</strong>Добавь фото волос, если хочешь.</p></div><div><span>02</span><p><strong>Расскажи</strong>Ответь на несколько вопросов.</p></div><div><span>03</span><p><strong>Выбери</strong>Получи подбор и советы по укладке.</p></div></div><figure class="stylist-photo"><img src="assets/revision-02/craft.webp" srcset="assets/revision-02/craft-480.webp 480w, assets/revision-02/craft-768.webp 768w, assets/revision-02/craft.webp 1000w" sizes="(max-width:760px) 100vw, 33vw" width="1000" height="1500" alt="Барбер за работой: внимание к форме и деталям" decoding="async" loading="lazy"><figcaption>FORM IS IN THE DETAILS.</figcaption></figure><a href="catalog.html" class="r-text-link stylist-catalog-link">Или выбери самостоятельно __ARROW__</a></aside>
__CONSULTATION__
</div>
__SELECTION__
</main>
__FOOTER__
<div id="store-toast" class="store-toast" role="status" aria-live="polite" hidden></div><script src="assets/catalog-data.js?v=3"></script><script src="assets/store.js?v=2"></script><script src="assets/stylist.js?v=4"></script><script src="assets/revision-02/site.js?v=1"></script></body></html>
'''
for key,value in {'HEADER':header,'FOOTER':footer,'CONSULTATION':consultation,'SELECTION':selection,'ARROW':arrow}.items():page=page.replace('__'+key+'__',value)
page=page.replace('</head>','<link rel="stylesheet" href="assets/revision-02/graphite-buttons.css?v=1"><script>if(new URLSearchParams(location.search).get("buttons")==="graphite")document.documentElement.classList.add("graphite-buttons");</script></head>')
page=page.replace('assets/revision-02/site.js?v=1','assets/revision-02/site.js?v=2')
(ROOT/'stylist.html').write_text('\n'.join(line.rstrip() for line in page.splitlines())+'\n',encoding='utf-8')
print('Updated only stylist.html; consultation controls and request logic preserved.')
