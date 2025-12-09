import { NextRequest, NextResponse } from 'next/server'

function generateRandomString(length: number): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email es requerido' },
        { status: 400 }
      )
    }

    // Paso 1: Obtener los tokens de la página principal
    const pageResponse = await fetch('https://www.seoclerks.com', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:91.0) Gecko/20100101 Firefox/91.0',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      }
    })

    const html = await pageResponse.text()

    // Extraer tokens
    let token = ''
    let cr = ''

    const tokenMatch = html.match(/token" value="([^"]+)"/)
    if (tokenMatch) token = tokenMatch[1]

    const crMatch = html.match(/__cr" value="([^"]+)"/)
    if (crMatch) cr = crMatch[1]

    if (!token || !cr) {
      return NextResponse.json({
        success: false,
        error: 'No se pudieron obtener tokens',
        platform: 'seoclerks.com'
      }, { status: 500 })
    }

    // Paso 2: Verificar el email con datos de registro simulados
    const username = generateRandomString(6)
    const password = generateRandomString(6)

    const checkResponse = await fetch('https://www.seoclerks.com/signup/check', {
      method: 'POST',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:91.0) Gecko/20100101 Firefox/91.0',
        'Accept': '*/*',
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'X-Requested-With': 'XMLHttpRequest',
        'Origin': 'https://www.seoclerks.com',
      },
      body: new URLSearchParams({
        'token': token,
        '__cr': cr,
        'fsub': '1',
        'droplet': '',
        'user_username': username,
        'user_email': email,
        'user_password': password,
        'confirm_password': password
      })
    })

    const data = await checkResponse.json()

    if (data.message && data.message.includes('The email address you entered is already taken')) {
      return NextResponse.json({
        success: true,
        found: true,
        authMethod: 'REGISTERED',
        platform: 'seoclerks.com'
      })
    } else {
      return NextResponse.json({
        success: true,
        found: false,
        authMethod: 'NOT_REGISTERED',
        platform: 'seoclerks.com'
      })
    }

  } catch (error) {
    console.error('Error en verificación de SEOClerks:', error)
    return NextResponse.json(
      { success: false, error: 'Error al verificar email' },
      { status: 500 }
    )
  }
}
