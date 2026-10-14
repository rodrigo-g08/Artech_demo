# ARTECH V3-B03

Base: `4809cc7` (B02). Sin dependencias nuevas; motor de movimiento nativo intacto.

## Cambios
1. **Entrada**: video original del auto a pantalla completa (`cover`; `contain` solo en móvil vertical), una sola pasada (~4.3 s + fundido 0.7 s), sin botón Omitir. ARTECH aparece con fundido y un barrido de luz enmascarado con `logo.png`. `Escape` sigue saliendo.
2. **Taller · oficios**: inicia en 01, línea vertical con círculos 01–06, progreso ligado al scroll y reversible, oficio activo agrandado con foto y descripción sincronizadas, selección manual (clic y flechas). Con movimiento reducido: lista estática.
3. **Taller · cierre**: foto Stutz BB 1928 (Marcelo) sin filtros ni máscara + bloque "Sigue las novedades de ARTECH" con foto Ford A 1928 y el Instagram existente.
4. **Reserva**: "Te esperamos · Bajo la luz" oculto al inicio; aparece solo tras una solicitud local válida (experiencia, fecha, hora, visitantes, datos, consentimiento, envío). Saluda por nombre, repite el botón de WhatsApp y dice "pendiente de confirmación del museo". Se retiró el campo País (y su línea del mensaje).
5. **Café**: más aire entre platos y crossfade preparado por plato (`DISH_PHOTOS` en `editorial.js`, vacío hasta tener fotos reales; se muestra la foto del salón).
6. **Historia**: ritmo más continuo, línea de tiempo navegable con estaciones del catálogo (fotos de Marcelo), flechas, teclado, enlace a ficha y salida "Continuar la historia". Cierre con Hudson Super Six 1919 sin blur ni máscara.
7. **Café · cierre**: Buick 7 Asientos 1930. **Reserva · cierre**: Allard K2 1950.

## Fotos de Marcelo
`assets/cars/<slug>/marcelo.jpg` (2000 px, 3:2) para: y1s-584, aue-622, bvs-249, axs-615, cpl-048, auk-547, sin-placa-22, aby-304. No se reemplazaron las portadas existentes.

## Pendiente (no inventado)
Tarifas de niños y adultos mayores, fotos de platos, país en el formulario (cuando se decida), automatización de eras en Home (prioridad baja).
