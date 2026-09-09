# Abgrenzung der Black-Strategie-Skills

Drei Skills berühren dieselbe Marke. Ohne klare Grenzen greift bei
derselben Anfrage mal die eine, mal die andere, und das Ergebnis schaut
jedes Mal anders aus.

## Aufgabenteilung

| Skill | Rolle | Besitzt |
|-------|-------|---------|
| `black-strategie-content` | Markenwahrheit | Positionierung, Zielgruppe, Preise, Angebotstreppe, Verkaufsregeln, Anrede, CI, Funnel, aktive Ziele, Sales- und Website-Copy |
| `content-engine` | Produktion | Hook, Caption, Skript, Karussell, Hashtags, Canva-Grafik, Notion-Kalendereintrag, markenübergreifend |
| `black-strategie-cockpit` | Steuerung | Zuständigkeit, Priorität, Termine, Geld, Angebotsdokumente, Assets, Reporting-Auswertung, Wochen- und Sessionübersicht |

## Vorrang bei Widerspruch

1. `black-strategie-content` schlägt alles andere in Marken-, Preis-,
   Zielgruppen- und Tonfragen.
2. `content-engine` bestimmt den Produktionsweg, inklusive Canva und
   Notion, aber nie die Markeninhalte.
3. Das Cockpit bestimmt Reihenfolge und Termin, nie den Inhalt.

## Bekannter Konflikt, gelöst

Der ursprüngliche Cockpit-Entwurf positionierte Black Strategie über
Recruiting. Das widerspricht `black-strategie-content`, wo Recruiting
wegen der Anstellung bei STAFF24 ausdrücklich kein Label, kein
Angebotsname und kein Content-Schwerpunkt sein darf. Der Entwurf wurde
korrigiert: Zielgruppe sind Praxen, Selbstständige und kleine Betriebe in
Oberösterreich, Anrede Sie, Einstieg über den Praxis-Check mit Keyword
CHECK per WhatsApp. Recruiting-Content läuft ausschließlich über
`staff24-content`.

## Anzupassen in den beiden anderen Skills

Beide liegen im claude.ai-Konto, nicht in diesem Repo. Änderungen dort
über Einstellungen, Capabilities, Skills.

### `content-engine`, Beschreibung ergänzen

Am Ende der description anhängen:

```
Für Black Strategie gilt black-strategie-content als Quelle für
Positionierung, Zielgruppe, Preise, Anrede und CI. Bei Widerspruch
gewinnt jene Skill. Fragen zu Zuständigkeit, Priorität, Terminen,
Rechnungen, Angebotsdokumenten oder Assets gehören zu
black-strategie-cockpit, nicht hierher.
```

### `black-strategie-content`, Beschreibung ergänzen

Am Ende der description anhängen:

```
Diese Skill ist die Quelle der Markenwahrheit. Die Produktion von Reels,
Captions, Karussells, Grafiken und Kalendereinträgen läuft über
content-engine, die Steuerung von Aufgaben, Prioritäten, Finanzen und
Angebotsdokumenten über black-strategie-cockpit.
```

Damit ist jede Anfrage genau einer Skill zugeordnet, und die anderen
beiden wissen, wohin sie abgeben.
