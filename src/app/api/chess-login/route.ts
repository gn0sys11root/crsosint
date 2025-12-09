import { NextRequest, NextResponse } from 'next/server'
import puppeteer from 'puppeteer'

let serverLogs: string[] = []

function addServerLog(message: string) {
  serverLogs.push(message)
  console.log(message)
}

export async function POST(request: NextRequest) {
  try {
    // Reset logs para cada request
    serverLogs = []
    
    const { email, password } = await request.json()
    
    addServerLog('Iniciando verificación de credenciales de Chess.com')
    
    if (!email || !password) {
      return NextResponse.json({ 
        success: false, 
        error: 'Se requiere email y contraseña',
        serverLogs
      }, { status: 400 })
    }
    
    addServerLog(`Verificando credenciales para: ${email}`)
    
    let browser = null
    try {
      browser = await puppeteer.launch({
        headless: true,
        timeout: 30000,
        dumpio: false,
        pipe: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
          '--disable-features=VizDisplayCompositor',
          '--no-first-run',
          '--disable-extensions',
          '--disable-default-apps'
        ]
      })

      const page = await browser.newPage()
      
      // Configurar timeouts
      page.setDefaultTimeout(30000)
      page.setDefaultNavigationTimeout(30000)
      
      // Configurar User Agent
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36')
      await page.setViewport({ width: 1366, height: 768 })
      
      addServerLog('Navegando a Chess.com login')
      await page.goto('https://www.chess.com/login', { waitUntil: 'networkidle2' })
      
      // Esperar que aparezcan los campos
      await page.waitForSelector('#login-username')
      await page.waitForSelector('#login-password')
      
      addServerLog('Completando formulario de login')
      await page.type('#login-username', email)
      await page.type('#login-password', password)
      
      // Hacer clic en el botón de login
      addServerLog('Enviando formulario')
      await page.click('#login')
      
      // Esperar un poco para ver qué pasa
      await new Promise(resolve => setTimeout(resolve, 5000))
      
      const currentUrl = page.url()
      addServerLog(`URL actual después del login: ${currentUrl}`)
      
      // Verificar si hay mensaje de error
      const errorMessage = await page.evaluate(() => {
        const errorElement = document.querySelector('.authentication-login-error')
        return errorElement ? errorElement.textContent.trim() : null
      })
      
      if (errorMessage) {
        addServerLog(`Error de login encontrado: ${errorMessage}`)
        return NextResponse.json({ 
          success: false, 
          error: 'Credenciales incorrectas',
          errorDetail: errorMessage,
          serverLogs
        })
      }
      
      // Verificar si fue redirigido al home (login exitoso)
      if (currentUrl.includes('chess.com/home')) {
        addServerLog('Login exitoso - redirigido al home')
        return NextResponse.json({ 
          success: true, 
          message: 'Credenciales verificadas correctamente',
          serverLogs
        })
      } else {
        addServerLog('Login falló - no redirigido al home')
        return NextResponse.json({ 
          success: false, 
          error: 'Credenciales incorrectas - no se redirigió al home',
          serverLogs
        })
      }
      
    } finally {
      if (browser) {
        await browser.close()
        addServerLog('Navegador cerrado')
      }
    }
    
  } catch (error) {
    console.error('Error en chess-login:', error)
    addServerLog('Error: ' + (error instanceof Error ? error.message : 'Error desconocido'))
    
    return NextResponse.json({
      success: false,
      error: 'Error al verificar credenciales: ' + (error instanceof Error ? error.message : 'Error desconocido'),
      serverLogs
    }, { status: 500 })
  }
}
