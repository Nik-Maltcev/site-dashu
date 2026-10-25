"""Create a separate client revision; the approved Unbounded landing stays intact."""
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
original = (ROOT / 'font-01.html').read_text(encoding='utf-8')

def icon(name):
    paths = {
        'arrow': '<path d="M4 12h16m-6-6 6 6-6 6"/>',
        'back': '<path d="M20 12H4m6-6-6 6 6 6"/>',
        'up': '<path d="M5 19 19 5M5 5h14v14"/>',
        'bag': '<path d="M5 7h14l1 14H4L5 7Z M8 8V6a4 4 0 0 1 8 0v2"/>',
        'menu': '<path d="M4 7h16M4 12h16M4 17h16"/>',
        'close': '<path d="m6 6 12 12M6 18 18 6"/>',
        'pause': '<path d="M9 5v14M15 5v14"/>',
        'chat': '<path d="M21 11a8 8 0 0 1-8 8H8l-5 3v-6a8 8 0 0 1-1-5 9 9 0 0 1 19 0Z M7 10h10M7 14h6"/>',
    }
    return '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">' + paths[name] + '</svg>'

def bar(active):
    links = ''.join(f'<a href="{path}"'+(' aria-current="page"' if key == active else '')+f'>{label}</a>' for key,path,label in [
        ('01', 'font-01.html', '01 / Исходная'), ('02', 'revision-02.html', '02 / С правками')])
    return '<div class="wrap type-comparebar revision-compare"><span class="type-label">СРАВНИТЬ ВЕРСИИ / UNBOUNDED</span><nav aria-label="Сравнить версии дизайна">'+links+'</nav></div>'

academy = re.search(r'<section class="academy section".*?</section>', original, re.S).group()
academy = academy.replace('КАК ПОЛЬЗОВАТЬСЯ.<br><em>Видео-гайды.</em>', 'Техника решает.')
academy = academy.replace('Три коротких гайда. <br>От первого движения — <br>до твоей собственной формы.', 'Форма, текстура, уход. Разбираем по шагам — без сложных правил.')
academy = academy.replace('МАСТЕРСТВО ФОРМЫ / DASHU ACADEMY', '02 / DASHU ACADEMY')
academy = re.sub(r'<div class="academy-footnote">.*?</div>', '', academy, flags=re.S)
academy = re.sub(r'(<h3>.*?)(</h3>)', lambda m:m[1].replace('<br>',' ')+m[2], academy)
dialogs = original[original.index('<dialog class="academy-dialog"'):original.index('<div id="store-toast"')]
dialogs = dialogs.replace('>×</button>', '>'+icon('close')+'</button>').replace('<span aria-hidden="true">↗</span>', icon('arrow')).replace('ОСТАВИТЬ ДЕМО-ЗАЯВКУ ↗', 'ОСТАВИТЬ ДЕМО-ЗАЯВКУ')
academy = academy.replace('<span aria-hidden="true">↗</span>', icon('up'))

page = '''<!doctype html>
<html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#263e9b"><title>DASHU — 02 / С правками</title><meta name="description" content="Корейский стайлинг и мужской уход DASHU. Найди своё средство, освой укладку и собери свой ритуал."><meta name="robots" content="noindex"><link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'%3E%3Crect width='40' height='40' fill='%23263e9b'/%3E%3Ctext x='9' y='29' font-family='Arial' font-weight='700' font-size='27' fill='white'%3ED%3C/text%3E%3C/svg%3E"><link rel="stylesheet" href="assets/revision-02/design.css?v=1"></head>
<body class="revision-two"><a class="skip-link" href="#collection">К средствам</a>
__BAR__
<header class="r-header">
  <div class="r-bluebar"><div class="r-container"><span>DASHU DESIGNED IN SEOUL.</span><span>КОРЕЙСКИЙ СТАЙЛИНГ. ТВОЙ ХАРАКТЕР.</span><a href="stylist.html">Подобрать средство __UP__</a></div></div>
  <div class="r-nav r-container"><a href="revision-02.html" class="wordmark" aria-label="DASHU — на главную">DASHU</a><nav id="revision-nav" aria-label="Навигация"><a href="#collection">Средства</a><a href="#academy">Гайды</a><a href="#personal" class="r-nav-stylist">Твой стилист</a><a href="#brand">О бренде</a><a href="#partners">Профессионалам</a></nav><div class="r-nav-actions"><a class="r-bag" href="cart.html" aria-label="Открыть корзину">__BAG__<span data-cart-count>0</span></a><button class="r-menu" aria-label="Открыть меню" aria-expanded="false" aria-controls="revision-nav">__MENU__</button></div></div>
</header>
<main>
<section class="r-hero r-container" aria-labelledby="hero-title">
  <div class="r-hero-copy"><span class="r-kicker">DASHU / KOREAN GROOMING</span><div><h1 id="hero-title">Твой стиль.<br><span>Твой характер.</span></h1><p>Точная форма. Естественная текстура.<br>Корейский стайлинг и уход, который работает в твоём ритме.</p><div class="r-hero-actions"><a class="r-button" href="#collection">Выбрать средство __ARROW__</a><a class="r-text-link" href="stylist.html">Помочь с выбором __UP__</a></div></div><div class="r-hero-note"><span>HAIR / SKIN / EVERY DAY</span><span>СОЗДАНО В КОРЕЕ</span></div></div>
  <div class="r-film"><video id="revision-film" autoplay muted loop playsinline preload="metadata" poster="assets/revision-02/barber-poster.webp" aria-label="Крупный план работы барбера: создание короткой мужской стрижки"><source media="(max-width:760px)" src="assets/revision-02/barber-mobile.mp4" type="video/mp4"><source src="assets/revision-02/barber.mp4" type="video/mp4"></video><div class="r-film-top"><span>THE CRAFT OF GROOMING</span><button id="revision-film-toggle" class="r-film-toggle" aria-label="Приостановить видео" aria-pressed="true">__PAUSE__</button></div><div class="r-film-bottom"><span>Меньше случайного.<br>Больше своего.</span><span>DASHU<br>OWN YOUR FORM.</span></div></div>
</section>
<section class="r-collection r-container" id="collection" aria-labelledby="collection-title">
  <div class="r-section-heading"><div><span class="r-kicker">01 / ТВОЯ КОЛЛЕКЦИЯ</span><h2 id="collection-title">Четыре средства.<br>Тысячи образов.</h2></div><div class="r-heading-aside"><p>Начни с основы. Добавь текстуру.<br>Найди свой финиш.</p><a class="r-text-link" href="catalog.html">Весь каталог / 23 средства __UP__</a></div></div>
  <div class="r-rail-tools"><div class="r-tabs" role="group" aria-label="Категории средств"><button data-rail-filter="essentials" aria-pressed="true">Базовый набор <span>04</span></button><button data-rail-filter="hair" aria-pressed="false">Для волос</button><button data-rail-filter="skin" aria-pressed="false">Для кожи</button><button data-rail-filter="all" aria-pressed="false">Все средства</button></div><div class="r-rail-arrows"><button data-rail-direction="-1" aria-label="Предыдущие средства" aria-controls="revision-products">__BACK__</button><button data-rail-direction="1" aria-label="Следующие средства" aria-controls="revision-products">__ARROW__</button></div></div>
  <div class="r-product-rail" id="revision-products" role="region" aria-label="Средства DASHU, горизонтальная прокрутка" tabindex="0"></div>
  <div class="r-rail-footer"><span>Листай и находи своё.</span><div class="r-rail-progress" role="progressbar" aria-label="Позиция в коллекции" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><span></span></div><span id="revision-rail-count" aria-live="polite">4 средства</span></div>
  <noscript><a class="r-button" href="catalog.html">Открыть каталог</a></noscript>
</section>
<div class="r-academy-band"><div class="r-container">__ACADEMY__</div></div>
<section class="r-personal r-container" id="personal" aria-labelledby="personal-title"><div class="r-personal-card"><div class="r-personal-copy"><span class="r-kicker">03 / ПЕРСОНАЛЬНЫЙ ПОДБОР</span><h2 id="personal-title">Не просто средство.<br>Твоё средство.</h2><p>Покажи волосы и расскажи, какую укладку хочешь. Твой стилист поможет разобраться в текстуре, фиксации и уходе.</p><a href="stylist.html" class="r-button r-button-light">Подобрать с моим стилистом __ARROW__</a><span class="r-personal-note">Фото по желанию. Несколько вопросов. Подбор из коллекции DASHU.</span></div><div class="r-consult-preview" aria-label="Пример персонального подбора"><div class="r-consult-top"><span class="r-consult-avatar">D.</span><div><strong>Твой стилист</strong><span>DASHU / PERSONAL SELECTION</span></div>__CHAT__</div><p class="r-chat-message">Какой результат хочешь: естественную текстуру или гладкую укладку?</p><p class="r-chat-reply">Текстуру. Без блеска.</p><div class="r-match"><img src="assets/products/product-15-240.webp" width="240" height="240" loading="lazy" decoding="async" alt="Матовый воск DASHU"><div><span>НАЧНЁМ С МАТОВОГО ФИНИША</span><strong>Текстура.<br>Контроль. Характер.</strong><a href="stylist.html">Начать свой подбор __UP__</a></div></div><span class="r-preview-note">Пример диалога. Твой подбор будет персональным.</span></div></div></section>
<section class="r-brand r-container" id="brand" aria-labelledby="brand-title"><div class="r-brand-photo"><img src="assets/academy-classic.webp" srcset="assets/academy-classic-480.webp 480w, assets/academy-classic-768.webp 768w, assets/academy-classic.webp 1440w" sizes="(max-width:760px) 100vw, 45vw" width="1440" height="810" loading="lazy" decoding="async" alt="Барбер за работой: внимание к форме и деталям"><span>FORM IS IN THE DETAILS.</span></div><div class="r-brand-copy"><span class="r-kicker">DASHU / SEOUL, KOREA</span><h2 id="brand-title">Характер — твой.<br>Инструменты — наши.</h2><p>Из корейской культуры ухода — в твой ежедневный ритм. Продуманные формулы, понятные действия и свобода выбирать, как выглядеть сегодня.</p><div class="r-brand-points"><div><strong>Форма</strong><span>Матовый финиш или выразительный блеск.</span></div><div><strong>Уход</strong><span>Очищение и увлажнение без сложности.</span></div></div><a href="about.html" class="r-text-link">Ближе к DASHU __UP__</a></div></section>
<section class="r-partners r-container" id="partners"><div><span class="r-kicker">FOR THE CRAFT. FOR THE BARBER.</span><h2>За каждым стилем — мастер.</h2><p>Профессиональная коллекция DASHU для вашего барбершопа.</p></div><button data-partner class="r-button r-button-outline" aria-haspopup="dialog">Обсудить партнёрство __UP__</button></section>
</main>
<footer class="r-footer"><div class="r-container"><div class="r-footer-top"><div><a class="wordmark" href="revision-02.html">DASHU</a><p>Корейский мужской уход и стайлинг.<br>Твой стиль. Твой характер.</p></div><div><span class="r-kicker">НА СВЯЗИ</span><a href="mailto:contact@dashurussia.ru">contact@dashurussia.ru __UP__</a><a href="tel:88005553274">8 800 555-32-74</a></div><nav aria-label="Навигация в подвале"><a href="catalog.html">Средства</a><a href="#academy">Гайды</a><a href="stylist.html">Твой стилист</a><a href="#partners">Профессионалам</a></nav></div><div class="r-footer-bottom"><span>© DASHU KOREA / RUSSIA</span><span>DESIGNED IN SEOUL. DEFINED BY YOU.</span></div><p class="r-demo-note">Демонстрационный сайт: цены ориентировочные, заказы и платежи не отправляются.</p></div></footer>
__DIALOGS__
<div id="store-toast" class="store-toast" role="status" aria-live="polite" hidden></div>
<a class="r-stylist-float" href="stylist.html" aria-label="Открыть персонального стилиста">__CHAT__<span>Твой стилист</span></a>
<script src="assets/catalog-data.js?v=3"></script><script src="assets/store.js?v=2"></script><script src="assets/academy.js?v=3"></script><script src="assets/revision-02/design.js?v=1"></script></body></html>
'''
for key,value in {'BAR':bar('02'),'ACADEMY':academy,'DIALOGS':dialogs, **{k.upper():icon(k) for k in ['arrow','back','up','bag','menu','pause','chat']}}.items():
    page = page.replace('__'+key+'__',value)
# Derive the preview product image from the source data instead of guessing a package.
page=page.replace('<div class="r-brand-photo"><img src="assets/academy-classic.webp" srcset="assets/academy-classic-480.webp 480w, assets/academy-classic-768.webp 768w, assets/academy-classic.webp 1440w" sizes="(max-width:760px) 100vw, 45vw" width="1440" height="810"', '<div class="r-brand-photo"><img src="assets/revision-02/craft.webp" srcset="assets/revision-02/craft-480.webp 480w, assets/revision-02/craft-768.webp 768w, assets/revision-02/craft.webp 1000w" sizes="(max-width:760px) 100vw, 45vw" width="1000" height="1500"')
import json, subprocess
data=json.loads(subprocess.check_output(['node','-e',"console.log(JSON.stringify(require('./assets/catalog-data.js')))"],cwd=ROOT,encoding='utf-8'))
mat=next(p for p in data if p['id']=='super-mat-wax')
page=page.replace('assets/products/product-15-240.webp',mat['image'].replace('.webp','-240.webp'))
(ROOT/'revision-02.html').write_text('\n'.join(line.rstrip() for line in page.splitlines())+'\n',encoding='utf-8')
for name,active in [('font-01.html','01'),('index.html','01')]:
    path=ROOT/name
    text=path.read_text(encoding='utf-8')
    text=re.sub(r'<div class="wrap type-comparebar(?: revision-compare)?">.*?</nav></div>',bar(active),text,flags=re.S)
    text=text.replace('assets/typography/preview.css?v=1','assets/typography/preview.css?v=2')
    path.write_text(text,encoding='utf-8')
print('Built revision-02.html; updated comparison links on approved baseline and root.')
