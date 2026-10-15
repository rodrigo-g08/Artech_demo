# ARTECH B02 + B03 — Taller, Experiencias y Entradas

Actualización sobre B01.2, en la misma estructura estática y la rama `entrega/artech-b01`. No requiere un framework, una compilación ni un cambio de servidor.

## B02: las dos páginas del recorrido

**Taller — `#p-workshops`**

Portada centrada «Lo extraordinario también se hace a mano», manos trabajando sobre piezas, tres escenas alternadas de carrocería / mecánica / tapicería y cierre hacia el interior. El desplazamiento acerca suavemente los detalles y revela los textos. Cada botón abre una vista ampliada con información; Escape y el botón de cierre devuelven el foco al control de origen.

**Experiencias — `#p-experience`**

Habitáculo con puntos interactivos en volante, consola y tapicería. En escritorio admite un movimiento leve con el puntero. En móvil se muestra la fotografía completa para conservar la correspondencia entre los puntos y sus detalles. El recorrido fotográfico de 24 segundos tiene reproducción, pausa, desplazamiento temporal y pantalla completa si el navegador la admite. Se detiene al abandonar la página, ocultar la pestaña o abrir el menú. No reproduce sonido ni utiliza un modelo 3D.

Continúa con las experiencias ARTECH, VIP y privada, y un cierre con el GT3 rojo hacia la selección de fecha. Sus botones preseleccionan la experiencia correspondiente en Entradas.

El movimiento reducido del sistema elimina acercamientos, desplazamientos decorativos y transiciones. Los controles siguen disponibles. El footer de B01.2 se conserva completo, incluido su contenido, enlaces y selector de idioma.

## B03: tres pasos de Entradas

Rutas: `#p-tickets`, `#p-tickets/collection`, `#p-tickets/vip`, `#p-tickets/private`.

1. **Tu visita.** Experiencia, cápsulas de fecha y horario, calendario mensual y visitantes. El resumen y el importe se actualizan al elegir. Las fechas pasadas y los lunes están deshabilitados; se utiliza la hora de Lima. Los horarios del mismo día que ya pasaron tampoco se ofrecen.
2. **Pago de demostración.** Nombre, correo, aceptación explícita y una tarjeta ficticia de solo lectura. «Usar datos de prueba» completa el formulario. «Opciones de demostración» permite recorrer aprobación o rechazo y reintento.
3. **Muestra de entrada.** Composición con el logo, el auto, los datos y un QR de demostración. Descarga un HTML autónomo con una muestra por visitante: puede abrirse, imprimirse o guardarse como PDF desde el navegador. El calendario `.ics` crea un plan tentativo en hora de Lima, sin reserva.

**No hay pasarela de pago, cobro, inventario de disponibilidad, emisión válida ni envío de correo.** El QR contiene únicamente `ARTECH DEMO - NO VALIDO PARA INGRESAR`. El navegador no guarda nombres, correos o información de pago en `localStorage` o `sessionStorage`.

Se mantienen los importes de la base como valores referenciales: S/ 80 por adulto para colección, S/ 120 para VIP y S/ 450 para privada. No son una confirmación de tarifas comerciales. Privada conserva el mínimo de 15 personas y el formulario admite un máximo de 20. Los horarios ofrecidos son referencias del prototipo, no cupos consultados a un servidor.

Las visitas privadas y los grupos con niños o adultos mayores pasan a **Tus datos → Consulta**. No se asignan tarifas desconocidas a esas categorías. El subtotal solo incluye los adultos y la coordinación se prepara para WhatsApp; únicamente se abre al pulsar «Enviar consulta». Nada se envía automáticamente.

## Fotografías y referencias

| Uso | Origen |
| --- | --- |
| Habitáculo, puntos y cuero | A88A0804.jpg del ZIP del usuario |
| Vista amplia del interior | A88A0800.jpg del ZIP del usuario |
| Emblema del volante | A88A0806.jpg del ZIP del usuario |
| Carrocería roja | A88A0840.jpg, ya optimizada en B01.2 |
| GT3 y clásico | Medios derivados de las fotos del usuario entregados en B01.2 |
| Manos reparando piezas | Dos adaptaciones ilustrativas de la escena del mockup `image(8).png`, mediante edición generativa |

Las fotos originales del interior solo se redimensionan y comprimen; los encuadres y acercamientos se aplican con CSS. Las escenas de reparación **no son fotografías documentales del taller ARTECH** ni estaban en los ZIPs: recuperan el enfoque de la referencia pedido para esta entrega. No se incorporó fotografía de stock. La trazabilidad, tamaños y hashes están en `assets/data/b023-media.json`.

## Archivos y convivencia con B01.2

- `index.html`: sustituye el contenido de las tres rutas, añade sus diálogos y carga los nuevos recursos.
- `assets/css/artech-b023.css`: composición, adaptación móvil, formularios y animaciones de B02/B03.
- `assets/js/artech-b02.js`: detalles, diálogos, puntos del habitáculo y recorrido fotográfico.
- `assets/js/artech-booking.js`: reglas de fechas, visitantes, estimaciones y calendario.
- `assets/js/artech-b03.js`: estados del flujo, formulario, descargas y consulta.
- `assets/media/b023/`: imágenes optimizadas y QR de muestra.
- `tests/b023-booking.test.cjs`: pruebas reproducibles de las reglas del flujo.

Se deja de cargar `visit-workshop.js`, que corresponde a las pantallas reemplazadas. El archivo anterior permanece en el repositorio. Los scripts heredados de capítulos omiten estas tres páginas mediante el mismo marcador usado en B01.2; no se duplica la navegación.

Inicio, Colección y footer mantienen B01.2. Historia, blog, fichas antiguas y otras rutas conservan su base anterior para los siguientes bloques. No se borra el inventario ni se publica ningún cambio.

## Validación realizada

- 8 pruebas del núcleo y las reglas de reservas: fechas, zona horaria, cierre de lunes, límite de anticipación, horarios, cantidades, mínimo privado, tarifas conocidas, datos y calendario tentativo.
- Pruebas DOM del conjunto: intro, menú, filtros y galería de B01.2; detalles del taller; puntos, reproducción y pausa del interior; rutas, ES/EN y almacenamiento bloqueado.
- Pruebas DOM de B03: calendario, cambios de experiencia, datos inválidos, aprobación / rechazo, cancelación al salir de la ruta, descarga con imágenes embebidas y texto escapado, `.ics` y consultas especiales.
- Sintaxis JS, lectura de CSS, IDs y destinos ARIA, footer idéntico, imágenes decodificables, integridad del paquete y comparación de hashes normalizados LF/CRLF.

Comando reproducible, sin instalar dependencias:

```powershell
node --test tests/core.test.cjs tests/b023-booking.test.cjs
```

**No se realizó una inspección visual en un navegador real ni se ejecutó PowerShell en Windows en este entorno.** Las pruebas DOM verifican comportamiento y estructura, pero no certifican una igualdad píxel a píxel con las capturas. Revisa el encuadre y las proporciones en tu navegador a 1440 px y 390 px después de aplicar el ZIP.

## Instalación y reversión

`Apply-ARTECH-B023.ps1` verifica B01.2 y la integridad de todos los archivos antes de escribir, acepta diferencias de salto de línea LF/CRLF y rechaza cambios locales incompatibles. Crea un respaldo junto al repositorio. Reaplicar el mismo bloque no vuelve a reemplazar archivos idénticos. La comprobación de rama convierte la salida de Git a cadena antes de usar `.Trim()`, incluyendo el caso de salida vacía.

Para revertir sin tocar otros trabajos: copia el `index.html` del respaldo sobre el de la entrega y retira únicamente los archivos nuevos listados en el manifest de B02/B03. Si ya confirmaste el bloque en Git, utiliza `git revert` sobre ese commit. Evita `reset --hard` o borrar el repositorio.

La guía `README.md` en la raíz del ZIP contiene aplicación, vista local y comandos para confirmar los archivos de este bloque. Python solo sirve los archivos; también puedes usar Live Server.
