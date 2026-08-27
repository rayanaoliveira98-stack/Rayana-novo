/* LumiLínguas — Shell do aplicativo: telas, perfis, sessão diária.
 * A área infantil funciona sem leitura: imagens grandes, áudio e toque.
 */
(function (g) {
  'use strict';

  var CUR = g.LUMI_CURRICULUM, LANGS = g.LUMI_LANGS, SRS = g.LUMI_SRS,
      SESSION = g.LUMI_SESSION, AUDIO = g.LUMI_AUDIO, STORE = g.LUMI_STORE,
      ACT = g.LUMI_ACT;

  var store = STORE.createStore();
  var data = store.load();

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
    $('home-char-wrap').style.background = L.colorSoft;
    $('home-day-count').textContent = p.journeyDay;
    // adesivos ganhos aparecem como decoração
    $('home-stickers-preview').textContent = (p.stickers || []).slice(-4).map(function (s) { return s.emoji; }).join(' ');
    show('screen-home');
    AUDIO.jingle(L.jingle);
  }

  /* ---------- Mapa da jornada (60 dias) ---------- */

  function renderMap() {
    var p = profile();
    var wrap = $('map-path');
    wrap.innerHTML = '';
    var weekColors = ['#2BB673', '#4A6CF7', '#E2574C', '#F4B400', '#8E6CF0', '#00A3A3', '#E58B2F', '#E2648F', '#3AAE5C'];
    for (var day = 1; day <= 60; day++) {
      var wk = CUR.weekForDay(day);
      var i = CUR.weeks.indexOf(wk);
      var dot = document.createElement('div');
      dot.className = 'map-dot' + (day < p.journeyDay ? ' done' : day === p.journeyDay ? ' current' : '');
      dot.style.setProperty('--wk-color', weekColors[i]);
      if (day < p.journeyDay) dot.textContent = '⭐';
      else if (day === p.journeyDay) dot.textContent = LANGS.get(p.langs[0]).character.emoji;
      else dot.textContent = '';
      wrap.appendChild(dot);
      if (CUR.weeks[i].days[1] === day && day < 60) {
        var badge = document.createElement('div');
        badge.className = 'map-week-badge';
        badge.textContent = ['🏠', '👨‍👩‍👧', '🍎', '🐶', '👕', '🚗', '😊', '💬', '🏆'][i + 1] || '🏆';
        wrap.appendChild(badge);
      }
    }
    show('screen-map');
  }

  /* ---------- Adesivos ---------- */

  function renderStickers() {
    var p = profile();
    var wrap = $('sticker-grid');
    wrap.innerHTML = '';
    (p.stickers || []).forEach(function (s) {
      var d = document.createElement('div');
      d.className = 'sticker';
      d.textContent = s.emoji;
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
      results: []
    };
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
    var kept = steps.slice(0, fromIdx);
    var newSeen = 0;
    for (var i = fromIdx; i < steps.length; i++) {
      var s = steps[i];
      if (s.type === 'game' || s.type === 'compare') continue;
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
        else r.stats.consecutiveHard = 0;
        applyResult(step, res);
        r.results.push({ step: step, result: res.result, ms: dt });
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
    if (res.result) {
      SRS.record(rec, res.kind === 'speak' ? 'speak' : 'listen',
        res.result === 'hard' ? 'hard' : (res.result === 'helped' ? 'helped' : 'ok'), now);
    }
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
    var firstNew = null;
    Object.keys(r.plan.newConcepts).some(function (l) {
      if (r.plan.newConcepts[l].length) { firstNew = r.plan.newConcepts[l][0]; return true; }
      return false;
    });
    var emoji = firstNew ? CUR.get(firstNew).emoji : '⭐';
    p.stickers = p.stickers || [];
    if (!p.stickers.some(function (s) { return s.day === p.journeyDay && s.emoji === emoji; })) {
      p.stickers.push({ day: p.journeyDay, emoji: emoji });
    }

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

    if ('serviceWorker' in navigator && location.protocol !== 'file:') {
      navigator.serviceWorker.register('sw.js').catch(function () {});
    }

    $('btn-play').onclick = startSession;
    $('btn-map').onclick = renderMap;
    $('btn-stickers').onclick = renderStickers;
    $('btn-map-back').onclick = goHome;
    $('btn-stickers-back').onclick = goHome;
    $('btn-home-profiles').onclick = renderSplash;
    $('btn-session-exit').onclick = function () {
      AUDIO.stop();
      // exigir gesto de adulto evitaria saídas acidentais; aqui: toque duplo
      running = null;
      goHome();
    };
    $('btn-splash-setup').onclick = function () { g.LUMI_PARENT.openGate('onboarding'); };
    $('btn-home-parent').onclick = function () { g.LUMI_PARENT.openGate('dashboard'); };

    if (!Object.keys(data.profiles).length) renderSplash();
    else renderSplash();
  }

  g.LUMI_APP = {
    init: init,
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
