/* LumiLínguas — Idioma da interface dos responsáveis.
 *
 * A área da criança não tem texto (imagens, áudio e toque). Quem lê é o
 * adulto: onboarding, painel, avisos e dicas. Como o app vai para o mundo,
 * essa parte fala seis línguas.
 *
 * Duas coisas diferentes, que não se confundem:
 *   — idioma da INTERFACE (este arquivo): a língua em que o responsável lê;
 *   — idiomas de APRENDIZAGEM (js/langs.js): o que a criança vai aprender.
 * Um pai turco pode configurar o app em turco para a filha aprender japonês.
 *
 * Como usar:  T.t('ob.welcome.title')  ·  T.t('gate.wrong')
 * Com valores: T.t('ladder.legend', { n: 12, total: 30 })
 *
 * Falta uma tradução? Cai no inglês e, em último caso, na própria chave —
 * nunca numa tela em branco.
 */
(function (g) {
  'use strict';

  /* Os seis idiomas em que a interface existe hoje. Acrescentar um novo é
   * acrescentar uma coluna nas strings abaixo — nada mais muda. */
  var UI_LANGS = [
    { code: 'pt', name: 'Português', flag: '🇧🇷' },
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'it', name: 'Italiano', flag: '🇮🇹' },
    { code: 'tr', name: 'Türkçe', flag: '🇹🇷' }
  ];

  var S = {
    /* ---------- comuns ---------- */
    'ui.language': {
      pt: 'Idioma do aplicativo', en: 'App language', de: 'App-Sprache',
      es: 'Idioma de la aplicación', it: "Lingua dell'app", tr: 'Uygulama dili' },
    'common.continue': {
      pt: 'Continuar', en: 'Continue', de: 'Weiter', es: 'Continuar',
      it: 'Continua', tr: 'Devam' },
    'common.back': {
      pt: '← Voltar', en: '← Back', de: '← Zurück', es: '← Atrás',
      it: '← Indietro', tr: '← Geri' },
    'common.finish': {
      pt: 'Concluir', en: 'Finish', de: 'Fertig', es: 'Finalizar',
      it: 'Fine', tr: 'Bitir' },
    'common.enter': {
      pt: 'Entrar', en: 'Enter', de: 'Öffnen', es: 'Entrar',
      it: 'Entra', tr: 'Gir' },
    'common.confirm': {
      pt: 'Confirmar', en: 'Confirm', de: 'Bestätigen', es: 'Confirmar',
      it: 'Conferma', tr: 'Onayla' },
    'common.of': { pt: 'de', en: 'of', de: 'von', es: 'de', it: 'di', tr: '/' },
    'common.day': { pt: 'Dia', en: 'Day', de: 'Tag', es: 'Día', it: 'Giorno', tr: 'Gün' },
    'common.none': {
      pt: 'Nenhum', en: 'None', de: 'Keine', es: 'Ninguno', it: 'Nessuno', tr: 'Yok' },

    /* ---------- portão parental ---------- */
    'gate.title': {
      pt: 'Área dos responsáveis', en: 'Parents’ area', de: 'Elternbereich',
      es: 'Área de los padres', it: 'Area dei genitori', tr: 'Ebeveyn alanı' },
    'gate.enterPin': {
      pt: 'Digite o PIN:', en: 'Enter the PIN:', de: 'PIN eingeben:',
      es: 'Escribe el PIN:', it: 'Inserisci il PIN:', tr: 'PIN’i girin:' },
    'gate.adult': {
      pt: 'Confirmação de adulto', en: 'Adult check', de: 'Erwachsenen-Check',
      es: 'Comprobación de adulto', it: 'Verifica adulto', tr: 'Yetişkin doğrulaması' },
    'gate.howMuch': {
      pt: 'Quanto é {a} × {b}?', en: 'What is {a} × {b}?', de: 'Wie viel ist {a} × {b}?',
      es: '¿Cuánto es {a} × {b}?', it: 'Quanto fa {a} × {b}?', tr: '{a} × {b} kaç eder?' },
    'gate.wrongPin': {
      pt: 'PIN incorreto.', en: 'Wrong PIN.', de: 'Falsche PIN.',
      es: 'PIN incorrecto.', it: 'PIN errato.', tr: 'PIN yanlış.' },
    'gate.tryAgain': {
      pt: 'Tente novamente.', en: 'Try again.', de: 'Versuchen Sie es erneut.',
      es: 'Inténtalo de nuevo.', it: 'Riprova.', tr: 'Tekrar deneyin.' },
    'gate.forgot': {
      pt: 'Esqueci o PIN', en: 'I forgot the PIN', de: 'PIN vergessen',
      es: 'Olvidé el PIN', it: 'Ho dimenticato il PIN', tr: 'PIN’i unuttum' },
    'gate.clearAndEnter': {
      pt: 'Entrar e apagar o PIN', en: 'Enter and clear the PIN',
      de: 'Öffnen und PIN löschen', es: 'Entrar y borrar el PIN',
      it: 'Entra ed elimina il PIN', tr: 'Gir ve PIN’i sil' },
    'gate.forgotNote': {
      pt: 'O PIN será apagado e a área volta a abrir com uma conta de multiplicação. Nenhum dado da criança é perdido — você pode definir um novo PIN em Configurações.',
      en: 'The PIN will be cleared and the area will open with a multiplication question again. No child data is lost — you can set a new PIN in Settings.',
      de: 'Die PIN wird gelöscht und der Bereich öffnet wieder mit einer Rechenaufgabe. Es gehen keine Daten des Kindes verloren — eine neue PIN können Sie in den Einstellungen festlegen.',
      es: 'El PIN se borrará y el área volverá a abrirse con una multiplicación. No se pierde ningún dato del niño: puedes definir un PIN nuevo en Ajustes.',
      it: 'Il PIN verrà cancellato e l’area tornerà ad aprirsi con una moltiplicazione. Nessun dato del bambino va perso — puoi impostare un nuovo PIN nelle Impostazioni.',
      tr: 'PIN silinecek ve alan yeniden bir çarpma sorusuyla açılacak. Çocuğun hiçbir verisi kaybolmaz — Ayarlar’dan yeni bir PIN belirleyebilirsiniz.' },

    /* ---------- onboarding ---------- */
    'ob.welcome.title': {
      pt: 'Bem-vindo ao LumiLínguas! ✨', en: 'Welcome to LumiLínguas! ✨',
      de: 'Willkommen bei LumiLínguas! ✨', es: '¡Bienvenido a LumiLínguas! ✨',
      it: 'Benvenuto in LumiLínguas! ✨', tr: 'LumiLínguas’a hoş geldiniz! ✨' },
    'ob.welcome.promise': {
      pt: 'Construa uma base de compreensão, vocabulário e pronúncia em até quatro idiomas durante uma jornada de 60 dias.',
      en: 'Build a foundation of understanding, vocabulary and pronunciation in up to four languages over a 60-day journey.',
      de: 'Bauen Sie in bis zu vier Sprachen eine Grundlage aus Verständnis, Wortschatz und Aussprache auf — in einer Reise von 60 Tagen.',
      es: 'Construye una base de comprensión, vocabulario y pronunciación en hasta cuatro idiomas durante un viaje de 60 días.',
      it: 'Costruisci una base di comprensione, vocabolario e pronuncia in fino a quattro lingue in un percorso di 60 giorni.',
      tr: '60 günlük bir yolculukta, dört dile kadar anlama, kelime ve telaffuz temeli oluşturun.' },
    'ob.welcome.honest': {
      pt: 'Este aplicativo não promete fluência em dois meses: promete exposição estruturada, repetida e alegre, com revisões programadas e acompanhamento real do que a criança reconhece e fala.',
      en: 'This app does not promise fluency in two months. It promises structured, repeated and joyful exposure, with scheduled reviews and real tracking of what your child recognises and says.',
      de: 'Diese App verspricht keine Sprachbeherrschung in zwei Monaten. Sie verspricht strukturierten, wiederholten und fröhlichen Kontakt mit der Sprache, mit geplanten Wiederholungen und echtem Überblick darüber, was das Kind erkennt und spricht.',
      es: 'Esta aplicación no promete fluidez en dos meses: promete exposición estructurada, repetida y alegre, con repasos programados y seguimiento real de lo que el niño reconoce y dice.',
      it: 'Questa app non promette fluidità in due mesi: promette esposizione strutturata, ripetuta e allegra, con ripassi programmati e un quadro reale di ciò che il bambino riconosce e dice.',
      tr: 'Bu uygulama iki ayda akıcılık vaat etmez: yapılandırılmış, tekrarlı ve neşeli bir dil teması, programlı tekrarlar ve çocuğun neyi tanıdığını ve söylediğini gerçekten gösteren bir takip vaat eder.' },

    'ob.child.title': {
      pt: 'Quem vai aprender?', en: 'Who is learning?', de: 'Wer lernt?',
      es: '¿Quién va a aprender?', it: 'Chi imparerà?', tr: 'Kim öğrenecek?' },
    'ob.child.name': {
      pt: 'Nome ou apelido da criança', en: 'Child’s name or nickname',
      de: 'Name oder Spitzname des Kindes', es: 'Nombre o apodo del niño',
      it: 'Nome o soprannome del bambino', tr: 'Çocuğun adı veya takma adı' },
    'ob.child.age': {
      pt: 'Idade', en: 'Age', de: 'Alter', es: 'Edad', it: 'Età', tr: 'Yaş' },
    'ob.child.avatar': {
      pt: 'Avatar', en: 'Avatar', de: 'Avatar', es: 'Avatar', it: 'Avatar', tr: 'Avatar' },

    'ob.home.title': {
      pt: 'Idioma principal falado em casa', en: 'Main language spoken at home',
      de: 'Hauptsprache zu Hause', es: 'Idioma principal en casa',
      it: 'Lingua principale parlata in casa', tr: 'Evde konuşulan ana dil' },

    'ob.langs.title': {
      pt: 'Quais idiomas aprender? (1 a 4)', en: 'Which languages to learn? (1 to 4)',
      de: 'Welche Sprachen lernen? (1 bis 4)', es: '¿Qué idiomas aprender? (1 a 4)',
      it: 'Quali lingue imparare? (da 1 a 4)', tr: 'Hangi diller öğrenilecek? (1-4)' },
    'ob.langs.youngNote': {
      pt: 'Para {age} anos recomendamos começar com 1 ou 2 idiomas. Cada idioma será apresentado em blocos separados para não confundir. Você pode escolher até 4.',
      en: 'At {age} we recommend starting with 1 or 2 languages. Each one is presented in separate blocks so they don’t get mixed up. You can still choose up to 4.',
      de: 'Mit {age} Jahren empfehlen wir 1 bis 2 Sprachen zum Start. Jede Sprache kommt in einem eigenen Block, damit nichts durcheinandergerät. Bis zu 4 sind möglich.',
      es: 'Para {age} años recomendamos empezar con 1 o 2 idiomas. Cada idioma se presenta en bloques separados para no confundir. Puedes elegir hasta 4.',
      it: 'A {age} anni consigliamo di iniziare con 1 o 2 lingue. Ogni lingua viene presentata in blocchi separati per non confondere. Puoi sceglierne fino a 4.',
      tr: '{age} yaş için 1 veya 2 dille başlamanızı öneririz. Her dil karışmaması için ayrı bölümlerde sunulur. Yine de 4’e kadar seçebilirsiniz.' },
    'ob.langs.soon': {
      pt: 'pack em breve', en: 'pack coming soon', de: 'Paket folgt',
      es: 'pack próximamente', it: 'pacchetto in arrivo', tr: 'paket yakında' },

    'ob.variants.title': {
      pt: 'Variação regional', en: 'Regional variety', de: 'Regionale Variante',
      es: 'Variedad regional', it: 'Variante regionale', tr: 'Bölgesel çeşit' },
    'ob.variants.none': {
      pt: 'Os idiomas escolhidos não têm variações a configurar.',
      en: 'The chosen languages have no varieties to set.',
      de: 'Die gewählten Sprachen haben keine Varianten zum Einstellen.',
      es: 'Los idiomas elegidos no tienen variedades que configurar.',
      it: 'Le lingue scelte non hanno varianti da impostare.',
      tr: 'Seçilen dillerde ayarlanacak bir çeşit yok.' },

    'ob.levels.title': {
      pt: 'Nível atual em cada idioma', en: 'Current level in each language',
      de: 'Aktuelles Niveau je Sprache', es: 'Nivel actual en cada idioma',
      it: 'Livello attuale in ogni lingua', tr: 'Her dildeki mevcut seviye' },
    'ob.levels.never': {
      pt: 'Nunca ouviu', en: 'Never heard it', de: 'Noch nie gehört',
      es: 'Nunca lo ha oído', it: 'Non l’ha mai sentita', tr: 'Hiç duymadı' },
    'ob.levels.some': {
      pt: 'Conhece algumas palavras', en: 'Knows a few words',
      de: 'Kennt einige Wörter', es: 'Conoce algunas palabras',
      it: 'Conosce qualche parola', tr: 'Birkaç kelime biliyor' },
    'ob.levels.lots': {
      pt: 'Entende bastante', en: 'Understands quite a lot',
      de: 'Versteht schon viel', es: 'Entiende bastante',
      it: 'Capisce abbastanza', tr: 'Epey anlıyor' },

    'ob.reading.title': {
      pt: 'A criança já lê?', en: 'Can the child read yet?',
      de: 'Kann das Kind schon lesen?', es: '¿El niño ya lee?',
      it: 'Il bambino sa già leggere?', tr: 'Çocuk okuyabiliyor mu?' },
    'ob.reading.no': {
      pt: 'Ainda não lê', en: 'Not yet', de: 'Noch nicht',
      es: 'Todavía no', it: 'Non ancora', tr: 'Henüz değil' },
    'ob.reading.starting': {
      pt: 'Começando a ler', en: 'Starting to read', de: 'Fängt an zu lesen',
      es: 'Empezando a leer', it: 'Inizia a leggere', tr: 'Okumaya başlıyor' },
    'ob.reading.yes': {
      pt: 'Já lê', en: 'Reads already', de: 'Liest schon',
      es: 'Ya lee', it: 'Legge già', tr: 'Okuyor' },
    'ob.reading.textToggle': {
      pt: 'Mostrar palavras escritas como apoio (opcional)',
      en: 'Show written words as support (optional)',
      de: 'Geschriebene Wörter als Unterstützung zeigen (optional)',
      es: 'Mostrar palabras escritas como apoyo (opcional)',
      it: 'Mostrare le parole scritte come supporto (opzionale)',
      tr: 'Yazılı kelimeleri destek olarak göster (isteğe bağlı)' },
    'ob.reading.textNote': {
      pt: 'O texto nunca é o elemento principal: para 3-4 anos as atividades não mostram texto. Nas atividades de fala, a palavra escrita só aparece depois que a criança tenta.',
      en: 'Text is never the main element: for ages 3-4 activities show no text at all. In speaking activities, the written word only appears after the child has tried.',
      de: 'Text ist nie das Wichtigste: für 3- bis 4-Jährige zeigen die Übungen gar keinen Text. Beim Sprechen erscheint das geschriebene Wort erst, nachdem das Kind es versucht hat.',
      es: 'El texto nunca es lo principal: para 3-4 años las actividades no muestran texto. En las actividades de habla, la palabra escrita solo aparece después de que el niño lo intenta.',
      it: 'Il testo non è mai l’elemento principale: per i 3-4 anni le attività non mostrano testo. Nelle attività di parlato la parola scritta compare solo dopo il tentativo del bambino.',
      tr: 'Metin asla ana öğe değildir: 3-4 yaş için etkinliklerde hiç metin görünmez. Konuşma etkinliklerinde yazılı kelime, ancak çocuk denedikten sonra belirir.' },

    'ob.interests.title': {
      pt: 'O que a criança adora?', en: 'What does the child love?',
      de: 'Was liebt das Kind?', es: '¿Qué le encanta al niño?',
      it: 'Cosa ama il bambino?', tr: 'Çocuk neleri seviyor?' },
    'theme.animals': { pt: '🐶 Animais', en: '🐶 Animals', de: '🐶 Tiere', es: '🐶 Animales', it: '🐶 Animali', tr: '🐶 Hayvanlar' },
    'theme.places': { pt: '🚗 Veículos', en: '🚗 Vehicles', de: '🚗 Fahrzeuge', es: '🚗 Vehículos', it: '🚗 Veicoli', tr: '🚗 Taşıtlar' },
    'theme.home': { pt: '🏠 Casa', en: '🏠 Home', de: '🏠 Zuhause', es: '🏠 Casa', it: '🏠 Casa', tr: '🏠 Ev' },
    'theme.food': { pt: '🍎 Comidas', en: '🍎 Food', de: '🍎 Essen', es: '🍎 Comidas', it: '🍎 Cibo', tr: '🍎 Yiyecekler' },
    'theme.family': { pt: '👨‍👩‍👧 Família', en: '👨‍👩‍👧 Family', de: '👨‍👩‍👧 Familie', es: '👨‍👩‍👧 Familia', it: '👨‍👩‍👧 Famiglia', tr: '👨‍👩‍👧 Aile' },
    'theme.clothes': { pt: '👕 Roupas', en: '👕 Clothes', de: '👕 Kleidung', es: '👕 Ropa', it: '👕 Vestiti', tr: '👕 Kıyafetler' },
    'theme.actions': { pt: '😊 Emoções', en: '😊 Feelings', de: '😊 Gefühle', es: '😊 Emociones', it: '😊 Emozioni', tr: '😊 Duygular' },
    'theme.dialogs': { pt: '💬 Conversas', en: '💬 Conversations', de: '💬 Gespräche', es: '💬 Conversaciones', it: '💬 Conversazioni', tr: '💬 Sohbetler' },

    'ob.routine.title': {
      pt: 'Rotina da sessão', en: 'Session routine', de: 'Ablauf der Einheit',
      es: 'Rutina de la sesión', it: 'Routine della sessione', tr: 'Oturum rutini' },
    'ob.routine.duration': {
      pt: 'Duração desejada', en: 'Preferred length', de: 'Gewünschte Dauer',
      es: 'Duración deseada', it: 'Durata desiderata', tr: 'İstenen süre' },
    'ob.routine.time': {
      pt: 'Horário habitual (opcional)', en: 'Usual time (optional)',
      de: 'Übliche Uhrzeit (optional)', es: 'Hora habitual (opcional)',
      it: 'Orario abituale (facoltativo)', tr: 'Her zamanki saat (isteğe bağlı)' },
    'ob.routine.note': {
      pt: 'A sessão se adapta sozinha: se a criança cansar, o aplicativo encurta o dia automaticamente.',
      en: 'The session adapts on its own: if the child tires, the app shortens the day automatically.',
      de: 'Die Einheit passt sich von selbst an: Wird das Kind müde, kürzt die App den Tag automatisch.',
      es: 'La sesión se adapta sola: si el niño se cansa, la aplicación acorta el día automáticamente.',
      it: 'La sessione si adatta da sola: se il bambino si stanca, l’app accorcia la giornata automaticamente.',
      tr: 'Oturum kendini ayarlar: çocuk yorulursa uygulama günü otomatik olarak kısaltır.' },

    'ob.consent.title': {
      pt: 'Privacidade e permissões', en: 'Privacy and permissions',
      de: 'Datenschutz und Berechtigungen', es: 'Privacidad y permisos',
      it: 'Privacy e autorizzazioni', tr: 'Gizlilik ve izinler' },
    'ob.consent.note': {
      pt: 'Todos os dados ficam neste aparelho: progresso, perfis e gravações. Não há publicidade, chat, localização nem perfil público. O reconhecimento de voz usa o serviço de fala do navegador/celular — em alguns aparelhos o áudio é processado pelo sistema operacional; se você não permitir, a atividade de fala continua funcionando sem microfone.',
      en: 'All data stays on this device: progress, profiles and recordings. There are no ads, no chat, no location and no public profile. Speech recognition uses the browser/phone speech service — on some devices the audio is processed by the operating system. If you don’t allow it, speaking activities still work without a microphone.',
      de: 'Alle Daten bleiben auf diesem Gerät: Fortschritt, Profile und Aufnahmen. Keine Werbung, kein Chat, kein Standort, kein öffentliches Profil. Die Spracherkennung nutzt den Sprachdienst des Browsers bzw. Handys — auf manchen Geräten verarbeitet das Betriebssystem die Audiodaten. Ohne Erlaubnis funktionieren die Sprechübungen auch ohne Mikrofon.',
      es: 'Todos los datos se quedan en este dispositivo: progreso, perfiles y grabaciones. No hay publicidad, ni chat, ni ubicación, ni perfil público. El reconocimiento de voz usa el servicio de habla del navegador o del móvil; en algunos dispositivos el audio lo procesa el sistema operativo. Si no lo permites, las actividades de habla siguen funcionando sin micrófono.',
      it: 'Tutti i dati restano su questo dispositivo: progressi, profili e registrazioni. Niente pubblicità, chat, posizione o profilo pubblico. Il riconoscimento vocale usa il servizio vocale del browser o del telefono — su alcuni dispositivi l’audio è elaborato dal sistema operativo. Senza autorizzazione, le attività di parlato funzionano comunque senza microfono.',
      tr: 'Tüm veriler bu cihazda kalır: ilerleme, profiller ve kayıtlar. Reklam, sohbet, konum ve herkese açık profil yoktur. Ses tanıma, tarayıcının veya telefonun konuşma servisini kullanır — bazı cihazlarda ses işletim sistemi tarafından işlenir. İzin vermezseniz konuşma etkinlikleri mikrofonsuz da çalışır.' },
    'ob.consent.speech': {
      pt: 'Permitir reconhecimento de voz nas atividades de fala',
      en: 'Allow speech recognition in speaking activities',
      de: 'Spracherkennung bei Sprechübungen erlauben',
      es: 'Permitir reconocimiento de voz en las actividades de habla',
      it: 'Consentire il riconoscimento vocale nelle attività di parlato',
      tr: 'Konuşma etkinliklerinde ses tanımaya izin ver' },
    'ob.consent.familyVoice': {
      pt: 'Quero gravar palavras com a voz da família (fica só no aparelho)',
      en: 'I want to record words in the family’s voice (stays on this device)',
      de: 'Ich möchte Wörter mit der Familienstimme aufnehmen (bleibt auf dem Gerät)',
      es: 'Quiero grabar palabras con la voz de la familia (se queda en el dispositivo)',
      it: 'Voglio registrare parole con la voce della famiglia (resta sul dispositivo)',
      tr: 'Kelimeleri ailenin sesiyle kaydetmek istiyorum (yalnızca cihazda kalır)' },
    'ob.consent.agree': {
      pt: 'Sou responsável pela criança e autorizo o uso do aplicativo',
      en: 'I am the child’s parent or guardian and I authorise the use of this app',
      de: 'Ich bin erziehungsberechtigt und erlaube die Nutzung dieser App',
      es: 'Soy el responsable del niño y autorizo el uso de la aplicación',
      it: 'Sono il tutore del bambino e autorizzo l’uso dell’app',
      tr: 'Çocuğun velisiyim ve uygulamanın kullanımına izin veriyorum' },

    'ob.pin.title': {
      pt: 'PIN da área dos responsáveis', en: 'PIN for the parents’ area',
      de: 'PIN für den Elternbereich', es: 'PIN del área de los padres',
      it: 'PIN dell’area dei genitori', tr: 'Ebeveyn alanı PIN’i' },
    'ob.pin.exists': {
      pt: 'Já existe um PIN configurado. Você pode mantê-lo.',
      en: 'A PIN is already set. You can keep it.',
      de: 'Es ist bereits eine PIN eingerichtet. Sie können sie behalten.',
      es: 'Ya hay un PIN configurado. Puedes mantenerlo.',
      it: 'Un PIN è già impostato. Puoi mantenerlo.',
      tr: 'Zaten bir PIN var. Onu koruyabilirsiniz.' },
    'ob.pin.note': {
      pt: 'De 4 a 6 números. Protege as configurações e os dados — a criança nunca precisa dele.',
      en: '4 to 6 digits. It protects the settings and the data — the child never needs it.',
      de: '4 bis 6 Ziffern. Sie schützt Einstellungen und Daten — das Kind braucht sie nie.',
      es: 'De 4 a 6 números. Protege los ajustes y los datos: el niño nunca lo necesita.',
      it: 'Da 4 a 6 cifre. Protegge impostazioni e dati — al bambino non serve mai.',
      tr: '4 ila 6 rakam. Ayarları ve verileri korur — çocuğun ona hiç ihtiyacı olmaz.' },
    'ob.pin.invalid': {
      pt: 'PIN inválido — use 4 a 6 números', en: 'Invalid PIN — use 4 to 6 digits',
      de: 'Ungültige PIN — 4 bis 6 Ziffern', es: 'PIN no válido: usa de 4 a 6 números',
      it: 'PIN non valido — usa da 4 a 6 cifre', tr: 'Geçersiz PIN — 4 ila 6 rakam kullanın' },
    'ob.pin.updated': {
      pt: '✓ PIN atualizado', en: '✓ PIN updated', de: '✓ PIN aktualisiert',
      es: '✓ PIN actualizado', it: '✓ PIN aggiornato', tr: '✓ PIN güncellendi' },

    'ob.test.title': {
      pt: 'Teste inicial (curto e sem pressão)', en: 'First check (short, no pressure)',
      de: 'Erster Check (kurz, ohne Druck)', es: 'Prueba inicial (corta y sin presión)',
      it: 'Test iniziale (breve e senza pressione)', tr: 'İlk deneme (kısa ve baskısız)' },
    'ob.test.note': {
      pt: 'Entregue o aparelho à criança: 3 perguntas visuais no primeiro idioma escolhido. Serve só para calibrar o começo. Você pode pular.',
      en: 'Hand the device to the child: 3 picture questions in the first chosen language. It only calibrates the start. You can skip it.',
      de: 'Geben Sie dem Kind das Gerät: 3 Bildfragen in der ersten gewählten Sprache. Das dient nur dem Einstieg. Sie können überspringen.',
      es: 'Dale el dispositivo al niño: 3 preguntas visuales en el primer idioma elegido. Solo sirve para calibrar el inicio. Puedes saltarlo.',
      it: 'Dai il dispositivo al bambino: 3 domande illustrate nella prima lingua scelta. Serve solo a tarare l’inizio. Puoi saltare.',
      tr: 'Cihazı çocuğa verin: seçilen ilk dilde 3 görsel soru. Yalnızca başlangıcı ayarlamak içindir. Atlayabilirsiniz.' },
    'ob.test.start': {
      pt: 'Começar o teste', en: 'Start the check', de: 'Check starten',
      es: 'Empezar la prueba', it: 'Inizia il test', tr: 'Denemeyi başlat' },
    'ob.test.done': {
      pt: 'Pronto! ⭐ Obrigado, {name}!', en: 'All done! ⭐ Thank you, {name}!',
      de: 'Fertig! ⭐ Danke, {name}!', es: '¡Listo! ⭐ ¡Gracias, {name}!',
      it: 'Fatto! ⭐ Grazie, {name}!', tr: 'Bitti! ⭐ Teşekkürler, {name}!' },
    'ob.test.result': {
      pt: 'Teste inicial: {hits} de 3 no primeiro idioma. O ritmo inicial será ajustado.',
      en: 'First check: {hits} out of 3 in the first language. The starting pace will be adjusted.',
      de: 'Erster Check: {hits} von 3 in der ersten Sprache. Das Anfangstempo wird angepasst.',
      es: 'Prueba inicial: {hits} de 3 en el primer idioma. Se ajustará el ritmo inicial.',
      it: 'Test iniziale: {hits} su 3 nella prima lingua. Il ritmo iniziale verrà adattato.',
      tr: 'İlk deneme: ilk dilde 3’te {hits}. Başlangıç temposu buna göre ayarlanacak.' },

    'ob.summary.title': {
      pt: 'Tudo pronto! 🌟', en: 'All set! 🌟', de: 'Alles bereit! 🌟',
      es: '¡Todo listo! 🌟', it: 'Tutto pronto! 🌟', tr: 'Her şey hazır! 🌟' },
    'ob.summary.who': {
      pt: '{name}, {age} anos — vai aprender: {langs}.',
      en: '{name}, {age} years old — will learn: {langs}.',
      de: '{name}, {age} Jahre — lernt: {langs}.',
      es: '{name}, {age} años — va a aprender: {langs}.',
      it: '{name}, {age} anni — imparerà: {langs}.',
      tr: '{name}, {age} yaşında — öğrenecek: {langs}.' },
    'ob.summary.cycle': {
      pt: 'Sessões de ~{min} minutos: ouvir → compreender → falar → revisar → usar no dia a dia.',
      en: 'Sessions of about {min} minutes: listen → understand → speak → review → use in daily life.',
      de: 'Einheiten von etwa {min} Minuten: hören → verstehen → sprechen → wiederholen → im Alltag nutzen.',
      es: 'Sesiones de unos {min} minutos: escuchar → comprender → hablar → repasar → usar en el día a día.',
      it: 'Sessioni di circa {min} minuti: ascoltare → capire → parlare → ripassare → usare ogni giorno.',
      tr: 'Yaklaşık {min} dakikalık oturumlar: dinle → anla → konuş → tekrar et → günlük hayatta kullan.' },

    /* ---------- painel ---------- */
    'tab.progress': { pt: '📊 Progresso', en: '📊 Progress', de: '📊 Fortschritt', es: '📊 Progreso', it: '📊 Progressi', tr: '📊 İlerleme' },
    'tab.ladder': { pt: '🪜 Evolução', en: '🪜 Steps', de: '🪜 Stufen', es: '🪜 Evolución', it: '🪜 Evoluzione', tr: '🪜 Gelişim' },
    'tab.difficulties': { pt: '🧩 Dificuldades', en: '🧩 Struggles', de: '🧩 Schwierigkeiten', es: '🧩 Dificultades', it: '🧩 Difficoltà', tr: '🧩 Zorlananlar' },
    'tab.sessions': { pt: '🕒 Sessões', en: '🕒 Sessions', de: '🕒 Einheiten', es: '🕒 Sesiones', it: '🕒 Sessioni', tr: '🕒 Oturumlar' },
    'tab.tips': { pt: '💡 Dicas de hoje', en: '💡 Today’s tips', de: '💡 Tipps für heute', es: '💡 Consejos de hoy', it: '💡 Consigli di oggi', tr: '💡 Bugünün ipuçları' },
    'tab.voice': { pt: '🎙️ Voz da família', en: '🎙️ Family voice', de: '🎙️ Familienstimme', es: '🎙️ Voz de la familia', it: '🎙️ Voce di famiglia', tr: '🎙️ Aile sesi' },
    'tab.settings': { pt: '⚙️ Configurações', en: '⚙️ Settings', de: '⚙️ Einstellungen', es: '⚙️ Ajustes', it: '⚙️ Impostazioni', tr: '⚙️ Ayarlar' },
    'tab.data': { pt: '🔐 Dados', en: '🔐 Data', de: '🔐 Daten', es: '🔐 Datos', it: '🔐 Dati', tr: '🔐 Veriler' },

    'panel.title': {
      pt: 'Painel dos responsáveis', en: 'Parents’ dashboard', de: 'Eltern-Übersicht',
      es: 'Panel de los padres', it: 'Pannello dei genitori', tr: 'Ebeveyn paneli' },
    'panel.wordsSeen': {
      pt: 'palavras vistas', en: 'words seen', de: 'Wörter gesehen',
      es: 'palabras vistas', it: 'parole viste', tr: 'görülen kelime' },
    'panel.recognises': {
      pt: 'reconhece ao ouvir', en: 'recognises by ear', de: 'erkennt beim Hören',
      es: 'reconoce al oír', it: 'riconosce all’ascolto', tr: 'duyunca tanıyor' },
    'panel.speaks': {
      pt: 'fala sem ajuda', en: 'says without help', de: 'spricht ohne Hilfe',
      es: 'dice sin ayuda', it: 'dice senza aiuto', tr: 'yardımsız söylüyor' },
    'panel.retention': {
      pt: 'Retenção estimada', en: 'Estimated retention', de: 'Geschätzte Behaltensleistung',
      es: 'Retención estimada', it: 'Ritenzione stimata', tr: 'Tahmini kalıcılık' },
    'panel.phase': {
      pt: 'fase {n} de {total}', en: 'phase {n} of {total}', de: 'Phase {n} von {total}',
      es: 'fase {n} de {total}', it: 'fase {n} di {total}', tr: '{total} aşamadan {n}.' },
    'panel.noWords': {
      pt: 'Ainda sem palavras trabalhadas neste idioma.',
      en: 'No words worked on in this language yet.',
      de: 'In dieser Sprache wurde noch nichts geübt.',
      es: 'Aún no se han trabajado palabras en este idioma.',
      it: 'Nessuna parola ancora lavorata in questa lingua.',
      tr: 'Bu dilde henüz çalışılmış kelime yok.' },

    'ladder.intro': {
      pt: 'Cada palavra sobe degraus conforme a criança consegue mais com ela. Ela só avança depois de acertar duas vezes seguidas no degrau atual — e, em dificuldade, recebe de volta um degrau de apoio, nunca todos.',
      en: 'Each word climbs steps as the child can do more with it. It only moves up after two correct answers in a row on the current step — and on a struggle it gets back one step of support, never all of it.',
      de: 'Jedes Wort steigt Stufen hinauf, je mehr das Kind damit kann. Es steigt erst nach zwei richtigen Antworten in Folge auf der aktuellen Stufe — und bei Schwierigkeiten gibt es eine Stufe Unterstützung zurück, nie die ganze.',
      es: 'Cada palabra sube escalones a medida que el niño puede más con ella. Solo avanza tras acertar dos veces seguidas en el escalón actual, y ante una dificultad recupera un escalón de apoyo, nunca todos.',
      it: 'Ogni parola sale gradini man mano che il bambino ci riesce di più. Avanza solo dopo due risposte giuste di fila sul gradino attuale e, in difficoltà, riceve indietro un gradino di aiuto, mai tutti.',
      tr: 'Her kelime, çocuk onunla daha fazlasını yapabildikçe basamak çıkar. Yalnızca mevcut basamakta üst üste iki doğrudan sonra yükselir; zorlandığında ise bir basamak destek geri verilir, hepsi değil.' },
    'ladder.speaking': {
      pt: '<b>{n}</b> de {total} palavras já saem da boca dela neste idioma. Para {age} anos, o app pede no máximo “{ceiling}” — acima disso seria cobrança fora de hora.',
      en: '<b>{n}</b> of {total} words already come out of her mouth in this language. At {age}, the app asks for “{ceiling}” at most — beyond that would be pushing too early.',
      de: '<b>{n}</b> von {total} Wörtern kommen in dieser Sprache schon über die Lippen. Mit {age} Jahren verlangt die App höchstens „{ceiling}“ — mehr wäre zu früh.',
      es: '<b>{n}</b> de {total} palabras ya salen de su boca en este idioma. A los {age} años, la app pide como máximo «{ceiling}»: más allá sería exigir antes de tiempo.',
      it: '<b>{n}</b> parole su {total} escono già dalla sua bocca in questa lingua. A {age} anni l’app chiede al massimo «{ceiling}» — oltre sarebbe chiedere troppo presto.',
      tr: 'Bu dilde <b>{n}</b>/{total} kelime şimdiden ağzından çıkıyor. {age} yaş için uygulama en fazla “{ceiling}” ister — ötesi vaktinden önce zorlamak olurdu.' },
    'ladder.silence': {
      pt: 'Silêncio numa atividade de fala não conta como erro: o app entende que a criança ainda está na fase de escuta daquela palavra e volta sozinho para uma atividade de corpo, sem insistir.',
      en: 'Silence in a speaking activity does not count as a mistake: the app takes it as a sign that the child is still in the listening phase for that word and goes back to a body activity on its own, without pushing.',
      de: 'Schweigen bei einer Sprechübung gilt nicht als Fehler: Die App versteht, dass das Kind bei diesem Wort noch in der Hörphase ist, und wechselt von selbst zu einer Bewegungsübung — ohne zu drängen.',
      es: 'El silencio en una actividad de habla no cuenta como error: la app entiende que el niño sigue en la fase de escucha de esa palabra y vuelve sola a una actividad de cuerpo, sin insistir.',
      it: 'Il silenzio in un’attività di parlato non conta come errore: l’app capisce che il bambino è ancora nella fase di ascolto di quella parola e torna da sola a un’attività di movimento, senza insistere.',
      tr: 'Konuşma etkinliğindeki sessizlik hata sayılmaz: uygulama, çocuğun o kelimede hâlâ dinleme aşamasında olduğunu anlar ve ısrar etmeden kendiliğinden bir beden etkinliğine döner.' },

    'diff.none': {
      pt: 'Nenhuma dificuldade no momento. 🎉', en: 'No struggles right now. 🎉',
      de: 'Momentan keine Schwierigkeiten. 🎉', es: 'Ninguna dificultad por ahora. 🎉',
      it: 'Nessuna difficoltà al momento. 🎉', tr: 'Şu anda zorlanma yok. 🎉' },
    'diff.simplified': {
      pt: 'atividade simplificada automaticamente', en: 'activity simplified automatically',
      de: 'Übung automatisch vereinfacht', es: 'actividad simplificada automáticamente',
      it: 'attività semplificata automaticamente', tr: 'etkinlik otomatik olarak basitleştirildi' },

    'sessions.none': {
      pt: 'Nenhuma sessão ainda.', en: 'No sessions yet.', de: 'Noch keine Einheiten.',
      es: 'Aún no hay sesiones.', it: 'Ancora nessuna sessione.', tr: 'Henüz oturum yok.' },
    'sessions.total': {
      pt: 'Tempo total de uso: {min} min em {n} sessões.',
      en: 'Total time used: {min} min across {n} sessions.',
      de: 'Gesamte Nutzungszeit: {min} Min. in {n} Einheiten.',
      es: 'Tiempo total de uso: {min} min en {n} sesiones.',
      it: 'Tempo totale di utilizzo: {min} min in {n} sessioni.',
      tr: 'Toplam kullanım: {n} oturumda {min} dk.' },
    'sessions.activities': {
      pt: 'atividades', en: 'activities', de: 'Übungen',
      es: 'actividades', it: 'attività', tr: 'etkinlik' },
    'sessions.extraHelp': {
      pt: 'com apoio extra', en: 'with extra support', de: 'mit zusätzlicher Hilfe',
      es: 'con apoyo extra', it: 'con supporto extra', tr: 'ek destekle' },
    'sessions.shortened': {
      pt: 'sessão encurtada (cansaço)', en: 'session shortened (tiredness)',
      de: 'Einheit gekürzt (Müdigkeit)', es: 'sesión acortada (cansancio)',
      it: 'sessione accorciata (stanchezza)', tr: 'oturum kısaltıldı (yorgunluk)' },

    'tips.empty': {
      pt: 'As dicas do dia aparecem depois da primeira sessão.',
      en: 'Today’s tips appear after the first session.',
      de: 'Die Tipps des Tages erscheinen nach der ersten Einheit.',
      es: 'Los consejos del día aparecen tras la primera sesión.',
      it: 'I consigli del giorno compaiono dopo la prima sessione.',
      tr: 'Günün ipuçları ilk oturumdan sonra görünür.' },
    'tips.intro': {
      pt: 'Quatro momentos de hoje — sem virar professor, só brincando:',
      en: 'Four moments for today — no need to be a teacher, just play:',
      de: 'Vier Momente für heute — Sie müssen keine Lehrkraft sein, einfach spielen:',
      es: 'Cuatro momentos de hoy: no hace falta ser profesor, solo jugar:',
      it: 'Quattro momenti per oggi — senza fare il maestro, solo giocando:',
      tr: 'Bugün için dört an — öğretmen olmanıza gerek yok, sadece oyun:' },

    'voice.disabled': {
      pt: 'A gravação da voz da família está desativada. Ative nas Configurações.',
      en: 'Family voice recording is off. Turn it on in Settings.',
      de: 'Die Aufnahme der Familienstimme ist aus. Schalten Sie sie in den Einstellungen ein.',
      es: 'La grabación de la voz de la familia está desactivada. Actívala en Ajustes.',
      it: 'La registrazione della voce di famiglia è disattivata. Attivala nelle Impostazioni.',
      tr: 'Aile sesi kaydı kapalı. Ayarlar’dan açın.' },
    'voice.unsupported': {
      pt: 'Este navegador não permite gravação de áudio.',
      en: 'This browser does not allow audio recording.',
      de: 'Dieser Browser erlaubt keine Audioaufnahme.',
      es: 'Este navegador no permite grabar audio.',
      it: 'Questo browser non consente la registrazione audio.',
      tr: 'Bu tarayıcı ses kaydına izin vermiyor.' },
    'voice.note': {
      pt: 'Grave palavras com a sua voz: quando existir gravação, a criança ouve a família em vez da voz sintética. Tudo fica salvo apenas neste aparelho.',
      en: 'Record words in your own voice: when a recording exists, the child hears the family instead of the synthetic voice. Everything stays on this device only.',
      de: 'Nehmen Sie Wörter mit Ihrer Stimme auf: Wo eine Aufnahme existiert, hört das Kind die Familie statt der synthetischen Stimme. Alles bleibt nur auf diesem Gerät.',
      es: 'Graba palabras con tu voz: cuando haya grabación, el niño escucha a la familia en lugar de la voz sintética. Todo se guarda solo en este dispositivo.',
      it: 'Registra parole con la tua voce: quando esiste una registrazione, il bambino sente la famiglia invece della voce sintetica. Tutto resta solo su questo dispositivo.',
      tr: 'Kelimeleri kendi sesinizle kaydedin: kayıt varsa çocuk sentetik ses yerine aileyi duyar. Her şey yalnızca bu cihazda kalır.' },
    'voice.record': { pt: '⏺️ Gravar', en: '⏺️ Record', de: '⏺️ Aufnehmen', es: '⏺️ Grabar', it: '⏺️ Registra', tr: '⏺️ Kaydet' },
    'voice.stop': { pt: '⏹️ Parar', en: '⏹️ Stop', de: '⏹️ Stopp', es: '⏹️ Parar', it: '⏹️ Ferma', tr: '⏹️ Durdur' },
    'voice.again': { pt: '⏺️ Regravar', en: '⏺️ Re-record', de: '⏺️ Neu aufnehmen', es: '⏺️ Regrabar', it: '⏺️ Registra di nuovo', tr: '⏺️ Yeniden kaydet' },
    'voice.denied': { pt: 'Microfone negado', en: 'Microphone denied', de: 'Mikrofon abgelehnt', es: 'Micrófono denegado', it: 'Microfono negato', tr: 'Mikrofon reddedildi' },

    'set.langs': {
      pt: 'Idiomas de aprendizagem (1 a 4)', en: 'Learning languages (1 to 4)',
      de: 'Lernsprachen (1 bis 4)', es: 'Idiomas de aprendizaje (1 a 4)',
      it: 'Lingue di apprendimento (da 1 a 4)', tr: 'Öğrenme dilleri (1-4)' },
    'set.prefs': {
      pt: 'Preferências', en: 'Preferences', de: 'Einstellungen',
      es: 'Preferencias', it: 'Preferenze', tr: 'Tercihler' },
    'set.speech': {
      pt: 'Reconhecimento de voz nas atividades de fala',
      en: 'Speech recognition in speaking activities',
      de: 'Spracherkennung bei Sprechübungen',
      es: 'Reconocimiento de voz en las actividades de habla',
      it: 'Riconoscimento vocale nelle attività di parlato',
      tr: 'Konuşma etkinliklerinde ses tanıma' },
    'set.familyVoice': {
      pt: 'Gravação da voz da família', en: 'Family voice recording',
      de: 'Aufnahme der Familienstimme', es: 'Grabación de la voz de la familia',
      it: 'Registrazione della voce di famiglia', tr: 'Aile sesi kaydı' },
    'set.textSupport': {
      pt: 'Palavras escritas como apoio (5-7 anos)',
      en: 'Written words as support (ages 5-7)',
      de: 'Geschriebene Wörter als Hilfe (5-7 Jahre)',
      es: 'Palabras escritas como apoyo (5-7 años)',
      it: 'Parole scritte come supporto (5-7 anni)',
      tr: 'Destek olarak yazılı kelimeler (5-7 yaş)' },
    'set.changePin': {
      pt: 'Trocar PIN', en: 'Change PIN', de: 'PIN ändern',
      es: 'Cambiar el PIN', it: 'Cambia PIN', tr: 'PIN’i değiştir' },
    'set.newPin': {
      pt: 'Novo PIN (4-6 números)', en: 'New PIN (4-6 digits)',
      de: 'Neue PIN (4-6 Ziffern)', es: 'Nuevo PIN (4-6 números)',
      it: 'Nuovo PIN (4-6 cifre)', tr: 'Yeni PIN (4-6 rakam)' },
    'set.savePin': {
      pt: 'Salvar novo PIN', en: 'Save new PIN', de: 'Neue PIN speichern',
      es: 'Guardar el nuevo PIN', it: 'Salva il nuovo PIN', tr: 'Yeni PIN’i kaydet' },

    'data.title': {
      pt: 'Seus dados, suas regras', en: 'Your data, your rules',
      de: 'Ihre Daten, Ihre Regeln', es: 'Tus datos, tus reglas',
      it: 'I tuoi dati, le tue regole', tr: 'Verileriniz, sizin kurallarınız' },
    'data.note': {
      pt: 'Tudo fica neste aparelho. Nenhum dado é enviado a servidores nesta versão de demonstração.',
      en: 'Everything stays on this device. No data is sent to any server in this demo version.',
      de: 'Alles bleibt auf diesem Gerät. In dieser Demo werden keine Daten an Server gesendet.',
      es: 'Todo se queda en este dispositivo. En esta versión de demostración no se envía ningún dato a servidores.',
      it: 'Tutto resta su questo dispositivo. In questa versione dimostrativa nessun dato viene inviato a server.',
      tr: 'Her şey bu cihazda kalır. Bu tanıtım sürümünde hiçbir veri sunuculara gönderilmez.' },
    'data.export': {
      pt: '⬇️ Exportar dados do perfil (JSON)', en: '⬇️ Export profile data (JSON)',
      de: '⬇️ Profildaten exportieren (JSON)', es: '⬇️ Exportar datos del perfil (JSON)',
      it: '⬇️ Esporta i dati del profilo (JSON)', tr: '⬇️ Profil verilerini dışa aktar (JSON)' },
    'data.delete': {
      pt: '🗑️ Excluir este perfil e todos os dados',
      en: '🗑️ Delete this profile and all its data',
      de: '🗑️ Dieses Profil und alle Daten löschen',
      es: '🗑️ Eliminar este perfil y todos los datos',
      it: '🗑️ Elimina questo profilo e tutti i dati',
      tr: '🗑️ Bu profili ve tüm verileri sil' },
    'data.confirmDelete': {
      pt: 'Excluir permanentemente o perfil "{name}", progresso e gravações?',
      en: 'Permanently delete the profile "{name}", its progress and recordings?',
      de: 'Profil „{name}“ mit Fortschritt und Aufnahmen endgültig löschen?',
      es: '¿Eliminar permanentemente el perfil «{name}», su progreso y las grabaciones?',
      it: 'Eliminare definitivamente il profilo «{name}», i progressi e le registrazioni?',
      tr: '“{name}” profili, ilerlemesi ve kayıtları kalıcı olarak silinsin mi?' },
    'data.profiles': {
      pt: 'Perfis', en: 'Profiles', de: 'Profile', es: 'Perfiles', it: 'Profili', tr: 'Profiller' },
    'data.active': {
      pt: '(ativo)', en: '(active)', de: '(aktiv)', es: '(activo)', it: '(attivo)', tr: '(etkin)' },
    'data.addChild': {
      pt: '+ Adicionar outra criança', en: '+ Add another child',
      de: '+ Weiteres Kind hinzufügen', es: '+ Añadir otro niño',
      it: '+ Aggiungi un altro bambino', tr: '+ Başka bir çocuk ekle' },
    'data.noProfile': {
      pt: 'Nenhum perfil ativo.', en: 'No active profile.', de: 'Kein aktives Profil.',
      es: 'Ningún perfil activo.', it: 'Nessun profilo attivo.', tr: 'Etkin profil yok.' },

    /* ---------- degraus da escada (aparecem no painel) ---------- */
    'phase.exposure': { pt: 'ouvindo e vendo', en: 'listening and looking', de: 'hört und schaut', es: 'escuchando y mirando', it: 'ascolta e guarda', tr: 'dinliyor ve bakıyor' },
    'phase.recognize': { pt: 'reconhece ao ouvir', en: 'recognises by ear', de: 'erkennt beim Hören', es: 'reconoce al oír', it: 'riconosce all’ascolto', tr: 'duyunca tanıyor' },
    'phase.act': { pt: 'responde com o corpo', en: 'responds with the body', de: 'reagiert mit dem Körper', es: 'responde con el cuerpo', it: 'risponde col corpo', tr: 'bedeniyle yanıtlıyor' },
    'phase.echo': { pt: 'repete com modelo', en: 'repeats after a model', de: 'spricht nach', es: 'repite con modelo', it: 'ripete col modello', tr: 'örnekle tekrar ediyor' },
    'phase.cloze': { pt: 'completa a frase', en: 'completes the sentence', de: 'ergänzt den Satz', es: 'completa la frase', it: 'completa la frase', tr: 'cümleyi tamamlıyor' },
    'phase.name': { pt: 'fala sozinha', en: 'says it alone', de: 'spricht allein', es: 'lo dice solo', it: 'lo dice da solo', tr: 'kendi başına söylüyor' },
    'phase.use': { pt: 'usa em conversa', en: 'uses it in conversation', de: 'nutzt es im Gespräch', es: 'lo usa en conversación', it: 'lo usa in conversazione', tr: 'sohbette kullanıyor' },

    /* ---------- estados do conceito ---------- */
    'state.new': { pt: 'ainda não apresentado', en: 'not introduced yet', de: 'noch nicht eingeführt', es: 'aún no presentado', it: 'non ancora presentato', tr: 'henüz tanıtılmadı' },
    'state.presented': { pt: 'apresentado', en: 'introduced', de: 'eingeführt', es: 'presentado', it: 'presentato', tr: 'tanıtıldı' },
    'state.recognized': { pt: 'reconhecido ao ouvir', en: 'recognised by ear', de: 'beim Hören erkannt', es: 'reconocido al oír', it: 'riconosciuto all’ascolto', tr: 'duyunca tanındı' },
    'state.repeated_helped': { pt: 'repetido com ajuda', en: 'repeated with help', de: 'mit Hilfe nachgesprochen', es: 'repetido con ayuda', it: 'ripetuto con aiuto', tr: 'yardımla tekrarlandı' },
    'state.spoken': { pt: 'falado sem ajuda', en: 'said without help', de: 'ohne Hilfe gesprochen', es: 'dicho sin ayuda', it: 'detto senza aiuto', tr: 'yardımsız söylendi' },
    'state.mastered': { pt: 'dominado', en: 'mastered', de: 'sicher beherrscht', es: 'dominado', it: 'padroneggiato', tr: 'pekişti' },
    'state.review': { pt: 'precisa de revisão', en: 'needs review', de: 'braucht Wiederholung', es: 'necesita repaso', it: 'da ripassare', tr: 'tekrar gerekiyor' },

    /* ---------- dicas do dia (geradas ao fim da sessão) ---------- */
    'tip.breakfast': {
      pt: 'No café da manhã, pergunte onde está “{word}” em {lang}.',
      en: 'At breakfast, ask where “{word}” is in {lang}.',
      de: 'Fragen Sie beim Frühstück auf {lang}, wo „{word}“ ist.',
      es: 'En el desayuno, pregunta dónde está «{word}» en {lang}.',
      it: 'A colazione, chiedi dov’è «{word}» in {lang}.',
      tr: 'Kahvaltıda, {lang} dilinde “{word}” nerede diye sorun.' },
    'tip.leaving': {
      pt: 'Ao sair de casa, diga “{word}” em {lang} apontando para o objeto.',
      en: 'On the way out, say “{word}” in {lang} while pointing at the object.',
      de: 'Sagen Sie beim Rausgehen „{word}“ auf {lang} und zeigen Sie auf den Gegenstand.',
      es: 'Al salir de casa, di «{word}» en {lang} señalando el objeto.',
      it: 'Uscendo di casa, dì «{word}» in {lang} indicando l’oggetto.',
      tr: 'Evden çıkarken nesneyi göstererek {lang} dilinde “{word}” deyin.' },
    'tip.car': {
      pt: 'No carro ou no caminho, repitam juntos “{word}” em {lang}.',
      en: 'In the car or on the way, repeat “{word}” in {lang} together.',
      de: 'Wiederholen Sie im Auto oder unterwegs gemeinsam „{word}“ auf {lang}.',
      es: 'En el coche o de camino, repetid juntos «{word}» en {lang}.',
      it: 'In auto o per strada, ripetete insieme «{word}» in {lang}.',
      tr: 'Arabada ya da yolda, {lang} dilinde “{word}” kelimesini birlikte tekrarlayın.' },
    'tip.bedtime': {
      pt: 'Antes de dormir, peça que a criança mostre ou fale “{word}” em {lang}.',
      en: 'Before bed, ask the child to point to or say “{word}” in {lang}.',
      de: 'Bitten Sie das Kind vor dem Schlafen, „{word}“ auf {lang} zu zeigen oder zu sagen.',
      es: 'Antes de dormir, pide al niño que muestre o diga «{word}» en {lang}.',
      it: 'Prima di dormire, chiedi al bambino di indicare o dire «{word}» in {lang}.',
      tr: 'Yatmadan önce çocuktan {lang} dilinde “{word}” kelimesini göstermesini ya da söylemesini isteyin.' },

    /* ---------- nomes dos idiomas de aprendizagem ---------- */
    'lang.pt': { pt: 'Português (Brasil)', en: 'Portuguese (Brazil)', de: 'Portugiesisch (Brasilien)', es: 'Portugués (Brasil)', it: 'Portoghese (Brasile)', tr: 'Portekizce (Brezilya)' },
    'lang.de': { pt: 'Alemão', en: 'German', de: 'Deutsch', es: 'Alemán', it: 'Tedesco', tr: 'Almanca' },
    'lang.en': { pt: 'Inglês', en: 'English', de: 'Englisch', es: 'Inglés', it: 'Inglese', tr: 'İngilizce' },
    'lang.es': { pt: 'Espanhol', en: 'Spanish', de: 'Spanisch', es: 'Español', it: 'Spagnolo', tr: 'İspanyolca' },
    'lang.tr': { pt: 'Turco', en: 'Turkish', de: 'Türkisch', es: 'Turco', it: 'Turco', tr: 'Türkçe' },
    'lang.fr': { pt: 'Francês', en: 'French', de: 'Französisch', es: 'Francés', it: 'Francese', tr: 'Fransızca' },
    'lang.it': { pt: 'Italiano', en: 'Italian', de: 'Italienisch', es: 'Italiano', it: 'Italiano', tr: 'İtalyanca' },
    'lang.zh': { pt: 'Mandarim', en: 'Mandarin', de: 'Mandarin', es: 'Mandarín', it: 'Mandarino', tr: 'Mandarin' },
    'lang.ja': { pt: 'Japonês', en: 'Japanese', de: 'Japanisch', es: 'Japonés', it: 'Giapponese', tr: 'Japonca' },

    /* variações regionais */
    'var.de-DE': { pt: 'Alemão padrão', en: 'Standard German', de: 'Standarddeutsch', es: 'Alemán estándar', it: 'Tedesco standard', tr: 'Standart Almanca' },
    'var.de-AT': { pt: 'Alemão austríaco', en: 'Austrian German', de: 'Österreichisches Deutsch', es: 'Alemán austríaco', it: 'Tedesco austriaco', tr: 'Avusturya Almancası' },
    'var.en-GB': { pt: 'Inglês britânico', en: 'British English', de: 'Britisches Englisch', es: 'Inglés británico', it: 'Inglese britannico', tr: 'İngiliz İngilizcesi' },
    'var.en-US': { pt: 'Inglês americano', en: 'American English', de: 'Amerikanisches Englisch', es: 'Inglés americano', it: 'Inglese americano', tr: 'Amerikan İngilizcesi' },
    'var.es-ES': { pt: 'Espanhol europeu', en: 'European Spanish', de: 'Europäisches Spanisch', es: 'Español europeo', it: 'Spagnolo europeo', tr: 'Avrupa İspanyolcası' },
    'var.es-419': { pt: 'Espanhol latino-americano', en: 'Latin American Spanish', de: 'Lateinamerikanisches Spanisch', es: 'Español latinoamericano', it: 'Spagnolo latinoamericano', tr: 'Latin Amerika İspanyolcası' },

    /* ---------- splash (a única tela infantil com texto) ---------- */
    'splash.tagline': {
      pt: 'Uma base real em até 4 idiomas — jornada de 60 dias',
      en: 'A real foundation in up to 4 languages — a 60-day journey',
      de: 'Eine echte Grundlage in bis zu 4 Sprachen — 60 Tage',
      es: 'Una base real en hasta 4 idiomas: un viaje de 60 días',
      it: 'Una base vera in fino a 4 lingue — un percorso di 60 giorni',
      tr: '4 dile kadar gerçek bir temel — 60 günlük yolculuk' },
    'splash.setupFirst': {
      pt: 'Antes da primeira aventura, um adulto configura tudo em 2 minutos.',
      en: 'Before the first adventure, an adult sets everything up in 2 minutes.',
      de: 'Vor dem ersten Abenteuer richtet ein Erwachsener alles in 2 Minuten ein.',
      es: 'Antes de la primera aventura, un adulto lo configura todo en 2 minutos.',
      it: 'Prima della prima avventura, un adulto configura tutto in 2 minuti.',
      tr: 'İlk maceradan önce bir yetişkin her şeyi 2 dakikada ayarlar.' },
    'splash.parents': {
      pt: '👨‍👩‍👧 Área dos responsáveis', en: '👨‍👩‍👧 Parents’ area',
      de: '👨‍👩‍👧 Elternbereich', es: '👨‍👩‍👧 Área de los padres',
      it: '👨‍👩‍👧 Area dei genitori', tr: '👨‍👩‍👧 Ebeveyn alanı' }
  };

  var current = 'pt';

  /* Idioma do aparelho, quando for um dos seis. Senão, inglês. */
  function detect() {
    var cands = [];
    try {
      if (g.navigator) {
        if (navigator.languages) cands = cands.concat(navigator.languages);
        if (navigator.language) cands.push(navigator.language);
      }
    } catch (e) {}
    for (var i = 0; i < cands.length; i++) {
      var base = String(cands[i]).toLowerCase().split('-')[0];
      for (var j = 0; j < UI_LANGS.length; j++) {
        if (UI_LANGS[j].code === base) return base;
      }
    }
    return 'en';
  }

  function setLang(code) {
    for (var i = 0; i < UI_LANGS.length; i++) {
      if (UI_LANGS[i].code === code) { current = code; return code; }
    }
    return current;
  }

  function getLang() { return current; }

  /* t('chave', {name: 'Sofia'}) — sem tradução, cai no inglês; sem inglês,
   * devolve a própria chave (visível no teste, nunca uma tela vazia). */
  function t(key, params) {
    var entry = S[key];
    var txt = entry ? (entry[current] || entry.en || entry.pt) : key;
    if (params) {
      Object.keys(params).forEach(function (k) {
        txt = txt.split('{' + k + '}').join(params[k]);
      });
    }
    return txt;
  }

  /* Nome de um idioma de aprendizagem, escrito na língua do responsável. */
  function langName(code) { return t('lang.' + code); }

  var api = {
    UI_LANGS: UI_LANGS, STRINGS: S,
    detect: detect, setLang: setLang, getLang: getLang, t: t, langName: langName
  };

  g.LUMI_I18N = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
