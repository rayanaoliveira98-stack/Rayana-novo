# Modelo de dados e motor de repetição espaçada

## Armazenamento

Tudo local ao aparelho (GDPR-K): `localStorage` chave `lumilinguas.v1` (JSON) + `IndexedDB` banco `lumilinguas-audio` (gravações da família como Blobs).

```jsonc
{
  "version": 1,
  "parent": {
    "pin": { "salt": "…", "hash": "…" },        // FNV-1a com salt — barreira infantil local
    "consent": { "at": "ISO", "allowSpeech": true, "allowFamilyVoice": true }
  },
  "profiles": {
    "p1": {
      "id": "p1", "name": "Sofia", "age": 4, "avatar": "👧",
      "homeLang": "pt",
      "langs": ["en", "de"],                     // 1 a 4 idiomas
      "langVariants": { "de": "de-AT" },         // variação regional escolhida
      "levels": { "en": "none" },                // nível declarado + teste inicial
      "reading": "no|starting|yes",
      "interests": ["animals", "places"],
      "sessionMinutes": 11, "usualTime": "17:30",
      "allowSpeech": false, "allowFamilyVoice": true, "textSupport": false,
      "journeyDay": 9, "lastSessionDate": "2026-8-27",
      "stickers": [{ "day": 1, "emoji": "🛏️" }]
    }
  },
  "progress": {                                  // criança × idioma × conceito
    "p1": { "en": { "apple": { /* registro SRS abaixo */ } } }
  },
  "sessions": {                                  // histórico (máx. 90/perfil)
    "p1": [{ "date": "ISO", "day": 9, "durationMs": 660000, "answered": 14,
             "hard": 2, "shortened": false, "newConcepts": { "en": ["apple"] },
             "tips": ["No café da manhã, …"] }]
  },
  "activeProfile": "p1"
}
```

Gravações: chave `perfil:idioma:conceito` → Blob de áudio. Excluir o perfil apaga também as gravações.

## Registro SRS (por criança + conceito + idioma)

```jsonc
{
  "state": "new | presented | recognized | repeated_helped | spoken | mastered | review",
  "introducedAt": 0, "lastSeenAt": 0,
  "dueAt": 0,               // próxima revisão programada
  "intervalIndex": 2,       // posição em [1, 3, 7, 14, 30] dias
  "streak": 3,              // acertos seguidos
  "struggles": 1,           // dificuldades acumuladas (decaem com acertos)
  "struggleDays": 2,        // dias DISTINTOS com dificuldade (>=3 → simplificar)
  "lastResult": "ok | hard"
}
```

### Estados (exatamente os da especificação)

| Estado | Significado |
|---|---|
| `new` | ainda não apresentado |
| `presented` | apresentado |
| `recognized` | reconhecido ao ouvir |
| `repeated_helped` | repetido com ajuda |
| `spoken` | falado sem ajuda |
| `mastered` | dominado (falou sozinho + completou o ciclo de 30 dias) |
| `review` | precisa de revisão |

### Transições

- `introduce()` → `presented`, revisão em **+1 dia**;
- resultado **ok** em escuta → `recognized`; em fala com ajuda → `repeated_helped`; em fala sozinho → `spoken`; avança o intervalo (1→3→7→14→30);
- resultado **hard** → `review`, volta **amanhã**, recua **um** degrau de intervalo (nunca zera o histórico), incrementa `struggles`/`struggleDays`;
- `spoken` + último intervalo + 2 acertos seguidos → `mastered`.

### Regras de fila da sessão (session.js)

1. Abrir com até 2 dificuldades de ontem (as com mais `struggles` primeiro);
2. Até 4 revisões vencidas por idioma (mais atrasadas primeiro);
3. Conceitos novos: orçamento = f(idade, nº idiomas, dificuldade recente) ∈ [2, 6], dividido pelos idiomas;
4. Reapresentação discreta de 1 erro depois de 3-5 atividades;
5. Jogo em contexto com conteúdo já visto; desafio misto no fim;
6. `struggleDays >= 3` → a revisão daquele conceito volta para reconhecimento visual (`mode: 'listen'`).

### Retenção medida

`retentionAt(records, d)` para d ∈ {1, 3, 7, 14, 30}: proporção de conceitos que passaram do intervalo `d` sem dificuldade — exibida no painel dos responsáveis.

## Formato dos packs de conteúdo

```jsonc
{
  "lang": "en", "version": 1,
  "concepts": {
    "apple": {
      "word": "apple",          // palavra
      "art": "an apple",        // com artigo (null quando não natural no idioma)
      "pl": "apples",           // plural (null p/ tr/zh/ja/incontáveis)
      "adj": "a red apple",     // frase adjetiva
      "act": "eat an apple",    // verbo/ação relacionada
      "sen": "I want an apple.",// frase simples
      "q": "Where is the apple?", "a": "Here is the apple!",
      "syn": null,              // sinônimo infantil, quando existir
      "var": { "en-GB": "…" },  // variação regional identificada
      "rom": "píngguǒ"          // romanização (apenas zh/ja)
    }
  }
}
```

As imagens (principal + alternativas + cenário) são independentes de idioma e vivem em `content/curriculum.js`.
