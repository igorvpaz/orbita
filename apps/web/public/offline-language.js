;(() => {
  const rows = {
    en: [
      'You are offline.',
      'Reconnect to access your account, explore services and send requests.',
      'Try again',
    ],
    es: [
      'Estás sin conexión.',
      'Conéctate para acceder a tu cuenta, explorar servicios y enviar solicitudes.',
      'Intentar de nuevo',
    ],
    fr: [
      'Vous êtes hors connexion.',
      'Reconnectez-vous pour accéder à votre compte, découvrir les services et envoyer des demandes.',
      'Réessayer',
    ],
    de: [
      'Sie sind offline.',
      'Stellen Sie eine Verbindung her, um Ihr Konto, Angebote und Anfragen zu nutzen.',
      'Erneut versuchen',
    ],
    it: [
      'Sei offline.',
      'Riconnettiti per accedere al tuo account, scoprire servizi e inviare richieste.',
      'Riprova',
    ],
  }
  const saved = document.cookie.match(/(?:^|; )orbita_locale=([^;]*)/)?.[1]
  const requested = (saved || navigator.language || 'pt').split('-')[0]
  const language = requested === 'pt' || rows[requested] ? requested : 'pt'
  document.documentElement.lang = language === 'pt' ? 'pt-BR' : language
  const copy = rows[language]
  if (copy)
    ['h1', 'p', 'a'].forEach((tag, i) => {
      document.querySelector('main ' + tag).textContent = copy[i]
    })
})()
