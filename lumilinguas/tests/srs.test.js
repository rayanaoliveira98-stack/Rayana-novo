'use strict';
const { test } = require('node:test');
const assert = require('node:assert');
const SRS = require('../js/srs.js');

const DAY = SRS.DAY;

test('novo registro começa não apresentado', () => {
  const r = SRS.freshRecord(0);
  assert.equal(r.state, 'new');
  assert.equal(r.dueAt, null);
});

test('apresentar agenda revisão para 1 dia depois', () => {
  const r = SRS.introduce(SRS.freshRecord(0), 1000);
  assert.equal(r.state, 'presented');
  assert.equal(r.dueAt, 1000 + 1 * DAY);
});

test('sucessos percorrem os intervalos 1-3-7-14-30', () => {
  let now = 0;
  const r = SRS.introduce(SRS.freshRecord(0), now);
  const seen = [];
  for (let i = 0; i < 5; i++) {
    now = r.dueAt;
    SRS.record(r, 'listen', 'ok', now);
    seen.push((r.dueAt - now) / DAY);
  }
  assert.deepEqual(seen, [3, 7, 14, 30, 30]);
});

test('progressão de estados: ouvir → repetir com ajuda → falar → dominado', () => {
  let now = 0;
  const r = SRS.introduce(SRS.freshRecord(0), now);
  SRS.record(r, 'listen', 'ok', now += DAY);
  assert.equal(r.state, 'recognized');
  SRS.record(r, 'speak', 'helped', now += DAY);
  assert.equal(r.state, 'repeated_helped');
  SRS.record(r, 'speak', 'ok', now += DAY);
  assert.equal(r.state, 'spoken');
  // completa o ciclo até dominar
  for (let i = 0; i < 5; i++) SRS.record(r, 'speak', 'ok', now = r.dueAt);
  assert.equal(r.state, 'mastered');
});

test('dificuldade nunca zera o progresso, só reagenda mais cedo', () => {
  let now = 0;
  const r = SRS.introduce(SRS.freshRecord(0), now);
  for (let i = 0; i < 3; i++) SRS.record(r, 'listen', 'ok', now = r.dueAt);
  const idxBefore = r.intervalIndex;
  SRS.record(r, 'listen', 'hard', now = r.dueAt);
  assert.equal(r.state, 'review');
  assert.equal(r.dueAt, now + 1 * DAY);           // volta amanhã
  assert.equal(r.intervalIndex, idxBefore - 1);   // recua um degrau, não tudo
});

test('3 dias distintos de dificuldade pedem simplificação', () => {
  let r = SRS.introduce(SRS.freshRecord(0), 0);
  SRS.record(r, 'speak', 'hard', 1 * DAY);
  SRS.record(r, 'speak', 'hard', 1 * DAY + 1000); // mesmo dia não conta duas vezes
  assert.equal(SRS.needsSimplification(r), false);
  SRS.record(r, 'speak', 'hard', 2 * DAY);
  SRS.record(r, 'speak', 'hard', 3 * DAY);
  assert.equal(SRS.needsSimplification(r), true);
});

test('dueList devolve vencidos em ordem de atraso', () => {
  const recs = {};
  ['a', 'b', 'c'].forEach((id, i) => {
    recs[id] = SRS.introduce(SRS.freshRecord(0), i * 1000);
  });
  recs.c.dueAt = 5;      // mais atrasado
  recs.a.dueAt = 10;
  recs.b.dueAt = 99 * DAY; // ainda não venceu
  const due = SRS.dueList(recs, DAY * 2);
  assert.deepEqual(due, ['c', 'a']);
});

test('orçamento de novos conceitos: 2-6 conforme idade e nº de idiomas', () => {
  assert.equal(SRS.newConceptBudget(3, 1, 0), 3);
  assert.equal(SRS.newConceptBudget(6, 1, 0), 6);
  assert.equal(SRS.newConceptBudget(6, 4, 0), 4);  // 4 idiomas → menos novidade
  assert.equal(SRS.newConceptBudget(3, 4, 0.5), 2); // nunca abaixo de 2
});
