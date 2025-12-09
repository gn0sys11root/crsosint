# CRSOISNT

**CRSOSINT** es una suite avanzada de Inteligencia de Fuentes Abiertas (OSINT) diseñada para la enumeración y rastreo de huella digital (*digital footprinting*) basada vectores de correo electrónico. La herramienta orquesta más de 30 módulos de reconocimiento activos para identificar la presencia de una identidad digital en múltiples plataformas y servicios en línea. Desarrollada con un enfoque modular, CRSOSINT permite a investigadores y analistas de ciberinteligencia correlacionar datos dispersos para construir un perfil digital integral del objetivo, similar a soluciones empresariales de reconocimiento.

### Contribución y Desarrollo
El proyecto adopta una filosofía de código abierto y desarrollo colaborativo. Se invita a la comunidad de analistas y desarrolladores a contribuir con nuevos módulos de verificación o mejoras en la arquitectura de recolección. Para proponer nuevos vectores de búsqueda o reportar anomalías, por favor abra un *Issue* o envíe un *Pull Request* en este repositorio.

![Interfaz Principal](public/assets/main_screenshot.png)

### Stack Tecnológico
El núcleo de la aplicación está construido sobre tecnologías web modernas de alto rendimiento:

- **Framework**: [Next.js 16](https://nextjs.org/) (React 19 RC)
- **Lenguaje**: [TypeScript](https://www.typescriptlang.org/)
- **Estilos**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Motor OSINT**: [Puppeteer](https://pptr.dev/) (Browser Automation) & [Cheerio](https://cheerio.js.org/) (HTML Parsing)
- **Iconografía**: [Lucide React](https://lucide.dev/)

## Guia para instalar las librerias y la herramienta

Este proyecto funciona con **Next.js**, así que es muy fácil de correr. Solo necesitas tener [Node.js](https://nodejs.org/) instalado en tu PC.

1. **Descarga del repositorio con la herramienta CRSOSINT**:
   ```bash
   git clone https://github.com/tu-usuario/crsosint.git
   cd crsosint
   ```

2. **Instala las librerias requeridas para correrlo**:
   Escribe esto en tu terminal dentro de la carpeta del proyecto para descargar lo necesario:
   ```bash
   npm install
   ```

3. **Inicia la herramienta en el localhost**:
   Enciende el servidor local con este comando:
   ```bash
   npm run dev
   ```

4. **paso final para probar la herramienta**:
   Abre tu navegador y entra a: `http://localhost:3000`


## Tabla de Modulos OSINT

| Modulo | Checkeo de registro | info de la cuenta | Token de autorizacion | Alerta al usuario |
| :--- | :---: | :---: | :--- | :---: |
| Duolingo | ✅ | ✅ | No - API libre sin key | No |
| Gravatar | ✅ | ✅ | No - API libre sin key | No |
| Dropbox | ✅ | ✅ | Si - Cookies de sesion | No |
| Chess | ✅ | ✅ | Si - Cookies de sesion | No |
| Trello | ✅ | ✅ | Si - Cookies de sesion | No |
| GitHub | ✅ | ✅ | Si - API key de cuenta | No |
| Proton | ✅ | ✅ | No - Deteccion de Auth | No |
| Flickr | ✅ | ✅ | Si - API key de cuenta | No |
| Microsoft Team | ✅ | ✅ | Si - Tokens de busqueda | No |
| Change.org | ✅ | Parcial | No - API libre sin key | No |
| Have I Been Pwned | ✅ | Brechas | No - API libre sin key | No |
| Hudsonrock | ❌ | Stealers | No - API libre sin key | No |
| Facebook | ✅ | ❌ | No | No |
| Spotify | ✅ | ❌ | No | No |
| Microsoft | ✅ | ❌ | No | No |
| X (Twitter) | ✅ | ❌ | No | No |
| Adobe | ✅ | ❌ | No | No |
| Wattpad | ✅ | ❌ | No | No |
| Tumblr | ✅ | ❌ | No | No |
| Dropbox | ✅ | ❌ | No | No |
| SEOClersk | ✅ | ❌ | No | No |
| Wordpress | ✅ | ❌ | No | No |
| Github | ✅ | ❌ | No | No |
| Firefox | ✅ | ❌ | No | No |
| Zoho | ✅ | ❌ | No | No |
| Lastpass | ✅ | ❌ | No | No |
| Rumbler | ✅ | ❌ | No | No |
| Archive.org | ✅ | ❌ | No | No |
| Plurk | ✅ | ❌ | No | No |
| Instagram | ✅ | ❌ | No | Si |
| Pornhub | ✅ | ❌ | No | No |
| Xvideos | ✅ | ❌ | No | No |
| Joomla | ✅ | ❌ | No | Si |

## Checkeo de Brechas de datos con Have I Been Pwned

Análisis automatizado de vulneración de credenciales mediante la integración con la API de XposedOrNot, la cual actúa como proxy autorizado para el servicio Have I Been Pwned. Este módulo permite verificar la presencia de una dirección de correo electrónico en filtraciones de datos conocidas, proporcionando detalles exhaustivos sobre la información sensible expuesta. La funcionalidad está preconfigurada y optimizada para su uso inmediato, eliminando la necesidad de gestión de tokens de autorización o configuraciones manuales adicionales.

![Checkeo de Brechas](public/assets/breach_screenshot.png)

```javascript
const email = 'example@email.com';
const encodedEmail = encodeURIComponent(email);
const apiUrl = `https://api.xposedornot.com/v1/breach-analytics?email=${encodedEmail}`;

fetch(apiUrl, {
  method: 'GET',
  headers: {
    'Accept': 'application/json',
  },
})
.then(response => response.json())
.then(data => console.log(data));
```

## API de HudsonRock para ver informacion basica de dispositivos infectados con malware

Integración con la API de Cavalier (Hudson Rock) para la identificación avanzada de vectores de compromiso por malware. Este módulo permite correlacionar una dirección de email con dispositivos infectados por Infostealers, revelando indicadores críticos de compromiso (IOCs) como direcciones IP, rutas de sistema y credenciales exfiltradas, proporcionando una visión profunda sobre la exposición de identidad en entornos de cibercrimen.

![API HudsonRock](public/assets/hudson_screenshott.png)

```javascript
const email = 'example@email.com';
const url = `https://cavalier.hudsonrock.com/api/json/v2/osint-tools/search-by-email?email=${encodeURIComponent(email)}`;

fetch(url, {
  method: 'GET',
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  }
})
.then(response => response.json())
.then(data => console.log(data));
```

