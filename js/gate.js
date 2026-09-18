/* LumiLínguas — Portão parental (área dos responsáveis).
 * Barreira contra crianças, não fronteira criptográfica: os dados já são
 * locais ao aparelho. PIN com hash+salt para não ficar legível em texto puro.
 * Módulo puro, testável em Node.
 */
(function (g) {
  'use strict';

  /* FNV-1a 32 bits repetido — suficiente como barreira local infantil. */
  function fnv1a(str) {
    var h = 0x811c9dc5;
    for (var i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = (h + ((h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24))) >>> 0;
    }
    return h >>> 0;
  }

  function hashPin(pin, salt) {
    var s = String(salt || '') + '|' + String(pin);
    var h = '';
    for (var round = 0; round < 5; round++) {
      s = fnv1a(s + round).toString(16) + s;
      h = fnv1a(s).toString(16) + h;
    }
    return h;
  }

  function makeSalt(rand) {
    rand = rand || Math.random;
    return Math.floor(rand() * 0xffffffff).toString(16);
  }

  function setPin(pin, rand) {
    if (!/^\d{4,6}$/.test(String(pin))) return null;
    var salt = makeSalt(rand);
    return { salt: salt, hash: hashPin(pin, salt) };
  }

  function verifyPin(stored, attempt) {
    if (!stored || !stored.salt || !stored.hash) return false;
    return hashPin(attempt, stored.salt) === stored.hash;
  }

  /* Desafio "gesto de adulto": conta de multiplicação que uma criança de
   * 3-7 anos não resolve. rand injetável para testes. */
  function mathChallenge(rand) {
    rand = rand || Math.random;
    var a = 6 + Math.floor(rand() * 4); // 6..9
    var b = 6 + Math.floor(rand() * 4);
    return { question: 'Quanto é ' + a + ' × ' + b + '?', answer: a * b };
  }

  var api = { hashPin: hashPin, setPin: setPin, verifyPin: verifyPin, mathChallenge: mathChallenge };
  g.LUMI_GATE = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
