# Brand Rules — camada de roteamento e conflito

> **Fonte da verdade dos fatos de marca são as SKILLS**, não este arquivo.
> Este arquivo existe para: (1) apontar cada agente para a skill certa, (2) resolver o que as
> skills não cobrem, (3) travar os conflitos entre marcas. Nada de fato de marca é duplicado aqui —
> duplicar gera desvio quando a skill é atualizada.

## 1. Roteamento — qual skill ler antes de agir

| Marca / tema | Skill (ler SEMPRE antes de produzir) |
|---|---|
| Black Strategie (agência própria) | `black-strategie-content` |
| STAFF24 | `staff24-content` |
| FITARY | `fitary-content` |
| & Beauty | `content-engine` (perfil incompleto — ver §5) |
| Qualquer conteúdo publicável, qualquer marca | `content-engine` (fluxo obrigatório Canva → Notion) |
| Meta Ads, funil, social recruiting | `meta-ads-kampagne2026` |

Localização em disco (para agentes que leem arquivo):
`~/.claude/skills/synced/*/<nome-da-skill>/SKILL.md`

## 2. Anrede — a regra que mais se erra

Não existe padrão único. É por marca e por canal:

| Marca | Canal | Forma |
|---|---|---|
| **Black Strategie** | conteúdo, site, DM a lead, e-mail, oferta | **Sie** (sempre) |
| **Black Strategie** | fala da Rayana (site, Über mich, LinkedIn) | **Ich** — nunca "Wir" |
| **STAFF24** | Instagram, Facebook, TikTok | **du** |
| **STAFF24** | LinkedIn, site, e-mail, B2B | **Sie** |
| **FITARY** | tudo social e site | **du** |
| **FITARY** | pitch B2B / Corporate Health | **Sie** |

## 3. Conflito estrutural — Black Strategie × STAFF24

A Rayana é empregada da STAFF24 **e** dona da Black Strategie.

- **"Recruiting" nunca é label, nome de oferta ou tema principal da Black Strategie.**
- Se o tema aparecer para um cliente da Black Strategie: tratar como **Employer Branding**, através das pessoas da empresa, sem usar a palavra Recruiting.
- O agente `recruiting-research` serve **STAFF24 e clientes**, nunca o posicionamento da Black Strategie.
- Conteúdo de recrutamento com a marca STAFF24 é trabalho de STAFF24, não portfólio da agência.

## 4. Regras universais que as skills não cobrem

**Proibições de escrita (todas as marcas)**
- Nada de travessão/Gedankenstrich e caracteres especiais decorativos em texto de cliente da Black Strategie.
- Teste de tradução: se soa traduzido do português, reescrever.
- Teste de leitura em voz alta: se a dona de consultório não entende na primeira escuta, reescrever.
- Jargão de agência proibido em texto de cliente: Positionierung, Content-Mix, Baustein, Launch, Reporting, Funnel, Touchpoint, Performance. Dizer o que ela recebe, até quando e quanto custa.

**Obrigatório**
- Hook pega em 2 segundos.
- Um ângulo, um CTA por peça.
- Toda peça da Black Strategie paga uma das metas ativas da campanha em curso (§6). Se não paga, perguntar antes de produzir.
- Prova concreta: caso, número, prazo. Referência disponível: Dr. Enayati (Kardiologie, Wahlarzt, Wels).

**Geografia**
- Black Strategie: Wels, Linz, Oberösterreich. **Nunca Wien.**
- FITARY: Wels +15 km.
- STAFF24: Áustria inteira, 17 filiais — sempre com hashtag regional da cidade tratada.

## 5. Lacunas reais (o que ainda falta)

- **& Beauty:** perfil incompleto. Na primeira tarefa da marca, perguntar cores, público, ofertas e tom, e gravar na skill `content-engine` — não neste arquivo.
- **Clientes ativos:** [PREENCHER: nome, setor, cidade, objetivo, canal principal]
- **Benchmarks próprios de retenção/CPL por conta:** [PREENCHER após 30 dias de dado real]

## 6. Campanha ativa — CHECK (15.09 a 16.10.2026)

Metas: 25 a 35 pedidos de Check · 15 a 20 vídeos de análise · 6 a 8 reuniões · 2 a 3 Sprints · 1 Pacote · soft launch do ASSISTENT por DM.

- Entrada única em todos os canais: **Praxis-Check**, palavra-chave **CHECK**.
- Canal de resposta e agendamento: **WhatsApp. Nunca formulário.**
- Meta de CPL em Meta Ads: **2,50 a 6 €**.
- Uma recomendação por lead. Nunca cardápio de opções. Primeiro sim entre 390 e 690 €.

> Atualizar esta seção ao fim da campanha. Agente que encontrar a data vencida deve avisar em vez de trabalhar com meta velha.

## 7. Regras de venda que os agentes não podem violar

- Apresentação **nunca** vai por e-mail. Só em reunião de 30 minutos.
- Estratégia elaborada só **depois** do contrato, ou vendida separada como Strategie 690 €.
- A lacuna do cliente se nomeia **com as palavras dele da primeira conversa**, nunca como crítica.
- Preço só aparece em material público com autorização explícita.
