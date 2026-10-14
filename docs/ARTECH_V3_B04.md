# ARTECH V3-B04 · Integración, inmersión y cierre

14 de octubre de 2026 · America/Lima. Base: `cc99a3c` (B03), rama `fix/artech-demo`. Sin dependencias nuevas.

## Hallazgo principal

El recorrido inmersivo de la portada (escenas fijas que se funden a negro al bajar y vuelven al subir) **estaba desactivado en todos los tamaños de pantalla** desde B01. El motor apagaba la secuencia completa si cualquier escena medía unos píxeles más que la ventana, y el video de portada, que es decorativo y queda recortado, sobresale unos 24 px. Por eso en el navegador se veía una página de scroll común y no la experiencia diseñada.

## Cambios

1. **Motor de escenas (`motion.js`).** Mide solo el contenido legible, no los medios decorativos. Si una escena queda apenas más alta que la ventana, su contenido se ajusta a escala (mínimo 68 %) en lugar de apagar el recorrido. Vuelve a medir al cargar la página y cada imagen. Resultado comprobado: recorrido activo en 1920 × 1080, 1440 × 900, 1366 × 768, 1280 × 720, 390 × 844 y 360 × 740. En 320 × 640 y con movimiento reducido se conserva el flujo normal, como estaba previsto.
2. **Inmersión en páginas interiores (`v3-immersion.js`, nuevo).** Todo ligado al scroll y reversible:
   - Portadas de Colección, Taller, Experiencias, Restaurante, Historia y ficha: la foto se acerca lentamente y el texto se retira al bajar; al subir, regresa.
   - Bloques editoriales: suben y aparecen al entrar en pantalla.
   - Fotografías de cierre (incluidas las de Marcelo): «se encienden las luces» a medida que la foto llega al centro. En reposo quedan sin filtro y a escala real, como pide B03.
   - **Siguiente capítulo:** cada página termina en la siguiente, con foto de Marcelo: Colección → El Taller → Experiencias → Restaurante → Historia → Tu visita. Sin navegación automática.
   - Barra roja fina de avance del capítulo en la parte superior.
   - Con movimiento reducido, todo queda estático y completo.
3. **Ficha de vehículo.** La foto principal vuelve a abrir el visor de fotos con clic, Enter o espacio.
4. **Correcciones.** Ruta rota del fondo del boletín (`hero-poster.jpg`, error 404); recuadro rojo sobre los títulos al cambiar de página; bloque de boletín duplicado al final del Taller; favicon y metadatos para compartir el enlace.
5. **Pruebas.** Se actualizaron a los cambios aprobados en B01–B03 (intro sin «Omitir», film automático, «Bajo la luz» tras una solicitud válida, línea de tiempo de Historia, destacados de Colección). Resultado: 3/3 lógica, 13/13 escenas, 18/18 navegador.

## Archivos

`index.html`, `assets/js/motion.js`, `assets/js/site.js`, `assets/js/v3-immersion.js` (nuevo), `assets/css/site.css`, `assets/css/v3-block4.css` (nuevo), `tests/v3-scenes.test.cjs`, `tests/browser.test.cjs`, `docs/ARTECH_V3_B04.md`.

## Pendiente que depende del cliente (no se inventó)

Fotos de platos, salón y retrato de la chef; retrato de Jimmy; pares reales antes y después del taller; Instagram oficial confirmado; tarifas de niños y adultos mayores; decisión sobre el país en el formulario; backend de reservas y pagos (Culqi o Niubiz).

## Publicación

GitHub → `rodrigo-g08/Artech_demo` → Settings → Pages → *Deploy from a branch* → rama `fix/artech-demo`, carpeta `/ (root)`. El repositorio ya incluye `.nojekyll` y todas las rutas son relativas.
