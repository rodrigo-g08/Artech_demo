# ARTECH B01.2 — composición y recorrido fotográfico

Este bloque corrige B01 sobre la misma base estática de `fix/artech-demo` (commit `ae00eeb08c6fa3b2cf663eae77b7daaee7d81c53`) y conserva la rama de entrega `entrega/artech-b01`.

## Qué cambia

- Portada: clásico bitono a la izquierda, Porsche 911 GT3 rojo al centro y Porsche 911 Turbo blanco a la derecha. El texto y las acciones tienen su propio espacio.
- Inicio y ruta Colección: fondo negro continuo, vehículos completos, filtros, selección con flechas, detalle desplegable, recorrido interior y cierre hacia El taller.
- Interior: acercamiento al volante y a la consola mediante fotografías. En escritorio amplio acompaña al scroll; en móvil y con movimiento reducido se controla con tres botones. Es un recorrido fotográfico, no un modelo 3D.
- Botones redondeados con barrido de luz al pasar el puntero o recibir foco.
- Footer: recupera colección, taller, historia, blog, entradas, experiencias, preguntas frecuentes, reclamaciones, ubicación, horario, WhatsApp, correo, Instagram, privacidad, cookies e información legal de la base. Se omite restaurante según el alcance acordado.
- Se corrige la altura fija heredada de las imágenes que deformaba la composición. Los recortes muestran el auto completo dentro de su área.

## Fotografías

Todos los medios nuevos parten de las fotos suministradas en `A88A0846.zip` y `A88A0584.zip`. La trazabilidad está en `assets/data/b012-media.json`.

| Uso | Original |
| --- | --- |
| Clásico izquierdo | A88A0602.jpg |
| GT3 central | A88A0682.jpg |
| Turbo derecho | A88A0700.jpg |
| Interior y volante GT3 | A88A0834.jpg / A88A0831.jpg |
| Detalle GT3 | A88A0840.jpg |
| Interior y volante Turbo | A88A0909.jpg / A88A0921.jpg |
| Vistas laterales | A88A0683.jpg / A88A0702.jpg |

Los tres autos aislados son derivados editados con asistencia de IA para extraer el fondo, exportados con transparencia. Las otras imágenes mantienen la fotografía original y solo se redimensionan/comprimen a WebP; su encuadre se define con CSS. No son fotos de stock. Los reflejos que pertenecen a las fotografías se conservan; se eligió el GT3 rojo en lugar del Porsche negro con reflejos del mural.

No se asigna un modelo o año al clásico bitono porque la identificación no se confirmó. El teaser de taller usa su parrilla y carrocería: los archivos suministrados no incluyen la fotografía de manos trabajando del mockup.

## Estructura y alcance

Se conserva `index.html`, `assets/css/`, `assets/js/`, el router por hash y la información del catálogo. No cambia el backend ni se incorpora un framework. Python solo sirve archivos para la vista local, igual que Live Server.

Este bloque actualiza Inicio, la presentación de Colección, el menú compartido y el footer. Las páginas internas de Taller, Historia, Experiencias, las fichas antiguas de vehículos y el proceso de Entradas siguen en su base anterior. Su migración fotográfica completa corresponde a los próximos bloques. El catálogo anterior queda conservado, oculto dentro de Colección, mientras esta entrega muestra la selección de tres autos; no se elimina el inventario ni sus rutas directas.

El objetivo es acercar composición, proporción, ritmo y navegación a la captura con las fotografías disponibles. La copia exacta de las fotos de aquel mockup no es posible con este archivo.

## Validación realizada

- Pruebas del núcleo: fechas, almacenamiento y rutas inválidas, integridad del catálogo.
- Pruebas DOM integradas: carga y salida de intro, menú y Escape, filtros, tres autos, correspondencia de interiores, detalle desplegable, galería, rutas, idioma y footer.
- Casos de móvil y movimiento reducido, almacenamiento bloqueado y fotografía que falla.
- Sintaxis JavaScript, estructura CSS, IDs únicos, destinos ARIA, medios nuevos decodificables y rutas de recursos existentes.
- Manifest del paquete, hashes normalizados LF/CRLF, base B01 y reaplicación sin cambios.

No se ejecutó una revisión visual en un navegador real ni el instalador en Windows dentro de este entorno. Comprueba las proporciones en tu navegador después de aplicar el ZIP.

## Comprobación local

1. Abre `http://localhost:5500/?intro=1` para ver la entrada.
2. Comprueba la portada a 1440 px y a 390 px de ancho.
3. Baja hasta el footer. Verifica que ningún texto quede sobre los controles o recorte un auto.
4. Prueba los filtros, flechas, detalle «+», galería e interior.
5. Entra a Colección y a Entradas; cambia ES/EN.

El instalador incluye respaldo y rechaza archivos que no coincidan con B01. No realiza commit ni push.
