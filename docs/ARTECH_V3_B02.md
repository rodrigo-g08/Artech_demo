# ARTECH · V3-B02 · Colección y fichas

14 de octubre de 2026 · America/Lima. Aplicar después de V3-B01.

## Qué cambia

- La fotografía de la colección ocupa todo el viewport. Se retiran los filtros de brillo, contraste y las máscaras del hero. El texto tiene una superficie negra propia para conservar legibilidad sin modificar la foto.
- Flechas de pieza anterior y siguiente en los extremos izquierdo y derecho. Se conservan los selectores de marca/año y se añade pausa/reanudación del cambio automático.
- Cuatro destacados, en orden: Auburn 852 (1936), Maserati 300S (1956), Ferrari Testarossa (1988), Porsche 911 GT2 RS (2018). Cambian automáticamente cada siete segundos mientras la cabecera de la colección está visible. El nombre y el año reciben el mismo brillo platinado por letras.
- El carrusel espera mientras se usa un enlace o botón, mientras se navega con teclado, al abrir el menú y al ocultar la pestaña. Una selección manual da al menos nueve segundos antes de continuar. Con movimiento reducido, el cambio es manual.
- Fotografías precargadas antes del cambio y fundido entre dos imágenes, sin oscurecerlas. Nombre, año y enlace corresponden al vehículo seleccionado.
- Las cifras del catálogo están centradas y cuentan desde cero hasta los valores del catálogo. La animación se repite al salir y volver a entrar en esa zona, tanto subiendo como bajando; no reinicia en cada píxel de scroll. Se mantienen las cifras reales, no se cambia el catálogo.
- Grilla de cuatro columnas por defecto en escritorio amplio, dos en tablet y una en celular. Se puede elegir una, dos o cuatro columnas en escritorio. Se mantienen búsqueda, filtros, doce piezas por página y paginación.
- Al volver de una ficha se conserva el punto anterior de la colección y sus filtros, página y distribución seleccionados.
- Las fichas abren inmediatamente, sin la cortina de fundido aplicada a otras páginas. Se elimina el botón «Ampliar fotografía» de la portada de la ficha y la portada deja de abrir el lightbox. La galería de detalles conserva su ampliación voluntaria.
- Cada nombre de vehículo tiene un destello platinado por letras que vuelve a su color original. Se repite al explorar otra ficha. El texto permanece disponible para lectores de pantalla.
- El cierre «Te espera en Chorrillos» incorpora la fotografía del mismo vehículo de la ficha abierta.

## Base y límites

Base de contenido: V3-02 + V3-B01. El patch no contiene las modificaciones del bloque anterior: es necesario aplicarlas primero.

Se usan las fotografías del catálogo, con relación comprobada entre archivo y vehículo. Las nuevas fotos de Marcelo quedan para los espacios de historia y cierre del siguiente bloque o para una ficha cuando su identidad esté confirmada. No se asigna un vehículo desconocido a una ficha diferente.

Se revisaron sintaxis JavaScript, estructura e IDs, delimitadores del CSS, referencias de los cuatro destacados y su orden cronológico. Se verificó la aplicación del patch sobre una copia limpia de B01 y la igualdad de los archivos preparados. No se ejecutaron tests ni se revisó en navegador, por instrucción del usuario.

## Aplicar en PowerShell

Guardar `ARTECH_V3_B02.zip` en Descargas. Desde una terminal distinta de la que mantiene PHP abierto:

```powershell
Expand-Archive "$env:USERPROFILE\Downloads\ARTECH_V3_B02.zip" "$env:USERPROFILE\Downloads" -Force

cd "C:\Users\rgame\OneDrive\Documentos\GitHub\Artech_demo"

git status --short
$artechPatch = "$env:USERPROFILE\Downloads\ARTECH_V3_B02\artech-v3-b02.patch"
git apply --check $artechPatch
if ($LASTEXITCODE -ne 0) { throw "El patch no coincide. Comprueba que B01 esté aplicado. No lo fuerces." }
git apply $artechPatch
if ($LASTEXITCODE -ne 0) { throw "La aplicación falló. Detente antes del commit." }
```

Si ya se aplicó este bloque, no repetir `git apply`. No usar `--reject`, `--3way` ni forzar la aplicación.

## Visualizar

Con PHP abierto, pulsar Ctrl + F5:

- Colección: http://localhost:8000/#p-collection
- Catálogo: http://localhost:8000/#p-collection/catalogue
- Ficha: http://localhost:8000/#p-vehicle/cxj-330

Si PHP está detenido, ejecutar desde la carpeta del repositorio y dejar la terminal abierta:

```powershell
php -S localhost:8000
```

La revisión del usuario puede seguir el recorrido: hero y flechas → cifras al bajar/subir → buscar una pieza → abrir ficha → volver a colección → siguiente vehículo y fotografía del cierre. No se envían solicitudes ni se realizan pagos al recorrer estas pantallas.

## Commit y subida

Después de revisar el bloque en localhost:

```powershell
git add index.html assets/css/v3-block2.css assets/js/v3-collection.js assets/js/editorial.js assets/js/site.js assets/js/v3-shell.js docs/ARTECH_V3_B02.md
git commit -m "feat: refine Artech collection and vehicle discovery"
git push -u origin HEAD
```

## Próximo bloque

V3-B03: progreso de seis oficios del Taller, cierres con fotografía, espacio y fotografías disponibles en la carta, historia y cronología, y pantalla final de booking después de completar los datos.
