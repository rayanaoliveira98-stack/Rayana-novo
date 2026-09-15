# LumiLínguas ✨

**Construa uma base de compreensão, vocabulário e pronúncia em até quatro idiomas durante uma jornada de 60 dias.**

Aplicativo mobile-first (PWA instalável) para crianças de 3 a 7 anos. Sem leitura obrigatória, sem publicidade, sem punição — ouvir → compreender → falar → revisar → usar no dia a dia.

## Como executar

O aplicativo é 100% estático (sem build). Sirva a pasta por HTTP:

```bash
cd lumilinguas
npx http-server -p 8080 -c-1 .
# ou: python3 -m http.server 8080
```

Abra `http://localhost:8080` no celular ou no navegador (modo responsivo). No celular, use **"Adicionar à tela inicial"** para instalar como app (iOS/iPadOS/Android). Após a primeira visita, tudo funciona **offline** (Service Worker).

- `index.html` — aplicativo (criança + responsáveis)
- `admin.html` — painel administrativo de conteúdo (revisão de traduções/áudios/variações, importação JSON/CSV)

> Voz sintética e reconhecimento de fala usam as APIs do navegador (`speechSynthesis` / `SpeechRecognition`). O reconhecimento funciona em Chrome/Edge/Safari; sem ele, a atividade de fala vira "repita junto" — sem botões falsos.

## Como testar

```bash
cd lumilinguas
npm test          # = node --test tests/*.test.js
```

Cobertura dos testes: motor de repetição espaçada (intervalos 1-3-7-14-30, estados, simplificação), montagem da sessão e alternância de idiomas, portão parental (PIN + desafio de adulto), integridade dos 9 packs de conteúdo e persistência (perfil, exportação, exclusão).

## Primeiro uso (demonstração)

1. Toque em **"Área dos responsáveis"** → responda o desafio de adulto.
2. Onboarding: nome, idade, idiomas (até 4 — os 9 packs estão completos), variações regionais, interesses, consentimento, PIN, teste inicial curto.
3. A criança toca no **botão verde** e a sessão diária (~11 min) começa.
4. O painel dos responsáveis (⚙️ + PIN) mostra progresso, retenção, dificuldades, dicas do dia, gravação de voz da família, configurações e exportação/exclusão de dados.

## Documentação

| Documento | Conteúdo |
|---|---|
| [`docs/ARQUITETURA.md`](docs/ARQUITETURA.md) | Arquitetura do produto e decisões técnicas/pedagógicas |
| [`docs/FLUXOS.md`](docs/FLUXOS.md) | Fluxo da criança e dos responsáveis |
| [`docs/TELAS.md`](docs/TELAS.md) | Mapa de telas |
| [`docs/DESIGN.md`](docs/DESIGN.md) | Sistema visual e acessibilidade |
| [`docs/MODELO-DE-DADOS.md`](docs/MODELO-DE-DADOS.md) | Modelo de dados e motor de repetição espaçada |
| [`docs/STATUS.md`](docs/STATUS.md) | O que está pronto × o que depende de serviços externos |
