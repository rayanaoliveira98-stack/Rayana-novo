/* --------------------------------------------------------------------
 * Fortschritt: lebt nur auf diesem Gerät. Kein Login, kein Server.
 * ------------------------------------------------------------------ */
const KEY = "fahrschul-coach.v1";
const LEER = { abgeschlosseneTage: [], fehler: [], streak: 0, letzterLernTag: null };

function ladeFortschritt() {
  try {
    const roh = localStorage.getItem(KEY);
    return roh ? Object.assign({}, LEER, JSON.parse(roh)) : Object.assign({}, LEER);
  } catch (e) {
    return Object.assign({}, LEER);
  }
}

function speichere(f) {
  try { localStorage.setItem(KEY, JSON.stringify(f)); } catch (e) { /* Speicher blockiert */ }
}

function merkeFehler(eintrag) {
  const f = ladeFortschritt();
  f.fehler = [eintrag].concat(f.fehler.filter((x) => x.regel !== eintrag.regel));
  speichere(f);
}

function fehlerGeuebt(regel) {
  const f = ladeFortschritt();
  f.fehler = f.fehler.filter((x) => x.regel !== regel);
  speichere(f);
}

function tagAbschliessen(tag) {
  const f = ladeFortschritt();
  if (f.abgeschlosseneTage.indexOf(tag) === -1) {
    f.abgeschlosseneTage.push(tag);
    f.abgeschlosseneTage.sort((a, b) => a - b);
  }
  const heute = new Date().toISOString().slice(0, 10);
  if (f.letzterLernTag !== heute) {
    const gestern = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    f.streak = f.letzterLernTag === gestern ? f.streak + 1 : 1;
    f.letzterLernTag = heute;
  }
  speichere(f);
}

function naechsterTag(f) {
  const max = f.abgeschlosseneTage.length ? Math.max.apply(null, f.abgeschlosseneTage) : 0;
  return max + 1;
}

/* --------------------------------------------------------------------
 * Vorlesen: de-AT bevorzugt, sonst de-DE, sonst irgendein Deutsch.
 * ------------------------------------------------------------------ */
let stimmen = [];
const spracheDa = typeof speechSynthesis !== "undefined";

function ladeStimmen() {
  if (!spracheDa) return;
  stimmen = speechSynthesis.getVoices();
}
if (spracheDa) {
  ladeStimmen();
  speechSynthesis.onvoiceschanged = ladeStimmen;
}

function besteStimme() {
  if (!stimmen.length) ladeStimmen();
  const norm = (v) => v.lang.replace("_", "-");
  return stimmen.find((v) => norm(v).indexOf("de-AT") === 0)
    || stimmen.find((v) => norm(v).indexOf("de-DE") === 0)
    || stimmen.find((v) => norm(v).indexOf("de") === 0)
    || null;
}

let aktiverKnopf = null;

function stopp() {
  if (spracheDa) speechSynthesis.cancel();
  if (aktiverKnopf) {
    aktiverKnopf.setAttribute("aria-pressed", "false");
    aktiverKnopf = null;
  }
}

function hoerknopf(text, breit) {
  if (!spracheDa) return null;
  const b = el("button", "hoerknopf" + (breit ? " hoerknopf--breit" : ""));
  b.type = "button";
  b.setAttribute("aria-pressed", "false");
  b.setAttribute("aria-label", "Text anhören");
  b.innerHTML = '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">'
    + '<path d="M4 9v6h4l5 4V5L8 9H4z" fill="currentColor"/>'
    + '<path d="M16 9a4 4 0 010 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
  if (breit) b.appendChild(document.createTextNode("Anhören"));
  b.addEventListener("click", () => {
    const lief = b.getAttribute("aria-pressed") === "true";
    stopp();
    if (lief) return;
    const u = new SpeechSynthesisUtterance(text);
    const s = besteStimme();
    if (s) u.voice = s;
    u.lang = s ? s.lang : "de-AT";
    u.rate = 0.92; // langsamer: die Zielgruppe hört zum Verstehen
    u.onend = () => { b.setAttribute("aria-pressed", "false"); aktiverKnopf = null; };
    b.setAttribute("aria-pressed", "true");
    aktiverKnopf = b;
    speechSynthesis.speak(u);
  });
  return b;
}

/* --------------------------------------------------------------------
 * Kleine DOM-Helfer
 * ------------------------------------------------------------------ */
function el(tag, klasse, text) {
  const n = document.createElement(tag);
  if (klasse) n.className = klasse;
  if (text != null) n.textContent = text;
  return n;
}

function szene(svg) {
  const d = el("div", "szene");
  d.setAttribute("role", "img");
  d.innerHTML = svg;
  return d;
}

/* Text in einfacher Sprache: Fallen-Wörter werden anklickbar. */
function einfachText(text, vokabeln, mitAudio) {
  const wrap = el("div");
  const zeile = el("div", "zeile");
  const p = el("p", "text");

  const eigene = (vokabeln || []).map((v) => v.de.toLowerCase());
  const alle = (vokabeln || []).concat(
    GLOSSAR.filter((g) => eigene.indexOf(g.de.toLowerCase()) === -1)
  );

  const box = el("div");

  if (alle.length) {
    const sortiert = alle.slice().sort((a, b) => b.de.length - a.de.length);
    const muster = new RegExp(
      "(?:^|(?<![\\p{L}]))(" +
        sortiert.map((v) => v.de.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|") +
        ")(?![\\p{L}])",
      "giu"
    );
    let rest = 0;
    let treffer;
    while ((treffer = muster.exec(text)) !== null) {
      const start = treffer.index + treffer[0].length - treffer[1].length;
      if (start > rest) p.appendChild(document.createTextNode(text.slice(rest, start)));
      const wort = treffer[1];
      const vok = sortiert.find((v) => v.de.toLowerCase() === wort.toLowerCase());
      const b = el("button", "vokabel", wort);
      b.type = "button";
      b.addEventListener("click", () => zeigeVokabel(box, vok));
      p.appendChild(b);
      rest = start + wort.length;
    }
    if (rest < text.length) p.appendChild(document.createTextNode(text.slice(rest)));
  } else {
    p.textContent = text;
  }

  zeile.appendChild(p);
  if (mitAudio !== false) {
    const h = hoerknopf(text);
    if (h) zeile.appendChild(h);
  }
  wrap.appendChild(zeile);
  wrap.appendChild(box);
  return wrap;
}

function zeigeVokabel(box, vok) {
  if (box.dataset.offen === vok.de) { box.innerHTML = ""; box.dataset.offen = ""; return; }
  box.innerHTML = "";
  box.dataset.offen = vok.de;
  const k = el("div", "vokabelbox");
  const kopf = el("div", "zeile");
  const links = el("div");
  links.style.flex = "1";
  const lab = el("p", "etikett", "Wort erklärt");
  lab.style.color = "var(--info)";
  const wort = el("p", null, vok.de);
  wort.style.fontWeight = "700";
  wort.style.fontSize = "1.1rem";
  wort.style.marginTop = "4px";
  const erk = el("p", null, vok.einfach);
  erk.style.marginTop = "4px";
  links.append(lab, wort, erk);
  kopf.appendChild(links);
  const h = hoerknopf(vok.de + ". " + vok.einfach);
  if (h) kopf.appendChild(h);
  k.appendChild(kopf);
  const zu = el("button", "knopf knopf--zweit", "Verstanden");
  zu.type = "button";
  zu.style.marginTop = "12px";
  zu.style.minHeight = "56px";
  zu.addEventListener("click", () => { box.innerHTML = ""; box.dataset.offen = ""; });
  k.appendChild(zu);
  box.appendChild(k);
}

/* Die amtliche Formulierung — zum Wiedererkennen, nicht zum Verstecken. */
function amtlichBox(text) {
  const d = el("div", "amtlich");
  const kopf = el("button", "amtlich__kopf");
  kopf.type = "button";
  kopf.setAttribute("aria-expanded", "false");
  const links = el("span");
  links.style.display = "flex";
  links.style.alignItems = "center";
  links.style.gap = "8px";
  links.innerHTML = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">'
    + '<rect x="5" y="3" width="14" height="18" rx="2" stroke="currentColor" stroke-width="2"/>'
    + '<path d="M8 8h8M8 12h8M8 16h5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
  links.appendChild(document.createTextNode("So steht es in der Prüfung"));
  const pfeil = el("span", null, "▾");
  pfeil.setAttribute("aria-hidden", "true");
  pfeil.style.fontSize = "1.2rem";
  kopf.append(links, pfeil);

  const inhalt = el("div", "amtlich__inhalt");
  inhalt.hidden = true;
  const p = el("p", null, "„" + text + "“");
  inhalt.appendChild(p);
  const h = hoerknopf(text, true);
  if (h) { h.style.marginTop = "12px"; inhalt.appendChild(h); }

  kopf.addEventListener("click", () => {
    const offen = inhalt.hidden;
    inhalt.hidden = !offen;
    kopf.setAttribute("aria-expanded", String(offen));
    pfeil.textContent = offen ? "▴" : "▾";
  });

  d.append(kopf, inhalt);
  return d;
}

/* Poldi, der Guide — taucht bei Erklärungen auf, nie über der Szene. */
function guide(groesse) {
  const g = groesse || 56;
  const s = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  s.setAttribute("width", g);
  s.setAttribute("height", g);
  s.setAttribute("viewBox", "0 0 64 64");
  s.setAttribute("aria-hidden", "true");
  s.style.flex = "0 0 auto";
  s.innerHTML = '<circle cx="32" cy="34" r="24" fill="#f2a900"/>'
    + '<path d="M12 30a20 20 0 0140 0v-6a20 20 0 00-40 0z" fill="#0f4f99"/>'
    + '<rect x="10" y="28" width="44" height="6" rx="3" fill="#0f4f99"/>'
    + '<circle cx="24" cy="38" r="3.4" fill="#14161a"/><circle cx="40" cy="38" r="3.4" fill="#14161a"/>'
    + '<path d="M25 47q7 5 14 0" stroke="#14161a" stroke-width="2.6" stroke-linecap="round" fill="none"/>'
    + '<circle cx="32" cy="22" r="3" fill="#fff"/>';
  return s;
}
