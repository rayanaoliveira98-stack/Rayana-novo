/* LumiLínguas — Currículo de 60 dias.
 * Define os conceitos (independentes de idioma) e a jornada semanal.
 * Cada conceito tem imagem principal + imagens alternativas (a criança
 * aprende o CONCEITO, não uma única foto).
 * As traduções ficam nos packs de idioma (content/pack-XX.js).
 */
(function (g) {
  'use strict';

  var WEEKS = [
    { days: [1, 7],   themeId: 'home',     title: 'Objetos da casa e rotina' },
    { days: [8, 14],  themeId: 'family',   title: 'Família, corpo e sentidos' },
    { days: [15, 21], themeId: 'food',     title: 'Alimentos, bebidas, cores e números' },
    { days: [22, 28], themeId: 'animals',  title: 'Animais e natureza' },
    { days: [29, 35], themeId: 'clothes',  title: 'Roupas, clima e estações' },
    { days: [36, 42], themeId: 'places',   title: 'Veículos, lugares e segurança' },
    { days: [43, 49], themeId: 'actions',  title: 'Ações, emoções, posições e opostos' },
    { days: [50, 56], themeId: 'dialogs',  title: 'Perguntas, respostas e pequenos diálogos' },
    { days: [57, 60], themeId: 'review',   title: 'Revisão geral, desafios e apresentação final' }
  ];

  /* type: noun | color | number | action | emotion
   * scene: emoji do cenário usado em "encontre o objeto". */
  var CONCEPTS = [
    // ——— Semana 1: casa e rotina ———
    { id: 'bed',    theme: 'home', day: 1, type: 'noun', emoji: '🛏️', alts: ['🛌', '🏕️'], scene: '🏠' },
    { id: 'chair',  theme: 'home', day: 1, type: 'noun', emoji: '🪑', alts: ['💺', '🛋️'], scene: '🏠' },
    { id: 'door',   theme: 'home', day: 2, type: 'noun', emoji: '🚪', alts: ['🏠', '🔓'], scene: '🏠' },
    { id: 'key',    theme: 'home', day: 3, type: 'noun', emoji: '🔑', alts: ['🗝️', '🔐'], scene: '🏠' },
    { id: 'spoon',  theme: 'home', day: 4, type: 'noun', emoji: '🥄', alts: ['🍽️', '🍲'], scene: '🍽️' },
    { id: 'ball',   theme: 'home', day: 5, type: 'noun', emoji: '⚽', alts: ['🏀', '🎾'], scene: '🧸' },
    { id: 'book',   theme: 'home', day: 6, type: 'noun', emoji: '📖', alts: ['📚', '📕'], scene: '🛏️' },
    { id: 'soap',   theme: 'home', day: 7, type: 'noun', emoji: '🧼', alts: ['🫧', '🛁'], scene: '🛁' },

    // ——— Semana 2: família, corpo e sentidos ———
    { id: 'mom',    theme: 'family', day: 8,  type: 'noun', emoji: '👩', alts: ['👩🏽', '👩🏿'], scene: '👨‍👩‍👧' },
    { id: 'dad',    theme: 'family', day: 9,  type: 'noun', emoji: '👨', alts: ['👨🏽', '👨🏿'], scene: '👨‍👩‍👧' },
    { id: 'baby',   theme: 'family', day: 10, type: 'noun', emoji: '👶', alts: ['👶🏽', '🍼'], scene: '👨‍👩‍👧' },
    { id: 'hand',   theme: 'family', day: 11, type: 'noun', emoji: '✋', alts: ['🤚', '👏'], scene: '🧒' },
    { id: 'nose',   theme: 'family', day: 12, type: 'noun', emoji: '👃', alts: ['👃🏽', '🤧'], scene: '🧒' },
    { id: 'eyes',   theme: 'family', day: 13, type: 'noun', emoji: '👀', alts: ['👁️', '😊'], scene: '🧒' },

    // ——— Semana 3: alimentos, cores e números ———
    { id: 'apple',  theme: 'food', day: 15, type: 'noun', emoji: '🍎', alts: ['🍏', '🍎'], scene: '🍽️' },
    { id: 'banana', theme: 'food', day: 16, type: 'noun', emoji: '🍌', alts: ['🍌', '🐒'], scene: '🍽️' },
    { id: 'water',  theme: 'food', day: 17, type: 'noun', emoji: '💧', alts: ['🚰', '🌊'], scene: '🍽️' },
    { id: 'milk',   theme: 'food', day: 18, type: 'noun', emoji: '🥛', alts: ['🍼', '🐄'], scene: '🍽️' },
    { id: 'bread',  theme: 'food', day: 19, type: 'noun', emoji: '🍞', alts: ['🥖', '🥐'], scene: '🍽️' },
    { id: 'red',    theme: 'food', day: 20, type: 'color', emoji: '🔴', alts: ['🍎', '🚗'], scene: '🎨' },
    { id: 'blue',   theme: 'food', day: 20, type: 'color', emoji: '🔵', alts: ['💙', '🐳'], scene: '🎨' },
    { id: 'three',  theme: 'food', day: 21, type: 'number', emoji: '3️⃣', alts: ['🍎🍎🍎', '🎈🎈🎈'], scene: '🎨' },

    // ——— Semana 4: animais e natureza ———
    { id: 'dog',    theme: 'animals', day: 22, type: 'noun', emoji: '🐶', alts: ['🐕', '🦮'], scene: '🌳' },
    { id: 'cat',    theme: 'animals', day: 23, type: 'noun', emoji: '🐱', alts: ['🐈', '🐈‍⬛'], scene: '🏠' },
    { id: 'bird',   theme: 'animals', day: 24, type: 'noun', emoji: '🐦', alts: ['🦜', '🐤'], scene: '🌳' },
    { id: 'fish',   theme: 'animals', day: 25, type: 'noun', emoji: '🐟', alts: ['🐠', '🐡'], scene: '🌊' },
    { id: 'tree',   theme: 'animals', day: 26, type: 'noun', emoji: '🌳', alts: ['🌲', '🌴'], scene: '🌳' },
    { id: 'flower', theme: 'animals', day: 27, type: 'noun', emoji: '🌸', alts: ['🌻', '🌷'], scene: '🌳' },

    // ——— Semana 5: roupas e clima ———
    { id: 'shoe',   theme: 'clothes', day: 29, type: 'noun', emoji: '👟', alts: ['👞', '🥾'], scene: '🧒' },
    { id: 'hat',    theme: 'clothes', day: 30, type: 'noun', emoji: '🧢', alts: ['👒', '🎩'], scene: '🧒' },
    { id: 'sun',    theme: 'clothes', day: 31, type: 'noun', emoji: '☀️', alts: ['🌞', '🌅'], scene: '🌳' },
    { id: 'rain',   theme: 'clothes', day: 32, type: 'noun', emoji: '🌧️', alts: ['☔', '💦'], scene: '🌳' },

    // ——— Semana 6: veículos e lugares ———
    { id: 'car',    theme: 'places', day: 36, type: 'noun', emoji: '🚗', alts: ['🚙', '🚕'], scene: '🛣️' },
    { id: 'bus',    theme: 'places', day: 37, type: 'noun', emoji: '🚌', alts: ['🚍', '🚏'], scene: '🛣️' },

    // ——— Semana 7: ações e emoções ———
    { id: 'sleep',  theme: 'actions', day: 43, type: 'action',  emoji: '😴', alts: ['🛌', '🌙'], scene: '🛏️' },
    { id: 'happy',  theme: 'actions', day: 44, type: 'emotion', emoji: '😊', alts: ['😄', '🥳'], scene: '🧒' }
  ];

  var byId = {};
  CONCEPTS.forEach(function (c) { byId[c.id] = c; });

  var api = {
    weeks: WEEKS,
    concepts: CONCEPTS,
    get: function (id) { return byId[id] || null; },
    /* Conceitos programados até um dia da jornada (inclusive), em ordem. */
    upToDay: function (day) {
      return CONCEPTS.filter(function (c) { return c.day <= day; });
    },
    forDay: function (day) {
      return CONCEPTS.filter(function (c) { return c.day === day; });
    },
    weekForDay: function (day) {
      for (var i = 0; i < WEEKS.length; i++) {
        if (day >= WEEKS[i].days[0] && day <= WEEKS[i].days[1]) return WEEKS[i];
      }
      return WEEKS[WEEKS.length - 1];
    }
  };

  g.LUMI_CURRICULUM = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
