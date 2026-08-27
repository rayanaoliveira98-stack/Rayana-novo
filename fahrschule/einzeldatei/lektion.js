/* --------------------------------------------------------------------
 * Der Lektions-Motor: eine Station = eine Entscheidung.
 * Falsch beantwortete Fragen kommen vor dem Tagesende noch einmal.
 * ------------------------------------------------------------------ */
function lektionSeite(tag) {
  const lektion = LEKTIONEN.find((l) => l.tag === tag);
  if (!lektion) return startSeite();

  const stationen = [];
  if (lektion.tag === 5) stationen.push({ art: "wiederholung" });
  lektion.schritte.forEach((_, i) => stationen.push({ art: "schritt", index: i, nochmal: false }));
  stationen.push({ art: "tagesende" });

  const S = { pos: 0, beantwortet: false };

  const wrap = el("div");
  wrap.style.display = "flex";
  wrap.style.flexDirection = "column";
  wrap.style.minHeight = "100dvh";

  const kopf = el("header", "kopf");
  const kopfzeile = el("div", "zeile");
  kopfzeile.style.alignItems = "center";
  const zu = el("button", "rund", "✕");
  zu.type = "button";
  zu.setAttribute("aria-label", "Zur Startseite");
  zu.addEventListener("click", startSeite);
  const titelbox = el("div");
  titelbox.style.flex = "1";
  const eyebrow = el("p", "etikett", "Tag " + lektion.tag);
  eyebrow.style.color = "var(--tinte-2)";
  const h1 = el("h1", null, lektion.titel);
  h1.style.fontSize = "1.1rem";
  h1.style.fontWeight = "700";
  titelbox.append(eyebrow, h1);
  kopfzeile.append(zu, titelbox);
  const balken = el("div", "balken");
  balken.setAttribute("role", "progressbar");
  balken.setAttribute("aria-valuemin", "0");
  balken.setAttribute("aria-valuemax", "100");
  const fuellung = el("i");
  balken.appendChild(fuellung);
  kopf.append(kopfzeile, balken);

  const inhalt = el("main", "inhalt");
  const fuss = el("footer", "fuss");
  const weiter = el("button", "knopf", "Weiter");
  weiter.type = "button";
  fuss.appendChild(weiter);

  wrap.append(kopf, inhalt, fuss);

  function fehlerAus(schritt) {
    if (schritt.typ === "entscheidung") {
      const richtige = schritt.optionen.find((o) => o.richtig);
      return {
        lektionId: lektion.id, tag: lektion.tag, regel: schritt.regel,
        frage: schritt.frage, erklaerung: richtige.feedback_einfach, zeit: Date.now(),
      };
    }
    const r = schritt.optionen.find((o) => o.richtig);
    return {
      lektionId: lektion.id, tag: lektion.tag, regel: schritt.regel,
      frage: schritt.frage_einfach, erklaerung: r ? r.feedback : "", zeit: Date.now(),
    };
  }

  function abschluss(korrekt, station, schritt) {
    S.beantwortet = true;
    zeichneFuss();
    if (korrekt) return;
    merkeFehler(fehlerAus(schritt));
    // Nur eine Wiederholung. Sonst kommt jemand, der oft falsch liegt, nie
    // ans Tagesende — und genau für den ist die App gebaut. Die Regel bleibt
    // in "Meine Fehler" und lässt sich dort jederzeit wieder öffnen.
    if (station.nochmal) return;
    stationen.splice(stationen.length - 1, 0, {
      art: "schritt", index: station.index, nochmal: true,
    });
  }

  function zeichneFuss() {
    const station = stationen[S.pos];
    const schritt = station.art === "schritt" ? lektion.schritte[station.index] : null;
    const brauchtAntwort = schritt && (schritt.typ === "entscheidung" || schritt.typ === "pruefungsfrage");
    // Solange eine Antwort fehlt, keine Leiste, die die Optionen überdeckt.
    const frei = !brauchtAntwort || S.beantwortet;
    fuss.hidden = !frei;
    weiter.textContent = station.art === "tagesende" ? "Fertig für heute" : "Weiter";
    weiter.className = station.art === "tagesende" ? "knopf knopf--sicher" : "knopf";
  }

  weiter.addEventListener("click", () => {
    stopp();
    const station = stationen[S.pos];
    if (station.art === "tagesende") {
      tagAbschliessen(lektion.tag);
      return startSeite();
    }
    S.pos += 1;
    S.beantwortet = false;
    zeichne();
  });

  function zeichne() {
    stopp();
    inhalt.innerHTML = "";
    const station = stationen[S.pos];
    const anteil = Math.round((S.pos / (stationen.length - 1)) * 100);
    fuellung.style.width = Math.max(anteil, 4) + "%";
    balken.setAttribute("aria-valuenow", String(anteil));

    if (station.art === "wiederholung") {
      inhalt.appendChild(wiederholungsAnsicht());
    } else if (station.art === "tagesende") {
      inhalt.appendChild(tagesendeAnsicht(lektion));
    } else {
      const schritt = lektion.schritte[station.index];
      if (station.nochmal) {
        const marke = el("p", "marke", "Noch einmal üben");
        marke.style.background = "var(--achtung-hell)";
        marke.style.color = "var(--achtung)";
        marke.style.marginBottom = "16px";
        inhalt.appendChild(marke);
      }
      inhalt.appendChild(schrittAnsicht(schritt, (ok) => abschluss(ok, station, schritt)));
    }
    zeichneFuss();
    window.scrollTo(0, 0);
  }

  zeige(wrap);
  zeichne();
}

/* --- Einzelne Schritt-Typen ------------------------------------------ */
function schrittAnsicht(schritt, fertig) {
  const box = el("div", "stapel");

  if (schritt.typ === "szene") {
    box.append(szene(schritt.svg), einfachText(schritt.text_einfach));
    return box;
  }

  if (schritt.typ === "erklaerung") {
    const karte = el("div", "karte karte--info zeile");
    karte.appendChild(guide());
    const t = einfachText(schritt.text_einfach, schritt.vokabeln);
    t.style.flex = "1";
    karte.appendChild(t);
    box.append(karte, amtlichBox(schritt.text_amtlich));
    return box;
  }

  if (schritt.typ === "warum") {
    const h = el("h2", null, "Warum gibt es diese Regel?");
    h.style.fontSize = "1.55rem";
    h.style.fontWeight = "700";
    const karte = el("div", "karte karte--achtung zeile");
    karte.appendChild(guide());
    const t = einfachText(schritt.text_einfach);
    t.style.flex = "1";
    karte.appendChild(t);
    box.append(h, karte);
    return box;
  }

  if (schritt.typ === "folge") {
    const h = el("h2", null, "Was passiert sonst?");
    h.style.fontSize = "1.55rem";
    h.style.fontWeight = "700";
    h.style.color = "var(--gefahr)";
    box.append(h, szene(schritt.svg), einfachText(schritt.text_einfach));
    return box;
  }

  if (schritt.typ === "entscheidung") return entscheidung(schritt, fertig);
  return pruefungsfrage(schritt, fertig);
}

/* Eine Szene, eine Entscheidung. Fehler bestrafen nie. */
function entscheidung(schritt, fertig) {
  const box = el("div", "stapel");
  const bild = szene(schritt.svg);

  const kopf = el("div", "zeile");
  kopf.style.alignItems = "center";
  const frage = el("h2", null, schritt.frage);
  frage.style.flex = "1";
  frage.style.fontSize = "1.55rem";
  frage.style.fontWeight = "700";
  kopf.appendChild(frage);
  const h = hoerknopf(schritt.frage);
  if (h) kopf.appendChild(h);

  const liste = el("div", "stapel--eng");
  schritt.optionen.forEach((o) => {
    const b = el("button", "wahl", o.text);
    b.type = "button";
    b.addEventListener("click", () => waehle(o));
    liste.appendChild(b);
  });

  box.append(bild, kopf, liste);

  function waehle(o) {
    fertig(o.richtig);
    box.innerHTML = "";
    if (o.richtig) {
      const k = el("div", "karte karte--sicher");
      const t = el("p", null, "✓ Richtig!");
      t.style.fontWeight = "700";
      t.style.fontSize = "1.15rem";
      t.style.color = "var(--sicher)";
      k.appendChild(t);
      const e = einfachText(o.feedback_einfach);
      e.style.marginTop = "8px";
      k.appendChild(e);
      box.append(bild, k);
      return;
    }
    // Bei einer falschen Antwort zeigt die Szene, was auf der Straße passiert.
    const lab = el("p", "etikett", "Schau, was passiert:");
    lab.style.color = "var(--gefahr)";
    const folge = szene(o.folge_svg || schritt.svg);
    const k = el("div", "karte karte--gefahr");
    k.appendChild(einfachText(o.feedback_einfach));
    box.append(lab, folge, k);
    if (o.neu_erklaert) {
      const neu = el("div", "karte karte--info zeile");
      neu.appendChild(guide());
      const t = einfachText(o.neu_erklaert);
      t.style.flex = "1";
      neu.appendChild(t);
      box.appendChild(neu);
    }
    const trost = el("p", null, "Kein Problem. Die Frage kommt später noch einmal.");
    trost.style.textAlign = "center";
    trost.style.color = "var(--tinte-2)";
    box.appendChild(trost);
  }

  return box;
}

/* Prüfungsmodus: die Frage steht im amtlichen Register. */
function pruefungsfrage(schritt, fertig) {
  const box = el("div", "stapel");
  const gewaehlt = new Set();
  let geprueft = false;

  const marke = el("p", "marke", "Prüfungsmodus");

  const frageblock = el("div", "frageblock zeile");
  const fp = el("p", "text", schritt.frage_amtlich);
  frageblock.appendChild(fp);
  const fh = hoerknopf(schritt.frage_amtlich);
  if (fh) frageblock.appendChild(fh);

  const einfachKnopf = el("button", "knopf knopf--zweit", "Ich verstehe die Frage nicht");
  einfachKnopf.type = "button";
  einfachKnopf.style.minHeight = "56px";
  einfachKnopf.style.color = "var(--info)";
  einfachKnopf.style.boxShadow = "inset 0 0 0 2px var(--info)";

  const einfachBox = el("div", "karte karte--info");
  einfachBox.hidden = true;
  const el1 = el("p", "etikett", "Einfach gesagt");
  el1.style.color = "var(--info)";
  einfachBox.appendChild(el1);
  const eb = einfachText(schritt.frage_einfach);
  eb.style.marginTop = "4px";
  einfachBox.appendChild(eb);

  einfachKnopf.addEventListener("click", () => {
    einfachBox.hidden = false;
    einfachKnopf.hidden = true;
  });

  const mehrfach = schritt.optionen.filter((o) => o.richtig).length > 1;
  const hinweis = el("p", null, "Mehrere Antworten können richtig sein.");
  hinweis.style.color = "var(--tinte-2)";
  hinweis.style.fontWeight = "700";
  hinweis.hidden = !mehrfach;

  const liste = el("div", "stapel--eng");
  const knoepfe = [];
  const rueckmeldungen = [];

  schritt.optionen.forEach((o, i) => {
    const zeile = el("div");
    const b = el("button", "wahl");
    b.type = "button";
    b.setAttribute("aria-pressed", "false");
    const kaestchen = el("span", "wahl__kaestchen");
    kaestchen.setAttribute("aria-hidden", "true");
    const t = el("span", null, o.text);
    t.style.flex = "1";
    b.append(kaestchen, t);
    b.addEventListener("click", () => {
      if (geprueft) return;
      if (gewaehlt.has(i)) { gewaehlt.delete(i); b.setAttribute("aria-pressed", "false"); kaestchen.textContent = ""; }
      else { gewaehlt.add(i); b.setAttribute("aria-pressed", "true"); kaestchen.textContent = "✓"; }
      pruefen.disabled = gewaehlt.size === 0;
      pruefen.style.opacity = gewaehlt.size === 0 ? "0.4" : "1";
    });
    const rm = el("p");
    rm.hidden = true;
    rm.style.marginTop = "4px";
    rm.style.padding = "0 8px";
    rm.style.fontWeight = "700";
    zeile.append(b, rm);
    knoepfe.push({ b, kaestchen });
    rueckmeldungen.push(rm);
    liste.appendChild(zeile);
  });

  const pruefen = el("button", "knopf", "Antwort prüfen");
  pruefen.type = "button";
  pruefen.disabled = true;
  pruefen.style.opacity = "0.4";

  const ergebnis = el("div");
  ergebnis.hidden = true;

  pruefen.addEventListener("click", () => {
    geprueft = true;
    const korrekt = schritt.optionen.every((o, i) => o.richtig === gewaehlt.has(i));
    fertig(korrekt);
    schritt.optionen.forEach((o, i) => {
      const aktiv = gewaehlt.has(i);
      const k = knoepfe[i].b;
      k.className = "wahl " + (o.richtig && aktiv ? "wahl--richtig"
        : o.richtig ? "wahl--verpasst" : aktiv ? "wahl--falsch" : "wahl--aus");
      if (o.richtig !== aktiv || (aktiv && !o.richtig)) {
        rueckmeldungen[i].textContent = o.feedback;
        rueckmeldungen[i].style.color = o.richtig ? "var(--sicher)" : "var(--gefahr)";
        rueckmeldungen[i].hidden = false;
      }
    });
    pruefen.hidden = true;
    hinweis.hidden = true;
    ergebnis.hidden = false;
    ergebnis.className = "karte " + (korrekt ? "karte--sicher" : "karte--gefahr");
    ergebnis.textContent = korrekt
      ? "✓ Richtig! So kommt die Frage in der Prüfung."
      : "Noch nicht ganz. Die Frage kommt später noch einmal.";
    ergebnis.style.fontWeight = "700";
    ergebnis.style.fontSize = "1.1rem";
    ergebnis.style.color = korrekt ? "var(--sicher)" : "var(--gefahr)";
  });

  box.append(marke, frageblock, einfachKnopf, einfachBox, hinweis, liste, pruefen, ergebnis);
  return box;
}

/* Tag 5 beginnt mit den eigenen Fehlern der Woche. */
function wiederholungsAnsicht() {
  const box = el("div", "stapel");
  const h = el("h2", null, "Deine Woche. Deine Fehler.");
  h.style.fontSize = "1.55rem";
  h.style.fontWeight = "700";
  box.appendChild(h);

  const fehler = ladeFortschritt().fehler;
  if (!fehler.length) {
    const k = el("div", "karte karte--sicher");
    k.appendChild(einfachText("Stark! Du hast keine offenen Fehler. Weiter zur Prüfung."));
    box.appendChild(k);
    return box;
  }

  box.appendChild(einfachText("Diese Regeln waren schwer für dich. Lies sie noch einmal. Dann kommt die Prüfung."));
  const liste = el("ul", "stapel--eng");
  fehler.forEach((fe) => {
    const li = el("li", "karte karte--achtung");
    const tag = el("p", "etikett", "Tag " + fe.tag);
    tag.style.color = "var(--achtung)";
    li.appendChild(tag);
    const e = einfachText(fe.erklaerung);
    e.style.marginTop = "4px";
    li.appendChild(e);
    liste.appendChild(li);
  });
  box.appendChild(liste);
  return box;
}

/* Tagesende: drei Sätze, was heute gelernt wurde — mit Audio. */
function tagesendeAnsicht(lektion) {
  const box = el("div", "stapel");
  box.style.alignItems = "center";
  box.style.textAlign = "center";
  box.style.paddingTop = "16px";

  const haken = el("div", "haken", "✓");
  haken.setAttribute("aria-hidden", "true");
  const h = el("h2", null, "Geschafft!");
  h.style.fontSize = "1.75rem";
  h.style.fontWeight = "700";

  const karte = el("div", "karte karte--sicher");
  karte.style.width = "100%";
  karte.style.textAlign = "left";
  const lab = el("p", "etikett", "Das kannst du jetzt");
  lab.style.color = "var(--sicher)";
  karte.appendChild(lab);
  const liste = el("ul", "stapel--eng");
  liste.style.marginTop = "8px";
  lektion.zusammenfassung.forEach((satz, i) => {
    const li = el("li", "zeile");
    const nr = el("span", null, (i + 1) + ".");
    nr.style.fontWeight = "700";
    nr.style.color = "var(--sicher)";
    const t = el("span", null, satz);
    t.style.flex = "1";
    li.append(nr, t);
    liste.appendChild(li);
  });
  karte.appendChild(liste);
  const hk = hoerknopf(lektion.zusammenfassung.join(" "), true);
  if (hk) { hk.style.marginTop = "16px"; karte.appendChild(hk); }

  box.append(haken, h, karte);
  return box;
}

startSeite();
