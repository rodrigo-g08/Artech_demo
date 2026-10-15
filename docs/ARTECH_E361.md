# ARTECH E361 — Escenario y entrada al habitáculo

Actualización sobre el entregable **F02 + E360**. Proyecto estático HTML/CSS/JavaScript; sigue funcionando con `py -m http.server 5500` y con la misma configuración de Cloudflare Pages.

## Tarea 1 — Escenario compartido

- Inicio y E360 utilizan el mismo suelo de estudio, con textura y brillo moderados.
- Los nueve exteriores de los tres vehículos tienen transparencia real. Las sombras de contacto y los reflejos discretos se componen sobre el suelo, sin un rectángulo fotográfico detrás de cada automóvil.
- Iluminación fija y suave bajo el header. Se retiran los conos móviles y el barrido permanente de luz sobre los autos del inicio.
- Controles laterales de 18–26 px en escritorio y 15–16 px en móvil. Los tres accesos del inicio tienen un área de interacción de 58–62 px.
- Se conserva el header, la navegación y el footer compartidos.

## Tarea 2 — Entrar y regresar en los tres vehículos

Recorrido: **exterior → puerta abierta → acceso al habitáculo → asiento del conductor**.

- Disponible para GT3 rojo (2010), Turbo blanco (1986) y Chrysler Roadster. El año del clásico sigue por confirmar.
- Selecciona **Habitáculo** en el menú lateral o el punto **Entrar al habitáculo** sobre el exterior.
- El movimiento combina perspectivas intermedias, avance hacia la puerta y cambio de posición de cámara. Dura aproximadamente tres segundos desde el exterior frontal, una vez cargadas las imágenes.
- **Volver al exterior** recorre las mismas vistas en sentido inverso y recupera el exterior, lateral o trasera que se estaba viendo.
- Dentro del recorrido, `Esc` vuelve al exterior; desde el exterior, `Esc` vuelve al inicio. Se mantienen las flechas, el gesto horizontal y **Ver más** hacia la ficha.
- Cambiar de zona o salir durante la transición cancela el recorrido anterior y continúa desde el último encuadre completado.
- Las vistas necesarias se cargan antes de empezar a mover la cámara. La preferencia de movimiento reducido muestra directamente el destino.

Se incluyen 19 recursos nuevos: 9 exteriores con alfa, 3 puertas abiertas con alfa, 3 accesos al habitáculo, 3 vistas del conductor y 1 suelo. Son recreaciones visuales basadas en las referencias de ARTECH, entregadas como WebP; los recortes conservan transparencia. La experiencia es un recorrido por vistas prerenderizadas, no un modelo 3D de giro libre.

Las fotografías y la presentación de colección quedan fuera de este bloque.

## Aplicar en Windows

Descarga `ARTECH_E361.zip` en Descargas. Abre PowerShell y ejecuta:

```powershell
$repo = 'C:\Users\rgame\OneDrive\Documentos\GitHub\Artech_demo'
$stage = Join-Path $env:TEMP ('ARTECH_E361_' + [guid]::NewGuid().ToString('N'))
Expand-Archive -LiteralPath "$env:USERPROFILE\Downloads\ARTECH_E361.zip" -DestinationPath $stage
& "$stage\Apply-ARTECH-E361.ps1" -Repository $repo
if (-not $?) { throw 'No se aplicó E361; revisa el mensaje del instalador.' }
Set-Location $repo
py -m http.server 5500
```

Si el servidor ya está abierto en otra consola, conserva ese servidor y omite la última línea. Recarga con **Ctrl + F5**.

El instalador valida todos los archivos antes de copiar, acepta finales de línea LF/CRLF y crea un respaldo al lado del repositorio. Conserva la rama actual; no ejecuta commits, pushes ni despliegues. Si detecta una base distinta o cambios locales en un archivo que debe actualizar, se detiene antes de copiar. No lo fuerces: conserva el mensaje y el archivo afectado para adaptar el cambio. Si falla una copia, restaura automáticamente lo que alcanzó a modificar.

## Comprobación local acordada

La comprobación visual en navegador la hará el usuario. En esta entrega se verificaron sintaxis JavaScript, los cuatro controles de datos y recursos existentes de F02/E360, transparencia de los recortes y la integridad del ZIP. No se ha validado visualmente el recorrido en navegador ni ejecutado el instalador en Windows.

Abre `http://localhost:5500/#top` y entra por cada uno de los tres accesos. Para ir directamente:

- `http://localhost:5500/#exp3d/red`
- `http://localhost:5500/#exp3d/white`
- `http://localhost:5500/#exp3d/classic`

Selecciona **Habitáculo**, usa **Volver al exterior** y comprueba también los controles en un ancho móvil. Si tu sistema tiene activado reducir movimiento, las vistas cambiarán sin el desplazamiento de cámara.

## Archivos principales

- `assets/css/artech-e361.css`: suelo, iluminación fija, controles y composición adaptable.
- `assets/js/artech-e360.js`: recorrido reversible, carga, cancelación y acceso a las vistas.
- `assets/data/e360-views.json`: vistas y pasos intermedios de cada automóvil.
- `assets/data/e361-media.json`: referencias y procedencia de los recursos nuevos.
- `index.html`: escenario y controles, con versiones de caché E361.

Para un commit después de tu comprobación:

```powershell
git add index.html assets/css/artech-e361.css assets/js/artech-e360.js assets/data/e360-views.json assets/data/e361-media.json assets/media/e361 tests/f02-e360.test.cjs docs/ARTECH_E361.md
git commit -m "feat(web): ground E360 scenes and add reversible cabin journeys"
```

Si tu rama está conectada a producción, un `git push` puede activar el despliegue de Cloudflare Pages. El paquete no ejecuta ese paso.
