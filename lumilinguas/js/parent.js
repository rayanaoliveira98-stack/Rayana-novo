/* LumiLínguas — Área dos responsáveis: portão parental, onboarding com
 * consentimento, painel de progresso, gravação de voz da família,
 * configurações, exportação e exclusão de dados.
 */
(function (g) {
  'use strict';

  var LANGS = g.LUMI_LANGS, CUR = g.LUMI_CURRICULUM, SRS = g.LUMI_SRS,
      GATE = g.LUMI_GATE, AUDIO = g.LUMI_AUDIO;

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

  var STATE_LABELS = {
    'new': 'ainda não apresentado', presented: 'apresentado',
    recognized: 'reconhece ao ouvir', repeated_helped: 'repete com ajuda',
    spoken: 'fala sem ajuda', mastered: 'dominado', review: 'precisa de revisão'
  };

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
      body.appendChild(el('p', 'gate-title', 'Área dos responsáveis'));
      body.appendChild(el('p', '', 'Digite o PIN:'));
      var input = el('input', 'gate-input');
      input.type = 'password'; input.inputMode = 'numeric'; input.maxLength = 6;
      body.appendChild(input);
      var msg = el('p', 'gate-msg', '');
      body.appendChild(msg);
      var ok = el('button', 'btn-primary', 'Entrar');
      ok.onclick = function () {
        if (GATE.verifyPin(data.parent.pin, input.value)) done();
        else { msg.textContent = 'PIN incorreto.'; input.value = ''; }
      };
      body.appendChild(ok);
      input.focus();
    } else {
      var ch = GATE.mathChallenge();
      body.appendChild(el('p', 'gate-title', 'Confirmação de adulto'));
      body.appendChild(el('p', '', ch.question));
      var inp2 = el('input', 'gate-input');
      inp2.type = 'number'; inp2.inputMode = 'numeric';
      body.appendChild(inp2);
      var msg2 = el('p', 'gate-msg', '');
      body.appendChild(msg2);
      var ok2 = el('button', 'btn-primary', 'Confirmar');
      ok2.onclick = function () {
        if (Number(inp2.value) === ch.answer) done();
        else { msg2.textContent = 'Tente novamente.'; inp2.value = ''; ch = GATE.mathChallenge(); body.children[1].textContent = ch.question; }
      };
      body.appendChild(ok2);
      inp2.focus();
    }
    $('gate-close').onclick = function () { modal.classList.remove('open'); };
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
      var back = el('button', 'btn-ghost', '← Voltar');
      back.onclick = function () { obStep--; renderObStep(); };
      row.appendChild(back);
    }
    var next = el('button', 'btn-primary', obStep === OB_STEPS.length - 1 ? 'Concluir' : 'Continuar');
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
    wrap.appendChild(el('h2', '', 'Bem-vindo ao LumiLínguas! ✨'));
    wrap.appendChild(el('p', '', 'Construa uma base de compreensão, vocabulário e pronúncia em até quatro idiomas durante uma jornada de 60 dias.'));
    wrap.appendChild(el('p', 'ob-note', 'Este aplicativo não promete fluência em dois meses: promete exposição estruturada, repetida e alegre, com revisões programadas e acompanhamento real do que a criança reconhece e fala.'));
    navRow(wrap, true);
  }

  function stepChild(wrap) {
    wrap.appendChild(el('h2', '', 'Quem vai aprender?'));
    wrap.appendChild(el('label', '', 'Nome ou apelido da criança'));
    var name = el('input', 'ob-input'); name.value = draft.name; name.maxLength = 24;
    wrap.appendChild(name);
    wrap.appendChild(el('label', '', 'Idade'));
    var ageRow = el('div', 'chip-row');
    [3, 4, 5, 6, 7].forEach(function (a) {
      var c = el('button', 'chip' + (draft.age === a ? ' sel' : ''), String(a));
      c.onclick = function () { draft.age = a; renderObStep(); };
      ageRow.appendChild(c);
    });
    wrap.appendChild(ageRow);
    wrap.appendChild(el('label', '', 'Avatar'));
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
    wrap.appendChild(el('h2', '', 'Idioma principal falado em casa'));
    var row = el('div', 'lang-grid');
    LANGS.codes.forEach(function (code) {
      var L = LANGS.get(code);
      var c = el('button', 'lang-card' + (draft.homeLang === code ? ' sel' : ''),
        '<span class="lc-flag">' + L.flag + '</span><span>' + L.name + '</span>');
      c.onclick = function () { draft.homeLang = code; renderObStep(); };
      row.appendChild(c);
    });
    wrap.appendChild(row);
    navRow(wrap, true);
  }

  function stepLangs(wrap) {
    wrap.appendChild(el('h2', '', 'Quais idiomas aprender? (1 a 4)'));
    if (draft.age <= 4) {
      wrap.appendChild(el('p', 'ob-note', 'Para ' + draft.age + ' anos recomendamos começar com 1 ou 2 idiomas. Cada idioma será apresentado em blocos separados para não confundir. Você pode escolher até 4.'));
    }
    var row = el('div', 'lang-grid');
    LANGS.codes.forEach(function (code) {
      var L = LANGS.get(code);
      var avail = LANGS.isAvailable(code);
      var selIdx = draft.langs.indexOf(code);
      var c = el('button', 'lang-card' + (selIdx >= 0 ? ' sel' : '') + (avail ? '' : ' disabled'),
        '<span class="lc-flag">' + L.flag + '</span><span>' + L.name + '</span>' +
        '<span class="lc-char">' + L.character.emoji + ' ' + L.character.name + '</span>' +
        (avail ? '' : '<span class="lc-soon">pack em breve</span>'));
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
    wrap.appendChild(el('h2', '', 'Variação regional'));
    if (!withVar.length) {
      wrap.appendChild(el('p', '', 'Os idiomas escolhidos não têm variações a configurar.'));
    }
    withVar.forEach(function (code) {
      var L = LANGS.get(code);
      wrap.appendChild(el('label', '', L.name));
      var row = el('div', 'chip-row');
      L.variants.forEach(function (v) {
        var cur = draft.langVariants[code] || L.variants[0].id;
        var c = el('button', 'chip' + (cur === v.id ? ' sel' : ''), v.label);
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
    wrap.appendChild(el('h2', '', 'Nível atual em cada idioma'));
    draft.langs.forEach(function (code) {
      var L = LANGS.get(code);
      wrap.appendChild(el('label', '', L.name));
      var row = el('div', 'chip-row');
      [['none', 'Nunca ouviu'], ['some', 'Conhece algumas palavras'], ['understands', 'Entende bastante']].forEach(function (opt) {
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
    wrap.appendChild(el('h2', '', 'A criança já lê?'));
    var row = el('div', 'chip-row chip-col');
    [['no', 'Ainda não lê'], ['starting', 'Começando a ler'], ['yes', 'Já lê']].forEach(function (opt) {
      var c = el('button', 'chip' + (draft.reading === opt[0] ? ' sel' : ''), opt[1]);
      c.onclick = function () { draft.reading = opt[0]; renderObStep(); };
      row.appendChild(c);
    });
    wrap.appendChild(row);
    if (draft.age >= 5 && draft.reading !== 'no') {
      var t = el('button', 'chip toggle' + (draft.textSupport ? ' sel' : ''), (draft.textSupport ? '✓ ' : '') + 'Mostrar palavras escritas como apoio (opcional)');
      t.onclick = function () { draft.textSupport = !draft.textSupport; renderObStep(); };
      wrap.appendChild(t);
      wrap.appendChild(el('p', 'ob-note', 'O texto nunca é o elemento principal: para 3-4 anos as atividades não mostram texto.'));
    }
    navRow(wrap, true);
  }

  function stepInterests(wrap) {
    wrap.appendChild(el('h2', '', 'O que a criança adora?'));
    var THEMES = [['animals', '🐶 Animais'], ['places', '🚗 Veículos'], ['home', '🏠 Casa'], ['food', '🍎 Comidas'], ['family', '👨‍👩‍👧 Família'], ['clothes', '👕 Roupas'], ['actions', '😊 Emoções'], ['dialogs', '💬 Conversas']];
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
    wrap.appendChild(el('h2', '', 'Rotina da sessão'));
    wrap.appendChild(el('label', '', 'Duração desejada'));
    var row = el('div', 'chip-row');
    [[8, '8 min'], [11, '11 min'], [15, '15 min']].forEach(function (opt) {
      var c = el('button', 'chip' + (draft.sessionMinutes === opt[0] ? ' sel' : ''), opt[1]);
      c.onclick = function () { draft.sessionMinutes = opt[0]; renderObStep(); };
      row.appendChild(c);
    });
    wrap.appendChild(row);
    wrap.appendChild(el('label', '', 'Horário habitual (opcional)'));
    var time = el('input', 'ob-input'); time.type = 'time'; time.value = draft.usualTime;
    time.onchange = function () { draft.usualTime = time.value; };
    wrap.appendChild(time);
    wrap.appendChild(el('p', 'ob-note', 'A sessão se adapta sozinha: se a criança cansar, o aplicativo encurta o dia automaticamente.'));
    navRow(wrap, true);
  }

  function stepConsent(wrap) {
    wrap.appendChild(el('h2', '', 'Privacidade e permissões'));
    wrap.appendChild(el('p', 'ob-note', 'Todos os dados ficam neste aparelho: progresso, perfis e gravações. Não há publicidade, chat, localização nem perfil público. O reconhecimento de voz usa o serviço de fala do navegador/celular — em alguns aparelhos o áudio é processado pelo sistema operacional; se você não permitir, a atividade de fala vira "repita junto", sem microfone.'));
    var t1 = el('button', 'chip toggle' + (draft.allowSpeech ? ' sel' : ''), (draft.allowSpeech ? '✓ ' : '') + 'Permitir reconhecimento de voz nas atividades de fala');
    t1.onclick = function () { draft.allowSpeech = !draft.allowSpeech; renderObStep(); };
    wrap.appendChild(t1);
    var t2 = el('button', 'chip toggle' + (draft.allowFamilyVoice ? ' sel' : ''), (draft.allowFamilyVoice ? '✓ ' : '') + 'Quero gravar palavras com a voz da família (fica só no aparelho)');
    t2.onclick = function () { draft.allowFamilyVoice = !draft.allowFamilyVoice; renderObStep(); };
    wrap.appendChild(t2);
    var t3 = el('button', 'chip toggle' + (draft.consent ? ' sel' : ''), (draft.consent ? '✓ ' : '') + 'Sou responsável pela criança e autorizo o uso do aplicativo');
    t3.onclick = function () { draft.consent = !draft.consent; renderObStep(); };
    wrap.appendChild(t3);
    navRow(wrap, !!draft.consent);
  }

  function stepPin(wrap) {
    var data = APP().data();
    wrap.appendChild(el('h2', '', 'PIN da área dos responsáveis'));
    if (data.parent.pin) {
      wrap.appendChild(el('p', '', 'Já existe um PIN configurado. Você pode mantê-lo.'));
      navRow(wrap, true);
      return;
    }
    wrap.appendChild(el('p', 'ob-note', 'De 4 a 6 números. Protege as configurações e os dados — a criança nunca precisa dele.'));
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
    wrap.appendChild(el('h2', '', 'Teste inicial (curto e sem pressão)'));
    wrap.appendChild(el('p', 'ob-note', 'Entregue o aparelho à criança: 3 perguntas visuais no primeiro idioma escolhido. Serve só para calibrar o começo. Você pode pular.'));
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
    var startB = el('button', 'btn-primary', 'Começar o teste');
    startB.onclick = function () { startB.remove(); ask(); };
    wrap.appendChild(startB);
    navRow(wrap, true);
  }

  function stepSummary(wrap) {
    wrap.appendChild(el('h2', '', 'Tudo pronto! 🌟'));
    var langsTxt = draft.langs.map(function (c) { return LANGS.get(c).name; }).join(', ');
    wrap.appendChild(el('p', '', draft.name + ', ' + draft.age + ' anos — vai aprender: ' + langsTxt + '.'));
    if (miniResult !== null) {
      wrap.appendChild(el('p', 'ob-note', 'Teste inicial: ' + miniResult + ' de 3 no primeiro idioma. O ritmo inicial será ajustado.'));
    }
    wrap.appendChild(el('p', 'ob-note', 'Sessões de ~' + draft.sessionMinutes + ' minutos: ouvir → compreender → falar → revisar → usar no dia a dia.'));
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
      ['progress', '📊 Progresso'], ['difficulties', '🧩 Dificuldades'], ['sessions', '🕒 Sessões'],
      ['tips', '💡 Dicas de hoje'], ['voice', '🎙️ Voz da família'], ['settings', '⚙️ Configurações'], ['dataTab', '🔐 Dados']
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
    if (!p) { body.appendChild(el('p', '', 'Nenhum perfil ativo.')); return; }

    if (tab === 'progress') {
      p.langs.forEach(function (lang) {
        var L = LANGS.get(lang);
        var recs = data.progress[p.id] && data.progress[p.id][lang] || {};
        var counts = {};
        Object.keys(recs).forEach(function (k) { counts[recs[k].state] = (counts[recs[k].state] || 0) + 1; });
        var seen = Object.keys(recs).length;
        var spoken = (counts.spoken || 0) + (counts.mastered || 0);
        var card = el('div', 'pcard');
        card.appendChild(el('h3', '', L.flag + ' ' + L.name));
        var ret = [1, 3, 7, 14, 30].map(function (d) {
          var r = SRS.retentionAt(recs, d);
          return d + 'd: ' + (r === null ? '—' : Math.round(r * 100) + '%');
        }).join(' · ');
        card.appendChild(el('p', '', 'Conceitos vistos: <b>' + seen + '</b> de ' + CUR.concepts.length +
          ' · reconhece ao ouvir: <b>' + ((counts.recognized || 0) + spoken + (counts.repeated_helped || 0)) + '</b>' +
          ' · fala sem ajuda: <b>' + spoken + '</b>'));
        card.appendChild(el('p', 'ob-note', 'Retenção estimada — ' + ret));
        var states = el('p', 'state-line', Object.keys(counts).map(function (s) {
          return STATE_LABELS[s] + ': ' + counts[s];
        }).join(' · ') || 'Ainda sem atividades registradas.');
        card.appendChild(states);
        body.appendChild(card);
      });
      body.appendChild(el('p', 'ob-note', 'Dia da jornada: ' + p.journeyDay + ' de 60 — fase: ' + CUR.weekForDay(p.journeyDay).title));
    }

    if (tab === 'difficulties') {
      p.langs.forEach(function (lang) {
        var recs = data.progress[p.id] && data.progress[p.id][lang] || {};
        var hard = Object.keys(recs).filter(function (k) { return recs[k].state === 'review' || recs[k].struggles > 0; })
          .sort(function (a, b) { return recs[b].struggles - recs[a].struggles; });
        var card = el('div', 'pcard');
        card.appendChild(el('h3', '', LANGS.get(lang).flag + ' ' + LANGS.get(lang).name));
        if (!hard.length) card.appendChild(el('p', '', 'Nenhuma dificuldade no momento. 🎉'));
        hard.slice(0, 8).forEach(function (k) {
          var c = CUR.get(k);
          var e = g.LUMI_PACKS[lang].concepts[k];
          var simplify = SRS.needsSimplification(recs[k]);
          card.appendChild(el('p', '', c.emoji + ' <b>' + e.word + '</b> — ' + STATE_LABELS[recs[k].state] +
            (simplify ? ' · atividade simplificada automaticamente' : '')));
        });
        body.appendChild(card);
      });
    }

    if (tab === 'sessions') {
      var sessions = (data.sessions[p.id] || []).slice().reverse();
      if (!sessions.length) body.appendChild(el('p', '', 'Nenhuma sessão ainda.'));
      var totalMs = 0;
      sessions.forEach(function (s) { totalMs += s.durationMs || 0; });
      body.appendChild(el('p', 'ob-note', 'Tempo total de uso: ' + Math.round(totalMs / 60000) + ' min em ' + sessions.length + ' sessões.'));
      sessions.slice(0, 14).forEach(function (s) {
        var d = new Date(s.date);
        body.appendChild(el('div', 'pcard',
          '<b>Dia ' + s.day + '</b> — ' + d.toLocaleDateString() + ' · ' + Math.round((s.durationMs || 0) / 60000) + ' min · ' +
          s.answered + ' atividades' + (s.hard ? ' · ' + s.hard + ' com apoio extra' : '') + (s.shortened ? ' · sessão encurtada (cansaço)' : '')));
      });
    }

    if (tab === 'tips') {
      var last = (data.sessions[p.id] || []).slice(-1)[0];
      if (!last || !last.tips || !last.tips.length) {
        body.appendChild(el('p', '', 'As dicas do dia aparecem depois da primeira sessão.'));
      } else {
        body.appendChild(el('p', 'ob-note', 'Quatro momentos de hoje — sem virar professor, só brincando:'));
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
      card.appendChild(el('h3', '', 'Seus dados, suas regras'));
      card.appendChild(el('p', 'ob-note', 'Tudo fica neste aparelho. Nenhum dado é enviado a servidores nesta versão de demonstração.'));
      var exp = el('button', 'btn-primary', '⬇️ Exportar dados do perfil (JSON)');
      exp.onclick = function () {
        var json = APP().store.exportProfile(data, p.id);
        var blob = new Blob([json], { type: 'application/json' });
        var a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'lumilinguas-' + p.name + '.json';
        a.click();
      };
      card.appendChild(exp);
      var del = el('button', 'btn-danger', '🗑️ Excluir este perfil e todos os dados');
      del.onclick = function () {
        if (!confirm('Excluir permanentemente o perfil "' + p.name + '", progresso e gravações?')) return;
        AUDIO.deleteRecordings(p.id);
        APP().store.deleteProfile(data, p.id);
        APP().save();
        APP().renderSplash();
      };
      card.appendChild(del);
      body.appendChild(card);

      var prof = el('div', 'pcard');
      prof.appendChild(el('h3', '', 'Perfis'));
      Object.keys(data.profiles).forEach(function (id) {
        var pr = data.profiles[id];
        var row = el('p', '', (pr.avatar || '🧒') + ' ' + pr.name + (id === data.activeProfile ? ' (ativo)' : ''));
        prof.appendChild(row);
      });
      var add = el('button', 'btn-ghost', '+ Adicionar outra criança');
      add.onclick = startOnboarding;
      prof.appendChild(add);
      body.appendChild(prof);
    }
  }

  function renderVoiceTab(body, p) {
    if (!p.allowFamilyVoice) {
      body.appendChild(el('p', '', 'A gravação da voz da família está desativada. Ative nas Configurações.'));
      return;
    }
    var rec = AUDIO.createRecorder();
    if (!rec) {
      body.appendChild(el('p', '', 'Este navegador não permite gravação de áudio.'));
      return;
    }
    body.appendChild(el('p', 'ob-note', 'Grave palavras com a sua voz: quando existir gravação, a criança ouve a família em vez da voz sintética. Tudo fica salvo apenas neste aparelho.'));
    p.langs.forEach(function (lang) {
      var L = LANGS.get(lang);
      var card = el('div', 'pcard');
      card.appendChild(el('h3', '', L.flag + ' ' + L.name));
      CUR.concepts.slice(0, 12).forEach(function (c) {
        var e = g.LUMI_PACKS[lang].concepts[c.id];
        var row = el('div', 'voice-row');
        row.appendChild(el('span', 'voice-word', c.emoji + ' ' + e.word));
        var b = el('button', 'btn-ghost', '⏺️ Gravar');
        var playB = el('button', 'btn-ghost', '▶️');
        playB.style.display = 'none';
        AUDIO.getRecording(p.id, lang, c.id).then(function (blob) {
          if (blob) playB.style.display = '';
        });
        var recording = false;
        b.onclick = function () {
          if (!recording) {
            rec.start().then(function () { recording = true; b.textContent = '⏹️ Parar'; })
              .catch(function () { b.textContent = 'Microfone negado'; });
          } else {
            rec.stop().then(function (blob) {
              recording = false; b.textContent = '⏺️ Regravar';
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
    card.appendChild(el('h3', '', 'Idiomas de aprendizagem (1 a 4)'));
    var row = el('div', 'lang-grid');
    LANGS.codes.forEach(function (code) {
      var L = LANGS.get(code);
      var avail = LANGS.isAvailable(code);
      var idx = p.langs.indexOf(code);
      var c = el('button', 'lang-card' + (idx >= 0 ? ' sel' : '') + (avail ? '' : ' disabled'),
        '<span class="lc-flag">' + L.flag + '</span><span>' + L.name + '</span>' + (avail ? '' : '<span class="lc-soon">pack em breve</span>'));
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

    var card2 = el('div', 'pcard');
    card2.appendChild(el('h3', '', 'Preferências'));
    [['allowSpeech', 'Reconhecimento de voz nas atividades de fala'],
     ['allowFamilyVoice', 'Gravação da voz da família'],
     ['textSupport', 'Palavras escritas como apoio (5-7 anos)']].forEach(function (opt) {
      var t = el('button', 'chip toggle' + (p[opt[0]] ? ' sel' : ''), (p[opt[0]] ? '✓ ' : '') + opt[1]);
      t.onclick = function () { p[opt[0]] = !p[opt[0]]; APP().save(); renderTab('settings'); };
      card2.appendChild(t);
    });
    card2.appendChild(el('label', '', 'Duração da sessão'));
    var dr = el('div', 'chip-row');
    [[8, '8 min'], [11, '11 min'], [15, '15 min']].forEach(function (opt) {
      var c = el('button', 'chip' + (p.sessionMinutes === opt[0] ? ' sel' : ''), opt[1]);
      c.onclick = function () { p.sessionMinutes = opt[0]; APP().save(); renderTab('settings'); };
      dr.appendChild(c);
    });
    card2.appendChild(dr);
    body.appendChild(card2);

    var card3 = el('div', 'pcard');
    card3.appendChild(el('h3', '', 'Trocar PIN'));
    var pin = el('input', 'ob-input'); pin.type = 'password'; pin.maxLength = 6; pin.placeholder = 'Novo PIN (4-6 números)';
    var okB = el('button', 'btn-ghost', 'Salvar novo PIN');
    okB.onclick = function () {
      var res = GATE.setPin(pin.value);
      if (res) { data.parent.pin = res; APP().save(); okB.textContent = '✓ PIN atualizado'; }
      else okB.textContent = 'PIN inválido — use 4 a 6 números';
    };
    card3.appendChild(pin); card3.appendChild(okB);
    body.appendChild(card3);
  }

  g.LUMI_PARENT = { openGate: openGate, startOnboarding: startOnboarding, renderDashboard: renderDashboard };
})(window);
