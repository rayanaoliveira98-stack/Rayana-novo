# Sistema visual

## Direção: mundo de papel recortado

A criança não está diante de um formulário — está olhando uma cena montada com
papel colorido. Céu ao fundo, colinas recortadas no rodapé, e peças pousadas
por cima. Três regras sustentam tudo:

1. **Nada flutua em cinza.** As sombras são sólidas e deslocadas para baixo
   (`0 6px 0`), como papel empilhado — não borrões genéricos de caixa branca.
2. **Tudo que se toca afunda.** Cada botão tem espessura real (uma faixa mais
   escura embaixo) e perde altura no toque: a mão sente que empurrou uma peça.
3. **A cena é do idioma.** A cor da língua ativa tinge o céu, as bordas e a
   luz dos objetos — trocar de idioma é entrar em outro lugar, não só ver
   outra cor.

## Tipografia

**Baloo 2** (SIL Open Font License), servida pelo próprio app em `fonts/` —
não do Google Fonts, porque o app precisa funcionar offline. Arredondada,
encorpada e desenhada para telas pequenas.

É uma fonte **variável**: um único arquivo por subconjunto cobre os pesos de
400 a 800, interpolados pelo navegador. Declarar pesos fixos faria baixar o
mesmo arquivo três vezes (eram 196 KB; são 60 KB) e travaria a interpolação.
Só latim e latim estendido; mandarim e japonês usam a fonte do sistema, que os
desenha melhor.

O corpo de texto do **painel dos responsáveis** fica na fonte do sistema: lê
melhor em blocos longos, é o que o adulto já está acostumado a ler no
aparelho, e não custa download nenhum. Só os títulos e controles ali usam a
voz da marca.

## Composição da atividade

Cada tela de atividade tem começo, meio e fim:

- **Cabeçalho** — o personagem do idioma segura um balão com o ícone da tarefa.
  Fica claro *quem* está pedindo *o quê*. Antes o ícone flutuava solto e o topo
  da tela ficava vazio.
- **Palco** — a peça central (objeto no prato de luz) e as opções.
- **Ações** — sempre numa fileira só, na mesma altura, para a mão saber onde
  pousar.

Cabeçalho e palco são centralizados **como um grupo**, não separadamente: eles
formam uma cena, não dois blocos distantes.

## Escalas que acompanham a tela

Nada é fixo em pixels onde o espaço varia: os objetos crescem com a altura
disponível (`clamp` com unidades de viewport) para não boiarem num vazio em
telas grandes nem estourarem em telas pequenas. Há um ajuste explícito para
telas baixas (celular pequeno ou paisagem), onde o herói e os botões encolhem.

## Princípios gerais

- **Elementos gigantes**: alvos de toque mínimos de 76px na área infantil
  (botão de brincar: 124px); objeto em foco de 88 a 124px conforme a tela.
- **Pouco texto**: zero texto nas atividades para 3-4 anos; apoio opcional
  para 5-7 — e, nas atividades de fala, a palavra escrita só aparece **depois**
  da tentativa, senão a criança lê em vez de lembrar.
- **Ilustração por emoji na demonstração**: originais do sistema, sem
  personagens ou interfaces copiados. Em produção, trocam-se por ilustrações
  encomendadas (a arquitetura só troca a string do emoji por um `<img>`).

## Identidade por idioma

Cada idioma = **personagem + cor + identidade sonora** (nunca só cor — funciona para daltonismo):

| Idioma | Personagem | Cor | Jingle |
|---|---|---|---|
| Português | Tuca 🦜 (tucano) | verde `#2BB673` | dó-mi-sol |
| Alemão | Bruno 🐻 (urso) | amarelo `#F4B400` | sol-si-ré |
| Inglês | Finn 🦊 (raposa) | azul `#4A6CF7` | lá-dó♯-mi |
| Espanhol | Lola 🦙 (lhama) | vermelho `#E2574C` | si-ré-fá♯ |
| Turco | Kaya 🐰 (coelho) | teal `#00A3A3` | sol♯-dó-ré♯ |
| Francês | Coco 🐓 (galo) | roxo `#8E6CF0` | si♭-ré-fá |
| Italiano | Gigi 🦉 (coruja) | verde `#3AAE5C` | dó-ré♯-sol |
| Mandarim | Panpan 🐼 (panda) | laranja `#E58B2F` | lá-dó-mi |
| Japonês | Momo 🦝 (tanuki) | rosa `#E2648F` | si-ré♯-fá♯ |

A cor ativa entra como `--lang-color`/`--lang-soft` na sessão (barra de progresso, botões, bordas).

## Personagens e diversidade

Avatares infantis com tons de pele variados; personagens-guia são animais (neutros e universais). Elogios são falados no idioma da atividade ("Great job!", "真棒！"), nunca comparativos.

## Acessibilidade

- **Daltonismo**: informação nunca só por cor (personagem + posição + ícone); paleta testada para contraste sobre creme/branco.
- **Dificuldades motoras**: alvos ≥76px, sem gestos de precisão obrigatórios (arrastar tem alternativa por toque nas demais atividades), sem tempo limite.
- **Sensibilidade auditiva**: sons curtos e suaves (senoides, ganho ≤0.12), zero sons de erro; `prefers-reduced-motion` desativa todas as animações e remove partículas, confete e elementos flutuantes (`body.reduce-motion`), mantendo o app inteiro funcional — só parado.
- **Sem ansiedade**: barra de progresso sem números, sem cronômetro, sem contador de erros visível.
