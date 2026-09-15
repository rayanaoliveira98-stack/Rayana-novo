'use strict';
/* Atividades dinâmicas: variedade entre dias e presença dos novos modos
 * (memória auditiva, imitar, história, música, caça ao objeto em casa). */
const { test } = require('node:test');
const assert = require('node:assert');
const SESSION = require('../js/session.js');

function profile(over) {
  return Object.assign({
    age: 5, langs: ['en'], journeyDay: 20, interests: [], sessionMinutes: 11
  }, over);
}

/* Progresso com N conceitos já vistos, para liberar jogos e momento especial. */
function seenRecords(ids) {
  const SRS = require('../js/srs.js');
  const recs = {};
  ids.forEach((id, i) => {
    const r = SRS.introduce(SRS.freshRecord(0), 1000 * i);
    r.state = 'recognized';
    recs[id] = r;
  });
  return recs;
}

const SEEN = ['apple', 'dog', 'cat', 'ball', 'book', 'water'];

test('o dia inclui um momento especial: história, música ou caça em casa', () => {
  const s = SESSION.buildSession(profile(), { en: seenRecords(SEEN) }, 0);
  const special = s.steps.find(x => SESSION.SPECIAL_POOL.includes(x.type));
  assert.ok(special, 'nenhum momento especial na sessão');
  assert.equal(special.lang, 'en');
  assert.ok(special.concept, 'momento especial sem conceito');
});

test('o momento especial muda a cada dia (nunca dois dias iguais seguidos)', () => {
  const kinds = [];
  for (let day = 10; day <= 15; day++) {
    const s = SESSION.buildSession(profile({ journeyDay: day }), { en: seenRecords(SEEN) }, 0);
    const sp = s.steps.find(x => SESSION.SPECIAL_POOL.includes(x.type));
    kinds.push(sp && sp.type);
  }
  for (let i = 1; i < kinds.length; i++) {
    assert.notEqual(kinds[i], kinds[i - 1], `dias ${9 + i} e ${10 + i} repetiram ${kinds[i]}`);
  }
  assert.ok(new Set(kinds).size >= 3, 'os três momentos especiais devem aparecer no ciclo');
});

test('os novos jogos entram no rodízio diário', () => {
  assert.ok(SESSION.GAME_POOL.includes('memory_pairs'));
  assert.ok(SESSION.GAME_POOL.includes('imitate'));
  const found = new Set();
  for (let day = 1; day <= SESSION.GAME_POOL.length; day++) {
    const s = SESSION.buildSession(profile({ journeyDay: day }), { en: seenRecords(SEEN) }, 0);
    s.steps.filter(x => x.type === 'game').forEach(x => found.add(x.game));
  }
  // o rodízio percorre o pool inteiro ao longo dos dias
  assert.ok(found.has('memory_pairs'), 'memória auditiva nunca apareceu');
  assert.ok(found.has('imitate'), 'imitar o personagem nunca apareceu');
});

test('o jogo recebe o dia da jornada (usado pelas atividades novas)', () => {
  const s = SESSION.buildSession(profile({ journeyDay: 33 }), { en: seenRecords(SEEN) }, 0);
  const game = s.steps.find(x => x.type === 'game');
  assert.equal(game.journeyDay, 33);
});

test('sessão encurtada por cansaço não carrega o momento especial', () => {
  const s = SESSION.buildSession(profile(), { en: seenRecords(SEEN) }, 0, { shortened: true });
  const special = s.steps.find(x => SESSION.SPECIAL_POOL.includes(x.type));
  assert.equal(special, undefined);
});

test('no dia 1 o momento especial reforça o que acabou de ser apresentado', () => {
  // Sem histórico nenhum, a música/história só pode usar os conceitos
  // apresentados minutos antes, na própria sessão — nunca estreia um.
  const s = SESSION.buildSession(profile({ journeyDay: 1 }), { en: {} }, 0);
  const idx = s.steps.findIndex(x => SESSION.SPECIAL_POOL.includes(x.type));
  assert.ok(idx > 0, 'momento especial ausente no dia 1');
  const apresentados = s.steps.slice(0, idx)
    .filter(x => x.type === 'present')
    .map(x => x.concept);
  s.steps[idx].concepts.forEach(id => {
    assert.ok(apresentados.includes(id),
      `"${id}" entraria no momento especial sem ter sido apresentado antes`);
  });
});

test('o momento especial nunca usa um conceito que a criança nunca viu', () => {
  // Histórico realista: só existe registro de conceito já apresentado,
  // e a apresentação só ocorre dentro do currículo até o dia atual.
  const CUR = require('../content/curriculum.js');
  const day = 26;
  const conhecidos = CUR.upToDay(10).map(c => c.id);
  const s = SESSION.buildSession(
    profile({ journeyDay: day }), { en: seenRecords(conhecidos) }, 0);
  const idx = s.steps.findIndex(x => SESSION.SPECIAL_POOL.includes(x.type));
  const apresentadosHoje = s.steps.slice(0, idx)
    .filter(x => x.type === 'present').map(x => x.concept);
  s.steps[idx].concepts.forEach(id => {
    assert.ok(conhecidos.includes(id) || apresentadosHoje.includes(id),
      `"${id}" é novo para a criança e não pode abrir um jogo`);
    assert.ok(CUR.get(id).day <= day, `"${id}" está além do dia ${day}`);
  });
});

test('o módulo de efeitos expõe a API usada pelas atividades', () => {
  const FX = require('../js/fx.js');
  ['enter', 'leave', 'mascot', 'mascotMood', 'mascotHide', 'burst', 'burstFrom',
   'starFly', 'buzz', 'nudge', 'highlight', 'confetti', 'reduced'
  ].forEach(fn => assert.equal(typeof FX[fn], 'function', `FX.${fn} ausente`));
});
