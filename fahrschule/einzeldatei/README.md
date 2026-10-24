# Einzeldatei-Version

Baut aus demselben Inhalt (`../content/*.json`) und demselben Glossar
(`../lib/glossar.ts`) eine einzige HTML-Datei ohne Abhängigkeiten. Gedacht zum
Herzeigen: ein Link, der auf jedem Handy aufgeht, auch ohne Deployment.

```bash
python3 einzeldatei/bauen.py     # erzeugt einzeldatei/fahrschul-coach.html
```

Der Inhalt ist die Quelle der Wahrheit und bleibt in `../content/`. Diese
Version rendert ihn nur mit reinem JavaScript statt mit React. Wer Inhalt
ändert, ändert ihn dort und baut hier neu — sonst laufen die zwei Versionen
auseinander.

Die Next.js-App unter `../app` bleibt die richtige Version zum Weiterbauen:
sie hat die Zod-Validierung, den Build-Test für die 12-Wörter-Regel und PWA
mit Offline-Betrieb.
