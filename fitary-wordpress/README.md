# FITARY Homepage — pronta para WordPress

Homepage do **FITARY** (Boutique Personal Training Studio, Wels) extraída do projeto
Claude Design, atualizada e empacotada como página 100% auto-contida.

## Arquivos

| Arquivo | O que é |
|---|---|
| `fitary-homepage.html` | A página completa: HTML + CSS + JS + todas as imagens e fontes embutidas (data URIs). Não depende de nenhum arquivo externo. |
| `page-fitary.php` | Modelo de página (Page Template) do WordPress que serve o HTML acima. |

## O que foi atualizado em relação ao design original

- Removidas todas as ferramentas do editor (painel de tweaks, componente de
  image-slot editável, selo "Made with Claude Design", âncoras de comentários).
- Imagens e fontes **embutidas no próprio arquivo** — nenhuma requisição ao Google
  Fonts (importante para GDPR/DSGVO na Áustria) e nenhuma imagem quebrada.
- Removida a referência a um vídeo inexistente (`assets/studio-reel.mp4`) que
  gerava erro 404; a seção do reel mostra o pôster estático.
- Todo o comportamento interativo foi mantido: calendário de agendamento ao vivo
  (integração Offisy), contadores animados, FAQ, marquee, botão WhatsApp, etc.

## Como publicar no WordPress — Opção A (recomendada): Page Template

1. Acesse o servidor (FTP, gerenciador de arquivos do painel, ou
   Aparência → Editor de arquivos do tema).
2. Copie **os dois arquivos** (`page-fitary.php` e `fitary-homepage.html`) para a
   pasta do tema ativo: `wp-content/themes/SEU-TEMA/`.
   - Se usar um tema filho (child theme), coloque na pasta do tema filho.
3. No painel do WordPress: **Páginas → Adicionar nova**.
4. Título: `FITARY` (o slug vira `/fitary`).
5. Na barra lateral, em **Modelo/Template**, selecione **"FITARY Homepage"**.
6. **Publicar**. A página estará em `https://seusite.at/fitary/`.

Para torná-la a página inicial do site: **Configurações → Leitura →
Sua página inicial exibe → Uma página estática → FITARY**.

## Opção B: upload direto (sem mexer no tema)

Envie `fitary-homepage.html` para a raiz do site (via FTP/gerenciador de
arquivos), por exemplo como `/fitary/index.html`. A página fica acessível em
`https://seusite.at/fitary/` sem tocar no WordPress. Desvantagem: não aparece na
lista de páginas do WordPress.

## Opção C: plugin de snippet HTML

Com plugins como "Insert HTML Snippet" ou construtores (Elementor com widget
HTML) é possível colar o conteúdo, mas **não é recomendado** para esta página:
ela é um documento completo (com `<head>` próprio) e o CSS do tema entraria em
conflito. Prefira a Opção A.

## Passo a passo 100% pelo Chrome (sem FTP) — criar como RASCUNHO

Fluxo seguro: nada vai ao ar (a página fica como rascunho "fitary claude code 4")
e nenhuma outra página do site é alterada.

1. **Baixe os 2 arquivos** deste repositório (`fitary-homepage.html` e
   `page-fitary.php`) para o computador.
2. **Descubra o tema ativo**: wp-admin → Aparência → Temas (o primeiro, marcado
   como "Ativo"). Anote o nome da pasta.
3. **Instale um gerenciador de arquivos**: Plugins → Adicionar novo → busque
   **"File Manager"** (mndpsingh287) → Instalar → Ativar.
4. **Envie os arquivos**: menu "WP File Manager" → navegue até
   `wp-content/themes/PASTA-DO-TEMA-ATIVO/` → botão Upload → envie os 2 arquivos.
   Não sobrescreva nada — são arquivos novos.
5. **Crie a página**: Páginas → Adicionar nova → título `fitary claude code 4` →
   painel lateral "Página" → **Modelo/Template = "FITARY Homepage"** →
   **Salvar rascunho** (NÃO clique em Publicar).
6. **Revise**: botão "Visualizar" (Preview). Só quem está logado vê.
7. **Segurança**: por fim, desative/exclua o plugin File Manager
   (Plugins → File Manager → Desativar → Excluir). Os arquivos enviados permanecem.

Quando aprovar: abra o rascunho → Publicar (e renomeie o título/slug se quiser).

## SEO local (já embutido na página)

- `<title>` e meta description otimizados para **"Personal Training Wels"** e
  região (Oberösterreich).
- Dados estruturados Schema.org:
  - **LocalBusiness / HealthClub** — nome, endereço (Plobergerstraße 7, 4600
    Wels), telefone, e-mail, fundador, faixa de preços, ofertas (€79 / €790 /
    €100), Instagram e Facebook → habilita o painel de empresa local no Google.
  - **FAQPage** — as 8 perguntas reais da seção FAQ → elegível para rich results
    de FAQ na busca.
- Open Graph + Twitter Card (compartilhamento bonito no WhatsApp/Instagram/
  Facebook), `og:locale de_AT`, meta geo (AT-4, Wels), `robots index,follow`.
- **Após publicar, ajuste 2 URLs no `<head>`** (marcadas com comentários):
  1. `canonical` e `og:url` → URL final da página.
  2. `og:image` → envie uma foto 1200×630 do estúdio para a Biblioteca de Mídia
     e cole a URL.
- Dica: cadastre/atualize o Google Business Profile com o mesmo endereço e
  telefone — é o fator nº 1 de venda local, e o schema da página reforça isso.

## Como editar a página depois

A página é um Page Template independente, então o editor visual de blocos do
WordPress (Gutenberg/Elementor) **não** se aplica a ela. Formas de editar:

1. **Textos, preços e links** — abra `fitary-homepage.html` em
   **Aparência → Editor de arquivos do tema** (ou via FTP) e edite direto: todo
   o conteúdo é HTML legível (seções marcadas com comentários `<!-- HERO -->`,
   `<!-- PRICING -->` etc.).
2. **Design visual** — o projeto continua editável no Claude Design
   (claude.ai/design). Edite lá e peça ao Claude para re-gerar e re-publicar
   esta página — o processo é repetível.
3. **Trocar fotos** — substitua o valor `src="data:image/..."` da imagem
   correspondente, ou peça ao Claude para trocar e re-gerar.

## Observações

- O arquivo tem ~2,1 MB porque carrega tudo embutido. Se quiser otimizar depois,
  as imagens podem ser movidas para a Biblioteca de Mídia e referenciadas por URL.
- Link de agendamento (Offisy), WhatsApp, telefone e endereço já são os reais do
  FITARY — confira se continuam corretos antes de publicar.
