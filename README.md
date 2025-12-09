# CRSOISNT (Herramienta OSINT para rastreo de huellas digitales por email)

Hice una herramienta OSINT para rastrear cuentas y registros de cuentas en base a la direccion de email. actualmente tiene mas de 30 modulos OSINT funcionales. desde hace años soy un entusiasta del osint y usuario de algunas herramientas como EPIEOS o OSINT Industries y hace algunas semanas se me ocurrio hacer una herramienta propia OSINT. actualmente esta dirigida para consultar direcciones de email mas de 30 modulos OSINT, tal vez en algun momento tenga mas metodo

si te gusta el OSINT y te gustaria que agregeria que agrege un nuevo stiio web para verificar que esta registrada o te gustaria hacer una contribucion al proyecto lo que tienes que hacer es contactame o iniciar una issues aqui.

![Interfaz Principal](public/assets/main_screenshot.png)

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


