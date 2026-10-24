import json, pathlib, re, sys

quelle = pathlib.Path(__file__).resolve().parent.parent
hier = pathlib.Path(__file__).parent

lektionen = sorted(
    (json.loads(p.read_text(encoding='utf8')) for p in quelle.glob('content/tag-0*.json')),
    key=lambda l: l['tag'],
)
assert len(lektionen) == 5, lektionen

# Glossar aus lib/glossar.ts übernehmen (einzige Quelle bleibt die TS-Datei).
ts = (quelle / 'lib/glossar.ts').read_text(encoding='utf8')
eintraege = re.findall(
    r'\{\s*de:\s*"((?:[^"\\]|\\.)*)",\s*einfach:\s*\n?\s*"((?:[^"\\]|\\.)*)",\s*audio:\s*true,?\s*\}',
    ts,
)
glossar = [{'de': d, 'einfach': e, 'audio': True} for d, e in eintraege]
assert len(glossar) >= 10, f'nur {len(glossar)} Vokabeln gefunden'

vorlage = (hier / 'vorlage.html').read_text(encoding='utf8')
motor = '\n'.join((hier / f).read_text(encoding='utf8') for f in ('motor.js', 'seiten.js', 'lektion.js'))

seite = (vorlage
         .replace('__INHALT__', json.dumps(lektionen, ensure_ascii=False))
         .replace('__GLOSSAR__', json.dumps(glossar, ensure_ascii=False)))
seite = seite.replace('</script>', motor + '\n</script>', 1)

ziel = hier / 'fahrschul-coach.html'
ziel.write_text(seite, encoding='utf8')
print(f'{ziel.name}: {ziel.stat().st_size/1024:.0f} KB, {len(lektionen)} Lektionen, {len(glossar)} Vokabeln')
