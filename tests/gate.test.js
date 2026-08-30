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
