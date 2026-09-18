# Publicar nas lojas (iOS e Android)

O LumiLínguas roda hoje de duas formas. Esta página explica o que já funciona,
o que falta para chegar à App Store e ao Google Play, e o que **não depende de
código** — porque exige contas e decisões suas.

## 1. Já funciona: instalar direto do navegador (PWA)

Abrindo o endereço do app no celular e usando "Adicionar à tela inicial", ele
instala como aplicativo: ícone próprio, tela cheia sem a barra do navegador,
e funcionamento **offline** depois da primeira visita.

| Plataforma | Como instalar | Estado |
|---|---|---|
| **Android** (Chrome, Edge, Samsung Internet) | Aviso automático de instalação, ou menu ⋮ → "Instalar app" | Pronto |
| **iOS / iPadOS** (Safari 16.4+) | Compartilhar → "Adicionar à Tela de Início" | Pronto |

O que foi preciso ajustar para isso funcionar de verdade:

- **Ícones PNG** em 192, 512 e 512 *maskable* (Android recorta o ícone em
  círculo e precisa da margem de segurança), mais um `apple-touch-icon` de
  180px — **o iOS ignora ícones SVG** na tela inicial, e sem o PNG ele mostrava
  uma miniatura da página.
- **Meta tags do iOS** (`apple-mobile-web-app-capable` e a cor da barra de
  status), sem as quais o app abria dentro do Safari, com a barra de endereço.
- **Service Worker** com todo o conteúdo em cache, incluindo a tipografia.

Limitações honestas do PWA no iOS, que não dependem de nós:

- notificações locais (o lembrete do horário habitual) não funcionam em PWA no
  iOS — só no app nativo;
- o reconhecimento de fala no Safari usa o motor da Apple e pede permissão a
  cada sessão;
- o iOS pode descartar os dados locais após semanas sem uso. O progresso fica
  em `localStorage`; para uma família que usa todo dia, não é problema, mas é
  mais um motivo para o app nativo em produção.

## 2. Para as lojas: empacotar com Capacitor

O código já está preparado — `capacitor.config.json` na raiz. O app é HTML,
CSS e JS sem build, então o empacotamento é direto:

```bash
cd lumilinguas
npm install @capacitor/core @capacitor/cli @capacitor/ios @capacitor/android
npx cap add ios
npx cap add android
npx cap sync
npx cap open ios       # abre no Xcode  (precisa de um Mac)
npx cap open android   # abre no Android Studio
```

Depois disso, cada loja pede o seu:

**Android (Google Play)**
- conta de desenvolvedor (pagamento único);
- no Android Studio: gerar um *Android App Bundle* assinado;
- preencher o **Teacher Approved / Famílias**: o app é para menores de 13 anos,
  então entra no programa de famílias e passa por revisão de conteúdo;
- declarar na *Data Safety*: nenhum dado sai do aparelho, nenhuma publicidade.

**iOS (App Store)**
- conta Apple Developer (anuidade) e um Mac com Xcode;
- categoria **Kids 5 and Under** ou **6-8**: a Apple exige que apps infantis
  não tenham publicidade de terceiros nem links externos fora do controle
  parental — o LumiLínguas já cumpre isso por desenho;
- o portão parental já existe, e a Apple exige exatamente esse tipo de barreira
  antes de qualquer área de configuração ou compra;
- preencher o *App Privacy*: "Data Not Collected".

### O que ainda precisa ser feito antes de submeter

| Item | Por quê |
|---|---|
| Ícones e *splash* nativos | O Capacitor gera a partir de `icons/icon-1024.png`, já incluído |
| Notificações locais | Instalar `@capacitor/local-notifications` para o lembrete do horário habitual (hoje o horário é salvo, mas não notifica) |
| Armazenamento nativo | Trocar `localStorage` pelo `@capacitor/preferences` no empacotamento, para o sistema não descartar o progresso |
| Política de privacidade publicada | Exigida pelas duas lojas; o conteúdo já está em `docs/` e no onboarding, falta hospedar numa URL |
| Textos e capturas por idioma | As lojas mostram a ficha no idioma do usuário — a interface já fala 6 idiomas, as fichas precisam acompanhar |

### O que não podemos fazer daqui

Criar as contas de desenvolvedor, assinar os pacotes e submeter à revisão são
passos que exigem **as suas credenciais** e decisões comerciais (nome do
titular, preço, países). O código está pronto para ser empacotado; a publicação
é sua.

## 3. Idiomas da interface

A área dos responsáveis fala **português, inglês, alemão, espanhol, italiano e
turco**, detectando o idioma do aparelho na primeira abertura e permitindo
trocar no primeiro passo do onboarding e em Configurações.

Isso é diferente dos **idiomas de aprendizagem** (9 disponíveis): um pai turco
pode configurar o app em turco para a filha aprender japonês.

Acrescentar um sétimo idioma de interface é acrescentar uma coluna em
`js/i18n.js` — o teste `tests/i18n.test.js` falha se alguma frase ficar sem
tradução, sem marcador de valor, ou idêntica ao português.
