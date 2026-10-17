# ARTECH · LP03–LP06 + corrección del hero

Rama: `entrega/artech-b01`. Base remota consultada: `f44815eda04b2c0433557fa11c37ab502a659aed`.
El paquete es acumulativo: admite la base original o la entrega LP01–LP02, incluso si esta última aún no se ha confirmado con commit.

## Correcciones solicitadas

- El escenario ya no toma su tamaño únicamente del ancho. Se ajusta al alto disponible y al tamaño real del título y controles. La imagen conserva proporción completa; las cruces y el indicador de scroll quedan dentro del encuadre.
- Se elimina el margen superior que podía colapsar con el contenedor. El título comienza 18 px después del header (10 px en ventanas muy bajas).
- El header del inicio tiene fondo oscuro más sólido, línea inferior blanca tenue y sombra discreta. Su contenido no cambia; las páginas interiores conservan su header anterior.
- Tres imágenes de iluminación regeneradas con mayor definición y exportación de alta calidad, en variantes 768, 1280 y 2560 px. Se conservan los tres autos sobre el mismo escenario.

## Hitos implementados

| Hito | Comportamiento |
| --- | --- |
| LP03 | La cabina avanza, gira ligeramente y se retira hacia la izquierda al seguir bajando. El texto avanza a otra velocidad. La escena se mantiene durante la lectura y libera el scroll hacia el taller. Todo es reversible al subir. El enlace «Del detalle al oficio» permite saltar al taller. |
| LP04 | Taller con trabajo manual sobre carrocería roja y restaurante con gastronomía/coctelería. Fondo negro común, fotografías integradas y pausa antes del taller. Cada sección comunica algo distinto. |
| LP05 | «Vívelo en Artech.» a la izquierda; «Comprar entradas» y «Reservar una mesa» a la derecha. Se conserva exactamente el HTML y las hojas de estilo anteriores del footer. |
| LP06 | Medición responsive del hero, soporte táctil y teclado, ES/EN, movimiento reducido, carga diferida, imágenes adaptativas, animación solo por scroll y solo cerca del viewport. |

El movimiento de LP03 es una cámara editorial 2D sobre una cabina recortada con transparencia. No es geometría WebGL: volante e instrumentos son una misma capa. No intercepta rueda, gestos táctiles ni scroll. En móvil, ventanas cortas o movimiento reducido se presenta una composición estática legible.

## Navegación

- Las tres cruces siguen abriendo `#exp3d/classic`, `#exp3d/red` y `#exp3d/white`.
- Colección → `#p-collection/catalogue`.
- Taller → `#p-workshops`.
- Restaurante → `#p-cafe`.
- Comprar entradas → `#p-tickets`.
- Reservar una mesa → `#p-cafe/table`: flujo existente de consulta y confirmación del equipo por WhatsApp. Este parche no incorpora disponibilidad automática, pasarela ni confirmaciones de pago.

## Resolución y procedencia

Los cinco nuevos originales generados tienen **1672 × 941 px nativos**. Las variantes de 2560 × 1440 px están reescaladas con Lanczos; no representan detalle óptico 4K. El manifiesto `assets/data/lp06-media.json` registra dimensión fuente y exportada, peso, SHA-256 y `upscaled`.

Se usa el generador integrado `image_gen`. Los prompts se incluyen en `docs/ARTECH_LP03_LP06_PROMPTS.md`. Las escenas son ilustraciones editoriales de la dirección aprobada; no se presentan como fotografías documentales de instalaciones, personal o carta reales. El catálogo mantiene sus imágenes originales.

Los 15 WebP suman aproximadamente 845 KiB. A 1280 px, cada estado del hero pesa aproximadamente 38–46 KiB. Solo se precarga el estado rojo. Las otras luces se cargan tras la entrada o bajo demanda con ahorro de datos. Taller, restaurante y cabina usan carga diferida. No hay dependencias nuevas ni solicitudes a terceros para estas funciones.

## Comprobación y límite de la entrega

```sh
node --test tests/lp02-hero.test.cjs tests/lp06-landing.test.cjs tests/core.test.cjs tests/f02-e360.test.cjs tests/e362-workshop.test.cjs
node --check assets/js/artech-lp03-lp06.js
```

Las pruebas comprueban encuadre completo, distancia entre texto y techos, controles dentro del viewport, móvil, retorno al flujo legible con zoom extremo, reversibilidad y concurrencia de iluminación. Se verifican recursos, IDs, hashes y conservación de páginas interiores/footer.

La comprobación de geometría es de lógica, no una captura del navegador. **Pendiente revisión visual en Chrome/Safari y ejecución del instalador en Windows.** El entorno no dispone del control de navegador requerido por la habilidad Sites, por lo que no se ha levantado una vista ni se ha sustituido por otra vía de automatización.

Revisión local: `py -m http.server 5500` y abrir `http://localhost:5500/?intro=1#top`.
Comprobar especialmente 1920×900 y 1366×768; en móvil, 390×844 y 375×667. Revisar ES/EN, Tab, toque, 200% de zoom, movimiento reducido, ida/vuelta a E360, navegación al catálogo, taller y mesa. No se ha hecho push ni despliegue desde esta entrega.
