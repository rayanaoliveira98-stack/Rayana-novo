# Prompt para o Claude Cowork — ATUALIZAR o rascunho FITARY no WordPress

Copie tudo abaixo da linha e cole como tarefa no Cowork (com o Chrome já logado
no wp-admin do site). Antes de rodar, deixe o novo `fitary-homepage.html` na
pasta Downloads do computador.

---

## TAREFA

Atualizar a página FITARY que já existe como rascunho no WordPress deste site.
É uma troca de **1 único arquivo** no tema: substituir o `fitary-homepage.html`
antigo pela versão nova que está na minha pasta Downloads. Nada mais muda.

## REGRAS INEGOCIÁVEIS (leia antes de agir)

1. **NUNCA clique em "Publicar"**. A página `fitary claude code 4` continua como
   **rascunho**. Você não precisa nem editar a página — só trocar o arquivo.
2. O único arquivo que pode ser sobrescrito é **`fitary-homepage.html`** dentro
   da pasta do tema ativo. **Nenhum outro arquivo** pode ser tocado — o
   `page-fitary.php` fica como está, e nenhuma página, plugin ou configuração
   do site pode ser alterada.
3. Se aparecer qualquer tela inesperada, erro, ou pedido de confirmação que não
   esteja descrito aqui, **pare e me pergunte** com um print.

## ARQUIVO DE ORIGEM

- `fitary-homepage.html` (~500 KB) na pasta **Downloads**.
- Alternativa: baixar do GitHub `rayanaoliveira98-stack/Rayana-novo`, branch
  `claude/fitary-homepage-wordpress-6w0zob`, pasta `fitary-wordpress/`
  (botão "Download raw file").

## PASSOS

**1. Reativar o gerenciador de arquivos**
- wp-admin → Plugins. Se o **"File Manager"** (mndpsingh287) ainda estiver na
  lista, clique em Ativar. Se tiver sido excluído: Plugins → Adicionar novo →
  buscar "File Manager" → Instalar agora → Ativar.

**2. Substituir o arquivo**
- Menu lateral → WP File Manager → navegar até
  `wp-content/themes/<pasta-do-tema-ativo>/` (a mesma pasta onde estão
  `page-fitary.php` e o `fitary-homepage.html` antigo).
- Confirme que os dois arquivos estão lá antes de continuar. Se não estiverem,
  pare e me pergunte.
- Faça Upload do novo `fitary-homepage.html` e **confirme a sobrescrita quando
  perguntado** (este é o único arquivo em que sobrescrever é permitido).
- Verifique: o `fitary-homepage.html` da pasta agora deve ter **~500 KB**
  (a versão antiga tinha ~2,1 MB — se continuar com 2,1 MB, a troca não
  aconteceu; tente o upload de novo).

**3. Conferir o rascunho**
- Páginas → Todas as páginas → confirmar que `fitary claude code 4` continua
  com status **Rascunho**.
- Abrir a página → "Visualizar" → "Visualizar em nova aba" → recarregar com
  **Ctrl+F5**.
- Conferir na pré-visualização:
  - As fotos do estúdio e do coach carregam (vêm de www.fitary.at).
  - Na seção de comparação existem botões **"Details anzeigen"**.
  - Nos depoimentos antes/depois aparece **"Fabio, 28"** e a história
    **"−30kg"** (conteúdo novo).
  - Rodapé: "© 2026 FITARY".
- Testar também a visão mobile: F12 → ícone de celular → recarregar.

**4. Limpeza**
- Plugins → WP File Manager → Desativar → Excluir.

## RELATÓRIO FINAL

Me entregue: (a) confirmação da sobrescrita com o novo tamanho (~500 KB),
(b) print da pré-visualização desktop e mobile, (c) confirmação do status
Rascunho, (d) confirmação de que o plugin foi removido. Não publique nada —
eu reviso e publico depois.
