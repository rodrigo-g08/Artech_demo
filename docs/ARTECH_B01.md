# ARTECH B01 — Base + inicio

Base revisada: `fix/artech-demo`, commit `ae00eeb08c6fa3b2cf663eae77b7daaee7d81c53`.
Entrega: 15 de octubre de 2026. Rama propuesta: `entrega/artech-b01`.

## Qué cambia

- Entrada negra con el logotipo real de ARTECH en la parte superior, la frase «El automóvil como arte. La ingeniería como emoción.» y aparición progresiva desde el desenfoque.
- La línea inferior acompaña la preparación de la foto principal, logo y fuente y la aparición del texto. La entrada se habilita en cuanto termina esta preparación (unos 2,1 segundos con recursos disponibles). Si un recurso falla o tarda demasiado, se permite continuar a los 7 segundos como máximo. Escape permite salir.
- Botón «Iniciar experiencia» rojo, en cápsula, con borde metálico fino y barrido de luz al pasar el cursor o recibir foco.
- Inter variable original entregada por el cliente, alojada localmente. No se descarga de Google Fonts.
- Navegación principal: Colección / El taller / Experiencias y Entradas. Menú adaptable con fotografías nuevas y transición entre rutas.
- Inicio completo con cuatro escenas: Porsche frontal; colección clásica/contemporánea; interior; cierre hacia la visita. Fundidos reversibles vinculados al scroll en escritorio. En pantallas pequeñas o con movimiento reducido, las escenas siguen el flujo normal y permanecen completas.
- Pie de página y botón para volver a ver la entrada.
- Se desconectan los antiguos controladores de inicio `v3-shell.js`, `v3-home.js`, `motion.js` y `v3-block5.js` del HTML. No se borran sus archivos. El inicio ya no solicita los videos anteriores.

## Fotografías y recortes

Los ZIP nuevos contienen 206 JPG únicos. En este bloque se utilizan únicamente estos originales:

| Original | Uso |
| --- | --- |
| A88A0652.jpg | Porsche frontal de portada, recorte rectangular y contorno CSS |
| A88A0638.jpg | Colección clásica |
| A88A0656.jpg | Colección contemporánea |
| A88A0730.jpg | Interior |
| A88A0739.jpg | Detalle de volante y cierre |

Se producen versiones WebP de 960 y 1920 píxeles. Se conservan los píxeles de las fotografías, sin generación ni sustitución de carrocerías. El contorno de portada se recorta visualmente con CSS; no modifica el JPG original. Los 10 archivos de imagen suman aproximadamente 1,7 MB. El manifiesto `assets/data/b01-media.json` conserva originales, huellas SHA-256 y dimensiones.

En los dos lotes recibidos no hay fotografías del Ferrari rojo ni de manos trabajando en el taller equivalentes a los mockups. Para esta portada se utiliza el Porsche negro real. El logo es la pieza gráfica existente de ARTECH.

## Alcance de B01 y siguientes bloques

Esta entrega renueva la entrada, inicio, navegación y pie, preservando las rutas interiores y sus formularios. Las fotografías y composiciones interiores anteriores permanecen pendientes de B02; no se declara terminada la migración fotográfica global. La retirada física de la fotografía anterior se hará cuando se hayan sustituido sus referencias. B03 cubrirá el diseño final de fecha/horario y cierre del flujo. El sistema existente sigue siendo de solicitudes; este bloque no conecta pagos ni confirma reservas.

## Aplicar en Windows

Descarga `ARTECH_B01_Base_Inicio.zip` en Descargas. No extraigas su contenido encima del repositorio: primero se extrae en una carpeta temporal, y el instalador comprueba la base y hace respaldo antes de copiar.

```powershell
$repo = 'C:\Users\rgame\OneDrive\Documentos\GitHub\Artech_demo'
$stage = Join-Path $env:TEMP ('ARTECH_B01_' + [guid]::NewGuid().ToString('N'))
Expand-Archive -LiteralPath "$HOME\Downloads\ARTECH_B01_Base_Inicio.zip" -DestinationPath $stage
& "$stage\Apply-ARTECH-B01.ps1" -Repository $repo
Set-Location $repo
git status --short
git diff --stat
```

El instalador acepta archivos con saltos de línea de Windows, crea la rama `entrega/artech-b01` si hace falta, conserva cambios ajenos y guarda los archivos reemplazados en una carpeta junto al repositorio. Si `index.html`, `core.js` o `site.js` divergen de la base prevista, se detiene antes de copiar. Si la rama de entrega ya existe pero no es la actual, pide cambiarla explícitamente. No hace commit ni push.

Si Windows marca el script descargado como bloqueado, revisa el archivo `Apply-ARTECH-B01.ps1` y usa Propiedades > Desbloquear para ese archivo concreto. Si tu equipo impone una política adicional, conserva el mensaje de error para ajustar la instalación sin cambiar esa política.

## Ver localmente

Desde el repositorio, con Python disponible:

```powershell
py -m http.server 5500
```

Abre `http://localhost:5500/?intro=1`. Si no tienes Python, utiliza **Open with Live Server** en VS Code. Evita abrir `index.html` mediante `file://`: el catálogo existente usa `fetch`.

- `?intro=1` fuerza la entrada para revisarla cada vez.
- Sin ese parámetro, se muestra una vez por pestaña/sesión. El botón del pie «Volver a la entrada» permite repetirla.
- `http://localhost:5500/#p-tickets` debe abrir la visita directamente sin bloquearla con la entrada.

## Revisión visual a cargo del programador

1. Abrir con `?intro=1`: negro, logo, frase, barra y botón. Comprobar que el botón da paso a la portada sin un flash blanco.
2. Bajar y subir en escritorio: las cuatro escenas deben fundirse de forma reversible y acabar en el pie. Los enlaces de capítulos deben saltar a su escena.
3. Revisar 1440 × 900 y 390 × 844; también una ventana baja de 1366 × 768. En móvil se usa scroll normal y el menú circular.
4. Abrir/cerrar el menú, usar Escape y Tab, visitar Colección y Entradas y volver con el logo. Cambiar ES / EN.
5. Activar «reducir movimiento»: no debe haber scroll inmersivo ni barridos obligatorios; todo el contenido sigue accesible.
6. Revisar la pestaña Network y consola: los archivos de B01 deben cargar sin 404; las fotos de B01 provienen exclusivamente de `assets/media/b01/`.

## Verificación realizada

- Sintaxis de JavaScript y tres pruebas existentes de lógica: correctas.
- Prueba DOM con los scripts reales integrados: entrada y desbloqueo, menú y Escape, escenas, rutas interiores y cambio de idioma, correctos.
- Prueba DOM de enlace directo a Entradas, almacenamiento bloqueado, fallo de imagen, movimiento reducido y tamaño móvil: correcta.
- IDs únicos, recursos nuevos existentes y procedencia de fotos del inicio: comprobados.
- Integridad del ZIP y compatibilidad de huellas con saltos de línea LF/CRLF: comprobadas. El instalador PowerShell no se ha ejecutado en Windows en este entorno.
- No se ejecutó una revisión visual real en navegador local en este entorno; las pruebas DOM no validan composición, píxeles, fluidez ni WebGL. La lista anterior es el cierre visual pendiente antes de publicar.

Después de tu revisión:

```powershell
npm test
git add -- index.html assets/css/artech-b01.css assets/js/artech-b01.js assets/fonts/Inter-Variable.ttf assets/fonts/OFL-Inter.txt assets/media/b01 assets/data/b01-media.json docs/ARTECH_B01.md
git commit -m "feat: ARTECH B01 base, entrance and immersive homepage"
git push -u origin entrega/artech-b01
```

Las suites antiguas de escenas/navegador contienen expectativas sobre el inicio V3 anterior; su actualización completa corresponde al cierre de esta migración. `npm test` mantiene las pruebas de lógica del núcleo.

Para volver atrás después del commit, usa `git revert` sobre ese commit. Antes del commit, la carpeta de respaldo creada por el instalador conserva los archivos sustituidos; no utilices `git reset --hard` ni borres el repositorio.
