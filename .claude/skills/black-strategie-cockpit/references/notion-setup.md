# Notion Cockpit, Aufbau

Seite: **Black Strategie Cockpit**
Datenbank: **Aufgaben und Entwicklung**

## Eigenschaften der Datenbank, Ist-Stand

| Eigenschaft | Typ | Werte |
|-------------|-----|-------|
| Aufgabe | Titel | Freitext |
| Agent | Auswahl | Finanzen und Buchhaltung, Content und Kreation, Design und Visual, Meta und Performance, Angebote und Unterlagen, Assets und Wissen |
| Status | Status | Not started, In progress, Done |
| Priorität | Auswahl | Hoch, Mittel, Niedrig |
| Termin | Datum | Fälligkeit |
| Notizen | Text | nächster Schritt in einem Satz |

Beim Anlegen von Aufgaben exakt diese Optionsnamen verwenden, sonst
landen Einträge in einer neuen Spalte statt beim richtigen Agenten.

**Noch offen:** Eine Zahleneigenschaft **BLACK-Score** für das Ergebnis
aus `entscheidungen.md`. Solange sie fehlt, wird der Score in **Notizen**
mitgeschrieben, im Format `Score 9`.

## Ansichten, angelegt

| Ansicht | Typ | Konfiguration | Zweck |
|---------|-----|---------------|-------|
| Nach Agent | Board | gruppiert nach Agent | Hauptansicht, Zuständigkeiten auf einen Blick |
| Tagesansicht | Board | gruppiert nach Status, sortiert nach Priorität | Arbeitsansicht für den Tag |
| Wochenansicht | Tabelle | Status ungleich Done, sortiert nach Priorität, dann Termin | Wochenplanung |

Notion blendet in Board-Ansichten leere Gruppen standardmäßig aus. Wer
alle sechs Agentenspalten dauerhaft sehen will, schaltet in der Ansicht
"Nach Agent" unter Gruppieren die Option für leere Gruppen ein.

## Arbeitsregeln

- Keine Aufgabe ohne Agent, Status, Priorität und Termin.
- Aufgaben mit Priorität Niedrig, die dreimal verschoben wurden, werden
  gelöscht, nicht erneut verschoben.
- Done bleibt bis Monatsende sichtbar, damit die Monatsübersicht daraus
  gebaut werden kann. Erst danach archivieren.

## Content-Kalender

Neben der Cockpit-Datenbank gibt es den Redaktionskalender
**🗓️ CONTENT CALENDER - CLAUDE**, geteilt über alle Marken.

| Eigenschaft | Typ | Werte |
|-------------|-----|-------|
| Name | Titel | Freitext |
| Marke | Auswahl | Black Strategie, STAFF24, FITARY, & Beauty, Privat |
| Type | Auswahl | Instagram, Facebook, Video, Blog Post, Podcast, Tweet, Sponsored Post |
| Status | Status | Idea, In Progress, In Review, Published |
| Publication Date, Deadline | Datum | Veröffentlichung und Abgabe |
| Media | Datei | Grafik zum Post |
| Link, Assign | URL, Person | Beitragslink, Verantwortliche |

Ansicht **Nach Marke** gruppiert nach Marke, sortiert nach
Veröffentlichungsdatum.

Drei Punkte, die beim Anlegen von Einträgen zählen:

- Der Status **Bereit zum Posten** existiert hier nicht. Bis das Visual
  freigegeben ist, gilt **In Review**.
- Eine Notion-Benutzerin **Maria** gibt es im Workspace nicht. Das Feld
  Assign bleibt leer, bis geklärt ist, wer gemeint ist.
- Die Eigenschaft **Marke** ist neu. Ältere Einträge haben sie noch nicht
  und landen in der Spalte ohne Marke, bis sie nachgetragen sind.
- Grafiken lassen sich aus dieser Arbeitsumgebung nicht hochladen,
  `api.notion.com` ist durch die Egress-Policy gesperrt. Die Datei wird im
  Chat geliefert und per Hand ins Feld Media gezogen.
