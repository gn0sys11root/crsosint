import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email es requerido' },
        { status: 400 }
      )
    }

    // Paso 1: Obtener el CSRF token y cookies
    const registerResponse = await fetch('https://accounts.zoho.com/register', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      }
    })

    // Extraer todas las cookies
    const setCookieHeader = registerResponse.headers.get('set-cookie')
    let iamcsrValue = ''
    let allCookies = ''
    
    if (setCookieHeader) {
      const iamcsrMatch = setCookieHeader.match(/iamcsr=([^;]+)/)
      if (iamcsrMatch) {
        iamcsrValue = iamcsrMatch[1]
        allCookies = `iamcsr=${iamcsrValue}`
      }
    }

    if (!iamcsrValue) {
      console.log('No se pudo obtener el token CSRF de Zoho')
      return NextResponse.json({
        success: false,
        error: 'No se pudo obtener el token CSRF',
        platform: 'zoho.com'
      }, { status: 500 })
    }

    const csrfToken = 'iamcsrcoo=' + iamcsrValue

    // Paso 2: Verificar el email
    const checkResponse = await fetch(`https://accounts.zoho.com/signin/v2/lookup/${encodeURIComponent(email)}`, {
      method: 'POST',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36',
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
        'Accept': '*/*',
        'Origin': 'https://accounts.zoho.com',
        'Referer': 'https://accounts.zoho.com/register',
        'X-ZCSRF-TOKEN': csrfToken,
        'Cookie': allCookies,
      },
      body: new URLSearchParams({
        'mode': 'primary',
        'servicename': 'ZohoCRM',
        'serviceurl': 'https://crm.zoho.com/crm/ShowHomePage.do',
        'service_language': 'en'
      })
    })

    // Verificar si la respuesta es JSON
    const contentType = checkResponse.headers.get('content-type')
    if (!contentType || !contentType.includes('application/json')) {
      console.log('Zoho devolvió respuesta no-JSON, probablemente bloqueado o rate limited')
      return NextResponse.json({
        success: false,
        error: 'Rate limit o solicitud bloqueada por Zoho',
        platform: 'zoho.com'
      }, { status: 429 })
    }

    const data = await checkResponse.json()

    if (checkResponse.ok && data.message === 'User exists' && data.status_code === 201) {
      return NextResponse.json({
        success: true,
        found: true,
        authMethod: 'REGISTERED',
        platform: 'zoho.com'
      })
    } else if (checkResponse.ok && data.status_code === 400) {
      return NextResponse.json({
        success: true,
        found: false,
        authMethod: 'NOT_REGISTERED',
        platform: 'zoho.com'
      })
    } else {
      return NextResponse.json({
        success: false,
        error: 'Respuesta inesperada de Zoho',
        platform: 'zoho.com'
      }, { status: 429 })
    }

  } catch (error) {
    console.error('Error en verificación de Zoho:', error)
    return NextResponse.json(
      { success: false, error: 'Error al verificar email' },
      { status: 500 }
    )
  }
}
