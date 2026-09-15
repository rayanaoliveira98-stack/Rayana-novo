/* LumiLínguas — Motor de repetição espaçada (SRS).
 * Módulo puro, sem DOM: roda no navegador e no Node (testes).
 *
 * Cada combinação criança+conceito+idioma tem um registro:
 * {
 *   state: 'new'|'presented'|'recognized'|'repeated_helped'|'spoken'|'mastered'|'review',
 *   introducedAt, lastSeenAt, dueAt        — timestamps (ms)
 *   intervalIndex                          — posição em INTERVALS
 *   streak, struggles                      — acertos seguidos / dificuldades acumuladas
 *   struggleDays                           — dias distintos com dificuldade (>=3 → simplificar)
 *   lastResult: 'ok'|'hard'|null
 * }
 * Regras implementadas (ver docs/ARCHITECTURE.md):
 * — revisões após 1, 3, 7, 14 e 30 dias;
 * — dificuldade nunca é punida: apenas reagenda mais cedo e marca para revisão;
 * — após 3 dias de dificuldade, sinaliza simplificação (voltar de fala p/ reconhecimento);
 * — máximo de conceitos novos por dia depende de idade e nº de idiomas.
 */
(function (g) {
  'use strict';

  var DAY = 24 * 60 * 60 * 1000;
  var INTERVALS = [1, 3, 7, 14, 30]; // dias

  var STATES = ['new', 'presented', 'recognized', 'repeated_helped', 'spoken', 'mastered', 'review'];

  function freshRecord(now) {
    return {
      state: 'new', introducedAt: null, lastSeenAt: null, dueAt: null,
      intervalIndex: 0, streak: 0, struggles: 0, struggleDays: 0,
      lastStruggleDay: null, lastResult: null, createdAt: now || 0
    };
  }

  function dayKey(ts) { return Math.floor(ts / DAY); }

  /* Marca a primeira apresentação de um conceito novo. */
  function introduce(rec, now) {
    rec.state = 'presented';
    rec.introducedAt = now;
    rec.lastSeenAt = now;
    rec.intervalIndex = 0;
    rec.dueAt = now + INTERVALS[0] * DAY;
    return rec;
  }

  /* Registra o resultado de uma atividade.
   * kind: 'listen' (reconhecimento auditivo/visual) | 'speak' (repetição oral)
   * result: 'ok' | 'helped' | 'hard'  (nunca "errado")
   */
  function record(rec, kind, result, now) {
    rec.lastSeenAt = now;
    rec.lastResult = result === 'hard' ? 'hard' : 'ok';

    if (result === 'hard') {
      rec.streak = 0;
      rec.struggles++;
      var dk = dayKey(now);
      if (rec.lastStruggleDay !== dk) {
        rec.struggleDays++;
        rec.lastStruggleDay = dk;
      }
      rec.state = 'review';
      // Reagenda cedo (mesmo dia +1) sem zerar todo o histórico de intervalos.
      rec.intervalIndex = Math.max(0, rec.intervalIndex - 1);
      rec.dueAt = now + 1 * DAY;
      return rec;
    }

    rec.streak++;
    if (result !== 'helped') rec.struggles = Math.max(0, rec.struggles - 1);

    // Progressão de estados
    if (kind === 'listen') {
      if (rec.state === 'presented' || rec.state === 'new' || rec.state === 'review') {
        rec.state = 'recognized';
      }
    } else if (kind === 'speak') {
      if (result === 'helped') {
        if (rec.state !== 'spoken' && rec.state !== 'mastered') rec.state = 'repeated_helped';
      } else {
        rec.state = 'spoken';
      }
    }

    // Dominado: falou sozinho e completou o ciclo de 30 dias com acertos.
    if (rec.state === 'spoken' && rec.intervalIndex >= INTERVALS.length - 1 && rec.streak >= 2) {
      rec.state = 'mastered';
    }

    // Avança o intervalo de revisão.
    if (rec.intervalIndex < INTERVALS.length - 1) rec.intervalIndex++;
    rec.dueAt = now + INTERVALS[rec.intervalIndex] * DAY;
    return rec;
  }

  /* Conceitos vencidos para revisão, mais atrasados primeiro. */
  function dueList(records, now) {
    return Object.keys(records)
      .filter(function (k) {
        var r = records[k];
        return r.state !== 'new' && r.dueAt !== null && r.dueAt <= now;
      })
      .sort(function (a, b) { return records[a].dueAt - records[b].dueAt; });
  }

  /* Dificuldades de ontem/hoje para abrir a sessão. */
  function struggleList(records, now) {
    var twoDays = 2 * DAY;
    return Object.keys(records)
      .filter(function (k) {
        var r = records[k];
        return r.lastResult === 'hard' && r.lastSeenAt !== null && (now - r.lastSeenAt) <= twoDays;
      })
      .sort(function (a, b) { return records[b].struggles - records[a].struggles; });
  }

  /* Após 3 dias distintos de dificuldade → simplificar a atividade
   * (voltar do exercício de fala para reconhecimento visual). */
  function needsSimplification(rec) {
    return rec.struggleDays >= 3;
  }

  /* Quantos conceitos novos hoje: 2 a 6, conforme idade, nº de idiomas e desempenho.
   * Em 4 idiomas reduz novos e aumenta repetição (regra da especificação). */
  function newConceptBudget(age, numLangs, recentHardRatio) {
    var base = age <= 4 ? 3 : 6;
    if (numLangs >= 3) base -= 1;
    if (numLangs >= 4) base -= 1;
    if (recentHardRatio > 0.4) base -= 1; // muita dificuldade recente → menos novidade
    return Math.max(2, Math.min(6, base));
  }

  /* Retenção medida: % de revisões respondidas com sucesso num intervalo. */
  function retentionAt(records, intervalDays) {
    var idx = INTERVALS.indexOf(intervalDays);
    if (idx < 0) return null;
    var seen = 0, ok = 0;
    Object.keys(records).forEach(function (k) {
      var r = records[k];
      if (r.state === 'new') return;
      if (r.intervalIndex > idx) { seen++; ok++; }
      else if (r.intervalIndex === idx && r.lastResult === 'hard') { seen++; }
    });
    if (!seen) return null;
    return ok / seen;
  }

  var api = {
    DAY: DAY,
    INTERVALS: INTERVALS,
    STATES: STATES,
    freshRecord: freshRecord,
    introduce: introduce,
    record: record,
    dueList: dueList,
    struggleList: struggleList,
    needsSimplification: needsSimplification,
    newConceptBudget: newConceptBudget,
    retentionAt: retentionAt
  };

  g.LUMI_SRS = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
