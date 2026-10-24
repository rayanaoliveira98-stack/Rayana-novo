# Fahrschul-Coach — Piloto (Woche 1)

PWA que prepara para a prova teórica austríaca (Führerschein Klasse B).
Todo o conteúdo visível ao usuário é em alemão, em *Einfache Sprache* (A2),
com a formulação oficial ao lado para treinar o reconhecimento do Amtsdeutsch.

O piloto responde a uma pergunta: **depois de 5 dias, a pessoa consegue
explicar a regra com as próprias palavras?**

## Rodar

```bash
npm install
npm run dev        # http://localhost:3000
npm run test       # validação de conteúdo (Zod + regra das 12 palavras)
npm run build      # roda os testes e só então compila
```

## Deploy (Vercel, um comando)

```bash
npx vercel --prod
```

`vercel.json` já configura o framework, o build e os headers do service worker.

## Estrutura

```
app/                 telas (Start, /tag/[tag], /fehler) + layout PWA
components/          motor de lição e componentes do design system
content/tag-0X.json  conteúdo de cada dia — separado do código
lib/schema.ts        modelo de dados em Zod
lib/satzcheck.ts     regra das 12 palavras por frase
lib/progress.ts      progresso em localStorage (sem login, sem backend)
lib/speech.ts        áudio via Web Speech API (de-AT, fallback de-DE)
tests/               teste que quebra o build com frase longa
public/sw.js         service worker (offline após a primeira visita)
```

## As regras que o código faz cumprir

- **Máximo 12 palavras por frase** em todo `text_einfach`. Uma frase longa
  **quebra o build** (`npm run build` roda `vitest` antes do `next build`).
  A mensagem de erro aponta o arquivo, o campo e a frase.
- **Uma tela = uma decisão.** O botão `Weiter` só aparece quando não há
  decisão pendente; enquanto a pessoa decide, a tela tem só as opções.
- **A pergunta é sempre `Was machst du jetzt?`** — garantido pelo schema
  (`z.literal`).
- **Camada dupla.** Toda explicação tem `text_einfach` e `text_amtlich`,
  este último recolhível em "So steht es in der Prüfung".
- **Erro nunca pune.** Sem pontos, sem vidas, sem som. Ao errar, a cena mostra
  a consequência, vem uma nova explicação com outro exemplo, e a pergunta
  volta antes do fim do dia.
- **Áudio em tudo**, com voz `de-AT` e fallback `de-DE`.
- **Vocabulário clicável**: palavras-armadilha (`Vorrang`, `Schutzweg`,
  `anhalten`/`halten`/`parken`, `dürfen`/`müssen`, `Einbahn`, `Rechtsregel`)
  são marcadas automaticamente em qualquer texto, via `lib/glossar.ts`.

## Os 5 dias

| Dia | Tema |
|---|---|
| 1 | Wer ist auf der Straße? |
| 2 | Die Ampel und der Schutzweg |
| 3 | Die Rechtsregel |
| 4 | Vorrangzeichen |
| 5 | Wiederholung + Prüfungsmodus (15 perguntas em Amtsdeutsch) |

## Direito autoral

Nenhuma pergunta do catálogo oficial foi copiada. Todo `frage_amtlich` e todo
`text_amtlich` foram escritos por nós, no mesmo registro do original.

## Antes de usar com gente de verdade

Leia `INHALT-PRUEFEN.md`: lista o que precisa ser confirmado por uma
Fahrlehrerin ou um Fahrlehrer, e o que foi deliberadamente deixado de fora
por não termos certeza da regra.
