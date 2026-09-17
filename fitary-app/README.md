# FITARY Journey — Client Cockpit

App para acompanhar os clientes da FITARY na jornada fitness e manter todo mundo
informado sobre agendamentos, cancelamentos e evolução.

Não é uma agenda. Agenda não retém ninguém. O que retém é **prova de progresso +
comunicação no momento certo** — é isso que o app faz.

---

## Como abrir

Não tem build nem backend. Abra `fitary-app/index.html` no navegador.
Os dados ficam em `localStorage` (demo realista com 9 clientes). Botão
**"Demodaten zurücksetzen"** na barra lateral recarrega os dados.

---

## O funil, não só a agenda

O **Kennenlernen com Beweglichkeitstest — 30 minutos, gratuito — é o primeiro contato**
e o produto de entrada. Por isso a jornada começa nele:

`Kennenlernen` → `Onboarding` → `Fundament` → `Aufbau` → `Performance` → `Longevity`

Termo gratuito tem duas fraquezas conhecidas: **no-show alto** (não custa nada faltar) e
**vazamento depois do teste** (não custa nada não voltar). O app ataca as duas.

**Antes do termo**
- Regra **Erstkontakt vorbereiten**: explica o formato, pede confirmação ativa
  ("bestätige mir kurz mit passt") e torna explícito que os 30 min estão bloqueados só para a pessoa
- Regra **No-Show beim Gratis-Termin**: exatamente um follow-up, depois silêncio — sem perseguir

**Depois do termo — três janelas, uma mensagem cada**

| Estado | Janela | Mensagem |
|---|---|---|
| `heiß` | 0–2 dias | Laudo por escrito + maior limitação + recomendação + horário reservado até sexta |
| `offen` | 3–9 dias | Última chamada, com promessa explícita de não insistir de novo |
| `kalt` | 10+ dias | Reativação com re-teste gratuito — o caminho mais barato de volta à conversa |

**Conversão**
- Botão **"In Kund:in umwandeln"**: programa, contingente, dia/horário fixo, primeira sessão,
  confirmação — e **libera o acesso ao app** (ver abaixo)
- KPI **Conversion 90 T.** no cockpit: quantos dos Erstkontakte viraram cliente.
  Essa é a métrica do funil gratuito, não o número de testes
- KPI **Erstkontakte offen** com a fonte de cada lead (Instagram, indicação, Google Maps)

## O app é parte da compra, não do teste

Quem faz o teste gratuito recebe o **laudo**. Quem inicia o programa recebe o **acesso pessoal**:
magic link, todos os valores, histórico, agenda, videomensagens.

- Lead não tem token de acesso — "Zugang teilen" mostra **Zugang gesperrt** com a explicação
- Qualquer link inválido cai na tela de acesso não liberado; **nunca** no cockpit do estúdio
- A conversão gera o token (30 dias), cria o Willkommensvideo e redige duas mensagens:
  confirmação da primeira sessão e convite do acesso
- A mensagem de recomendação usa isso como argumento de venda:
  *"Den gibt es nur für Kund:innen, nicht für Probetermine."*

## As duas camadas

### 1. Cockpit do estúdio (Yalcin / Team)

| Área | O que entrega |
|---|---|
| **Cockpit** | KPIs (ocupação semanal, ativos, taxa de falta 30 dias, risco de churn, renovações), fila de **Handlungsbedarf** ordenada por impacto em receita/retenção, sessões de hoje, distribuição da jornada |
| **Kund:innen** | Lista com stage da jornada, adherence (anel), contingente, risco. Filtro por stage/risco |
| **Kundenakte** | Journey rail (Onboarding → Fundament → Aufbau → Performance → Longevity), progresso (dor, índice de força, peso) com sparkline, **Beweglichkeitstest**, confiabilidade, histórico, ações de comunicação |
| **Buchungen** | Semana completa, status por cor (gebucht / absolviert / storniert / No-Show), criar, concluir, marcar No-Show, cancelar com motivo |
| **Kommunikation** | Rascunhos prontos na voz FITARY, copiar / abrir WhatsApp / e-mail, marcar como enviado |
| **Automationen** | 8 regras que vigiam a jornada e propõem a mensagem certa. Nada sai sem você liberar |

### 2. Acesso individual do cliente (magic link 1:1 FITARY ↔ cliente)

Cada cliente tem um **magic link** com token próprio e validade de 30 dias
(`index.html?zugang=fit-xxxxx`). Abre **apenas os dados daquela pessoa**:

- próxima sessão + botão de **absagen** (cancelar) e pedir sessão extra
- **Beweglichkeitstest**: baseline → valor atual, item por item, com marcador do ponto de partida
- jornada, progresso, contingente restante
- **Freie Termine**: disponibilidade real do calendário do estúdio — horários ocupados
  simplesmente não aparecem, nunca quem os ocupa
- feed de updates (só os eventos dele)
- canal direto: WhatsApp / e-mail do estúdio

Na Kundenakte, **"Zugang teilen"**: link, data de validade, gerar novo link, revogar acesso
e mensagem de convite pronta para WhatsApp. Link inválido ou expirado **nunca** cai no
cockpit do estúdio — mostra tela de acesso expirado com CTA de WhatsApp.

---

## Os dois testes

### Beweglichkeitstest (entrada + a cada 6 semanas)

Toda jornada começa com o teste de mobilidade: **7 pontos de medição**
(Overhead Squat, ombro, flexor de quadril/Thomas, elevação ativa da perna,
tornozelo/Knee-to-Wall, estabilidade de tronco, rotação cervical), nota 1–5.

- **Baseline** no dia 1 → é dele que sai o plano
- **Re-Test a cada 6 semanas** (`RETEST_DAYS`) — regra automática avisa quando vence
- Mobility-Score 0–100 com evolução em sparkline
- Mensagem de resultado pronta: maior progresso + próxima frente de trabalho

### Leistungstest (a cada 12 semanas)

6 medidas duras, com direção: Plank (seg ↑), flexões (rep ↑), Goblet Squat 8RM (kg ↑),
500 m remo (seg ↓), pulso de repouso (bpm ↓), gordura corporal (% ↓).
**Leistungsindex** com base 100 = ponto de partida; delta em % por item; mensagem de
resultado destacando o valor mais forte.

Sem medição não existe prova de progresso — e sem prova o cliente não renova.

## Vídeo interativo

- **Willkommensvideo** por cliente, visível no acesso individual
- Player no app: marca como visto, e o cliente responde direto — **"Alles klar 👍"** ou
  **"Ich hab eine Frage"** — que vira evento no cockpit do estúdio
- Regra automática: vídeo não assistido após 2 dias → mensagem de follow-up
- Sem vídeo gravado ainda? O player mostra o **roteiro pronto de 60 s** (personalizado com
  nome, meta e fase do cliente) para o Yalcin gravar e colar o link
- Também suporta vídeo de **Testbesprechung** e **Technik-Feedback**

---

## Regras de automação

| Regra | Dispara quando | Por quê |
|---|---|---|
| Win-back | ≥ 12 dias sem treino | Maior probabilidade de churn |
| Kontingent | ≤ 2 sessões restantes | Renovar **antes** da última sessão |
| No-Show | falta nos últimos 7 dias | Janela de 24 h para resgatar |
| 24h-Erinnerung | sessão nas próximas 48 h | Derruba a taxa de falta |
| Beweglichkeitstest | sem teste há 42 dias | Baseline / Re-Test |
| Onboarding | dia 7–18 da jornada | Aqui se decide se o hábito pega |
| Meilenstein | múltiplo de 10 sessões | Melhor momento para pedir depoimento/UGC |
| Leistungstest | sem teste há 84 dias | Sem re-teste não há prova, sem prova não há renovação |
| Willkommensvideo | vídeo não visto após 2 dias | O início pessoal decide as primeiras semanas |
| Erstkontakt vorbereiten | teste nos próximos 3 dias | No-show no primeiro contato custa o cliente inteiro |
| Empfehlung nach Gratis-Termin | 0–2 dias após o teste | Janela de decisão; o termo não custou nada, o follow-up é que gera receita |
| Letzte Erinnerung | 3–9 dias | Uma ansagem clara vence três meio-termos |
| Kalter Erstkontakt | 10+ dias | Re-teste gratuito reabre a conversa |
| No-Show Gratis-Termin | faltou ao termo gratuito | Um follow-up, depois silêncio |
| Folgetermin | cliente ativo sem próxima sessão | Fechar a lacuna antes de virar rotina |

Cancelamento dispara em cadeia: confirmação ao cliente + **oferta do slot livre**
para o cliente ativo mais confiável (lista de espera) + evento no feed.

---

## Identidade visual

As cores vêm do **Canva Brand Kit "FITARY"** e das peças oficiais (Titelbild, Signatur,
Plakate/Flyer) — não de suposição:

| Token | HEX | Uso oficial |
|---|---|---|
| `--brand-green` | `#06302B` | Fundo principal (Titelbild, signatur, CTA) |
| `--brand-green-2` | `#0E4739` | Verde secundário, superfícies |
| `--brand-terracotta` | `#B3360C` | Headlines e botões (branco sobre ele = 6,1:1) |
| `--brand-white` | `#F9FFFF` | Texto sobre verde |

Sobre verde escuro o terracota puro perde contraste, então o app usa `#FF8A50` para
**texto/ícones** de acento (6,1:1) e `#B3360C` para **preenchimentos** com texto branco.
Status: `#5BE6B4` bom, `#F5B23B` atenção, `#FF5A5F` crítico — sempre com rótulo, nunca só cor.

### Logo

Coloque o arquivo real em **`fitary-app/assets/logo.svg`** (ou `.png`, ajustando o `src`
em `index.html`). Ele substitui o monograma automaticamente — sem mexer em mais nada.
Enquanto não existir, o app mostra o monograma "F" em terracota.

## Disponibilidade e auto-agendamento

O cliente vê apenas: **o próprio perfil + os horários livres**. Nada de outros clientes.

- `OPENING` define os horários do estúdio por dia da semana (hoje Seg–Qui 06–21, Sex 06–20,
  Sáb 08–14, Dom fechado) — ajuste ali
- `SLOT_MIN` (60 min), `BOOK_HORIZON` (14 dias), `LEAD_HOURS` (mínimo 12 h de antecedência)
- Horário ocupado é **omitido**, não marcado como ocupado: zero vazamento de quem treina quando
- Sem contingente → em vez de horários, aparece o pedido de renovação
- Proteção contra corrida: se alguém pegar o horário entre o carregamento e o clique,
  o app recusa e recarrega

**Decisão de produto importante:** o horário habitual do cliente aparece primeiro, em destaque
("Dein gewohnter Termin — Di 09:00"), e só abaixo vêm as alternativas, limitadas a 4 dias.
Lista infinita de horários destrói o termo fixo — e é o termo fixo que sustenta a retenção
num estúdio boutique. Quem quiser tudo, clica em "Alle freien Zeiten ansehen".

### Fontes

Hoje: Archivo (títulos) + Inter (texto). As fontes oficiais do Canva aparecem só como IDs
internos nas peças, sem nome legível — assim que você passar os nomes, a troca é uma linha
em `--font-d` / `--font-b`.

## Estrutura

```
fitary-app/
├── index.html   # shell (nav, topbar, drawer, modal, toasts)
├── app.css      # design system escuro premium
└── app.js       # modelo de dados, métricas, regras, templates, views
```

Pontos de ajuste rápido no `app.js`:

- `WEEK_CAPACITY` — capacidade semanal do estúdio (hoje 18, 1 trainer)
- `MOBI` / `RETEST_DAYS` — Beweglichkeitstest: itens e intervalo (42 dias)
- `PERF` / `PERF_RETEST` — Leistungstest: medidas, unidade, direção e intervalo (84 dias)
- `VIDEO_KINDS` — tipos de videomensagem; `welcomeScript()` gera o roteiro
- `STAGES` — fases da jornada
- `TYPES` — portfólio (PT 1:1, 2:1, Pad Work, Reha, Gruppe, Jugend-Athletik)
- `TPL` — textos das mensagens (voz FITARY)
- `RULES` — regras de automação

---

## Próximos passos para produção

1. **Backend** — substituir `localStorage` por API + banco (clientes, bookings, testes, mensagens)
2. **Offisy** — sincronizar agenda, Kundenakte e faturamento. Offisy cobre booking online 24/7,
   calendário, ficha de cliente e faturas; a existência e o escopo de API/webhook precisam ser
   confirmados com o suporte deles. Plano B: export/import + Zapier. O app segue como camada de
   jornada, testes e comunicação — não substitui o Offisy
3. **WhatsApp Cloud API** — envio real das mensagens (hoje: rascunho + deep link)
4. **Magic link em produção** — hoje o token é gerado no cliente; em produção ele deve ser
   assinado no servidor, com expiração e revogação persistidas
5. **Push/Reminder automático** — cron para 24h-Erinnerung e Re-Test
6. **GDPR** — dados de saúde exigem consentimento explícito, base legal e política de retenção
