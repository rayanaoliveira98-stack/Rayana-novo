'use strict';
/* Integridade do conteúdo: todos os packs cobrem todos os conceitos do
 * currículo com os campos obrigatórios — garante que o modo offline nunca
 * encontra um buraco de conteúdo. */
const { test } = require('node:test');
const assert = require('node:assert');
const CUR = require('../content/curriculum.js');

const PACK_CODES = ['pt', 'en', 'de', 'es', 'fr', 'it', 'tr', 'zh', 'ja'];
const packs = {};
PACK_CODES.forEach(c => { packs[c] = require(`../content/pack-${c}.js`); });

test('demonstração tem pelo menos 30 conceitos completos', () => {
  assert.ok(CUR.concepts.length >= 30, `só ${CUR.concepts.length}`);
});

test('todos os conceitos têm imagem principal e alternativas', () => {
  for (const c of CUR.concepts) {
    assert.ok(c.emoji, c.id);
    assert.ok(Array.isArray(c.alts) && c.alts.length >= 2, c.id);
    assert.ok(c.theme && c.day >= 1 && c.day <= 60, c.id);
  }
});

test('cada pack cobre todos os conceitos com os campos essenciais', () => {
  for (const code of PACK_CODES) {
    const pack = packs[code];
    assert.equal(pack.lang, code);
    for (const c of CUR.concepts) {
      const e = pack.concepts[c.id];
      assert.ok(e, `${code}:${c.id} ausente`);
      for (const field of ['word', 'sen', 'q', 'a', 'adj', 'act']) {
        assert.ok(typeof e[field] === 'string' && e[field].length > 0,
          `${code}:${c.id}.${field}`);
      }
    }
  }
});

test('mandarim e japonês trazem romanização da palavra', () => {
  for (const code of ['zh', 'ja']) {
    for (const c of CUR.concepts) {
      const e = packs[code].concepts[c.id];
      assert.ok(e.rom && e.rom.length > 0, `${code}:${c.id}.rom`);
    }
  }
});

test('substantivos de idiomas com artigo trazem a forma com artigo', () => {
  for (const code of ['pt', 'de', 'es', 'fr', 'it']) {
    for (const c of CUR.concepts) {
      if (c.type !== 'noun') continue;
      const e = packs[code].concepts[c.id];
      // mom/dad são vocativos e podem dispensar artigo em alguns idiomas
      if (['mom', 'dad'].includes(c.id)) continue;
      assert.ok(e.art, `${code}:${c.id}.art`);
    }
  }
});

test('a jornada de 60 dias cobre as 9 fases temáticas', () => {
  assert.equal(CUR.weeks.length, 9);
  assert.equal(CUR.weeks[0].days[0], 1);
  assert.equal(CUR.weeks[8].days[1], 60);
  // dias contíguos, sem buracos
  for (let i = 1; i < CUR.weeks.length; i++) {
    assert.equal(CUR.weeks[i].days[0], CUR.weeks[i - 1].days[1] + 1);
  }
});

test('registro de idiomas: 9 idiomas com cor, personagem e voz', () => {
  const LANGS = require('../js/langs.js');
  assert.equal(LANGS.codes.length, 9);
  for (const code of LANGS.codes) {
    const l = LANGS.get(code);
    assert.ok(/^#[0-9A-Fa-f]{6}$/.test(l.color), code);
    assert.ok(l.character && l.character.name && l.character.emoji, code);
    assert.ok(Array.isArray(l.tts) && l.tts.length >= 1, code);
    assert.ok(l.flag, code); // bandeira: usada apenas na área dos responsáveis
  }
});

test('store: perfil, progresso, exportação e exclusão', () => {
  const STORE = require('../js/store.js');
  const store = STORE.createStore(STORE.memoryStorage());
  const data = store.load();
  const id = store.addProfile(data, { name: 'Ana', age: 4, langs: ['en', 'de'], interests: [] });
  assert.equal(data.activeProfile, id);
  const recs = store.records(data, id, 'en');
  recs.apple = { state: 'presented' };
  store.save(data);
  const again = store.load();
  assert.equal(again.progress[id].en.apple.state, 'presented');
  const json = JSON.parse(store.exportProfile(again, id));
  assert.equal(json.profile.name, 'Ana');
  store.deleteProfile(again, id);
  assert.equal(again.profiles[id], undefined);
  assert.equal(again.activeProfile, null);
});
