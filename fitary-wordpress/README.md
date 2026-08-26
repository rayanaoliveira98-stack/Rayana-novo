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

## Observações

- O arquivo tem ~2,1 MB porque carrega tudo embutido. Se quiser otimizar depois,
  as imagens podem ser movidas para a Biblioteca de Mídia e referenciadas por URL.
- Link de agendamento (Offisy), WhatsApp, telefone e endereço já são os reais do
  FITARY — confira se continuam corretos antes de publicar.
