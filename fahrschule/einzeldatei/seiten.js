/* --------------------------------------------------------------------
 * Bildschirme
 * ------------------------------------------------------------------ */
const GESAMT_TAGE = 30;
const app = document.getElementById("app");

function zeige(knoten) {
  stopp();
  app.innerHTML = "";
  app.appendChild(knoten);
  window.scrollTo(0, 0);
}

/* --- Start ----------------------------------------------------------- */
function startSeite() {
  const f = ladeFortschritt();
  const naechst = Math.min(naechsterTag(f), LEKTIONEN.length);
  const aktuell = LEKTIONEN.find((l) => l.tag === naechst) || LEKTIONEN[0];
  const fertigAlle = f.abgeschlosseneTage.length >= LEKTIONEN.length;
  const gruss = fertigAlle
    ? "Woche 1 geschafft. Du kannst jeden Tag wiederholen."
    : "Heute lernst du eine Regel. Ruhig und einfach.";

  const wrap = el("div");
  wrap.style.padding = "24px 16px 32px";
  wrap.style.display = "flex";
  wrap.style.flexDirection = "column";

  const kopf = el("header", "zeile");
  kopf.appendChild(guide(64));
  const titelbox = el("div");
  titelbox.style.flex = "1";
  const h1 = el("h1", null, "Führerschein B");
  h1.style.fontSize = "1.75rem";
  h1.style.fontWeight = "700";
  const unter = el("p", null, "Theorie, einfach erklärt.");
  unter.style.color = "var(--tinte-2)";
  titelbox.append(h1, unter);
  kopf.appendChild(titelbox);
  const hk = hoerknopf(gruss);
  if (hk) kopf.appendChild(hk);
  wrap.appendChild(kopf);

  const grussbox = el("p", "karte karte--info", gruss);
  grussbox.style.marginTop = "20px";
  grussbox.style.fontSize = "1.05rem";
  wrap.appendChild(grussbox);

  if (f.streak > 0) {
    const s = el("p", null, "🔥 " + f.streak + (f.streak === 1 ? " Tag" : " Tage") + " in Folge");
    s.style.marginTop = "12px";
    s.style.fontWeight = "700";
    s.style.color = "var(--achtung)";
    wrap.appendChild(s);
  }

  const startBox = el("div");
  startBox.style.marginTop = "24px";
  const start = el("button", "knopf knopf--gross", "Tag " + aktuell.tag + " starten");
  start.type = "button";
  start.addEventListener("click", () => lektionSeite(aktuell.tag));
  const untertitel = el("p", null, aktuell.titel + " · " + aktuell.dauerMinuten + " Minuten");
  untertitel.style.marginTop = "8px";
  untertitel.style.textAlign = "center";
  untertitel.style.color = "var(--tinte-2)";
  startBox.append(start, untertitel);
  wrap.appendChild(startBox);

  if (f.fehler.length) {
    const mf = el("button", "knopf knopf--zweit", "Meine Fehler (" + f.fehler.length + ")");
    mf.type = "button";
    mf.style.marginTop = "16px";
    mf.addEventListener("click", fehlerSeite);
    wrap.appendChild(mf);
  }

  // Ehrlich bleiben: der Pilot ist ein Ausschnitt, keine ganze Prüfung.
  const hinweis = el("section", "karte karte--achtung");
  hinweis.style.marginTop = "32px";
  const hh = el("h2", null, "Das lernst du hier");
  hh.style.fontSize = "1.1rem";
  hh.style.fontWeight = "700";
  const ht = el("p", null,
    "Woche 1 erklärt vier Themen. Vorrang, Ampel, Schutzweg und Schilder. "
    + "Die Prüfung fragt noch mehr ab. Lerne auch in der Fahrschule.");
  ht.style.marginTop = "4px";
  hinweis.append(hh, ht);
  wrap.appendChild(hinweis);

  const weg = el("section");
  weg.style.marginTop = "32px";
  const wh = el("h2", null, "Dein Weg");
  wh.style.fontSize = "1.1rem";
  wh.style.fontWeight = "700";
  const wt = el("p", null, "Woche 1 ist offen. Der Rest kommt bald.");
  wt.style.color = "var(--tinte-2)";
  const netz = el("div", "wegnetz");
  for (let n = 1; n <= GESAMT_TAGE; n++) {
    const offen = n <= LEKTIONEN.length;
    const fertig = f.abgeschlosseneTage.indexOf(n) !== -1;
    const jetzt = offen && n === aktuell.tag && !fertig;
    const s = el("span", fertig ? "fertig" : jetzt ? "jetzt" : offen ? "" : "zu",
      fertig ? "✓" : String(n));
    if (offen) {
      s.setAttribute("role", "button");
      s.tabIndex = 0;
      s.setAttribute("aria-label", "Tag " + n);
      const los = () => lektionSeite(n);
      s.addEventListener("click", los);
      s.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); los(); } });
    } else {
      s.setAttribute("aria-label", "Tag " + n + ", noch gesperrt");
    }
    netz.appendChild(s);
  }
  weg.append(wh, wt, netz);
  wrap.appendChild(weg);

  const liste = el("ul", "stapel--eng");
  liste.style.marginTop = "32px";
  LEKTIONEN.forEach((l) => {
    const fertig = f.abgeschlosseneTage.indexOf(l.tag) !== -1;
    const li = el("li");
    const b = el("button", "tagzeile");
    b.type = "button";
    const nr = el("span", "tagzeile__nr" + (fertig ? " fertig" : ""), fertig ? "✓" : String(l.tag));
    const mitte = el("span");
    mitte.style.flex = "1";
    const t = el("span", null, l.titel);
    t.style.display = "block";
    t.style.fontWeight = "700";
    const d = el("span", null, l.dauerMinuten + " Minuten");
    d.style.display = "block";
    d.style.color = "var(--tinte-2)";
    mitte.append(t, d);
    const pf = el("span", null, "›");
    pf.setAttribute("aria-hidden", "true");
    pf.style.color = "var(--tinte-2)";
    pf.style.fontSize = "1.3rem";
    b.append(nr, mitte, pf);
    b.addEventListener("click", () => lektionSeite(l.tag));
    li.appendChild(b);
    liste.appendChild(li);
  });
  wrap.appendChild(liste);

  zeige(wrap);
}

/* --- Meine Fehler ---------------------------------------------------- */
function fehlerSeite() {
  const wrap = el("div");
  wrap.style.display = "flex";
  wrap.style.flexDirection = "column";
  wrap.style.minHeight = "100dvh";

  const kopf = el("header", "kopf zeile");
  kopf.style.alignItems = "center";
  const zurueck = el("button", "rund", "‹");
  zurueck.type = "button";
  zurueck.setAttribute("aria-label", "Zurück");
  zurueck.addEventListener("click", startSeite);
  const h1 = el("h1", null, "Meine Fehler");
  h1.style.fontSize = "1.1rem";
  h1.style.fontWeight = "700";
  kopf.append(zurueck, h1);
  wrap.appendChild(kopf);

  const inhalt = el("main", "inhalt");
  const fehler = ladeFortschritt().fehler;

  if (!fehler.length) {
    const leer = el("div", "stapel");
    leer.style.alignItems = "center";
    leer.style.textAlign = "center";
    leer.style.paddingTop = "32px";
    leer.appendChild(guide(80));
    const t = el("p", null, "Keine offenen Fehler.");
    t.style.fontSize = "1.3rem";
    t.style.fontWeight = "700";
    leer.appendChild(t);
    const e = einfachText("Du hast alles richtig gemacht. Oder du hast schon geübt.");
    e.style.width = "100%";
    e.style.textAlign = "left";
    leer.appendChild(e);
    const b = el("button", "knopf", "Zur Startseite");
    b.type = "button";
    b.addEventListener("click", startSeite);
    leer.appendChild(b);
    inhalt.appendChild(leer);
  } else {
    inhalt.appendChild(einfachText("Hier sind deine schweren Regeln. Lies sie in Ruhe."));
    const liste = el("ul", "stapel");
    liste.style.marginTop = "20px";
    fehler.forEach((fe) => {
      const li = el("li", "karte karte--achtung");
      const tag = el("p", "etikett", "Tag " + fe.tag);
      tag.style.color = "var(--achtung)";
      const frage = el("p", null, fe.frage);
      frage.style.fontWeight = "700";
      frage.style.marginTop = "4px";
      li.append(tag, frage);
      const erk = einfachText(fe.erklaerung);
      erk.style.marginTop = "8px";
      li.appendChild(erk);
      const knoepfe = el("div", "stapel--eng");
      knoepfe.style.marginTop = "16px";
      const nochmal = el("button", "knopf knopf--zweit", "Tag " + fe.tag + " noch einmal");
      nochmal.type = "button";
      nochmal.addEventListener("click", () => lektionSeite(fe.tag));
      const kann = el("button", "knopf knopf--zweit", "Das kann ich jetzt");
      kann.type = "button";
      kann.style.minHeight = "56px";
      kann.style.color = "var(--sicher)";
      kann.style.boxShadow = "inset 0 0 0 2px var(--sicher)";
      kann.addEventListener("click", () => { fehlerGeuebt(fe.regel); fehlerSeite(); });
      knoepfe.append(nochmal, kann);
      li.appendChild(knoepfe);
      liste.appendChild(li);
    });
    inhalt.appendChild(liste);
  }

  wrap.appendChild(inhalt);
  zeige(wrap);
}
