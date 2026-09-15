/* LumiLínguas — Content pack: にほんご (japonês, escrita infantil kana; rom = rōmaji).
 * Sem artigos/plural gramatical. */
(function (g) {
  'use strict';
  g.LUMI_PACKS = g.LUMI_PACKS || {};
  g.LUMI_PACKS['ja'] = { lang: 'ja', version: 1, source: 'Pack de demonstração LumiLínguas', concepts: {
    bed:    { word: 'ベッド', rom: 'beddo', art: null, pl: null, adj: 'ふかふかのベッド', act: 'ベッドにいく', sen: 'ベッドにいくよ。', q: 'ベッドはどこ？', a: 'ベッドはここ！', syn: 'おふとん (o-futon)', var: null },
    chair:  { word: 'いす', rom: 'isu', art: null, pl: null, adj: 'おおきいいす', act: 'いすにすわる', sen: 'いすにすわるよ。', q: 'いすはどこ？', a: 'いすはここ！', syn: null, var: null },
    door:   { word: 'ドア', rom: 'doa', art: null, pl: null, adj: 'あいているドア', act: 'ドアをあける', sen: 'ドアをあけよう。', q: 'ドアはどこ？', a: 'ドアはあそこ！', syn: 'とびら (tobira)', var: null },
    key:    { word: 'かぎ', rom: 'kagi', art: null, pl: null, adj: 'ちいさいかぎ', act: 'かぎをまわす', sen: 'かぎでドアがあくよ。', q: 'かぎはどこ？', a: 'かぎはここ！', syn: null, var: null },
    spoon:  { word: 'スプーン', rom: 'supūn', art: null, pl: null, adj: 'おおきいスプーン', act: 'スプーンでたべる', sen: 'スプーンでたべるよ。', q: 'スプーンはどこ？', a: 'スプーンはテーブルのうえ！', syn: null, var: null },
    ball:   { word: 'ボール', rom: 'bōru', art: null, pl: null, adj: 'あかいボール', act: 'ボールであそぶ', sen: 'ボールであそびたい！', q: 'ボールはどこ？', a: 'ボールはここ！', syn: null, var: null },
    book:   { word: 'ほん', rom: 'hon', art: null, pl: null, adj: 'カラフルなほん', act: 'ほんをよむ', sen: 'ほんをよもう。', q: 'ほんはどこ？', a: 'ほんはここ！', syn: 'えほん (ehon)', var: null },
    soap:   { word: 'せっけん', rom: 'sekken', art: null, pl: null, adj: 'あわあわのせっけん', act: 'てをあらう', sen: 'せっけんでてをあらうよ。', q: 'せっけんはどこ？', a: 'せっけんはおふろば！', syn: null, var: null },
    mom:    { word: 'ママ', rom: 'mama', art: null, pl: null, adj: 'だいすきなママ', act: 'ママにぎゅっとする', sen: 'ママがだいすき。', q: 'ママはどこ？', a: 'ママはここ！', syn: 'おかあさん (okāsan)', var: null },
    dad:    { word: 'パパ', rom: 'papa', art: null, pl: null, adj: 'だいすきなパパ', act: 'パパにぎゅっとする', sen: 'パパがだいすき。', q: 'パパはどこ？', a: 'パパはここ！', syn: 'おとうさん (otōsan)', var: null },
    baby:   { word: 'あかちゃん', rom: 'akachan', art: null, pl: null, adj: 'ちいさいあかちゃん', act: 'あかちゃんをだっこする', sen: 'あかちゃんがねている。', q: 'あかちゃんはどこ？', a: 'あかちゃんはここ！', syn: null, var: null },
    hand:   { word: 'て', rom: 'te', art: null, pl: null, adj: 'きれいなて', act: 'パチパチする', sen: 'てをあらうよ。', q: 'てはどこ？', a: 'てはここ！', syn: 'おてて (otete)', var: null },
    nose:   { word: 'はな', rom: 'hana', art: null, pl: null, adj: 'ちいさいはな', act: 'はなをさわる', sen: 'これはわたしのはな。', q: 'はなはどこ？', a: 'はなはここ！', syn: 'おはな (ohana)', var: null },
    eyes:   { word: 'め', rom: 'me', art: null, pl: null, adj: 'おおきいめ', act: 'めをつぶる', sen: 'めをつぶるよ。', q: 'めはどこ？', a: 'めはここ！', syn: 'おめめ (omeme)', var: null },
    apple:  { word: 'りんご', rom: 'ringo', art: null, pl: null, adj: 'あかいりんご', act: 'りんごをたべる', sen: 'りんごがほしい。', q: 'りんごはどこ？', a: 'りんごはここ！', syn: null, var: null },
    banana: { word: 'バナナ', rom: 'banana', art: null, pl: null, adj: 'きいろいバナナ', act: 'バナナをむく', sen: 'バナナがすき。', q: 'バナナはどこ？', a: 'バナナはここ！', syn: null, var: null },
    water:  { word: 'おみず', rom: 'omizu', art: null, pl: null, adj: 'つめたいおみず', act: 'おみずをのむ', sen: 'おみずがのみたい。', q: 'おみずはどこ？', a: 'おみずはコップのなか！', syn: null, var: null },
    milk:   { word: 'ぎゅうにゅう', rom: 'gyūnyū', art: null, pl: null, adj: 'あたたかいぎゅうにゅう', act: 'ぎゅうにゅうをのむ', sen: 'あさ、ぎゅうにゅうをのむよ。', q: 'ぎゅうにゅうはどこ？', a: 'ぎゅうにゅうはコップのなか！', syn: 'ミルク (miruku)', var: null },
    bread:  { word: 'パン', rom: 'pan', art: null, pl: null, adj: 'あたたかいパン', act: 'パンをたべる', sen: 'バターパンがたべたい。', q: 'パンはどこ？', a: 'パンはテーブルのうえ！', syn: null, var: null },
    red:    { word: 'あか', rom: 'aka', art: null, pl: null, adj: 'あかいボール', act: 'あかくぬる', sen: 'りんごはあかいよ。', q: 'あかいのはどれ？', a: 'りんごがあかい！', syn: null, var: null },
    blue:   { word: 'あお', rom: 'ao', art: null, pl: null, adj: 'あおいそら', act: 'あおくぬる', sen: 'そらはあおいよ。', q: 'あおいのはどれ？', a: 'そらがあおい！', syn: null, var: null },
    three:  { word: 'さん', rom: 'san', art: null, pl: null, adj: 'りんごがみっつ', act: 'さんまでかぞえる', sen: 'いち、に、さん！', q: 'いくつある？', a: 'みっつある！', syn: 'みっつ (mittsu)', var: null },
    dog:    { word: 'いぬ', rom: 'inu', art: null, pl: null, adj: 'ふわふわのいぬ', act: 'いぬをなでる', sen: 'いぬはワンワン。', q: 'いぬはどこ？', a: 'いぬはここ！', syn: 'ワンワン (wanwan)', var: null },
    cat:    { word: 'ねこ', rom: 'neko', art: null, pl: null, adj: 'やわらかいねこ', act: 'ねこをなでる', sen: 'ねこはニャーニャー。', q: 'ねこはどこ？', a: 'ねこはここ！', syn: 'ニャンニャン (nyannyan)', var: null },
    bird:   { word: 'とり', rom: 'tori', art: null, pl: null, adj: 'あおいとり', act: 'とりのうたをきく', sen: 'とりがうたっているよ。', q: 'とりはどこ？', a: 'とりはきのうえ！', syn: 'ことり (kotori)', var: null },
    fish:   { word: 'さかな', rom: 'sakana', art: null, pl: null, adj: 'カラフルなさかな', act: 'さかなをみる', sen: 'さかながみずのなかでおよぐよ。', q: 'さかなはどこ？', a: 'さかなはみずのなか！', syn: 'おさかな (osakana)', var: null },
    tree:   { word: 'き', rom: 'ki', art: null, pl: null, adj: 'おおきいき', act: 'きをみる', sen: 'きはおおきいね。', q: 'きはどこ？', a: 'きはこうえん！', syn: null, var: null },
    flower: { word: 'おはな', rom: 'ohana', art: null, pl: null, adj: 'きれいなおはな', act: 'おはなのにおいをかぐ', sen: 'おはなはきれいだね。', q: 'おはなはどこ？', a: 'おはなはおにわ！', syn: null, var: null },
    shoe:   { word: 'くつ', rom: 'kutsu', art: null, pl: null, adj: 'あたらしいくつ', act: 'くつをはく', sen: 'くつをはくよ。', q: 'くつはどこ？', a: 'くつはここ！', syn: null, var: null },
    hat:    { word: 'ぼうし', rom: 'bōshi', art: null, pl: null, adj: 'かわいいぼうし', act: 'ぼうしをかぶる', sen: 'ぼうしをかぶるよ。', q: 'ぼうしはどこ？', a: 'ぼうしはあたまのうえ！', syn: null, var: null },
    sun:    { word: 'たいよう', rom: 'taiyō', art: null, pl: null, adj: 'あたたかいたいよう', act: 'おひさまのしたであそぶ', sen: 'たいようがピカピカ！', q: 'たいようはどこ？', a: 'たいようはおそら！', syn: 'おひさま (ohisama)', var: null },
    rain:   { word: 'あめ', rom: 'ame', art: null, pl: null, adj: 'しとしとのあめ', act: 'あめのおとをきく', sen: 'あめがふっているよ！', q: 'そらからなにがふる？', a: 'あめ！', syn: null, var: null },
    car:    { word: 'くるま', rom: 'kuruma', art: null, pl: null, adj: 'あかいくるま', act: 'くるまにのる', sen: 'くるまでおでかけしよう。', q: 'くるまはどこ？', a: 'くるまはここ！', syn: 'ブーブー (būbū)', var: null },
    bus:    { word: 'バス', rom: 'basu', art: null, pl: null, adj: 'おおきいバス', act: 'バスにのる', sen: 'バスはおおきいね。', q: 'バスはどこ？', a: 'バスがきたよ！', syn: null, var: null },
    sleep:  { word: 'ねる', rom: 'neru', art: null, pl: null, adj: 'ぐっすりねる', act: 'ねんねのじかん', sen: 'ねんねするよ。', q: 'だれがねているの？', a: 'あかちゃんがねているよ！', syn: 'ねんね (nenne)', var: null },
    happy:  { word: 'うれしい', rom: 'ureshii', art: null, pl: null, adj: 'にこにこのこども', act: 'うれしくなる', sen: 'うれしい！', q: 'うれしい？', a: 'うん、うれしい！', syn: 'ハッピー (happī)', var: null }
  } };
  if (typeof module !== 'undefined' && module.exports) module.exports = g.LUMI_PACKS['ja'];
})(typeof window !== 'undefined' ? window : globalThis);
