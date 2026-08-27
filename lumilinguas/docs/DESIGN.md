# Sistema visual

## Princípios

- **Alegre e acolhedor**: fundo creme quente (`#FFF9F2`), cartões brancos com sombras suaves, cantos muito arredondados (18-28px).
- **Elementos gigantes**: alvos de toque mínimos de 76px na área infantil (botão de play: 120px); emojis-herói de 110-140px.
- **Pouco texto**: zero texto nas atividades para 3-4 anos; apoio opcional para 5-7.
- **Animações que explicam**: personagem flutua = "estou com você"; botão pulsa = "toque aqui"; dica animada (👂/🔍/🗣️) = tipo de atividade; confete = fim da sessão. Nada pisca agressivamente.
- **Ilustração por emoji na demonstração**: originais do sistema, sem personagens ou interfaces copiados de outros aplicativos. Produção: substituir por ilustrações originais encomendadas (a arquitetura só troca strings de emoji por `<img>`).

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
- **Sensibilidade auditiva**: sons curtos e suaves (senoides, ganho ≤0.12), zero sons de erro; `prefers-reduced-motion` desativa todas as animações.
- **Sem ansiedade**: barra de progresso sem números, sem cronômetro, sem contador de erros visível.
