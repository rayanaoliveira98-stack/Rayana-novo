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

  function praiseOverlay(env, lang) {
    AUDIO.chimeGood();
    var o = el('div', 'praise-overlay', '<div class="praise-star">⭐</div>');
    document.body.appendChild(o);
    setTimeout(function () { o.classList.add('show'); }, 10);
    var msg = PRAISE[lang] || PRAISE.pt;
    return AUDIO.speak(msg, env.ttsTag(lang)).then(function () {
      return new Promise(function (res) {
        setTimeout(function () { o.remove(); res(); }, 400);
      });
    });
  }

  function encourage(env, lang) {
    AUDIO.chimeSoft();
    return AUDIO.speak(LISTEN_AGAIN[lang] || LISTEN_AGAIN.pt, env.ttsTag(lang));
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
      var wrap = optionCards(env, ids, conceptId, function (id, card) {
        if (locked) return;
        if (id === conceptId) {
          locked = true;
          card.classList.add('correct');
          praiseOverlay(env, lang).then(function () {
            resolve({ kind: 'listen', result: misses === 0 ? 'ok' : 'helped' });
          });
        } else {
          card.classList.add('faded');
          misses++;
          if (misses >= 2) {
            locked = true;
            var right = wrap.querySelector('[data-id="' + conceptId + '"]');
            if (right) right.classList.add('reveal');
            speakField(env, lang, conceptId, 'word', { slow: true }).then(function () {
              setTimeout(function () { resolve({ kind: 'listen', result: 'hard' }); }, 700);
            });
          } else {
            encourage(env, lang).then(playPrompt);
          }
        }
      }, numOptions);
      container.appendChild(wrap);
      playPrompt();
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
        b.onclick = function () {
          if (locked) return;
          if (c.id === step.concept) {
            locked = true;
            b.classList.add('correct');
            praiseOverlay(env, step.lang).then(function () {
              resolve({ kind: 'listen', result: misses === 0 ? 'ok' : 'helped' });
            });
          } else {
            b.classList.add('faded');
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
              praiseOverlay(env, step.lang).then(function () {
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
          status.textContent = '…';
          SPEECH.listen(env.ttsTag(step.lang), { timeoutMs: 6000 }).then(function (r) {
            mic.classList.remove('listening');
            attempts++;
            if (r.status === 'unavailable') {
              // sem confiança/suporte: não penalizar — cai no fluxo assistido
              fallbackFlow();
              return;
            }
            var grade = r.status === 'heard' ? SPEECH.assess(r.transcript, targets()) : 'try';
            if (grade === 'good') {
              praiseOverlay(env, step.lang).then(function () { finish(attempts === 1 ? 'ok' : 'ok'); });
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
          praiseOverlay(env, step.lang).then(function () { finish('helped'); });
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
            praiseOverlay(env, spoken).then(function () {
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
      var card = el('div', 'stage-card celebrate-card');
      card.appendChild(el('div', 'hero-emoji bounce', '🎉'));
      for (var i = 0; i < 14; i++) {
        var cf = el('div', 'confetti');
        cf.style.left = (5 + Math.random() * 90) + '%';
        cf.style.animationDelay = (Math.random() * 0.8) + 's';
        cf.style.background = ['#F4B400', '#4A6CF7', '#E2574C', '#2BB673', '#8E6CF0'][i % 5];
        card.appendChild(cf);
      }
      container.appendChild(card);
      AUDIO.chimeGood();
      var lang0 = env.profile.langs[0];
      AUDIO.speak(PRAISE[lang0] || PRAISE.pt, env.ttsTag(lang0)).then(function () {
        setTimeout(function () { resolve({ kind: null, result: null }); }, 1200);
      });
    });
  }

  /* Dispatcher */
  function run(step, env, container) {
    container.innerHTML = '';
    var L = step.lang ? LANGS.get(step.lang) : null;
    container.parentElement.style.setProperty('--lang-color', L ? L.color : '#8E6CF0');
    container.parentElement.style.setProperty('--lang-soft', L ? L.colorSoft : '#EAE3FC');

    switch (step.type) {
      case 'welcome': return welcome(env, step, container);
      case 'lang_intro': return langIntro(env, step, container);
      case 'present': return present(env, step, container);
      case 'listen_tap': return listenTap(env, step, container);
      case 'repeat': return repeatAloud(env, step, container);
      case 'review':
        // revisão simplificada volta para reconhecimento visual
        if (step.mode === 'listen') return listenTap(env, step, container, 3);
        return Math.random() < 0.5 ? listenTap(env, step, container) : repeatAloud(env, step, container);
      case 'game':
        switch (step.game) {
          case 'find_in_scene': return findInScene(env, pickGameStep(step), container);
          case 'missing_image': return missingImage(env, pickGameStep(step), container);
          case 'drag_to_target': return dragToTarget(env, pickGameStep(step), container);
          case 'sound_match': return soundMatch(env, pickGameStep(step), container);
          case 'follow_instruction': return followInstruction(env, pickGameStep(step), container);
          default: return listenTap(env, pickGameStep(step), container);
        }
      case 'compare': return compare(env, step, container);
      case 'celebrate': return celebrate(env, step, container);
      default: return Promise.resolve({ kind: null, result: null });
    }
  }

  function pickGameStep(step) {
    var ids = step.concepts && step.concepts.length ? step.concepts : [step.concept];
    return { type: step.type, lang: step.lang, concept: ids[Math.floor(Math.random() * ids.length)], concepts: ids };
  }

  g.LUMI_ACT = { run: run, PRAISE: PRAISE };
})(typeof window !== 'undefined' ? window : globalThis);
