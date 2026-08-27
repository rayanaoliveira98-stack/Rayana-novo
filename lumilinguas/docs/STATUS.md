# Status: pronto × pendente

Nenhum botão falso: tudo que aparece na interface funciona. O que não pôde ser
concluído nesta versão está listado abaixo com a evolução necessária.

## ✅ Pronto e funcional (nesta demonstração)

- Jornada de 60 dias em 9 fases temáticas; mapa visual; adesivos; celebrações.
- **36 conceitos completos em 9 idiomas** (pt-BR, EN GB/US, DE padrão/AT, ES europeu/latino, FR, IT, TR, ZH+pinyin, JA+rōmaji) — palavra, artigo, plural, adjetivo, ação, frase, pergunta, resposta, sinônimo, variações regionais, 3 imagens por conceito.
- Onboarding completo dos responsáveis (13 passos, incl. consentimento, PIN e teste inicial).
- Escolha de 1-4 idiomas, alterável depois nas configurações.
- Sessão diária adaptativa (~11 min) com o ciclo completo: boas-vindas → dificuldades de ontem → revisões SRS → 2-6 conceitos novos → compreensão → repetição oral → jogo → desafio misto → celebração → 4 dicas práticas do dia.
- Motor SRS com os 7 estados e intervalos 1-3-7-14-30 dias; simplificação após 3 dias de dificuldade; sem punição.
- Blocos separados por idioma (3-4 anos) e comparação entre idiomas (5-7 anos).
- 8 modos de atividade: apresentar, ouvir-e-tocar, repetir, som→imagem, encontrar no cenário, qual desapareceu, arrastar, seguir instrução, "quem falou?".
- Voz sintética por idioma (velocidade normal + modo lento 🐢 + repetição por toque).
- Gravação da voz da família (local, com prioridade sobre TTS).
- Reconhecimento de fala com avaliação tolerante (3 tentativas, replay lento, "Quase!", marcação silenciosa) **onde o navegador suporta**; fallback honesto "repita junto".
- Painel dos responsáveis: progresso por idioma, estados, retenção 1/3/7/14/30d, dificuldades, histórico, tempo de uso, dicas, configurações, troca de PIN, multi-perfil, exportação JSON e exclusão total.
- Painel administrativo (`admin.html`): revisão de todos os campos e variações, teste de áudio, validador, importação JSON/CSV sem rebuild, exportação de packs.
- Offline após a primeira visita (Service Worker) + instalação PWA (iOS/Android).
- Testes automatizados: SRS, montagem/alternância de sessão, portão parental, integridade dos packs, persistência (28 testes).

## ⚠️ Funcional com limitação conhecida

| Item | Situação | Evolução necessária |
|---|---|---|
| Reconhecimento de fala | Web Speech API: em Chrome/Android o áudio é processado pelo serviço de fala do sistema (nuvem do SO); Safari/iOS usa o motor local | Produção: motor infantil dedicado on-device (ex.: Vosk/whisper.cpp compilado p/ mobile) com modelos acústicos de voz infantil |
| Vozes | TTS do sistema — qualidade varia por aparelho; "vozes diferentes" = voz do sistema + gravações da família | Produção: pacotes de áudio gravados por falantes nativos (adultos e crianças), baixáveis por idioma |
| Ilustrações | Emoji do sistema (originais, sem copyright de terceiros) | Produção: ilustrações originais encomendadas; basta trocar `emoji` por caminho de imagem no currículo |
| Músicas e rimas originais | Não incluídas (apenas jingles de 3 notas por idioma) | Produção musical original + modo "música" como novo tipo de atividade |
| Minibiografias/histórias interativas e caça ao objeto em casa | Não incluídas nesta versão | Novo tipo de atividade sobre a mesma infraestrutura (`activities.js`) |
| Notificação do horário habitual | Horário é salvo, mas não notifica | Notification API + push local no empacotamento nativo |
| Certificado final personalizado | Jornada e mapa prontos; tela de certificado no dia 60 ainda não desenhada | Tela de certificado imprimível com nome, idiomas e conquistas |

## ⭕ Depende de serviços externos (não incluído por decisão)

- **Sincronização entre aparelhos / backup em nuvem** — exige backend com autenticação dos responsáveis e política de retenção; o modelo local já expõe exportação/importação como ponte.
- **Distribuição nas lojas (App Store / Play)** — empacotar o PWA com Capacitor; contas de desenvolvedor e revisão das lojas.
- **Consentimento parental verificável forte** (cartão de crédito/documento, exigido em alguns mercados COPPA/GDPR-K) — requer provedor externo; a demo usa confirmação de adulto + declaração de responsabilidade.
- **Análise de pronúncia fonema a fonema** — requer serviço/modelo especializado em fala infantil.
- **Conteúdo dos dias 8-60 além dos 36 conceitos-semente** — o pipeline (packs + admin + importação) está pronto; faltam os dados produzidos por linguistas para chegar a 250-350 conceitos e 80-120 frases por idioma.
