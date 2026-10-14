# ARTECH · V3-B02.1 · Corrección visual aprobada

14 de octubre de 2026 · America/Lima. Aplicar sobre V3-B02, después de B01.

## Cambios

- Se eliminan los recuadros negros detrás del título, descripción, año y CTA de Colección y fichas. La fotografía original ocupa el viewport; no se sustituye por los mockups generados.
- El texto elige tinta oscura o clara mediante una muestra pequeña de la fotografía en la zona donde se muestra. No se oscurece ni se filtra la foto para lograr contraste. Si no se puede leer una imagen externa, se conserva una alternativa de color.
- El selector de cuatro vehículos es un único panel grande y translúcido, con separación uniforme, nombres de la misma escala y años de 36 px en escritorio. El desenfoque suave corresponde únicamente al panel de cristal, no a la fotografía completa.
- Se corrige el tamaño de las letras animadas: los spans internos heredan la tipografía de su título o año, sin tomar el antiguo tamaño pequeño de los metadatos.
- Cada opción muestra su barra de progreso. La barra roja se llena durante el tiempo disponible antes del siguiente cambio automático. La selección manual dispone de al menos nueve segundos; el recorrido automático usa siete segundos.
- Se elimina el botón de pausa/reanudación. El carrusel mantiene la pausa temporal mientras se usa un control o se navega con teclado, al abrir el menú y al ocultar la pestaña. Con movimiento reducido, se conserva la selección manual.
- Se elimina el pequeño recuadro separado con el nombre de la pieza seleccionada. El enlace ↗ en la esquina del panel permite abrir su ficha.
- En las fichas, el regreso a Colección queda directamente sobre la foto. Las flechas anterior/siguiente están en los lados, sin una franja negra secundaria. El header principal permanece.
- Los nombres conservan el brillo platinado y vuelven a su tinta original.
- Las flechas de colección tienen fade de salida y entrada entre fotografías. Las flechas entre fichas precargan la foto siguiente, apagan la foto y el texto anteriores y revelan la nueva pieza. Al terminar, se activa el brillo del nombre. La navegación por URL y los enlaces a fichas continúan funcionando.
- Los filtros, las cifras animadas, la grilla de cuatro columnas y el cierre con la foto del mismo auto conservan el comportamiento de B02.

## Aplicar en PowerShell

Guardar `ARTECH_V3_B02_1.zip` en Descargas y usar una terminal distinta de la que mantiene PHP abierto:

```powershell
Expand-Archive "$env:USERPROFILE\Downloads\ARTECH_V3_B02_1.zip" "$env:USERPROFILE\Downloads" -Force

cd "C:\Users\rgame\OneDrive\Documentos\GitHub\Artech_demo"

git status --short
$artechPatch = "$env:USERPROFILE\Downloads\ARTECH_V3_B02_1\artech-v3-b02-1.patch"
git apply --check $artechPatch
if ($LASTEXITCODE -ne 0) { throw "El patch no coincide con B02. No lo fuerces." }
git apply $artechPatch
if ($LASTEXITCODE -ne 0) { throw "La aplicación falló. Detente antes del commit." }
```

No repetir los patches de B01 o B02 si ya están aplicados. No usar `--reject`, `--3way` ni forzar una aplicación que falla.

## Visualizar

Con PHP abierto, pulsar Ctrl + F5:

- http://localhost:8000/#p-collection
- http://localhost:8000/#p-vehicle/asv-385

Si PHP está detenido, ejecutar desde la carpeta del proyecto y dejar la terminal abierta:

```powershell
php -S localhost:8000
```

La revisión en navegador corresponde al usuario. No se ejecutó la suite de tests ni se abrió un navegador. Se revisaron sintaxis JavaScript, estructura HTML, IDs y delimitadores CSS, retirada del control de pausa, y aplicación del patch sobre una copia limpia de B02. Los archivos resultantes se compararon con los preparados.

## Commit y subida

Después de revisar en localhost:

```powershell
git add index.html assets/css/v3-block2-fix.css assets/js/v3-collection.js assets/js/v3-shell.js docs/ARTECH_V3_B02_1.md
git commit -m "fix: align Artech collection and vehicle overlays with approved design"
git push -u origin HEAD
```

Próximo bloque: V3-B03, con Taller, café, historia, cronología y cierre de booking.
