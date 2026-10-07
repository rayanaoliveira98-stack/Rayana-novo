/* LumiLínguas — Content pack: 中文 (mandarim simplificado).
 * Sem artigos/plural gramatical: art = forma com classificador; rom = pinyin. */
(function (g) {
  'use strict';
  g.LUMI_PACKS = g.LUMI_PACKS || {};
  g.LUMI_PACKS['zh'] = { lang: 'zh', version: 1, source: 'Pack de demonstração LumiLínguas', concepts: {
    bed:    { word: '床', rom: 'chuáng', art: '一张床', pl: null, adj: '软软的床', act: '上床睡觉', sen: '我要上床睡觉。', q: '床在哪里？', a: '床在这里！', syn: null, var: null },
    chair:  { word: '椅子', rom: 'yǐzi', art: '一把椅子', pl: null, adj: '大椅子', act: '坐在椅子上', sen: '我坐在椅子上。', q: '椅子在哪里？', a: '椅子在这里！', syn: null, var: null },
    door:   { word: '门', rom: 'mén', art: '一扇门', pl: null, adj: '开着的门', act: '开门', sen: '我们开门吧。', q: '门在哪里？', a: '门在那里！', syn: null, var: null },
    key:    { word: '钥匙', rom: 'yàoshi', art: '一把钥匙', pl: null, adj: '小钥匙', act: '转动钥匙', sen: '钥匙能开门。', q: '钥匙在哪里？', a: '钥匙在这里！', syn: null, var: null },
    spoon:  { word: '勺子', rom: 'sháozi', art: '一把勺子', pl: null, adj: '大勺子', act: '用勺子吃饭', sen: '我用勺子吃饭。', q: '勺子在哪里？', a: '勺子在桌子上！', syn: null, var: null },
    ball:   { word: '球', rom: 'qiú', art: '一个球', pl: null, adj: '红色的球', act: '玩球', sen: '我想玩球。', q: '球在哪里？', a: '球在这里！', syn: null, var: null },
    book:   { word: '书', rom: 'shū', art: '一本书', pl: null, adj: '彩色的书', act: '看书', sen: '我们一起看书吧。', q: '书在哪里？', a: '书在这里！', syn: null, var: null },
    soap:   { word: '香皂', rom: 'xiāngzào', art: '一块香皂', pl: null, adj: '香香的香皂', act: '洗手', sen: '我用香皂洗手。', q: '香皂在哪里？', a: '香皂在浴室里！', syn: '肥皂 (féizào)', var: null },
    mom:    { word: '妈妈', rom: 'māma', art: '我的妈妈', pl: null, adj: '亲爱的妈妈', act: '抱抱妈妈', sen: '我爱妈妈。', q: '妈妈在哪里？', a: '妈妈在这里！', syn: null, var: null },
    dad:    { word: '爸爸', rom: 'bàba', art: '我的爸爸', pl: null, adj: '亲爱的爸爸', act: '抱抱爸爸', sen: '我爱爸爸。', q: '爸爸在哪里？', a: '爸爸在这里！', syn: null, var: null },
    baby:   { word: '宝宝', rom: 'bǎobao', art: '一个宝宝', pl: null, adj: '小宝宝', act: '哄宝宝', sen: '宝宝在睡觉。', q: '宝宝在哪里？', a: '宝宝在这里！', syn: '婴儿 (yīng’ér)', var: null },
    hand:   { word: '手', rom: 'shǒu', art: '一只手', pl: null, adj: '干净的小手', act: '拍拍手', sen: '我洗手。', q: '你的手在哪里？', a: '我的手在这里！', syn: null, var: null },
    nose:   { word: '鼻子', rom: 'bízi', art: '一个鼻子', pl: null, adj: '小鼻子', act: '摸摸鼻子', sen: '这是我的鼻子。', q: '你的鼻子在哪里？', a: '我的鼻子在这里！', syn: null, var: null },
    eyes:   { word: '眼睛', rom: 'yǎnjing', art: '一双眼睛', pl: null, adj: '大眼睛', act: '闭上眼睛', sen: '我闭上眼睛。', q: '你的眼睛在哪里？', a: '我的眼睛在这里！', syn: null, var: null },
    apple:  { word: '苹果', rom: 'píngguǒ', art: '一个苹果', pl: null, adj: '红苹果', act: '吃苹果', sen: '我想要一个苹果。', q: '苹果在哪里？', a: '苹果在这里！', syn: null, var: null },
    banana: { word: '香蕉', rom: 'xiāngjiāo', art: '一根香蕉', pl: null, adj: '黄香蕉', act: '剥香蕉', sen: '我喜欢香蕉。', q: '香蕉在哪里？', a: '香蕉在这里！', syn: null, var: null },
    water:  { word: '水', rom: 'shuǐ', art: '一杯水', pl: null, adj: '凉凉的水', act: '喝水', sen: '我想喝水。', q: '水在哪里？', a: '水在杯子里！', syn: null, var: null },
    milk:   { word: '牛奶', rom: 'niúnǎi', art: '一杯牛奶', pl: null, adj: '热牛奶', act: '喝牛奶', sen: '我早上喝牛奶。', q: '牛奶在哪里？', a: '牛奶在杯子里！', syn: null, var: null },
    bread:  { word: '面包', rom: 'miànbāo', art: '一块面包', pl: null, adj: '热面包', act: '吃面包', sen: '我想吃面包。', q: '面包在哪里？', a: '面包在桌子上！', syn: null, var: null },
    red:    { word: '红色', rom: 'hóngsè', art: null, pl: null, adj: '红色的球', act: '涂红色', sen: '苹果是红色的。', q: '什么是红色的？', a: '苹果是红色的！', syn: null, var: null },
    blue:   { word: '蓝色', rom: 'lánsè', art: null, pl: null, adj: '蓝色的天空', act: '涂蓝色', sen: '天空是蓝色的。', q: '什么是蓝色的？', a: '天空是蓝色的！', syn: null, var: null },
    three:  { word: '三', rom: 'sān', art: null, pl: null, adj: '三个苹果', act: '数到三', sen: '一、二、三！', q: '有几个？', a: '有三个！', syn: null, var: null },
    dog:    { word: '狗', rom: 'gǒu', art: '一只狗', pl: null, adj: '毛茸茸的狗', act: '摸摸狗', sen: '狗汪汪叫。', q: '狗在哪里？', a: '狗在这里！', syn: '小狗 (xiǎogǒu)', var: null },
    cat:    { word: '猫', rom: 'māo', art: '一只猫', pl: null, adj: '软软的猫', act: '摸摸猫', sen: '猫喵喵叫。', q: '猫在哪里？', a: '猫在这里！', syn: '小猫 (xiǎomāo)', var: null },
    bird:   { word: '鸟', rom: 'niǎo', art: '一只鸟', pl: null, adj: '蓝色的鸟', act: '听鸟唱歌', sen: '鸟在唱歌。', q: '鸟在哪里？', a: '鸟在树上！', syn: '小鸟 (xiǎoniǎo)', var: null },
    fish:   { word: '鱼', rom: 'yú', art: '一条鱼', pl: null, adj: '彩色的鱼', act: '看鱼游泳', sen: '鱼在水里游。', q: '鱼在哪里？', a: '鱼在水里！', syn: '小鱼 (xiǎoyú)', var: null },
    tree:   { word: '树', rom: 'shù', art: '一棵树', pl: null, adj: '大树', act: '看大树', sen: '树很大。', q: '树在哪里？', a: '树在公园里！', syn: null, var: null },
    flower: { word: '花', rom: 'huā', art: '一朵花', pl: null, adj: '漂亮的花', act: '闻闻花', sen: '花很漂亮。', q: '花在哪里？', a: '花在花园里！', syn: '小花 (xiǎohuā)', var: null },
    shoe:   { word: '鞋子', rom: 'xiézi', art: '一双鞋子', pl: null, adj: '新鞋子', act: '穿鞋子', sen: '我穿鞋子。', q: '鞋子在哪里？', a: '鞋子在这里！', syn: null, var: null },
    hat:    { word: '帽子', rom: 'màozi', art: '一顶帽子', pl: null, adj: '太阳帽', act: '戴帽子', sen: '我戴帽子。', q: '帽子在哪里？', a: '帽子在头上！', syn: null, var: null },
    sun:    { word: '太阳', rom: 'tàiyáng', art: '一个太阳', pl: null, adj: '暖暖的太阳', act: '在太阳下玩', sen: '太阳在发光。', q: '太阳在哪里？', a: '太阳在天上！', syn: null, var: null },
    rain:   { word: '雨', rom: 'yǔ', art: '一场雨', pl: null, adj: '小雨', act: '听雨声', sen: '下雨了！', q: '天上落下什么？', a: '是雨！', syn: null, var: null },
    car:    { word: '汽车', rom: 'qìchē', art: '一辆汽车', pl: null, adj: '红色的汽车', act: '坐汽车', sen: '我们坐汽车去。', q: '汽车在哪里？', a: '汽车在这里！', syn: '车车 (chēchē)', var: null },
    bus:    { word: '公共汽车', rom: 'gōnggòng qìchē', art: '一辆公共汽车', pl: null, adj: '大大的公共汽车', act: '坐公共汽车', sen: '公共汽车很大。', q: '公共汽车在哪里？', a: '公共汽车来了！', syn: '巴士 (bāshì)', var: null },
    sleep:  { word: '睡觉', rom: 'shuìjiào', art: null, pl: null, adj: '好好睡觉', act: '该睡觉了', sen: '我去睡觉。', q: '谁在睡觉？', a: '宝宝在睡觉！', syn: null, var: null },
    happy:  { word: '开心', rom: 'kāixīn', art: null, pl: null, adj: '开心的孩子', act: '很开心', sen: '我很开心！', q: '你开心吗？', a: '我很开心！', syn: '高兴 (gāoxìng)', var: null }
  } };
  if (typeof module !== 'undefined' && module.exports) module.exports = g.LUMI_PACKS['zh'];
})(typeof window !== 'undefined' ? window : globalThis);
