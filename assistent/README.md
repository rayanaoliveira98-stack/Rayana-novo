# Büro-Assistent

Eine Datei. Kein Server, kein Login, keine Cloud. Für Selbständige und kleine Betriebe in Österreich,
die täglich dieselben Nachrichten, Angebote und Mahnungen schreiben.

**Öffnen:** `index.html` doppelklicken. Läuft in jedem Browser, auch offline.

---

## Was drin ist

**Assistent — 9 Module, jedes liefert fertigen Text zum Kopieren**

| Modul | Ergebnis |
|---|---|
| Kundenantwort | WhatsApp- oder E-Mail-Antwort, erkennt den Anlass aus der eingefügten Nachricht |
| Angebot | Positionstabelle, Netto/USt/Brutto oder Kleinunternehmer-Hinweis, 14 Tage gültig, plus 3-Zeilen-Version für WhatsApp |
| Rechnungstext | Begleittext mit Betrag, Zahlungsziel, [IBAN]-Platzhalter |
| Mahnung | 1. Erinnerung freundlich, 2. Mahnung bestimmt — beide ohne Drohung |
| Termin | Bestätigung in 4 Zeilen plus Erinnerung für den Vortag |
| Bewertung | Antwort auf Google- und Facebook-Bewertungen, positiv wie negativ |
| Instagram-Post | 3 Hook-Varianten, Caption, 5 lokale Hashtags, Bildidee, Text on Screen |
| Wochenplan | sortiert nach Muss / Kann / Kann warten, max. 3 Punkte pro Tag |
| Lange Nachricht kürzen | Worum geht es, was will die Person, bis wann — plus Antwortvorschlag |

**Betriebsprofil** — Anrede, Ton, Leistungen mit Preisen, Einstiegsangebot, Zahlungsziel, Signaturen,
Grenzen. Alle Texte ziehen daraus. Fehlt ein Preis, schreibt das Programm `[PREIS?]` statt zu erfinden.

**Kunden** — Name, Kanal, Status, Wiedervorlage, Notiz, Verlauf aller erstellten Texte.
Die Übersicht zeigt, wer heute dran ist.

**Mehrere Betriebe** — jeder mit eigenem Profil, eigenen Kunden, eigenem Verlauf. Oben rechts umschalten.

**KI-Prompt-Knopf** — erzeugt Regeln + Profil + Angaben als fertigen Prompt für ChatGPT oder Claude,
wenn eine freiere Formulierung gebraucht wird.

---

## Regeln, die in jedem Text stecken

- Österreichisches Deutsch, kurze Sätze, ein Gedanke pro Absatz
- Keine erfundenen Preise, keine erfundenen freien Termine
- Keine medizinischen, rechtlichen oder steuerlichen Einschätzungen
- Keine Emojis, außer das Profil erlaubt sie
- WhatsApp maximal 5 Zeilen — das Programm warnt, wenn es länger wird
- Jede Antwort endet mit genau einem nächsten Schritt
- Bei IBAN, Gesundheits- oder Ausweisdaten in einer eingefügten Nachricht kommt eine Warnung

---

## Datenschutz

Alle Daten liegen ausschließlich im Browser des Nutzers (localStorage). Nichts wird übertragen.
Kein Auftragsverarbeitungsvertrag nötig, solange die Datei lokal oder auf eigenem Webspace läuft.
**Wichtig:** Browserdaten löschen löscht auch die App-Daten. Deshalb in den Einstellungen regelmäßig
exportieren — als Datei oder per Textfeld.

---

## Für den Weiterverkauf

**Einrichtung pro Kunde: ca. 20 Minuten**

1. `index.html` kopieren, an den Kunden geben (USB, Mail, eigener Webspace, eigene Domain)
2. Einstellungen: Produktname und Akzentfarbe auf das Kundenbranding setzen
3. Betriebsprofil gemeinsam mit dem Kunden ausfüllen — das ist die eigentliche Leistung
4. Zwei, drei Texte gemeinsam erzeugen, damit der Kunde den Ablauf einmal gesehen hat
5. Export als Sicherung mitgeben

**Paketvorschlag**

| Paket | Inhalt | Richtpreis |
|---|---|---|
| Werkzeug | Datei plus Kurzanleitung, Kunde füllt selbst aus | 190 Euro einmalig |
| Eingerichtet | Profil komplett befüllt, Branding, 60 Minuten Einschulung | 490 Euro einmalig |
| Betreut | wie Eingerichtet, dazu monatliche Anpassung der Vorlagen und Preise, 4 Instagram-Posts | 490 Euro plus 89 Euro monatlich |

Der Preis hängt nicht an der Datei, sondern an der Einrichtung und der laufenden Betreuung.
Eine Datei allein ist kein Abo wert — die monatliche Arbeit schon.

---

## Technisch

Eine einzige HTML-Datei, kein Build, keine Abhängigkeiten, kein Framework.
Speicher: `localStorage`, Schlüssel `bueroassistent.v1`.
Export- und Importformat: JSON, ganzer Bestand oder einzelner Betrieb.
