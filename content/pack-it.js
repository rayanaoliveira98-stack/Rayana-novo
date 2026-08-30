/* LumiLínguas — Content pack: Italiano. */
(function (g) {
  'use strict';
  g.LUMI_PACKS = g.LUMI_PACKS || {};
  g.LUMI_PACKS['it'] = { lang: 'it', version: 1, source: 'Pack de demonstração LumiLínguas', concepts: {
    bed:    { word: 'letto', art: 'il letto', pl: 'i letti', adj: 'un letto morbido', act: 'andare a letto', sen: 'Vado a letto.', q: "Dov'è il letto?", a: 'Ecco il letto!', syn: 'lettino', var: null },
    chair:  { word: 'sedia', art: 'la sedia', pl: 'le sedie', adj: 'una sedia grande', act: 'sedersi sulla sedia', sen: 'Mi siedo sulla sedia.', q: "Dov'è la sedia?", a: 'Ecco la sedia!', syn: null, var: null },
    door:   { word: 'porta', art: 'la porta', pl: 'le porte', adj: 'una porta aperta', act: 'aprire la porta', sen: 'Apriamo la porta.', q: "Dov'è la porta?", a: 'Ecco la porta!', syn: null, var: null },
    key:    { word: 'chiave', art: 'la chiave', pl: 'le chiavi', adj: 'una piccola chiave', act: 'girare la chiave', sen: 'La chiave apre la porta.', q: "Dov'è la chiave?", a: 'Ecco la chiave!', syn: null, var: null },
    spoon:  { word: 'cucchiaio', art: 'il cucchiaio', pl: 'i cucchiai', adj: 'un cucchiaio grande', act: 'mangiare col cucchiaio', sen: 'Mangio col cucchiaio.', q: "Dov'è il cucchiaio?", a: 'Il cucchiaio è sul tavolo!', syn: null, var: null },
    ball:   { word: 'palla', art: 'la palla', pl: 'le palle', adj: 'una palla rossa', act: 'giocare a palla', sen: 'Voglio giocare a palla.', q: "Dov'è la palla?", a: 'Ecco la palla!', syn: 'pallone', var: null },
    book:   { word: 'libro', art: 'il libro', pl: 'i libri', adj: 'un libro colorato', act: 'leggere un libro', sen: 'Leggiamo un libro.', q: "Dov'è il libro?", a: 'Ecco il libro!', syn: null, var: null },
    soap:   { word: 'sapone', art: 'il sapone', pl: 'i saponi', adj: 'un sapone profumato', act: 'lavarsi le mani', sen: 'Mi lavo le mani con il sapone.', q: "Dov'è il sapone?", a: 'Il sapone è in bagno!', syn: null, var: null },
    mom:    { word: 'mamma', art: 'la mamma', pl: null, adj: 'mamma cara', act: 'abbracciare la mamma', sen: 'Amo la mia mamma.', q: "Dov'è la mamma?", a: 'La mamma è qui!', syn: null, var: null },
    dad:    { word: 'papà', art: 'il papà', pl: null, adj: 'papà caro', act: 'abbracciare il papà', sen: 'Amo il mio papà.', q: "Dov'è il papà?", a: 'Il papà è qui!', syn: null, var: null },
    baby:   { word: 'bebè', art: 'il bebè', pl: 'i bebè', adj: 'un bebè piccolino', act: 'cullare il bebè', sen: 'Il bebè dorme.', q: "Dov'è il bebè?", a: 'Il bebè è qui!', syn: 'bimbo', var: null },
    hand:   { word: 'mano', art: 'la mano', pl: 'le mani', adj: 'una mano pulita', act: 'battere le mani', sen: 'Mi lavo le mani.', q: "Dov'è la tua mano?", a: 'Ecco la mia mano!', syn: 'manina', var: null },
    nose:   { word: 'naso', art: 'il naso', pl: 'i nasi', adj: 'un naso piccolo', act: 'toccarsi il naso', sen: 'Questo è il mio naso.', q: "Dov'è il tuo naso?", a: 'Ecco il mio naso!', syn: 'nasino', var: null },
    eyes:   { word: 'occhio', art: "l'occhio", pl: 'gli occhi', adj: 'occhi grandi', act: 'chiudere gli occhi', sen: 'Chiudo gli occhi.', q: 'Dove sono i tuoi occhi?', a: 'Ecco i miei occhi!', syn: null, var: null },
    apple:  { word: 'mela', art: 'la mela', pl: 'le mele', adj: 'una mela rossa', act: 'mangiare una mela', sen: 'Voglio una mela.', q: "Dov'è la mela?", a: 'Ecco la mela!', syn: null, var: null },
    banana: { word: 'banana', art: 'la banana', pl: 'le banane', adj: 'una banana gialla', act: 'sbucciare la banana', sen: 'Mi piacciono le banane.', q: "Dov'è la banana?", a: 'Ecco la banana!', syn: null, var: null },
    water:  { word: 'acqua', art: "l'acqua", pl: null, adj: 'acqua fresca', act: 'bere acqua', sen: "Voglio bere l'acqua.", q: "Dov'è l'acqua?", a: "L'acqua è nel bicchiere!", syn: null, var: null },
    milk:   { word: 'latte', art: 'il latte', pl: null, adj: 'latte caldo', act: 'bere il latte', sen: 'Bevo il latte al mattino.', q: "Dov'è il latte?", a: 'Il latte è nel bicchiere!', syn: null, var: null },
    bread:  { word: 'pane', art: 'il pane', pl: null, adj: 'pane caldo', act: 'mangiare il pane', sen: 'Voglio pane e burro.', q: "Dov'è il pane?", a: 'Il pane è sul tavolo!', syn: 'panino', var: null },
    red:    { word: 'rosso', art: null, pl: null, adj: 'una palla rossa', act: 'colorare di rosso', sen: 'La mela è rossa.', q: "Cos'è rosso?", a: 'La mela è rossa!', syn: null, var: null },
    blue:   { word: 'blu', art: null, pl: null, adj: 'il cielo blu', act: 'colorare di blu', sen: 'Il cielo è blu.', q: "Cos'è blu?", a: 'Il cielo è blu!', syn: 'azzurro', var: null },
    three:  { word: 'tre', art: null, pl: null, adj: 'tre mele', act: 'contare fino a tre', sen: 'Uno, due, tre!', q: 'Quanti sono?', a: 'Sono tre!', syn: null, var: null },
    dog:    { word: 'cane', art: 'il cane', pl: 'i cani', adj: 'un cane morbido', act: 'accarezzare il cane', sen: 'Il cane fa bau-bau.', q: "Dov'è il cane?", a: 'Ecco il cane!', syn: 'cagnolino', var: null },
    cat:    { word: 'gatto', art: 'il gatto', pl: 'i gatti', adj: 'un gatto morbido', act: 'accarezzare il gatto', sen: 'Il gatto fa miao.', q: "Dov'è il gatto?", a: 'Ecco il gatto!', syn: 'micio', var: null },
    bird:   { word: 'uccellino', art: "l'uccellino", pl: 'gli uccellini', adj: 'un uccellino blu', act: "ascoltare l'uccellino", sen: "L'uccellino canta.", q: "Dov'è l'uccellino?", a: "L'uccellino è sull'albero!", syn: null, var: null },
    fish:   { word: 'pesce', art: 'il pesce', pl: 'i pesci', adj: 'un pesce colorato', act: 'guardare il pesce', sen: "Il pesce nuota nell'acqua.", q: "Dov'è il pesce?", a: "Il pesce è nell'acqua!", syn: 'pesciolino', var: null },
    tree:   { word: 'albero', art: "l'albero", pl: 'gli alberi', adj: 'un albero grande', act: "guardare l'albero", sen: "L'albero è grande.", q: "Dov'è l'albero?", a: "L'albero è nel parco!", syn: null, var: null },
    flower: { word: 'fiore', art: 'il fiore', pl: 'i fiori', adj: 'un bel fiore', act: 'annusare il fiore', sen: 'Il fiore è bello.', q: "Dov'è il fiore?", a: 'Il fiore è in giardino!', syn: 'fiorellino', var: null },
    shoe:   { word: 'scarpa', art: 'la scarpa', pl: 'le scarpe', adj: 'scarpe nuove', act: 'mettersi le scarpe', sen: 'Mi metto le scarpe.', q: "Dov'è la scarpa?", a: 'Ecco la scarpa!', syn: 'scarpina', var: null },
    hat:    { word: 'cappello', art: 'il cappello', pl: 'i cappelli', adj: 'un cappello da sole', act: 'mettersi il cappello', sen: 'Mi metto il cappello.', q: "Dov'è il cappello?", a: 'Il cappello è sulla testa!', syn: 'cappellino', var: null },
    sun:    { word: 'sole', art: 'il sole', pl: null, adj: 'il sole caldo', act: 'giocare al sole', sen: 'Il sole splende.', q: "Dov'è il sole?", a: 'Il sole è nel cielo!', syn: null, var: null },
    rain:   { word: 'pioggia', art: 'la pioggia', pl: null, adj: 'una pioggia leggera', act: 'ascoltare la pioggia', sen: 'Piove!', q: 'Cosa cade dal cielo?', a: 'La pioggia!', syn: null, var: null },
    car:    { word: 'macchina', art: 'la macchina', pl: 'le macchine', adj: 'una macchina rossa', act: 'andare in macchina', sen: 'Andiamo in macchina.', q: "Dov'è la macchina?", a: 'Ecco la macchina!', syn: 'auto', var: null },
    bus:    { word: 'autobus', art: "l'autobus", pl: 'gli autobus', adj: 'un autobus grande', act: "prendere l'autobus", sen: "L'autobus è grande.", q: "Dov'è l'autobus?", a: "Ecco l'autobus!", syn: null, var: null },
    sleep:  { word: 'dormire', art: null, pl: null, adj: 'dormire bene', act: 'ora di dormire', sen: 'Vado a dormire.', q: 'Chi dorme?', a: 'Il bebè dorme!', syn: 'fare la nanna', var: null },
    happy:  { word: 'felice', art: null, pl: null, adj: 'un bambino felice', act: 'essere felice', sen: 'Sono felice!', q: 'Sei felice?', a: 'Sì, sono felice!', syn: 'contento', var: null }
  } };
  if (typeof module !== 'undefined' && module.exports) module.exports = g.LUMI_PACKS['it'];
})(typeof window !== 'undefined' ? window : globalThis);
