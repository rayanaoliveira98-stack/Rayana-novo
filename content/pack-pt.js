/* LumiLínguas — Pack de conteúdo: Português (Brasil).
 * Chaves: word=palavra, art=com artigo, pl=plural, adj=frase adjetiva,
 * act=ação/verbo, sen=frase simples, q=pergunta, a=resposta,
 * syn=sinônimo infantil, var=variações regionais, rom=romanização.
 * Campos null = não se aplica neste idioma (nunca inventar).
 */
(function (g) {
  'use strict';
  g.LUMI_PACKS = g.LUMI_PACKS || {};
  g.LUMI_PACKS['pt'] = { lang: 'pt', version: 1, source: 'Pack de demonstração LumiLínguas', concepts: {
    bed:    { word: 'cama', art: 'a cama', pl: 'as camas', adj: 'cama quentinha', act: 'dormir na cama', sen: 'Eu quero ir para a cama.', q: 'Onde está a cama?', a: 'A cama está aqui!', syn: 'caminha', var: null },
    chair:  { word: 'cadeira', art: 'a cadeira', pl: 'as cadeiras', adj: 'cadeira grande', act: 'sentar na cadeira', sen: 'Eu sento na cadeira.', q: 'Onde está a cadeira?', a: 'A cadeira está aqui!', syn: 'cadeirinha', var: null },
    door:   { word: 'porta', art: 'a porta', pl: 'as portas', adj: 'porta aberta', act: 'abrir a porta', sen: 'Vamos abrir a porta.', q: 'Onde está a porta?', a: 'A porta está ali!', syn: null, var: null },
    key:    { word: 'chave', art: 'a chave', pl: 'as chaves', adj: 'chave pequena', act: 'girar a chave', sen: 'A chave abre a porta.', q: 'Onde está a chave?', a: 'A chave está aqui!', syn: null, var: null },
    spoon:  { word: 'colher', art: 'a colher', pl: 'as colheres', adj: 'colher grande', act: 'comer com a colher', sen: 'Eu como com a colher.', q: 'Onde está a colher?', a: 'A colher está na mesa!', syn: null, var: null },
    ball:   { word: 'bola', art: 'a bola', pl: 'as bolas', adj: 'bola vermelha', act: 'jogar bola', sen: 'Eu quero jogar bola.', q: 'Onde está a bola?', a: 'A bola está aqui!', syn: null, var: null },
    book:   { word: 'livro', art: 'o livro', pl: 'os livros', adj: 'livro colorido', act: 'ler um livro', sen: 'Vamos ler um livro.', q: 'Onde está o livro?', a: 'O livro está aqui!', syn: 'livrinho', var: null },
    soap:   { word: 'sabonete', art: 'o sabonete', pl: 'os sabonetes', adj: 'sabonete cheiroso', act: 'lavar as mãos', sen: 'Eu lavo as mãos com sabonete.', q: 'Onde está o sabonete?', a: 'O sabonete está no banheiro!', syn: null, var: null },
    mom:    { word: 'mamãe', art: 'a mamãe', pl: null, adj: 'mamãe querida', act: 'abraçar a mamãe', sen: 'Eu amo a mamãe.', q: 'Onde está a mamãe?', a: 'A mamãe está aqui!', syn: 'mãe', var: null },
    dad:    { word: 'papai', art: 'o papai', pl: null, adj: 'papai querido', act: 'abraçar o papai', sen: 'Eu amo o papai.', q: 'Onde está o papai?', a: 'O papai está aqui!', syn: 'pai', var: null },
    baby:   { word: 'bebê', art: 'o bebê', pl: 'os bebês', adj: 'bebê pequenino', act: 'ninar o bebê', sen: 'O bebê está dormindo.', q: 'Onde está o bebê?', a: 'O bebê está aqui!', syn: 'neném', var: null },
    hand:   { word: 'mão', art: 'a mão', pl: 'as mãos', adj: 'mão limpa', act: 'bater palmas', sen: 'Eu lavo as mãos.', q: 'Cadê a sua mão?', a: 'Minha mão está aqui!', syn: 'mãozinha', var: null },
    nose:   { word: 'nariz', art: 'o nariz', pl: 'os narizes', adj: 'nariz pequeno', act: 'tocar o nariz', sen: 'Este é o meu nariz.', q: 'Cadê o seu nariz?', a: 'Meu nariz está aqui!', syn: 'narizinho', var: null },
    eyes:   { word: 'olho', art: 'o olho', pl: 'os olhos', adj: 'olhos abertos', act: 'fechar os olhos', sen: 'Eu fecho os olhos.', q: 'Cadê os seus olhos?', a: 'Meus olhos estão aqui!', syn: null, var: null },
    apple:  { word: 'maçã', art: 'a maçã', pl: 'as maçãs', adj: 'maçã vermelha', act: 'comer uma maçã', sen: 'Eu quero uma maçã.', q: 'Onde está a maçã?', a: 'A maçã está aqui!', syn: null, var: null },
    banana: { word: 'banana', art: 'a banana', pl: 'as bananas', adj: 'banana amarela', act: 'descascar a banana', sen: 'Eu gosto de banana.', q: 'Onde está a banana?', a: 'A banana está aqui!', syn: null, var: null },
    water:  { word: 'água', art: 'a água', pl: null, adj: 'água fresquinha', act: 'beber água', sen: 'Eu quero beber água.', q: 'Onde está a água?', a: 'A água está no copo!', syn: null, var: null },
    milk:   { word: 'leite', art: 'o leite', pl: null, adj: 'leite quentinho', act: 'beber leite', sen: 'Eu bebo leite de manhã.', q: 'Onde está o leite?', a: 'O leite está no copo!', syn: null, var: null },
    bread:  { word: 'pão', art: 'o pão', pl: 'os pães', adj: 'pão quentinho', act: 'comer pão', sen: 'Eu quero pão com manteiga.', q: 'Onde está o pão?', a: 'O pão está na mesa!', syn: 'pãozinho', var: null },
    red:    { word: 'vermelho', art: null, pl: null, adj: 'bola vermelha', act: 'pintar de vermelho', sen: 'A maçã é vermelha.', q: 'O que é vermelho?', a: 'A maçã é vermelha!', syn: null, var: null },
    blue:   { word: 'azul', art: null, pl: null, adj: 'céu azul', act: 'pintar de azul', sen: 'O céu é azul.', q: 'O que é azul?', a: 'O céu é azul!', syn: null, var: null },
    three:  { word: 'três', art: null, pl: null, adj: 'três maçãs', act: 'contar até três', sen: 'Um, dois, três!', q: 'Quantos são?', a: 'São três!', syn: null, var: null },
    dog:    { word: 'cachorro', art: 'o cachorro', pl: 'os cachorros', adj: 'cachorro fofo', act: 'fazer carinho no cachorro', sen: 'O cachorro faz au-au.', q: 'Onde está o cachorro?', a: 'O cachorro está aqui!', syn: 'au-au', var: null },
    cat:    { word: 'gato', art: 'o gato', pl: 'os gatos', adj: 'gato fofinho', act: 'fazer carinho no gato', sen: 'O gato faz miau.', q: 'Onde está o gato?', a: 'O gato está aqui!', syn: 'gatinho', var: null },
    bird:   { word: 'passarinho', art: 'o passarinho', pl: 'os passarinhos', adj: 'passarinho azul', act: 'ouvir o passarinho', sen: 'O passarinho canta.', q: 'Onde está o passarinho?', a: 'O passarinho está na árvore!', syn: 'pássaro', var: null },
    fish:   { word: 'peixe', art: 'o peixe', pl: 'os peixes', adj: 'peixe colorido', act: 'ver o peixe nadar', sen: 'O peixe nada na água.', q: 'Onde está o peixe?', a: 'O peixe está na água!', syn: 'peixinho', var: null },
    tree:   { word: 'árvore', art: 'a árvore', pl: 'as árvores', adj: 'árvore grande', act: 'olhar a árvore', sen: 'A árvore é grande.', q: 'Onde está a árvore?', a: 'A árvore está no parque!', syn: null, var: null },
    flower: { word: 'flor', art: 'a flor', pl: 'as flores', adj: 'flor bonita', act: 'cheirar a flor', sen: 'A flor é bonita.', q: 'Onde está a flor?', a: 'A flor está no jardim!', syn: 'florzinha', var: null },
    shoe:   { word: 'sapato', art: 'o sapato', pl: 'os sapatos', adj: 'sapato novo', act: 'calçar o sapato', sen: 'Eu calço o sapato.', q: 'Onde está o sapato?', a: 'O sapato está aqui!', syn: 'sapatinho', var: null },
    hat:    { word: 'chapéu', art: 'o chapéu', pl: 'os chapéus', adj: 'chapéu de sol', act: 'colocar o chapéu', sen: 'Eu coloco o chapéu.', q: 'Onde está o chapéu?', a: 'O chapéu está na cabeça!', syn: 'boné', var: null },
    sun:    { word: 'sol', art: 'o sol', pl: null, adj: 'sol quente', act: 'brincar no sol', sen: 'O sol está brilhando.', q: 'Onde está o sol?', a: 'O sol está no céu!', syn: null, var: null },
    rain:   { word: 'chuva', art: 'a chuva', pl: null, adj: 'chuva fininha', act: 'ouvir a chuva', sen: 'Está chovendo!', q: 'O que cai do céu?', a: 'A chuva!', syn: null, var: null },
    car:    { word: 'carro', art: 'o carro', pl: 'os carros', adj: 'carro vermelho', act: 'andar de carro', sen: 'Vamos passear de carro.', q: 'Onde está o carro?', a: 'O carro está aqui!', syn: 'carrinho', var: null },
    bus:    { word: 'ônibus', art: 'o ônibus', pl: 'os ônibus', adj: 'ônibus grande', act: 'andar de ônibus', sen: 'O ônibus é grande.', q: 'Onde está o ônibus?', a: 'Lá vem o ônibus!', syn: null, var: null },
    sleep:  { word: 'dormir', art: null, pl: null, adj: 'dormir gostoso', act: 'hora de dormir', sen: 'Eu vou dormir.', q: 'Quem está dormindo?', a: 'O bebê está dormindo!', syn: 'nanar', var: null },
    happy:  { word: 'feliz', art: null, pl: null, adj: 'criança feliz', act: 'ficar feliz', sen: 'Eu estou feliz!', q: 'Você está feliz?', a: 'Sim, eu estou feliz!', syn: 'contente', var: null }
  } };
  if (typeof module !== 'undefined' && module.exports) module.exports = g.LUMI_PACKS['pt'];
})(typeof window !== 'undefined' ? window : globalThis);
