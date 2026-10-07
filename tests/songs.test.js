'use strict';
/* Melodias conhecidas: direitos, cobertura e rodízio. */
const { test } = require('node:test');
const assert = require('node:assert');
const SONGS = require('../content/songs.js');
const LANGS = require('../js/langs.js');

test('só entram melodias de domínio público', () => {
  SONGS.ids.forEach(id => {
    const m = SONGS.get(id);
    assert.equal(m.dominioPublico, true, `"${id}" não está marcada como domínio público`);
    assert.ok(m.origem && /\d{4}|séc\./.test(m.origem),
      `"${id}" não diz de onde vem — sem procedência não entra`);
  });
});

test('cada melodia tem um título para os nove idiomas de aprendizagem', () => {
  LANGS.codes.forEach(code => {
    SONGS.ids.forEach(id => {
      assert.ok(SONGS.get(id).titulos[code],
        `melodia "${id}" não tem título em "${code}"`);
    });
  });
});

test('título não verificado nunca chega à criança', () => {
  const m = SONGS.get('estrela');
  const naoVerificado = Object.keys(m.titulos).find(l => !m.titulos[l].verificado);
  if (naoVerificado) {
    assert.equal(SONGS.tituloPara(m, naoVerificado), null,
      `"${naoVerificado}" devolveu um título que ninguém conferiu`);
  }
  const verificado = Object.keys(m.titulos).find(l => m.titulos[l].verificado);
  assert.equal(typeof SONGS.tituloPara(m, verificado), 'string');
});

test('a melodia muda de um dia para o outro', () => {
  for (let d = 1; d <= 8; d++) {
    assert.notEqual(SONGS.forDay(d).id, SONGS.forDay(d + 1).id,
      `dias ${d} e ${d + 1} repetiram a mesma melodia`);
  }
});

test('as notas são tocáveis', () => {
  SONGS.ids.forEach(id => {
    const m = SONGS.get(id);
    assert.ok(m.frase.length >= 8, `"${id}" é curta demais para ser reconhecida`);
    m.frase.forEach(([hz, tempos], i) => {
      assert.ok(hz > 80 && hz < 2000, `"${id}" nota ${i}: ${hz} Hz fora da faixa cantável`);
      assert.ok(tempos > 0, `"${id}" nota ${i}: duração ${tempos}`);
    });
    const seg = m.frase.reduce((a, n) => a + n[1], 0) * m.andamento;
    assert.ok(seg >= 4 && seg <= 14, `"${id}" dura ${seg.toFixed(1)}s — fora do que prende uma criança`);
  });
});

test('o português e os seis idiomas da interface já estão conferidos', () => {
  // Os nove existem; estes seis são os que o app realmente anuncia hoje.
  ['pt', 'en', 'de', 'es', 'it', 'fr'].forEach(l => {
    SONGS.ids.forEach(id => {
      assert.ok(SONGS.tituloPara(SONGS.get(id), l),
        `"${id}" ainda não tem título conferido em "${l}"`);
    });
  });
});
