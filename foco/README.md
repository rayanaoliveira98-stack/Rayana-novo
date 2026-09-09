# FOCO — mapa de tarefas + recompensa física

App web (PWA) para quem **começa e não termina**. Não é mais um to-do list: é um
sistema de reforço. Cada tarefa concluída dispara um ritual curto de recompensa
física que a tela **trava** até você fazer.

Rodando 100% no navegador. Sem conta, sem servidor, sem internet depois do primeiro
carregamento. Os dados ficam no `localStorage` do aparelho.

## Como usar

1. Abra `foco/index.html` (ou acesse a versão publicada).
2. No celular: menu do navegador → **Adicionar à tela de início**. Vira app.
3. Mapeie as tarefas, escolha uma, comece o bloco.

## Os quatro princípios que sustentam o app

| Problema real | O que o app faz |
|---|---|
| Lista grande paralisa | Mostra **uma** tarefa por vez ("Sua próxima tarefa"), escolhida por impacto × esforço |
| Começar é o gargalo | Cada tarefa exige um **primeiro passo mínimo** escrito. Você não começa a tarefa — começa o passo |
| A tarefa não tem fim visível | Blocos de **15/25/45 min** com anel de contagem. Fim visível = cérebro aceita começar |
| A conclusão não é sentida | **Ritual obrigatório** ao concluir: carta sorteada do baralho, com contador guiado, confete e som |

### Por que a recompensa é sorteada

Recompensa previsível vira rotina e perde efeito. Recompensa **variável** — a carta muda
a cada conclusão, com 12% de chance de bônus de pontos dobrados — é o mesmo mecanismo
de reforço intermitente que faz rede social prender. Aqui ele trabalha a seu favor.

### Por que a recompensa é física

Palma e confete dão o pico rápido (dopamina). Agachamento, polichinelo, dança e
respiração 4-7-8 dão o efeito longo (endorfina, queda de cortisol, reset do foco).
Os dois juntos é o que transforma "terminei" em sensação corporal — e é a sensação,
não a lógica, que constrói hábito.

## Estrutura

```
foco/
├── index.html            telas: Mapa, Foco, Progresso, Ajustes + overlays
├── styles.css            design system (dark, mobile-first, responsivo)
├── app.js                estado, timer, baralho de recompensas, ritual, stats
├── manifest.webmanifest  PWA instalável
├── sw.js                 service worker (offline-first)
└── icon.svg / icon-maskable.svg
```

## Baralho de recompensas

Configurável em **Ajustes** — quatro baralhos, 16 cartas:

- **Palmas + som de vitória** — aplauso, confete, reforço verbal em voz alta
- **Movimento físico** — 10 agachamentos, 15 polichinelos, 30s de dança, 20 passos, 8 flexões na parede, 20 elevações de joelho
- **Respiração, água e elogio** — 4-7-8 guiada, 300ml de água, descanso ocular 20s, elogio em voz alta
- **Alongamento guiado** *(desligado por padrão — ligue em Ajustes)* — pescoço, abertura de peito, alcance ao chão

## Regras do sistema

- **Fim do bloco** → ritual automático de pausa ativa (+5 pontos), depois um bloco novo na mesma tarefa
- **Tarefa concluída** → ritual + 10 pontos + bônus por minuto focado; a tarefa sai do mapa
- **Streak** conta dias seguidos com pelo menos 1 tarefa concluída
- **Travamento** (Ajustes) pode ser desligado — mas é ele que faz o app funcionar

## Rodar local

```bash
npx http-server -p 8099 .
# abra http://localhost:8099/foco/index.html
```

O service worker exige `http://` ou `https://` — abrindo o arquivo direto pelo
`file://` o app funciona, só não instala como PWA.
