import { NextRequest, NextResponse } from 'next/server'
import * as cheerio from 'cheerio'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email es requerido' },
        { status: 400 }
      )
    }

    // Paso 1: Obtener la página de login
    const loginUrl = 'https://www.amazon.com/ap/signin?openid.pape.max_auth_age=0&openid.return_to=https%3A%2F%2Fwww.amazon.com%2F%3F_encoding%3DUTF8%26ref_%3Dnav_ya_signin&openid.identity=http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0%2Fidentifier_select&openid.assoc_handle=usflex&openid.mode=checkid_setup&openid.claimed_id=http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0%2Fidentifier_select&openid.ns=http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0&'
    
    const pageResponse = await fetch(loginUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      }
    })

    const html = await pageResponse.text()
    const $ = cheerio.load(html)

    // Extraer todos los inputs con name y value del formulario
    const formData: Record<string, string> = {}
    $('form input').each((_, element) => {
      const name = $(element).attr('name')
      const value = $(element).attr('value')
      if (name && value !== undefined) {
        formData[name] = value
      }
    })

    // Agregar el email al formulario
    formData['email'] = email

    // Paso 2: Enviar el formulario
    const submitResponse = await fetch('https://www.amazon.com/ap/signin/', {
      method: 'POST',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Origin': 'https://www.amazon.com',
        'Referer': loginUrl,
      },
      body: new URLSearchParams(formData)
    })

    const responseHtml = await submitResponse.text()
    const $response = cheerio.load(responseHtml)

    // Verificar si existe el div que indica que la cuenta existe pero falta contraseña
    const passwordAlert = $response('#auth-password-missing-alert')

    if (passwordAlert.length > 0) {
      return NextResponse.json({
        success: true,
        found: true,
        authMethod: 'REGISTERED',
        platform: 'amazon.com'
      })
    } else {
      return NextResponse.json({
        success: true,
        found: false,
        authMethod: 'NOT_REGISTERED',
        platform: 'amazon.com'
      })
    }

  } catch (error) {
    console.error('Error en verificación de Amazon:', error)
    return NextResponse.json(
      { success: false, error: 'Error al verificar email' },
      { status: 500 }
    )
  }
}
