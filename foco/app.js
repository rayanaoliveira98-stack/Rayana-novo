/* =====================================================================
   FOCO — mapa de tarefas + recompensa física
   Psicologia aplicada:
   - 1 tarefa visível por vez (reduz fadiga de decisão)
   - bloco curto com fim visível (o cérebro aceita começar)
   - recompensa VARIÁVEL e imediata (reforço intermitente = dopamina)
   - recompensa FÍSICA (movimento/respiração = endorfina real)
   - streak + meta diária (compromisso e consistência)
   ===================================================================== */

/* ---------------- estado ---------------- */
const KEY = 'foco.v1';
const DEFAULTS = {
  onboarded: false,
  name: '',
  tasks: [],
  session: null,
  settings: {
    sound: true,
    lock: true,
    goal: 4,
    decks: { palmas: true, movimento: true, calma: true, alongamento: false }
  },
  stats: { xp: 0, streak: 0, lastDoneDay: null, totalDone: 0, days: {} },
  log: []
};

let S = load();

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return structuredClone(DEFAULTS);
    const p = JSON.parse(raw);
    return {
      ...structuredClone(DEFAULTS), ...p,
      settings: { ...DEFAULTS.settings, ...(p.settings || {}), decks: { ...DEFAULTS.settings.decks, ...((p.settings || {}).decks || {}) } },
      stats: { ...DEFAULTS.stats, ...(p.stats || {}) }
    };
  } catch (e) { return structuredClone(DEFAULTS); }
}
function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} }

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const uid = () => Math.random().toString(36).slice(2, 10);
const today = (d = new Date()) => d.toISOString().slice(0, 10);
const dayBefore = (iso) => { const d = new Date(iso + 'T12:00:00'); d.setDate(d.getDate() - 1); return today(d); };

/* ---------------- baralho de recompensas ---------------- */
const DECK_META = {
  palmas:      { label: 'Palmas + som de vitória', desc: 'Aplauso, confete e reforço verbal. Dopamina imediata, esforço zero.' },
  movimento:   { label: 'Movimento físico',        desc: 'Agachamento, polichinelo, dança. Onde a endorfina realmente aparece.' },
  calma:       { label: 'Respiração, água e elogio', desc: 'Reset do sistema nervoso depois de tarefa pesada.' },
  alongamento: { label: 'Alongamento guiado',      desc: 'Pescoço, ombros e coluna. Bom para quem passa horas sentada.' }
};

const CARDS = [
  // palmas
  { deck:'palmas', icon:'👏', title:'Aplauso de pé', cue:'Levanta, bate palmas por 5 segundos e diz em voz alta: "eu terminei".', mode:'celebrate', seconds:6 },
  { deck:'palmas', icon:'🎉', title:'Comemoração de 8 segundos', cue:'Braços pro alto, sorriso forçado por 8s. O corpo avisa o cérebro que valeu a pena.', mode:'celebrate', seconds:8 },
  { deck:'palmas', icon:'🏆', title:'Placar mental', cue:'Fala em voz alta o que você acabou de tirar da frente. Nomear a vitória fixa o hábito.', mode:'celebrate', seconds:6 },
  // movimento
  { deck:'movimento', icon:'🦵', title:'10 agachamentos', cue:'Pés na largura do quadril, desce devagar, sobe com força.', mode:'reps', reps:10, pace:2400 },
  { deck:'movimento', icon:'⭐', title:'15 polichinelos', cue:'Ritmo alto. Sobe o batimento em 20 segundos.', mode:'reps', reps:15, pace:1200 },
  { deck:'movimento', icon:'💃', title:'30 segundos de dança', cue:'Coloca uma música e se mexe. Sem plateia, sem julgamento.', mode:'timer', seconds:30 },
  { deck:'movimento', icon:'🚶', title:'20 passos rápidos', cue:'Levanta e caminha pela sala — 20 passos, sem celular na mão.', mode:'reps', reps:20, pace:900 },
  { deck:'movimento', icon:'💪', title:'8 flexões na parede', cue:'Mãos na parede, corpo reto, desce e empurra.', mode:'reps', reps:8, pace:2600 },
  { deck:'movimento', icon:'🧗', title:'20 elevações de joelho', cue:'De pé, joelho na altura do quadril, alternando.', mode:'reps', reps:20, pace:900 },
  // calma
  { deck:'calma', icon:'🌬️', title:'Respiração 4-7-8', cue:'Inspira 4, segura 7, solta 8. Três ciclos e o corpo desliga o alerta.', mode:'breath', cycles:3 },
  { deck:'calma', icon:'💧', title:'Beba 300ml de água', cue:'Copo cheio, sem pressa. Desidratação é metade do seu cansaço mental.', mode:'timer', seconds:20 },
  { deck:'calma', icon:'👀', title:'Olhe para longe 20s', cue:'Fixe algo a 6 metros. Os olhos descansam, a cabeça também.', mode:'timer', seconds:20 },
  { deck:'calma', icon:'💛', title:'Elogio em voz alta', cue:'Diga o elogio abaixo olhando pra frente. Sim, em voz alta — é aí que funciona.', mode:'celebrate', seconds:8 },
  // alongamento
  { deck:'alongamento', icon:'🧘', title:'Alongue o pescoço', cue:'Orelha no ombro, 15s de cada lado. Sem forçar.', mode:'timer', seconds:30 },
  { deck:'alongamento', icon:'🙆', title:'Abra o peito', cue:'Mãos entrelaçadas atrás das costas, ombros pra trás, peito aberto.', mode:'timer', seconds:25 },
  { deck:'alongamento', icon:'🌿', title:'Alcance o chão', cue:'Em pé, deixa o tronco cair devagar. Joelhos soltos.', mode:'timer', seconds:30 }
];

const PRAISE = [
  'você fez o que disse que ia fazer.',
  'terminar é uma habilidade — e você acabou de treinar ela.',
  'ninguém viu, mas conta igual.',
  'menos uma coisa ocupando espaço na sua cabeça.',
  'consistência é isso: repetir o chato até virar fácil.',
  'você não esperou vontade. Você começou.',
  'a versão de ontem teria adiado. Essa aqui não.'
];

/* ---------------- áudio ---------------- */
let AC = null;
const audio = () => {
  if (!S.settings.sound) return null;
  if (!AC) { try { AC = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return null; } }
  if (AC.state === 'suspended') AC.resume();
  return AC;
};
function tone(freq, t0, dur, type = 'triangle', vol = .18) {
  const ac = audio(); if (!ac) return;
  const o = ac.createOscillator(), g = ac.createGain();
  o.type = type; o.frequency.value = freq;
  g.gain.setValueAtTime(0, t0);
  g.gain.linearRampToValueAtTime(vol, t0 + .015);
  g.gain.exponentialRampToValueAtTime(.0001, t0 + dur);
  o.connect(g).connect(ac.destination); o.start(t0); o.stop(t0 + dur + .05);
}
const sndTick    = () => { const ac = audio(); if (ac) tone(880, ac.currentTime, .09, 'square', .07); };
const sndBell    = () => { const ac = audio(); if (!ac) return; tone(660, ac.currentTime, .5); tone(990, ac.currentTime + .12, .6); };
const sndVictory = () => { const ac = audio(); if (!ac) return; [523,659,784,1047].forEach((f,i)=>tone(f, ac.currentTime + i*.09, .5,'triangle',.2)); };
function sndApplause(ms = 2200) {
  const ac = audio(); if (!ac) return;
  const len = Math.floor(ac.sampleRate * (ms / 1000));
  const buf = ac.createBuffer(1, len, ac.sampleRate), d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) {
    const p = i / len;
    const env = Math.min(1, p * 14) * Math.pow(1 - p, .9);
    d[i] = (Math.random() * 2 - 1) * env * (.55 + .45 * Math.random());
  }
  const src = ac.createBufferSource(); src.buffer = buf;
  const bp = ac.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 1900; bp.Q.value = .7;
  const g = ac.createGain(); g.gain.value = .3;
  src.connect(bp).connect(g).connect(ac.destination); src.start();
}

const buzz = pattern => { try { if (navigator.vibrate) navigator.vibrate(pattern); } catch (e) {} };

/* ---------------- navegação ---------------- */
function go(view) {
  $$('.view').forEach(v => v.classList.toggle('is-active', v.id === 'view-' + view));
  $$('.tab').forEach(t => t.classList.toggle('is-on', t.dataset.go === view));
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
document.addEventListener('click', e => {
  const b = e.target.closest('[data-go]');
  if (b) go(b.dataset.go);
});

let toastT;
function toast(msg) {
  const t = $('#toast'); t.textContent = msg; t.hidden = false;
  clearTimeout(toastT); toastT = setTimeout(() => t.hidden = true, 2600);
}

/* ---------------- tarefas ---------------- */
const score = t => t.impact * 3 - t.effort;   // matriz impacto × esforço
const openTasks = () => S.tasks.filter(t => t.status === 'todo').sort((a, b) => score(b) - score(a) || a.createdAt - b.createdAt);

function addTask(data) {
  S.tasks.unshift({ id: uid(), status: 'todo', createdAt: Date.now(), focusMs: 0, ...data });
  save(); renderMapa();
}
function chipVal(group, form) {
  const el = $(`.chips[data-group="${group}"] .chip.is-on`, form);
  return el ? +el.dataset.v : 1;
}

$('#taskForm').addEventListener('submit', e => {
  e.preventDefault();
  const f = e.currentTarget;
  const title = $('#fTitle').value.trim();
  if (!title) return;
  addTask({
    title,
    step: $('#fStep').value.trim(),
    impact: chipVal('impact', f),
    effort: chipVal('effort', f),
    block: chipVal('block', f)
  });
  $('#fTitle').value = ''; $('#fStep').value = '';
  $('#fTitle').focus();
  toast('No mapa. Agora escolha uma e comece.');
});

// grupos de chips (form + ajustes + onboarding)
document.addEventListener('click', e => {
  const chip = e.target.closest('.chip');
  if (!chip) return;
  $$('.chip', chip.parentElement).forEach(c => c.classList.remove('is-on'));
  chip.classList.add('is-on');
  if (chip.parentElement.id === 'setGoal') {
    S.settings.goal = +chip.dataset.goal; save(); renderProgresso();
  }
});

let filter = 'todo';
$('#taskFilter').addEventListener('click', e => {
  const b = e.target.closest('.seg'); if (!b) return;
  filter = b.dataset.f;
  $$('.seg', $('#taskFilter')).forEach(s => s.classList.toggle('is-on', s === b));
  renderMapa();
});

function renderMapa() {
  const open = openTasks();
  $('#countTodo').textContent = open.length;

  // hero — tarefa do momento
  const hero = $('#heroWrap');
  if (open.length && !S.session) {
    const t = open[0];
    hero.innerHTML = `
      <div class="hero">
        <div class="hero-kicker">▶ Sua próxima tarefa</div>
        <h2>${esc(t.title)}</h2>
        ${t.step ? `<p class="hero-step">↳ <b>${esc(t.step)}</b></p>` : `<p class="hero-step">↳ Comece pelo passo mais burro possível. Sério.</p>`}
        <div class="hero-meta">
          <span class="tag tag-block">bloco de ${t.block} min</span>
          <span class="tag ${t.impact === 3 ? 'tag-hot' : ''}">impacto ${['','baixo','médio','alto'][t.impact]}</span>
          <span class="tag">esforço ${['','leve','médio','pesado'][t.effort]}</span>
        </div>
        <button class="btn btn-primary btn-lg" data-start="${t.id}">Começar bloco de ${t.block} min</button>
      </div>`;
  } else if (S.session) {
    hero.innerHTML = `
      <div class="hero">
        <div class="hero-kicker">⏱ Bloco em andamento</div>
        <h2>${esc(taskById(S.session.taskId)?.title || 'Foco')}</h2>
        <button class="btn btn-primary btn-lg" data-go="foco">Voltar ao foco</button>
      </div>`;
  } else {
    hero.innerHTML = '';
  }

  const list = filter === 'todo' ? open : S.tasks.filter(t => t.status === 'done').sort((a, b) => b.doneAt - a.doneAt).slice(0, 40);
  const ul = $('#taskList'), empty = $('#emptyState');
  ul.innerHTML = list.map(t => `
    <li class="titem ${t.status === 'done' ? 'is-done' : ''}">
      <div class="titem-body">
        <div class="titem-title">${esc(t.title)}</div>
        ${t.step ? `<div class="titem-step">↳ ${esc(t.step)}</div>` : ''}
        <div class="titem-meta">
          <span class="tag tag-block">${t.block}min</span>
          <span class="tag ${t.impact === 3 ? 'tag-hot' : ''}">impacto ${t.impact}</span>
          <span class="score">P${score(t)}</span>
        </div>
      </div>
      <div class="titem-actions">
        ${t.status === 'todo'
          ? `<button class="iconbtn go" data-start="${t.id}" title="Começar bloco">▶</button>
             <button class="iconbtn" data-del="${t.id}" title="Remover">✕</button>`
          : `<button class="iconbtn" data-again="${t.id}" title="Voltar para o mapa">↩</button>`}
      </div>
    </li>`).join('');
  const none = list.length === 0;
  empty.hidden = !none;
  empty.textContent = filter === 'todo'
    ? 'Mapa limpo. Descarregue tudo que está na sua cabeça aqui em cima — mesmo o que parece pequeno.'
    : 'Nada concluído ainda. A primeira vai ser hoje.';
}

const taskById = id => S.tasks.find(t => t.id === id);
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

document.addEventListener('click', e => {
  const st = e.target.closest('[data-start]');
  if (st) return startSession(st.dataset.start);
  const del = e.target.closest('[data-del]');
  if (del) {
    S.tasks = S.tasks.filter(t => t.id !== del.dataset.del);
    save(); renderMapa(); toast('Removida.');
  }
  const ag = e.target.closest('[data-again]');
  if (ag) {
    const t = taskById(ag.dataset.again);
    if (t) { t.status = 'todo'; delete t.doneAt; save(); renderMapa(); toast('De volta ao mapa.'); }
  }
});

/* ---------------- sessão de foco ---------------- */
let tick = null;

function startSession(taskId) {
  const t = taskById(taskId); if (!t) return;
  const ms = t.block * 60000;
  S.session = { taskId, endAt: Date.now() + ms, blockMin: t.block, totalMs: ms, paused: false, leftMs: ms, focusedMs: 0, rang: false };
  save(); go('foco'); renderFoco(); startTick();
  audio(); // desbloqueia o áudio no gesto do usuário
  toast(`Bloco de ${t.block} min. Só esta tarefa.`);
}

function remaining() {
  const s = S.session; if (!s) return 0;
  return s.paused ? s.leftMs : s.endAt - Date.now();
}

function startTick() { clearInterval(tick); tick = setInterval(uiTick, 250); uiTick(); }

function uiTick() {
  const s = S.session; if (!s) return;
  const left = remaining();
  const over = left <= 0;
  const shown = Math.abs(Math.ceil(left / 1000));
  $('#focusClock').textContent = `${String(Math.floor(shown / 60)).padStart(2, '0')}:${String(shown % 60).padStart(2, '0')}`;
  $('#focusState').textContent = s.paused ? 'pausado' : over ? 'bloco cumprido' : 'em foco';
  $('#focoRun').classList.toggle('is-paused', s.paused);
  $('#focoRun').classList.toggle('is-over', over);

  const C = 2 * Math.PI * 106;
  const pct = Math.max(0, Math.min(1, left / s.totalMs));
  const ring = $('#ringFg');
  ring.style.strokeDasharray = C;
  ring.style.strokeDashoffset = C * (1 - pct);

  if (over && !s.rang && !s.paused) {
    s.rang = true; save(); sndBell();
    openRitual('block');
  }
}

function renderFoco() {
  const s = S.session;
  $('#focoIdle').hidden = !!s;
  $('#focoRun').hidden = !s;
  if (!s) return;
  const t = taskById(s.taskId);
  $('#focusTitle').textContent = t ? t.title : 'Foco';
  $('#focusStep').textContent = t && t.step ? '↳ ' + t.step : '';
  $('#btnPause').textContent = s.paused ? 'Retomar' : 'Pausar';
}

$('#btnPause').addEventListener('click', () => {
  const s = S.session; if (!s) return;
  if (s.paused) { s.endAt = Date.now() + s.leftMs; s.paused = false; }
  else { s.leftMs = remaining(); s.paused = true; }
  save(); renderFoco(); uiTick();
});
$('#btnPlus').addEventListener('click', () => {
  const s = S.session; if (!s) return;
  s.totalMs += 300000;
  if (s.paused) s.leftMs += 300000; else s.endAt += 300000;
  s.rang = false; save(); uiTick(); toast('+5 minutos.');
});
$('#btnQuit').addEventListener('click', () => {
  if (!confirm('Sair do bloco sem concluir a tarefa?')) return;
  endSession(); go('mapa'); toast('Bloco encerrado. Sem julgamento — volte quando puder.');
});
$('#btnDone').addEventListener('click', () => openRitual('task'));

function endSession() {
  clearInterval(tick); tick = null;
  S.session = null; save(); renderFoco(); renderMapa();
}

/* ---------------- ritual de recompensa ---------------- */
let ritual = { timer: null, mode: null, kind: null, done: false };

function activeCards() {
  const on = Object.keys(S.settings.decks).filter(k => S.settings.decks[k]);
  const pool = CARDS.filter(c => on.includes(c.deck));
  return pool.length ? pool : CARDS.filter(c => c.deck === 'palmas');
}
const pick = a => a[Math.floor(Math.random() * a.length)];

function openRitual(kind) {
  const s = S.session;
  const t = s ? taskById(s.taskId) : null;
  const jackpot = Math.random() < 0.12;
  const card = pick(activeCards());
  const minutes = s ? Math.round((s.totalMs - Math.max(0, remaining())) / 60000) : 0;

  // pontuação
  let xp = kind === 'task' ? 10 + Math.round(minutes / 5) : 5;
  if (jackpot) xp *= 2;
  S.stats.xp += xp;

  const d = today();
  const day = S.stats.days[d] || (S.stats.days[d] = { done: 0, focusMs: 0, rituals: 0 });
  day.focusMs += (s ? s.totalMs - Math.max(0, remaining()) : 0);
  day.rituals++;

  if (kind === 'task' && t) {
    t.status = 'done'; t.doneAt = Date.now();
    day.done++; S.stats.totalDone++;
    if (S.stats.lastDoneDay !== d) {
      S.stats.streak = S.stats.lastDoneDay === dayBefore(d) ? S.stats.streak + 1 : 1;
      S.stats.lastDoneDay = d;
    }
    S.log.unshift({ icon: card.icon, task: t.title, card: card.title, at: Date.now() });
    S.log = S.log.slice(0, 30);
  }
  save(); renderStats();

  // UI
  ritual = { timer: null, mode: card.mode, kind, done: false };
  $('#ritualKicker').textContent = jackpot
    ? `🎰 BÔNUS — ${xp} pontos`
    : (kind === 'task' ? `Tarefa concluída · +${xp}` : `Bloco cumprido · +${xp}`);
  $('#ritualTitle').textContent = `${card.icon} ${card.title}`;
  $('#ritualCue').textContent = card.mode === 'celebrate' && card.deck === 'calma'
    ? `"${S.name || 'Você'}, ${pick(PRAISE)}"`
    : card.cue;

  const ov = $('#ritual');
  ov.hidden = false;
  $('#toast').hidden = true;
  $('#stageCounter').hidden = false;
  $('#stageBreath').hidden = true;
  $('#ritualTap').hidden = true;
  $('#ritualSkip').hidden = S.settings.lock;
  $('#ritualProgressFill').style.width = '0%';
  const close = $('#ritualClose');
  close.disabled = S.settings.lock;
  close.textContent = S.settings.lock ? 'Fazendo…' : 'Voltar ao trabalho';

  confettiBurst();
  sndVictory();
  if (card.deck === 'palmas') setTimeout(sndApplause, 260);

  if (card.mode === 'reps') runReps(card);
  else if (card.mode === 'breath') runBreath(card);
  else runTimer(card.seconds || 6);
}

function ritualDone() {
  ritual.done = true;
  clearInterval(ritual.timer); clearTimeout(ritual.timer);
  $('#ritualProgressFill').style.width = '100%';
  const c = $('#ritualClose');
  c.disabled = false;
  c.textContent = ritual.kind === 'task' ? 'Voltar ao trabalho' : 'Continuar de onde parei';
  sndBell();
  buzz([40, 60, 40]);
}

function runTimer(sec) {
  const total = sec * 1000, t0 = Date.now();
  $('#stageCounter').textContent = sec;
  ritual.timer = setInterval(() => {
    const p = Math.min(1, (Date.now() - t0) / total);
    $('#ritualProgressFill').style.width = (p * 100) + '%';
    const left = Math.ceil((total - (Date.now() - t0)) / 1000);
    $('#stageCounter').textContent = Math.max(0, left);
    if (p >= 1) ritualDone();
  }, 120);
}

function runReps(card) {
  let n = 0;
  const tap = $('#ritualTap');
  tap.hidden = false;
  $('#stageCounter').textContent = card.reps;
  const step = () => {
    n++;
    $('#stageCounter').textContent = Math.max(0, card.reps - n);
    const el = $('#stageCounter');
    el.classList.remove('pulse'); void el.offsetWidth; el.classList.add('pulse');
    sndTick();
    buzz(18);
    $('#ritualProgressFill').style.width = Math.min(100, (n / card.reps) * 100) + '%';
    if (n >= card.reps) { tap.hidden = true; ritualDone(); }
  };
  ritual.timer = setInterval(() => { if (!ritual.done) step(); }, card.pace);
  tap.onclick = () => { if (!ritual.done) step(); };
}

function runBreath(card) {
  $('#stageCounter').hidden = true;
  const b = $('#stageBreath'); b.hidden = false;
  const phases = [['inhale', 'Inspire', 4000], ['hold', 'Segure', 7000], ['exhale', 'Solte', 8000]];
  let cycle = 0, i = 0;
  const run = () => {
    if (ritual.done) return;
    const [cls, label, ms] = phases[i];
    b.className = 'breath ' + cls;
    $('#breathPhase').textContent = label;
    const totalMs = card.cycles * 19000;
    const elapsed = cycle * 19000 + phases.slice(0, i).reduce((a, p) => a + p[2], 0);
    $('#ritualProgressFill').style.width = Math.min(100, (elapsed / totalMs) * 100) + '%';
    i++;
    if (i >= phases.length) { i = 0; cycle++; }
    if (cycle >= card.cycles) { b.className = 'breath'; $('#breathPhase').textContent = 'Pronto'; return ritualDone(); }
    ritual.timer = setTimeout(run, ms);
  };
  run();
}

function closeRitual() {
  clearInterval(ritual.timer); clearTimeout(ritual.timer);
  $('#ritual').hidden = true;
  if (ritual.kind === 'task') {
    endSession(); go('mapa');
    const left = openTasks().length;
    toast(left ? `Feito. Restam ${left} no mapa.` : 'Mapa zerado. Isso é raro — aproveite.');
  } else {
    // novo bloco automático, mesma tarefa
    const s = S.session;
    if (s) {
      s.totalMs = s.blockMin * 60000;
      s.endAt = Date.now() + s.totalMs;
      s.paused = false; s.rang = false; save();
      startTick(); go('foco'); toast(`Novo bloco de ${s.blockMin} min.`);
    } else { go('mapa'); }
  }
  renderProgresso();
}
$('#ritualClose').addEventListener('click', () => { if (!$('#ritualClose').disabled) closeRitual(); });
$('#ritualSkip').addEventListener('click', closeRitual);

/* ---------------- confete ---------------- */
function confettiBurst() {
  const cv = $('#confetti'), ctx = cv.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  cv.width = cv.offsetWidth * dpr; cv.height = cv.offsetHeight * dpr;
  ctx.scale(dpr, dpr);
  const W = cv.offsetWidth, H = cv.offsetHeight;
  const colors = ['#ff4d6d', '#ffb03a', '#2fd48f', '#5b8cff', '#ffffff'];
  const parts = Array.from({ length: 90 }, () => ({
    x: W / 2 + (Math.random() - .5) * 120, y: H * .32,
    vx: (Math.random() - .5) * 9, vy: -6 - Math.random() * 9,
    s: 4 + Math.random() * 6, r: Math.random() * 6.28, vr: (Math.random() - .5) * .3,
    c: colors[(Math.random() * colors.length) | 0], life: 1
  }));
  let raf;
  const draw = () => {
    ctx.clearRect(0, 0, W, H);
    let alive = false;
    parts.forEach(p => {
      p.vy += .26; p.x += p.vx; p.y += p.vy; p.r += p.vr; p.life -= .008;
      if (p.life > 0 && p.y < H + 40) {
        alive = true;
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r);
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillStyle = p.c; ctx.fillRect(-p.s / 2, -p.s / 2, p.s, p.s * .6);
        ctx.restore();
      }
    });
    if (alive) raf = requestAnimationFrame(draw); else { cancelAnimationFrame(raf); ctx.clearRect(0, 0, W, H); }
  };
  draw();
}

/* ---------------- progresso ---------------- */
function renderStats() {
  $('#statStreak').textContent = S.stats.streak;
  $('#statXp').textContent = S.stats.xp;
}

function renderProgresso() {
  const d = today();
  const day = S.stats.days[d] || { done: 0, focusMs: 0, rituals: 0 };
  const goal = S.settings.goal;
  $('#meterFill').style.width = Math.min(100, (day.done / goal) * 100) + '%';
  $('#meterLabel').textContent = day.done >= goal
    ? `Meta batida: ${day.done} de ${goal}. Tudo daqui pra frente é lucro.`
    : `${day.done} de ${goal} tarefas concluídas hoje. Faltam ${goal - day.done}.`;
  $('#kpiToday').textContent = day.done;
  $('#kpiFocus').textContent = Math.round(day.focusMs / 60000) + 'm';
  $('#kpiStreak').textContent = S.stats.streak;
  $('#kpiTotal').textContent = S.stats.totalDone;

  const names = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const dt = new Date(); dt.setDate(dt.getDate() - i);
    const k = today(dt);
    days.push({ k, n: names[dt.getDay()], v: (S.stats.days[k] || {}).done || 0 });
  }
  const max = Math.max(goal, ...days.map(x => x.v));
  $('#weekChart').innerHTML = days.map(x => `
    <div class="wday">
      <span class="wnum">${x.v || ''}</span>
      <div class="wbar">${x.v ? `<i style="height:${Math.max(8, (x.v / max) * 100)}%"></i>` : ''}</div>
      <span class="wlbl">${x.n}</span>
    </div>`).join('');

  $('#ritualLog').innerHTML = S.log.length ? S.log.map(l => `
    <li class="logitem">
      <span class="li-ico">${l.icon}</span>
      <span class="li-tx"><b>${esc(l.task)}</b><small>${esc(l.card)} · ${new Date(l.at).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</small></span>
    </li>`).join('') : '<li class="empty">Seus rituais aparecem aqui.</li>';
}

/* ---------------- ajustes ---------------- */
function renderAjustes() {
  $('#deckList').innerHTML = Object.keys(DECK_META).map(k => `
    <li><label class="switchrow">
      <span><b>${DECK_META[k].label}</b><small>${DECK_META[k].desc}</small></span>
      <input type="checkbox" class="switch" data-deck="${k}" ${S.settings.decks[k] ? 'checked' : ''}>
    </label></li>`).join('');
  $('#setSound').checked = S.settings.sound;
  $('#setLock').checked = S.settings.lock;
  $('#setName').value = S.name || '';
  $$('#setGoal .chip').forEach(c => c.classList.toggle('is-on', +c.dataset.goal === S.settings.goal));
}
$('#deckList').addEventListener('change', e => {
  const k = e.target.dataset.deck; if (!k) return;
  S.settings.decks[k] = e.target.checked;
  if (!Object.values(S.settings.decks).some(Boolean)) {
    S.settings.decks.palmas = true; renderAjustes();
    toast('Pelo menos um baralho precisa ficar ligado.');
  }
  save();
});
$('#setSound').addEventListener('change', e => { S.settings.sound = e.target.checked; save(); if (e.target.checked) sndBell(); });
$('#setLock').addEventListener('change', e => { S.settings.lock = e.target.checked; save(); });
$('#setName').addEventListener('input', e => { S.name = e.target.value.trim(); save(); });
$('#btnExport').addEventListener('click', async () => {
  const json = JSON.stringify(S, null, 2);
  try { await navigator.clipboard.writeText(json); toast('Backup copiado. Cole num bloco de notas.'); }
  catch (e) { prompt('Copie seu backup:', json); }
});
$('#btnWipe').addEventListener('click', () => {
  if (!confirm('Apagar tarefas, streak e histórico deste aparelho?')) return;
  localStorage.removeItem(KEY); location.reload();
});

/* ---------------- onboarding ---------------- */
$('#onbStart').addEventListener('click', () => {
  S.name = $('#onbName').value.trim();
  const g = $('#onbGoal .chip.is-on');
  S.settings.goal = g ? +g.dataset.goal : 4;
  S.onboarded = true; save();
  $('#onboarding').hidden = true;
  audio();
  renderAll();
  toast(S.name ? `Bora, ${S.name}. Mapeie a primeira.` : 'Bora. Mapeie a primeira tarefa.');
});

/* ---------------- boot ---------------- */
function renderAll() { renderStats(); renderMapa(); renderFoco(); renderProgresso(); renderAjustes(); }

if (!S.onboarded) $('#onboarding').hidden = false;
renderAll();
if (S.session) { startTick(); go('foco'); }

document.addEventListener('visibilitychange', () => { if (!document.hidden && S.session) uiTick(); });
window.addEventListener('beforeunload', save);

if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
