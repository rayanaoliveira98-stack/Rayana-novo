'use strict';
/* Escada de produção: a criança precisa falar em algum momento, e a
 * exigência precisa acompanhar o desenvolvimento dela — sem repetir sempre
 * a mesma atividade nem cobrar fala antes da hora. */
const { test } = require('node:test');
const assert = require('node:assert');
const L = require('../js/ladder.js');
const SRS = require('../js/srs.js');

const DAY = SRS.DAY;
const kid = (age) => ({ age, langs: ['en'] });

/* Conceito apresentado há N dias. */
function rec(diasAtras = 0, now = 10 * DAY) {
  const r = SRS.introduce(SRS.freshRecord(0), now - diasAtras * DAY);
  L.initPhase(r);
  return r;
}

test('começa ouvindo e vendo, sem exigir nada', () => {
  const r = rec();
  assert.equal(L.phaseId(r, kid(5), 10 * DAY), 'exposure');
  assert.equal(L.activityFor(r, kid(5), 10 * DAY), 'present');
});

test('só sobe de degrau depois de DOIS acertos seguidos', () => {
  const now = 10 * DAY;
  const r = rec(0, now);
  L.record(r, 'ok', kid(5), now);
  assert.equal(L.phaseId(r, kid(5), now), 'exposure', 'subiu cedo demais');
  L.record(r, 'ok', kid(5), now);
  assert.equal(L.phaseId(r, kid(5), now), 'recognize');
});

test('acertar com ajuda mantém o degrau — nem sobe nem desce', () => {
  const now = 10 * DAY;
  const r = rec(0, now);
  r.phase = L.IDX.recognize;
  L.record(r, 'helped', kid(5), now);
  L.record(r, 'helped', kid(5), now);
  assert.equal(L.phaseId(r, kid(5), now), 'recognize');
});

test('dificuldade devolve UM degrau de apoio, nunca todos', () => {
  const now = 10 * DAY;
  const r = rec(5, now);
  r.phase = L.IDX.name;
  r.spokeEver = true;
  L.record(r, 'hard', kid(6), now);
  assert.equal(L.phaseId(r, kid(6), now), 'cloze', 'deveria cair só um degrau');
  L.record(r, 'hard', kid(6), now);
  assert.equal(L.phaseId(r, kid(6), now), 'echo');
});

test('a criança chega a falar: a escada leva de ouvir até produzir sozinha', () => {
  const now0 = 10 * DAY;
  const r = rec(0, now0);
  const p = kid(6);
  let now = now0;
  const caminho = [];
  for (let i = 0; i < 14; i++) {
    caminho.push(L.activityFor(r, p, now));
    L.record(r, 'ok', p, now);
    now += DAY; // um dia por vez, como na vida real
  }
  assert.ok(caminho.includes('repeat'), 'nunca pediu repetição oral');
  assert.ok(caminho.includes('name_it'), 'nunca pediu produção sem modelo');
  assert.ok(L.isProductive(r), 'conceito não chegou a contar como produtivo');
});

test('a atividade muda conforme a criança avança (não repete sempre a mesma)', () => {
  const p = kid(6);
  let now = 10 * DAY;
  const r = rec(0, now);
  const vistas = new Set();
  for (let i = 0; i < 14; i++) {
    vistas.add(L.activityFor(r, p, now));
    L.record(r, 'ok', p, now);
    now += DAY;
  }
  assert.ok(vistas.size >= 5, `só ${vistas.size} atividades diferentes: ${[...vistas]}`);
});

/* ---- respeito ao desenvolvimento ---- */

test('período silencioso: não pede recuperação antes do tempo de escuta', () => {
  const now = 10 * DAY;
  const r = rec(0, now);          // apresentado hoje
  r.phase = L.IDX.name;           // mesmo que a escada já estivesse alta
  // 3 anos: 3 dias de escuta antes de cobrar produção sem modelo
  assert.equal(L.phaseId(r, kid(3), now), 'echo');
  // passados os dias, a exigência é liberada (para quem tem teto para ela)
  const r2 = rec(4, now);
  r2.phase = L.IDX.name;
  assert.equal(L.phaseId(r2, kid(6), now), 'name');
});

test('repetir com modelo é permitido desde o primeiro dia (convite, não cobrança)', () => {
  const now = 10 * DAY;
  const r = rec(0, now);
  r.phase = L.IDX.echo;
  assert.equal(L.activityFor(r, kid(3), now), 'repeat');
});

test('teto por idade: 3 anos não é empurrado a conversar', () => {
  const now = 30 * DAY;
  const r = rec(20, now);
  r.phase = L.IDX.use;
  r.spokeEver = true;
  assert.equal(L.phaseId(r, kid(3), now), 'echo');
  assert.equal(L.phaseId(r, kid(4), now), 'cloze');
  assert.equal(L.phaseId(r, kid(5), now), 'name');
  assert.equal(L.phaseId(r, kid(7), now), 'use');
});

test('silêncio não é erro: volta ao corpo sem marcar dificuldade', () => {
  const now = 10 * DAY;
  const r = rec(5, now);
  r.phase = L.IDX.name;
  L.record(r, 'silent', kid(5), now);
  L.record(r, 'silent', kid(5), now);
  assert.equal(L.phaseId(r, kid(5), now), 'act', 'deveria voltar ao degrau corporal');
  assert.equal(r.struggles, 0, 'silêncio não pode contar como dificuldade');
  assert.equal(r.struggleDays, 0);
});

test('reconhecer não basta para contar como dominado — precisa produzir', () => {
  const now = 10 * DAY;
  const r = rec(5, now);
  r.phase = L.IDX.act;      // entende e responde com o corpo
  assert.equal(L.isProductive(r), false);
  r.phase = L.IDX.name;
  r.spokeEver = true;
  assert.equal(L.isProductive(r), true);
});

test('o painel mostra a distribuição por degrau', () => {
  const now = 10 * DAY;
  const recs = { a: rec(3, now), b: rec(3, now), c: SRS.freshRecord(0) };
  recs.a.phase = L.IDX.name;
  recs.b.phase = L.IDX.recognize;
  const d = L.distribution(recs);
  assert.equal(d.name, 1);
  assert.equal(d.recognize, 1);
  assert.equal(d.exposure, 0, 'conceito nunca apresentado não pode entrar na conta');
});

/* ---- integração com a sessão diária ---- */

const SESSION = require('../js/session.js');

function perfil(over) {
  return Object.assign({ age: 6, langs: ['en'], journeyDay: 20,
    interests: [], sessionMinutes: 11 }, over);
}

test('a revisão usa o degrau do conceito, não um sorteio', () => {
  const now = 20 * DAY;
  const recs = {};
  // "apple" já está alto na escada; "dog" ainda é reconhecimento
  recs.apple = rec(8, now); recs.apple.phase = L.IDX.name; recs.apple.spokeEver = true;
  recs.dog = rec(8, now); recs.dog.phase = L.IDX.recognize;
  [recs.apple, recs.dog].forEach(r => { r.dueAt = now - DAY; });

  const s = SESSION.buildSession(perfil(), { en: recs }, now);
  const rev = {};
  s.steps.filter(x => x.type === 'review').forEach(x => { rev[x.concept] = x.activity; });
  assert.equal(rev.apple, 'name_it', 'conceito avançado deveria pedir produção');
  assert.equal(rev.dog, 'listen_tap', 'conceito inicial deveria pedir reconhecimento');
});

test('a mesma sessão, montada duas vezes, pede a mesma atividade (sem aleatoriedade)', () => {
  const now = 20 * DAY;
  const mk = () => {
    const r = rec(8, now); r.phase = L.IDX.cloze; r.dueAt = now - DAY; return { apple: r };
  };
  const a = SESSION.buildSession(perfil(), { en: mk() }, now);
  const b = SESSION.buildSession(perfil(), { en: mk() }, now);
  const act = s => s.steps.filter(x => x.type === 'review').map(x => x.concept + ':' + x.activity);
  assert.deepEqual(act(a), act(b));
});

test('conceito em dificuldade é simplificado, mesmo estando alto na escada', () => {
  const now = 20 * DAY;
  const r = rec(8, now);
  r.phase = L.IDX.use; r.spokeEver = true;
  r.struggleDays = 3;                    // três dias difíceis
  r.lastResult = 'hard'; r.lastSeenAt = now - DAY / 2;
  const s = SESSION.buildSession(perfil(), { en: { apple: r } }, now);
  const rev = s.steps.find(x => x.type === 'review' && x.concept === 'apple');
  assert.equal(rev.activity, 'listen_tap', 'dificuldade persistente deve voltar ao reconhecimento');
});

test('uma criança de 3 anos nunca recebe atividade de produção livre na sessão', () => {
  const now = 20 * DAY;
  const recs = {};
  ['apple', 'dog', 'cat'].forEach(id => {
    const r = rec(10, now);
    r.phase = L.IDX.use; r.spokeEver = true; r.dueAt = now - DAY;
    recs[id] = r;
  });
  const s = SESSION.buildSession(perfil({ age: 3 }), { en: recs }, now);
  s.steps.filter(x => x.type === 'review').forEach(x => {
    assert.ok(['listen_tap', 'tpr', 'repeat', 'present'].includes(x.activity),
      `3 anos recebeu "${x.activity}"`);
  });
});
