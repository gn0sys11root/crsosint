import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Email es requerido' },
        { status: 400 }
      )
    }

    console.log('🔍 Hudson Rock: Buscando información de stealers para:', email)

    // Consultar API de Hudson Rock
    const hudsonRockUrl = `https://cavalier.hudsonrock.com/api/json/v2/osint-tools/search-by-email?email=${encodeURIComponent(email)}`
    
    const response = await fetch(hudsonRockUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    })

    if (!response.ok) {
      console.log('❌ Hudson Rock: Error en la respuesta:', response.status)
      return NextResponse.json({
        success: false,
        found: false,
        message: 'Error al consultar Hudson Rock'
      })
    }

    const data = await response.json()

    // Verificar si hay datos de stealers
    if (data.stealers && data.stealers.length > 0) {
      console.log(`🚨 Hudson Rock: Email comprometido - ${data.stealers.length} stealer(s) encontrado(s)`)
      
      return NextResponse.json({
        success: true,
        found: true,
        compromised: true,
        data: {
          message: data.message,
          stealers: data.stealers,
          total_corporate_services: data.total_corporate_services,
          total_user_services: data.total_user_services
        }
      })
    } else {
      console.log('✅ Hudson Rock: Email limpio - No se encontraron stealers')
      
      return NextResponse.json({
        success: true,
        found: false,
        compromised: false,
        message: 'No se encontraron stealers asociados a este email'
      })
    }

  } catch (error: any) {
    console.error('❌ Error en Hudson Rock API:', error)
    return NextResponse.json(
      { 
        success: false, 
        found: false,
        message: 'Error al procesar la solicitud',
        error: error.message 
      },
      { status: 500 }
    )
  }
}
