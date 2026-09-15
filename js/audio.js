/* LumiLínguas — Áudio: síntese de voz (TTS do sistema), identidade sonora,
 * feedback positivo e gravações da voz da família (MediaRecorder → IndexedDB,
 * sempre locais ao aparelho).
 */
(function (g) {
  'use strict';

  var synth = g.speechSynthesis || null;
  var audioCtx = null;
  var muted = false;

  function ctx() {
    if (!audioCtx && (g.AudioContext || g.webkitAudioContext)) {
      audioCtx = new (g.AudioContext || g.webkitAudioContext)();
    }
    return audioCtx;
  }

  /* ---------- Síntese de voz ---------- */

  var voiceCache = null;
  function loadVoices() {
    if (!synth) return [];
    var v = synth.getVoices();
    if (v && v.length) voiceCache = v;
    return voiceCache || [];
  }
  if (synth && synth.onvoiceschanged !== undefined) {
    synth.onvoiceschanged = loadVoices;
  }

  function pickVoice(langTag) {
    var voices = loadVoices();
    if (!voices.length) return null;
    var exact = voices.filter(function (v) { return v.lang.replace('_', '-').toLowerCase() === langTag.toLowerCase(); });
    if (exact.length) return exact[0];
    var prefix = langTag.split('-')[0].toLowerCase();
    var near = voices.filter(function (v) { return v.lang.toLowerCase().indexOf(prefix) === 0; });
    return near.length ? near[0] : null;
  }

  function supportsTTS() { return !!synth; }

  /* speak(texto, tag BCP-47, {slow, onend}) */
  function speak(text, langTag, opts) {
    opts = opts || {};
    return new Promise(function (resolve) {
      if (!synth || muted || !text) return resolve(false);
      try { synth.cancel(); } catch (e) {}
      var u = new SpeechSynthesisUtterance(text);
      u.lang = langTag;
      var v = pickVoice(langTag);
      if (v) u.voice = v;
      u.rate = opts.slow ? 0.62 : 0.85; // sempre um pouco mais lento p/ crianças
      u.pitch = 1.05;
      var done = false;
      function finish() { if (!done) { done = true; resolve(true); } }
      u.onend = finish;
      u.onerror = finish;
      synth.speak(u);
      // proteção: alguns navegadores não disparam onend
      setTimeout(finish, Math.max(2500, text.length * 220));
    });
  }

  function stop() { if (synth) try { synth.cancel(); } catch (e) {} }

  /* ---------- Sons curtos (WebAudio, sem arquivos) ---------- */

  function tone(freq, t0, dur, type, gain) {
    var c = ctx();
    if (!c || muted) return;
    var o = c.createOscillator();
    var gn = c.createGain();
    o.type = type || 'sine';
    o.frequency.value = freq;
    gn.gain.setValueAtTime(0.0001, c.currentTime + t0);
    gn.gain.exponentialRampToValueAtTime(gain || 0.12, c.currentTime + t0 + 0.02);
    gn.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + t0 + dur);
    o.connect(gn).connect(c.destination);
    o.start(c.currentTime + t0);
    o.stop(c.currentTime + t0 + dur + 0.05);
  }

  /* Identidade sonora do idioma: 3 notas suaves. */
  function jingle(freqs) {
    (freqs || [523, 659, 784]).forEach(function (f, i) { tone(f, i * 0.14, 0.22, 'sine', 0.1); });
  }

  /* Feedback positivo tranquilo (nunca sons negativos). */
  function chimeGood() { tone(660, 0, 0.15, 'sine', 0.1); tone(880, 0.12, 0.25, 'sine', 0.1); }
  function chimeSoft() { tone(440, 0, 0.2, 'sine', 0.07); } // "vamos ouvir de novo" — neutro e calmo

  function setMuted(m) { muted = !!m; }

  /* ---------- Gravações da família (IndexedDB local) ---------- */

  var DB_NAME = 'lumilinguas-audio';
  var DB_STORE = 'recordings';

  function openDb() {
    return new Promise(function (resolve, reject) {
      if (!g.indexedDB) return reject(new Error('IndexedDB indisponível'));
      var req = g.indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = function () { req.result.createObjectStore(DB_STORE); };
      req.onsuccess = function () { resolve(req.result); };
      req.onerror = function () { reject(req.error); };
    });
  }

  function recKey(profileId, lang, conceptId) { return profileId + ':' + lang + ':' + conceptId; }

  function saveRecording(profileId, lang, conceptId, blob) {
    return openDb().then(function (db) {
      return new Promise(function (resolve, reject) {
        var tx = db.transaction(DB_STORE, 'readwrite');
        tx.objectStore(DB_STORE).put(blob, recKey(profileId, lang, conceptId));
        tx.oncomplete = function () { resolve(true); };
        tx.onerror = function () { reject(tx.error); };
      });
    });
  }

  function getRecording(profileId, lang, conceptId) {
    return openDb().then(function (db) {
      return new Promise(function (resolve) {
        var tx = db.transaction(DB_STORE, 'readonly');
        var rq = tx.objectStore(DB_STORE).get(recKey(profileId, lang, conceptId));
        rq.onsuccess = function () { resolve(rq.result || null); };
        rq.onerror = function () { resolve(null); };
      });
    }).catch(function () { return null; });
  }

  function deleteRecordings(profileId) {
    return openDb().then(function (db) {
      return new Promise(function (resolve) {
        var tx = db.transaction(DB_STORE, 'readwrite');
        var store = tx.objectStore(DB_STORE);
        var rq = store.openCursor();
        rq.onsuccess = function () {
          var cur = rq.result;
          if (cur) {
            if (String(cur.key).indexOf(profileId + ':') === 0) cur.delete();
            cur.continue();
          }
        };
        tx.oncomplete = function () { resolve(true); };
      });
    }).catch(function () { return false; });
  }

  var currentPlayer = null;
  function playBlob(blob) {
    return new Promise(function (resolve) {
      if (muted) return resolve(false);
      if (currentPlayer) { currentPlayer.pause(); currentPlayer = null; }
      var url = URL.createObjectURL(blob);
      var a = new Audio(url);
      currentPlayer = a;
      a.onended = function () { URL.revokeObjectURL(url); resolve(true); };
      a.onerror = function () { URL.revokeObjectURL(url); resolve(false); };
      a.play().catch(function () { resolve(false); });
    });
  }

  /* Fala um item: usa a gravação da família quando existir, senão TTS. */
  function speakConcept(text, langTag, opts) {
    opts = opts || {};
    if (opts.profileId && opts.lang && opts.conceptId && !opts.slow) {
      return getRecording(opts.profileId, opts.lang, opts.conceptId).then(function (blob) {
        if (blob) return playBlob(blob);
        return speak(text, langTag, opts);
      });
    }
    return speak(text, langTag, opts);
  }

  /* Gravador simples para a área dos responsáveis. */
  function createRecorder() {
    if (!g.navigator || !navigator.mediaDevices || !g.MediaRecorder) return null;
    var mediaRecorder = null, chunks = [], stream = null;
    return {
      start: function () {
        return navigator.mediaDevices.getUserMedia({ audio: true }).then(function (s) {
          stream = s;
          chunks = [];
          mediaRecorder = new MediaRecorder(s);
          mediaRecorder.ondataavailable = function (e) { chunks.push(e.data); };
          mediaRecorder.start();
        });
      },
      stop: function () {
        return new Promise(function (resolve) {
          if (!mediaRecorder) return resolve(null);
          mediaRecorder.onstop = function () {
            var blob = new Blob(chunks, { type: mediaRecorder.mimeType || 'audio/webm' });
            if (stream) stream.getTracks().forEach(function (t) { t.stop(); });
            resolve(blob);
          };
          mediaRecorder.stop();
        });
      }
    };
  }

  g.LUMI_AUDIO = {
    supportsTTS: supportsTTS, speak: speak, speakConcept: speakConcept, stop: stop,
    jingle: jingle, chimeGood: chimeGood, chimeSoft: chimeSoft, setMuted: setMuted,
    saveRecording: saveRecording, getRecording: getRecording,
    deleteRecordings: deleteRecordings, playBlob: playBlob, createRecorder: createRecorder
  };
})(typeof window !== 'undefined' ? window : globalThis);
