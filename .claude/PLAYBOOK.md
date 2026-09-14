# PLAYBOOK — Black Strategie

Tudo em um lugar: marcas, campanha, sistema de outbound, ofertas, agentes e frameworks de decisão.

**Painel visual (abre no celular):** https://claude.ai/code/artifact/c3e665ec-4890-4080-a049-aaea7f8efec6
Fonte do painel: `.claude/playbook-panel.html`. Ao editar este playbook, atualizar o painel também.

**A única coisa que não está aqui:** os fatos detalhados de cada marca. Eles vivem nas skills
(`black-strategie-content`, `staff24-content`, `fitary-content`, `content-engine`,
`meta-ads-kampagne2026`), que carregam sozinhas em qualquer sessão. Copiá-los para cá criaria duas
versões da verdade e a segunda desatualiza em uma semana. Este playbook é a camada de operação
e decisão; as skills são a camada de fato.

---

## 0. Como usar

### Onde cada coisa funciona

| O quê | Onde | Como chamar |
|---|---|---|
| Os 9 agentes | Claude Code, **neste projeto** | "usa o `prospect-scanner` em..." |
| As skills de marca | claude.ai e Claude Code, em qualquer lugar | sozinhas, é só falar da marca |
| Playbook e painel | qualquer navegador, celular incluso | o link acima |

Na claude.ai normal os agentes não existem. Lá só as skills funcionam. Os agentes moram neste projeto.

### Os cinco fluxos do dia

| Situação | O que digitar | O que volta |
|---|---|---|
| **Prospectar** | "usa o prospect-scanner em dentistas de Wels" | ficha, nota dos 6 critérios, Geld-Lücke, e-mail em Sie-Form |
| **Criar conteúdo** | "reel para FITARY sobre dor nas costas" → "passa no brand-check" | hook, script, legenda, hashtags, já auditados |
| **Planejar a semana** | "roda o trend-scout" → "hook-lab para STAFF24 no TikTok, B2C" | tendências filtradas e hooks acima de 8 |
| **Antes de mexer em verba** | "roda o performance-analyst na conta CHECK, últimos 14 dias" | onde vaza, 3 ações, e o que não fazer |
| **Fim do mês** | "client-report do cliente X" | relatório que defende o trabalho |

Lote grande de prospect: *"roda em paralelo, um agente por 10 prospects"*.

### Regra de ouro
Nada vai ao ar sem `brand-check`. Saúde, fitness e estética passam também por `health-fact-check`.
Esses dois não são opcionais: são o que impede output genérico e promessa juridicamente arriscada.

### Como manter vivo
- Fato novo de marca (preço, oferta, cliente) → *"atualiza a skill `black-strategie-content` com isso"*
- Regra de operação, meta de campanha, aprendizado de venda → *"atualiza o playbook"*

Agente não tem memória. O que não for gravado morre no chat.

---

## 1. Campanha ativa — CHECK · 15.09 a 16.10.2026

| Meta | Número |
|---|---|
| Pedidos de Check | 25 a 35 |
| Vídeos de análise | 15 a 20 |
| Reuniões | 6 a 8 |
| Website-Sprints | 2 a 3 |
| Aufbau-Paket | 1 |
| ASSISTENT | soft launch por DM |

- Entrada única em todos os canais: **Praxis-Check**, palavra-chave **CHECK**.
- Resposta e agendamento: **WhatsApp. Nunca formulário.**
- CPL alvo em Meta Ads: **2,50 a 6 €**.
- Toda peça produzida paga uma dessas metas. Se não paga, perguntar antes de produzir.
- Campanha vencida: atualizar esta seção. Agente que encontrar data vencida avisa em vez de analisar contra meta velha.

---

## 2. As quatro marcas

| Marca | Skill | Anrede | Geografia | Erro fatal |
|---|---|---|---|---|
| **Black Strategie** | `black-strategie-content` | **Sie** sempre · Rayana fala em **Ich**, nunca Wir | Wels, Linz, OÖ · **nunca Wien** | soar como agência genérica |
| **STAFF24** | `staff24-content` | **du** no social · **Sie** no LinkedIn, site e B2B | Áustria, 17 filiais · sempre hashtag regional | esquecer o público duplo B2B + B2C |
| **FITARY** | `fitary-content` | **du** · **Sie** só em pitch B2B | Wels +15 km | copy de academia barata |
| **& Beauty** | `content-engine` | a definir | Áustria | perfil ainda incompleto |

### Conflito estrutural — Black Strategie × STAFF24
Rayana é empregada da STAFF24 e dona da Black Strategie.

- **Recruiting nunca é label, nome de oferta ou tema principal da Black Strategie.**
- Tema de pessoal para cliente da agência vira **Employer Branding através das pessoas da empresa**, sem a palavra Recruiting.
- O agente `recruiting-research` serve STAFF24 e clientes. Nunca o posicionamento da agência.

---

## 3. Sistema de outbound (motor principal)

**Filtro Google Maps:** entra só quem tem **nota ≥ 4,5 E ≥ 40 avaliações**.
Nota alta significa negócio que funciona e gargalo digital. Esse é o cliente certo.

**Perfil primário:** Praxen e Ordinationen com foco em Selbstzahler — Wahlärzte, Ästhetik, Implantologie, Physiotherapie.
**Secundário:** Selbstständige e KMU de serviço em Wels e arredores.

**Auditoria de site — 6 critérios, 1 a 5 cada:**

| Critério | 1 | 5 |
|---|---|---|
| Aussehen | parece 2012, template genérico | atual, própria, confiável |
| Mobile | quebra, texto pequeno, lento | impecável no celular |
| CTA above the fold | nenhum, ou só "Kontakt" no menu | ação clara sem rolar |
| Social Proof | nenhuma prova visível | avaliações, casos, rostos |
| Angebotsklarheit | não se entende o que se compra | oferta clara em 5 segundos |
| Funktion | link quebrado, formulário morto | tudo funciona, carrega rápido |

**Soma ≤ 19 = lead.** ≥ 20 = descartar, o site já funciona.

**Sequência:** auditoria → construir a nova versão do site em subdomínio (ou gravar o vídeo de análise)
→ só então o e-mail, com lista vorher/nachher e a Geld-Lücke.
Valor antes da conversa. Nunca o contrário.

---

## 4. Escada de ofertas (única fonte de preço, excl. USt.)

| # | Oferta | Preço | Nota |
|---|---|---|---|
| 1 | Praxis-Check | grátis | vídeo de análise em 48 h por WhatsApp |
| 2 | Website-Sprint | 690 € | 7 dias, abatido no Aufbau-Paket |
| 3 | Aufbau-Paket | 1.990 € | Strategie 690 + Website 1.290 + Profile 390 · pagamento 50/50 |
| 4 | Begleitung 6 meses | 590 €/mês schlank · 890 €/mês voll | verba de anúncio 200 a 300 €/mês separada |
| 5 | ASSISTENT · DIY Workshop | 149 € (launch 97 €) · workshop 3 h em Wels | ASSISTENT abatido no workshop |

**Regras de venda, não negociáveis:**
- Uma recomendação por lead. Nunca cardápio. Primeiro sim entre **390 e 690 €**.
- Apresentação **nunca** por e-mail. Só em reunião de 30 minutos.
- Depois, oferta de **uma página**: serviços, preço, prazo, próximos passos.
- Estratégia elaborada só **depois** do contrato, ou vendida à parte como Strategie 690 € e abatida.
- Duas versões de toda oferta: Terminfassung com mockups (só mostrada) e Versandfassung em PDF reduzido. A .pptx nunca sai.
- A lacuna do cliente se nomeia **com as palavras dele da primeira conversa**, nunca como crítica.
- Preço em material público só com autorização explícita.

---

## 5. O time de agentes

| Agente | Entrega | Quando |
|---|---|---|
| `prospect-scanner` | filtro + auditoria de 6 critérios + Geld-Lücke + e-mail pronto | prospecção em lote |
| `competitor-recon` | padrão da categoria e 3 lacunas exploráveis | antes de posicionamento ou campanha |
| `hook-lab` | 20 hooks gerados, só os ≥ 8 entregues, com A/B | matéria-prima de abertura |
| `brand-check` | veredito + versão corrigida | **sempre**, antes de publicar ou enviar |
| `recruiting-research` | motivadores reais e linguagem do candidato | vaga ou campanha (STAFF24 e clientes) |
| `trend-scout` | tendência filtrada por marca, com adaptação escrita | semanal, planejamento de calendário |
| `performance-analyst` | onde o dinheiro vaza e as 3 ações | revisão de campanha, antes de escalar verba |
| `health-fact-check` | risco jurídico + reescrita que mantém a força | **obrigatório** em FITARY, clínicas, & Beauty |
| `client-report` | relatório que defende o trabalho | fechamento mensal, renovação |

**Como chamar**
- Direto: "usa o prospect-scanner nesses 12 dentistas de Wels."
- Paralelo: "roda em paralelo: competitor-recon nos estúdios de PT de Linz, recruiting-research para Pflegekraft em OÖ, trend-scout da semana."
- Encadeado: "hook-lab para FITARY no Instagram → eu escrevo o script → brand-check → health-fact-check."

**Regras de operação**
1. Copy final não sai de agente. Agente gera matéria-prima e audita; o texto que vai ao ar passa pelo fluxo principal.
2. Nada publica sem `brand-check`. Saúde passa também por `health-fact-check`.
3. Agente não tem memória. O que precisa persistir vai para a skill da marca ou para este playbook.
4. Sonnet para varredura (`prospect-scanner`, `trend-scout`), Opus para estratégia e QA.
5. Conteúdo aprovado segue o fluxo da skill `content-engine`: Canva → calendário Notion da marca.

---

## 6. Como decidir (a camada que falta na maioria dos prompts)

### Matriz ICE-R
**Score = (Impacto × Confiança) ÷ Esforço**, e qualquer item de **Reversibilidade** baixa vai para revisão manual.

| Eixo | Pergunta |
|---|---|
| Impacto | move receita, leads ou candidatos? Ou é métrica de vaidade? |
| Confiança | temos prova? (dado próprio > caso de mercado > intuição) |
| Esforço | horas + dependência de terceiro |
| Reversibilidade | se der errado, perde tempo ou queima marca e verba? |

**Máximo 3 recomendações por rodada.** Lista de 10 ideias é fuga de decisão.

### Ordem de gargalo
Nunca sugerir "mais conteúdo" antes de checar, nesta ordem:
**1 Oferta → 2 Posicionamento → 3 Prova → 4 Distribuição → 5 Conversão → 6 Retenção.**
O gargalo real quase nunca é o 4, que é onde todo mundo gasta dinheiro.

### Orgânico ou pago
- **Orgânico:** autoridade, prova de competência, aquecer o mercado local, candidato passivo.
- **Pago:** escalar o que já provou retenção, volume com prazo curto, retargeting.
- Não escalar em pago criativo que não passou do benchmark de retenção no orgânico.

### Tom por plataforma
| Plataforma | Função | Formato que performa |
|---|---|---|
| Instagram | autoridade, prova, comunidade local | Reels 7 a 25s, carrossel de bastidor, Stories diários |
| TikTok | alcance frio, descoberta | talking head 15 a 40s, POV, resposta a comentário |
| LinkedIn | decisor B2B, employer branding | texto com opinião, caso com número, sem hashtag-spam |
| Meta Ads | volume e captação | UGC 15 a 30s, hook falado no primeiro segundo, legenda queimada |

---

## 7. Viralidade e conversão

### Score de hook (0 a 10) — corte em 8
Dois pontos por critério: **tensão imediata · especificidade · custo de ignorar · originalidade · encaixe de marca.**
Abaixo de 8 não vai para produção. Não se publica "o melhor dos ruins".

### Gatilhos (máximo 2 por peça)
contradição do senso comum · erro caro nomeado · bastidor e acesso · identidade · prova concreta · inimigo comum (nunca uma pessoa real).

### Estrutura de conversão
**0–2s interrupção** (tensão, não contexto) → **2–6s identificação** → **6–15s reenquadramento** (a causa real, diferente do que ele pensa) → **15–25s prova** → **25s+ um caminho só, de baixo atrito**.

### Diagnóstico por métrica
| Sintoma | Causa provável | Ação |
|---|---|---|
| Alcance alto, salvamento baixo | entretém, não serve | trocar ângulo por utilidade específica |
| Retenção cai antes de 3s | hook fraco, abertura parada | reescrever hook, cortar o primeiro segundo |
| Retenção cai no meio | promessa entregue cedo, ritmo lento | reestruturar em 3 blocos |
| Muito comentário, zero lead | CTA ausente ou de alto atrito | CTA único, DM com palavra-chave |
| Lead alto, fechamento baixo | desalinhamento oferta/anúncio, follow-up lento | requalificar criativo, medir tempo de resposta |
| CPM subindo, CTR estável | fadiga de público | ampliar público antes de trocar criativo |
| CTR caindo, CPM estável | fadiga de criativo | novo hook, mesmo corpo |

### Benchmarks de corte (vídeo curto, orgânico)
Retenção 3s < 55% → hook reprovado · watch-through < 25% → estrutura reprovada ·
salvamento + compartilhamento < 1% do alcance → sem valor percebido ·
comentários < 0,5% do alcance → sem gatilho de conversa.
*Números de mercado. Substituir pelos teus após 30 dias de dado real.*

---

## 8. Regras de escrita (todas as marcas)

**Proibido**
- Travessão e caracteres decorativos em texto de cliente da Black Strategie.
- Jargão de agência em texto de cliente: Positionierung, Content-Mix, Baustein, Launch, Reporting, Funnel, Touchpoint, Performance. Dizer o que ela recebe, até quando e quanto custa.
- Aberturas mortas: "Wusstest du, dass" · "3 Tipps für" · "Als Unternehmer weißt du" · "Wir steigern deine Reichweite" · "Bist du bereit ins Schwitzen zu kommen?" · citação motivacional como hook.
- Emoji como estrutura de lista. Mais de um CTA por peça.

**Dois testes antes de entregar**
1. **Tradução:** soa traduzido do português? Reescrever.
2. **Leitura em voz alta:** a dona de consultório entende na primeira escuta? Se não, reescrever.

**Padrão que funciona**
Virar uma suposição do público de cabeça para baixo.
*"Sie posten jede Woche. Und trotzdem ruft niemand an. Hier ist der Grund."*

---

## 9. O que ainda falta

| Item | Por que trava | Quem resolve |
|---|---|---|
| Perfil da & Beauty | único perfil vazio; todo output sai genérico | 10 min de resposta → gravar na skill `content-engine` |
| Lista de clientes ativos | agentes trabalham cegos no contexto de setor | preencher abaixo |
| Benchmarks próprios | os números de corte são de mercado, não teus | 30 dias de dado da campanha CHECK |

**Clientes ativos:** [PREENCHER: nome, setor, cidade, objetivo, canal principal]
