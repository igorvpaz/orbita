// Translation tuples follow this order: English, Spanish, French, German, Italian.
const rows = `
Idioma|Language|Idioma|Langue|Sprache|Lingua
Entrar|Sign in|Entrar|Se connecter|Anmelden|Accedi
Entrando…|Signing in…|Entrando…|Connexion…|Anmeldung…|Accesso…
E-mail|Email|Correo electrónico|E-mail|E-Mail|E-mail
Senha|Password|Contraseña|Mot de passe|Passwort|Password
Sua senha|Your password|Tu contraseña|Votre mot de passe|Ihr Passwort|La tua password
Mostrar senha|Show password|Mostrar contraseña|Afficher le mot de passe|Passwort anzeigen|Mostra password
Ocultar senha|Hide password|Ocultar contraseña|Masquer le mot de passe|Passwort verbergen|Nascondi password
Esqueceu a senha? Fale com o administrador.|Forgot your password? Contact the administrator.|¿Olvidaste tu contraseña? Contacta al administrador.|Mot de passe oublié ? Contactez l'administrateur.|Passwort vergessen? Kontaktieren Sie die Administration.|Password dimenticata? Contatta l'amministratore.
Apenas usuários cadastrados|Registered users only|Solo usuarios registrados|Utilisateurs inscrits uniquement|Nur registrierte Nutzer|Solo utenti registrati
E-mail ou senha inválidos.|Invalid email or password.|Correo o contraseña incorrectos.|E-mail ou mot de passe incorrect.|E-Mail oder Passwort ungültig.|E-mail o password non validi.
Não foi possível conectar. Tente novamente.|Unable to connect. Please try again.|No se pudo conectar. Inténtalo de nuevo.|Connexion impossible. Réessayez.|Verbindung fehlgeschlagen. Bitte erneut versuchen.|Connessione non riuscita. Riprova.
Conta ainda não configurada.|Account not configured yet.|Cuenta aún no configurada.|Compte non configuré.|Konto noch nicht eingerichtet.|Account non ancora configurato.
Sair|Sign out|Salir|Se déconnecter|Abmelden|Esci
Sair da conta|Sign out|Cerrar sesión|Se déconnecter|Abmelden|Esci dall'account
Modo claro|Light mode|Modo claro|Mode clair|Heller Modus|Modalità chiara
Modo escuro|Dark mode|Modo oscuro|Mode sombre|Dunkler Modus|Modalità scura
Alternar entre modo claro e escuro|Switch light or dark mode|Cambiar modo claro u oscuro|Changer le thème clair ou sombre|Hellen oder dunklen Modus wählen|Cambia tema chiaro o scuro
Visão geral|Overview|Resumen|Vue d'ensemble|Übersicht|Panoramica
Parceiros|Partners|Colaboradores|Partenaires|Partner|Partner
Serviços|Services|Servicios|Services|Angebote|Servizi
Pedidos|Orders|Pedidos|Commandes|Buchungen|Ordini
Membros|Members|Miembros|Membres|Mitglieder|Membri
Administradores|Administrators|Administradores|Administrateurs|Administratoren|Amministratori
Administrador|Administrator|Administrador|Administrateur|Administrator|Amministratore
ADMINISTRAÇÃO|ADMINISTRATION|ADMINISTRACIÓN|ADMINISTRATION|VERWALTUNG|AMMINISTRAZIONE
GESTÃO DO COWORKING|WORKSPACE MANAGEMENT|GESTIÓN DEL COWORKING|GESTION DU COWORKING|COWORKING-VERWALTUNG|GESTIONE COWORKING
SUA EXPERIÊNCIA|YOUR EXPERIENCE|TU EXPERIENCIA|VOTRE EXPÉRIENCE|IHR ERLEBNIS|LA TUA ESPERIENZA
MEMBRO|MEMBER|MIEMBRO|MEMBRE|MITGLIED|MEMBRO
Membro|Member|Miembro|Membre|Mitglied|Membro
Área do membro|Member area|Área de miembros|Espace membre|Mitgliederbereich|Area membri
Descobrir serviços|Discover services|Descubrir servicios|Découvrir les services|Angebote entdecken|Scopri i servizi
Meus pedidos|My orders|Mis pedidos|Mes commandes|Meine Buchungen|I miei ordini
Minha assinatura|My subscription|Mi suscripción|Mon abonnement|Mein Abonnement|Il mio abbonamento
Instalar aplicativo|Install app|Instalar aplicación|Installer l'application|App installieren|Installa l'app
Atualizar|Refresh|Actualizar|Actualiser|Aktualisieren|Aggiorna
Salvar|Save|Guardar|Enregistrer|Speichern|Salva
Salvar alterações|Save changes|Guardar cambios|Enregistrer les modifications|Änderungen speichern|Salva modifiche
Cancelar|Cancel|Cancelar|Annuler|Abbrechen|Annulla
Editar|Edit|Editar|Modifier|Bearbeiten|Modifica
Excluir|Delete|Eliminar|Supprimer|Löschen|Elimina
Nome|Name|Nombre|Nom|Name|Nome
Nome completo|Full name|Nombre completo|Nom complet|Vollständiger Name|Nome completo
Cadastro|Created|Registro|Inscription|Erstellt|Registrazione
Ações|Actions|Acciones|Actions|Aktionen|Azioni
Você|You|Tú|Vous|Sie|Tu
Novo administrador|New administrator|Nuevo administrador|Nouvel administrateur|Neuer Administrator|Nuovo amministratore
Editar administrador|Edit administrator|Editar administrador|Modifier l'administrateur|Administrator bearbeiten|Modifica amministratore
Criar administrador|Create administrator|Crear administrador|Créer un administrateur|Administrator erstellen|Crea amministratore
Nova senha (opcional)|New password (optional)|Nueva contraseña (opcional)|Nouveau mot de passe (facultatif)|Neues Passwort (optional)|Nuova password (facoltativa)
Gerencie quem pode administrar a plataforma.|Manage who can administer the platform.|Gestiona quién puede administrar la plataforma.|Gérez les administrateurs de la plateforme.|Verwalten Sie die Administratoren der Plattform.|Gestisci chi può amministrare la piattaforma.
Administrador salvo com sucesso.|Administrator saved successfully.|Administrador guardado correctamente.|Administrateur enregistré.|Administrator gespeichert.|Amministratore salvato.
Administrador excluído.|Administrator deleted.|Administrador eliminado.|Administrateur supprimé.|Administrator gelöscht.|Amministratore eliminato.
Excluir administrador?|Delete administrator?|¿Eliminar administrador?|Supprimer cet administrateur ?|Administrator löschen?|Eliminare l'amministratore?
O acesso dessa conta será removido permanentemente.|This account's access will be permanently removed.|El acceso de esta cuenta se eliminará permanentemente.|L'accès à ce compte sera supprimé définitivement.|Der Zugang dieses Kontos wird dauerhaft entfernt.|L'accesso di questo account verrà rimosso definitivamente.
Confirmar exclusão|Confirm deletion|Confirmar eliminación|Confirmer la suppression|Löschen bestätigen|Conferma eliminazione
Não é permitido excluir o próprio administrador|You cannot delete your own administrator account|No puedes eliminar tu propia cuenta de administrador|Vous ne pouvez pas supprimer votre propre compte administrateur|Sie können Ihr eigenes Administratorkonto nicht löschen|Non puoi eliminare il tuo account amministratore
SUA PRÓXIMA EXPERIÊNCIA|YOUR NEXT EXPERIENCE|TU PRÓXIMA EXPERIENCIA|VOTRE PROCHAINE EXPÉRIENCE|IHR NÄCHSTES ERLEBNIS|LA TUA PROSSIMA ESPERIENZA
Escolha seu horário|Choose your time|Elige tu horario|Choisissez votre créneau|Wählen Sie Ihre Zeit|Scegli l'orario
Data da reserva|Booking date|Fecha de reserva|Date de réservation|Buchungsdatum|Data della prenotazione
Uma pessoa por pedido. Horários no fuso da unidade (Brasília).|One person per order. Times use the location's Brasília time zone.|Una persona por pedido. Horarios de la unidad (Brasilia).|Une personne par réservation. Horaires de l'unité (Brasília).|Eine Person pro Buchung. Zeiten der Einheit (Brasília).|Una persona per ordine. Orari della sede (Brasília).
Horários disponíveis|Available times|Horarios disponibles|Créneaux disponibles|Verfügbare Zeiten|Orari disponibili
Esgotado|Full|Completo|Complet|Ausgebucht|Completo
vagas disponíveis|spaces available|plazas disponibles|places disponibles|Plätze verfügbar|posti disponibili
Reservar horário|Book time|Reservar horario|Réserver un créneau|Zeit buchen|Prenota orario
Reserva solicitada! Acompanhe a confirmação em Meus pedidos.|Booking requested! Track confirmation in My orders.|¡Reserva solicitada! Consulta la confirmación en Mis pedidos.|Réservation demandée ! Suivez la confirmation dans Mes commandes.|Buchung angefragt! Bestätigung unter Meine Buchungen verfolgen.|Prenotazione richiesta! Segui la conferma nei tuoi ordini.
Nenhum horário disponível nesta data. Escolha outro dia ou confira a validade da assinatura.|No times available on this date. Choose another day or check your subscription validity.|No hay horarios en esta fecha. Elige otro día o revisa tu suscripción.|Aucun créneau à cette date. Choisissez un autre jour ou vérifiez votre abonnement.|Keine Zeiten an diesem Datum. Anderen Tag wählen oder Abonnement prüfen.|Nessun orario disponibile in questa data. Scegli un altro giorno o verifica l'abbonamento.
Horário esgotado. Escolha outro horário.|This time is full. Choose another time.|Horario completo. Elige otro horario.|Créneau complet. Choisissez-en un autre.|Diese Zeit ist ausgebucht. Wählen Sie eine andere.|Orario completo. Scegli un altro orario.
Capacidade por horário|Capacity per time slot|Capacidad por horario|Capacité par créneau|Kapazität pro Zeitfenster|Capacità per fascia oraria
Duração do horário (minutos)|Slot duration (minutes)|Duración del horario (minutos)|Durée du créneau (minutes)|Dauer des Zeitfensters (Minuten)|Durata della fascia (minuti)
Hoje|Today|Hoy|Aujourd'hui|Heute|Oggi
7 dias|7 days|7 días|7 jours|7 Tage|7 giorni
30 dias|30 days|30 días|30 jours|30 Tage|30 giorni
Personalizado|Custom|Personalizado|Personnalisé|Benutzerdefiniert|Personalizzato
De|From|Desde|Du|Von|Dal
Até|To|Hasta|Au|Bis|Al
Aplicar período|Apply period|Aplicar período|Appliquer la période|Zeitraum anwenden|Applica periodo
Período inválido|Invalid period|Período no válido|Période invalide|Ungültiger Zeitraum|Periodo non valido
PAINEL DE DESEMPENHO|PERFORMANCE DASHBOARD|PANEL DE RENDIMIENTO|TABLEAU DE PERFORMANCE|LEISTUNGSÜBERSICHT|PANNELLO PRESTAZIONI
Entenda o que seus membros descobrem, desejam e reservam.|Understand what members discover, want and book.|Entiende lo que los miembros descubren, desean y reservan.|Comprenez ce que les membres découvrent, souhaitent et réservent.|Erfahren Sie, was Mitglieder entdecken, wünschen und buchen.|Scopri cosa i membri trovano, desiderano e prenotano.
Visualizações|Views|Visualizaciones|Vues|Aufrufe|Visualizzazioni
Interesses|Interests|Intereses|Intérêts|Interessen|Interessi
Confirmados|Confirmed|Confirmados|Confirmés|Bestätigt|Confermati
Confirmadas|Confirmed|Confirmadas|Confirmées|Bestätigt|Confermate
Confirmado|Confirmed|Confirmado|Confirmé|Bestätigt|Confermato
Valor confirmado|Confirmed value|Valor confirmado|Valeur confirmée|Bestätigter Wert|Valore confermato
Valor nominal contratado|Nominal booked value|Valor nominal contratado|Valeur nominale réservée|Nominaler Buchungswert|Valore nominale prenotato
Descoberta dos serviços|Service discovery|Descubrimiento de servicios|Découverte des services|Angebotsentdeckung|Scoperta dei servizi
Intenção registrada|Recorded intent|Intención registrada|Intention enregistrée|Erfasstes Interesse|Intenzione registrata
Solicitações recebidas|Requests received|Solicitudes recibidas|Demandes reçues|Eingegangene Anfragen|Richieste ricevute
Pedidos aprovados|Approved orders|Pedidos aprobados|Commandes approuvées|Genehmigte Buchungen|Ordini approvati
AO LONGO DO TEMPO|OVER TIME|A LO LARGO DEL TIEMPO|AU FIL DU TEMPS|IM ZEITVERLAUF|NEL TEMPO
Movimento diário|Daily activity|Actividad diaria|Activité quotidienne|Tägliche Aktivität|Attività giornaliera
Ver dados do gráfico|View chart data|Ver datos del gráfico|Voir les données du graphique|Diagrammdaten anzeigen|Vedi dati del grafico
Data|Date|Fecha|Date|Datum|Data
DO INTERESSE À RESERVA|FROM INTEREST TO BOOKING|DEL INTERÉS A LA RESERVA|DE L'INTÉRÊT À LA RÉSERVATION|VOM INTERESSE ZUR BUCHUNG|DALL'INTERESSE ALLA PRENOTAZIONE
Jornada dos membros|Member journey|Recorrido de los miembros|Parcours des membres|Mitgliederreise|Percorso dei membri
Eventos e pedidos do período. As etapas representam totais independentes.|Events and orders in this period. Stages show independent totals.|Eventos y pedidos del período. Las etapas muestran totales independientes.|Événements et commandes de la période. Les étapes sont des totaux indépendants.|Ereignisse und Buchungen im Zeitraum. Die Stufen zeigen unabhängige Summen.|Eventi e ordini del periodo. Le fasi mostrano totali indipendenti.
EXPERIÊNCIAS EM DESTAQUE|FEATURED EXPERIENCES|EXPERIENCIAS DESTACADAS|EXPÉRIENCES À LA UNE|ERLEBNISSE IM FOKUS|ESPERIENZE IN EVIDENZA
Desempenho dos serviços|Service performance|Rendimiento de servicios|Performance des services|Leistung der Angebote|Prestazioni dei servizi
Ordenar por|Sort by|Ordenar por|Trier par|Sortieren nach|Ordina per
A REDE ÓRBITA|THE ÓRBITA NETWORK|LA RED ÓRBITA|LE RÉSEAU ÓRBITA|DAS ÓRBITA-NETZWERK|LA RETE ÓRBITA
Movimento e valor por unidade|Activity and value by location|Actividad y valor por unidad|Activité et valeur par unité|Aktivität und Wert je Standort|Attività e valore per sede
Unidade|Location|Unidad|Unité|Standort|Sede
Membros únicos|Unique members|Miembros únicos|Membres uniques|Einzelne Mitglieder|Membri unici
Horário de Brasília ·|Brasília time ·|Hora de Brasilia ·|Heure de Brasília ·|Brasília-Zeit ·|Ora di Brasília ·
Ainda não há movimento neste período. Os gráficos serão preenchidos conforme os membros utilizarem a plataforma.|No activity in this period yet. Charts will fill as members use the platform.|Aún no hay actividad en este período. Los gráficos se completarán con el uso.|Aucune activité sur cette période. Les graphiques évolueront avec l'utilisation.|Noch keine Aktivität in diesem Zeitraum. Die Diagramme füllen sich durch die Nutzung.|Nessuna attività in questo periodo. I grafici si popoleranno con l'utilizzo.
Valores confirmados são nominais: a plataforma não processa pagamentos. São contabilizados pela data de confirmação; pedidos e eventos, pela data de criação.|Confirmed values are nominal; no payments are processed. Values use confirmation dates; orders and events use creation dates.|Los valores confirmados son nominales; no se procesan pagos. Los valores usan la fecha de confirmación; pedidos y eventos, la fecha de creación.|Les valeurs confirmées sont nominales ; aucun paiement n'est traité. Valeurs par date de confirmation, commandes et événements par date de création.|Bestätigte Werte sind nominal; es werden keine Zahlungen verarbeitet. Werte nach Bestätigung, Buchungen und Ereignisse nach Erstellung.|I valori confermati sono nominali; non si elaborano pagamenti. Valori per data di conferma; ordini ed eventi per data di creazione.
Seu espaço. Sua rotina. Um universo de possibilidades.|Your space. Your routine. A universe of possibilities.|Tu espacio. Tu rutina. Un universo de posibilidades.|Votre espace. Votre quotidien. Un univers de possibilités.|Ihr Raum. Ihr Alltag. Ein Universum voller Möglichkeiten.|Il tuo spazio. La tua routine. Un universo di possibilità.
Descubra serviços e experiências que tornam seu dia no coworking ainda melhor — tudo em um só lugar.|Discover services and experiences that enhance your coworking day, all in one place.|Descubre servicios y experiencias para mejorar tu día en el coworking, en un solo lugar.|Découvrez des services et expériences pour enrichir votre journée au coworking, réunis au même endroit.|Entdecken Sie Angebote und Erlebnisse für Ihren Coworking-Alltag, alles an einem Ort.|Scopri servizi ed esperienze per migliorare la giornata al coworking, tutto in un unico posto.
Conheça a Órbita|Discover Órbita|Conoce Órbita|Découvrez Órbita|Órbita entdecken|Scopri Órbita
Use seu e-mail para acessar a plataforma.|Use your email to access the platform.|Usa tu correo para acceder a la plataforma.|Utilisez votre e-mail pour accéder à la plateforme.|Melden Sie sich mit Ihrer E-Mail an.|Usa la tua e-mail per accedere alla piattaforma.
Acesso restrito · Órbita|Restricted access · Órbita|Acceso restringido · Órbita|Accès réservé · Órbita|Geschützter Zugang · Órbita|Accesso riservato · Órbita
SEU ESPAÇO, MAIS POSSIBILIDADES.|YOUR SPACE, MORE POSSIBILITIES.|TU ESPACIO, MÁS POSIBILIDADES.|VOTRE ESPACE, PLUS DE POSSIBILITÉS.|IHR RAUM, MEHR MÖGLICHKEITEN.|IL TUO SPAZIO, PIÙ POSSIBILITÀ.
Sua órbita hoje|Your orbit today|Tu órbita hoy|Votre orbite aujourd'hui|Ihre Umlaufbahn heute|La tua orbita oggi
Tudo o que seu coworking precisa, em um só lugar.|Everything your coworking needs, in one place.|Todo lo que necesita tu coworking, en un solo lugar.|Tout pour votre coworking, au même endroit.|Alles für Ihr Coworking an einem Ort.|Tutto per il tuo coworking in un unico posto.
Encontre seu espaço|Find your space|Encuentra tu espacio|Trouvez votre espace|Finden Sie Ihren Platz|Trova il tuo spazio
Escolha uma unidade|Choose a location|Elige una unidad|Choisissez une unité|Standort wählen|Scegli una sede
ÓRBITA · RIO GRANDE DO SUL|ÓRBITA · RIO GRANDE DO SUL|ÓRBITA · RIO GRANDE DO SUL|ÓRBITA · RIO GRANDE DO SUL|ÓRBITA · RIO GRANDE DO SUL|ÓRBITA · RIO GRANDE DO SUL
ÓRBITA PREMIUM|ÓRBITA PREMIUM|ÓRBITA PREMIUM|ÓRBITA PREMIUM|ÓRBITA PREMIUM|ÓRBITA PREMIUM
Mais possibilidades para sua rotina.|More possibilities for your routine.|Más posibilidades para tu rutina.|Plus de possibilités au quotidien.|Mehr Möglichkeiten für Ihren Alltag.|Più possibilità per la tua routine.
Salas executivas, estúdio e experiências exclusivas. Peça seu upgrade e amplie sua órbita.|Executive rooms, studio and exclusive experiences. Request an upgrade and expand your orbit.|Salas ejecutivas, estudio y experiencias exclusivas. Solicita una mejora y amplía tu órbita.|Salles de réunion, studio et expériences exclusives. Demandez une mise à niveau et élargissez votre orbite.|Konferenzräume, Studio und exklusive Erlebnisse. Erweitern Sie Ihr Abonnement.|Sale executive, studio ed esperienze esclusive. Richiedi un upgrade ed espandi la tua orbita.
Conhecer Premium|Explore Premium|Conocer Premium|Découvrir Premium|Premium entdecken|Scopri Premium
Todas as experiências da unidade|All experiences at this location|Todas las experiencias de la unidad|Toutes les expériences de l'unité|Alle Erlebnisse am Standort|Tutte le esperienze della sede
Disponíveis agora e experiências Premium em destaque.|Available now, with Premium experiences highlighted.|Disponibles ahora, con experiencias Premium destacadas.|Disponibles maintenant, avec les expériences Premium à l'honneur.|Jetzt verfügbar, mit Premium-Erlebnissen im Fokus.|Disponibili ora, con esperienze Premium in evidenza.
Disponível agora|Available now|Disponible ahora|Disponible maintenant|Jetzt verfügbar|Disponibile ora
Serviço Premium bloqueado|Locked Premium service|Servicio Premium bloqueado|Service Premium verrouillé|Gesperrtes Premium-Angebot|Servizio Premium bloccato
A qualquer hora|Any time|A cualquier hora|À toute heure|Jederzeit|A qualsiasi ora
Desbloquear|Unlock|Desbloquear|Débloquer|Freischalten|Sblocca
Conhecer|Explore|Conocer|Découvrir|Entdecken|Scopri
Ver horários|View times|Ver horarios|Voir les horaires|Zeiten ansehen|Vedi orari
Horário local|Local time|Hora local|Heure locale|Ortszeit|Ora locale
Atualização automática a cada 30 segundos.|Automatically updates every 30 seconds.|Actualización automática cada 30 segundos.|Actualisation automatique toutes les 30 secondes.|Automatische Aktualisierung alle 30 Sekunden.|Aggiornamento automatico ogni 30 secondi.
Atualizando catálogo…|Updating catalog…|Actualizando catálogo…|Actualisation du catalogue…|Katalog wird aktualisiert…|Aggiornamento catalogo…
Novas experiências em breve.|New experiences coming soon.|Próximamente nuevas experiencias.|De nouvelles expériences bientôt.|Neue Erlebnisse folgen bald.|Nuove esperienze in arrivo.
Voltar|Back|Volver|Retour|Zurück|Indietro
Tenho interesse|I'm interested|Me interesa|Ça m'intéresse|Ich bin interessiert|Mi interessa
Interesse registrado.|Interest recorded.|Interés registrado.|Intérêt enregistré.|Interesse erfasst.|Interesse registrato.
Agende um horário de atendimento para esta experiência.|Book an available time for this experience.|Reserva un horario de atención para esta experiencia.|Réservez un créneau pour cette expérience.|Buchen Sie eine verfügbare Zeit für dieses Erlebnis.|Prenota un orario disponibile per questa esperienza.
Solicitação sem cobrança online. O valor será confirmado pela equipe.|No online payment. The team will confirm the amount.|Sin pago en línea. El equipo confirmará el importe.|Sans paiement en ligne. L'équipe confirmera le montant.|Keine Onlinezahlung. Das Team bestätigt den Betrag.|Senza pagamento online. Il team confermerà l'importo.
Solicitado|Requested|Solicitado|Demandé|Angefragt|Richiesto
Cancelado|Cancelled|Cancelado|Annulé|Storniert|Annullato
Você ainda não tem pedidos.|You have no orders yet.|Aún no tienes pedidos.|Vous n'avez pas encore de commandes.|Sie haben noch keine Buchungen.|Non hai ancora ordini.
Assinatura|Subscription|Suscripción|Abonnement|Abonnement|Abbonamento
Seu acesso Premium está ativo.|Your Premium access is active.|Tu acceso Premium está activo.|Votre accès Premium est actif.|Ihr Premium-Zugang ist aktiv.|Il tuo accesso Premium è attivo.
Mais possibilidades para seu dia.|More possibilities for your day.|Más posibilidades para tu día.|Plus de possibilités pour votre journée.|Mehr Möglichkeiten für Ihren Tag.|Più possibilità per la tua giornata.
Experiências exclusivas em todo o RS|Exclusive experiences across RS|Experiencias exclusivas en todo RS|Expériences exclusives dans tout le RS|Exklusive Erlebnisse im gesamten RS|Esperienze esclusive in tutto il RS
Salas executivas e estúdios de gravação|Executive rooms and recording studios|Salas ejecutivas y estudios de grabación|Salles de réunion et studios d'enregistrement|Konferenzräume und Aufnahmestudios|Sale executive e studi di registrazione
Acesso em todas as unidades Órbita|Access to every Órbita location|Acceso a todas las unidades Órbita|Accès à toutes les unités Órbita|Zugang zu allen Órbita-Standorten|Accesso a tutte le sedi Órbita
Solicitar upgrade para Premium|Request Premium upgrade|Solicitar mejora a Premium|Demander le passage à Premium|Premium-Upgrade anfragen|Richiedi upgrade a Premium
Enviando…|Sending…|Enviando…|Envoi…|Wird gesendet…|Invio…
Solicitação enviada. Aguardando aprovação do administrador.|Request sent. Waiting for administrator approval.|Solicitud enviada. Esperando aprobación del administrador.|Demande envoyée. En attente de l'administrateur.|Anfrage gesendet. Warten auf Genehmigung.|Richiesta inviata. In attesa dell'approvazione.
A aprovação é feita pelo administrador. Não há cobrança automática.|Approval is handled by the administrator. No automatic billing.|El administrador aprueba la solicitud. No hay cobro automático.|L'administrateur valide la demande. Aucune facturation automatique.|Die Administration genehmigt die Anfrage. Keine automatische Abrechnung.|L'amministratore approva la richiesta. Nessun addebito automatico.
Acesso pausado|Access paused|Acceso pausado|Accès suspendu|Zugang pausiert|Accesso sospeso
Sua assinatura está inativa, ainda não começou ou expirou. Procure a recepção para regularizar.|Your subscription is inactive, not started or expired. Contact reception.|Tu suscripción está inactiva, aún no ha comenzado o venció. Consulta recepción.|Votre abonnement est inactif, non commencé ou expiré. Contactez l'accueil.|Ihr Abonnement ist inaktiv, noch nicht begonnen oder abgelaufen. Wenden Sie sich an die Rezeption.|L'abbonamento è inattivo, non iniziato o scaduto. Rivolgiti alla reception.
Conheça o Premium e acompanhe sua solicitação.|Explore Premium and track your request.|Conoce Premium y sigue tu solicitud.|Découvrez Premium et suivez votre demande.|Entdecken Sie Premium und verfolgen Sie Ihre Anfrage.|Scopri Premium e segui la tua richiesta.
Café da manhã|Breakfast|Desayuno|Petit-déjeuner|Frühstück|Colazione
Almoço da casa|House lunch|Almuerzo de la casa|Déjeuner maison|Haus-Mittagessen|Pranzo della casa
Bicicletário seguro|Secure bicycle parking|Aparcamiento seguro de bicicletas|Stationnement vélo sécurisé|Sicherer Fahrradstellplatz|Parcheggio bici sicuro
Impressão express|Express printing|Impresión exprés|Impression express|Expressdruck|Stampa express
Sala executiva Premium|Premium meeting room|Sala ejecutiva Premium|Salle de réunion Premium|Premium-Konferenzraum|Sala executive Premium
Estúdio de podcast Premium|Premium podcast studio|Estudio de podcast Premium|Studio de podcast Premium|Premium-Podcaststudio|Studio podcast Premium
Gastronomia|Food and drinks|Gastronomía|Gastronomie|Gastronomie|Gastronomia
Mobilidade|Mobility|Movilidad|Mobilité|Mobilität|Mobilità
Produtividade|Productivity|Productividad|Productivité|Produktivität|Produttività
Reuniões|Meetings|Reuniones|Réunions|Besprechungen|Riunioni
Estúdio|Studio|Estudio|Studio|Studio|Studio
Café, pão de queijo e frutas para começar o dia no seu coworking.|Coffee, cheese bread and fruit to start your coworking day.|Café, pan de queso y frutas para empezar tu día de coworking.|Café, pain au fromage et fruits pour commencer votre journée.|Kaffee, Käsebrötchen und Obst für Ihren Coworking-Tag.|Caffè, pane al formaggio e frutta per iniziare la giornata.
Um almoço completo com opção vegetariana para sua pausa de trabalho.|A complete lunch with a vegetarian option for your work break.|Un almuerzo completo con opción vegetariana para tu pausa.|Un déjeuner complet avec option végétarienne pour votre pause.|Ein vollständiges Mittagessen mit vegetarischer Option für Ihre Pause.|Un pranzo completo con opzione vegetariana per la pausa.
Guarde sua bicicleta em uma área coberta enquanto aproveita a unidade.|Park your bicycle in a covered area while using the workspace.|Guarda tu bicicleta en un área cubierta mientras usas la unidad.|Garez votre vélo dans un espace couvert pendant votre visite.|Stellen Sie Ihr Fahrrad während Ihres Besuchs überdacht ab.|Lascia la bici in un'area coperta durante la visita.
Impressão de até vinte páginas e digitalização dos seus documentos.|Print up to twenty pages and scan your documents.|Imprime hasta veinte páginas y digitaliza tus documentos.|Impression de vingt pages et numérisation de documents.|Bis zu zwanzig Seiten drucken und Dokumente scannen.|Stampa fino a venti pagine e scansiona i documenti.
Uma hora em sala privativa com tela, café e estrutura para reuniões importantes.|One hour in a private room with a screen, coffee and meeting facilities.|Una hora en sala privada con pantalla, café y equipamiento para reuniones.|Une heure en salle privée avec écran, café et équipement de réunion.|Eine Stunde im privaten Raum mit Bildschirm, Kaffee und Besprechungsausstattung.|Un'ora in sala privata con schermo, caffè e attrezzature per riunioni.
Grave seu podcast ou conteúdo com microfones e ambiente tratado acusticamente.|Record your podcast or content with microphones in an acoustic-treated space.|Graba tu podcast con micrófonos en un espacio con tratamiento acústico.|Enregistrez votre podcast avec des microphones dans un espace insonorisé.|Nehmen Sie Podcasts mit Mikrofonen in einem akustisch behandelten Raum auf.|Registra podcast con microfoni in un ambiente trattato acusticamente.
Administração|Administration|Administración|Administration|Verwaltung|Amministrazione
Abrir menu|Open menu|Abrir menú|Ouvrir le menu|Menü öffnen|Apri menu
Fechar menu|Close menu|Cerrar menú|Fermer le menu|Menü schließen|Chiudi menu
Fechar navegação|Close navigation|Cerrar navegación|Fermer la navigation|Navigation schließen|Chiudi navigazione
Fechar edição|Close editor|Cerrar edición|Fermer l'édition|Bearbeitung schließen|Chiudi modifica
Início|Start|Inicio|Début|Beginn|Inizio
Fim|End|Fin|Fin|Ende|Fine
Categoria|Category|Categoría|Catégorie|Kategorie|Categoria
Catálogo|Catalog|Catálogo|Catalogue|Katalog|Catalogo
Parceiro|Partner|Colaborador|Partenaire|Partner|Partner
Parceiros cadastrados|Registered partners|Colaboradores registrados|Partenaires enregistrés|Registrierte Partner|Partner registrati
Novo parceiro|New partner|Nuevo colaborador|Nouveau partenaire|Neuer Partner|Nuovo partner
Novo serviço|New service|Nuevo servicio|Nouveau service|Neues Angebot|Nuovo servizio
Cadastrar parceiro|Register partner|Registrar colaborador|Enregistrer un partenaire|Partner registrieren|Registra partner
Cadastrar serviço|Register service|Registrar servicio|Enregistrer un service|Angebot registrieren|Registra servizio
Descrição|Description|Descripción|Description|Beschreibung|Descrizione
Descrição em português|Description in Portuguese|Descripción en portugués|Description en portugais|Beschreibung auf Portugiesisch|Descrizione in portoghese
Descrição da foto|Photo description|Descripción de la foto|Description de la photo|Bildbeschreibung|Descrizione della foto
Texto alternativo da foto|Photo alternative text|Texto alternativo de la foto|Texte alternatif de la photo|Alternativer Bildtext|Testo alternativo della foto
Preço (R$)|Price (BRL)|Precio (BRL)|Prix (BRL)|Preis (BRL)|Prezzo (BRL)
Status|Status|Estado|Statut|Status|Stato
Status inicial|Initial status|Estado inicial|Statut initial|Anfangsstatus|Stato iniziale
Publicado|Published|Publicado|Publié|Veröffentlicht|Pubblicato
Publicar|Publish|Publicar|Publier|Veröffentlichen|Pubblica
Arquivar|Archive|Archivar|Archiver|Archivieren|Archivia
Rascunho|Draft|Borrador|Brouillon|Entwurf|Bozza
Prioridade|Priority|Prioridad|Priorité|Priorität|Priorità
Remover|Remove|Quitar|Retirer|Entfernen|Rimuovi
Todos|All|Todos|Tous|Alle|Tutti
Plano|Plan|Plan|Offre|Tarif|Piano
Plano solicitado|Requested plan|Plan solicitado|Offre demandée|Angefragter Tarif|Piano richiesto
Básico e Premium|Basic and Premium|Básico y Premium|Basique et Premium|Basis und Premium|Base e Premium
Exclusivo Premium|Premium exclusive|Exclusivo Premium|Exclusivité Premium|Exklusiv für Premium|Esclusivo Premium
Acesso por plano|Access by plan|Acceso por plan|Accès selon l'offre|Zugang nach Tarif|Accesso per piano
Disponibilidade e plano|Availability and plan|Disponibilidad y plan|Disponibilité et offre|Verfügbarkeit und Tarif|Disponibilità e piano
Disponibilidade opcional · 0=domingo, 6=sábado|Optional availability · 0=Sunday, 6=Saturday|Disponibilidad opcional · 0=domingo, 6=sábado|Disponibilité facultative · 0=dimanche, 6=samedi|Optionale Verfügbarkeit · 0=Sonntag, 6=Samstag|Disponibilità facoltativa · 0=domenica, 6=sabato
Dias (0=dom, 6=sáb)|Days (0=Sun, 6=Sat)|Días (0=dom, 6=sáb)|Jours (0=dim, 6=sam)|Tage (0=So, 6=Sa)|Giorni (0=dom, 6=sab)
Dias separados por vírgula|Comma-separated days|Días separados por comas|Jours séparés par des virgules|Tage durch Komma getrennt|Giorni separati da virgola
Sem regra, o serviço publicado fica disponível para todos os planos e horários.|Without a rule, the published service is available for all plans and times.|Sin reglas, el servicio publicado está disponible para todos los planes y horarios.|Sans règle, le service publié est disponible pour toutes les offres et horaires.|Ohne Regel ist das veröffentlichte Angebot für alle Tarife und Zeiten verfügbar.|Senza regole, il servizio pubblicato è disponibile per tutti i piani e gli orari.
Foto (JPG, PNG ou WebP, até 5 MB)|Photo (JPG, PNG or WebP, up to 5 MB)|Foto (JPG, PNG o WebP, hasta 5 MB)|Photo (JPG, PNG ou WebP, 5 Mo maximum)|Foto (JPG, PNG oder WebP, bis 5 MB)|Foto (JPG, PNG o WebP, fino a 5 MB)
Enviar foto|Upload photo|Subir foto|Envoyer la photo|Foto hochladen|Carica foto
Editar dados|Edit details|Editar datos|Modifier les données|Daten bearbeiten|Modifica dati
Editar dados e condições|Edit details and terms|Editar datos y condiciones|Modifier données et conditions|Daten und Bedingungen bearbeiten|Modifica dati e condizioni
Editar serviço / adicionar foto|Edit service / add photo|Editar servicio / añadir foto|Modifier le service / ajouter une photo|Angebot bearbeiten / Foto hinzufügen|Modifica servizio / aggiungi foto
E-mail de contato|Contact email|Correo de contacto|E-mail de contact|Kontakt-E-Mail|E-mail di contatto
Observações|Notes|Observaciones|Remarques|Anmerkungen|Note
Observações comerciais|Business notes|Observaciones comerciales|Remarques commerciales|Geschäftliche Anmerkungen|Note commerciali
Comissão (%)|Commission (%)|Comisión (%)|Commission (%)|Provision (%)|Commissione (%)
Comissão:|Commission:|Comisión:|Commission :|Provision:|Commissione:
% · Taxa:|% · Fee:|% · Tarifa:|% · Frais :|% · Gebühr:|% · Tariffa:
Taxa fixa (R$)|Fixed fee (BRL)|Tarifa fija (BRL)|Frais fixes (BRL)|Festgebühr (BRL)|Tariffa fissa (BRL)
Validade|Validity|Vigencia|Validité|Gültigkeit|Validità
Válido desde|Valid from|Válido desde|Valide à partir du|Gültig ab|Valido dal
Válido até|Valid until|Válido hasta|Valide jusqu'au|Gültig bis|Valido fino al
Ativo|Active|Activo|Actif|Aktiv|Attivo
Inativo|Inactive|Inactivo|Inactif|Inaktiv|Inattivo
Ativa|Active|Activa|Active|Aktiv|Attiva
Inativa|Inactive|Inactiva|Inactive|Inaktiv|Inattiva
Ativar|Activate|Activar|Activer|Aktivieren|Attiva
Desativar|Deactivate|Desactivar|Désactiver|Deaktivieren|Disattiva
Inativar|Deactivate|Desactivar|Désactiver|Deaktivieren|Disattiva
Gestão de membros|Member management|Gestión de miembros|Gestion des membres|Mitgliederverwaltung|Gestione membri
Membros cadastrados|Registered members|Miembros registrados|Membres inscrits|Registrierte Mitglieder|Membri registrati
Cadastrar novo membro|Register new member|Registrar nuevo miembro|Inscrire un membre|Neues Mitglied registrieren|Registra nuovo membro
Criar membro|Create member|Crear miembro|Créer un membre|Mitglied erstellen|Crea membro
Gerenciado por você. Pronto para ir além.|Managed by you. Ready to go further.|Gestionado por ti. Listo para ir más allá.|Géré par vous. Prêt à aller plus loin.|Von Ihnen verwaltet. Bereit für mehr.|Gestito da te. Pronto ad andare oltre.
Cadastre membros, gerencie acessos e acompanhe assinaturas.|Register members, manage access and track subscriptions.|Registra miembros, gestiona accesos y suscripciones.|Inscrivez des membres, gérez les accès et abonnements.|Mitglieder registrieren, Zugänge und Abonnements verwalten.|Registra membri, gestisci accessi e abbonamenti.
Seu espaço vai além da mesa.|Your workspace goes beyond the desk.|Tu espacio va más allá del escritorio.|Votre espace va au-delà du bureau.|Ihr Raum bietet mehr als einen Schreibtisch.|Il tuo spazio va oltre la scrivania.
Seu próximo membro começa aqui.|Your next member starts here.|Tu próximo miembro empieza aquí.|Votre prochain membre commence ici.|Ihr nächstes Mitglied beginnt hier.|Il tuo prossimo membro inizia qui.
Ele já poderá entrar com o e-mail e a senha definidos.|They can sign in immediately with the chosen email and password.|Podrá entrar inmediatamente con el correo y la contraseña elegidos.|Il peut se connecter immédiatement avec les identifiants choisis.|Die Anmeldung mit den gewählten Zugangsdaten ist sofort möglich.|Potrà accedere subito con e-mail e password scelte.
Senha inicial|Initial password|Contraseña inicial|Mot de passe initial|Anfangspasswort|Password iniziale
Senha (mínimo 8 caracteres)|Password (at least 8 characters)|Contraseña (mínimo 8 caracteres)|Mot de passe (8 caractères minimum)|Passwort (mindestens 8 Zeichen)|Password (minimo 8 caratteri)
Mínimo de 8 caracteres|At least 8 characters|Mínimo 8 caracteres|8 caractères minimum|Mindestens 8 Zeichen|Minimo 8 caratteri
Expira em (opcional)|Expires on (optional)|Vence el (opcional)|Expire le (facultatif)|Läuft ab am (optional)|Scade il (facoltativo)
Buscar membros|Search members|Buscar miembros|Rechercher des membres|Mitglieder suchen|Cerca membri
Buscar por nome ou e-mail|Search by name or email|Buscar por nombre o correo|Rechercher par nom ou e-mail|Nach Name oder E-Mail suchen|Cerca per nome o e-mail
Atualizar membros|Refresh members|Actualizar miembros|Actualiser les membres|Mitglieder aktualisieren|Aggiorna membri
Resumo dos membros|Member summary|Resumen de miembros|Résumé des membres|Mitgliederübersicht|Riepilogo membri
Nenhum membro encontrado|No members found|No se encontraron miembros|Aucun membre trouvé|Keine Mitglieder gefunden|Nessun membro trovato
Tente buscar por outro nome ou e-mail.|Try another name or email.|Busca otro nombre o correo.|Essayez un autre nom ou e-mail.|Versuchen Sie einen anderen Namen oder eine andere E-Mail.|Prova un altro nome o indirizzo e-mail.
Cadastre o primeiro membro no formulário acima.|Register the first member using the form above.|Registra el primer miembro en el formulario anterior.|Inscrivez le premier membre avec le formulaire ci-dessus.|Registrieren Sie das erste Mitglied mit dem Formular oben.|Registra il primo membro con il modulo sopra.
Definir senha|Set password|Definir contraseña|Définir le mot de passe|Passwort festlegen|Imposta password
Definir nova senha|Set new password|Definir nueva contraseña|Définir un nouveau mot de passe|Neues Passwort festlegen|Imposta nuova password
Nova senha|New password|Nueva contraseña|Nouveau mot de passe|Neues Passwort|Nuova password
O membro poderá entrar com a nova senha imediatamente.|The member can sign in immediately with the new password.|El miembro podrá entrar con la nueva contraseña inmediatamente.|Le membre peut se connecter immédiatement avec le nouveau mot de passe.|Das Mitglied kann sich sofort mit dem neuen Passwort anmelden.|Il membro può accedere subito con la nuova password.
Gerenciar assinatura|Manage subscription|Gestionar suscripción|Gérer l'abonnement|Abonnement verwalten|Gestisci abbonamento
Assinatura não configurada.|Subscription not configured.|Suscripción no configurada.|Abonnement non configuré.|Abonnement nicht eingerichtet.|Abbonamento non configurato.
Pedido|Order|Pedido|Commande|Buchung|Ordine
Pedidos recebidos|Orders received|Pedidos recibidos|Commandes reçues|Eingegangene Buchungen|Ordini ricevuti
Pedidos recentes|Recent orders|Pedidos recientes|Commandes récentes|Letzte Buchungen|Ordini recenti
Confirmar|Confirm|Confirmar|Confirmer|Bestätigen|Conferma
Solicitações de upgrade|Upgrade requests|Solicitudes de mejora|Demandes de mise à niveau|Upgrade-Anfragen|Richieste di upgrade
Aprovar upgrade|Approve upgrade|Aprobar mejora|Approuver la mise à niveau|Upgrade genehmigen|Approva upgrade
Recusar|Reject|Rechazar|Refuser|Ablehnen|Rifiuta
Pendente|Pending|Pendiente|En attente|Ausstehend|In attesa
Recusado|Rejected|Rechazado|Refusé|Abgelehnt|Rifiutato
Aprovado|Approved|Aprobado|Approuvé|Genehmigt|Approvato
Upgrades Premium|Premium upgrades|Mejoras Premium|Mises à niveau Premium|Premium-Upgrades|Upgrade Premium
Aprove o acesso ao plano Premium dos seus membros.|Approve your members' Premium access.|Aprueba el acceso Premium de tus miembros.|Approuvez l'accès Premium de vos membres.|Genehmigen Sie den Premium-Zugang Ihrer Mitglieder.|Approva l'accesso Premium dei membri.
Os pedidos de upgrade dos membros aparecerão aqui.|Members' upgrade requests will appear here.|Las solicitudes de mejora aparecerán aquí.|Les demandes de mise à niveau apparaîtront ici.|Die Upgrade-Anfragen erscheinen hier.|Le richieste di upgrade appariranno qui.
O administrador analisa o pedido. Não há cobrança nem troca automática de plano.|An administrator reviews the request. No charge or automatic plan change.|El administrador revisa la solicitud. Sin cobro ni cambio automático de plan.|L'administrateur examine la demande. Aucun paiement ni changement automatique.|Die Administration prüft die Anfrage. Keine Zahlung oder automatische Tarifänderung.|L'amministratore valuta la richiesta. Nessun addebito o cambio automatico.
Os serviços Premium estão liberados nos respectivos horários de atendimento.|Premium services are available during their opening hours.|Los servicios Premium están disponibles en sus horarios de atención.|Les services Premium sont accessibles pendant leurs horaires.|Premium-Angebote sind zu ihren Öffnungszeiten verfügbar.|I servizi Premium sono disponibili nei rispettivi orari.
Salas executivas, estúdios e serviços exclusivos. Mantenha os benefícios do Básico e libere experiências Premium em todas as unidades.|Meeting rooms, studios and exclusive services. Keep Basic benefits and unlock Premium at all locations.|Salas, estudios y servicios exclusivos. Conserva los beneficios Básicos y accede a Premium en todas las unidades.|Salles, studios et services exclusifs. Gardez les avantages de base et débloquez Premium dans toutes les unités.|Konferenzräume, Studios und exklusive Angebote. Basisvorteile behalten und Premium überall nutzen.|Sale, studi e servizi esclusivi. Mantieni i vantaggi Base e sblocca Premium in tutte le sedi.
Descubra experiências nos nossos espaços pelo Rio Grande do Sul.|Discover experiences in our locations across Rio Grande do Sul.|Descubre experiencias en nuestros espacios de Rio Grande do Sul.|Découvrez les expériences de nos espaces au Rio Grande do Sul.|Entdecken Sie Erlebnisse an unseren Standorten in Rio Grande do Sul.|Scopri le esperienze nelle nostre sedi del Rio Grande do Sul.
Desbloqueie estúdios e salas exclusivas. A mudança de plano é aprovada pelo administrador.|Unlock studios and exclusive rooms. An administrator approves the plan change.|Desbloquea estudios y salas exclusivas. El administrador aprueba el cambio de plan.|Débloquez studios et salles exclusives. Le changement est approuvé par l'administrateur.|Studios und exklusive Räume freischalten. Tarifwechsel genehmigt die Administration.|Sblocca studi e sale esclusive. Il cambio viene approvato dall'amministratore.
Instalar Órbita|Install Órbita|Instalar Órbita|Installer Órbita|Órbita installieren|Installa Órbita
Órbita, sempre com você.|Órbita, always with you.|Órbita, siempre contigo.|Órbita, toujours avec vous.|Órbita, immer dabei.|Órbita, sempre con te.
Seu coworking a um toque.|Your coworking, one tap away.|Tu coworking a un toque.|Votre coworking à portée de main.|Ihr Coworking mit einem Fingertipp.|Il tuo coworking a portata di tocco.
Instale o aplicativo e acesse seu espaço direto da tela inicial.|Install the app and access your workspace from your home screen.|Instala la aplicación y accede desde la pantalla de inicio.|Installez l'application pour accéder depuis votre écran d'accueil.|Installieren Sie die App für direkten Zugriff vom Startbildschirm.|Installa l'app e accedi dalla schermata iniziale.
Abra serviços, pedidos e sua assinatura em uma janela própria do aplicativo.|Open services, orders and your subscription in a dedicated app window.|Abre servicios, pedidos y suscripción en una ventana de la aplicación.|Ouvrez services, commandes et abonnement dans une fenêtre dédiée.|Angebote, Buchungen und Abonnement im eigenen App-Fenster öffnen.|Apri servizi, ordini e abbonamento in una finestra dedicata.
Acesse o endereço HTTPS para instalar no celular.|Open the HTTPS address to install on your phone.|Abre la dirección HTTPS para instalar en el móvil.|Ouvrez l'adresse HTTPS pour installer sur votre mobile.|HTTPS-Adresse zur Installation auf dem Handy öffnen.|Apri l'indirizzo HTTPS per installare sul telefono.
Você está usando o aplicativo Órbita instalado.|You are using the installed Órbita app.|Estás usando la aplicación Órbita instalada.|Vous utilisez l'application Órbita installée.|Sie verwenden die installierte Órbita-App.|Stai usando l'app Órbita installata.
Use o menu do navegador para instalar. Se já instalou, abra o app pela tela inicial.|Use the browser menu to install. If already installed, open from your home screen.|Usa el menú del navegador para instalar. Si ya está instalada, ábrela desde el inicio.|Installez via le menu du navigateur ou ouvrez depuis l'écran d'accueil.|Über das Browsermenü installieren oder vom Startbildschirm öffnen.|Installa dal menu del browser o apri dalla schermata iniziale.
Android · Chrome / Edge|Android · Chrome / Edge|Android · Chrome / Edge|Android · Chrome / Edge|Android · Chrome / Edge|Android · Chrome / Edge
iPhone / iPad · Safari|iPhone / iPad · Safari|iPhone / iPad · Safari|iPhone / iPad · Safari|iPhone / iPad · Safari|iPhone / iPad · Safari
Computador · Chrome / Edge|Computer · Chrome / Edge|Ordenador · Chrome / Edge|Ordinateur · Chrome / Edge|Computer · Chrome / Edge|Computer · Chrome / Edge
Abra o menu do navegador (⋮), selecione “Instalar aplicativo” ou “Adicionar à tela inicial” e confirme.|Open the browser menu (⋮), select Install app or Add to home screen, then confirm.|Abre el menú (⋮), elige Instalar aplicación o Añadir a inicio y confirma.|Ouvrez le menu (⋮), choisissez Installer l'application ou Ajouter à l'écran d'accueil et confirmez.|Browsermenü (⋮) öffnen, App installieren oder Zum Startbildschirm hinzufügen wählen und bestätigen.|Apri il menu (⋮), seleziona Installa app o Aggiungi alla schermata iniziale e conferma.
Toque em Compartilhar, escolha “Adicionar à Tela de Início” e confirme em “Adicionar”.|Tap Share, choose Add to Home Screen and confirm Add.|Pulsa Compartir, elige Añadir a pantalla de inicio y confirma Añadir.|Touchez Partager, Sur l'écran d'accueil, puis Ajouter.|Teilen antippen, Zum Home-Bildschirm wählen und Hinzufügen bestätigen.|Tocca Condividi, scegli Aggiungi alla schermata Home e conferma Aggiungi.
Use o ícone de instalação na barra de endereço ou a opção “Instalar Órbita” no menu do navegador.|Use the install icon in the address bar or Install Órbita in the browser menu.|Usa el icono de instalación de la barra de direcciones o Instalar Órbita en el menú.|Utilisez l'icône d'installation de la barre d'adresse ou Installer Órbita dans le menu.|Installationssymbol in der Adressleiste oder Órbita installieren im Browsermenü wählen.|Usa l'icona di installazione nella barra degli indirizzi o Installa Órbita nel menu.
Login, catálogo e pedidos precisam de internet. Sem conexão, o app mostra apenas uma tela de aviso.|Sign-in, catalog and orders require internet. Offline, only a notice is shown.|El acceso, catálogo y pedidos requieren internet. Sin conexión solo se muestra un aviso.|Connexion, catalogue et commandes nécessitent internet. Hors ligne, seul un avis s'affiche.|Anmeldung, Katalog und Buchungen benötigen Internet. Offline erscheint nur ein Hinweis.|Accesso, catalogo e ordini richiedono internet. Offline viene mostrato solo un avviso.
Gráfico diário de visualizações, interesses e pedidos|Daily views, interests and orders chart|Gráfico diario de vistas, intereses y pedidos|Graphique quotidien des vues, intérêts et commandes|Tagesdiagramm für Aufrufe, Interessen und Buchungen|Grafico giornaliero di visualizzazioni, interessi e ordini
O catálogo, login e solicitações exigem internet. Reconecte e tente novamente.|Catalog, sign-in and requests require internet. Reconnect and try again.|El catálogo, acceso y solicitudes requieren internet. Reconecta e inténtalo de nuevo.|Catalogue, connexion et demandes nécessitent internet. Reconnectez-vous.|Katalog, Anmeldung und Anfragen benötigen Internet. Erneut verbinden und versuchen.|Catalogo, accesso e richieste richiedono internet. Riconnettiti e riprova.
Abra espaço para mais possibilidades.|Make room for more possibilities.|Haz espacio para más posibilidades.|Faites place à plus de possibilités.|Schaffen Sie Raum für mehr Möglichkeiten.|Fai spazio a più possibilità.
Experiências e serviços que acompanham sua rotina. Acesse sua conta criada pelo administrador para descobrir o que está disponível na sua unidade.|Experiences and services for your routine. Sign in to the account created by your administrator to explore your location.|Experiencias y servicios para tu rutina. Entra en la cuenta creada por el administrador para explorar tu unidad.|Des expériences pour votre quotidien. Connectez-vous au compte créé par votre administrateur pour découvrir votre unité.|Erlebnisse für Ihren Alltag. Melden Sie sich mit dem von der Administration erstellten Konto an.|Esperienze per la tua routine. Accedi all'account creato dall'amministratore per scoprire la sede.
Sem conexão|Offline|Sin conexión|Hors connexion|Offline|Senza connessione
Página não encontrada|Page not found|Página no encontrada|Page introuvable|Seite nicht gefunden|Pagina non trovata
Este endereço não existe ou não está mais disponível.|This address does not exist or is no longer available.|Esta dirección no existe o ya no está disponible.|Cette adresse n'existe pas ou n'est plus disponible.|Diese Adresse existiert nicht oder ist nicht mehr verfügbar.|Questo indirizzo non esiste o non è più disponibile.
Tentar novamente|Try again|Intentar de nuevo|Réessayer|Erneut versuchen|Riprova
Voltar ao início|Back to start|Volver al inicio|Retour à l'accueil|Zurück zum Anfang|Torna all'inizio
Carregando conteúdo…|Loading content…|Cargando contenido…|Chargement…|Inhalte werden geladen…|Caricamento contenuti…
Atualizando conteúdo…|Updating content…|Actualizando contenido…|Actualisation…|Inhalte werden aktualisiert…|Aggiornamento contenuti…
Aguarde...|Please wait...|Espera...|Veuillez patienter...|Bitte warten...|Attendi...
`
export const translations = Object.fromEntries(
  rows
    .trim()
    .split('\n')
    .map((row) => {
      const [key, ...values] = row.split('|')
      return [key, values]
    }),
) as Record<string, [string, string, string, string, string]>

const aliases: Record<string, string> = {
  'Parceiro cadastrado': 'Salvo com sucesso',
  'Serviço cadastrado': 'Salvo com sucesso',
  'Dados do membro atualizados': 'Salvo com sucesso',
  'Senha do membro alterada': 'Salvo com sucesso',
  'Assinatura atualizada': 'Salvo com sucesso',
  'Disponibilidade atualizada': 'Salvo com sucesso',
  'Regras removidas': 'Salvo com sucesso',
  'Pedido atualizado': 'Salvo com sucesso',
  'Salvar dados': 'Salvar',
  'Salvar nova senha': 'Salvar',
  'Salvar senha': 'Salvar',
  'Salvar plano e validade': 'Salvar',
  'Salvar regra': 'Salvar',
  'Entrar na Órbita': 'Entrar',
  'Aceitar convite': 'Confirmar',
  ativos: 'Ativo',
  inativos: 'Inativo',
  membros: 'Membros',
  'membros cadastrados': 'Membros cadastrados',
  'membro cadastrado': 'Membro',
  serviços: 'Serviços',
  pendentes: 'Pendente',
  '· Membro': 'Membro',
}
Object.assign(translations, {
  'Serviço criado, mas a foto falhou. Edite o serviço.': [
    'Service created, but photo upload failed. Edit the service to add the photo.',
    'Servicio creado, pero falló la foto. Edita el servicio para añadirla.',
    'Service créé, mais la photo a échoué. Modifiez le service pour ajouter la photo.',
    'Angebot erstellt, Foto fehlgeschlagen. Bearbeiten Sie das Angebot, um das Foto hinzuzufügen.',
    'Servizio creato, ma la foto non è stata caricata. Modifica il servizio per aggiungerla.',
  ],
  'Cadastro incompleto. Revise o usuário no Supabase.': [
    'Registration incomplete. Review the user in Supabase.',
    'Registro incompleto. Revisa el usuario en Supabase.',
    'Inscription incomplète. Vérifiez l’utilisateur dans Supabase.',
    'Registrierung unvollständig. Prüfen Sie den Benutzer in Supabase.',
    'Registrazione incompleta. Verifica l’utente in Supabase.',
  ],
  'Cadastro incompleto. Revise o usuário no painel Supabase antes de tentar novamente.':
    [
      'Registration incomplete. Review the user in the Supabase dashboard before retrying.',
      'Registro incompleto. Revisa el usuario en el panel Supabase antes de reintentar.',
      'Inscription incomplète. Vérifiez l’utilisateur dans Supabase avant de réessayer.',
      'Registrierung unvollständig. Prüfen Sie den Benutzer im Supabase-Dashboard vor einem neuen Versuch.',
      'Registrazione incompleta. Verifica l’utente nel pannello Supabase prima di riprovare.',
    ],
  'Serviço salvo como rascunho; regras falharam. Revise no painel.': [
    'Service saved as draft; rules failed. Review it in the dashboard.',
    'Servicio guardado como borrador; fallaron las reglas. Revísalo en el panel.',
    'Service enregistré en brouillon ; les règles ont échoué. Vérifiez le tableau de bord.',
    'Angebot als Entwurf gespeichert; Regeln fehlgeschlagen. Im Dashboard prüfen.',
    'Servizio salvato come bozza; regole non riuscite. Verifica nel pannello.',
  ],
  'Falha na operação': [
    'Unable to complete the action. Check your details and try again.',
    'No se pudo completar la acción. Revisa los datos e inténtalo de nuevo.',
    'Action impossible. Vérifiez vos données et réessayez.',
    'Aktion fehlgeschlagen. Prüfen Sie Ihre Angaben und versuchen Sie es erneut.',
    'Impossibile completare l’azione. Controlla i dati e riprova.',
  ],
  'Upgrade aprovado. O membro já tem acesso Premium.': [
    'Upgrade approved. The member now has Premium access.',
    'Mejora aprobada. El miembro ya tiene acceso Premium.',
    'Mise à niveau approuvée. Le membre a accès à Premium.',
    'Upgrade genehmigt. Das Mitglied hat jetzt Premium-Zugang.',
    'Upgrade approvato. Il membro ora ha accesso Premium.',
  ],
  'Solicitação recusada.': [
    'Request rejected.',
    'Solicitud rechazada.',
    'Demande refusée.',
    'Anfrage abgelehnt.',
    'Richiesta rifiutata.',
  ],
  'Escolha uma data nos próximos 30 dias': [
    'Choose a date within the next 30 days',
    'Elige una fecha en los próximos 30 días',
    'Choisissez une date dans les 30 prochains jours',
    'Wählen Sie ein Datum innerhalb der nächsten 30 Tage',
    'Scegli una data nei prossimi 30 giorni',
  ],
  'Horário inválido ou indisponível': [
    'Invalid or unavailable time',
    'Horario inválido o no disponible',
    'Créneau invalide ou indisponible',
    'Ungültiges oder nicht verfügbares Zeitfenster',
    'Orario non valido o non disponibile',
  ],
  'Escolha um horário válido': [
    'Choose a valid time',
    'Elige un horario válido',
    'Choisissez un créneau valide',
    'Wählen Sie ein gültiges Zeitfenster',
    'Scegli un orario valido',
  ],
  'Existem reservas futuras. Mantenha a duração dos horários.': [
    'Future bookings exist. Keep the current slot duration.',
    'Hay reservas futuras. Mantén la duración actual.',
    'Des réservations futures existent. Conservez la durée actuelle.',
    'Zukünftige Buchungen vorhanden. Aktuelle Dauer beibehalten.',
    'Esistono prenotazioni future. Mantieni la durata attuale.',
  ],
  'Capacidade menor que as reservas existentes': [
    'Capacity is lower than existing bookings',
    'La capacidad es menor que las reservas existentes',
    'Capacité inférieure aux réservations existantes',
    'Kapazität ist kleiner als bestehende Buchungen',
    'Capacità inferiore alle prenotazioni esistenti',
  ],
  'Assinatura inativa ou expirada': [
    'Subscription inactive or expired',
    'Suscripción inactiva o vencida',
    'Abonnement inactif ou expiré',
    'Abonnement inaktiv oder abgelaufen',
    'Abbonamento inattivo o scaduto',
  ],
  'Faça login para continuar': [
    'Sign in to continue',
    'Inicia sesión para continuar',
    'Connectez-vous pour continuer',
    'Zum Fortfahren anmelden',
    'Accedi per continuare',
  ],
  Básico: ['Basic', 'Básico', 'Basique', 'Basis', 'Base'],
  'Sem plano': [
    'No plan',
    'Sin plan',
    'Sans offre',
    'Kein Tarif',
    'Nessun piano',
  ],
  'Todos os serviços': [
    'All services',
    'Todos los servicios',
    'Tous les services',
    'Alle Angebote',
    'Tutti i servizi',
  ],
  'Acesso imediato': [
    'Immediate access',
    'Acceso inmediato',
    'Accès immédiat',
    'Sofortiger Zugang',
    'Accesso immediato',
  ],
  Premium: ['Premium', 'Premium', 'Premium', 'Premium', 'Premium'],
  ADMIN: ['ADMIN', 'ADMIN', 'ADMIN', 'ADMIN', 'ADMIN'],
  Órbita: ['Órbita', 'Órbita', 'Órbita', 'Órbita', 'Órbita'],
  'Órbita, início': [
    'Órbita, home',
    'Órbita, inicio',
    'Órbita, accueil',
    'Órbita, Start',
    'Órbita, inizio',
  ],
  dias: ['days', 'días', 'jours', 'Tage', 'giorni'],
  min: ['min', 'min', 'min', 'Min', 'min'],
  'seu@email.com': [
    'you@example.com',
    'tu@ejemplo.com',
    'vous@exemple.com',
    'name@beispiel.de',
    'tu@esempio.it',
  ],
  'nome@exemplo.com': [
    'name@example.com',
    'nombre@ejemplo.com',
    'nom@exemple.com',
    'name@beispiel.de',
    'nome@esempio.it',
  ],
  'Nenhum parceiro cadastrado.': [
    'No partners registered.',
    'No hay colaboradores registrados.',
    'Aucun partenaire enregistré.',
    'Keine Partner registriert.',
    'Nessun partner registrato.',
  ],
  'Nenhum serviço cadastrado.': [
    'No services registered.',
    'No hay servicios registrados.',
    'Aucun service enregistré.',
    'Keine Angebote registriert.',
    'Nessun servizio registrato.',
  ],
  'Nenhum pedido neste período.': [
    'No orders in this period.',
    'Sin pedidos en este período.',
    'Aucune commande sur cette période.',
    'Keine Buchungen in diesem Zeitraum.',
    'Nessun ordine in questo periodo.',
  ],
  'Nenhuma solicitação por enquanto.': [
    'No requests yet.',
    'Aún no hay solicitudes.',
    'Aucune demande pour le moment.',
    'Noch keine Anfragen.',
    'Nessuna richiesta per ora.',
  ],
  'Valor nominal contratado, não pagamento recebido. Visualizações = eventos registrados.':
    [
      'Nominal booked value; no payments received. Views are recorded events.',
      'Valor nominal contratado; sin pagos recibidos. Las vistas son eventos registrados.',
      'Valeur nominale réservée, sans paiement reçu. Les vues sont des événements enregistrés.',
      'Nominaler Buchungswert; keine Zahlungseingänge. Aufrufe sind erfasste Ereignisse.',
      'Valore nominale prenotato, senza pagamenti ricevuti. Le visualizzazioni sono eventi registrati.',
    ],
  'Salvo com sucesso': [
    'Saved successfully',
    'Guardado correctamente',
    'Enregistré',
    'Gespeichert',
    'Salvato',
  ],
  'Falha ao salvar': [
    'Unable to save',
    'No se pudo guardar',
    'Enregistrement impossible',
    'Speichern fehlgeschlagen',
    'Salvataggio non riuscito',
  ],
  'Falha ao carregar': [
    'Unable to load',
    'No se pudo cargar',
    'Chargement impossible',
    'Laden fehlgeschlagen',
    'Caricamento non riuscito',
  ],
  'Falha ao reservar': [
    'Unable to book',
    'No se pudo reservar',
    'Réservation impossible',
    'Buchung fehlgeschlagen',
    'Prenotazione non riuscita',
  ],
  'Falha ao excluir': [
    'Unable to delete',
    'No se pudo eliminar',
    'Suppression impossible',
    'Löschen fehlgeschlagen',
    'Eliminazione non riuscita',
  ],
  'Acesso não autorizado': [
    'Access denied',
    'Acceso no autorizado',
    'Accès refusé',
    'Zugriff verweigert',
    'Accesso non autorizzato',
  ],
  'Regra de negócio inválida': [
    'Invalid or unavailable date, time or details',
    'Fecha, horario o datos no válidos',
    'Date, créneau ou données non valides',
    'Ungültiges Datum, Zeitfenster oder Angaben',
    'Data, orario o dati non validi',
  ],
  'Dados inválidos': [
    'Invalid details',
    'Datos no válidos',
    'Données non valides',
    'Ungültige Angaben',
    'Dati non validi',
  ],
  'Erro interno': [
    'Internal error',
    'Error interno',
    'Erreur interne',
    'Interner Fehler',
    'Errore interno',
  ],
  'Interesse registrado.': [
    'Interest recorded.',
    'Interés registrado.',
    'Intérêt enregistré.',
    'Interesse erfasst.',
    'Interesse registrato.',
  ],
})

for (const [source, target] of Object.entries(aliases))
  translations[source] = translations[target]
