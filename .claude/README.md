# Time de IA — Black Strategie

Três camadas. A ordem importa.

```
brand-rules.md          → o cérebro (quem somos, o que nunca fazemos)
frameworks/             → como decidir (prioridade, viralidade, conversão)
agents/                 → os braços (executam em contexto separado, em paralelo)
```

Agente sem as duas primeiras camadas produz conteúdo genérico rápido. Por isso elas existem.

## Os 9 agentes

| Agente | Para quê | Quando chamar |
|---|---|---|
| `prospect-scanner` | audita prospect e devolve ficha + primeira DM | prospecção em lote |
| `competitor-recon` | acha a lacuna do mercado | antes de posicionamento ou campanha |
| `hook-lab` | 20 hooks → só os ≥ 8 | matéria-prima de abertura |
| `brand-check` | QA antes de publicar | **sempre**, antes de enviar/postar |
| `recruiting-research` | o que o candidato realmente quer | antes de vaga ou campanha de recrutamento |
| `trend-scout` | tendência com filtro de marca | semanal / planejamento de calendário |
| `performance-analyst` | onde o dinheiro está vazando | revisão de campanha, antes de escalar verba |
| `health-fact-check` | compliance de saúde (Áustria) | **obrigatório** em FITARY, clínicas, & Beauty |
| `client-report` | relatório que faz renovar | fechamento mensal |

## Como usar

Direto: "usa o prospect-scanner nesses 12 dentistas de Wels."

Em paralelo (é aqui que ganha tempo de verdade):
> "Roda em paralelo: competitor-recon nos estúdios de PT de Linz, recruiting-research para Pflegekraft em OÖ, e trend-scout da semana."

Encadeado (o fluxo padrão de produção):
> "hook-lab para FITARY no Instagram → escrevo o script → brand-check → health-fact-check."

## Regras de operação

1. **Copy final não sai de agente.** Agente gera matéria-prima e audita. O texto que vai ao ar passa pelo fluxo principal, onde o tom é controlado.
2. **Nada publica sem `brand-check`.** Conteúdo de saúde passa também por `health-fact-check`.
3. **Agente não tem memória entre execuções.** O que precisa persistir vai para `brand-rules.md`. Todo aprendizado novo sobre marca ou cliente se escreve lá, não no chat.
4. **Cada execução custa token.** Sonnet para varredura (`prospect-scanner`, `trend-scout`), Opus para estratégia e QA.
5. **Campos `[PREENCHER]` são teus.** Enquanto estiverem vazios, os agentes trabalham cegos nessa parte.

## Próximo passo obrigatório

Abre `brand-rules.md` e preenche os `[PREENCHER]`. Especialmente:
- prova real da Black Strategie (casos com número e prazo)
- oferta principal
- & Beauty
- lista de clientes ativos

Sem isso o time roda a 60%.
