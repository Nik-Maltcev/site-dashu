"""Build two typography alternatives and a shared comparison switch on all three pages."""
from pathlib import Path
import re

ROOT=Path(__file__).resolve().parents[1]
if (ROOT/'revision-02.html').exists():
    raise SystemExit('Font previews are frozen as comparison baselines. Use build-revision-02.py for the client revision.')
source=(ROOT/'index.html').read_text(encoding='utf-8')
assert 'dashu-refined' in source
source=re.sub(r'<div class="wrap type-comparebar">.*?</nav></div>','',source,flags=re.S)
source=source.replace('<link rel="stylesheet" href="assets/typography/preview.css?v=1">','')

def comparison_bar(active):
    current=' aria-current="page"' if active=='original' else ''
    links=[f'<a href="index.html"{current}>Исходный</a>']
    for n,label,short in [('01','Unbounded + Onest','Unbounded'),('02','Manrope + Golos Text','Manrope')]:
        current=' aria-current="page"' if n==active else ''
        links.append(f'<a href="font-{n}.html"{current}>{n} / <span class="pair-name">{label}</span><span class="pair-short">{short}</span></a>')
    return '<div class="wrap type-comparebar"><span class="type-label">ВАРИАНТЫ ТИПОГРАФИКИ</span><nav aria-label="Сравнить шрифты">'+''.join(links)+'</nav></div>'

for number,kind,pair in [('01','one','Unbounded + Onest'),('02','two','Manrope + Golos Text')]:
    page=source.replace('<title>DASHU — Own Your Form</title>',f'<title>DASHU — Шрифты {number} / {pair}</title>')
    styles=f'<link rel="stylesheet" href="assets/typography/preview.css?v=1"><link rel="stylesheet" href="assets/typography/font-{number}.css?v=1">'
    page=page.replace('</head>',styles+'</head>')
    page=page.replace('class="dark dashu-refined"',f'class="dark dashu-refined type-preview type-{kind}"')
    page=page.replace('href="index.html#','href="#').replace('href="index.html"',f'href="font-{number}.html"')
    bar=comparison_bar(number)
    page=page.replace('<section class="dark-hero">',bar+'<section class="dark-hero">',1)
    (ROOT/f'font-{number}.html').write_text(page,encoding='utf-8')
    print('Built:',f'font-{number}.html',pair)

original=source.replace('</head>','<link rel="stylesheet" href="assets/typography/preview.css?v=1"></head>')
original=original.replace('<section class="dark-hero">',comparison_bar('original')+'<section class="dark-hero">',1)
(ROOT/'index.html').write_text(original,encoding='utf-8')
print('Updated: original landing comparison switch')
