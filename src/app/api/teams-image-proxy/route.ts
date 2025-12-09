import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const imageUrl = searchParams.get('url')
    
    if (!imageUrl) {
      return new NextResponse('URL parameter is required', { status: 400 })
    }

    // Decodificar la URL si está codificada
    const decodedUrl = decodeURIComponent(imageUrl)
    console.log('Proxying Teams image:', decodedUrl)

    // Headers exactos del fetch de imagen que funciona en Teams (replicando el navegador)
    const headers = {
      'accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
      'accept-language': 'es', 
      'priority': 'i',
      'sec-ch-ua': '"Chromium";v="142", "Google Chrome";v="142", "Not_A Brand";v="99"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"Windows"',
      'sec-fetch-dest': 'image',
      'sec-fetch-mode': 'no-cors',
      'sec-fetch-site': 'same-origin',
      'Referer': 'https://teams.live.com/v2/',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36',
      // Intentar con el token de loki.delve que vi en el fetch
      'Authorization': 'Bearer EwAYBN2CBAAUVyZrnn9xwmQ7VNJefVz4FrT4XAAAATRS3GXUJz+5h+qk7SSrPaBK+57o5xy1AZUy43ADO44YZ28Qol/82OPBronV1yu3OF6dWkAYqsHwOMYbwIDkUCgSHTMRnloQQlBL0aPJhETNKxPW5fdhygix8cRxBpm1xH+XDDGFg5P/7r8jTVaHub/LzPj/qvoYkHeDQMA+hni5o6yysv18IWfy1p5FviBF5LGnrEYvEvRkDg5suluvO6BD6ZgHJmigbs2M7TUoa8dDvSn83fHVmahrkt/3TadurPQOxNQgMKiQIzaTh3M41x3q1FohARuyu9tDyjoolb3WQo+y1Z2Bpgig3WeR1ioVz/Y/irs4yzxDeqPNcfkWGQ4QZgAAEASqDOIZ8waB9GQZvL/pthvgAi7NYMHiEL9/z0D+ePkHUHSn0OZdnisDR62eChhDhdhLpXej6ivtUwm33vLqdVg3gOunAj3xm7PxXQCZoLafGJDvGXXZnjqnObB99cfWp6BKLIVvdPdOFi1ishnbvVZQ7DNDyl9ZROIQQocONQO//F2i+OZXdD5ouYyDXmrx0Xqk8bmMG/y+prV7eEGeV2/VDQPFmVRrSAhkKDd0CAxwzwdGfb7BEpWJrQbhb4QB4++9StRCBLd/HV0PfhO/6f35Azc40H5GdiI+bCObnOX5nTDgg+cSAbl9belvHCEGYq7UwwjUgSwV8Dm9pkz/cEfO0sfJrKgnsF4ydV/taovmzaPkXGFfPVqzSMe1JRcwXVN5EBvFQAkQWdQqlquEps5ZvbFx7YSQ+QzBetP0sP/k8fQoAP2o9k7zGn1E1NvAreb57i5/+RTAFadAWWIRiJWYdt1bx06nZRwY0eswrTF4GBbifOpcg7ahjIANatGc6FtljYll1MEmf9SlMHCD1UVuTjP0Qw+KF02B942fOYVpdPdPsFaVCr3kPahD6v1oTPAhHrug6c2x3+GUR2dnJ0aXdWwFYDNkp0E6DZZEXYgg/i3ybEndydMaKWgHMYG2OT794ONNEwDOhtH9DGOx1tNmK347ZDG6sSclhICVsm+YZP5XJu/YSTkDchADPaHu921YoZMek1JZ/bvbSgE8wpVWUtOAKaevzBU6Ns1vYUSMuFskDdwBwnteAkcLN+wROm9npsUq1PU1YdTzyP5QbJOHAhQUj5NcZpiCAXfgJxuXa3VZrCB8wHzlim1FFY/wzlxC4d1vtueeLvIyKLFx7O1IjyJWsh6S+nwleqzMDELkNBnL+gzH78qxmEzWGzbr1TvKSQi96mWN7jkQlIMI5LIJJaTZJ3zkqBdW60SFWnRlcbMwNwdCXiF480BMxwXeP5RIDOd18yisc34+xfJp5mSdXl4CkC5mp3CbFOSucexhRPoIAw=='
    }

    // Hacer la solicitud replicando exactamente el comportamiento del navegador
    const response = await fetch(decodedUrl, {
      method: 'GET',
      headers: headers,
      mode: 'cors'
    })

    if (!response.ok) {
      console.log('Teams image proxy error:', response.status, response.statusText)
      return new NextResponse('Image not found', { status: 404 })
    }

    // Obtener el contenido de la imagen
    const imageBuffer = await response.arrayBuffer()
    const contentType = response.headers.get('content-type') || 'image/jpeg'

    console.log('Teams image proxied successfully, size:', imageBuffer.byteLength, 'bytes')

    // Devolver la imagen con headers CORS apropiados
    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600', // Cache por 1 hora
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    })

  } catch (error) {
    console.error('Teams image proxy error:', error)
    return new NextResponse('Internal server error', { status: 500 })
  }
}

// Para manejar preflight requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  })
}
