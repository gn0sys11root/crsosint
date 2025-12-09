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

    // Hacer la petición JSON-RPC a Rambler
    const checkResponse = await fetch('https://id.rambler.ru/jsonrpc', {
      method: 'POST',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:91.0) Gecko/20100101 Firefox/91.0',
        'Accept': '*/*',
        'Content-Type': 'application/json',
        'Origin': 'https://id.rambler.ru',
        'Referer': 'https://id.rambler.ru/champ/registration',
      },
      body: JSON.stringify({
        method: 'Rambler::Id::get_email_account_info',
        params: [{ email: email }],
        rpc: '2.0'
      })
    })

    const data = await checkResponse.json()

    if (data.result && data.result.exists === 0) {
      return NextResponse.json({
        success: true,
        found: false,
        authMethod: 'NOT_REGISTERED',
        platform: 'rambler.ru'
      })
    } else if (data.result && data.result.exists !== 0) {
      return NextResponse.json({
        success: true,
        found: true,
        authMethod: 'REGISTERED',
        platform: 'rambler.ru'
      })
    } else {
      return NextResponse.json({
        success: false,
        error: 'Rate limit o respuesta inesperada',
        platform: 'rambler.ru'
      }, { status: 429 })
    }

  } catch (error) {
    console.error('Error en verificación de Rambler:', error)
    return NextResponse.json(
      { success: false, error: 'Error al verificar email' },
      { status: 500 }
    )
  }
}
