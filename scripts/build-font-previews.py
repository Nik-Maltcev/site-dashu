"""Create two typography-only landing variations without changing the live index."""
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
source=(ROOT/'index.html').read_text(encoding='utf-8')
assert 'dashu-refined' in source
for number,kind,pair in [('01','one','Unbounded + Onest'),('02','two','Manrope + Golos Text')]:
    page=source.replace('<title>DASHU — Own Your Form</title>',f'<title>DASHU — Шрифты {number} / {pair}</title>')
    styles=f'<link rel="stylesheet" href="assets/typography/preview.css?v=1"><link rel="stylesheet" href="assets/typography/font-{number}.css?v=1">'
    page=page.replace('</head>',styles+'</head>')
    page=page.replace('class="dark dashu-refined"',f'class="dark dashu-refined type-preview type-{kind}"')
    page=page.replace('href="index.html#','href="#').replace('href="index.html"',f'href="font-{number}.html"')
    links=[]
    for n,label,short in [('01','Unbounded + Onest','Unbounded'),('02','Manrope + Golos Text','Manrope')]:
        current=' aria-current="page"' if n==number else ''
        links.append(f'<a href="font-{n}.html"{current}>{n} / <span class="pair-name">{label}</span><span class="pair-short">{short}</span></a>')
    bar='<div class="wrap type-comparebar"><span class="type-label">ВАРИАНТЫ ТИПОГРАФИКИ</span><nav aria-label="Сравнить шрифты"><a href="index.html">Исходный</a>'+''.join(links)+'</nav></div>'
    page=page.replace('<section class="dark-hero">',bar+'<section class="dark-hero">',1)
    (ROOT/f'font-{number}.html').write_text(page,encoding='utf-8')
    print('Built:',f'font-{number}.html',pair)
