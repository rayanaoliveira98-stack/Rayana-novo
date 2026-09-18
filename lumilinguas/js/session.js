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
  var LADDER = (typeof require === 'function' && typeof window === 'undefined')
    ? require('./ladder.js') : g.LUMI_LADDER;
  var I18N = (typeof require === 'function' && typeof window === 'undefined')
    ? require('./i18n.js') : g.LUMI_I18N;

  /* Atividades de compreensão disponíveis, alternadas por dia para nunca
   * repetir exatamente a mesma sequência em dias consecutivos. */
  var GAME_POOL = ['find_in_scene', 'missing_image', 'drag_to_target', 'sound_match',
                   'follow_instruction', 'memory_pairs', 'imitate'];

  /* Momento especial do dia, rodando em ciclo para nenhum dia repetir o
   * anterior: história, música/rima e caça ao objeto em casa. */
  var SPECIAL_POOL = ['story', 'song', 'home_hunt'];

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
    var profile = opts.profile;

    /* O degrau de hoje para este conceito — é isto que substitui o sorteio:
     * a atividade sai do que a criança já consegue fazer com esta palavra. */
    function atividadeDe(id) {
      var rec = records[id];
      if (!rec) return 'listen_tap';
      return LADDER.activityFor(rec, profile, now);
    }

    // 2. Dificuldades do dia anterior (abrem a sessão, no máx. 2)
    var struggles = SRS.struggleList(records, now).slice(0, 2);
    struggles.forEach(function (id) {
      var simplify = SRS.needsSimplification(records[id]);
      steps.push({
        type: 'review', lang: lang, concept: id,
        mode: simplify ? 'listen' : 'auto',
        activity: simplify ? 'listen_tap' : atividadeDe(id),
        why: 'struggle'
      });
    });

    /* Quantas palavras ainda estão "em obras": já foram apresentadas mas a
     * criança ainda não as produz. É o trabalho em aberto dela. */
    var emAberto = Object.keys(records).filter(function (id) {
      var r = records[id];
      if (!r || r.state === 'new') return false;
      LADDER.initPhase(r);
      return r.phase < LADDER.IDX.cloze;
    }).length;

    /* Limite de obras abertas: enquanto houver muita coisa a meio caminho,
     * o app para de apresentar novidade e usa o tempo para levar o que já
     * existe até a boca da criança. Sem isso, a fila cresce mais rápido do
     * que a criança consolida e nada chega à produção — retenção real vale
     * mais que número de palavras vistas. */
    var LIMITE_EM_ABERTO = profile.age <= 4 ? 6 : 10;
    var espacoParaNovos = emAberto >= LIMITE_EM_ABERTO ? 0 : opts.newBudget;

    // 3. Revisão programada (SRS). Sem conceitos novos, sobra tempo de sessão
    // e mais palavras antigas voltam — é assim que a escada anda.
    var maxRevisoes = opts.shortened ? 2 : (espacoParaNovos ? 4 : 8);
    var due = SRS.dueList(records, now)
      .filter(function (id) { return struggles.indexOf(id) < 0; })
      .slice(0, maxRevisoes);
    due.forEach(function (id) {
      steps.push({
        type: 'review', lang: lang, concept: id, mode: 'auto',
        activity: atividadeDe(id), why: 'due'
      });
    });

    // 4-6. Conceitos novos: apresentar → compreender → repetir em voz alta
    var news = pickNewConcepts(records, opts.journeyDay, espacoParaNovos, opts.interests);
    news.forEach(function (id, i) {
      steps.push({ type: 'present', lang: lang, concept: id });
      steps.push({ type: 'listen_tap', lang: lang, concept: id });
      steps.push({ type: 'repeat', lang: lang, concept: id });
      // Reapresentação discreta de um erro 3-5 atividades depois:
      // o app injeta em tempo de execução (ver app.js/adaptive).
      if (i === 0 && struggles.length) {
        steps.push({
          type: 'review', lang: lang, concept: struggles[0],
          mode: 'listen', activity: 'listen_tap', why: 'gentle_recheck'
        });
      }
    });

    /* Fim de jornada: quando quase tudo já está espaçado em 14-30 dias,
     * sobram poucas revisões vencidas e a sessão encolheria. Em vez de
     * encurtar o dia, traz de volta o que a criança já fala, para USAR —
     * manter em circulação é o que segura a retenção de longo prazo. */
    var comConceito = steps.filter(function (x) { return x.concept; }).length;
    var MINIMO_POR_SESSAO = opts.shortened ? 3 : 6;
    if (comConceito < MINIMO_POR_SESSAO) {
      var jaUsados = {};
      steps.forEach(function (x) { if (x.concept) jaUsados[x.concept] = true; });
      Object.keys(records)
        .filter(function (id) {
          var r = records[id];
          if (!r || r.state === 'new' || jaUsados[id]) return false;
          LADDER.initPhase(r);
          return r.phase >= LADDER.IDX.echo;   // já sai da boca dela
        })
        .sort(function (a, b) {                 // o menos visto primeiro
          return (records[a].lastSeenAt || 0) - (records[b].lastSeenAt || 0);
        })
        .slice(0, MINIMO_POR_SESSAO - comConceito)
        .forEach(function (id) {
          steps.push({
            type: 'review', lang: lang, concept: id, mode: 'auto',
            activity: atividadeDe(id), why: 'keep_alive'
          });
        });
    }

    // 7. Jogo rápido em contexto (com conteúdo já visto)
    var seen = Object.keys(records).filter(function (k) { return records[k].state !== 'new'; });
    var playable = seen.concat(news);
    if (playable.length >= 3 && !opts.shortened) {
      var game = rotate(GAME_POOL, opts.journeyDay + opts.langIndex)[0];
      steps.push({
        type: 'game', lang: lang, game: game,
        concepts: playable.slice(-6), journeyDay: opts.journeyDay
      });
    }
    return { steps: steps, newConcepts: news, seen: playable };
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

    var seenAll = [];
    langs.forEach(function (l, idx) {
      var block = langBlock(l, recordsByLang[l] || {}, {
        now: now,
        profile: profile,
        journeyDay: profile.journeyDay,
        newBudget: perLang,
        interests: profile.interests,
        shortened: !!opts.shortened,
        langIndex: idx
      });
      if (langs.length > 1) steps.push({ type: 'lang_intro', lang: l });
      steps.push.apply(steps, block.steps);
      allNew[l] = block.newConcepts;
      if (idx === 0) seenAll = block.seen || [];
    });

    // 7b. Momento especial do dia (história / música / caça em casa).
    // Sempre no primeiro idioma do dia, para não misturar línguas na narrativa.
    if (!opts.shortened && seenAll.length >= 2) {
      var special = rotate(SPECIAL_POOL, profile.journeyDay)[0];
      steps.push({
        type: special, lang: langs[0],
        concept: seenAll[seenAll.length - 1],
        concepts: seenAll.slice(-4),
        journeyDay: profile.journeyDay
      });
    }

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
  /* Quatro momentos do dia, na língua do responsável. */
  var TIP_KEYS = ['tip.breakfast', 'tip.leaving', 'tip.car', 'tip.bedtime'];

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
      var p = pairs[(journeyDay + i) % pairs.length];
      tips.push(I18N.t(TIP_KEYS[i % TIP_KEYS.length], {
        word: p.word,
        lang: langNames[p.lang] || p.lang
      }));
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
    SPECIAL_POOL: SPECIAL_POOL,
    _rotate: rotate
  };

  g.LUMI_SESSION = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
