# ARTECH · V3-00 · Base, escenas y contenido

Preparado el 14 de octubre de 2026, America/Lima. Entrega objetivo: 5:00 p. m.

## Qué queda resuelto

Se reconstruyó una copia completa de H0 + MH01 + MH02 + MH03 + MH04–06 + MH07–10 + los paquetes de Experiencias/Restaurante/Historia y Colección/Fichas. Los siete patches se aplicaron sin conflictos. Esto verifica la base de desarrollo disponible; no demuestra el estado del equipo del usuario ni un despliegue.

Checkpoint interno de la base reconstruida: `a9f0f06bb45ac4e0d3cf1e53d48c4d2cbca686d7`. Este hash es local y no pertenece al remoto del usuario.

V3-00 añade esta guía y `assets/data/v3-content.json`. El contenido del JSON está preparado para los hitos siguientes y todavía no sustituye las escenas visibles. La única modificación visible de este patch es unificar «Reserva tu turno» / «Book your visit». Los movimientos y el reemplazo de fotos corresponden a V3-01 en adelante.

## Dirección creativa

**La historia del automóvil, y el oficio que la mantiene presente.** La visita empieza con el impacto de los autos, revela cómo se restauran, presenta las experiencias y termina con la solicitud de visita. Las láminas enviadas definen composición y separación de imagen/texto; se revisaron frases para evitar presión comercial, datos inventados y una exclusividad que descalifica al visitante.

El PDF de identidad revisado muestra el wordmark de Artech y aplicaciones negras/blancas. Se conserva ese logo. Archivo e Inter se mantienen por continuidad con MH01; no se atribuyen al PDF. El rojo #C8102E se conserva como acento digital solicitado.

- Escenas completas: fundido de salida a negro, pausa visual y entrada de la siguiente. Reversible al subir.
- Fotografías intactas y texto fuera de ellas; respetar encuadres y proporciones.
- Negro → negro de transición → papel. Sin sobreexposición, barridos o máscaras.
- Reflejo en titulares sobre papel, con color base oscuro legible.
- Móvil: texto e imagen en secuencia vertical. Movimiento reducido: flujo normal.
- El comparador antes/después seguirá rotulado como simulación hasta tener el par auténtico.

## Datos comprobados en el catálogo

- 96 registros; 40 marcas identificadas; cinco vehículos sin marca.
- Años registrados: 1903–2018. No publicar 2020 como final de la colección sin añadir la ficha real.
- Pieza inicial: `sin-placa-25`, 1903, sin marca identificada. No convertir su descripción genérica en un modelo certificado.
- La edad se calcula con el año actual: 123 años en 2026, sin fijarla para siempre en el código.
- Ferrari Testarossa: 1988, 390 HP, Flat-12 y 290 km/h según el catálogo. Confirmar cifras con Artech antes de publicación definitiva.
- El conteo de marcas excluye las marcas no identificadas; no inventar una marca «Otros».

## Recorrido por épocas

1903 · pieza inicial → 1936 · Auburn 852 → 1956 · Maserati 300S → 1970 · Dodge Challenger R/T → 1988 · Ferrari Testarossa → 2018 · Porsche 911 GT2 RS.

## Escenas y textos preparados

Los saltos de línea son intencionales. Los textos ES/EN y notas de producción están en el JSON. En todas las escenas: CTA principal «Reserva tu turno».

### Portada

Ruta: `#top` · existente o plantilla indicada.

| Escena | Titular | Imagen / composición |
| --- | --- | --- |
| home-01 | El automóvil, / a través del tiempo. | assets/cars/cxj-330/cover.jpg |
| home-02 | El recorrido / comienza en 1903. | type |
| home-03 | 1903. / Otra forma de viajar. | assets/cars/sin-placa-25/v1.jpg |
| home-04 | Cada época, / su propia forma. | assets/cars/cxj-330/cover.jpg |
| home-05 | Lo que ves en la sala / es parte de la historia. | type |
| home-06 | La historia también / se reconstruye. | assets/cars/cxj-330/d1.jpg |
| home-07 | Elige cómo / vivir Artech. | experience-options |
| home-08 | Haz espacio / para descubrir. | type |
| home-09 | El taller. | assets/cars/cxj-330/d1.jpg |
| home-10 | Artech. Lima. | footer |

### El taller

Ruta: `#p-workshops` · existente o plantilla indicada.

| Escena | Titular | Imagen / composición |
| --- | --- | --- |
| workshop-01 | El oficio detrás / de cada auto. | assets/cars/cxj-330/d1.jpg |
| workshop-02 | Restaurar es / volver a mirar cada detalle. | type |
| workshop-03 | Antes. / Después. | assets/cars/sin-placa-15/cover.jpg |
| workshop-04 | Un proceso. / Distintos oficios. | assets/interior.png |
| workshop-05 | Cada oficio / deja su huella. | assets/interior.png |
| workshop-06 | Lo que no se ve / también se restaura. | type |
| workshop-07 | Conoce el taller / durante tu visita. | assets/cars/bfu-487/cover.jpg |
| workshop-08 | Proyectos / del taller. | assets/cars/sin-placa-15/cover.jpg |

### Proyectos

Ruta: `#p-projects` · por construir.

| Escena | Titular | Imagen / composición |
| --- | --- | --- |
| projects-01 | Cada restauración / tiene un comienzo. | assets/cars/sin-placa-15/cover.jpg |
| projects-02 | Del detalle / al conjunto. | assets/cars/sin-placa-15/cover.jpg |
| projects-03 | Auburn 852 / Supercharged. | assets/cars/sin-placa-15/cover.jpg |

### Proyecto Auburn

Ruta: `#p-project/auburn-852` · por construir.

| Escena | Titular | Imagen / composición |
| --- | --- | --- |
| auburn-01 | Auburn 852. / 1936. | assets/cars/sin-placa-15/cover.jpg |
| auburn-02 | Una pieza, / muchos detalles. | assets/cars/sin-placa-15/d1.jpg |
| auburn-03 | El proceso, / paso a paso. | assets/cars/sin-placa-15/cover.jpg |
| auburn-04 | Míralo / de cerca. | assets/cars/sin-placa-15/cover.jpg |
| auburn-05 | La colección. | assets/cars/maserati-300s/cover.jpg |

### Colección

Ruta: `#p-collection` · existente o plantilla indicada.

| Escena | Titular | Imagen / composición |
| --- | --- | --- |
| collection-01 | ¿Cuál era el auto / de tu papá? | catalogue-search |
| collection-02 | Encuentra / tu próxima pieza. | catalogue-grid |
| collection-03 | Cada auto, / una historia. | assets/cars/cxj-330/cover.jpg |

### Ficha de vehículo

Ruta: `#p-vehicle/{slug}` · existente o plantilla indicada.

| Escena | Titular | Imagen / composición |
| --- | --- | --- |
| vehicle-01 | Ferrari Testarossa. / 1988. | assets/cars/cxj-330/cover.jpg |
| vehicle-02 | Diseño. / Ingeniería. / Carácter. | spec-highlights |
| vehicle-03 | Una silueta / inconfundible. | assets/cars/cxj-330/d1.jpg |
| vehicle-04 | Míralo / de cerca. | assets/cars/cxj-330/cover.jpg |
| vehicle-05 | La pieza / en detalle. | specifications |
| vehicle-06 | Sigue / descubriendo. | recommendations |
| vehicle-07 | La siguiente / pieza. | assets/cars/maserati-300s/cover.jpg |

### Experiencias

Ruta: `#p-experience` · existente o plantilla indicada.

| Escena | Titular | Imagen / composición |
| --- | --- | --- |
| experience-01 | Tu forma de / vivir Artech. | assets/legacy.png |
| experience-02 | La colección. | assets/cars/maserati-300s/cover.jpg |
| experience-03 | La colección. / Y lo que hay detrás. | assets/cars/cxj-330/d1.jpg |
| experience-04 | Artech, / a tu ritmo. | assets/interior.png |
| experience-05 | Elige tu día. / Nos vemos en Artech. | type |
| experience-06 | El restaurante. | assets/legacy.png |

### Restaurante

Ruta: `#p-cafe` · existente o plantilla indicada.

| Escena | Titular | Imagen / composición |
| --- | --- | --- |
| restaurant-01 | Una mesa / entre clásicos. | assets/legacy.png |
| restaurant-02 | El recorrido / continúa en la mesa. | type |
| restaurant-03 | La carta. | menu |
| restaurant-04 | Haz una pausa. | restaurant-request |
| restaurant-05 | Un lugar / para quedarse. | assets/legacy.png |
| restaurant-06 | Nuestra historia. | assets/cars/maserati-300s/cover.jpg |

### Historia

Ruta: `#p-history` · existente o plantilla indicada.

| Escena | Titular | Imagen / composición |
| --- | --- | --- |
| history-01 | Una colección. / Una historia que continúa. | assets/legacy.png |
| history-02 | Preservar / para compartir. | type |
| history-03 | Más de un siglo / de diseño. | assets/cars/maserati-300s/cover.jpg |
| history-04 | La historia sigue / con cada visita. | assets/cars/maserati-300s/cover.jpg |
| history-05 | Reserva / tu turno. | assets/cars/cxj-330/cover.jpg |

### Reserva

Ruta: `#p-tickets` · existente o plantilla indicada.

| Escena | Titular | Imagen / composición |
| --- | --- | --- |
| visit-01 | Elige el día. / Descubre Artech. | assets/cars/maserati-300s/cover.jpg |
| visit-02 | ¿A nombre / de quién? | visitor-details |
| visit-03 | Tu visita, / paso a paso. | visit-steps |
| visit-04 | Nos encuentras / en Chorrillos. | map |
| visit-05 | Tu solicitud / está preparada. | assets/legacy.png |
| visit-06 | Te esperamos / en Artech. | assets/legacy.png |

### Páginas secundarias

Ruta: `multiple` · existente o plantilla indicada.

| Escena | Titular | Imagen / composición |
| --- | --- | --- |
| secondary-01 | Historias / para seguir el recorrido. | assets/cars/cxj-330/d1.jpg |
| secondary-02 | Cada detalle / tiene su historia. | assets/interior.png |
| secondary-03 | Vehículos / en venta. | sales |
| secondary-04 | Antes / de tu visita. | faq |
| secondary-05 | Libro / de Reclamaciones. | claims |
| secondary-06 | Esta pieza no está / en la colección. | not-found |

## Selección de imágenes

La lámina `ARTECH_V3_00_seleccion.jpg` muestra archivos disponibles, sin filtros. Se revisaron por composición; el origen y los derechos de las fotografías siguen ligados al material del repositorio, no se atribuyen automáticamente a Marcelo.

| Uso | Archivo | Estado |
| --- | --- | --- |
| Portada · Ferrari completo | `assets/cars/cxj-330/cover.jpg` | Disponible |
| El taller · detalle, no foto de proceso | `assets/cars/cxj-330/d1.jpg` | Disponible |
| Proyecto · Auburn terminado | `assets/cars/sin-placa-15/cover.jpg` | Disponible |
| Colección · Maserati | `assets/cars/maserati-300s/cover.jpg` | Disponible |
| Interior · tapicería terminada | `assets/interior.png` | Disponible |
| Te esperamos · sustituto seleccionado | `assets/legacy.png` | Disponible |

Para «Te esperamos» se seleccionó `assets/legacy.png`: muestra el conjunto y el Ferrari completo en primer plano. Debe conservarse su proporción; no estirarlo como panorama ni recortar la carrocería. Es un sustituto hasta recibir una toma amplia de Marcelo. Se descarta `hero-poster.jpg` para este cierre.

No usar `experiences.png` como fotografía protagonista: contiene controles de reproducción dentro de la propia imagen. Las vistas aisladas de `/360-tour/` no documentan un proceso de taller; no usarlas para afirmar que se está desarmando o reconstruyendo ese vehículo. `interior.png` muestra tapicería terminada. No sustituir imágenes de restaurante por cuero de autos.

## Lo que debe confirmar Artech

- Par real antes/después del mismo vehículo.
- Fotos de trabajo real: desarme, mecánica, pintura, cromados, costura y pruebas.
- Fotos reales del restaurante y platos.
- Foto panorámica final con autos completos; legacy.png es sustituto disponible.
- Film de cada pieza, si existe; hero.mp4 es video general, no film específico.
- Retrato de Jimmy y cronología institucional autorizada.
- Marca/modelo de cinco fichas incompletas; confirmar pieza de 1903.
- Nuevos autos de 2020 o posteriores: no figuran en el catálogo disponible.
- Precios, duración, descuentos, dirección, horario e inclusiones vigentes.
- Estado y datos del proyecto Auburn: sin motor, 12 meses, 2000 piezas y número de proyecto.
- Hay dos en el taller; fines de semana se agotan primero; todos llegaron como pérdida: no publicar sin evidencia.
- Promoción restaurante S/100 e ingreso: no publicar sin confirmación.
- Recepción de reservas, pago, cupos y Libro de Reclamaciones: integraciones por confirmar.

No bloquear el desarrollo por datos pendientes: ocultar promociones o cifras, publicar el relato verificable y distinguir claramente cualquier demostración.

## Movimiento a implementar en V3-01

La intro recibida tiene 127 fotogramas y dura 6,35 segundos. Se usará el ritmo del logo y fundido como referencia, con omisión y reproducción una vez por pestaña; no forzar al visitante a esperar la duración completa. Los otros cinco GIF recibidos contienen un solo fotograma. Su timing no está comprobado; la lámina 00 define el comportamiento deseado.

Un solo sistema de escenas para todas las rutas, con limpieza al navegar. No superponer el nuevo motor al efecto anterior de barras/círculo ni a la aparición única de escenas de editorial.js. El progreso pequeño del «siguiente capítulo» es un indicador reversible, con botón de acceso, no la antigua transición de círculo gigante. Evitar saltos de ruta con movimiento reducido.

## Aplicar este patch

Primero aplicar los dos paquetes adicionales si todavía faltan; este patch de V3-00 se prepara sobre ambos. No volver a aplicar los MH ya presentes.

```powershell
cd "C:\Users\rgame\OneDrive\Documentos\GitHub\Artech_demo"
git status --short
git apply --check "C:\Users\rgame\Downloads\ARTECH_V3_00\artech-v3-00.patch"
git apply "C:\Users\rgame\Downloads\ARTECH_V3_00\artech-v3-00.patch"
```

Si --check da error, conservar el estado actual y comprobar los paquetes presentes; no usar --reject ni forzar. Ajustar la ruta de Downloads si se extrajo en otra carpeta.

Commit sugerido: `chore: prepare Artech V3 scenes, copy and media direction`.

## Qué validar en V3-00

1. Portada: «El automóvil, a través del tiempo». Taller: «El oficio detrás de cada auto». Restaurante: «Una mesa entre clásicos».
2. Foto seleccionada para «Te esperamos»: preferible a la anterior y con autos completos.
3. Las condiciones comerciales que se mantienen provisionales, especialmente precios e inclusiones.
4. En la web aplicada, CTA «Reserva tu turno», también al cambiar idioma.

La nueva composición y los fundidos se validarán en V3-01; este hito prepara su contenido.

## Comprobaciones realizadas

- Los siete patches anteriores aplicados sin conflictos sobre la copia H0.
- Tres pruebas existentes de lógica aprobadas en la base reconstruida.
- Todas las imágenes y los slugs del JSON comprobados contra el repositorio.
- Sintaxis de JavaScript comprobada tras unificar CTAs.
- Patch V3-00 comprobado y reaplicado en una copia limpia de la base recuperada.
- La validación visual de las nuevas escenas y la revisión completa de navegador corresponden a los hitos de implementación.
