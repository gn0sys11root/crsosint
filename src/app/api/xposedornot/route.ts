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

    // Consultar la API de XposedOrNot
    const encodedEmail = encodeURIComponent(email)
    const apiUrl = `https://api.xposedornot.com/v1/breach-analytics?email=${encodedEmail}`

    console.log('Consultando XposedOrNot:', apiUrl)

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    })

    if (!response.ok) {
      console.error('Error en la respuesta de XposedOrNot:', response.status)
      return NextResponse.json(
        { 
          success: false, 
          message: 'Error al consultar XposedOrNot',
          found: false
        },
        { status: 200 }
      )
    }

    const data = await response.json()
    console.log('Respuesta de XposedOrNot:', JSON.stringify(data, null, 2))

    // Verificar si hay brechas
    const breaches = data?.ExposedBreaches?.breaches_details || []
    
    if (breaches.length === 0) {
      return NextResponse.json({
        success: true,
        found: false,
        message: 'No se encontraron brechas de datos para este email',
        breaches: []
      })
    }

    return NextResponse.json({
      success: true,
      found: true,
      message: `Se encontraron ${breaches.length} brechas de datos`,
      breaches: breaches,
      total: breaches.length
    })

  } catch (error) {
    console.error('Error en el endpoint XposedOrNot:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'Error interno del servidor',
        found: false
      },
      { status: 500 }
    )
  }
}
