# ARTECH F01 · Seis correcciones

Aplicar sobre B01.2 + B02/B03 + B04/B05/B06. El paquete conserva la estructura HTML/CSS/JavaScript, la rama actual y las fotografías ya instaladas.

## Qué cambia

1. **Ticketera.** La flecha abre las otras dos experiencias, el calendario o los horarios dentro del formulario. El panel desplaza el contenido, se desvanece al abrir y cierra al elegir. Solo hay un panel abierto; Escape lo cierra y devuelve el foco. Se conserva la validación y la pantalla ARTECH de carga/confirmación.
2. **Header y carta.** Header negro consistente. Categorías con texto de 16 px y navegación lateral; descripciones de 16 px y nombre bajo el plato de 20–26 px. El mismo footer negro y compacto conserva los enlaces, dirección, horarios y contacto en todas las rutas; se oculta el bloque de texto bajo el logo.
3. **Workshop.** Tres capítulos en el flujo de la página, con nueve pasos visibles al recorrerlos. Sin botones de detalle ni diálogos del taller. Las fotos de cada etapa conservan su proporción, sin zoom ni recorte CSS. Texto y fotografía ocupan columnas independientes; en móvil pasan a una columna. Se conserva el cierre del interior que ya estaba aprobado.
4. **Colección.** Video original de la rama `fix/artech-demo`, idéntico al archivo de origen: 1920 × 1080, 10 segundos, con el emblema Richard-Brasier de la referencia. Título y subtítulo anteriores conservados. KPIs discretos, filtros por marca/época y búsqueda por modelo/año/placa. Fotos del grid completas y año debajo de cada modelo. Nuevo cierre fotográfico.
5. **Galería y ficha.** Sala oscura con suelo de madera y cuatro fotografías vecinas, solo durante la apertura/cierre. La foto del auto pasa a pantalla completa. Debajo aparecen las filas Manufacturer, Model, Year, Plate, Body, Engine, Displacement, Power y los demás datos disponibles. Luego, cuatro recomendaciones entre unidades con foto, priorizando marca y proximidad de año. Volver conserva filtros y posición. Escape o un cambio de ruta cancela la animación y libera la interacción.
6. **Inicio.** Halos suaves y un barrido de luz sobre los recortes originales de los tres vehículos. Retirado el enlace inferior «Next chapter / The collection». La preferencia de movimiento reducido elimina las animaciones y evita la reproducción automática del video.

## Fotografías y datos

Las 206 fotografías de los ZIPs forman 37 grupos de vehículos, no 96. Se conservan las 96 fichas originales y las 206 fotos. Hay 10 correspondencias confirmadas: F01 añade el Chalmers SIX de 1914 por su calcomanía AXS-615. Las otras 27 galerías siguen disponibles en Archivo fotográfico sin atribuirles una ficha técnica por parecido visual. Las fichas de catálogo sin fotografía confirmada muestran un registro de archivo; no se sustituyen con fotos antiguas ni con otro automóvil. No hay una fotografía protagonista de Ferrari Testarossa en los ZIPs; su ficha técnica sí está disponible.

El único nuevo recurso generado es la sala vacía de la transición. Los automóviles de esa escena son elementos de imagen separados que utilizan las fotografías originales. Las imágenes de plato, ticketera y manos del taller ya pertenecían a los bloques aprobados y se conservan.

La compra mantiene el comportamiento de demostración existente: no cobra ni emite una reserva real. F01 modifica la interacción y la presentación.

## Instalar

Con el servidor detenido (`Ctrl+C`) y el ZIP en Descargas, ejecutar en PowerShell:

```powershell
$repo = 'C:\Users\rgame\OneDrive\Documentos\GitHub\Artech_demo'
$stage = Join-Path $env:TEMP ('ARTECH_F01_' + [guid]::NewGuid().ToString('N'))
Expand-Archive -LiteralPath "$env:USERPROFILE\Downloads\ARTECH_F01_Fixes.zip" -DestinationPath $stage
& "$stage\Apply-ARTECH-F01.ps1" -Repository $repo
```

El instalador comprueba integridad y base antes de copiar, admite LF/CRLF, guarda un respaldo junto al repositorio y restaura los archivos escritos si falla una copia. No cambia de rama, hace commit ni push. Si encuentra cambios locales incompatibles, se detiene sin modificar nada; no fuerces la aplicación.

Después de un mensaje de aplicación correcta:

```powershell
Set-Location $repo
py -m http.server 5500
```

Abrir `http://localhost:5500/` y recargar con **Ctrl+F5**. Python sirve los archivos estáticos: la aplicación continúa siendo HTML/CSS/JavaScript, sin migración de estructura ni backend nuevo.

## Revisión local

- `/#top`: halos sobre los tres autos, sin Next chapter / Collection.
- `/#p-tickets`: abrir las tres flechas, seleccionar y comprobar el desplazamiento. Completar datos de prueba y comprobar la carga ARTECH y confirmación.
- `/#p-workshops`: recorrer las tres etapas en escritorio y móvil; comprobar texto, fotografía completa y cierre conservado.
- `/#p-cafe`: categorías, descripción y pie del plato legibles; probar flechas y teclado.
- `/#p-collection`: video del emblema dorado, contadores al entrar de nuevo en pantalla, filtros y año en las tarjetas.
- `/#p-vehicle/akv-003`: Porsche con fotos, ficha y cuatro recomendados. Abrir desde el grid para ver la transición; volver debe conservar filtro y scroll.
- `/#p-vehicle/cxj-330`: ficha Ferrari Testarossa con placa CXJ - 330; fotografía pendiente, según la cobertura real.
- Cambiar idioma y comprobar el mismo footer en todas las rutas.

## Verificación realizada

- 15 pruebas Node de fechas/horarios, visitantes, rutas, catálogo, recomendaciones e integridad de medios: aprobadas.
- DOM con los scripts reales: apertura/cierre inline, foco, Escape, validación de datos, carga, pago simulado aprobado/rechazado; filtros, datos técnicos, cuatro recomendados, retorno al scroll; navegación de categorías: aprobado.
- Ciclo de la galería con API de animación simulada: creación de sala/fotos, navegación, restauración de interacción y cancelación con Escape: aprobado.
- 229 IDs únicos, referencias ARIA, 75 recursos locales referenciados en HTML, sintaxis CSS y coincidencia byte a byte del video original: comprobados.
- No se ejecutó una revisión visual en navegador ni PowerShell nativo en este entorno. Las pruebas DOM no verifican geometría, encuadres ni suavidad de animación. Revisar esos puntos localmente antes de publicar.

Pruebas sin dependencias adicionales:

```powershell
node --test tests/core.test.cjs tests/b023-booking.test.cjs tests/b456-media.test.cjs tests/f01-collection.test.cjs
```
