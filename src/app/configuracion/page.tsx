'use client'

import { useState, useEffect } from 'react'
import { Settings, Zap, Shield, Loader2, Trash2, ArrowLeft, Globe } from 'lucide-react'
import Link from 'next/link'

// Traducciones
const translations = {
  es: {
    backToHome: 'Volver al inicio',
    title: 'Configuración de Consulta',
    searchConfig: 'CONFIGURACIÓN DE BÚSQUEDA',
    language: 'Idioma',
    skipCaptcha: 'Omitir módulos con captchas',
    skipCaptchaDesc: 'Excluye automáticamente las plataformas que requieren resolución manual de captcha (Joomla.org)',
    privacyMode: 'Modo privacidad por consulta',
    privacyModeDesc: 'Omite módulos que alertan al usuario enviándole emails de recuperación o creando cuentas (Instagram.com, Joomla.org)',
    showPlatformSelector: 'Mostrar selector de plataformas individuales',
    showPlatformSelectorDesc: 'Muestra un dropdown para consultar módulos OSINT de forma individual',
    showDebugConsole: 'Mostrar consola de debug',
    showDebugConsoleDesc: 'Habilita la consola de depuración para ver logs en tiempo real',
    showNextDevTools: 'Mostrar Next.js Dev Tools',
    showNextDevToolsDesc: 'Muestra el ícono de herramientas de desarrollo de Next.js',
    connectChess: 'Conectar sesión de Chess.com',
    connectChessDesc: 'Conecta tu cuenta de Chess.com para mejorar las búsquedas de email',
    connected: 'Conectada',
    notConnected: 'No conectada',
    connectedMale: 'Conectado',
    notConnectedMale: 'No conectado',
    chessEmail: 'Email de Chess.com',
    password: 'Contraseña',
    verifying: 'Verificando...',
    saveAccountData: 'Guardar datos de la cuenta',
    accountConnected: 'Cuenta conectada correctamente',
    connectTrello: 'Conectar sesión de Trello',
    connectTrelloDesc: 'Carga las cookies de tu sesión de Trello para búsquedas de datos de cuenta',
    pasteTrelloCookies: 'Pega aquí el JSON de cookies de Trello...',
    validating: 'Validando...',
    loadSessionCookies: 'Cargar cookies de sesión',
    howToGetCookies: 'Cómo obtener las cookies:',
    trelloStep1: '1. Abre Trello en tu navegador y asegúrate de estar logueado',
    trelloStep2: '2. Abre las herramientas de desarrollador (F12)',
    trelloStep3: '3. Ve a Application → Cookies → https://trello.com',
    trelloStep4: '4. Exporta todas las cookies en formato JSON',
    trelloSession: 'Sesión de Trello',
    cookiesLoaded: 'Cookies cargadas correctamente',
    githubToken: 'Token de GitHub',
    githubTokenDesc: 'Conecta tu token de GitHub para obtener datos de perfil completos basados en email',
    validatingToken: 'Validando token...',
    connectToken: 'Conectar token',
    howToGetGithubToken: 'Cómo obtener tu token de GitHub:',
    githubStep1: '1. Ve a GitHub.com → Settings → Developer settings',
    githubStep2: '2. Personal access tokens → Tokens (classic)',
    githubStep3: '3. Generate new token con permisos: repo, user, user:email',
    githubStep4: '4. Copia el token generado (ghp_...)',
    tokenConfigured: 'Token configurado correctamente',
    connectDropbox: 'Conectar sesión de Dropbox',
    connectDropboxDesc: 'Carga las cookies de tu sesión de Dropbox para búsquedas de datos de cuenta',
    pasteDropboxCookies: 'Pega aquí el JSON de cookies de Dropbox...',
    dropboxStep1: '1. Abre Dropbox en tu navegador y asegúrate de estar logueado',
    dropboxStep2: '2. Abre las herramientas de desarrollador (F12)',
    dropboxStep3: '3. Ve a Application → Cookies → https://www.dropbox.com',
    dropboxStep4: '4. Exporta todas las cookies en formato JSON',
    dropboxSession: 'Sesión de Dropbox',
    teamsTokens: 'Tokens de Microsoft Teams',
    teamsTokensDesc: 'Conecta los tokens de Teams para búsquedas avanzadas de usuarios',
    authorizationBearer: 'Authorization (Bearer Token)',
    saving: 'Guardando...',
    saveTokens: 'Guardar tokens',
    howToGetTeamsTokens: 'Cómo obtener los tokens:',
    teamsStep1: '1. Abre Teams en tu navegador: https://teams.live.com/v2/',
    teamsStep2: '2. Abre DevTools (F12) → pestaña Network',
    teamsStep3: '3. Busca cualquier usuario en Teams',
    teamsStep4: '4. Filtra por "searchUsers" en Network',
    teamsStep5: '5. Ve a Headers → Request Headers',
    teamsStep6: '6. Authorization: Copia TODO incluyendo "Bearer " (con espacio)',
    teamsStep7: '7. X-Skypetoken: Copia SOLO el token (sin "Bearer")',
    teamsTokensConfigured: 'Tokens configurados correctamente',
    flickrApi: 'Flickr API',
    flickrApiDesc: 'Configurar tokens de autenticación',
    apiKey: 'API Key',
    authHash: 'Auth Hash',
    secret: 'Secret',
    saveConfig: 'Guardar configuración',
    howToGetFlickrTokens: 'Cómo obtener los tokens de Flickr:',
    flickrStep1: '1. Abre Flickr en tu navegador: https://www.flickr.com/',
    flickrStep2: '2. Inicia sesión con tu cuenta',
    flickrStep3: '3. Abre DevTools (F12) → pestaña Network',
    flickrStep4: '4. Busca cualquier usuario en Flickr (search box)',
    flickrStep5: '5. Filtra por "flickr.people.search" en Network',
    flickrStep6: '6. Ve a la Request URL y copia los parámetros:',
    flickrTokens: 'Tokens de Flickr',
    apiConfigured: 'API configurada correctamente',
    pornhubToken: 'Token de Pornhub',
    pornhubTokenDesc: 'Configurar token personalizado para las consultas de Pornhub',
    pornhubTokenPlaceholder: 'MTc2NDI4NTUwOD...',
    pornhubHowTo: 'Cómo obtener el token:',
    pornhubStep1: '1. Abre Pornhub en tu navegador',
    pornhubStep2: '2. Abre DevTools (F12) → Network',
    pornhubStep3: '3. Recarga la página',
    pornhubStep4: '4. Busca "token" en el código fuente o headers',
    currentStatus: 'Estado Actual',
    captchaModules: 'Módulos con captcha:',
    omitted: 'Omitidos',
    included: 'Incluidos',
    joomlaOmitted: '• Joomla.org será omitido',
    privacyModeStatus: 'Modo privacidad:',
    activated: 'Activado',
    deactivated: 'Desactivado',
    instagramJoomlaOmitted: '• Instagram.com y Joomla.org serán omitidos',
    account: '• Cuenta:',
    sessionCookiesLoaded: '• Cookies de sesión cargadas',
    tokensConfigured: '• Tokens configurados'
  },
  en: {
    backToHome: 'Back to home',
    title: 'Query Configuration',
    searchConfig: 'SEARCH CONFIGURATION',
    language: 'Language',
    skipCaptcha: 'Skip modules with captchas',
    skipCaptchaDesc: 'Automatically excludes platforms that require manual captcha resolution (Joomla.org)',
    privacyMode: 'Privacy mode per query',
    privacyModeDesc: 'Skips modules that alert the user by sending recovery emails or creating accounts (Instagram.com, Joomla.org)',
    showPlatformSelector: 'Show individual platform selector',
    showPlatformSelectorDesc: 'Shows a dropdown to query OSINT modules individually',
    showDebugConsole: 'Show debug console',
    showDebugConsoleDesc: 'Enables the debug console to view logs in real time',
    showNextDevTools: 'Show Next.js Dev Tools',
    showNextDevToolsDesc: 'Shows the Next.js development tools icon',
    connectChess: 'Connect Chess.com session',
    connectChessDesc: 'Connect your Chess.com account to improve email searches',
    connected: 'Connected',
    notConnected: 'Not connected',
    connectedMale: 'Connected',
    notConnectedMale: 'Not connected',
    chessEmail: 'Chess.com email',
    password: 'Password',
    verifying: 'Verifying...',
    saveAccountData: 'Save account data',
    accountConnected: 'Account connected successfully',
    connectTrello: 'Connect Trello session',
    connectTrelloDesc: 'Load your Trello session cookies for account data searches',
    pasteTrelloCookies: 'Paste Trello cookies JSON here...',
    validating: 'Validating...',
    loadSessionCookies: 'Load session cookies',
    howToGetCookies: 'How to get cookies:',
    trelloStep1: '1. Open Trello in your browser and make sure you are logged in',
    trelloStep2: '2. Open developer tools (F12)',
    trelloStep3: '3. Go to Application → Cookies → https://trello.com',
    trelloStep4: '4. Export all cookies in JSON format',
    trelloSession: 'Trello Session',
    cookiesLoaded: 'Cookies loaded successfully',
    githubToken: 'GitHub Token',
    githubTokenDesc: 'Connect your GitHub token to get complete profile data based on email',
    validatingToken: 'Validating token...',
    connectToken: 'Connect token',
    howToGetGithubToken: 'How to get your GitHub token:',
    githubStep1: '1. Go to GitHub.com → Settings → Developer settings',
    githubStep2: '2. Personal access tokens → Tokens (classic)',
    githubStep3: '3. Generate new token with permissions: repo, user, user:email',
    githubStep4: '4. Copy the generated token (ghp_...)',
    tokenConfigured: 'Token configured successfully',
    connectDropbox: 'Connect Dropbox session',
    connectDropboxDesc: 'Load your Dropbox session cookies for account data searches',
    pasteDropboxCookies: 'Paste Dropbox cookies JSON here...',
    dropboxStep1: '1. Open Dropbox in your browser and make sure you are logged in',
    dropboxStep2: '2. Open developer tools (F12)',
    dropboxStep3: '3. Go to Application → Cookies → https://www.dropbox.com',
    dropboxStep4: '4. Export all cookies in JSON format',
    dropboxSession: 'Dropbox Session',
    teamsTokens: 'Microsoft Teams Tokens',
    teamsTokensDesc: 'Connect Teams tokens for advanced user searches',
    authorizationBearer: 'Authorization (Bearer Token)',
    saving: 'Saving...',
    saveTokens: 'Save tokens',
    howToGetTeamsTokens: 'How to get the tokens:',
    teamsStep1: '1. Open Teams in your browser: https://teams.live.com/v2/',
    teamsStep2: '2. Open DevTools (F12) → Network tab',
    teamsStep3: '3. Search for any user in Teams',
    teamsStep4: '4. Filter by "searchUsers" in Network',
    teamsStep5: '5. Go to Headers → Request Headers',
    teamsStep6: '6. Authorization: Copy ALL including "Bearer " (with space)',
    teamsStep7: '7. X-Skypetoken: Copy ONLY the token (without "Bearer")',
    teamsTokensConfigured: 'Tokens configured successfully',
    flickrApi: 'Flickr API',
    flickrApiDesc: 'Configure authentication tokens',
    apiKey: 'API Key',
    authHash: 'Auth Hash',
    secret: 'Secret',
    saveConfig: 'Save configuration',
    howToGetFlickrTokens: 'How to get Flickr tokens:',
    flickrStep1: '1. Open Flickr in your browser: https://www.flickr.com/',
    flickrStep2: '2. Log in with your account',
    flickrStep3: '3. Open DevTools (F12) → Network tab',
    flickrStep4: '4. Search for any user in Flickr (search box)',
    flickrStep5: '5. Filter by "flickr.people.search" in Network',
    flickrStep6: '6. Go to the Request URL and copy the parameters:',
    flickrTokens: 'Flickr Tokens',
    apiConfigured: 'API configured successfully',
    pornhubToken: 'Pornhub Token',
    pornhubTokenDesc: 'Configure custom token for Pornhub queries',
    pornhubTokenPlaceholder: 'MTc2NDI4NTUwOD...',
    pornhubHowTo: 'How to get the token:',
    pornhubStep1: '1. Open Pornhub in your browser',
    pornhubStep2: '2. Open DevTools (F12) → Network',
    pornhubStep3: '3. Reload the page',
    pornhubStep4: '4. Search for "token" in source code or headers',
    currentStatus: 'Current Status',
    captchaModules: 'Captcha modules:',
    omitted: 'Omitted',
    included: 'Included',
    joomlaOmitted: '• Joomla.org will be omitted',
    privacyModeStatus: 'Privacy mode:',
    activated: 'Activated',
    deactivated: 'Deactivated',
    instagramJoomlaOmitted: '• Instagram.com and Joomla.org will be omitted',
    account: '• Account:',
    sessionCookiesLoaded: '• Session cookies loaded',
    tokensConfigured: '• Tokens configured'
  }
}

export default function ConfiguracionPage() {
  // Estado de idioma
  const [language, setLanguage] = useState<'es' | 'en'>('es')
  const t = translations[language]
  // Estados de configuración
  const [skipCaptchaModules, setSkipCaptchaModules] = useState(true)
  const [privacyMode, setPrivacyMode] = useState(false)
  const [showPlatformSelector, setShowPlatformSelector] = useState(false)
  const [showDebugConsole, setShowDebugConsole] = useState(false)
  const [showNextDevTools, setShowNextDevTools] = useState(false)

  // Chess.com
  const [chessEmail, setChessEmail] = useState('')
  const [chessPassword, setChessPassword] = useState('')
  const [chessAccountConnected, setChessAccountConnected] = useState(false)
  const [isConnectingChess, setIsConnectingChess] = useState(false)
  const [chessLoginError, setChessLoginError] = useState('')

  // Trello
  const [trelloCookies, setTrelloCookies] = useState('')
  const [trelloAccountConnected, setTrelloAccountConnected] = useState(false)
  const [isConnectingTrello, setIsConnectingTrello] = useState(false)
  const [trelloLoginError, setTrelloLoginError] = useState('')

  // GitHub
  const [githubTokenInput, setGithubTokenInput] = useState('')
  const [githubToken, setGithubToken] = useState('')
  const [isConnectingGithub, setIsConnectingGithub] = useState(false)
  const [githubTokenError, setGithubTokenError] = useState('')

  // Dropbox
  const [dropboxCookies, setDropboxCookies] = useState('')
  const [dropboxAccountConnected, setDropboxAccountConnected] = useState(false)
  const [isConnectingDropbox, setIsConnectingDropbox] = useState(false)
  const [dropboxLoginError, setDropboxLoginError] = useState('')

  // Microsoft Teams
  const [teamsAuthToken, setTeamsAuthToken] = useState('')
  const [teamsSkypeToken, setTeamsSkypeToken] = useState('')
  const [teamsAccountConnected, setTeamsAccountConnected] = useState(false)
  const [isConnectingTeams, setIsConnectingTeams] = useState(false)
  const [teamsLoginError, setTeamsLoginError] = useState('')

  // Flickr
  const [flickrApiKey, setFlickrApiKey] = useState('')
  const [flickrAuthHash, setFlickrAuthHash] = useState('')
  const [flickrSecret, setFlickrSecret] = useState('')
  const [flickrApiKeyInput, setFlickrApiKeyInput] = useState('')
  const [flickrAuthHashInput, setFlickrAuthHashInput] = useState('')
  const [flickrSecretInput, setFlickrSecretInput] = useState('')
  const [flickrAccountConnected, setFlickrAccountConnected] = useState(false)
  const [isConnectingFlickr, setIsConnectingFlickr] = useState(false)
  const [flickrLoginError, setFlickrLoginError] = useState('')

  // Pornhub
  const [pornhubToken, setPornhubToken] = useState('')
  const [pornhubTokenInput, setPornhubTokenInput] = useState('')
  const [pornhubTokenConnected, setPornhubTokenConnected] = useState(false)
  const [isConnectingPornhub, setIsConnectingPornhub] = useState(false)

  // Cargar configuración desde localStorage
  useEffect(() => {
    // Verificar que estamos en el cliente
    if (typeof window === 'undefined') return

    try {
      // Cargar idioma
      const savedLanguage = localStorage.getItem('app_language')
      if (savedLanguage === 'es' || savedLanguage === 'en') {
        setLanguage(savedLanguage)
      }

      const savedSkipCaptcha = localStorage.getItem('skipCaptchaModules')
      const savedPrivacyMode = localStorage.getItem('privacyMode')
      const savedShowPlatformSelector = localStorage.getItem('showPlatformSelector')
      const savedShowDebugConsole = localStorage.getItem('showDebugConsole')
      const savedShowNextDevTools = localStorage.getItem('showNextDevTools')
      const savedChessEmail = localStorage.getItem('chess_email')
      const savedChessConnected = localStorage.getItem('chess_connected')
      const savedTrelloConnected = localStorage.getItem('trello_connected')
      const savedGithubToken = localStorage.getItem('github_token')
      const savedGithubConnected = localStorage.getItem('github_connected')
      const savedDropboxConnected = localStorage.getItem('dropbox_connected')

      console.log('🔍 Cargando configuración desde localStorage:', {
        skipCaptcha: savedSkipCaptcha,
        privacyMode: savedPrivacyMode,
        showPlatformSelector: savedShowPlatformSelector,
        chessEmail: savedChessEmail,
        chessConnected: savedChessConnected ? '✅' : '❌',
        trelloConnected: savedTrelloConnected ? '✅' : '❌',
        githubToken: savedGithubToken ? '✅' : '❌',
        dropboxConnected: savedDropboxConnected ? '✅' : '❌'
      })

      if (savedSkipCaptcha) setSkipCaptchaModules(savedSkipCaptcha === 'true')
      if (savedPrivacyMode) setPrivacyMode(savedPrivacyMode === 'true')
      if (savedShowPlatformSelector) setShowPlatformSelector(savedShowPlatformSelector === 'true')
      if (savedShowDebugConsole) setShowDebugConsole(savedShowDebugConsole === 'true')
      if (savedShowNextDevTools) setShowNextDevTools(savedShowNextDevTools === 'true')

      if (savedChessEmail && savedChessConnected === 'true') {
        console.log('✅ Restaurando sesión de Chess.com:', savedChessEmail)
        setChessEmail(savedChessEmail)
        setChessAccountConnected(true)
      }

      if (savedTrelloConnected === 'true') {
        console.log('✅ Restaurando sesión de Trello')
        setTrelloAccountConnected(true)
      }

      if (savedGithubToken && savedGithubConnected === 'true') {
        console.log('✅ Restaurando token de GitHub')
        setGithubToken(savedGithubToken)
      }

      if (savedDropboxConnected === 'true') {
        console.log('✅ Restaurando sesión de Dropbox')
        setDropboxAccountConnected(true)
      }

      const savedTeamsAuthToken = localStorage.getItem('teams_auth_token')
      const savedTeamsSkypeToken = localStorage.getItem('teams_skype_token')
      const savedTeamsConnected = localStorage.getItem('teams_connected')

      if (savedTeamsAuthToken && savedTeamsSkypeToken && savedTeamsConnected === 'true') {
        console.log('✅ Restaurando tokens de Microsoft Teams')
        setTeamsAuthToken(savedTeamsAuthToken)
        setTeamsSkypeToken(savedTeamsSkypeToken)
        setTeamsAccountConnected(true)
      }

      const savedFlickrApiKey = localStorage.getItem('flickr_api_key')
      const savedFlickrAuthHash = localStorage.getItem('flickr_auth_hash')
      const savedFlickrSecret = localStorage.getItem('flickr_secret')
      const savedFlickrConnected = localStorage.getItem('flickr_connected')

      if (savedFlickrApiKey && savedFlickrAuthHash && savedFlickrSecret && savedFlickrConnected === 'true') {
        console.log('✅ Restaurando tokens de Flickr')
        setFlickrApiKey(savedFlickrApiKey)
        setFlickrAuthHash(savedFlickrAuthHash)
        setFlickrSecret(savedFlickrSecret)
        setFlickrAccountConnected(true)
      }


      // Pornhub token
      const savedPornhubToken = localStorage.getItem('pornhub_token')
      const savedPornhubConnected = localStorage.getItem('pornhub_connected')
      if (savedPornhubToken && savedPornhubConnected === 'true') {
        console.log('? Restaurando token de Pornhub')
        setPornhubToken(savedPornhubToken)
        setPornhubTokenConnected(true)
      }
    } catch (error) {
      console.error('❌ Error cargando configuración:', error)
    }
  }, [])

  // Aplicar/remover clase para ocultar Next.js Dev Tools
  useEffect(() => {
    if (typeof window === 'undefined') return

    if (showNextDevTools) {
      document.body.classList.remove('hide-next-devtools')
    } else {
      document.body.classList.add('hide-next-devtools')
    }
  }, [showNextDevTools])

  // Conectar cuenta de Chess.com
  const connectChessAccount = async () => {
    setIsConnectingChess(true)
    setChessLoginError('')

    try {
      const response = await fetch('/api/chess-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: chessEmail, password: chessPassword })
      })

      const data = await response.json()

      if (data.success) {
        localStorage.setItem('chess_email', chessEmail)
        // Guardar contraseña localmente para uso en búsquedas (requerido para Phase 2)
        localStorage.setItem('chess_password', chessPassword)
        localStorage.setItem('chess_connected', 'true')
        setChessAccountConnected(true)
        setChessPassword('')
      } else {
        setChessLoginError(data.error || 'Error al conectar con Chess.com')
      }
    } catch (error) {
      setChessLoginError('Error de red al conectar con Chess.com')
    }

    setIsConnectingChess(false)
  }

  const disconnectChessAccount = () => {
    localStorage.removeItem('chess_email')
    localStorage.removeItem('chess_password')
    localStorage.removeItem('chess_connected')
    setChessAccountConnected(false)
    setChessEmail('')
    setChessPassword('')
  }

  // Conectar Trello
  const connectTrelloAccount = async () => {
    setIsConnectingTrello(true)
    setTrelloLoginError('')

    try {
      JSON.parse(trelloCookies)
      localStorage.setItem('trello_cookies', trelloCookies)
      localStorage.setItem('trello_connected', 'true')
      setTrelloAccountConnected(true)
      setTrelloCookies('')
    } catch (error) {
      setTrelloLoginError('JSON de cookies inválido')
    }

    setIsConnectingTrello(false)
  }

  const disconnectTrelloAccount = () => {
    localStorage.removeItem('trello_cookies')
    localStorage.removeItem('trello_connected')
    setTrelloAccountConnected(false)
    setTrelloCookies('')
  }

  // Conectar GitHub Token
  const connectGithubToken = async () => {
    setIsConnectingGithub(true)
    setGithubTokenError('')

    try {
      const response = await fetch('https://api.github.com/user', {
        headers: {
          'Authorization': `token ${githubTokenInput}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      })

      if (response.ok) {
        const userData = await response.json()
        localStorage.setItem('github_token', githubTokenInput)
        localStorage.setItem('github_connected', 'true')
        localStorage.setItem('github_username', userData.login)
        setGithubToken(githubTokenInput)
        setGithubTokenInput('')
      } else {
        setGithubTokenError('Token inválido o sin permisos')
      }
    } catch (error) {
      setGithubTokenError('Error al validar el token')
    }

    setIsConnectingGithub(false)
  }

  const disconnectGithubToken = () => {
    localStorage.removeItem('github_token')
    localStorage.removeItem('github_connected')
    localStorage.removeItem('github_username')
    setGithubToken('')
    setGithubTokenInput('')
  }

  // Conectar Dropbox
  const connectDropboxAccount = async () => {
    setIsConnectingDropbox(true)
    setDropboxLoginError('')

    try {
      JSON.parse(dropboxCookies)
      localStorage.setItem('dropbox_cookies', dropboxCookies)
      localStorage.setItem('dropbox_connected', 'true')
      setDropboxAccountConnected(true)
      setDropboxCookies('')
    } catch (error) {
      setDropboxLoginError('JSON de cookies inválido')
    }

    setIsConnectingDropbox(false)
  }

  const disconnectDropboxAccount = () => {
    localStorage.removeItem('dropbox_cookies')
    localStorage.removeItem('dropbox_connected')
    setDropboxAccountConnected(false)
    setDropboxCookies('')
  }

  // Conectar Microsoft Teams
  const connectTeamsAccount = async () => {
    setIsConnectingTeams(true)
    setTeamsLoginError('')

    try {
      // Validar que no estén vacíos
      if (!teamsAuthToken.trim() || !teamsSkypeToken.trim()) {
        setTeamsLoginError('Debes proporcionar ambos tokens')
        setIsConnectingTeams(false)
        return
      }

      // Limpiar y validar tokens
      let cleanAuthToken = teamsAuthToken.trim()
      let cleanSkypeToken = teamsSkypeToken.trim()

      // Decodificar URL encoding si existe (%3D, %26, etc)
      try {
        cleanAuthToken = decodeURIComponent(cleanAuthToken)
        cleanSkypeToken = decodeURIComponent(cleanSkypeToken)
      } catch (e) {
        // Si falla el decode, continuar con el valor original
      }

      // Quitar basura al final (como &Origin=https://teams.live.com)
      cleanAuthToken = cleanAuthToken.split('&')[0].split('?')[0]
      cleanSkypeToken = cleanSkypeToken.split('&')[0].split('?')[0]

      // Asegurar que Authorization tenga "Bearer " al inicio
      if (!cleanAuthToken.startsWith('Bearer ')) {
        // Si tiene "Bearer=" o "Bearer:" o "Bearer\t", limpiarlo
        cleanAuthToken = cleanAuthToken.replace(/^Bearer[=:;\s]+/i, 'Bearer ')
        // Si no tiene Bearer en absoluto, agregarlo
        if (!cleanAuthToken.startsWith('Bearer ')) {
          cleanAuthToken = 'Bearer ' + cleanAuthToken
        }
      }

      // Asegurar que X-Skypetoken NO tenga "Bearer"
      cleanSkypeToken = cleanSkypeToken.replace(/^Bearer[\s=:;]+/i, '')

      // Guardar en localStorage
      localStorage.setItem('teams_auth_token', cleanAuthToken)
      localStorage.setItem('teams_skype_token', cleanSkypeToken)
      localStorage.setItem('teams_connected', 'true')

      setTeamsAccountConnected(true)
      setTeamsAuthToken('')
      setTeamsSkypeToken('')
    } catch (error) {
      setTeamsLoginError('Error al guardar los tokens')
    }

    setIsConnectingTeams(false)
  }

  const disconnectTeamsAccount = () => {
    localStorage.removeItem('teams_auth_token')
    localStorage.removeItem('teams_skype_token')
    localStorage.removeItem('teams_connected')
    setTeamsAccountConnected(false)
    setTeamsAuthToken('')
    setTeamsSkypeToken('')
  }

  // Conectar Flickr
  const connectFlickrAccount = async () => {
    setIsConnectingFlickr(true)
    setFlickrLoginError('')

    try {
      // Validar que no estén vacíos
      if (!flickrApiKeyInput.trim() || !flickrAuthHashInput.trim() || !flickrSecretInput.trim()) {
        setFlickrLoginError('Debes proporcionar API Key, Auth Hash y Secret')
        setIsConnectingFlickr(false)
        return
      }

      // Guardar en localStorage
      localStorage.setItem('flickr_api_key', flickrApiKeyInput.trim())
      localStorage.setItem('flickr_auth_hash', flickrAuthHashInput.trim())
      localStorage.setItem('flickr_secret', flickrSecretInput.trim())
      localStorage.setItem('flickr_connected', 'true')

      setFlickrApiKey(flickrApiKeyInput.trim())
      setFlickrAuthHash(flickrAuthHashInput.trim())
      setFlickrSecret(flickrSecretInput.trim())
      setFlickrAccountConnected(true)

      // Limpiar inputs
      setFlickrApiKeyInput('')
      setFlickrAuthHashInput('')
      setFlickrSecretInput('')

      console.log('✅ Tokens de Flickr conectados correctamente')
    } catch (error) {
      setFlickrLoginError('Error al guardar los tokens de Flickr')
    }

    setIsConnectingFlickr(false)
  }

  const disconnectFlickrAccount = () => {
    localStorage.removeItem('flickr_api_key')
    localStorage.removeItem('flickr_auth_hash')
    localStorage.removeItem('flickr_secret')
    localStorage.removeItem('flickr_connected')
    setFlickrAccountConnected(false)
    setFlickrApiKey('')
    setFlickrAuthHash('')
    setFlickrSecret('')
    setFlickrApiKeyInput('')
    setFlickrAuthHashInput('')
    setFlickrSecretInput('')
  }

  // Pornhub
  const connectPornhubToken = async () => {
    setIsConnectingPornhub(true)
    try {
      if (!pornhubTokenInput.trim()) {
        return
      }
      localStorage.setItem('pornhub_token', pornhubTokenInput.trim())
      localStorage.setItem('pornhub_connected', 'true')
      setPornhubToken(pornhubTokenInput.trim())
      setPornhubTokenConnected(true)
      setPornhubTokenInput('')
    } catch (error) {
      console.error('Error guardando token de Pornhub:', error)
    }
    setIsConnectingPornhub(false)
  }

  const disconnectPornhubToken = () => {
    localStorage.removeItem('pornhub_token')
    localStorage.removeItem('pornhub_connected')
    setPornhubTokenConnected(false)
    setPornhubToken('')
    setPornhubTokenInput('')
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-8 py-12 max-w-7xl">

        {/* Header con botón de volver */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              {t.backToHome}
            </Link>

            {/* Selector de idioma */}
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-gray-400" />
              <select
                value={language}
                onChange={(e) => {
                  const newLang = e.target.value as 'es' | 'en'
                  setLanguage(newLang)
                  localStorage.setItem('app_language', newLang)
                }}
                className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-zinc-600 cursor-pointer"
              >
                <option value="es">Español</option>
                <option value="en">English</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold">{t.title}</h1>
          </div>
        </div>

        {/* Contenedor principal */}
        <div className="space-y-12">

          {/* Sección: Búsqueda Masiva */}
          <div>
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">{t.searchConfig}</h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* COLUMNA IZQUIERDA */}
              <div className="space-y-4">
                {/* Opción Omitir Captchas */}
                <div className="p-5 rounded-lg bg-zinc-950/50 border border-zinc-900">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="text-white font-medium mb-1">{t.skipCaptcha}</div>
                      <div className="text-gray-400 text-sm">
                        {t.skipCaptchaDesc}
                      </div>
                    </div>

                    <label className="relative inline-flex items-center cursor-pointer ml-4">
                      <input
                        type="checkbox"
                        checked={skipCaptchaModules}
                        onChange={(e) => {
                          const newValue = e.target.checked
                          setSkipCaptchaModules(newValue)
                          localStorage.setItem('skipCaptchaModules', newValue.toString())
                        }}
                        className="sr-only peer"
                      />
                      <div className="relative w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                    </label>
                  </div>
                </div>

                {/* Opción Modo privacidad */}
                <div className="p-5 rounded-lg bg-zinc-950/50 border border-zinc-900">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="text-white font-medium mb-1">{t.privacyMode}</div>
                      <div className="text-gray-400 text-sm">
                        {t.privacyModeDesc}
                      </div>
                    </div>

                    <label className="relative inline-flex items-center cursor-pointer ml-4">
                      <input
                        type="checkbox"
                        checked={privacyMode}
                        onChange={(e) => {
                          const newValue = e.target.checked
                          setPrivacyMode(newValue)
                          localStorage.setItem('privacyMode', newValue.toString())
                        }}
                        className="sr-only peer"
                      />
                      <div className="relative w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                    </label>
                  </div>
                </div>

                {/* Opción Selector de Plataformas */}
                <div className="p-5 rounded-lg bg-zinc-950/50 border border-zinc-900">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="text-white font-medium mb-1">{t.showPlatformSelector}</div>
                      <div className="text-gray-400 text-sm">
                        {t.showPlatformSelectorDesc}
                      </div>
                    </div>

                    <label className="relative inline-flex items-center cursor-pointer ml-4">
                      <input
                        type="checkbox"
                        checked={showPlatformSelector}
                        onChange={(e) => {
                          const newValue = e.target.checked
                          setShowPlatformSelector(newValue)
                          localStorage.setItem('showPlatformSelector', newValue.toString())
                        }}
                        className="sr-only peer"
                      />
                      <div className="relative w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                    </label>
                  </div>
                </div>

                {/* Opción Consola de Debug */}
                <div className="p-5 rounded-lg bg-zinc-950/50 border border-zinc-900">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="text-white font-medium mb-1">{t.showDebugConsole}</div>
                      <div className="text-gray-400 text-sm">
                        {t.showDebugConsoleDesc}
                      </div>
                    </div>

                    <label className="relative inline-flex items-center cursor-pointer ml-4">
                      <input
                        type="checkbox"
                        checked={showDebugConsole}
                        onChange={(e) => {
                          const newValue = e.target.checked
                          setShowDebugConsole(newValue)
                          localStorage.setItem('showDebugConsole', newValue.toString())
                        }}
                        className="sr-only peer"
                      />
                      <div className="relative w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                    </label>
                  </div>
                </div>

                {/* Opción Next.js Dev Tools */}
                <div className="p-5 rounded-lg bg-zinc-950/50 border border-zinc-900">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="text-white font-medium mb-1">{t.showNextDevTools}</div>
                      <div className="text-gray-400 text-sm">
                        {t.showNextDevToolsDesc}
                      </div>
                    </div>

                    <label className="relative inline-flex items-center cursor-pointer ml-4">
                      <input
                        type="checkbox"
                        checked={showNextDevTools}
                        onChange={(e) => {
                          const newValue = e.target.checked
                          setShowNextDevTools(newValue)
                          localStorage.setItem('showNextDevTools', newValue.toString())
                        }}
                        className="sr-only peer"
                      />
                      <div className="relative w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                    </label>
                  </div>
                </div>

                {/* Chess.com */}
                <div className="p-5 rounded-lg bg-zinc-950/50 border border-zinc-900">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="text-white font-medium mb-1">{t.connectChess}</div>
                        <div className="text-gray-400 text-sm">
                          {t.connectChessDesc}
                        </div>
                      </div>
                      {chessAccountConnected ? (
                        <div className="px-3 py-1 rounded-full text-xs bg-green-500/20 text-green-400 border border-green-500/30">
                          {t.connected}
                        </div>
                      ) : (
                        <div className="px-3 py-1 rounded-full text-xs bg-gray-500/20 text-gray-400 border border-gray-500/30">
                          {t.notConnected}
                        </div>
                      )}
                    </div>

                    {!chessAccountConnected ? (
                      <div className="space-y-3 mt-4">
                        <input
                          type="email"
                          value={chessEmail}
                          onChange={(e) => setChessEmail(e.target.value)}
                          placeholder={t.chessEmail}
                          className="w-full bg-black border border-zinc-900 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-600 focus:border-zinc-600"
                        />

                        <input
                          type="password"
                          value={chessPassword}
                          onChange={(e) => setChessPassword(e.target.value)}
                          placeholder={t.password}
                          className="w-full bg-black border border-zinc-900 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-600 focus:border-zinc-600"
                        />

                        <button
                          onClick={connectChessAccount}
                          disabled={isConnectingChess || !chessEmail || !chessPassword}
                          className="w-full bg-white hover:bg-gray-200 text-black font-medium py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2"
                        >
                          {isConnectingChess ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              {t.verifying}
                            </>
                          ) : (
                            <>
                              <Shield className="h-4 w-4" />
                              {t.saveAccountData}
                            </>
                          )}
                        </button>

                        {chessLoginError && (
                          <p className="text-sm text-red-400">{chessLoginError}</p>
                        )}
                      </div>
                    ) : (
                      <div className="mt-4">
                        <div className="flex items-center justify-between bg-neutral-900 border border-neutral-800 rounded-lg p-4">
                          <div>
                            <p className="text-sm font-medium text-white">{chessEmail}</p>
                            <p className="text-xs text-gray-400">{t.accountConnected}</p>
                          </div>
                          <button
                            onClick={disconnectChessAccount}
                            className="p-2 hover:bg-gray-700/50 rounded-lg text-gray-400 hover:text-white transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Trello */}
                <div className="p-5 rounded-lg bg-zinc-950/50 border border-zinc-900">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="text-white font-medium mb-1">{t.connectTrello}</div>
                        <div className="text-gray-400 text-sm">
                          {t.connectTrelloDesc}
                        </div>
                      </div>
                      {trelloAccountConnected ? (
                        <div className="px-3 py-1 rounded-full text-xs bg-green-500/20 text-green-400 border border-green-500/30">
                          {t.connected}
                        </div>
                      ) : (
                        <div className="px-3 py-1 rounded-full text-xs bg-gray-500/20 text-gray-400 border border-gray-500/30">
                          {t.notConnected}
                        </div>
                      )}
                    </div>

                    {!trelloAccountConnected ? (
                      <div className="space-y-3 mt-4">
                        <textarea
                          value={trelloCookies}
                          onChange={(e) => setTrelloCookies(e.target.value)}
                          placeholder={t.pasteTrelloCookies}
                          rows={6}
                          className="w-full bg-black border border-zinc-900 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-600 focus:border-zinc-600 font-mono text-xs"
                        />

                        <button
                          onClick={connectTrelloAccount}
                          disabled={isConnectingTrello || !trelloCookies.trim()}
                          className="w-full bg-white hover:bg-gray-200 text-black font-medium py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2"
                        >
                          {isConnectingTrello ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              {t.validating}
                            </>
                          ) : (
                            <>
                              <Shield className="h-4 w-4" />
                              {t.loadSessionCookies}
                            </>
                          )}
                        </button>

                        {trelloLoginError && (
                          <p className="text-sm text-red-400">{trelloLoginError}</p>
                        )}

                        <div className="text-xs text-gray-500">
                          <p className="mb-2 font-medium text-gray-400">{t.howToGetCookies}</p>
                          <p>{t.trelloStep1}</p>
                          <p>{t.trelloStep2}</p>
                          <p>{t.trelloStep3}</p>
                          <p>{t.trelloStep4}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-4">
                        <div className="flex items-center justify-between bg-neutral-900 border border-neutral-800 rounded-lg p-4">
                          <div>
                            <p className="text-sm font-medium text-white">{t.trelloSession}</p>
                            <p className="text-xs text-gray-400">{t.cookiesLoaded}</p>
                          </div>
                          <button
                            onClick={disconnectTrelloAccount}
                            className="p-2 hover:bg-gray-700/50 rounded-lg text-gray-400 hover:text-white transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Pornhub Token */}
                <div className="p-5 rounded-lg bg-zinc-950/50 border border-zinc-900">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex-1">
                      <div className="text-white font-medium mb-1">{t.pornhubToken}</div>
                      <div className="text-gray-400 text-sm">
                        {t.pornhubTokenDesc}
                      </div>
                    </div>
                    {pornhubTokenConnected ? (
                      <div className="px-3 py-1 rounded-full text-xs bg-green-500/20 text-green-400 border border-green-500/30">
                        {t.connectedMale}
                      </div>
                    ) : (
                      <div className="px-3 py-1 rounded-full text-xs bg-gray-500/20 text-gray-400 border border-gray-500/30">
                        {t.notConnectedMale}
                      </div>
                    )}
                  </div>

                  {!pornhubTokenConnected ? (
                    <div className="space-y-3 mt-4">
                      <div>
                        <label className="block text-xs text-gray-400 mb-2">Token</label>
                        <input
                          type="text"
                          value={pornhubTokenInput}
                          onChange={(e) => setPornhubTokenInput(e.target.value)}
                          placeholder={t.pornhubTokenPlaceholder}
                          className="w-full bg-black border border-zinc-900 rounded-lg px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-zinc-600 focus:border-zinc-600 font-mono text-xs"
                        />
                      </div>

                      <button
                        onClick={connectPornhubToken}
                        disabled={isConnectingPornhub || !pornhubTokenInput.trim()}
                        className="w-full bg-white hover:bg-gray-200 text-black font-medium py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2"
                      >
                        {isConnectingPornhub ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            {t.saving}
                          </>
                        ) : (
                          <>
                            <Shield className="h-4 w-4" />
                            {t.saveConfig}
                          </>
                        )}
                      </button>

                      <div className="text-xs text-gray-500 space-y-2">
                        <p className="mb-2 font-medium text-gray-400">{t.pornhubHowTo}</p>
                        <p>{t.pornhubStep1}</p>
                        <p>{t.pornhubStep2}</p>
                        <p>{t.pornhubStep3}</p>
                        <p>{t.pornhubStep4}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between py-4 px-4 bg-black/50 rounded-lg mt-4 border border-zinc-900">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-500/20 rounded-full">
                          <Shield className="h-4 w-4 text-green-400" />
                        </div>
                        <div>
                          <div className="text-white text-sm font-medium">{t.pornhubToken}</div>
                          <div className="text-gray-400 text-xs">{t.apiConfigured}</div>
                        </div>
                      </div>
                      <button
                        onClick={disconnectPornhubToken}
                        className="p-2 hover:bg-zinc-800 rounded-lg transition-colors group"
                        title="Eliminar token"
                      >
                        <Trash2 className="h-4 w-4 text-gray-400 group-hover:text-red-400 transition-colors" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* COLUMNA DERECHA */}
              <div className="space-y-4">

                {/* GitHub Token */}
                <div className="p-5 rounded-lg bg-zinc-950/50 border border-zinc-900">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="text-white font-medium mb-1">{t.githubToken}</div>
                        <div className="text-gray-400 text-sm">
                          {t.githubTokenDesc}
                        </div>
                      </div>
                      {githubToken ? (
                        <div className="px-3 py-1 rounded-full text-xs bg-green-500/20 text-green-400 border border-green-500/30">
                          {t.connectedMale}
                        </div>
                      ) : (
                        <div className="px-3 py-1 rounded-full text-xs bg-gray-500/20 text-gray-400 border border-gray-500/30">
                          {t.notConnectedMale}
                        </div>
                      )}
                    </div>

                    {!githubToken ? (
                      <div className="space-y-3 mt-4">
                        <input
                          type="password"
                          value={githubTokenInput}
                          onChange={(e) => setGithubTokenInput(e.target.value)}
                          placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                          className="w-full bg-black border border-zinc-900 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-600 focus:border-zinc-600 font-mono text-sm"
                        />

                        <button
                          onClick={connectGithubToken}
                          disabled={isConnectingGithub || !githubTokenInput.trim()}
                          className="w-full bg-white hover:bg-gray-200 text-black font-medium py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2"
                        >
                          {isConnectingGithub ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              {t.validatingToken}
                            </>
                          ) : (
                            <>
                              <Shield className="h-4 w-4" />
                              {t.connectToken}
                            </>
                          )}
                        </button>

                        {githubTokenError && (
                          <p className="text-sm text-red-400">{githubTokenError}</p>
                        )}

                        <div className="text-xs text-gray-500">
                          <p className="mb-2 font-medium text-gray-400">{t.howToGetGithubToken}</p>
                          <p>{t.githubStep1}</p>
                          <p>{t.githubStep2}</p>
                          <p>{t.githubStep3}</p>
                          <p>{t.githubStep4}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-4">
                        <div className="flex items-center justify-between bg-neutral-900 border border-neutral-800 rounded-lg p-4">
                          <div>
                            <p className="text-sm font-medium text-white">{t.githubToken}</p>
                            <p className="text-xs text-gray-400">{t.tokenConfigured}</p>
                          </div>
                          <button
                            onClick={disconnectGithubToken}
                            className="p-2 hover:bg-gray-700/50 rounded-lg text-gray-400 hover:text-white transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Dropbox */}
                <div className="p-5 rounded-lg bg-zinc-950/50 border border-zinc-900">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="text-white font-medium mb-1">{t.connectDropbox}</div>
                        <div className="text-gray-400 text-sm">
                          {t.connectDropboxDesc}
                        </div>
                      </div>
                      {dropboxAccountConnected ? (
                        <div className="px-3 py-1 rounded-full text-xs bg-green-500/20 text-green-400 border border-green-500/30">
                          {t.connected}
                        </div>
                      ) : (
                        <div className="px-3 py-1 rounded-full text-xs bg-gray-500/20 text-gray-400 border border-gray-500/30">
                          {t.notConnected}
                        </div>
                      )}
                    </div>

                    {!dropboxAccountConnected ? (
                      <div className="space-y-3 mt-4">
                        <textarea
                          value={dropboxCookies}
                          onChange={(e) => setDropboxCookies(e.target.value)}
                          placeholder={t.pasteDropboxCookies}
                          rows={6}
                          className="w-full bg-black border border-zinc-900 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-600 focus:border-zinc-600 font-mono text-xs"
                        />

                        <button
                          onClick={connectDropboxAccount}
                          disabled={isConnectingDropbox || !dropboxCookies.trim()}
                          className="w-full bg-white hover:bg-gray-200 text-black font-medium py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2"
                        >
                          {isConnectingDropbox ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              {t.validating}
                            </>
                          ) : (
                            <>
                              <Shield className="h-4 w-4" />
                              {t.loadSessionCookies}
                            </>
                          )}
                        </button>

                        {dropboxLoginError && (
                          <p className="text-sm text-red-400">{dropboxLoginError}</p>
                        )}

                        <div className="text-xs text-gray-500">
                          <p className="mb-2 font-medium text-gray-400">{t.howToGetCookies}</p>
                          <p>{t.dropboxStep1}</p>
                          <p>{t.dropboxStep2}</p>
                          <p>{t.dropboxStep3}</p>
                          <p>{t.dropboxStep4}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-4">
                        <div className="flex items-center justify-between bg-neutral-900 border border-neutral-800 rounded-lg p-4">
                          <div>
                            <p className="text-sm font-medium text-white">{t.dropboxSession}</p>
                            <p className="text-xs text-gray-400">{t.cookiesLoaded}</p>
                          </div>
                          <button
                            onClick={disconnectDropboxAccount}
                            className="p-2 hover:bg-gray-700/50 rounded-lg text-gray-400 hover:text-white transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Microsoft Teams */}
                <div className="p-5 rounded-lg bg-zinc-950/50 border border-zinc-900">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="text-white font-medium mb-1">{t.teamsTokens}</div>
                        <div className="text-gray-400 text-sm">
                          {t.teamsTokensDesc}
                        </div>
                      </div>
                      {teamsAccountConnected ? (
                        <div className="px-3 py-1 rounded-full text-xs bg-green-500/20 text-green-400 border border-green-500/30">
                          {t.connectedMale}
                        </div>
                      ) : (
                        <div className="px-3 py-1 rounded-full text-xs bg-gray-500/20 text-gray-400 border border-gray-500/30">
                          {t.notConnectedMale}
                        </div>
                      )}
                    </div>

                    {!teamsAccountConnected ? (
                      <div className="space-y-3 mt-4">
                        <div>
                          <label className="block text-xs text-gray-400 mb-2">{t.authorizationBearer}</label>
                          <input
                            type="password"
                            value={teamsAuthToken}
                            onChange={(e) => setTeamsAuthToken(e.target.value)}
                            placeholder="Bearer eyJhbGciOiJSU0EtT0FFUCIsImVu..."
                            className="w-full bg-black border border-zinc-900 rounded-lg px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-zinc-600 focus:border-zinc-600 font-mono text-xs"
                          />
                        </div>

                        <div>
                          <label className="block text-xs text-gray-400 mb-2">X-Skypetoken</label>
                          <input
                            type="password"
                            value={teamsSkypeToken}
                            onChange={(e) => setTeamsSkypeToken(e.target.value)}
                            placeholder="eyJhbGciOiJSUzI1NiIsImtpZCI6IjAxOUQz..."
                            className="w-full bg-black border border-zinc-900 rounded-lg px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-zinc-600 focus:border-zinc-600 font-mono text-xs"
                          />
                        </div>

                        <button
                          onClick={connectTeamsAccount}
                          disabled={isConnectingTeams || !teamsAuthToken.trim() || !teamsSkypeToken.trim()}
                          className="w-full bg-white hover:bg-gray-200 text-black font-medium py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2"
                        >
                          {isConnectingTeams ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              {t.saving}
                            </>
                          ) : (
                            <>
                              <Shield className="h-4 w-4" />
                              {t.saveTokens}
                            </>
                          )}
                        </button>

                        {teamsLoginError && (
                          <p className="text-sm text-red-400">{teamsLoginError}</p>
                        )}

                        <div className="text-xs text-gray-500 space-y-2">
                          <p className="mb-2 font-medium text-gray-400">{t.howToGetTeamsTokens}</p>
                          <p>{t.teamsStep1}</p>
                          <p>{t.teamsStep2}</p>
                          <p>{t.teamsStep3}</p>
                          <p>{t.teamsStep4}</p>
                          <p>{t.teamsStep5}</p>
                          <p className="font-medium text-yellow-400">{t.teamsStep6}</p>
                          <p className="font-medium text-yellow-400">{t.teamsStep7}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-4">
                        <div className="flex items-center justify-between bg-zinc-950/50 border border-zinc-900 rounded-lg p-4">
                          <div>
                            <p className="text-sm font-medium text-white">{t.teamsTokens}</p>
                            <p className="text-xs text-gray-400">{t.teamsTokensConfigured}</p>
                          </div>
                          <button
                            onClick={disconnectTeamsAccount}
                            className="p-2 hover:bg-gray-700/50 rounded-lg text-gray-400 hover:text-white transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Flickr API Configuration */}
                <div className="bg-zinc-950/50 border border-zinc-900 rounded-lg p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-semibold text-white">{t.flickrApi}</h3>
                        <p className="text-xs text-gray-400">{t.flickrApiDesc}</p>
                      </div>
                      {flickrAccountConnected ? (
                        <div className="px-3 py-1 rounded-full text-xs bg-green-500/20 text-green-400 border border-green-500/30">
                          {t.connected}
                        </div>
                      ) : (
                        <div className="px-3 py-1 rounded-full text-xs bg-gray-500/20 text-gray-400 border border-gray-500/30">
                          {t.notConnected}
                        </div>
                      )}
                    </div>

                    {!flickrAccountConnected ? (
                      <div className="space-y-3 mt-4">
                        <div>
                          <label className="block text-xs text-gray-400 mb-2">{t.apiKey}</label>
                          <input
                            type="text"
                            value={flickrApiKeyInput}
                            onChange={(e) => setFlickrApiKeyInput(e.target.value)}
                            placeholder="f7b6301a7242148a7370a6c26c3ad3c3"
                            className="w-full bg-black border border-zinc-900 rounded-lg px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-zinc-600 focus:border-zinc-600 font-mono text-xs"
                          />
                        </div>

                        <div>
                          <label className="block text-xs text-gray-400 mb-2">{t.authHash}</label>
                          <input
                            type="text"
                            value={flickrAuthHashInput}
                            onChange={(e) => setFlickrAuthHashInput(e.target.value)}
                            placeholder="133ea3506567e76e13727eb26c4de0a565ed88de1e6df9c89ee317d50ff12d99"
                            className="w-full bg-black border border-zinc-900 rounded-lg px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-zinc-600 focus:border-zinc-600 font-mono text-xs"
                          />
                        </div>

                        <div>
                          <label className="block text-xs text-gray-400 mb-2">{t.secret}</label>
                          <input
                            type="password"
                            value={flickrSecretInput}
                            onChange={(e) => setFlickrSecretInput(e.target.value)}
                            placeholder="46d204d0ccf87407"
                            className="w-full bg-black border border-zinc-900 rounded-lg px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-zinc-600 focus:border-zinc-600 font-mono text-xs"
                          />
                        </div>

                        <button
                          onClick={connectFlickrAccount}
                          disabled={isConnectingFlickr || !flickrApiKeyInput.trim() || !flickrAuthHashInput.trim() || !flickrSecretInput.trim()}
                          className="w-full bg-white hover:bg-gray-200 text-black font-medium py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2"
                        >
                          {isConnectingFlickr ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              {t.saving}
                            </>
                          ) : (
                            <>
                              <Shield className="h-4 w-4" />
                              {t.saveConfig}
                            </>
                          )}
                        </button>

                        {flickrLoginError && (
                          <p className="text-sm text-red-400">{flickrLoginError}</p>
                        )}

                        <div className="text-xs text-gray-500 space-y-2">
                          <p className="mb-2 font-medium text-gray-400">{t.howToGetFlickrTokens}</p>
                          <p>{t.flickrStep1}</p>
                          <p>{t.flickrStep2}</p>
                          <p>{t.flickrStep3}</p>
                          <p>{t.flickrStep4}</p>
                          <p>{t.flickrStep5}</p>
                          <p>{t.flickrStep6}</p>
                          <p className="font-medium text-yellow-400 ml-4">• api_key</p>
                          <p className="font-medium text-yellow-400 ml-4">• auth_hash</p>
                          <p className="font-medium text-yellow-400 ml-4">• secret</p>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-4">
                        <div className="flex items-center justify-between bg-zinc-950/50 border border-zinc-900 rounded-lg p-4">
                          <div>
                            <p className="text-sm font-medium text-white">{t.flickrTokens}</p>
                            <p className="text-xs text-gray-400">{t.apiConfigured}</p>
                          </div>
                          <button
                            onClick={disconnectFlickrAccount}
                            className="p-2 hover:bg-gray-700/50 rounded-lg text-gray-400 hover:text-white transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>


                {/* Estado Actual */}
                <div className="bg-zinc-950/50 border border-zinc-900 rounded-lg p-6">
                  <h3 className="text-sm font-semibold text-white mb-4">{t.currentStatus}</h3>
                  <div className="text-sm text-gray-400 space-y-3">
                    <div>
                      <div className="flex items-center justify-between">
                        <span>{t.captchaModules}</span>
                        <span className={skipCaptchaModules ? 'text-red-400' : 'text-green-400'}>
                          {skipCaptchaModules ? t.omitted : t.included}
                        </span>
                      </div>
                      {skipCaptchaModules && (
                        <div className="mt-1 text-xs text-yellow-400">
                          {t.joomlaOmitted}
                        </div>
                      )}
                    </div>

                    <div className="pt-2 border-t border-zinc-900">
                      <div className="flex items-center justify-between">
                        <span>{t.privacyModeStatus}</span>
                        <span className={privacyMode ? 'text-purple-400' : 'text-green-400'}>
                          {privacyMode ? t.activated : t.deactivated}
                        </span>
                      </div>
                      {privacyMode && (
                        <div className="mt-1 text-xs text-purple-300">
                          {t.instagramJoomlaOmitted}
                        </div>
                      )}
                    </div>

                    <div className="pt-2 border-t border-zinc-900">
                      <div className="flex items-center justify-between">
                        <span>Chess.com:</span>
                        <span className={chessAccountConnected ? 'text-green-400' : 'text-gray-400'}>
                          {chessAccountConnected ? t.connected : t.notConnected}
                        </span>
                      </div>
                      {chessAccountConnected && (
                        <div className="mt-1 text-xs text-green-300">
                          {t.account} {chessEmail}
                        </div>
                      )}
                    </div>

                    <div className="pt-2 border-t border-zinc-900">
                      <div className="flex items-center justify-between">
                        <span>Trello.com:</span>
                        <span className={trelloAccountConnected ? 'text-green-400' : 'text-gray-400'}>
                          {trelloAccountConnected ? t.connected : t.notConnected}
                        </span>
                      </div>
                      {trelloAccountConnected && (
                        <div className="mt-1 text-xs text-green-300">
                          {t.sessionCookiesLoaded}
                        </div>
                      )}
                    </div>

                    <div className="pt-2 border-t border-zinc-900">
                      <div className="flex items-center justify-between">
                        <span>Dropbox.com:</span>
                        <span className={dropboxAccountConnected ? 'text-green-400' : 'text-gray-400'}>
                          {dropboxAccountConnected ? t.connected : t.notConnected}
                        </span>
                      </div>
                      {dropboxAccountConnected && (
                        <div className="mt-1 text-xs text-green-300">
                          {t.sessionCookiesLoaded}
                        </div>
                      )}
                    </div>

                    <div className="pt-2 border-t border-zinc-900">
                      <div className="flex items-center justify-between">
                        <span>Microsoft Teams:</span>
                        <span className={teamsAccountConnected ? 'text-green-400' : 'text-gray-400'}>
                          {teamsAccountConnected ? t.connectedMale : t.notConnectedMale}
                        </span>
                      </div>
                      {teamsAccountConnected && (
                        <div className="mt-1 text-xs text-green-300">
                          {t.tokensConfigured}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

              </div>

            </div>

          </div>

        </div>
      </div>
    </div>
  )
}
