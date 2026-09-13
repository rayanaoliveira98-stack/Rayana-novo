/* Caption Engine — Skript rein, animierbare Bloecke raus.
   Liest ausschliesslich window.CAPTION_KIT. Keine Abhaengigkeiten. */
(function (global) {
  'use strict';

  const KIT = global.CAPTION_KIT;

  /* Woerter, an denen ein Untertitelblock nie enden darf. Deutsche Artikel,
     Praepositionen und Konjunktionen binden nach rechts — endet der Block auf
     einem davon, liest der Zuschauer eine unvollstaendige Einheit und stockt. */
  const BINDET_NACH_RECHTS = new Set(
    ('der die das den dem des ein eine einen einem einer eines kein keine keinen keinem keiner ' +
     'mein meine meinen deinem dein deine deinen sein seine ihren ihre ihr unser euer ' +
     'in im an am auf mit für fuer von vom zu zum zur bei beim aus nach über ueber unter durch ' +
     'ohne um vor seit gegen wegen trotz während waehrend statt pro je ' +
     'und oder aber dass weil wenn damit sondern denn als wie ob obwohl bevor nachdem ' +
     'nicht nur auch noch schon mehr sehr ganz so zu').split(/\s+/)
  );

  const norm = (s) => s.toLowerCase().replace(/[^\wäöüß:\-]/g, '');

  /* ---- Keyword-Index -------------------------------------------------- */
  function buildIndex() {
    const exact = new Map();   // exakte und gebeugte Einzelwoerter
    const phrases = [];        // mehrwortige Treffer, laengste zuerst
    const stems = [];          // Stammformen fuer Komposita

    for (const kw of KIT.keywords.keywords) {
      for (const m of kw.match) {
        const n = norm(m);
        if (!n) continue;
        if (/\s/.test(m)) {
          phrases.push({ words: m.toLowerCase().split(/\s+/).map(norm), kw });
          continue;
        }
        exact.set(n, kw);
        if (KIT.keywords.matching.inflectionSuffixes) {
          for (const suf of KIT.keywords.matching.inflectionSuffixes) {
            if (suf && !exact.has(n + suf)) exact.set(n + suf, kw);
          }
        }
        if (KIT.keywords.matching.compoundMatch && n.length >= 5) stems.push({ stem: n, kw });
      }
    }
    phrases.sort((a, b) => b.words.length - a.words.length);
    stems.sort((a, b) => b.stem.length - a.stem.length);
    return { exact, phrases, stems };
  }

  const INDEX = buildIndex();

  function lookup(word) {
    const n = norm(word);
    if (!n) return null;
    if (INDEX.exact.has(n)) return INDEX.exact.get(n);
    // Kompositum: "Werbebudget" traegt "budget", "Fachkraeftemangel" traegt "fachkraefte"
    for (const { stem, kw } of INDEX.stems) {
      if (n.length > stem.length && n.includes(stem)) return kw;
    }
    return null;
  }

  /* ---- Tokenisieren und Bloecke schneiden ------------------------------ */
  function tokenize(text) {
    return text
      .replace(/\s+/g, ' ')
      .trim()
      .split(' ')
      .filter(Boolean)
      .map((raw) => ({ raw, clean: raw.replace(/[.,;:!?„“"»«]/g, ''), hardBreak: /[.!?:]$/.test(raw) }));
  }

  function cutBlocks(tokens, pace) {
    const { min, max } = pace.wordsPerBlock;
    const blocks = [];
    let i = 0;

    while (i < tokens.length) {
      let len = Math.min(max, tokens.length - i);

      // Satzende innerhalb des Fensters bricht den Block ab.
      for (let j = 0; j < len - 1; j++) {
        if (tokens[i + j].hardBreak) { len = j + 1; break; }
      }

      const endsBadly = (n) => {
        if (n < 1) return false;
        const last = tokens[i + n - 1];
        if (last.hardBreak) return false;
        if (BINDET_NACH_RECHTS.has(norm(last.clean))) return true;
        // Keyword mit Icon nie als letztes Wort — sonst ist das Icon weg,
        // bevor es gelesen wurde.
        return !!lookup(last.clean) && n > min;
      };

      let guard = 0;
      while (endsBadly(len) && guard++ < max) {
        if (len > min) len--;
        else if (i + len < tokens.length) len++;
        else break;
      }

      blocks.push(tokens.slice(i, i + len));
      i += len;
    }
    return blocks;
  }

  /* ---- Dauer schaetzen -------------------------------------------------- */
  // Ohne Audio wird die Blockdauer aus der Zeichenzahl abgeleitet.
  // ~45 ms pro Zeichen entspricht ruhigem deutschen Sprechtempo.
  function estimate(block, pace) {
    const chars = block.reduce((a, t) => a + t.raw.length, 0) + block.length;
    const raw = 190 + chars * 45;
    return Math.round(Math.max(pace.minBlockMs, Math.min(pace.maxBlockMs, raw)));
  }

  /* ---- Aufbereiten ------------------------------------------------------ */
  function compose(text, opts) {
    const caps = KIT.captions;
    const pace = caps.paceProfiles[opts.pace];
    const audience = caps.genderProfiles[caps.activeGenderProfile].audiences[opts.audience];
    const variant = audience ? audience.variant : 'neutral';
    const density = pace.density;

    const blocks = cutBlocks(tokenize(text), pace);

    let t = 0;
    let lastIconAt = -Infinity;
    const iconTimes = [];
    const out = [];

    for (const words of blocks) {
      const dur = estimate(words, pace);
      const start = t;
      t += dur;

      // Keyword-Kandidaten im Block, stärkste priority zuerst.
      const hits = [];
      words.forEach((tok, idx) => {
        const kw = lookup(tok.clean);
        if (kw) hits.push({ idx, kw });
      });
      hits.sort((a, b) => b.kw.priority - a.kw.priority || a.idx - b.idx);

      let icon = null;
      if (hits.length) {
        const cand = hits[0];
        const inHook = start < density.hookWindowMs;
        const recent = iconTimes.filter((x) => start - x < 10000).length;
        const hookUsed = iconTimes.filter((x) => x < density.hookWindowMs).length;

        const allowed =
          start - lastIconAt >= density.minGapBetweenIconsMs &&
          recent < density.maxIconsPer10s &&
          (!inHook || hookUsed < density.hookWindowMaxIcons);

        if (allowed) {
          icon = {
            id: cand.kw.icon,
            body: KIT.icons.icons[cand.kw.icon].body,
            preset: cand.kw.motion || KIT.motion.categoryPresets[cand.kw.category],
            keyword: cand.kw.id,
            category: cand.kw.category
          };
          lastIconAt = start;
          iconTimes.push(start);
        }
      }

      out.push({
        start,
        end: t,
        duration: dur,
        // Dichteregel unterdrueckt nur das Icon — die Betonung bleibt immer.
        words: words.map((tok, idx) => {
          const hit = hits.find((h) => h.idx === idx);
          let text = tok.raw;
          if (hit && hit.kw.displayVariants) {
            const wanted = hit.kw.displayVariants[variant];
            // Nur ersetzen, wenn das gesprochene Wort der Grundform entspricht.
            if (norm(tok.clean) === norm(hit.kw.displayVariants.neutral)) text = wanted;
          }
          return {
            text,
            keyword: hit ? hit.kw.id : null,
            emphasis: !!hit,
            hasIcon: !!(icon && hit && hit.kw.id === icon.keyword)
          };
        }),
        icon
      });
    }

    return { blocks: out, totalMs: t, pace: opts.pace, audience: opts.audience, variant };
  }

  /* ---- Grammatik- und Typografie-Pruefung ------------------------------- */
  const CHECKS = [
    { id: 'eszett', re: /\b(Strasse|gross(e|er|es)?|heisst|Fussball|Masse(n)?stab|weiss)\b/g, msg: 'ß statt ss — in Österreich gilt die ß-Schreibung.', fix: (w) => w.replace(/ss/, 'ß') },
    { id: 'umlaut', re: /\b(ueber\w*|fuer|koenn\w+|muess\w+|waehrend|moeglich\w*|Loesung\w*|Fachkraeft\w*|Qualitaet\w*|Autoritaet\w*|persoenlich\w*|taeglich\w*|naechst\w*|Gespraech\w*|erklaer\w+|Verkaeuf\w*|Kaeufer\w*|Beduerfnis\w*|Grundsaetz\w*|zunaechst|spaeter|groesser\w*|haeufig\w*)\b/gi, msg: 'Umschriebener Umlaut — ä, ö, ü ausschreiben.' },
    { id: 'email', re: /\bE-?mail\b|\bEmail\b|\beMail\b/g, msg: 'Korrekt ist „E-Mail" — Bindestrich, großes M.' },
    { id: 'deppenleerzeichen', re: /\b(Social Media Strategie|Meta Ads Kampagne|Employer Branding Strategie|Content Plan|Bewerber Mangel|Marketing Strategie)\b/g, msg: 'Durchkoppeln: alle Teile mit Bindestrich verbinden.' },
    { id: 'zahlwort', re: /\b(null|eins|zwei|drei|vier|fünf|sechs|sieben|acht|neun|zehn|hundert|tausend)(tausend|hundert)?\s+(Euro|Prozent|Bewerber|Leads|Kunden)\b/gi, msg: 'Im Untertitel Ziffern statt ausgeschriebener Zahlen — schneller lesbar.' },
    { id: 'dezimal', re: /\b\d+,\d{3}\b|\b\d\.\d\s*(Prozent|%)/g, msg: 'Punkt als Tausender-, Komma als Dezimaltrennzeichen.' },
    { id: 'anfuehrung', re: /"[^"]{1,40}"/g, msg: 'Deutsche Anführungszeichen verwenden: „so“.' },
    { id: 'bindestrich', re: /\s-\s/g, msg: 'Halbgeviertstrich – statt Bindestrich - im Fließtext.' },
    { id: 'sie_form', re: /\b(Sie|Ihnen|Ihre|Ihrem|Ihren)\b/g, msg: 'Sie-Form gefunden — Standard ist die Du-Form. Nicht mischen.' },
    { id: 'click', re: /\bClicks?\b/g, msg: 'Im Deutschen „Klick" mit K.' },
    { id: 'communities', re: /\bCommunities\b/g, msg: 'Deutscher Plural laut Duden: „Communitys".' },
    { id: 'followers', re: /\bFollowers\b/g, msg: 'Plural ohne -s: „Follower".' },
    { id: 'contents', re: /\bContents\b/g, msg: '„Content" hat im Deutschen keinen Plural.' }
  ];

  function check(text) {
    const found = [];
    for (const c of CHECKS) {
      c.re.lastIndex = 0;
      let m;
      while ((m = c.re.exec(text))) {
        if (c.skip && c.skip.test(m[0])) continue;
        found.push({ id: c.id, hit: m[0], msg: c.msg });
        if (found.filter((f) => f.id === c.id).length >= 3) break;
      }
    }
    return found;
  }

  /* ---- Export ----------------------------------------------------------- */
  const pad = (n, w = 2) => String(n).padStart(w, '0');
  const srtTime = (ms) =>
    `${pad(Math.floor(ms / 3600000))}:${pad(Math.floor(ms / 60000) % 60)}:${pad(Math.floor(ms / 1000) % 60)},${pad(ms % 1000, 3)}`;

  function toSRT(comp) {
    return comp.blocks
      .map((b, i) => `${i + 1}\n${srtTime(b.start)} --> ${srtTime(b.end)}\n${b.words.map((w) => w.text).join(' ')}\n`)
      .join('\n');
  }

  function toJSON(comp) {
    return JSON.stringify(
      {
        generator: 'caption-kit',
        library: KIT.keywords.version,
        pace: comp.pace,
        audience: comp.audience,
        variant: comp.variant,
        totalMs: comp.totalMs,
        transition: KIT.captions.paceProfiles[comp.pace].transition,
        blocks: comp.blocks.map((b) => ({
          start: b.start,
          end: b.end,
          text: b.words.map((w) => w.text).join(' '),
          emphasis: b.words.filter((w) => w.emphasis).map((w) => w.text),
          icon: b.icon ? { id: b.icon.id, keyword: b.icon.keyword, preset: b.icon.preset } : null
        }))
      },
      null,
      2
    );
  }

  global.CaptionEngine = { compose, check, toSRT, toJSON, lookup, KIT };
})(window);
