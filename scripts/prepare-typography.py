"""Download official, locally served font subsets and retain their OFL licences."""
from pathlib import Path
from urllib.request import Request, urlopen
from urllib.parse import urlencode
from concurrent.futures import ThreadPoolExecutor
import re

ROOT=Path(__file__).resolve().parents[1]
DEST=ROOT/'assets/typography'
FAMILIES={'unbounded':'Unbounded','onest':'Onest','manrope':'Manrope','golostext':'Golos Text'}
UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'

def fetch(url):
    with urlopen(Request(url,headers={'User-Agent':UA}),timeout=40) as response:return response.read()

def prepare(item):
    slug,family=item
    css=fetch('https://fonts.googleapis.com/css2?'+urlencode({'family':family+':wght@400..800','display':'swap'})).decode()
    # Cyrillic and Latin cover the site's Russian copy and product names.
    blocks=re.findall(r'/\* ([^*]+) \*/\s*(@font-face\s*\{[^}]+\})',css)
    selected=[]
    for subset,block in blocks:
        if subset not in {'cyrillic','latin'}:continue
        url=re.search(r'url\((https://[^)]+)\)',block).group(1)
        data=fetch(url)
        assert data[:4]==b'wOF2',(family,subset)
        name=slug+'-'+subset+'.woff2'
        (DEST/name).write_bytes(data)
        selected.append('/* '+subset+' */\n'+block.replace(url,name))
    assert len(selected)==2,(family,blocks)
    licence=fetch('https://raw.githubusercontent.com/google/fonts/main/ofl/'+slug+'/OFL.txt')
    (DEST/(slug+'-OFL.txt')).write_bytes(licence)
    return slug,'\n'.join(selected)

if __name__=='__main__':
    DEST.mkdir(parents=True,exist_ok=True)
    with ThreadPoolExecutor(max_workers=4) as pool:results=list(pool.map(prepare,FAMILIES.items()))
    for slug,css in results:
        (DEST/(slug+'.css')).write_text(css+'\n',encoding='utf-8')
        print('Prepared:',slug)
