/* LumiLínguas — Reconhecimento de fala adequado à voz infantil.
 * Usa a Web Speech API quando o navegador oferece (Chrome/Edge/Safari);
 * a avaliação aceita variações naturais da pronúncia infantil:
 * — normaliza acentos e caixa;
 * — compara por distância de edição contra palavra, sinônimo e variações;
 * — distingue tentativa ('try'), aproximação ('close') e satisfatória ('good');
 * — sem confiança suficiente, NUNCA penaliza a criança.
 * A avaliação (assess) é pura e testável; a captura depende do navegador.
 */
(function (g) {
  'use strict';

  function available() {
    return !!(g.SpeechRecognition || g.webkitSpeechRecognition);
  }

  function normalize(s) {
    if (!s) return '';
    s = s.toLowerCase().trim();
    try { s = s.normalize('NFD').replace(/[̀-ͯ]/g, ''); } catch (e) {}
    return s.replace(/[^\p{L}\p{N} ]/gu, '').replace(/\s+/g, ' ');
  }

  function levenshtein(a, b) {
    if (a === b) return 0;
    if (!a.length) return b.length;
    if (!b.length) return a.length;
    var prev = [], cur = [];
    for (var j = 0; j <= b.length; j++) prev[j] = j;
    for (var i = 1; i <= a.length; i++) {
      cur[0] = i;
      for (var k = 1; k <= b.length; k++) {
        cur[k] = Math.min(prev[k] + 1, cur[k - 1] + 1, prev[k - 1] + (a[i - 1] === b[k - 1] ? 0 : 1));
      }
      var t = prev; prev = cur; cur = t;
    }
    return prev[b.length];
  }

  /* Compara a fala com os alvos aceitos.
   * Retorna 'good' | 'close' | 'try'. */
  function assess(transcript, targets) {
    var heard = normalize(transcript);
    if (!heard) return 'try';
    var best = 1;
    (targets || []).forEach(function (t) {
      var tgt = normalize(t);
      if (!tgt) return;
      // palavra contida na frase falada conta como acerto
      if (heard === tgt || heard.indexOf(tgt) >= 0 || tgt.indexOf(heard) >= 0) { best = 0; return; }
      var d = levenshtein(heard, tgt) / Math.max(tgt.length, 1);
      if (d < best) best = d;
    });
    if (best <= 0.34) return 'good';   // tolerante à pronúncia infantil
    if (best <= 0.6) return 'close';
    return 'try';
  }

  /* Escuta uma tentativa. Resolve com:
   * {status:'heard', transcript, confidence} | {status:'silent'} | {status:'unavailable'} */
  function listen(langTag, opts) {
    opts = opts || {};
    return new Promise(function (resolve) {
      var SR = g.SpeechRecognition || g.webkitSpeechRecognition;
      if (!SR) return resolve({ status: 'unavailable' });
      var rec;
      try { rec = new SR(); } catch (e) { return resolve({ status: 'unavailable' }); }
      rec.lang = langTag;
      rec.interimResults = false;
      rec.maxAlternatives = 4;
      var settled = false;
      function settle(v) { if (!settled) { settled = true; try { rec.stop(); } catch (e) {} resolve(v); } }
      rec.onresult = function (e) {
        var alts = [];
        var conf = 0;
        try {
          var res = e.results[0];
          for (var i = 0; i < res.length; i++) { alts.push(res[i].transcript); conf = Math.max(conf, res[i].confidence || 0); }
        } catch (err) {}
        settle(alts.length ? { status: 'heard', transcript: alts.join(' | '), alternatives: alts, confidence: conf } : { status: 'silent' });
      };
      rec.onerror = function (e) {
        settle(e && (e.error === 'no-speech') ? { status: 'silent' } : { status: 'unavailable' });
      };
      rec.onend = function () { settle({ status: 'silent' }); };
      try { rec.start(); } catch (e) { return settle({ status: 'unavailable' }); }
      setTimeout(function () { settle({ status: 'silent' }); }, opts.timeoutMs || 6000);
    });
  }


  /* ---------- Detecção de voz (a criança falou?) ----------
   * Mede a energia do microfone, sem reconhecer palavra nenhuma. Serve para
   * o que a especificação pede — "detectar se a criança realmente falou" — e
   * funciona em qualquer aparelho com microfone, mesmo sem reconhecimento de
   * fala. É o que permite a escada de produção avançar num celular simples.
   *
   * Nada do áudio é gravado, guardado ou enviado: só o volume é observado,
   * ao vivo, e descartado.
   */
  function voiceSupported() {
    return !!(g.navigator && navigator.mediaDevices && navigator.mediaDevices.getUserMedia &&
              (g.AudioContext || g.webkitAudioContext));
  }

  /* Resolve com {spoke, loudMs, peak}. onLevel recebe 0..1 para animar a onda. */
  function detectVoice(opts) {
    opts = opts || {};
    var janela = opts.timeoutMs || 5000;
    var precisaMs = opts.minVoicedMs || 320;   // ~1/3 de segundo já é uma palavra
    var limiar = opts.threshold || 0.055;      // acima do ruído de sala típico

    return new Promise(function (resolve) {
      if (!voiceSupported()) return resolve({ spoke: null, reason: 'unsupported' });
      var ctx, stream, raf, parado = false;

      function terminar(res) {
        if (parado) return;
        parado = true;
        if (raf) cancelAnimationFrame(raf);
        try { if (stream) stream.getTracks().forEach(function (t) { t.stop(); }); } catch (e) {}
        try { if (ctx && ctx.close) ctx.close(); } catch (e) {}
        resolve(res);
      }

      navigator.mediaDevices.getUserMedia({ audio: true }).then(function (s) {
        stream = s;
        ctx = new (g.AudioContext || g.webkitAudioContext)();
        var src = ctx.createMediaStreamSource(s);
        var an = ctx.createAnalyser();
        an.fftSize = 1024;
        src.connect(an);
        var buf = new Float32Array(an.fftSize);
        var t0 = Date.now(), loudMs = 0, pico = 0, ultimo = t0;

        (function ler() {
          if (parado) return;
          an.getFloatTimeDomainData(buf);
          var soma = 0;
          for (var i = 0; i < buf.length; i++) soma += buf[i] * buf[i];
          var rms = Math.sqrt(soma / buf.length);
          if (rms > pico) pico = rms;

          var agora = Date.now();
          if (rms >= limiar) loudMs += agora - ultimo;
          ultimo = agora;

          if (opts.onLevel) opts.onLevel(Math.min(1, rms / (limiar * 4)));

          if (loudMs >= precisaMs) return terminar({ spoke: true, loudMs: loudMs, peak: pico });
          if (agora - t0 >= janela) return terminar({ spoke: false, loudMs: loudMs, peak: pico });
          raf = requestAnimationFrame(ler);
        })();
      }).catch(function () {
        terminar({ spoke: null, reason: 'denied' });
      });
    });
  }

  var api = { available: available, listen: listen, assess: assess,
    voiceSupported: voiceSupported, detectVoice: detectVoice, _normalize: normalize, _levenshtein: levenshtein };
  g.LUMI_SPEECH = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
