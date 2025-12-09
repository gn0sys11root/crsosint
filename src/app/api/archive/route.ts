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

    // Crear el multipart/form-data con boundary correcto
    const boundary = '----WebKitFormBoundaryMJLFCBd6kNahOVU8'
    const formData = 
      `------${boundary}\r\n` +
      `Content-Disposition: form-data; name="input_name"\r\n\r\n` +
      `username\r\n` +
      `------${boundary}\r\n` +
      `Content-Disposition: form-data; name="input_value"\r\n\r\n` +
      `${email}\r\n` +
      `------${boundary}\r\n` +
      `Content-Disposition: form-data; name="input_validator"\r\n\r\n` +
      `true\r\n` +
      `------${boundary}\r\n` +
      `Content-Disposition: form-data; name="submit_by_js"\r\n\r\n` +
      `true\r\n` +
      `------${boundary}--\r\n`

    // Verificar el email en Archive.org
    const checkResponse = await fetch('https://archive.org/account/signup', {
      method: 'POST',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36',
        'Accept': '*/*',
        'Accept-Language': 'es',
        'Content-Type': `multipart/form-data; boundary=----${boundary}`,
        'Origin': 'https://archive.org',
        'Referer': 'https://archive.org/account/signup',
        'sec-ch-ua': '"Chromium";v="142", "Google Chrome";v="142", "Not_A Brand";v="99"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-origin',
      },
      body: formData,
      credentials: 'include'
    })

    // Parsear respuesta JSON
    const data = await checkResponse.json()

    // La respuesta es un array con un objeto
    // Registrado: [{"status":false,"field":"username","message":"...is already taken..."}]
    // No registrado: [{"status":true,"field":"username","message":""}]
    if (Array.isArray(data) && data.length > 0) {
      const result = data[0]
      
      if (result.status === false && result.message && result.message.includes('is already taken')) {
        return NextResponse.json({
          success: true,
          found: true,
          authMethod: 'REGISTERED',
          platform: 'archive.org'
        })
      } else if (result.status === true) {
        return NextResponse.json({
          success: true,
          found: false,
          authMethod: 'NOT_REGISTERED',
          platform: 'archive.org'
        })
      }
    }

    // Respuesta inesperada
    return NextResponse.json({
      success: false,
      error: 'Respuesta inesperada de Archive.org',
      platform: 'archive.org'
    }, { status: 500 })

  } catch (error) {
    console.error('Error en verificación de Archive.org:', error)
    return NextResponse.json(
      { success: false, error: 'Error al verificar email' },
      { status: 500 }
    )
  }
}
