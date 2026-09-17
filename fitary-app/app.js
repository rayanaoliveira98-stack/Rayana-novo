/* =========================================================
   FITARY Journey — Client Cockpit
   Tracking der Kundenreise + Buchungen + Kommunikation
   Vanilla JS, localStorage. Kein Build, kein Backend.
   ========================================================= */

const KEY = 'fitary.journey.v3';

/* ---------------- Helpers ---------------- */
const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const uid = p => p + '_' + Math.random().toString(36).slice(2, 9);

const DAY = 86400000;
const today = () => { const d = new Date(); d.setHours(0,0,0,0); return d; };
const addDays = (d, n) => new Date(d.getTime() + n * DAY);
const iso = d => new Date(d).toISOString().slice(0, 10);
const parse = s => { const d = new Date(s + 'T00:00:00'); return d; };
const daysBetween = (a, b) => Math.round((parse(iso(b)) - parse(iso(a))) / DAY);

const DOW = ['So','Mo','Di','Mi','Do','Fr','Sa'];
const MON = ['Jän','Feb','März','Apr','Mai','Juni','Juli','Aug','Sep','Okt','Nov','Dez'];
const fmtDate = s => { const d = parse(s); return `${DOW[d.getDay()]}, ${d.getDate()}. ${MON[d.getMonth()]}`; };
const fmtShort = s => { const d = parse(s); return `${d.getDate()}.${d.getMonth() + 1}.`; };
const relDay = s => {
  const n = daysBetween(iso(today()), s);
  if (n === 0) return 'heute';
  if (n === 1) return 'morgen';
  if (n === -1) return 'gestern';
  return n > 0 ? `in ${n} Tagen` : `vor ${Math.abs(n)} Tagen`;
};
const startOfWeek = d => { const x = new Date(d); const w = (x.getDay() + 6) % 7; return addDays(x, -w); };
const mulberry32 = a => () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
const initials = n => n.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

/* ---------------- Domain ---------------- */
const TYPES = {
  pt1:  { label: 'Personal Training 1:1',  short: 'PT 1:1',    cap: 1 },
  pt2:  { label: 'Personal Training 2:1',  short: 'PT 2:1',    cap: 2 },
  pad:  { label: 'Pad Work / Fit Boxing',  short: 'Pad Work',  cap: 2 },
  reha: { label: 'Reha & Prävention',      short: 'Reha',      cap: 1 },
  grp:  { label: 'Kleingruppe 2–4',        short: 'Kleingruppe', cap: 4 },
  athl: { label: 'Jugend-Athletik 12–17',  short: 'Athletik',  cap: 4 },
  mob:  { label: 'Mobiles Training (Wels + 1 €/km)', short: 'Mobil', cap: 1 },
  bwg:  { label: 'Kennenlernen + Beweglichkeitstest · 30 Min · gratis', short: 'Kennenlernen', cap: 1 }
};

const STAGES = [
  { id: 'erstkontakt', label: 'Kennenlernen', from: 0, to: 0, desc: 'Gratis-Erstkontakt: 30 Minuten, Beweglichkeitstest, Befund, Empfehlung' },
  { id: 'onboarding',  label: 'Onboarding',  from: 0,  to: 2,   desc: 'Anamnese, Haltungscheck, Zielbild' },
  { id: 'fundament',   label: 'Fundament',   from: 2,  to: 6,   desc: 'Technik, Mobilität, Basiskraft' },
  { id: 'aufbau',      label: 'Aufbau',      from: 6,  to: 12,  desc: 'Progression, Belastungssteuerung' },
  { id: 'performance', label: 'Performance', from: 12, to: 26,  desc: 'Leistung & Körperkomposition' },
  { id: 'longevity',   label: 'Longevity',   from: 26, to: 999, desc: 'Erhalt, Prävention, Langfristigkeit' }
];
const stageOf = c => {
  if (c.lead) return STAGES[0];                       /* Erstkontakt: Beweglichkeitstest gebucht, noch kein Programm */
  const w = daysBetween(c.start, iso(today())) / 7;
  return STAGES.slice(1).find(s => w >= s.from && w < s.to) || STAGES[STAGES.length - 1];
};

/* Beweglichkeits-Assessment — Einstieg in jede FITARY-Journey.
   Score 1–5 (5 = frei beweglich, 1 = deutlich limitiert). */
const MOBI = [
  { id:'ows',    label:'Overhead Squat',        hint:'Gesamtmuster: Rumpf, Hüfte, Schulter' },
  { id:'schulter',label:'Schultermobilität',    hint:'Hände hinter dem Rücken (Apley)' },
  { id:'hueft',  label:'Hüftbeuger (Thomas)',   hint:'Länge Iliopsoas / Rectus femoris' },
  { id:'aslr',   label:'Aktives Beinheben',     hint:'Ischiokrurale Kette, Beckenkontrolle' },
  { id:'sprung', label:'Sprunggelenk',          hint:'Knee-to-Wall, Dorsalextension' },
  { id:'rumpf',  label:'Rumpfstabilität',       hint:'Plank & Rotationskontrolle' },
  { id:'hws',    label:'HWS-Rotation',          hint:'Nacken — Schreibtisch-Haltung' }
];
const RETEST_DAYS = 42; /* Beweglichkeit: Re-Test alle 6 Wochen */

/* Leistungstest — harte Zahlen. dir: 1 = mehr ist besser, -1 = weniger ist besser. */
const PERF = [
  { id:'plank',  label:'Plank-Halt',       unit:'sek', dir: 1, info:'Rumpfausdauer — Basis für schmerzfreies Sitzen und jede schwere Übung.' },
  { id:'push',   label:'Liegestütze',      unit:'Wdh', dir: 1, info:'Oberkörper-Kraftausdauer bei sauberer Technik, ohne Zeitlimit.' },
  { id:'squat',  label:'Goblet Squat 8RM', unit:'kg',  dir: 1, info:'Beinkraft: Gewicht, das du 8× technisch sauber schaffst.' },
  { id:'row500', label:'500 m Rudern',     unit:'sek', dir:-1, info:'Anaerobe Ausdauer — Tempo unter Belastung.' },
  { id:'hr',     label:'Ruhepuls',         unit:'bpm', dir:-1, info:'Erholungsfähigkeit deines Herz-Kreislauf-Systems.' },
  { id:'bf',     label:'Körperfett',       unit:'%',   dir:-1, info:'Körperkomposition — gemessen, nicht geschätzt.' }
];
const PERF_RETEST = 84; /* Leistung: Re-Test alle 12 Wochen */
const lastPerf = c => (c.performance && c.performance.length) ? c.performance[c.performance.length - 1] : null;
const basePerf = c => (c.performance && c.performance.length) ? c.performance[0] : null;
const perfDue  = c => { const l = lastPerf(c); return !l || daysBetween(l.date, iso(today())) >= PERF_RETEST; };
/* Leistungsindex: mittlere relative Verbesserung gegenüber Baseline, 100 = Ausgangsniveau */
function perfIndex(c, entry) {
  const b = basePerf(c); if (!b || !entry) return 100;
  const avg = PERF.reduce((a, i) => a + ((entry.items[i.id] - b.items[i.id]) / b.items[i.id]) * i.dir, 0) / PERF.length;
  return Math.round(100 * (1 + avg));
}

/* Videos: Willkommensnachricht, Testbesprechung, Technik-Clips */
const VIDEO_KINDS = { welcome:'Willkommensvideo', test:'Testbesprechung', technik:'Technik-Feedback' };
const unwatched = c => (c.videos || []).filter(v => !v.watched);
const mobiScore = t => Math.round(MOBI.reduce((a, i) => a + t.items[i.id], 0) / (MOBI.length * 5) * 100);
const lastTest  = c => (c.mobility && c.mobility.length) ? c.mobility[c.mobility.length - 1] : null;
const baseTest  = c => (c.mobility && c.mobility.length) ? c.mobility[0] : null;
const testDue   = c => { const l = lastTest(c); return !l || daysBetween(l.date, iso(today())) >= RETEST_DAYS; };

/* Kapazität Studio: verkaufbare Einheiten pro Woche (1 Trainer, Boutique-Setting).
   Hier anpassen, sobald ein zweiter Trainer oder mehr Gruppenslots dazukommen. */
const WEEK_CAPACITY = 18;

/* ---------------- Seed ---------------- */
const SEED_CLIENTS = [
  { freq:2, name:'Markus Reiter',        segment:'Unternehmer',      goal:'Rücken entlasten, Energie für 12h-Tage', type:'pt1',  dow:2, time:'06:30', weeks:19, credits:2,  plan:'10er-Block', rel:.92, pain:[6,2], kraft:[52,78], kg:[94,88.4], phone:'4367612345601', email:'m.reiter@example.at' },
  { name:'Sandra Hofer',         segment:'Eltern, wenig Zeit',goal:'Kraft aufbauen, 30-Min-Slots',          type:'pt2',  dow:4, time:'09:00', weeks:24, credits:7,  plan:'Abo 1x/Woche', rel:.88, pain:[4,1], kraft:[40,71], kg:[71,66.2], phone:'4367612345602', email:'s.hofer@example.at' },
  { name:'Tobias Gruber',        segment:'Freizeitsportler', goal:'Boxtechnik + Kondition',                type:'pad',  dow:3, time:'18:30', weeks:15, credits:4,  plan:'10er-Block', rel:.74, pain:[2,2], kraft:[60,74], kg:[82,80.1], phone:'4367612345603', email:'t.gruber@example.at', stoppedDaysAgo:17,
    recent:[{i:1,status:'cancelled',reason:'kurzfristig'}] },
  { freq:2, name:'Elena Novak',          segment:'Reha / Haltung',   goal:'Bandscheibe L4/L5 — schmerzfrei sitzen',type:'reha', dow:1, time:'10:00', weeks:11, credits:9,  plan:'Reha-Paket', rel:.95, pain:[8,3], kraft:[28,49], kg:[68,66.8], phone:'4367612345604', email:'e.novak@example.at' },
  { name:'Daniel Baumgartner',   segment:'Corporate (Firma)',goal:'Firmenprogramm — Rücken & Stress',      type:'grp',  dow:3, time:'16:00', weeks:8,  credits:12, plan:'Corporate Jahresprogramm', rel:.83, pain:[5,3], kraft:[44,58], kg:[89,86.5], phone:'4367612345605', email:'d.baumgartner@example.at',
    recent:[{i:2,status:'cancelled',reason:'krank'}] },
  { name:'Lisa Mayr',            segment:'Eltern, wenig Zeit',goal:'Wiedereinstieg nach Karenz',           type:'pt1',  dow:5, time:'08:00', weeks:1,  credits:9,  plan:'10er-Block', rel:1,   pain:[3,3], kraft:[30,33], kg:[74,73.6], phone:'4367612345606', email:'l.mayr@example.at' },
  { freq:2, name:'Kevin Sturm (15)',     segment:'Jugend-Athletik',  goal:'Schnelligkeit für Fußball-Akademie',    type:'athl', dow:2, time:'17:00', weeks:13, credits:5,  plan:'Athletik-Block', rel:.9,  pain:[1,0], kraft:[35,62], kg:[61,64], phone:'4367612345607', email:'eltern.sturm@example.at',
    recent:[{i:1,status:'noshow'}] },
  { name:'Petra Winkler',        segment:'40+ Longevity',    goal:'Knie stabil, Kraft halten',             type:'pt1',  dow:4, time:'11:00', weeks:31, credits:3,  plan:'Abo 1x/Woche', rel:.62, pain:[5,4], kraft:[38,51], kg:[77,75.2], phone:'4367612345608', email:'p.winkler@example.at',
    recent:[{i:1,status:'cancelled',reason:'kurzfristig'},{i:2,status:'cancelled',reason:'krank'}] },
  { freq:2, name:'Amir Haddad',          segment:'Freizeitsportler', goal:'Körperkomposition, 10 % KFA',           type:'pt1',  dow:1, time:'19:00', weeks:22, credits:8,  plan:'20er-Block', rel:.97, pain:[1,0], kraft:[65,94], kg:[86,79.4], phone:'4367612345609', email:'a.haddad@example.at' }
];

const SEED_LEADS = [
  { name:'Julia Steinbacher', segment:'Eltern, wenig Zeit', goal:'Wiedereinstieg nach Schulter-OP', time:'17:30', inDays: 2,
    source:'Instagram Reel', phone:'4367612345610', email:'j.steinbacher@example.at' },
  { name:'Michael Pfeifer',   segment:'Unternehmer',       goal:'Rücken bei 10 h Sitzen',       time:'07:30', inDays: -1,
    source:'Empfehlung',     phone:'4367612345611', email:'m.pfeifer@example.at' },
  { name:'Nadine Hofstätter', segment:'40+ Longevity',     goal:'Knie und Hüfte beweglich halten', time:'10:30', inDays: -6,
    source:'Google Maps',    phone:'4367612345612', email:'n.hofstaetter@example.at' },
  { name:'Stefan Leitner',    segment:'Freizeitsportler',  goal:'Schulter nach Sturz',          time:'18:00', inDays: -21,
    source:'Instagram Reel', phone:'4367612345613', email:'s.leitner@example.at' },
  { name:'Carina Brunner',    segment:'Eltern, wenig Zeit',goal:'Rücken nach zweiter Schwangerschaft', time:'09:30', inDays: -47,
    source:'Empfehlung',     phone:'4367612345614', email:'c.brunner@example.at' }
];

function buildSeed() {
  const t = today();
  const clients = [], bookings = [];

  SEED_CLIENTS.forEach((s, i) => {
    const rand = mulberry32(1337 + i * 97);
    const start = iso(addDays(t, -s.weeks * 7));
    const c = {
      id: uid('c'), name: s.name, segment: s.segment, goal: s.goal, type: s.type,
      start, plan: s.plan, credits: s.credits, coach: 'Yalcin',
      phone: s.phone, email: s.email, dow: s.dow, time: s.time,
      code: 'FIT-' + (s.name.replace(/[^A-Za-zÄÖÜäöü]/g, '').slice(0, 2) + (100 + i)).toUpperCase(),
      access: { token: 'fit-' + s.name.split(' ')[0].toLowerCase().replace(/[^a-zäöüß]/g, ''), issued: iso(t), days: 30 },
      fromLead: true, firstContact: start,
      note: '', checkins: [], mobility: [], performance: [], videos: [], stoppedDaysAgo: s.stoppedDaysAgo || null
    };

    /* Leistungstest: Baseline am Start, Re-Test alle 12 Wochen */
    const k0 = s.kraft[0], gainFactor = (s.kraft[1] - s.kraft[0]) / Math.max(s.kraft[0], 1);
    const pTests = Math.floor((s.weeks * 7) / PERF_RETEST);
    const baseItems = {
      plank:  Math.round(28 + k0 * .7),
      push:   Math.max(3, Math.round(k0 * .26)),
      squat:  Math.round(s.kg[0] * .32 + k0 * .22),
      row500: Math.round(152 - k0 * .32),
      hr:     Math.round(78 - k0 * .11),
      bf:     +(31 - k0 * .13).toFixed(1)
    };
    for (let k = 0; k <= pTests; k++) {
      const p = pTests ? k / pTests : 0, g = gainFactor * p;
      c.performance.push({
        date: iso(addDays(t, -(s.weeks * 7) + k * PERF_RETEST)),
        phase: k === 0 ? 'Baseline' : 'Re-Test ' + k,
        items: {
          plank:  Math.round(baseItems.plank * (1 + g * .9)),
          push:   Math.round(baseItems.push * (1 + g * 1.1)),
          squat:  Math.round(baseItems.squat * (1 + g * .8)),
          row500: Math.round(baseItems.row500 * (1 - g * .35)),
          hr:     Math.round(baseItems.hr * (1 - g * .18)),
          bf:     +(baseItems.bf * (1 - g * .3)).toFixed(1)
        },
        note: k === 0 ? 'Ausgangswerte — Grundlage für die Belastungssteuerung.' : 'Re-Test nach 12 Wochen.'
      });
    }

    /* Willkommensvideo: bei Neuzugängen noch offen, bei den anderen gesehen */
    c.videos.push({
      id: uid('v'), kind: 'welcome', title: 'Willkommen bei FITARY',
      url: '', date: iso(addDays(t, -s.weeks * 7 + 1)),
      note: 'Persönliche Begrüßung von Yalcin: Ablauf, Testtermin, was in Woche 1 passiert.',
      watched: s.weeks > 2, watchedAt: s.weeks > 2 ? iso(addDays(t, -s.weeks * 7 + 2)) : null
    });
    if (s.weeks >= 12) c.videos.push({
      id: uid('v'), kind: 'test', title: 'Besprechung Re-Test',
      url: '', date: iso(addDays(t, -21)),
      note: 'Auswertung der Leistungswerte und Plan für die nächsten 12 Wochen.',
      watched: true, watchedAt: iso(addDays(t, -20))
    });

    /* Beweglichkeitstest: Baseline am Tag 1, danach Re-Test alle 6 Wochen */
    const limit = clamp(5 - s.pain[0] / 2.6, 1.4, 4.2);      /* Ausgangslage aus Schmerz-/Haltungsbild */
    const tests = Math.floor((s.weeks * 7) / 42);
    const total = clamp((s.pain[0] - s.pain[1]) / 4 + .55, .5, 1.7); /* Gesamtzuwachs über alle Re-Tests */
    const gain  = total / Math.max(tests, 1);
    for (let k = 0; k <= tests; k++) {
      const items = {};
      MOBI.forEach((it, j) => {
        const v = limit + gain * k + (rand() - .5) * .9 + (j % 3 === 0 ? -.35 : .2);
        items[it.id] = +clamp(v, 1, 4.9 - (j % 4) * .3).toFixed(1);
      });
      c.mobility.push({
        date: iso(addDays(t, -(s.weeks * 7) + k * 42)),
        phase: k === 0 ? 'Baseline' : 'Re-Test ' + k,
        items,
        note: k === 0 ? 'Eingangsbefund — Grundlage für Trainingsaufbau.' : 'Re-Test nach 6 Wochen Programm.'
      });
    }

    /* Buchungen: wöchentliche Kadenz von Start bis +2 Wochen */
    const stopDate = s.stoppedDaysAgo ? addDays(t, -s.stoppedDaysAgo) : null;
    for (let w = -s.weeks; w <= 2; w++) {
      const base = addDays(startOfWeek(t), w * 7);
      const d = addDays(base, (s.dow + 6) % 7);
      if (daysBetween(start, iso(d)) < 0) continue;
      if (stopDate && d > stopDate) continue;

      let status;
      if (d < t) {
        const r = rand();
        status = r < s.rel ? 'completed' : (r < s.rel + (1 - s.rel) * .6 ? 'cancelled' : 'noshow');
      } else {
        status = 'confirmed';
      }
      bookings.push({
        id: uid('b'), clientId: c.id, date: iso(d), time: s.time, type: s.type,
        coach: 'Yalcin', status,
        reason: status === 'cancelled' ? (rand() < .5 ? 'krank' : 'kurzfristig') : null,
        reminded: false
      });

      /* Zweite Wocheneinheit für Kund:innen mit 2×/Woche */
      if (s.freq === 2) {
        const d2 = addDays(d, 3);
        if (!(stopDate && d2 > stopDate) && daysBetween(start, iso(d2)) >= 0) {
          const r2 = rand();
          bookings.push({
            id: uid('b'), clientId: c.id, date: iso(d2), time: s.time, type: s.type,
            coach: 'Yalcin',
            status: d2 < t ? (r2 < s.rel ? 'completed' : (r2 < s.rel + (1 - s.rel) * .6 ? 'cancelled' : 'noshow')) : 'confirmed',
            reason: null, reminded: false
          });
        }
      }
    }

    /* Gezielte Ereignisse der letzten Wochen (i = 1 ist die jüngste vergangene Einheit) */
    if (s.recent) {
      const mine = bookings.filter(b => b.clientId === c.id && b.date < iso(t)).sort((a, b) => b.date.localeCompare(a.date));
      s.recent.forEach(o => { const b = mine[o.i - 1]; if (b) { b.status = o.status; b.reason = o.reason || null; } });
    }

    /* Check-ins alle 14 Tage: Schmerz ↓, Kraftindex ↑, Gewicht → Ziel */
    const n = Math.max(2, Math.floor(s.weeks / 2));
    for (let k = 0; k <= n; k++) {
      const p = k / n;
      const jitter = (rand() - .5) * .6;
      c.checkins.push({
        date: iso(addDays(t, -(n - k) * 14)),
        pain:  +clamp(s.pain[0]  + (s.pain[1]  - s.pain[0])  * p + jitter * .5, 0, 10).toFixed(1),
        kraft: Math.round(s.kraft[0] + (s.kraft[1] - s.kraft[0]) * p + jitter * 2),
        kg:    +(s.kg[0] + (s.kg[1] - s.kg[0]) * p + jitter * .4).toFixed(1)
      });
    }
    clients.push(c);
  });

  /* Erstkontakte: Beweglichkeitstest gebucht bzw. absolviert, Angebot noch offen */
  SEED_LEADS.forEach((s, i) => {
    const rand = mulberry32(90210 + i * 31);
    const d = addDays(t, s.inDays);
    const c = {
      id: uid('c'), name: s.name, segment: s.segment, goal: s.goal, type: 'bwg',
      start: iso(d), plan: 'Erstkontakt', credits: 0, coach: 'Yalcin', lead: true, source: s.source,
      phone: s.phone, email: s.email, dow: (d.getDay() + 6) % 7 + 1, time: s.time,
      code: 'FIT-L' + (10 + i),
      access: null,   /* App-Zugang ist Teil des Programms, nicht des Gratis-Termins */
      note: '', checkins: [], mobility: [], performance: [], videos: [], stoppedDaysAgo: null
    };
    bookings.push({ id: uid('b'), clientId: c.id, date: iso(d), time: s.time, type: 'bwg',
      coach: 'Yalcin', status: s.inDays < 0 ? 'completed' : 'confirmed', reason: null, reminded: false });

    /* Erstkontakt bereits absolviert: Befund liegt vor, Angebot noch offen */
    if (s.inDays < 0) {
      const items = {};
      MOBI.forEach((it, j) => { items[it.id] = +clamp(2.6 + (rand() - .5) * 1.4 + (j % 2 ? .3 : -.2), 1, 4.6).toFixed(1); });
      c.mobility.push({ date: iso(d), phase: 'Baseline', items,
        note: 'Erstbefund beim Beweglichkeitstest — Grundlage für die Empfehlung.' });
      c.checkins.push({ date: iso(d), pain: 5.5, kraft: 34, kg: 91 });
    }
    clients.push(c);
  });

  return {
    clients, bookings, messages: [], events: [],
    settings: { autos: { reminder: true, cancel: true, winback: true, credits: true, milestone: true, onboarding: true, noshow: true } }
  };
}

/* ---------------- Store ---------------- */
let db = load();
function load() {
  try { const raw = localStorage.getItem(KEY); if (raw) return JSON.parse(raw); } catch (e) {}
  const fresh = buildSeed();
  try { localStorage.setItem(KEY, JSON.stringify(fresh)); } catch (e) {}
  return fresh;
}
function save() { try { localStorage.setItem(KEY, JSON.stringify(db)); } catch (e) {} }
const client = id => db.clients.find(c => c.id === id);
const bookingsOf = id => db.bookings.filter(b => b.clientId === id).sort((a, b) => a.date.localeCompare(b.date));

function logEvent(kind, text, clientId) {
  db.events.unshift({ id: uid('e'), at: new Date().toISOString(), kind, text, clientId, seen: false });
  db.events = db.events.slice(0, 60);
}

/* ---------------- Metriken ---------------- */
function metrics(c) {
  const bs = bookingsOf(c.id);
  const t = iso(today());
  const past = bs.filter(b => b.date < t);
  const last56 = past.filter(b => daysBetween(b.date, t) <= 56);
  const done = last56.filter(b => b.status === 'completed').length;
  const miss = last56.filter(b => b.status !== 'completed').length;
  const adherence = done + miss ? Math.round(done / (done + miss) * 100) : 100;

  const lastDone = [...past].reverse().find(b => b.status === 'completed');
  const next = bs.find(b => b.date >= t && b.status === 'confirmed');
  const inactive = lastDone ? daysBetween(lastDone.date, t) : daysBetween(c.start, t);
  const totalDone = past.filter(b => b.status === 'completed').length;
  const cancels30 = past.filter(b => daysBetween(b.date, t) <= 30 && b.status === 'cancelled').length;
  const noshows30 = past.filter(b => daysBetween(b.date, t) <= 30 && b.status === 'noshow').length;

  /* Risiko-Score: Inaktivität + Storni + Adherence + fehlende Folgebuchung */
  let score = 0; const why = [];
  if (inactive >= 21)      { score += 45; why.push(`${inactive} Tage kein Training`); }
  else if (inactive >= 12) { score += 28; why.push(`${inactive} Tage kein Training`); }
  if (cancels30 >= 2)      { score += 22; why.push(`${cancels30} Storni in 30 Tagen`); }
  if (noshows30 >= 1)      { score += 18; why.push(`${noshows30}× No-Show`); }
  if (adherence < 70)      { score += 20; why.push(`Adherence ${adherence} %`); }
  if (!next)               { score += 15; why.push('keine Folgebuchung'); }
  if (c.credits <= 2)      { score += 10; why.push(`nur ${c.credits} Einheiten offen`); }
  score = clamp(score, 0, 100);
  const level = score >= 55 ? 'crit' : score >= 30 ? 'warn' : 'good';

  const ci = c.checkins;
  const blank = { date: c.start, pain: 0, kraft: 0, kg: 0 };
  const first = ci[0] || blank, now = ci[ci.length - 1] || blank;

  return { bs, adherence, next, lastDone, inactive, totalDone, cancels30, noshows30, score, level, why, first, now };
}

/* ---------------- Nachrichten-Vorlagen (FITARY Voice) ---------------- */
const TPL = {
  confirm: {
    label: 'Buchungsbestätigung', channel: 'WhatsApp',
    build: (c, b) => `Fix eingetragen: ${fmtDate(b.date)} um ${b.time} — ${TYPES[b.type].label} mit ${b.coach}.
Plobergerstraße 7, Wels. Gratis-Parkplatz direkt vor der Tür, Dusche und Umkleide sind da. Sei 5 Minuten früher, wir starten pünktlich.
Der Termin liegt in Offisy — absagen kannst du bis 24 h vorher, dann bleibt deine Einheit erhalten.`
  },
  reminder: {
    label: '24h-Erinnerung', channel: 'WhatsApp',
    build: (c, b) => `Morgen ${b.time}: ${TYPES[b.type].short}. ${c.goal.split(',')[0]} — genau daran arbeiten wir.
Trainingsschuhe & Wasser mit. Bis morgen, ${c.name.split(' ')[0]}.`
  },
  cancelClient: {
    label: 'Storno bestätigt (Kunde)', channel: 'WhatsApp',
    build: (c, b) => `Passt — deine Einheit am ${fmtDate(b.date)} ist storniert, die Einheit bleibt dir erhalten.
Damit die Woche nicht komplett ausfällt: ${fmtDate(iso(addDays(parse(b.date), 2)))} oder ${fmtDate(iso(addDays(parse(b.date), 3)))} hätte ich noch einen Platz. Was passt dir besser?`
  },
  cancelStudio: {
    label: 'Storno durch Studio', channel: 'WhatsApp',
    build: (c, b) => `${c.name.split(' ')[0]}, ich muss die Einheit am ${fmtDate(b.date)} um ${b.time} verschieben — der Fehler liegt bei mir, nicht bei dir.
Du bekommst den nächsten freien Slot zuerst, und die Einheit geht natürlich nicht von deinem Kontingent ab.
Schreib mir kurz, wann es dir diese Woche passt.`
  },
  waitlist: {
    label: 'Frei gewordener Slot', channel: 'WhatsApp',
    build: (c, b) => `Kurzfristig frei geworden: ${fmtDate(b.date)}, ${b.time}.
Du wolltest diese Woche eine zusätzliche Einheit — der Slot gehört dir, wenn du in den nächsten 2 Stunden zusagst.`
  },
  noshow: {
    label: 'No-Show Follow-up', channel: 'WhatsApp',
    build: (c, b) => `Du warst heute nicht da — kein Vorwurf, aber ich frag trotzdem nach: Woran ist es gescheitert?
Wenn ${b.time} dauerhaft zu eng ist, legen wir dich auf einen Termin, der wirklich zu deiner Woche passt. Das ist kein Fitnessstudio, hier fällt es auf, wenn du fehlst.`
  },
  winback: {
    label: 'Win-back nach Inaktivität', channel: 'WhatsApp',
    build: (c, m) => `${c.name.split(' ')[0]}, ${m.inactive} Tage ohne Training. Kein Drama — aber die ${m.totalDone} Einheiten, die du schon drin hast, will ich nicht wegwerfen lassen.
Dein Stand aus dem letzten Check-in: Kraftindex ${m.now.kraft} (Start: ${m.first.kraft}). Das ist zu gut, um jetzt zu stoppen.
Ich halte dir diese Woche einen Slot frei. Sag einfach nur: Tag + Uhrzeit.`
  },
  credits: {
    label: 'Kontingent läuft aus', channel: 'WhatsApp',
    build: (c, m) => `Kurz-Info: Du hast noch ${c.credits} ${c.credits === 1 ? 'Einheit' : 'Einheiten'} auf deinem ${c.plan}.
Damit dein Rhythmus nicht reißt, verlängern wir vor der letzten Einheit — nicht danach. Neuer Block ab kommender Woche, gleicher Termin (${DOW[c.dow]} ${c.time})?`
  },
  milestone: {
    label: 'Meilenstein + Testimonial-Ask', channel: 'WhatsApp',
    build: (c, m) => `${m.totalDone} Einheiten. ${daysBetween(c.start, iso(today()))} Tage dabei.
Deine Zahlen: Kraftindex ${m.first.kraft} → ${m.now.kraft}${m.first.pain > m.now.pain ? `, Schmerz ${m.first.pain} → ${m.now.pain}` : ''}. Das hast du dir erarbeitet.
Eine Bitte: 30 Sekunden Handyvideo, wie es dir vor FITARY ging und wie es jetzt ist. Kein Skript, keine Kamera-Show — genau das überzeugt die Leute in Wels, die noch zögern.`
  },
  onboarding: {
    label: 'Onboarding Check-in (Tag 14)', channel: 'WhatsApp',
    build: (c, m) => `Zwei Wochen FITARY, ${c.name.split(' ')[0]}. Zeit für einen ehrlichen Zwischenstand:
1) Wie fühlt sich dein Körper nach den ersten Einheiten an?
2) Passt der Termin (${DOW[c.dow]} ${c.time}) wirklich in deine Woche?
3) Was war bis jetzt am schwersten?
Danach justiere ich den Plan. Die ersten 6 Wochen entscheiden, ob es hält.`
  },
  rebook: {
    label: 'Keine Folgebuchung', channel: 'WhatsApp',
    build: (c, m) => `In deinem Kalender steht gerade keine nächste Einheit.
Ergebnisse kommen nicht aus einzelnen Trainings, sondern aus dem fixen Termin. Ich halte dir ${DOW[c.dow]} ${c.time} — soll ich dich fix eintragen?`
  }
};

TPL.mobilityInvite = {
  label: 'Beweglichkeitstest / Re-Test', channel: 'WhatsApp',
  build: (c, m) => {
    const l = lastTest(c);
    return l
      ? `${c.name.split(' ')[0]}, dein letzter Beweglichkeitstest ist ${daysBetween(l.date, iso(today()))} Tage her.
Zeit für den Re-Test: 20 Minuten, gleiche 7 Messpunkte wie beim Eingangsbefund (Score damals: ${mobiScore(l)}/100).
Erst messen, dann trainieren — sonst arbeiten wir nach Gefühl statt nach Daten. ${DOW[c.dow]} ${c.time} eingeplant?`
      : `${c.name.split(' ')[0]}, bevor wir richtig loslegen: dein Beweglichkeitstest.
20 Minuten, 7 Messpunkte — Overhead Squat, Schulter, Hüftbeuger, Sprunggelenk, Rumpf, Nacken, hintere Kette.
Daraus kommt dein Plan. Nicht aus einer Standard-Vorlage. Wann passt es dir diese Woche?`;
  }
};
TPL.mobilityResult = {
  label: 'Testergebnis an Kund:in', channel: 'WhatsApp',
  build: (c, m) => {
    const b = baseTest(c), l = lastTest(c);
    if (!b || !l) return 'Noch kein Beweglichkeitstest vorhanden.';
    const best = MOBI.map(i => ({ i, d: l.items[i.id] - b.items[i.id] })).sort((x, y) => y.d - x.d)[0];
    const weak = MOBI.map(i => ({ i, v: l.items[i.id] })).sort((x, y) => x.v - y.v)[0];
    return `Dein Beweglichkeits-Score: ${mobiScore(b)} → ${mobiScore(l)} von 100.
Größter Fortschritt: ${best.i.label} (${b.items[best.i.id]} → ${l.items[best.i.id]}).
Nächste Baustelle: ${weak.i.label} — daran arbeiten wir in den nächsten Wochen gezielt.
Deine Werte stehen in deinem FITARY-Zugang, jederzeit einsehbar.`;
  }
};
TPL.welcomeVideo = {
  label: 'Willkommensvideo senden', channel: 'WhatsApp',
  build: (c, m) => `${c.name.split(' ')[0]}, ich hab dir ein kurzes Video aufgenommen — 60 Sekunden, nur für dich.
Drin: wie deine ersten Wochen ablaufen, warum wir mit dem Beweglichkeits- und Leistungstest starten und was ich von dir brauche.
Du findest es in deinem FITARY-Zugang. Schau es dir vor dem ersten Termin an, dann verlieren wir keine Minute im Studio.`
};
TPL.perfInvite = {
  label: 'Leistungstest / Re-Test', channel: 'WhatsApp',
  build: (c, m) => {
    const l = lastPerf(c);
    return l
      ? `${c.name.split(' ')[0]}, dein letzter Leistungstest ist ${daysBetween(l.date, iso(today()))} Tage her — Zeit für den Re-Test.
Gleiche 6 Messwerte wie beim letzten Mal: Plank, Liegestütze, Goblet Squat, 500 m Rudern, Ruhepuls, Körperfett.
Danach siehst du schwarz auf weiß, was die letzten 12 Wochen gebracht haben. Wann passt es dir?`
      : `${c.name.split(' ')[0]}, bevor wir Gewichte draufpacken: dein Leistungstest.
6 Messwerte, 30 Minuten. Daraus kommt deine Belastungssteuerung — und in 12 Wochen der Beweis, dass es funktioniert hat.`;
  }
};
TPL.perfResult = {
  label: 'Leistungswerte an Kund:in', channel: 'WhatsApp',
  build: (c, m) => {
    const b = basePerf(c), l = lastPerf(c);
    if (!b || !l) return 'Noch kein Leistungstest vorhanden.';
    const best = PERF.map(i => ({ i, d: ((l.items[i.id] - b.items[i.id]) / b.items[i.id]) * i.dir }))
      .sort((x, y) => y.d - x.d)[0];
    return `Deine Leistungswerte, ${c.name.split(' ')[0]}: Index ${perfIndex(c, l)} (Start = 100).
Stärkster Wert: ${best.i.label} ${b.items[best.i.id]} → ${l.items[best.i.id]} ${best.i.unit} (${(best.d * 100).toFixed(0)} %).
Alle Zahlen stehen in deinem FITARY-Zugang. Das ist kein Gefühl, das ist gemessen.`;
  }
};
TPL.leadPrep = {
  label: 'Erstkontakt vorbereiten', channel: 'WhatsApp',
  build: (c, b) => `${c.name.split(' ')[0]}, ${relDay(b.date)} um ${b.time} hast du deine 30 Minuten bei FITARY.
Ablauf: Beweglichkeitstest über 7 Messpunkte, danach sag ich dir ehrlich, woran es bei „${c.goal.toLowerCase()}" liegt — und ob ich der Richtige dafür bin.
Mitbringen: Trainingsschuhe und bewegliche Kleidung. Gratis-Parkplatz direkt vor der Tür, Plobergerstraße 7.
Die 30 Minuten kosten dich nichts, aber sie sind für mich blockiert — ich nehme in dieser Zeit niemanden sonst. Bestätige mir kurz mit „passt", dann steht der Termin.`
};
TPL.leadFollow = {
  label: 'Nach dem Erstkontakt: Empfehlung (24–48 h)', channel: 'WhatsApp',
  build: (c, m) => {
    const l = lastTest(c);
    const weak = l ? MOBI.map(i => ({ i, v: l.items[i.id] })).sort((a, b) => a.v - b.v)[0] : null;
    return `${c.name.split(' ')[0]}, hier ist dein Befund von gestern, schriftlich:
Beweglichkeits-Score ${l ? mobiScore(l) : '—'}/100. Größte Limitierung: ${weak ? weak.i.label + ' (' + weak.i.v + ' von 5)' : '—'}.
Das ist der Grund für „${c.goal.toLowerCase()}" — und das wird ohne gezieltes Training nicht besser, sondern mit jedem Jahr enger.
Meine Empfehlung: 2 Einheiten pro Woche, 6 Wochen, dann Re-Test mit denselben 7 Messpunkten. Danach siehst du schwarz auf weiß, ob es wirkt.
Mit dem Start bekommst du deinen persönlichen FITARY-Zugang: alle Messwerte, dein Verlauf, deine Termine, Videobotschaften von mir. Den gibt es nur für Kund:innen, nicht für Probetermine.
Ich halte dir ${DOW[c.dow]} ${c.time} bis Freitag frei — danach geht der Slot an die Warteliste. Ja oder anderer Termin?`;
  }
};
TPL.leadFollow2 = {
  label: 'Erstkontakt: letzte Erinnerung (3–9 Tage)', channel: 'WhatsApp',
  build: (c, m) => {
    const l = lastTest(c);
    const weak = l ? MOBI.map(i => ({ i, v: l.items[i.id] })).sort((a, b) => a.v - b.v)[0] : null;
    return `${c.name.split(' ')[0]}, ich mach es kurz, weil dein Termin sonst einfach ausläuft:
${weak ? weak.i.label + ' steht bei ' + weak.i.v + ' von 5' : 'Dein Befund liegt bei mir'}. Du hast die 30 Minuten investiert — den Rest nicht zu machen wäre die einzige Variante, bei der sich nichts ändert.
${DOW[c.dow]} ${c.time} ist noch frei. Wenn ich bis morgen nichts höre, gebe ich den Platz weiter und melde mich nicht mehr nach — versprochen.`;
  }
};
TPL.leadRevive = {
  label: 'Kalter Erstkontakt reaktivieren', channel: 'WhatsApp',
  build: (c, m) => {
    const d = leadAge(c, m), l = lastTest(c);
    return `${c.name.split(' ')[0]}, dein Beweglichkeitstest ist ${d} Tage her — Score ${l ? mobiScore(l) : '—'}/100.
Kein Verkaufsanruf, nur eine ehrliche Frage: hat sich seitdem etwas an „${c.goal.toLowerCase()}" verbessert?
Wenn ja: top, dann war es das von meiner Seite. Wenn nein: ich mach dir einen Re-Test gratis und wir schauen, was sich in der Zwischenzeit verändert hat. Zwei Wörter reichen: „ja" oder „Re-Test".`;
  }
};
TPL.leadNoshow = {
  label: 'No-Show beim Gratis-Termin', channel: 'WhatsApp',
  build: (c, b) => `${c.name.split(' ')[0]}, du warst heute nicht da. Kein Problem und keine Kosten — aber ich hatte die 30 Minuten für dich blockiert.
Wenn du willst, gebe ich dir einen zweiten Termin. Dann aber einen, den du wirklich schaffst.
Wenn gerade nicht die richtige Zeit ist: sag einfach kurz Bescheid, dann melde ich mich nicht weiter.`
};
TPL.access = {
  label: 'Persönlichen Zugang senden', channel: 'WhatsApp',
  build: (c, m) => `${c.name.split(' ')[0]}, dein Training startet — und damit ist dein persönlicher FITARY-Zugang freigeschaltet (${c.code}):
${accessLink(c)}

Der Link ist ${c.access.days} Tage gültig und nur für dich. Drin: dein Willkommensvideo, deine Test- und Leistungswerte, die nächste Einheit, dein Kontingent — und du kannst direkt absagen oder einen Zusatztermin anfragen.
Kein Sammel-Chat, keine Massen-App. Deine Reise, dein Zugang.`
};

/* ---------------- Aktions-Queue (Automationen) ---------------- */
const RULES = [
  { id:'leadfollow', level:'crit', tpl:'leadFollow', title:c=>`${c.name}: Empfehlung nach Gratis-Termin`,
    desc:'Entscheidungsfenster 24–48 h. Der Termin hat nichts gekostet — nur die Nachverfolgung macht daraus Umsatz.',
    match:(c,m)=> c.lead && leadState(c, m) === 'heiß',
    why:(c,m)=>`Test ${relDay(leadTest(c, m).date)} · ${c.source || 'Quelle unbekannt'} · Score ${lastTest(c) ? mobiScore(lastTest(c)) + '/100' : 'offen'}` },

  { id:'leadfollow2', level:'crit', tpl:'leadFollow2', title:c=>`${c.name}: letzte Erinnerung`,
    desc:'3–9 Tage nach dem Gratis-Termin. Eine klare, letzte Ansage schlägt drei halbherzige.',
    match:(c,m)=> c.lead && leadState(c, m) === 'offen',
    why:(c,m)=>`Test vor ${leadAge(c, m)} Tagen · ${c.source || 'Quelle unbekannt'} · noch kein Programm` },

  { id:'leadrevive', level:'warn', tpl:'leadRevive', title:c=>`${c.name}: kalter Erstkontakt`,
    desc:'Verlorener Gratis-Termin. Gratis-Re-Test ist der billigste Weg zurück ins Gespräch.',
    match:(c,m)=> c.lead && leadState(c, m) === 'kalt',
    why:(c,m)=>`Test vor ${leadAge(c, m)} Tagen · ${c.source || 'Quelle unbekannt'} · Score ${lastTest(c) ? mobiScore(lastTest(c)) + '/100' : '—'}` },

  { id:'leadnoshow', level:'warn', tpl:'leadNoshow', title:c=>`${c.name}: No-Show beim Gratis-Termin`,
    desc:'Gratis-Termine haben die höchste No-Show-Quote — genau ein Nachfassen, dann Schluss.',
    match:(c,m)=> c.lead && m.bs.some(b => b.type === 'bwg' && b.status === 'noshow' && daysBetween(b.date, iso(today())) <= 7),
    why:(c,m)=>`Termin verpasst · ${c.source || 'Quelle unbekannt'}` },

  { id:'leadprep', level:'flame', tpl:'leadPrep', title:c=>`${c.name}: Erstkontakt vorbereiten`,
    desc:'Beweglichkeitstest steht an — Vorbereitung senkt No-Shows beim wichtigsten Termin.',
    match:(c,m)=> c.lead && m.next && daysBetween(iso(today()), m.next.date) <= 3,
    why:(c,m)=>`${fmtDate(m.next.date)} · ${m.next.time} · Quelle ${c.source || '—'}` },

  { id:'winback', level:'crit', tpl:'winback', title:c=>`${c.name}: Win-back senden`,
    desc:'Kunde ohne Training seit ≥ 12 Tagen — höchste Churn-Wahrscheinlichkeit.',
    match:(c,m)=> !c.lead && m.inactive >= 12, why:(c,m)=>`${m.inactive} Tage inaktiv · Adherence ${m.adherence} % · ${m.totalDone} Einheiten investiert` },

  { id:'credits', level:'warn', tpl:'credits', title:c=>`${c.name}: Kontingent verlängern`,
    desc:'≤ 2 Einheiten offen — Verlängerung VOR der letzten Einheit ansprechen.',
    match:(c,m)=> !c.lead && c.credits <= 2 && m.inactive < 21, why:c=>`${c.credits} Einheiten offen · ${c.plan}` },

  { id:'noshow', level:'warn', tpl:'noshow', title:c=>`${c.name}: No-Show nachfassen`,
    desc:'Unentschuldigt gefehlt — innerhalb von 24 h ansprechen, sonst bleibt es dabei.',
    match:(c,m)=> !c.lead && m.noshows30 >= 1 && m.bs.some(b=>b.status==='noshow' && daysBetween(b.date, iso(today())) <= 7),
    why:(c,m)=>`${m.noshows30}× No-Show in 30 Tagen` },

  { id:'reminder', level:'flame', tpl:'reminder', title:c=>`${c.name}: 24h-Erinnerung`,
    desc:'Einheit in den nächsten 48 h — Erinnerung senkt No-Shows messbar.',
    match:(c,m)=> !c.lead && m.next && daysBetween(iso(today()), m.next.date) <= 2 && !m.next.reminded,
    why:(c,m)=>`${fmtDate(m.next.date)} · ${m.next.time} · ${TYPES[m.next.type].short}` },

  { id:'onboarding', level:'good', tpl:'onboarding', title:c=>`${c.name}: Onboarding-Check-in`,
    desc:'Tag 7–18 der Kundenreise — hier entscheidet sich, ob die Gewohnheit hält.',
    match:(c,m)=> { if (c.lead) return false; const d = daysBetween(c.start, iso(today())); return d >= 7 && d <= 18; },
    why:c=>`Tag ${daysBetween(c.start, iso(today()))} der Journey · Stufe ${stageOf(c).label}` },

  { id:'milestone', level:'good', tpl:'milestone', title:c=>`${c.name}: Meilenstein + Testimonial`,
    desc:'Vielfaches von 10 Einheiten erreicht — bester Moment für Social Proof.',
    match:(c,m)=> !c.lead && m.totalDone >= 10 && m.totalDone % 10 === 0 && m.inactive <= 10,
    why:(c,m)=>`${m.totalDone} Einheiten abgeschlossen · Adherence ${m.adherence} %` },

  { id:'mobility', level:'flame', tpl:'mobilityInvite', title:c=>`${c.name}: ${lastTest(c) ? 'Re-Test' : 'Beweglichkeitstest'} fällig`,
    desc:'Ohne Messung kein Beweis für Fortschritt — Baseline am Start, Re-Test alle 6 Wochen.',
    match:(c,m)=> !c.lead && testDue(c) && m.inactive < 21,
    why:c=>{ const l = lastTest(c); return l ? `Letzter Test vor ${daysBetween(l.date, iso(today()))} Tagen · Score ${mobiScore(l)}/100` : 'Noch kein Eingangsbefund erfasst'; } },

  { id:'performance', level:'flame', tpl:'perfInvite', title:c=>`${c.name}: ${lastPerf(c) ? 'Leistungs-Re-Test' : 'Leistungstest'} fällig`,
    desc:'Harte Zahlen alle 12 Wochen — ohne Re-Test kein Beweis, ohne Beweis keine Verlängerung.',
    match:(c,m)=> !c.lead && perfDue(c) && m.inactive < 21,
    why:c=>{ const l = lastPerf(c); return l ? `Letzter Test vor ${daysBetween(l.date, iso(today()))} Tagen · Index ${perfIndex(c, l)}` : 'Noch keine Ausgangswerte'; } },

  { id:'welcome', level:'good', tpl:'welcomeVideo', title:c=>`${c.name}: Willkommensvideo offen`,
    desc:'Video nicht gesehen — der persönliche Einstieg entscheidet über die ersten Wochen.',
    match:(c,m)=> (c.videos || []).some(v => v.kind === 'welcome' && !v.watched) && daysBetween(c.start, iso(today())) >= 2,
    why:c=>`Seit ${daysBetween(c.start, iso(today()))} Tagen Kund:in · Video noch ungesehen` },

  { id:'rebook', level:'warn', tpl:'rebook', title:c=>`${c.name}: Folgetermin fehlt`,
    desc:'Aktiver Kunde ohne nächste Buchung — Lücke schließen, bevor sie Routine wird.',
    match:(c,m)=> !c.lead && !m.next && m.inactive < 12, why:(c,m)=>`Letzte Einheit ${relDay(m.lastDone ? m.lastDone.date : c.start)}` }
];

/* Jede Regel ist standardmäßig aktiv — auch neue, die nach einem Update dazukommen.
   Ohne diese Normalisierung blieben neue Regeln in bestehenden Browserdaten stumm. */
RULES.forEach(r => { if (db.settings.autos[r.id] === undefined) db.settings.autos[r.id] = true; });
save();

function queue() {
  const out = [];
  db.clients.forEach(c => {
    const m = metrics(c);
    RULES.forEach(r => {
      if (!db.settings.autos[r.id]) return;
      if (!r.match(c, m)) return;
      const recent = db.messages.some(x => x.clientId === c.id && x.type === r.tpl &&
        daysBetween(x.date, iso(today())) <= 7);
      if (recent) return;
      out.push({ ruleId: r.id, level: r.level, tpl: r.tpl, clientId: c.id,
        rank: ['leadfollow', 'leadfollow2'].includes(r.id) ? 0 : ['leadprep', 'leadnoshow'].includes(r.id) ? 1 : r.id === 'leadrevive' ? 2 : 3,
        title: r.title(c), desc: r.desc, why: r.why(c, m) });
    });
  });
  const order = { crit: 0, warn: 1, flame: 2, good: 3 };
  return out.sort((a, b) => a.rank - b.rank || order[a.level] - order[b.level]);
}

const BOOKING_TPLS = ['confirm', 'reminder', 'cancelClient', 'cancelStudio', 'waitlist', 'noshow', 'leadPrep', 'leadNoshow'];
function ctxFor(c, tplId, booking) {
  const m = metrics(c);
  if (!BOOKING_TPLS.includes(tplId)) return m;
  return booking || m.next || m.lastDone ||
    { date: iso(addDays(today(), 1)), time: c.time, type: c.type, coach: c.coach || 'Yalcin' };
}

function draft(clientId, tplId, booking) {
  const c = client(clientId);
  const t = TPL[tplId];
  const text = t.build(c, ctxFor(c, tplId, booking));
  db.messages.unshift({ id: uid('m'), clientId, type: tplId, channel: t.channel,
    text, status: 'entwurf', date: iso(today()) });
  save();
  return text;
}

/* ---------------- Erstkontakt-Funnel ----------------
   Der Gratis-Test kostet den Interessenten nichts — also entscheidet die
   Nachverfolgung, ob daraus Umsatz wird. Diese Helfer machen das Leck sichtbar. */
const leadTest  = (c, m) => m.bs.find(b => b.type === 'bwg' && b.status === 'completed');
const leadAge   = (c, m) => { const b = leadTest(c, m); return b ? daysBetween(b.date, iso(today())) : null; };
const leadState = (c, m) => {
  const d = leadAge(c, m);
  if (d === null) return 'geplant';   /* Termin steht noch aus */
  if (d <= 2)  return 'heiß';         /* Entscheidungsfenster */
  if (d <= 9)  return 'offen';        /* zweite Chance */
  return 'kalt';                      /* verloren, solange nichts passiert */
};
/* Conversion der letzten 90 Tage: gewonnene Erstkontakte / alle Erstkontakte */
function conversion90() {
  const t = iso(today());
  const won = db.clients.filter(c => !c.lead && c.fromLead && daysBetween(c.firstContact, t) <= 90).length;
  const open = db.clients.filter(c => c.lead).filter(c => {
    const m = metrics(c); const b = m.bs.find(x => x.type === 'bwg');
    return b && Math.abs(daysBetween(b.date, t)) <= 90;
  }).length;
  const total = won + open;
  return { won, open, total, rate: total ? Math.round(won / total * 100) : 0 };
}

/* ---------------- Zugang (Magic Link) ---------------- */
const accessValid = c => c.access && c.access.days > 0 && daysBetween(c.access.issued, iso(today())) <= c.access.days;
const accessLink  = c => c.access ? `${location.origin}${location.pathname}?zugang=${c.access.token}` : '—';
const accessExpiry = c => c.access ? iso(addDays(parse(c.access.issued), c.access.days)) : '—';
function rotateAccess(c, days = 30) {
  c.access = { token: 'fit-' + Math.random().toString(36).slice(2, 12), issued: iso(today()), days };
  save();
}

/* ---------------- Charts (inline SVG) ---------------- */
function sparkline(values, { color = 'var(--flame)', h = 44, w = 150 } = {}) {
  if (values.length < 2) return '';
  const min = Math.min(...values), max = Math.max(...values), span = max - min || 1;
  const pts = values.map((v, i) => [
    8 + i * (w - 16) / (values.length - 1),
    h - 6 - ((v - min) / span) * (h - 14)
  ]);
  const d = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
  const last = pts[pts.length - 1];
  return `<svg class="chart" viewBox="0 0 ${w} ${h}" role="img" aria-hidden="true">
    <path d="${d}" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="${last[0].toFixed(1)}" cy="${last[1].toFixed(1)}" r="4" fill="${color}" stroke="var(--surface-2)" stroke-width="2"/>
  </svg>`;
}

function barchart(items, { h = 132 } = {}) {
  const w = 460, pad = 26, bw = (w - pad) / items.length;
  const max = Math.max(...items.map(i => i.v), 1);
  return `<svg class="chart" viewBox="0 0 ${w} ${h}" role="img" aria-label="Einheiten pro Woche">
    <line x1="0" y1="${h - 20}" x2="${w}" y2="${h - 20}" stroke="var(--line)" stroke-width="1"/>
    ${items.map((it, i) => {
      const bh = Math.max(3, (it.v / max) * (h - 44));
      const x = i * bw + bw * .18, y = h - 20 - bh, bwi = bw * .64;
      return `<g><title>${it.label}: ${it.v} Einheiten</title>
        <rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${bwi.toFixed(1)}" height="${bh.toFixed(1)}" rx="4"
              fill="${it.now ? 'var(--flame)' : 'rgba(255,138,80,.45)'}"/>
        <text x="${(x + bwi / 2).toFixed(1)}" y="${h - 6}" text-anchor="middle">${it.label}</text>
        <text x="${(x + bwi / 2).toFixed(1)}" y="${(y - 5).toFixed(1)}" text-anchor="middle" fill="var(--ink-2)">${it.v}</text>
      </g>`;
    }).join('')}
  </svg>`;
}

function ring(pct, level = 'good') {
  const c = level === 'crit' ? 'var(--crit)' : level === 'warn' ? 'var(--warn)' : 'var(--good)';
  const r = 18, circ = 2 * Math.PI * r;
  return `<span class="ring"><svg width="46" height="46" viewBox="0 0 46 46" role="img" aria-label="${pct} Prozent">
      <circle cx="23" cy="23" r="${r}" fill="none" stroke="var(--surface-3)" stroke-width="4"/>
      <circle cx="23" cy="23" r="${r}" fill="none" stroke="${c}" stroke-width="4" stroke-linecap="round"
        stroke-dasharray="${(circ * pct / 100).toFixed(1)} ${circ.toFixed(1)}" transform="rotate(-90 23 23)"/>
    </svg><span class="ring__txt" style="color:${c}">${pct}</span></span>`;
}

/* =========================================================
   VIEWS
   ========================================================= */
let VIEW = 'cockpit', weekOffset = 0, filter = { q: '', stage: 'all', risk: 'all' }, msgFilter = 'alle';

const TITLES = {
  cockpit:    ['Cockpit', 'Heute im Studio'],
  clients:    ['Kund:innen', 'Journey & Fortschritt'],
  calendar:   ['Buchungen', 'Wochenplan Plobergerstraße'],
  messages:   ['Kommunikation', 'Nachrichten an Kund:innen'],
  automations:['Automationen', 'Regeln, die für dich mitdenken']
};

const ACCESS = new URLSearchParams(location.search).get('zugang');
const PORTAL_RAW = ACCESS ? db.clients.find(c =>
  (c.access && c.access.token.toLowerCase() === ACCESS.toLowerCase()) || c.code.toLowerCase() === ACCESS.toLowerCase()) : null;
let PORTAL = PORTAL_RAW && accessValid(PORTAL_RAW) ? PORTAL_RAW : null;
/* Jeder ?zugang-Aufruf, der nicht auf einen gültigen Link passt, landet NIE im Studio-Cockpit. */
const PORTAL_EXPIRED = !!ACCESS && !PORTAL;

/* Demo-Umschalter: die Kundenansicht ohne Query-Parameter öffnen — nötig, sobald die
   App eingebettet läuft und die URL nicht durchgereicht wird. */
let PORTAL_DEMO = false;
try {
  const pid = sessionStorage.getItem('fitary.portal');
  if (!PORTAL && !PORTAL_EXPIRED && pid) {
    const c = client(pid);
    if (c && accessValid(c)) { PORTAL = c; PORTAL_DEMO = true; }
  }
} catch (e) {}
function openPortal(id) {
  const c = client(id);
  if (!accessValid(c)) { toast('Zugang nicht freigeschaltet'); return; }
  try { sessionStorage.setItem('fitary.portal', id); } catch (e) {}
  PORTAL = c; PORTAL_DEMO = true; closeAll(); render();
}
function leavePortal() {
  try { sessionStorage.removeItem('fitary.portal'); } catch (e) {}
  PORTAL = null; PORTAL_DEMO = false;
  document.body.classList.remove('is-portal');
  $('#quickBook').textContent = '+ Einheit buchen';
  render();
}

function renderExpired() {
  document.body.classList.add('is-portal');
  $('#topEyebrow').textContent = 'FITARY';
  $('#topTitle').textContent = 'Zugang abgelaufen';
  $('#quickBook').style.display = 'none';
  $('#view').innerHTML = `<div class="card" style="max-width:520px;margin:40px auto;text-align:center">
    <p class="card__title" style="font-size:19px">Dieser Link ist nicht (mehr) gültig</p>
    <p class="card__sub" style="margin:10px 0 18px">Der persönliche FITARY-Bereich wird mit dem Trainingsstart freigeschaltet
      und ist jeweils 30 Tage gültig. Wenn dein Link abgelaufen ist, fordere einfach einen neuen an —
      deine Messwerte und dein Verlauf bleiben erhalten.</p>
    <a class="btn btn--primary" href="https://wa.me/436703565006" target="_blank" rel="noopener">Neuen Zugang per WhatsApp anfordern</a>
  </div>`;
}

function render() {
  if (PORTAL_EXPIRED) return renderExpired();
  if (PORTAL) return renderPortal(PORTAL.id);
  const [eyebrow, title] = TITLES[VIEW];
  $('#topEyebrow').textContent = eyebrow;
  $('#topTitle').textContent = title;
  $$('.navitem').forEach(b => b.classList.toggle('is-active', b.dataset.view === VIEW));
  $('#badgeClients').textContent = db.clients.length;
  const open = db.messages.filter(m => m.status === 'entwurf').length;
  $('#badgeMsg').textContent = open || '';
  $('#feedDot').classList.toggle('on', db.events.some(e => !e.seen));
  $('#view').innerHTML = ({
    cockpit: viewCockpit, clients: viewClients, calendar: viewCalendar,
    messages: viewMessages, automations: viewAutomations
  })[VIEW]();
  window.scrollTo({ top: 0 });
}

/* ---------------- Cockpit ---------------- */
function viewCockpit() {
  const t = iso(today()), ws = iso(startOfWeek(today())), we = iso(addDays(startOfWeek(today()), 6));
  const week = db.bookings.filter(b => b.date >= ws && b.date <= we && b.status !== 'cancelled');
  const util = Math.round(week.length / WEEK_CAPACITY * 100);

  const past30 = db.bookings.filter(b => b.date < t && daysBetween(b.date, t) <= 30);
  const missed = past30.filter(b => b.status !== 'completed').length;
  const missRate = past30.length ? Math.round(missed / past30.length * 100) : 0;

  const withM = db.clients.map(c => ({ c, m: metrics(c) }));
  const members = withM.filter(x => !x.c.lead);
  const leads   = withM.filter(x => x.c.lead);
  const active = members.filter(x => x.m.inactive < 21).length;
  const atRisk = members.filter(x => x.m.level === 'crit');
  const renew  = members.filter(x => x.c.credits <= 2).length;
  const leadsOpen = leads.length;

  const todays = db.bookings.filter(b => b.date === t).sort((a, b) => a.time.localeCompare(b.time));
  const q = queue();

  /* Einheiten pro Woche, letzte 8 Wochen */
  const bars = [];
  for (let w = 7; w >= 0; w--) {
    const s = iso(addDays(startOfWeek(today()), -w * 7)), e = iso(addDays(startOfWeek(today()), -w * 7 + 6));
    bars.push({
      label: w === 0 ? 'jetzt' : 'KW-' + w,
      v: db.bookings.filter(b => b.date >= s && b.date <= e && (b.status === 'completed' || b.status === 'confirmed')).length,
      now: w === 0
    });
  }

  const stageCount = STAGES.map(s => ({ s, n: db.clients.filter(c => stageOf(c).id === s.id).length }));

  return `
  <div class="grid grid--kpi">
    ${kpi('Einheiten diese Woche', week.length, `${util} % Auslastung (Ziel 80 %)`, util >= 80 ? 'good' : util >= 60 ? 'warn' : 'crit')}
    ${kpi('Aktive Kund:innen', active, `${members.length - active} inaktiv · ${members.length} gesamt`, active === members.length ? 'good' : 'warn')}
    ${kpi('Erstkontakte offen', leadsOpen, leadsOpen ? leads.map(x => x.c.name.split(' ')[0]).join(', ') : 'keine Gratis-Termine offen', leadsOpen ? 'warn' : '')}
    ${(() => { const cv = conversion90();
      return kpi('Conversion 90 T.', cv.rate + ' %', `${cv.won} von ${cv.total} Erstkontakten gestartet`,
        cv.rate >= 50 ? 'good' : cv.rate >= 30 ? 'warn' : 'crit'); })()}
    ${kpi('Ausfallquote 30 T.', missRate + ' %', `${missed} Storni & No-Shows`, missRate <= 10 ? 'good' : missRate <= 18 ? 'warn' : 'crit')}
    ${kpi('Churn-Risiko', atRisk.length, atRisk.length ? atRisk.map(x => x.c.name.split(' ')[0]).join(', ') : 'niemand kritisch', atRisk.length ? 'crit' : 'good')}
    ${kpi('Verlängerung fällig', renew, 'Kontingent ≤ 2 Einheiten', renew ? 'warn' : 'good')}
  </div>

  <div class="grid grid--2" style="margin-top:16px">
    <div>
      <div class="card">
        <div class="card__head">
          <div><p class="card__title">Handlungsbedarf</p><p class="card__sub">Nach Umsatz- und Bindungswirkung sortiert</p></div>
          <span class="pill pill--flame">${q.length} offen</span>
        </div>
        ${q.length ? q.map(a => `
          <div class="action action--${a.level}">
            <div class="action__body">
              <p class="action__title">${a.title}</p>
              <p class="action__why">${a.why}</p>
              <p class="action__why" style="color:var(--ink-3)">${a.desc}</p>
              <div class="action__acts">
                <button class="btn btn--sm btn--primary" data-act="draft" data-id="${a.clientId}" data-tpl="${a.tpl}">Nachricht erstellen</button>
                <button class="btn btn--sm btn--ghost" data-act="client" data-id="${a.clientId}">Kundenakte</button>
              </div>
            </div>
          </div>`).join('') : '<p class="empty">Alles erledigt. Kein offener Handlungsbedarf.</p>'}
      </div>

      <div class="card" style="margin-top:16px">
        <div class="card__head">
          <div><p class="card__title">Einheiten pro Woche</p><p class="card__sub">Abgeschlossen + gebucht, letzte 8 Wochen</p></div>
        </div>
        ${barchart(bars)}
      </div>
    </div>

    <div>
      <div class="card">
        <div class="card__head">
          <div><p class="card__title">Heute · ${fmtDate(t)}</p><p class="card__sub">${todays.length} Einheiten geplant</p></div>
        </div>
        ${todays.length ? todays.map(b => bookingRow(b)).join('') : '<p class="empty">Heute keine Einheiten gebucht.</p>'}
      </div>

      <div class="card" style="margin-top:16px">
        <div class="card__head"><div><p class="card__title">Journey-Verteilung</p><p class="card__sub">Wo deine Kund:innen gerade stehen</p></div></div>
        ${stageCount.map(({ s, n }) => `
          <div style="display:flex;align-items:center;gap:12px;padding:7px 0">
            <span style="width:96px;font-size:12.5px;color:var(--ink-2)">${s.label}</span>
            <span style="flex:1;height:8px;border-radius:99px;background:var(--surface-3);overflow:hidden">
              <span style="display:block;height:100%;width:${db.clients.length ? n / db.clients.length * 100 : 0}%;background:var(--flame);border-radius:99px"></span>
            </span>
            <span style="font-family:var(--font-d);font-weight:700;font-size:13px;width:18px;text-align:right">${n}</span>
          </div>`).join('')}
      </div>
    </div>
  </div>`;
}

const kpi = (label, val, meta, tone = '') => `
  <div class="kpi">
    <p class="kpi__label">${label}</p>
    <p class="kpi__value">${val}</p>
    <p class="kpi__meta ${tone}">${meta}</p>
  </div>`;

function bookingRow(b) {
  const c = client(b.clientId);
  const st = { confirmed: ['pill--flame', 'gebucht'], completed: ['pill--good', 'absolviert'],
               cancelled: ['pill--crit', 'storniert'], noshow: ['pill--warn', 'No-Show'] }[b.status];
  return `
    <div class="row row--click" data-act="booking" data-id="${b.id}">
      <span class="avatar">${b.time.slice(0, 5)}</span>
      <div class="row__main">
        <p class="row__name">${c ? c.name : '—'}</p>
        <p class="row__meta">${TYPES[b.type].label} · ${b.coach}</p>
      </div>
      <div class="row__side"><span class="pill ${st[0]}">${st[1]}</span></div>
    </div>`;
}

/* ---------------- Kund:innen ---------------- */
function viewClients() {
  const rows = db.clients.map(c => ({ c, m: metrics(c) }))
    .filter(({ c, m }) => {
      if (filter.q && !(c.name + c.segment + c.goal).toLowerCase().includes(filter.q.toLowerCase())) return false;
      if (filter.stage !== 'all' && stageOf(c).id !== filter.stage) return false;
      if (filter.risk !== 'all' && m.level !== filter.risk) return false;
      return true;
    })
    .sort((a, b) => b.m.score - a.m.score);

  return `
  <div class="searchbar">
    <input id="fq" placeholder="Name, Segment oder Ziel suchen…" value="${filter.q}" />
    <select id="fstage">
      <option value="all">Alle Journey-Stufen</option>
      ${STAGES.map(s => `<option value="${s.id}" ${filter.stage === s.id ? 'selected' : ''}>${s.label}</option>`).join('')}
    </select>
    <select id="frisk">
      <option value="all">Alle Risikostufen</option>
      <option value="crit" ${filter.risk === 'crit' ? 'selected' : ''}>Kritisch</option>
      <option value="warn" ${filter.risk === 'warn' ? 'selected' : ''}>Beobachten</option>
      <option value="good" ${filter.risk === 'good' ? 'selected' : ''}>Stabil</option>
    </select>
  </div>

  ${rows.length ? rows.map(({ c, m }) => `
    <div class="row row--click" data-act="client" data-id="${c.id}">
      <span class="avatar ${m.level === 'crit' ? 'avatar--risk' : m.level === 'good' ? 'avatar--good' : ''}">${initials(c.name)}</span>
      <div class="row__main">
        <p class="row__name">${c.name} <span class="pill stage-pill ${c.lead ? 'pill--flame' : ''}">${stageOf(c).label}</span></p>
        <p class="row__meta">${c.lead ? `Erstkontakt (${leadState(c, m)}) · ${c.source || 'Quelle unbekannt'} · ${leadAge(c, m) === null ? 'Termin steht aus' : 'Test vor ' + leadAge(c, m) + ' Tagen'}`
          : `${c.segment} · ${TYPES[c.type].short} · ${m.totalDone} Einheiten · ${c.credits} offen`}
          ${m.next ? ` · nächste ${relDay(m.next.date)}` : ' · <span style="color:var(--warn)">kein Folgetermin</span>'}</p>
      </div>
      <div class="row__side">
        ${m.level === 'crit' ? `<span class="pill pill--crit">Risiko ${m.score}</span>`
          : m.level === 'warn' ? `<span class="pill pill--warn">beobachten</span>`
          : `<span class="pill pill--good">stabil</span>`}
        ${ring(m.adherence, m.adherence >= 80 ? 'good' : m.adherence >= 60 ? 'warn' : 'crit')}
      </div>
    </div>`).join('') : '<p class="empty">Keine Treffer.</p>'}`;
}

/* ---------------- Kundenakte (Drawer) ---------------- */
function openClient(id) {
  const c = client(id), m = metrics(c), st = stageOf(c);
  const ci = c.checkins;
  const dPain = (m.now.pain - m.first.pain).toFixed(1);
  const dKraft = m.now.kraft - m.first.kraft;
  const dKg = (m.now.kg - m.first.kg).toFixed(1);
  const hist = m.bs.filter(b => b.date < iso(today())).slice(-8).reverse();
  const stageIdx = STAGES.findIndex(s => s.id === st.id);

  $('#drawerPanel').innerHTML = `
    <div class="panel__head">
      <div>
        <p class="panel__name">${c.name}</p>
        <p class="panel__meta">${c.segment} · seit ${fmtDate(c.start)} · ${daysBetween(c.start, iso(today()))} Tage</p>
        <p class="panel__meta" style="color:var(--ink-2);margin-top:6px">Ziel: ${c.goal}</p>
      </div>
      <button class="closebtn" data-close>✕</button>
    </div>

    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:20px">
      <span class="pill pill--flame stage-pill">${st.label}</span>
      <span class="pill">${TYPES[c.type].short}</span>
      <span class="pill">${c.plan} · ${c.credits} offen</span>
      <span class="pill ${m.level === 'crit' ? 'pill--crit' : m.level === 'warn' ? 'pill--warn' : 'pill--good'}">Risiko ${m.score}</span>
    </div>

    ${c.lead ? `<div class="action action--crit" style="margin-bottom:18px"><div class="action__body">
      <p class="action__title">Erstkontakt — Beweglichkeitstest</p>
      <p class="action__why">${m.bs.some(b => b.status === 'completed')
        ? 'Test absolviert. Befund liegt vor, Programm noch offen — jetzt entscheidet sich, ob daraus ein:e Kund:in wird.'
        : `Test gebucht für ${m.next ? fmtDate(m.next.date) + ' · ' + m.next.time : '—'}. Vorbereitung senken No-Shows beim wichtigsten Termin.`}</p>
      <p class="action__why" style="color:var(--ink-3)">Quelle: ${c.source || 'unbekannt'} · 30 Min gratis · App-Zugang erst mit Trainingsstart</p>
      <div class="action__acts">
        <button class="btn btn--sm btn--primary" data-act="convert" data-id="${c.id}">In Kund:in umwandeln</button>
        <button class="btn btn--sm btn--ghost" data-act="draft" data-id="${c.id}" data-tpl="${m.bs.some(b => b.status === 'completed') ? 'leadFollow' : 'leadPrep'}">Nachricht erstellen</button>
      </div></div></div>` : ''}

    <p class="section-title">Journey</p>
    <div class="rail">
      ${STAGES.map((s, i) => `
        <div class="rail__step ${i < stageIdx ? 'done' : i === stageIdx ? 'now' : ''}">
          <span class="rail__dot"></span>
          <p class="rail__label">${s.label}</p>
        </div>`).join('')}
    </div>
    <p class="card__sub" style="margin-bottom:18px">${st.desc}</p>

    ${ci.length > 1 ? `<p class="section-title">Fortschritt seit Start</p>
    <div class="grid" style="grid-template-columns:repeat(3,1fr)">
      ${metricBox('Schmerz (0–10)', m.now.pain, dPain, dPain <= 0, ci.map(x => x.pain), 'var(--good)')}
      ${metricBox('Kraftindex', m.now.kraft, (dKraft > 0 ? '+' : '') + dKraft, dKraft >= 0, ci.map(x => x.kraft), 'var(--flame)')}
      ${metricBox('Gewicht (kg)', m.now.kg, (dKg > 0 ? '+' : '') + dKg, true, ci.map(x => x.kg), 'var(--ink-2)')}
    </div>` : ''}

    ${mobilitySection(c)}

    ${performanceSection(c)}

    ${videoSection(c)}

    <p class="section-title">Verlässlichkeit</p>
    <div class="grid" style="grid-template-columns:repeat(3,1fr)">
      <div class="metricbox"><p class="metricbox__label">Adherence</p><p class="metricbox__val">${m.adherence} %</p><p class="card__sub">letzte 8 Wochen</p></div>
      <div class="metricbox"><p class="metricbox__label">Storni 30 T.</p><p class="metricbox__val">${m.cancels30}</p><p class="card__sub">${m.noshows30} No-Shows</p></div>
      <div class="metricbox"><p class="metricbox__label">Letztes Training</p><p class="metricbox__val" style="font-size:16px">${m.lastDone ? relDay(m.lastDone.date) : '—'}</p><p class="card__sub">${m.totalDone} Einheiten gesamt</p></div>
    </div>

    ${m.why.length ? `<div class="action action--${m.level}" style="margin-top:16px">
      <div class="action__body"><p class="action__title">Risiko-Signale</p>
      <p class="action__why">${m.why.join(' · ')}</p></div></div>` : ''}

    <p class="section-title">Nächste Einheit</p>
    ${m.next ? `<div class="row">
        <span class="avatar">${m.next.time.slice(0,5)}</span>
        <div class="row__main"><p class="row__name">${fmtDate(m.next.date)} · ${relDay(m.next.date)}</p>
        <p class="row__meta">${TYPES[m.next.type].label}</p></div>
        <div class="row__side"><button class="btn btn--sm btn--ghost" data-act="cancelask" data-id="${m.next.id}">Stornieren</button></div>
      </div>` : `<div class="row"><div class="row__main"><p class="row__name" style="color:var(--warn)">Kein Folgetermin gebucht</p>
        <p class="row__meta">Lücke schließen, bevor sie zur Gewohnheit wird.</p></div>
        <div class="row__side"><button class="btn btn--sm btn--primary" data-act="bookfor" data-id="${c.id}">Buchen</button></div></div>`}

    <p class="section-title">Letzte Einheiten</p>
    ${hist.length ? hist.map(b => bookingRow(b)).join('') : '<p class="empty">Noch keine Historie.</p>'}

    <p class="section-title">Kommunikation</p>
    <div style="display:flex;gap:8px;flex-wrap:wrap">
      ${['winback','credits','milestone','onboarding','rebook','welcomeVideo','perfResult'].map(t =>
        `<button class="btn btn--sm btn--ghost" data-act="draft" data-id="${c.id}" data-tpl="${t}">${TPL[t].label}</button>`).join('')}
    </div>

    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:22px">
      <button class="btn btn--primary" data-act="bookfor" data-id="${c.id}">+ Einheit buchen</button>
      ${c.access ? `<button class="btn btn--ghost" data-act="openportal" data-id="${c.id}">Kundenansicht öffnen</button>` : ''}
      <button class="btn btn--ghost" data-act="portal" data-id="${c.id}">Handy-Vorschau</button>
      <button class="btn btn--ghost" data-act="access" data-id="${c.id}">${c.access ? 'Zugang teilen' : 'Zugang (ab Start)'}</button>
    </div>
    <p class="card__sub" style="margin-top:12px">${c.phone ? `WhatsApp: +${c.phone} · ` : ''}${c.email}</p>
  `;
  $('#drawer').setAttribute('aria-hidden', 'false');
}

function mobilitySection(c) {
  const b = baseTest(c), l = lastTest(c);
  if (!b) return `<p class="section-title">Beweglichkeitstest</p>
    <div class="action action--warn"><div class="action__body">
      <p class="action__title">Eingangsbefund fehlt</p>
      <p class="action__why">Jede FITARY-Journey startet mit dem Beweglichkeitstest — 7 Messpunkte, 20 Minuten. Ohne Baseline kein Beweis für Fortschritt.</p>
      <div class="action__acts">
        <button class="btn btn--sm btn--primary" data-act="testnew" data-id="${c.id}">Test erfassen</button>
        <button class="btn btn--sm btn--ghost" data-act="draft" data-id="${c.id}" data-tpl="mobilityInvite">Einladung senden</button>
      </div></div></div>`;

  const due = testDue(c);
  const scores = c.mobility.map(mobiScore);
  const delta = mobiScore(l) - mobiScore(b);

  return `<p class="section-title">Beweglichkeitstest · ${c.mobility.length} ${c.mobility.length === 1 ? 'Messung' : 'Messungen'}</p>
  <div class="metricbox" style="margin-bottom:12px">
    <div style="display:flex;align-items:center;justify-content:space-between;gap:14px;flex-wrap:wrap">
      <div style="min-width:0">
        <p class="metricbox__label">Mobility-Score</p>
        <p class="metricbox__val" style="white-space:nowrap">${mobiScore(b)} → ${mobiScore(l)}<span style="font-size:12px;color:var(--ink-3);font-weight:500"> / 100</span><span class="${delta >= 0 ? 'delta-good' : 'delta-crit'}">${delta >= 0 ? '+' : ''}${delta}</span></p>
        <p class="card__sub">${l.phase} · ${fmtDate(l.date)} ${due ? '· <span style="color:var(--flame)">Re-Test fällig</span>' : `· nächster Re-Test ${relDay(iso(addDays(parse(l.date), RETEST_DAYS)))}`}</p>
      </div>
      <span style="flex:0 0 132px;max-width:132px">${sparkline(scores, { color: 'var(--good)', w: 132, h: 44 })}</span>
    </div>
  </div>

  ${MOBI.map(i => {
    const v0 = b.items[i.id], v1 = l.items[i.id], d = +(v1 - v0).toFixed(1);
    const tone = v1 >= 4 ? 'var(--good)' : v1 >= 2.8 ? 'var(--warn)' : 'var(--crit)';
    return `<div style="display:flex;align-items:center;gap:12px;padding:8px 0;border-bottom:1px solid var(--line)">
      <div style="width:138px;flex-shrink:0;min-width:0">
        <p style="font-size:13px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${i.label}</p>
        <p class="card__sub" style="font-size:11px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${i.hint}</p>
      </div>
      <span style="flex:1;height:8px;border-radius:99px;background:var(--surface-3);position:relative;overflow:hidden" title="Baseline ${v0} · aktuell ${v1}">
        <span style="position:absolute;inset:0 auto 0 0;width:${v1 / 5 * 100}%;background:${tone};border-radius:99px"></span>
        <span style="position:absolute;top:-2px;bottom:-2px;left:${v0 / 5 * 100}%;width:2px;background:var(--ink)"></span>
      </span>
      <span style="width:78px;text-align:right;font-size:12.5px;color:var(--ink-2)">${v0} → <strong style="color:${tone}">${v1}</strong></span>
      <span style="width:38px;text-align:right;font-size:12px" class="${d >= 0 ? 'delta-good' : 'delta-crit'}">${d >= 0 ? '+' : ''}${d}</span>
    </div>`;
  }).join('')}

  <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:12px">
    <button class="btn btn--sm ${due ? 'btn--primary' : 'btn--ghost'}" data-act="testnew" data-id="${c.id}">Re-Test erfassen</button>
    <button class="btn btn--sm btn--ghost" data-act="draft" data-id="${c.id}" data-tpl="mobilityResult">Ergebnis an Kund:in</button>
  </div>`;
}

function performanceSection(c) {
  const b = basePerf(c), l = lastPerf(c);
  if (!b) return `<p class="section-title">Leistungstest</p>
    <div class="action action--warn"><div class="action__body">
      <p class="action__title">Keine Ausgangswerte</p>
      <p class="action__why">6 Messwerte, 30 Minuten — ohne Baseline lässt sich in 12 Wochen nichts beweisen.</p>
      <div class="action__acts">
        <button class="btn btn--sm btn--primary" data-act="perfnew" data-id="${c.id}">Test erfassen</button>
        <button class="btn btn--sm btn--ghost" data-act="draft" data-id="${c.id}" data-tpl="perfInvite">Einladung senden</button>
      </div></div></div>`;

  const due = perfDue(c), idx = perfIndex(c, l);
  const series = c.performance.map(e => perfIndex(c, e));

  return `<p class="section-title">Leistungstest · ${c.performance.length} ${c.performance.length === 1 ? 'Messung' : 'Messungen'}</p>
  <div class="metricbox" style="margin-bottom:12px">
    <div style="display:flex;align-items:center;justify-content:space-between;gap:14px;flex-wrap:wrap">
      <div style="min-width:0">
        <p class="metricbox__label">Leistungsindex</p>
        <p class="metricbox__val" style="white-space:nowrap">100 → ${idx}<span class="${idx >= 100 ? 'delta-good' : 'delta-crit'}">${idx >= 100 ? '+' : ''}${idx - 100} %</span></p>
        <p class="card__sub">${l.phase} · ${fmtDate(l.date)} ${due ? '· <span style="color:var(--flame)">Re-Test fällig</span>' : `· nächster Re-Test ${relDay(iso(addDays(parse(l.date), PERF_RETEST)))}`}</p>
      </div>
      <span style="flex:0 0 132px;max-width:132px">${sparkline(series.length > 1 ? series : [100, idx], { color: 'var(--flame)', w: 132, h: 44 })}</span>
    </div>
  </div>

  ${PERF.map(i => {
    const v0 = b.items[i.id], v1 = l.items[i.id];
    const rel = ((v1 - v0) / v0) * 100 * i.dir;
    const tone = rel >= 5 ? 'var(--good)' : rel >= -1 ? 'var(--warn)' : 'var(--crit)';
    return `<div style="display:flex;align-items:center;gap:12px;padding:8px 0;border-bottom:1px solid var(--line)">
      <div style="width:138px;flex-shrink:0;min-width:0">
        <p style="font-size:13px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${i.label}</p>
        <p class="card__sub" style="font-size:11px">${i.dir === 1 ? 'mehr ist besser' : 'weniger ist besser'}</p>
      </div>
      <span style="flex:1;height:8px;border-radius:99px;background:var(--surface-3);position:relative;overflow:hidden">
        <span style="position:absolute;inset:0 auto 0 0;width:${clamp(50 + rel * 1.6, 6, 100)}%;background:${tone};border-radius:99px"></span>
        <span style="position:absolute;top:-2px;bottom:-2px;left:50%;width:2px;background:var(--ink)"></span>
      </span>
      <span style="width:104px;text-align:right;font-size:12.5px;color:var(--ink-2)">${v0} → <strong style="color:${tone}">${v1}</strong> ${i.unit}</span>
      <span style="width:44px;text-align:right;font-size:12px" class="${rel >= 0 ? 'delta-good' : 'delta-crit'}">${rel >= 0 ? '+' : ''}${rel.toFixed(0)} %</span>
    </div>`;
  }).join('')}

  <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:12px">
    <button class="btn btn--sm ${due ? 'btn--primary' : 'btn--ghost'}" data-act="perfnew" data-id="${c.id}">Re-Test erfassen</button>
    <button class="btn btn--sm btn--ghost" data-act="draft" data-id="${c.id}" data-tpl="perfResult">Werte an Kund:in</button>
  </div>`;
}

function videoSection(c) {
  const vids = c.videos || [];
  return `<p class="section-title">Videobotschaften · ${vids.filter(v => v.watched).length}/${vids.length} gesehen</p>
  ${!vids.length && c.lead ? '<p class="empty">Videobotschaften gehören zum Programm — sie werden mit dem Trainingsstart freigeschaltet.</p>' : ''}
  ${vids.length ? vids.map(v => `
    <div class="row">
      <span class="avatar ${v.watched ? 'avatar--good' : 'avatar--risk'}">▶</span>
      <div class="row__main">
        <p class="row__name">${v.title}</p>
        <p class="row__meta">${VIDEO_KINDS[v.kind]} · ${fmtDate(v.date)} · ${v.watched ? 'gesehen ' + (v.watchedAt ? relDay(v.watchedAt) : '') : '<span style="color:var(--warn)">noch nicht gesehen</span>'}</p>
      </div>
      <div class="row__side"><button class="btn btn--sm btn--ghost" data-act="play" data-id="${c.id}" data-vid="${v.id}">Ansehen</button></div>
    </div>`).join('') : (c.lead ? '' : '<p class="empty">Noch kein Video hinterlegt.</p>')}
  <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:12px">
    <button class="btn btn--sm btn--ghost" data-act="videoadd" data-id="${c.id}">+ Video hinterlegen</button>
    <button class="btn btn--sm btn--ghost" data-act="draft" data-id="${c.id}" data-tpl="welcomeVideo">Video ankündigen</button>
  </div>`;
}

function welcomeScript(c) {
  const st = stageOf(c);
  return `[0–5 s] Kamera an, kein Intro-Gerede:
"Servus ${c.name.split(' ')[0]}, Yalcin hier. Willkommen bei FITARY."

[5–20 s] Warum wir messen:
"Bevor wir irgendein Gewicht anfassen, machen wir zwei Tests: Beweglichkeit — 7 Messpunkte — und Leistung — 6 Werte. Daraus baue ich deinen Plan. Nicht aus einer Vorlage."

[20–35 s] Was ${c.name.split(' ')[0]} erwartet:
"Ziel: ${c.goal}. In den ersten 6 Wochen geht es um Technik und Regelmäßigkeit, nicht um Rekorde. ${st.label}-Phase heißt: ${st.desc.toLowerCase()}."

[35–50 s] Was ich von dir brauche:
"Zwei Dinge: komm pünktlich, und sag mir ehrlich, wie es dir zwischen den Einheiten geht. Alles andere ist mein Job."

[50–60 s] CTA:
"Deine Werte und dein nächster Termin stehen in deinem persönlichen Zugang. Wir sehen uns in der Plobergerstraße."`;
}

function playModal(clientId, videoId) {
  const c = client(clientId), v = (c.videos || []).find(x => x.id === videoId);
  if (!v) return;
  const isFile = /\.(mp4|webm|mov)(\?|$)/i.test(v.url || '');
  const player = v.url
    ? (isFile
        ? `<video controls playsinline style="width:100%;border-radius:var(--r-md);background:#000" src="${v.url}"></video>`
        : `<a class="btn btn--primary" href="${v.url}" target="_blank" rel="noopener" style="width:100%;justify-content:center">Video öffnen</a>`)
    : `<div class="metricbox">
         <p class="metricbox__label">Video noch nicht aufgenommen — Skript</p>
         <div class="msg__text" style="margin-top:8px">${welcomeScript(c)}</div>
         <p class="card__sub" style="margin-top:10px">Aufnehmen, hochladen, Link über „Video hinterlegen“ eintragen — fertig.</p>
       </div>`;

  modal(`
    <div class="panel__head"><div><p class="panel__name">${v.title}</p>
      <p class="panel__meta">${VIDEO_KINDS[v.kind]} · ${fmtDate(v.date)}</p></div>
      <button class="closebtn" data-close>✕</button></div>
    ${player}
    ${v.note ? `<p class="card__sub" style="margin-top:12px">${v.note}</p>` : ''}
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:16px">
      ${v.watched ? '<span class="pill pill--good">gesehen</span>'
        : `<button class="btn btn--sm btn--good" data-act="watched" data-id="${c.id}" data-vid="${v.id}">Als gesehen markieren</button>`}
      ${PORTAL ? `
        <button class="btn btn--sm btn--ghost" data-act="react" data-id="${c.id}" data-vid="${v.id}" data-r="Alles klar 👍">Alles klar 👍</button>
        <button class="btn btn--sm btn--ghost" data-act="react" data-id="${c.id}" data-vid="${v.id}" data-r="Ich hab eine Frage">Ich hab eine Frage</button>`
        : `<button class="btn btn--sm btn--ghost" data-act="videoadd" data-id="${c.id}">Video-Link eintragen</button>`}
    </div>`);
}

function videoModal(id) {
  const c = client(id);
  modal(`
    <div class="panel__head"><div><p class="panel__name">Video hinterlegen</p>
      <p class="panel__meta">${c.name}</p></div><button class="closebtn" data-close>✕</button></div>
    <div class="field"><label>Art</label>
      <select id="vdKind">${Object.entries(VIDEO_KINDS).map(([k, v]) => `<option value="${k}">${v}</option>`).join('')}</select></div>
    <div class="field"><label>Titel</label><input id="vdTitle" value="Willkommen bei FITARY" /></div>
    <div class="field"><label>Video-URL (mp4, Drive, YouTube unlisted …)</label><input id="vdUrl" placeholder="https://…" /></div>
    <div class="field"><label>Notiz</label><textarea id="vdNote" rows="2" placeholder="Worum geht es im Video?"></textarea></div>
    <button class="btn btn--primary" data-act="videoSave" data-id="${c.id}" style="width:100%;justify-content:center">Speichern & Kund:in benachrichtigen</button>`);
}

function perfModal(id) {
  const c = client(id), l = lastPerf(c);
  modal(`
    <div class="panel__head"><div><p class="panel__name">Leistungstest</p>
      <p class="panel__meta">${c.name} · ${l ? 'Re-Test — Vorwerte in Klammern' : 'Ausgangswerte (Baseline)'}</p></div>
      <button class="closebtn" data-close>✕</button></div>
    ${PERF.map(i => `<div class="field">
      <label>${i.label} (${i.unit}) ${l ? `<span style="color:var(--ink-3);text-transform:none;letter-spacing:0">(zuletzt ${l.items[i.id]})</span>` : ''}</label>
      <input type="number" step="0.1" id="pf_${i.id}" value="${l ? l.items[i.id] : ''}" />
      <p class="card__sub" style="font-size:11px;margin-top:4px">${i.info}</p>
    </div>`).join('')}
    <div class="field"><label>Notiz</label><textarea id="pfNote" rows="2" placeholder="Beobachtungen, Technik, Konsequenz für den Plan…"></textarea></div>
    <button class="btn btn--primary" data-act="perfSave" data-id="${c.id}" style="width:100%;justify-content:center">Werte speichern & Ergebnis-Nachricht erstellen</button>`);
}

function testModal(id) {
  const c = client(id), l = lastTest(c);
  modal(`
    <div class="panel__head"><div><p class="panel__name">Beweglichkeitstest</p>
      <p class="panel__meta">${c.name} · ${l ? 'Re-Test — Vorwerte in Klammern' : 'Eingangsbefund (Baseline)'}</p></div>
      <button class="closebtn" data-close>✕</button></div>
    <p class="card__sub" style="margin-bottom:14px">Bewertung 1–5 · 5 = frei beweglich, 1 = deutlich limitiert.</p>
    ${MOBI.map(i => `<div class="field">
      <label>${i.label} ${l ? `<span style="color:var(--ink-3);text-transform:none;letter-spacing:0">(zuletzt ${l.items[i.id]})</span>` : ''}</label>
      <input type="number" min="1" max="5" step="0.5" id="mb_${i.id}" value="${l ? l.items[i.id] : 3}" />
      <p class="card__sub" style="font-size:11px;margin-top:4px">${i.hint}</p>
    </div>`).join('')}
    <div class="field"><label>Notiz</label><textarea id="mbNote" rows="2" placeholder="Auffälligkeiten, Schmerzangaben, Trainingskonsequenz…"></textarea></div>
    <button class="btn btn--primary" data-act="testSave" data-id="${c.id}" style="width:100%;justify-content:center">Test speichern & Ergebnis-Nachricht erstellen</button>`);
}

function convertModal(id) {
  const c = client(id);
  modal(`
    <div class="panel__head"><div><p class="panel__name">Erstkontakt umwandeln</p>
      <p class="panel__meta">${c.name} · aus „${c.source || 'unbekannt'}"</p></div>
      <button class="closebtn" data-close>✕</button></div>
    <div class="field"><label>Programm</label>
      <select id="cvPlan">
        <option>10er-Block</option><option>20er-Block</option>
        <option>Abo 1x/Woche</option><option>Abo 2x/Woche</option>
        <option>Reha-Paket</option><option>Corporate Jahresprogramm</option>
      </select></div>
    <div class="field-row">
      <div class="field"><label>Einheiten</label><input type="number" id="cvCredits" value="10" min="1" /></div>
      <div class="field"><label>Trainingsart</label>
        <select id="cvType">${Object.entries(TYPES).filter(([k]) => k !== 'bwg').map(([k, v]) => `<option value="${k}">${v.label}</option>`).join('')}</select></div>
    </div>
    <div class="field-row">
      <div class="field"><label>Fixer Wochentag</label>
        <select id="cvDow">${[1,2,3,4,5,6].map(d => `<option value="${d}" ${d === c.dow ? 'selected' : ''}>${DOW[d % 7]}</option>`).join('')}</select></div>
      <div class="field"><label>Uhrzeit</label><input type="time" id="cvTime" value="${c.time}" /></div>
    </div>
    <button class="btn btn--primary" data-act="convertSave" data-id="${c.id}" style="width:100%;justify-content:center">Umwandeln & ersten Termin fixieren</button>
    <p class="card__sub" style="margin-top:10px">Legt den fixen Termin an, startet die Journey bei „Onboarding" und erstellt die Buchungsbestätigung.</p>`);
}

function accessModal(id) {
  const c = client(id);
  if (!c.access) {
    modal(`
      <div class="panel__head"><div><p class="panel__name">Zugang gesperrt</p>
        <p class="panel__meta">${c.name} · Erstkontakt</p></div>
        <button class="closebtn" data-close>✕</button></div>
      <div class="action action--warn"><div class="action__body">
        <p class="action__title">Der FITARY-Zugang gehört zum Programm</p>
        <p class="action__why">Der Gratis-Termin bringt den Befund. Der persönliche Bereich — Messwerte, Verlauf,
        Termine, Videobotschaften — wird erst mit dem Trainingsstart freigeschaltet. Genau das macht ihn zum Argument,
        nicht zur Selbstverständlichkeit.</p>
        <div class="action__acts">
          <button class="btn btn--sm btn--primary" data-act="convert" data-id="${c.id}">In Kund:in umwandeln & freischalten</button>
        </div></div></div>`);
    return;
  }
  const link = accessLink(c), valid = accessValid(c);
  modal(`
    <div class="panel__head"><div><p class="panel__name">Persönlicher Zugang</p>
      <p class="panel__meta">${c.name} sieht ausschließlich die eigenen Daten</p></div>
      <button class="closebtn" data-close>✕</button></div>
    <div class="metricbox" style="margin-bottom:14px">
      <p class="metricbox__label">Magic Link · ${c.code}</p>
      <p class="metricbox__val" style="font-size:16px">${valid ? 'gültig bis ' + fmtDate(accessExpiry(c)) : 'abgelaufen / widerrufen'}</p>
      <p class="card__sub" style="word-break:break-all">${link}</p>
    </div>
    <div style="display:grid;gap:8px">
      <button class="btn btn--primary" data-act="openportal" data-id="${c.id}" style="justify-content:center">Zugang öffnen (Kundenansicht)</button>
      <button class="btn btn--ghost" data-act="copylink" data-link="${link}" style="justify-content:center">Link kopieren</button>
      <button class="btn btn--ghost" data-act="draft" data-id="${c.id}" data-tpl="access" style="justify-content:center">Einladung per WhatsApp erstellen</button>
      <div style="display:flex;gap:8px">
        <button class="btn btn--sm btn--ghost" data-act="rotate" data-id="${c.id}" style="flex:1;justify-content:center">Neuen Link erzeugen</button>
        <button class="btn btn--sm btn--danger" data-act="revoke" data-id="${c.id}" style="flex:1;justify-content:center">Zugang widerrufen</button>
      </div>
    </div>
    <p class="card__sub" style="margin-top:12px">Zeitlich begrenzter Link statt Passwort: 30 Tage gültig, jederzeit neu ausstellbar oder widerrufbar. In Produktion wird der Token serverseitig signiert und per WhatsApp versendet.</p>`);
}

function metricBox(label, val, delta, positive, series, color) {
  return `<div class="metricbox">
    <p class="metricbox__label">${label}</p>
    <p class="metricbox__val">${val}<span class="${positive ? 'delta-good' : 'delta-crit'}">${delta}</span></p>
    ${sparkline(series, { color, w: 130, h: 38 })}
  </div>`;
}

/* ---------------- Buchungen ---------------- */
function viewCalendar() {
  const ws = addDays(startOfWeek(today()), weekOffset * 7);
  const days = [...Array(7)].map((_, i) => addDays(ws, i));
  const t = iso(today());
  const inWeek = db.bookings.filter(b => b.date >= iso(days[0]) && b.date <= iso(days[6]));
  const done = inWeek.filter(b => b.status !== 'cancelled').length;

  return `
  <div class="calnav">
    <button class="btn btn--ghost btn--sm" data-act="week" data-d="-1">← Woche</button>
    <span style="font-family:var(--font-d);font-weight:700">${fmtShort(iso(days[0]))} – ${fmtShort(iso(days[6]))}</span>
    <button class="btn btn--ghost btn--sm" data-act="week" data-d="1">Woche →</button>
    <span class="pill pill--flame">${done} Einheiten · ${Math.round(done / WEEK_CAPACITY * 100)} % Auslastung</span>
    <button class="btn btn--primary btn--sm" data-act="booknew" style="margin-left:auto">+ Buchung</button>
  </div>

  <div class="calgrid">
    ${days.map(d => {
      const key = iso(d);
      const list = db.bookings.filter(b => b.date === key).sort((a, b) => a.time.localeCompare(b.time));
      return `<div class="calday ${key === t ? 'is-today' : ''}">
        <div class="calday__head">
          <span class="calday__dow">${DOW[d.getDay()]}</span>
          <span class="calday__num">${d.getDate()}.</span>
        </div>
        ${list.map(b => {
          const c = client(b.clientId);
          return `<div class="slot slot--${b.status}" data-act="booking" data-id="${b.id}">
            <p class="slot__time">${b.time}</p>
            <p class="slot__who">${c ? c.name : '—'}</p>
            <p class="slot__who" style="color:var(--ink-3)">${TYPES[b.type].short}</p>
          </div>`;
        }).join('') || '<p class="card__sub">frei</p>'}
      </div>`;
    }).join('')}
  </div>`;
}

/* ---------------- Kommunikation ---------------- */
function viewMessages() {
  const list = db.messages.filter(m => msgFilter === 'alle' ? true : m.status === msgFilter);
  const q = queue();
  return `
  <div class="searchbar">
    ${['alle','entwurf','gesendet'].map(f =>
      `<button class="btn btn--sm ${msgFilter === f ? 'btn--primary' : 'btn--ghost'}" data-act="msgfilter" data-f="${f}">${f[0].toUpperCase() + f.slice(1)}</button>`).join('')}
    <button class="btn btn--sm btn--ghost" data-act="genall" style="margin-left:auto">⚡ Alle offenen Nachrichten erzeugen (${q.length})</button>
  </div>

  ${list.length ? list.map(m => {
    const c = client(m.clientId);
    const wa = c && c.phone ? `https://wa.me/${c.phone}?text=${encodeURIComponent(m.text)}` : null;
    const mail = c ? `mailto:${c.email}?subject=${encodeURIComponent('FITARY · ' + TPL[m.type].label)}&body=${encodeURIComponent(m.text)}` : null;
    return `<div class="msg">
      <div class="msg__head">
        <span class="avatar">${c ? initials(c.name) : '?'}</span>
        <div style="flex:1;min-width:0">
          <p class="row__name">${c ? c.name : '—'}</p>
          <p class="row__meta">${TPL[m.type].label} · ${m.channel} · ${fmtDate(m.date)}</p>
        </div>
        <span class="pill ${m.status === 'gesendet' ? 'pill--good' : 'pill--warn'}">${m.status}</span>
      </div>
      <div class="msg__text">${m.text}</div>
      <div class="msg__acts">
        ${m.status === 'entwurf' ? `<button class="btn btn--sm btn--good" data-act="send" data-id="${m.id}">Als gesendet markieren</button>` : ''}
        <button class="btn btn--sm btn--ghost" data-act="copy" data-id="${m.id}">Text kopieren</button>
        ${wa ? `<a class="btn btn--sm btn--ghost" href="${wa}" target="_blank" rel="noopener">WhatsApp öffnen</a>` : ''}
        ${mail ? `<a class="btn btn--sm btn--ghost" href="${mail}">E-Mail</a>` : ''}
        <button class="btn btn--sm btn--ghost" data-act="client" data-id="${m.clientId}">Kundenakte</button>
      </div>
    </div>`;
  }).join('') : '<p class="empty">Noch keine Nachrichten. Erzeuge sie aus dem Cockpit oder über die Automationen.</p>'}`;
}

/* ---------------- Automationen ---------------- */
function viewAutomations() {
  const q = queue();
  return `
  <p class="card__sub" style="margin-bottom:18px">Jede Regel beobachtet die Kundenreise und schlägt die passende Nachricht vor — in FITARY-Tonalität, nie automatisch verschickt. Du gibst frei, das System denkt mit.</p>
  ${RULES.map(r => {
    const on = db.settings.autos[r.id];
    const hits = q.filter(a => a.ruleId === r.id);
    return `<div class="card" style="margin-bottom:10px">
      <div class="card__head" style="margin-bottom:10px">
        <div><p class="card__title">${TPL[r.tpl].label}</p><p class="card__sub">${r.desc}</p></div>
        <div style="display:flex;align-items:center;gap:10px">
          <span class="pill ${hits.length ? 'pill--flame' : ''}">${hits.length} Treffer</span>
          <button class="switch ${on ? 'on' : ''}" data-act="toggle" data-id="${r.id}" aria-label="Regel ${on ? 'deaktivieren' : 'aktivieren'}"></button>
        </div>
      </div>
      <div class="msg__text" style="font-size:12.5px">${TPL[r.tpl].build(db.clients[0], ctxFor(db.clients[0], r.tpl)).slice(0, 220)}…</div>
      ${hits.length ? `<div class="msg__acts">
        ${hits.slice(0, 6).map(h => `<button class="btn btn--sm btn--ghost" data-act="draft" data-id="${h.clientId}" data-tpl="${h.tpl}">${client(h.clientId).name}</button>`).join('')}
      </div>` : ''}
    </div>`;
  }).join('')}`;
}

/* =========================================================
   MODALS & AKTIONEN
   ========================================================= */
function modal(html) { $('#modalBox').innerHTML = html; $('#modal').setAttribute('aria-hidden', 'false'); }
function closeAll() { $('#modal').setAttribute('aria-hidden', 'true'); $('#drawer').setAttribute('aria-hidden', 'true'); }
function toast(text) {
  const el = document.createElement('div');
  el.className = 'toast'; el.textContent = text;
  $('#toasts').appendChild(el);
  setTimeout(() => el.remove(), 2600);
}

function bookModal(clientId) {
  const d = iso(addDays(today(), 1));
  modal(`
    <div class="panel__head"><p class="panel__name">Einheit buchen</p><button class="closebtn" data-close>✕</button></div>
    <div class="field" ${PORTAL ? 'style="display:none"' : ''}><label>Kund:in</label>
      <select id="bkClient">${(PORTAL ? [PORTAL] : db.clients).map(c => `<option value="${c.id}" ${c.id === clientId ? 'selected' : ''}>${c.name}</option>`).join('')}</select></div>
    <div class="field-row">
      <div class="field"><label>Datum</label><input type="date" id="bkDate" value="${d}" /></div>
      <div class="field"><label>Uhrzeit</label><input type="time" id="bkTime" value="18:00" /></div>
    </div>
    <div class="field"><label>Trainingsart</label>
      <select id="bkType">${Object.entries(TYPES).map(([k, v]) => `<option value="${k}">${v.label}</option>`).join('')}</select></div>
    <div class="field"><label>Trainer</label><input id="bkCoach" value="Yalcin" /></div>
    <button class="btn btn--primary" data-act="bookSave" style="width:100%;justify-content:center">Buchen & Bestätigung erstellen</button>
    <p class="card__sub" style="margin-top:10px">Die Bestätigung landet als Entwurf in der Kommunikation — der Termin in Offisy bleibt führend.</p>`);
}

function cancelModal(bookingId) {
  const b = db.bookings.find(x => x.id === bookingId), c = client(b.clientId);
  modal(`
    <div class="panel__head"><div><p class="panel__name">Einheit stornieren</p>
      <p class="panel__meta">${c.name} · ${fmtDate(b.date)} · ${b.time}</p></div>
      <button class="closebtn" data-close>✕</button></div>
    <div class="field"><label>Grund</label>
      <select id="cxReason">
        <option value="krank">Kunde krank</option>
        <option value="kurzfristig">Kurzfristig (&lt; 24 h)</option>
        <option value="umbuchung">Umbuchung gewünscht</option>
        <option value="studio">Studio / Trainer verhindert</option>
      </select></div>
    <div class="field" ${PORTAL ? 'style="display:none"' : ''}><label>Einheit dem Kontingent gutschreiben?</label>
      <select id="cxCredit"><option value="yes">Ja — Einheit bleibt erhalten</option><option value="no">Nein — Einheit verfällt (&lt; 24 h)</option></select></div>
    <button class="btn btn--danger" data-act="cancelSave" data-id="${b.id}" style="width:100%;justify-content:center">Stornieren & Kund:in informieren</button>
    <p class="card__sub" style="margin-top:10px">Wird automatisch erzeugt: Storno-Nachricht + Warteliste-Angebot für den frei gewordenen Slot.</p>`);
}

function bookingModal(id) {
  const b = db.bookings.find(x => x.id === id), c = client(b.clientId);
  modal(`
    <div class="panel__head"><div><p class="panel__name">${c.name}</p>
      <p class="panel__meta">${fmtDate(b.date)} · ${b.time} · ${TYPES[b.type].label}</p></div>
      <button class="closebtn" data-close>✕</button></div>
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:18px">
      <span class="pill">${b.coach}</span><span class="pill">Status: ${b.status}</span>
      ${b.reason ? `<span class="pill pill--crit">${b.reason}</span>` : ''}
    </div>
    <div style="display:grid;gap:8px">
      <button class="btn btn--good" data-act="status" data-id="${b.id}" data-s="completed" style="justify-content:center">Als absolviert markieren</button>
      <button class="btn btn--ghost" data-act="status" data-id="${b.id}" data-s="noshow" style="justify-content:center">No-Show (Follow-up erzeugen)</button>
      <button class="btn btn--ghost" data-act="draft" data-id="${c.id}" data-tpl="reminder" style="justify-content:center">24h-Erinnerung erstellen</button>
      <button class="btn btn--danger" data-act="cancelask" data-id="${b.id}" style="justify-content:center">Stornieren</button>
    </div>`);
}

function portalModal(id) {
  const c = client(id), m = metrics(c), st = stageOf(c);
  const feed = db.events.filter(e => e.clientId === id).slice(0, 5);
  const pct = Math.round((m.totalDone % 10) / 10 * 100);
  modal(`
    <div class="panel__head"><div><p class="panel__name">Kundenansicht</p>
      <p class="panel__meta">Das sieht ${c.name.split(' ')[0]} in der FITARY-App</p></div>
      <button class="closebtn" data-close>✕</button></div>
    <div class="phone">
      <div class="phone__top"><p class="phone__brand">FITARY</p>
        <p class="card__sub">Servus, ${c.name.split(' ')[0]}</p></div>

      <div class="phone__card">
        <p class="phone__label">Deine nächste Einheit</p>
        ${m.next ? `<p class="phone__big">${fmtDate(m.next.date)} · ${m.next.time}</p>
          <p class="card__sub">${TYPES[m.next.type].label} · ${m.next.coach} · Plobergerstraße 7</p>
          <div style="display:flex;gap:7px;margin-top:11px">
            <button class="btn btn--sm btn--ghost" data-act="cancelask" data-id="${m.next.id}">Absagen</button>
            <button class="btn btn--sm btn--ghost" data-act="bookfor" data-id="${c.id}">Zusatztermin</button>
          </div>`
        : `<p class="phone__big" style="color:var(--warn)">Kein Termin gebucht</p>
           <button class="btn btn--sm btn--primary" data-act="bookfor" data-id="${c.id}" style="margin-top:10px">Jetzt buchen</button>`}
      </div>

      <div class="phone__card">
        <p class="phone__label">Deine Journey</p>
        <p class="phone__big">${st.label}</p>
        <p class="card__sub">${st.desc}</p>
        <div style="display:flex;align-items:center;gap:10px;margin-top:12px">
          <span style="flex:1;height:8px;border-radius:99px;background:var(--surface-3);overflow:hidden">
            <span style="display:block;height:100%;width:${pct}%;background:var(--flame)"></span></span>
          <span class="card__sub">${m.totalDone} Einheiten</span>
        </div>
      </div>

      <div class="phone__card">
        <p class="phone__label">Beweglichkeit</p>
        ${baseTest(c) ? `<p class="phone__big">${mobiScore(baseTest(c))} → ${mobiScore(lastTest(c))}<span style="font-size:12px;color:var(--ink-3)"> / 100</span></p>
          <p class="card__sub">${lastTest(c).phase} · ${fmtDate(lastTest(c).date)}</p>`
          : '<p class="phone__big" style="color:var(--warn)">Test noch offen</p>'}
      </div>

      <div class="phone__card">
        <p class="phone__label">Dein Fortschritt</p>
        <div style="display:flex;gap:14px;margin-top:8px">
          <div><p class="card__sub">Schmerz</p><p class="phone__big">${m.first.pain} → ${m.now.pain}</p></div>
          <div><p class="card__sub">Kraftindex</p><p class="phone__big">${m.first.kraft} → ${m.now.kraft}</p></div>
        </div>
      </div>

      <div class="phone__card">
        <p class="phone__label">Updates</p>
        ${feed.length ? feed.map(e => `<div class="feeditem"><span class="feeditem__time">${new Date(e.at).toLocaleDateString('de-AT')}</span><span>${e.text}</span></div>`).join('')
        : `<div class="feeditem"><span>Kontingent: ${c.credits} Einheiten offen · ${c.plan}</span></div>`}
      </div>
    </div>`);
}

function feedModal() {
  db.events.forEach(e => e.seen = true); save();
  const list = PORTAL ? db.events.filter(e => e.clientId === PORTAL.id) : db.events;
  modal(`
    <div class="panel__head"><p class="panel__name">Updates</p><button class="closebtn" data-close>✕</button></div>
    ${list.length ? list.slice(0, 25).map(e => `
      <div class="feeditem"><span class="feeditem__time">${new Date(e.at).toLocaleString('de-AT', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</span><span>${e.text}</span></div>`).join('')
      : '<p class="empty">Noch keine Ereignisse.</p>'}`);
}

/* ---------------- Kundenportal (individueller Zugang) ---------------- */
function renderPortal(id) {
  const c = client(id), m = metrics(c), st = stageOf(c);
  const b = baseTest(c), l = lastTest(c);
  const stageIdx = STAGES.findIndex(x => x.id === st.id);
  const feed = db.events.filter(e => e.clientId === id).slice(0, 6);
  const ci = c.checkins;

  document.body.classList.add('is-portal');
  $('#topEyebrow').textContent = 'Dein FITARY-Zugang · ' + c.code;
  $('#topTitle').textContent = 'Servus, ' + c.name.split(' ')[0];
  $('#quickBook').textContent = '+ Termin anfragen';
  $('#view').innerHTML = `
    ${PORTAL_DEMO ? `<div class="row" style="margin-bottom:16px;border-color:rgba(255,138,80,.38)">
      <span class="avatar">👁</span>
      <div class="row__main"><p class="row__name">Kundenansicht von ${c.name}</p>
        <p class="row__meta">So sieht ${c.name.split(' ')[0]} den eigenen Zugang — nur eigene Daten, nichts vom Studio.</p></div>
      <div class="row__side"><button class="btn btn--sm btn--ghost" data-act="leaveportal">Zurück ins Cockpit</button></div>
    </div>` : ''}
    <div class="grid grid--2">
      <div>
        ${(c.videos || []).length ? `<div class="card" style="margin-bottom:16px;border-color:${unwatched(c).length ? 'rgba(255,138,80,.42)' : 'var(--line)'}">
          <div class="card__head"><div><p class="card__title">Videobotschaft von Yalcin</p>
            <p class="card__sub">${unwatched(c).length ? 'Neu für dich — 60 Sekunden' : 'Alle Videos gesehen'}</p></div>
            ${unwatched(c).length ? '<span class="pill pill--flame">neu</span>' : '<span class="pill pill--good">✓</span>'}</div>
          ${c.videos.map(v => `<div class="row">
            <span class="avatar ${v.watched ? 'avatar--good' : 'avatar--risk'}">▶</span>
            <div class="row__main"><p class="row__name">${v.title}</p>
              <p class="row__meta">${VIDEO_KINDS[v.kind]} · ${fmtDate(v.date)}</p></div>
            <div class="row__side"><button class="btn btn--sm ${v.watched ? 'btn--ghost' : 'btn--primary'}" data-act="play" data-id="${c.id}" data-vid="${v.id}">${v.watched ? 'Nochmal' : 'Ansehen'}</button></div>
          </div>`).join('')}
        </div>` : ''}

        <div class="card">
          <div class="card__head"><div><p class="card__title">Deine nächste Einheit</p>
            <p class="card__sub">Plobergerstraße 7, 4600 Wels</p></div></div>
          ${m.next ? `<div class="row">
              <span class="avatar">${m.next.time.slice(0,5)}</span>
              <div class="row__main"><p class="row__name">${fmtDate(m.next.date)} · ${relDay(m.next.date)}</p>
                <p class="row__meta">${TYPES[m.next.type].label} · ${m.next.coach}</p></div>
              <div class="row__side">
                <button class="btn btn--sm btn--ghost" data-act="cancelask" data-id="${m.next.id}">Absagen</button>
              </div></div>
            <p class="card__sub" style="margin-top:10px">Absage bis 24 h vorher: deine Einheit bleibt erhalten.</p>`
            : `<p class="empty">Aktuell kein Termin gebucht — sag uns, wann es dir passt.</p>
               <button class="btn btn--primary" data-act="bookfor" data-id="${c.id}" style="width:100%;justify-content:center">Termin anfragen</button>`}
        </div>

        <div class="card" style="margin-top:16px">
          <div class="card__head"><div><p class="card__title">Dein Beweglichkeitstest</p>
            <p class="card__sub">${b ? `${b.phase} ${fmtDate(b.date)} → ${l.phase} ${fmtDate(l.date)}` : 'Eingangsbefund steht noch aus'}</p></div>
            ${b ? `<span class="pill pill--good">Score ${mobiScore(b)} → ${mobiScore(l)}</span>` : '<span class="pill pill--warn">offen</span>'}
          </div>
          ${b ? MOBI.map(i => {
            const v0 = b.items[i.id], v1 = l.items[i.id], d = +(v1 - v0).toFixed(1);
            const tone = v1 >= 4 ? 'var(--good)' : v1 >= 2.8 ? 'var(--warn)' : 'var(--crit)';
            return `<div style="display:flex;align-items:center;gap:12px;padding:8px 0;border-bottom:1px solid var(--line)">
              <span style="width:140px;font-size:13px;font-weight:600">${i.label}</span>
              <span style="flex:1;height:8px;border-radius:99px;background:var(--surface-3);position:relative;overflow:hidden" title="Start ${v0} · heute ${v1}">
                <span style="position:absolute;inset:0 auto 0 0;width:${v1 / 5 * 100}%;background:${tone};border-radius:99px"></span>
                <span style="position:absolute;top:-2px;bottom:-2px;left:${v0 / 5 * 100}%;width:2px;background:var(--ink)"></span></span>
              <span style="width:80px;text-align:right;font-size:12.5px;color:var(--ink-2)">${v0} → <strong style="color:${tone}">${v1}</strong></span>
              <span style="width:36px;text-align:right;font-size:12px" class="${d >= 0 ? 'delta-good' : 'delta-crit'}">${d >= 0 ? '+' : ''}${d}</span>
            </div>`; }).join('')
          : '<p class="empty">Dein Test wird beim ersten Termin gemacht — 20 Minuten, 7 Messpunkte. Danach steht dein Plan.</p>'}
        </div>
      </div>

      <div>
        ${basePerf(c) ? `<div class="card" style="margin-bottom:16px">
          <div class="card__head"><div><p class="card__title">Deine Leistungswerte</p>
            <p class="card__sub">${lastPerf(c).phase} · ${fmtDate(lastPerf(c).date)}</p></div>
            <span class="pill ${perfIndex(c, lastPerf(c)) >= 100 ? 'pill--good' : 'pill--warn'}">Index ${perfIndex(c, lastPerf(c))}</span></div>
          ${PERF.map(i => {
            const v0 = basePerf(c).items[i.id], v1 = lastPerf(c).items[i.id];
            const rel = ((v1 - v0) / v0) * 100 * i.dir;
            return `<div class="row row--click" data-act="perfinfo" data-i="${i.id}" style="padding:10px 12px">
              <div class="row__main"><p class="row__name" style="font-size:13.5px">${i.label}</p>
                <p class="row__meta">${v0} → ${v1} ${i.unit}</p></div>
              <div class="row__side"><span class="pill ${rel >= 0 ? 'pill--good' : 'pill--crit'}">${Math.abs(rel).toFixed(0)} % ${rel >= 0 ? 'besser' : 'schwächer'}</span></div>
            </div>`; }).join('')}
          <p class="card__sub" style="margin-top:10px">Tippe einen Wert an, um zu sehen, was er bedeutet.</p>
        </div>` : ''}

        <div class="card">
          <div class="card__head"><div><p class="card__title">Deine Journey</p>
            <p class="card__sub">${st.desc}</p></div><span class="pill pill--flame stage-pill">${st.label}</span></div>
          <div class="rail">
            ${STAGES.map((x, i) => `<div class="rail__step ${i < stageIdx ? 'done' : i === stageIdx ? 'now' : ''}">
              <span class="rail__dot"></span><p class="rail__label">${x.label}</p></div>`).join('')}
          </div>
          ${ci.length > 1 ? `<div class="grid" style="grid-template-columns:repeat(3,1fr);margin-top:18px">
            ${metricBox('Schmerz', m.now.pain, (m.now.pain - m.first.pain).toFixed(1), m.now.pain <= m.first.pain, ci.map(x => x.pain), 'var(--good)')}
            ${metricBox('Kraftindex', m.now.kraft, '+' + (m.now.kraft - m.first.kraft), true, ci.map(x => x.kraft), 'var(--flame)')}
            ${metricBox('Einheiten', m.totalDone, '', true, [0, m.totalDone], 'var(--ink-2)')}
          </div>` : ''}
        </div>

        <div class="card" style="margin-top:16px">
          <div class="card__head"><div><p class="card__title">Dein Kontingent</p>
            <p class="card__sub">${c.plan}</p></div>
            <span class="pill ${c.credits <= 2 ? 'pill--warn' : 'pill--good'}">${c.credits} Einheiten offen</span></div>
          ${c.credits <= 2 ? '<p class="card__sub">Fast aufgebraucht — melde dich, damit dein fixer Termin erhalten bleibt.</p>' : ''}
        </div>

        <div class="card" style="margin-top:16px">
          <div class="card__head"><div><p class="card__title">Updates</p>
            <p class="card__sub">Buchungen, Storni, Testergebnisse</p></div></div>
          ${feed.length ? feed.map(e => `<div class="feeditem">
              <span class="feeditem__time">${new Date(e.at).toLocaleDateString('de-AT')}</span><span>${e.text}</span></div>`).join('')
            : '<p class="empty">Noch keine Updates.</p>'}
        </div>

        <div class="card" style="margin-top:16px">
          <div class="card__head"><div><p class="card__title">Direkter Draht</p>
            <p class="card__sub">1:1 mit deinem Trainer — kein Sammel-Chat</p></div></div>
          <div style="display:flex;gap:8px;flex-wrap:wrap">
            <a class="btn btn--sm btn--primary" href="https://wa.me/436703565006" target="_blank" rel="noopener">WhatsApp an FITARY</a>
            <a class="btn btn--sm btn--ghost" href="mailto:office@fitary.at">office@fitary.at</a>
          </div>
        </div>
      </div>
    </div>`;
}

/* ---------------- Event-Delegation ---------------- */
document.addEventListener('click', e => {
  const close = e.target.closest('[data-close]');
  if (close) { closeAll(); return; }

  const nav = e.target.closest('.navitem');
  if (nav) { VIEW = nav.dataset.view; render(); return; }

  const el = e.target.closest('[data-act]');
  if (!el) return;
  const { act, id, tpl, s, d, f } = el.dataset;

  switch (act) {
    case 'client':   closeAll(); openClient(id); break;
    case 'booking':  bookingModal(id); break;
    case 'week':     weekOffset += +d; render(); break;
    case 'booknew':  bookModal(); break;
    case 'bookfor':  closeAll(); bookModal(id); break;
    case 'cancelask':closeAll(); cancelModal(id); break;
    case 'portal':   portalModal(id); break;
    case 'msgfilter':msgFilter = f; render(); break;
    case 'toggle':   db.settings.autos[id] = !db.settings.autos[id]; save(); render(); break;

    case 'draft': {
      const c = client(id); const m = metrics(c);
      draft(id, tpl, tpl === 'reminder' || tpl === 'confirm' ? m.next : null);
      logEvent('message', `Nachricht "${TPL[tpl].label}" für ${c.name} erstellt`, id);
      save(); toast('Entwurf erstellt · Kommunikation'); closeAll(); render();
      break;
    }

    case 'access':     closeAll(); accessModal(id); break;
    case 'openportal': openPortal(id); break;
    case 'leaveportal':leavePortal(); break;
    case 'convert':  closeAll(); convertModal(id); break;
    case 'perfnew':  closeAll(); perfModal(id); break;
    case 'videoadd': closeAll(); videoModal(id); break;
    case 'play':     playModal(id, el.dataset.vid); break;

    case 'perfinfo': {
      const i = PERF.find(x => x.id === el.dataset.i);
      modal(`<div class="panel__head"><p class="panel__name">${i.label}</p><button class="closebtn" data-close>✕</button></div>
        <p class="card__sub" style="font-size:14px;color:var(--ink-2)">${i.info}</p>
        <p class="card__sub" style="margin-top:12px">Richtung: ${i.dir === 1 ? 'mehr ist besser' : 'weniger ist besser'} · Einheit: ${i.unit}</p>`);
      break;
    }

    case 'watched': {
      const c = client(id), v = c.videos.find(x => x.id === el.dataset.vid);
      v.watched = true; v.watchedAt = iso(today());
      logEvent('video', `${c.name}: „${v.title}" angesehen`, c.id);
      save(); toast('Als gesehen markiert'); closeAll(); render();
      break;
    }

    case 'react': {
      const c = client(id), v = c.videos.find(x => x.id === el.dataset.vid);
      v.watched = true; v.watchedAt = iso(today());
      logEvent('video', `${c.name} zum Video „${v.title}": „${el.dataset.r}"`, c.id);
      save(); toast('Deine Rückmeldung ist bei Yalcin'); closeAll(); render();
      break;
    }

    case 'videoSave': {
      const c = client(id);
      c.videos.push({ id: uid('v'), kind: $('#vdKind').value, title: $('#vdTitle').value || 'Videobotschaft',
        url: $('#vdUrl').value.trim(), date: iso(today()), note: $('#vdNote').value || '', watched: false, watchedAt: null });
      draft(c.id, 'welcomeVideo');
      logEvent('video', `${c.name}: neues Video hinterlegt`, c.id);
      save(); toast('Video hinterlegt · Ankündigung erstellt'); closeAll(); render();
      break;
    }

    case 'perfSave': {
      const c = client(id), items = {};
      PERF.forEach(i => { const v = parseFloat($('#pf_' + i.id).value);
        items[i.id] = isNaN(v) ? (lastPerf(c) ? lastPerf(c).items[i.id] : 0) : v; });
      const entry = { date: iso(today()), phase: c.performance.length ? 'Re-Test ' + c.performance.length : 'Baseline',
                      items, note: $('#pfNote').value || '' };
      c.performance.push(entry);
      draft(c.id, 'perfResult');
      logEvent('test', `${c.name}: Leistungstest ${entry.phase} — Index ${perfIndex(c, entry)}`, c.id);
      save(); toast(`${entry.phase} gespeichert · Index ${perfIndex(c, entry)}`); closeAll(); render();
      break;
    }

    case 'rotate': {
      const c = client(id); rotateAccess(c);
      logEvent('access', `${c.name}: neuer Zugangslink erstellt (30 Tage gültig)`, c.id);
      save(); toast('Neuer Magic Link erzeugt'); accessModal(c.id);
      break;
    }

    case 'revoke': {
      const c = client(id); c.access.days = 0;
      logEvent('access', `${c.name}: Zugang widerrufen`, c.id);
      save(); toast('Zugang widerrufen'); accessModal(c.id);
      break;
    }

    case 'convertSave': {
      const c = client(id);
      c.lead = false; c.plan = $('#cvPlan').value; c.credits = parseInt($('#cvCredits').value) || 10;
      c.type = $('#cvType').value; c.dow = parseInt($('#cvDow').value); c.time = $('#cvTime').value;
      c.start = iso(today());
      const first = addDays(startOfWeek(addDays(today(), 7)), (c.dow + 6) % 7);
      const b = { id: uid('b'), clientId: c.id, date: iso(first), time: c.time, type: c.type,
        coach: 'Yalcin', status: 'confirmed', reason: null, reminded: false };
      db.bookings.push(b);

      /* Mit dem Start wird freigeschaltet, was der Gratis-Termin nicht enthält */
      rotateAccess(c);
      c.videos.push({ id: uid('v'), kind: 'welcome', title: 'Willkommen bei FITARY',
        url: '', date: iso(today()),
        note: 'Persönliche Begrüßung nach dem Start: Ablauf der ersten Wochen und was jetzt gemessen wird.',
        watched: false, watchedAt: null });

      draft(c.id, 'confirm', b);
      draft(c.id, 'access');
      logEvent('convert', `${c.name}: aus Erstkontakt zu Kund:in — ${c.plan}, Start ${fmtDate(b.date)}`, c.id);
      logEvent('access', `${c.name}: App-Zugang freigeschaltet (30 Tage gültig)`, c.id);
      save(); toast('Umgewandelt · Termin fixiert · Zugang freigeschaltet'); closeAll(); render();
      break;
    }
    case 'testnew':  closeAll(); testModal(id); break;
    case 'copylink': navigator.clipboard?.writeText(el.dataset.link); toast('Link kopiert'); break;

    case 'testSave': {
      const c = client(id); const items = {};
      MOBI.forEach(i => { items[i.id] = clamp(parseFloat($('#mb_' + i.id).value) || 3, 1, 5); });
      const entry = { date: iso(today()), phase: c.mobility.length ? 'Re-Test ' + c.mobility.length : 'Baseline',
                      items, note: $('#mbNote').value || '' };
      c.mobility.push(entry);
      draft(c.id, 'mobilityResult');
      logEvent('test', `${c.name}: ${entry.phase} erfasst — Score ${mobiScore(entry)}/100`, c.id);
      save(); toast(`${entry.phase} gespeichert · Score ${mobiScore(entry)}/100`); closeAll(); render();
      break;
    }

    case 'genall': {
      const q = queue(); let n = 0;
      q.forEach(a => { const m = metrics(client(a.clientId));
        draft(a.clientId, a.tpl, a.tpl === 'reminder' ? m.next : null); n++; });
      logEvent('message', `${n} Nachrichten-Entwürfe automatisch erzeugt`, null);
      save(); toast(`${n} Entwürfe erstellt`); render();
      break;
    }

    case 'send': {
      const m = db.messages.find(x => x.id === id);
      m.status = 'gesendet';
      if (m.type === 'reminder') {
        const b = bookingsOf(m.clientId).find(x => x.date >= iso(today()) && x.status === 'confirmed');
        if (b) b.reminded = true;
      }
      logEvent('sent', `${TPL[m.type].label} an ${client(m.clientId).name} gesendet`, m.clientId);
      save(); toast('Als gesendet markiert'); render();
      break;
    }

    case 'copy': {
      const m = db.messages.find(x => x.id === id);
      navigator.clipboard?.writeText(m.text);
      toast('Text kopiert');
      break;
    }

    case 'status': {
      const b = db.bookings.find(x => x.id === id), c = client(b.clientId);
      b.status = s;
      if (s === 'completed') { c.credits = Math.max(0, c.credits - 1);
        logEvent('session', `${c.name}: Einheit am ${fmtDate(b.date)} absolviert (${c.credits} offen)`, c.id); }
      if (s === 'noshow') { draft(c.id, 'noshow', b);
        logEvent('noshow', `${c.name}: No-Show am ${fmtDate(b.date)} — Follow-up erstellt`, c.id); }
      save(); toast(s === 'completed' ? 'Einheit absolviert' : 'No-Show erfasst · Follow-up erstellt');
      closeAll(); render();
      break;
    }

    case 'bookSave': {
      const cid = $('#bkClient').value;
      const b = { id: uid('b'), clientId: cid, date: $('#bkDate').value, time: $('#bkTime').value,
        type: $('#bkType').value, coach: $('#bkCoach').value || 'Yalcin', status: 'confirmed', reason: null, reminded: false };
      db.bookings.push(b);
      draft(cid, 'confirm', b);
      b.via = PORTAL ? 'kunde' : 'studio';
      logEvent('booking', PORTAL
        ? `Terminanfrage über Kundenzugang: ${fmtDate(b.date)} ${b.time} (${TYPES[b.type].short})`
        : `${client(cid).name}: neue Einheit ${fmtDate(b.date)} ${b.time}`, cid);
      save(); toast(PORTAL ? 'Anfrage gesendet — FITARY bestätigt dir den Termin' : 'Gebucht · Bestätigung als Entwurf erstellt');
      closeAll(); render();
      break;
    }

    case 'cancelSave': {
      const b = db.bookings.find(x => x.id === id), c = client(b.clientId);
      const reason = $('#cxReason').value, credit = $('#cxCredit').value === 'yes';
      b.status = 'cancelled'; b.reason = reason;
      if (credit) c.credits += 0; else c.credits = Math.max(0, c.credits - 1);
      draft(c.id, reason === 'studio' ? 'cancelStudio' : 'cancelClient', b);

      /* Frei gewordener Slot → Warteliste: aktiver Kunde ohne Folgetermin bekommt das Angebot */
      const cand = db.clients.map(x => ({ x, m: metrics(x) }))
        .filter(o => o.x.id !== c.id && o.m.inactive < 21 && o.x.credits > 0 &&
                     !db.bookings.some(z => z.clientId === o.x.id && z.date === b.date && z.status === 'confirmed'))
        .sort((a, z) => (a.m.next ? 1 : 0) - (z.m.next ? 1 : 0) || z.m.adherence - a.m.adherence)[0];
      if (cand) { draft(cand.x.id, 'waitlist', b);
        logEvent('waitlist', `Slot ${fmtDate(b.date)} ${b.time} an ${cand.x.name} angeboten`, cand.x.id); }

      logEvent('cancel', PORTAL
        ? `Absage über deinen Zugang: ${fmtDate(b.date)} ${b.time}${credit ? ' — Einheit bleibt erhalten' : ''}`
        : `${c.name}: Storno ${fmtDate(b.date)} (${reason})${credit ? ' — Einheit gutgeschrieben' : ''}`, c.id);
      save(); toast('Storniert · Kund:in wird informiert'); closeAll(); render();
      break;
    }
  }
});

document.addEventListener('input', e => {
  if (e.target.id === 'fq')     { filter.q = e.target.value; const v = e.target.value; render();
                                  const f = $('#fq'); if (f) { f.focus(); f.value = v; f.setSelectionRange(v.length, v.length); } }
});
document.addEventListener('change', e => {
  if (e.target.id === 'fstage') { filter.stage = e.target.value; render(); }
  if (e.target.id === 'frisk')  { filter.risk  = e.target.value; render(); }
});

$('#quickBook').addEventListener('click', () => bookModal(PORTAL ? PORTAL.id : undefined));
$('#feedBtn').addEventListener('click', feedModal);
$('#resetDemo').addEventListener('click', () => {
  if (!confirm('Alle lokalen Daten zurücksetzen und Demodaten neu laden?')) return;
  localStorage.removeItem(KEY); db = load(); toast('Demodaten neu geladen'); render();
});
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeAll(); });

render();
