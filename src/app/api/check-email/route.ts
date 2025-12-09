import { NextRequest, NextResponse } from 'next/server'
import puppeteer from 'puppeteer'
import crypto from 'crypto'

// Store global para mantener las sesiones activas de Puppeteer para Joomla
// Usamos globalThis para persistir entre hot reloads de Next.js
declare global {
  var joomlaSessions: Map<string, any> | undefined
}

if (!global.joomlaSessions) {
  global.joomlaSessions = new Map()
}
const joomlaSessions = global.joomlaSessions

// Array para capturar logs del backend
let serverLogs: string[] = []

// Función para agregar logs del servidor
function addServerLog(message: string) {
  serverLogs.push(message)
  console.log(message) // También mostrar en PowerShell
}

export async function POST(request: NextRequest) {
  try {
    // Reset logs para cada request
    serverLogs = []

    const { email, platform, mode, teamsAuthToken, teamsSkypeToken, flickrApiKey, flickrAuthHash, flickrSecret, chessPassword, chessAccountEmail, pornhubToken } = await request.json()

    if (!email || !platform) {
      return NextResponse.json(
        { success: false, error: 'Email y plataforma son requeridos' },
        { status: 400 }
      )
    }

    if (platform === 'change.org') {
      let browser = null

      try {
        console.log('Iniciando navegador headless para Change.org...')

        // Lanzar navegador headless con configuración mínima y estable
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
            '--disable-default-apps',
            '--disable-background-timer-throttling',
            '--disable-renderer-backgrounding',
            '--disable-backgrounding-occluded-windows',
            '--disable-background-networking'
          ]
        })

        const page = await browser.newPage()

        // Configurar timeouts de página
        page.setDefaultTimeout(30000)
        page.setDefaultNavigationTimeout(30000)

        // Configurar User Agent y viewport
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36')
        await page.setViewport({ width: 1366, height: 768 })

        // Desactivar imágenes y CSS para acelerar la carga
        await page.setRequestInterception(true)
        page.on('request', (req) => {
          if (req.resourceType() == 'stylesheet' || req.resourceType() == 'image') {
            req.abort()
          } else {
            req.continue()
          }
        })

        console.log('Navegando a Change.org...')

        // Ir a Change.org para establecer el contexto correcto
        await page.goto('https://www.change.org/login_or_join?user_flow=nav', {
          waitUntil: 'domcontentloaded',
          timeout: 30000
        })

        // Esperar un poco para asegurar que se carguen los scripts necesarios
        await new Promise(resolve => setTimeout(resolve, 2000))

        console.log('Ejecutando consulta GraphQL desde el contexto de Change.org...')

        // Ejecutar la consulta desde el contexto del sitio web
        const result = await page.evaluate(async (email) => {
          try {
            const response = await fetch("https://www.change.org/api-proxy/graphql/userAuthMethodByEmail?op=UserAuthMethod", {
              "headers": {
                "accept": "application/json",
                "accept-language": "es",
                "content-type": "application/json",
                "newrelic": "eyJ2IjpbMCwxXSwiZCI6eyJ0eSI6IkJyb3dzZXIiLCJhYyI6IjgzOSIsImFwIjoiNzkzNjY1ODk2IiwiaWQiOiI3ZTExZjczZjcxMTk5NGE2IiwidHIiOiI2ZmFlYmU1Mjk2ZTI5ZTdhNGMzODdkOTg2MjM2MWJkMCIsInRpIjoxNzY0MjcxNTIwMTI0fX0=",
                "priority": "u=1, i",
                "sec-ch-ua": "\"Chromium\";v=\"142\", \"Google Chrome\";v=\"142\", \"Not_A Brand\";v=\"99\"",
                "sec-ch-ua-mobile": "?0",
                "sec-ch-ua-platform": "\"Windows\"",
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "same-origin",
                "traceparent": "00-6faebe5296e29e7a4c387d9862361bd0-7e11f73f711994a6-01",
                "tracestate": "839@nr=0-1-839-793665896-7e11f73f711994a6----1764271520124",
                "x-requested-with": "corgi-front-end-browser:5.836.0"
              },
              "referrer": "https://www.change.org/login_or_join?user_flow=nav",
              "body": JSON.stringify({
                "operationName": "UserAuthMethod",
                "variables": { "email": email },
                "extensions": {
                  "clientLibrary": { "name": "@apollo/client", "version": "4.0.9" },
                  "webappInfo": {
                    "name": "corgi",
                    "build_ts_utc": "2025-11-27T17:33:03.830Z",
                    "version": "5.836.0",
                    "version_normalized": "0005.0836.0000",
                    "ssr": false
                  },
                  "operationId": "mihtpldo1v7e60zvvow"
                },
                "query": "query UserAuthMethod($email: String!) {\n  authMethod: userAuthMethodByEmail(email: $email)\n}"
              }),
              "method": "POST",
              "mode": "cors",
              "credentials": "include"
            })

            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`)
            }

            const data = await response.json()
            return { success: true, data }

          } catch (error) {
            return {
              success: false,
              error: error instanceof Error ? error.message : 'Error desconocido',
              errorType: error instanceof Error ? error.name : 'Error'
            }
          }
        }, email, pornhubToken)

        console.log('Resultado de la consulta:', result)

        if (result.success && result.data?.data?.authMethod) {
          const authMethod = result.data.data.authMethod
          const hasPassword = authMethod !== 'NO_PASSWORD_SET'
          const usesAuth0 = authMethod === 'NO_PASSWORD_SET'

          return NextResponse.json({
            success: true,
            authMethod: authMethod,
            platform: 'Change.org',
            profileData: {
              hasPassword: hasPassword,
              usesAuth0External: usesAuth0,
              rawAuthMethod: authMethod
            }
          })
        } else {
          return NextResponse.json({
            success: false,
            error: result.error || 'Respuesta inesperada de Change.org'
          })
        }

      } catch (error) {
        console.error('Error con Puppeteer:', error)

        let errorMessage = 'Error desconocido'
        if (error instanceof Error) {
          if (error.message.includes('ECONNRESET') || error.message.includes('WebSocket')) {
            errorMessage = 'Error de conexión con el navegador headless. Reintenta en unos segundos.'
          } else if (error.message.includes('timeout')) {
            errorMessage = 'Timeout al conectar con Change.org. Reintenta más tarde.'
          } else {
            errorMessage = error.message
          }
        }

        return NextResponse.json({
          success: false,
          error: 'Error al automatizar la verificación: ' + errorMessage
        })
      } finally {
        if (browser) {
          try {
            await browser.close()
            console.log('Navegador cerrado')
          } catch (closeError) {
            console.error('Error al cerrar navegador:', closeError)
          }
        }
      }
    }

    if (platform === 'pornhub.com') {
      let browser = null

      try {
        console.log('Iniciando navegador headless para Pornhub.com...')

        // Lanzar navegador headless con configuración mínima y estable
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
            '--disable-default-apps',
            '--disable-background-timer-throttling',
            '--disable-renderer-backgrounding',
            '--disable-backgrounding-occluded-windows',
            '--disable-background-networking'
          ]
        })

        const page = await browser.newPage()

        // Configurar timeouts de página
        page.setDefaultTimeout(30000)
        page.setDefaultNavigationTimeout(30000)

        // Configurar User Agent y viewport
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36')
        await page.setViewport({ width: 1366, height: 768 })

        // Desactivar imágenes y CSS para acelerar la carga
        await page.setRequestInterception(true)
        page.on('request', (req) => {
          if (req.resourceType() == 'stylesheet' || req.resourceType() == 'image') {
            req.abort()
          } else {
            req.continue()
          }
        })

        console.log('Navegando a Pornhub.com...')

        // Ir a Pornhub.com para establecer el contexto correcto
        await page.goto('https://es.pornhub.com/', {
          waitUntil: 'domcontentloaded',
          timeout: 30000
        })

        // Esperar un poco para asegurar que se carguen los scripts necesarios
        await new Promise(resolve => setTimeout(resolve, 2000))

        console.log('Ejecutando consulta API desde el contexto de Pornhub.com...')

        // Ejecutar la consulta desde el contexto del sitio web
        const result = await page.evaluate(async (email, customToken) => {
          try {
            // Primero obtener el token dinámico de la página
            const tokenMatch = document.documentElement.innerHTML.match(/token['"]\s*:\s*['"]([^'"]+)['"]/);
            // Usar token personalizado si está disponible, sino usar el dinámico, sino usar el fallback hardcodeado
            const token = customToken || (tokenMatch ? tokenMatch[1] : 'MTc2NDI4NTUwODLYiiuGour-4lX77lrpSapPkR3OKAtaQBTZnRV_wZn6eQnUeIHH6vAeUnsyV4otzCOOsu1gFh3zfLPv2VhVp3s.');

            const response = await fetch(`https://es.pornhub.com/api/v1/user/create_account_check?token=${token}`, {
              "headers": {
                "accept": "*/*",
                "accept-language": "es",
                "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
                "priority": "u=1, i",
                "sec-ch-ua": "\"Chromium\";v=\"142\", \"Google Chrome\";v=\"142\", \"Not_A Brand\";v=\"99\"",
                "sec-ch-ua-arch": "\"x86\"",
                "sec-ch-ua-full-version": "\"142.0.7444.176\"",
                "sec-ch-ua-full-version-list": "\"Chromium\";v=\"142.0.7444.176\", \"Google Chrome\";v=\"142.0.7444.176\", \"Not_A Brand\";v=\"99.0.0.0\"",
                "sec-ch-ua-mobile": "?0",
                "sec-ch-ua-model": "\"\"",
                "sec-ch-ua-platform": "\"Windows\"",
                "sec-ch-ua-platform-version": "\"10.0.0\"",
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "same-origin",
                "x-requested-with": "XMLHttpRequest"
              },
              "referrer": "https://es.pornhub.com/",
              "body": `check_what=email&email=${encodeURIComponent(email)}`,
              "method": "POST",
              "mode": "cors",
              "credentials": "include"
            })

            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`)
            }

            const data = await response.json()
            return { success: true, data }

          } catch (error) {
            return {
              success: false,
              error: error instanceof Error ? error.message : 'Error desconocido',
              errorType: error instanceof Error ? error.name : 'Error'
            }
          }
        }, email, pornhubToken)

        console.log('Resultado de la consulta:', result)

        if (result.success && result.data) {
          const emailStatus = result.data.email
          let authMethod = 'UNKNOWN'

          // Interpretar la respuesta de Pornhub
          if (emailStatus === 'create_account_failed') {
            authMethod = 'REGISTERED' // Email ya registrado
          } else if (emailStatus === 'create_account_passed') {
            authMethod = 'NOT_REGISTERED' // Email disponible
          }

          return NextResponse.json({
            success: true,
            authMethod: authMethod,
            platform: 'Pornhub.com',
            rawResponse: result.data
          })
        } else {
          return NextResponse.json({
            success: false,
            error: result.error || 'Respuesta inesperada de Pornhub.com'
          })
        }

      } catch (error) {
        console.error('Error con Puppeteer:', error)

        let errorMessage = 'Error desconocido'
        if (error instanceof Error) {
          if (error.message.includes('ECONNRESET') || error.message.includes('WebSocket')) {
            errorMessage = 'Error de conexión con el navegador headless. Reintenta en unos segundos.'
          } else if (error.message.includes('timeout')) {
            errorMessage = 'Timeout al conectar con Pornhub.com. Reintenta más tarde.'
          } else {
            errorMessage = error.message
          }
        }

        return NextResponse.json({
          success: false,
          error: 'Error al automatizar la verificación: ' + errorMessage
        })
      } finally {
        if (browser) {
          try {
            await browser.close()
            console.log('Navegador cerrado')
          } catch (closeError) {
            console.error('Error al cerrar navegador:', closeError)
          }
        }
      }
    }

    if (platform === 'xvideos.com') {
      try {
        addServerLog('Verificando email en XVideos.com...')

        // Log de la request HTTP hacia XVideos
        const url = `https://www.xvideos.com/account/checkemail?email=${encodeURIComponent(email)}`
        const headers = {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36',
          'Accept': 'application/json, text/plain, */*',
          'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
          'Referer': 'https://www.xvideos.com/'
        }

        addServerLog('REQUEST to XVideos.com:')
        addServerLog('Method: GET')
        addServerLog('URL: ' + url)
        addServerLog('Headers: ' + JSON.stringify(headers, null, 2))

        // Hacer request directo a la API de XVideos
        const response = await fetch(url, {
          method: 'GET',
          headers: headers
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()

        // Log de la respuesta HTTP de XVideos
        addServerLog('RESPONSE from XVideos.com:')
        addServerLog('Status: ' + response.status)
        addServerLog('Headers: ' + JSON.stringify(Object.fromEntries(response.headers.entries()), null, 2))
        addServerLog('Body: ' + JSON.stringify(data, null, 2))

        let authMethod = 'UNKNOWN'

        // Interpretar la respuesta de XVideos
        if (data.result === false && data.code === 1) {
          authMethod = 'REGISTERED' // Email ya registrado
        } else if (data.result === true && data.code === 0) {
          authMethod = 'NOT_REGISTERED' // Email disponible
        }

        return NextResponse.json({
          success: true,
          authMethod: authMethod,
          platform: 'XVideos.com',
          rawResponse: data,
          serverLogs: serverLogs
        })

      } catch (error) {
        console.error('Error verificando XVideos:', error)

        let errorMessage = 'Error desconocido'
        if (error instanceof Error) {
          if (error.message.includes('timeout')) {
            errorMessage = 'Timeout al conectar con XVideos.com. Reintenta más tarde.'
          } else if (error.message.includes('ENOTFOUND')) {
            errorMessage = 'No se pudo conectar con XVideos.com. Verifica tu conexión.'
          } else {
            errorMessage = error.message
          }
        }

        return NextResponse.json({
          success: false,
          error: 'Error al verificar en XVideos: ' + errorMessage
        })
      }
    }

    if (platform === 'instagram.com') {
      let browser = null

      try {
        console.log('Iniciando navegador headless para Instagram.com...')

        // Lanzar navegador headless con configuración mínima y estable
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
            '--disable-default-apps',
            '--disable-background-timer-throttling',
            '--disable-renderer-backgrounding',
            '--disable-backgrounding-occluded-windows',
            '--disable-background-networking'
          ]
        })

        const page = await browser.newPage()

        // Configurar timeouts de página
        page.setDefaultTimeout(30000)
        page.setDefaultNavigationTimeout(30000)

        // Configurar User Agent y viewport
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36')
        await page.setViewport({ width: 1366, height: 768 })

        // Desactivar imágenes y CSS para acelerar la carga
        await page.setRequestInterception(true)
        page.on('request', (req) => {
          if (req.resourceType() == 'stylesheet' || req.resourceType() == 'image') {
            req.abort()
          } else {
            req.continue()
          }
        })

        console.log('Navegando a Instagram.com...')

        // Ir a Instagram.com página de recuperación de contraseña para establecer el contexto correcto
        await page.goto('https://www.instagram.com/accounts/password/reset/', {
          waitUntil: 'domcontentloaded',
          timeout: 30000
        })

        // Esperar un poco para asegurar que se carguen los scripts necesarios
        await new Promise(resolve => setTimeout(resolve, 3000))

        console.log('Ejecutando consulta API desde el contexto de Instagram.com...')

        // Ejecutar la consulta desde el contexto del sitio web
        const result = await page.evaluate(async (email) => {
          try {
            // Obtener los tokens dinámicos de la página
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ||
              document.cookie.match(/csrftoken=([^;]+)/)?.[1] ||
              'lV5wN8b0iXoY1K1tT9bR5z';

            const igAppId = '936619743392459';
            const igAjax = '1030406848';
            const jazoest = Date.now().toString().slice(-5);

            const response = await fetch("https://www.instagram.com/api/v1/web/accounts/account_recovery_send_ajax/", {
              "headers": {
                "accept": "*/*",
                "accept-language": "es",
                "content-type": "application/x-www-form-urlencoded",
                "priority": "u=1, i",
                "sec-ch-prefers-color-scheme": "dark",
                "sec-ch-ua": "\"Chromium\";v=\"142\", \"Google Chrome\";v=\"142\", \"Not_A Brand\";v=\"99\"",
                "sec-ch-ua-full-version-list": "\"Chromium\";v=\"142.0.7444.176\", \"Google Chrome\";v=\"142.0.7444.176\", \"Not_A Brand\";v=\"99.0.0.0\"",
                "sec-ch-ua-mobile": "?0",
                "sec-ch-ua-model": "\"\"",
                "sec-ch-ua-platform": "\"Windows\"",
                "sec-ch-ua-platform-version": "\"10.0.0\"",
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "same-origin",
                "x-asbd-id": "359341",
                "x-csrftoken": csrfToken,
                "x-ig-app-id": igAppId,
                "x-ig-www-claim": "0",
                "x-instagram-ajax": igAjax,
                "x-requested-with": "XMLHttpRequest"
              },
              "referrer": "https://www.instagram.com/accounts/password/reset/",
              "body": `email_or_username=${encodeURIComponent(email)}&jazoest=${jazoest}`,
              "method": "POST",
              "mode": "cors",
              "credentials": "include"
            })

            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`)
            }

            const data = await response.json()
            return { success: true, data }

          } catch (error) {
            return {
              success: false,
              error: error instanceof Error ? error.message : 'Error desconocido',
              errorType: error instanceof Error ? error.name : 'Error'
            }
          }
        }, email, pornhubToken)

        console.log('Resultado de la consulta:', result)

        if (result.success && result.data) {
          let authMethod = 'UNKNOWN'

          // Interpretar la respuesta de Instagram
          if (result.data.status === 'ok' && result.data.toast_message) {
            authMethod = 'REGISTERED' // Email registrado
          } else if (result.data.status === 'fail' && result.data.message === 'No se encontraron usuarios') {
            authMethod = 'NOT_REGISTERED' // Email no registrado
          }

          return NextResponse.json({
            success: true,
            authMethod: authMethod,
            platform: 'Instagram.com',
            rawResponse: result.data
          })
        } else {
          return NextResponse.json({
            success: false,
            error: result.error || 'Respuesta inesperada de Instagram.com'
          })
        }

      } catch (error) {
        console.error('Error con Puppeteer:', error)

        let errorMessage = 'Error desconocido'
        if (error instanceof Error) {
          if (error.message.includes('ECONNRESET') || error.message.includes('WebSocket')) {
            errorMessage = 'Error de conexión con el navegador headless. Reintenta en unos segundos.'
          } else if (error.message.includes('timeout')) {
            errorMessage = 'Timeout al conectar con Instagram.com. Reintenta más tarde.'
          } else {
            errorMessage = error.message
          }
        }

        return NextResponse.json({
          success: false,
          error: 'Error al automatizar la verificación: ' + errorMessage
        })
      } finally {
        if (browser) {
          try {
            await browser.close()
            console.log('Navegador cerrado')
          } catch (closeError) {
            console.error('Error al cerrar navegador:', closeError)
          }
        }
      }
    }

    if (platform === 'spotify.com') {
      try {
        console.log('Verificando email en Spotify.com...')

        // Hacer request directo a la API de validación de Spotify
        const response = await fetch(`https://spclient.wg.spotify.com/signup/public/v1/account?validate=1&email=${encodeURIComponent(email)}`, {
          method: 'GET',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36',
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
            'Referer': 'https://open.spotify.com/'
          }
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        console.log('Respuesta de Spotify:', data)

        let authMethod = 'UNKNOWN'

        // Interpretar la respuesta de Spotify
        if (data.status === 20 && data.errors?.email) {
          authMethod = 'REGISTERED' // Email ya registrado
        } else if (data.status === 1) {
          authMethod = 'NOT_REGISTERED' // Email disponible
        }

        return NextResponse.json({
          success: true,
          authMethod: authMethod,
          platform: 'Spotify.com',
          rawResponse: data
        })

      } catch (error) {
        console.error('Error verificando Spotify:', error)

        let errorMessage = 'Error desconocido'
        if (error instanceof Error) {
          if (error.message.includes('timeout')) {
            errorMessage = 'Timeout al conectar con Spotify.com. Reintenta más tarde.'
          } else if (error.message.includes('ENOTFOUND')) {
            errorMessage = 'No se pudo conectar con Spotify.com. Verifica tu conexión.'
          } else {
            errorMessage = error.message
          }
        }

        return NextResponse.json({
          success: false,
          error: 'Error al verificar en Spotify: ' + errorMessage
        })
      }
    }

    if (platform === 'gravatar.com') {
      try {
        addServerLog('Verificando email en Gravatar.com...')

        // Convertir email a MD5 hash
        const emailHash = crypto.createHash('md5').update(email.toLowerCase().trim()).digest('hex')
        addServerLog('Email hash MD5: ' + emailHash)

        // Hacer request directo a la API de Gravatar
        const response = await fetch(`https://gravatar.com/${emailHash}.json`, {
          method: 'GET',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36',
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8'
          }
        })

        let authMethod = 'UNKNOWN'
        let gravatarData = null
        let profileData = null

        if (response.status === 404) {
          // Usuario no encontrado
          authMethod = 'NOT_REGISTERED'
        } else if (response.ok) {
          const data = await response.json()
          addServerLog('Respuesta de Gravatar: ' + JSON.stringify(data, null, 2))

          // Verificar si tiene datos del perfil
          if (data.entry && Array.isArray(data.entry) && data.entry.length > 0) {
            authMethod = 'REGISTERED' // Email registrado con perfil
            gravatarData = data

            // Extraer datos del perfil
            const entry = data.entry[0]
            profileData = {
              hash: entry.hash || emailHash,
              requestHash: entry.requestHash || emailHash,
              profileUrl: entry.profileUrl || `https://gravatar.com/${emailHash}`,
              preferredUsername: entry.preferredUsername || '',
              thumbnailUrl: entry.thumbnailUrl || `https://1.gravatar.com/avatar/${emailHash}?size=200`,
              photos: entry.photos || [],
              displayName: entry.displayName || ''
            }
            addServerLog('Datos de perfil extraídos: ' + JSON.stringify(profileData, null, 2))
          } else {
            authMethod = 'NOT_REGISTERED'
          }
        } else {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        return NextResponse.json({
          success: true,
          authMethod: authMethod,
          platform: 'Gravatar.com',
          rawResponse: gravatarData,
          emailHash: emailHash,
          profileData: profileData,
          serverLogs: serverLogs
        })

      } catch (error) {
        console.error('Error verificando Gravatar:', error)

        let errorMessage = 'Error desconocido'
        if (error instanceof Error) {
          if (error.message.includes('timeout')) {
            errorMessage = 'Timeout al conectar con Gravatar.com. Reintenta más tarde.'
          } else if (error.message.includes('ENOTFOUND')) {
            errorMessage = 'No se pudo conectar con Gravatar.com. Verifica tu conexión.'
          } else {
            errorMessage = error.message
          }
        }

        return NextResponse.json({
          success: false,
          error: 'Error al verificar en Gravatar: ' + errorMessage
        })
      }
    }

    if (platform === 'microsoft.com') {
      let browser = null
      try {
        console.log('Verificando email en Microsoft.com...')

        // Configurar Puppeteer para Microsoft
        browser = await puppeteer.launch({
          headless: true,
          pipe: true,
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--disable-web-security',
            '--no-zygote',
            '--disable-blink-features=AutomationControlled'
          ],
          defaultViewport: { width: 1366, height: 768 }
        })

        const page = await browser.newPage()

        // Headers para Microsoft
        await page.setExtraHTTPHeaders({
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36',
          'Accept': 'application/json',
          'Accept-Language': 'es',
          'Content-Type': 'application/json; charset=utf-8'
        })

        // Navegar a la página de login de Microsoft
        await page.goto('https://login.live.com/', {
          waitUntil: 'networkidle2',
          timeout: 30000
        })

        console.log('Página de Microsoft cargada')

        // Esperar un poco para que la página se estabilice
        await new Promise(resolve => setTimeout(resolve, 2000))

        // Esperar a que aparezca el campo de email con varios selectores posibles
        const emailSelectors = ['input[type="email"]', '#i0116', 'input[name="loginfmt"]']
        let emailField = null

        for (const selector of emailSelectors) {
          try {
            await page.waitForSelector(selector, { timeout: 5000 })
            emailField = await page.$(selector)
            if (emailField) {
              console.log(`Campo de email encontrado con selector: ${selector}`)
              break
            }
          } catch (e) {
            // Continuar con el siguiente selector
          }
        }

        if (!emailField) {
          throw new Error('No se pudo encontrar el campo de email en Microsoft')
        }

        // Introducir el email en el campo encontrado
        await emailField.click()
        await emailField.type(email)

        // Esperar un poco antes de buscar el botón
        await new Promise(resolve => setTimeout(resolve, 1000))

        // Buscar y hacer clic en el botón "Siguiente" usando varios selectores posibles
        let nextButtonClicked = false
        const possibleSelectors = [
          'input[type="submit"]',
          'button[type="submit"]',
          '#idSIButton9',
          'input[id="idSIButton9"]',
          '[data-report-event="Signin_Submit"]',
          'input[value="Next"]',
          'input[value="Siguiente"]',
          'button:contains("Next")',
          'button:contains("Siguiente")',
          '.win-button-primary',
          '[aria-describedby="loginHeader"]',
          'input[data-report-event*="Signin"]'
        ]

        for (const selector of possibleSelectors) {
          try {
            // Esperar que el elemento esté disponible
            await page.waitForSelector(selector, { timeout: 2000 })
            const element = await page.$(selector)
            if (element) {
              // Verificar que el elemento es visible y clickeable
              const isVisible = await element.isIntersectingViewport()
              if (isVisible) {
                await element.click()
                nextButtonClicked = true
                console.log(`Botón encontrado con selector: ${selector}`)
                break
              }
            }
          } catch (e) {
            // Continuar con el siguiente selector
          }
        }

        // Si no encontramos el botón con selectores, intentar presionar Enter
        if (!nextButtonClicked) {
          try {
            console.log('Intentando presionar Enter como alternativa...')
            await page.keyboard.press('Enter')
            nextButtonClicked = true
            console.log('Enter presionado exitosamente')
          } catch (e) {
            throw new Error('No se pudo encontrar el botón Siguiente en Microsoft ni presionar Enter')
          }
        }

        // Esperar la respuesta del API que Microsoft hace internamente
        let authMethod = 'UNKNOWN'
        let microsoftData = null

        try {
          // Interceptar requests a GetCredentialType.srf
          const response = await page.waitForResponse(response =>
            response.url().includes('GetCredentialType.srf') && response.request().method() === 'POST',
            { timeout: 15000 }
          )

          const responseData = await response.json()
          console.log('Respuesta de Microsoft:', responseData)
          microsoftData = responseData

          if (responseData.IfExistsResult === 0) {
            // Usuario registrado
            authMethod = 'REGISTERED'
          } else if (responseData.IfExistsResult === 1) {
            // Usuario no registrado
            authMethod = 'NOT_REGISTERED'
          } else {
            authMethod = 'UNKNOWN'
          }

        } catch (interceptError) {
          console.log('No se pudo interceptar el request, intentando método alternativo...')

          // Método alternativo: verificar elementos en la página
          try {
            // Esperar un poco para que la página se actualice
            await new Promise(resolve => setTimeout(resolve, 3000))

            // Verificar si aparece campo de contraseña (indica que el usuario existe)
            const passwordField = await page.$('input[type="password"]')

            if (passwordField) {
              authMethod = 'REGISTERED'
            } else {
              // Verificar si aparece mensaje de error o crear cuenta
              const errorMessage = await page.evaluate(() => {
                const errorDiv = document.querySelector('[data-bind*="errorText"]') ||
                  document.querySelector('.alert-error') ||
                  document.querySelector('[role="alert"]')
                return errorDiv ? errorDiv.textContent : null
              })

              if (errorMessage && errorMessage.includes('crear')) {
                authMethod = 'NOT_REGISTERED'
              } else {
                authMethod = 'NOT_REGISTERED' // Por defecto si no hay campo de contraseña
              }
            }
          } catch (altError) {
            console.error('Error en método alternativo:', altError)
            authMethod = 'UNKNOWN'
          }
        }

        await browser.close()
        browser = null

        return NextResponse.json({
          success: true,
          authMethod: authMethod,
          platform: 'Microsoft.com',
          rawResponse: microsoftData
        })

      } catch (error) {
        if (browser) {
          await browser.close()
        }

        console.error('Error verificando Microsoft:', error)

        let errorMessage = 'Error desconocido'
        if (error instanceof Error) {
          if (error.message.includes('timeout')) {
            errorMessage = 'Timeout al conectar con Microsoft.com. Reintenta más tarde.'
          } else if (error.message.includes('ERR_CONNECTION_RESET')) {
            errorMessage = 'Conexión reseteada por Microsoft. Reintenta más tarde.'
          } else if (error.message.includes('Navigation timeout')) {
            errorMessage = 'Timeout de navegación. Microsoft puede estar bloqueando requests automatizados.'
          } else {
            errorMessage = error.message
          }
        }

        return NextResponse.json({
          success: false,
          error: 'Error al verificar en Microsoft: ' + errorMessage
        })
      }
    }

    if (platform === 'facebook.com') {
      let browser = null
      try {
        console.log('Verificando email en Facebook.com...')

        // Configurar Puppeteer para Facebook
        browser = await puppeteer.launch({
          headless: true,
          pipe: true,
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--disable-web-security',
            '--no-zygote',
            '--disable-blink-features=AutomationControlled'
          ],
          defaultViewport: { width: 1366, height: 768 }
        })

        const page = await browser.newPage()

        // Headers para Facebook
        await page.setExtraHTTPHeaders({
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'es',
          'Accept-Encoding': 'gzip, deflate, br',
          'DNT': '1',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1'
        })

        // Navegar a la página de recuperación de Facebook
        await page.goto('https://www.facebook.com/login/identify/', {
          waitUntil: 'networkidle2',
          timeout: 30000
        })

        console.log('Página de Facebook cargada')

        // Esperar a que aparezcan los elementos necesarios
        await page.waitForSelector('input[name="email"]', { timeout: 10000 })

        // Extraer tokens dinámicos de Facebook
        const tokens = await page.evaluate(() => {
          const jazoestElement = document.querySelector('input[name="jazoest"]') as HTMLInputElement
          const lsdElement = document.querySelector('input[name="lsd"]') as HTMLInputElement

          return {
            jazoest: jazoestElement ? jazoestElement.value : '',
            lsd: lsdElement ? lsdElement.value : ''
          }
        })

        console.log('Tokens extraídos:', tokens)

        if (!tokens.jazoest || !tokens.lsd) {
          throw new Error('No se pudieron extraer los tokens necesarios de Facebook')
        }

        // Preparar el body del request
        const formData = new URLSearchParams()
        formData.append('jazoest', tokens.jazoest)
        formData.append('lsd', tokens.lsd)
        formData.append('email', email)
        formData.append('did_submit', '1')
        formData.append('__user', '0')
        formData.append('__a', '1')
        formData.append('__req', '6')

        // Hacer el request AJAX desde el contexto de la página
        const responseData = await page.evaluate(async (formDataString) => {
          const response = await fetch('https://www.facebook.com/ajax/login/help/identify.php?ctx=recover', {
            method: 'POST',
            headers: {
              'accept': '*/*',
              'accept-language': 'es',
              'content-type': 'application/x-www-form-urlencoded',
              'sec-fetch-dest': 'empty',
              'sec-fetch-mode': 'cors',
              'sec-fetch-site': 'same-origin',
              'x-requested-with': 'XMLHttpRequest'
            },
            body: formDataString,
            credentials: 'include'
          })

          const text = await response.text()
          return {
            status: response.status,
            text: text
          }
        }, formData.toString())

        console.log('Respuesta de Facebook:', responseData)

        await browser.close()
        browser = null

        let authMethod = 'UNKNOWN'

        // Analizar la respuesta
        if (responseData.text) {
          const responseText = responseData.text

          // Si contiene ServerRedirect y redirectPageTo, el email está registrado
          if (responseText.includes('ServerRedirect') && responseText.includes('redirectPageTo')) {
            authMethod = 'REGISTERED'
          }
          // Si contiene mensajes de "no hay resultados", el email no está registrado
          else if (responseText.includes('No hay resultados para esta búsqueda') ||
            responseText.includes('Tu búsqueda no arrojó ningún resultado')) {
            authMethod = 'NOT_REGISTERED'
          }
          // Si contiene elementos de formulario de búsqueda pero sin error, puede ser ambiguo
          else if (responseText.includes('account_search') && !responseText.includes('uiBoxRed')) {
            authMethod = 'NOT_REGISTERED'
          }
        }

        return NextResponse.json({
          success: true,
          authMethod: authMethod,
          platform: 'Facebook.com',
          rawResponse: {
            status: responseData.status,
            hasRedirect: responseData.text?.includes('ServerRedirect') || false,
            hasError: responseData.text?.includes('No hay resultados') || false
          }
        })

      } catch (error) {
        if (browser) {
          await browser.close()
        }

        console.error('Error verificando Facebook:', error)

        let errorMessage = 'Error desconocido'
        if (error instanceof Error) {
          if (error.message.includes('timeout')) {
            errorMessage = 'Timeout al conectar con Facebook.com. Reintenta más tarde.'
          } else if (error.message.includes('ERR_CONNECTION_RESET')) {
            errorMessage = 'Conexión reseteada por Facebook. Reintenta más tarde.'
          } else if (error.message.includes('Navigation timeout')) {
            errorMessage = 'Timeout de navegación. Facebook puede estar bloqueando requests automatizados.'
          } else {
            errorMessage = error.message
          }
        }

        return NextResponse.json({
          success: false,
          error: 'Error al verificar en Facebook: ' + errorMessage
        })
      }
    }

    if (platform === 'x.com') {
      try {
        console.log('Verificando email en X.com...')

        // Hacer request directo a la API de X.com
        const response = await fetch(`https://api.x.com/i/users/email_available.json?email=${encodeURIComponent(email)}`, {
          method: 'GET',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36',
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
            'Accept-Encoding': 'gzip, deflate, br',
            'DNT': '1',
            'Connection': 'keep-alive',
            'Sec-Fetch-Dest': 'empty',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Site': 'same-site'
          }
        })

        let authMethod = 'UNKNOWN'
        let xData = null

        if (response.ok) {
          const data = await response.json()
          console.log('Respuesta de X.com:', data)
          xData = data

          // Analizar la respuesta de X.com
          if (data.taken === true && data.valid === false) {
            // Email ya está registrado
            authMethod = 'REGISTERED'
          } else if (data.taken === false && data.valid === true) {
            // Email disponible (no registrado)
            authMethod = 'NOT_REGISTERED'
          } else {
            authMethod = 'UNKNOWN'
          }
        } else {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        return NextResponse.json({
          success: true,
          authMethod: authMethod,
          platform: 'X.com',
          rawResponse: xData
        })

      } catch (error) {
        console.error('Error verificando X.com:', error)

        let errorMessage = 'Error desconocido'
        if (error instanceof Error) {
          if (error.message.includes('timeout')) {
            errorMessage = 'Timeout al conectar con X.com. Reintenta más tarde.'
          } else if (error.message.includes('ENOTFOUND')) {
            errorMessage = 'No se pudo conectar con X.com. Verifica tu conexión.'
          } else if (error.message.includes('403')) {
            errorMessage = 'Acceso denegado por X.com. Puede requerir autenticación.'
          } else if (error.message.includes('429')) {
            errorMessage = 'Rate limit alcanzado en X.com. Reintenta más tarde.'
          } else {
            errorMessage = error.message
          }
        }

        return NextResponse.json({
          success: false,
          error: 'Error al verificar en X.com: ' + errorMessage
        })
      }
    }

    if (platform === 'duolingo.com') {
      try {
        addServerLog('Verificando email en Duolingo.com...')

        // PASO 1: Verificar si el email está registrado y obtener ID inicial
        addServerLog('Paso 1: Buscando usuario por email...')
        const response = await fetch(`https://www.duolingo.com/2017-06-30/users?email=${encodeURIComponent(email)}`, {
          method: 'GET',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36',
            'Accept': 'application/json',
            'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8'
          }
        })

        let authMethod = 'UNKNOWN'
        let profileData = null

        if (response.ok) {
          const data = await response.json()
          addServerLog('Respuesta de búsqueda inicial: ' + JSON.stringify(data, null, 2))

          // Analizar la respuesta según la especificación
          if (data.users && Array.isArray(data.users)) {
            if (data.users.length > 0) {
              authMethod = 'REGISTERED'

              // PASO 2: Extraer ID del usuario para obtener datos completos
              const user = data.users[0]
              let userId = user.id

              // Si el ID es 0 o un número de una cifra, extraer de picture
              if (!userId || userId === 0 || userId.toString().length === 1) {
                if (user.picture) {
                  // Extraer ID de URL como: //simg-ssl.duolingo.com/ssr-avatars/972369373/SSR-wTVJYOmKsO
                  const match = user.picture.match(/ssr-avatars\/(\d+)\//)
                  if (match && match[1]) {
                    userId = match[1]
                    addServerLog(`ID extraído de picture: ${userId}`)
                  }
                }
              }

              if (userId && userId !== 0) {
                // PASO 3: Obtener datos completos del perfil
                addServerLog(`Paso 2: Obteniendo datos completos del usuario ${userId}...`)

                const profileResponse = await fetch(`https://www.duolingo.com/2017-06-30/users/${userId}`, {
                  method: 'GET',
                  headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36',
                    'Accept': 'application/json',
                    'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8'
                  }
                })

                if (profileResponse.ok) {
                  const profileFullData = await profileResponse.json()
                  addServerLog('Datos completos del perfil obtenidos: ' + JSON.stringify(profileFullData, null, 2))

                  // Extraer y formatear datos del perfil COMPLETO
                  profileData = {
                    tipo: 'completo', // Indicador para el frontend
                    nombre: profileFullData.name || '',
                    usuario: profileFullData.username || '',
                    ubicacion: profileFullData.streakData?.updatedTimeZone || '',
                    fechaCreacion: profileFullData.creationDate ? new Date(profileFullData.creationDate * 1000).toLocaleDateString('es-ES') : '',
                    emailVerificado: profileFullData.emailVerified ? 'Sí' : 'No',
                    idCuenta: profileFullData.id?.toString() || '',
                    fotoPerfil: profileFullData.picture ? `https:${profileFullData.picture}/large` : '',
                    // Datos adicionales para OSINT
                    totalXp: profileFullData.totalXp?.toString() || '',
                    idiomaNativo: profileFullData.fromLanguage || '',
                    idiomaAprendiendo: profileFullData.learningLanguage || '',
                    cursoActual: profileFullData.currentCourseId || '',
                    tieneGoogle: profileFullData.hasGoogleId ? 'Sí' : 'No',
                    tieneFacebook: profileFullData.hasFacebookId ? 'Sí' : 'No',
                    tieneTelefono: profileFullData.hasPhoneNumber ? 'Sí' : 'No',
                    nivelSuscripcion: profileFullData.subscriberLevel || '',
                    motivacion: profileFullData.motivation || '',
                    rachaActual: profileFullData.streak?.toString() || '0',
                    rachaMaxima: profileFullData.streakData?.longestStreak?.length?.toString() || '0',
                    // Datos adicionales
                    actividadReciente: profileFullData.hasRecentActivity15 ? 'Sí' : 'No',
                    metaXpDiaria: profileFullData.streakData?.xpGoal?.toString() || '',
                    coronas: profileFullData.courses?.[0]?.crowns?.toString() || '0',
                    origen: profileFullData.acquisitionSurveyReason || ''
                  }

                  addServerLog('Datos del perfil procesados: ' + JSON.stringify(profileData, null, 2))
                } else {
                  addServerLog('No se pudieron obtener datos completos del perfil')
                }
              } else {
                addServerLog('No se pudo determinar el ID del usuario - usando datos limitados')

                // Crear perfil LIMITADO con solo datos del primer endpoint
                profileData = {
                  tipo: 'limitado', // Indicador para el frontend
                  usuario: data.users[0].username || 'No disponible',
                  nombre: data.users[0].name || 'No disponible',
                  racha: data.users[0].streak?.toString() || '0',
                  tieneGoogle: data.users[0].hasGoogleId ? 'Sí' : 'No',
                  tieneFacebook: data.users[0].hasFacebookId ? 'Sí' : 'No',
                  tieneActividad: data.users[0].hasRecentActivity15 ? 'Sí' : 'No',
                  fotoPerfil: data.users[0].picture ? `https:${data.users[0].picture}/large` : ''
                }

                addServerLog('Datos del perfil limitado procesados: ' + JSON.stringify(profileData, null, 2))
              }
            } else {
              authMethod = 'NOT_REGISTERED'
              addServerLog('Usuario no encontrado - email no registrado')
            }
          } else {
            authMethod = 'UNKNOWN'
            addServerLog('Respuesta inesperada del servidor')
          }
        } else {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        return NextResponse.json({
          success: true,
          authMethod: authMethod,
          platform: 'Duolingo.com',
          message: authMethod === 'REGISTERED' ? 'Email ya registrado en la plataforma' :
            authMethod === 'NOT_REGISTERED' ? 'Email no registrado' : 'Estado desconocido',
          profileData: profileData,
          serverLogs: serverLogs
        })

      } catch (error) {
        console.error('Error verificando Duolingo:', error)

        let errorMessage = 'Error desconocido'
        if (error instanceof Error) {
          if (error.message.includes('timeout')) {
            errorMessage = 'Timeout al conectar con Duolingo.com. Reintenta más tarde.'
          } else if (error.message.includes('ENOTFOUND')) {
            errorMessage = 'No se pudo conectar con Duolingo.com. Verifica tu conexión.'
          } else if (error.message.includes('403')) {
            errorMessage = 'Acceso denegado por Duolingo.com.'
          } else if (error.message.includes('429')) {
            errorMessage = 'Rate limit alcanzado en Duolingo.com. Reintenta más tarde.'
          } else {
            errorMessage = error.message
          }
        }

        return NextResponse.json({
          success: false,
          error: 'Error al verificar en Duolingo: ' + errorMessage
        })
      }
    }

    if (platform === 'flickr.com') {
      try {
        console.log('=== FLICKR REQUEST LOGS ===')
        console.log('Email to check:', email)
        console.log('Encoded email:', encodeURIComponent(email))

        // Verificar si hay tokens configurados
        const hasTokens = flickrApiKey && flickrAuthHash && flickrSecret
        if (hasTokens) {
          console.log('✅ Flickr tokens detected')
        } else {
          console.log('⚠️ Flickr tokens not configured - will only check registration (no profile data)')
        }

        const requestUrl = `https://identity-api.flickr.com/migration?email=${encodeURIComponent(email)}`
        console.log('Request URL:', requestUrl)

        // Usar la API de migración de Flickr como en holehe
        const response = await fetch(requestUrl, {
          method: 'GET',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36',
            'Accept': '*/*',
            'Accept-Language': 'es-ES,es;q=0.8,en-US;q=0.5,en;q=0.3',
            'Referer': 'https://identity.flickr.com/login',
            'Origin': 'https://identity.flickr.com',
            'Connection': 'keep-alive',
            'TE': 'Trailers'
          }
        })

        console.log('=== FLICKR RESPONSE LOGS ===')
        console.log('Response status:', response.status)
        console.log('Response headers:', Object.fromEntries(response.headers.entries()))

        if (!response.ok) {
          console.log('Response not OK, status:', response.status)
          throw new Error(`Error HTTP al verificar Flickr: ${response.status}`)
        }

        const responseText = await response.text()
        console.log('Raw response text:', responseText)

        const flickrData = JSON.parse(responseText)
        console.log('=== FLICKR DEBUG LOGS ===')
        console.log('Full Flickr API Response:', JSON.stringify(flickrData, null, 2))
        console.log('Response keys:', Object.keys(flickrData))

        // Intentar diferentes formas de acceder a state_code
        console.log('flickrData.state_code:', flickrData.state_code)
        console.log('flickrData.data?.state_code:', flickrData.data?.state_code)
        console.log('typeof flickrData.state_code:', typeof flickrData.state_code)
        console.log('typeof flickrData.data?.state_code:', typeof flickrData.data?.state_code)

        const stateCode = flickrData?.state_code || flickrData?.data?.state_code || ''
        const stateDesc = flickrData?.state_desc || flickrData?.data?.state_desc || ''

        console.log('Extracted stateCode:', stateCode, typeof stateCode)
        console.log('Extracted stateDesc:', stateDesc, typeof stateDesc)
        console.log('stateCode === "5":', stateCode === '5')
        console.log('stateCode == "5":', stateCode == '5')
        console.log('stateCode === 5:', stateCode === 5)

        let authMethod = 'UNKNOWN'

        // LÓGICA CORREGIDA basada en holehe: Solo verificar state_code == '5'
        // En la API de Flickr, stateCode '5' significa que el email YA ESTÁ registrado
        if (stateCode === '5' || stateCode === 5) {
          authMethod = 'REGISTERED'
          console.log('✅ Email registrado en Flickr')

          // Solo intentar obtener el perfil completo si hay tokens configurados
          if (hasTokens) {
            console.log('Tokens configurados - Procediendo a obtener datos del perfil (Fase 2)...')
            try {
              // Parte de búsqueda y obtención de perfil (segunda fase)
              return await getFlickrProfileData(email, flickrApiKey, flickrAuthHash, flickrSecret)
            } catch (profileError) {
              console.error('Error obteniendo perfil de Flickr:', profileError)

              // Si falla obtener el perfil, al menos retornamos que está registrado
              return NextResponse.json({
                success: true,
                authMethod: 'REGISTERED',
                platform: 'Flickr.com',
                message: 'Email registrado en Flickr pero no se pudo obtener el perfil completo',
                rawResponse: flickrData
              })
            }
          } else {
            // Sin tokens, solo retornamos que está registrado (sin datos del perfil)
            console.log('⚠️ Tokens no configurados - Retornando solo estado de registro')
            return NextResponse.json({
              success: true,
              authMethod: 'REGISTERED',
              platform: 'Flickr.com',
              message: 'Email registrado en Flickr (configura tokens en /configuracion para ver datos del perfil)',
              rawResponse: flickrData
            })
          }
        } else {
          authMethod = 'NOT_REGISTERED'
          console.log('Email no registrado en Flickr')

          return NextResponse.json({
            success: true,
            authMethod: authMethod,
            platform: 'Flickr.com',
            message: 'Email no registrado en Flickr',
            rawResponse: flickrData
          })
        }

      } catch (error) {
        console.error('Error verificando en Flickr:', error)

        let errorMessage = 'Error desconocido'
        if (error instanceof Error) {
          if (error.message.includes('timeout')) {
            errorMessage = 'Timeout al conectar con Flickr.com. Reintenta más tarde.'
          } else if (error.message.includes('ENOTFOUND')) {
            errorMessage = 'No se pudo conectar con Flickr.com. Verifica tu conexión.'
          } else if (error.message.includes('403')) {
            errorMessage = 'Acceso denegado por Flickr.com.'
          } else if (error.message.includes('429')) {
            errorMessage = 'Rate limit alcanzado en Flickr.com. Reintenta más tarde.'
          } else {
            errorMessage = error.message
          }
        }

        return NextResponse.json({
          success: false,
          error: errorMessage
        })
      }
    }

    if (platform === 'wordpress.com') {
      try {
        console.log('Verificando email en WordPress.com...')

        // Usar la API auth-options de WordPress como en holehe
        const response = await fetch(`https://public-api.wordpress.com/rest/v1.1/users/${encodeURIComponent(email)}/auth-options?http_envelope=1&locale=fr`, {
          method: 'GET',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0',
            'Accept': '*/*',
            'Accept-Language': 'fr,fr-FR;q=0.8,en-US;q=0.5,en;q=0.3',
            'DNT': '1',
            'Connection': 'keep-alive',
            'TE': 'Trailers'
          },
          // Nota: En fetch no podemos enviar cookies manualmente, pero no son estrictamente necesarias
        })

        let authMethod = 'UNKNOWN'
        let wordpressData = null

        if (response.ok) {
          const data = await response.json()
          console.log('Respuesta de WordPress:', data)
          wordpressData = data

          // Analizar la respuesta según el código de holehe
          if (data.body && typeof data.body.email_verified === 'boolean') {
            if (data.body.email_verified) {
              authMethod = 'REGISTERED'
            } else {
              authMethod = 'NOT_REGISTERED'
            }
          } else {
            // Revisar mensajes de error específicos
            const responseString = JSON.stringify(data).toLowerCase()
            if (responseString.includes('unknown_user') || responseString.includes('email_login_not_allowed')) {
              authMethod = 'NOT_REGISTERED'
            } else {
              authMethod = 'UNKNOWN'
            }
          }
        } else {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        return NextResponse.json({
          success: true,
          authMethod: authMethod,
          platform: 'WordPress.com',
          rawResponse: wordpressData
        })

      } catch (error) {
        console.error('Error verificando WordPress:', error)

        let errorMessage = 'Error desconocido'
        if (error instanceof Error) {
          if (error.message.includes('timeout')) {
            errorMessage = 'Timeout al conectar con WordPress.com. Reintenta más tarde.'
          } else if (error.message.includes('ENOTFOUND')) {
            errorMessage = 'No se pudo conectar con WordPress.com. Verifica tu conexión.'
          } else if (error.message.includes('403')) {
            errorMessage = 'Acceso denegado por WordPress.com.'
          } else if (error.message.includes('429')) {
            errorMessage = 'Rate limit alcanzado en WordPress.com. Reintenta más tarde.'
          } else {
            errorMessage = error.message
          }
        }

        return NextResponse.json({
          success: false,
          error: 'Error al verificar en WordPress: ' + errorMessage
        })
      }
    }

    if (platform === 'github.com') {
      try {
        console.log('Verificando email en GitHub.com...')

        const browser = await puppeteer.launch({
          headless: true,
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-blink-features=AutomationControlled',
            '--disable-web-security',
            '--disable-features=VizDisplayCompositor',
            '--disable-infobars',
            '--window-size=1920,1080',
            '--disable-extensions',
            '--no-first-run',
            '--ignore-certificate-errors',
            '--ignore-ssl-errors',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-zygote',
            '--disable-gpu'
          ]
        })

        const page = await browser.newPage()

        // Técnicas anti-detección
        await page.evaluateOnNewDocument(() => {
          Object.defineProperty(navigator, 'webdriver', {
            get: () => undefined,
          });
          Object.defineProperty(navigator, 'plugins', {
            get: () => [1, 2, 3, 4, 5],
          });
          Object.defineProperty(navigator, 'languages', {
            get: () => ['en-US', 'en'],
          });
        })

        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36')
        await page.setViewport({ width: 1920, height: 1080 })

        // Navegar a GitHub signup
        console.log('Navegando a la página de registro de GitHub...')
        await page.goto('https://github.com/signup', {
          waitUntil: 'domcontentloaded',
          timeout: 30000
        })

        console.log('Página de GitHub cargada')
        await new Promise(resolve => setTimeout(resolve, 3000))

        // Escribir email de manera muy realista para evitar detección anti-bot
        console.log('Escribiendo email de manera realista...')

        // Simular movimiento de mouse y click en el campo
        await page.hover('#email')
        await new Promise(resolve => setTimeout(resolve, 200 + Math.random() * 300))
        await page.click('#email')
        await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200))

        // Limpiar cualquier contenido previo
        await page.evaluate(() => {
          const emailInput = document.querySelector('#email') as HTMLInputElement
          if (emailInput) {
            emailInput.value = ''
            emailInput.dispatchEvent(new Event('input', { bubbles: true }))
          }
        })

        // Escribir caracter por caracter con delays variables y eventos reales
        for (let i = 0; i < email.length; i++) {
          const char = email[i]

          // Delay variable entre caracteres (más realista)
          const baseDelay = 80 + Math.random() * 120 // 80-200ms
          const extraDelay = Math.random() < 0.1 ? Math.random() * 300 : 0 // 10% chance de pausa larga
          await new Promise(resolve => setTimeout(resolve, baseDelay + extraDelay))

          // Simular eventos de teclado reales
          await page.evaluate((character, currentValue) => {
            const emailInput = document.querySelector('#email') as HTMLInputElement
            if (emailInput) {
              // Eventos de teclado reales
              const keydownEvent = new KeyboardEvent('keydown', {
                key: character,
                code: `Key${character.toUpperCase()}`,
                bubbles: true,
                cancelable: true
              })

              const keypressEvent = new KeyboardEvent('keypress', {
                key: character,
                code: `Key${character.toUpperCase()}`,
                bubbles: true,
                cancelable: true
              })

              const keyupEvent = new KeyboardEvent('keyup', {
                key: character,
                code: `Key${character.toUpperCase()}`,
                bubbles: true,
                cancelable: true
              })

              emailInput.dispatchEvent(keydownEvent)
              emailInput.dispatchEvent(keypressEvent)

              // Actualizar el valor
              emailInput.value = currentValue + character

              // Eventos de cambio
              emailInput.dispatchEvent(new Event('input', { bubbles: true }))
              emailInput.dispatchEvent(new Event('change', { bubbles: true }))
              emailInput.dispatchEvent(keyupEvent)

              // Simular focus/blur ocasional
              if (Math.random() < 0.05) { // 5% chance
                emailInput.blur()
                setTimeout(() => emailInput.focus(), 50)
              }
            }
          }, char, email.substring(0, i))
        }

        console.log('Email escrito completamente de manera realista')

        // Simular tab o click fuera para disparar validación
        await new Promise(resolve => setTimeout(resolve, 200))
        await page.keyboard.press('Tab')
        await new Promise(resolve => setTimeout(resolve, 500))

        // Esperar a que GitHub procese la validación automática
        console.log('Esperando validación automática de GitHub...')

        // Esperar activamente a que GitHub procese la validación (con más tiempo)
        try {
          console.log('Esperando respuesta de validación automática de GitHub...')

          // Monitorear cambios cada 500ms durante hasta 12 segundos
          let attempts = 0
          const maxAttempts = 24
          let lastState = 'unknown'

          while (attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 500))
            attempts++

            const currentState = await page.evaluate(() => {
              const autoCheck = document.querySelector('auto-check')
              if (!autoCheck) return { found: false }

              const hasErrored = autoCheck.classList.contains('errored')
              const hasSuccessed = autoCheck.classList.contains('successed')

              const emailInput = autoCheck.querySelector('#email')
              const hasInputError = emailInput?.classList.contains('is-autocheck-errored')
              const hasInputSuccess = emailInput?.classList.contains('is-autocheck-successful')

              const errorDiv = autoCheck.querySelector('div.error')
              const successDiv = autoCheck.querySelector('div.success')

              let state = 'unknown'
              if (hasErrored || hasInputError || errorDiv) state = 'error'
              if (hasSuccessed || hasInputSuccess || successDiv) state = 'success'

              return {
                found: true,
                state,
                autoCheckClasses: autoCheck.className,
                inputClasses: emailInput?.className || '',
                hasMessage: !!(errorDiv || successDiv),
                messageText: (errorDiv?.textContent || successDiv?.textContent || '').trim()
              }
            })

            console.log(`Intento ${attempts}/${maxAttempts} - Estado actual:`, currentState.state, 'Clases:', (currentState.autoCheckClasses || '').substring(0, 50) + '...')

            if (currentState.state !== 'unknown' && currentState.state !== lastState) {
              console.log('✅ ¡Cambio detectado! Validación completada:', currentState.state)
              if (currentState.messageText) {
                console.log('Mensaje detectado:', currentState.messageText)
              }
              break
            }

            lastState = currentState.state
          }

          if (attempts >= maxAttempts) {
            console.log('⚠️ Timeout después de 12 segundos - GitHub puede no haber procesado la validación')
          }

        } catch (error) {
          console.log('❌ Error durante espera de validación:', error)
        }

        // Espera final para asegurar DOM estable
        await new Promise(resolve => setTimeout(resolve, 2000))

        // Detección basada en la estructura real de GitHub
        let authMethod = 'UNKNOWN'
        let message = 'Respuesta desconocida de GitHub'

        console.log('Analizando estructura real de GitHub...')

        // Buscar elementos específicos según estructura HTML real
        const githubAnalysis = await page.evaluate(() => {
          const analysis: any = {
            found: false,
            autoCheckContainer: null,
            inputElement: null,
            messageContainer: null,
            messageText: '',
            state: 'unknown'
          }

          // Buscar el contenedor auto-check
          const autoCheck = document.querySelector('auto-check')
          if (autoCheck) {
            analysis.found = true
            analysis.autoCheckContainer = {
              classes: autoCheck.className,
              hasErrored: autoCheck.classList.contains('errored'),
              hasSuccessed: autoCheck.classList.contains('successed')
            }

            // Buscar el input de email dentro del auto-check
            const emailInput = autoCheck.querySelector('#email')
            if (emailInput) {
              analysis.inputElement = {
                classes: emailInput.className,
                hasErrorClass: emailInput.classList.contains('is-autocheck-errored'),
                hasSuccessClass: emailInput.classList.contains('is-autocheck-successful'),
                ariaInvalid: (emailInput as HTMLInputElement).getAttribute('aria-invalid')
              }
            }

            // Buscar contenedor de mensaje (div.error o div.success)
            const errorDiv = autoCheck.querySelector('div.error')
            const successDiv = autoCheck.querySelector('div.success')

            if (errorDiv) {
              analysis.messageContainer = {
                type: 'error',
                classes: errorDiv.className,
                visible: (errorDiv as HTMLElement).offsetParent !== null
              }
              const errorText = errorDiv.textContent?.trim() || ''
              analysis.messageText = errorText

              // Detectar texto específico de email registrado (múltiples patrones)
              const lowerErrorText = errorText.toLowerCase()
              if (lowerErrorText.includes('already associated with an account') ||
                lowerErrorText.includes('already associated with a github account') ||
                lowerErrorText.includes('already taken') ||
                lowerErrorText.includes('already exists') ||
                lowerErrorText.includes('already in use') ||
                lowerErrorText.includes('unavailable') ||
                lowerErrorText.includes('not available')) {
                analysis.state = 'registered'
              }
            } else if (successDiv) {
              analysis.messageContainer = {
                type: 'success',
                classes: successDiv.className,
                visible: (successDiv as HTMLElement).offsetParent !== null
              }
              const successText = successDiv.textContent?.trim() || ''
              analysis.messageText = successText

              // Detectar texto específico de email disponible (múltiples patrones)
              const lowerSuccessText = successText.toLowerCase()
              if (lowerSuccessText.includes('email is available') ||
                lowerSuccessText.includes('available') ||
                lowerSuccessText.includes('valid') ||
                lowerSuccessText.includes('looks good') ||
                lowerSuccessText.includes('great')) {
                analysis.state = 'available'
              }
            }

            // Método de respaldo por clases CSS si no hay mensaje
            if (analysis.state === 'unknown') {
              if (analysis.autoCheckContainer.hasErrored ||
                (analysis.inputElement?.hasErrorClass) ||
                (analysis.inputElement?.ariaInvalid === 'true')) {
                analysis.state = 'registered'
              } else if (analysis.autoCheckContainer.hasSuccessed ||
                (analysis.inputElement?.hasSuccessClass) ||
                (analysis.inputElement?.ariaInvalid === 'false')) {
                analysis.state = 'available'
              }
            }

            // Método adicional: buscar por otros selectores si aún no se determina
            if (analysis.state === 'unknown') {
              // Buscar cualquier div con clase 'error' visible
              const anyErrorDiv = document.querySelector('div[class*="error"]')
              if (anyErrorDiv && (anyErrorDiv as HTMLElement).offsetParent !== null) {
                const errorContent = anyErrorDiv.textContent?.toLowerCase() || ''
                if (errorContent.includes('already') || errorContent.includes('associated') || errorContent.includes('taken')) {
                  analysis.state = 'registered'
                  analysis.messageText = anyErrorDiv.textContent?.trim() || ''
                }
              }

              // Buscar cualquier div con clase 'success' visible
              const anySuccessDiv = document.querySelector('div[class*="success"]')
              if (anySuccessDiv && (anySuccessDiv as HTMLElement).offsetParent !== null) {
                const successContent = anySuccessDiv.textContent?.toLowerCase() || ''
                if (successContent.includes('available') || successContent.includes('valid')) {
                  analysis.state = 'available'
                  analysis.messageText = anySuccessDiv.textContent?.trim() || ''
                }
              }
            }
          }

          return analysis
        })

        console.log('Análisis completo de GitHub:', JSON.stringify(githubAnalysis, null, 2))

        if (githubAnalysis.found) {
          switch (githubAnalysis.state) {
            case 'registered':
              authMethod = 'REGISTERED'
              message = 'Email ya registrado en GitHub'
              if (githubAnalysis.messageText) {
                message += ': ' + githubAnalysis.messageText.substring(0, 100)
              }
              console.log('✅ GitHub DEFINITIVO: Email REGISTRADO')
              break

            case 'available':
              authMethod = 'NOT_REGISTERED'
              message = 'Email disponible en GitHub'
              if (githubAnalysis.messageText) {
                message += ': ' + githubAnalysis.messageText
              }
              console.log('✅ GitHub DEFINITIVO: Email DISPONIBLE')
              break

            default:
              authMethod = 'UNKNOWN'
              message = 'No se pudo determinar estado específico en GitHub'
              console.log('❌ GitHub: Estado indeterminado')

              // Log adicional de clases encontradas para debugging
              if (githubAnalysis.autoCheckContainer) {
                console.log('Clases auto-check:', githubAnalysis.autoCheckContainer.classes)
              }
              if (githubAnalysis.inputElement) {
                console.log('Clases input:', githubAnalysis.inputElement.classes)
              }
              break
          }
        } else {
          authMethod = 'UNKNOWN'
          message = 'No se encontró la estructura esperada de GitHub'
          console.log('❌ No se encontró el elemento auto-check en GitHub')
        }

        console.log('🎯 RESULTADO FINAL GitHub:', { authMethod, message })

        await browser.close()

        return NextResponse.json({
          success: true,
          authMethod: authMethod,
          platform: 'GitHub.com',
          rawResponse: { message, autoValidation: true }
        })

      } catch (error) {
        console.error('Error verificando GitHub:', error)

        let errorMessage = 'Error desconocido'
        if (error instanceof Error) {
          if (error.message.includes('timeout')) {
            errorMessage = 'Timeout al conectar con GitHub.com. Reintenta más tarde.'
          } else if (error.message.includes('ENOTFOUND')) {
            errorMessage = 'No se pudo conectar con GitHub.com. Verifica tu conexión.'
          } else {
            errorMessage = error.message
          }
        }

        return NextResponse.json({
          success: false,
          error: 'Error al verificar en GitHub: ' + errorMessage
        })
      }
    }

    if (platform === 'chess.com') {
      let browser = null

      try {
        addServerLog('Verificando email en Chess.com...')

        // PASO 1: Verificación previa con EmailValidationService API
        addServerLog('Paso 1: Verificación rápida con API de Chess.com...')

        try {
          const emailValidationResponse = await fetch('https://www.chess.com/rpc/chesscom.authentication.v1.EmailValidationService/Validate', {
            method: 'POST',
            headers: {
              'accept': 'application/json, text/plain, */*',
              'accept-language': 'en_US',
              'connect-protocol-version': '1',
              'content-type': 'application/json',
              'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36'
            },
            body: JSON.stringify({ email: email })
          })

          if (emailValidationResponse.ok) {
            const validationResult = await emailValidationResponse.json()
            addServerLog('Respuesta de API: ' + JSON.stringify(validationResult))

            // Si el email NO está registrado, retornar inmediatamente
            if (validationResult.status !== 'EMAIL_STATUS_TAKEN') {
              addServerLog('Email no registrado en Chess.com (verificación API)')
              return NextResponse.json({
                success: true,
                authMethod: 'NOT_REGISTERED',
                platform: 'Chess.com',
                message: 'Email no registrado en Chess.com',
                serverLogs: serverLogs
              })
            }

            addServerLog('Email registrado confirmado')

            // Si solo es verificación, retornar aquí
            if (mode === 'verify') {
              addServerLog('Modo verificación solamente - retornando estado registrado')
              return NextResponse.json({
                success: true,
                authMethod: 'REGISTERED',
                platform: 'Chess.com',
                message: 'Email ya registrado en la plataforma',
                serverLogs: serverLogs
              })
            }

            addServerLog('Modo extracción - continuando con obtención de datos del perfil...')
          } else {
            addServerLog('API de validación no disponible, continuando con método completo...')
          }
        } catch (apiError) {
          addServerLog('Error en API de validación: ' + (apiError instanceof Error ? apiError.message : 'Error desconocido'))
          addServerLog('Continuando con método completo como fallback...')
        }

        // PASO 2: Si llegamos aquí, el email está registrado - proceder con extracción completa
        addServerLog('Paso 2: Iniciando extracción completa de datos del perfil...')

        // Usar las credenciales proporcionadas en la request (configuradas por el usuario)
        // El email a verificar es el que usamos como login si no se especifica otro, 
        // pero para Chess.com necesitamos una cuenta PROPIA para loguearnos y buscar

        // Recuperar credenciales del usuario (pass) y el email configurado (que puede ser distinto al email que buscamos)
        // NOTA: Como el backend recibe 'email' como el email TARGET a buscar, 
        // necesitamos saber cuál es el email de la CUENTA de chess.com que se usará para el login.
        // Asumiremos que se pasa como 'chessEmail' si existe, o usaremos el mismo email si es self-check (poco probable en OSINT).
        // En la implementación actual del frontend, parece que no se envía 'chessEmail' separado.
        // Requeriremos implementar eso en el frontend también si queremos separar "email a buscar" de "email de login".

        // POR AHORA: Usaremos el password recibido. El email de login debería venir en el request también.
        // Vamos a modificar para que reciba 'sourceEmail' o similar, o asumiremos que el frontend enviará 
        // 'chessAccountEmail' para el login.

        // Check if we received login credentials
        if (!chessPassword || !chessAccountEmail) {
          addServerLog('No hay contraseña de Chess.com configurada')
          return NextResponse.json({
            success: true,
            authMethod: 'REGISTERED',
            platform: 'Chess.com',
            message: 'Email registrado pero se requiere conectar una cuenta de Chess.com (con contraseña) para extraer datos',
            serverLogs: serverLogs
          })
        }

        // Necesitamos el email de la cuenta DE CHESS con la que nos logueamos.
        // Leeremos 'chessAccountEmail' del body.
        const chessEmail = chessAccountEmail

        const loginEmail = request.json().then(body => body.chessAccountEmail).catch(() => '')

        // Wait, request.json() can only be consumed once. We already consumed it at line 30.
        // We need to add chessAccountEmail to the destructuring at line 30.


        addServerLog('Iniciando navegador para Chess.com...')
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

        // Configurar timeouts y User Agent
        page.setDefaultTimeout(60000)
        page.setDefaultNavigationTimeout(60000)
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36')
        await page.setViewport({ width: 1366, height: 768 })

        // Paso 1: Iniciar sesión en Chess.com
        addServerLog('Iniciando sesión en Chess.com...')

        try {
          await page.goto('https://www.chess.com/login', {
            waitUntil: 'domcontentloaded',
            timeout: 60000
          })
          addServerLog('Página de login cargada')

          await page.waitForSelector('#login-username', { timeout: 15000 })
          addServerLog('Campo de usuario encontrado')

          await page.type('#login-username', chessEmail, { delay: 100 })
          await page.waitForSelector('#login-password', { timeout: 10000 })
          await page.type('#login-password', chessPassword, { delay: 100 })
          addServerLog('Credenciales ingresadas')

          // Hacer clic y esperar respuesta
          await Promise.all([
            page.waitForNavigation({
              waitUntil: 'domcontentloaded',
              timeout: 60000
            }),
            page.click('#login')
          ])
          addServerLog('Login completado')

        } catch (loginError) {
          addServerLog('Error durante login: ' + (loginError instanceof Error ? loginError.message : 'Error desconocido'))

          // Intentar método alternativo de login
          addServerLog('Intentando método alternativo de login...')
          await page.goto('https://www.chess.com/home', {
            waitUntil: 'domcontentloaded',
            timeout: 30000
          })
        }

        // Verificar que el login fue exitoso
        const currentUrl = page.url()
        if (!currentUrl.includes('chess.com/home')) {
          addServerLog('Error: No se pudo iniciar sesión en Chess.com')
          return NextResponse.json({
            success: true,
            authMethod: 'UNKNOWN',
            platform: 'Chess.com',
            message: 'Error de autenticación',
            serverLogs: serverLogs
          })
        }

        addServerLog('Sesión iniciada exitosamente')

        // Paso 4: Primero ir a solicitudes pendientes para capturar lista inicial
        addServerLog('Capturando lista inicial de solicitudes pendientes...')
        await page.goto('https://www.chess.com/friends/pending?tab=outgoing', {
          waitUntil: 'domcontentloaded',
          timeout: 15000
        })

        // Esperar a que aparezca el contenido específico
        try {
          await page.waitForSelector('.friends-pending-wrapper, #tab-outgoing, .friends-pending-tab-button', { timeout: 10000 })
          addServerLog('Página de solicitudes pendientes cargada exitosamente')
        } catch (e) {
          addServerLog('Timeout esperando elementos de la página, continuando...')
        }

        await new Promise(resolve => setTimeout(resolve, 2000))

        // Hacer clic en la pestaña "Enviados" para asegurar que estamos en la pestaña correcta
        try {
          await page.click('#tab-outgoing')
          addServerLog('Pestaña Enviados activada')
        } catch (e) {
          addServerLog('No se pudo hacer clic en pestaña Enviados, puede que ya esté activa')
        }

        await new Promise(resolve => setTimeout(resolve, 2000))

        // Función para extraer usuarios de solicitudes pendientes
        const extractPendingUsers = async () => {
          return await page.evaluate(() => {
            const users: any[] = []
            const pendingItems = document.querySelectorAll('.friends-pending-item[data-user-uuid]')

            pendingItems.forEach(item => {
              const uuid = item.getAttribute('data-user-uuid') || ''
              const usernameLink = item.querySelector('a[href*="/member/"]') as HTMLAnchorElement
              const username = usernameLink ? usernameLink.href.split('/member/')[1] : ''
              const usernameText = item.querySelector('.cc-user-username-component')?.textContent?.trim() || ''

              if (uuid && (username || usernameText)) {
                users.push({
                  uuid: uuid,
                  username: username || usernameText,
                  href: usernameLink?.href || `https://www.chess.com/member/${username || usernameText}`
                })
              }
            })

            return users
          })
        }

        // Capturar lista inicial de usuarios
        const initialPendingUsers = await extractPendingUsers()
        addServerLog('Lista inicial de solicitudes pendientes: ' + JSON.stringify(initialPendingUsers, null, 2))

        // Paso 5: Navegar a la página de amigos para enviar invitación
        addServerLog('Navegando a la página de amigos para enviar invitación...')
        await page.goto('https://www.chess.com/friends', {
          waitUntil: 'domcontentloaded',
          timeout: 45000
        })

        // Paso 6: Abrir modal de invitación por email
        addServerLog('Abriendo modal de invitación por email...')
        await page.click('#show-email-invite-modal')

        // Esperar que aparezca el modal
        await page.waitForSelector('#email-invite', { timeout: 10000 })

        // Paso 4: Escribir el email en el campo de invitación
        addServerLog(`Buscando email: ${email}`)
        await page.type('#email-invite', email)

        // Paso 4.5: Presionar Enter para procesar el email
        addServerLog('Presionando Enter para procesar el email...')
        await page.keyboard.press('Enter')

        // Esperar un poco para que se procese
        await new Promise(resolve => setTimeout(resolve, 2000))

        // Paso 5: Esperar que el botón "Invitar" se habilite
        addServerLog('Esperando que el botón Invitar se habilite...')

        try {
          // Esperar hasta 15 segundos a que el botón se habilite
          await page.waitForFunction(() => {
            const buttons = Array.from(document.querySelectorAll('button'))
            const inviteButton = buttons.find(btn =>
              btn.textContent?.toLowerCase().includes('invitar') ||
              btn.textContent?.toLowerCase().includes('invite')
            ) as HTMLButtonElement

            return inviteButton && !inviteButton.disabled &&
              !inviteButton.classList.contains('cc-button-disabled')
          }, { timeout: 15000 })

          addServerLog('Botón Invitar habilitado, haciendo clic...')
        } catch (timeoutError) {
          addServerLog('Timeout esperando que se habilite el botón, verificando estado actual...')

          // Debuggear el estado actual de los botones
          const buttonInfo = await page.evaluate(() => {
            const buttons = document.querySelectorAll('button')
            const buttonDetails = Array.from(buttons).map((btn: any) => ({
              text: btn.textContent?.trim(),
              classes: btn.className,
              disabled: btn.disabled,
              hasDisabledClass: btn.classList.contains('cc-button-disabled')
            }))
            return buttonDetails
          })

          addServerLog('Estado actual de botones: ' + JSON.stringify(buttonInfo, null, 2))

          // Verificar si hay algún error en el campo de email
          const emailFieldError = await page.evaluate(() => {
            const emailField = document.querySelector('#email-invite')
            const errorElements = document.querySelectorAll('.error, [class*="error"], .invalid, [class*="invalid"]')

            return {
              emailValue: (emailField as HTMLInputElement)?.value,
              hasError: errorElements.length > 0,
              errorMessages: Array.from(errorElements).map(el => el.textContent?.trim())
            }
          })

          addServerLog('Estado del campo email: ' + JSON.stringify(emailFieldError, null, 2))
        }

        // Hacer clic específicamente en el botón Invitar habilitado
        const clicked = await page.evaluate(() => {
          const buttons = Array.from(document.querySelectorAll('button'))
          const inviteButton = buttons.find(btn =>
            btn.textContent?.toLowerCase().includes('invitar') ||
            btn.textContent?.toLowerCase().includes('invite')
          ) as HTMLButtonElement

          if (inviteButton && !inviteButton.disabled &&
            !inviteButton.classList.contains('cc-button-disabled')) {
            inviteButton.click()
            return true
          }
          return false
        })

        if (clicked) {
          addServerLog('Botón Invitar clickeado exitosamente')
        } else {
          addServerLog('El botón Invitar aún está deshabilitado - puede que el email no sea válido')

          // Método fallback: limpiar campo, volver a escribir y presionar Enter
          addServerLog('Intentando método fallback: limpiar y volver a escribir...')

          // Limpiar el campo
          await page.click('#email-invite', { clickCount: 3 }) // Seleccionar todo
          await page.keyboard.press('Delete')

          // Volver a escribir el email
          await page.type('#email-invite', email, { delay: 100 })

          // Presionar Enter nuevamente
          await page.keyboard.press('Enter')

          // Esperar más tiempo
          await new Promise(resolve => setTimeout(resolve, 3000))

          // Reintentar click
          const fallbackClicked = await page.evaluate(() => {
            const buttons = Array.from(document.querySelectorAll('button'))
            const inviteButton = buttons.find(btn =>
              btn.textContent?.toLowerCase().includes('invitar') ||
              btn.textContent?.toLowerCase().includes('invite')
            ) as HTMLButtonElement

            if (inviteButton && !inviteButton.disabled &&
              !inviteButton.classList.contains('cc-button-disabled')) {
              inviteButton.click()
              return true
            }
            return false
          })

          if (fallbackClicked) {
            addServerLog('Método fallback exitoso - botón clickeado')
          } else {
            addServerLog('Método fallback falló - botón sigue deshabilitado')
          }
        }

        // Esperar la respuesta del servidor
        addServerLog('Esperando respuesta de la invitación...')
        await new Promise(resolve => setTimeout(resolve, 5000))

        // Paso 6: Verificar si la invitación fue exitosa y navegar a las solicitudes enviadas
        const invitationResult = await page.evaluate(() => {
          let result: any = {
            found: false,
            error: false,
            message: '',
            userInfo: {}
          }

          // Buscar mensajes de error o éxito
          const errorMessage = document.querySelector('.error, .alert-error, [class*="error"]')
          const successMessage = document.querySelector('.success, .alert-success, [class*="success"]')

          if (errorMessage) {
            result.error = true
            result.message = errorMessage.textContent?.trim() || ''
          }

          if (successMessage) {
            result.message = successMessage.textContent?.trim() || ''
            // Si el mensaje indica éxito en la invitación, el usuario existe
            if (result.message.toLowerCase().includes('invited') ||
              result.message.toLowerCase().includes('sent') ||
              result.message.toLowerCase().includes('enviada')) {
              result.found = true
            }
          }

          return result
        })

        addServerLog('Resultado de la invitación: ' + JSON.stringify(invitationResult, null, 2))

        if (invitationResult.found && invitationResult.message.toLowerCase().includes('enviada')) {
          addServerLog('Invitación enviada exitosamente, navegando a solicitudes de amistad...')

          // Paso 7: Ir a la sección de solicitudes de amistad enviadas
          // Primero cerrar el modal si está abierto
          try {
            await page.click('.cc-close-button-component, .cc-modal-close-component')
            await new Promise(resolve => setTimeout(resolve, 1000))
          } catch (e) { }

          // Buscar y hacer clic en "Solicitudes de amistad"
          addServerLog('Buscando sección de solicitudes de amistad...')

          const friendRequestsFound = await page.evaluate(() => {
            // Buscar el enlace o botón de solicitudes de amistad
            const elements = Array.from(document.querySelectorAll('a, button, [class*="friend"], [class*="request"]'))
            const friendRequestsElement = elements.find(el =>
              el.textContent?.toLowerCase().includes('solicitudes') ||
              el.textContent?.toLowerCase().includes('requests') ||
              el.textContent?.toLowerCase().includes('enviados')
            )

            if (friendRequestsElement) {
              (friendRequestsElement as HTMLElement).click()
              return true
            }
            return false
          })

          if (!friendRequestsFound) {
            // Intentar navegar directamente
            addServerLog('Navegando directamente a solicitudes de amistad...')
            await page.goto('https://www.chess.com/friends/pending?tab=outgoing', {
              waitUntil: 'domcontentloaded',
              timeout: 15000
            })

            // Esperar a que aparezca el contenido específico
            try {
              await page.waitForSelector('.friends-pending-wrapper, #tab-outgoing, .friends-pending-tab-button', { timeout: 10000 })
              addServerLog('Página de solicitudes pendientes cargada exitosamente')
            } catch (e) {
              addServerLog('Timeout esperando elementos de la página, continuando...')
            }
          }

          await new Promise(resolve => setTimeout(resolve, 2000))

          // Paso 8: Comparar listas antes y después para encontrar el usuario nuevo
          addServerLog('Comparando listas de solicitudes pendientes...')

          // Hacer clic en la pestaña "Enviados" 
          try {
            await page.click('#tab-outgoing')
            addServerLog('Haciendo clic en pestaña Enviados')
          } catch (e) {
            addServerLog('No se pudo hacer clic en pestaña Enviados, intentando selector alternativo')
            await page.evaluate(() => {
              const tab = document.querySelector('button[data-tab-url-param="outgoing"], [role="tab"]:last-child')
              if (tab) {
                (tab as HTMLElement).click()
              }
            })
          }

          // Esperar que se cargue el contenido de la pestaña
          await new Promise(resolve => setTimeout(resolve, 3000))

          // Capturar lista actual (después del envío)
          const currentPendingUsers = await extractPendingUsers()
          addServerLog('Lista actual de solicitudes pendientes: ' + JSON.stringify(currentPendingUsers, null, 2))

          // Comparar listas para encontrar el usuario nuevo
          const newUsers = currentPendingUsers.filter(currentUser =>
            !initialPendingUsers.some(initialUser => initialUser.uuid === currentUser.uuid)
          )

          addServerLog('Usuarios nuevos encontrados: ' + JSON.stringify(newUsers, null, 2))

          if (newUsers.length === 0) {
            addServerLog('No se encontró ningún usuario nuevo - el email no está vinculado a una cuenta de Chess.com')

            await browser.close()
            addServerLog('Navegador cerrado')

            return NextResponse.json({
              success: true,
              authMethod: 'NOT_REGISTERED',
              platform: 'Chess.com',
              message: 'Email no está vinculado a una cuenta de Chess.com',
              serverLogs: serverLogs
            })
          }

          if (newUsers.length > 1) {
            addServerLog('Advertencia: Se encontraron múltiples usuarios nuevos, usando el primero')
          }

          // Usar el primer (o único) usuario nuevo como la cuenta vinculada al email
          const linkedUser = newUsers[0]
          addServerLog('Usuario vinculado al email encontrado: ' + JSON.stringify(linkedUser, null, 2))

          // Navegar al perfil del usuario encontrado
          addServerLog(`Navegando al perfil del usuario: ${linkedUser.username}`)
          await page.goto(`https://www.chess.com/member/${linkedUser.username}`, {
            waitUntil: 'domcontentloaded',
            timeout: 45000
          })
          await new Promise(resolve => setTimeout(resolve, 3000))

          // Extraer datos completos del perfil
          addServerLog('Extrayendo datos completos del perfil...')
          const fullProfileData = await page.evaluate(() => {
            const data: any = {}

            // Datos del contenedor principal de perfil
            const profileContainer = document.querySelector('.profile-header-container')
            if (profileContainer) {
              data.username = profileContainer.getAttribute('data-username') || ''
              data.userId = profileContainer.getAttribute('data-user-id') || ''
              data.uuid = profileContainer.getAttribute('data-user-uuid') || ''
            }

            // Username también del h1
            const usernameH1 = document.querySelector('.profile-card-username')
            if (usernameH1 && !data.username) {
              data.username = usernameH1.textContent?.trim() || ''
            }

            // Avatar/Picture (buscar la imagen más grande del perfil)
            const avatarImg = document.querySelector('.profile-header-user-avatar img, .cc-avatar-img') as HTMLImageElement
            if (avatarImg) {
              data.picture = avatarImg.src
            }

            // Nombre completo del perfil
            const nameElement = document.querySelector('.profile-card-name')
            if (nameElement) {
              data.name = nameElement.textContent?.trim() || ''
            }

            // País - extraer del tooltip y de la clase
            const countryElement = document.querySelector('.country-flags-component, [class*="country"]')
            if (countryElement) {
              // Intentar obtener el nombre completo del país del tooltip
              const tooltip = countryElement.getAttribute('v-tooltip')
              if (tooltip) {
                data.country = tooltip
              } else {
                // Si no hay tooltip, extraer código del país de la clase
                const countryMatch = countryElement.className.match(/country-([a-z0-9]+)/i)
                data.country = countryMatch ? countryMatch[1] : ''
              }
            }

            // Ubicación/Location (si está disponible en algún lugar del perfil)
            const locationElement = document.querySelector('.profile-card-location, [class*="location"]')
            if (locationElement) {
              data.location = locationElement.textContent?.trim() || ''
            } else {
              data.location = '' // No siempre está disponible
            }

            // Último acceso - buscar específicamente en profile-last-login
            const lastLoginContainer = document.querySelector('#profile-last-login')
            if (lastLoginContainer) {
              // Buscar dentro del contenedor el elemento que tiene "Última conexión"
              const lastLoginElement = lastLoginContainer.querySelector('.profile-header-details-item')
              if (lastLoginElement && lastLoginElement.textContent?.includes('Última conexión')) {
                const valueElement = lastLoginElement.querySelector('.profile-header-details-value')
                if (valueElement) {
                  data.lastOnline = valueElement.textContent?.trim() || ''
                }
              }
            }

            // Método alternativo si el anterior no funciona - buscar por texto directamente
            if (!data.lastOnline) {
              const allDetailsItems = document.querySelectorAll('.profile-header-details-item')
              allDetailsItems.forEach(element => {
                const text = element.textContent || ''
                if (text.includes('Última conexión') || text.includes('Last login')) {
                  const valueElement = element.querySelector('.profile-header-details-value')
                  if (valueElement && !data.lastOnline) {
                    data.lastOnline = valueElement.textContent?.trim() || ''
                  }
                }
              })
            }

            // Fecha de creación de cuenta - buscar "Se unió el"
            const joinedElements = document.querySelectorAll('.profile-header-details-item')
            joinedElements.forEach(element => {
              const text = element.textContent || ''
              if (text.includes('Se unió el') || text.includes('Joined')) {
                const valueElement = element.querySelector('.profile-header-details-value')
                if (valueElement) {
                  data.accountCreationDate = valueElement.textContent?.trim() || ''
                }
              }
            })

            // URL del perfil
            data.profile = window.location.href

            return data
          })

          addServerLog('Datos completos del perfil extraídos: ' + JSON.stringify(fullProfileData, null, 2))

          // Paso 11: Cancelar la solicitud de amistad automáticamente
          addServerLog('Cancelando solicitud de amistad...')

          try {
            // Buscar el botón de cancelar solicitud
            const cancelButton = await page.$('button.cc-button-component.cc-button-secondary.cc-button-medium.cc-bg-secondary')

            if (cancelButton) {
              // Verificar que el botón contenga el texto "Cancelar solicitud"
              const buttonText = await page.evaluate(el => el.textContent, cancelButton)

              if (buttonText && (buttonText.includes('Cancelar solicitud') || buttonText.includes('Cancel request'))) {
                // Hacer clic en el botón de cancelar
                await cancelButton.click()
                addServerLog('Clic en botón de cancelar solicitud ejecutado')

                // Esperar un momento para que se procese la cancelación
                await new Promise(resolve => setTimeout(resolve, 2000))

                // Verificar que la solicitud se canceló correctamente
                const requestCancelled = await page.evaluate(() => {
                  // Buscar si apareció un botón de "Enviar solicitud de amistad" o similar
                  const addFriendButton = document.querySelector('button[data-cy*="friend"], button:contains("Add Friend"), button:contains("Agregar amigo")')
                  return !!addFriendButton
                })

                if (requestCancelled) {
                  addServerLog('Solicitud de amistad cancelada exitosamente')
                } else {
                  addServerLog('Solicitud cancelada (confirmación visual no encontrada)')
                }
              } else {
                addServerLog('Botón encontrado pero no contiene texto de cancelar solicitud: ' + buttonText)
              }
            } else {
              addServerLog('No se encontró el botón de cancelar solicitud (ya podría estar cancelada o no existir)')
            }
          } catch (cancelError) {
            addServerLog('Error al cancelar solicitud: ' + (cancelError instanceof Error ? cancelError.message : 'Error desconocido'))
          }

          await browser.close()
          addServerLog('Navegador cerrado')

          return NextResponse.json({
            success: true,
            authMethod: 'REGISTERED',
            platform: 'Chess.com',
            message: 'Usuario encontrado y datos extraídos completamente',
            profileData: fullProfileData,
            serverLogs: serverLogs
          })
        }

      } catch (error) {
        console.error('Error verificando Chess.com:', error)
        addServerLog('Error: ' + (error instanceof Error ? error.message : 'Error desconocido'))

        if (browser) {
          await browser.close()
          addServerLog('Navegador cerrado')
        }

        return NextResponse.json({
          success: true,
          authMethod: 'UNKNOWN',
          platform: 'Chess.com',
          message: 'Error al verificar en Chess.com: ' + (error instanceof Error ? error.message : 'Error desconocido'),
          serverLogs: serverLogs
        })
      }
    }

    if (platform === 'joomla.org') {
      console.log('Verificando email en Joomla.org...')

      try {
        const browser = await puppeteer.launch({
          headless: true,
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-blink-features=AutomationControlled',
            '--disable-web-security',
            '--disable-features=VizDisplayCompositor',
            '--disable-infobars',
            '--window-size=1920,1080',
            '--disable-extensions',
            '--no-first-run',
            '--ignore-certificate-errors',
            '--ignore-ssl-errors',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-zygote',
            '--disable-gpu'
          ]
        })

        const page = await browser.newPage()

        // Técnicas anti-detección avanzadas
        await page.evaluateOnNewDocument(() => {
          Object.defineProperty(navigator, 'webdriver', {
            get: () => undefined,
          });
          Object.defineProperty(navigator, 'plugins', {
            get: () => [1, 2, 3, 4, 5],
          });
          Object.defineProperty(navigator, 'languages', {
            get: () => ['en-US', 'en'],
          });
        })

        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36')
        await page.setViewport({ width: 1920, height: 1080 })

        // Navegar a la página de registro de Joomla
        console.log('Navegando a la página de registro de Joomla...')
        await page.goto('https://identity.joomla.org/register', {
          waitUntil: 'domcontentloaded',
          timeout: 30000
        })

        console.log('Página de Joomla cargada')
        await new Promise(resolve => setTimeout(resolve, 2000))

        // Generar datos aleatorios y llenar formulario automáticamente
        const randomName = 'John Smith ' + Math.floor(Math.random() * 10000)
        const randomPassword = 'MySecure123Pass' + Math.floor(Math.random() * 1000) + '!'

        console.log('Llenando campos automáticamente...')

        await page.focus('#jform_name')
        await page.type('#jform_name', randomName, { delay: 85 })
        await new Promise(resolve => setTimeout(resolve, 500))

        await page.focus('#jform_email')
        await page.type('#jform_email', email, { delay: 92 })
        await new Promise(resolve => setTimeout(resolve, 800))

        await page.focus('#jform_password1')
        await page.type('#jform_password1', randomPassword, { delay: 76 })
        await new Promise(resolve => setTimeout(resolve, 400))

        await page.focus('#jform_password2')
        await page.type('#jform_password2', randomPassword, { delay: 81 })
        await new Promise(resolve => setTimeout(resolve, 600))

        await page.hover('#jform_consent')
        await new Promise(resolve => setTimeout(resolve, 300))
        await page.click('#jform_consent')
        await new Promise(resolve => setTimeout(resolve, 1000))

        console.log('Formulario llenado, buscando captcha...')

        // Buscar el captcha y capturar su iframe
        const captchaFrame = await page.$('iframe[src*="hcaptcha"]')
        if (captchaFrame) {
          console.log('hCaptcha encontrado, capturando para mostrar al usuario...')

          // Obtener el sitekey del captcha para reconstruirlo en el frontend
          const captchaElement = await page.$('.h-captcha')
          const sitekey = await page.evaluate(el => el?.getAttribute('data-sitekey'), captchaElement)

          console.log('Captcha sitekey:', sitekey)

          // Mantener el browser abierto y registrar sesión para continuar después del captcha
          const sessionId = Date.now().toString()

          // Registrar sesión en el Map global
          joomlaSessions.set(sessionId, { browser, page })
          console.log(`Sesión ${sessionId} registrada, esperando resolución del captcha...`)
          console.log(`Total sesiones activas: ${joomlaSessions.size}`)

          // Limpiar sesión después de 5 minutos si no se usa
          setTimeout(() => {
            const session = joomlaSessions.get(sessionId)
            if (session) {
              try {
                session.browser.close()
              } catch (e) { }
              joomlaSessions.delete(sessionId)
              console.log('Sesión limpiada por timeout:', sessionId)
            }
          }, 5 * 60 * 1000) // 5 minutos

          return NextResponse.json({
            success: true,
            authMethod: 'CAPTCHA_REQUIRED',
            platform: 'Joomla.org',
            rawResponse: {
              message: 'Formulario llenado - Resuelve el captcha',
              sitekey: sitekey || 'c1b1102f-0fd0-4efe-9832-1acbef2e0597',
              captchaReady: true,
              sessionId: sessionId,
              email: email,
              formFilled: true
            }
          })
        } else {
          console.log('No se encontró captcha, intentando enviar formulario directamente...')

          // Si no hay captcha, enviar formulario directamente
          await page.click('button[type="submit"]')
          await new Promise(resolve => setTimeout(resolve, 5000))

          // Verificar resultados
          const errorAlert = await page.$('.alert-error .alert-message')
          let authMethod = 'UNKNOWN'
          let message = 'Respuesta desconocida'

          if (errorAlert) {
            const errorText = await page.evaluate(el => el.textContent, errorAlert)
            if (errorText.includes('email address you entered is already in use')) {
              authMethod = 'REGISTERED'
              message = 'Email ya registrado en Joomla'
            }
          } else {
            const currentUrl = page.url()
            if (currentUrl !== 'https://identity.joomla.org/register') {
              authMethod = 'NOT_REGISTERED'
              message = 'Email disponible en Joomla'
            }
          }

          await browser.close()

          return NextResponse.json({
            success: true,
            authMethod: authMethod,
            platform: 'Joomla.org',
            rawResponse: { message, noCaptcha: true }
          })
        }

      } catch (error) {
        console.error('Error verificando Joomla:', error)

        let errorMessage = 'Error desconocido'
        if (error instanceof Error) {
          if (error.message.includes('timeout')) {
            errorMessage = 'Timeout al conectar con Joomla.org. Reintenta más tarde.'
          } else if (error.message.includes('ENOTFOUND')) {
            errorMessage = 'No se pudo conectar con Joomla.org. Verifica tu conexión.'
          } else {
            errorMessage = error.message
          }
        }

        return NextResponse.json({
          success: false,
          error: 'Error al verificar en Joomla: ' + errorMessage
        })
      }
    }

    if (platform === 'adobe.com') {
      try {
        console.log('Verificando email en Adobe.com...')

        const headers = {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36',
          'Accept': 'application/json, text/plain, */*',
          'Accept-Language': 'en-US,en;q=0.5',
          'X-IMS-CLIENTID': 'adobedotcom2',
          'Content-Type': 'application/json;charset=utf-8',
          'Origin': 'https://auth.services.adobe.com',
          'DNT': '1',
          'Connection': 'keep-alive'
        }

        const data = {
          username: email,
          accountType: 'individual'
        }

        // Paso 1: Verificar estado de autenticación
        const response = await fetch('https://auth.services.adobe.com/signin/v1/authenticationstate', {
          method: 'POST',
          headers: headers,
          body: JSON.stringify(data)
        })

        let authMethod = 'UNKNOWN'
        let adobeData = null
        let recoveryInfo = null

        if (response.ok) {
          const authData = await response.json()
          console.log('Respuesta de Adobe (auth):', authData)

          // Si hay errorCode, la cuenta no existe
          if (authData.errorCode) {
            authMethod = 'NOT_REGISTERED'
          } else {
            // Paso 2: Intentar obtener información de recuperación
            const authStateHeader = response.headers.get('x-ims-authentication-state-encrypted')

            if (authStateHeader) {
              const challengeHeaders = {
                ...headers,
                'X-IMS-Authentication-State-Encrypted': authStateHeader
              }

              const challengeResponse = await fetch('https://auth.services.adobe.com/signin/v2/challenges?purpose=passwordRecovery', {
                method: 'GET',
                headers: challengeHeaders
              })

              if (challengeResponse.ok) {
                const challengeData = await challengeResponse.json()
                console.log('Respuesta de Adobe (challenges):', challengeData)

                if (challengeData.errorCode) {
                  authMethod = 'REGISTERED'
                } else {
                  authMethod = 'REGISTERED'
                  recoveryInfo = {
                    secondaryEmail: challengeData.secondaryEmail || null,
                    phoneNumber: challengeData.securityPhoneNumber || null
                  }
                }
              } else {
                authMethod = 'REGISTERED'
              }
            } else {
              authMethod = 'REGISTERED'
            }
          }

          adobeData = authData
        } else if (response.status === 401) {
          // HTTP 401 en Adobe significa que el email no está registrado
          // Intentar leer la respuesta JSON para confirmar
          try {
            const authData = await response.json()
            console.log('Respuesta de Adobe (401):', authData)

            if (authData.errorCode) {
              authMethod = 'NOT_REGISTERED'
              adobeData = authData
            } else {
              throw new Error(`HTTP error! status: ${response.status}`)
            }
          } catch (jsonError) {
            // Si no se puede parsear JSON, tratar como error real
            throw new Error(`HTTP error! status: ${response.status}`)
          }
        } else {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        return NextResponse.json({
          success: true,
          authMethod: authMethod,
          platform: 'Adobe.com',
          message: authMethod === 'REGISTERED' ? 'Email ya registrado en la plataforma' :
            authMethod === 'NOT_REGISTERED' ? 'Email no registrado' : 'Estado desconocido',
          recoveryInfo: recoveryInfo,
          rawResponse: adobeData
        })

      } catch (error) {
        console.error('Error verificando Adobe:', error)

        let errorMessage = 'Error desconocido'
        if (error instanceof Error) {
          if (error.message.includes('timeout')) {
            errorMessage = 'Timeout al conectar con Adobe.com. Reintenta más tarde.'
          } else if (error.message.includes('ENOTFOUND')) {
            errorMessage = 'No se pudo conectar con Adobe.com. Verifica tu conexión.'
          } else if (error.message.includes('403')) {
            errorMessage = 'Acceso denegado por Adobe.com.'
          } else if (error.message.includes('429')) {
            errorMessage = 'Rate limit alcanzado en Adobe.com. Reintenta más tarde.'
          } else {
            errorMessage = error.message
          }
        }

        return NextResponse.json({
          success: false,
          error: 'Error al verificar en Adobe: ' + errorMessage
        })
      }
    }

    if (platform === 'firefox.com') {
      try {
        console.log('Verificando email en Firefox.com...')

        const headers = {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0',
          'Accept': 'application/json',
          'Accept-Language': 'en-US,en;q=0.5',
          'Content-Type': 'application/json',
          'DNT': '1',
          'Connection': 'keep-alive'
        }

        const response = await fetch('https://api.accounts.firefox.com/v1/account/status', {
          method: 'POST',
          headers: headers,
          body: JSON.stringify({ email: email })
        })

        let authMethod = 'UNKNOWN'
        let firefoxData = null

        if (response.ok) {
          const data = await response.json()
          console.log('Respuesta de Firefox:', data)
          firefoxData = data

          // Analizar la respuesta según holehe
          if (data.exists === false) {
            authMethod = 'NOT_REGISTERED'
          } else if (data.exists === true) {
            authMethod = 'REGISTERED'
          } else {
            authMethod = 'UNKNOWN'
          }
        } else {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        return NextResponse.json({
          success: true,
          authMethod: authMethod,
          platform: 'Firefox.com',
          message: authMethod === 'REGISTERED' ? 'Email ya registrado en la plataforma' :
            authMethod === 'NOT_REGISTERED' ? 'Email no registrado' : 'Estado desconocido',
          rawResponse: firefoxData
        })

      } catch (error) {
        console.error('Error verificando Firefox:', error)

        let errorMessage = 'Error desconocido'
        if (error instanceof Error) {
          if (error.message.includes('timeout')) {
            errorMessage = 'Timeout al conectar con Firefox.com. Reintenta más tarde.'
          } else if (error.message.includes('ENOTFOUND')) {
            errorMessage = 'No se pudo conectar con Firefox.com. Verifica tu conexión.'
          } else if (error.message.includes('403')) {
            errorMessage = 'Acceso denegado por Firefox.com.'
          } else if (error.message.includes('429')) {
            errorMessage = 'Rate limit alcanzado en Firefox.com. Reintenta más tarde.'
          } else {
            errorMessage = error.message
          }
        }

        return NextResponse.json({
          success: false,
          error: 'Error al verificar en Firefox: ' + errorMessage
        })
      }
    }

    if (platform === 'lastpass.com') {
      try {
        console.log('Verificando email en LastPass.com...')

        const headers = {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0',
          'Accept': '*/*',
          'Accept-Language': 'en,en-US;q=0.5',
          'Referer': 'https://lastpass.com/',
          'X-Requested-With': 'XMLHttpRequest',
          'DNT': '1',
          'Connection': 'keep-alive',
          'TE': 'Trailers'
        }

        const params = new URLSearchParams({
          check: 'avail',
          skipcontent: '1',
          mistype: '1',
          username: email
        })

        const response = await fetch(`https://lastpass.com/create_account.php?${params}`, {
          method: 'GET',
          headers: headers
        })

        let authMethod = 'UNKNOWN'
        let lastpassData = null

        if (response.ok) {
          const text = await response.text()
          console.log('Respuesta de LastPass:', text)
          lastpassData = { response: text }

          // Analizar la respuesta según holehe
          if (text === 'no') {
            authMethod = 'REGISTERED'
          } else if (text === 'ok' || text === 'emailinvalid') {
            authMethod = 'NOT_REGISTERED'
          } else {
            authMethod = 'UNKNOWN'
          }
        } else {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        return NextResponse.json({
          success: true,
          authMethod: authMethod,
          platform: 'LastPass.com',
          message: authMethod === 'REGISTERED' ? 'Email ya registrado en la plataforma' :
            authMethod === 'NOT_REGISTERED' ? 'Email no registrado' : 'Estado desconocido',
          rawResponse: lastpassData
        })

      } catch (error) {
        console.error('Error verificando LastPass:', error)

        let errorMessage = 'Error desconocido'
        if (error instanceof Error) {
          if (error.message.includes('timeout')) {
            errorMessage = 'Timeout al conectar con LastPass.com. Reintenta más tarde.'
          } else if (error.message.includes('ENOTFOUND')) {
            errorMessage = 'No se pudo conectar con LastPass.com. Verifica tu conexión.'
          } else if (error.message.includes('403')) {
            errorMessage = 'Acceso denegado por LastPass.com.'
          } else if (error.message.includes('429')) {
            errorMessage = 'Rate limit alcanzado en LastPass.com. Reintenta más tarde.'
          } else {
            errorMessage = error.message
          }
        }

        return NextResponse.json({
          success: false,
          error: 'Error al verificar en LastPass: ' + errorMessage
        })
      }
    }

    if (platform === 'wattpad.com') {
      try {
        console.log('Verificando email en Wattpad.com...')

        const headers = {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36',
          'Accept': '*/*',
          'Accept-Language': 'es',
          'Content-Type': 'multipart/form-data; boundary=----WebKitFormBoundaryBOQTsm9PAdvQABTP',
          'Priority': 'u=1, i',
          'Sec-CH-UA': '"Chromium";v="142", "Google Chrome";v="142", "Not_A Brand";v="99"',
          'Sec-CH-UA-Mobile': '?0',
          'Sec-CH-UA-Platform': '"Windows"',
          'Sec-Fetch-Dest': 'empty',
          'Sec-Fetch-Mode': 'cors',
          'Sec-Fetch-Site': 'same-origin',
          'Referer': 'https://www.wattpad.com/'
        }

        // Crear el body multipart/form-data con datos dummy para el registro
        const boundary = '----WebKitFormBoundaryBOQTsm9PAdvQABTP'
        const formData = [
          `--${boundary}`,
          'Content-Disposition: form-data; name="signup-from"',
          '',
          'new_landing_signup',
          `--${boundary}`,
          'Content-Disposition: form-data; name="form-type"',
          '',
          'navbar_modal',
          `--${boundary}`,
          'Content-Disposition: form-data; name="new-onboarding"',
          '',
          '1',
          `--${boundary}`,
          'Content-Disposition: form-data; name="email"',
          '',
          email,
          `--${boundary}`,
          'Content-Disposition: form-data; name="username"',
          '',
          'testuser' + Math.random().toString(36).substr(2, 9),
          `--${boundary}`,
          'Content-Disposition: form-data; name="month"',
          '',
          '05',
          `--${boundary}`,
          'Content-Disposition: form-data; name="day"',
          '',
          '15',
          `--${boundary}`,
          'Content-Disposition: form-data; name="year"',
          '',
          '1995',
          `--${boundary}`,
          'Content-Disposition: form-data; name="pronouns"',
          '',
          'M',
          `--${boundary}`,
          'Content-Disposition: form-data; name="password"',
          '',
          'TestPassword123!',
          `--${boundary}`,
          'Content-Disposition: form-data; name="confirmPassword"',
          '',
          'TestPassword123!',
          `--${boundary}`,
          'Content-Disposition: form-data; name="policy"',
          '',
          'true',
          `--${boundary}--`
        ].join('\r\n')

        const response = await fetch('https://www.wattpad.com/auth/signup?nextUrl=%2F&_data=routes%2Fauth.signup', {
          method: 'POST',
          headers: headers,
          body: formData
        })

        let authMethod = 'UNKNOWN'
        let wattpadData = null

        if (response.ok || response.status === 400 || response.status === 422) {
          try {
            const data = await response.json()
            console.log('Respuesta de Wattpad:', data)
            wattpadData = data

            // Analizar la respuesta según el nuevo método (español e inglés)
            if (data.errorMessage && data.field === 'email' && (
              data.errorMessage.includes('Puede que ya exista una cuenta con esta dirección de correo electrónico') ||
              data.errorMessage.includes('An account with this email address may already exist')
            )) {
              authMethod = 'REGISTERED'
            } else if (data.errorMessage && (
              data.errorMessage.includes('Error al crear tu cuenta') ||
              data.errorMessage.includes('contacta al servicio de ayuda') ||
              data.errorMessage.includes('Error creating your account') ||
              data.errorMessage.includes('contact support') ||
              (data.field !== 'email' && data.field !== null)
            )) {
              authMethod = 'NOT_REGISTERED'
            } else if (data.errorMessage) {
              // Cualquier otro error que no sea específicamente sobre el email existente
              authMethod = 'NOT_REGISTERED'
            } else {
              // Si no hay errorMessage, probablemente significa que el registro fue exitoso = email no registrado
              authMethod = 'NOT_REGISTERED'
            }
          } catch (jsonError) {
            // Si no se puede parsear JSON, intentar con texto plano
            const text = await response.text()
            console.log('Respuesta de Wattpad (texto):', text)
            wattpadData = { response: text }

            if (text.includes('ya exista una cuenta con esta dirección') ||
              text.includes('account with this email address may already exist')) {
              authMethod = 'REGISTERED'
            } else {
              authMethod = 'NOT_REGISTERED'
            }
          }
        } else {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        return NextResponse.json({
          success: true,
          authMethod: authMethod,
          platform: 'Wattpad.com',
          message: authMethod === 'REGISTERED' ? 'Email ya registrado en la plataforma' :
            authMethod === 'NOT_REGISTERED' ? 'Email no registrado' : 'Estado desconocido',
          rawResponse: wattpadData
        })

      } catch (error) {
        console.error('Error verificando Wattpad:', error)

        let errorMessage = 'Error desconocido'
        if (error instanceof Error) {
          if (error.message.includes('timeout')) {
            errorMessage = 'Timeout al conectar con Wattpad.com. Reintenta más tarde.'
          } else if (error.message.includes('ENOTFOUND')) {
            errorMessage = 'No se pudo conectar con Wattpad.com. Verifica tu conexión.'
          } else if (error.message.includes('403')) {
            errorMessage = 'Acceso denegado por Wattpad.com.'
          } else if (error.message.includes('429')) {
            errorMessage = 'Rate limit alcanzado en Wattpad.com. Reintenta más tarde.'
          } else {
            errorMessage = error.message
          }
        }

        return NextResponse.json({
          success: false,
          error: 'Error al verificar en Wattpad: ' + errorMessage
        })
      }
    }


    if (platform === 'trello.com') {
      try {
        console.log('Verificando email en Trello.com...')

        // Verificar si hay cookies de Trello disponibles
        const trelloCookiesRaw = request.headers.get('x-trello-cookies')
        if (!trelloCookiesRaw) {
          return NextResponse.json({
            success: false,
            error: 'No hay cookies de Trello disponibles. Conecta tu sesión de Trello primero.'
          })
        }

        let trelloCookies
        try {
          trelloCookies = JSON.parse(trelloCookiesRaw)
        } catch (parseError) {
          return NextResponse.json({
            success: false,
            error: 'Error al parsear cookies de Trello'
          })
        }

        // Convertir cookies a formato de string para headers
        const cookieString = trelloCookies
          .filter((cookie: any) => cookie.domain && cookie.domain.includes('trello.com'))
          .map((cookie: any) => `${cookie.name}=${cookie.value}`)
          .join('; ')

        if (!cookieString) {
          return NextResponse.json({
            success: false,
            error: 'No se encontraron cookies válidas de Trello'
          })
        }

        // Extraer IDs necesarios de las cookies (idBoard, idOrganization)
        const idMemberCookie = trelloCookies.find((cookie: any) => cookie.name === 'idMember')
        if (!idMemberCookie) {
          return NextResponse.json({
            success: false,
            error: 'No se encontró ID de miembro en las cookies de Trello'
          })
        }

        // IDs de ejemplo del archivo aaa.txt - en producción estos deberían ser dinámicos
        const idBoard = '692e459b7cd224bf91b9c724'
        const idOrganization = '692e4599c713719afafe8590'
        const idMember = idMemberCookie.value

        // Headers para la request a Trello
        const trelloHeaders = {
          'accept': 'application/json, text/javascript, */*; q=0.01',
          'accept-language': 'es,en;q=0.9,es-419;q=0.8',
          'priority': 'u=1, i',
          'sec-ch-ua': '"Chromium";v="142", "Google Chrome";v="142", "Not_A Brand";v="99"',
          'sec-ch-ua-mobile': '?0',
          'sec-ch-ua-platform': '"Windows"',
          'sec-fetch-dest': 'empty',
          'sec-fetch-mode': 'cors',
          'sec-fetch-site': 'same-origin',
          'x-requested-with': 'XMLHttpRequest',
          'x-trello-client-version': 'build-230472',
          'x-trello-reqid': `${idMember}-${Math.random()}`,
          'cookie': cookieString,
          'referer': 'https://trello.com/b/pllfr53F/mi-tablero-de-trello'
        }

        // Construir URL de búsqueda
        const searchUrl = `https://trello.com/1/search/members/?idBoard=${idBoard}&idOrganization=${idOrganization}&idEnterprise=&query=${encodeURIComponent(email)}`

        console.log('Realizando búsqueda en Trello:', searchUrl)

        const response = await fetch(searchUrl, {
          method: 'GET',
          headers: trelloHeaders
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        console.log('Respuesta de Trello:', data)

        let authMethod = 'NOT_REGISTERED'
        let trelloData = null

        if (Array.isArray(data) && data.length > 0) {
          const member = data[0]

          // Verificar si es un miembro real o un "ghost"
          if (member.memberType === 'ghost') {
            authMethod = 'NOT_REGISTERED'
            trelloData = {
              memberType: 'ghost',
              email: member.email,
              similarity: member.similarity,
              active: member.active
            }
          } else {
            authMethod = 'REGISTERED'
            trelloData = {
              id: member.id,
              fullName: member.fullName,
              username: member.username,
              initials: member.initials,
              avatarHash: member.avatarHash,
              avatarUrl: member.avatarUrl,
              confirmed: member.confirmed,
              dateLastActive: member.dateLastActive,
              memberType: member.memberType,
              similarity: member.similarity,
              active: member.active,
              activityBlocked: member.activityBlocked || false,
              nonPublicAvailable: member.nonPublicAvailable || false
            }
          }
        }

        return NextResponse.json({
          success: true,
          authMethod: authMethod,
          platform: 'Trello.com',
          message: authMethod === 'REGISTERED' ? 'Usuario encontrado en Trello' :
            authMethod === 'NOT_REGISTERED' ? 'Usuario no encontrado en Trello' : 'Estado desconocido',
          rawResponse: data,
          profileData: trelloData
        })

      } catch (error) {
        console.error('Error verificando Trello:', error)

        let errorMessage = 'Error desconocido'
        if (error instanceof Error) {
          if (error.message.includes('timeout')) {
            errorMessage = 'Timeout al conectar con Trello.com. Reintenta más tarde.'
          } else if (error.message.includes('ENOTFOUND')) {
            errorMessage = 'No se pudo conectar con Trello.com. Verifica tu conexión.'
          } else if (error.message.includes('403')) {
            errorMessage = 'Acceso denegado por Trello.com. Verifica tus cookies de sesión.'
          } else if (error.message.includes('401')) {
            errorMessage = 'No autorizado. Tus cookies de Trello pueden haber expirado.'
          } else {
            errorMessage = error.message
          }
        }

        return NextResponse.json({
          success: false,
          error: 'Error al verificar en Trello: ' + errorMessage
        })
      }
    }

    if (platform === 'dropbox.com') {
      try {
        console.log('Verificando email en Dropbox.com...')

        // Verificar si las cookies de Dropbox están disponibles
        const dropboxCookies = request.headers.get('x-dropbox-cookies')

        if (!dropboxCookies) {
          return NextResponse.json({
            success: true,
            authMethod: 'NO_COOKIES',
            platform: 'Dropbox.com',
            message: 'Se requieren cookies de Dropbox para realizar la búsqueda',
            requiresAuth: true
          })
        }

        let parsedCookies: any[]
        try {
          parsedCookies = JSON.parse(dropboxCookies)
        } catch (e) {
          return NextResponse.json({
            success: false,
            error: 'Cookies de Dropbox inválidas'
          })
        }

        // Convertir cookies a formato de header
        const cookieString = parsedCookies
          .filter(cookie => cookie.domain && cookie.domain.includes('dropbox.com'))
          .map(cookie => `${cookie.name}=${cookie.value}`)
          .join('; ')

        // Extraer datos necesarios de las cookies
        let csrfToken = ''
        let dropboxUid = ''
        let namespaceId = ''

        for (const cookie of parsedCookies) {
          if (cookie.name === '__Host-js_csrf' || cookie.name === 't') {
            csrfToken = cookie.value
          }
          if (cookie.name === 'jar') {
            try {
              console.log('Raw jar cookie value:', cookie.value)

              // Use the same successful method from Python script
              // Method 1: URL decode + Base64 decode (this works!)
              try {
                console.log('Trying URL decode + Base64...')
                const decoded = decodeURIComponent(cookie.value)
                console.log('After URL decode:', decoded)

                const base64Decoded = Buffer.from(decoded, 'base64').toString('utf-8')
                console.log('After Base64 decode:', base64Decoded)

                const jarData = JSON.parse(base64Decoded)
                console.log('JSON parsed:', jarData)

                if (Array.isArray(jarData) && jarData.length > 0) {
                  const firstItem = jarData[0]
                  console.log('First item:', firstItem)

                  if (firstItem.uid) {
                    dropboxUid = firstItem.uid.toString()
                    console.log('✓ UID extracted:', dropboxUid)
                  }

                  if (firstItem.ns) {
                    namespaceId = firstItem.ns.toString()
                    console.log('✓ Namespace ID extracted:', namespaceId)
                  }
                }

              } catch (e) {
                console.log('Failed with URL + Base64 method:', e instanceof Error ? e.message : String(e))
              }

            } catch (e) {
              console.log('Error parsing jar cookie:', e instanceof Error ? e.message : String(e))
              console.log('Cookie value was:', cookie.value)
            }
          }
        }

        if (!csrfToken || !dropboxUid || !namespaceId) {
          return NextResponse.json({
            success: false,
            error: 'Cookies de Dropbox incompletas. Asegúrate de estar logueado.'
          })
        }

        // Hacer request a Dropbox
        const dropboxHeaders = {
          'accept': '*/*',
          'accept-language': 'es-419,es;q=0.7',
          'content-type': 'application/json',
          'dropbox-api-path-root': `{".tag":"namespace_id","namespace_id":"${namespaceId}"}`,
          'sec-ch-ua': '"Chromium";v="142", "Brave";v="142", "Not_A Brand";v="99"',
          'sec-ch-ua-mobile': '?0',
          'sec-ch-ua-platform': '"Windows"',
          'sec-fetch-dest': 'empty',
          'sec-fetch-mode': 'cors',
          'sec-fetch-site': 'same-origin',
          'sec-gpc': '1',
          'x-csrf-token': csrfToken,
          'x-dropbox-uid': dropboxUid,
          'cookie': cookieString,
          'referer': 'https://www.dropbox.com/home',
          'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36'
        }

        const dropboxBody = {
          query: email,
          force_refresh: true,
          limit: 10
        }

        const dropboxResponse = await fetch('https://www.dropbox.com/2/sharing/targets/search', {
          method: 'POST',
          headers: dropboxHeaders,
          body: JSON.stringify(dropboxBody)
        })

        if (!dropboxResponse.ok) {
          throw new Error(`Dropbox API error: ${dropboxResponse.status}`)
        }

        const dropboxData = await dropboxResponse.json()
        console.log('Respuesta de Dropbox:', dropboxData)

        let authMethod = 'NOT_REGISTERED'
        let profileData = null

        if (dropboxData.entries && dropboxData.entries.length > 0) {
          const user = dropboxData.entries[0]
          if (user['.tag'] === 'user' && user.email === email) {
            authMethod = 'REGISTERED'
            profileData = {
              name: user.name || '',
              email: user.email || '',
              dbxAccountId: user.dbx_account_id || '',
              photoUrl: user.photo_url || '',
              dbxTeamId: user.dbx_team_id || '',
              sortKey: user.sort_key || ''
            }
          }
        }

        return NextResponse.json({
          success: true,
          authMethod: authMethod,
          platform: 'Dropbox.com',
          message: authMethod === 'REGISTERED' ? 'Usuario encontrado en Dropbox' : 'Usuario no encontrado en Dropbox',
          profileData: profileData
        })

      } catch (error) {
        let errorMessage = 'Error desconocido'

        if (error instanceof Error) {
          if (error.message.includes('fetch')) {
            errorMessage = 'Error de conexión con Dropbox'
          } else if (error.message.includes('JSON')) {
            errorMessage = 'Error al procesar respuesta de Dropbox'
          } else {
            errorMessage = error.message
          }
        }

        return NextResponse.json({
          success: false,
          error: 'Error al verificar en Dropbox: ' + errorMessage
        })
      }
    }

    if (platform === 'tumblr.com') {
      try {
        console.log('Verificando email en Tumblr.com...')

        // Validar email directamente con la API
        const requestBody = JSON.stringify({ email: email })

        const headers = {
          'accept': 'application/json;format=camelcase',
          'accept-language': 'es-es',
          'authorization': 'Bearer aIcXSOoTtqrzR8L8YEIOmBeW94c3FmbSNSWAUbxsny9KKx5VFh',
          'content-type': 'application/json; charset=utf8',
          'x-csrf': 'KBjncQKu1lqR.1765139944',
          'x-version': 'redpop/3/0//redpop/',
          'x-ad-blocker-enabled': '0',
          'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36',
          'origin': 'https://www.tumblr.com',
          'referer': 'https://www.tumblr.com/?redirect_to=%2F&source=login_register_header_explore'
        }

        const response = await fetch('https://www.tumblr.com/api/v2/user/validate', {
          method: 'POST',
          headers: headers,
          body: requestBody
        })

        const data = await response.json()
        console.log('Respuesta de Tumblr:', data)

        let authMethod = 'UNKNOWN'

        // Verificar respuesta según documentación en tumbrl.txt
        if (response.status === 400 && data.response?.userErrors) {
          // Si hay errores de usuario y el código es 2, significa que el usuario ya existe
          const userError = data.response.userErrors.find((err: any) => err.code === 2)
          if (userError) {
            authMethod = 'REGISTERED'
          } else {
            authMethod = 'NOT_REGISTERED'
          }
        } else if (response.status === 200) {
          // Status 200 significa que el email no está registrado
          authMethod = 'NOT_REGISTERED'
        }

        return NextResponse.json({
          success: true,
          authMethod: authMethod,
          platform: 'Tumblr.com',
          message: authMethod === 'REGISTERED' ? 'Email ya registrado en la plataforma' :
            authMethod === 'NOT_REGISTERED' ? 'Email no registrado' : 'Estado desconocido',
          rawResponse: data
        })

      } catch (error) {
        console.error('Error verificando Tumblr:', error)

        let errorMessage = 'Error desconocido'
        if (error instanceof Error) {
          if (error.message.includes('timeout')) {
            errorMessage = 'Timeout al conectar con Tumblr.com. Reintenta más tarde.'
          } else if (error.message.includes('ENOTFOUND')) {
            errorMessage = 'No se pudo conectar con Tumblr.com. Verifica tu conexión.'
          } else if (error.message.includes('403')) {
            errorMessage = 'Acceso denegado por Tumblr.com.'
          } else if (error.message.includes('429')) {
            errorMessage = 'Rate limit alcanzado en Tumblr.com. Reintenta más tarde.'
          } else {
            errorMessage = error.message
          }
        }

        return NextResponse.json({
          success: false,
          error: 'Error al verificar en Tumblr: ' + errorMessage
        })
      }
    }

    // Función para obtener datos del perfil de Flickr a partir de un email
    async function getFlickrProfileData(email: string, customApiKey?: string, customAuthHash?: string, customSecret?: string) {
      console.log('=== GETFLICKRPROFILEDATA START ===')
      console.log('Starting getFlickrProfileData for email:', email)

      // Verificar que se proporcionaron todos los tokens requeridos
      if (!customApiKey || !customAuthHash || !customSecret) {
        console.error('❌ Flickr: Tokens no configurados')
        return NextResponse.json({
          success: false,
          authMethod: 'ERROR',
          platform: 'Flickr.com',
          message: 'Debes configurar los tokens de Flickr en /configuracion para usar esta plataforma',
          error: 'TOKENS_NOT_CONFIGURED'
        })
      }

      const apiKey = customApiKey
      const authHash = customAuthHash
      const secret = customSecret

      console.log('✅ Using custom Flickr tokens')

      try {
        // Paso 1: Buscar usuario por email
        const searchUrl = `https://www.flickr.com/services/rest?format=json&clientType=yui-3-flickrapi-module&api_key=${apiKey}&auth_hash=${authHash}&auth_token=&secret=${secret}&username=${encodeURIComponent(email)}&method=flickr.people.search&jsoncallback=YUI.flickrAPITransactions.flapicb5&cachebust=${Date.now()}`

        console.log('=== FLICKR PROFILE SEARCH STEP ===')
        console.log('Search URL:', searchUrl)

        const searchHeaders = {
          'accept': '*/*',
          'accept-language': 'es,en;q=0.9,es-419;q=0.8',
          'sec-ch-ua': '"Chromium";v="142", "Google Chrome";v="142", "Not_A Brand";v="99"',
          'sec-ch-ua-mobile': '?0',
          'sec-ch-ua-platform': '"Windows"',
          'sec-fetch-dest': 'script',
          'sec-fetch-mode': 'no-cors',
          'sec-fetch-site': 'same-origin',
          'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36'
        }

        const searchResponse = await fetch(searchUrl, {
          method: 'GET',
          headers: searchHeaders,
          mode: 'cors',
          credentials: 'include'
        })

        console.log('Search response status:', searchResponse.status)
        console.log('Search response headers:', Object.fromEntries(searchResponse.headers.entries()))

        if (!searchResponse.ok) {
          console.log('Search response not OK, status:', searchResponse.status)
          throw new Error(`Flickr search failed: ${searchResponse.status}`)
        }

        const searchText = await searchResponse.text()
        console.log('=== FLICKR SEARCH RESPONSE ===')
        console.log('Raw search response text:', searchText)

        // Parsear respuesta JSONP
        let searchData = null
        try {
          console.log('=== JSONP PARSING ===')
          const jsonpMatch = searchText.match(/YUI\.flickrAPITransactions\.flapicb5\((.+)\);?$/)
          console.log('JSONP match result:', jsonpMatch ? 'Found' : 'Not found')
          if (jsonpMatch && jsonpMatch[1]) {
            console.log('JSONP content:', jsonpMatch[1])
            searchData = JSON.parse(jsonpMatch[1])
            console.log('Parsed search data:', JSON.stringify(searchData, null, 2))
          } else {
            console.log('Failed to match JSONP pattern')
            throw new Error('No se pudo extraer datos JSONP')
          }
        } catch (parseError) {
          console.log('JSONP parsing error:', parseError)
          throw new Error(`Error parsing Flickr search response: ${parseError instanceof Error ? parseError.message : String(parseError)}`)
        }

        // Verificar si encontró el usuario
        if (!searchData || !searchData.people || !searchData.people.person || searchData.people.person.length === 0) {
          return NextResponse.json({
            success: true,
            authMethod: 'NOT_REGISTERED',
            platform: 'Flickr.com',
            message: 'Usuario no encontrado en Flickr'
          })
        }

        const user = searchData.people.person[0]
        const nsid = user.nsid

        console.log(`Usuario encontrado en Flickr: ${user.username}, NSID: ${nsid}`)

        // Paso 2: Obtener datos completos del perfil usando el NSID (API PÚBLICA - SIN viewerNSID)
        console.log('=== FLICKR PROFILE REQUEST ===')
        const profileUrl = `https://api.flickr.com/services/rest?per_page=5&page=1&extras=ad_eligibility%2Ccan_addmeta%2Ccan_comment%2Ccan_download%2Ccan_print%2Ccan_share%2Ccontact%2Ccontent_type%2Ccount_comments%2Ccount_faves%2Ccount_views%2Cdate_taken%2Cdate_upload%2Cdescription%2Cicon_urls_deep%2Cisfavorite%2Cispro%2Clicense%2Cmedia%2Cneeds_interstitial%2Cowner_name%2Cowner_datecreate%2Cpath_alias%2Cperm_print%2Crealname%2Crotation%2Csafety_level%2Csecret_k%2Csecret_h%2Curl_sq%2Curl_q%2Curl_t%2Curl_s%2Curl_n%2Curl_w%2Curl_m%2Curl_z%2Curl_c%2Curl_l%2Curl_h%2Curl_k%2Curl_3k%2Curl_4k%2Curl_f%2Curl_5k%2Curl_6k%2Curl_o%2Cvisibility%2Cvisibility_source%2Co_dims%2Cpubliceditability%2Csystem_moderation&get_user_info=1&jump_to=&user_id=${encodeURIComponent(nsid)}&privacy_filter=1&viewerNSID=&method=flickr.people.getPhotos&csrf=&api_key=${apiKey}&format=json&hermes=1&hermesClient=1&reqId=672e40d8-b662-419f-b2f2-854d495b3c04&nojsoncallback=1`
        console.log('Profile request URL:', profileUrl)

        const profileHeaders = {
          'accept': '*/*',
          'accept-language': 'es',
          'priority': 'u=1, i',
          'sec-ch-ua': '"Chromium";v="142", "Google Chrome";v="142", "Not_A Brand";v="99"',
          'sec-ch-ua-mobile': '?0',
          'sec-ch-ua-platform': '"Windows"',
          'sec-fetch-dest': 'empty',
          'sec-fetch-mode': 'cors',
          'sec-fetch-site': 'same-site',
          'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36'
        }

        const profileResponse = await fetch(profileUrl, {
          method: 'GET',
          headers: profileHeaders,
          mode: 'cors',
          credentials: 'include'
        })

        console.log('=== FLICKR PROFILE RESPONSE ===')
        console.log('Profile response status:', profileResponse.status)
        console.log('Profile response headers:', Object.fromEntries(profileResponse.headers.entries()))

        if (!profileResponse.ok) {
          console.log('Profile response not OK, status:', profileResponse.status)
          throw new Error(`Flickr profile failed: ${profileResponse.status}`)
        }

        const profileData = await profileResponse.json()
        console.log('=== FLICKR PROFILE API RESPONSE ===')
        console.log('Profile data received:', JSON.stringify(profileData, null, 2))
        console.log('profileData.user exists:', !!profileData.user)
        console.log('profileData keys:', Object.keys(profileData))

        // Para flickr.people.getPhotos con get_user_info=1, los datos están en profileData.user
        if (!profileData.user) {
          console.log('ERROR: profileData.user is missing!')
          console.log('Available data:', profileData)
          throw new Error('No se encontraron datos de usuario en Flickr')
        }

        const userData = profileData.user
        console.log('User data found:', JSON.stringify(userData, null, 2))

        // Paso 3: Obtener banner del perfil usando flickr.people.getInfo
        console.log('=== FLICKR BANNER REQUEST ===')
        const bannerUrl = `https://api.flickr.com/services/rest?method=flickr.people.getInfo&api_key=${apiKey}&user_id=${encodeURIComponent(nsid)}&format=json&nojsoncallback=1`
        console.log('Banner request URL:', bannerUrl)

        let bannerPhotoUrl = ''
        try {
          const bannerResponse = await fetch(bannerUrl, {
            method: 'GET',
            headers: profileHeaders,
            mode: 'cors',
            credentials: 'include'
          })

          console.log('Banner response status:', bannerResponse.status)

          if (bannerResponse.ok) {
            const bannerData = await bannerResponse.json()
            console.log('=== FLICKR BANNER API RESPONSE ===')
            console.log('Banner data received:', JSON.stringify(bannerData, null, 2))

            if (bannerData.person && bannerData.person.coverphoto_url) {
              bannerPhotoUrl = bannerData.person.coverphoto_url.l || bannerData.person.coverphoto_url.h || bannerData.person.coverphoto_url.s || ''
              console.log('Banner photo URL extracted:', bannerPhotoUrl)
            }
          }
        } catch (bannerError) {
          console.log('Error getting banner, continuing without it:', bannerError)
        }

        const flickrProfileData = {
          nsid: userData.nsid || user.nsid,
          username: userData.username || user.username,
          realname: userData.realname || user.realname || '',
          isPro: userData.ispro === 1 || user.is_pro === 1,
          // Usar foto retina que es la más grande, luego large, medium, etc.
          photoUrl: userData.iconurls?.retina || userData.iconurls?.large || userData.iconurls?.medium || userData.iconurls?.small || userData.iconurls?.default || '',
          dateCreate: userData.datecreate || '',
          totalPhotos: profileData.photos?.total || 0,
          dbid: user.dbid || '',
          // Información adicional
          isAdFree: userData.is_ad_free === 1,
          pathAlias: userData.path_alias || '',
          // Banner del perfil
          bannerUrl: bannerPhotoUrl
        }

        return NextResponse.json({
          success: true,
          authMethod: 'REGISTERED',
          found: true,
          platform: 'Flickr.com',
          message: 'Datos de perfil de Flickr obtenidos correctamente',
          profileData: flickrProfileData
        })
      } catch (error) {
        console.log('=== GETFLICKRPROFILEDATA ERROR ===')
        console.error('Error en getFlickrProfileData:', error)
        console.log('Error type:', typeof error)
        console.log('Error message:', error instanceof Error ? error.message : String(error))
        console.log('Error stack:', error instanceof Error ? error.stack : 'No stack')
        throw error
      }
    }

    // La segunda implementación de Flickr ya no es necesaria - se usa getFlickrProfileData

    if (platform === 'teams.microsoft.com') {
      try {
        console.log('=== MICROSOFT TEAMS REQUEST ===')
        console.log('Email to check:', email)

        // Validar que se proporcionaron los tokens
        if (!teamsAuthToken || !teamsSkypeToken) {
          return NextResponse.json({
            success: false,
            authMethod: 'ERROR',
            platform: 'Microsoft Teams',
            message: 'Tokens de Microsoft Teams no configurados. Ve a /configuracion para agregarlos.'
          })
        }

        // LOG: Ver tokens recibidos (primeros y últimos 50 caracteres)
        console.log('=== TOKENS RECIBIDOS ===')
        console.log('Authorization (primeros 50 chars):', teamsAuthToken.substring(0, 50))
        console.log('Authorization (últimos 50 chars):', teamsAuthToken.substring(teamsAuthToken.length - 50))
        console.log('Authorization (length):', teamsAuthToken.length)
        console.log('Authorization (starts with "Bearer "):', teamsAuthToken.startsWith('Bearer '))
        console.log('X-Skypetoken (primeros 50 chars):', teamsSkypeToken.substring(0, 50))
        console.log('X-Skypetoken (últimos 50 chars):', teamsSkypeToken.substring(teamsSkypeToken.length - 50))
        console.log('X-Skypetoken (length):', teamsSkypeToken.length)
        console.log('X-Skypetoken (starts with "Bearer"):', teamsSkypeToken.startsWith('Bearer'))

        // Headers que replican exactamente el browser - incluye spoofing para CORS
        const requestHeaders = {
          'Accept': 'application/json',
          'Accept-Language': 'es',
          'Content-Type': 'application/json;charset=UTF-8',
          'Origin': 'https://teams.live.com',
          'Referer': 'https://teams.live.com/v2/',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36',
          'Sec-Ch-Ua': '"Chromium";v="142", "Google Chrome";v="142", "Not_A Brand";v="99"',
          'Sec-Ch-Ua-Mobile': '?0',
          'Sec-Ch-Ua-Platform': '"Windows"',
          'Sec-Fetch-Dest': 'empty',
          'Sec-Fetch-Mode': 'cors',
          'Sec-Fetch-Site': 'same-origin',
          'X-MS-Client-Caller': 'people-picker',
          'X-MS-Client-Type': 'cdlworker',
          'X-MS-Client-Version': '1415/25110202744',
          'X-MS-Object-Id': '',
          'X-MS-Request-Id': '',
          'X-MS-Session-Id': 'd2a10645-f9f8-42fb-89c6-689815cce2d8',
          // Tokens obtenidos desde /configuracion
          'Authorization': teamsAuthToken,
          'X-Skypetoken': teamsSkypeToken
        }

        const requestBody = {
          emails: [email],
          phones: []
        }

        console.log('=== REQUEST DETAILS ===')
        console.log('URL:', 'https://teams.live.com/api/mt/beta/users/searchUsers?ggEnabled=true')
        console.log('Method: POST')
        console.log('Headers:')
        Object.entries(requestHeaders).forEach(([key, value]) => {
          console.log(`  ${key}: ${key.includes('token') || key.includes('Authorization') ? value.substring(0, 50) + '...' : value}`)
        })
        console.log('Body:', JSON.stringify(requestBody))

        const response = await fetch('https://teams.live.com/api/mt/beta/users/searchUsers?ggEnabled=true', {
          method: 'POST',
          headers: requestHeaders,
          body: JSON.stringify(requestBody)
        })

        console.log('=== MICROSOFT TEAMS RESPONSE ===')
        console.log('Response status:', response.status)
        console.log('Response status text:', response.statusText)
        console.log('Response headers:')
        for (const [key, value] of response.headers.entries()) {
          console.log(`  ${key}: ${value}`)
        }

        // Leer el cuerpo de la respuesta para diagnóstico
        let responseBody = ''
        let teamsData = null
        try {
          responseBody = await response.text()
          console.log('Response body:', responseBody)

          // Parsear JSON manualmente ya que el body fue leído
          if (responseBody) {
            teamsData = JSON.parse(responseBody)
          }
        } catch (bodyError) {
          console.log('Error reading response body:', bodyError)
        }

        if (!response.ok) {
          console.log('❌ Teams response not OK, status:', response.status)
          console.log('Full error response:', responseBody)

          // Diagnóstico adicional para 400 Bad Request
          if (response.status === 400) {
            console.log('=== DIAGNÓSTICO 400 BAD REQUEST ===')
            console.log('Posibles causas:')
            console.log('1. Tokens mal formateados (Bearer= en lugar de Bearer )')
            console.log('2. Tokens expirados')
            console.log('3. Headers faltantes o incorrectos')
            console.log('4. Body mal formateado')
            console.log('')
            console.log('Verifica que:')
            console.log('- Authorization empiece con "Bearer " (con espacio)')
            console.log('- X-Skypetoken NO tenga "Bearer"')
            console.log('- Los tokens estén actualizados (duran 24h)')
          }

          return NextResponse.json({
            success: false,
            authMethod: 'ERROR',
            platform: 'Microsoft Teams',
            message: `Error ${response.status}: ${response.statusText}. ${responseBody || 'Sin detalles del servidor'}`,
            serverLogs: serverLogs
          })
        }
        console.log('Teams data received:', JSON.stringify(teamsData, null, 2))

        // Verificar si encontró el usuario
        const userResult = teamsData[email]
        if (!userResult || userResult.status !== 'Success' || !userResult.userProfiles || userResult.userProfiles.length === 0) {
          return NextResponse.json({
            success: true,
            authMethod: 'NOT_REGISTERED',
            platform: 'Microsoft Teams',
            message: 'Email no registrado en Microsoft Teams'
          })
        }

        // Extraer datos del perfil
        const userProfile = userResult.userProfiles[0]

        // Construir URL de foto de perfil usando el proxy de Microsoft Teams
        let profilePictureUrl = ''
        if (userProfile.mri && userProfile.displayName && userProfile.imageUri) {
          try {
            const encodedDisplayName = encodeURIComponent(userProfile.displayName)
            const encodedImageUri = encodeURIComponent(userProfile.imageUri)
            profilePictureUrl = `https://teams.live.com/api/mt/beta/users/${userProfile.mri}/profilepicturev2?displayname=${encodedDisplayName}&imageUri=${encodedImageUri}&size=HR96x96`
            console.log('Constructed profile picture URL:', profilePictureUrl)
          } catch (error) {
            console.log('Error constructing profile picture URL:', error)
          }
        }

        // Crear URL del proxy local para evitar problemas de CORS/cookies
        let localProxyImageUrl = ''
        if (profilePictureUrl) {
          const encodedImageUrl = encodeURIComponent(profilePictureUrl)
          localProxyImageUrl = `/api/teams-image-proxy?url=${encodedImageUrl}`
          console.log('Local proxy image URL:', localProxyImageUrl)
        }

        const teamsProfileData = {
          cid: userProfile.cid || '',
          userPrincipalName: userProfile.userPrincipalName || '',
          givenName: userProfile.givenName || '',
          surname: userProfile.surname || '',
          displayName: userProfile.displayName || '',
          imageUri: userProfile.imageUri || '', // URL original de substrate (fallback)
          profilePictureUrl: localProxyImageUrl || profilePictureUrl, // Proxy local primero
          mri: userProfile.mri || '',
          objectId: userProfile.objectId || '',
          type: userProfile.type || '',
          isBlocked: userProfile.isBlocked || false
        }

        return NextResponse.json({
          success: true,
          authMethod: 'REGISTERED',
          found: true,
          platform: 'Microsoft Teams',
          message: 'Datos de perfil de Microsoft Teams obtenidos correctamente',
          profileData: teamsProfileData
        })

      } catch (error) {
        console.log('=== MICROSOFT TEAMS ERROR ===')
        console.error('Error en Microsoft Teams:', error)

        return NextResponse.json({
          success: false,
          error: 'Error al verificar en Microsoft Teams: ' + (error instanceof Error ? error.message : String(error))
        })
      }
    }

    if (platform === 'protonmail.com' || platform === 'proton.me') {
      try {
        console.log('=== PROTONMAIL REQUEST ===')
        console.log('Email to check:', email)

        const protonResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/protonmail`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ email })
        })

        const protonData = await protonResponse.json()
        console.log('Protonmail API response:', protonData)

        return NextResponse.json(protonData)
      } catch (error) {
        console.error('Error al verificar en Protonmail:', error)

        return NextResponse.json({
          success: false,
          error: 'Error al verificar en Protonmail: ' + (error instanceof Error ? error.message : String(error))
        })
      }
    }

    // Zoho.com
    if (platform === 'zoho.com') {
      try {
        const zohoResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/zoho`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        })
        return NextResponse.json(await zohoResponse.json())
      } catch (error) {
        return NextResponse.json({
          success: false,
          error: 'Error al verificar en Zoho: ' + (error instanceof Error ? error.message : String(error))
        })
      }
    }

    // SEOClerks.com
    if (platform === 'seoclerks.com') {
      try {
        const seoResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/seoclerks`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        })
        return NextResponse.json(await seoResponse.json())
      } catch (error) {
        return NextResponse.json({
          success: false,
          error: 'Error al verificar en SEOClerks: ' + (error instanceof Error ? error.message : String(error))
        })
      }
    }

    // Rambler.ru
    if (platform === 'rambler.ru') {
      try {
        const ramblerResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/rambler`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        })
        return NextResponse.json(await ramblerResponse.json())
      } catch (error) {
        return NextResponse.json({
          success: false,
          error: 'Error al verificar en Rambler: ' + (error instanceof Error ? error.message : String(error))
        })
      }
    }

    // Plurk.com
    if (platform === 'plurk.com') {
      try {
        const plurkResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/plurk`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        })
        return NextResponse.json(await plurkResponse.json())
      } catch (error) {
        return NextResponse.json({
          success: false,
          error: 'Error al verificar en Plurk: ' + (error instanceof Error ? error.message : String(error))
        })
      }
    }

    // Freelancer.com
    if (platform === 'freelancer.com') {
      try {
        const freelancerResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/freelancer`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        })
        return NextResponse.json(await freelancerResponse.json())
      } catch (error) {
        return NextResponse.json({
          success: false,
          error: 'Error al verificar en Freelancer: ' + (error instanceof Error ? error.message : String(error))
        })
      }
    }

    // Amazon.com
    if (platform === 'amazon.com') {
      try {
        const amazonResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/amazon`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        })
        return NextResponse.json(await amazonResponse.json())
      } catch (error) {
        return NextResponse.json({
          success: false,
          error: 'Error al verificar en Amazon: ' + (error instanceof Error ? error.message : String(error))
        })
      }
    }

    // Archive.org
    if (platform === 'archive.org') {
      try {
        const archiveResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/archive`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        })
        return NextResponse.json(await archiveResponse.json())
      } catch (error) {
        return NextResponse.json({
          success: false,
          error: 'Error al verificar en Archive.org: ' + (error instanceof Error ? error.message : String(error))
        })
      }
    }

    // Si llegamos aquí, la plataforma no está soportada
    return NextResponse.json({
      success: false,
      error: `Plataforma no soportada: ${platform}`
    })
  } catch (error) {
    console.error('Error general al procesar la solicitud:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// Función auxiliar para acceder a las sesiones de Joomla desde otras APIs
export function getJoomlaSession(sessionId: string) {
  console.log(`Buscando sesión ${sessionId}, total sesiones: ${joomlaSessions.size}`)
  console.log(`Claves disponibles:`, Array.from(joomlaSessions.keys()))
  return joomlaSessions.get(sessionId)
}

export function deleteJoomlaSession(sessionId: string) {
  joomlaSessions.delete(sessionId)
}
