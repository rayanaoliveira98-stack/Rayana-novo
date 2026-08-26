# Prompt para o Claude Cowork — criar rascunho FITARY no WordPress

Copie tudo abaixo da linha e cole como tarefa no Cowork (com o Chrome já logado
no wp-admin do site).

---

## TAREFA

Criar no WordPress deste site uma nova página em **RASCUNHO** chamada
`fitary claude code 4`, usando o template FITARY que está no meu GitHub. Você vai
operar o Chrome no painel wp-admin. Trabalhe passo a passo e me mostre o que fez.

## REGRAS INEGOCIÁVEIS (leia antes de agir)

1. **NUNCA clique em "Publicar"** em nenhum momento. A página termina como
   **rascunho** ("Salvar rascunho"). Se algo forçar publicação, pare e me pergunte.
2. **Não edite, renomeie, exclua ou sobrescreva NADA que já existe** — nenhuma
   página existente, nenhum arquivo existente do tema, nenhuma configuração
   (Leitura, menus, página inicial etc. ficam intocados).
3. Você só pode: instalar/ativar 1 plugin (File Manager), **adicionar** 2 arquivos
   novos na pasta do tema ativo, criar 1 página nova como rascunho, e ao final
   desativar/excluir o plugin.
4. Se aparecer qualquer tela inesperada, erro, ou pedido de confirmação destrutivo,
   **pare e me pergunte** com um print.

## ARQUIVOS DE ORIGEM

Repositório GitHub: `rayanaoliveira98-stack/Rayana-novo`,
branch `claude/fitary-homepage-wordpress-6w0zob`, pasta `fitary-wordpress/`.

Baixe estes 2 arquivos (botão "Download raw file" na visualização de cada um):
- `fitary-homepage.html` (~2,1 MB — a página completa, auto-contida)
- `page-fitary.php` (o Page Template do WordPress)

Se eu já tiver deixado os 2 arquivos na pasta Downloads, use-os de lá.

## PASSOS

**1. Identificar o tema ativo**
- wp-admin → Aparência → Temas → anote o nome do tema marcado como "Ativo".
- Confirme a pasta dele: será `wp-content/themes/<pasta-do-tema>`.

**2. Instalar o gerenciador de arquivos**
- Plugins → Adicionar novo → buscar **"File Manager"** (autor mndpsingh287) →
  Instalar agora → Ativar.

**3. Enviar os 2 arquivos (somente adicionar, nunca sobrescrever)**
- Menu lateral → WP File Manager → navegar até
  `wp-content/themes/<pasta-do-tema-ativo>/`.
- Antes do upload, confirme que NÃO existem arquivos com os nomes
  `page-fitary.php` e `fitary-homepage.html` nessa pasta. Se existirem, pare e
  me pergunte.
- Upload dos 2 arquivos. Confirme que ambos aparecem na pasta com tamanho > 0
  (`fitary-homepage.html` deve ter ~2,1 MB).

**4. Criar a página como rascunho**
- Páginas → Adicionar nova.
- Título exato: `fitary claude code 4`
- Corpo: deixar vazio.
- Barra lateral direita → aba "Página" → campo "Modelo"/"Template" → selecionar
  **"FITARY Homepage"**. (Se a opção não aparecer, recarregue o editor uma vez;
  se ainda não aparecer, pare e me mostre um print.)
- Clicar em **"Salvar rascunho"**. NÃO publicar.

**5. Verificar**
- Clicar em "Visualizar" → "Visualizar em nova aba".
- Conferir na pré-visualização: hero "GEMEINSAM ZU DEINEM TRAUMKÖRPER.", seção de
  preços (€79 / €790), FAQ com 8 perguntas, rodapé "© 2026 FITARY".
- Voltar em Páginas → Todas as páginas e confirmar que `fitary claude code 4`
  está com status **Rascunho** e que a lista das demais páginas está inalterada.

**6. Limpeza**
- Plugins → WP File Manager → Desativar → Excluir (os arquivos enviados ao tema
  permanecem — só o plugin sai).

## RELATÓRIO FINAL

Me entregue: (a) nome do tema ativo, (b) confirmação dos 2 uploads com tamanhos,
(c) print da pré-visualização da página, (d) confirmação do status Rascunho,
(e) confirmação de que o plugin foi removido. Não publique nada — eu reviso e
publico depois.
