'use strict';
/* Interface dos responsáveis em seis idiomas. O que importa aqui: nenhuma
 * tela pode aparecer meio traduzida para uma família turca ou italiana. */
const { test } = require('node:test');
const assert = require('node:assert');
const T = require('../js/i18n.js');

const CODES = T.UI_LANGS.map(l => l.code);

test('os seis idiomas prometidos existem', () => {
  ['pt', 'en', 'de', 'es', 'it', 'tr'].forEach(c => {
    assert.ok(CODES.includes(c), `falta a interface em "${c}"`);
  });
  assert.equal(CODES.length, 6);
});

test('toda chave está traduzida nos seis idiomas', () => {
  const faltando = [];
  Object.keys(T.STRINGS).forEach(key => {
    CODES.forEach(code => {
      const v = T.STRINGS[key][code];
      if (typeof v !== 'string' || !v.trim()) faltando.push(`${key}/${code}`);
    });
  });
  assert.deepEqual(faltando, [], 'traduções ausentes: ' + faltando.join(', '));
});

test('nenhuma tradução ficou igual ao português por esquecimento', () => {
  // Palavras iguais entre línguas existem (Avatar, Italiano). O alarme é a
  // frase longa idêntica, que denuncia texto não traduzido.
  const suspeitas = [];
  Object.keys(T.STRINGS).forEach(key => {
    const pt = T.STRINGS[key].pt;
    if (!pt || pt.length < 30) return;
    ['en', 'de', 'es', 'it', 'tr'].forEach(code => {
      if (T.STRINGS[key][code] === pt) suspeitas.push(`${key}/${code}`);
    });
  });
  assert.deepEqual(suspeitas, [], 'parecem não traduzidas: ' + suspeitas.join(', '));
});

test('os marcadores {…} sobrevivem à tradução', () => {
  const quebradas = [];
  Object.keys(T.STRINGS).forEach(key => {
    const marcas = s => (String(s).match(/\{\w+\}/g) || []).sort().join(',');
    const esperado = marcas(T.STRINGS[key].pt);
    CODES.forEach(code => {
      if (marcas(T.STRINGS[key][code]) !== esperado) quebradas.push(`${key}/${code}`);
    });
  });
  assert.deepEqual(quebradas, [], 'marcadores perdidos: ' + quebradas.join(', '));
});

test('t() troca os valores e cai no inglês quando falta', () => {
  T.setLang('tr');
  assert.ok(T.t('ob.summary.who', { name: 'Ada', age: 5, langs: 'İngilizce' }).includes('Ada'));
  assert.ok(!T.t('ob.summary.who', { name: 'Ada', age: 5, langs: 'x' }).includes('{name}'));
  assert.equal(T.t('chave.que.nao.existe'), 'chave.que.nao.existe');
});

test('cada degrau da escada e cada estado tem nome nos seis idiomas', () => {
  const LADDER = require('../js/ladder.js');
  const SRS = require('../js/srs.js');
  LADDER.PHASES.forEach(f => {
    assert.ok(T.STRINGS['phase.' + f.id], `degrau "${f.id}" sem tradução`);
  });
  SRS.STATES.forEach(st => {
    assert.ok(T.STRINGS['state.' + st], `estado "${st}" sem tradução`);
  });
});

test('todo idioma de aprendizagem tem nome na língua do responsável', () => {
  const LANGS = require('../js/langs.js');
  LANGS.codes.forEach(code => {
    assert.ok(T.STRINGS['lang.' + code], `idioma "${code}" sem nome traduzido`);
  });
  T.setLang('tr');
  assert.equal(T.langName('de'), 'Almanca');
  T.setLang('it');
  assert.equal(T.langName('ja'), 'Giapponese');
});

test('as dicas do dia saem na língua do responsável', () => {
  const SESSION = require('../js/session.js');
  const packs = { en: require('../content/pack-en.js') };
  T.setLang('de');
  const dicas = SESSION.parentTips({ en: ['apple'] }, packs, { en: 'Englisch' }, 3);
  assert.equal(dicas.length, 4);
  assert.ok(dicas.some(d => /Frühstück|Rausgehen|Auto|Schlafen/.test(d)),
    'dicas não vieram em alemão: ' + dicas[0]);
  assert.ok(dicas.every(d => d.includes('apple')));
  T.setLang('pt');
});

test('nenhuma frase fica presa em português no código da interface', () => {
  const fs = require('node:fs');
  const path = require('node:path');
  let src = fs.readFileSync(path.join(__dirname, '..', 'js', 'parent.js'), 'utf8');
  // Comentários são em português de propósito — só o texto que vai à TELA conta.
  src = src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

  /* Palavras que só apareceriam numa frase esquecida fora do i18n. O literal
   * não pode atravessar a linha, senão o casamento pega código no meio. */
  const pistas = /'[^'\n]*\b(crian\u00e7a|palavras|respons\u00e1ve|aparelho|grava\u00e7\u00f5es|sess\u00f5es)[^'\n]*'/gi;
  const achadas = src.match(pistas) || [];
  assert.deepEqual(achadas, [],
    'strings fora do i18n: ' + achadas.slice(0, 5).join(' | '));
});
