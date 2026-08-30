/* LumiLínguas — Montador da sessão diária (~11 min), adaptativo.
 * Módulo puro (sem DOM): recebe perfil + registros SRS e devolve a fila de
 * passos que o app executa. Testável em Node.
 *
 * Ciclo diário implementado:
 * 1 boas-vindas → 2 dificuldades de ontem → 3 revisão SRS → 4 conceitos novos
 * → 5 compreensão → 6 repetição oral → 7 jogo → 8 desafio misto
 * → 9 celebração → 10 dicas para os responsáveis.
 *
 * Crianças de 3-4 anos: um bloco por idioma (nunca misturar).
 * Crianças de 5-7 anos: desafio final pode comparar idiomas.
 */
(function (g) {
  'use strict';

  var SRS = (typeof require === 'function' && typeof window === 'undefined')
    ? require('./srs.js') : g.LUMI_SRS;
  var CUR = (typeof require === 'function' && typeof window === 'undefined')
    ? require('../content/curriculum.js') : g.LUMI_CURRICULUM;

  /* Atividades de compreensão disponíveis, alternadas por dia para nunca
   * repetir exatamente a mesma sequência em dias consecutivos. */
  var GAME_POOL = ['find_in_scene', 'missing_image', 'drag_to_target', 'sound_match', 'follow_instruction'];

  function rotate(arr, n) {
    var a = arr.slice();
    for (var i = 0; i < (n % a.length + a.length) % a.length; i++) a.push(a.shift());
    return a;
  }

  function recentHardRatio(records, now) {
    var seen = 0, hard = 0, twoDays = 2 * SRS.DAY;
    Object.keys(records).forEach(function (k) {
      var r = records[k];
      if (r.lastSeenAt !== null && now - r.lastSeenAt <= twoDays) {
        seen++;
        if (r.lastResult === 'hard') hard++;
      }
    });
    return seen ? hard / seen : 0;
  }

  /* Escolhe conceitos novos respeitando o dia da jornada e os interesses. */
  function pickNewConcepts(records, journeyDay, budget, interests) {
    var pool = CUR.upToDay(journeyDay).filter(function (c) {
      var r = records[c.id];
      return !r || r.state === 'new';
    });
    // Interesses primeiro, mantendo a ordem do currículo dentro de cada grupo.
    pool.sort(function (a, b) {
      var ai = interests && interests.indexOf(a.theme) >= 0 ? 0 : 1;
      var bi = interests && interests.indexOf(b.theme) >= 0 ? 0 : 1;
      if (ai !== bi) return ai - bi;
      return a.day - b.day;
    });
    return pool.slice(0, budget).map(function (c) { return c.id; });
  }

  /* Monta o bloco de um idioma. */
  function langBlock(lang, records, opts) {
    var steps = [];
    var now = opts.now;

    // 2. Dificuldades do dia anterior (abrem a sessão, no máx. 2)
    var struggles = SRS.struggleList(records, now).slice(0, 2);
    struggles.forEach(function (id) {
      var simplify = SRS.needsSimplification(records[id]);
      steps.push({ type: 'review', lang: lang, concept: id, mode: simplify ? 'listen' : 'auto', why: 'struggle' });
    });

    // 3. Revisão programada (SRS), no máx. 4 por idioma
    var due = SRS.dueList(records, now)
      .filter(function (id) { return struggles.indexOf(id) < 0; })
      .slice(0, opts.shortened ? 2 : 4);
    due.forEach(function (id) {
      steps.push({ type: 'review', lang: lang, concept: id, mode: 'auto', why: 'due' });
    });

    // 4-6. Conceitos novos: apresentar → compreender → repetir em voz alta
    var news = pickNewConcepts(records, opts.journeyDay, opts.newBudget, opts.interests);
    news.forEach(function (id, i) {
      steps.push({ type: 'present', lang: lang, concept: id });
      steps.push({ type: 'listen_tap', lang: lang, concept: id });
      steps.push({ type: 'repeat', lang: lang, concept: id });
      // Reapresentação discreta de um erro 3-5 atividades depois:
      // o app injeta em tempo de execução (ver app.js/adaptive).
      if (i === 0 && struggles.length) {
        steps.push({ type: 'review', lang: lang, concept: struggles[0], mode: 'listen', why: 'gentle_recheck' });
      }
    });

    // 7. Jogo rápido em contexto (com conteúdo já visto)
    var seen = Object.keys(records).filter(function (k) { return records[k].state !== 'new'; });
    var playable = seen.concat(news);
    if (playable.length >= 3 && !opts.shortened) {
      var game = rotate(GAME_POOL, opts.journeyDay + opts.langIndex)[0];
      steps.push({ type: 'game', lang: lang, game: game, concepts: playable.slice(-6) });
    }
    return { steps: steps, newConcepts: news };
  }

  /* Monta a sessão completa. profile: {age, langs, journeyDay, interests,
   * sessionMinutes}; recordsByLang: {en: {...}, de: {...}} */
  function buildSession(profile, recordsByLang, now, opts) {
    opts = opts || {};
    var steps = [{ type: 'welcome' }];
    var allNew = {};
    var langs = rotate(profile.langs.slice(), profile.journeyDay); // idioma inicial alterna por dia

    var hardRatio = 0;
    langs.forEach(function (l) { hardRatio = Math.max(hardRatio, recentHardRatio(recordsByLang[l] || {}, now)); });

    var budgetTotal = SRS.newConceptBudget(profile.age, langs.length, hardRatio);
    var perLang = Math.max(1, Math.floor(budgetTotal / langs.length));

    langs.forEach(function (l, idx) {
      var block = langBlock(l, recordsByLang[l] || {}, {
        now: now,
        journeyDay: profile.journeyDay,
        newBudget: perLang,
        interests: profile.interests,
        shortened: !!opts.shortened,
        langIndex: idx
      });
      if (langs.length > 1) steps.push({ type: 'lang_intro', lang: l });
      steps.push.apply(steps, block.steps);
      allNew[l] = block.newConcepts;
    });

    // 8. Desafio misturando conteúdos dominados
    if (!opts.shortened) {
      if (profile.age >= 5 && langs.length > 1) {
        steps.push({ type: 'compare', langs: langs.slice(0, 2) }); // mesmo conceito em 2 idiomas
      } else {
        var l0 = langs[0];
        var mastered = Object.keys(recordsByLang[l0] || {}).filter(function (k) {
          var s = (recordsByLang[l0][k] || {}).state;
          return s === 'spoken' || s === 'mastered' || s === 'recognized';
        });
        if (mastered.length >= 3) steps.push({ type: 'game', lang: l0, game: 'missing_image', concepts: mastered.slice(-4), why: 'mixed_challenge' });
      }
    }

    // 9. Celebração
    steps.push({ type: 'celebrate' });

    return { steps: steps, newConcepts: allNew, langOrder: langs, budgetTotal: budgetTotal };
  }

  /* 10. Dicas práticas do dia para os responsáveis (4, em português). */
  var TIP_TEMPLATES = [
    { ctx: 'No café da manhã', make: function (w, ln) { return 'pergunte onde está “' + w + '” em ' + ln + '.'; } },
    { ctx: 'Ao sair de casa', make: function (w, ln) { return 'diga “' + w + '” em ' + ln + ' apontando para o objeto.'; } },
    { ctx: 'No carro ou no caminho', make: function (w, ln) { return 'repitam juntos “' + w + '” em ' + ln + '.'; } },
    { ctx: 'Antes de dormir', make: function (w, ln) { return 'peça que a criança mostre ou fale “' + w + '” em ' + ln + '.'; } }
  ];

  function parentTips(newConcepts, packs, langNames, journeyDay) {
    var tips = [];
    var pairs = [];
    Object.keys(newConcepts).forEach(function (lang) {
      (newConcepts[lang] || []).forEach(function (id) {
        var pack = packs[lang];
        if (pack && pack.concepts[id]) pairs.push({ lang: lang, word: pack.concepts[id].word });
      });
    });
    if (!pairs.length) return tips;
    for (var i = 0; i < 4; i++) {
      var t = TIP_TEMPLATES[i % TIP_TEMPLATES.length];
      var p = pairs[(journeyDay + i) % pairs.length];
      tips.push(t.ctx + ', ' + t.make(p.word, langNames[p.lang] || p.lang));
    }
    return tips;
  }

  /* Adaptação em tempo real: encurtar a sessão se a criança demonstra
   * cansaço (erros seguidos ou respostas muito lentas). */
  function shouldShorten(stats) {
    return (stats.consecutiveHard >= 3) || (stats.avgResponseMs > 15000 && stats.answered >= 3);
  }

  var api = {
    buildSession: buildSession,
    parentTips: parentTips,
    shouldShorten: shouldShorten,
    GAME_POOL: GAME_POOL,
    _rotate: rotate
  };

  g.LUMI_SESSION = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
