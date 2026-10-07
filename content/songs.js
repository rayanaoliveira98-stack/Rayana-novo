/* LumiLínguas — Melodias conhecidas, para ancorar vocabulário.
 * ============================================================================
 * POR QUE ISTO EXISTE
 *
 * A criança já sabe uma melodia. Quando as palavras novas chegam montadas
 * nela, ela não precisa segurar duas coisas ao mesmo tempo: a melodia já está
 * na cabeça e sobra atenção para a língua. É a ponte mais barata que existe
 * entre o que ela conhece e o que ela está aprendendo.
 *
 * O truque está na escolha: as duas melodias abaixo são as MESMAS nos nove
 * idiomas, com letras próprias e antigas em cada um. Uma criança brasileira
 * que canta "Brilha, brilha, estrelinha" reconhece a melodia no alemão
 * "Morgen kommt der Weihnachtsmann" no primeiro compasso — e é aí que a
 * associação acontece.
 *
 * DIREITOS — a regra que define o que entra aqui
 *
 * Só entram melodias velhas o bastante para serem de domínio público, e o app
 * SINTETIZA as notas (Web Audio) em vez de tocar gravação. Isso importa: a
 * melodia e a letra tradicional são livres, mas ARRANJOS e GRAVAÇÕES modernas
 * continuam protegidos. Por isso aqui não há áudio de terceiros — há uma
 * sequência de notas escrita neste arquivo.
 *
 * Nada de "Baby Shark" e afins: a melodia pode ser tradicional, mas a versão
 * que a criança conhece é um arranjo protegido. Fora.
 *
 * `verificado: false` marca o título que ainda não foi conferido por um
 * falante nativo. O app não mostra o que não está verificado — ver
 * `tituloPara()` abaixo. É a mesma regra dos packs: nada de conteúdo
 * inventado passando por conteúdo revisado.
 * ========================================================================== */
(function (g) {
  'use strict';

  /* Dó maior, uma oitava e meia. Hz. */
  var N = {
    C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23,
    G4: 392.00, A4: 440.00, B4: 493.88, C5: 523.25, D5: 587.33
  };

  /* Cada nota é [frequência, tempos]. 1 tempo ≈ uma semínima. */
  var MELODIAS = {
    /* "Ah! vous dirai-je, maman" — impressa em Paris em 1761, origem anônima.
     * É a melodia de Twinkle Twinkle, do ABC e de Baa Baa Black Sheep, e a
     * mesma que Mozart usou nas variações K. 265. Domínio público. */
    estrela: {
      id: 'estrela',
      origem: 'Ah! vous dirai-je, maman (França, impressa em 1761)',
      dominioPublico: true,
      andamento: 0.46,                 // segundos por tempo
      frase: [
        [N.C4, 1], [N.C4, 1], [N.G4, 1], [N.G4, 1],
        [N.A4, 1], [N.A4, 1], [N.G4, 2],
        [N.F4, 1], [N.F4, 1], [N.E4, 1], [N.E4, 1],
        [N.D4, 1], [N.D4, 1], [N.C4, 2]
      ],
      /* Os títulos tradicionais em cada idioma. Mesma melodia, letra própria. */
      titulos: {
        pt: { titulo: 'Brilha, brilha, estrelinha', verificado: true },
        en: { titulo: 'Twinkle, Twinkle, Little Star', verificado: true },
        de: { titulo: 'Morgen kommt der Weihnachtsmann', verificado: true },
        es: { titulo: 'Brilla, brilla, estrellita', verificado: true },
        fr: { titulo: 'Ah ! vous dirai-je, maman', verificado: true },
        it: { titulo: 'Brilla, brilla, piccola stella', verificado: true },
        tr: { titulo: 'Daha Dün Annemizin', verificado: true },
        /* Títulos consagrados, mas ainda sem conferência de falante nativo. */
        zh: { titulo: '小星星', verificado: false },
        ja: { titulo: 'きらきら星', verificado: false }
      }
    },

    /* "Frère Jacques" — cânone francês do século XVIII, de autoria desconhecida
     * (manuscrito por volta de 1780, publicado em 1811). Domínio público. */
    irmao: {
      id: 'irmao',
      origem: 'Frère Jacques (França, séc. XVIII)',
      dominioPublico: true,
      andamento: 0.42,
      frase: [
        [N.C4, 1], [N.D4, 1], [N.E4, 1], [N.C4, 1],
        [N.C4, 1], [N.D4, 1], [N.E4, 1], [N.C4, 1],
        [N.E4, 1], [N.F4, 1], [N.G4, 2],
        [N.E4, 1], [N.F4, 1], [N.G4, 2]
      ],
      titulos: {
        pt: { titulo: 'Frei João', verificado: true },
        en: { titulo: 'Are You Sleeping (Brother John)', verificado: true },
        de: { titulo: 'Bruder Jakob', verificado: true },
        es: { titulo: 'Martinillo', verificado: true },
        fr: { titulo: 'Frère Jacques', verificado: true },
        it: { titulo: 'Fra Martino', verificado: true },
        tr: { titulo: 'Tembel Çocuk', verificado: false },
        zh: { titulo: '两只老虎', verificado: false },
        ja: { titulo: 'グーチョキパーでなにつくろう', verificado: false }
      }
    }
  };

  var ORDEM = ['estrela', 'irmao'];

  var api = {
    MELODIAS: MELODIAS,
    ids: ORDEM,

    get: function (id) { return MELODIAS[id] || null; },

    /* A melodia do dia, em rodízio — nunca dois dias seguidos com a mesma. */
    forDay: function (day) {
      return MELODIAS[ORDEM[((day || 1) - 1) % ORDEM.length]];
    },

    /* O título tradicional naquele idioma, SE estiver verificado.
     * Sem verificação devolve null, e a atividade toca só a melodia: melhor
     * uma melodia sem nome do que um nome possivelmente errado dito em voz
     * alta para uma criança que está aprendendo aquela língua. */
    tituloPara: function (melodia, lang) {
      var t = melodia && melodia.titulos && melodia.titulos[lang];
      return t && t.verificado ? t.titulo : null;
    },

    /* Em quantos idiomas esta melodia já pode ser anunciada pelo nome. */
    idiomasVerificados: function (id) {
      var m = MELODIAS[id];
      if (!m) return [];
      return Object.keys(m.titulos).filter(function (l) { return m.titulos[l].verificado; });
    }
  };

  g.LUMI_SONGS = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
