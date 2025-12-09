'use client'

import { useState, useEffect, useRef } from 'react'
import { Mail, Search, CheckCircle, XCircle, AlertCircle, Loader2, Code, ExternalLink, Terminal, Trash2, Settings, Zap, Shield, Globe } from 'lucide-react'
import Link from 'next/link'

// Traducciones para la página principal
const mainTranslations = {
  es: {
    // Header
    headerDescription: 'Herramienta de codigo abierto de SOCMINT para obtener huellas digitales de un mail',
    configuration: 'Configuración',
    // Input section
    emailAddress: 'Dirección de email',
    emailPlaceholder: 'ejemplo@email.com',
    verifying: 'Verificando...',
    queryEmailAddress: 'Consultar dirección de emails',
    allPlatforms: 'Todas las plataformas',
    query: 'Consultar',
    // Account data section
    accountData: 'Datos de cuentas',
    // Gravatar
    username: 'Username',
    name: 'Nombre',
    fullName: 'Nombre Completo',
    hashMd5: 'Hash MD5',
    profileUrl: 'Profile URL',
    // Change.org
    passwordInAccount: 'Contraseña en la cuenta',
    auth0External: 'Auth0 externo para iniciar sesión',
    yes: 'Sí',
    no: 'No',
    // Chess.com
    country: 'País',
    lastConnection: 'Última Conexión',
    joined: 'Se Unió',
    userId: 'User ID',
    // Dropbox
    accountType: 'Tipo de Cuenta',
    accountId: 'Account ID',
    sortingKey: 'Clave de Ordenamiento',
    // Proton
    protonEmail: 'Email de Protonmail',
    accountTypeProton: 'Tipo de cuenta',
    creationDate: 'Fecha de creación',
    creationTime: 'Horario de creación',
    encryption: 'Encriptación',
    catchAll: 'Catch-All',
    notDetected: 'No Detectado',
    pgpFingerprint: 'PGP Fingerprint',
    // Duolingo
    bio: 'Bio',
    streak: 'Racha',
    days: 'días',
    totalXp: 'XP Total',
    courses: 'Cursos',
    createdAt: 'Creado',
    // Flickr
    realName: 'Nombre Real',
    location: 'Ubicación',
    description: 'Descripción',
    photos: 'Fotos',
    // GitHub
    company: 'Empresa',
    website: 'Sitio Web',
    publicRepos: 'Repos Públicos',
    followers: 'Seguidores',
    following: 'Siguiendo',
    memberSince: 'Miembro desde',
    recentRepos: 'Repositorios Recientes',
    stars: 'estrellas',
    // Teams
    displayName: 'Nombre',
    email: 'Email',
    jobTitle: 'Cargo',
    department: 'Departamento',
    officeLocation: 'Ubicación Oficina',
    phone: 'Teléfono',
    mri: 'MRI',
    tenantId: 'Tenant ID',
    // Tumblr
    title: 'Título',
    blogs: 'Blogs',
    posts: 'Posts',
    likes: 'Likes',
    // Wattpad
    aboutMe: 'Sobre mí',
    numFollowers: 'Seguidores',
    numFollowing: 'Siguiendo',
    numStoriesPublished: 'Historias Publicadas',
    numLists: 'Listas de Lectura',
    // Trello
    initials: 'Iniciales',
    confirmed: 'Confirmado',
    memberType: 'Tipo de Miembro',
    // Archive.org
    itemCount: 'Items',
    // Freelancer
    registrationDate: 'Fecha de Registro',
    role: 'Rol',
    chosenRole: 'Rol Elegido',
    primaryCurrency: 'Moneda Principal',
    status: 'Estado',
    emailVerified: 'Email Verificado',
    primaryLanguage: 'Idioma Principal',
    timezone: 'Zona Horaria',
    reputation: 'Reputación',
    // Zoho
    firstName: 'Nombre',
    lastName: 'Apellido',
    gender: 'Género',
    // SEOClerks
    sellerLevel: 'Nivel de Vendedor',
    lastSeen: 'Última vez visto',
    rating: 'Calificación',
    completedOrders: 'Órdenes Completadas',
    // Plurk
    karma: 'Karma',
    dateOfBirth: 'Fecha de Nacimiento',
    plurks: 'Plurks',
    responsesSent: 'Respuestas Enviadas',
    // Rambler
    registeredSince: 'Registrado desde',
    // Amazon
    signature: 'Firma',
    badges: 'Insignias',
    ranking: 'Ranking',
    helpfulVotes: 'Votos Útiles',
    reviews: 'Reseñas',
    // Instagram
    isPrivate: 'Cuenta Privada',
    isVerified: 'Verificado',
    // Spotify
    spotifyId: 'Spotify ID',
    // Adobe
    adobeId: 'Adobe ID',
    // Firefox
    firefoxUid: 'Firefox UID',
    // LastPass
    lastPassId: 'LastPass ID',
    iterations: 'Iteraciones',
    // Joomla
    joomlaId: 'Joomla ID',
    // WordPress
    wordpressId: 'WordPress ID',
    primaryBlog: 'Blog Principal',
    // Microsoft
    microsoftExists: 'Cuenta Microsoft',
    exists: 'Existe',
    notExists: 'No existe',
    // Facebook
    facebookId: 'Facebook ID',
    // X/Twitter
    xId: 'X ID',
    handle: 'Handle',
    // GitHub specific
    biography: 'Biografía',
    repositories: 'Repositorios',
    gists: 'Gists',
    null: 'nulo',
    // Duolingo
    limitedInfo: '(Información Limitada)',
    personalInfo: 'Información Personal',
    user: 'Usuario',
    activity: 'Actividad',
    points: 'puntos',
    currentStreak: 'Racha Actual',
    maxStreak: 'Racha Máxima',
    dailyXpGoal: 'Meta XP Diaria',
    languages: 'Idiomas',
    nativeLanguage: 'Idioma Nativo',
    learning: 'Aprendiendo',
    motivation: 'Motivación',
    recentActivity: 'Actividad Reciente',
    linkedAccounts: 'Cuentas Vinculadas',
    hasPhone: 'Teléfono',
    subscription: 'Suscripción',
    // Trello
    trelloUserId: 'ID de Usuario',
    lastActivity: 'Última Actividad',
    emailConfirmed: 'Email Confirmado',
    accountStatus: 'Estado de cuenta',
    publicProfile: 'Perfil Público',
    searchSimilarity: 'Similitud de Búsqueda',
    block: 'Bloqueo',
    available: 'Disponible',
    active: 'Activo',
    // Have I Been Pwned - Brechas
    breachesTitle: 'Have I Been Pwned - Brechas de Datos',
    breachesOption: 'Have I Been Pwned (Brechas)',
    dateLabel: 'Fecha',
    recordsLabel: 'Registros',
    industryLabel: 'Industria',
    riskLabel: 'Riesgo',
    plaintext: 'Texto Plano',
    encrypted: 'Cifrada',
    unknown: 'Desconocido',
    exposedDataLabel: 'Datos Expuestos',
    // Account Checker
    accountChecker: 'Verificador de cuentas'
  },
  en: {
    // Header
    headerDescription: 'Open source SOCMINT tool to obtain digital footprints from an email',
    configuration: 'Configuration',
    // Input section
    emailAddress: 'Email address',
    emailPlaceholder: 'example@email.com',
    verifying: 'Verifying...',
    queryEmailAddress: 'Query email address',
    allPlatforms: 'All platforms',
    query: 'Query',
    // Account data section
    accountData: 'Account Data',
    // Gravatar
    username: 'Username',
    name: 'Name',
    fullName: 'Full Name',
    hashMd5: 'MD5 Hash',
    profileUrl: 'Profile URL',
    // Change.org
    passwordInAccount: 'Password in account',
    auth0External: 'External Auth0 for login',
    yes: 'Yes',
    no: 'No',
    // Chess.com
    country: 'Country',
    lastConnection: 'Last Connection',
    joined: 'Joined',
    userId: 'User ID',
    // Dropbox
    accountType: 'Account Type',
    accountId: 'Account ID',
    sortingKey: 'Sorting Key',
    // Proton
    protonEmail: 'Protonmail Email',
    accountTypeProton: 'Account type',
    creationDate: 'Creation date',
    creationTime: 'Creation time',
    encryption: 'Encryption',
    catchAll: 'Catch-All',
    notDetected: 'Not Detected',
    pgpFingerprint: 'PGP Fingerprint',
    // Duolingo
    bio: 'Bio',
    streak: 'Streak',
    days: 'days',
    totalXp: 'Total XP',
    courses: 'Courses',
    createdAt: 'Created',
    // Flickr
    realName: 'Real Name',
    location: 'Location',
    description: 'Description',
    photos: 'Photos',
    // GitHub
    company: 'Company',
    website: 'Website',
    publicRepos: 'Public Repos',
    followers: 'Followers',
    following: 'Following',
    memberSince: 'Member since',
    recentRepos: 'Recent Repositories',
    stars: 'stars',
    // Teams
    displayName: 'Name',
    email: 'Email',
    jobTitle: 'Job Title',
    department: 'Department',
    officeLocation: 'Office Location',
    phone: 'Phone',
    mri: 'MRI',
    tenantId: 'Tenant ID',
    // Tumblr
    title: 'Title',
    blogs: 'Blogs',
    posts: 'Posts',
    likes: 'Likes',
    // Wattpad
    aboutMe: 'About me',
    numFollowers: 'Followers',
    numFollowing: 'Following',
    numStoriesPublished: 'Stories Published',
    numLists: 'Reading Lists',
    // Trello
    initials: 'Initials',
    confirmed: 'Confirmed',
    memberType: 'Member Type',
    // Archive.org
    itemCount: 'Items',
    // Freelancer
    registrationDate: 'Registration Date',
    role: 'Role',
    chosenRole: 'Chosen Role',
    primaryCurrency: 'Primary Currency',
    status: 'Status',
    emailVerified: 'Email Verified',
    primaryLanguage: 'Primary Language',
    timezone: 'Timezone',
    reputation: 'Reputation',
    // Zoho
    firstName: 'First Name',
    lastName: 'Last Name',
    gender: 'Gender',
    // SEOClerks
    sellerLevel: 'Seller Level',
    lastSeen: 'Last Seen',
    rating: 'Rating',
    completedOrders: 'Completed Orders',
    // Plurk
    karma: 'Karma',
    dateOfBirth: 'Date of Birth',
    plurks: 'Plurks',
    responsesSent: 'Responses Sent',
    // Rambler
    registeredSince: 'Registered since',
    // Amazon
    signature: 'Signature',
    badges: 'Badges',
    ranking: 'Ranking',
    helpfulVotes: 'Helpful Votes',
    reviews: 'Reviews',
    // Instagram
    isPrivate: 'Private Account',
    isVerified: 'Verified',
    // Spotify
    spotifyId: 'Spotify ID',
    // Adobe
    adobeId: 'Adobe ID',
    // Firefox
    firefoxUid: 'Firefox UID',
    // LastPass
    lastPassId: 'LastPass ID',
    iterations: 'Iterations',
    // Joomla
    joomlaId: 'Joomla ID',
    // WordPress
    wordpressId: 'WordPress ID',
    primaryBlog: 'Primary Blog',
    // Microsoft
    microsoftExists: 'Microsoft Account',
    exists: 'Exists',
    notExists: 'Does not exist',
    // Facebook
    facebookId: 'Facebook ID',
    // X/Twitter
    xId: 'X ID',
    handle: 'Handle',
    // GitHub specific
    biography: 'Biography',
    repositories: 'Repositories',
    gists: 'Gists',
    null: 'null',
    // Duolingo
    limitedInfo: '(Limited Info)',
    personalInfo: 'Personal Information',
    user: 'User',
    activity: 'Activity',
    points: 'points',
    currentStreak: 'Current Streak',
    maxStreak: 'Max Streak',
    dailyXpGoal: 'Daily XP Goal',
    languages: 'Languages',
    nativeLanguage: 'Native Language',
    learning: 'Learning',
    motivation: 'Motivation',
    recentActivity: 'Recent Activity',
    linkedAccounts: 'Linked Accounts',
    hasPhone: 'Phone',
    subscription: 'Subscription',
    // Trello
    trelloUserId: 'User ID',
    lastActivity: 'Last Activity',
    emailConfirmed: 'Email Confirmed',
    accountStatus: 'Account Status',
    publicProfile: 'Public Profile',
    searchSimilarity: 'Search Similarity',
    block: 'Block',
    available: 'Available',
    active: 'Active',
    // Have I Been Pwned - Breaches
    breachesTitle: 'Have I Been Pwned - Data Breaches',
    breachesOption: 'Have I Been Pwned (Breaches)',
    dateLabel: 'Date',
    recordsLabel: 'Records',
    industryLabel: 'Industry',
    riskLabel: 'Risk',
    plaintext: 'Plaintext',
    encrypted: 'Encrypted',
    unknown: 'Unknown',
    exposedDataLabel: 'Exposed Data',
    // Account Checker
    accountChecker: 'Account Checker'
  }
}

interface ProfileData {
  // Campos de Gravatar
  hash?: string
  requestHash?: string
  profileUrl?: string
  preferredUsername?: string
  displayName?: string
  thumbnailUrl?: string
  profileBackground?: string
  aboutMe?: string
  currentLocation?: string
  contactInfo?: string
  accounts?: any[]

  // Campos de Chess.com
  username?: string
  name?: string
  userId?: string
  uuid?: string
  picture?: string
  country?: string
  location?: string
  lastOnline?: string
  accountCreationDate?: string
  profile?: string
}

interface CheckResult {
  platform: string
  status: 'registered' | 'not_registered' | 'no_password' | 'checking' | 'error'
  message: string
  extra?: string
  profileData?: ProfileData
}

interface ConsoleLog {
  id: string
  timestamp: string
  type: 'log' | 'error' | 'warn' | 'info'
  message: string
  args: any[]
}

export default function EmailChecker() {
  // Estado de idioma
  const [language, setLanguage] = useState<'es' | 'en'>('es')
  const t = mainTranslations[language]

  const [email, setEmail] = useState('')
  const [isChecking, setIsChecking] = useState(false)
  const [results, setResults] = useState<CheckResult[]>([])
  const [showJoomlaModal, setShowJoomlaModal] = useState(false)
  const [joomlaSitekey, setJoomlaSitekey] = useState<string>('')
  const [joomlaSessionId, setJoomlaSessionId] = useState<string>('')
  const [joomlaEmail, setJoomlaEmail] = useState<string>('')
  const [captchaLoading, setCaptchaLoading] = useState(false)
  const [captchaLoaded, setCaptchaLoaded] = useState(false)
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all')
  const [consoleLogs, setConsoleLogs] = useState<ConsoleLog[]>([])
  const [skipCaptchaModules, setSkipCaptchaModules] = useState<boolean>(true)
  const [privacyMode, setPrivacyMode] = useState<boolean>(false)
  const [showPlatformSelector, setShowPlatformSelector] = useState<boolean>(false)
  const [showDebugConsoleEnabled, setShowDebugConsoleEnabled] = useState<boolean>(false)
  const [showConsole, setShowConsole] = useState<boolean>(false)

  // Estados para Chess.com
  const [chessEmail, setChessEmail] = useState('')
  const [chessPassword, setChessPassword] = useState('')
  const [chessAccountConnected, setChessAccountConnected] = useState(false)
  const [isConnectingChess, setIsConnectingChess] = useState(false)
  const [chessLoginError, setChessLoginError] = useState('')

  // Estados para Trello.com
  const [trelloCookies, setTrelloCookies] = useState('')
  const [trelloAccountConnected, setTrelloAccountConnected] = useState(false)
  const [isConnectingTrello, setIsConnectingTrello] = useState(false)
  const [trelloLoginError, setTrelloLoginError] = useState('')

  // Estados para Dropbox.com
  const [dropboxCookies, setDropboxCookies] = useState('')
  const [dropboxAccountConnected, setDropboxAccountConnected] = useState(false)
  const [isConnectingDropbox, setIsConnectingDropbox] = useState(false)
  const [dropboxLoginError, setDropboxLoginError] = useState('')

  // Estados para GitHub
  const [githubToken, setGithubToken] = useState('')
  const [githubTokenInput, setGithubTokenInput] = useState('')
  const [isConnectingGithub, setIsConnectingGithub] = useState(false)
  const [githubTokenError, setGithubTokenError] = useState('')

  // Estados para XposedOrNot (Have I Been Pwned)
  const [breachesData, setBreachesData] = useState<any[]>([])

  // Función para cargar configuración desde localStorage
  const loadConfigFromStorage = () => {
    // Cargar idioma
    const savedLanguage = localStorage.getItem('app_language')
    if (savedLanguage === 'es' || savedLanguage === 'en') {
      setLanguage(savedLanguage)
    }

    const savedSkipCaptchaModules = localStorage.getItem('skipCaptchaModules')
    if (savedSkipCaptchaModules !== null) {
      setSkipCaptchaModules(savedSkipCaptchaModules === 'true')
    }

    const savedPrivacyMode = localStorage.getItem('privacyMode')
    if (savedPrivacyMode !== null) {
      setPrivacyMode(savedPrivacyMode === 'true')
    }

    const savedShowPlatformSelector = localStorage.getItem('showPlatformSelector')
    if (savedShowPlatformSelector !== null) {
      setShowPlatformSelector(savedShowPlatformSelector === 'true')
    }

    const savedShowDebugConsole = localStorage.getItem('showDebugConsole')
    if (savedShowDebugConsole !== null) {
      setShowDebugConsoleEnabled(savedShowDebugConsole === 'true')
    }

    // Aplicar clase para ocultar Next.js Dev Tools si está desactivado
    const savedShowNextDevTools = localStorage.getItem('showNextDevTools')
    if (savedShowNextDevTools === 'true') {
      document.body.classList.remove('hide-next-devtools')
    } else {
      document.body.classList.add('hide-next-devtools')
    }
  }

  // Cargar la configuración desde localStorage al inicio y cuando vuelva el foco
  useEffect(() => {
    loadConfigFromStorage()

    // Cargar estado de Chess.com desde localStorage
    const savedChessEmail = localStorage.getItem('chess_email')
    const savedChessConnected = localStorage.getItem('chess_connected')

    if (savedChessEmail && savedChessConnected === 'true') {
      setChessEmail(savedChessEmail)
      setChessAccountConnected(true)
    }

    // Cargar estado de Trello desde localStorage
    const savedTrelloCookies = localStorage.getItem('trello_cookies')
    const savedTrelloConnected = localStorage.getItem('trello_connected')

    if (savedTrelloCookies && savedTrelloConnected === 'true') {
      setTrelloCookies(savedTrelloCookies)
      setTrelloAccountConnected(true)
    }

    // Cargar datos de conexión de Dropbox
    const savedDropboxCookies = localStorage.getItem('dropbox_cookies')
    const savedDropboxConnected = localStorage.getItem('dropbox_connected')
    if (savedDropboxCookies && savedDropboxConnected === 'true') {
      setDropboxCookies(savedDropboxCookies)
      setDropboxAccountConnected(true)
    }

    // Cargar token de GitHub
    const savedGithubToken = localStorage.getItem('github_token')
    const savedGithubConnected = localStorage.getItem('github_connected')
    if (savedGithubToken && savedGithubConnected === 'true') {
      setGithubToken(savedGithubToken)
    }

    // Recargar cuando el usuario vuelva a la página
    const handleFocus = () => {
      loadConfigFromStorage()
    }

    window.addEventListener('focus', handleFocus)

    return () => {
      window.removeEventListener('focus', handleFocus)
    }
  }, [])

  const consoleEndRef = useRef<HTMLDivElement>(null)
  const originalConsole = useRef<any>({})

  // Interceptar console.log del navegador
  useEffect(() => {
    // Guardar referencias originales
    originalConsole.current = {
      log: console.log,
      error: console.error,
      warn: console.warn,
      info: console.info
    }

    const interceptConsole = (type: ConsoleLog['type']) => {
      return (...args: any[]) => {
        // Llamar al console original
        originalConsole.current[type](...args)

        // Agregar TODOS los logs sin filtro - exactamente como PowerShell
        const now = new Date()
        const log: ConsoleLog = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          timestamp: `[${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}]`,
          type,
          message: args.map(arg =>
            typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
          ).join(' '),
          args
        }
        setConsoleLogs(prev => [...prev, log])
      }
    }

    // Reemplazar métodos de console
    console.log = interceptConsole('log')
    console.error = interceptConsole('error')
    console.warn = interceptConsole('warn')
    console.info = interceptConsole('info')

    // Cleanup
    return () => {
      console.log = originalConsole.current.log
      console.error = originalConsole.current.error
      console.warn = originalConsole.current.warn
      console.info = originalConsole.current.info
    }
  }, [])

  // Auto-scroll a nuevos logs
  useEffect(() => {
    if (consoleEndRef.current) {
      consoleEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [consoleLogs])

  // Aplicar clase para ocultar Next.js Dev Tools cuando cambie el focus
  useEffect(() => {
    const handleFocus = () => {
      const savedShowNextDevTools = localStorage.getItem('showNextDevTools')
      if (savedShowNextDevTools === 'true') {
        document.body.classList.remove('hide-next-devtools')
      } else {
        document.body.classList.add('hide-next-devtools')
      }
    }

    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [])

  // Efecto para mantener el estilo oscuro del input al autollenarse
  useEffect(() => {
    // Forzar el estilo oscuro en el input cuando se autocompleta
    const emailInput = document.getElementById('email') as HTMLInputElement;
    if (emailInput) {
      emailInput.addEventListener('animationstart', (e) => {
        // La animación 'onAutoFillStart' se dispara cuando el navegador autorrellena
        if (e.animationName === 'onAutoFillStart') {
          emailInput.style.backgroundColor = 'rgba(17, 24, 39, 0.6)';
          emailInput.style.color = 'white';
          emailInput.classList.add('dark-autofilled');
        }
      });

      // También capturamos cambios de input
      emailInput.addEventListener('input', () => {
        emailInput.style.backgroundColor = 'rgba(17, 24, 39, 0.6)';
        emailInput.style.color = 'white';
      });
    }
  }, [])

  const clearLogs = () => {
    setConsoleLogs([])
  }

  const getLogColor = (type: ConsoleLog['type']) => {
    switch (type) {
      case 'error':
        return 'text-red-400'
      case 'warn':
        return 'text-yellow-400'
      case 'info':
        return 'text-blue-400'
      case 'log':
      default:
        return 'text-gray-300'
    }
  }

  const checkEmail = async (specificPlatforms?: string[]) => {
    if (!email || !email.includes('@')) {
      alert('Por favor, introduce un email válido')
      return
    }

    setIsChecking(true)
    setResults([])
    setBreachesData([])

    console.log('Iniciando verificación para:', email)
    console.log('Email validation check started at', new Date().toLocaleDateString('es-ES'), new Date().toLocaleTimeString('es-ES'))
    console.log('Email to verify:', email)

    let platforms = specificPlatforms || [
      'change.org', 'pornhub.com', 'xvideos.com', 'instagram.com', 'spotify.com',
      'gravatar.com', 'microsoft.com', 'facebook.com', 'x.com', 'duolingo.com',
      'flickr.com', 'wordpress.com', 'github.com', 'chess.com', 'joomla.org',
      'adobe.com', 'firefox.com', 'lastpass.com', 'wattpad.com', 'trello.com', 'tumblr.com', 'dropbox.com', 'proton.me',
      'teams.microsoft.com', 'zoho.com', 'seoclerks.com', 'rambler.ru', 'plurk.com', 'freelancer.com',
      'amazon.com', 'archive.org'
    ]

    // Hudson Rock se ejecuta por separado, removerlo de las plataformas normales
    const shouldCheckHudsonRock = platforms.includes('hudsonrock.com') || !specificPlatforms
    platforms = platforms.filter(p => p !== 'hudsonrock.com')

    // XposedOrNot (Have I Been Pwned) se ejecuta por separado
    const shouldCheckXposedOrNot = platforms.includes('xposedornot.com') || !specificPlatforms
    platforms = platforms.filter(p => p !== 'xposedornot.com')

    // Omitir módulos según las configuraciones activas
    let modulesToSkip: string[] = []

    if (skipCaptchaModules) {
      modulesToSkip.push('joomla.org')
      console.log('Omitiendo módulos con captcha: Joomla.org')
    }

    if (privacyMode) {
      if (!modulesToSkip.includes('joomla.org')) modulesToSkip.push('joomla.org')
      modulesToSkip.push('instagram.com')
      console.log('Modo privacidad activado: Omitiendo Joomla.org e Instagram.com')
    }

    if (modulesToSkip.length > 0) {
      platforms = platforms.filter(platform => !modulesToSkip.includes(platform))
    }

    if (selectedPlatform === 'all') {
      console.log('Plataformas seleccionadas:', platforms.length, '(todas)')
    } else {
      console.log('Plataforma seleccionada:', selectedPlatform)
    }

    console.log('Iniciando verificación paralela...')

    const checks = platforms.map(async (platform) => {
      const platformName = platform === 'change.org' ? 'Change.org' :
        platform === 'pornhub.com' ? 'Pornhub.com' :
          platform === 'xvideos.com' ? 'XVideos.com' :
            platform === 'instagram.com' ? 'Instagram.com' :
              platform === 'spotify.com' ? 'Spotify.com' :
                platform === 'gravatar.com' ? 'Gravatar.com' :
                  platform === 'microsoft.com' ? 'Microsoft.com' :
                    platform === 'facebook.com' ? 'Facebook.com' :
                      platform === 'x.com' ? 'X.com' :
                        platform === 'duolingo.com' ? 'Duolingo.com' :
                          platform === 'flickr.com' ? 'Flickr.com' :
                            platform === 'wordpress.com' ? 'WordPress.com' :
                              platform === 'github.com' ? 'GitHub.com' :
                                platform === 'chess.com' ? 'Chess.com' :
                                  platform === 'joomla.org' ? 'Joomla.org' :
                                    platform === 'adobe.com' ? 'Adobe.com' :
                                      platform === 'proton.me' ? 'proton.me' :
                                        platform === 'firefox.com' ? 'Firefox.com' :
                                          platform === 'lastpass.com' ? 'LastPass.com' :
                                            platform === 'wattpad.com' ? 'Wattpad.com' :
                                              platform === 'trello.com' ? 'Trello.com' :
                                                platform === 'tumblr.com' ? 'Tumblr.com' :
                                                  platform === 'dropbox.com' ? 'Dropbox.com' :
                                                    platform === 'zoho.com' ? 'Zoho.com' :
                                                      platform === 'seoclerks.com' ? 'SEOClerks.com' :
                                                        platform === 'rambler.ru' ? 'Rambler.ru' :
                                                          platform === 'plurk.com' ? 'Plurk.com' :
                                                            platform === 'freelancer.com' ? 'Freelancer.com' :
                                                              platform === 'amazon.com' ? 'Amazon.com' :
                                                                platform === 'archive.org' ? 'Archive.org' : platform

      // Para Chess.com, hacer verificación en dos fases
      if (platform === 'chess.com') {
        // FASE 1: Verificación rápida
        console.log('Fase 1: Verificación rápida de Chess.com...')
        const verifyRequestBody = { email, platform, mode: 'verify' }
        console.log('REQUEST to /api/check-email (verify):')
        console.log('Method: POST')
        console.log('Headers: { "Content-Type": "application/json" }')
        console.log('Body:', JSON.stringify(verifyRequestBody, null, 2))

        const verifyResponse = await fetch('/api/check-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(verifyRequestBody),
        })

        const verifyData = await verifyResponse.json()

        // Mostrar logs de la verificación
        if (verifyData.serverLogs && Array.isArray(verifyData.serverLogs)) {
          verifyData.serverLogs.forEach((logMessage: string) => {
            console.log(logMessage)
          })
        }

        console.log('RESPONSE from /api/check-email (verify):')
        console.log('Status:', verifyResponse.status)
        console.log('Body:', JSON.stringify(verifyData, null, 2))

        // Si no está registrado, retornar inmediatamente
        if (verifyData.authMethod === 'NOT_REGISTERED') {
          console.log('Chess.com: Email no registrado')
          return { platform: platformName, status: 'not_registered' as const, message: 'Email no registrado', profileData: undefined }
        }

        // Si está registrado, ACTUALIZAR INMEDIATAMENTE la UI
        if (verifyData.authMethod === 'REGISTERED') {
          console.log('Chess.com: Email registrado - actualizando UI inmediatamente...')

          // *** ACTUALIZACIÓN INMEDIATA DE LA UI ***
          const immediateResult = {
            platform: platformName,
            status: 'registered' as const,
            message: 'Email ya registrado en la plataforma',
            profileData: undefined
          }

          // Actualizar results inmediatamente para mostrar el estado
          setResults(prevResults => {
            const updated = [...prevResults]
            const existingIndex = updated.findIndex(r => r.platform === platformName)
            if (existingIndex >= 0) {
              updated[existingIndex] = immediateResult
            } else {
              updated.push(immediateResult)
            }
            return updated
          })

          // FASE 2: Extracción de datos en background
          console.log('Fase 2: Iniciando extracción de datos en background...')

          // Ejecutar extracción en background sin bloquear la UI
          setTimeout(async () => {
            try {
              // Recuperar credenciales de localStorage para el login
              const chessAccountEmail = localStorage.getItem('chess_email')
              const chessPassword = localStorage.getItem('chess_password')

              const extractRequestBody = {
                email,
                platform,
                mode: 'extract',
                chessAccountEmail,
                chessPassword
              }

              const extractResponse = await fetch('/api/check-email', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(extractRequestBody),
              })

              const extractData = await extractResponse.json()

              // Mostrar logs de la extracción
              if (extractData.serverLogs && Array.isArray(extractData.serverLogs)) {
                extractData.serverLogs.forEach((logMessage: string) => {
                  console.log(logMessage)
                })
              }

              console.log('RESPONSE from /api/check-email (extract):')
              console.log('Status:', extractResponse.status)
              console.log('Body:', JSON.stringify(extractData, null, 2))

              // Actualizar con datos completos del perfil
              if (extractData.profileData) {
                setResults(prevResults => {
                  const updated = [...prevResults]
                  // Buscar por platform name exacto O por chess.com (case insensitive)
                  const chessIndex = updated.findIndex(r =>
                    r.platform === platformName ||
                    r.platform.toLowerCase() === 'chess.com' ||
                    r.platform === 'chess.com'
                  )

                  if (chessIndex >= 0) {
                    updated[chessIndex] = {
                      ...updated[chessIndex],
                      profileData: extractData.profileData
                    }
                  }

                  return updated
                })
              }
            } catch (error) {
              console.error('Error en extracción de datos Chess.com:', error)
            }
          }, 100)

          // Retornar resultado inmediato
          return immediateResult
        }
      }

      // Para otras plataformas, usar el método original
      try {
        const requestBody: Record<string, any> = { email, platform }

        // Si es Microsoft Teams, agregar tokens
        if (platform === 'teams.microsoft.com') {
          const savedTeamsAuthToken = localStorage.getItem('teams_auth_token')
          const savedTeamsSkypeToken = localStorage.getItem('teams_skype_token')
          const savedTeamsConnected = localStorage.getItem('teams_connected')

          if (savedTeamsAuthToken && savedTeamsSkypeToken && savedTeamsConnected === 'true') {
            requestBody.teamsAuthToken = savedTeamsAuthToken
            requestBody.teamsSkypeToken = savedTeamsSkypeToken
            console.log('Agregando tokens de Microsoft Teams a la request')
          } else {
            console.warn('Microsoft Teams: No hay tokens configurados')
          }
        }

        // Si es Flickr, agregar tokens
        if (platform === 'flickr.com') {
          const savedFlickrApiKey = localStorage.getItem('flickr_api_key')
          const savedFlickrAuthHash = localStorage.getItem('flickr_auth_hash')
          const savedFlickrSecret = localStorage.getItem('flickr_secret')
          const savedFlickrConnected = localStorage.getItem('flickr_connected')

          if (savedFlickrApiKey && savedFlickrAuthHash && savedFlickrSecret && savedFlickrConnected === 'true') {
            requestBody.flickrApiKey = savedFlickrApiKey
            requestBody.flickrAuthHash = savedFlickrAuthHash
            requestBody.flickrSecret = savedFlickrSecret
            console.log('Agregando tokens de Flickr a la request')
          } else {
            console.warn('Flickr: No hay tokens configurados')
          }
        }

        // Preparar headers adicionales para Trello
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        }

        // Si es Trello, agregar cookies de sesión
        if (platform === 'trello.com') {
          const savedTrelloCookies = localStorage.getItem('trello_cookies')
          const savedTrelloConnected = localStorage.getItem('trello_connected')

          if (!savedTrelloCookies || savedTrelloConnected !== 'true') {
            // Si no hay cookies de Trello, continuar sin ellas
            console.warn('Trello: No hay cookies de sesión disponibles')
          } else {
            const cleanedCookies = savedTrelloCookies.replace(/\n/g, '').replace(/\s+/g, ' ').trim()
            headers['x-trello-cookies'] = cleanedCookies
            console.log('Agregando cookies de Trello a la request')
          }
        }

        // Si es Dropbox, agregar cookies de sesión
        if (platform === 'dropbox.com') {
          const savedDropboxCookies = localStorage.getItem('dropbox_cookies')
          const savedDropboxConnected = localStorage.getItem('dropbox_connected')

          if (!savedDropboxCookies || savedDropboxConnected !== 'true') {
            // Si no hay cookies de Dropbox, continuar sin ellas
            console.warn('Dropbox: No hay cookies de sesión disponibles')
          } else {
            const cleanedCookies = savedDropboxCookies.replace(/\n/g, '').replace(/\s+/g, ' ').trim()
            headers['x-dropbox-cookies'] = cleanedCookies
            console.log('Agregando cookies de Dropbox a la request')
          }
        }

        console.log('REQUEST to /api/check-email:')
        console.log('Method: POST')
        console.log('Headers:', JSON.stringify(headers, null, 2))
        console.log('Body:', JSON.stringify(requestBody, null, 2))
        console.log('REQUEST to /api/check-email:')
        console.log('Method: POST')
        console.log('Headers:', JSON.stringify(headers, null, 2))
        console.log('Body:', JSON.stringify(requestBody, null, 2))

        const response = await fetch('/api/check-email', {
          method: 'POST',
          headers: headers,
          body: JSON.stringify(requestBody),
        })

        const data = await response.json()

        // Mostrar logs del servidor en la consola del frontend
        if (data.serverLogs && Array.isArray(data.serverLogs)) {
          data.serverLogs.forEach((logMessage: string) => {
            console.log(logMessage)
          })
        }

        // Log de la respuesta HTTP
        console.log('RESPONSE from /api/check-email:')
        console.log('Status:', response.status)
        console.log('Headers:', JSON.stringify(Object.fromEntries(response.headers.entries()), null, 2))
        console.log('Body:', JSON.stringify(data, null, 2))

        console.log(platformName, 'check completed successfully')

        let status: CheckResult['status'] = 'error'
        let message = 'Error al verificar'
        let profileData: any = null

        if (data.success) {
          switch (data.authMethod) {
            case 'PASSWORD_SET':
              status = 'registered'
              message = 'Cuenta registrada con contraseña'
              // Capturar profileData de Change.org
              if (data.profileData && platform === 'change.org') {
                console.log('Datos de perfil Change.org recibidos:', data.profileData)
                profileData = data.profileData
              }
              break
            case 'NO_PASSWORD_SET':
              status = 'no_password'
              message = 'Cuenta registrada sin contraseña (posiblemente con Google/Facebook)'
              // Capturar profileData de Change.org
              if (data.profileData && platform === 'change.org') {
                console.log('Datos de perfil Change.org recibidos:', data.profileData)
                profileData = data.profileData
              }
              break
            case 'REGISTERED_VPN_ONLY':
              status = 'registered'
              message = 'Email registrado en servicios de Proton (ProtonVPN, etc.) pero no usa ProtonMail'
              break
            case 'REGISTERED':
              status = 'registered'
              message = 'Email ya registrado en la plataforma'
              // Si hay datos del perfil disponibles, capturarlos
              if (data.profileData && platform === 'gravatar.com') {
                console.log('Datos de perfil Gravatar recibidos:', data.profileData)
                profileData = data.profileData
              }
              // Si hay datos del perfil de Chess.com disponibles, capturarlos
              if (data.profileData && platform === 'chess.com') {
                console.log('Datos de perfil Chess.com recibidos:', data.profileData)
                profileData = data.profileData
              }
              // Si hay datos del perfil de Duolingo disponibles, capturarlos
              if (data.profileData && platform === 'duolingo.com') {
                console.log('Datos de perfil Duolingo recibidos:', data.profileData)
                profileData = data.profileData
              }
              // Si hay datos del perfil de Proton disponibles, capturarlos
              if (data.profileData && platform === 'proton.me') {
                console.log('Datos de perfil Proton recibidos:', data.profileData)
                profileData = data.profileData
              }
              // Si hay datos del perfil de Trello disponibles, capturarlos
              if (data.profileData && platform === 'trello.com') {
                console.log('Datos de perfil Trello recibidos:', data.profileData)
                profileData = data.profileData
              }
              // Si hay datos del perfil de Dropbox disponibles, capturarlos
              if (data.profileData && platform === 'dropbox.com') {
                console.log('Datos de perfil Dropbox recibidos:', data.profileData)
                profileData = data.profileData
              }
              // Si hay datos del perfil de Flickr disponibles, capturarlos
              if (data.profileData && platform === 'flickr.com') {
                console.log('Datos de perfil Flickr recibidos:', data.profileData)
                profileData = data.profileData
              }
              // Si hay datos del perfil de Microsoft Teams disponibles, capturarlos
              if (data.profileData && platform === 'teams.microsoft.com') {
                console.log('Datos de perfil Microsoft Teams recibidos:', data.profileData)
                profileData = data.profileData
              }
              break
            case 'NOT_REGISTERED':
              status = 'not_registered'
              message = 'Email no registrado'
              break
            case 'UNKNOWN_USER':
              status = 'not_registered'
              message = 'Email no registrado'
              break
            case 'CAPTCHA_REQUIRED':
              if (platform === 'joomla.org' && !skipCaptchaModules) {
                // Solo mostramos el modal si no estamos omitiendo módulos con captcha
                setShowJoomlaModal(true)
                setJoomlaSitekey(data.rawResponse.sitekey)
                setJoomlaSessionId(data.rawResponse.sessionId)
                setJoomlaEmail(email)
              }
              status = 'error'
              message = 'Requiere captcha manual'
              break
            case 'ERROR':
              status = 'error'
              message = data.message || 'Error de configuración'
              break
            default:
              message = 'Respuesta inesperada del servidor'
          }
        } else {
          status = 'error'
          message = data.error || 'Error al verificar en la plataforma'
          console.error(platformName + ':', data.error || 'Verification failed')
        }

        return { platform: platformName, status, message, profileData }
      } catch (error) {
        console.error('API Error for ' + platform + ':')
        console.error('Error details:', JSON.stringify({
          message: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
          platform: platform,
          timestamp: new Date().toISOString()
        }, null, 2))
        return { platform: platformName, status: 'error' as CheckResult['status'], message: 'Error de conexión' }
      }
    })

    try {
      console.log('Esperando resultados de todas las plataformas...')
      const results = await Promise.all(checks)

      // ⚠️ NO sobrescribir completamente - fusionar con estado existente
      // Esto es crítico para Chess.com que actualiza en 2 fases
      setResults(prevResults => {
        // Si no hay resultados previos, usar los nuevos directamente
        if (prevResults.length === 0) {
          return results
        }

        // Crear un mapa de resultados previos por plataforma
        const prevMap = new Map(prevResults.map(r => [r.platform, r]))

        // Fusionar: para cada nuevo resultado, verificar si hay datos previos más completos
        const merged = results.map(newResult => {
          const existingResult = prevMap.get(newResult.platform)

          if (existingResult) {
            // Si el resultado existente tiene profileData y el nuevo no, mantener el existente
            if (existingResult.profileData && !newResult.profileData) {
              return {
                ...newResult,
                profileData: existingResult.profileData
              }
            }
            // Si ambos tienen profileData, priorizar el nuevo pero fusionar
            if (existingResult.profileData && newResult.profileData) {
              return {
                ...newResult,
                profileData: { ...existingResult.profileData, ...newResult.profileData }
              }
            }
          }

          return newResult
        })

        return merged
      })

      console.log('Verificación completada')
      console.log('Resultados finales:', results)

      // Buscar datos de perfil de GitHub si hay token configurado Y github.com está en las plataformas seleccionadas
      if (githubToken && platforms.includes('github.com')) {
        console.log('Buscando perfil de GitHub...')
        try {
          const githubResponse = await fetch('/api/github-profile', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              email: email,
              token: githubToken
            })
          })

          const githubResult = await githubResponse.json()
          console.log('Resultado GitHub:', githubResult)

          if (githubResult.success && githubResult.found) {
            console.log('🟢 GitHub: Perfil encontrado para', githubResult.profileData.username)

            // Actualizar el github.com existente con profileData (como Chess.com Fase 2)
            setResults(prevResults => {
              console.log('🔍 GitHub Update - prevResults antes:', prevResults)
              const updated = [...prevResults]

              // Búsqueda case-insensitive porque el backend retorna "GitHub.com" con mayúscula
              const githubIndex = updated.findIndex(r =>
                r.platform.toLowerCase() === 'github.com'
              )
              console.log('🔍 GitHub Index encontrado:', githubIndex)

              if (githubIndex >= 0) {
                // Actualizar el existente, preservando el platform name original
                updated[githubIndex] = {
                  ...updated[githubIndex],
                  profileData: githubResult.profileData
                }
                console.log('✅ GitHub actualizado en index:', githubIndex, updated[githubIndex])
              } else {
                // Si no existe, agregarlo (caso en que se consulta solo GitHub)
                updated.push({
                  platform: 'GitHub.com',
                  status: 'registered',
                  message: 'Perfil encontrado',
                  profileData: githubResult.profileData
                })
                console.log('✅ GitHub agregado nuevo')
              }

              console.log('🔍 GitHub Update - updated después:', updated)
              return updated
            })
          } else {
            console.log('🔴 No se encontraron datos de GitHub o falló la búsqueda')

            // Agregar resultado de "no registrado" si no se encuentra cuenta
            setResults(prevResults => {
              const updated = [...prevResults]
              const githubIndex = updated.findIndex(r =>
                r.platform.toLowerCase() === 'github.com'
              )

              // Solo agregar si no existe ya un resultado de GitHub
              if (githubIndex < 0) {
                updated.push({
                  platform: 'GitHub.com',
                  status: 'not_registered',
                  message: 'No se encontró cuenta asociada'
                })
              }

              return updated
            })
          }
        } catch (error) {
          console.error('Error obteniendo datos de GitHub:', error)

          // Agregar resultado de error si falla la búsqueda
          setResults(prevResults => {
            const updated = [...prevResults]
            const githubIndex = updated.findIndex(r =>
              r.platform.toLowerCase() === 'github.com'
            )

            // Solo agregar si no existe ya un resultado de GitHub
            if (githubIndex < 0) {
              updated.push({
                platform: 'GitHub.com',
                status: 'error',
                message: 'Error al buscar cuenta'
              })
            }

            return updated
          })
        }
      }

      // Buscar información de stealers en Hudson Rock (si está habilitado)
      if (shouldCheckHudsonRock) {
        console.log('🔍 Buscando información de stealers en Hudson Rock...')
        try {
          const hudsonRockResponse = await fetch('/api/hudsonrock', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email: email })
          })

          const hudsonRockResult = await hudsonRockResponse.json()
          console.log('Resultado Hudson Rock:', hudsonRockResult)

          if (hudsonRockResult.success && hudsonRockResult.found) {
            console.log('🚨 Hudson Rock: Email comprometido detectado')

            // Agregar resultado de Hudson Rock a results
            setResults(prevResults => {
              const updated = [...prevResults]
              updated.push({
                platform: 'HudsonRock.com',
                status: 'registered',
                message: 'Email comprometido por infostealer',
                profileData: hudsonRockResult.data
              })
              return updated
            })
          } else {
            console.log('✅ Hudson Rock: Email limpio')

            // Agregar resultado negativo (opcional, para mostrar que se verificó)
            setResults(prevResults => {
              const updated = [...prevResults]
              updated.push({
                platform: 'HudsonRock.com',
                status: 'not_registered',
                message: 'No se encontraron stealers'
              })
              return updated
            })
          }
        } catch (error) {
          console.error('Error obteniendo datos de Hudson Rock:', error)
        }
      }

      // Buscar brechas de datos en XposedOrNot (Have I Been Pwned) - si está habilitado
      if (shouldCheckXposedOrNot) {
        console.log('🔍 Buscando brechas de datos en XposedOrNot...')
        try {
          const xposedResponse = await fetch('/api/xposedornot', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email: email })
          })

          const xposedResult = await xposedResponse.json()
          console.log('Resultado XposedOrNot:', xposedResult)

          if (xposedResult.success && xposedResult.found && xposedResult.breaches.length > 0) {
            console.log(`🚨 Se encontraron ${xposedResult.breaches.length} brechas de datos`)
            setBreachesData(xposedResult.breaches)
          } else {
            console.log('✅ No se encontraron brechas de datos')
            setBreachesData([])
          }
        } catch (error) {
          console.error('Error obteniendo datos de XposedOrNot:', error)
          setBreachesData([])
        }
      }
    } catch (error) {
      console.error('Error durante el proceso de verificación:', error)
    } finally {
      setIsChecking(false)
    }
  }

  // Función para conectar la cuenta de Chess.com
  const connectChessAccount = async () => {
    if (!chessEmail || !chessPassword) return

    try {
      setIsConnectingChess(true)
      setChessLoginError('')

      console.log('Verificando credenciales de Chess.com...')

      const response = await fetch('/api/chess-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: chessEmail,
          password: chessPassword
        })
      })

      const data = await response.json()

      // Mostrar logs del servidor en la consola del frontend
      if (data.serverLogs && Array.isArray(data.serverLogs)) {
        data.serverLogs.forEach((logMessage: string) => {
          console.log(logMessage)
        })
      }

      if (data.success) {
        // Guardar información en localStorage (solo email y estado de conexión)
        localStorage.setItem('chess_email', chessEmail)
        // Guardar contraseña localmente para uso en búsquedas (requerido para Phase 2)
        localStorage.setItem('chess_password', chessPassword)
        localStorage.setItem('chess_connected', 'true')

        setChessAccountConnected(true)
        setChessPassword('') // Limpiar contraseña del estado por seguridad
        console.log('Cuenta de Chess.com conectada con éxito')
      } else {
        setChessLoginError(data.error || 'Error al conectar la cuenta')
        console.error('Error al conectar cuenta:', data.error)
      }
    } catch (error) {
      setChessLoginError('Error de conexión')
      console.error('Error:', error)
    } finally {
      setIsConnectingChess(false)
    }
  }

  // Función para desconectar la cuenta
  const disconnectChessAccount = () => {
    localStorage.removeItem('chess_email')
    localStorage.removeItem('chess_password')
    localStorage.removeItem('chess_connected')
    setChessAccountConnected(false)
    setChessEmail('')
    setChessPassword('')
    setChessLoginError('')
    console.log('Cuenta de Chess.com desconectada')
  }

  // Función para conectar la sesión de Trello
  const connectTrelloAccount = async () => {
    if (!trelloCookies.trim()) return

    try {
      setIsConnectingTrello(true)
      setTrelloLoginError('')

      console.log('Validando cookies de Trello...')

      // Validar que sea JSON válido
      let cookiesArray
      try {
        cookiesArray = JSON.parse(trelloCookies)
      } catch (jsonError) {
        throw new Error('Formato de cookies inválido. Debe ser un JSON válido.')
      }

      // Validar que sea un array
      if (!Array.isArray(cookiesArray)) {
        throw new Error('Las cookies deben estar en formato de array JSON.')
      }

      // Validar que tenga cookies de trello.com
      const trelloCookiesFound = cookiesArray.filter(cookie =>
        cookie.domain && (cookie.domain.includes('trello.com') || cookie.domain === '.trello.com')
      )

      if (trelloCookiesFound.length === 0) {
        throw new Error('No se encontraron cookies de trello.com en el JSON proporcionado.')
      }

      // Buscar cookie de sesión importante
      const sessionCookie = trelloCookiesFound.find(cookie =>
        cookie.name === 'cloud.session.token' || cookie.name === 'loggedIn'
      )

      if (!sessionCookie) {
        throw new Error('No se encontró cookie de sesión válida. Asegúrate de estar logueado en Trello.')
      }

      // Guardar cookies en localStorage
      localStorage.setItem('trello_cookies', trelloCookies)
      localStorage.setItem('trello_connected', 'true')

      setTrelloAccountConnected(true)
      console.log(`Sesión de Trello conectada con éxito. ${trelloCookiesFound.length} cookies cargadas.`)

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      setTrelloLoginError(errorMessage)
      console.error('Error al conectar sesión de Trello:', errorMessage)
    } finally {
      setIsConnectingTrello(false)
    }
  }

  // Función para desconectar la sesión de Trello
  const disconnectTrelloAccount = () => {
    localStorage.removeItem('trello_cookies')
    localStorage.removeItem('trello_connected')
    setTrelloAccountConnected(false)
    setTrelloCookies('')
  }

  // Función para conectar el token de GitHub
  const connectGithubToken = async () => {
    if (!githubTokenInput.trim()) {
      setGithubTokenError('Por favor, introduce tu token de GitHub')
      return
    }

    setIsConnectingGithub(true)
    setGithubTokenError('')

    try {
      // Validar el token haciendo una solicitud a la API de GitHub
      const response = await fetch('https://api.github.com/user', {
        headers: {
          'Authorization': `token ${githubTokenInput}`,
          'User-Agent': 'email-checker'
        }
      })

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Token inválido. Verifica que el token sea correcto y tenga permisos.')
        }
        throw new Error(`Error de API: ${response.status}`)
      }

      const userData = await response.json()

      // Guardar token en localStorage
      localStorage.setItem('github_token', githubTokenInput)
      localStorage.setItem('github_connected', 'true')
      localStorage.setItem('github_username', userData.login)

      setGithubToken(githubTokenInput)
      setGithubTokenInput('')
      setGithubTokenError('')

      console.log(`✅ Token de GitHub conectado correctamente para ${userData.login}`)

    } catch (error: any) {
      console.error('Error conectando token GitHub:', error)
      setGithubTokenError(error.message || 'Error validando el token')
    } finally {
      setIsConnectingGithub(false)
    }
  }

  // Función para desconectar el token de GitHub
  const disconnectGithubToken = () => {
    localStorage.removeItem('github_token')
    localStorage.removeItem('github_connected')
    localStorage.removeItem('github_username')
    setGithubToken('')
    setGithubTokenInput('')
    setGithubTokenError('')
  }

  // Función para conectar la sesión de Dropbox
  const connectDropboxAccount = async () => {
    if (!dropboxCookies.trim()) {
      setDropboxLoginError('Por favor, pega el JSON de cookies de Dropbox')
      return
    }

    setIsConnectingDropbox(true)
    setDropboxLoginError('')

    try {
      // Parsear y validar las cookies
      const parsedCookies = JSON.parse(dropboxCookies)

      if (!Array.isArray(parsedCookies)) {
        throw new Error('El formato debe ser un array de cookies en JSON')
      }

      // Verificar que contiene cookies esenciales de Dropbox
      const dropboxCookiesFound = parsedCookies.filter(cookie =>
        cookie.domain && (
          cookie.domain.includes('dropbox.com') ||
          cookie.domain.includes('.dropbox.com')
        )
      )

      if (dropboxCookiesFound.length === 0) {
        throw new Error('No se encontraron cookies válidas de Dropbox. Verifica que las cookies sean de dropbox.com')
      }

      // Buscar cookies críticas para validar la sesión
      const hasSessionCookies = dropboxCookiesFound.some(cookie =>
        ['t', 'lid', 'jar', '__Host-js_csrf'].includes(cookie.name)
      )

      if (!hasSessionCookies) {
        throw new Error('No se encontró cookie de sesión válida. Asegúrate de estar logueado en Dropbox.')
      }

      // Guardar cookies en localStorage
      localStorage.setItem('dropbox_cookies', dropboxCookies)
      localStorage.setItem('dropbox_connected', 'true')

      setDropboxAccountConnected(true)
      console.log(`Sesión de Dropbox conectada con éxito. ${dropboxCookiesFound.length} cookies cargadas.`)

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      setDropboxLoginError(errorMessage)
      console.error('Error al conectar sesión de Dropbox:', errorMessage)
    } finally {
      setIsConnectingDropbox(false)
    }
  }

  // Función para desconectar la sesión de Dropbox
  const disconnectDropboxAccount = () => {
    localStorage.removeItem('dropbox_cookies')
    localStorage.removeItem('dropbox_connected')
    setDropboxAccountConnected(false)
    setDropboxCookies('')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-gray-600 rounded-full mix-blend-multiply filter blur-xl opacity-15 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-gray-500 rounded-full mix-blend-multiply filter blur-xl opacity-15 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-gray-700 rounded-full mix-blend-multiply filter blur-xl opacity-15 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 flex h-screen">
        {/* Botón para abrir/cerrar consola */}
        {showDebugConsoleEnabled && !showConsole && (
          <button
            onClick={() => setShowConsole(true)}
            className="fixed left-8 top-4 z-50 p-3 bg-gray-950/95 hover:bg-gray-900/95 backdrop-blur-lg border border-gray-700/20 rounded-xl shadow-2xl transition-all duration-300 group"
            title="Mostrar consola"
          >
            <Terminal className="h-6 w-6 text-green-400 group-hover:scale-110 transition-transform" />
          </button>
        )}

        {/* Consola flotante overlay */}
        {showDebugConsoleEnabled && showConsole && (
          <div className="fixed left-8 top-4 bottom-8 w-[500px] max-w-[40vw] bg-gray-950/98 backdrop-blur-lg border border-gray-700/20 rounded-2xl p-8 shadow-2xl flex flex-col z-50 animate-in slide-in-from-left duration-300">
            {/* Header de la consola */}
            <div className="flex items-center gap-3 mb-6">
              <Terminal className="h-6 w-6 text-green-400" />
              <h3 className="text-xl font-semibold text-white">Console Output</h3>
              <button
                onClick={clearLogs}
                className="ml-auto p-2 hover:bg-gray-800/70 rounded-lg transition-colors"
                title="Limpiar logs"
              >
                <Trash2 className="h-4 w-4 text-gray-400 hover:text-white" />
              </button>
              <button
                onClick={() => setShowConsole(false)}
                className="p-2 hover:bg-gray-800/70 rounded-lg transition-colors"
                title="Ocultar consola"
              >
                <XCircle className="h-4 w-4 text-gray-400 hover:text-white" />
              </button>
            </div>

            {/* Contenido de la consola */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden bg-black/40 rounded-xl p-4 border border-gray-800/50">
              {consoleLogs.length === 0 ? (
                <div className="text-gray-600 text-center py-8">
                  <Terminal className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p className="text-lg font-medium mb-2 text-gray-500">Console Ready</p>
                  <p className="text-sm text-gray-600">Los logs aparecerán aquí en tiempo real</p>
                </div>
              ) : (
                <div className="space-y-1 font-mono text-sm">
                  {consoleLogs.map((log) => (
                    <div key={log.id} className="flex items-start gap-3 py-1">
                      <span className="text-gray-500 text-xs whitespace-nowrap flex-shrink-0">
                        {log.timestamp}
                      </span>
                      <span className={`${getLogColor(log.type)} flex-1 break-all overflow-hidden leading-relaxed whitespace-pre-wrap`}>
                        {log.message}
                      </span>
                    </div>
                  ))}
                  <div ref={consoleEndRef} />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Panel principal */}
        <div className="flex-1 flex flex-col transition-all duration-300 overflow-auto">
          <div className="max-w-4xl w-full mx-auto px-8 pt-4 pb-8" style={{ transform: 'scale(0.8)', transformOrigin: 'center' }}>
            {/* Header */}
            <div className="text-center mb-8">
              {/* Selector de idioma en esquina superior derecha */}
              <div className="flex justify-end mb-6">
                <div className="flex items-center gap-3">
                  <Globe className="h-5 w-5 text-gray-400" />
                  <select
                    value={language}
                    onChange={(e) => {
                      const newLang = e.target.value as 'es' | 'en'
                      setLanguage(newLang)
                      localStorage.setItem('app_language', newLang)
                    }}
                    className="bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2.5 text-base text-white focus:outline-none focus:ring-2 focus:ring-zinc-600 cursor-pointer"
                  >
                    <option value="es">Español</option>
                    <option value="en">English</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-center gap-4 mb-4">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-800/50 backdrop-blur-lg rounded-2xl border border-gray-600/30 shadow-2xl">
                  <Search className="h-8 w-8 text-white" />
                </div>
                <h1 className="text-6xl font-bold bg-gradient-to-r from-white via-gray-200 to-white bg-clip-text text-transparent">
                  CRSOSINT
                </h1>
              </div>
              <p className="text-xl text-white/70 mb-6">
                {t.headerDescription}
              </p>

              {/* Botón de Configuración */}
              <Link
                href="/configuracion"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white font-medium py-3 px-6 rounded-xl transition-all duration-200 border border-white/10"
              >
                <Settings className="h-5 w-5" />
                {t.configuration}
              </Link>
            </div>

            {/* Email Input */}
            <div className="bg-zinc-950/50 border border-white/5 rounded-2xl p-8 mb-8 backdrop-blur-sm">
              <div className="mb-6">
                <label htmlFor="email" className="block text-sm font-medium text-white/80 mb-3">
                  {t.emailAddress}
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/40" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl pl-12 pr-4 py-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/30 transition-all"
                    placeholder={t.emailPlaceholder}
                    autoComplete="email"
                    style={{
                      WebkitBoxShadow: '0 0 0 1000px rgb(3 7 18) inset',
                      WebkitTextFillColor: 'white'
                    }}
                  />
                </div>
              </div>

              <button
                onClick={() => checkEmail()}
                disabled={isChecking || !email}
                className="w-full bg-white/5 hover:bg-white/10 text-white font-medium py-4 px-6 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-3 border border-white/10"
              >
                {isChecking ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    {t.verifying}
                  </>
                ) : (
                  <>
                    <Search className="h-5 w-5" />
                    {t.queryEmailAddress}
                  </>
                )}
              </button>
            </div>

            {/* Platform Selection */}
            {showPlatformSelector && (
              <div className="bg-zinc-950/50 border border-white/5 rounded-2xl p-8 mb-8 backdrop-blur-sm">
                <div className="flex items-center gap-4">
                  <select
                    value={selectedPlatform}
                    onChange={(e) => setSelectedPlatform(e.target.value)}
                    disabled={isChecking}
                    className="flex-1 bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/30 transition-all duration-200 hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    style={{
                      colorScheme: 'dark'
                    }}
                  >
                    <option value="all" className="bg-gray-900 text-white">{t.allPlatforms}</option>
                    <option value="xvideos.com" className="bg-gray-900 text-white">XVideos.com</option>
                    <option value="pornhub.com" className="bg-gray-900 text-white">Pornhub.com</option>
                    <option value="change.org" className="bg-gray-900 text-white">Change.org</option>
                    <option value="instagram.com" className="bg-gray-900 text-white">Instagram.com</option>
                    <option value="spotify.com" className="bg-gray-900 text-white">Spotify.com</option>
                    <option value="gravatar.com" className="bg-gray-900 text-white">Gravatar.com</option>
                    <option value="microsoft.com" className="bg-gray-900 text-white">Microsoft.com</option>
                    <option value="facebook.com" className="bg-gray-900 text-white">Facebook.com</option>
                    <option value="x.com" className="bg-gray-900 text-white">X.com</option>
                    <option value="duolingo.com" className="bg-gray-900 text-white">Duolingo.com</option>
                    <option value="flickr.com" className="bg-gray-900 text-white">Flickr.com</option>
                    <option value="wordpress.com" className="bg-gray-900 text-white">WordPress.com</option>
                    <option value="github.com" className="bg-gray-900 text-white">GitHub.com</option>
                    <option value="chess.com" className="bg-gray-900 text-white">Chess.com</option>
                    <option value="joomla.org" className="bg-gray-900 text-white">Joomla.org</option>
                    <option value="adobe.com" className="bg-gray-900 text-white">Adobe.com</option>
                    <option value="proton.me" className="bg-gray-900 text-white">proton.me</option>
                    <option value="firefox.com" className="bg-gray-900 text-white">Firefox.com</option>
                    <option value="lastpass.com" className="bg-gray-900 text-white">LastPass.com</option>
                    <option value="wattpad.com" className="bg-gray-900 text-white">Wattpad.com</option>
                    <option value="trello.com" className="bg-gray-900 text-white">Trello.com</option>
                    <option value="tumblr.com" className="bg-gray-900 text-white">Tumblr.com</option>
                    <option value="dropbox.com" className="bg-gray-900 text-white">Dropbox.com</option>
                    <option value="teams.microsoft.com" className="bg-gray-900 text-white">Microsoft Teams</option>
                    <option value="zoho.com" className="bg-gray-900 text-white">Zoho.com</option>
                    <option value="seoclerks.com" className="bg-gray-900 text-white">SEOClerks.com</option>
                    <option value="rambler.ru" className="bg-gray-900 text-white">Rambler.ru</option>
                    <option value="plurk.com" className="bg-gray-900 text-white">Plurk.com</option>
                    <option value="freelancer.com" className="bg-gray-900 text-white">Freelancer.com</option>
                    <option value="amazon.com" className="bg-gray-900 text-white">Amazon.com</option>
                    <option value="archive.org" className="bg-gray-900 text-white">Archive.org</option>
                    <option value="hudsonrock.com" className="bg-gray-900 text-white">Hudson Rock (Stealers)</option>
                    <option value="xposedornot.com" className="bg-gray-900 text-white">{t.breachesOption}</option>
                  </select>

                  <button
                    onClick={() => checkEmail(selectedPlatform === 'all' ? undefined : [selectedPlatform])}
                    disabled={isChecking || !email}
                    className="bg-white/5 hover:bg-white/10 text-white font-medium py-3 px-6 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2 border border-white/10"
                  >
                    <Search className="h-4 w-4" />
                    {t.query}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Sección de resultados - ancho controlado */}
          <div className="w-full max-w-6xl mx-auto px-8">
            <div className="w-full">
              {/* Datos de cuentas */}
              {results.some(result => result.profileData) && (
                <>
                  <h2 className="text-2xl font-bold text-white mb-6">{t.accountData}</h2>

                  <div className="columns-1 lg:columns-2 gap-2 mb-8" style={{ columnGap: '0.5rem' }}>
                    {/* Mostrar información del perfil de Gravatar si está disponible */}
                    {results.filter(result => result.profileData && result.platform === 'Gravatar.com').map((result, index) => (
                      <div key={`gravatar-profile-${index}`} className="rounded-xl p-4 bg-zinc-950/30 border border-white/5 text-card-foreground shadow flex flex-row gap-4 overflow-auto h-fit break-inside-avoid mb-2">
                        <div className="space-y-3 flex-1">
                          <h3 className="text-base font-semibold leading-none tracking-tight">Gravatar</h3>
                          <div className="space-y-3 flex flex-col text-sm">

                            {result.profileData?.preferredUsername && (
                              <div className="space-y-1.5">
                                <p className="text-white/60 text-sm font-medium">{t.username}</p>
                                <div>
                                  <h3 className="font-semibold leading-none tracking-tight overflow-hidden max-w-60">
                                    {result.profileData.preferredUsername}
                                  </h3>
                                </div>
                              </div>
                            )}

                            {result.profileData?.displayName && (
                              <div className="space-y-1.5">
                                <p className="text-white/60 text-sm font-medium">{t.name}</p>
                                <div>
                                  <h3 className="font-semibold leading-none tracking-tight overflow-hidden max-w-60">
                                    {result.profileData.displayName}
                                  </h3>
                                </div>
                              </div>
                            )}

                            {result.profileData?.hash && (
                              <div className="space-y-1.5">
                                <p className="text-white/60 text-sm font-medium">{t.hashMd5}</p>
                                <div>
                                  <h3 className="font-semibold leading-none tracking-tight overflow-hidden max-w-60">
                                    {result.profileData.hash}
                                  </h3>
                                </div>
                              </div>
                            )}

                            {result.profileData?.profileUrl && (
                              <div className="space-y-1.5">
                                <p className="text-white/60 text-sm font-medium">{t.profileUrl}</p>
                                <div>
                                  <a
                                    href={result.profileData.profileUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="font-semibold leading-none tracking-tight underline break-all lg:max-w-[200px] xl:max-w-[250px] 2xl:max-w-[300px] text-blue-300 hover:text-blue-200"
                                  >
                                    {result.profileData.profileUrl}
                                  </a>
                                </div>
                              </div>
                            )}

                          </div>
                        </div>

                        {/* Avatar al lado derecho */}
                        <div className="flex items-start justify-center flex-shrink-0">
                          {result.profileData?.thumbnailUrl && (
                            <img
                              src={result.profileData.thumbnailUrl + '?size=180'}
                              alt="Avatar de Gravatar"
                              className="rounded-xl w-[180px] h-[180px] object-cover"
                              onError={(e) => {
                                // Si la imagen falla, usar un avatar genérico
                                (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${result.profileData?.displayName?.charAt(0) || 'G'}&background=252535&color=fff&size=180`;
                              }}
                            />
                          )}
                        </div>
                      </div>
                    ))}

                    {/* Mostrar información del perfil de Change.org si está disponible */}
                    {results.filter(result => result.profileData && result.platform === 'Change.org').map((result, index) => (
                      <div key={`change-profile-${index}`} className="rounded-xl p-4 bg-zinc-950/30 border border-white/5 text-card-foreground shadow h-fit break-inside-avoid mb-2">
                        <h3 className="text-base font-semibold leading-none tracking-tight mb-4">Change.org</h3>
                        <div className="space-y-2 text-sm">
                          <p>
                            <span className="text-white/60">{t.passwordInAccount}: </span>
                            <span className="font-semibold">{result.profileData?.hasPassword ? t.yes : t.no}</span>
                          </p>

                          <p>
                            <span className="text-white/60">{t.auth0External}: </span>
                            <span className="font-semibold">{result.profileData?.usesAuth0External ? t.yes : t.no}</span>
                          </p>
                        </div>
                      </div>
                    ))}

                    {/* Mostrar información del perfil de Chess.com si está disponible */}
                    {results.filter(result => result.profileData && result.platform === 'Chess.com').map((result, index) => (
                      <div key={`chess-profile-${index}`} className="rounded-xl p-4 bg-zinc-950/30 border border-white/5 text-card-foreground shadow flex flex-row gap-4 overflow-auto h-fit break-inside-avoid mb-2">
                        <div className="space-y-3 flex-1 min-w-0">
                          <h3 className="text-base font-semibold leading-none tracking-tight">Chess.com</h3>
                          <div className="space-y-3 flex flex-col text-sm">

                            {result.profileData?.username && (
                              <div className="space-y-1.5">
                                <p className="text-white/60 text-sm font-medium">{t.username}</p>
                                <div>
                                  <h3 className="font-semibold leading-none tracking-tight">
                                    {result.profileData.username}
                                  </h3>
                                </div>
                              </div>
                            )}

                            {result.profileData?.name && (
                              <div className="space-y-1.5">
                                <p className="text-white/60 text-sm font-medium">{t.fullName}</p>
                                <div>
                                  <h3 className="font-semibold leading-none tracking-tight">
                                    {result.profileData.name}
                                  </h3>
                                </div>
                              </div>
                            )}

                            {result.profileData?.country && (
                              <div className="space-y-1.5">
                                <p className="text-white/60 text-sm font-medium">{t.country}</p>
                                <div>
                                  <h3 className="font-semibold leading-none tracking-tight">
                                    {result.profileData.country}
                                  </h3>
                                </div>
                              </div>
                            )}

                            {result.profileData?.lastOnline && (
                              <div className="space-y-1.5">
                                <p className="text-white/60 text-sm font-medium">{t.lastConnection}</p>
                                <div>
                                  <h3 className="font-semibold leading-none tracking-tight">
                                    {result.profileData.lastOnline}
                                  </h3>
                                </div>
                              </div>
                            )}

                            {result.profileData?.accountCreationDate && (
                              <div className="space-y-1.5">
                                <p className="text-white/60 text-sm font-medium">{t.joined}</p>
                                <div>
                                  <h3 className="font-semibold leading-none tracking-tight">
                                    {result.profileData.accountCreationDate}
                                  </h3>
                                </div>
                              </div>
                            )}

                            {result.profileData?.userId && (
                              <div className="space-y-1.5">
                                <p className="text-white/60 text-sm font-medium">{t.userId}</p>
                                <div>
                                  <h3 className="font-semibold leading-none tracking-tight">
                                    {result.profileData.userId}
                                  </h3>
                                </div>
                              </div>
                            )}

                            {result.profileData?.uuid && (
                              <div className="space-y-1.5">
                                <p className="text-white/60 text-sm font-medium">UUID</p>
                                <div>
                                  <h3 className="font-semibold leading-none tracking-tight break-all font-mono text-xs">
                                    {result.profileData.uuid}
                                  </h3>
                                </div>
                              </div>
                            )}

                            {result.profileData?.profile && (
                              <div className="space-y-1.5">
                                <p className="text-white/60 text-sm font-medium">Profile URL</p>
                                <div>
                                  <a
                                    href={result.profileData.profile}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="font-semibold leading-none tracking-tight underline break-all text-blue-300 hover:text-blue-200"
                                  >
                                    {result.profileData.profile}
                                  </a>
                                </div>
                              </div>
                            )}

                          </div>
                        </div>

                        {/* Avatar al lado derecho */}
                        <div className="flex items-start justify-center flex-shrink-0">
                          {result.profileData?.picture && (
                            <img
                              src={result.profileData.picture}
                              alt="Avatar de Chess.com"
                              className="rounded-xl w-[180px] h-[180px] object-cover"
                              onError={(e) => {
                                // Si la imagen falla, usar un avatar genérico con la inicial del username
                                (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${result.profileData?.username?.charAt(0) || 'C'}&background=769656&color=fff&size=180`;
                              }}
                            />
                          )}
                        </div>
                      </div>
                    ))}

                    {/* Mostrar información del perfil de GitHub si está disponible */}
                    {results.filter(result => result.profileData && result.platform.toLowerCase() === 'github.com').map((result, index) => {
                      const githubData = result.profileData as any;
                      return (
                        <div key={`github-profile-${index}`} className="rounded-xl p-4 bg-zinc-950/30 border border-white/5 text-card-foreground shadow overflow-auto h-fit break-inside-avoid mb-2">
                          <h3 className="text-base font-semibold leading-none tracking-tight mb-4">GitHub</h3>

                          {/* Sección superior: Info básica + Avatar al lado */}
                          <div className="flex flex-row gap-4 mb-6">
                            <div className="space-y-3 flex flex-col flex-1 text-sm">
                              {githubData.username && (
                                <div className="space-y-1.5">
                                  <p className="text-white/60 text-sm font-medium">{t.username}</p>
                                  <h3 className="font-semibold leading-none tracking-tight">
                                    <a href={githubData.profile_url} target="_blank" rel="noopener noreferrer"
                                      className="text-blue-400 hover:text-blue-300 transition-colors">
                                      @{githubData.username}
                                    </a>
                                  </h3>
                                </div>
                              )}

                              <div className="space-y-1.5">
                                <p className="text-white/60 text-sm font-medium">{t.fullName}</p>
                                <h3 className="font-semibold leading-none tracking-tight break-words">
                                  {githubData.name || t.null}
                                </h3>
                              </div>

                              <div className="space-y-1.5">
                                <p className="text-white/60 text-sm font-medium">{t.biography}</p>
                                <h3 className="font-semibold leading-none tracking-tight break-words text-sm">
                                  {githubData.bio || t.null}
                                </h3>
                              </div>

                              <div className="space-y-1.5">
                                <p className="text-white/60 text-sm font-medium">{t.location}</p>
                                <h3 className="font-semibold leading-none tracking-tight break-words">
                                  {githubData.location || t.null}
                                </h3>
                              </div>
                            </div>

                            {/* Avatar de GitHub al lado derecho */}
                            <div className="flex items-start justify-center flex-shrink-0">
                              {githubData.avatar_url ? (
                                <img
                                  src={githubData.avatar_url}
                                  alt="Avatar de GitHub"
                                  className="rounded-xl w-[180px] h-[180px] object-cover shadow-lg border-2 border-gray-700/50"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${githubData.username?.charAt(0) || 'G'}&background=333&color=fff&size=180`;
                                  }}
                                />
                              ) : (
                                <div className="rounded-xl w-[180px] h-[180px] bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center shadow-lg border-2 border-gray-700/50">
                                  <span className="text-white text-4xl font-bold">
                                    {githubData.username?.charAt(0).toUpperCase() || 'G'}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Separador que se extiende por todo el ancho */}
                          <div className="border-t border-gray-800 mb-6"></div>

                          {/* Sección inferior: Grid de 3 columnas que usa todo el ancho */}
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-6">
                            {/* Fila 1: Fecha, Horario y Tipo de cuenta */}
                            <div className="space-y-1.5">
                              <p className="text-white/60 text-sm font-medium">{t.creationDate}</p>
                              <h3 className="font-semibold leading-none tracking-tight text-sm">
                                {githubData.created_at ? githubData.created_at.split('T')[0] : t.null}
                              </h3>
                            </div>

                            <div className="space-y-1.5">
                              <p className="text-white/60 text-sm font-medium">{t.creationTime}</p>
                              <h3 className="font-semibold leading-none tracking-tight text-sm">
                                {githubData.created_at ? githubData.created_at.split('T')[1].replace('Z', '') : t.null}
                              </h3>
                            </div>

                            <div className="space-y-1.5">
                              <p className="text-white/60 text-sm font-medium">{t.accountType}</p>
                              <h3 className="font-semibold leading-none tracking-tight">{githubData.type || t.null}</h3>
                            </div>

                            {/* Fila 2: Empresa y Repositorios */}
                            <div className="space-y-1.5">
                              <p className="text-white/60 text-sm font-medium">{t.company}</p>
                              <h3 className="font-semibold leading-none tracking-tight break-words">
                                {githubData.company || t.null}
                              </h3>
                            </div>

                            <div className="space-y-1.5">
                              <p className="text-white/60 text-sm font-medium">{t.repositories}</p>
                              <h3 className="font-semibold leading-none tracking-tight">{githubData.public_repos || 0}</h3>
                            </div>

                            {/* Fila 3: Seguidores, Siguiendo y Gists */}
                            <div className="space-y-1.5">
                              <p className="text-white/60 text-sm font-medium">{t.followers}</p>
                              <h3 className="font-semibold leading-none tracking-tight">{githubData.followers || 0}</h3>
                            </div>

                            <div className="space-y-1.5">
                              <p className="text-white/60 text-sm font-medium">{t.following}</p>
                              <h3 className="font-semibold leading-none tracking-tight">{githubData.following || 0}</h3>
                            </div>

                            <div className="space-y-1.5">
                              <p className="text-white/60 text-sm font-medium">{t.gists}</p>
                              <h3 className="font-semibold leading-none tracking-tight">{githubData.public_gists || 0}</h3>
                            </div>

                            {/* Fila 4: ID */}
                            <div className="space-y-1.5">
                              <p className="text-white/60 text-sm font-medium">ID</p>
                              <h3 className="font-semibold leading-none tracking-tight">{githubData.id || t.null}</h3>
                            </div>
                          </div>
                        </div>
                      )
                    })}


                    {/* Mostrar información del perfil de Duolingo si está disponible */}
                    {results.filter(result => result.profileData && result.platform === 'Duolingo.com').map((result, index) => {
                      const duoData = result.profileData as any; // Type casting para propiedades específicas de Duolingo

                      // Verificar si es perfil completo o limitado
                      const esPerfilCompleto = duoData?.tipo === 'completo';

                      return (
                        <div key={`duolingo-profile-${index}`} className="rounded-xl p-4 bg-zinc-950/30 border border-white/5 text-card-foreground shadow overflow-auto h-fit break-inside-avoid mb-2">
                          <h3 className="text-lg font-semibold leading-none tracking-tight mb-6">
                            Duolingo.com {!esPerfilCompleto && <span className="text-sm text-yellow-400">{t.limitedInfo}</span>}
                          </h3>

                          {esPerfilCompleto ? (
                            // LAYOUT COMPLETO - 3 columnas + foto
                            <>
                              {/* Layout principal con foto arriba en móvil y lado derecho en desktop */}
                              <div className="flex flex-col lg:flex-row lg:gap-8">

                                {/* Columna izquierda - Datos básicos */}
                                <div className="space-y-4 flex-1 min-w-0">
                                  <h4 className="text-md font-medium text-white/80 mb-4">{t.personalInfo}</h4>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                                    {duoData?.usuario && (
                                      <div className="space-y-1.5">
                                        <p className="text-white/60 text-sm font-medium">{t.user}</p>
                                        <h3 className="font-semibold leading-none tracking-tight">
                                          {duoData.usuario}
                                        </h3>
                                      </div>
                                    )}

                                    {duoData?.nombre && (
                                      <div className="space-y-1.5">
                                        <p className="text-white/60 text-sm font-medium">{t.name}</p>
                                        <h3 className="font-semibold leading-none tracking-tight">
                                          {duoData.nombre}
                                        </h3>
                                      </div>
                                    )}

                                    {duoData?.ubicacion && (
                                      <div className="space-y-1.5">
                                        <p className="text-white/60 text-sm font-medium">{t.location}</p>
                                        <h3 className="font-semibold leading-none tracking-tight">
                                          {duoData.ubicacion}
                                        </h3>
                                      </div>
                                    )}

                                    {duoData?.fechaCreacion && (
                                      <div className="space-y-1.5">
                                        <p className="text-white/60 text-sm font-medium">{t.creationDate}</p>
                                        <h3 className="font-semibold leading-none tracking-tight">
                                          {duoData.fechaCreacion}
                                        </h3>
                                      </div>
                                    )}

                                    {duoData?.emailVerificado && (
                                      <div className="space-y-1.5">
                                        <p className="text-white/60 text-sm font-medium">{t.emailVerified}</p>
                                        <h3 className="font-semibold leading-none tracking-tight">
                                          {duoData.emailVerificado}
                                        </h3>
                                      </div>
                                    )}

                                    {duoData?.idCuenta && (
                                      <div className="space-y-1.5">
                                        <p className="text-white/60 text-sm font-medium">{t.accountId}</p>
                                        <h3 className="font-semibold leading-none tracking-tight">
                                          {duoData.idCuenta}
                                        </h3>
                                      </div>
                                    )}

                                  </div>
                                </div>

                                {/* Avatar de Duolingo */}
                                <div className="flex justify-center lg:justify-end mt-6 lg:mt-0">
                                  {duoData?.fotoPerfil && (
                                    <img
                                      src={duoData.fotoPerfil}
                                      alt="Avatar de Duolingo"
                                      className="rounded-2xl w-[180px] h-[180px] object-cover"
                                      onError={(e) => {
                                        (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${duoData?.nombre?.charAt(0) || 'D'}&background=58cc02&color=fff&size=180`;
                                      }}
                                    />
                                  )}
                                </div>
                              </div>

                              {/* Información adicional debajo */}
                              <div className="mt-8 pt-6 border-t border-gray-800">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                                  {/* Columna 1: Actividad */}
                                  <div className="space-y-4">
                                    <h4 className="text-md font-medium text-white/80">{t.activity}</h4>

                                    {duoData?.totalXp && (
                                      <div className="space-y-1.5">
                                        <p className="text-white/60 text-sm font-medium">Total XP</p>
                                        <h3 className="font-semibold leading-none tracking-tight">
                                          {duoData.totalXp} {t.points}
                                        </h3>
                                      </div>
                                    )}

                                    {duoData?.rachaActual !== undefined && (
                                      <div className="space-y-1.5">
                                        <p className="text-white/60 text-sm font-medium">{t.currentStreak}</p>
                                        <h3 className="font-semibold leading-none tracking-tight">
                                          {duoData.rachaActual} {t.days}
                                        </h3>
                                      </div>
                                    )}

                                    {duoData?.rachaMaxima && (
                                      <div className="space-y-1.5">
                                        <p className="text-white/60 text-sm font-medium">{t.maxStreak}</p>
                                        <h3 className="font-semibold leading-none tracking-tight">
                                          {duoData.rachaMaxima} {t.days}
                                        </h3>
                                      </div>
                                    )}

                                    {duoData?.metaXpDiaria && (
                                      <div className="space-y-1.5">
                                        <p className="text-white/60 text-sm font-medium">{t.dailyXpGoal}</p>
                                        <h3 className="font-semibold leading-none tracking-tight">
                                          {duoData.metaXpDiaria} {t.points}
                                        </h3>
                                      </div>
                                    )}
                                  </div>

                                  {/* Columna 2: Idiomas */}
                                  <div className="space-y-4">
                                    <h4 className="text-md font-medium text-white/80">{t.languages}</h4>

                                    {duoData?.idiomaNativo && (
                                      <div className="space-y-1.5">
                                        <p className="text-white/60 text-sm font-medium">{t.nativeLanguage}</p>
                                        <h3 className="font-semibold leading-none tracking-tight">
                                          {duoData.idiomaNativo.toUpperCase()}
                                        </h3>
                                      </div>
                                    )}

                                    {duoData?.idiomaAprendiendo && (
                                      <div className="space-y-1.5">
                                        <p className="text-white/60 text-sm font-medium">{t.learning}</p>
                                        <h3 className="font-semibold leading-none tracking-tight">
                                          {duoData.idiomaAprendiendo.toUpperCase()}
                                        </h3>
                                      </div>
                                    )}

                                    {duoData?.motivacion && (
                                      <div className="space-y-1.5">
                                        <p className="text-white/60 text-sm font-medium">{t.motivation}</p>
                                        <h3 className="font-semibold leading-none tracking-tight capitalize">
                                          {duoData.motivacion}
                                        </h3>
                                      </div>
                                    )}

                                    {duoData?.actividadReciente && (
                                      <div className="space-y-1.5">
                                        <p className="text-white/60 text-sm font-medium">{t.recentActivity}</p>
                                        <h3 className="font-semibold leading-none tracking-tight">
                                          {duoData.actividadReciente}
                                        </h3>
                                      </div>
                                    )}
                                  </div>

                                  {/* Columna 3: Cuentas vinculadas */}
                                  <div className="space-y-4">
                                    <h4 className="text-md font-medium text-white/80">{t.linkedAccounts}</h4>

                                    {duoData?.tieneGoogle && (
                                      <div className="space-y-1.5">
                                        <p className="text-white/60 text-sm font-medium">Google Account</p>
                                        <h3 className="font-semibold leading-none tracking-tight">
                                          {duoData.tieneGoogle}
                                        </h3>
                                      </div>
                                    )}

                                    {duoData?.tieneFacebook && (
                                      <div className="space-y-1.5">
                                        <p className="text-white/60 text-sm font-medium">Facebook Account</p>
                                        <h3 className="font-semibold leading-none tracking-tight">
                                          {duoData.tieneFacebook}
                                        </h3>
                                      </div>
                                    )}

                                    {duoData?.tieneTelefono && (
                                      <div className="space-y-1.5">
                                        <p className="text-white/60 text-sm font-medium">{t.hasPhone}</p>
                                        <h3 className="font-semibold leading-none tracking-tight">
                                          {duoData.tieneTelefono}
                                        </h3>
                                      </div>
                                    )}

                                    {duoData?.nivelSuscripcion && (
                                      <div className="space-y-1.5">
                                        <p className="text-white/60 text-sm font-medium">{t.subscription}</p>
                                        <h3 className="font-semibold leading-none tracking-tight">
                                          {duoData.nivelSuscripcion}
                                        </h3>
                                      </div>
                                    )}
                                  </div>

                                </div>
                              </div>
                            </>
                          ) : (
                            // LAYOUT LIMITADO - Solo información básica
                            <div className="flex flex-col lg:flex-row lg:gap-8">

                              {/* Información básica limitada */}
                              <div className="space-y-4 flex-1 min-w-0">
                                <h4 className="text-md font-medium text-white/80 mb-4">{t.personalInfo}</h4>
                                <div className="grid grid-cols-2 gap-4">

                                  {duoData?.usuario && duoData.usuario !== 'No disponible' && (
                                    <div className="space-y-1.5">
                                      <p className="text-white/60 text-sm font-medium">{t.user}</p>
                                      <h3 className="font-semibold leading-none tracking-tight">
                                        {duoData.usuario}
                                      </h3>
                                    </div>
                                  )}

                                  {duoData?.nombre && duoData.nombre !== 'No disponible' && (
                                    <div className="space-y-1.5">
                                      <p className="text-white/60 text-sm font-medium">{t.name}</p>
                                      <h3 className="font-semibold leading-none tracking-tight">
                                        {duoData.nombre}
                                      </h3>
                                    </div>
                                  )}

                                  {duoData?.racha && (
                                    <div className="space-y-1.5">
                                      <p className="text-white/60 text-sm font-medium">{t.streak}</p>
                                      <h3 className="font-semibold leading-none tracking-tight">
                                        {duoData.racha} {t.days}
                                      </h3>
                                    </div>
                                  )}

                                  {duoData?.tieneGoogle && (
                                    <div className="space-y-1.5">
                                      <p className="text-white/60 text-sm font-medium">Google Account</p>
                                      <h3 className="font-semibold leading-none tracking-tight">
                                        {duoData.tieneGoogle}
                                      </h3>
                                    </div>
                                  )}

                                  {duoData?.tieneFacebook && (
                                    <div className="space-y-1.5">
                                      <p className="text-white/60 text-sm font-medium">Facebook Account</p>
                                      <h3 className="font-semibold leading-none tracking-tight">
                                        {duoData.tieneFacebook}
                                      </h3>
                                    </div>
                                  )}

                                  {duoData?.tieneActividad && (
                                    <div className="space-y-1.5">
                                      <p className="text-white/60 text-sm font-medium">{t.recentActivity}</p>
                                      <h3 className="font-semibold leading-none tracking-tight">
                                        {duoData.tieneActividad}
                                      </h3>
                                    </div>
                                  )}

                                </div>
                              </div>

                              {/* Avatar */}
                              <div className="flex justify-center lg:justify-end mt-6 lg:mt-0">
                                {duoData?.fotoPerfil ? (
                                  <img
                                    src={duoData.fotoPerfil}
                                    alt="Avatar de Duolingo"
                                    className="rounded-2xl w-[180px] h-[180px] object-cover"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=D&background=58cc02&color=fff&size=180`;
                                    }}
                                  />
                                ) : (
                                  <div className="rounded-2xl w-[180px] h-[180px] bg-gray-700 flex items-center justify-center">
                                    <span className="text-gray-400 text-sm">Sin avatar</span>
                                  </div>
                                )}
                              </div>

                            </div>
                          )}
                        </div>
                      );
                    })}

                    {/* Mostrar información del perfil de Dropbox si está disponible */}
                    {results.filter(result => result.profileData && result.platform === 'Dropbox.com').map((result, index) => {
                      const dropboxData = result.profileData as any;

                      return (
                        <div key={`dropbox-profile-${index}`} className="rounded-xl p-4 bg-zinc-950/30 border border-white/5 text-card-foreground shadow flex flex-row gap-4 overflow-auto h-fit break-inside-avoid mb-2">
                          <div className="space-y-3 flex-1">
                            <h3 className="text-base font-semibold leading-none tracking-tight">Dropbox.com</h3>
                            <div className="space-y-3 flex flex-col text-sm">

                              {dropboxData?.name && (
                                <div className="space-y-1.5">
                                  <p className="text-white/60 text-sm font-medium">{t.name}</p>
                                  <div>
                                    <h3 className="font-semibold leading-none tracking-tight overflow-hidden max-w-60">
                                      {dropboxData.name}
                                    </h3>
                                  </div>
                                </div>
                              )}

                              <div className="space-y-1.5">
                                <p className="text-white/60 text-sm font-medium">{t.accountType}</p>
                                <div>
                                  <h3 className="font-semibold leading-none tracking-tight overflow-hidden max-w-60">
                                    {dropboxData?.dbxTeamId && dropboxData.dbxTeamId !== '' ? 'Business' : 'Personal'}
                                  </h3>
                                </div>
                              </div>

                              {dropboxData?.dbxAccountId && (
                                <div className="space-y-1.5">
                                  <p className="text-white/60 text-sm font-medium">{t.accountId}</p>
                                  <div>
                                    <h3 className="font-mono text-sm leading-none tracking-tight overflow-hidden max-w-60 text-blue-300">
                                      {dropboxData.dbxAccountId}
                                    </h3>
                                  </div>
                                </div>
                              )}

                              {dropboxData?.sortKey && (
                                <div className="space-y-1.5">
                                  <p className="text-white/60 text-sm font-medium">{t.sortingKey}</p>
                                  <div>
                                    <h3 className="font-mono text-sm leading-none tracking-tight overflow-hidden max-w-60 text-gray-300">
                                      {dropboxData.sortKey}
                                    </h3>
                                  </div>
                                </div>
                              )}

                            </div>
                          </div>

                          {/* Avatar al lado derecho */}
                          <div className="flex items-start justify-center flex-shrink-0">
                            {dropboxData?.photoUrl && (
                              <img
                                src={dropboxData.photoUrl}
                                alt="Avatar de Dropbox"
                                className="rounded-xl w-[180px] h-[180px] object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${dropboxData?.name?.charAt(0) || 'D'}&background=0061ff&color=fff&size=180`;
                                }}
                              />
                            )}
                          </div>
                        </div>
                      );
                    })}

                    {/* Mostrar información del perfil de Flickr si está disponible */}
                    {results.filter(result => result.profileData && result.platform === 'Flickr.com').map((result, index) => {
                      const flickrData = result.profileData as any;

                      return (
                        <div key={`flickr-profile-${index}`} className="rounded-xl bg-zinc-950/30 border border-white/5 text-card-foreground shadow overflow-hidden break-inside-avoid mb-2">
                          {/* Banner del perfil */}
                          {flickrData?.bannerUrl && (
                            <div className="w-full h-32 bg-gradient-to-r from-blue-500/20 to-purple-500/20 relative overflow-hidden">
                              <img
                                src={flickrData.bannerUrl}
                                alt="Banner de Flickr"
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-black/20"></div>
                            </div>
                          )}

                          <div className="p-4 flex flex-row gap-4 overflow-auto">
                            <div className="space-y-3 flex-1">
                              <h3 className="text-base font-semibold leading-none tracking-tight">Flickr.com</h3>
                              <div className="space-y-3 flex flex-col text-sm">

                                {flickrData?.realname && (
                                  <div className="space-y-1.5">
                                    <p className="text-white/60 text-sm font-medium">Nombre</p>
                                    <div>
                                      <h3 className="font-semibold leading-none tracking-tight overflow-hidden max-w-60">
                                        {flickrData.realname}
                                      </h3>
                                    </div>
                                  </div>
                                )}

                                {flickrData?.username && (
                                  <div className="space-y-1.5">
                                    <p className="text-white/60 text-sm font-medium">Username</p>
                                    <div>
                                      <h3 className="font-semibold leading-none tracking-tight overflow-hidden max-w-60">
                                        {flickrData.username}
                                      </h3>
                                    </div>
                                  </div>
                                )}

                                <div className="space-y-1.5">
                                  <p className="text-white/60 text-sm font-medium">Tipo de Cuenta</p>
                                  <div>
                                    <h3 className="font-semibold leading-none tracking-tight overflow-hidden max-w-60">
                                      {flickrData?.isPro ? 'Pro' : 'Free'}
                                    </h3>
                                  </div>
                                </div>

                                {flickrData?.nsid && (
                                  <div className="flex gap-6">
                                    <div className="space-y-1.5">
                                      <p className="text-white/60 text-sm font-medium">NSID</p>
                                      <div>
                                        <h3 className="font-mono text-sm leading-none tracking-tight overflow-hidden max-w-60 text-pink-300">
                                          {flickrData.nsid}
                                        </h3>
                                      </div>
                                    </div>
                                    <div className="space-y-1.5">
                                      <p className="text-white/60 text-sm font-medium">Cuenta</p>
                                      <div>
                                        <a
                                          href={`https://flickr.com/people/${flickrData.nsid}/`}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-sm leading-none tracking-tight text-blue-400 hover:text-blue-300 underline"
                                        >
                                          Enlace del perfil
                                        </a>
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {flickrData?.dateCreate && (
                                  <div className="flex gap-6">
                                    <div className="space-y-1.5">
                                      <p className="text-white/60 text-sm font-medium">Fecha de Creación</p>
                                      <div>
                                        <h3 className="font-mono text-sm leading-none tracking-tight overflow-hidden max-w-60 text-gray-300">
                                          {flickrData.dateCreate.split(' ')[0]}
                                        </h3>
                                      </div>
                                    </div>
                                    <div className="space-y-1.5">
                                      <p className="text-white/60 text-sm font-medium">Horario de Creación</p>
                                      <div>
                                        <h3 className="font-mono text-sm leading-none tracking-tight overflow-hidden max-w-60 text-gray-300">
                                          {flickrData.dateCreate.split(' ')[1]}
                                        </h3>
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {flickrData?.location && (
                                  <div className="space-y-1.5">
                                    <p className="text-white/60 text-sm font-medium">Ubicación</p>
                                    <div>
                                      <h3 className="font-semibold leading-none tracking-tight overflow-hidden max-w-60">
                                        {flickrData.location}
                                      </h3>
                                    </div>
                                  </div>
                                )}

                              </div>
                            </div>

                            {/* Avatar al lado derecho */}
                            <div className="flex items-start justify-center flex-shrink-0">
                              {flickrData?.photoUrl ? (
                                <img
                                  src={flickrData.photoUrl}
                                  alt="Avatar de Flickr"
                                  className="rounded-xl w-[180px] h-[180px] object-cover"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${flickrData?.username?.charAt(0) || 'F'}&background=ff0084&color=fff&size=180`;
                                  }}
                                />
                              ) : (
                                <div className="rounded-xl w-[180px] h-[180px] bg-gradient-to-br from-pink-600 to-blue-500 flex items-center justify-center">
                                  <span className="text-white text-4xl font-bold">
                                    {flickrData?.username?.charAt(0) || 'F'}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {/* Mostrar información del perfil de Microsoft Teams si está disponible */}
                    {results.filter(result => result.profileData && result.platform === 'teams.microsoft.com').map((result, index) => {
                      const teamsData = result.profileData as any;

                      return (
                        <div key={`teams-profile-${index}`} className="rounded-xl p-4 bg-zinc-950/30 border border-white/5 text-card-foreground shadow overflow-auto h-fit break-inside-avoid mb-2">
                          <div className="space-y-6">
                            <h3 className="text-lg font-semibold leading-none tracking-tight">Microsoft Teams</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                              {teamsData?.displayName && (
                                <div className="space-y-1.5">
                                  <p className="text-white/60 text-sm font-medium">Nombre Completo</p>
                                  <h3 className="font-semibold leading-none tracking-tight break-words">
                                    {teamsData.displayName}
                                  </h3>
                                </div>
                              )}

                              {teamsData?.userPrincipalName && (
                                <div className="space-y-1.5">
                                  <p className="text-white/60 text-sm font-medium">Username</p>
                                  <h3 className="font-semibold leading-none tracking-tight break-words">
                                    {teamsData.userPrincipalName}
                                  </h3>
                                </div>
                              )}

                              {teamsData?.givenName && (
                                <div className="space-y-1.5">
                                  <p className="text-white/60 text-sm font-medium">Nombre</p>
                                  <h3 className="font-semibold leading-none tracking-tight break-words">
                                    {teamsData.givenName}
                                  </h3>
                                </div>
                              )}

                              {teamsData?.surname && (
                                <div className="space-y-1.5">
                                  <p className="text-white/60 text-sm font-medium">Apellido</p>
                                  <h3 className="font-semibold leading-none tracking-tight break-words">
                                    {teamsData.surname}
                                  </h3>
                                </div>
                              )}

                              {teamsData?.cid && (
                                <div className="space-y-1.5">
                                  <p className="text-white/60 text-sm font-medium">CID</p>
                                  <h3 className="font-mono text-sm leading-none tracking-tight break-all text-blue-300">
                                    {teamsData.cid}
                                  </h3>
                                </div>
                              )}

                              {teamsData?.objectId && (
                                <div className="space-y-1.5">
                                  <p className="text-white/60 text-sm font-medium">Object ID</p>
                                  <h3 className="font-mono text-xs leading-none tracking-tight break-all text-gray-300">
                                    {teamsData.objectId}
                                  </h3>
                                </div>
                              )}

                              {teamsData?.type && (
                                <div className="space-y-1.5">
                                  <p className="text-white/60 text-sm font-medium">Tipo de Usuario</p>
                                  <h3 className="font-semibold leading-none tracking-tight break-words">
                                    {teamsData.type}
                                  </h3>
                                </div>
                              )}

                              {teamsData?.mri && (
                                <div className="space-y-1.5">
                                  <p className="text-white/60 text-sm font-medium">MRI</p>
                                  <h3 className="font-mono text-sm leading-none tracking-tight break-all text-gray-300">
                                    {teamsData.mri}
                                  </h3>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {/* Mostrar información del perfil de Proton si está disponible */}
                    {results.filter(result => result.profileData && result.platform === 'proton.me').map((result, index) => {
                      const protonData = result.profileData as any;

                      return (
                        <div key={`proton-profile-${index}`} className="rounded-xl p-4 bg-zinc-950/30 border border-white/5 text-card-foreground shadow overflow-auto h-fit max-w-5xl mx-auto break-inside-avoid mb-2">
                          <h3 className="text-lg font-semibold leading-none tracking-tight mb-6">proton.me</h3>

                          {/* Caso 1: Solo usa ProtonVPN (no ProtonMail) */}
                          {protonData?.serviceType && !protonData?.hasProtonMail && (
                            <div className="space-y-4 flex flex-col">
                              <div className="space-y-1.5">
                                <p className="text-white/60 text-sm font-medium">Tipo de Servicio</p>
                                <h3 className="font-semibold leading-none tracking-tight text-yellow-400">
                                  {protonData.serviceType}
                                </h3>
                              </div>
                              <div className="space-y-1.5">
                                <p className="text-white/60 text-sm font-medium">ProtonMail</p>
                                <h3 className="font-semibold leading-none tracking-tight text-gray-400">
                                  No usa ProtonMail
                                </h3>
                              </div>
                            </div>
                          )}

                          {/* Caso 2: Usa ProtonMail (mostrar datos completos) */}
                          {(!protonData?.serviceType || protonData?.hasProtonMail) && (
                            <div className="space-y-6 flex flex-col">
                              {/* Fila 1: Username y Email de Protonmail lado a lado */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {protonData?.username && (
                                  <div className="space-y-1.5">
                                    <p className="text-white/60 text-sm font-medium">{t.username}</p>
                                    <h3 className="font-semibold leading-none tracking-tight">
                                      {protonData.username}
                                    </h3>
                                  </div>
                                )}

                                {protonData?.email && (
                                  <div className="space-y-1.5">
                                    <p className="text-white/60 text-sm font-medium">{t.protonEmail}</p>
                                    <h3 className="font-semibold leading-none tracking-tight break-words">
                                      {protonData.email}
                                    </h3>
                                  </div>
                                )}
                              </div>

                              {/* Fila 2: Tipo de cuenta y Catch-All lado a lado */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1.5">
                                  <p className="text-white/60 text-sm font-medium">{t.accountTypeProton}</p>
                                  <h3 className="font-semibold leading-none tracking-tight">
                                    {protonData?.isProtonDomain ? 'Dominio de Proton' : 'Email Externo Vinculado'}
                                  </h3>
                                </div>

                                <div className="space-y-1.5">
                                  <p className="text-white/60 text-sm font-medium">{t.catchAll}</p>
                                  <h3 className="font-semibold leading-none tracking-tight">
                                    {protonData?.catchAllEmail ? (
                                      <span className="text-yellow-400">{language === 'es' ? 'Detectado' : 'Detected'}</span>
                                    ) : (
                                      <span className="text-gray-400">{t.notDetected}</span>
                                    )}
                                  </h3>
                                </div>
                              </div>

                              {/* Fila 3: Email principal solo si hay catch-all */}
                              {protonData?.catchAllEmail && (
                                <div className="space-y-1.5">
                                  <p className="text-white/60 text-sm font-medium">Email Principal (Main)</p>
                                  <h3 className="font-semibold leading-none tracking-tight break-words text-yellow-400">
                                    {protonData.catchAllEmail}
                                  </h3>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Separador y Grid PGP - solo para cuentas con ProtonMail */}
                          {(!protonData?.serviceType || protonData?.hasProtonMail) && (
                            <>
                              {/* Separador */}
                              <div className="border-t border-gray-800 my-6"></div>

                              {/* Grid de información PGP */}
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-6">
                                <div className="space-y-1.5">
                                  <p className="text-white/60 text-sm font-medium">{t.creationDate}</p>
                                  <h3 className="font-semibold leading-none tracking-tight text-sm">
                                    {protonData?.creationDate || 'nulo'}
                                  </h3>
                                </div>

                                <div className="space-y-1.5">
                                  <p className="text-white/60 text-sm font-medium">{t.creationTime}</p>
                                  <h3 className="font-semibold leading-none tracking-tight text-sm">
                                    {protonData?.creationTime || 'nulo'}
                                  </h3>
                                </div>

                                <div className="space-y-1.5">
                                  <p className="text-white/60 text-sm font-medium">{t.encryption}</p>
                                  <h3 className="font-semibold leading-none tracking-tight">
                                    {protonData?.encryptionStandard || 'nulo'}
                                  </h3>
                                </div>

                                <div className="space-y-1.5 md:col-span-2 lg:col-span-3">
                                  <p className="text-white/60 text-sm font-medium">{t.pgpFingerprint}</p>
                                  <h3 className="font-semibold leading-none tracking-tight text-sm break-all font-mono">
                                    {protonData?.pgpFingerprint || 'nulo'}
                                  </h3>
                                </div>

                                <div className="space-y-1.5 md:col-span-2 lg:col-span-3">
                                  <p className="text-white/60 text-sm font-medium">Clave Pública PGP</p>
                                  <div className="bg-gray-950 rounded-lg p-4 max-h-40 overflow-y-auto">
                                    <pre className="text-xs font-mono text-gray-300 break-all whitespace-pre-wrap">
                                      {protonData?.publicKey || 'nulo'}
                                    </pre>
                                  </div>
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      );
                    })}

                    {/* Mostrar información del perfil de Trello si está disponible */}
                    {results.filter(result => result.profileData && result.platform === 'Trello.com').map((result, index) => {
                      const trelloData = result.profileData as any;

                      return (
                        <div key={`trello-profile-${index}`} className="rounded-xl p-4 bg-zinc-950/30 border border-white/5 text-card-foreground shadow overflow-auto h-fit break-inside-avoid mb-2">
                          <div className="flex flex-row gap-4">
                            <div className="space-y-3 flex-1">
                              <h3 className="text-base font-semibold leading-none tracking-tight">Trello.com</h3>

                              <div className="space-y-3 flex flex-col text-sm">
                                {trelloData?.id && (
                                  <div className="space-y-1.5">
                                    <p className="text-white/60 text-sm font-medium">{t.trelloUserId}</p>
                                    <h3 className="font-semibold leading-none tracking-tight overflow-hidden max-w-60">
                                      {trelloData.id}
                                    </h3>
                                  </div>
                                )}

                                {trelloData?.username && (
                                  <div className="space-y-1.5">
                                    <p className="text-white/60 text-sm font-medium">{t.username}</p>
                                    <h3 className="font-semibold leading-none tracking-tight overflow-hidden max-w-60">
                                      {trelloData.username}
                                    </h3>
                                  </div>
                                )}

                                {trelloData?.fullName && (
                                  <div className="space-y-1.5">
                                    <p className="text-white/60 text-sm font-medium">{t.fullName}</p>
                                    <h3 className="font-semibold leading-none tracking-tight overflow-hidden max-w-60">
                                      {trelloData.fullName}
                                    </h3>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Avatar al lado derecho */}
                            <div className="flex items-start justify-center flex-shrink-0">
                              {trelloData?.avatarUrl ? (
                                <img
                                  src={`${trelloData.avatarUrl}/original.png`}
                                  alt="Avatar de Trello"
                                  className="rounded-xl w-[180px] h-[180px] object-cover"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${trelloData?.initials || trelloData?.fullName?.charAt(0) || 'T'}&background=0079bf&color=fff&size=180`;
                                  }}
                                />
                              ) : (
                                <div className="rounded-xl w-[180px] h-[180px] bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center">
                                  <span className="text-white text-4xl font-bold">
                                    {trelloData?.initials || trelloData?.fullName?.charAt(0) || 'T'}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Información adicional debajo */}
                          <div className="mt-8 pt-6 border-t border-gray-800">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                              {/* Columna 1 */}
                              <div className="space-y-4">
                                {trelloData?.dateLastActive && (
                                  <div className="space-y-1.5">
                                    <p className="text-white/60 text-sm font-medium">{t.lastActivity}</p>
                                    <h3 className="font-semibold leading-none tracking-tight">
                                      {new Date(trelloData.dateLastActive).toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US', {
                                        year: 'numeric',
                                        month: '2-digit',
                                        day: '2-digit',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      })}
                                    </h3>
                                  </div>
                                )}

                                {trelloData?.active !== undefined && (
                                  <div className="space-y-1.5">
                                    <p className="text-white/60 text-sm font-medium">{t.accountStatus}</p>
                                    <h3 className="font-semibold leading-none tracking-tight">
                                      {trelloData.active ? t.active : (language === 'es' ? 'Inactivo' : 'Inactive')}
                                    </h3>
                                  </div>
                                )}
                              </div>

                              {/* Columna 2 */}
                              <div className="space-y-4">
                                {trelloData?.memberType && (
                                  <div className="space-y-1.5">
                                    <p className="text-white/60 text-sm font-medium">{t.memberType}</p>
                                    <h3 className="font-semibold leading-none tracking-tight">
                                      {trelloData.memberType}
                                    </h3>
                                  </div>
                                )}

                                {trelloData?.activityBlocked !== undefined && (
                                  <div className="space-y-1.5">
                                    <p className="text-white/60 text-sm font-medium">{t.activity}</p>
                                    <h3 className="font-semibold leading-none tracking-tight">
                                      {trelloData.activityBlocked ? (language === 'es' ? 'Bloqueada' : 'Blocked') : 'Normal'}
                                    </h3>
                                  </div>
                                )}
                              </div>

                              {/* Columna 3 */}
                              <div className="space-y-4">
                                {trelloData?.confirmed !== undefined && (
                                  <div className="space-y-1.5">
                                    <p className="text-white/60 text-sm font-medium">{t.emailConfirmed}</p>
                                    <h3 className="font-semibold leading-none tracking-tight">
                                      {trelloData.confirmed ? t.yes : t.no}
                                    </h3>
                                  </div>
                                )}

                                {trelloData?.nonPublicAvailable !== undefined && (
                                  <div className="space-y-1.5">
                                    <p className="text-white/60 text-sm font-medium">{t.publicProfile}</p>
                                    <h3 className="font-semibold leading-none tracking-tight">
                                      {trelloData.nonPublicAvailable ? t.available : (language === 'es' ? 'No disponible' : 'Not available')}
                                    </h3>
                                  </div>
                                )}
                              </div>

                              {/* Segunda fila de datos */}
                              <div className="md:col-span-2 lg:col-span-3">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                                  <div className="space-y-4">
                                    {trelloData?.similarity !== undefined && (
                                      <div className="space-y-1.5">
                                        <p className="text-white/60 text-sm font-medium">{t.searchSimilarity}</p>
                                        <h3 className="font-semibold leading-none tracking-tight">
                                          {(trelloData.similarity * 100).toFixed(1)}%
                                        </h3>
                                      </div>
                                    )}
                                  </div>

                                  <div className="space-y-4">
                                    {trelloData?.initials && (
                                      <div className="space-y-1.5">
                                        <p className="text-white/60 text-sm font-medium">{t.initials}</p>
                                        <h3 className="font-semibold leading-none tracking-tight">
                                          {trelloData.initials}
                                        </h3>
                                      </div>
                                    )}
                                  </div>

                                  <div className="space-y-4">
                                    <div className="space-y-1.5">
                                      <p className="text-white/60 text-sm font-medium">{t.block}</p>
                                      <h3 className="font-semibold leading-none tracking-tight">
                                        {trelloData?.activityBlocked ? t.yes : t.no}
                                      </h3>
                                    </div>
                                  </div>
                                </div>


                                {/* Nueva fila con el enlace del perfil */}
                                <div className="mt-6 pt-4 border-t border-gray-800">
                                  {trelloData?.username && (
                                    <div className="space-y-1.5">
                                      <p className="text-white/60 text-sm font-medium">{t.profileUrl}:</p>
                                      <a
                                        href={`https://trello.com/u/${trelloData.username}/activity`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="font-semibold leading-none tracking-tight text-blue-400 hover:text-blue-300 transition-colors underline"
                                      >
                                        https://trello.com/u/{trelloData.username}/activity
                                      </a>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {/* Mostrar información de Hudson Rock si está disponible */}
                    {results.filter(result => result.profileData && result.platform === 'HudsonRock.com').map((result, index) => {
                      const hudsonData = result.profileData as any;

                      return (
                        <div key={`hudsonrock-${index}`} className="rounded-xl p-4 bg-zinc-950/30 border border-white/5 shadow overflow-auto h-fit break-inside-avoid mb-2 text-white">
                          <div className="space-y-4">
                            <h3 className="text-base font-semibold leading-none tracking-tight mb-4">Hudson Rock - Infostealers</h3>

                            {/* Resumen General */}
                            <div className="bg-black/20 rounded-lg p-4 border border-white/5 text-white">
                              <h4 className="text-md font-semibold text-white mb-3">Resumen del Compromiso</h4>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                <div className="space-y-1">
                                  <p className="text-white/50 font-medium">Computadoras Infectadas</p>
                                  <p className="text-2xl font-bold text-white">{hudsonData?.stealers?.length || 0}</p>
                                </div>
                                <div className="space-y-1">
                                  <p className="text-white/50 font-medium">Servicios Corporativos</p>
                                  <p className="text-2xl font-bold text-white">{hudsonData?.total_corporate_services || 0}</p>
                                </div>
                                <div className="space-y-1">
                                  <p className="text-white/50 font-medium">Servicios Personales</p>
                                  <p className="text-2xl font-bold text-white">{hudsonData?.total_user_services || 0}</p>
                                </div>
                              </div>
                            </div>

                            {/* Detalles de cada Stealer */}
                            {Array.isArray(hudsonData?.stealers) && hudsonData.stealers.map((stealer: any, stealerIndex: number) => (
                              <div key={stealerIndex} className="bg-black/20 rounded-lg p-4 border border-white/5 text-white">
                                <h4 className="text-md font-semibold text-white mb-3">
                                  Computadora #{stealerIndex + 1}
                                </h4>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                  {/* Información Básica */}
                                  <div className="space-y-3">
                                    <div>
                                      <p className="text-white/50 font-medium mb-1">Nombre del Equipo</p>
                                      <p className="font-semibold text-white">{stealer.computer_name || 'Desconocido'}</p>
                                    </div>

                                    <div>
                                      <p className="text-white/50 font-medium mb-1">Sistema Operativo</p>
                                      <p className="font-semibold text-white">{stealer.operating_system || 'Desconocido'}</p>
                                    </div>

                                    <div>
                                      <p className="text-white/50 font-medium mb-1">Fecha de Compromiso</p>
                                      <p className="font-semibold text-white">
                                        {stealer.date_compromised ? new Date(stealer.date_compromised).toLocaleDateString('es-ES', {
                                          year: 'numeric',
                                          month: 'long',
                                          day: 'numeric',
                                          hour: '2-digit',
                                          minute: '2-digit'
                                        }) : 'Desconocido'}
                                      </p>
                                    </div>

                                    <div>
                                      <p className="text-white/50 font-medium mb-1">Dirección IP</p>
                                      <p className="font-mono text-sm text-white">{stealer.ip || 'Desconocido'}</p>
                                    </div>
                                  </div>

                                  {/* Información Técnica */}
                                  <div className="space-y-3">
                                    <div>
                                      <p className="text-white/50 font-medium mb-1">Ruta del Malware</p>
                                      <p className="font-mono text-xs text-white break-all bg-black/20 p-2 rounded">
                                        {stealer.malware_path || 'Desconocido'}
                                      </p>
                                    </div>

                                    {Array.isArray(stealer.antiviruses) && stealer.antiviruses.length > 0 && (
                                      <div>
                                        <p className="text-white/50 font-medium mb-1">Antivirus Instalados</p>
                                        <div className="flex flex-wrap gap-2">
                                          {stealer.antiviruses.map((av: string, avIndex: number) => (
                                            <span key={avIndex} className="bg-black/20 text-white/80 px-2 py-1 rounded text-xs font-semibold border border-white/5">
                                              {av}
                                            </span>
                                          ))}
                                        </div>
                                      </div>
                                    )}

                                    <div>
                                      <p className="text-white/50 font-medium mb-1">Servicios Comprometidos</p>
                                      <div className="grid grid-cols-2 gap-2">
                                        <div className="bg-black/20 px-3 py-2 rounded border border-white/5">
                                          <p className="text-xs text-white/50">Corporativos</p>
                                          <p className="text-lg font-bold text-white">{stealer.total_corporate_services || 0}</p>
                                        </div>
                                        <div className="bg-black/20 px-3 py-2 rounded border border-white/5">
                                          <p className="text-xs text-white/50">Personales</p>
                                          <p className="text-lg font-bold text-white">{stealer.total_user_services || 0}</p>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Contraseñas y Logins Comprometidos */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                  {Array.isArray(stealer.top_passwords) && stealer.top_passwords.length > 0 && (
                                    <div className="bg-black/20 rounded p-3 border border-white/5">
                                      <p className="text-white/60 font-medium mb-2">
                                        Top Contraseñas Comprometidas
                                      </p>
                                      <div className="space-y-1">
                                        {stealer.top_passwords.slice(0, 5).map((pwd: string, pwdIndex: number) => (
                                          <p key={pwdIndex} className="font-mono text-xs text-white bg-black/20 px-2 py-1 rounded">
                                            {pwd}
                                          </p>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  {Array.isArray(stealer.top_logins) && stealer.top_logins.length > 0 && (
                                    <div className="bg-black/20 rounded p-3 border border-white/5">
                                      <p className="text-white/60 font-medium mb-2">
                                        Top Logins Comprometidos
                                      </p>
                                      <div className="space-y-1">
                                        {stealer.top_logins.slice(0, 5).map((login: string, loginIndex: number) => (
                                          <p key={loginIndex} className="font-mono text-xs text-white bg-black/20 px-2 py-1 rounded break-all">
                                            {login}
                                          </p>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}

                  </div>
                </>
              )}
            </div>
          </div>

          {/* Have I Been Pwned - Brechas de Datos */}
          <div className="w-full max-w-6xl mx-auto px-8 mt-8">
            <div className="w-full">
              {breachesData.length > 0 && (
                <>
                  <h2 className="text-2xl font-bold text-white mb-6">{t.breachesTitle}</h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-8">
                    {breachesData.map((breach: any, index: number) => {
                      // Obtener favicon de Google
                      const faviconUrl = breach.domain
                        ? `https://www.google.com/s2/favicons?domain=${breach.domain}&sz=64`
                        : 'https://xposedornot.com/static/logos/combolist.png'

                      return (
                        <div key={`breach-${index}`} className="rounded-xl p-4 bg-zinc-950/30 border border-white/5 text-card-foreground shadow overflow-auto">
                          <div className="flex items-start gap-3 mb-3">
                            <img
                              src={faviconUrl}
                              alt={breach.breach}
                              className="w-10 h-10 rounded flex-shrink-0"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://xposedornot.com/static/logos/combolist.png'
                              }}
                            />
                            <div className="flex-1 min-w-0">
                              <h3 className="text-base font-semibold text-white mb-1 truncate">{breach.breach}</h3>
                              {breach.domain && (
                                <p className="text-sm text-white/60 truncate">{breach.domain}</p>
                              )}
                            </div>
                          </div>

                          <div className="space-y-3 text-sm">
                            {/* Estadísticas */}
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <p className="text-white/50 text-xs mb-0.5">{t.dateLabel}</p>
                                <p className="text-white text-sm font-medium">{breach.xposed_date}</p>
                              </div>
                              <div>
                                <p className="text-white/50 text-xs mb-0.5">{t.recordsLabel}</p>
                                <p className="text-white text-sm font-medium">{breach.xposed_records?.toLocaleString() || 'N/A'}</p>
                              </div>
                            </div>

                            {/* Industria y riesgo */}
                            <div className="grid grid-cols-2 gap-2">
                              {breach.industry && (
                                <div>
                                  <p className="text-white/50 text-xs mb-0.5">{t.industryLabel}</p>
                                  <p className="text-white text-xs">{breach.industry}</p>
                                </div>
                              )}
                              {breach.password_risk && (
                                <div>
                                  <p className="text-white/50 text-xs mb-0.5">{t.riskLabel}</p>
                                  <p className="text-white text-xs">
                                    {breach.password_risk === 'plaintext' ? t.plaintext :
                                      breach.password_risk === 'hardtocrack' ? t.encrypted :
                                        t.unknown}
                                  </p>
                                </div>
                              )}
                            </div>

                            {/* Datos expuestos */}
                            {breach.xposed_data && (
                              <div className="pt-2 border-t border-gray-800">
                                <p className="text-white/50 text-xs mb-2">{t.exposedDataLabel}</p>
                                <div className="flex flex-wrap gap-1">
                                  {breach.xposed_data.split(';').map((data: string, i: number) => (
                                    <span key={i} className="bg-gray-800/70 text-white/80 px-2 py-0.5 rounded text-xs">
                                      {data.trim()}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Verificador de cuentas - Contenedor más ancho */}
          {(results.length > 0 || isChecking) && (
            <div className="w-full max-w-7xl mx-auto px-8 mt-8">
              <div className="w-full">
                <h2 className="text-2xl font-bold text-white mb-6">{t.accountChecker}</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 mb-8">
                  {results.map((result, index) => {
                    // Extraer el dominio de la plataforma
                    const getDomainFromPlatform = (platformName: string) => {
                      return platformName.toLowerCase().replace(' ', '');
                    }

                    // Obtener la URL del favicon
                    const getFaviconUrl = (platformName: string) => {
                      // Casos especiales para favicons que no se muestran bien con Google
                      if (platformName === 'proton.me') {
                        return 'https://proton.me/favicons/apple-touch-icon.png';
                      }

                      const domain = getDomainFromPlatform(platformName);
                      // Usar tamaño máximo y formato moderno para mejor calidad
                      return `https://www.google.com/s2/favicons?domain=${domain}&sz=128&type=png`;
                    }

                    // Obtener el color del borde según el status
                    const getIconBorderColor = () => {
                      switch (result.status) {
                        case 'registered':
                        case 'no_password':
                          return 'border-green-400';
                        case 'not_registered':
                          return 'border-red-400';
                        case 'error':
                          return 'border-gray-400';
                        default:
                          return 'border-gray-400';
                      }
                    }

                    const getStatusColor = () => {
                      switch (result.status) {
                        case 'registered':
                        case 'no_password':
                          return 'border-green-900/50 bg-green-950/30'
                        case 'not_registered':
                          return 'border-red-900/50 bg-red-950/30'
                        case 'error':
                          return 'border-zinc-800 bg-zinc-950/50'
                        default:
                          return 'border-zinc-800 bg-zinc-950/50'
                      }
                    }

                    return (
                      <div
                        key={index}
                        className={`border rounded-xl p-4 transition-all duration-300 break-inside-avoid mb-2 ${getStatusColor()}`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-4">
                            <img
                              src={getFaviconUrl(result.platform)}
                              alt={`${result.platform} favicon`}
                              width="48"
                              height="48"
                              onError={(e) => {
                                // Si la imagen falla, mostrar una alternativa o un placeholder
                                (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${result.platform.charAt(0)}&background=252535&color=fff&size=48`;
                              }}
                            />
                            <div>
                              <h3 className="font-semibold text-white text-lg">
                                {result.platform}
                              </h3>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal de verificación manual de Joomla */}
      {showJoomlaModal && !skipCaptchaModules && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900/90 backdrop-blur-lg border border-gray-600/30 rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-8 border-b border-gray-600/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-gray-600 to-gray-700 rounded-2xl flex items-center justify-center shadow-lg">
                    <Code className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Verificación de Joomla.org</h2>
                    <p className="text-white/70">Se requiere resolución manual de captcha</p>
                  </div>
                </div>
                <button onClick={() => setShowJoomlaModal(false)} className="text-white/60 hover:text-white transition-colors">
                  <XCircle className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="p-8 max-h-[70vh] overflow-y-auto">
              {/* Contenido aquí */}
            </div>

            <div className="p-6 border-t border-gray-600/30 flex justify-end gap-3">
              <button
                onClick={() => setShowJoomlaModal(false)}
                className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
