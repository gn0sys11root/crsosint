/**
 * API de Verificación de Cuentas Proton - FLUJO SIMPLIFICADO
 * 
 * Flujo actualizado (sin clicks innecesarios):
 * 1. Ir a https://account.protonvpn.com/es-es/signup
 * 2. Hacer scroll hasta "Crea tu cuenta" (Paso 2)
 * 3. Buscar el iframe correcto: challenge/v4/html?Type=0&Name=email
 * 4. Ingresar email en input.input-element.w-full.email-input-field
 * 5. Verificar resultado (error "ya está en uso" = registrado)
 * 
 * IMPORTANTE: Ya NO se necesita:
 * - Click en "regístrate gratis"
 * - Click en "Continuar con VPN Free"
 * - Buscar el iframe de pagos
 */

import { NextRequest, NextResponse } from 'next/server'
import puppeteer from 'puppeteer'

const PROTON_DOMAINS = ['proton.me', 'protonmail.com', 'pm.me', 'protonmail.ch', 'passmail.net']

interface ProtonProfileData {
  username: string
  email: string
  isProtonDomain: boolean
  isExternalEmail: boolean
  pgpFingerprint?: string
  pgpKeyType?: string
  creationDate?: string
  creationTime?: string
  encryptionStandard?: string
  publicKey?: string
  catchAllEmail?: string
}

function isProtonDomain(email: string): boolean {
  const domain = email.split('@')[1]
  return PROTON_DOMAINS.includes(domain)
}

function extractTimestampFromPGP(sourceCode: string): number | null {
  const match = sourceCode.match(/:(\d{10}):/)
  return match ? parseInt(match[1]) : null
}

function extractKeyTypeAndLength(sourceCode: string): { keyType: string; keyLength: string } | null {
  const lines = sourceCode.split('\n')
  if (lines.length < 2) return null
  
  const keyLine = lines[1]
  const parts = keyLine.split(':')
  
  if (parts.length < 4) return null
  
  return {
    keyType: parts[2],
    keyLength: parts[3]
  }
}

export async function POST(request: NextRequest) {
  let browser = null
  
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email es requerido' },
        { status: 400 }
      )
    }

    console.log(`🔍 Verificando Protonmail para: ${email}`)

    const isProton = isProtonDomain(email)
    let isExternalEmail = !isProton
    let isRegistered = false
    let actualProtonEmail = email

    // PASO 1: SIEMPRE usar Puppeteer para verificar en signup (tanto Proton como externos)
    console.log('🌐 Iniciando navegador Puppeteer con anti-detección avanzada...')
    
    const browser = await puppeteer.launch({
      headless: true, // Modo headless (segundo plano)
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-blink-features=AutomationControlled',
        '--disable-web-security',
        '--disable-features=IsolateOrigins,site-per-process',
        '--window-size=1920,1080',
        '--disable-infobars',
        '--disable-gpu',
        '--disable-software-rasterizer'
      ],
      defaultViewport: { width: 1920, height: 1080 },
      ignoreDefaultArgs: ['--enable-automation']
    })
    
    const page = await browser.newPage()
    
    // Anti-detección avanzada ANTES de navegar
    await page.evaluateOnNewDocument(() => {
      // 1. Eliminar webdriver flag
      Object.defineProperty(navigator, 'webdriver', {
        get: () => undefined
      })
      
      // 2. Plugins realistas
      Object.defineProperty(navigator, 'plugins', {
        get: () => [1, 2, 3, 4, 5]
      })
      
      // 3. Languages consistentes
      Object.defineProperty(navigator, 'languages', {
        get: () => ['es-AR', 'es', 'en-US', 'en']
      })
      
      // 4. Chrome runtime
      (window as any).chrome = {
        runtime: {}
      }
      
      // 5. Modificar toString para ocultar modificaciones
      const originalToString = Function.prototype.toString
      const newToString = function(this: any) {
        return originalToString.apply(this, arguments as any)
      }
      Function.prototype.toString = newToString
      
      // 6. Ocultar automation
      delete (window as any).__nightmare
      delete (navigator as any).__nightmare
      delete (navigator as any).__webdriver_script_fn
    })
    
    // User agent realista
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
    )
    
    // Función para esperas aleatorias realistas
    const humanDelay = (min: number, max: number) => {
      const delay = Math.floor(Math.random() * (max - min + 1)) + min
      return new Promise(resolve => setTimeout(resolve, delay))
    }
    
    // Función para simular movimiento de mouse
    const simulateHumanMouse = async () => {
      const x = Math.floor(Math.random() * 1920)
      const y = Math.floor(Math.random() * 1080)
      await page.mouse.move(x, y)
      await humanDelay(100, 300)
    }
    
    console.log('📄 Navegando a página de signup de ProtonVPN...')
    
    // Estrategia optimizada: timeout corto con domcontentloaded
    try {
      await page.goto('https://account.protonvpn.com/es-es/signup', {
        waitUntil: 'domcontentloaded',
        timeout: 15000 // Solo 15 segundos
      })
      console.log('✅ DOM cargado exitosamente')
    } catch (navError: any) {
      console.log(`⚠️ Timeout en navegación (${navError.message}), pero continuando...`)
      // Verificar si al menos la página respondió
      const currentUrl = await page.url()
      if (!currentUrl.includes('protonvpn.com')) {
        throw new Error('No se pudo cargar la página de ProtonVPN')
      }
      console.log('✅ Página al menos respondió, continuando...')
    }
    
    // Espera para que la página cargue recursos iniciales
    console.log('⏳ Esperando carga de elementos iniciales...')
    await humanDelay(2000, 3000) // Espera reducida
    
    const currentUrl = page.url()
    console.log(`✅ Página cargada - URL actual: ${currentUrl}`)

    // FLUJO SIMPLIFICADO: Ya no necesitamos clicks adicionales
    console.log('📋 Usando flujo simplificado - sin clicks en botones')
    
    // Hacer scroll gradual hasta el formulario "Crea tu cuenta" (Paso 2)
    console.log('📜 Haciendo scroll hasta la sección "Crea tu cuenta"...')
    await page.evaluate(() => {
      window.scrollBy(0, 400)
    })
    await humanDelay(500, 800)
    await page.evaluate(() => {
      window.scrollBy(0, 400)
    })
    await humanDelay(1000, 1500)

    // Paso 1: Ingresar email en el iframe
    console.log('📝 Esperando iframe de email...')
    console.log(`📍 URL actual: ${page.url()}`)
    
    // Esperar para que los iframes se carguen
    console.log('⏳ Esperando carga de iframes...')
    await humanDelay(1500, 2000)
    
    // Simular scroll hasta el formulario
    await page.evaluate(() => {
      const element = document.querySelector('iframe[title="Dirección de correo electrónico"]')
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    })
    await humanDelay(1000, 1500)
    
    // Esperar a que el iframe esté disponible con timeout más largo
    console.log('🔍 Buscando iframe con selector...')
    try {
      await page.waitForSelector('iframe[title="Dirección de correo electrónico"]', { timeout: 20000 })
      console.log('✅ Iframe encontrado')
    } catch (iframeError) {
      console.log('⚠️ Timeout esperando iframe, pero continuando para buscar en frames existentes...')
    }
    
    // Espera adicional para que el iframe cargue su contenido
    console.log('🔍 Buscando todos los iframes en la página...')
    const frames = page.frames()
    console.log(`📊 Total de frames encontrados: ${frames.length}`)
    frames.forEach((frame, index) => {
      console.log(`  Frame ${index}: ${frame.url()}`)
    })

    // Buscar el iframe CORRECTO: challenge con Name=email (NO Name=unauth)
    const emailFrame = frames.find(frame => {
      const url = frame.url()
      // El iframe correcto es: https://account-api.protonvpn.com/challenge/v4/html?Type=0&Name=email
      if (url.includes('challenge/v4/html') && url.includes('Type=0&Name=email')) {
        console.log('✅ Iframe correcto encontrado: challenge con Name=email')
        return true
      }
      // Excluir el iframe de auth (Name=unauth)
      if (url.includes('Type=0&Name=unauth')) {
        console.log('⚠️ Saltando iframe de unauth (no es el del email)')
        return false
      }
      return false
    })

    if (!emailFrame) {
      console.log('❌ No se encontró iframe válido (solo challenge detectado)')
      console.log('💡 Proton detectó el bot. Cambiando a método alternativo: PGP API')
      
      await browser.close()
      
      // Método alternativo: verificar usando la API de PGP keys directamente
      console.log('🔄 Intentando con API de PGP keys de Protonmail...')
      try {
        const pgpUrl = `https://api.protonmail.ch/pks/lookup?op=get&search=${encodeURIComponent(email)}`
        const pgpResponse = await fetch(pgpUrl)
        const pgpText = await pgpResponse.text()
        
        if (pgpText.includes('-----BEGIN PGP PUBLIC KEY BLOCK-----')) {
          console.log('✅ Cuenta encontrada vía PGP API')
          
          // Extraer información de la clave PGP
          const timestamp = extractTimestampFromPGP(pgpText)
          const keyInfo = extractKeyTypeAndLength(pgpText)
          
          return NextResponse.json({
            success: true,
            found: true,
            authMethod: 'REGISTERED',
            platform: 'proton.me',
            profileData: {
              email: email,
              username: email.split('@')[0],
              isProtonDomain: isProton,
              isExternalEmail: isExternalEmail,
              pgpFingerprint: pgpText.match(/[A-F0-9]{40}/)?.[0],
              pgpKeyType: keyInfo?.keyType,
              creationDate: timestamp ? new Date(timestamp * 1000).toLocaleDateString('es-AR') : undefined,
              creationTime: timestamp ? new Date(timestamp * 1000).toLocaleTimeString('es-AR') : undefined,
              publicKey: pgpText,
              verificationMethod: 'pgp_api'
            }
          })
        } else {
          console.log('❌ No se encontró clave PGP para este email')
          return NextResponse.json({
            success: true,
            found: false,
            authMethod: 'NOT_REGISTERED',
            platform: 'proton.me',
            message: 'Email no está vinculado a una cuenta de Protonmail'
          })
        }
      } catch (pgpError) {
        console.error('❌ Error en método alternativo PGP:', pgpError)
        throw new Error('No se pudo verificar el email (ambos métodos fallaron)')
      }
    }

    console.log(`✅ Iframe válido encontrado: ${emailFrame.url()}`)
    
    // Esperar a que el iframe cargue su contenido dinámicamente
    console.log('⏳ Esperando que el iframe cargue completamente...')
    await humanDelay(3000, 4000)
    
    // Inspeccionar el contenido del iframe
    console.log('🔍 Inspeccionando contenido del iframe...')
    const frameContent = await emailFrame.content()
    console.log(`📄 Longitud del HTML del iframe: ${frameContent.length} caracteres`)
    
    // Buscar todos los inputs en el iframe
    const allInputs = await emailFrame.$$('input')
    console.log(`📊 Total de inputs en el iframe: ${allInputs.length}`)
    
    // Intentar obtener información de cada input
    for (let i = 0; i < allInputs.length; i++) {
      const inputInfo = await emailFrame.evaluate((el) => {
        return {
          type: el.getAttribute('type'),
          name: el.getAttribute('name'),
          id: el.getAttribute('id'),
          className: el.className,
          placeholder: el.getAttribute('placeholder')
        }
      }, allInputs[i])
      console.log(`  Input ${i}:`, JSON.stringify(inputInfo))
    }
    
    // Esperar a que el input dentro del iframe esté disponible
    console.log('📝 Esperando input dentro del iframe...')
    
    // El selector correcto basado en la documentación actualizada
    let inputSelector = 'input.input-element.w-full.email-input-field'
    
    try {
      console.log(`🔍 Buscando input con selector: ${inputSelector}`)
      await emailFrame.waitForSelector(inputSelector, { timeout: 10000 })
      console.log('✅ Input encontrado con el selector correcto')
    } catch (e) {
      console.log('❌ ERROR: No se encontró el input con el selector correcto')
      console.log('📄 Inspeccionando contenido del iframe para debug...')
      console.log(frameContent.substring(0, 1000))
      
      // Intentar selectores alternativos como fallback
      const fallbackSelectors = [
        'input[type="email"]',
        'input[id="email"]',
        'input[data-testid="input-input-element"]',
        'input'
      ]
      
      let found = false
      for (const selector of fallbackSelectors) {
        try {
          await emailFrame.waitForSelector(selector, { timeout: 3000 })
          console.log(`✅ Fallback exitoso con selector: ${selector}`)
          inputSelector = selector
          found = true
          break
        } catch (err) {
          continue
        }
      }
      
      if (!found) {
        throw new Error('No se encontró input en el iframe')
      }
    }
    
    console.log('✅ Input dentro del iframe encontrado')
    
    // Escribir en el input del iframe (pegar texto completo)
    console.log(`📝 Ingresando email en el iframe usando selector: ${inputSelector}...`)
    
    // Click en el input primero
    await emailFrame.click(inputSelector)
    await humanDelay(200, 400)
    
    // Pegar el email completo de una vez (más rápido)
    await emailFrame.type(inputSelector, email, { delay: 0 })
    
    console.log('✅ Email ingresado correctamente en el iframe')
    
    // Espera breve
    await humanDelay(500, 800)
    
    // Hacer click fuera para activar validación
    console.log('👆 Activando validación...')
    await page.click('.pricing-box-content')
    
    // Esperar a que se actualice la validación
    console.log('⏳ Esperando validación...')
    await humanDelay(3000, 4000)
    console.log('✅ Espera de validación completada')

    // Paso 4: Verificar si está registrado
    console.log('🔍 Verificando resultado...')
    const pageContent = await page.content()
    
    // Detectar tipo de respuesta:
    // - "El nombre de usuario ya está en uso." = Email de Proton registrado
    // - "La dirección de correo electrónico ya está en uso." = Email externo registrado
    // - Checkmark verde = No registrado (ambos casos)
    
    let isProtonEmailRegistered = false
    let isExternalEmailRegistered = false
    
    if (pageContent.includes('El nombre de usuario ya está en uso')) {
      console.log('✅ Email de Proton registrado (username en uso)')
      isProtonEmailRegistered = true
      isRegistered = true
    } else if (pageContent.includes('La dirección de correo electrónico ya está en uso') || 
               pageContent.includes('already in use')) {
      console.log('✅ Email externo registrado en Protonmail')
      isExternalEmailRegistered = true
      isRegistered = true
    } else if (pageContent.includes('ic-checkmark-circle') && pageContent.includes('email-valid')) {
      console.log('❌ Email NO registrado en Protonmail')
      isRegistered = false
    } else {
      console.log('⚠️ No se pudo determinar el estado, asumiendo no registrado')
      isRegistered = false
    }

    if (!isRegistered) {
      await browser.close()
      return NextResponse.json({
        success: true,
        found: false,
        authMethod: 'NOT_REGISTERED',
        platform: 'proton.me',
        message: 'Email no está vinculado a una cuenta de Protonmail'
      })
    }

    // Email está registrado
    console.log('🔍 Buscando datos PGP...')
    actualProtonEmail = email
    
    // Si es email de Proton, ir directo al paso 4 (PGP)
    if (isProtonEmailRegistered) {
      console.log('📧 Email de dominio Proton, cerrando navegador y consultando PGP directamente...')
      await browser.close()
      // Continuar con paso 4 abajo (fuera del if)
    }
    // Si es email externo, buscar el email de Proton asociado usando Puppeteer (paso 2)
    else if (isExternalEmailRegistered) {
      console.log('📧 Email externo, buscando email de Proton asociado via login...')
      try {
        // Interceptar respuestas de red para capturar la API auth/info
        let authInfoResponse: any = null
        
        await page.setRequestInterception(true)
        page.on('request', request => {
          request.continue()
        })
        
        page.on('response', async response => {
          const url = response.url()
          if (url.includes('/api/core/v4/auth/info')) {
            console.log('🎯 Interceptada respuesta de auth/info')
            try {
              authInfoResponse = await response.json()
              console.log('📥 Respuesta capturada:', JSON.stringify(authInfoResponse).substring(0, 200))
            } catch (e) {
              console.log('⚠️ Error parseando respuesta auth/info')
            }
          }
        })
        
        // Navegar a la página de login
        console.log('🔐 Navegando a página de login...')
        await page.goto('https://account.proton.me/login', {
          waitUntil: 'domcontentloaded',
          timeout: 15000
        })
        await humanDelay(2000, 3000)
        
        // Ingresar el email
        console.log(`📝 Ingresando email: ${email}`)
        const usernameInput = await page.waitForSelector('input#username', { timeout: 10000 })
        if (!usernameInput) throw new Error('No se encontró input de username')
        await usernameInput.click()
        await humanDelay(300, 500)
        await usernameInput.type(email, { delay: 100 })
        await humanDelay(500, 800)
        
        // Ingresar contraseña random
        console.log('🔑 Ingresando contraseña random...')
        const passwordInput = await page.waitForSelector('input#password', { timeout: 10000 })
        if (!passwordInput) throw new Error('No se encontró input de password')
        await passwordInput.click()
        await humanDelay(300, 500)
        const randomPassword = 'RandomPass123!@#'
        await passwordInput.type(randomPassword, { delay: 100 })
        await humanDelay(500, 800)
        
        // Click en iniciar sesión
        console.log('👆 Click en iniciar sesión...')
        const loginButton = await page.waitForSelector('button[type="submit"]', { timeout: 10000 })
        if (!loginButton) throw new Error('No se encontró botón de login')
        await loginButton.click()
        
        // Esperar a que se haga la petición a auth/info
        console.log('⏳ Esperando respuesta de auth/info...')
        await humanDelay(3000, 4000)
        
        // Verificar si obtuvimos la respuesta
        if (authInfoResponse && authInfoResponse.Username) {
          actualProtonEmail = `${authInfoResponse.Username}@proton.me`
          console.log(`✅ Username de Proton encontrado: ${authInfoResponse.Username}`)
          console.log(`✅ Email de Proton completo: ${actualProtonEmail}`)
        } else {
          console.log('⚠️ No se pudo obtener username de la respuesta auth/info')
          console.log('📧 Esto indica que la cuenta usa servicios de Proton (VPN, etc.) pero NO ProtonMail')
          
          // Cerrar navegador
          await browser.close()
          
          // Retornar que está registrado en servicios de Proton pero sin ProtonMail
          return NextResponse.json({
            success: true,
            found: true,
            authMethod: 'REGISTERED_VPN_ONLY',
            platform: 'proton.me',
            message: 'Email registrado en servicios de Proton (ProtonVPN, etc.) pero no usa ProtonMail',
            profileData: {
              serviceType: 'ProtonVPN / Otros servicios Proton',
              hasProtonMail: false
            }
          })
        }
        
      } catch (err) {
        console.error('❌ Error buscando email de Proton via login:', err)
        
        // Si hay error en el proceso de login, intentar cerrar browser
        if (browser && browser.isConnected()) {
          await browser.close()
        }
        
        return NextResponse.json({
          success: false,
          error: 'Error verificando email de Proton'
        }, { status: 500 })
      }
    }

    // Paso 4: Obtener información PGP
    try {
      const pgpIndexResponse = await fetch(
        `https://api.protonmail.ch/pks/lookup?op=index&search=${encodeURIComponent(actualProtonEmail)}`
      )
      const pgpIndexText = await pgpIndexResponse.text()

      if (!pgpIndexText.startsWith('info:1:1')) {
        console.log('❌ No se encontró clave PGP')
        return NextResponse.json({
          success: true,
          found: false,
          authMethod: 'NOT_REGISTERED',
          platform: 'proton.me',
          message: 'No se encontró cuenta de Protonmail'
        })
      }

      // Extraer información de la clave PGP
      const timestamp = extractTimestampFromPGP(pgpIndexText)
      const keyInfo = extractKeyTypeAndLength(pgpIndexText)

      let creationDate = null
      let creationTime = null
      let encryptionStandard = 'nulo'

      if (timestamp) {
        const date = new Date(timestamp * 1000)
        creationDate = date.toISOString().split('T')[0] // YYYY-MM-DD
        creationTime = date.toISOString().split('T')[1].split('.')[0] // HH:MM:SS
      }

      if (keyInfo) {
        if (keyInfo.keyType !== '22') {
          encryptionStandard = `RSA ${keyInfo.keyLength}-bit`
        } else {
          encryptionStandard = 'ECC Curve25519'
        }
      }

      // Extraer fingerprint
      const fingerprintMatch = pgpIndexText.match(/pub:([a-f0-9]+):/)
      const fingerprint = fingerprintMatch ? fingerprintMatch[1] : null

      // Paso 5: Obtener clave pública PGP completa
      let publicKey = null
      try {
        const pgpGetResponse = await fetch(
          `https://api.protonmail.ch/pks/lookup?op=get&search=${encodeURIComponent(actualProtonEmail)}`
        )
        const pgpGetText = await pgpGetResponse.text()
        
        if (pgpGetText.includes('BEGIN PGP PUBLIC KEY BLOCK')) {
          // Extraer solo la parte codificada (sin headers)
          const lines = pgpGetText.split('\n')
          const keyLines = []
          let inKey = false
          
          for (const line of lines) {
            if (line.includes('BEGIN PGP PUBLIC KEY BLOCK')) {
              inKey = true
              continue
            }
            if (line.includes('END PGP PUBLIC KEY BLOCK')) {
              break
            }
            if (inKey && line && !line.startsWith('Version:') && !line.startsWith('Comment:') && line.trim() !== '') {
              keyLines.push(line.trim())
            }
          }
          
          publicKey = keyLines.join('')
        }
      } catch (keyError) {
        console.error('Error obteniendo clave pública:', keyError)
      }

      // Verificar catch-all email (solo para emails de dominio Proton)
      // NO marcar como catch-all si es un email externo vinculado
      const uidLine = pgpIndexText.split('\n')[2] // La línea UID está en la tercera línea
      const emailInBracketsMatch = uidLine ? uidLine.match(/<(.*?)>/) : null
      let catchAllEmail = null
      
      // Solo verificar catch-all si el email original es de dominio Proton
      const originalEmailDomain = email.split('@')[1]
      const isOriginalProtonDomain = PROTON_DOMAINS.includes(originalEmailDomain)
      
      if (emailInBracketsMatch && emailInBracketsMatch[1] && isOriginalProtonDomain) {
        const mainEmail = emailInBracketsMatch[1]
        // Si el email principal es diferente al email consultado, hay catch-all/alias
        if (mainEmail !== email && mainEmail !== actualProtonEmail) {
          catchAllEmail = mainEmail
          console.log(`🎯 Catch-All/Alias detectado! Email principal: ${mainEmail}`)
        }
      } else if (!isOriginalProtonDomain) {
        console.log('📧 Email externo vinculado - no se considera catch-all')
      }

      const profileData: ProtonProfileData = {
        username: actualProtonEmail.split('@')[0],
        email: actualProtonEmail,
        isProtonDomain: isProton,
        isExternalEmail: isExternalEmail,
        pgpFingerprint: fingerprint || 'nulo',
        creationDate: creationDate || 'nulo',
        creationTime: creationTime || 'nulo',
        encryptionStandard: encryptionStandard,
        publicKey: publicKey || 'nulo',
        catchAllEmail: catchAllEmail || undefined
      }

      console.log('🎉 Datos de Protonmail obtenidos:', profileData.username)

      // Cerrar navegador antes de retornar (solo si no se cerró antes)
      if (browser && browser.isConnected()) {
        await browser.close()
        console.log('✅ Navegador cerrado correctamente')
      }

      return NextResponse.json({
        success: true,
        found: true,
        authMethod: 'REGISTERED',
        platform: 'proton.me',
        profileData
      })

    } catch (pgpError) {
      console.error('Error obteniendo información PGP:', pgpError)
      
      // Cerrar navegador en caso de error (solo si existe y está conectado)
      if (browser && browser.isConnected()) {
        try {
          await browser.close()
        } catch (closeError) {
          console.error('Error cerrando navegador:', closeError)
        }
      }
      
      return NextResponse.json({
        success: false,
        error: 'Error obteniendo información PGP'
      }, { status: 500 })
    }

  } catch (error: any) {
    console.error('Error general en verificación de Protonmail:', error)
    
    // Asegurarse de cerrar el navegador en caso de error
    if (browser) {
      try {
        await browser.close()
      } catch (closeError) {
        console.error('Error cerrando navegador:', closeError)
      }
    }
    
    return NextResponse.json({
      success: false,
      error: error.message || 'Error interno del servidor'
    }, { status: 500 })
  }
}
