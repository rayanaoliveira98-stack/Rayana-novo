/* LumiLínguas — Escada de produção (como cada conceito evolui na criança).
 *
 * Substitui a escolha aleatória de atividade por uma progressão real: o que a
 * criança faz com uma palavra depende do que ela JÁ consegue fazer com aquela
 * palavra — não do sorteio nem do calendário.
 *
 * Base didática (ver docs/DIDATICA.md):
 * — TPR / período silencioso (Asher): compreender vem antes de falar; resposta
 *   física já é produção legítima. Forçar fala cedo gera ansiedade e atrasa.
 * — Prática de recuperação em pré-escolares: só ajuda quando a criança atinge
 *   taxa de sucesso suficiente na prática — por isso o degrau só sobe depois de
 *   acertos repetidos, nunca por tempo decorrido.
 * — Hierarquia de apoio "do menor para o maior" (least-to-most): em
 *   dificuldade, devolve-se UM degrau de apoio, não o apoio todo.
 * — Cloze (adulto começa a frase, a criança completa): elicia produção com
 *   apoio parcial, o degrau que faltava entre repetir e falar sozinho.
 *
 * Módulo puro: roda no navegador e no Node (testes).
 */
(function (g) {
  'use strict';

  var DAY = 24 * 60 * 60 * 1000;

  /* Os degraus, do menos ao mais exigente. */
  /* verbal  = exige que a criança emita som
   * recall  = exige buscar a palavra na memória, sem modelo antes
   * A diferença importa: repetir logo depois de ouvir (echo) é convite e
   * pode acontecer desde o primeiro dia; recuperar sozinha (cloze em diante)
   * só faz sentido após tempo de escuta — é o que o período silencioso
   * protege. */
  var PHASES = [
    { id: 'exposure',  verbal: false, recall: false, activity: 'present',    label: 'ouvindo e vendo' },
    { id: 'recognize', verbal: false, recall: false, activity: 'listen_tap', label: 'reconhece ao ouvir' },
    { id: 'act',       verbal: false, recall: false, activity: 'tpr',        label: 'responde com o corpo' },
    { id: 'echo',      verbal: true,  recall: false, activity: 'repeat',     label: 'repete com modelo' },
    { id: 'cloze',     verbal: true,  recall: true,  activity: 'cloze',      label: 'completa a frase' },
    { id: 'name',      verbal: true,  recall: true,  activity: 'name_it',    label: 'fala sozinha' },
    { id: 'use',       verbal: true,  recall: true,  activity: 'use_it',     label: 'usa em conversa' }
  ];

  var IDX = {};
  PHASES.forEach(function (p, i) { IDX[p.id] = i; });

  /* Acertos seguidos necessários para subir um degrau.
   * A pesquisa com pré-escolares mostra que a recuperação ativa só rende
   * quando há sucesso repetido antes — daí exigir 2, não 1. */
  var ADVANCE_STREAK = 2;

  /* Teto de exigência por idade: até onde faz sentido cobrar produção.
   * Uma criança de 3 anos não é empurrada a "usar em conversa"; ela chega lá
   * quando estiver pronta, e o app aceita isso sem tratar como atraso. */
  function ceilingForAge(age) {
    if (age <= 3) return IDX.echo;
    if (age === 4) return IDX.cloze;
    if (age <= 6) return IDX.name;
    return IDX.use;
  }

  /* Período silencioso: dias mínimos de convívio com o conceito antes de
   * pedir qualquer fala. Quanto menor a criança, mais tempo de escuta. */
  function silentDays(age) {
    if (age <= 3) return 3;
    if (age === 4) return 2;
    return 1;
  }

  /* Estado inicial da escada dentro do registro do conceito. */
  function initPhase(rec) {
    if (typeof rec.phase !== 'number') {
      rec.phase = 0;
      rec.phaseStreak = 0;
      rec.phaseSince = rec.introducedAt || null;
      rec.spokeEver = false;
      rec.silentTries = 0;
    }
    return rec;
  }

  /* Degrau efetivo de hoje: o que a criança alcançou, limitado pelo teto da
   * idade e pelo período silencioso ainda em curso. */
  function currentPhase(rec, profile, now) {
    initPhase(rec);
    var phase = Math.min(rec.phase, ceilingForAge(profile.age));

    // Período silencioso: segura os degraus de RECUPERAÇÃO (falar sem modelo)
    // enquanto a criança não teve escuta suficiente com este conceito.
    // Repetir logo após ouvir continua liberado — é convite, não cobrança.
    if (PHASES[phase].recall && !canSpeak(rec, profile, now)) {
      phase = IDX.echo;
    }
    return phase;
  }

  function canSpeak(rec, profile, now) {
    if (rec.spokeEver) return true; // já falou antes: o silêncio terminou
    if (!rec.introducedAt) return false;
    var dias = (now - rec.introducedAt) / DAY;
    return dias >= silentDays(profile.age);
  }

  /* A atividade que este conceito pede hoje. */
  function activityFor(rec, profile, now) {
    return PHASES[currentPhase(rec, profile, now)].activity;
  }

  function phaseId(rec, profile, now) {
    return PHASES[currentPhase(rec, profile, now)].id;
  }

  /* Atualiza a escada depois de uma atividade.
   * result: 'ok' | 'helped' | 'hard' | 'silent'
   *   'silent' = a criança não produziu som nenhum (não é erro: é sinal de que
   *   o período silencioso dela ainda não acabou).
   */
  function record(rec, result, profile, now) {
    initPhase(rec);
    var teto = ceilingForAge(profile.age);

    if (result === 'ok') {
      rec.phaseStreak++;
      if (PHASES[Math.min(rec.phase, teto)].verbal) rec.spokeEver = true;
      rec.silentTries = 0;
      if (rec.phaseStreak >= ADVANCE_STREAK && rec.phase < PHASES.length - 1) {
        rec.phase++;
        rec.phaseStreak = 0;
        rec.phaseSince = now;
      }
      return rec;
    }

    if (result === 'helped') {
      // Conseguiu com apoio: mantém o degrau e zera a contagem. Nem sobe nem
      // desce — é exatamente o lugar onde ela está aprendendo.
      rec.phaseStreak = 0;
      if (PHASES[Math.min(rec.phase, teto)].verbal) rec.spokeEver = true;
      rec.silentTries = 0;
      return rec;
    }

    if (result === 'silent') {
      // Não falou. Nunca insistir: devolve para o degrau corporal (TPR) e
      // deixa o período silencioso correr mais um pouco.
      rec.silentTries++;
      rec.phaseStreak = 0;
      if (rec.silentTries >= 2 && rec.phase > IDX.act) {
        rec.phase = IDX.act;
        rec.phaseSince = now;
        rec.silentTries = 0;
      }
      return rec;
    }

    /* 'hard': devolve UM degrau de apoio (least-to-most), nunca o apoio todo.
     *
     * O piso é "reconhece ao ouvir", não a apresentação: depois que a palavra
     * estreou, a criança sempre tem algo a fazer com ela. Cair de volta na
     * tela de apresentação a deixaria assistindo à mesma cena para sempre —
     * que é justamente a repetição sem evolução que se quer evitar. */
    rec.phaseStreak = 0;
    var piso = rec.introducedAt ? IDX.recognize : 0;
    if (rec.phase > piso) {
      rec.phase--;
      rec.phaseSince = now;
    } else if (rec.phase < piso) {
      rec.phase = piso;
      rec.phaseSince = now;
    }
    return rec;
  }

  /* Teto de espaçamento por degrau (índice em SRS.INTERVALS = 1,3,7,14,30 dias).
   *
   * Espaçar serve para RETER o que já foi aprendido. Enquanto a criança ainda
   * está subindo a escada com esta palavra, ela precisa reencontrá-la logo —
   * senão a palavra desaparece por duas semanas antes de a boca dela chegar
   * lá, e a sessão vira só conteúdo novo. O intervalo só se abre à medida que
   * a produção acontece. */
  var MAX_INTERVAL_BY_PHASE = {
    exposure: 0, recognize: 0,   // volta amanhã
    act: 1, echo: 1,             // até 3 dias
    cloze: 2,                    // até 7 dias
    name: 3,                     // até 14 dias
    use: 4                       // ciclo completo, 30 dias
  };

  function maxIntervalIndex(rec) {
    initPhase(rec);
    var fase = PHASES[Math.min(rec.phase, PHASES.length - 1)];
    return MAX_INTERVAL_BY_PHASE[fase.id];
  }

  /* Um conceito só conta como dominado depois de produção sem modelo —
   * reconhecer não basta. É a regra que garante que a criança em algum
   * momento repete e fala o que está aprendendo. */
  function isProductive(rec) {
    initPhase(rec);
    return rec.phase >= IDX.name && rec.spokeEver;
  }

  /* Quantos conceitos estão em cada degrau — alimenta o painel dos pais. */
  function distribution(records, profile) {
    var out = {};
    PHASES.forEach(function (p) { out[p.id] = 0; });
    // Com o perfil, mostra o degrau que o app de fato pede nesta idade —
    // não adianta exibir "fala sozinha" para quem o app nunca cobra isso.
    var teto = profile ? ceilingForAge(profile.age) : PHASES.length - 1;
    Object.keys(records).forEach(function (k) {
      var r = records[k];
      if (r.state === 'new') return;
      initPhase(r);
      out[PHASES[Math.min(r.phase, teto)].id]++;
    });
    return out;
  }

  var api = {
    PHASES: PHASES, IDX: IDX, ADVANCE_STREAK: ADVANCE_STREAK,
    ceilingForAge: ceilingForAge, silentDays: silentDays,
    initPhase: initPhase, currentPhase: currentPhase, canSpeak: canSpeak,
    activityFor: activityFor, phaseId: phaseId, record: record,
    isProductive: isProductive, distribution: distribution,
    maxIntervalIndex: maxIntervalIndex, MAX_INTERVAL_BY_PHASE: MAX_INTERVAL_BY_PHASE
  };

  g.LUMI_LADDER = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
