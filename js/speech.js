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

  var api = { available: available, listen: listen, assess: assess, _normalize: normalize, _levenshtein: levenshtein };
  g.LUMI_SPEECH = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
