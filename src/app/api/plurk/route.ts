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

    // Verificar el email en Plurk
    const checkResponse = await fetch('https://www.plurk.com/Users/isEmailFound', {
      method: 'POST',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:91.0) Gecko/20100101 Firefox/91.0',
        'Accept': '*/*',
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'X-Requested-With': 'XMLHttpRequest',
        'Origin': 'https://www.plurk.com',
      },
      body: new URLSearchParams({ email })
    })

    const responseText = await checkResponse.text()

    if (responseText === 'True') {
      return NextResponse.json({
        success: true,
        found: true,
        authMethod: 'REGISTERED',
        platform: 'plurk.com'
      })
    } else if (responseText === 'False') {
      return NextResponse.json({
        success: true,
        found: false,
        authMethod: 'NOT_REGISTERED',
        platform: 'plurk.com'
      })
    } else {
      return NextResponse.json({
        success: false,
        error: 'Rate limit o respuesta inesperada',
        platform: 'plurk.com'
      }, { status: 429 })
    }

  } catch (error) {
    console.error('Error en verificación de Plurk:', error)
    return NextResponse.json(
      { success: false, error: 'Error al verificar email' },
      { status: 500 }
    )
  }
}
