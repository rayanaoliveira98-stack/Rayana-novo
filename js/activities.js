/* LumiLínguas — Atividades da criança.
 * Cada atividade renderiza no container e resolve uma Promise com
 * {kind: 'listen'|'speak'|null, result: 'ok'|'helped'|'hard'|null}.
 * Regras: sem texto obrigatório, uma instrução por tela, botões grandes,
 * feedback sempre positivo (nunca a palavra "errado", nunca som negativo).
 */
(function (g) {
  'use strict';

  var CUR = g.LUMI_CURRICULUM;
  var LANGS = g.LUMI_LANGS;
  var AUDIO = g.LUMI_AUDIO;
  var SPEECH = g.LUMI_SPEECH;
  var FX = g.LUMI_FX;

  var PRAISE = { pt: 'Muito bem!', en: 'Great job!', de: 'Super gemacht!', es: '¡Muy bien!', fr: 'Très bien !', it: 'Bravissimo!', tr: 'Aferin!', zh: '真棒！', ja: 'すごいね！' };
  var LISTEN_AGAIN = { pt: 'Vamos ouvir de novo!', en: "Let's listen again!", de: 'Hören wir noch einmal!', es: '¡Vamos a escuchar otra vez!', fr: 'On écoute encore une fois !', it: 'Ascoltiamo ancora!', tr: 'Tekrar dinleyelim!', zh: '我们再听一次！', ja: 'もういちど きいてみよう！' };
  var ALMOST = { pt: 'Quase! Boa tentativa!', en: 'Almost! Good try!', de: 'Fast! Guter Versuch!', es: '¡Casi! ¡Buen intento!', fr: 'Presque ! Bel essai !', it: 'Quasi! Bel tentativo!', tr: 'Az kaldı! Güzel deneme!', zh: '差一点！很棒的尝试！', ja: 'おしい！いいちょうせん！' };

  /* ---------- utilidades ---------- */

  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html !== undefined) e.innerHTML = html;
    return e;
  }

  function shuffle(arr, seed) {
    // Fisher–Yates com seed simples p/ variar entre execuções
    var a = arr.slice();
    var s = seed || Math.floor(Math.random() * 1e9);
    function rnd() { s = (s * 1664525 + 1013904223) % 4294967296; return s / 4294967296; }
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(rnd() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function distractors(conceptId, n) {
    var pool = CUR.concepts.filter(function (c) { return c.id !== conceptId; });
    return shuffle(pool).slice(0, n).map(function (c) { return c.id; });
  }

  function entry(env, lang, conceptId) {
    var pack = env.packs[lang];
    return pack ? pack.concepts[conceptId] : null;
  }

  function speakField(env, lang, conceptId, field, opts) {
    var e = entry(env, lang, conceptId);
    if (!e) return Promise.resolve(false);
    var text = e[field] || e.word;
    opts = opts || {};
    return AUDIO.speakConcept(text, env.ttsTag(lang), {
      slow: opts.slow,
      profileId: field === 'word' && !opts.slow ? env.profile.id : null,
      lang: lang, conceptId: conceptId
    });
  }

  /* Elogio: som + mascote comemorando + estrela que voa para a coleção.
   * O reforço é sensorial e imediato — a criança não precisa ler nada. */
  function praiseOverlay(env, lang, sourceEl) {
    AUDIO.chimeGood();
    FX.buzz([14, 40, 14]);
    FX.mascotMood('cheer');
    var o = el('div', 'praise-overlay', '<div class="praise-star">⭐</div>');
    document.body.appendChild(o);
    setTimeout(function () { o.classList.add('show'); }, 10);
    if (sourceEl) FX.starFly(sourceEl, '⭐');
    var msg = PRAISE[lang] || PRAISE.pt;
    return AUDIO.speak(msg, env.ttsTag(lang)).then(function () {
      return new Promise(function (res) {
        setTimeout(function () { o.remove(); FX.mascotMood('idle'); res(); }, 400);
      });
    });
  }

  function encourage(env, lang) {
    AUDIO.chimeSoft();
    FX.mascotMood('encourage');
    return AUDIO.speak(LISTEN_AGAIN[lang] || LISTEN_AGAIN.pt, env.ttsTag(lang))
      .then(function (r) { FX.mascotMood('think'); return r; });
  }

  function wordLabel(env, e) {
    if (!env.textSupport || !e) return '';
    var t = e.word + (e.rom ? ' · ' + e.rom : '');
    return '<div class="word-label">' + t + '</div>';
  }

  function replayBar(env, lang, conceptId, field) {
    var bar = el('div', 'replay-bar');
    var again = el('button', 'btn-round btn-replay', '🔊');
    again.setAttribute('aria-label', 'Ouvir de novo');
    var slow = el('button', 'btn-round btn-slow', '🐢');
    slow.setAttribute('aria-label', 'Ouvir devagar');
    again.onclick = function () { speakField(env, lang, conceptId, field); };
    slow.onclick = function () { speakField(env, lang, conceptId, field, { slow: true }); };
    bar.appendChild(again); bar.appendChild(slow);
    return bar;
  }

  function bigNext(onTap) {
    var b = el('button', 'btn-next', '➜');
    b.setAttribute('aria-label', 'Continuar');
    b.onclick = onTap;
    return b;
  }

  function optionCards(env, ids, correctId, onPick, count) {
    var wrap = el('div', 'options options-' + count);
    shuffle(ids).forEach(function (id) {
      var c = CUR.get(id);
      var card = el('button', 'option-card', '<span class="opt-emoji">' + c.emoji + '</span>');
      card.dataset.id = id;
      card.onclick = function () { onPick(id, card); };
      wrap.appendChild(card);
    });
    return wrap;
  }

  /* Escolha por toque com 2 tentativas; na 2ª falha mostra a resposta
   * com carinho e devolve 'hard'. */
  function tapChoice(env, lang, conceptId, playPrompt, container, numOptions) {
    return new Promise(function (resolve) {
      var misses = 0;
      var ids = [conceptId].concat(distractors(conceptId, numOptions - 1));
      var locked = false;
      var idleTimer = null;

      /* Sem pressa: se a criança ficar parada, o áudio volta sozinho e a
       * resposta certa pulsa de leve. Ajuda em vez de cobrar. */
      function armIdleHint() {
        clearTimeout(idleTimer);
        idleTimer = setTimeout(function () {
          if (locked) return;
          playPrompt();
          if (misses >= 1) {
            var right = wrap.querySelector('[data-id="' + conceptId + '"]');
            FX.highlight(right);
          }
          armIdleHint();
        }, 9000);
      }

      var wrap = optionCards(env, ids, conceptId, function (id, card) {
        if (locked) return;
        clearTimeout(idleTimer);
        if (id === conceptId) {
          locked = true;
          card.classList.add('correct');
          FX.burstFrom(card);
          praiseOverlay(env, lang, card).then(function () {
            resolve({ kind: 'listen', result: misses === 0 ? 'ok' : 'helped' });
          });
        } else {
          card.classList.add('faded');
          FX.nudge(card);
          misses++;
          if (misses >= 2) {
            locked = true;
            var right = wrap.querySelector('[data-id="' + conceptId + '"]');
            if (right) right.classList.add('reveal');
            speakField(env, lang, conceptId, 'word', { slow: true }).then(function () {
              setTimeout(function () { resolve({ kind: 'listen', result: 'hard' }); }, 700);
            });
          } else {
            encourage(env, lang).then(function () { playPrompt(); armIdleHint(); });
          }
        }
      }, numOptions);
      container.appendChild(wrap);
      playPrompt();
      armIdleHint();
    });
  }

  /* ---------- atividades ---------- */

  /* Apresentação de conceito novo: imagem grande, áudio, imagens
   * alternativas (aprender o conceito, não a foto), tartaruga = devagar. */
  function present(env, step, container) {
    return new Promise(function (resolve) {
      var c = CUR.get(step.concept);
      var e = entry(env, step.lang, step.concept);
      var images = [c.emoji].concat(c.alts);
      var idx = 0;

      var card = el('div', 'stage-card');
      var img = el('div', 'hero-emoji', images[0]);
      card.appendChild(img);
      card.appendChild(el('div', '', wordLabel(env, e)));
      var dots = el('div', 'alt-dots');
      images.forEach(function (im, i) {
        var d = el('button', 'alt-dot' + (i === 0 ? ' active' : ''), im);
        d.onclick = function () {
          idx = i;
          img.textContent = im;
          dots.querySelectorAll('.alt-dot').forEach(function (x) { x.classList.remove('active'); });
          d.classList.add('active');
          speakField(env, step.lang, step.concept, 'word');
        };
        dots.appendChild(d);
      });
      card.appendChild(dots);
      card.appendChild(replayBar(env, step.lang, step.concept, 'word'));
      container.appendChild(card);

      // artigo quando natural no idioma; senão a palavra
      var field = e && e.art ? 'art' : 'word';
      speakField(env, step.lang, step.concept, field).then(function () {
        return speakField(env, step.lang, step.concept, 'sen');
      }).then(function () {
        container.appendChild(bigNext(function () {
          resolve({ kind: null, result: null });
        }));
      });
    });
  }

  /* Ouça e toque na imagem correta. */
  function listenTap(env, step, container, numOptions) {
    var n = numOptions || (env.profile.age <= 4 ? 3 : 4);
    container.appendChild(el('div', 'task-hint', '👂'));
    var play = function () { speakField(env, step.lang, step.concept, 'word'); };
    return tapChoice(env, step.lang, step.concept, play, container, n);
  }

  /* Ligue o som à imagem: usa a frase, 4 opções. */
  function soundMatch(env, step, container) {
    container.appendChild(el('div', 'task-hint', '🎵'));
    var play = function () { speakField(env, step.lang, step.concept, 'sen'); };
    return tapChoice(env, step.lang, step.concept, play, container, 4);
  }

  /* Siga uma instrução simples (frase de ação). */
  function followInstruction(env, step, container) {
    container.appendChild(el('div', 'task-hint', '🫲'));
    var play = function () { speakField(env, step.lang, step.concept, 'act'); };
    return tapChoice(env, step.lang, step.concept, play, container, 3);
  }

  /* Encontre o objeto no cenário. */
  function findInScene(env, step, container) {
    return new Promise(function (resolve) {
      var target = CUR.get(step.concept);
      var others = distractors(step.concept, 5).map(function (id) { return CUR.get(id); });
      var scene = el('div', 'scene');
      scene.appendChild(el('div', 'scene-bg', target.scene));
      var misses = 0, locked = false;
      shuffle([target].concat(others)).forEach(function (c, i) {
        var b = el('button', 'scene-item pos-' + i, c.emoji);
        // cada objeto respira no seu próprio ritmo: o cenário fica vivo
        b.style.animationDelay = (i * 0.35) + 's';
        b.onclick = function () {
          if (locked) return;
          if (c.id === step.concept) {
            locked = true;
            b.classList.add('correct');
            FX.burstFrom(b);
            praiseOverlay(env, step.lang, b).then(function () {
              resolve({ kind: 'listen', result: misses === 0 ? 'ok' : 'helped' });
            });
          } else {
            b.classList.add('faded');
            FX.nudge(b);
            misses++;
            if (misses >= 3) {
              locked = true;
              speakField(env, step.lang, step.concept, 'word', { slow: true }).then(function () {
                resolve({ kind: 'listen', result: 'hard' });
              });
            } else {
              encourage(env, step.lang).then(function () { speakField(env, step.lang, step.concept, 'q'); });
            }
          }
        };
        scene.appendChild(b);
      });
      container.appendChild(el('div', 'task-hint', '🔍'));
      container.appendChild(scene);
      speakField(env, step.lang, step.concept, 'q'); // "Onde está …?"
    });
  }

  /* Qual imagem desapareceu? */
  function missingImage(env, step, container) {
    return new Promise(function (resolve) {
      var ids = (step.concepts && step.concepts.length >= 3 ? step.concepts.slice(-3) : [step.concept].concat(distractors(step.concept, 2)));
      ids = shuffle(ids);
      var gone = ids[Math.floor(Math.random() * ids.length)];
      var row = el('div', 'memory-row');
      ids.forEach(function (id) {
        var c = CUR.get(id);
        var card = el('div', 'memory-card', '<span>' + c.emoji + '</span>');
        card.dataset.id = id;
        row.appendChild(card);
      });
      container.appendChild(el('div', 'task-hint', '🙈'));
      container.appendChild(row);

      // fala os nomes, cobre, remove um e pergunta
      var lang = step.lang;
      var chain = Promise.resolve();
      ids.forEach(function (id) {
        chain = chain.then(function () { return speakField(env, lang, id, 'word'); });
      });
      chain.then(function () {
        setTimeout(function () {
          row.querySelectorAll('.memory-card').forEach(function (c) { c.classList.add('covered'); c.innerHTML = '❓'; });
          setTimeout(function () {
            var goneEl = row.querySelector('[data-id="' + gone + '"]');
            if (goneEl) goneEl.remove();
            row.querySelectorAll('.memory-card').forEach(function (c) {
              c.classList.remove('covered');
              c.innerHTML = '<span>' + CUR.get(c.dataset.id).emoji + '</span>';
            });
            tapChoice(env, lang, gone, function () {}, container, 3).then(resolve);
          }, 900);
        }, 1600);
      });
    });
  }

  /* Arraste o objeto para o lugar correto. */
  function dragToTarget(env, step, container) {
    return new Promise(function (resolve) {
      var targetC = CUR.get(step.concept);
      var pool = shuffle([step.concept].concat(distractors(step.concept, 2)));
      container.appendChild(el('div', 'task-hint', '👉'));

      var zone = el('div', 'drop-zone', '<span class="ghost">' + targetC.emoji + '</span>');
      container.appendChild(zone);
      var row = el('div', 'drag-row');
      var misses = 0, done = false;

      pool.forEach(function (id) {
        var c = CUR.get(id);
        var item = el('button', 'drag-item', c.emoji);
        item.style.touchAction = 'none';
        item.addEventListener('pointerdown', function (ev) {
          if (done) return;
          item.setPointerCapture(ev.pointerId);
          var startX = ev.clientX, startY = ev.clientY;
          item.classList.add('dragging');
          function move(e2) {
            item.style.transform = 'translate(' + (e2.clientX - startX) + 'px,' + (e2.clientY - startY) + 'px) scale(1.15)';
          }
          function up(e2) {
            item.removeEventListener('pointermove', move);
            item.removeEventListener('pointerup', up);
            item.classList.remove('dragging');
            var z = zone.getBoundingClientRect();
            var inside = e2.clientX >= z.left && e2.clientX <= z.right && e2.clientY >= z.top && e2.clientY <= z.bottom;
            item.style.transform = '';
            if (!inside) return;
            if (id === step.concept) {
              done = true;
              zone.innerHTML = '<span class="landed">' + c.emoji + '</span>';
              zone.classList.add('filled');
              FX.burstFrom(zone);
              praiseOverlay(env, step.lang, zone).then(function () {
                resolve({ kind: 'listen', result: misses === 0 ? 'ok' : 'helped' });
              });
            } else {
              misses++;
              item.classList.add('faded');
              if (misses >= 2) {
                done = true;
                speakField(env, step.lang, step.concept, 'word', { slow: true }).then(function () {
                  resolve({ kind: 'listen', result: 'hard' });
                });
              } else {
                encourage(env, step.lang).then(function () { speakField(env, step.lang, step.concept, 'word'); });
              }
            }
          }
          item.addEventListener('pointermove', move);
          item.addEventListener('pointerup', up);
        });
        row.appendChild(item);
      });
      container.appendChild(row);
      speakField(env, step.lang, step.concept, 'word');
    });
  }

  /* Ouça e repita — com reconhecimento de voz quando permitido/possível.
   * Sem reconhecimento: fluxo honesto de "repetir junto" (conta como
   * 'repetido com ajuda', nunca como fala verificada). */
  function repeatAloud(env, step, container) {
    return new Promise(function (resolve) {
      var c = CUR.get(step.concept);
      var e = entry(env, step.lang, step.concept);
      var card = el('div', 'stage-card');
      card.appendChild(el('div', 'hero-emoji', c.emoji));
      card.appendChild(el('div', '', wordLabel(env, e)));
      card.appendChild(el('div', 'task-hint', '🗣️'));
      card.appendChild(replayBar(env, step.lang, step.concept, 'word'));
      container.appendChild(card);

      var canListen = env.profile.allowSpeech && SPEECH.available();
      var attempts = 0;

      function finish(result) { resolve({ kind: 'speak', result: result }); }

      function targets() {
        var t = [e.word];
        if (e.syn) t.push(e.syn.replace(/\s*\(.*\)/, ''));
        if (e.rom) t.push(e.rom);
        if (e.var) Object.keys(e.var).forEach(function (k) { t.push(e.var[k]); });
        return t;
      }

      if (canListen) {
        var mic = el('button', 'btn-mic', '🎤');
        mic.setAttribute('aria-label', 'Falar');
        var status = el('div', 'mic-status', '');
        card.appendChild(mic); card.appendChild(status);

        mic.onclick = function () {
          mic.disabled = true;
          mic.classList.add('listening');
          FX.mascotMood('listen');
          FX.buzz(12);
          status.innerHTML = '<span class="wave"><i></i><i></i><i></i><i></i><i></i></span>';
          SPEECH.listen(env.ttsTag(step.lang), { timeoutMs: 6000 }).then(function (r) {
            mic.classList.remove('listening');
            status.innerHTML = '';
            attempts++;
            if (r.status === 'unavailable') {
              // sem confiança/suporte: não penalizar — cai no fluxo assistido
              fallbackFlow();
              return;
            }
            var grade = r.status === 'heard' ? SPEECH.assess(r.transcript, targets()) : 'try';
            if (grade === 'good') {
              FX.burstFrom(mic);
              praiseOverlay(env, step.lang, mic).then(function () { finish('ok'); });
            } else if (attempts >= 3) {
              // marca silenciosamente para revisão, sem constranger
              AUDIO.speak(ALMOST[step.lang] || ALMOST.pt, env.ttsTag(step.lang))
                .then(function () { finish(grade === 'close' ? 'helped' : 'hard'); });
            } else {
              status.textContent = '';
              AUDIO.speak(ALMOST[step.lang] || ALMOST.pt, env.ttsTag(step.lang))
                .then(function () { return speakField(env, step.lang, step.concept, 'word', { slow: attempts >= 2 }); })
                .then(function () { mic.disabled = false; });
            }
          });
        };
        speakField(env, step.lang, step.concept, 'word').then(function () { mic.disabled = false; });
      } else {
        fallbackFlow();
      }

      function fallbackFlow() {
        // "Repita junto": personagem fala, criança repete em voz alta,
        // um toque confirma que repetiu (sem verificação automática).
        var old = card.querySelector('.btn-mic'); if (old) old.remove();
        var oldS = card.querySelector('.mic-status'); if (oldS) oldS.remove();
        var okBtn = el('button', 'btn-said', '✅');
        okBtn.setAttribute('aria-label', 'Repeti!');
        card.appendChild(okBtn);
        speakField(env, step.lang, step.concept, 'word', { slow: false });
        okBtn.onclick = function () {
          FX.burstFrom(okBtn);
          praiseOverlay(env, step.lang, okBtn).then(function () { finish('helped'); });
        };
      }
    });
  }

  /* Desafio de comparação (5-7 anos): quem falou? */
  function compare(env, step, container) {
    return new Promise(function (resolve) {
      var langs = step.langs;
      var pool = CUR.concepts.filter(function (c) { return c.day <= env.profile.journeyDay; });
      var c = pool.length ? shuffle(pool)[0] : CUR.concepts[0];
      var spoken = langs[Math.floor(Math.random() * langs.length)];

      container.appendChild(el('div', 'task-hint', '👂'));
      container.appendChild(el('div', 'hero-emoji hero-small', c.emoji));
      var row = el('div', 'options options-2');
      var misses = 0, locked = false;
      langs.forEach(function (l) {
        var L = LANGS.get(l);
        var card = el('button', 'option-card char-card',
          '<span class="opt-emoji">' + L.character.emoji + '</span><span class="char-name">' + L.character.name + '</span>');
        card.style.borderColor = L.color;
        card.onclick = function () {
          if (locked) return;
          if (l === spoken) {
            locked = true;
            card.classList.add('correct');
            FX.burstFrom(card);
            praiseOverlay(env, spoken, card).then(function () {
              resolve({ kind: 'listen', result: misses === 0 ? 'ok' : 'helped' });
            });
          } else {
            misses++;
            card.classList.add('faded');
            if (misses >= 2) { locked = true; resolve({ kind: 'listen', result: 'hard' }); }
            else encourage(env, spoken).then(play);
          }
        };
        row.appendChild(card);
      });
      container.appendChild(row);
      function play() { speakField(env, spoken, c.id, 'word'); }
      play();
    });
  }

  /* Vinhetas sem pontuação */
  function welcome(env, step, container) {
    return new Promise(function (resolve) {
      var lang0 = env.profile.langs[0];
      var L = LANGS.get(lang0);
      var card = el('div', 'stage-card welcome-card');
      card.appendChild(el('div', 'hero-emoji bounce', L.character.emoji));
      container.appendChild(card);
      AUDIO.jingle(L.jingle);
      var hello = { pt: 'Olá! Vamos brincar?', en: 'Hello! Let’s play!', de: 'Hallo! Spielen wir!', es: '¡Hola! ¡A jugar!', fr: 'Bonjour ! On joue ?', it: 'Ciao! Giochiamo!', tr: 'Merhaba! Hadi oynayalım!', zh: '你好！我们一起玩吧！', ja: 'こんにちは！あそぼう！' };
      AUDIO.speak(hello[lang0] || hello.pt, env.ttsTag(lang0)).then(function () {
        setTimeout(function () { resolve({ kind: null, result: null }); }, 400);
      });
    });
  }

  function langIntro(env, step, container) {
    return new Promise(function (resolve) {
      var L = LANGS.get(step.lang);
      var card = el('div', 'stage-card lang-intro');
      card.style.background = L.colorSoft;
      card.appendChild(el('div', 'hero-emoji bounce', L.character.emoji));
      card.appendChild(el('div', 'char-name big', L.character.name));
      container.appendChild(card);
      AUDIO.jingle(L.jingle);
      setTimeout(function () { resolve({ kind: null, result: null }); }, 1400);
    });
  }

  function celebrate(env, step, container) {
    return new Promise(function (resolve) {
      var lang0 = env.profile.langs[0];
      var L = LANGS.get(lang0);
      var card = el('div', 'stage-card celebrate-card');
      // Os personagens de todos os idiomas do dia comemoram juntos.
      var troupe = el('div', 'troupe');
      env.profile.langs.forEach(function (l, i) {
        var c = el('span', 'troupe-char', LANGS.get(l).character.emoji);
        c.style.animationDelay = (i * 0.14) + 's';
        troupe.appendChild(c);
      });
      card.appendChild(el('div', 'hero-emoji bounce', '🎉'));
      card.appendChild(troupe);
      FX.confetti(card, 22);
      container.appendChild(card);
      AUDIO.chimeGood();
      FX.buzz([16, 60, 16, 60, 24]);
      AUDIO.jingle(L.jingle);
      AUDIO.speak(PRAISE[lang0] || PRAISE.pt, env.ttsTag(lang0)).then(function () {
        setTimeout(function () { resolve({ kind: null, result: null }); }, 1200);
      });
    });
  }

  /* Dispatcher */
  /* Humor do mascote por tipo de atividade: ele "pensa" quando a criança
   * escolhe, "escuta" quando ela fala, some quando o palco já é dele. */
  var MOODS = {
    listen_tap: 'think', review: 'think', game: 'think', compare: 'listen',
    repeat: 'listen', present: 'idle', tpr: 'think',
    cloze: 'listen', name_it: 'listen', use_it: 'listen'
  };

  function run(step, env, container) {
    var stage = container.parentElement;
    var L = step.lang ? LANGS.get(step.lang) : null;

    return FX.leave(container).then(function () {
      container.innerHTML = '';
      stage.style.setProperty('--lang-color', L ? L.color : '#7C5CF0');
      stage.style.setProperty('--lang-soft', L ? L.colorSoft : '#EDE7FE');
      stage.style.setProperty('--lang-deep', L ? (L.colorDeep || L.color) : '#5B3FC4');

      // O personagem-guia acompanha a criança, menos quando ele é o conteúdo.
      if (L && step.type !== 'welcome' && step.type !== 'lang_intro' && step.type !== 'celebrate') {
        FX.mascot(stage, L.character.emoji, L.color);
        FX.mascotMood(MOODS[step.type] || 'idle');
      } else {
        FX.mascotHide();
      }

      var result = dispatch(step, env, container);
      montarCabecalho(step, container);
      FX.enter(container);
      return result;
    });
  }

  /* Mapa degrau-da-escada → atividade. É por aqui que a progressão
   * pedagógica vira tela: cada conceito recebe a atividade que corresponde
   * ao que a criança já consegue fazer com ele. */
  function byActivity(activity, env, step, container) {
    switch (activity) {
      case 'present': return present(env, step, container);
      case 'listen_tap': return listenTap(env, step, container);
      case 'tpr': return followInstruction(env, step, container);
      case 'repeat': return repeatAloud(env, step, container);
      case 'cloze': return g.LUMI_ACT_PRODUCE.cloze(env, step, container);
      case 'name_it': return g.LUMI_ACT_PRODUCE.nameIt(env, step, container);
      case 'use_it': return g.LUMI_ACT_PRODUCE.useIt(env, step, container);
      default: return listenTap(env, step, container);
    }
  }

  /* Move a dica da tarefa (👂 🔍 🗣️ …) para o balão do personagem.
   *
   * Antes ela ficava solta no meio do palco e o topo da tela vazio: a criança
   * via um ícone sem dono. Agora o personagem do idioma segura a instrução —
   * fica claro QUEM está pedindo, e a tela ganha começo, meio e fim. */
  function montarCabecalho(step, container) {
    var header = document.getElementById('act-header');
    var bubble = document.getElementById('act-bubble');
    if (!header || !bubble) return;
    bubble.innerHTML = '';
    var hint = container.querySelector('.task-hint');
    var temMascote = header.querySelector('.mascot');
    if (hint && temMascote) {
      bubble.appendChild(hint);          // move (não copia): sai do palco
      header.classList.add('on');
    } else {
      header.classList.toggle('on', !!temMascote);
    }
  }

  function dispatch(step, env, container) {
    switch (step.type) {
      case 'welcome': return welcome(env, step, container);
      case 'lang_intro': return langIntro(env, step, container);
      case 'present': return present(env, step, container);
      case 'listen_tap': return listenTap(env, step, container);
      case 'repeat': return repeatAloud(env, step, container);
      case 'review':
        // A revisão não é sorteada: a sessão já decidiu o degrau da escada
        // em que esta criança está com ESTE conceito (js/ladder.js).
        if (step.mode === 'listen') return listenTap(env, step, container, 3);
        return byActivity(step.activity || 'listen_tap', env, step, container);
      case 'game':
        var X = g.LUMI_ACT_EXTRA || {};
        switch (step.game) {
          case 'find_in_scene': return findInScene(env, pickGameStep(step), container);
          case 'missing_image': return missingImage(env, pickGameStep(step), container);
          case 'drag_to_target': return dragToTarget(env, pickGameStep(step), container);
          case 'sound_match': return soundMatch(env, pickGameStep(step), container);
          case 'follow_instruction': return followInstruction(env, pickGameStep(step), container);
          case 'memory_pairs': return X.memoryPairs(env, step, container);
          case 'imitate': return X.imitate(env, pickGameStep(step), container);
          default: return listenTap(env, pickGameStep(step), container);
        }
      case 'tpr': return followInstruction(env, step, container);
      case 'cloze': return g.LUMI_ACT_PRODUCE.cloze(env, step, container);
      case 'name_it': return g.LUMI_ACT_PRODUCE.nameIt(env, step, container);
      case 'use_it': return g.LUMI_ACT_PRODUCE.useIt(env, step, container);
      case 'story': return g.LUMI_ACT_EXTRA.story(env, step, container);
      case 'song': return g.LUMI_ACT_EXTRA.song(env, step, container);
      case 'home_hunt': return g.LUMI_ACT_EXTRA.homeHunt(env, step, container);
      case 'compare': return compare(env, step, container);
      case 'celebrate': return celebrate(env, step, container);
      default: return Promise.resolve({ kind: null, result: null });
    }
  }

  function pickGameStep(step) {
    var ids = step.concepts && step.concepts.length ? step.concepts : [step.concept];
    return { type: step.type, lang: step.lang, concept: ids[Math.floor(Math.random() * ids.length)], concepts: ids };
  }

  /* Utilitários compartilhados com activities-extra.js (novas atividades
   * moram lá para manter cada arquivo legível). */
  g.LUMI_ACT = {
    run: run, PRAISE: PRAISE,
    helpers: {
      el: el, shuffle: shuffle, distractors: distractors, entry: entry,
      speakField: speakField, praiseOverlay: praiseOverlay, encourage: encourage,
      wordLabel: wordLabel, replayBar: replayBar, bigNext: bigNext,
      tapChoice: tapChoice, byActivity: byActivity, PRAISE: PRAISE, ALMOST: ALMOST
    }
  };
})(typeof window !== 'undefined' ? window : globalThis);
