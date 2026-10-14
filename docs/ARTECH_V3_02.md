# ARTECH · V3-02 · Portada completa

14 de octubre de 2026 · America/Lima. Aplicar después de V3-01.

## El recorrido

La portada está construida como nueve escenas y el pie de página compartido. Las fotografías conservan su composición, sin filtros, viñetas, desenfoque o máscaras. El texto queda fuera de las imágenes.

| Escena | Contenido |
| --- | --- |
| 01 | Presentación y Ferrari Testarossa. Video con reproducción manual e iconos. |
| 02 | El recorrido comienza en 1903. Edad calculada con el año actual. |
| 03 | Primera pieza de la colección. |
| 04 | Cronología de seis vehículos: 1903, 1936, 1956, 1970, 1988 y 2018. |
| 05 | «Lo que ves en la sala es parte de la historia». |
| 06 | «La historia también se reconstruye». Presentación de los oficios del taller. |
| 07 | Experiencias sobre fondo claro: Colección, Colección + taller y Artech en privado. |
| 08 | «Haz espacio para descubrir». Acceso a la solicitud de visita. |
| 09 | Vista previa del taller y avance al siguiente capítulo. |
| Cierre | Pie de página, accesible mediante «Información del museo». |

Se retiraron de la portada los bloques anteriores de marcas, pilares y cierre sobre fotografía, así como el aviso de newsletter no disponible. Las otras páginas mantienen su contenido para los hitos siguientes.

## Movimiento y navegación

- Cada escena se apaga a negro antes de revelar la siguiente. El proceso se invierte al subir.
- La escena de épocas tiene más tiempo de lectura. Al bajar, los autos avanzan cronológicamente; al subir, retroceden. Los botones de año permiten elegir una pieza directamente, también con teclado.
- «Descubrir esta pieza» abre la ficha correcta. Atrás devuelve al visitante al punto del recorrido desde el que abrió la ficha. El logo del header lleva al inicio.
- La transición a fondo claro pasa por el mismo negro. La luz del titular sobre blanco se desplaza con el scroll aunque la escena esté fija.
- Cada experiencia abre la reserva con Colección, VIP o Privada ya seleccionada.
- En el cierre, los últimos 500 píxeles de avance llenan el indicador. El cambio automático al taller requiere un gesto real de scroll; cargar la página o restaurar una posición no inicia una navegación accidental. Subir hace retroceder el avance.
- El enlace «Entrar al taller» permite entrar directamente. «Información del museo» permite acceder al pie de página sin activar el cambio de capítulo.
- Con movimiento reducido o una pantalla demasiado baja, se usa un recorrido normal y no se activa el cambio automático de capítulo.

## Datos y medios

La cronología llega a 2018 porque es el último año de las fichas disponibles. No se añadió un vehículo de 2020 sin su registro. La pieza de 1903 sigue sin marca identificada, por lo que se presenta como primera pieza de la colección.

Los precios S/80, S/120 y S/450, las duraciones y el mínimo de la visita privada se conservaron de la base existente. Artech debe confirmar su vigencia e inclusiones antes de la publicación definitiva. La web sigue preparando solicitudes sujetas a confirmación.

Las imágenes del taller son detalles de autos terminados, no fotografías del proceso de restauración. Se sustituirán por el material real de Marcelo cuando esté disponible.

## Aplicar y visualizar

```powershell
Expand-Archive "$env:USERPROFILE\Downloads\ARTECH_V3_02.zip" "$env:USERPROFILE\Downloads" -Force

cd "C:\Users\rgame\OneDrive\Documentos\GitHub\Artech_demo"

$artechPatch = "$env:USERPROFILE\Downloads\ARTECH_V3_02\artech-v3-02.patch"
git apply --check $artechPatch
if ($LASTEXITCODE -eq 0) { git apply $artechPatch }
```

Si el check falla, conservar el estado actual y revisar que V3-01 esté aplicado. No forzar el patch.

Si el servidor ya funciona, abrir http://localhost:8000/ y pulsar Ctrl + F5. Si está detenido:

```powershell
php -S localhost:8000
```

## Qué validar

1. Bajar por toda la portada y volver a subir: ritmo, negro completo y tiempo para leer.
2. En la cronología, elegir 1988 y 2018; abrir una ficha y volver con Atrás.
3. Elegir Colección + taller: comprobar que VIP queda seleccionada en la reserva.
4. En el cierre, subir antes de completar el círculo; después continuar bajando y entrar al taller.
5. Probar «Información del museo»: debe permitir leer el pie de página sin cambiar automáticamente de sección.
6. Revisar en celular: fotos completas, controles alcanzables y ausencia de desplazamiento horizontal.

## Verificación

- Tres pruebas existentes de lógica aprobadas.
- Diecisiete escenarios existentes de navegador aprobados.
- Doce escenarios del sistema V3 aprobados: los ocho anteriores más cronología y retorno, selección de experiencias y letras en movimiento, avance reversible al taller y revisión de todas las escenas en ambos idiomas.
- Revisión visual con Archivo e Inter en 1440×900, 1280×720, 390×844 y 320×844.
- Referencias de imágenes y IDs comprobados; JavaScript sin errores de sintaxis.
- Patch aplicado en una copia limpia de V3-01 y archivos comparados byte a byte con el código preparado.

Las pruebas no envían consultas reales ni realizan pagos. El taller y las páginas siguientes se desarrollan en V3-03 en adelante.

Commit sugerido:

```text
feat: complete Artech V3 homepage journey and chapter navigation
```
