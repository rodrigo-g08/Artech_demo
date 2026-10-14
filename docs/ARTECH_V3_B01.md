# ARTECH · V3-B01 · Intro, film, header y botones

14 de octubre de 2026 · America/Lima. Aplicar después de V3-02.

Base verificada: rama `fix/artech-demo` del fork `rodrigo-g08/Artech_demo`, commit `6789042`. El patch conserva las nueve escenas, el menú con fotografía, el catálogo y los formularios.

## Cambios

- Vuelve el carrito renderizado de `assets/preloader.mp4`. El archivo original dura 3,4 segundos: se reproduce en bucle durante 15 segundos visibles, con el logo arriba. «Omitir intro» y Escape permiten entrar inmediatamente. La nueva intro se muestra una vez por pestaña; abrir una ventana de incógnito permite repetirla. Si se abre una ficha o una reserva mediante enlace directo, se omite la intro.
- El video de portada se inicia automáticamente y sin sonido al terminar u omitir la intro. Si el navegador bloquea la reproducción, el botón play permite iniciarla. Una pausa manual se conserva al salir y volver.
- En pantallas con el motor de escenas activo, el video comienza ocupando el viewport, detrás del header. Al bajar, se reduce hacia la derecha y aparece el texto a la izquierda; al subir vuelve a ocupar la pantalla. La primera escena tiene más recorrido para apreciar ese movimiento antes del fundido a negro.
- En móvil alto el video se reduce hacia la parte superior y aparece el texto debajo. Con movimiento reducido o una pantalla baja se conserva el recorrido normal y los controles manuales.
- La portada se pausa al abrir el menú, entrar a otra página o esconder la pestaña. Las rutas de catálogo y las solicitudes mantienen sus controladores originales.
- El header es fijo y negro. En escritorio amplio muestra enlaces a Colección, El Taller, Experiencias, Restaurante e Historia, además de reserva, idioma y el menú de tres rayas. En pantallas pequeñas se mantiene el logo, idioma y menú; la reserva está dentro del menú.
- Se retiran los contadores 01/09 de las escenas. Los números de las etapas del Taller y los años del catálogo permanecen.
- Botones de acción con esquinas suavizadas de 8 px y relleno orgánico de rojo oscuro al pasar el cursor o enfocar con teclado. No se cambian sus enlaces ni acciones.

## Audio

`assets/hero.mp4` no tiene pista de audio: por eso no se muestra un interruptor que no produciría ningún sonido. El control está preparado para un video con audio. Si se reemplaza este archivo por uno con sonido, cambiar `data-has-audio="false"` a `data-has-audio="true"` en `heroVid`. La reproducción inicial permanece silenciada; cada visitante activa el audio voluntariamente.

El video de intro sí contiene una pista, pero se mantiene silenciado.

## Aplicar en PowerShell

Guardar `ARTECH_V3_B01.zip` en Descargas. Ejecutar en una terminal distinta de la que mantiene PHP abierto:

```powershell
Expand-Archive "$env:USERPROFILE\Downloads\ARTECH_V3_B01.zip" "$env:USERPROFILE\Downloads" -Force

cd "C:\Users\rgame\OneDrive\Documentos\GitHub\Artech_demo"

git status --short
$artechPatch = "$env:USERPROFILE\Downloads\ARTECH_V3_B01\artech-v3-b01.patch"
git apply --check $artechPatch
if ($LASTEXITCODE -ne 0) { throw "El patch no coincide con la base. No lo fuerces." }
git apply $artechPatch
if ($LASTEXITCODE -ne 0) { throw "La aplicación falló. Detente antes del commit." }
```

Si V3-02 aún no está aplicado, aplicarlo primero. No usar `--reject`, `--3way` ni forzar un patch que no coincide. Si ya se aplicó este bloque, no repetir `git apply`.

## Visualizar

Con PHP ya abierto: http://localhost:8000/ y Ctrl + F5. Abrir una ventana de incógnito para ver la intro de nuevo.

Si el servidor no está abierto, desde la carpeta del repositorio:

```powershell
php -S localhost:8000
```

Dejar esa terminal abierta. La revisión del comportamiento en navegador la realiza el usuario, según su instrucción; no se ejecutó la suite de tests ni se hizo revisión visual de esta implementación.

Comprobaciones de preparación: revisión del código, sintaxis JavaScript, estructura HTML y CSS del bloque, referencias locales, diferencias sin errores de whitespace y aplicación del patch sobre una copia limpia de la base.

## Commit y subida

Después de revisar el bloque en localhost:

```powershell
git add index.html assets/css/v3-block1.css assets/js/v3-shell.js assets/js/motion.js assets/js/site.js docs/ARTECH_V3_B01.md
git commit -m "feat: restore Artech intro and add fullscreen autoplay film"
git push -u origin HEAD
```

## Siguientes bloques

| Bloque | Alcance |
| --- | --- |
| V3-B02 | Colección a pantalla completa, flechas laterales, destacados en orden, contadores, grilla de cuatro columnas y fichas con brillo platinado y cierre fotográfico. |
| V3-B03 | Progreso de oficios del Taller, cierres con fotos, carta con espacio y cambio de foto, historia/cronología y pantalla final de booking. |
| V3-B04 | Integración de los bloques, revisión del usuario en móvil, correcciones y publicación. |

Las fotos de Marcelo se integrarán al bloque correspondiente después de vincularlas con los vehículos correctos. Este bloque usa los videos y fotografías que ya están en el repositorio; no añade medios pesados ni dependencias nuevas.
