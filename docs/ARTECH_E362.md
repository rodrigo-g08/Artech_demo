# ARTECH E362 · Workshop + inicio

Aplicar sobre **E361** en tu rama de trabajo actual. Este paquete contiene los dos ajustes aprobados, divididos por tarea.

## Tarea 1 · Workshop completo

- Cinco escenas: clásico burdeos, carrocería con GT3 rojo, mecánica, interiores y cierre.
- Tratamiento de estudio negro para las dos fotografías exteriores, sin marcos de tarjeta.
- Toda la información de cada etapa está en la página; no hay pop-ups.
- En escritorio, un único escenario se mantiene bajo el header. Las escenas cambian con la posición real del scroll mediante fade in/fade out.
- El paso de mecánica a interiores utiliza un iris circular de borde limpio. Al subir, el iris se cierra.
- El platinado queda recortado **dentro de las letras**. Cada título recupera el blanco al terminar; el recorrido se invierte al volver a subir.
- “Ahora, míralo desde dentro” y su botón están **arriba a la izquierda**.
- El último interior desemboca naturalmente en el mismo footer compartido.

En pantallas de menos de 900 px de ancho, menos de 680 px de alto, con movimiento reducido o cuando el texto no cabe, las escenas pasan a scroll normal. La información sigue completa y accesible. Las fotografías exteriores se ajustan proporcionalmente para que se vea el vehículo entero; no tienen zoom animado.

## Tarea 2 · Inicio

- Composición dedicada a la portada, derivada de la referencia aprobada.
- GT3 central más frontal; Porsche blanco orientado a la derecha; clásico con mayor tamaño a la izquierda.
- Un único suelo de estudio, sombras de contacto y reflejos coherentes.
- Iluminación fija integrada en la imagen.
- Título y espacios ajustados. Tres accesos alineados bajo los vehículos.
- Los accesos siguen abriendo los recorridos E360 de cada automóvil.

La portada utiliza una composición panorámica independiente. Los modelos, las vistas, la navegación y la entrada al habitáculo de E361 no se sustituyen por esta imagen.

## Fotografías y procedencia

- Portada: edición de la composición aprobada `image(20261015-175446).png`.
- Clásico del taller: edición de entorno e iluminación a partir de tu fotografía `image(20261015-181802).png`.
- Carrocería: edición a partir de `A88A0683.jpg`, del ZIP.
- Interiores: fotografías originales `A88A0804.jpg` y `A88A0800.jpg`, sin modificar sus archivos.
- Mecánica: se conserva una sola aparición de la escena ilustrativa de manos ya aprobada. No se presenta como fotografía documental.
- Las ediciones de estudio incluyen reconstrucción del entorno asistida por IA. Las fotografías originales de colección permanecen intactas.

El detalle de archivos, dimensiones y procedencia está en `assets/data/e362-media.json`. Se conserva Inter, la tipografía que entregaste.

## Instalación en PowerShell

Descarga `ARTECH_E362_Workshop_Inicio.zip` en Downloads y ejecuta:

```powershell
$repo = 'C:\Users\rgame\OneDrive\Documentos\GitHub\Artech_demo'
$stage = Join-Path $env:TEMP ('ARTECH_E362_' + [guid]::NewGuid().ToString('N'))

Expand-Archive -LiteralPath "$env:USERPROFILE\Downloads\ARTECH_E362_Workshop_Inicio.zip" -DestinationPath $stage
& "$stage\Apply-ARTECH-E362.ps1" -Repository $repo
```

El instalador comprueba todos los archivos antes de copiar. Acepta finales de línea LF o CRLF, conserva la rama activa y crea un respaldo junto al repositorio. Si un archivo difiere de E361, se detiene sin reemplazarlo. Comparte el error para adaptar el cambio; no hace falta eliminar la rama.

No realiza commit, push ni despliegue.

Si tu servidor ya está abierto, basta recargar con **Ctrl+F5**. Si no:

```powershell
Set-Location $repo
py -m http.server 5500
```

- Inicio: `http://localhost:5500/#top`
- Taller: `http://localhost:5500/#p-workshops`
- Acceso directo a carrocería: `http://localhost:5500/#p-workshops/bodywork`

Python únicamente sirve los archivos estáticos para la revisión local. Se conserva la estructura HTML/CSS/JS y la configuración existente de Cloudflare Pages.

## Archivos del ajuste

- `index.html`: composición de inicio, estructura del taller y referencias a los nuevos recursos.
- `assets/css/artech-e362.css`: estilos de los dos ajustes, aislados del resto de páginas.
- `assets/js/artech-e362.js`: recorrido del taller, animación reversible, navegación por etapas y adaptación a pantallas pequeñas.
- `assets/media/e362/`: seis WebP en dos tamaños.
- `assets/data/e362-media.json`: procedencia de medios.
- `tests/e362-workshop.test.cjs`: comprobaciones del recorrido.
- `docs/ARTECH_E362.md`: estas instrucciones.

El footer compartido se conserva exactamente. Los archivos de E360 y los datos del catálogo no cambian.

## Verificación

Comprobado:
- Sintaxis de JavaScript y estructura del HTML/CSS.
- Cuatro pruebas del recorrido: reversibilidad, continuidad de las escenas, iris y retorno de los títulos a blanco.
- Cuatro pruebas existentes de E360/catálogo.
- Integración del controlador con geometría simulada: navegación, subida/bajada, idioma, movimiento reducido, adaptación cuando el texto no cabe y limpieza al salir de la ruta.
- Enlaces a archivos locales, decodificación de los seis WebP, identificadores únicos y conservación del footer.
- Integridad y contenido del ZIP; simulación de aplicación y reaplicación sobre E361.

**La revisión visual en tu navegador queda de tu lado, como acordamos.** No se ha ejecutado el instalador en Windows ni se ha desplegado este paquete. Para revisar: baja y vuelve a subir por el taller, observa el cierre arriba a la izquierda y abre los tres accesos de la portada.
