"""Create a graphite-button comparison without modifying the approved blue theme."""
from pathlib import Path
import re

ROOT=Path(__file__).resolve().parents[1]
page=(ROOT/'revision-02.html').read_text(encoding='utf-8')
page=page.replace('<title>DASHU — 02 / С правками</title>','<title>DASHU — 03 / Графитовые кнопки</title>')
page=page.replace('class="revision-two"','class="revision-two revision-three graphite-buttons"',1)
page=page.replace('</head>','<link rel="stylesheet" href="assets/revision-02/graphite-buttons.css?v=1"></head>')
bar=re.search(r'<div class="wrap type-comparebar revision-compare">.*?</nav></div>',page,re.S).group()
updated=bar.replace('href="revision-02.html" aria-current="page"','href="revision-02.html"').replace('href="revision-03.html"','href="revision-03.html" aria-current="page"')
page=page.replace(bar,updated,1)
page=re.sub(r'<a\b[^>]*\bclass="wordmark"[^>]*>',lambda m:m[0].replace('href="revision-02.html"','href="revision-03.html"'),page)
page=page.replace('href="stylist.html"','href="stylist.html?buttons=graphite"')
(ROOT/'revision-03.html').write_text(page,encoding='utf-8')
print('Built revision-03.html with graphite buttons and matching stylist links.')
