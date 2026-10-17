# LP08 · Encuadre completo y fundido lateral

Corrección sobre LP07 basada en las tres capturas del 16-10-2026 y el boceto vertical aprobado. Esta ficha sustituye las decisiones de escala/transición de LP07.

## Cambios

- Timón: se muestra el archivo completo, con su proporción 3:2, sin desplazarlo fuera del borde izquierdo, sin escala animada, sin giro y sin máscara inferior. Su ancho se calcula con la altura disponible bajo el header. Se conserva la entrada vertical desde abajo.
- Autos: mantienen el ancho de la pantalla y la iluminación por hover/foco. Se elimina también el pequeño zoom de salida del hero.
- Colección → taller: fundido horizontal amplio. Las fotografías no se desplazan lateralmente ni aumentan; la salida de colección revela el taller de derecha a izquierda. El texto tiene un desplazamiento máximo de 18 px.
- Taller → restaurante: el mismo principio de fundido lateral, sin acercamiento al guardabarros ni recorte vertical.
- Restaurante: pausa completa de lectura antes del cierre, con fotografía, título, descripción y CTA visibles.
- Las fotografías de taller y restaurante se ampliaron con image_gen para mostrar más entorno. No se amplía el sujeto con CSS.
- Fotografías editoriales a 100% de ancho y altura proporcional. Eliminado object-fit:cover. No se estiran ni se corta su parte inferior.
- La sombra adicional se aplica detrás del bloque de texto superior izquierdo, no sobre toda la mitad izquierda ni sobre toda la parte baja.
- Se conservan footer, botones, enlaces E360 y flujo de consulta de mesa.

## Imágenes incluidas

Ediciones generadas con la herramienta integrada image_gen, a partir de las imágenes ilustrativas aprobadas de LP06. No son fotografías verificadas del local real.

- assets/media/lp08/atelier-1843.webp: maestro nativo optimizado, 1843×853.
- assets/media/lp08/dining-1837.webp: maestro nativo optimizado, 1837×856.
- Derivados de 1280 y 768 px para cada una, reducidos sin recortar ni alterar proporción.

Se conserva el maestro de cada composición en el repositorio como WebP. No se generan variantes de mayor tamaño que el archivo nativo. El juego exacto de prompts está en ARTECH_LP08_PROMPTS.json. Dimensiones e integridad: assets/data/lp08-media.json.

## Adaptación y accesibilidad

En las capturas de 1897×897 / 1886×886, las nuevas fotos tienen una proporción que permite verlas completas a todo el ancho dentro del viewport.

Cuando una ventana es demasiado ancha y baja para contener la foto completa a todo el ancho, la sección adopta la altura natural de la imagen y se utiliza scroll normal. No se usa zoom ni recorte para forzar el encuadre. En móvil y con movimiento reducido se mantienen fotografías completas y texto legible en flujo natural.

La secuencia sigue usando scroll nativo reversible. Conserva los saltos a capítulos, el control por teclado, la preparación de imágenes antes de animar y la alternativa estática si una imagen falla.

## Validación

24 pruebas Node aprobadas: encuadre del hero, límites completos del timón, proporciones y altura de las fotos, fundidos continuos, reversibilidad, pausas de lectura, iluminación y regresiones del sitio.

También se comprobó estructura HTML, IDs, rutas de recursos, hashes, ausencia de scale/cover en el código de landing y comparación exacta del footer/contenido interior con LP07.

No se ejecutó una revisión visual en navegador ni el instalador en Windows en este entorno. Antes de publicar, revisar el inicio local con recarga completa, desplazamiento lento y rápido en ambos sentidos, cambio ES/EN, E360, Tab/Shift+Tab y móvil.
