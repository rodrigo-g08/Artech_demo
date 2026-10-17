# LP10 · Continuidad del recorrido

Corrección sobre LP09, según las cuatro capturas de referencia del 16 de octubre. Esta ficha sustituye la alternativa de movimiento por secciones documentada en LP09.

## Cambios concretos

1. El timón aparece desde abajo mientras los autos siguen visibles. El fondo negro gana opacidad después, para que se perciba la superposición. Se mantienen escala proporcional y encuadre del archivo; no hay zoom animado.
2. Colección y taller comparten un escenario fijo. La máscara de opacidad horizontal de la colección revela progresivamente el taller que ya está debajo.
3. Taller y restaurante también comparten ese escenario. La máscara lateral releva una imagen con la otra en toda la altura visible; no existe una unión horizontal entre dos fotografías apiladas durante esta transición.
4. Si una fotografía completa a todo el ancho supera la altura de la ventana, su exceso añade distancia al scroll dentro de la misma secuencia. Esa distancia recorre la fotografía verticalmente a escala constante. El borde inferior se alcanza antes del siguiente fundido.
5. Las imágenes y su selección src/srcset son exactamente las de LP09. Restaurante, taller, hero, textos, botones y footer conservan sus archivos y contenido.
6. La estructura de la secuencia se reserva antes de terminar de decodificar las imágenes. La finalización de carga no cambia el largo de la página. Los accesos a capítulos durante esa preparación se atienden al terminar.

## Comportamiento

- Ventana de las capturas: 1897×898, fotografía 16:9 a 1897 px de ancho = 1067.0625 px de alto. Se incorporan 169.0625 px de recorrido vertical para taller y otros tantos para restaurante. La secuencia permanece superpuesta.
- No se encoge la fotografía para hacerla caber ni se la estira. En ventanas más panorámicas, se ve su contenido completo durante el recorrido, no simultáneamente.
- Las pausas de lectura y el fundido lateral conservan su duración. El desplazamiento adicional ocurre mientras la escena y su texto están plenamente visibles.
- Los saltos por enlace y Tab/Shift+Tab usan las posiciones recalculadas. Las escenas inactivas quedan fuera del foco.
- En móvil, con movimiento reducido, texto demasiado grande o fallo de carga, se mantiene el contenido en flujo natural.
- El motor usa scroll nativo y requestAnimationFrame, sin nuevas dependencias ni escucha que bloquee la rueda.

## Archivos de implementación respecto a LP09

- assets/js/artech-lp03-lp06.js: tiempos según dimensiones, recorrido completo de fuentes altas, preparación estable y navegación.
- assets/css/artech-lp03-lp06.css: fotografías dentro del mismo escenario, posiciones verticales y retirada de la alternativa de fotos apiladas con animaciones separadas.
- index.html: versión de caché LP10 y comentario identificador; contenido e imágenes sin cambios.
- tests/lp06-landing.test.cjs: geometría y continuidad.
- tests/lp10-motion-dom.test.cjs: montaje del controlador con dimensiones de las capturas, carga, enlaces, teclado y alternativas accesibles.

## Validación

Pruebas de lógica geométrica y controlador DOM simulado; no son pruebas de renderizado del navegador. Se comprueban además los archivos de imagen contra LP09, los src/srcset, los recursos locales, IDs y el footer.

No se realizó revisión visual en navegador ni ejecución del instalador en Windows en este entorno. La validación visual local sigue pendiente antes del commit y publicación.

## Revisión local

1. Recarga con Ctrl+F5 y entra a la landing. Mantén movimiento normal del sistema para revisar la secuencia.
2. Desliza lentamente desde los autos: el borde superior del timón debe entrar mientras aún se ven los vehículos.
3. Continúa: la colección debe desaparecer lateralmente y el taller ocupar ese mismo espacio.
4. Recorre el taller hasta su borde inferior. El restaurante debe entrar mediante el mismo fundido, sin corte horizontal entre fotos.
5. Recorre el restaurante: deben poder apreciarse plato, mesa y cóctel del archivo aprobado.
6. Vuelve hacia arriba, cambia ES/EN y prueba Tab/Shift+Tab y los enlaces de colección, taller, restaurante y entradas.
7. Si necesitas identificar el paquete desde la consola: window.ArtechLandingMotion.version debe devolver LP10. En escritorio con movimiento normal, document.getElementById('b01Home').classList.contains('lp-cinematic') debe ser true, incluso cuando la foto es más alta que la ventana.
