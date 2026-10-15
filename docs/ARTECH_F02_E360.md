# ARTECH F02 + E360

Un entregable con dos tareas. Actualiza la base **F01** ya instalada sobre B01.2 + B02/B03 + B04/B05/B06. Conserva la aplicación estática HTML/CSS/JavaScript y la rama activa.

## F02: correcciones visuales y navegación

- Reflectores con origen inmediatamente debajo del header, en el inicio y la experiencia E360. Se ajustan a la altura real del header.
- Eliminado el bloque «Character is in the details», sin dejar su espacio reservado.
- RESCUE. REBUILD. SHARE. crece palabra por palabra con el scroll. El barrido luminoso vuelve al blanco y se repite en sentido inverso al subir. El texto se traduce en español.
- Tres cruces SVG centradas en Experiences. Cada una abre una fotografía nueva y grande del volante, consola o tapicería, con transición de aproximación y retorno al punto seleccionado. Las recreaciones están identificadas como tales.
- Colección conserva «The collection · 96», filtros y el video original. Desaparece la pestaña de archivo y la cifra 206 de la interfaz.
- El grid muestra 37 grupos con fotografía utilizable. Sus secuencias contienen 144 fotografías horizontales originales, completas y proporcionadas sobre fondo negro. Las 62 verticales se conservan en los archivos, pero quedan fuera del recorrido.
- Las fichas conservan VEHICLE INFORMATION y cuatro recomendaciones por marca/proximidad de año. La sala de galería sigue apareciendo en la transición de apertura y regreso.
- Se mantienen el header compartido, el footer negro compacto, la ticketera inline y las tres etapas del taller.

## E360: tres vehículos y seis vistas por vehículo

Un acceso pequeño debajo de cada vehículo del inicio abre su recorrido: exterior, lateral, trasera, habitáculo, volante y consola. Incluye nombre/año, «Volver al inicio», «Ver más», indicador lateral de zona, flechas, teclado y gesto horizontal. La imagen final se ajusta completa; las transformaciones son temporales durante la transición.

Se incluyen 16 imágenes nuevas WebP, aproximadamente 2.9 MB en total: 13 para los recorridos y tres para los puntos del habitáculo. Cinco vistas interiores reutilizan fotografías originales. Cada recreación muestra su procedencia en pantalla y está documentada en `assets/data/e360-media.json`.

**Es un recorrido guiado con vistas prerenderizadas, no un modelo 3D con giro libre.** No se incorporan geometría 3D ni reconstrucción medida de interiores. Las recreaciones representan una aproximación visual; no son evidencia técnica del vehículo.

| Acceso | Identidad y enlace |
| --- | --- |
| Porsche rojo | Porsche 911 GT3, 2010 · A4D-305. Correspondencia confirmada por la calcomanía visible en A88A0842.jpg; año de la ficha original. |
| Porsche blanco | Porsche 911 Turbo, 1986 · D5Z-370. Enlace a su ficha del catálogo. |
| Clásico | Chrysler Roadster. Año por confirmar; enlace a su propia galería fotográfica sin asignarle una ficha ajena. |

El catálogo conserva sus 96 registros y las 206 fotos originales. Hay 11 correspondencias confirmadas entre los grupos fotografiados y las fichas; el número 96 no significa que existan 96 vehículos fotografiados en estos ZIPs.

## Instalación en PowerShell

Detén el servidor local con `Ctrl+C`. Con el ZIP en Descargas:

```powershell
$repo = 'C:\Users\rgame\OneDrive\Documentos\GitHub\Artech_demo'
$stage = Join-Path $env:TEMP ('ARTECH_F02_E360_' + [guid]::NewGuid().ToString('N'))
Expand-Archive -LiteralPath "$env:USERPROFILE\Downloads\ARTECH_F02_E360.zip" -DestinationPath $stage
& "$stage\Apply-ARTECH-F02-E360.ps1" -Repository $repo
```

Espera el mensaje **«F02+E360 aplicado»**. El instalador comprueba base e integridad antes de copiar, admite LF/CRLF y guarda un respaldo junto al repositorio. Si una copia falla, restaura los archivos escritos. Si detecta cambios locales incompatibles, se detiene sin copiar: conserva el mensaje para revisar el archivo afectado.

No cambia de rama ni ejecuta commit, push o despliegue. No modifica las fotografías originales ni la configuración de Cloudflare. Se puede ejecutar de nuevo; los archivos ya actualizados no se copian otra vez.

```powershell
Set-Location $repo
py -m http.server 5500
```

Abre `http://localhost:5500/#top` y recarga con **Ctrl+F5**. Python sirve los archivos; no cambia la estructura del proyecto.

## Revisión visual pendiente en tu navegador

1. Inicio: comprobar que los reflectores nacen debajo del header y abrir las tres cruces. Verificar también el siguiente bloque al hacer scroll.
2. `/#exp3d/red`, `/#exp3d/white`, `/#exp3d/classic`: recorrer seis zonas, usar flechas/teclado/gesto horizontal, volver al inicio y abrir «Ver más».
3. `/#p-experience`: abrir los tres detalles y volver con el enlace o Escape. Debe verse una toma nueva, sin cuadro de texto.
4. `/#p-history`: bajar y subir sobre las tres palabras; comprobar tamaño, luz y regreso al blanco.
5. `/#p-collection`: filtrar, abrir un auto, recorrer sus imágenes completas, bajar a la ficha y abrir un recomendado. No debe aparecer la cifra 206 ni la pestaña de archivo.
6. Revisar escritorio y móvil, ambos idiomas y movimiento reducido. Comprobar el mismo header/footer y que el taller conserva sus nueve pasos legibles.

## Verificación realizada

- **19/19 pruebas Node aprobadas:** fechas, horarios, visitantes, rutas, catálogo, recomendaciones, exclusión de verticales, identidad de los tres vehículos y hashes de imágenes.
- DOM con los scripts reales: 18 vistas, tres puntos de detalle, fichas y recomendaciones, regreso con foco, navegación rápida, teclado/gesto, idioma y animación de palabras reversible.
- Simulación de fallo de imagen: conserva la vista anterior, permite reintentar y evita que una descarga tardía cambie la ruta después de salir.
- Regresión DOM: ticketera inline, carga y confirmación de demostración; filtros y regreso al scroll; taller, carta, footer y transición de galería.
- 233 IDs únicos, referencias ARIA, 78 recursos del HTML, sintaxis de 17 scripts y análisis de 18 hojas de estilo comprobados.
- Integridad y condiciones del manifiesto comprobadas, incluyendo aplicación inicial, segunda aplicación, LF/CRLF y rechazo de una base modificada.

**No se ejecutaron una revisión visual en navegador real ni el instalador en PowerShell nativo en este entorno.** Las pruebas DOM simulan la API de animaciones y no comprueban geometría, iluminación, encuadres o fluidez. Revisa esos puntos localmente antes de publicar.

Para repetir las pruebas de datos sin instalar dependencias:

```powershell
node --test tests/core.test.cjs tests/b023-booking.test.cjs tests/b456-media.test.cjs tests/f01-collection.test.cjs tests/f02-e360.test.cjs
```

## Guardar los cambios en Git

Después de revisar la web y detener el servidor, puedes preparar únicamente los archivos de este paquete. Mantén abierta la misma terminal para conservar `$stage`:

```powershell
Set-Location $repo
$manifest = Get-Content -LiteralPath "$stage\manifest.json" -Raw | ConvertFrom-Json
$paths = @($manifest.files | ForEach-Object { $_.path })
git add -- $paths
if ($LASTEXITCODE -ne 0) { throw 'No se pudieron preparar los archivos.' }
git diff --cached --stat
git status --short
```

Comprueba que el área preparada contiene lo que quieres publicar. Cuando esté correcto:

```powershell
git commit -m "feat(web): add F02 visual fixes and guided three-car experience"
if ($LASTEXITCODE -ne 0) { throw 'Revisa el resultado del commit antes de continuar.' }
git push -u origin HEAD
```

La compra conserva el modo de demostración anterior: este paquete no integra cobros ni reservas reales.
