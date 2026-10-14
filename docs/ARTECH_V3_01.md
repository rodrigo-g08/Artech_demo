# ARTECH · V3-01 · Entrada, movimiento y menú

Entrega: 14 de octubre de 2026. Se aplica después de V3-00 y los dos paquetes adicionales anteriores.

## Lo que verás ahora

- Intro del logo sobre negro: aparece, permanece unos instantes, desaparece a negro y revela la portada. Aproximadamente 3,6 segundos en total. Se puede omitir y no se repite en la misma pestaña. V3 usa su propia marca de sesión para que puedas ver la nueva intro aunque ya hayas visto la anterior.
- Tres escenas iniciales: Ferrari y presentación → «El recorrido comienza en 1903» → primera pieza de la colección.
- Al bajar y al subir, cada escena desaparece por completo antes de revelar la siguiente. No hay barras, círculos gigantes, desenfoque, sobreexposición o barridos.
- Menú negro de pantalla completa en escritorio y móvil. La imagen cambia al pasar el cursor o enfocar un enlace. Escape cierra el menú y devuelve el foco al botón.
- Cambio de página pasando por negro, también al entrar a la reserva sobre fondo claro.
- Reflejo discreto en los titulares sobre fondos claros. La base de las letras permanece oscura y legible.
- Video detenido al entrar. El icono de play lo inicia; durante la reproducción, el mismo botón muestra el icono de pausa. No hay controles de texto «Pausar video», «Pausar marcas» ni «Video sin audio» en la portada.
- Marcas estáticas. El video se pausa al abandonar su escena, al abrir otra página o al ocultar la pestaña.

**Alcance:** el nuevo sistema está conectado a las tres escenas iniciales y a la navegación. Las demás composiciones de la portada se completan en V3-02; Taller, Colección y páginas editoriales siguen sus hitos. El JSON de V3-00 mantiene el recorrido completo preparado.

## Aplicación en PowerShell

Descarga `ARTECH_V3_01.zip`. Extrae el paquete y aplica el patch:

```powershell
Expand-Archive "$env:USERPROFILE\Downloads\ARTECH_V3_01.zip" "$env:USERPROFILE\Downloads" -Force

cd "C:\Users\rgame\OneDrive\Documentos\GitHub\Artech_demo"

git status --short
git apply --check "$env:USERPROFILE\Downloads\ARTECH_V3_01\artech-v3-01.patch"
git apply "$env:USERPROFILE\Downloads\ARTECH_V3_01\artech-v3-01.patch"
```

Ejecuta `git apply` sólo si `--check` termina sin errores. Si da error, conserva el estado actual y revisa si V3-00 y los dos paquetes anteriores están presentes. No fuerces la aplicación.

## Visualizar

Si el servidor ya está funcionando, abre http://localhost:8000/ y pulsa Ctrl + F5. Si no está funcionando:

```powershell
php -S localhost:8000
```

Deja esa terminal abierta. Para volver a ver la intro, abre una ventana de incógnito y entra al inicio. Los enlaces directos a fichas o reserva omiten la intro.

## Lo que tienes que validar

1. **Entrada:** el logo aparece y se apaga con un ritmo agradable. «Omitir intro» funciona.
2. **Fundidos:** baja lentamente entre las tres escenas y luego sube. Debe aparecer un momento de negro completo, sin que dos escenas se mezclen. La foto queda intacta.
3. **Video:** antes de tocar play debe verse la fotografía. Play inicia el video; el icono de pausa lo detiene. No aparece el antiguo texto de control.
4. **Menú:** abre el botón de tres líneas. En escritorio, pasa por Colección, Taller e Historia y comprueba el cambio de foto. En celular, toca los enlaces; verifica que el menú se cierre al navegar.
5. **Reserva:** pulsa «Reserva tu turno». Debe pasar por negro y revelar la página clara. Prueba también Atrás del navegador.
6. **Celular:** comprueba texto, foto y botones sin desplazamiento horizontal. En orientación horizontal o con movimiento reducido, el contenido usa un recorrido normal para que nada quede recortado.

Si los fundidos no se activan, revisa la preferencia «Reducir movimiento» del sistema. Esa alternativa es intencional y mantiene todas las escenas disponibles.

## Comprobaciones

- Tres pruebas de lógica existentes aprobadas.
- Diecisiete escenarios de navegador existentes aprobados (el runner incluye además la prueba agrupadora).
- Ocho escenarios V3: fundido reversible, negro/papel y preferencia en vivo, menú y foco, reproducción manual, móvil, recuperación al volver al inicio, navegación/Atrás y final automático de la nueva intro.
- Revisión visual con Archivo e Inter en 1440×900, 390×844 y 320×844; sin desbordamiento ni errores de JavaScript observados.
- IDs únicos y archivos locales referenciados existentes.
- Sintaxis de JavaScript y aplicación del patch comprobadas.

Las pruebas de navegación usan destinos interceptados y no envían consultas reales. La reserva continúa como solicitud sujeta a confirmación; este patch no añade pagos o cupos reales.

## Continuidad técnica

El motor usa una escena negra con posición sticky y progreso de scroll nativo. No depende de GSAP o de una descarga externa para funcionar. El contrato para los siguientes hitos es:

```html
<section data-scene-deck class="v3-deck">
  <div class="v3-stage">
    <section class="v3-scene">...</section>
    <section class="v3-scene v3-scene--paper">...</section>
  </div>
</section>
```

Los enlaces y botones reales se conservan. Con movimiento reducido, pantallas bajas o una escena demasiado alta, se mantiene un flujo normal legible. `ArtechMotion.refresh()` actualiza el motor al cambiar ruta o idioma. No quedan wrappers de pin de la versión anterior.

Commit sugerido:

```text
feat: add Artech V3 logo intro, reversible scenes and fullscreen menu
```
