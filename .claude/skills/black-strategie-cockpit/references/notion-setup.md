# Notion Cockpit, Einrichtung

Die Seite "Black Strategie Cockpit" liegt als Entwurf bereit, mit der
Datenbank "Aufgaben und Entwicklung".

## Eigenschaften der Datenbank

| Eigenschaft | Typ | Werte |
|-------------|-----|-------|
| Aufgabe | Titel | Freitext |
| Agent | Auswahl | 1 Finanzen, 2 Content, 3 Design, 4 Meta, 5 Angebote, 6 Assets |
| Status | Status | Not started, In progress, Done |
| Priorität | Auswahl | Hoch, Mittel, Niedrig |
| Termin | Datum | Fälligkeit |
| BLACK-Score | Zahl | Ergebnis aus references/entscheidungen.md |
| Notiz | Text | nächster Schritt in einem Satz |

## Board-Ansichten anlegen

Der Connector legt keine Ansichten an, das geschieht einmalig manuell.

1. Plus neben der Tabelle anklicken, Board wählen.
2. Gruppieren nach **Agent**. Das ist die Hauptansicht, sechs Spalten,
   eine pro Agent.
3. Zweite Ansicht anlegen, Board, gruppieren nach **Status**. Das ist
   die Arbeitsansicht für den Tag.
4. Dritte Ansicht anlegen, Tabelle, filtern auf Status ungleich Done,
   sortieren nach Priorität absteigend, dann Termin aufsteigend. Das ist
   die Wochenansicht.

## Arbeitsregeln in Notion

- Keine Aufgabe ohne Agent, Status, Priorität und Termin.
- Aufgaben mit Priorität Niedrig, die dreimal verschoben wurden, werden
  gelöscht, nicht erneut verschoben.
- Done wird nicht archiviert, sondern bleibt bis zum Monatsende sichtbar,
  damit die Monatsübersicht daraus gebaut werden kann.
