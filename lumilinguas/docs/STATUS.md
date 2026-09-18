# Status: pronto × pendente

Nenhum botão falso: tudo que aparece na interface funciona. O que não pôde ser
concluído nesta versão está listado abaixo com a evolução necessária.

## ✅ Pronto e funcional (nesta demonstração)

- Jornada de 60 dias em 9 fases temáticas; mapa visual; adesivos; celebrações.
- **36 conceitos completos em 9 idiomas** (pt-BR, EN GB/US, DE padrão/AT, ES europeu/latino, FR, IT, TR, ZH+pinyin, JA+rōmaji) — palavra, artigo, plural, adjetivo, ação, frase, pergunta, resposta, sinônimo, variações regionais, 3 imagens por conceito.
- **Interface dos responsáveis em 6 idiomas** (português, inglês, alemão, espanhol, italiano e turco), com detecção pelo idioma do aparelho e troca no onboarding e em Configurações. Independente dos 9 idiomas de aprendizagem.
- **Instalável no iOS e no Android** como PWA: ícones PNG (192/512/maskable e apple-touch 180), meta tags do iOS para abrir em tela cheia, e todo o conteúdo em cache offline.
- Onboarding completo dos responsáveis (13 passos, incl. consentimento, PIN e teste inicial).
- Escolha de 1-4 idiomas, alterável depois nas configurações.
- Sessão diária adaptativa que **respeita a duração escolhida** (8, 11 ou 15 min): o tempo é repartido entre os idiomas do dia, com reserva para um conceito novo e para o jogo em contexto. Ciclo completo: boas-vindas → dificuldades de ontem → revisões SRS → 2-6 conceitos novos → compreensão → repetição oral → jogo → desafio misto → celebração → 4 dicas práticas do dia.
- Motor SRS com os 7 estados e intervalos 1-3-7-14-30 dias; simplificação após 3 dias de dificuldade; sem punição.
- **Escada de produção** (`js/ladder.js`): cada palavra sobe sete degraus por criança e idioma — ouvir → reconhecer → responder com o corpo → repetir com modelo → completar a frase → falar sozinha → usar em conversa. A atividade do dia sai do degrau, nunca de sorteio.
- **A criança fala**: três atividades produtivas novas (completar a frase, nomear sem modelo, responder em conversa), com apoio entregue só depois da tentativa.
- **Detecção de voz por volume** (`SPEECH.detectVoice`): o app confirma que a criança falou mesmo sem reconhecimento de fala, em qualquer aparelho com microfone. Nada é gravado nem enviado.
- **Respeito ao desenvolvimento**: período silencioso por idade, teto de exigência por idade (3 anos param em "repete com modelo"), e silêncio tratado como sinal — nunca como erro.
- **Ritmo controlado**: limite de trabalho em aberto (para de apresentar novidade enquanto há muito a meio caminho) e espaçamento limitado pelo degrau, para a palavra não sumir antes de a criança conseguir falá-la.
- Aba **🪜 Evolução** no painel dos responsáveis, mostrando quantas palavras estão em cada degrau e quantas já saem da boca da criança.
- Blocos separados por idioma (3-4 anos) e comparação entre idiomas (5-7 anos).
- 14 modos de atividade: apresentar, ouvir-e-tocar, repetir, som→imagem, encontrar no cenário, qual desapareceu, arrastar, seguir instrução, "quem falou?", **jogo da memória auditiva**, **imite o personagem**, **história interativa**, **música e rima**, **caça ao objeto em casa**.
- Momento especial do dia em rodízio (história → música → caça em casa), para nenhum dia repetir o anterior.
- Camada de dinâmica: transição entre atividades, mascote-guia que pensa/escuta/comemora, partículas no toque, estrela que voa para o contador, vibração suave, cenários que respiram, casa com o colecionado flutuando, mapa em trilha serpenteante, adesivos que falam ao toque.
- Ajuda sem pressão: se a criança fica parada ~9 s, o áudio volta sozinho e a resposta certa pulsa de leve.
- Voz sintética por idioma (velocidade normal + modo lento 🐢 + repetição por toque).
- Gravação da voz da família (local, com prioridade sobre TTS).
- Reconhecimento de fala com avaliação tolerante (3 tentativas, replay lento, "Quase!", marcação silenciosa) **onde o navegador suporta**; fallback honesto "repita junto".
- Recuperação de PIN pelo desafio de adulto, sem perder nenhum dado.
- Painel dos responsáveis: progresso por idioma, estados, retenção 1/3/7/14/30d, dificuldades, histórico, tempo de uso, dicas, configurações, troca de PIN, multi-perfil, exportação JSON e exclusão total.
- Painel administrativo (`admin.html`): revisão de todos os campos e variações, teste de áudio, validador, importação JSON/CSV sem rebuild, exportação de packs.
- Offline após a primeira visita (Service Worker) + instalação PWA (iOS/Android).
- Testes automatizados: SRS, escada de produção, montagem/alternância de sessão, portão parental, integridade dos packs, persistência, recuperação de PIN, cobertura dos 6 idiomas da interface, duração da sessão e uma **simulação dos 60 dias completos** que exige que a criança chegue a falar (74 testes).

## ⚠️ Funcional com limitação conhecida

| Item | Situação | Evolução necessária |
|---|---|---|
| Reconhecimento de fala | Web Speech API quando existe; onde não existe, o app usa detecção de voz por volume (sabe que a criança falou, não o que falou) e, sem microfone, ela fala em voz alta e confirma no botão | Produção: motor infantil dedicado on-device (ex.: Vosk/whisper.cpp compilado p/ mobile) com modelos acústicos de voz infantil, para avaliar a pronúncia e não só a presença da fala |
| Vozes | TTS do sistema — qualidade varia por aparelho; "vozes diferentes" = voz do sistema + gravações da família | Produção: pacotes de áudio gravados por falantes nativos (adultos e crianças), baixáveis por idioma |
| Ilustrações | Emoji do sistema (originais, sem copyright de terceiros) | Produção: ilustrações originais encomendadas; basta trocar `emoji` por caminho de imagem no currículo |
| Músicas e rimas | Atividade pronta: melodia por idioma + palavra cantada em compasso de três repetições, montada a partir do vocabulário do dia | Produção musical original gravada (canções completas com refrão) no lugar da melodia sintetizada |
| Histórias interativas | Atividade pronta: 3 cenas narradas com escolha da criança a cada cena, montadas a partir do vocabulário já trabalhado | Roteiros autorais ilustrados por tema, escritos por especialistas, e minibiografias de personagens |
| Notificação do horário habitual | Horário é salvo, mas não notifica | `@capacitor/local-notifications` no empacotamento nativo — PWA no iOS não permite notificação local |
| Publicação nas lojas | `capacitor.config.json` pronto e o app empacota sem build; o passo a passo está em [LOJAS.md](LOJAS.md) | Contas de desenvolvedor (Apple e Google), assinatura dos pacotes e submissão dependem das suas credenciais |
| Persistência no iOS | `localStorage` pode ser descartado pelo iOS após semanas sem uso | `@capacitor/preferences` no app nativo |
| Certificado final personalizado | Jornada e mapa prontos; tela de certificado no dia 60 ainda não desenhada | Tela de certificado imprimível com nome, idiomas e conquistas |

## ⭕ Depende de serviços externos (não incluído por decisão)

- **Sincronização entre aparelhos / backup em nuvem** — exige backend com autenticação dos responsáveis e política de retenção; o modelo local já expõe exportação/importação como ponte.
- **Distribuição nas lojas (App Store / Play)** — empacotar o PWA com Capacitor; contas de desenvolvedor e revisão das lojas.
- **Consentimento parental verificável forte** (cartão de crédito/documento, exigido em alguns mercados COPPA/GDPR-K) — requer provedor externo; a demo usa confirmação de adulto + declaração de responsabilidade.
- **Análise de pronúncia fonema a fonema** — requer serviço/modelo especializado em fala infantil.
- **Conteúdo dos dias 8-60 além dos 36 conceitos-semente** — o pipeline (packs + admin + importação) está pronto; faltam os dados produzidos por linguistas para chegar a 250-350 conceitos e 80-120 frases por idioma.
