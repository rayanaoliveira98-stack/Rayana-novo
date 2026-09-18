/* =========================================================
   FITARY Journey — Client Cockpit
   Tracking der Kundenreise + Buchungen + Kommunikation
   Vanilla JS, localStorage. Kein Build, kein Backend.
   ========================================================= */

const KEY = 'fitary.journey.v4';

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

/* Übungskatalog für die Trainingsdokumentation */
const EXERCISES = {
  squat: { label: 'Kniebeuge',       unit: 'kg' },
  bench: { label: 'Bankdrücken',     unit: 'kg' },
  row:   { label: 'Rudern',          unit: 'kg' },
  dead:  { label: 'Kreuzheben',      unit: 'kg' },
  ohp:   { label: 'Schulterdrücken', unit: 'kg' },
  lunge: { label: 'Ausfallschritt',  unit: 'kg' },
  pull:  { label: 'Klimmzüge',       unit: 'Wdh' },
  plank: { label: 'Plank',           unit: 'sek' }
};

/* Wöchentlicher Check-in — Skala 1–5 */
const CHECKIN = [
  { id: 'energie',      label: 'Energie',      good: 5 },
  { id: 'schlaf',       label: 'Schlaf',       good: 5 },
  { id: 'stress',       label: 'Stress',       good: 1 },
  { id: 'motivation',   label: 'Motivation',   good: 5 },
  { id: 'wohlbefinden', label: 'Wohlbefinden', good: 5 }
];

/* Körpermaße in cm, Gewicht in kg, Körperfett in % */
const BODY = [
  { id: 'kg',    label: 'Gewicht',     unit: 'kg', dir: -1 },
  { id: 'bf',    label: 'Körperfett',  unit: '%',  dir: -1 },
  { id: 'taille',label: 'Taille',      unit: 'cm', dir: -1 },
  { id: 'brust', label: 'Brust',       unit: 'cm', dir:  1 },
  { id: 'huefte',label: 'Hüfte',       unit: 'cm', dir: -1 },
  { id: 'arm',   label: 'Oberarm',     unit: 'cm', dir:  1 },
  { id: 'bein',  label: 'Oberschenkel',unit: 'cm', dir:  1 }
];

const TRAINER_NOTES = [
  'Saubere Technik heute — nächstes Mal steigern wir.',
  'Tiefe passt jetzt. Ab nächster Woche mehr Gewicht.',
  'Rumpf war stabil, die Atmung noch unruhig.',
  'Letzter Satz war zu leicht — beim nächsten Mal 2,5 kg drauf.',
  'Gute Einheit nach der Pause. Wir ziehen es nicht über.',
  'Knie wandert unter Last leicht nach innen — daran arbeiten wir gezielt.',
  'Griffkraft war heute der Begrenzer, nicht der Rücken.',
  'Tempo kontrolliert gehalten. Genau so wollen wir es.'
];

/* Öffnungszeiten je Wochentag (0 = Sonntag). Hier anpassen, wenn sich die Zeiten ändern. */
const OPENING = {
  1: [6, 21], 2: [6, 21], 3: [6, 21], 4: [6, 21], 5: [6, 20], 6: [8, 14], 0: null
};
const SLOT_MIN = 60;          /* Taktung der buchbaren Slots */
const BOOK_HORIZON = 14;      /* Tage im Voraus buchbar */
const LEAD_HOURS = 12;        /* Mindestvorlauf für Online-Anfragen */

/* Freie Slots aus Sicht einer Kund:in.
   Belegte Zeiten werden einfach weggelassen — es wird nie sichtbar, wer dort trainiert. */
function freeSlots(days = BOOK_HORIZON) {
  const now = new Date(), out = [];
  for (let d = 0; d <= days; d++) {
    const day = addDays(today(), d), key = iso(day);
    const win = OPENING[day.getDay()];
    if (!win) continue;
    const times = [];
    for (let h = win[0]; h < win[1]; h += SLOT_MIN / 60) {
      const hh = String(Math.floor(h)).padStart(2, '0') + ':' + (h % 1 ? '30' : '00');
      if ((new Date(`${key}T${hh}:00`) - now) / 3600000 < LEAD_HOURS) continue;
      const taken = db.bookings.some(b => b.date === key && b.time === hh &&
        (b.status === 'confirmed' || b.status === 'completed'));
      if (!taken) times.push(hh);
    }
    if (times.length) out.push({ date: key, times });
  }
  return out;
}

/* Ist genau diese Zeit frei? Gilt auch für Zeiten außerhalb des Stundenrasters,
   etwa den gewohnten 18:30-Termin einer Kund:in. */
function slotFree(date, time) {
  const day = parse(date), win = OPENING[day.getDay()];
  if (!win) return false;
  const h = parseInt(time, 10) + (time.slice(3) === '30' ? .5 : 0);
  if (h < win[0] || h >= win[1]) return false;
  if ((new Date(`${date}T${time}:00`) - new Date()) / 3600000 < LEAD_HOURS) return false;
  return !db.bookings.some(b => b.date === date && b.time === time &&
    (b.status === 'confirmed' || b.status === 'completed'));
}

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

const PROGRAMS = {
  pt1: ['squat', 'bench', 'row'], pt2: ['squat', 'bench', 'row'], mob: ['squat', 'ohp', 'row'],
  reha: ['plank', 'lunge', 'row'], pad: ['bench', 'row', 'plank'],
  grp: ['squat', 'ohp', 'row'], athl: ['squat', 'pull', 'plank'], bwg: []
};
const r25 = v => Math.round(v / 2.5) * 2.5;

function buildSeed() {
  const t = today();
  const clients = [], bookings = [], workouts = [];

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

    /* Trainingsdokumentation: jede absolvierte Einheit bekommt Übungen, Sätze und Notiz */
    c.program = PROGRAMS[s.type] || PROGRAMS.pt1;
    const startW = {
      squat: r25(s.kg[0] * .5 + s.kraft[0] * .3), bench: r25(s.kg[0] * .34 + s.kraft[0] * .2),
      row:   r25(s.kg[0] * .38 + s.kraft[0] * .2), dead: r25(s.kg[0] * .62 + s.kraft[0] * .3),
      ohp:   r25(s.kg[0] * .24 + s.kraft[0] * .12), lunge: r25(s.kg[0] * .2 + s.kraft[0] * .1),
      pull:  Math.max(2, Math.round(s.kraft[0] * .12)), plank: Math.round(28 + s.kraft[0] * .7)
    };
    const prog = (s.kraft[1] - s.kraft[0]) / Math.max(s.kraft[0], 1);
    const mine = bookings.filter(b => b.clientId === c.id && b.status === 'completed')
      .sort((a, b) => a.date.localeCompare(b.date));
    const peak = {};
    mine.forEach((b, k) => {
      const p = mine.length > 1 ? k / (mine.length - 1) : 1;
      const ex = c.program.map(id => {
        const unit = EXERCISES[id].unit;
        const raw = startW[id] * (1 + prog * p * .85) * (1 + (rand() - .5) * .04);
        const weight = unit === 'kg' ? r25(raw) : Math.round(raw);
        const isPr = weight > (peak[id] || 0);
        if (isPr) peak[id] = weight;
        return { ex: id, weight, reps: unit === 'sek' ? 1 : (rand() < .3 ? 10 : 8),
                 sets: unit === 'sek' ? 3 : (rand() < .35 ? 4 : 3), pr: isPr && k > 0 };
      });
      workouts.push({
        id: uid('w'), clientId: c.id, date: b.date, bookingId: b.id,
        duration: 45 + Math.round(rand() * 15), intensity: 6 + Math.round(rand() * 3),
        exercises: ex, note: rand() < .45 ? TRAINER_NOTES[Math.floor(rand() * TRAINER_NOTES.length)] : ''
      });
    });
    /* Messbares Ziel: nächster runder Schritt auf der Hauptübung */
    const mainEx = c.program[0];
    if (mainEx) c.goalTarget = { ex: mainEx, value: EXERCISES[mainEx].unit === 'kg'
      ? r25((peak[mainEx] || startW[mainEx]) * 1.15) : Math.round((peak[mainEx] || startW[mainEx]) * 1.2) };

    /* Wöchentlicher Check-in der letzten 8 Wochen */
    c.weekly = [];
    const base = { energie: 2.6, schlaf: 2.8, stress: 3.6, motivation: 3, wohlbefinden: 2.8 };
    for (let w = 7; w >= 0; w--) {
      const p = (7 - w) / 7, e = { date: iso(addDays(startOfWeek(t), -w * 7)) };
      CHECKIN.forEach(f => {
        const dir = f.good === 5 ? 1 : -1;
        e[f.id] = +clamp(base[f.id] + dir * p * 1.5 + (rand() - .5) * .8, 1, 5).toFixed(1);
      });
      e.kg = +(s.kg[0] + (s.kg[1] - s.kg[0]) * p).toFixed(1);
      e.note = '';
      c.weekly.push(e);
    }
    if (i % 2 === 0) c.weekly.pop();   /* offener Check-in bei jeder zweiten Kund:in */

    /* Körpermaße alle 4 Wochen */
    c.body = [];
    const bodyN = Math.min(6, Math.max(2, Math.floor(s.weeks / 4)));
    for (let k = 0; k <= bodyN; k++) {
      const p = k / bodyN;
      c.body.push({
        date: iso(addDays(t, -(bodyN - k) * 28)),
        kg:     +(s.kg[0] + (s.kg[1] - s.kg[0]) * p).toFixed(1),
        bf:     +clamp(28 - s.kraft[0] * .1 - p * 4.5 + (rand() - .5) * .6, 8, 40).toFixed(1),
        taille: Math.round(s.kg[0] * 1.05 - p * 6 + (rand() - .5) * 1.5),
        brust:  Math.round(s.kg[0] * 1.15 + p * 2.5),
        huefte: Math.round(s.kg[0] * 1.12 - p * 3),
        arm:    +(28 + s.kraft[0] * .07 + p * 1.8).toFixed(1),
        bein:   +(52 + s.kraft[0] * .08 + p * 2.2).toFixed(1)
      });
    }

    /* Aufgaben für die laufende Woche */
    c.tasks = [
      { id: uid('t'), text: '2× 10 Minuten Mobility für Hüfte und Brustwirbelsäule', done: rand() < .5, week: iso(startOfWeek(t)) },
      { id: uid('t'), text: 'Protein: 3 Portionen pro Tag, keine Rechenübung — nur Häkchen', done: rand() < .35, week: iso(startOfWeek(t)) }
    ];

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
      note: '', checkins: [], mobility: [], performance: [], videos: [],
      program: [], weekly: [], body: [], tasks: [], stoppedDaysAgo: null
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

  /* Startbestand an Trainer-Nachrichten, damit der Betreuungsbereich Inhalt hat */
  const messages = [];
  clients.filter(c => !c.lead).forEach((c, i) => {
    const first = c.name.split(' ')[0];
    const pool = [
      `${first}, deine Werte aus dem letzten Test sind eingetragen. Wir bleiben beim Plan, ziehen aber bei der Hauptübung das Gewicht an.`,
      `Kurzes Feedback zur Woche: Technik war stabil, Tempo kontrolliert. Wenn der Schlaf schlechter wird, sag es mir vor der Einheit, nicht danach.`,
      `${first}, für die kommende Woche zwei Dinge: Mobility an trainingsfreien Tagen und Protein nicht vergessen. Den Rest mache ich.`
    ];
    messages.push({ id: uid('m'), clientId: c.id, type: 'trainer', channel: 'App', from: 'trainer',
      text: pool[i % pool.length], status: 'gesendet', date: iso(addDays(t, -9)) });
    messages.push({ id: uid('m'), clientId: c.id, type: 'trainer', channel: 'App', from: 'trainer',
      text: pool[(i + 1) % pool.length], status: 'gesendet', date: iso(addDays(t, -2)) });
  });

  return {
    clients, bookings, workouts, messages, events: [],
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
TPL.checkinRemind = {
  label: 'Check-in erinnern', channel: 'WhatsApp',
  build: (c, m) => `${c.name.split(' ')[0]}, dein Wochen-Check-in fehlt noch.
Fünf Fragen, zwei Minuten: Energie, Schlaf, Stress, Motivation, Wohlbefinden.
Ich steuere dein Training danach — ohne die Werte rate ich, und raten ist nicht das, wofür du zahlst.`
};
TPL.checkinLow = {
  label: 'Reaktion auf schwachen Check-in', channel: 'WhatsApp',
  build: (c, m) => {
    const e = lastCheckin(c);
    const worst = e ? CHECKIN.map(f => ({ f, v: f.good === 5 ? e[f.id] : 6 - e[f.id] })).sort((a, b) => a.v - b.v)[0] : null;
    return `${c.name.split(' ')[0]}, dein Check-in sieht nach einer harten Woche aus${worst ? ` — vor allem ${worst.f.label.toLowerCase()}` : ''}.
Wir ziehen die nächste Einheit nicht durch wie geplant: weniger Volumen, mehr Technik und Mobility. Das ist kein Rückschritt, das ist Steuerung.
Wenn es privat gerade eng ist, sag es mir — dann passen wir den Rhythmus an, statt dass du ganz aussteigst.`;
  }
};
TPL.trainer = { label: 'Trainer-Feedback', channel: 'App', build: (c, m) => '' };
TPL.kunde   = { label: 'Nachricht von Kund:in', channel: 'App', build: (c, m) => '' };
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

  { id:'checkinlow', level:'crit', tpl:'checkinLow', title:c=>`${c.name}: schwacher Check-in`,
    desc:'Selbstauskunft unter 55 von 100 — Training anpassen, bevor die Person von selbst aussteigt.',
    match:(c,m)=> !c.lead && lastCheckin(c) && checkinScore(lastCheckin(c)) < 55 &&
                  daysBetween(lastCheckin(c).date, iso(today())) <= 9,
    why:c=>{ const e = lastCheckin(c); return `Score ${checkinScore(e)}/100 · ${fmtDate(e.date)}${e.note ? ' · „' + e.note.slice(0, 40) + '"' : ''}`; } },

  { id:'checkin', level:'warn', tpl:'checkinRemind', title:c=>`${c.name}: Check-in fehlt`,
    desc:'Ohne wöchentliche Selbstauskunft steuerst du nach Gefühl statt nach Daten.',
    match:(c,m)=> !c.lead && m.inactive < 21 && checkinDue(c) &&
                  (!lastCheckin(c) || daysBetween(lastCheckin(c).date, iso(today())) >= 9),
    why:c=>{ const l = lastCheckin(c); return l ? `Letzter Check-in vor ${daysBetween(l.date, iso(today()))} Tagen` : 'Noch nie ausgefüllt'; } },

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

/* ---------------- Training, Bestleistungen, Streak ---------------- */
const workoutsOf = id => db.workouts.filter(w => w.clientId === id).sort((a, b) => b.date.localeCompare(a.date));

/* Bestleistung je Übung: höchstes Gewicht bzw. höchster Wert, plus Startwert für den Vergleich */
function personalBests(c) {
  const ws = workoutsOf(c.id).slice().reverse();
  const best = {};
  ws.forEach(w => w.exercises.forEach(e => {
    const b = best[e.ex] || (best[e.ex] = { ex: e.ex, start: e.weight, value: e.weight, reps: e.reps, date: w.date });
    if (e.weight > b.value) { b.value = e.weight; b.reps = e.reps; b.date = w.date; }
  }));
  return Object.values(best).map(b => ({ ...b,
    gain: b.start ? Math.round((b.value - b.start) / b.start * 100) : 0 }));
}

/* Streak: Wochen in Folge mit mindestens einer absolvierten Einheit */
function streak(c) {
  const done = new Set(bookingsOf(c.id).filter(b => b.status === 'completed')
    .map(b => iso(startOfWeek(parse(b.date)))));
  let n = 0;
  for (let w = 0; w < 60; w++) {
    const key = iso(addDays(startOfWeek(today()), -w * 7));
    if (done.has(key)) n++;
    else if (w > 0) break;           /* die laufende Woche darf noch leer sein */
  }
  return n;
}

const lastCheckin = c => (c.weekly && c.weekly.length) ? c.weekly[c.weekly.length - 1] : null;
const checkinDue  = c => { const l = lastCheckin(c); return !l || daysBetween(l.date, iso(today())) >= 7; };
const checkinScore = e => Math.round(CHECKIN.reduce((a, f) =>
  a + (f.good === 5 ? e[f.id] : 6 - e[f.id]), 0) / CHECKIN.length * 20);

/* Nächster Meilenstein: das nächste runde Ziel, das noch nicht erreicht ist */
function nextMilestone(c) {
  const m = metrics(c), done = m.totalDone;
  const sessions = Math.ceil((done + 1) / 10) * 10;
  const pb = personalBests(c).sort((a, b) => b.gain - a.gain)[0];
  const target = c.goalTarget;
  if (target && pb && pb.ex === target.ex && pb.value < target.value)
    return { label: `${EXERCISES[target.ex].label} ${target.value} ${EXERCISES[target.ex].unit}`,
             now: pb.value, goal: target.value, unit: EXERCISES[target.ex].unit,
             pct: Math.round(pb.value / target.value * 100) };
  return { label: `${sessions} Einheiten`, now: done, goal: sessions, unit: 'Einheiten',
           pct: Math.round(done / sessions * 100) };
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

/* Kästen beim Scrollen hervorheben: einmaliges Auffahren plus heller Markenrand. */
let revealIO = null;
function observeReveal() {
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!revealIO) revealIO = new IntersectionObserver(entries => entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); revealIO.unobserve(e.target); }
  }), { threshold: .12, rootMargin: '0px 0px -40px 0px' });
  $$('#view .kpi, #view .card, #view .action').forEach(el => { el.classList.add('reveal'); revealIO.observe(el); });
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
  observeReveal();
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
            <span style="font-family:var(--font-d);font-stretch:75%;font-weight:700;font-size:13px;width:18px;text-align:right">${n}</span>
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
let DTAB = 'overview';
const DTABS = [
  { id: 'overview', label: 'Übersicht' },
  { id: 'training', label: 'Training' },
  { id: 'progress', label: 'Fortschritt' },
  { id: 'checkins', label: 'Check-ins' },
  { id: 'care',     label: 'Betreuung' }
];

/* Betreuungsakte: alles zu einer Kund:in an einem Ort —
   Ziel, Check-in, Trainingshistorie, Fortschritt, Notizen, Nachrichten. */
function openClient(id, tab) {
  if (tab) DTAB = tab;
  const c = client(id), m = metrics(c), st = stageOf(c);

  const body = c.lead ? leadSheet(c, m)
    : ({ overview: sheetOverview, training: sheetTraining, progress: sheetProgress,
         checkins: sheetCheckins, care: sheetCare })[DTAB](c, m);

  $('#drawerPanel').innerHTML = `
    <div class="panel__head">
      <div>
        <p class="panel__name">${c.name}</p>
        <p class="panel__meta">${c.segment} · seit ${fmtDate(c.start)} · ${daysBetween(c.start, iso(today()))} Tage</p>
      </div>
      <button class="closebtn" data-close>✕</button>
    </div>

    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px">
      <span class="pill pill--flame stage-pill">${st.label}</span>
      <span class="pill">${TYPES[c.type].short}</span>
      <span class="pill">${c.plan} · ${c.credits} offen</span>
      <span class="pill ${m.level === 'crit' ? 'pill--crit' : m.level === 'warn' ? 'pill--warn' : 'pill--good'}">Risiko ${m.score}</span>
    </div>

    ${c.lead ? '' : `<nav class="ptabs">${DTABS.map(t =>
      `<button class="ptab ${DTAB === t.id ? 'is-active' : ''}" data-act="dtab" data-id="${c.id}" data-t="${t.id}">
        ${t.label}${t.id === 'checkins' && checkinDue(c) ? '<span class="ptab__dot"></span>' : ''}
      </button>`).join('')}</nav>`}

    ${body}

    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:22px">
      <button class="btn btn--primary" data-act="bookfor" data-id="${c.id}">+ Einheit buchen</button>
      ${c.access ? `<button class="btn btn--ghost" data-act="openportal" data-id="${c.id}">Kundenansicht</button>` : ''}
      <button class="btn btn--ghost" data-act="access" data-id="${c.id}">${c.access ? 'Zugang teilen' : 'Zugang (ab Start)'}</button>
    </div>
    <p class="card__sub" style="margin-top:12px">${c.phone ? `WhatsApp: +${c.phone} · ` : ''}${c.email}</p>`;
  $('#drawer').setAttribute('aria-hidden', 'false');
}

/* ---------- Erstkontakt ---------- */
function leadSheet(c, m) {
  const done = m.bs.some(b => b.status === 'completed');
  return `
    <div class="action action--crit" style="margin-bottom:18px"><div class="action__body">
      <p class="action__title">Erstkontakt — Kennenlernen mit Beweglichkeitstest</p>
      <p class="action__why">${done
        ? 'Termin absolviert. Befund liegt vor, Programm noch offen — hier entscheidet sich, ob daraus ein:e Kund:in wird.'
        : `Termin am ${m.next ? fmtDate(m.next.date) + ' · ' + m.next.time : '—'}. Vorbereitung senkt No-Shows beim wichtigsten Termin.`}</p>
      <p class="action__why" style="color:var(--ink-3)">Quelle: ${c.source || 'unbekannt'} · 30 Min gratis · App-Zugang erst mit Trainingsstart</p>
      <div class="action__acts">
        <button class="btn btn--sm btn--primary" data-act="convert" data-id="${c.id}">In Kund:in umwandeln</button>
        <button class="btn btn--sm btn--ghost" data-act="draft" data-id="${c.id}" data-tpl="${done ? 'leadFollow' : 'leadPrep'}">Nachricht erstellen</button>
      </div></div></div>
    <p class="section-title">Ziel</p>
    <p class="card__sub" style="color:var(--ink-2);margin-bottom:16px">${c.goal}</p>
    ${mobilitySection(c)}`;
}

/* ---------- Übersicht ---------- */
function sheetOverview(c, m) {
  const ci = lastCheckin(c), ms = nextMilestone(c);
  const pbs = personalBests(c).sort((a, b) => b.gain - a.gain).slice(0, 3);
  const w = workoutsOf(c.id)[0];

  return `
    <p class="section-title">Aktuelles Ziel</p>
    <div class="metricbox" style="margin-bottom:14px">
      <p class="metricbox__val" style="font-size:16px">${c.goal}</p>
      <p class="card__sub" style="margin:6px 0 8px">Nächster Meilenstein: ${ms.label} · Stand ${ms.now}/${ms.goal} ${ms.unit}</p>
      <span style="display:block;height:8px;border-radius:99px;background:var(--surface-3);overflow:hidden">
        <span style="display:block;height:100%;width:${clamp(ms.pct, 4, 100)}%;background:var(--flame-fill)"></span></span>
    </div>

    <div class="grid grid--3">
      <div class="metricbox"><p class="metricbox__label">Einheiten</p><p class="metricbox__val">${m.totalDone}</p>
        <p class="card__sub">${m.adherence} % Adherence</p></div>
      <div class="metricbox"><p class="metricbox__label">Streak</p><p class="metricbox__val">${streak(c)} Wo.</p>
        <p class="card__sub">${m.cancels30} Storni / 30 T.</p></div>
      <div class="metricbox"><p class="metricbox__label">Letzter Check-in</p>
        <p class="metricbox__val">${ci ? checkinScore(ci) : '—'}</p>
        <p class="card__sub">${ci ? relDay(ci.date) : 'offen'}${checkinDue(c) ? ' · fällig' : ''}</p></div>
    </div>

    ${ci ? `<div class="metricbox" style="margin-top:12px">
      <p class="metricbox__label">Check-in vom ${fmtDate(ci.date)}</p>
      <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:8px">
        ${CHECKIN.map(f => `<span class="pill ${(f.good === 5 ? ci[f.id] <= 2 : ci[f.id] >= 4) ? 'pill--crit' : ''}">${f.label} ${ci[f.id]}</span>`).join('')}
      </div>
      ${ci.note ? `<p class="card__sub" style="margin-top:8px">„${ci.note}"</p>` : ''}
    </div>` : ''}

    ${m.why.length ? `<div class="action action--${m.level}" style="margin-top:14px"><div class="action__body">
      <p class="action__title">Risiko-Signale</p><p class="action__why">${m.why.join(' · ')}</p></div></div>` : ''}

    <p class="section-title">Nächste Einheit</p>
    ${m.next ? `<div class="row">
        <span class="avatar">${m.next.time.slice(0,5)}</span>
        <div class="row__main"><p class="row__name">${fmtDate(m.next.date)} · ${relDay(m.next.date)}</p>
          <p class="row__meta">${TYPES[m.next.type].label}</p></div>
        <div class="row__side"><button class="btn btn--sm btn--ghost" data-act="cancelask" data-id="${m.next.id}">Stornieren</button></div>
      </div>` : `<div class="row"><div class="row__main"><p class="row__name" style="color:var(--warn)">Kein Folgetermin</p>
        <p class="row__meta">Lücke schließen, bevor sie zur Gewohnheit wird.</p></div>
        <div class="row__side"><button class="btn btn--sm btn--primary" data-act="bookfor" data-id="${c.id}">Buchen</button></div></div>`}

    ${w ? `<p class="section-title">Letztes Training · ${fmtDate(w.date)}</p>
      <div class="metricbox">${workoutLines(w)}
        ${w.note ? `<p class="card__sub" style="margin-top:10px">„${w.note}"</p>` : ''}</div>` : ''}

    ${pbs.length ? `<p class="section-title">Bestleistungen</p>
      ${pbs.map(p => `<div class="row"><span class="avatar avatar--good">↑</span>
        <div class="row__main"><p class="row__name">${EXERCISES[p.ex].label} ${p.value} ${EXERCISES[p.ex].unit}</p>
          <p class="row__meta">Start ${p.start} · ${fmtDate(p.date)}</p></div>
        <div class="row__side"><span class="pill pill--good">+${p.gain} %</span></div></div>`).join('')}` : ''}`;
}

/* ---------- Training dokumentieren ---------- */
function sheetTraining(c, m) {
  const ws = workoutsOf(c.id);
  return `
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px">
      <button class="btn btn--sm btn--primary" data-act="wonew" data-id="${c.id}">+ Training dokumentieren</button>
      <span class="pill">${ws.length} dokumentiert</span>
      <span class="pill">Programm: ${(c.program || []).map(x => EXERCISES[x].label).join(', ') || '—'}</span>
    </div>
    ${ws.length ? ws.slice(0, 12).map(w => `
      <div class="metricbox" style="margin-bottom:10px">
        <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:8px">
          <p style="font-size:13.5px;font-weight:700">${fmtDate(w.date)}</p>
          <span class="card__sub">${w.duration} Min · Intensität ${w.intensity}/10</span>
        </div>
        ${workoutLines(w)}
        ${w.note ? `<p class="card__sub" style="margin-top:9px">„${w.note}"</p>` : ''}
      </div>`).join('') : '<p class="empty">Noch kein Training dokumentiert.</p>'}`;
}

/* ---------- Fortschritt ---------- */
function sheetProgress(c, m) {
  const ci = c.checkins || [], b = c.body || [];
  const dPain = (m.now.pain - m.first.pain).toFixed(1), dKraft = m.now.kraft - m.first.kraft, dKg = (m.now.kg - m.first.kg).toFixed(1);
  const pbs = personalBests(c);
  const ws = workoutsOf(c.id).slice().reverse();

  return `
    ${ci.length > 1 ? `<p class="section-title">Verlauf</p>
    <div class="grid grid--3">
      ${metricBox('Schmerz (0–10)', m.now.pain, dPain, dPain <= 0, ci.map(x => x.pain), 'var(--good)')}
      ${metricBox('Kraftindex', m.now.kraft, (dKraft > 0 ? '+' : '') + dKraft, dKraft >= 0, ci.map(x => x.kraft), 'var(--flame)')}
      ${metricBox('Gewicht (kg)', m.now.kg, (dKg > 0 ? '+' : '') + dKg, true, ci.map(x => x.kg), 'var(--ink-2)')}
    </div>` : ''}

    ${pbs.length ? `<p class="section-title">Kraftentwicklung</p>
    <div class="grid grid--3">
      ${pbs.map(p => { const sr = ws.filter(w => w.exercises.some(e => e.ex === p.ex))
          .map(w => w.exercises.find(e => e.ex === p.ex).weight);
        return `<div class="metricbox"><p class="metricbox__label">${EXERCISES[p.ex].label}</p>
          <p class="metricbox__val">${p.value}<span style="font-size:11px;color:var(--ink-3)"> ${EXERCISES[p.ex].unit}</span>
            <span class="${p.gain >= 0 ? 'delta-good' : 'delta-crit'}">${p.gain >= 0 ? '+' : ''}${p.gain} %</span></p>
          ${sparkline(sr.length > 1 ? sr : [p.start, p.value], { color: 'var(--flame)', w: 126, h: 36 })}</div>`; }).join('')}
    </div>` : ''}

    ${b.length > 1 ? `<p class="section-title">Körpermessungen · ${b.length}</p>
    <div class="metricbox" style="margin-bottom:12px">
      ${BODY.map(f => { const v0 = b[0][f.id], v1 = b[b.length - 1][f.id], d = +(v1 - v0).toFixed(1);
        return `<div style="display:flex;align-items:center;gap:12px;padding:7px 0;border-bottom:1px solid var(--line)">
          <span style="flex:1;font-size:13px;font-weight:600">${f.label}</span>
          <span style="font-size:12.5px;color:var(--ink-2)">${v0} → <strong>${v1}</strong> ${f.unit}</span>
          <span style="width:52px;text-align:right;font-size:12px" class="${d * f.dir >= 0 ? 'delta-good' : 'delta-crit'}">${d > 0 ? '+' : ''}${d}</span>
        </div>`; }).join('')}
      <button class="btn btn--sm btn--ghost" data-act="bodynew" data-id="${c.id}" style="margin-top:12px">Messung erfassen</button>
    </div>` : `<p class="section-title">Körpermessungen</p>
      <button class="btn btn--sm btn--ghost" data-act="bodynew" data-id="${c.id}">Erste Messung erfassen</button>`}

    ${mobilitySection(c)}
    ${performanceSection(c)}`;
}

/* ---------- Check-ins ---------- */
function sheetCheckins(c, m) {
  const hist = (c.weekly || []).slice().reverse();
  return `
    ${checkinDue(c) ? `<div class="action action--warn" style="margin-bottom:14px"><div class="action__body">
      <p class="action__title">Check-in offen</p>
      <p class="action__why">Letzter Check-in ${hist[0] ? relDay(hist[0].date) : 'nie'} — ohne Selbstauskunft steuerst du blind.</p>
      <div class="action__acts"><button class="btn btn--sm btn--primary" data-act="draft" data-id="${c.id}" data-tpl="checkinRemind">Erinnerung senden</button></div>
    </div>` : ''}
    ${hist.length ? hist.slice(0, 10).map(e => `
      <div class="metricbox" style="margin-bottom:9px">
        <div style="display:flex;align-items:center;justify-content:space-between;gap:10px">
          <span style="font-size:13px;font-weight:700">${fmtDate(e.date)}</span>
          <span class="pill ${checkinScore(e) >= 70 ? 'pill--good' : checkinScore(e) >= 50 ? 'pill--warn' : 'pill--crit'}">${checkinScore(e)} / 100</span>
        </div>
        <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:8px">
          ${CHECKIN.map(f => `<span class="pill ${(f.good === 5 ? e[f.id] <= 2 : e[f.id] >= 4) ? 'pill--crit' : ''}" style="font-weight:500">${f.label} ${e[f.id]}</span>`).join('')}
          ${e.kg ? `<span class="pill" style="font-weight:500">${e.kg} kg</span>` : ''}
        </div>
        ${e.note ? `<p class="card__sub" style="margin-top:7px">„${e.note}"</p>` : ''}
      </div>`).join('') : '<p class="empty">Noch keine Check-ins.</p>'}`;
}

/* ---------- Betreuung: Notizen, Aufgaben, Nachrichten, Videos ---------- */
function sheetCare(c, m) {
  const thread = db.messages.filter(x => x.clientId === c.id && x.status === 'gesendet')
    .slice().sort((a, b) => a.date.localeCompare(b.date)).slice(-6);
  const tasks = c.tasks || [];

  return `
    <p class="section-title">Eigene Notizen</p>
    <div class="field">
      <textarea id="cnote" rows="3" placeholder="Beobachtungen, Absprachen, Verletzungen, Vorlieben …">${c.note || ''}</textarea>
    </div>
    <button class="btn btn--sm btn--ghost" data-act="noteSave" data-id="${c.id}">Notiz speichern</button>

    <p class="section-title">Aufgaben für die Woche</p>
    ${tasks.length ? tasks.map(t => `<div class="row row--click" data-act="task" data-id="${c.id}" data-tid="${t.id}">
      <span class="avatar ${t.done ? 'avatar--good' : ''}">${t.done ? '✓' : '○'}</span>
      <div class="row__main"><p class="row__name" style="${t.done ? 'opacity:.6;text-decoration:line-through' : ''}">${t.text}</p></div>
    </div>`).join('') : '<p class="empty">Keine Aufgaben vergeben.</p>'}
    <div class="field" style="margin-top:10px"><input id="taskText" placeholder="Neue Aufgabe für die Woche …" /></div>
    <button class="btn btn--sm btn--ghost" data-act="taskadd" data-id="${c.id}">Aufgabe hinzufügen</button>

    <p class="section-title">Nachrichten</p>
    ${thread.length ? thread.map(x => `
      <div style="margin-bottom:9px;display:flex;justify-content:${x.from === 'kunde' ? 'flex-start' : 'flex-end'}">
        <div style="max-width:86%;background:${x.from === 'kunde' ? 'var(--surface-3)' : 'var(--flame-dim)'};
          border:1px solid var(--line);border-radius:var(--r-md);padding:10px 12px">
          <p style="font-size:11px;color:var(--ink-3);margin-bottom:3px">${x.from === 'kunde' ? c.name.split(' ')[0] : 'Yalcin'} · ${fmtDate(x.date)}</p>
          <p style="font-size:13px;white-space:pre-wrap;line-height:1.5">${x.text}</p>
        </div>
      </div>`).join('') : '<p class="empty">Noch keine Nachrichten.</p>'}
    <div class="field" style="margin-top:10px"><textarea id="trainerText" rows="2" placeholder="Feedback an ${c.name.split(' ')[0]} …"></textarea></div>
    <button class="btn btn--sm btn--primary" data-act="trainerMsg" data-id="${c.id}">Senden</button>

    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:14px">
      ${['winback','credits','milestone','onboarding','rebook','welcomeVideo','perfResult'].map(t =>
        `<button class="btn btn--sm btn--ghost" data-act="draft" data-id="${c.id}" data-tpl="${t}">${TPL[t].label}</button>`).join('')}
    </div>

    ${videoSection(c)}`;
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
      <span class="tbar" style="flex:1;height:8px;border-radius:99px;background:var(--surface-3);position:relative;overflow:hidden" title="Baseline ${v0} · aktuell ${v1}">
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
  const firstOnly = c.performance.length < 2;

  return `<p class="section-title">Leistungstest · ${c.performance.length} ${c.performance.length === 1 ? 'Messung' : 'Messungen'}</p>
  <div class="metricbox" style="margin-bottom:12px">
    <div style="display:flex;align-items:center;justify-content:space-between;gap:14px;flex-wrap:wrap">
      <div style="min-width:0">
        <p class="metricbox__label">${firstOnly ? 'Ausgangswerte erfasst' : 'Leistungsindex'}</p>
        <p class="metricbox__val" style="white-space:nowrap">${firstOnly ? 'Baseline' : `100 → ${idx}<span class="${idx >= 100 ? 'delta-good' : 'delta-crit'}">${idx >= 100 ? '+' : ''}${idx - 100} %</span>`}</p>
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
      <span class="tbar" style="flex:1;height:8px;border-radius:99px;background:var(--surface-3);position:relative;overflow:hidden">
        <span style="position:absolute;inset:0 auto 0 0;width:${clamp(50 + rel * 1.6, 6, 100)}%;background:${tone};border-radius:99px"></span>
        <span style="position:absolute;top:-2px;bottom:-2px;left:50%;width:2px;background:var(--ink)"></span>
      </span>
      <span style="width:104px;text-align:right;font-size:12.5px;color:var(--ink-2)">${firstOnly ? '' : v0 + ' → '}<strong style="color:${tone}">${v1}</strong> ${i.unit}</span>
      <span style="width:44px;text-align:right;font-size:12px" class="${rel >= 0 ? 'delta-good' : 'delta-crit'}">${firstOnly ? '' : (rel >= 0 ? '+' : '') + rel.toFixed(0) + ' %'}</span>
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

function availabilityHTML(c, limitDays = 4, perDay = 6, full = false) {
  const all = freeSlots();
  if (!c.credits) return `<div class="action action--warn"><div class="action__body">
    <p class="action__title">Kein Kontingent offen</p>
    <p class="action__why">Dein Block ist aufgebraucht. Schreib uns kurz — dann verlängern wir und dein fixer Termin bleibt dir erhalten.</p>
    <div class="action__acts"><a class="btn btn--sm btn--primary" href="https://wa.me/436703565006" target="_blank" rel="noopener">Verlängerung anfragen</a></div>
  </div></div>`;
  if (!all.length) return '<p class="empty">In den nächsten Tagen ist alles ausgebucht. Schreib uns — wir finden einen Platz.</p>';

  /* Der gewohnte Termin steht oben: feste Zeiten halten Menschen im Training, nicht freie Auswahl. */
  const habit = [];
  for (let d = 0; d <= BOOK_HORIZON && habit.length < 2; d++) {
    const day = addDays(today(), d);
    if (day.getDay() !== c.dow) continue;
    if (slotFree(iso(day), c.time)) habit.push({ date: iso(day), time: c.time });
  }

  const rest = (full ? all : all.slice(0, limitDays)).map(d => ({
    date: d.date,
    times: (full ? d.times : d.times.slice(0, perDay))
      .filter(t => !habit.some(h => h.date === d.date && h.time === t))
  })).filter(d => d.times.length);

  const chip = (date, time, primary) =>
    `<button class="btn btn--sm ${primary ? 'btn--primary' : 'btn--ghost'}" data-act="reqslot" data-id="${c.id}" data-d="${date}" data-t="${time}">${primary ? fmtShort(date) + ' · ' + time : time}</button>`;

  /* Läuft die feste Serie schon, wird sie bestätigt statt erneut angeboten. */
  const fix = db.bookings
    .filter(b => b.clientId === c.id && b.status === 'confirmed' && b.date >= iso(today()) &&
                 b.time === c.time && parse(b.date).getDay() === c.dow)
    .sort((a, b) => a.date.localeCompare(b.date))[0];

  return `
    ${habit.length ? `<div style="margin-bottom:14px">
      <p class="metricbox__label" style="margin-bottom:8px">Dein gewohnter Termin — ${DOW[c.dow]} ${c.time}</p>
      <div style="display:flex;gap:7px;flex-wrap:wrap">${habit.map(h => chip(h.date, h.time, true)).join('')}</div>
      <p class="card__sub" style="margin-top:8px">Gleicher Tag, gleiche Zeit — daran hängt dein Ergebnis, nicht an der Lust am Dienstag.</p>
    </div>`
    : fix ? `<div class="metricbox" style="margin-bottom:14px">
      <p class="metricbox__label">Dein fixer Termin läuft</p>
      <p class="metricbox__val" style="font-size:17px">${DOW[c.dow]} ${c.time}<span style="font-size:12px;color:var(--ink-3);font-weight:500"> · nächster ${fmtDate(fix.date)}</span></p>
      <p class="card__sub">Unten findest du Zusatztermine, falls du eine Einheit draufsetzen willst.</p>
    </div>` : ''}

    ${rest.length ? `<p class="metricbox__label" style="margin:4px 0 6px">Weitere freie Zeiten</p>` : ''}
    ${rest.map(d => `
      <div style="padding:9px 0;border-bottom:1px solid var(--line)">
        <p style="font-size:12.5px;font-weight:600;margin-bottom:7px">${fmtDate(d.date)}
          <span style="color:var(--ink-3);font-weight:500">· ${relDay(d.date)}</span></p>
        <div style="display:flex;gap:6px;flex-wrap:wrap">${d.times.map(t => chip(d.date, t, false)).join('')}</div>
      </div>`).join('')}

    ${!full ? `<button class="btn btn--sm btn--ghost" data-act="availability" data-id="${c.id}" style="margin-top:12px">Alle freien Zeiten ansehen</button>` : ''}
    <p class="card__sub" style="margin-top:10px">Freie Zeiten laut Studiokalender · ${c.credits} ${c.credits === 1 ? 'Einheit' : 'Einheiten'} auf deinem ${c.plan} · Anfragen bis ${LEAD_HOURS} h vorher.</p>`;
}

function availabilityModal(id) {
  const c = client(id);
  modal(`
    <div class="panel__head"><div><p class="panel__name">Termin anfragen</p>
      <p class="panel__meta">Freie Zeiten · ${TYPES[c.type].label}</p></div>
      <button class="closebtn" data-close>✕</button></div>
    ${availabilityHTML(c, 14, 99, true)}`);
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

function workoutModal(id) {
  const c = client(id), prog = (c.program || []).length ? c.program : ['squat', 'bench', 'row'];
  const last = workoutsOf(c.id)[0];
  modal(`
    <div class="panel__head"><div><p class="panel__name">Training dokumentieren</p>
      <p class="panel__meta">${c.name}${last ? ' · zuletzt ' + fmtDate(last.date) : ''}</p></div>
      <button class="closebtn" data-close>✕</button></div>
    <div class="field-row">
      <div class="field"><label>Datum</label><input type="date" id="woDate" value="${iso(today())}" /></div>
      <div class="field"><label>Dauer (Min)</label><input type="number" id="woDur" value="${last ? last.duration : 60}" /></div>
    </div>
    <div class="field"><label>Intensität (1–10)</label><input type="number" min="1" max="10" id="woInt" value="${last ? last.intensity : 7}" /></div>
    ${prog.map(ex => {
      const prev = last ? last.exercises.find(e => e.ex === ex) : null;
      const u = EXERCISES[ex].unit;
      return `<div class="field">
        <label>${EXERCISES[ex].label} ${prev ? `<span style="color:var(--ink-3);text-transform:none;letter-spacing:0">(zuletzt ${prev.weight} ${u} × ${prev.reps} × ${prev.sets})</span>` : ''}</label>
        <div class="field-row" style="grid-template-columns:1fr 1fr 1fr;gap:8px">
          <input type="number" step="0.5" id="wo_${ex}_w" placeholder="${u}" value="${prev ? prev.weight : ''}" />
          <input type="number" id="wo_${ex}_r" placeholder="Wdh" value="${prev ? prev.reps : 8}" />
          <input type="number" id="wo_${ex}_s" placeholder="Sätze" value="${prev ? prev.sets : 3}" />
        </div>
      </div>`; }).join('')}
    <div class="field"><label>Notiz an ${c.name.split(' ')[0]}</label>
      <textarea id="woNote" rows="2" placeholder="Saubere Technik heute — nächstes Mal steigern wir."></textarea></div>
    <button class="btn btn--primary" data-act="woSave" data-id="${c.id}" style="width:100%;justify-content:center">Training speichern</button>
    <p class="card__sub" style="margin-top:10px">Bestleistungen werden automatisch erkannt und im Kundenzugang als PR ausgewiesen.</p>`);
}

function bodyModal(id) {
  const c = client(id), last = (c.body || [])[(c.body || []).length - 1];
  modal(`
    <div class="panel__head"><div><p class="panel__name">Körpermessung</p>
      <p class="panel__meta">${c.name}${last ? ' · zuletzt ' + fmtDate(last.date) : ''}</p></div>
      <button class="closebtn" data-close>✕</button></div>
    ${BODY.map(f => `<div class="field">
      <label>${f.label} (${f.unit}) ${last ? `<span style="color:var(--ink-3);text-transform:none;letter-spacing:0">(zuletzt ${last[f.id]})</span>` : ''}</label>
      <input type="number" step="0.1" id="bd_${f.id}" value="${last ? last[f.id] : ''}" />
    </div>`).join('')}
    <button class="btn btn--primary" data-act="bodySave" data-id="${c.id}" style="width:100%;justify-content:center">Messung speichern</button>`);
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
    <span style="font-family:var(--font-d);font-stretch:75%;font-weight:700">${fmtShort(iso(days[0]))} – ${fmtShort(iso(days[6]))}</span>
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
            <button class="btn btn--sm btn--ghost" data-act="availability" data-id="${c.id}">Zusatztermin</button>
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

/* ---------------- Kundenportal (individueller Zugang) ----------------
   Sechs Bereiche: Start, Training, Fortschritt, Erfolge, Check-in, Betreuung.
   Der Kunde sieht ausschließlich eigene Daten plus die freie Verfügbarkeit. */
let PVIEW = 'home';
const PTABS = [
  { id: 'home',     label: 'Start' },
  { id: 'training', label: 'Training' },
  { id: 'progress', label: 'Fortschritt' },
  { id: 'wins',     label: 'Erfolge' },
  { id: 'checkin',  label: 'Check-in' },
  { id: 'care',     label: 'Betreuung' }
];

function renderPortal(id) {
  const c = client(id), m = metrics(c);
  document.body.classList.add('is-portal');
  $('#topEyebrow').textContent = 'Dein FITARY-Zugang';
  $('#topTitle').textContent = 'Servus, ' + c.name.split(' ')[0];
  $('#quickBook').textContent = window.innerWidth < 520 ? '+ Termin' : '+ Termin anfragen';

  const body = ({ home: portalHome, training: portalTraining, progress: portalProgress,
                  wins: portalWins, checkin: portalCheckin, care: portalCare })[PVIEW](c, m);

  $('#view').innerHTML = `
    ${PORTAL_DEMO ? `<div class="row demo-bar" style="margin-bottom:14px;border-color:rgba(255,138,80,.38)">
      <span class="avatar">👁</span>
      <div class="row__main"><p class="row__name">Kundenansicht von ${c.name}</p>
        <p class="row__meta">So sieht ${c.name.split(' ')[0]} den eigenen Zugang — nur eigene Daten, nichts vom Studio.</p></div>
      <div class="row__side"><button class="btn btn--sm btn--ghost" data-act="leaveportal">Zurück ins Cockpit</button></div>
    </div>` : ''}

    <nav class="ptabs">
      ${PTABS.map(t => `<button class="ptab ${PVIEW === t.id ? 'is-active' : ''}" data-act="ptab" data-t="${t.id}">
        ${t.label}${t.id === 'checkin' && checkinDue(c) ? '<span class="ptab__dot"></span>' : ''}
        ${t.id === 'care' && (c.tasks || []).some(x => !x.done) ? '<span class="ptab__dot"></span>' : ''}
      </button>`).join('')}
    </nav>

    ${body}`;
  observeReveal();
}

/* ---------- Start: Ziel, Fortschritt, letztes Training, Streak ---------- */
function portalHome(c, m) {
  const w = workoutsOf(c.id)[0];
  const ms = nextMilestone(c), st = streak(c);
  const msg = db.messages.filter(x => x.clientId === c.id && x.status === 'gesendet' && x.from !== 'kunde')[0];
  const ci = c.checkins || [];

  return `
  <div class="grid grid--2">
    <div>
      <div class="card">
        <div class="card__head"><div><p class="card__title">Deine nächste Einheit</p>
          <p class="card__sub">Plobergerstraße 7, 4600 Wels</p></div></div>
        ${m.next ? `<div class="row">
            <span class="avatar">${m.next.time.slice(0,5)}</span>
            <div class="row__main"><p class="row__name">${fmtDate(m.next.date)} · ${relDay(m.next.date)}</p>
              <p class="row__meta">${TYPES[m.next.type].label} · ${m.next.coach}</p></div>
            <div class="row__side"><button class="btn btn--sm btn--ghost" data-act="cancelask" data-id="${m.next.id}">Absagen</button></div>
          </div>` : `<p class="empty">Kein Termin gebucht.</p>
            <button class="btn btn--primary" data-act="availability" data-id="${c.id}" style="width:100%;justify-content:center">Freien Termin wählen</button>`}
      </div>

      <div class="card" style="margin-top:16px">
        <div class="card__head"><div><p class="card__title">Dein aktuelles Ziel</p>
          <p class="card__sub">${c.goal}</p></div></div>
        <p class="metricbox__label">Nächster Meilenstein</p>
        <p class="metricbox__val" style="margin-bottom:8px">${ms.label}</p>
        <span style="display:block;height:10px;border-radius:99px;background:var(--surface-3);overflow:hidden">
          <span style="display:block;height:100%;width:${clamp(ms.pct, 4, 100)}%;background:var(--flame-fill);border-radius:99px"></span></span>
        <p class="card__sub" style="margin-top:8px">Stand: ${ms.now} von ${ms.goal} ${ms.unit} · ${clamp(ms.pct,0,100)} %</p>
      </div>

      ${w ? `<div class="card" style="margin-top:16px">
        <div class="card__head"><div><p class="card__title">Letztes Training</p>
          <p class="card__sub">${fmtDate(w.date)} · ${w.duration} Min · Intensität ${w.intensity}/10</p></div>
          ${w.exercises.some(e => e.pr) ? '<span class="pill pill--flame">Bestleistung</span>' : ''}</div>
        ${workoutLines(w)}
        ${w.note ? `<p class="msg__text" style="margin-top:12px">💬 „${w.note}"</p>` : ''}
        <button class="btn btn--sm btn--ghost" data-act="ptab" data-t="training" style="margin-top:12px">Alle Trainings ansehen</button>
      </div>` : ''}
    </div>

    <div>
      <div class="grid grid--3">
        <div class="metricbox"><p class="metricbox__label">Einheiten</p>
          <p class="metricbox__val">${m.totalDone}</p><p class="card__sub">seit ${fmtShort(c.start)}</p></div>
        <div class="metricbox"><p class="metricbox__label">Streak</p>
          <p class="metricbox__val">${st}<span style="font-size:12px;color:var(--ink-3)"> Wo.</span></p>
          <p class="card__sub">${st >= 4 ? 'Das hält' : 'dranbleiben'}</p></div>
        <div class="metricbox"><p class="metricbox__label">Adherence</p>
          <p class="metricbox__val">${m.adherence} %</p><p class="card__sub">letzte 8 Wochen</p></div>
      </div>

      ${ci.length > 1 ? `<div class="card" style="margin-top:16px">
        <div class="card__head"><div><p class="card__title">Fortschritt seit Start</p>
          <p class="card__sub">${daysBetween(c.start, iso(today()))} Tage dabei</p></div></div>
        <div class="grid grid--3">
          ${metricBox('Schmerz', m.now.pain, (m.now.pain - m.first.pain).toFixed(1), m.now.pain <= m.first.pain, ci.map(x => x.pain), 'var(--good)')}
          ${metricBox('Kraftindex', m.now.kraft, '+' + (m.now.kraft - m.first.kraft), true, ci.map(x => x.kraft), 'var(--flame)')}
          ${metricBox('Gewicht', m.now.kg, (m.now.kg - m.first.kg).toFixed(1), true, ci.map(x => x.kg), 'var(--ink-2)')}
        </div>
        <button class="btn btn--sm btn--ghost" data-act="ptab" data-t="progress" style="margin-top:12px">Alle Werte ansehen</button>
      </div>` : ''}

      <div class="card" style="margin-top:16px">
        <div class="card__head"><div><p class="card__title">Nachricht von Yalcin</p>
          <p class="card__sub">${msg ? fmtDate(msg.date) : 'noch keine Nachricht'}</p></div></div>
        ${msg ? `<div class="msg__text">${msg.text.split('\n').slice(0, 3).join('\n')}</div>
          <button class="btn btn--sm btn--ghost" data-act="ptab" data-t="care" style="margin-top:11px">Zur Betreuung</button>`
          : '<p class="empty">Sobald Yalcin dir schreibt, steht es hier.</p>'}
      </div>

      ${checkinDue(c) ? `<div class="action action--flame" style="margin-top:16px"><div class="action__body">
        <p class="action__title">Dein Wochen-Check-in ist offen</p>
        <p class="action__why">Zwei Minuten: Energie, Schlaf, Stress, Motivation, Wohlbefinden. Danach passt Yalcin dein Training an.</p>
        <div class="action__acts"><button class="btn btn--sm btn--primary" data-act="ptab" data-t="checkin">Jetzt ausfüllen</button></div>
      </div></div>` : ''}
    </div>
  </div>`;
}

const workoutLines = w => w.exercises.map(e => {
  const u = EXERCISES[e.ex].unit;
  const val = u === 'sek' ? `${e.weight} sek × ${e.sets}` : `${e.weight} ${u} × ${e.reps} × ${e.sets}`;
  return `<div style="display:flex;align-items:center;gap:10px;padding:7px 0;border-bottom:1px solid var(--line)">
    <span style="flex:1;font-size:13.5px;font-weight:600">${EXERCISES[e.ex].label}</span>
    <span style="font-size:13px;color:var(--ink-2);font-variant-numeric:tabular-nums">${val}</span>
    ${e.pr ? '<span class="pill pill--flame">PR</span>' : ''}
  </div>`;
}).join('');

/* ---------- Mein Training ---------- */
function portalTraining(c) {
  const ws = workoutsOf(c.id);
  if (!ws.length) return '<p class="empty">Sobald dein erstes Training dokumentiert ist, steht es hier.</p>';
  const last30 = ws.filter(w => daysBetween(w.date, iso(today())) <= 30);
  const avgDur = Math.round(ws.slice(0, 10).reduce((a, w) => a + w.duration, 0) / Math.min(ws.length, 10));
  const avgInt = (ws.slice(0, 10).reduce((a, w) => a + w.intensity, 0) / Math.min(ws.length, 10)).toFixed(1);

  return `
  <div class="grid grid--3" style="margin-bottom:16px">
    <div class="metricbox"><p class="metricbox__label">Trainings gesamt</p><p class="metricbox__val">${ws.length}</p></div>
    <div class="metricbox"><p class="metricbox__label">Letzte 30 Tage</p><p class="metricbox__val">${last30.length}</p></div>
    <div class="metricbox"><p class="metricbox__label">Ø Dauer / Intensität</p><p class="metricbox__val" style="font-size:17px">${avgDur} Min · ${avgInt}/10</p></div>
  </div>

  ${ws.slice(0, 14).map(w => `
    <div class="card" style="margin-bottom:10px">
      <div class="card__head" style="margin-bottom:10px">
        <div><p class="card__title">Training — ${fmtDate(w.date)}</p>
          <p class="card__sub">${w.duration} Minuten · Intensität ${w.intensity}/10${w.coach ? ' · ' + w.coach : ''}</p></div>
        ${w.exercises.some(e => e.pr) ? '<span class="pill pill--flame">Bestleistung</span>' : ''}
      </div>
      ${workoutLines(w)}
      ${w.note ? `<p class="msg__text" style="margin-top:12px">💬 „${w.note}"</p>` : ''}
    </div>`).join('')}
  ${ws.length > 14 ? `<p class="card__sub">${ws.length - 14} weitere Trainings im Archiv.</p>` : ''}`;
}

/* ---------- Fortschritt ---------- */
function portalProgress(c, m) {
  const ws = workoutsOf(c.id).slice().reverse();
  const pbs = personalBests(c);
  const b = c.body || [];
  const first = b[0], now = b[b.length - 1];
  const mob = baseTest(c) ? { von: mobiScore(baseTest(c)), bis: mobiScore(lastTest(c)) } : null;

  const series = ex => ws.filter(w => w.exercises.some(e => e.ex === ex))
    .map(w => w.exercises.find(e => e.ex === ex).weight);

  const row = (label, von, bis, unit, better) => `
    <div style="display:flex;align-items:center;gap:12px;padding:9px 0;border-bottom:1px solid var(--line)">
      <span style="flex:1;font-size:13.5px;font-weight:600">${label}</span>
      <span style="font-size:13px;color:var(--ink-2);font-variant-numeric:tabular-nums">${von} → <strong style="color:${better ? 'var(--good)' : 'var(--ink)'}">${bis}</strong> ${unit}</span>
    </div>`;

  return `
  <div class="card" style="margin-bottom:16px">
    <div class="card__head"><div><p class="card__title">Start vs. Heute</p>
      <p class="card__sub">Alles, was gemessen wurde — ohne Schönrechnen</p></div></div>
    ${pbs.map(p => row(EXERCISES[p.ex].label, p.start, p.value, EXERCISES[p.ex].unit, p.value > p.start)).join('')}
    ${first ? BODY.map(f => row(f.label, first[f.id], now[f.id], f.unit,
        f.dir === 1 ? now[f.id] >= first[f.id] : now[f.id] <= first[f.id])).join('') : ''}
    ${basePerf(c) ? PERF.filter(i => ['row500','hr'].includes(i.id)).map(i =>
        row(i.label, basePerf(c).items[i.id], lastPerf(c).items[i.id], i.unit,
            (lastPerf(c).items[i.id] - basePerf(c).items[i.id]) * i.dir >= 0)).join('') : ''}
    ${mob ? row('Beweglichkeits-Score', mob.von, mob.bis, '/100', mob.bis >= mob.von) : ''}
  </div>

  <div class="card" style="margin-bottom:16px">
    <div class="card__head"><div><p class="card__title">Kraftentwicklung</p>
      <p class="card__sub">Arbeitsgewicht je Übung über alle dokumentierten Trainings</p></div></div>
    <div class="grid grid--3">
      ${pbs.map(p => {
        const sr = series(p.ex);
        return `<div class="metricbox">
          <p class="metricbox__label">${EXERCISES[p.ex].label}</p>
          <p class="metricbox__val">${p.value}<span style="font-size:12px;color:var(--ink-3)"> ${EXERCISES[p.ex].unit}</span>
            <span class="${p.gain >= 0 ? 'delta-good' : 'delta-crit'}">${p.gain >= 0 ? '+' : ''}${p.gain} %</span></p>
          ${sparkline(sr.length > 1 ? sr : [p.start, p.value], { color: 'var(--flame)', w: 130, h: 38 })}
        </div>`; }).join('')}
    </div>
  </div>

  ${b.length > 1 ? `<div class="card" style="margin-bottom:16px">
    <div class="card__head"><div><p class="card__title">Körperwerte</p>
      <p class="card__sub">${b.length} Messungen · zuletzt ${fmtDate(now.date)}</p></div></div>
    <div class="grid grid--3">
      ${['kg','bf','taille'].map(f => {
        const def = BODY.find(x => x.id === f), sr = b.map(x => x[f]);
        const d = +(now[f] - first[f]).toFixed(1);
        return `<div class="metricbox">
          <p class="metricbox__label">${def.label}</p>
          <p class="metricbox__val">${now[f]}<span style="font-size:12px;color:var(--ink-3)"> ${def.unit}</span>
            <span class="${d * def.dir <= 0 ? 'delta-good' : 'delta-crit'}">${d > 0 ? '+' : ''}${d}</span></p>
          ${sparkline(sr, { color: 'var(--good)', w: 130, h: 38 })}
        </div>`; }).join('')}
    </div>
  </div>` : ''}

  ${baseTest(c) ? `<div class="card" style="margin-bottom:16px">
    <div class="card__head"><div><p class="card__title">Beweglichkeit</p>
      <p class="card__sub">${lastTest(c).phase} · ${fmtDate(lastTest(c).date)}</p></div>
      <span class="pill pill--good">Score ${mobiScore(baseTest(c))} → ${mobiScore(lastTest(c))}</span></div>
    ${MOBI.map(i => {
      const v0 = baseTest(c).items[i.id], v1 = lastTest(c).items[i.id], d = +(v1 - v0).toFixed(1);
      const tone = v1 >= 4 ? 'var(--good)' : v1 >= 2.8 ? 'var(--warn)' : 'var(--crit)';
      return `<div style="display:flex;align-items:center;gap:12px;padding:8px 0;border-bottom:1px solid var(--line)">
        <span style="flex:1;font-size:13px;font-weight:600">${i.label}</span>
        <span class="tbar" style="flex:1;height:8px;border-radius:99px;background:var(--surface-3);position:relative;overflow:hidden">
          <span style="position:absolute;inset:0 auto 0 0;width:${v1 / 5 * 100}%;background:${tone};border-radius:99px"></span>
          <span style="position:absolute;top:-2px;bottom:-2px;left:${v0 / 5 * 100}%;width:2px;background:var(--ink)"></span></span>
        <span style="width:78px;text-align:right;font-size:12.5px;color:var(--ink-2)">${v0} → <strong style="color:${tone}">${v1}</strong></span>
        <span style="width:36px;text-align:right;font-size:12px" class="${d >= 0 ? 'delta-good' : 'delta-crit'}">${d >= 0 ? '+' : ''}${d}</span>
      </div>`; }).join('')}
  </div>` : ''}

  <div class="card">
    <div class="card__head"><div><p class="card__title">Deine Journey</p>
      <p class="card__sub">${stageOf(c).desc}</p></div>
      <span class="pill pill--flame stage-pill">${stageOf(c).label}</span></div>
    <div class="rail">
      ${STAGES.map((x, i) => { const idx = STAGES.findIndex(y => y.id === stageOf(c).id);
        return `<div class="rail__step ${i < idx ? 'done' : i === idx ? 'now' : ''}">
          <span class="rail__dot"></span><p class="rail__label">${x.label}</p></div>`; }).join('')}
    </div>
  </div>`;
}

/* ---------- Erfolge ---------- */
function portalWins(c, m) {
  const pbs = personalBests(c).sort((a, b) => b.gain - a.gain);
  const top = pbs[0];
  const st = streak(c);
  const mob = baseTest(c) ? mobiScore(lastTest(c)) - mobiScore(baseTest(c)) : 0;
  const prCount = workoutsOf(c.id).reduce((a, w) => a + w.exercises.filter(e => e.pr).length, 0);
  const marks = [10, 20, 30, 50, 75, 100].filter(x => m.totalDone >= x);

  return `
  ${top ? `<div class="card" style="margin-bottom:16px;border-color:rgba(255,138,80,.45)">
    <p class="metricbox__label">🏆 Dein bisher größter Fortschritt</p>
    <p style="font-family:var(--font-d);font-stretch:75%;font-size:30px;font-weight:700;letter-spacing:-.02em;margin:6px 0">
      ${EXERCISES[top.ex].label}: ${top.start} → ${top.value} ${EXERCISES[top.ex].unit}
      <span class="delta-good" style="font-size:20px">+${top.gain} %</span></p>
    <p class="card__sub">Erreicht am ${fmtDate(top.date)} — erarbeitet in ${m.totalDone} Einheiten.</p>
  </div>` : ''}

  <div class="grid grid--3" style="margin-bottom:16px">
    <div class="metricbox"><p class="metricbox__label">Trainings</p><p class="metricbox__val">${m.totalDone}</p></div>
    <div class="metricbox"><p class="metricbox__label">Bestleistungen</p><p class="metricbox__val">${prCount}</p></div>
    <div class="metricbox"><p class="metricbox__label">Streak</p><p class="metricbox__val">${st} Wo.</p></div>
  </div>

  <div class="card" style="margin-bottom:16px">
    <div class="card__head"><div><p class="card__title">Persönliche Rekorde</p>
      <p class="card__sub">Höchstwert je Übung, verglichen mit dem Start</p></div></div>
    ${pbs.map(p => `<div class="row">
      <span class="avatar avatar--good">${p.gain >= 0 ? '↑' : '↓'}</span>
      <div class="row__main"><p class="row__name">${EXERCISES[p.ex].label}</p>
        <p class="row__meta">${p.start} → ${p.value} ${EXERCISES[p.ex].unit} · zuletzt ${fmtDate(p.date)}</p></div>
      <div class="row__side"><span class="pill ${p.gain >= 0 ? 'pill--good' : 'pill--crit'}">${p.gain >= 0 ? '+' : ''}${p.gain} %</span></div>
    </div>`).join('')}
  </div>

  <div class="card">
    <div class="card__head"><div><p class="card__title">Meilensteine</p>
      <p class="card__sub">Automatisch dokumentiert</p></div></div>
    ${marks.map(x => `<div class="row"><span class="avatar avatar--good">✓</span>
      <div class="row__main"><p class="row__name">${x} Trainings absolviert</p>
        <p class="row__meta">Teil deiner ${daysBetween(c.start, iso(today()))} Tage bei FITARY</p></div></div>`).join('')}
    ${mob > 0 ? `<div class="row"><span class="avatar avatar--good">✓</span>
      <div class="row__main"><p class="row__name">Beweglichkeit um ${mob} Punkte verbessert</p>
        <p class="row__meta">Gemessen an denselben 7 Messpunkten wie beim Erstkontakt</p></div></div>` : ''}
    ${st >= 4 ? `<div class="row"><span class="avatar avatar--good">✓</span>
      <div class="row__main"><p class="row__name">${st} Wochen ohne Trainingslücke</p>
        <p class="row__meta">Regelmäßigkeit schlägt Intensität</p></div></div>` : ''}
    ${!marks.length && mob <= 0 && st < 4 ? '<p class="empty">Deine ersten Meilensteine kommen — sie werden hier automatisch eingetragen.</p>' : ''}
  </div>`;
}

/* ---------- Check-in ---------- */
function portalCheckin(c) {
  const hist = (c.weekly || []).slice().reverse();
  const due = checkinDue(c);

  return `
  ${due ? `<div class="card" style="margin-bottom:16px">
    <div class="card__head"><div><p class="card__title">Wochen-Check-in</p>
      <p class="card__sub">Fünf Fragen, zwei Minuten. Yalcin passt dein Training danach an.</p></div></div>
    ${CHECKIN.map(f => `<div class="field">
      <label>${f.label} <span id="lab_${f.id}" style="color:var(--flame);text-transform:none;letter-spacing:0">3</span> / 5
        <span style="color:var(--ink-3);text-transform:none;letter-spacing:0">${f.good === 1 ? '(1 = wenig Stress)' : '(5 = sehr gut)'}</span></label>
      <input type="range" min="1" max="5" step="1" value="3" id="ci_${f.id}" data-lab="lab_${f.id}" />
    </div>`).join('')}
    <div class="field"><label>Gewicht (optional)</label><input type="number" step="0.1" id="ci_kg" placeholder="kg" /></div>
    <div class="field"><label>Was war diese Woche los?</label><textarea id="ci_note" rows="2" placeholder="Schlafmangel, Stress, Urlaub, Verletzung …"></textarea></div>
    <button class="btn btn--primary" data-act="checkinSave" data-id="${c.id}" style="width:100%;justify-content:center">Check-in absenden</button>
  </div>`
  : `<div class="action action--good" style="margin-bottom:16px"><div class="action__body">
      <p class="action__title">Check-in für diese Woche erledigt</p>
      <p class="action__why">Danke — Yalcin sieht deine Werte. Der nächste ist in ${7 - daysBetween(lastCheckin(c).date, iso(today()))} Tagen dran.</p>
    </div></div>`}

  <div class="card">
    <div class="card__head"><div><p class="card__title">Verlauf</p>
      <p class="card__sub">Deine letzten Check-ins</p></div></div>
    ${hist.length ? hist.slice(0, 8).map(e => `
      <div style="padding:11px 0;border-bottom:1px solid var(--line)">
        <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:7px">
          <span style="font-size:13px;font-weight:600">${fmtDate(e.date)}</span>
          <span class="pill ${checkinScore(e) >= 70 ? 'pill--good' : checkinScore(e) >= 50 ? 'pill--warn' : 'pill--crit'}">${checkinScore(e)} / 100</span>
        </div>
        <div style="display:flex;gap:6px;flex-wrap:wrap">
          ${CHECKIN.map(f => `<span class="pill" style="font-weight:500">${f.label} ${e[f.id]}</span>`).join('')}
          ${e.kg ? `<span class="pill" style="font-weight:500">${e.kg} kg</span>` : ''}
        </div>
        ${e.note ? `<p class="card__sub" style="margin-top:6px">„${e.note}"</p>` : ''}
      </div>`).join('') : '<p class="empty">Noch keine Check-ins.</p>'}
  </div>`;
}

/* ---------- Betreuung ---------- */
function portalCare(c, m) {
  const thread = db.messages.filter(x => x.clientId === c.id && x.status === 'gesendet')
    .slice().sort((a, b) => a.date.localeCompare(b.date));
  const tasks = c.tasks || [];

  return `
  <div class="grid grid--2">
    <div>
      <div class="card">
        <div class="card__head"><div><p class="card__title">Deine Aufgaben diese Woche</p>
          <p class="card__sub">Kurz, machbar, zwischen den Einheiten</p></div>
          <span class="pill ${tasks.every(t => t.done) ? 'pill--good' : 'pill--warn'}">${tasks.filter(t => t.done).length}/${tasks.length}</span></div>
        ${tasks.length ? tasks.map(t => `<div class="row row--click" data-act="task" data-id="${c.id}" data-tid="${t.id}">
          <span class="avatar ${t.done ? 'avatar--good' : ''}">${t.done ? '✓' : '○'}</span>
          <div class="row__main"><p class="row__name" style="${t.done ? 'opacity:.6;text-decoration:line-through' : ''}">${t.text}</p></div>
        </div>`).join('') : '<p class="empty">Aktuell keine Aufgaben.</p>'}
      </div>

      <div class="card" style="margin-top:16px">
        <div class="card__head"><div><p class="card__title">Nachrichten</p>
          <p class="card__sub">1:1 mit deinem Trainer — kein Sammel-Chat</p></div></div>
        ${thread.length ? thread.slice(-8).map(x => `
          <div style="margin-bottom:10px;display:flex;justify-content:${x.from === 'kunde' ? 'flex-end' : 'flex-start'}">
            <div style="max-width:86%;background:${x.from === 'kunde' ? 'var(--flame-dim)' : 'var(--surface-2)'};
              border:1px solid var(--line);border-radius:var(--r-md);padding:11px 13px">
              <p style="font-size:11px;color:var(--ink-3);margin-bottom:4px">${x.from === 'kunde' ? 'Du' : 'Yalcin'} · ${fmtDate(x.date)}</p>
              <p style="font-size:13.5px;white-space:pre-wrap;line-height:1.55">${x.text}</p>
            </div>
          </div>`).join('') : '<p class="empty">Noch keine Nachrichten.</p>'}
        <div class="field" style="margin-top:12px"><textarea id="careText" rows="2" placeholder="Frage an Yalcin …"></textarea></div>
        <button class="btn btn--sm btn--primary" data-act="clientMsg" data-id="${c.id}">Senden</button>
      </div>
    </div>

    <div>
      ${(c.videos || []).length ? `<div class="card">
        <div class="card__head"><div><p class="card__title">Videobotschaften</p>
          <p class="card__sub">${unwatched(c).length ? 'Neu für dich' : 'alle gesehen'}</p></div>
          ${unwatched(c).length ? '<span class="pill pill--flame">neu</span>' : '<span class="pill pill--good">✓</span>'}</div>
        ${c.videos.map(v => `<div class="row">
          <span class="avatar ${v.watched ? 'avatar--good' : 'avatar--risk'}">▶</span>
          <div class="row__main"><p class="row__name">${v.title}</p>
            <p class="row__meta">${VIDEO_KINDS[v.kind]} · ${fmtDate(v.date)}</p></div>
          <div class="row__side"><button class="btn btn--sm ${v.watched ? 'btn--ghost' : 'btn--primary'}" data-act="play" data-id="${c.id}" data-vid="${v.id}">${v.watched ? 'Nochmal' : 'Ansehen'}</button></div>
        </div>`).join('')}
      </div>` : ''}

      <div class="card" style="margin-top:16px">
        <div class="card__head"><div><p class="card__title">Dein Kontingent</p>
          <p class="card__sub">${c.plan}</p></div>
          <span class="pill ${c.credits <= 2 ? 'pill--warn' : 'pill--good'}">${c.credits} offen</span></div>
        ${c.credits <= 2 ? '<p class="card__sub">Fast aufgebraucht — sag Bescheid, damit dein fixer Termin erhalten bleibt.</p>' : ''}
      </div>

      <div class="card" style="margin-top:16px">
        <div class="card__head"><div><p class="card__title">Direkter Draht</p>
          <p class="card__sub">Plobergerstraße 7, 4600 Wels</p></div></div>
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
    case 'dtab':      DTAB = el.dataset.t; openClient(id); break;
    case 'wonew':     closeAll(); workoutModal(id); break;
    case 'bodynew':   closeAll(); bodyModal(id); break;

    case 'woSave': {
      const c = client(id), prog = (c.program || []).length ? c.program : ['squat', 'bench', 'row'];
      const peak = {};
      workoutsOf(c.id).forEach(w => w.exercises.forEach(e => { peak[e.ex] = Math.max(peak[e.ex] || 0, e.weight); }));
      const exercises = prog.map(ex => {
        const weight = parseFloat($('#wo_' + ex + '_w').value) || 0;
        return { ex, weight, reps: parseInt($('#wo_' + ex + '_r').value, 10) || 8,
                 sets: parseInt($('#wo_' + ex + '_s').value, 10) || 3, pr: weight > (peak[ex] || 0) };
      }).filter(e => e.weight > 0);
      if (!exercises.length) { toast('Mindestens eine Übung eintragen'); break; }
      const w = { id: uid('w'), clientId: c.id, date: $('#woDate').value, bookingId: null,
        duration: parseInt($('#woDur').value, 10) || 60, intensity: parseInt($('#woInt').value, 10) || 7,
        exercises, note: $('#woNote').value.trim() };
      db.workouts.push(w);
      const prs = exercises.filter(e => e.pr);
      logEvent('workout', `${c.name}: Training ${fmtDate(w.date)} dokumentiert${prs.length ? ' — ' + prs.length + '× Bestleistung' : ''}`, c.id);
      save(); toast(prs.length ? `Gespeichert · ${prs.length}× Bestleistung` : 'Training gespeichert');
      closeAll(); DTAB = 'training'; openClient(c.id);
      break;
    }

    case 'bodySave': {
      const c = client(id), e = { date: iso(today()) };
      BODY.forEach(f => { const v = parseFloat($('#bd_' + f.id).value); if (!isNaN(v)) e[f.id] = v; });
      c.body = c.body || []; c.body.push(e);
      logEvent('body', `${c.name}: Körpermessung erfasst`, c.id);
      save(); toast('Messung gespeichert'); closeAll(); DTAB = 'progress'; openClient(c.id);
      break;
    }

    case 'noteSave': {
      const c = client(id); c.note = $('#cnote').value;
      save(); toast('Notiz gespeichert');
      break;
    }

    case 'taskadd': {
      const c = client(id), box = $('#taskText'), text = (box ? box.value : '').trim();
      if (!text) { toast('Aufgabe eintragen'); break; }
      c.tasks = c.tasks || [];
      c.tasks.push({ id: uid('t'), text, done: false, week: iso(startOfWeek(today())) });
      logEvent('task', `${c.name}: neue Aufgabe — ${text}`, c.id);
      save(); toast('Aufgabe vergeben'); openClient(c.id);
      break;
    }

    case 'trainerMsg': {
      const c = client(id), box = $('#trainerText'), text = (box ? box.value : '').trim();
      if (!text) { toast('Text eingeben'); break; }
      db.messages.push({ id: uid('m'), clientId: c.id, type: 'trainer', channel: 'App', from: 'trainer',
        text, status: 'gesendet', date: iso(today()) });
      logEvent('message', `Feedback an ${c.name} gesendet`, c.id);
      save(); toast('Gesendet · sichtbar im Kundenzugang'); openClient(c.id);
      break;
    }
    case 'ptab':      PVIEW = el.dataset.t; render(); break;

    case 'task': {
      const c = client(id), t = c.tasks.find(x => x.id === el.dataset.tid);
      t.done = !t.done;
      if (t.done) logEvent('task', `${c.name} hat erledigt: ${t.text}`, c.id);
      save();
      if (PORTAL) render(); else openClient(c.id);
      break;
    }

    case 'clientMsg': {
      const c = client(id), box = $('#careText'), text = (box ? box.value : '').trim();
      if (!text) { toast('Schreib kurz, worum es geht'); break; }
      db.messages.push({ id: uid('m'), clientId: c.id, type: 'kunde', channel: 'App', from: 'kunde',
        text, status: 'gesendet', date: iso(today()) });
      logEvent('message', `Nachricht von ${c.name}: „${text.slice(0, 60)}"`, c.id);
      save(); toast('Gesendet — Yalcin sieht es im Cockpit'); render();
      break;
    }

    case 'checkinSave': {
      const c = client(id), e = { date: iso(today()) };
      CHECKIN.forEach(f => { e[f.id] = parseInt($('#ci_' + f.id).value, 10); });
      const kg = parseFloat($('#ci_kg').value);
      if (!isNaN(kg)) e.kg = kg;
      e.note = $('#ci_note').value.trim();
      c.weekly.push(e);
      const sc = checkinScore(e);
      logEvent('checkin', `${c.name}: Check-in ${sc}/100${e.note ? ' — „' + e.note.slice(0, 50) + '"' : ''}`, c.id);
      save(); toast(`Check-in gespeichert · ${sc}/100`); render();
      break;
    }
    case 'availability': availabilityModal(id); break;

    case 'reqslot': {
      const c = client(id), date = el.dataset.d, time = el.dataset.t;
      if (!slotFree(date, time)) { toast('Der Platz ist gerade vergeben worden'); render(); break; }
      const b = { id: uid('b'), clientId: c.id, date, time, type: c.type, coach: c.coach || 'Yalcin',
        status: 'confirmed', reason: null, reminded: false, via: PORTAL ? 'kunde' : 'studio' };
      db.bookings.push(b);
      draft(c.id, 'confirm', b);
      logEvent('booking', PORTAL
        ? `Terminanfrage über deinen Zugang: ${fmtDate(date)} ${time}`
        : `${c.name}: Termin ${fmtDate(date)} ${time} gebucht`, c.id);
      save(); toast(PORTAL ? 'Angefragt — du bekommst gleich die Bestätigung' : 'Termin gebucht');
      closeAll(); render();
      break;
    }
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
  if (e.target.dataset && e.target.dataset.lab) {
    const lab = $('#' + e.target.dataset.lab);
    if (lab) lab.textContent = e.target.value;
  }
  if (e.target.id === 'fq')     { filter.q = e.target.value; const v = e.target.value; render();
                                  const f = $('#fq'); if (f) { f.focus(); f.value = v; f.setSelectionRange(v.length, v.length); } }
});
document.addEventListener('change', e => {
  if (e.target.id === 'fstage') { filter.stage = e.target.value; render(); }
  if (e.target.id === 'frisk')  { filter.risk  = e.target.value; render(); }
});

$('#quickBook').addEventListener('click', () => PORTAL ? availabilityModal(PORTAL.id) : bookModal());
$('#feedBtn').addEventListener('click', feedModal);
$('#resetDemo').addEventListener('click', () => {
  if (!confirm('Alle lokalen Daten zurücksetzen und Demodaten neu laden?')) return;
  localStorage.removeItem(KEY); db = load(); toast('Demodaten neu geladen'); render();
});
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeAll(); });

render();
