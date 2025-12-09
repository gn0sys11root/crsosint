import { NextRequest, NextResponse } from 'next/server'
import { getJoomlaSession, deleteJoomlaSession } from '../check-email/route'

export async function POST(request: NextRequest) {
  try {
    const { sessionId, captchaResponse, action } = await request.json()

    if (action === 'submit' && captchaResponse) {
      console.log('Captcha resuelto por usuario:', captchaResponse.substring(0, 50) + '...')
      console.log('Buscando sesión activa para:', sessionId)
      
      // Recuperar la sesión de Puppeteer
      const session = getJoomlaSession(sessionId)
      if (!session) {
        console.error('Sesión no encontrada para:', sessionId)
        return NextResponse.json({
          success: true,
          authMethod: 'UNKNOWN',
          message: 'Sesión expirada - intenta de nuevo',
          platform: 'Joomla.org'
        })
      }

      try {
        console.log('Inyectando respuesta del captcha en el formulario...')
        
        // Inyectar la respuesta del captcha en el formulario
        await session.page.evaluate((response: string) => {
          // Buscar el textarea del captcha y establecer la respuesta
          const captchaTextarea = document.querySelector('[name="h-captcha-response"]') as HTMLTextAreaElement
          if (captchaTextarea) {
            captchaTextarea.value = response
          }
          
          // Buscar el input hidden también
          const captchaHidden = document.querySelector('#h-captcha-response') as HTMLInputElement
          if (captchaHidden) {
            captchaHidden.value = response
          }
          
          // Marcar captcha como válido
          if ((window as any).hcaptcha) {
            // Simular que el captcha fue resuelto
            const event = new Event('change', { bubbles: true })
            if (captchaTextarea) captchaTextarea.dispatchEvent(event)
          }
          
          console.log('Respuesta del captcha inyectada:', response.substring(0, 30) + '...')
        }, captchaResponse)

        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Enviar el formulario
        console.log('Enviando formulario con captcha resuelto...')
        await session.page.click('button[type="submit"]')
        
        // Esperar respuesta
        await new Promise(resolve => setTimeout(resolve, 5000))
        
        // Verificar el resultado
        const errorAlert = await session.page.$('.alert-error .alert-message')
        let authMethod = 'UNKNOWN'
        let message = 'Respuesta desconocida después del captcha'
        
        if (errorAlert) {
          const errorText = await session.page.evaluate((el: any) => el.textContent, errorAlert)
          console.log('Error encontrado:', errorText)
          
          if (errorText.includes('email address you entered is already in use') || 
              errorText.includes('already in use') || 
              errorText.includes('ya está en uso')) {
            authMethod = 'REGISTERED'
            message = 'Email ya registrado en Joomla (verificado con captcha)'
          } else {
            authMethod = 'UNKNOWN'
            message = 'Error en formulario: ' + errorText
          }
        } else {
          // Verificar si cambió de página (registro exitoso)
          const currentUrl = session.page.url()
          console.log('URL actual después del envío:', currentUrl)
          
          if (currentUrl !== 'https://identity.joomla.org/register') {
            authMethod = 'NOT_REGISTERED'
            message = 'Email disponible en Joomla (verificado con captcha)'
          } else {
            // Verificar si hay mensaje de éxito
            const successMessage = await session.page.$('.alert-success, .success-message')
            if (successMessage) {
              authMethod = 'NOT_REGISTERED'  
              message = 'Email disponible en Joomla (verificado con captcha)'
            }
          }
        }
        
        console.log('Resultado final de Joomla:', { authMethod, message })
        
        // Cerrar browser y limpiar sesión
        await session.browser.close()
        deleteJoomlaSession(sessionId)
        
        return NextResponse.json({
          success: true,
          authMethod: authMethod,
          message: message,
          platform: 'Joomla.org'
        })
        
      } catch (error) {
        console.error('Error procesando formulario con captcha:', error)
        
        // Limpiar sesión en caso de error
        try {
          await session.browser.close()
        } catch (e) {}
        deleteJoomlaSession(sessionId)
        
        return NextResponse.json({
          success: true,
          authMethod: 'UNKNOWN',
          message: 'Error procesando formulario después del captcha',
          platform: 'Joomla.org'
        })
      }
    }

    if (action === 'cancel') {
      // Limpiar sesión si el usuario cancela
      const session = getJoomlaSession(sessionId)
      if (session) {
        try {
          await session.browser.close()
        } catch (error) {
          console.error('Error cerrando browser:', error)
        }
        deleteJoomlaSession(sessionId)
      }
      
      return NextResponse.json({
        success: true,
        message: 'Verificación cancelada'
      })
    }

    return NextResponse.json({
      success: false,
      error: 'Acción no válida'
    })

  } catch (error) {
    console.error('Error procesando captcha:', error)
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor'
    }, { status: 500 })
  }
}

