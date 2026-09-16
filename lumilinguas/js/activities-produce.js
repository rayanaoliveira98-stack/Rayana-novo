/* LumiLínguas — Atividades de produção (a criança fala o que está aprendendo).
 *
 * São os degraus altos da escada (js/ladder.js), na ordem em que a didática
 * os prevê — do apoio máximo ao nenhum apoio:
 *   cloze  — o personagem começa a frase e para; a criança completa
 *   nameIt — só a imagem: "o que é isso?", sem modelo antes
 *   useIt  — pergunta de verdade, resposta em contexto
 *
 * Princípios aplicados em todas:
 * — Apoio do menor para o maior (least-to-most): o modelo só aparece DEPOIS
 *   que a criança tentou sozinha, nunca antes — senão ela apenas imita.
 * — Nunca forçar fala: silêncio não é erro. Devolve 'silent', e a escada
 *   recua sozinha para o degrau corporal.
 * — A verificação usa detecção de voz (funciona em qualquer aparelho) e,
 *   quando o navegador oferece, também o reconhecimento de fala.
 */
(function (g) {
  'use strict';

  var CUR = g.LUMI_CURRICULUM, LANGS = g.LUMI_LANGS,
      AUDIO = g.LUMI_AUDIO, SPEECH = g.LUMI_SPEECH, FX = g.LUMI_FX;
  var H = null;
  function h() { return H || (H = g.LUMI_ACT.helpers); }
  function el(t, c, m) { return h().el(t, c, m); }
  function speakField(env, l, id, f, o) { return h().speakField(env, l, id, f, o); }
  function praise(env, l, s) { return h().praiseOverlay(env, l, s); }

  /* Frases de sala, por idioma — o que o personagem diz para eliciar a fala. */
  var ASK_WHAT = {
    pt: 'O que é isso?', en: 'What is this?', de: 'Was ist das?', es: '¿Qué es esto?',
    fr: "Qu'est-ce que c'est ?", it: "Che cos'è?", tr: 'Bu ne?', zh: '这是什么？', ja: 'これは なに？'
  };
  var YOUR_TURN = {
    pt: 'Agora você!', en: 'Your turn!', de: 'Du bist dran!', es: '¡Tu turno!',
    fr: 'À toi !', it: 'Tocca a te!', tr: 'Sıra sende!', zh: '该你了！', ja: 'きみの ばん！'
  };
  var NO_RUSH = {
    pt: 'Sem pressa. Escuta comigo!', en: 'No rush. Listen with me!',
    de: 'Ganz in Ruhe. Hör mit mir zu!', es: 'Sin prisa. ¡Escucha conmigo!',
    fr: 'Rien ne presse. Écoute avec moi !', it: 'Con calma. Ascolta con me!',
    tr: 'Acelesi yok. Benimle dinle!', zh: '不着急，我们一起听！', ja: 'ゆっくりで いいよ。いっしょに きこう！'
  };

  /* ---------- escuta compartilhada ---------- */

  /* Ouve uma tentativa da criança e devolve:
   *   'ok'     — falou e bateu com o alvo (ou falou, quando não há como checar)
   *   'close'  — falou algo próximo
   *   'silent' — não saiu som nenhum
   *   'unknown'— sem microfone/permissão: não dá para avaliar, não penaliza
   * Nunca devolve "errado": pronúncia infantil não é erro.
   */
  function ouvirCrianca(env, lang, alvos, ui) {
    var usaRec = env.profile.allowSpeech && SPEECH.available();

    function comNivel(n) { if (ui && ui.onLevel) ui.onLevel(n); }

    // Sem permissão de voz: a criança fala mesmo assim (em voz alta, para o
    // adulto), e confirma no botão. Continua sendo produção — só não é medida.
    if (!env.profile.allowSpeech) return Promise.resolve('unknown');

    if (usaRec) {
      return SPEECH.listen(env.ttsTag(lang), { timeoutMs: 6000 }).then(function (r) {
        if (r.status === 'heard') {
          var nota = SPEECH.assess(r.transcript, alvos);
          return nota === 'good' ? 'ok' : (nota === 'close' ? 'close' : 'close');
        }
        if (r.status === 'silent') {
          // O reconhecimento não pegou nada: confere se houve som antes de
          // concluir que a criança ficou calada.
          return SPEECH.voiceSupported()
            ? SPEECH.detectVoice({ timeoutMs: 3000, onLevel: comNivel })
                .then(function (v) { return v.spoke ? 'close' : 'silent'; })
            : 'silent';
        }
        return 'unknown';
      });
    }

    if (SPEECH.voiceSupported()) {
      return SPEECH.detectVoice({ timeoutMs: 5000, onLevel: comNivel })
        .then(function (v) {
          if (v.spoke === null) return 'unknown';
          return v.spoke ? 'ok' : 'silent';
        });
    }
    return Promise.resolve('unknown');
  }

  /* Alvos aceitáveis para um conceito (palavra, sinônimo, romanização, variantes). */
  function alvosDe(e) {
    var t = [e.word];
    if (e.syn) t.push(String(e.syn).replace(/\s*\(.*\)/, ''));
    if (e.rom) t.push(e.rom);
    if (e.a) t.push(e.a);
    if (e.var) Object.keys(e.var).forEach(function (k) { t.push(e.var[k]); });
    return t;
  }

  /* Botão de microfone com onda reativa ao volume real da voz. */
  function micWidget(card) {
    var mic = el('button', 'btn-mic', '🎤');
    mic.setAttribute('aria-label', 'Falar');
    var onda = el('div', 'mic-status', '');
    card.appendChild(mic);
    card.appendChild(onda);
    return {
      mic: mic,
      ouvindo: function (lig) {
        mic.classList.toggle('listening', !!lig);
        mic.disabled = !!lig;
        onda.innerHTML = lig ? '<span class="wave live"><i></i><i></i><i></i><i></i><i></i></span>' : '';
        FX.mascotMood(lig ? 'listen' : 'idle');
      },
      onLevel: function (n) {
        var w = onda.querySelector('.wave');
        if (w) w.style.setProperty('--live', (0.4 + n * 0.9).toFixed(2));
      }
    };
  }

  /* Núcleo comum dos três degraus produtivos.
   * elicia() toca o estímulo; o modelo só vem depois da tentativa. */
  function rodarProducao(env, step, container, cfg) {
    return new Promise(function (resolve) {
      var c = CUR.get(step.concept);
      var e = h().entry(env, step.lang, step.concept);
      var lang = step.lang;
      var card = el('div', 'stage-card produce-card');

      card.appendChild(el('div', 'task-hint', cfg.hint));
      var palco = el('div', 'produce-stage', cfg.stageHtml(c, e, lang));
      card.appendChild(palco);
      container.appendChild(card);

      /* A palavra escrita é apoio DEPOIS da tentativa, jamais antes: se ela
       * estiver na tela, a criança lê em vez de buscar na memória — e o
       * degrau deixa de ser produção. */
      var rotulo = el('div', 'produce-label', '');
      card.appendChild(rotulo);
      function mostrarApoioEscrito() {
        if (env.textSupport && !rotulo.innerHTML) rotulo.innerHTML = h().wordLabel(env, e);
      }

      var w = micWidget(card);
      var tentativas = 0;
      var deuModelo = false;

      function fim(resultado) {
        w.ouvindo(false);
        resolve({ kind: 'speak', result: resultado, phase: cfg.phase });
      }

      // Estímulo: a pergunta/frase incompleta. NUNCA a palavra-alvo antes da
      // tentativa — é isso que separa produção de imitação.
      function elicia() {
        return cfg.elicia(env, step, e, palco).then(function () {
          return AUDIO.speak(YOUR_TURN[lang] || YOUR_TURN.pt, env.ttsTag(lang));
        });
      }

      function tentar() {
        tentativas++;
        w.ouvindo(true);
        FX.highlight(w.mic);
        ouvirCrianca(env, lang, alvosDe(e), w).then(function (r) {
          w.ouvindo(false);

          if (r === 'ok') {
            FX.burstFrom(w.mic);
            return praise(env, lang, w.mic).then(function () {
              fim(deuModelo ? 'helped' : 'ok');
            });
          }

          if (r === 'unknown') {
            // Sem microfone (ou sem permissão) não há como medir a voz. A
            // criança fala em voz alta para quem estiver junto e confirma.
            // O modelo NÃO vem de graça: continua valendo a hierarquia de
            // apoio — ela tenta primeiro, e só pede ajuda se precisar.
            w.mic.remove();
            var linha = el('div', 'produce-actions');
            var ajuda = el('button', 'btn-round btn-help', '👂');
            ajuda.setAttribute('aria-label', 'Ouvir a palavra');
            var ok = el('button', 'btn-said', '✅');
            ok.setAttribute('aria-label', 'Eu falei!');
            linha.appendChild(ajuda);
            linha.appendChild(ok);
            card.appendChild(linha);
            FX.highlight(ok);

            var pediuAjuda = false;
            ajuda.onclick = function () {
              pediuAjuda = true;
              mostrarApoioEscrito();
              speakField(env, lang, step.concept, cfg.modelField || 'word');
            };
            ok.onclick = function () {
              FX.burstFrom(ok);
              praise(env, lang, ok).then(function () {
                // falou sem pedir o modelo = produção própria
                fim(pediuAjuda ? 'helped' : 'ok');
              });
            };
            return;
          }

          if (r === 'silent') {
            // Silêncio não é erro: é sinal de que ela ainda está escutando.
            if (tentativas >= 2) {
              AUDIO.chimeSoft();
              mostrarApoioEscrito();
              return AUDIO.speak(NO_RUSH[lang] || NO_RUSH.pt, env.ttsTag(lang))
                .then(function () { return speakField(env, lang, step.concept, 'word', { slow: true }); })
                .then(function () { fim('silent'); });
            }
            return AUDIO.speak(NO_RUSH[lang] || NO_RUSH.pt, env.ttsTag(lang))
              .then(elicia).then(tentar);
          }

          // 'close': tentou e chegou perto. Agora sim entra o apoio —
          // do menor para o maior, só depois da tentativa própria.
          if (tentativas >= 3) {
            return AUDIO.speak(h().ALMOST[lang] || h().ALMOST.pt, env.ttsTag(lang))
              .then(function () { fim('helped'); });
          }
          deuModelo = true;
          mostrarApoioEscrito();
          AUDIO.speak(h().ALMOST[lang] || h().ALMOST.pt, env.ttsTag(lang))
            .then(function () {
              return speakField(env, lang, step.concept, cfg.modelField || 'word',
                { slow: tentativas >= 2 });
            })
            .then(tentar);
        });
      }

      /* "Ouvir de novo" repete o ESTÍMULO (a pergunta, o começo da frase),
       * nunca a palavra-alvo: a barra padrão entregaria a resposta e a
       * atividade deixaria de ser produção. */
      var repetir = el('button', 'btn-round btn-replay', '🔁');
      repetir.setAttribute('aria-label', 'Ouvir a pergunta de novo');
      repetir.onclick = function () { cfg.elicia(env, step, e, palco); };
      var barra = el('div', 'replay-bar');
      barra.appendChild(repetir);
      card.appendChild(barra);

      elicia().then(tentar);
    });
  }

  /* ---------- degrau 4: completar a frase (cloze) ---------- */

  function cloze(env, step, container) {
    return rodarProducao(env, step, container, {
      phase: 'cloze',
      hint: '💬',
      modelField: 'word',
      stageHtml: function (c) {
        return '<span class="cloze-img">' + c.emoji + '</span>' +
               '<span class="cloze-gap">…</span>';
      },
      /* Fala a frase SEM a última palavra e deixa o silêncio convidar.
       * É o adulto que começa e a criança que fecha — cloze clássico. */
      elicia: function (env2, step2, e, palco) {
        var frase = String(e.sen || '');
        var semAlvo = frase.replace(new RegExp(escapar(e.word) + '[.!?]*\\s*$', 'i'), '').trim();
        var pedaco = semAlvo && semAlvo.length >= 3 ? semAlvo : frase.split(' ').slice(0, -1).join(' ');
        palco.classList.add('waiting');
        return AUDIO.speak(pedaco || frase, env2.ttsTag(step2.lang));
      }
    });
  }

  function escapar(s) { return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

  /* ---------- degrau 5: falar sozinha (sem modelo) ---------- */

  function nameIt(env, step, container) {
    return rodarProducao(env, step, container, {
      phase: 'name',
      hint: '🗣️',
      modelField: 'word',
      stageHtml: function (c) { return '<span class="name-img">' + c.emoji + '</span>'; },
      /* Só a imagem e a pergunta. Nenhum modelo antes: recuperação de verdade. */
      elicia: function (env2, step2) {
        return AUDIO.speak(ASK_WHAT[step2.lang] || ASK_WHAT.pt, env2.ttsTag(step2.lang));
      }
    });
  }

  /* ---------- degrau 6: usar em conversa ---------- */

  function useIt(env, step, container) {
    return rodarProducao(env, step, container, {
      phase: 'use',
      hint: '👂🗣️',
      modelField: 'a',
      stageHtml: function (c, e, lang) {
        var L = LANGS.get(lang);
        return '<span class="use-char">' + (L ? L.character.emoji : '🦊') + '</span>' +
               '<span class="use-bubble">' + c.emoji + '❓</span>';
      },
      /* A pergunta real do conceito ("Onde está a maçã?"): a criança responde
       * com a frase, não com a palavra solta. */
      elicia: function (env2, step2, e) {
        return speakField(env2, step2.lang, step2.concept, 'q');
      }
    });
  }

  g.LUMI_ACT_PRODUCE = { cloze: cloze, nameIt: nameIt, useIt: useIt, _ouvir: ouvirCrianca };
})(typeof window !== 'undefined' ? window : globalThis);
