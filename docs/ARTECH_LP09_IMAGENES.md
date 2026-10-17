# LP09 · Recuperación de las imágenes anteriores

Sustituye exclusivamente la selección de imágenes de LP08. Las ampliaciones generadas de LP08 fueron rechazadas: deformaron el automóvil y alteraron la composición del restaurante.

## Corrección
- Taller: vuelve exactamente al encuadre de LP06, con el artesano, el detalle de carrocería roja y el faro. No se genera otra carrocería ni se amplía el campo visual.
- Restaurante: vuelve exactamente a la mesa de mármol, plato, cóctel rojo y butaca del encuadre anterior. No se sustituye por una sala nueva.
- Se restauran las tres variantes originales en src y srcset, así como sus dimensiones 16:9.
- Se conservan las decisiones de LP08: sin zoom CSS, fotos a todo el ancho, sombra localizada para el texto, entrada del timón, fundido lateral y footer.
- El HTML ya no solicita ninguna imagen de assets/media/lp08. Los archivos históricos siguen presentes para no borrar trabajo previo.

## Encuadre y límite de proporción
Las imágenes recuperadas son 16:9. A 1920×1080 caben completas a todo el ancho; a 1905×895, una foto completa a todo el ancho mide aproximadamente 1072 px de alto. En ese caso se activa el flujo natural ya implementado en LP08: se recorre la foto con scroll y se utiliza un fundido lateral sobre la imagen en flujo natural. El texto y los botones permanecen disponibles; no se fija la sección ni se oculta su parte inferior. No se recorta, aplasta ni genera entorno para forzar otra proporción. No es posible tener simultáneamente una foto 16:9 completa, a todo el ancho y dentro de una ventana más panorámica sin añadir espacio, recortar o deformar.

Esta entrega es una recuperación de composiciones anteriores, no una reconstrucción fotográfica nueva. Las imágenes siguen siendo ilustrativas. Las variantes de 2560 px de LP06 son reescaladas desde 1672×941, no resolución nativa 4K.

## Verificación
Comprobados: src/srcset, integridad de las seis imágenes restauradas, proporción y altura natural, continuidad del controlador de transición y conservación del hero y comparación exacta del footer frente a LP08. Nueve pruebas de landing aprobadas, incluido el fundido alternativo con las proporciones restauradas.
No se ejecutó revisión visual en navegador ni el instalador en Windows en este entorno. Revisar localmente con Ctrl+F5 antes del commit.
