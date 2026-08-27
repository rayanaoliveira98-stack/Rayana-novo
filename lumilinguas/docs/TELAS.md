# Mapa de telas

## Área infantil (sem leitura, uma instrução por tela)

| Tela | id | Elementos |
|---|---|---|
| Seleção de perfil | `screen-splash` | Logo, bolhas de perfil (avatar + nome), link discreto para responsáveis |
| Casa | `screen-home` | Personagem do idioma (flutuando), botão verde ▶ gigante, pílula "Dia N", 🗺️ mapa, ⭐ adesivos, prévia dos últimos adesivos |
| Mapa da jornada | `screen-map` | 60 bolinhas em trilha, cor por semana temática, ⭐ nos dias feitos, personagem no dia atual, emblemas de fase |
| Adesivos | `screen-stickers` | Grade de adesivos ganhos (um por dia de sessão) |
| Sessão | `screen-session` | Barra de progresso suave (sem números), ✕ discreto, palco da atividade |

### Palcos de atividade (dentro da sessão)

| Atividade | Elementos |
|---|---|
| Boas-vindas / vinheta de idioma | Personagem grande + jingle de 3 notas + cor do idioma |
| Apresentação | Emoji herói (110px+), imagens alternativas em botões, 🔊 repetir, 🐢 devagar, ➜ continuar |
| Ouça e toque | Dica 👂, 3-4 cartões grandes (por idade) |
| Ligue o som à imagem | Dica 🎵, frase completa + 4 cartões |
| Encontre no cenário | Cenário ilustrado com 6 objetos posicionados |
| Qual desapareceu? | 3 cartões falados → cobertos ❓ → um some → escolha |
| Arraste para o lugar | Zona pontilhada com silhueta + 3 objetos arrastáveis |
| Siga a instrução | Dica 🫲, frase de ação + 3 cartões |
| Repita em voz alta | Emoji herói, 🎤 grande (ou ✅ "repeti!" sem reconhecimento), 🔊/🐢 |
| Quem falou? (5-7) | Conceito + 2 personagens de idiomas com borda na cor de cada um |
| Celebração | 🎉 + confete + elogio falado no idioma |
| Elogio | Overlay ⭐ + som suave + frase positiva no idioma |

## Área dos responsáveis (protegida)

| Tela | id | Elementos |
|---|---|---|
| Portão parental | `gate-modal` | PIN (4-6 dígitos) ou desafio de multiplicação na 1ª vez |
| Onboarding | `screen-onboarding` | 13 passos com barra de progresso (ver FLUXOS.md) |
| Painel | `screen-parent` | 7 abas: Progresso, Dificuldades, Sessões, Dicas, Voz da família, Configurações, Dados |

## Painel administrativo (equipe de conteúdo)

| Tela | Arquivo | Elementos |
|---|---|---|
| Revisão de conteúdo | `admin.html` | Tabela completa por idioma (todos os campos + variações regionais), ▶ teste de áudio TTS, validador de todos os packs, importação JSON/CSV, exportação de pack, remoção de packs importados |

Bandeiras de países aparecem **apenas** nas áreas de adulto (onboarding, painel, admin) — na área infantil cada idioma é personagem + cor + som, para não ensinar que um idioma pertence a um único país.
