/* LumiLínguas — Registro de idiomas.
 * Cada idioma tem cor, personagem-guia, identidade sonora e variações regionais.
 * Bandeiras aparecem SOMENTE na área dos responsáveis (flag), nunca na área infantil.
 * available=false → pack de conteúdo ainda não instalado; o onboarding mostra
 * o idioma desabilitado com aviso claro (nada de botão falso).
 */
(function (g) {
  'use strict';

  var LANGS = {
    'pt': {
      code: 'pt', name: 'Português (Brasil)', childName: 'Português',
      color: '#2BB673', colorSoft: '#DFF5EA',
      character: { name: 'Tuca', emoji: '🦜', species: 'tucano' },
      tts: ['pt-BR'], flag: '🇧🇷',
      jingle: [523, 659, 784], // identidade sonora curta (Hz)
      variants: null
    },
    'de': {
      code: 'de', name: 'Alemão', childName: 'Deutsch',
      color: '#F4B400', colorSoft: '#FCF0CC',
      character: { name: 'Bruno', emoji: '🐻', species: 'urso' },
      tts: ['de-DE', 'de-AT'], flag: '🇩🇪',
      jingle: [392, 494, 587],
      variants: [
        { id: 'de-DE', label: 'Alemão padrão' },
        { id: 'de-AT', label: 'Alemão austríaco' }
      ]
    },
    'en': {
      code: 'en', name: 'Inglês', childName: 'English',
      color: '#4A6CF7', colorSoft: '#E2E8FE',
      character: { name: 'Finn', emoji: '🦊', species: 'raposa' },
      tts: ['en-GB', 'en-US'], flag: '🇬🇧',
      jingle: [440, 554, 659],
      variants: [
        { id: 'en-GB', label: 'Inglês britânico' },
        { id: 'en-US', label: 'Inglês americano' }
      ]
    },
    'es': {
      code: 'es', name: 'Espanhol', childName: 'Español',
      color: '#E2574C', colorSoft: '#FBE3E1',
      character: { name: 'Lola', emoji: '🦙', species: 'lhama' },
      tts: ['es-ES', 'es-419', 'es-MX'], flag: '🇪🇸',
      jingle: [494, 587, 740],
      variants: [
        { id: 'es-ES', label: 'Espanhol europeu' },
        { id: 'es-419', label: 'Espanhol latino-americano' }
      ]
    },
    'tr': {
      code: 'tr', name: 'Turco', childName: 'Türkçe',
      color: '#00A3A3', colorSoft: '#D6F2F2',
      character: { name: 'Kaya', emoji: '🐰', species: 'coelho' },
      tts: ['tr-TR'], flag: '🇹🇷',
      jingle: [415, 523, 622],
      variants: null
    },
    'fr': {
      code: 'fr', name: 'Francês', childName: 'Français',
      color: '#8E6CF0', colorSoft: '#EAE3FC',
      character: { name: 'Coco', emoji: '🐓', species: 'galo' },
      tts: ['fr-FR'], flag: '🇫🇷',
      jingle: [466, 587, 698],
      variants: null
    },
    'it': {
      code: 'it', name: 'Italiano', childName: 'Italiano',
      color: '#3AAE5C', colorSoft: '#DFF2E5',
      character: { name: 'Gigi', emoji: '🦉', species: 'coruja' },
      tts: ['it-IT'], flag: '🇮🇹',
      jingle: [523, 622, 784],
      variants: null
    },
    'zh': {
      code: 'zh', name: 'Mandarim', childName: '中文',
      color: '#E58B2F', colorSoft: '#FBEBD9',
      character: { name: 'Panpan', emoji: '🐼', species: 'panda' },
      tts: ['zh-CN'], flag: '🇨🇳',
      jingle: [440, 523, 659],
      variants: null,
      romanization: 'pinyin'
    },
    'ja': {
      code: 'ja', name: 'Japonês', childName: 'にほんご',
      color: '#E2648F', colorSoft: '#FBE2EC',
      character: { name: 'Momo', emoji: '🦝', species: 'tanuki' },
      tts: ['ja-JP'], flag: '🇯🇵',
      jingle: [494, 622, 740],
      variants: null,
      romanization: 'romaji'
    }
  };

  var api = {
    all: LANGS,
    codes: Object.keys(LANGS),
    get: function (code) { return LANGS[code] || null; },
    /* Um idioma está disponível quando seu pack de conteúdo está carregado. */
    isAvailable: function (code) {
      var packs = g.LUMI_PACKS || {};
      return !!(LANGS[code] && packs[code] && packs[code].concepts);
    },
    availableCodes: function () {
      return api.codes.filter(api.isAvailable);
    }
  };

  g.LUMI_LANGS = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
