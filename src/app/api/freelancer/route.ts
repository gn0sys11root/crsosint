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

    // Verificar el email en Freelancer
    const checkResponse = await fetch('https://www.freelancer.com/api/users/0.1/users/check?compact=true&new_errors=true', {
      method: 'POST',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:91.0) Gecko/20100101 Firefox/91.0',
        'Accept': 'application/json, text/plain, */*',
        'Content-Type': 'application/json',
        'Origin': 'https://www.freelancer.com',
      },
      body: JSON.stringify({
        user: {
          email: email
        }
      })
    })

    const responseText = await checkResponse.text()

    if (checkResponse.status === 409 && responseText.includes('EMAIL_ALREADY_IN_USE')) {
      return NextResponse.json({
        success: true,
        found: true,
        authMethod: 'REGISTERED',
        platform: 'freelancer.com'
      })
    } else if (checkResponse.status === 200) {
      return NextResponse.json({
        success: true,
        found: false,
        authMethod: 'NOT_REGISTERED',
        platform: 'freelancer.com'
      })
    } else {
      return NextResponse.json({
        success: false,
        error: 'Rate limit o respuesta inesperada',
        platform: 'freelancer.com'
      }, { status: 429 })
    }

  } catch (error) {
    console.error('Error en verificación de Freelancer:', error)
    return NextResponse.json(
      { success: false, error: 'Error al verificar email' },
      { status: 500 }
    )
  }
}
