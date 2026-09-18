'use strict';
/* Teste de jornada: simula os 60 dias inteiros com os módulos reais e
 * verifica o que mais importa — a criança chega a FALAR o que aprendeu,
 * a exigência acompanha a idade, e a sessão nunca fica vazia nem repetitiva. */
const { test } = require('node:test');
const assert = require('node:assert');
const SRS = require('../js/srs.js');
const LADDER = require('../js/ladder.js');
const SESSION = require('../js/session.js');

/* Replica applyResult() de js/app.js — se a ordem mudar lá, este teste avisa. */
function aplicar(rec, atividade, resultado, perfil, now) {
  if (rec.state === 'new') SRS.introduce(rec, now);
  LADDER.initPhase(rec);
  if (resultado === 'silent') {
    rec.lastSeenAt = now;
    LADDER.record(rec, 'silent', perfil, now);
    return;
  }
  const fala = ['repeat', 'cloze', 'name_it', 'use_it'].includes(atividade);
  SRS.record(rec, fala ? 'speak' : 'listen', resultado, now);
  LADDER.record(rec, resultado, perfil, now);
  SRS.capInterval(rec, LADDER.maxIntervalIndex(rec), now);
}

/* Roda a jornada e devolve o que aconteceu. */
function jornada(opts = {}) {
  const perfil = {
    age: opts.age || 6, langs: ['en'], journeyDay: 1,
    interests: [], sessionMinutes: 11
  };
  const recs = {};
  const dias = [];
  let semente = opts.seed || 7;
  const sorte = () => { semente = (semente * 1103515245 + 12345) % 2147483648; return semente / 2147483648; };
  let now = 100 * SRS.DAY;

  for (let dia = 1; dia <= (opts.dias || 60); dia++) {
    perfil.journeyDay = dia;
    const plano = SESSION.buildSession(perfil, { en: recs }, now);
    const feitas = [];
    plano.steps.forEach(st => {
      if (!st.concept) return;
      const at = st.type === 'review' ? st.activity : st.type;
      feitas.push(at);
      if (!recs[st.concept]) recs[st.concept] = SRS.freshRecord(now);
      let res = 'ok';
      const d = sorte();
      if (d < (opts.hard || 0)) res = 'hard';
      else if (d < (opts.hard || 0) + (opts.helped || 0)) res = 'helped';
      aplicar(recs[st.concept], at, res, perfil, now);
    });
    dias.push({ dia, passos: feitas.length, atividades: feitas });
    now += SRS.DAY;
  }
  return { recs, dias, perfil };
}

test('em 60 dias a criança chega a falar o que aprendeu', () => {
  const { recs } = jornada({ age: 6 });
  const total = Object.keys(recs).length;
  const falou = Object.keys(recs).filter(k => recs[k].spokeEver).length;
  const sozinha = Object.keys(recs).filter(k => LADDER.isProductive(recs[k])).length;

  assert.ok(total >= 20, `só ${total} palavras trabalhadas em 60 dias`);
  assert.equal(falou, total, 'toda palavra trabalhada precisa ter sido falada ao menos uma vez');
  assert.ok(sozinha >= total * 0.6,
    `só ${sozinha} de ${total} chegaram a ser faladas sem modelo`);
});

test('a exigência sobe ao longo da jornada, não fica na mesma atividade', () => {
  const { dias } = jornada({ age: 6 });
  const noInicio = new Set(dias.slice(0, 7).flatMap(d => d.atividades));
  const noFim = new Set(dias.slice(-10).flatMap(d => d.atividades));

  assert.ok(!noInicio.has('name_it') && !noInicio.has('use_it'),
    'produção livre não pode aparecer na primeira semana');
  assert.ok(noFim.has('name_it') || noFim.has('use_it'),
    'no fim da jornada a criança deveria estar produzindo sozinha');
});

test('nenhuma sessão fica vazia ao longo dos 60 dias', () => {
  const { dias } = jornada({ age: 6 });
  const magras = dias.filter(d => d.passos < 4);
  assert.equal(magras.length, 0,
    'dias com sessão quase vazia: ' + magras.map(d => `${d.dia}(${d.passos})`).join(', '));
});

test('uma criança de 3 anos nunca recebe produção sem modelo em 60 dias', () => {
  const { dias } = jornada({ age: 3 });
  const proibidas = dias.flatMap(d => d.atividades).filter(a => a === 'name_it' || a === 'use_it');
  assert.equal(proibidas.length, 0, `apareceram ${proibidas.length} atividades acima da idade`);
});

test('com dificuldades frequentes, o app consolida em vez de acumular palavras', () => {
  const facil = jornada({ age: 5, hard: 0 });
  const dificil = jornada({ age: 5, hard: 0.3, helped: 0.3 });
  const nFacil = Object.keys(facil.recs).length;
  const nDificil = Object.keys(dificil.recs).length;
  assert.ok(nDificil < nFacil,
    `criança com dificuldade recebeu ${nDificil} palavras vs ${nFacil} — deveria receber menos`);
  // e o que recebeu, recebeu de verdade: nada fica parado no primeiro degrau
  const parados = Object.keys(dificil.recs)
    .filter(k => dificil.recs[k].phase === 0).length;
  assert.ok(parados <= 2, `${parados} palavras nunca saíram do degrau inicial`);
});

test('o espaçamento não se abre antes da produção', () => {
  const { recs } = jornada({ age: 6, dias: 25 });
  Object.keys(recs).forEach(k => {
    const r = recs[k];
    LADDER.initPhase(r);
    assert.ok(r.intervalIndex <= LADDER.maxIntervalIndex(r),
      `"${k}" está espaçado além do que o degrau "${LADDER.PHASES[r.phase].id}" permite`);
  });
});

test('o dia não repete a mesma sequência do dia anterior', () => {
  const { dias } = jornada({ age: 6 });
  let iguais = 0;
  for (let i = 1; i < dias.length; i++) {
    if (dias[i].atividades.join('|') === dias[i - 1].atividades.join('|')) iguais++;
  }
  assert.ok(iguais <= 3, `${iguais} dias repetiram exatamente a véspera`);
});
