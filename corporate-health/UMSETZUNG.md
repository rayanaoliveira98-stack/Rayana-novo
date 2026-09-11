# FITARY Corporate Health Landingpage — Umsetzungsdokument

Zielseite: `fitary.at/corporate-health/` (als **Entwurf** anlegen, nicht veröffentlichen)
Dankesseite: `fitary.at/corporate-health/danke/` (ebenfalls Entwurf, noindex)

Dateien in diesem Ordner:
- `index.html` — komplette Landingpage, CSS inline, keine externen Abhängigkeiten außer Google Fonts
- `danke.html` — Dankesseite für Conversion-Messung
- `UMSETZUNG.md` — dieses Dokument

---

## 1. SEO / Technik

| Feld | Wert |
|---|---|
| Seitentitel (Title-Tag) | `Betriebliche Gesundheitsförderung Wels \| FITARY Corporate Health` |
| Meta-Description (152 Zeichen) | `Weniger Krankenstände, gesündere Teams. Gesundheitstage und Firmenfitness in Wels und Oberösterreich. Betriebsanalyse vor Ort kostenlos. Jetzt anfragen.` |
| Slug | `corporate-health` |
| H1 | `Weniger Ausfälle im Team. Betriebliche Gesundheitsförderung in Wels.` (enthält Keyword + Ort) |
| Indexierung | `noindex, nofollow` solange Entwurf. **Vor Livegang entfernen** (Zeile 8 in `index.html`). Danke-Seite bleibt dauerhaft `noindex`. |
| Keine Navigation | bewusst: kein Menü, kein Newsletter, kein Footer-Menü zu anderen Seiten |

Telefon überall als `tel:+436703565006` verlinkt. WhatsApp als `https://wa.me/436703565006`.

---

## 2. WordPress Einbau

**Variante A (empfohlen, schnellste):**
1. Neue Seite anlegen, Titel „Corporate Health“, Slug `corporate-health`.
2. Seitenvorlage ohne Header und Footer wählen (im Theme meist „Blank“, „Canvas“ oder „Fullwidth ohne Header“).
3. Block **Benutzerdefiniertes HTML** einfügen, Inhalt aus `index.html` **zwischen `<body>` und `</body>`** kopieren.
4. Den kompletten `<style>`-Block in denselben HTML-Block oben mit hineinkopieren, oder unter *Design → Customizer → Zusätzliches CSS* ablegen.
5. Die Google-Fonts-Zeilen aus dem `<head>` per Plugin (z. B. „Insert Headers and Footers“) in den Header der Seite legen.
6. Speichern als **Entwurf**.

**Variante B (sauberer, wenn Theme-Child vorhanden):** Datei als `page-corporate-health.php` im Child-Theme ablegen, Template der Seite zuweisen.

---

## 3. Formular

Empfänger: **office@fitary.at**
Absender-Adresse im Plugin auf eine Domain-Adresse setzen (z. B. `no-reply@fitary.at`), sonst landet die Mail im Spam.

### Feldliste

| Feld | Typ | Pflicht | Optionen |
|---|---|---|---|
| Firma | Text | ja | — |
| Ansprechperson | Text | ja | — |
| Telefon | Tel | ja | — |
| E-Mail | E-Mail | ja | — |
| Mitarbeiterzahl | Auswahl | ja | bis 10 / 11 bis 50 / 51 bis 150 / über 150 |
| Nachricht | Textarea | nein | — |
| Datenschutz-Zustimmung | Checkbox | ja | Link auf `/allgemein-be/` |
| Button | — | — | Beschriftung: `Betriebsanalyse anfragen` |

> Hinweis: Die Datenschutz-Checkbox war im Briefing nicht enthalten, ist in Österreich für Kontaktformulare aber Standard. Bitte prüfen und so belassen.

### Contact Form 7 Shortcode (falls kein Formular-Plugin installiert ist)

```
<label>Firma
[text* firma autocomplete:organization] </label>

<label>Ansprechperson
[text* ansprechperson autocomplete:name] </label>

<label>Telefon
[tel* telefon autocomplete:tel] </label>

<label>E-Mail
[email* email autocomplete:email] </label>

<label>Mitarbeiterzahl
[select* mitarbeiterzahl "bis 10" "11 bis 50" "51 bis 150" "über 150"] </label>

<label>Nachricht (optional)
[textarea nachricht 3x40] </label>

[acceptance dsgvo] Ich stimme zu, dass meine Angaben zur Bearbeitung der Anfrage verwendet werden. Mehr dazu in der <a href="/allgemein-be/">Datenschutzerklärung</a>. [/acceptance]

[submit "Betriebsanalyse anfragen"]
```

**CF7 E-Mail-Tab:**
- An: `office@fitary.at`
- Betreff: `Neue BGF-Anfrage: [firma] ([mitarbeiterzahl])`
- Von: `FITARY Website <no-reply@fitary.at>`
- Antwort an: `[email]`
- Nachrichtentext:
```
Firma: [firma]
Ansprechperson: [ansprechperson]
Telefon: [telefon]
E-Mail: [email]
Mitarbeiterzahl: [mitarbeiterzahl]
Nachricht: [nachricht]
```

**CF7 Weiterleitung auf die Dankesseite** (Tab *Zusätzliche Einstellungen* funktioniert dafür nicht mehr, stattdessen ins Theme oder per Snippet-Plugin):
```js
document.addEventListener('wpcf7mailsent', function(){
  window.location = '/corporate-health/danke/';
}, false);
```

Wenn ein anderes Plugin bereits installiert ist (WPForms, Elementor Forms, Fluent Forms, Forminator), dieses nutzen und dort die Weiterleitung direkt in den Formular-Einstellungen auf `/corporate-health/danke/` setzen.

---

## 4. Google Ads Conversion

Die Dankesseite ist die Conversion. Sauberste Variante, weil eigene URL:

1. Google Ads → Ziele → Conversions → Neue Conversion-Aktion → Website.
2. Aktionsname: `BGF Betriebsanalyse Anfrage`
3. Kategorie: `Kontakt` (oder `Lead absenden`)
4. Wert: empfohlen 200 Euro pro Lead als Rechengröße, damit Smart Bidding etwas zu optimieren hat. Anpassen sobald echte Abschlussquoten vorliegen.
5. Zählung: **Eindeutig** (nicht „Jede“).
6. Auslöser in Google Tag Manager oder in Google Tag direkt: Seitenaufruf, URL enthält `/corporate-health/danke/`.
7. Nach dem Livegang mit dem Google Tag Assistant eine Testanfrage absenden und prüfen, ob die Conversion feuert.

Zusätzlich als sekundäre Conversion einrichten (nicht als Gebotsziel):
- Klick auf `tel:+436703565006`
- Klick auf den WhatsApp-Link

---

## 5. Was noch eingesetzt werden muss

### Fotos
| Stelle | Was | Format |
|---|---|---|
| Sektion 7 „Über Yalcin“ | Portrait Yalcin Arslan im Studio, ruhig, seriös, nicht Gym-Pose. Duotone dunkel. | hochkant 4:5, min. 900 x 1125 px |
| Optional Hero-Hintergrund | Studio oder Betriebssituation, stark abgedunkelt, damit die Schrift lesbar bleibt | quer 16:9, min. 1920 px breit |
| Optional Sektion 4 „Ablauf“ | Foto aus einem echten Betrieb, Haltungs-Check am Arbeitsplatz | quer 3:2 |

Die Platzhalter im Code sind gestrichelt umrandet und beschriftet, damit nichts übersehen wird.

### Texte mit Freigabe
| Stelle | Was fehlt |
|---|---|
| Testimonial 1 | Originalzitat **Dr. Peter Budenhofer** mit schriftlicher Freigabe. Im Code steht `[ZITAT BUDENHOFER EINSETZEN]`. |
| Testimonial 2 | Originalzitat **Valentin Hofer** mit schriftlicher Freigabe. Im Code steht `[ZITAT HOFER EINSETZEN]`. |

Beide Zitate wurden bewusst **nicht** erfunden. Namentliche Aussagen realer Personen dürfen nicht geschrieben werden, ohne dass sie sie so gesagt und freigegeben haben.

### Zahl mit Quelle prüfen
| Stelle | Zahl | Status |
|---|---|---|
| Zahlenleiste, Kachel 1 | **250 Euro pro Krankenstandstag** | Recherchiert aus der Berichterstattung zum WKO/WIFO Fehlzeitenreport. Vor Livegang im aktuellen Fehlzeitenreport nachschlagen, exakte Jahreszahl in die Quellenzeile eintragen. Falls die aktuelle Zahl abweicht, Zahl und Quelle gemeinsam ändern. |
| Kontext | 14,7 Krankenstandstage pro Beschäftigtem und Jahr in Österreich (2025) | Nicht auf der Seite verwendet, aber gutes Argument im Verkaufsgespräch. |

Quellen zum Nachprüfen:
- [WKO Fehlzeitenreport 2025](https://www.wko.at/oe/news/fehlzeitenreport-2025)
- [WKO Oberösterreich: Fehlzeiten kosten Milliarden](https://www.wko.at/ooe/news/fehlzeiten)
- [WIFO Fehlzeitenreport (PDF)](https://www.wifo.ac.at/wp-content/uploads/upload-4977/s_2025_fehlzeitenreport_2025_58823550.pdf)

### Rechtliches
- Steuerhinweis ist mit Paragraf und dem Zusatz „Die Details für Ihren Betrieb klärt Ihr Steuerberater“ formuliert. Bitte einmal von der Steuerberatung gegenlesen lassen.
- Die 4,9 Sterne und 96 Prozent Weiterempfehlung müssen zum Zeitpunkt des Livegangs stimmen. Bei Google-Bewertungen ändert sich das laufend.

---

## 6. Design-Spezifikation

| Element | Wert |
|---|---|
| Hintergrund dunkel | `#22403D`, Verlauf nach `#1B3431` und `#3F5D5B` |
| Buttons und Akzente | `#B03008`, Hover `#C7411A` |
| Schrift | `#E4F0E4`, Fließtext gedimmt auf 72 Prozent |
| Headline-Font | Big Shoulders Display 800, Versalien |
| Fließtext-Font | Inter 400 und 600 |
| Button-Höhe | 56 px, alle Touch-Ziele mindestens 48 px |
| Kein Slider, kein Autoplay-Video, keine Animation | erfüllt |
| Mobile first | ja, Breakpoints bei 620, 780, 860 und 900 px |

**Ladezeit:** CSS ist inline, kein JavaScript-Framework, kein Bildmaterial im Code. Einziger externer Request sind die Google Fonts. Wenn unter 1 Sekunde gewünscht: Fonts lokal hosten (Plugin „OMGF“) — spart 2 Requests und erledigt gleichzeitig das DSGVO-Thema mit Google Fonts.

---

## 7. Strategische Anmerkungen

Drei Punkte, die die Conversion-Rate stärker beeinflussen als alles andere auf der Seite:

**1. Preise auf der Landingpage sind richtig, aber sie filtern hart.**
490 Euro sind für einen 120-Personen-Betrieb kein Argument, sondern ein Signal „zu klein für uns“. Empfehlung: nach 4 bis 6 Wochen Kampagne prüfen, ob Anfragen aus dem Segment 51 bis 150 ausbleiben. Falls ja, zweite Variante der Seite ohne Starter-Paket bauen und über eine eigene Anzeigengruppe („Firmenfitness Oberösterreich“, „BGF Anbieter“) ausspielen.

**2. Ein CTA ist strategisch korrekt, aber die Betriebsanalyse ist eine hohe Hürde.**
„Jemand kommt in meinen Betrieb“ ist mehr Commitment als „ich rufe kurz an“. Telefon und WhatsApp sind deshalb bewusst gleich im Hero sichtbar, ohne den Haupt-CTA zu schwächen. Beide als sekundäre Conversions tracken, sonst sieht Google Ads einen Teil der echten Leads nicht.

**3. Die Zahl 250 Euro ist der stärkste Hebel der ganzen Seite.**
Ein Betrieb mit 40 Mitarbeitenden und 14,7 Krankenstandstagen pro Kopf verliert rechnerisch rund 147.000 Euro im Jahr. Das Professional-Paket kostet 890 Euro. Dieses Verhältnis gehört ins Verkaufsgespräch und in die Anzeigentexte, nicht nur in eine Kachel. Sobald die Zahl aus dem aktuellen Fehlzeitenreport bestätigt ist, lohnt sich ein interaktiver Rechner auf der Seite: Mitarbeiterzahl eingeben, Kosten sehen. Das erhöht Verweildauer und Lead-Qualität deutlich.
