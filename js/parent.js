/* LumiLínguas — Área dos responsáveis: portão parental, onboarding com
 * consentimento, painel de progresso, gravação de voz da família,
 * configurações, exportação e exclusão de dados.
 */
(function (g) {
  'use strict';

  var LANGS = g.LUMI_LANGS, CUR = g.LUMI_CURRICULUM, SRS = g.LUMI_SRS,
      GATE = g.LUMI_GATE, AUDIO = g.LUMI_AUDIO, LADDER = g.LUMI_LADDER,
      T = g.LUMI_I18N;

  function t(k, v) { return T.t(k, v); }

  function APP() { return g.LUMI_APP; }
  function $(id) { return document.getElementById(id); }
  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html !== undefined) e.innerHTML = html;
    return e;
  }
  function show(id) {
    document.querySelectorAll('.screen').forEach(function (s) { s.classList.remove('active'); });
    $(id).classList.add('active');
  }

  function stateLabel(state) { return t('state.' + state); }

  /* ---------- Portão parental ---------- */

  function openGate(target) {
    var data = APP().data();
    var modal = $('gate-modal');
    var body = $('gate-body');
    modal.classList.add('open');
    body.innerHTML = '';

    function done() {
      modal.classList.remove('open');
      if (target === 'onboarding') startOnboarding();
      else renderDashboard();
    }

    if (data.parent.pin) {
      body.appendChild(el('p', 'gate-title', t('gate.title')));
      body.appendChild(el('p', '', t('gate.enterPin')));
      var input = el('input', 'gate-input');
      input.type = 'password'; input.inputMode = 'numeric'; input.maxLength = 6;
      body.appendChild(input);
      var msg = el('p', 'gate-msg', '');
      body.appendChild(msg);
      var ok = el('button', 'btn-primary', t('common.enter'));
      ok.onclick = function () {
        if (GATE.verifyPin(data.parent.pin, input.value)) done();
        else { msg.textContent = t('gate.wrongPin'); input.value = ''; }
      };
      body.appendChild(ok);

      /* Esqueceu o PIN?
       *
       * Sem isto, um responsável que esquece o número fica trancado fora do
       * progresso da própria criança — e a única saída seria apagar os dados.
       * A recuperação cai no mesmo desafio de adulto que protege o app antes
       * de existir PIN: o objetivo aqui nunca foi resistir a um adulto, e sim
       * impedir que a criança entre sozinha. Uma conta de multiplicação dá
       * conta disso; os dados seguem apenas neste aparelho. */
      var esqueci = el('button', 'gate-forgot', t('gate.forgot'));
      esqueci.onclick = function () { pinRecovery(body, data, done); };
      body.appendChild(esqueci);

      input.focus();
    } else {
      var ch = GATE.mathChallenge();
      body.appendChild(el('p', 'gate-title', t('gate.adult')));
      body.appendChild(el('p', '', ch.question));
      var inp2 = el('input', 'gate-input');
      inp2.type = 'number'; inp2.inputMode = 'numeric';
      body.appendChild(inp2);
      var msg2 = el('p', 'gate-msg', '');
      body.appendChild(msg2);
      var ok2 = el('button', 'btn-primary', t('common.confirm'));
      ok2.onclick = function () {
        if (Number(inp2.value) === ch.answer) done();
        else { msg2.textContent = t('gate.tryAgain'); inp2.value = ''; ch = GATE.mathChallenge(); body.children[1].textContent = ch.question; }
      };
      body.appendChild(ok2);
      inp2.focus();
    }
    $('gate-close').onclick = function () { modal.classList.remove('open'); };
  }

  /* Recuperação do PIN: desafio de adulto e, ao passar, o PIN sai de cena
   * para que um novo seja definido nas Configurações (ou fique sem PIN). */
  function pinRecovery(body, data, done) {
    body.innerHTML = '';
    var ch = GATE.mathChallenge();
    body.appendChild(el('p', 'gate-title', t('gate.adult')));
    body.appendChild(el('p', '', ch.question));
    var inp = el('input', 'gate-input');
    inp.type = 'number'; inp.inputMode = 'numeric';
    body.appendChild(inp);
    var msg = el('p', 'gate-msg', '');
    body.appendChild(msg);

    var ok = el('button', 'btn-primary', t('gate.clearAndEnter'));
    ok.onclick = function () {
      if (Number(inp.value) !== ch.answer) {
        msg.textContent = t('gate.tryAgain');
        inp.value = '';
        ch = GATE.mathChallenge();
        body.children[1].textContent = ch.question;
        return;
      }
      // O PIN sai; o progresso e os perfis ficam intactos.
      data.parent.pin = null;
      APP().save();
      done();
    };
    body.appendChild(ok);
    body.appendChild(el('p', 'ob-note',
t('gate.forgotNote')));
    inp.focus();
  }

  /* Seletor do idioma da INTERFACE (o que o adulto lê) — diferente dos
   * idiomas que a criança vai aprender. Aparece no primeiro passo do
   * onboarding e nas Configurações. */
  function uiLangPicker(wrap, onChange) {
    wrap.appendChild(el('label', '', t('ui.language')));
    var row = el('div', 'chip-row wrap ui-lang-row');
    T.UI_LANGS.forEach(function (L) {
      var c = el('button', 'chip' + (T.getLang() === L.code ? ' sel' : ''),
        L.flag + ' ' + L.name);
      c.onclick = function () {
        T.setLang(L.code);
        var data = APP().data();
        data.parent.uiLang = L.code;
        APP().save();
        APP().applyUILang();
        if (onChange) onChange();
      };
      row.appendChild(c);
    });
    wrap.appendChild(row);
    return row;
  }

  /* ---------- Onboarding ---------- */

  var draft = null;
  var obStep = 0;

  function startOnboarding() {
    draft = {
      name: '', age: 4, avatar: '🧒', homeLang: 'pt', langs: [], langVariants: {},
      levels: {}, reading: 'no', interests: [], sessionMinutes: 11,
      usualTime: '', allowSpeech: false, allowFamilyVoice: false, textSupport: false
    };
    obStep = 0;
    show('screen-onboarding');
    renderObStep();
  }

  var OB_STEPS = [
    stepWelcome, stepChild, stepHomeLang, stepLangs, stepVariants, stepLevels,
    stepReading, stepInterests, stepRoutine, stepConsent, stepPin, stepMiniTest, stepSummary
  ];

  function renderObStep() {
    var wrap = $('onboarding-body');
    wrap.innerHTML = '';
    $('ob-progress').style.width = Math.round(100 * obStep / (OB_STEPS.length - 1)) + '%';
    OB_STEPS[obStep](wrap);
  }

  function navRow(wrap, canNext, onNext) {
    var row = el('div', 'ob-nav');
    if (obStep > 0) {
      var back = el('button', 'btn-ghost', t('common.back'));
      back.onclick = function () { obStep--; renderObStep(); };
      row.appendChild(back);
    }
    var next = el('button', 'btn-primary', obStep === OB_STEPS.length - 1 ? t('common.finish') : t('common.continue'));
    next.disabled = !canNext;
    next.onclick = function () {
      if (onNext && onNext() === false) return;
      obStep++;
      if (obStep >= OB_STEPS.length) finishOnboarding();
      else renderObStep();
    };
    row.appendChild(next);
    wrap.appendChild(row);
    return next;
  }

  function stepWelcome(wrap) {
    // A escolha do idioma vem antes de tudo: quem não lê português precisa
    // entender a primeira tela, não a segunda.
    uiLangPicker(wrap, renderObStep);
    wrap.appendChild(el('h2', '', t('ob.welcome.title')));
    wrap.appendChild(el('p', '', t('ob.welcome.promise')));
    wrap.appendChild(el('p', 'ob-note', t('ob.welcome.honest')));
    navRow(wrap, true);
  }

  function stepChild(wrap) {
    wrap.appendChild(el('h2', '', t('ob.child.title')));
    wrap.appendChild(el('label', '', t('ob.child.name')));
    var name = el('input', 'ob-input'); name.value = draft.name; name.maxLength = 24;
    wrap.appendChild(name);
    wrap.appendChild(el('label', '', t('ob.child.age')));
    var ageRow = el('div', 'chip-row');
    [3, 4, 5, 6, 7].forEach(function (a) {
      var c = el('button', 'chip' + (draft.age === a ? ' sel' : ''), String(a));
      c.onclick = function () { draft.age = a; renderObStep(); };
      ageRow.appendChild(c);
    });
    wrap.appendChild(ageRow);
    wrap.appendChild(el('label', '', t('ob.child.avatar')));
    var avRow = el('div', 'chip-row');
    ['🧒', '👧', '👦', '🧒🏽', '👧🏽', '👦🏿', '🐣', '🦄'].forEach(function (a) {
      var c = el('button', 'chip chip-emoji' + (draft.avatar === a ? ' sel' : ''), a);
      c.onclick = function () { draft.avatar = a; renderObStep(); };
      avRow.appendChild(c);
    });
    wrap.appendChild(avRow);
    var next = navRow(wrap, !!draft.name.trim(), function () { draft.name = name.value.trim(); return !!draft.name; });
    name.oninput = function () { draft.name = name.value.trim(); next.disabled = !draft.name; };
  }

  function stepHomeLang(wrap) {
    wrap.appendChild(el('h2', '', t('ob.home.title')));
    var row = el('div', 'lang-grid');
    LANGS.codes.forEach(function (code) {
      var L = LANGS.get(code);
      var c = el('button', 'lang-card' + (draft.homeLang === code ? ' sel' : ''),
        '<span class="lc-flag">' + L.flag + '</span><span>' + T.langName(code) + '</span>');
      c.onclick = function () { draft.homeLang = code; renderObStep(); };
      row.appendChild(c);
    });
    wrap.appendChild(row);
    navRow(wrap, true);
  }

  function stepLangs(wrap) {
    wrap.appendChild(el('h2', '', t('ob.langs.title')));
    if (draft.age <= 4) {
      wrap.appendChild(el('p', 'ob-note', t('ob.langs.youngNote', { age: draft.age })));
    }
    var row = el('div', 'lang-grid');
    LANGS.codes.forEach(function (code) {
      var L = LANGS.get(code);
      var avail = LANGS.isAvailable(code);
      var selIdx = draft.langs.indexOf(code);
      var c = el('button', 'lang-card' + (selIdx >= 0 ? ' sel' : '') + (avail ? '' : ' disabled'),
        '<span class="lc-flag">' + L.flag + '</span><span>' + T.langName(code) + '</span>' +
        '<span class="lc-char">' + L.character.emoji + ' ' + L.character.name + '</span>' +
        (avail ? '' : '<span class="lc-soon">' + t('ob.langs.soon') + '</span>'));
      c.style.setProperty('--lang-color', L.color);
      if (avail) {
        c.onclick = function () {
          if (selIdx >= 0) draft.langs.splice(selIdx, 1);
          else if (draft.langs.length < 4) draft.langs.push(code);
          renderObStep();
        };
      }
      row.appendChild(c);
    });
    wrap.appendChild(row);
    navRow(wrap, draft.langs.length >= 1);
  }

  function stepVariants(wrap) {
    var withVar = draft.langs.filter(function (c) { return LANGS.get(c).variants; });
    wrap.appendChild(el('h2', '', t('ob.variants.title')));
    if (!withVar.length) {
      wrap.appendChild(el('p', '', t('ob.variants.none')));
    }
    withVar.forEach(function (code) {
      var L = LANGS.get(code);
      wrap.appendChild(el('label', '', T.langName(code)));
      var row = el('div', 'chip-row');
      L.variants.forEach(function (v) {
        var cur = draft.langVariants[code] || L.variants[0].id;
        var c = el('button', 'chip' + (cur === v.id ? ' sel' : ''), t('var.' + v.id));
        c.onclick = function () { draft.langVariants[code] = v.id; renderObStep(); };
        row.appendChild(c);
      });
      wrap.appendChild(row);
    });
    navRow(wrap, true, function () {
      withVar.forEach(function (code) {
        if (!draft.langVariants[code]) draft.langVariants[code] = LANGS.get(code).variants[0].id;
      });
    });
  }

  function stepLevels(wrap) {
    wrap.appendChild(el('h2', '', t('ob.levels.title')));
    draft.langs.forEach(function (code) {
      var L = LANGS.get(code);
      wrap.appendChild(el('label', '', T.langName(code)));
      var row = el('div', 'chip-row');
      [['none', t('ob.levels.never')], ['some', t('ob.levels.some')], ['understands', t('ob.levels.lots')]].forEach(function (opt) {
        var cur = draft.levels[code] || 'none';
        var c = el('button', 'chip' + (cur === opt[0] ? ' sel' : ''), opt[1]);
        c.onclick = function () { draft.levels[code] = opt[0]; renderObStep(); };
        row.appendChild(c);
      });
      wrap.appendChild(row);
    });
    navRow(wrap, true);
  }

  function stepReading(wrap) {
    wrap.appendChild(el('h2', '', t('ob.reading.title')));
    var row = el('div', 'chip-row chip-col');
    [['no', t('ob.reading.no')], ['starting', t('ob.reading.starting')], ['yes', t('ob.reading.yes')]].forEach(function (opt) {
      var c = el('button', 'chip' + (draft.reading === opt[0] ? ' sel' : ''), opt[1]);
      c.onclick = function () { draft.reading = opt[0]; renderObStep(); };
      row.appendChild(c);
    });
    wrap.appendChild(row);
    if (draft.age >= 5 && draft.reading !== 'no') {
      var t = el('button', 'chip toggle' + (draft.textSupport ? ' sel' : ''), (draft.textSupport ? '✓ ' : '') + t('ob.reading.textToggle'));
      t.onclick = function () { draft.textSupport = !draft.textSupport; renderObStep(); };
      wrap.appendChild(t);
      wrap.appendChild(el('p', 'ob-note', t('ob.reading.textNote')));
    }
    navRow(wrap, true);
  }

  function stepInterests(wrap) {
    wrap.appendChild(el('h2', '', t('ob.interests.title')));
    var THEMES = ['animals', 'places', 'home', 'food', 'family', 'clothes', 'actions', 'dialogs']
      .map(function (id) { return [id, t('theme.' + id)]; });
    var row = el('div', 'chip-row wrap');
    THEMES.forEach(function (t) {
      var idx = draft.interests.indexOf(t[0]);
      var c = el('button', 'chip' + (idx >= 0 ? ' sel' : ''), t[1]);
      c.onclick = function () {
        if (idx >= 0) draft.interests.splice(idx, 1); else draft.interests.push(t[0]);
        renderObStep();
      };
      row.appendChild(c);
    });
    wrap.appendChild(row);
    navRow(wrap, true);
  }

  function stepRoutine(wrap) {
    wrap.appendChild(el('h2', '', t('ob.routine.title')));
    wrap.appendChild(el('label', '', t('ob.routine.duration')));
    var row = el('div', 'chip-row');
    [[8, '8 min'], [11, '11 min'], [15, '15 min']].forEach(function (opt) {
      var c = el('button', 'chip' + (draft.sessionMinutes === opt[0] ? ' sel' : ''), opt[1]);
      c.onclick = function () { draft.sessionMinutes = opt[0]; renderObStep(); };
      row.appendChild(c);
    });
    wrap.appendChild(row);
    wrap.appendChild(el('label', '', t('ob.routine.time')));
    var time = el('input', 'ob-input'); time.type = 'time'; time.value = draft.usualTime;
    time.onchange = function () { draft.usualTime = time.value; };
    wrap.appendChild(time);
    wrap.appendChild(el('p', 'ob-note', t('ob.routine.note')));
    navRow(wrap, true);
  }

  function stepConsent(wrap) {
    wrap.appendChild(el('h2', '', t('ob.consent.title')));
    wrap.appendChild(el('p', 'ob-note', t('ob.consent.note')));
    var t1 = el('button', 'chip toggle' + (draft.allowSpeech ? ' sel' : ''), (draft.allowSpeech ? '✓ ' : '') + t('ob.consent.speech'));
    t1.onclick = function () { draft.allowSpeech = !draft.allowSpeech; renderObStep(); };
    wrap.appendChild(t1);
    var t2 = el('button', 'chip toggle' + (draft.allowFamilyVoice ? ' sel' : ''), (draft.allowFamilyVoice ? '✓ ' : '') + t('ob.consent.familyVoice'));
    t2.onclick = function () { draft.allowFamilyVoice = !draft.allowFamilyVoice; renderObStep(); };
    wrap.appendChild(t2);
    var t3 = el('button', 'chip toggle' + (draft.consent ? ' sel' : ''), (draft.consent ? '✓ ' : '') + t('ob.consent.agree'));
    t3.onclick = function () { draft.consent = !draft.consent; renderObStep(); };
    wrap.appendChild(t3);
    navRow(wrap, !!draft.consent);
  }

  function stepPin(wrap) {
    var data = APP().data();
    wrap.appendChild(el('h2', '', t('ob.pin.title')));
    if (data.parent.pin) {
      wrap.appendChild(el('p', '', t('ob.pin.exists')));
      navRow(wrap, true);
      return;
    }
    wrap.appendChild(el('p', 'ob-note', t('ob.pin.note')));
    var pin = el('input', 'ob-input'); pin.type = 'password'; pin.inputMode = 'numeric'; pin.maxLength = 6; pin.placeholder = '••••';
    wrap.appendChild(pin);
    var next = navRow(wrap, false, function () {
      var res = GATE.setPin(pin.value);
      if (!res) return false;
      data.parent.pin = res;
      data.parent.consent = { at: new Date().toISOString(), allowSpeech: draft.allowSpeech, allowFamilyVoice: draft.allowFamilyVoice };
      APP().save();
    });
    pin.oninput = function () { next.disabled = !/^\d{4,6}$/.test(pin.value); };
  }

  var miniResult = null;
  function stepMiniTest(wrap) {
    wrap.appendChild(el('h2', '', t('ob.test.title')));
    wrap.appendChild(el('p', 'ob-note', t('ob.test.note')));
    var area = el('div', 'minitest-area');
    wrap.appendChild(area);
    var lang = draft.langs[0];
    var qs = ['apple', 'dog', 'water'];
    var i = 0, hits = 0;

    function ask() {
      if (i >= qs.length) {
        miniResult = hits;
        area.innerHTML = '<p class="ob-note">Pronto! ⭐ Obrigado, ' + draft.name + '!</p>';
        return;
      }
      area.innerHTML = '';
      var target = qs[i];
      var opts = [target].concat(CUR.concepts.filter(function (c) { return c.id !== target; }).slice(0, 8)
        .sort(function () { return Math.random() - 0.5; }).slice(0, 2).map(function (c) { return c.id; }))
        .sort(function () { return Math.random() - 0.5; });
      var pack = g.LUMI_PACKS[lang];
      AUDIO.speak(pack.concepts[target].word, APP_TAG(lang));
      var row = el('div', 'options options-3');
      opts.forEach(function (id) {
        var b = el('button', 'option-card', '<span class="opt-emoji">' + CUR.get(id).emoji + '</span>');
        b.onclick = function () {
          if (id === target) hits++;
          i++; ask();
        };
        row.appendChild(b);
      });
      area.appendChild(row);
      var replay = el('button', 'btn-round btn-replay', '🔊');
      replay.onclick = function () { AUDIO.speak(pack.concepts[target].word, APP_TAG(lang)); };
      area.appendChild(replay);
    }
    function APP_TAG(l) {
      return draft.langVariants[l] || LANGS.get(l).tts[0];
    }
    var startB = el('button', 'btn-primary', t('ob.test.start'));
    startB.onclick = function () { startB.remove(); ask(); };
    wrap.appendChild(startB);
    navRow(wrap, true);
  }

  function stepSummary(wrap) {
    wrap.appendChild(el('h2', '', t('ob.summary.title')));
    var langsTxt = draft.langs.map(function (c) { return LANGS.get(c).name; }).join(', ');
    wrap.appendChild(el('p', '', t('ob.summary.who', { name: draft.name, age: draft.age, langs: langsTxt })));
    if (miniResult !== null) {
      wrap.appendChild(el('p', 'ob-note', t('ob.test.result', { hits: miniResult })));
    }
    wrap.appendChild(el('p', 'ob-note', t('ob.summary.cycle', { min: draft.sessionMinutes })));
    navRow(wrap, true);
  }

  function finishOnboarding() {
    var data = APP().data();
    draft.createdAt = Date.now();
    if (miniResult !== null && miniResult >= 2 && draft.langs.length) {
      draft.levels[draft.langs[0]] = draft.levels[draft.langs[0]] === 'none' ? 'some' : draft.levels[draft.langs[0]];
    }
    var id = APP().store.addProfile(data, draft);
    data.activeProfile = id;
    APP().save();
    miniResult = null;
    APP().goHome();
  }

  /* ---------- Painel dos responsáveis ---------- */

  function renderDashboard() {
    show('screen-parent');
    var tabs = $('parent-tabs');
    tabs.innerHTML = '';
    var TABS = [
      ['progress', t('tab.progress')], ['ladder', t('tab.ladder')],
      ['difficulties', t('tab.difficulties')], ['sessions', t('tab.sessions')],
      ['tips', t('tab.tips')], ['voice', t('tab.voice')],
      ['settings', t('tab.settings')], ['dataTab', t('tab.data')]
    ];
    TABS.forEach(function (t, i) {
      var b = el('button', 'ptab' + (i === 0 ? ' sel' : ''), t[1]);
      b.onclick = function () {
        tabs.querySelectorAll('.ptab').forEach(function (x) { x.classList.remove('sel'); });
        b.classList.add('sel');
        renderTab(t[0]);
      };
      tabs.appendChild(b);
    });
    $('btn-parent-back').onclick = function () { APP().goHome(); };
    renderTab('progress');
  }

  function renderTab(tab) {
    var body = $('parent-body');
    body.innerHTML = '';
    var data = APP().data();
    var p = APP().profile();
    if (!p) { body.appendChild(el('p', '', t('data.noProfile'))); return; }

    if (tab === 'progress') {
      p.langs.forEach(function (lang) {
        var L = LANGS.get(lang);
        var recs = data.progress[p.id] && data.progress[p.id][lang] || {};
        var counts = {};
        Object.keys(recs).forEach(function (k) { counts[recs[k].state] = (counts[recs[k].state] || 0) + 1; });
        var vistos = Object.keys(recs).length;
        var falados = (counts.spoken || 0) + (counts.mastered || 0);
        var reconhece = (counts.recognized || 0) + (counts.repeated_helped || 0) + falados;

        var card = el('div', 'pcard');
        var head = el('div', 'lang-head');
        head.innerHTML =
          '<span class="lh-char" style="background:' + L.colorSoft + '">' + L.character.emoji + '</span>' +
          '<span class="lh-name">' + T.langName(lang) + '</span>' +
          '<span class="lh-flag">' + L.flag + '</span>';
        card.appendChild(head);

        /* Três números que respondem à pergunta do responsável num relance:
         * quanto ela viu, quanto entende, quanto já fala. */
        var tiles = el('div', 'stat-row');
        [[vistos, t('common.of') + ' ' + CUR.concepts.length, t('panel.wordsSeen'), L.color],
         [reconhece, '', t('panel.recognises'), '#3550C4'],
         [falados, '', t('panel.speaks'), '#23A96B']
        ].forEach(function (t) {
          var tile = el('div', 'stat');
          tile.innerHTML =
            '<span class="stat-num" style="color:' + t[3] + '">' + t[0] +
            (t[1] ? '<span class="stat-of"> ' + t[1] + '</span>' : '') + '</span>' +
            '<span class="stat-label">' + t[2] + '</span>';
          tiles.appendChild(tile);
        });
        card.appendChild(tiles);

        /* Retenção: uma linha de marcos, não uma frase cheia de travessões. */
        var ret = el('div', 'retention');
        ret.appendChild(el('span', 'ret-title', t('panel.retention')));
        var pista = el('div', 'ret-track');
        [1, 3, 7, 14, 30].forEach(function (d) {
          var v = SRS.retentionAt(recs, d);
          var m = el('span', 'ret-mark' + (v === null ? ' pending' : ''));
          m.innerHTML = '<b>' + (v === null ? '—' : Math.round(v * 100) + '%') + '</b>' +
                        '<i>' + d + 'd</i>';
          if (v !== null) {
            m.style.borderColor = v >= 0.7 ? '#23A96B' : (v >= 0.4 ? '#E09600' : '#E2574C');
          }
          pista.appendChild(m);
        });
        ret.appendChild(pista);
        card.appendChild(ret);
        body.appendChild(card);
      });

      var fase = CUR.weekForDay(p.journeyDay);
      var rodape = el('div', 'pcard journey-card');
      rodape.innerHTML =
        '<span class="jc-day">' + t('common.day') + ' ' + p.journeyDay +
        '<small>' + t('common.of') + ' 60</small></span>' +
        '<span class="jc-phase"><b>' + fase.title + '</b><i>' +
        t('panel.phase', { n: CUR.weeks.indexOf(fase) + 1, total: CUR.weeks.length }) +
        '</i></span>';
      body.appendChild(rodape);
    }

    if (tab === 'ladder') {
      body.appendChild(el('p', 'ob-note',
t('ladder.intro')));

      p.langs.forEach(function (lang) {
        var L = LANGS.get(lang);
        var recs = data.progress[p.id] && data.progress[p.id][lang] || {};
        var dist = LADDER.distribution(recs, p);
        var total = Object.keys(dist).reduce(function (a, k) { return a + dist[k]; }, 0);
        var teto = LADDER.ceilingForAge(p.age);

        var card = el('div', 'pcard');
        card.appendChild(el('h3', '', L.flag + ' ' + T.langName(lang)));
        if (!total) {
          card.appendChild(el('p', '', t('panel.noWords')));
          body.appendChild(card);
          return;
        }
        var escada = el('div', 'ladder');
        // do degrau mais alto para o mais baixo: o topo é onde se quer chegar
        LADDER.PHASES.slice().reverse().forEach(function (fase) {
          var n = dist[fase.id] || 0;
          var linha = el('div', 'ladder-step' +
            (fase.verbal ? ' verbal' : '') + (n ? '' : ' empty'));
          linha.appendChild(el('span', 'ls-name',
            (fase.verbal ? '🗣️ ' : '👂 ') + t('phase.' + fase.id)));
          var barra = el('span', 'ls-bar');
          barra.style.width = Math.round(4 + (n / total) * 110) + 'px';
          barra.style.background = fase.verbal ? '#2BB673' : L.color;
          linha.appendChild(barra);
          linha.appendChild(el('span', 'ls-count', String(n)));
          escada.appendChild(linha);
        });
        card.appendChild(escada);

        var falando = LADDER.PHASES.filter(function (f) { return f.verbal; })
          .reduce(function (a, f) { return a + (dist[f.id] || 0); }, 0);
        card.appendChild(el('p', 'ladder-legend', t('ladder.speaking', {
          n: falando, total: total, age: p.age,
          ceiling: t('phase.' + LADDER.PHASES[teto].id)
        })));
        body.appendChild(card);
      });

      body.appendChild(el('p', 'ob-note',
t('ladder.silence')));
    }

    if (tab === 'difficulties') {
      p.langs.forEach(function (lang) {
        var recs = data.progress[p.id] && data.progress[p.id][lang] || {};
        var hard = Object.keys(recs).filter(function (k) { return recs[k].state === 'review' || recs[k].struggles > 0; })
          .sort(function (a, b) { return recs[b].struggles - recs[a].struggles; });
        var card = el('div', 'pcard');
        card.appendChild(el('h3', '', LANGS.get(lang).flag + ' ' + LANGS.get(lang).name));
        if (!hard.length) card.appendChild(el('p', '', t('diff.none')));
        hard.slice(0, 8).forEach(function (k) {
          var c = CUR.get(k);
          var e = g.LUMI_PACKS[lang].concepts[k];
          var simplify = SRS.needsSimplification(recs[k]);
          card.appendChild(el('p', '', c.emoji + ' <b>' + e.word + '</b> — ' + stateLabel(recs[k].state) +
            (simplify ? ' · ' + t('diff.simplified') : '')));
        });
        body.appendChild(card);
      });
    }

    if (tab === 'sessions') {
      var sessions = (data.sessions[p.id] || []).slice().reverse();
      if (!sessions.length) body.appendChild(el('p', '', t('sessions.none')));
      var totalMs = 0;
      sessions.forEach(function (s) { totalMs += s.durationMs || 0; });
      body.appendChild(el('p', 'ob-note', t('sessions.total', { min: Math.round(totalMs / 60000), n: sessions.length })));
      sessions.slice(0, 14).forEach(function (s) {
        var d = new Date(s.date);
        body.appendChild(el('div', 'pcard',
          '<b>' + t('common.day') + ' ' + s.day + '</b> — ' + d.toLocaleDateString() + ' · ' +
          Math.round((s.durationMs || 0) / 60000) + ' min · ' +
          s.answered + ' ' + t('sessions.activities') +
          (s.hard ? ' · ' + s.hard + ' ' + t('sessions.extraHelp') : '') +
          (s.shortened ? ' · ' + t('sessions.shortened') : '')));
      });
    }

    if (tab === 'tips') {
      var last = (data.sessions[p.id] || []).slice(-1)[0];
      if (!last || !last.tips || !last.tips.length) {
        body.appendChild(el('p', '', t('tips.empty')));
      } else {
        body.appendChild(el('p', 'ob-note', t('tips.intro')));
        last.tips.forEach(function (t) { body.appendChild(el('div', 'pcard tip', '💡 ' + t)); });
      }
    }

    if (tab === 'voice') {
      renderVoiceTab(body, p);
    }

    if (tab === 'settings') {
      renderSettingsTab(body, p);
    }

    if (tab === 'dataTab') {
      var card = el('div', 'pcard');
      card.appendChild(el('h3', '', t('data.title')));
      card.appendChild(el('p', 'ob-note', t('data.note')));
      var exp = el('button', 'btn-primary', t('data.export'));
      exp.onclick = function () {
        var json = APP().store.exportProfile(data, p.id);
        if (g.LUMI_SINGLE_FILE) {
          // demo em arquivo único (sem permissão de download): mostrar p/ copiar
          var ta = el('textarea', 'ob-input');
          ta.value = json; ta.rows = 10; ta.readOnly = true;
          card.appendChild(ta);
          ta.focus(); ta.select();
        } else {
          var blob = new Blob([json], { type: 'application/json' });
          var a = document.createElement('a');
          a.href = URL.createObjectURL(blob);
          a.download = 'lumilinguas-' + p.name + '.json';
          a.click();
        }
      };
      card.appendChild(exp);
      var del = el('button', 'btn-danger', t('data.delete'));
      del.onclick = function () {
        if (!confirm(t('data.confirmDelete', { name: p.name }))) return;
        AUDIO.deleteRecordings(p.id);
        APP().store.deleteProfile(data, p.id);
        APP().save();
        APP().renderSplash();
      };
      card.appendChild(del);
      body.appendChild(card);

      var prof = el('div', 'pcard');
      prof.appendChild(el('h3', '', t('data.profiles')));
      Object.keys(data.profiles).forEach(function (id) {
        var pr = data.profiles[id];
        var row = el('p', '', (pr.avatar || '🧒') + ' ' + pr.name + (id === data.activeProfile ? ' ' + t('data.active') : ''));
        prof.appendChild(row);
      });
      var add = el('button', 'btn-ghost', t('data.addChild'));
      add.onclick = startOnboarding;
      prof.appendChild(add);
      body.appendChild(prof);
    }
  }

  function renderVoiceTab(body, p) {
    if (!p.allowFamilyVoice) {
      body.appendChild(el('p', '', t('voice.disabled')));
      return;
    }
    var rec = AUDIO.createRecorder();
    if (!rec) {
      body.appendChild(el('p', '', t('voice.unsupported')));
      return;
    }
    body.appendChild(el('p', 'ob-note', t('voice.note')));
    p.langs.forEach(function (lang) {
      var L = LANGS.get(lang);
      var card = el('div', 'pcard');
      card.appendChild(el('h3', '', L.flag + ' ' + T.langName(lang)));
      CUR.concepts.slice(0, 12).forEach(function (c) {
        var e = g.LUMI_PACKS[lang].concepts[c.id];
        var row = el('div', 'voice-row');
        row.appendChild(el('span', 'voice-word', c.emoji + ' ' + e.word));
        var b = el('button', 'btn-ghost', t('voice.record'));
        var playB = el('button', 'btn-ghost', '▶️');
        playB.style.display = 'none';
        AUDIO.getRecording(p.id, lang, c.id).then(function (blob) {
          if (blob) playB.style.display = '';
        });
        var recording = false;
        b.onclick = function () {
          if (!recording) {
            rec.start().then(function () { recording = true; b.textContent = t('voice.stop'); })
              .catch(function () { b.textContent = t('voice.denied'); });
          } else {
            rec.stop().then(function (blob) {
              recording = false; b.textContent = t('voice.again');
              if (blob) AUDIO.saveRecording(p.id, lang, c.id, blob).then(function () { playB.style.display = ''; });
            });
          }
        };
        playB.onclick = function () {
          AUDIO.getRecording(p.id, lang, c.id).then(function (blob) { if (blob) AUDIO.playBlob(blob); });
        };
        row.appendChild(b); row.appendChild(playB);
        card.appendChild(row);
      });
      body.appendChild(card);
    });
  }

  function renderSettingsTab(body, p) {
    var data = APP().data();
    var card = el('div', 'pcard');
    card.appendChild(el('h3', '', t('set.langs')));
    var row = el('div', 'lang-grid');
    LANGS.codes.forEach(function (code) {
      var L = LANGS.get(code);
      var avail = LANGS.isAvailable(code);
      var idx = p.langs.indexOf(code);
      var c = el('button', 'lang-card' + (idx >= 0 ? ' sel' : '') + (avail ? '' : ' disabled'),
        '<span class="lc-flag">' + L.flag + '</span><span>' + T.langName(code) + '</span>' + (avail ? '' : '<span class="lc-soon">' + t('ob.langs.soon') + '</span>'));
      if (avail) c.onclick = function () {
        if (idx >= 0) { if (p.langs.length > 1) p.langs.splice(idx, 1); }
        else if (p.langs.length < 4) p.langs.push(code);
        APP().save();
        renderTab('settings');
      };
      row.appendChild(c);
    });
    card.appendChild(row);
    body.appendChild(card);

    var card0 = el('div', 'pcard');
    card0.appendChild(el('h3', '', t('ui.language')));
    uiLangPicker(card0, function () { renderDashboard(); });
    body.appendChild(card0);

    var card2 = el('div', 'pcard');
    card2.appendChild(el('h3', '', t('set.prefs')));
    [['allowSpeech', t('set.speech')],
     ['allowFamilyVoice', t('set.familyVoice')],
     ['textSupport', t('set.textSupport')]].forEach(function (opt) {
      var t = el('button', 'chip toggle' + (p[opt[0]] ? ' sel' : ''), (p[opt[0]] ? '✓ ' : '') + opt[1]);
      t.onclick = function () { p[opt[0]] = !p[opt[0]]; APP().save(); renderTab('settings'); };
      card2.appendChild(t);
    });
    card2.appendChild(el('label', '', t('ob.routine.duration')));
    var dr = el('div', 'chip-row');
    [[8, '8 min'], [11, '11 min'], [15, '15 min']].forEach(function (opt) {
      var c = el('button', 'chip' + (p.sessionMinutes === opt[0] ? ' sel' : ''), opt[1]);
      c.onclick = function () { p.sessionMinutes = opt[0]; APP().save(); renderTab('settings'); };
      dr.appendChild(c);
    });
    card2.appendChild(dr);
    body.appendChild(card2);

    var card3 = el('div', 'pcard');
    card3.appendChild(el('h3', '', t('set.changePin')));
    var pin = el('input', 'ob-input'); pin.type = 'password'; pin.maxLength = 6; pin.placeholder = t('set.newPin');
    var okB = el('button', 'btn-ghost', t('set.savePin'));
    okB.onclick = function () {
      var res = GATE.setPin(pin.value);
      if (res) { data.parent.pin = res; APP().save(); okB.textContent = t('ob.pin.updated'); }
      else okB.textContent = t('ob.pin.invalid');
    };
    card3.appendChild(pin); card3.appendChild(okB);
    body.appendChild(card3);
  }

  g.LUMI_PARENT = { openGate: openGate, startOnboarding: startOnboarding, renderDashboard: renderDashboard };
})(window);
