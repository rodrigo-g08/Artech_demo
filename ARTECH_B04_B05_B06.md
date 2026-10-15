# ARTECH · B04 + B05 + B06

Actualización sobre B01.2 + B02/B03. Mantiene HTML, CSS y JavaScript estáticos y la tipografía Inter local de la entrega anterior.

## B04 · Compra y footer

- Fondo negro en todos los pasos de la compra, incluida la regla antigua que lo volvía blanco.
- Porsche oscuro frontal en el resumen y en la entrada; vista trasera al cerrar el recorrido. Recursos derivados de la referencia de compra.
- Botones rojos redondeados, borde metálico y barrido de luz al pasar el puntero.
- Después de validar datos: pantalla negra, ARTECH centrado y una línea de progreso. Luego aparece «Tu visita está confirmada.»
- Escape cancela la transición y devuelve el foco. Cambiar de página cancela la operación pendiente.
- Footer negro más compacto, sin las tres barras decorativas, con contacto, navegación y enlaces legales.

La compra sigue siendo una demostración local: no hay pasarela, cobro, reserva real, correo automático ni entrada válida. Las consultas de grupos privados, menores y tarifas especiales mantienen el flujo de consulta; no se confirman como reservas.

## B05 · Colección

| Contenido | Cobertura |
| --- | --- |
| Fichas originales conservadas | 96 |
| Fotografías originales de los dos ZIP | 206 |
| Unidades protagonistas fotografiadas | 37: 25 clásicos y 12 Porsche |
| Vínculos inequívocos entre fotografía y ficha | 9 |
| Candidatos de confianza media, pendientes de confirmar | 15 |
| Candidatos de confianza baja | 5 |
| Grupos sin candidato | 8 |

La vista inicial «En imágenes» muestra las 37 unidades. «Catálogo completo» permite consultar las 96 fichas. Las fichas sin fotografía identificada usan una composición tipográfica con marca y año. No se atribuyen a esas fichas imágenes de un auto diferente.

Al abrir una foto, la tarjeta se convierte en una obra enmarcada y las imágenes vecinas retroceden en perspectiva. La misma imagen pasa a la ficha. Incluye todas las tomas de la unidad, miniaturas, anterior/siguiente, teclado, recomendaciones y retorno al punto del grid. Se respetan los ajustes de movimiento reducido.

Las 206 fotos se usan una vez en la agrupación; cada una dispone de una versión de 640 px y otra de 1920 px de ancho. Las fotografías de la colección no son generadas. No hay un Ferrari protagonista en estos dos ZIP.

La evidencia y las correspondencias editables están en:

- `assets/data/b05-photo-audit.json`: auditoría completa, candidatos, confianza y observaciones.
- `assets/data/b05-gallery.json`: grupos que consume la interfaz. Solo los vínculos de confianza alta incluyen `slug`.
- `assets/data/b05-media.json`: procedencia, dimensiones y SHA-256 de las 412 variantes.

Para confirmar una correspondencia, revisar la unidad y asignar su `slug` existente al grupo de `b05-gallery.json`. No crear años o especificaciones a partir de la apariencia.

## B06 · Restaurante

- Mesa de madera a pantalla completa y plato protagonista.
- En escritorio, el desplazamiento mantiene el plato visible mientras entra la carta sobre fondo crema.
- La carta contiene las 52 opciones de las 11 categorías de `CAFE_MENU`, con las traducciones de `CAFE_EN` existentes.
- Cambio lateral de imagen al seleccionar categorías o platos; navegación por teclado.
- En móvil y con movimiento reducido se usa un recorrido vertical sin fijar la escena.
- Consulta por WhatsApp mediante un enlace que abre el usuario.

Las 13 imágenes de comida/bebida son referenciales. Para opciones sin foto individual se muestra y se nombra el plato representativo de la categoría; no se presenta como fotografía de otro plato. No se han inventado precios. La carta original contiene descripciones, pero no importes numéricos.

Los recursos de compra y restaurante están en `assets/media/b04/` y `assets/media/b06/`. Sus prompts y procedencia están en `assets/data/b456-generated-media.json`; se usó la herramienta integrada de generación de imágenes.

## Aplicación

El instalador verifica todos los archivos antes de copiar, acepta diferencias LF/CRLF, detecta una instalación ya aplicada y crea un respaldo de los archivos reemplazados. Si encuentra una base distinta o cambios locales en los archivos afectados, se detiene antes de copiarlos.

Desde PowerShell, con el ZIP en Descargas:

```powershell
$repo = 'C:\Users\rgame\OneDrive\Documentos\GitHub\Artech_demo'
$stage = Join-Path $env:TEMP ('ARTECH_B456_' + [guid]::NewGuid().ToString('N'))
Expand-Archive -LiteralPath "$env:USERPROFILE\Downloads\ARTECH_B04_B05_B06.zip" -DestinationPath $stage
& "$stage\Apply-ARTECH-B456.ps1" -Repository $repo
Set-Location $repo
py -m http.server 5500
```

Si ya está ejecutándose el servidor en esa consola, detenerlo con `Ctrl+C` antes de aplicar. Abrir después:

- `http://localhost:5500/#p-tickets`
- `http://localhost:5500/#p-collection`
- `http://localhost:5500/#p-cafe`

Recargar con `Ctrl+F5`. La rama de entrega sigue siendo `entrega/artech-b01`. El instalador no hace commit ni push.

Después de revisar el resultado:

```powershell
git diff --stat
git add index.html assets/js/site.js assets/js/editorial.js assets/js/artech-b01.js assets/js/artech-b03.js assets/js/artech-b04.js assets/js/artech-b05.js assets/js/artech-b06.js assets/css/artech-b04.css assets/css/artech-b05.css assets/css/artech-b06.css assets/data/b05-gallery.json assets/data/b05-photo-audit.json assets/data/b05-media.json assets/data/b456-generated-media.json assets/media/b04 assets/media/b05 assets/media/b06 tests/b456-media.test.cjs ARTECH_B04_B05_B06.md
git commit -m "feat(web): add dark checkout, collection galleries and restaurant menu"
git push -u origin HEAD
```

## Comprobaciones

- Pruebas de fechas, tarifas, consulta, formulario, pago de demostración aprobado/rechazado y exportaciones.
- Pruebas DOM de entrada inicial, menú, taller, experiencias, 37 galerías, 96 fichas, recomendaciones, retorno al grid, idiomas y movimiento reducido.
- Recuento de las 52 opciones de la carta y existencia de cada recurso.
- Integridad SHA-256 de todas las variantes fotográficas y recursos nuevos; sintaxis JavaScript, CSS e IDs de HTML.

Pruebas de datos ejecutables sin dependencias adicionales:

```powershell
node --test tests/core.test.cjs tests/b023-booking.test.cjs tests/b456-media.test.cjs
```

No se dispuso de un navegador de prueba en este entorno: queda pendiente verificar el aspecto y el ritmo de las animaciones en el navegador de Windows. El instalador se revisó y su manifiesto se comprobó, pero no se ejecutó en PowerShell de Windows.
