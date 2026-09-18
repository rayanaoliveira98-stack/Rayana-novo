'use strict';
const { test } = require('node:test');
const assert = require('node:assert');
const GATE = require('../js/gate.js');

test('PIN válido é aceito, tentativa errada é recusada', () => {
  const stored = GATE.setPin('1234');
  assert.ok(stored && stored.hash && stored.salt);
  assert.equal(GATE.verifyPin(stored, '1234'), true);
  assert.equal(GATE.verifyPin(stored, '1235'), false);
  assert.equal(GATE.verifyPin(stored, ''), false);
  assert.equal(GATE.verifyPin(null, '1234'), false);
});

test('PIN precisa ter 4 a 6 dígitos', () => {
  assert.equal(GATE.setPin('12'), null);
  assert.equal(GATE.setPin('abcd'), null);
  assert.ok(GATE.setPin('123456'));
});

test('PINs iguais com salts diferentes geram hashes diferentes', () => {
  let i = 0;
  const r1 = GATE.setPin('1234', () => 0.11);
  const r2 = GATE.setPin('1234', () => 0.77);
  assert.notEqual(r1.hash, r2.hash);
});

test('desafio de adulto é multiplicação entre 6 e 9', () => {
  const c = GATE.mathChallenge(() => 0.5);
  const m = c.question.match(/(\d) × (\d)/);
  assert.ok(m);
  assert.equal(Number(m[1]) * Number(m[2]), c.answer);
  assert.ok(c.answer >= 36 && c.answer <= 81);
});

/* ---- recuperação do PIN ---- */

test('apagar o PIN não toca no progresso da criança', () => {
  const STORE = require('../js/store.js');
  const store = STORE.createStore(STORE.memoryStorage());
  const data = store.load();
  const id = store.addProfile(data, { name: 'Sofia', age: 6, langs: ['en'], interests: [] });
  store.records(data, id, 'en').apple = { state: 'spoken' };
  data.parent.pin = GATE.setPin('4791');
  store.save(data);

  // é isto que o "Esqueci o PIN" faz depois do desafio de adulto
  data.parent.pin = null;
  store.save(data);

  const depois = store.load();
  assert.equal(depois.parent.pin, null, 'o PIN deveria ter sido apagado');
  assert.equal(Object.keys(depois.profiles).length, 1, 'o perfil não pode sumir');
  assert.equal(depois.progress[id].en.apple.state, 'spoken', 'o progresso não pode sumir');
});

test('sem PIN, a porta volta a ser o desafio de adulto', () => {
  // A barreira nunca desaparece: some o PIN, entra a conta que uma criança
  // de 3 a 7 anos não resolve.
  const c = GATE.mathChallenge(() => 0.5);
  assert.ok(c.answer >= 36, 'o desafio precisa continuar fora do alcance da criança');
  assert.equal(GATE.verifyPin(null, '0000'), false, 'sem PIN nada pode ser aceito como PIN');
});
