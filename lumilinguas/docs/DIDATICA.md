# Base didática da progressão

Este documento explica **por que** o LumiLínguas pede o que pede, em que
momento — e o que a pesquisa em aquisição de línguas na primeira infância diz
sobre isso. O código correspondente está em `js/ladder.js` (escada de
produção), `js/srs.js` (espaçamento) e `js/session.js` (montagem do dia).

## O problema que a escada resolve

Antes, a atividade de revisão era sorteada (`Math.random()`): a mesma palavra
tanto podia pedir "aponte a imagem" quanto "repita comigo", sem relação com o
que a criança já conseguia fazer. O resultado é o que se sente na prática:
**repetição sem evolução** — e, nos casos ruins, uma palavra reapresentada
para sempre sem que a criança precisasse fazer nada com ela.

Agora cada palavra tem um **degrau** por criança e por idioma, e a atividade
do dia sai do degrau. A progressão é individual: duas crianças no mesmo dia
da jornada recebem tarefas diferentes para a mesma palavra.

## Os sete degraus

| # | Degrau | O que a criança faz | Atividade |
|---|---|---|---|
| 0 | ouvindo e vendo | só escuta e observa | apresentação |
| 1 | reconhece ao ouvir | aponta a imagem certa | ouça e toque |
| 2 | responde com o corpo | executa a instrução | TPR / siga a instrução |
| 3 | repete com modelo | fala logo após ouvir | ouça e repita |
| 4 | completa a frase | fecha a frase que o personagem começa | cloze |
| 5 | fala sozinha | nomeia vendo só a imagem | "o que é isso?" |
| 6 | usa em conversa | responde uma pergunta de verdade | diálogo curto |

Do degrau 0 ao 2 não se exige som nenhum. Do 3 em diante, a criança fala.

## As cinco regras, e de onde vêm

### 1. Compreender vem antes de falar — e o silêncio não é falha

**Total Physical Response** (Asher) nasceu da observação de como crianças
adquirem a primeira língua: o adulto fala, a criança responde com o corpo.
Elas passam muito tempo ouvindo antes de tentar falar, e entendem muito mais
do que produzem. Forçar a fala antes da hora gera ansiedade e **atrasa** o
aprendizado; a fala espontânea aparece quando a criança está pronta.

**No app:** os degraus 0-2 não pedem voz. Responder com o corpo já conta como
produção. E quando a criança fica calada numa atividade de fala, o app
registra `silent` — que **não** é erro: não marca dificuldade, não adianta
revisão, e devolve a palavra ao degrau corporal. O período silencioso é
maior para os menores (3 dias aos 3 anos, 1 dia aos 5+) e só segura a
*recuperação de memória*; repetir logo depois de ouvir continua liberado
desde o primeiro dia, porque é convite, não cobrança.

### 2. Recuperar da memória ensina mais que rever — com uma condição

O **efeito de teste** (retrieval practice) mostra que buscar a informação na
memória retém mais que reestudá-la. Mas há uma condição-limite importante em
pré-escolares: o efeito só aparece **quando a criança atinge taxa de sucesso
suficiente durante a prática**. Sem sucesso repetido antes, a recuperação não
rende — e em crianças muito pequenas pode não render nada.

**No app:** o degrau só sobe depois de **dois acertos seguidos** no degrau
atual, nunca por tempo decorrido. É o sucesso que abre a próxima exigência.

### 3. O apoio vem depois da tentativa, do menor para o maior

A **hierarquia de apoio least-to-most** dá o mínimo de ajuda necessário e só
aumenta se a criança não responder — em vez de entregar o apoio inteiro de
saída.

**No app:** nas atividades de produção, o modelo (ouvir a palavra) e a palavra
escrita **só aparecem depois** que a criança tentou. Tocar em "ouvir de novo"
repete o *estímulo* (a pergunta, o começo da frase), nunca a resposta. Em
dificuldade, a escada devolve **um** degrau, não todos. E o piso é sempre
participação (reconhecer), nunca voltar a assistir à apresentação.

### 4. Completar a frase é o degrau que faltava entre repetir e falar

O **procedimento cloze** — o adulto começa a frase e a criança a completa — é
uma das formas clássicas de eliciar produção com apoio parcial. Entre "repita
depois de mim" (apoio total) e "diga sozinha" (nenhum apoio) havia um salto
grande demais.

**No app:** o degrau 4 toca a frase sem a última palavra e espera. A imagem
fica na tela, as reticências piscam, e o silêncio faz o convite.

### 5. Espaçar serve para reter o que já se aprendeu — não para aprender

A prática espaçada supera a massificada na retenção de longo prazo. Mas
espaçar uma palavra que a criança ainda não domina só a faz desaparecer.

**No app:** o espaçamento é **limitado pelo degrau**. Enquanto a palavra está
nos degraus baixos, ela volta em 1-3 dias. Os intervalos de 7, 14 e 30 dias
só se abrem à medida que a criança passa a produzi-la. Além disso, o
espaçamento conta **dias de estudo, não telas**: uma palavra que apareceu
quatro vezes na mesma sessão avança um intervalo, não quatro — senão saltaria
de "volta amanhã" para "volta em duas semanas" logo no primeiro dia.

## Ritmo: consolidar acima de acumular

O app limita o **trabalho em aberto**: enquanto houver muitas palavras a meio
caminho (6 para 3-4 anos, 10 para 5-7), ele **para de apresentar novidade** e
usa o tempo da sessão para levar o que já existe até a boca da criança.

A consequência é deliberada e vale dizer com clareza: uma criança com mais
dificuldade **vê menos palavras** ao longo dos 60 dias — e aprende mais delas
de verdade. Contagem de palavras expostas é uma métrica ruim; palavras que a
criança fala é uma métrica boa.

## Teto por idade

O app nunca empurra uma criança além do que a idade comporta:

| Idade | Até onde o app pede |
|---|---|
| 3 anos | repete com modelo |
| 4 anos | completa a frase |
| 5-6 anos | fala sozinha |
| 7 anos | usa em conversa |

Uma criança pode ir além por conta própria — o registro guarda o degrau real —
mas a **cobrança** para no teto. É a diferença entre acompanhar o
desenvolvimento e apressá-lo.

## Como isso é verificado

`tests/jornada.test.js` simula os 60 dias completos com os módulos reais e
exige que:

- toda palavra trabalhada tenha sido falada ao menos uma vez;
- ao menos 60% cheguem a ser faladas sem modelo;
- produção livre **não** apareça na primeira semana;
- uma criança de 3 anos **nunca** receba produção sem modelo;
- nenhuma sessão fique quase vazia;
- o espaçamento nunca ultrapasse o que o degrau permite;
- dias seguidos não repitam a mesma sequência.

Na simulação de referência (6 anos, jornada completa), 35 das 36 palavras do
conteúdo de demonstração chegam ao degrau "fala sozinha" e 24 ao "usa em
conversa".

## Fontes

- [Total physical response — visão geral do método e do período silencioso](https://en.wikipedia.org/wiki/Total_physical_response)
- [Understanding learners' Silent Period — atividades de TPR e período silencioso](https://eltea.org/blog/understanding-learners-silent-period-maximizing-learning-through-tpr-activities)
- [Multiple Practice Success Scaffolds Long-Term Test-Enhanced Learning in Preschoolers](https://pubmed.ncbi.nlm.nih.gov/40704796/)
- [Retrieval-Based Learning: Positive Effects of Retrieval Practice in Elementary School Children](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4786565/)
- [Retrieval Practice and Word Learning: Does Expanding Retrieval Provide Additional Benefit?](https://pmc.ncbi.nlm.nih.gov/articles/PMC11087082/)
- [Expanding Retrieval Practice Promotes Short-Term Retention, but Equally Spaced Retrieval Enhances Long-Term Retention](https://learninglab.psych.purdue.edu/downloads/2007/2007_Karpicke_Roediger_JEPLMC.pdf)
- [Supporting Oral Language Development in Preschool Children Through Instructional Scaffolding](https://pmc.ncbi.nlm.nih.gov/articles/PMC12292087/)
- [RECALL prompting hierarchy improves responsiveness for children with language delay](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC11545681/)
