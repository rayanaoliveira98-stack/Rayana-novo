/* LumiLínguas — Persistência local (localStorage) com armazenamento injetável
 * para testes. Coleta mínima: tudo fica no aparelho; exportação e exclusão
 * total disponíveis na área dos responsáveis (GDPR-K).
 */
(function (g) {
  'use strict';

  var KEY = 'lumilinguas.v1';

  function memoryStorage() {
    var m = {};
    return {
      getItem: function (k) { return Object.prototype.hasOwnProperty.call(m, k) ? m[k] : null; },
      setItem: function (k, v) { m[k] = String(v); },
      removeItem: function (k) { delete m[k]; }
    };
  }

  function createStore(storage) {
    storage = storage || (typeof localStorage !== 'undefined' ? localStorage : memoryStorage());

    function blank() {
      return {
        version: 1,
        parent: { pin: null, consent: null },
        profiles: {},
        progress: {},   // profileId -> lang -> conceptId -> registro SRS
        sessions: {},   // profileId -> [resumo de sessão]
        activeProfile: null
      };
    }

    function load() {
      try {
        var raw = storage.getItem(KEY);
        if (!raw) return blank();
        var data = JSON.parse(raw);
        return data && data.version === 1 ? data : blank();
      } catch (e) { return blank(); }
    }

    function save(data) {
      storage.setItem(KEY, JSON.stringify(data));
      return data;
    }

    var api = {
      load: load,
      save: save,

      newProfileId: function (data) {
        var n = Object.keys(data.profiles).length + 1;
        var id;
        do { id = 'p' + n; n++; } while (data.profiles[id]);
        return id;
      },

      addProfile: function (data, profile) {
        var id = api.newProfileId(data);
        profile.id = id;
        profile.createdAt = profile.createdAt || 0;
        profile.journeyDay = profile.journeyDay || 1;
        profile.stickers = profile.stickers || [];
        profile.outfit = profile.outfit || [];
        data.profiles[id] = profile;
        data.progress[id] = data.progress[id] || {};
        data.sessions[id] = data.sessions[id] || [];
        if (!data.activeProfile) data.activeProfile = id;
        return id;
      },

      records: function (data, profileId, lang) {
        data.progress[profileId] = data.progress[profileId] || {};
        data.progress[profileId][lang] = data.progress[profileId][lang] || {};
        return data.progress[profileId][lang];
      },

      recordsByLang: function (data, profileId) {
        var out = {};
        var p = data.profiles[profileId];
        if (!p) return out;
        p.langs.forEach(function (l) { out[l] = api.records(data, profileId, l); });
        return out;
      },

      logSession: function (data, profileId, summary) {
        data.sessions[profileId] = data.sessions[profileId] || [];
        data.sessions[profileId].push(summary);
        // Guarda no máximo 90 sessões por perfil.
        if (data.sessions[profileId].length > 90) data.sessions[profileId].shift();
      },

      /* Exportação completa dos dados de um perfil (direito de portabilidade). */
      exportProfile: function (data, profileId) {
        return JSON.stringify({
          exportedAt: new Date().toISOString(),
          profile: data.profiles[profileId] || null,
          progress: data.progress[profileId] || {},
          sessions: data.sessions[profileId] || []
        }, null, 2);
      },

      /* Exclusão total de um perfil (direito ao esquecimento). */
      deleteProfile: function (data, profileId) {
        delete data.profiles[profileId];
        delete data.progress[profileId];
        delete data.sessions[profileId];
        if (data.activeProfile === profileId) {
          var rest = Object.keys(data.profiles);
          data.activeProfile = rest.length ? rest[0] : null;
        }
      },

      /* Apaga absolutamente tudo. */
      wipeAll: function () { storage.removeItem(KEY); },

      _storageKey: KEY
    };
    return api;
  }

  var api = { createStore: createStore, memoryStorage: memoryStorage };
  g.LUMI_STORE = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
