/* LumiLínguas — Atividades dinâmicas complementares.
 * Fecham a lista de modos previstos na especificação e dão variedade ao dia:
 *   memoryPairs — jogo da memória auditiva (som ↔ imagem)
 *   imitate     — imite o personagem (gesto + fala, sem verificação)
 *   story       — minibiografia/história interativa com escolha da criança
 *   song        — música/rima original gerada a partir do vocabulário do dia
 *   homeHunt    — caça ao objeto dentro de casa, com os responsáveis
 *
 * Todas seguem as mesmas regras da área infantil: uma instrução por tela,
 * sem texto obrigatório, feedback só positivo.
 */
(function (g) {
  'use strict';

  var CUR = g.LUMI_CURRICULUM, LANGS = g.LUMI_LANGS, AUDIO = g.LUMI_AUDIO, FX = g.LUMI_FX;
  var H = null; // helpers de activities.js (resolvidos na 1ª chamada)

  function h() { return H || (H = g.LUMI_ACT.helpers); }

  function el(tag, cls, html) { return h().el(tag, cls, html); }
  function speakField(env, lang, id, field, opts) { return h().speakField(env, lang, id, field, opts); }
  function praise(env, lang, src) { return h().praiseOverlay(env, lang, src); }
  function encourage(env, lang) { return h().encourage(env, lang); }
  function shuffle(a, s) { return h().shuffle(a, s); }

  /* Conceitos já vistos, para os jogos nunca estrearem conteúdo novo. */
  function playable(step, n) {
    var ids = (step.concepts && step.concepts.length) ? step.concepts.slice() : [];
    if (ids.length < n) {
      var extra = CUR.upToDay(step.journeyDay || 60).map(function (c) { return c.id; });
      extra.forEach(function (id) { if (ids.indexOf(id) < 0) ids.push(id); });
    }
    return shuffle(ids).slice(0, n);
  }

  /* ---------- 1. Jogo da memória auditiva ---------- */

  /* Cartas viradas: a criança abre uma, ouve a palavra, e procura o par.
   * Treina memória auditiva ligando som a imagem (não imagem a imagem). */
  function memoryPairs(env, step, container) {
    return new Promise(function (resolve) {
      var ids = playable(step, 3);
      var deck = shuffle(ids.concat(ids));
      var board = el('div', 'memory-board');
      var open = [], locked = false, found = 0, misses = 0;

      container.appendChild(el('div', 'task-hint', '🃏'));
      container.appendChild(board);

      deck.forEach(function (id, i) {
        var card = el('button', 'flip-card', '<span class="flip-inner">' +
          '<span class="flip-back">❓</span>' +
          '<span class="flip-front">' + CUR.get(id).emoji + '</span></span>');
        card.dataset.id = id;
        card.dataset.slot = i;
        card.onclick = function () {
          if (locked || card.classList.contains('open') || card.classList.contains('done')) return;
          card.classList.add('open');
          FX.buzz(10);
          speakField(env, step.lang, id, 'word');
          open.push(card);
          if (open.length < 2) return;

          locked = true;
          var a = open[0], b = open[1];
          if (a.dataset.id === b.dataset.id) {
            setTimeout(function () {
              a.classList.add('done'); b.classList.add('done');
              FX.burstFrom(b);
              found++;
              open = []; locked = false;
              if (found === ids.length) {
                praise(env, step.lang, b).then(function () {
                  resolve({ kind: 'listen', result: misses <= 2 ? 'ok' : 'helped' });
                });
              } else {
                AUDIO.chimeGood();
              }
            }, 520);
          } else {
            misses++;
            setTimeout(function () {
              a.classList.remove('open'); b.classList.remove('open');
              open = []; locked = false;
              // sem sons negativos: só um convite calmo a tentar de novo
              if (misses === 4) encourage(env, step.lang);
            }, 1100);
          }
        };
        board.appendChild(card);
      });

      // apresenta os sons antes de começar, para haver o que lembrar
      var chain = Promise.resolve();
      ids.forEach(function (id) {
        chain = chain.then(function () { return speakField(env, step.lang, id, 'word'); });
      });
    });
  }

  /* ---------- 2. Imite o personagem ---------- */

  var IMITATE_GESTURES = [
    { emoji: '👏', key: 'clap' }, { emoji: '🙌', key: 'raise' },
    { emoji: '🦘', key: 'jump' }, { emoji: '🐢', key: 'slow' },
    { emoji: '💃', key: 'dance' }, { emoji: '🤫', key: 'quiet' }
  ];

  /* O personagem faz um gesto e fala a palavra; a criança imita e confirma.
   * Corpo + voz juntos fixam melhor que repetição sentada. */
  function imitate(env, step, container) {
    return new Promise(function (resolve) {
      var L = LANGS.get(step.lang);
      var gesture = IMITATE_GESTURES[(step.journeyDay || 1) % IMITATE_GESTURES.length];
      var card = el('div', 'stage-card imitate-card');
      card.appendChild(el('div', 'imitate-char', L.character.emoji));
      card.appendChild(el('div', 'imitate-gesture', gesture.emoji));
      card.appendChild(el('div', 'task-hint', '🪞'));
      container.appendChild(card);

      var go = el('button', 'btn-said', '✅');
      go.setAttribute('aria-label', 'Fiz igual!');
      container.appendChild(go);

      speakField(env, step.lang, step.concept, 'act');
      go.onclick = function () {
        FX.burstFrom(go);
        praise(env, step.lang, go).then(function () {
          resolve({ kind: 'speak', result: 'helped' });
        });
      };
    });
  }

  /* ---------- 3. História interativa ---------- */

  /* Três cenas curtas: o personagem narra e, no fim de cada uma, a criança
   * escolhe o que acontece tocando numa imagem. A escolha não tem certo nem
   * errado — o que importa é ouvir a frase inteira em contexto. */
  function story(env, step, container) {
    return new Promise(function (resolve) {
      var L = LANGS.get(step.lang);
      var cast = playable(step, 3);
      var scene = 0, answered = 0, helped = 0;

      var card = el('div', 'stage-card story-card');
      var narrator = el('div', 'story-narrator', L.character.emoji);
      var stageArea = el('div', 'story-scene');
      var choices = el('div', 'options options-2 story-choices');
      card.appendChild(narrator);
      card.appendChild(stageArea);
      container.appendChild(card);
      container.appendChild(choices);

      function playScene() {
        if (scene >= cast.length) {
          praise(env, step.lang, narrator).then(function () {
            resolve({ kind: 'listen', result: helped > 1 ? 'helped' : 'ok' });
          });
          return;
        }
        var hero = cast[scene];
        var other = cast[(scene + 1) % cast.length];
        stageArea.innerHTML = '';
        var heroEl = el('span', 'story-hero', CUR.get(hero).emoji);
        stageArea.appendChild(heroEl);
        choices.innerHTML = '';
        narrator.classList.add('talking');

        // narra: frase → pergunta, e então a criança escolhe
        speakField(env, step.lang, hero, 'sen')
          .then(function () { return speakField(env, step.lang, hero, 'q'); })
          .then(function () {
            narrator.classList.remove('talking');
            shuffle([hero, other]).forEach(function (id) {
              var b = el('button', 'option-card', '<span class="opt-emoji">' + CUR.get(id).emoji + '</span>');
              b.onclick = function () {
                if (b.disabled) return;
                choices.querySelectorAll('button').forEach(function (x) { x.disabled = true; });
                FX.burstFrom(b);
                AUDIO.chimeGood();
                answered++;
                if (id !== hero) helped++;
                // qualquer escolha vira história: responde com a frase do que ela tocou
                speakField(env, step.lang, id, 'a').then(function () {
                  scene++;
                  setTimeout(playScene, 350);
                });
              };
              choices.appendChild(b);
            });
            FX.enter(choices);
          });
      }
      playScene();
    });
  }

  /* ---------- 4. Música e rima ---------- */

  /* Rima original montada com o vocabulário do dia: uma melodia simples
   * toca enquanto as palavras aparecem no ritmo. Cantar fixa prosódia —
   * por isso a palavra é repetida três vezes em compasso. */
  function song(env, step, container) {
    return new Promise(function (resolve) {
      var L = LANGS.get(step.lang);
      var words = playable(step, 3);
      var card = el('div', 'stage-card song-card');
      card.appendChild(el('div', 'task-hint', '🎵'));
      var stage = el('div', 'song-stage');
      card.appendChild(stage);
      container.appendChild(card);

      var notes = el('div', 'song-notes');
      ['🎵', '🎶', '🎵', '🎶', '🎵'].forEach(function (n, i) {
        var s = el('span', 'song-note', n);
        s.style.animationDelay = (i * 0.32) + 's';
        notes.appendChild(s);
      });
      card.appendChild(notes);

      var chain = Promise.resolve();
      words.forEach(function (id, wi) {
        chain = chain.then(function () {
          stage.innerHTML = '';
          var e = el('div', 'song-word', CUR.get(id).emoji);
          stage.appendChild(e);
          AUDIO.jingle(L.jingle);
          // três repetições em compasso: a rima nasce da repetição
          return speakField(env, step.lang, id, 'word')
            .then(function () { return speakField(env, step.lang, id, 'word'); })
            .then(function () { return speakField(env, step.lang, id, 'adj'); })
            .then(function () {
              FX.burstFrom(e, [L.color]);
              return new Promise(function (r) { setTimeout(r, 250); });
            });
        });
      });

      chain.then(function () {
        AUDIO.jingle(L.jingle);
        praise(env, step.lang, stage).then(function () {
          resolve({ kind: 'listen', result: 'ok' });
        });
      });
    });
  }

  /* ---------- 5. Caça ao objeto dentro de casa ---------- */

  /* Sai da tela: o app pede um objeto real e a criança vai buscar em casa
   * com o adulto. Volta tocando no botão — a palavra passa a existir fora
   * do aplicativo, que é o objetivo final da jornada. */
  function homeHunt(env, step, container) {
    return new Promise(function (resolve) {
      var c = CUR.get(step.concept);
      var e = h().entry(env, step.lang, step.concept);
      var L = LANGS.get(step.lang);

      var card = el('div', 'stage-card hunt-card');
      card.appendChild(el('div', 'hunt-target', c.emoji));
      card.appendChild(el('div', 'task-hint', '🏃'));
      card.appendChild(el('div', '', h().wordLabel(env, e)));
      card.appendChild(h().replayBar(env, step.lang, step.concept, 'q'));
      container.appendChild(card);

      // nota curta para o adulto que está por perto (a criança não precisa ler)
      container.appendChild(el('p', 'hunt-parent-note',
        'Procurem juntos: ' + (e ? e.word : '') + ' (' + L.name + ')'));

      var found = el('button', 'btn-said', '🎉');
      found.setAttribute('aria-label', 'Achei!');
      container.appendChild(found);

      speakField(env, step.lang, step.concept, 'q'); // "Onde está …?"
      FX.highlight(found);

      found.onclick = function () {
        FX.burstFrom(found);
        speakField(env, step.lang, step.concept, 'a').then(function () {
          return praise(env, step.lang, found);
        }).then(function () {
          resolve({ kind: 'listen', result: 'ok' });
        });
      };
    });
  }

  g.LUMI_ACT_EXTRA = {
    memoryPairs: memoryPairs, imitate: imitate,
    story: story, song: song, homeHunt: homeHunt
  };
})(typeof window !== 'undefined' ? window : globalThis);
