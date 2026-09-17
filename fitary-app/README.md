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

### 2. Acesso individual do cliente (1:1 FITARY ↔ cliente)

Cada cliente tem um código próprio (`FIT-XX###`). O link
`index.html?zugang=FIT-MA100` abre **apenas os dados daquela pessoa**:

- próxima sessão + botão de **absagen** (cancelar) e pedir sessão extra
- **Beweglichkeitstest**: baseline → valor atual, item por item, com marcador do ponto de partida
- jornada, progresso, contingente restante
- feed de updates (só os eventos dele)
- canal direto: WhatsApp / e-mail do estúdio

Na Kundenakte: **"Zugang teilen"** gera link + código + mensagem de convite.

---

## Beweglichkeitstest — o início da jornada

Toda jornada começa com o teste de mobilidade: **7 pontos de medição**
(Overhead Squat, ombro, flexor de quadril/Thomas, elevação ativa da perna,
tornozelo/Knee-to-Wall, estabilidade de tronco, rotação cervical), nota 1–5.

- **Baseline** no dia 1 → é dele que sai o plano
- **Re-Test a cada 6 semanas** (`RETEST_DAYS`) — regra automática avisa quando vence
- Mobility-Score 0–100 com evolução em sparkline
- Mensagem de resultado pronta: maior progresso + próxima frente de trabalho

Sem medição não existe prova de progresso — e sem prova o cliente não renova.

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
| Folgetermin | cliente ativo sem próxima sessão | Fechar a lacuna antes de virar rotina |

Cancelamento dispara em cadeia: confirmação ao cliente + **oferta do slot livre**
para o cliente ativo mais confiável (lista de espera) + evento no feed.

---

## Estrutura

```
fitary-app/
├── index.html   # shell (nav, topbar, drawer, modal, toasts)
├── app.css      # design system escuro premium
└── app.js       # modelo de dados, métricas, regras, templates, views
```

Pontos de ajuste rápido no `app.js`:

- `WEEK_CAPACITY` — capacidade semanal do estúdio (hoje 18, 1 trainer)
- `MOBI` / `RETEST_DAYS` — itens do teste e intervalo de re-teste
- `STAGES` — fases da jornada
- `TYPES` — portfólio (PT 1:1, 2:1, Pad Work, Reha, Gruppe, Jugend-Athletik)
- `TPL` — textos das mensagens (voz FITARY)
- `RULES` — regras de automação

---

## Próximos passos para produção

1. **Backend** — substituir `localStorage` por API + banco (clientes, bookings, testes, mensagens)
2. **Eversports** — sincronizar bookings via API/webhook; o app continua sendo a camada de jornada e comunicação
3. **WhatsApp Cloud API** — envio real das mensagens (hoje: rascunho + deep link)
4. **Login por cliente** — trocar o código de acesso por magic link com expiração
5. **Push/Reminder automático** — cron para 24h-Erinnerung e Re-Test
6. **GDPR** — dados de saúde exigem consentimento explícito, base legal e política de retenção
