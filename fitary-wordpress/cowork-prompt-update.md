# Prompt para o Claude Cowork — ATUALIZAR o rascunho FITARY no WordPress

Copie tudo abaixo da linha e cole como tarefa no Cowork (com o Chrome já logado
no wp-admin do site). Antes de rodar, deixe o novo `fitary-homepage.html`
(~2,2 MB) na pasta Downloads do computador.

---

## TAREFA

Atualizar a página FITARY que já existe como rascunho no WordPress deste site.
É uma troca de **1 único arquivo** no tema: substituir o `fitary-homepage.html`
antigo pela versão nova. Nada mais muda.

## REGRAS INEGOCIÁVEIS (leia antes de agir)

1. **NUNCA clique em "Publicar"**. A página `fitary claude code 4` continua como
   **rascunho**. Você não precisa nem editar a página — só trocar o arquivo.
2. O único arquivo que pode ser sobrescrito é **`fitary-homepage.html`** dentro
   de `wp-content/themes/diet-shop/`. **Nenhum outro arquivo** pode ser tocado —
   o `page-fitary.php` fica como está, e nenhuma página, plugin ou configuração
   do site pode ser alterada.
3. Se aparecer qualquer tela inesperada, erro, ou pedido de confirmação que não
   esteja descrito aqui, **pare e me pergunte** com um print.

## ARQUIVO DE ORIGEM (use UM dos dois)

- `fitary-homepage.html` (~2,2 MB · 2.199.417 bytes) na pasta **Downloads**; ou
- GitHub: repo `rayanaoliveira98-stack/Rayana-novo`, branch
  `claude/fitary-homepage-wordpress-6w0zob`, caminho
  `fitary-wordpress/fitary-homepage.html` (botão "Download raw file") — puxar
  do raw, igual às rodadas anteriores.

Esta versão já inclui: logos novos (cabeçalho e rodapé), vídeo do reel apontando
pro mp4 hospedado no fitary.at, transformações antes/depois empilhadas no
mobile, e conteúdo em HTML real (indexável, com schema LocalBusiness + FAQ).
"Fabian, 28" está correto — não é typo.

## PASSOS

**1. Reativar o gerenciador de arquivos**
- wp-admin → Plugins. Se o **"File Manager"** (mndpsingh287) estiver na lista,
  Ativar. Se tiver sido excluído: Plugins → Adicionar novo → buscar
  "File Manager" → Instalar agora → Ativar.

**2. Substituir o arquivo**
- Menu lateral → WP File Manager → `wp-content/themes/diet-shop/`.
- Confirme que `page-fitary.php` e o `fitary-homepage.html` antigo estão lá.
  Se não estiverem, pare e me pergunte.
- Upload do novo `fitary-homepage.html` → **confirmar a sobrescrita** (único
  arquivo em que sobrescrever é permitido).
- Verifique o tamanho final: **~2,2 MB (2.199.417 bytes)**. Se ficou diferente,
  a troca não aconteceu — refaça o upload.

**3. Conferir o rascunho**
- Páginas → Todas as páginas → `fitary claude code 4` continua **Rascunho**.
- Abrir → "Visualizar" → "Visualizar em nova aba" → **Ctrl+F5**.
- Checklist da pré-visualização:
  - Logo FITARY novo no topo e o logo grande no rodapé aparecem.
  - Transformações antes/depois: no modo mobile (F12 → ícone de celular),
    1 card por linha com fotos grandes.
  - Vídeo do Studio Reel toca (botão play).
  - Depoimentos: "Fabian, 28" e a história "−30kg".
  - Rodapé: "© 2026 FITARY".

**4. Limpeza**
- Plugins → WP File Manager → Desativar → Excluir.

## RELATÓRIO FINAL

Me entregue: (a) confirmação da sobrescrita com o tamanho (~2,2 MB),
(b) prints da pré-visualização desktop e mobile (topo com logo novo + seção
de transformações), (c) confirmação do status Rascunho, (d) confirmação de
que o plugin foi removido. Não publique nada — eu reviso e publico depois.
