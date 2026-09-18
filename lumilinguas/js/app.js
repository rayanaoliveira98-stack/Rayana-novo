/* LumiLínguas — Shell do aplicativo: telas, perfis, sessão diária.
 * A área infantil funciona sem leitura: imagens grandes, áudio e toque.
 */
(function (g) {
  'use strict';

  var CUR = g.LUMI_CURRICULUM, LANGS = g.LUMI_LANGS, SRS = g.LUMI_SRS,
      SESSION = g.LUMI_SESSION, AUDIO = g.LUMI_AUDIO, STORE = g.LUMI_STORE,
      ACT = g.LUMI_ACT, FX = g.LUMI_FX, LADDER = g.LUMI_LADDER, T = g.LUMI_I18N;

  var store = STORE.createStore();
  var data = store.load();

  /* Idioma da interface: o que o responsável escolheu ou, na primeira vez,
   * o idioma do aparelho. Guardado junto dos dados, não numa chave solta. */
  T.setLang(data.parent.uiLang || T.detect());

  /* Aplica o idioma às partes escritas em HTML (o resto é gerado em JS). */
  function applyUILang() {
    document.documentElement.lang = T.getLang();
    var set = function (sel, txt) {
      var e = document.querySelector(sel);
      if (e) e.textContent = txt;
    };
    set('.tagline', T.t('splash.tagline'));
    set('#splash-empty p', T.t('splash.setupFirst'));
    set('#btn-splash-setup', T.t('splash.parents'));
    set('.parent-title', T.t('panel.title'));
    [['btn-home-profiles', 'data.profiles'], ['btn-home-parent', 'gate.title'],
     ['btn-map', 'common.day'], ['btn-session-exit', 'common.back']
    ].forEach(function (pair) {
      var b = document.getElementById(pair[0]);
      if (b) b.setAttribute('aria-label', T.t(pair[1]));
    });
  }

  function save() { store.save(data); }

  function $(id) { return document.getElementById(id); }

  function show(screenId) {
    document.querySelectorAll('.screen').forEach(function (s) { s.classList.remove('active'); });
    $(screenId).classList.add('active');
  }

  function profile() { return data.profiles[data.activeProfile] || null; }

  function ttsTag(lang) {
    var p = profile();
    if (p && p.langVariants && p.langVariants[lang]) return p.langVariants[lang];
    var L = LANGS.get(lang);
    return L ? L.tts[0] : lang;
  }

  function todayKey() {
    var d = new Date();
    return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
  }

  /* ---------- Splash / seleção de perfil ---------- */

  function renderSplash() {
    var wrap = $('profile-list');
    wrap.innerHTML = '';
    var ids = Object.keys(data.profiles);
    if (!ids.length) {
      $('splash-empty').style.display = 'block';
      wrap.style.display = 'none';
    } else {
      $('splash-empty').style.display = 'none';
      wrap.style.display = 'flex';
      ids.forEach(function (id) {
        var p = data.profiles[id];
        var b = document.createElement('button');
        b.className = 'profile-bubble';
        b.innerHTML = '<span class="pb-emoji">' + (p.avatar || '🧒') + '</span><span class="pb-name">' + p.name + '</span>';
        b.onclick = function () {
          data.activeProfile = id; save();
          goHome();
        };
        wrap.appendChild(b);
      });
    }
    show('screen-splash');
  }

  /* ---------- Casa da criança ---------- */

  function goHome() {
    var p = profile();
    if (!p) return renderSplash();
    var L = LANGS.get(p.langs[0]);
    $('home-char').textContent = L.character.emoji;
    $('home-char-wrap').style.background =
      'radial-gradient(circle at 50% 36%, #fff 0%, ' + L.colorSoft + ' 100%)';
    // a cena inteira assume a cor do idioma do dia
    var casa = $('screen-home');
    casa.style.setProperty('--lang-color', L.color);
    casa.style.setProperty('--lang-soft', L.colorSoft);
    casa.style.setProperty('--lang-deep', L.colorDeep || L.color);
    $('home-day-count').textContent = p.journeyDay;
    // adesivos ganhos aparecem como decoração
    $('home-stickers-preview').textContent = (p.stickers || []).slice(-4).map(function (s) { return s.emoji; }).join(' ');
    renderHomeSky(p);
    show('screen-home');
    AUDIO.jingle(L.jingle);
  }

  /* O céu da casa flutua com o que a criança já colecionou — o progresso
   * vira paisagem, sem número nenhum na tela. */
  function renderHomeSky(p) {
    var sky = $('home-sky');
    sky.innerHTML = '';
    var pool = (p.stickers || []).map(function (s) { return s.emoji; });
    if (!pool.length) pool = ['⭐', '☁️', '✨'];
    for (var i = 0; i < 7; i++) {
      var s = document.createElement('span');
      s.className = 'sky-item';
      s.textContent = pool[i % pool.length];
      s.style.left = (6 + (i * 13) % 88) + '%';
      s.style.top = (8 + (i * 29) % 70) + '%';
      s.style.animationDelay = (i * 0.9) + 's';
      s.style.animationDuration = (7 + (i % 4) * 2.5) + 's';
      sky.appendChild(s);
    }
  }

  /* Tocar no personagem é conversa, não navegação: ele pula e cumprimenta
   * no idioma do dia. Convida ao toque sem exigir nada. */
  function greetCharacter() {
    var p = profile();
    if (!p) return;
    var lang = p.langs[0];
    var L = LANGS.get(lang);
    var wrap = $('home-char-wrap');
    wrap.classList.remove('greet');
    void wrap.offsetWidth;
    wrap.classList.add('greet');
    FX.burstFrom(wrap, [L.color]);
    FX.buzz(14);
    AUDIO.jingle(L.jingle);
    var hello = { pt: 'Oi!', en: 'Hello!', de: 'Hallo!', es: '¡Hola!', fr: 'Bonjour !',
                  it: 'Ciao!', tr: 'Merhaba!', zh: '你好！', ja: 'こんにちは！' };
    AUDIO.speak(hello[lang] || hello.pt, ttsTag(lang));
  }

  /* ---------- Mapa da jornada (60 dias) ---------- */

  function renderMap() {
    var p = profile();
    var wrap = $('map-path');
    wrap.innerHTML = '';
    var weekColors = ['#23A96B', '#3550C4', '#E2574C', '#E09600', '#7C5CF0',
                      '#00878A', '#D4761F', '#D4548A', '#2A8546'];
    var marcos = ['🏠', '👨‍👩‍👧', '🍎', '🐶', '👕', '🚗', '😊', '💬', '🏆'];

    /* Sete colunas: cada linha é exatamente uma semana temática, e o marco
     * da fase fecha a linha. O caminho alterna o sentido a cada semana, como
     * numa trilha de tabuleiro — e nunca sobra buraco na grade. */
    var COLUNAS = 7;
    var linha = 1;

    CUR.weeks.forEach(function (wk, i) {
      var cor = weekColors[i];
      var daVolta = i % 2 === 1;   // semanas pares correm ao contrário
      var dias = [];
      for (var d = wk.days[0]; d <= wk.days[1]; d++) dias.push(d);

      dias.forEach(function (day, k) {
        var col = daVolta ? (dias.length - 1 - k) : k;
        var dot = document.createElement('div');
        dot.className = 'map-dot' +
          (day < p.journeyDay ? ' done' : day === p.journeyDay ? ' current' : ' future');
        dot.style.setProperty('--wk-color', cor);
        dot.style.gridColumn = String(col + 1);
        dot.style.gridRow = String(linha);
        dot.style.setProperty('--curve',
          (Math.sin((col / (COLUNAS - 1)) * Math.PI) * -6).toFixed(1) + 'px');
        dot.style.setProperty('--in-delay', Math.min((day - 1) * 14, 900) + 'ms');

        if (day < p.journeyDay) dot.textContent = '⭐';
        else if (day === p.journeyDay) dot.textContent = LANGS.get(p.langs[0]).character.emoji;
        else dot.textContent = String(day);
        dot.title = 'Dia ' + day + ' — ' + wk.title;
        wrap.appendChild(dot);
      });
      linha++;

      // marco da fase: atravessa a trilha inteira, com o tema da semana
      var badge = document.createElement('div');
      badge.className = 'map-week-badge' + (p.journeyDay > wk.days[1] ? ' won' : '');
      badge.style.gridRow = String(linha);
      badge.style.setProperty('--wk-color', cor);
      badge.innerHTML = '<span class="mwb-icon">' + (marcos[i] || '🏆') + '</span>' +
                        '<span class="mwb-name">' + wk.title + '</span>';
      wrap.appendChild(badge);
      linha++;
    });

    show('screen-map');
    setTimeout(function () {
      var cur = wrap.querySelector('.map-dot.current');
      if (cur && cur.scrollIntoView) {
        cur.scrollIntoView({ behavior: FX.reduced() ? 'auto' : 'smooth', block: 'center' });
      }
    }, 380);
  }

  /* ---------- Adesivos ---------- */

  function renderStickers() {
    var p = profile();
    var wrap = $('sticker-grid');
    wrap.innerHTML = '';
    (p.stickers || []).forEach(function (s, i) {
      var d = document.createElement('div');
      d.className = 'sticker';
      d.textContent = s.emoji;
      d.style.animationDelay = (i * 45) + 'ms';
      // tocar no adesivo devolve a palavra que ele guarda
      if (s.concept && s.lang && g.LUMI_PACKS[s.lang]) {
        var e = g.LUMI_PACKS[s.lang].concepts[s.concept];
        if (e) {
          d.classList.add('speakable');
          d.onclick = function () {
            FX.burstFrom(d, [LANGS.get(s.lang).color]);
            FX.buzz(12);
            AUDIO.speakConcept(e.word, ttsTag(s.lang), {
              profileId: p.id, lang: s.lang, conceptId: s.concept
            });
          };
        }
      }
      wrap.appendChild(d);
    });
    if (!(p.stickers || []).length) {
      wrap.innerHTML = '<div class="sticker ghost">⭐</div><div class="sticker ghost">🎈</div><div class="sticker ghost">🌟</div>';
    }
    show('screen-stickers');
  }

  /* ---------- Sessão diária ---------- */

  var running = null;

  function startSession() {
    var p = profile();
    if (!p) return;
    var now = Date.now();
    var recordsByLang = store.recordsByLang(data, p.id);
    var plan = SESSION.buildSession(p, recordsByLang, now);

    running = {
      plan: plan,
      idx: 0,
      startedAt: now,
      stats: { consecutiveHard: 0, answered: 0, hard: 0, totalMs: 0, avgResponseMs: 0 },
      shortened: false,
      results: [],
      stars: 0
    };
    $('session-star-count').textContent = '0';
    $('session-progress').style.width = '0%';
    show('screen-session');
    nextStep();
  }

  function envForActivities() {
    var p = profile();
    return {
      profile: p,
      packs: g.LUMI_PACKS,
      ttsTag: ttsTag,
      textSupport: p.age >= 5 && !!p.textSupport
    };
  }

  function trimForFatigue(steps, fromIdx) {
    // Cansaço detectado: remove jogos/desafios restantes e novos conceitos
    // extras, mantendo só revisões leves e a celebração.
    var EXTRAS = ['game', 'compare', 'story', 'song', 'home_hunt'];
    var kept = steps.slice(0, fromIdx);
    var newSeen = 0;
    for (var i = fromIdx; i < steps.length; i++) {
      var s = steps[i];
      if (EXTRAS.indexOf(s.type) >= 0) continue;
      if (s.type === 'present') { newSeen++; if (newSeen > 1) { // pula o trio present/listen/repeat
          while (i + 1 < steps.length && (steps[i + 1].type === 'listen_tap' || steps[i + 1].type === 'repeat')) i++;
          continue; } }
      kept.push(s);
    }
    if (kept[kept.length - 1].type !== 'celebrate') kept.push({ type: 'celebrate' });
    return kept;
  }

  function nextStep() {
    var r = running;
    if (!r) return;
    if (r.idx >= r.plan.steps.length) return finishSession();

    var step = r.plan.steps[r.idx];
    var t0 = Date.now();
    ACT.run(step, envForActivities(), $('session-stage')).then(function (res) {
      var dt = Date.now() - t0;
      if (res && res.kind) {
        r.stats.answered++;
        r.stats.totalMs += dt;
        r.stats.avgResponseMs = r.stats.totalMs / r.stats.answered;
        if (res.result === 'hard') { r.stats.hard++; r.stats.consecutiveHard++; }
        else if (res.result !== 'silent') r.stats.consecutiveHard = 0;
        applyResult(step, res);
        r.results.push({ step: step, result: res.result, ms: dt });

        // A estrela que voou na tela chega aqui: o contador cresce junto.
        // Tentar já vale estrela — inclusive quando a criança preferiu ouvir
        // em vez de falar. Participação nunca fica sem reconhecimento.
        if (res.result === 'ok' || res.result === 'helped' || res.result === 'silent') {
          r.stars++;
          var badge = $('session-stars');
          $('session-star-count').textContent = r.stars;
          badge.classList.remove('pop');
          void badge.offsetWidth;
          badge.classList.add('pop');
        }
      }
      // barra de progresso suave (sem números que gerem ansiedade)
      $('session-progress').style.width = Math.round(100 * (r.idx + 1) / r.plan.steps.length) + '%';

      if (!r.shortened && SESSION.shouldShorten(r.stats)) {
        r.shortened = true;
        r.plan.steps = trimForFatigue(r.plan.steps, r.idx + 1);
      }
      r.idx++;
      nextStep();
    });
  }

  function applyResult(step, res) {
    var p = profile();
    if (!step.lang || !step.concept) return;
    var recs = store.records(data, p.id, step.lang);
    var now = Date.now();
    if (!recs[step.concept]) recs[step.concept] = SRS.freshRecord(now);
    var rec = recs[step.concept];
    if (rec.state === 'new') SRS.introduce(rec, now);
    if (!res.result) { save(); return; }

    if (res.result === 'silent') {
      // A criança não falou. Isso NÃO é erro: é o período silencioso dela
      // ainda em curso. Não marca dificuldade nem adianta revisão — só
      // registra a passagem e deixa a escada devolver o degrau corporal.
      rec.lastSeenAt = now;
      LADDER.record(rec, 'silent', p, now);
      save();
      return;
    }

    SRS.record(rec, res.kind === 'speak' ? 'speak' : 'listen',
      res.result === 'hard' ? 'hard' : (res.result === 'helped' ? 'helped' : 'ok'), now);

    // A escada anda junto: é ela que decide o que esta palavra vai pedir
    // da criança da próxima vez — e até onde o espaçamento pode se abrir.
    LADDER.record(rec, res.result, p, now);
    SRS.capInterval(rec, LADDER.maxIntervalIndex(rec), now);
    save();
  }

  function finishSession() {
    var r = running; running = null;
    var p = profile();
    var langNames = {};
    p.langs.forEach(function (l) { langNames[l] = LANGS.get(l).name.toLowerCase(); });
    var tips = SESSION.parentTips(r.plan.newConcepts, g.LUMI_PACKS, langNames, p.journeyDay);

    store.logSession(data, p.id, {
      date: new Date().toISOString(),
      day: p.journeyDay,
      durationMs: Date.now() - r.startedAt,
      answered: r.stats.answered,
      hard: r.stats.hard,
      shortened: r.shortened,
      newConcepts: r.plan.newConcepts,
      tips: tips
    });

    // adesivo do dia: o primeiro conceito novo aprendido (ou estrela)
    var firstNew = null, firstLang = null;
    Object.keys(r.plan.newConcepts).some(function (l) {
      if (r.plan.newConcepts[l].length) {
        firstNew = r.plan.newConcepts[l][0]; firstLang = l; return true;
      }
      return false;
    });
    var emoji = firstNew ? CUR.get(firstNew).emoji : '⭐';
    p.stickers = p.stickers || [];
    if (!p.stickers.some(function (s) { return s.day === p.journeyDay && s.emoji === emoji; })) {
      p.stickers.push({ day: p.journeyDay, emoji: emoji, concept: firstNew, lang: firstLang });
    }
    FX.mascotHide();

    // avança a jornada uma vez por dia de calendário
    var tk = todayKey();
    if (p.lastSessionDate !== tk) {
      p.lastSessionDate = tk;
      if (p.journeyDay < 60) p.journeyDay++;
    }
    save();
    goHome();
  }

  /* ---------- inicialização ---------- */

  function init() {
    // packs personalizados importados pelo painel administrativo
    try {
      var custom = localStorage.getItem('lumilinguas.customPacks');
      if (custom) {
        var packs = JSON.parse(custom);
        Object.keys(packs).forEach(function (code) {
          var base = g.LUMI_PACKS[code] || { lang: code, version: 0, concepts: {} };
          Object.keys(packs[code].concepts || {}).forEach(function (cid) {
            base.concepts[cid] = packs[code].concepts[cid];
          });
          g.LUMI_PACKS[code] = base;
        });
      }
    } catch (e) {}

    if ('serviceWorker' in navigator && location.protocol !== 'file:' && !g.LUMI_SINGLE_FILE) {
      navigator.serviceWorker.register('sw.js').catch(function () {});
    }

    // acessibilidade: com movimento reduzido, os efeitos opcionais saem de cena
    if (FX.reduced()) document.body.classList.add('reduce-motion');

    $('btn-play').onclick = startSession;
    $('home-char-wrap').onclick = greetCharacter;
    $('btn-map').onclick = renderMap;
    $('btn-stickers').onclick = renderStickers;
    $('btn-map-back').onclick = goHome;
    $('btn-stickers-back').onclick = goHome;
    $('btn-home-profiles').onclick = renderSplash;
    $('btn-session-exit').onclick = function () {
      AUDIO.stop();
      FX.mascotHide();
      // exigir gesto de adulto evitaria saídas acidentais; aqui: toque duplo
      running = null;
      goHome();
    };
    $('btn-splash-setup').onclick = function () { g.LUMI_PARENT.openGate('onboarding'); };
    $('btn-home-parent').onclick = function () { g.LUMI_PARENT.openGate('dashboard'); };

    applyUILang();
    renderSplash();
  }

  g.LUMI_APP = {
    init: init,
    applyUILang: applyUILang,
    data: function () { return data; },
    store: store,
    save: save,
    profile: profile,
    renderSplash: renderSplash,
    goHome: goHome,
    ttsTag: ttsTag
  };

  document.addEventListener('DOMContentLoaded', init);
})(window);
