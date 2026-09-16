# Arquitetura do produto

## Decisões técnicas

| Decisão | Justificativa |
|---|---|
| **PWA instalável** (HTML/CSS/JS puro, sem framework e sem build) | Instala em iOS/iPadOS/Android via "Adicionar à tela inicial"; carrega rápido em aparelhos antigos; um único código para celular e tablet. Evolução para as lojas: empacotar com Capacitor sem reescrever nada. |
| **Dados 100% locais** (`localStorage` + `IndexedDB`) | Privacidade por padrão (GDPR-K): perfis, progresso e gravações nunca saem do aparelho na demonstração. Sincronização em nuvem é um módulo futuro (ver STATUS.md). |
| **Áudio pelas APIs do sistema** (`speechSynthesis`, `MediaRecorder`) | Vozes nativas em todos os 9 idiomas sem baixar nada; gravações da família têm prioridade sobre a voz sintética. |
| **Produção verificável em qualquer aparelho** (`SpeechRecognition` + detecção de voz por volume) | Onde há reconhecimento, a avaliação é tolerante à pronúncia infantil; onde não há, a detecção de volume confirma que a criança falou (sem gravar nem enviar nada), e é isso que permite a escada de produção avançar num celular simples. Sem microfone, ela fala em voz alta e confirma — contando como produção com apoio, nunca como fala verificada. |
| **Conteúdo em packs por idioma** (`content/pack-XX.js`) | Novo idioma = novo arquivo, zero rebuild. O painel administrativo importa packs por JSON/CSV em tempo de execução (mesclados via `localStorage`). |
| **Módulos puros testáveis** (`srs.js`, `ladder.js`, `session.js`, `gate.js`, `store.js`) | Rodam no navegador **e** no Node (`node --test`): o coração pedagógico tem testes automatizados. |
| **Offline-first** (Service Worker, cache-first) | Depois da primeira visita, tudo funciona sem internet — inclusive os áudios (TTS é local ao aparelho). |

## Decisões pedagógicas

1. **Comunicação honesta**: nunca prometemos fluência — o onboarding repete a frase oficial ("base de compreensão, vocabulário e pronúncia em 60 dias").
2. **Conceito ≠ foto**: cada conceito tem imagem principal + 2 alternativas, artigo, plural, adjetivo, ação, frase, pergunta, resposta, sinônimo e variação regional.
3. **Blocos por idioma para 3-4 anos** (nunca misturar na mesma atividade); comparação explícita entre idiomas apenas para 5-7 anos.
4. **Sem texto para 3-4 anos**; palavras escritas são apoio opcional para 5-7 (ativado pelos responsáveis).
5. **Máximo 6 conceitos novos/dia**, reduzidos automaticamente com 3-4 idiomas, idade menor ou dificuldade recente (mínimo 2).
6. **Nunca "errado"**: dificuldades geram reapresentação discreta, revisão antecipada e, após 3 dias, simplificação da atividade (fala → reconhecimento). Sem sons negativos, sem perda de pontos.
7. **Retenção sobre volume**: a revisão espaçada (1-3-7-14-30 dias) tem prioridade sobre conteúdo novo na fila da sessão.
8. **Cansaço encurta a sessão**: 3 dificuldades seguidas ou lentidão média > 15 s removem jogos extras, o momento especial e conceitos novos excedentes, mantendo a celebração.
9. **Variedade obrigatória**: 7 jogos em rodízio por dia+idioma e um "momento especial" (história → música → caça ao objeto em casa) que gira a cada dia, para que dois dias seguidos nunca tenham a mesma sequência. O momento especial só usa vocabulário já trabalhado — nada estreia dentro de um jogo.
10. **Movimento a serviço da compreensão**: a animação explica a atividade e confirma o acerto; nunca cria urgência, contagem regressiva ou punição.
11. **Progressão individual, não sorteada**: a atividade de cada palavra sai do degrau em que aquela criança está com aquela palavra (ver [DIDATICA.md](DIDATICA.md)). O degrau sobe só após dois acertos seguidos e desce um único degrau em dificuldade.
12. **A criança produz**: nenhuma palavra conta como dominada sem ter saído da boca dela sem modelo. O espaçamento fica curto até lá, para a palavra não desaparecer antes da produção.

## Módulos

```
lumilinguas/
├── index.html            # casca do app (SPA): telas criança + responsáveis
├── admin.html            # painel administrativo de conteúdo (independente)
├── sw.js                 # Service Worker (offline, cache-first)
├── manifest.webmanifest  # instalação PWA
├── css/app.css           # sistema visual
├── js/
│   ├── langs.js          # registro de idiomas (cor, personagem, voz, jingle, variantes)
│   ├── srs.js            # ★ motor de repetição espaçada (puro, testado)
│   ├── ladder.js         # ★ escada de produção: o degrau de cada palavra (puro, testado)
│   ├── session.js        # ★ montador da sessão diária adaptativa (puro, testado)
│   ├── gate.js           # ★ portão parental: PIN + desafio de adulto (puro, testado)
│   ├── store.js          # ★ persistência, perfis, exportação/exclusão (puro, testado)
│   ├── audio.js          # TTS, jingles, feedback, gravações da família (IndexedDB)
│   ├── speech.js         # reconhecimento de fala + avaliação tolerante (assess pura)
│   ├── fx.js             # efeitos dinâmicos: transições, mascote, partículas, vibração
│   ├── activities.js     # renderizadores das atividades infantis
│   ├── activities-extra.js # memória auditiva, imitar, história, música, caça em casa
│   ├── activities-produce.js # completar a frase, falar sozinha, usar em conversa
│   ├── app.js            # navegação, execução da sessão, adaptação em tempo real
│   └── parent.js         # onboarding, painel dos responsáveis, gravação de voz
├── content/
│   ├── curriculum.js     # 36 conceitos + jornada de 60 dias em 9 fases
│   └── pack-{pt,en,de,es,fr,it,tr,zh,ja}.js   # 9 packs completos
└── tests/                # node --test (59 testes, incl. jornada de 60 dias)
```

★ = módulo puro com testes em Node.

## Fluxo de dados da sessão

```
perfil + progresso (store) ──► session.buildSession() ──► fila de passos
                                                            │
       ┌────────────────────────────────────────────────────┘
       ▼
 activities.run(passo) ──► resultado {listen|speak, ok|helped|hard|silent}
       │                                    │
       ▼                                    ▼
 adaptação em tempo real            srs.record()  ──► ladder.record()
 (encurtar se cansaço)              (quando volta)    (o que vai pedir)
       │                                    │                │
       │                                    └──► srs.capInterval(ladder.max…)
       ▼                                         (não espaça além do degrau)
 celebração ──► logSession + dicas do dia + adesivo + jornada+1
```

## Como um novo idioma entra

1. Criar `content/pack-XX.js` (ou importar JSON/CSV pelo `admin.html`);
2. Registrar em `js/langs.js` (cor, personagem, voz TTS, jingle, variantes);
3. Adicionar o arquivo em `index.html`, `admin.html` e `sw.js`.
Nada mais muda — o onboarding, a sessão e o painel descobrem o idioma pelo registro.
