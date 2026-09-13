/* Caption Studio — Oberflaeche und Abspielsteuerung. */
(function () {
  'use strict';
  const KIT = window.CAPTION_KIT;
  const E = window.CaptionEngine;
  const $ = (id) => document.getElementById(id);

  const DEMO =
    'Dein Recruiting funktioniert nicht, weil du die falsche Zielgruppe ansprichst. ' +
    'Die besten Bewerber suchen keinen Job — sie scrollen. ' +
    'Genau da entscheidet dein Content, ob sie bleiben. ' +
    'Wir bauen dir einen Funnel aus Meta Ads, der planbar Leads liefert. ' +
    'Kein Zufall, keine Agentur-Versprechen — nur Ergebnisse.';

  const el = {
    script: $('script'), brand: $('brand'), pace: $('pace'), audience: $('audience'),
    transition: $('transition'), track: $('track'), stage: $('stage'), checks: $('checks'),
    safezone: $('safezone')
  };

  let comp = null;
  let timer = null;
  let playing = false;

  /* ---- Auswahlfelder fuellen ------------------------------------------- */
  const fill = (sel, entries, active) => {
    sel.innerHTML = '';
    for (const [value, label] of entries) {
      const o = document.createElement('option');
      o.value = value; o.textContent = label;
      if (value === active) o.selected = true;
      sel.appendChild(o);
    }
  };

  fill(el.brand, Object.entries(KIT.brands.brands).map(([k, v]) => [k, v.label]), KIT.brands.active);
  fill(el.pace, Object.entries(KIT.captions.paceProfiles).filter(([k]) => k !== 'note').map(([k, v]) => [k, v.label]), KIT.captions.activePaceProfile);
  const audiences = KIT.captions.genderProfiles[KIT.captions.activeGenderProfile].audiences;
  fill(el.audience, Object.entries(audiences).map(([k, v]) => [k, v.label]), Object.keys(audiences)[0]);
  fill(el.transition, Object.entries(KIT.motion.captionTransitions.variants).map(([k, v]) => [k, v.label.split(' — ')[0]]), KIT.motion.captionTransitions.default);

  /* ---- Marke anwenden --------------------------------------------------- */
  function applyBrand() {
    const b = KIT.brands.brands[el.brand.value];
    const r = document.documentElement.style;
    r.setProperty('--paper', b.color.paper);
    r.setProperty('--ink', b.color.ink);
    r.setProperty('--ink-muted', b.color.inkMuted);
    r.setProperty('--accent', b.color.accent);
    r.setProperty('--signal', b.color.signal);
    r.setProperty('--shadow', b.color.shadow);
    r.setProperty('--font-caption', b.typography.caption.family);
  }

  /* ---- Safe Area zeichnen ----------------------------------------------- */
  function drawSafe() {
    const sa = KIT.captions.safeArea.formats['9:16'];
    const [top, bottom] = el.safezone.querySelectorAll('i');
    top.style.top = '0'; top.style.height = sa.top * 100 + '%';
    bottom.style.bottom = '0'; bottom.style.height = sa.bottom * 100 + '%';
  }

  /* ---- Aufbereiten ------------------------------------------------------ */
  function rebuild() {
    stop();
    const pace = KIT.captions.paceProfiles[el.pace.value];
    comp = E.compose(el.script.value, { pace: el.pace.value, audience: el.audience.value });

    el.track.style.top = pace.verticalPosition * 100 + '%';
    el.track.style.fontSize = (pace.fontSizeVh / 100) * el.stage.clientHeight + 'px';

    $('s-blocks').textContent = comp.blocks.length;
    $('s-time').textContent = (comp.totalMs / 1000).toFixed(1).replace('.', ',') + ' s';
    $('s-icons').textContent = comp.blocks.filter((b) => b.icon).length;

    renderChecks();
    showBlock(0, false);
  }

  function renderChecks() {
    const found = E.check(el.script.value);
    el.checks.innerHTML = '';
    if (!found.length) {
      el.checks.innerHTML = '<div class="check ok"><b>Sauber.</b> Keine Grammatik- oder Typografiefehler gefunden.</div>';
      return;
    }
    for (const f of found.slice(0, 8)) {
      const d = document.createElement('div');
      d.className = 'check';
      d.innerHTML = '<b>' + f.hit.replace(/</g, '&lt;') + '</b> — ' + f.msg;
      el.checks.appendChild(d);
    }
  }

  /* ---- Darstellung eines Blocks ----------------------------------------- */
  // Lange Bloecke wuerden bei fester Groesse dreizeilig umbrechen und die
  // Bildmitte sprengen. Die Groesse skaliert deshalb mit der Zeichenzahl,
  // damit jeder Block hoechstens zweizeilig bleibt.
  function fitScale(block) {
    const chars = block.words.reduce((a, w) => a + w.text.length, 0) + block.words.length;
    if (chars <= 14) return 1;
    if (chars <= 19) return 0.88;
    if (chars <= 25) return 0.78;
    return 0.68;
  }

  function buildBlockEl(block) {
    const wrap = document.createElement('div');
    wrap.className = 'block';
    wrap.style.fontSize = (fitScale(block) * 100).toFixed(1) + '%';
    const inner = document.createElement('span');
    inner.className = 'inner';
    for (const w of block.words) {
      const s = document.createElement('span');
      s.className = 'w' + (w.emphasis ? ' em' : '');
      s.textContent = w.text;
      inner.appendChild(s);
    }
    wrap.appendChild(inner);

    if (block.icon) {
      const ic = document.createElement('div');
      ic.className = 'icon';
      ic.style.transform = 'translateX(-50%)';
      ic.innerHTML =
        '<span class="inner"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
        'stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">' + block.icon.body + '</svg></span>';
      wrap.appendChild(ic);
      wrap._icon = ic;
    }
    return wrap;
  }

  const KF = {
    push_up: {
      in: [{ opacity: 0, transform: 'translateY(20px) scale(.96)', filter: 'blur(5px)' },
           { opacity: 1, transform: 'translateY(0) scale(1)', filter: 'blur(0)' }],
      out: [{ opacity: 1, transform: 'translateY(0)', filter: 'blur(0)' },
            { opacity: 0, transform: 'translateY(-22px)', filter: 'blur(5px)' }]
    },
    scale_through: {
      in: [{ opacity: 0, transform: 'scale(.9)', filter: 'blur(6px)' },
           { opacity: 1, transform: 'scale(1)', filter: 'blur(0)' }],
      out: [{ opacity: 1, transform: 'scale(1)', filter: 'blur(0)' },
            { opacity: 0, transform: 'scale(1.08)', filter: 'blur(6px)' }]
    },
    word_swap: {
      in: [{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'translateY(0)' }],
      out: [{ opacity: 1, transform: 'translateY(0)' }, { opacity: 0, transform: 'translateY(-8px)' }]
    }
  };

  const ICON_IN = {
    pop_soft: [{ opacity: 0, transform: 'translateX(-50%) scale(.72) translateY(14px)', filter: 'blur(6px)' },
               { opacity: 1, transform: 'translateX(-50%) scale(1) translateY(0)', filter: 'blur(0)' }],
    slam:     [{ opacity: 0, transform: 'translateX(-50%) scale(1.45)', filter: 'blur(10px)' },
               { opacity: 1, transform: 'translateX(-50%) scale(1)', filter: 'blur(0)' }],
    slide_in: [{ opacity: 0, transform: 'translateX(-50%) translateX(-26px) scale(.94)', filter: 'blur(4px)' },
               { opacity: 1, transform: 'translateX(-50%) translateX(0) scale(1)', filter: 'blur(0)' }],
    rise:     [{ opacity: 0, transform: 'translateX(-50%) translateY(34px) scale(.88)' },
               { opacity: 1, transform: 'translateX(-50%) translateY(0) scale(1)' }],
    draw_on:  [{ opacity: .2, transform: 'translateX(-50%) scale(.92)' },
               { opacity: 1, transform: 'translateX(-50%) scale(1)' }]
  };

  function showBlock(i, animate) {
    const t = KIT.motion.captionTransitions.variants[el.transition.value];
    const old = el.track.querySelector('.block');

    if (old) {
      if (animate) {
        // Ausgang laeuft weiter, waehrend der neue Block schon einsetzt — dadurch
        // entsteht nie ein leerer Frame. Bei sehr kurzen Bloecken wird der Ausgang
        // gestaucht, damit nie drei Bloecke uebereinander liegen.
        const room = Math.max(90, (comp.blocks[i - 1] ? comp.blocks[i - 1].duration : 400) - 40);
        old.style.zIndex = '0';
        old.animate(KF[el.transition.value].out, {
          duration: Math.min(t.outgoing.duration, room),
          easing: KIT.motion.easings.exit.css, fill: 'forwards'
        }).onfinish = () => old.remove();
      } else old.remove();
    }

    const block = comp.blocks[i];
    if (!block) return;
    const node = buildBlockEl(block);
    node.style.zIndex = '1';
    el.track.appendChild(node);

    if (animate) {
      node.animate(KF[el.transition.value].in, {
        duration: t.incoming.duration, easing: KIT.motion.easings.brandOut.css, fill: 'backwards'
      });
      if (node._icon) {
        const preset = block.icon.preset;
        const spec = KIT.motion.presets[preset];
        const anim = node._icon.animate(ICON_IN[preset] || ICON_IN.pop_soft, {
          duration: spec.in.duration, easing: KIT.motion.easings[spec.in.easing].css, fill: 'backwards'
        });
        if (preset === 'draw_on') {
          const svg = node._icon.querySelector('svg');
          for (const p of svg.querySelectorAll('path, circle, rect, ellipse')) {
            const len = p.getTotalLength ? 1 : 1;
            p.style.strokeDasharray = '1'; p.style.pathLength = '1';
            p.setAttribute('pathLength', '1');
            p.animate([{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], {
              duration: spec.in.duration, easing: KIT.motion.easings.brandInOut.css, fill: 'forwards'
            });
          }
        }
        void anim;
      }
    }
  }

  /* ---- Abspielen -------------------------------------------------------- */
  function play() {
    if (!comp || !comp.blocks.length) return;
    playing = true;
    $('play').textContent = 'Pause';
    let i = 0;
    const t = KIT.motion.captionTransitions.variants[el.transition.value];
    showBlock(0, true);

    const step = () => {
      i++;
      if (i >= comp.blocks.length) { stop(); showBlock(0, false); return; }
      showBlock(i, true);
      // Ueberlappung: der naechste Block startet overlapMs frueher.
      timer = setTimeout(step, Math.max(120, comp.blocks[i].duration - t.overlapMs));
    };
    timer = setTimeout(step, Math.max(120, comp.blocks[0].duration - t.overlapMs));
  }

  function stop() {
    playing = false;
    $('play').textContent = 'Abspielen';
    clearTimeout(timer);
  }

  function download(name, text, type) {
    const url = URL.createObjectURL(new Blob([text], { type }));
    const a = document.createElement('a');
    a.href = url; a.download = name; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  /* ---- Ereignisse ------------------------------------------------------- */
  el.script.addEventListener('input', rebuild);
  el.pace.addEventListener('change', rebuild);
  el.audience.addEventListener('change', rebuild);
  el.transition.addEventListener('change', rebuild);
  el.brand.addEventListener('change', () => { applyBrand(); rebuild(); });
  $('play').addEventListener('click', () => (playing ? (stop(), showBlock(0, false)) : play()));
  $('safe').addEventListener('click', () => el.safezone.classList.toggle('on'));
  $('record').addEventListener('click', () => { document.body.classList.add('record'); setTimeout(() => { rebuild(); play(); }, 60); });
  $('exit-record').addEventListener('click', () => { document.body.classList.remove('record'); setTimeout(rebuild, 60); });
  $('ex-srt').addEventListener('click', () => comp && download('untertitel.srt', E.toSRT(comp), 'text/plain'));
  $('ex-json').addEventListener('click', () => comp && download('untertitel.json', E.toJSON(comp), 'application/json'));
  window.addEventListener('resize', () => { if (!playing) rebuild(); });

  el.script.value = DEMO;
  applyBrand();
  drawSafe();
  rebuild();
})();
