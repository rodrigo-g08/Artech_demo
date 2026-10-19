# ARTECH P10 — escala, sombras y entradas

Base: P09. Entrega: 19 de octubre de 2026. Este parche contiene cambios nuevos.

## Cambios visibles

- La geometría usa el contorno del vehículo y conserva su proporción. El techo disponible sube de 52,8 % a 65 % de la escena en horizontal y de 36 % a 45 % en vertical. Los autos altos que antes quedaban limitados por altura crecen hasta aproximadamente 23 % en horizontal y 25 % en vertical. Los deportivos que ya alcanzaban el ancho previsto conservan ese ancho.
- El ancho máximo continúa en 69,6 % de la escena horizontal y 91,2 % en vertical. No se estiran las fotografías para igualar artificialmente autos de proporciones diferentes. Se conserva el vehículo completo y una línea de piso común.
- Sombras de contacto más densas bajo las ruedas y una sombra difusa de carrocería más marcada, usando los puntos medidos de cada foto. El ajuste se aplica a tarjetas, museo, fichas, miniaturas y transición de entrada.
- Se conservan las 96 fichas, sus 39 vistas fotográficas en 27 vehículos y las 69 fichas sin foto. No se generan fotos adicionales. El taller P09, video, header, tipografías, restaurante y cierre de Experiences quedan conservados.

## Entradas y QR

Se elimina el formulario de pago ficticio. No existe una pasarela de cobros en la base recuperada. La nueva acción registra una solicitud y devuelve un QR único con enlace a su estado. No presenta una solicitud como pagada o confirmada.

Estados: pendiente, confirmada, utilizada, cancelada y vencida. Solo el equipo, autenticado con la clave del servidor, puede confirmar una visita después de validar la disponibilidad y el pago o acuerdo. El ingreso se registra únicamente en la fecha solicitada y una sola vez, mediante una actualización atómica. La entrada es de grupo: un QR admite al grupo completo una vez. No se duplica ese QR en entradas individuales.

El QR usa un token de 256 bits en el fragmento del enlace. La base guarda su hash. Las consultas públicas no devuelven el nombre ni el correo del comprador. Las solicitudes sí guardan esos datos para la coordinación; no se envía correo automáticamente. Los precios siguen siendo referenciales.

Descargar entrada genera un HTML autónomo con el QR, imprimible como PDF. El estado impreso es una captura: al escanear se consulta el registro vigente. También se conserva la descarga de calendario. El enlace de la entrada permite recuperarla en otro equipo, siempre que el servidor publicado esté configurado.

## Probar antes de desplegar

Los cambios visuales funcionan con el servidor estático habitual. Para registrar y confirmar solicitudes localmente, usa Node.js 20 o posterior, sin instalar dependencias:

```powershell
Set-Location 'C:\Users\rgame\OneDrive\Documentos\GitHub\Artech_demo'
node .\scripts\p10\local.mjs
```

Abre http://localhost:8788/#p-tickets. El servidor muestra una clave temporal de equipo en tu terminal. Completa una solicitud, pulsa «Abrir mi entrada» y despliega «Control de acceso». Introduce esa clave, marca la revisión del acuerdo y confirma. En la página anterior, «Actualizar estado» muestra la confirmación. Para probar ingreso, la visita debe tener la fecha del día, siempre que el museo esté abierto. Ctrl+C detiene el servidor.

Los registros locales se guardan en la carpeta hermana `ARTECH_P10_local`, fuera del repositorio. No se suben con el parche. Las entradas locales se identifican como prueba y no son válidas para el museo. Un enlace localhost pertenece a esa computadora; para abrir el QR desde un móvil se necesita el servidor publicado. La clave de equipo cambia al reiniciar; las solicitudes se conservan. Wallet no emite pases de la prueba local.

Con Live Server sin backend, el formulario indica que el servicio todavía no está disponible y mantiene el enlace de coordinación. No fabrica un ticket como sustituto.

## Activar reservas en Cloudflare Pages

El parche añade Pages Functions, sin reemplazar la configuración de hosting existente. No ejecuta despliegues ni configura tu cuenta.

1. Crea una base D1 desde tu cuenta o con `npx wrangler@4 d1 create artech-tickets`.
2. En el proyecto Pages `artech-demo`, agrega el binding D1 llamado exactamente `ARTECH_TICKETS_DB`, asociado a esa base.
3. Aplica el esquema a esa base:

```powershell
npx wrangler@4 d1 execute artech-tickets --remote --file .\scripts\p10\schema.sql
```

4. Configura `ARTECH_PUBLIC_ORIGIN` como `https://artech-demo.pages.dev`, sin barra final. Agrega `ARTECH_STAFF_TOKEN` como secreto, con al menos 32 caracteres aleatorios. No lo pongas en JavaScript, Git ni en el chat. Se usa en el panel de control de la entrada.
5. Publica la versión con las funciones y vuelve a desplegar tras cambiar bindings o secretos. La salida `/api/artech/health` debe indicar `ready: true`.

Si utilizas un dominio distinto, cambia `ARTECH_PUBLIC_ORIGIN`. El enlace QR completo debe caber en 106 bytes; el dominio actual cabe. Los entornos preview necesitan su propio origen y bindings. No se habilita aprobación desde el navegador del visitante. No hay integración automática de pagos; para eso hace falta elegir y conectar la pasarela y verificar sus webhooks en el servidor.

No configures `ARTECH_LOCAL_TEST` en Cloudflare: es exclusivo del servidor de prueba local. Si el proyecto usa un `_worker.js` existente, el instalador se detiene porque ese modo requiere integrar las rutas en su worker.

## Apple Wallet y Google Wallet

Ambas opciones aparecen en el resultado y en la página de la entrada. Para una visita confirmada, cada botón solicita el pase al servidor. Si falta configuración, explica que esa opción todavía no está activada. No descarga un JSON con extensión de pase ni devuelve un enlace ficticio.

Apple: se construye un `.pkpass` con el QR de verificación, manifest SHA-1 y firma CMS/PKCS7 separada con RSA/SHA-256. Configura estos valores en el servidor:

- `APPLE_PASS_TYPE_ID`: Pass Type ID registrado.
- `APPLE_TEAM_ID`: Team ID de ARTECH.
- `APPLE_PASS_CERT_PEM`: certificado Pass Type ID vigente.
- `APPLE_PASS_KEY_PEM`: clave privada RSA PKCS8 PEM, sin contraseña, como secreto.
- `APPLE_WWDR_CERT_PEM`: certificado intermedio correspondiente de Apple.
- Opcionales: `APPLE_PASS_ICON_BASE64` e `APPLE_PASS_ICON_2X_BASE64`, iconos PNG de 29×29 y 58×58. Sin ellos se reutiliza el PNG original `assets/logo.png` como icono y logo; conviene preparar estos tamaños para el acabado del pase.

Google: se firma un JWT RS256 y se genera el enlace oficial de guardado. Requiere cuenta emisora, API habilitada, clase creada y permisos de la cuenta de servicio:

- `GOOGLE_WALLET_ISSUER_ID`
- `GOOGLE_WALLET_CLASS_ID`: clase genérica de ese emisor.
- `GOOGLE_WALLET_SERVICE_EMAIL`
- `GOOGLE_WALLET_PRIVATE_KEY_PEM`: clave RSA PKCS8 PEM de esa cuenta de servicio, como secreto.

La cuenta emisora debe tener el acceso de publicación que corresponda. El modo de prueba del proveedor no equivale a disponibilidad pública. No se implementan notificaciones de actualización de los pases ya guardados; el QR siempre consulta el estado vigente al escanearse. Después de un ingreso o cancelación, el servidor rechaza usos posteriores aunque se conserve el pase en Wallet.

Fuentes oficiales consultadas:

- https://developer.apple.com/help/account/capabilities/create-wallet-identifiers-and-certificates/
- https://developer.apple.com/library/archive/documentation/UserExperience/Conceptual/PassKit_PG/Creating.html
- https://developers.google.com/wallet/generic/web
- https://codelabs.developers.google.com/add-to-wallet-web
- https://developers.cloudflare.com/pages/functions/bindings/
- https://developers.cloudflare.com/pages/functions/api-reference/

## Verificación y límites

10 pruebas automatizadas de integración, geometría y servidor: registro idempotente, rechazo de aprobación por visitantes, bloqueo entre orígenes, estados y fecha de uso, dos ingresos simultáneos, ausencia de configuración, flujo del formulario, idioma y opciones de Wallet. Geometría comprobada para 39 fotos en 6 tamaños de escena. Los QR coinciden con un generador independiente y se leen correctamente con ZXing. El esquema y la consulta atómica también se comprobaron con SQLite.

La firma Google se verificó criptográficamente y la firma Apple CMS se verificó con OpenSSL usando certificados efímeros de prueba. Eso no certifica la aceptación en Apple Wallet ni Google Wallet: falta probar con las credenciales reales y dispositivos. No se tuvo acceso a tu cuenta de Cloudflare, a tu Git local ni a un navegador de pruebas compatible; tampoco se ejecutó PowerShell en Windows. Se verificaron sintaxis JavaScript, archivos del paquete y SHA-256. Hace falta tu revisión visual en el navegador antes de publicar.
