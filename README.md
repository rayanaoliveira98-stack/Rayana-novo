# FITARY

Boutique Personal-Training-Studio App (Demo-Prototyp) für das erste Boutique PT Studio in Wels.

Eine mobile-first Buchungs-App für Kleingruppen-Kurse und 1:1 Personal Training,
gebaut als eigenständige `index.html` ohne Build-Schritt.

## Funktionen

- **Start** – Begrüßung, nächster Termin, Guthaben-Übersicht, Schnellzugriff.
- **Kursplan** – Wochenansicht mit Tagesauswahl, Belegungsanzeige und Buchung.
- **Buchen / Warteliste** – Plätze sichern; bei vollen Kursen automatisch Warteliste.
- **Stornierung** – mit 24-Stunden-Boutique-Regel (Gutschrift nur > 24 h vorher).
- **Mein Pass** – Mitgliederkarte, 10er-Block bzw. Flat-Membership, Statistiken.
- **Kauf-Sheet** – 10er-Block oder Flat-Membership (Prototyp, keine echte Zahlung).

Der Zustand (Buchungen & Guthaben) wird lokal im Browser über `localStorage` gespeichert.

## Technik

- React 18 + lucide-react, geladen über esm.sh (CDN).
- JSX wird im Browser via Babel Standalone transpiliert – kein Build-Tooling nötig.
- `index.html` ist vollständig eigenständig.

## Lokal starten

Wegen ES-Module-Imports über einen statischen Server öffnen, nicht per `file://`:

```bash
python3 -m http.server 8000
# dann http://localhost:8000 öffnen
```

> Hinweis: Demo-Prototyp. In der Live-Version würden Zahlung (Stripe / SEPA),
> RKSV-konforme Rechnung und DSGVO-konforme Datenhaltung über ein FITARY-Backend laufen.
