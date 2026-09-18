'use strict';
const { test } = require('node:test');
const assert = require('node:assert');
const SRS = require('../js/srs.js');
const SESSION = require('../js/session.js');

function profile(over) {
  return Object.assign({
    age: 4, langs: ['en'], journeyDay: 3, interests: ['animals'], sessionMinutes: 11
  }, over);
}

test('sessão começa com boas-vindas e termina com celebração', () => {
  const s = SESSION.buildSession(profile(), { en: {} }, 0);
  assert.equal(s.steps[0].type, 'welcome');
  assert.equal(s.steps[s.steps.length - 1].type, 'celebrate');
});

test('apresenta conceitos novos com compreensão e repetição oral', () => {
  const s = SESSION.buildSession(profile(), { en: {} }, 0);
  const types = s.steps.map(x => x.type);
  assert.ok(types.includes('present'));
  assert.ok(types.includes('listen_tap'));
  assert.ok(types.includes('repeat'));
  // cada conceito novo aparece nas três fases
  const c = s.steps.find(x => x.type === 'present').concept;
  assert.ok(s.steps.some(x => x.type === 'listen_tap' && x.concept === c));
  assert.ok(s.steps.some(x => x.type === 'repeat' && x.concept === c));
});

test('4 idiomas → blocos separados por idioma e menos conceitos novos', () => {
  const langs = ['en', 'de', 'es', 'tr'];
  const recs = {}; langs.forEach(l => recs[l] = {});
  const s = SESSION.buildSession(profile({ langs, age: 3 }), recs, 0);
  // cada idioma ganha uma vinheta de bloco
  const intros = s.steps.filter(x => x.type === 'lang_intro').map(x => x.lang);
  assert.deepEqual(intros.slice().sort(), langs.slice().sort());
  // nenhum passo mistura idiomas para 3 anos
  assert.ok(!s.steps.some(x => x.type === 'compare'));
  assert.ok(s.budgetTotal <= 4);
});

test('5-7 anos com 2+ idiomas ganham desafio de comparação', () => {
  const recs = { en: {}, de: {} };
  const s = SESSION.buildSession(profile({ age: 6, langs: ['en', 'de'] }), recs, 0);
  assert.ok(s.steps.some(x => x.type === 'compare'));
});

test('dificuldades de ontem abrem a sessão', () => {
  const now = 10 * SRS.DAY;
  const recs = { en: {} };
  const r = SRS.introduce(SRS.freshRecord(0), 0);
  SRS.record(r, 'listen', 'hard', now - SRS.DAY / 2);
  recs.en.apple = r;
  const s = SESSION.buildSession(profile(), recs, now);
  const firstReview = s.steps.find(x => x.type === 'review');
  assert.equal(firstReview.concept, 'apple');
  assert.equal(firstReview.why, 'struggle');
});

test('a ordem dos idiomas alterna com o dia (sem sequência idêntica)', () => {
  const recs = { en: {}, de: {} };
  const d1 = SESSION.buildSession(profile({ langs: ['en', 'de'], journeyDay: 1 }), recs, 0);
  const d2 = SESSION.buildSession(profile({ langs: ['en', 'de'], journeyDay: 2 }), recs, 0);
  assert.notEqual(d1.langOrder[0], d2.langOrder[0]);
});

test('encurtar sessão quando há cansaço (3 dificuldades seguidas ou lentidão)', () => {
  assert.equal(SESSION.shouldShorten({ consecutiveHard: 3, avgResponseMs: 0, answered: 5 }), true);
  assert.equal(SESSION.shouldShorten({ consecutiveHard: 0, avgResponseMs: 20000, answered: 5 }), true);
  assert.equal(SESSION.shouldShorten({ consecutiveHard: 1, avgResponseMs: 3000, answered: 5 }), false);
});

test('gera 4 dicas práticas em português para os responsáveis', () => {
  const packs = { en: require('../content/pack-en.js') };
  const tips = SESSION.parentTips({ en: ['apple', 'dog'] }, packs, { en: 'inglês' }, 3);
  assert.equal(tips.length, 4);
  assert.ok(tips.every(t => /inglês/.test(t)));
  assert.ok(tips.some(t => /apple|dog/.test(t)));
});
