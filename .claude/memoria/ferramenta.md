# Memória · a própria ferramenta

O que foi aprendido sobre o sistema, não sobre as marcas.

## 2026-09-16 · A sessão em nuvem não acessa a web
**O quê:** a política de rede do Claude Code na web bloqueia todo site externo, incluindo Google Maps e sites de prospect. Testado e confirmado.
**Por quê:** política de egress do ambiente, não falha pontual.
**Consequência:** `prospect-scanner` não roda na nuvem. `competitor-recon`, `trend-scout` e `health-fact-check` ficam parciais. Saídas: plugin com MCP, que não passa pelo egress, ou Claude Code local.

## 2026-09-16 · Buscar resumo não substitui o dado
**O quê:** para a mesma clínica, duas buscas devolveram 3,9 com 168 avaliações e 4,9.
**Por quê:** resumo de busca é gerado, não é o dado bruto do Maps.
**Consequência:** nenhuma célula de auditoria se preenche com dado de busca. Regra dura no `prospect-scanner`.

## 2026-09-16 · O brand-check pega erro do próprio Claude
**O quê:** reprovou o primeiro rascunho da semana 1 por número sem fonte, limiar interno publicado e três perguntas escritas com ponto final.
**Por quê:** o agente audita o output venha de onde vier.
**Consequência:** o passo não é opcional nem quando quem escreveu foi o Claude.
