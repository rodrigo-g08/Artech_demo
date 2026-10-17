# LP07 · Corrección de fidelidad de la landing

Esta revisión sustituye el encuadre y el movimiento de LP03–LP06. Referencia: boceto vertical aprobado aportado por el usuario el 16-10-2026.

## Composición

- Fotografía de los tres autos al 100% del ancho, sin máximo de 2000 px ni ajuste del ancho en función de la altura. Se conserva la proporción 16:9; solo se recorta cielo negro y suelo sobrante.
- El cálculo usa el título real, el header y los controles. Las cruces quedan debajo de los autos y antes del indicador de scroll. En ventanas excepcionalmente bajas o con texto ampliado se aumenta la altura, nunca se estrecha la fotografía ni se corta la carrocería.
- Separación header/título de 10 px después de la altura real de navegación. Header sin borde ni sombra horizontal.
- Volante con lienzo de 108vw, parcialmente fuera del borde izquierdo, igual que la intención del boceto. Texto de colección en el tercio derecho.
- Taller y restaurante con fotografía que llena la escena, información superior izquierda y sombra negra gradual. Sin tarjetas, márgenes laterales de fotografía ni banda divisoria entre escenas.
- Eliminado el enlace «Del detalle al oficio / From detail to craftsmanship».
- «Vívelo en Artech.» con los dos botones a la derecha y footer original intacto.
- Iluminación hover/foco, cruces y enlaces E360 conservados. El restaurante usa el flujo existente de consulta de mesa.

## Movimiento

Una sola ventana sticky contiene los cuatro capítulos. El progreso proviene directamente del scroll nativo; no hay scroll-snap, bloqueo de rueda, pasos temporizados ni una librería adicional.

| Tramo, en alturas de viewport recorridas | Movimiento |
| --- | --- |
| 0–0.12 | Hero completo |
| 0.12–1.25 | Los autos se aproximan y ascienden; el timón emerge por delante desde abajo |
| 1.25–2.2 | Pausa de lectura de colección |
| 2.2–3.55 | El timón aumenta hasta 1.75× y cruza el primer plano; el taller entra detrás |
| 3.55–4.35 | Taller completo, texto superior izquierdo |
| 4.35–5.6 | Acercamiento al guardabarros y desplazamiento vertical; el restaurante aparece detrás con un borde de desvanecimiento amplio |
| 5.6–6.2 | Restaurante completo; después continúa el cierre y el footer en flujo normal |

El movimiento se reproduce exactamente al retroceder. Las capas no visibles dejan de pintarse y sus controles no reciben foco. Tab permite avanzar entre capítulos. Los saltos de navegación llevan a las pausas de lectura, no al comienzo geométrico de las capas superpuestas.

Las imágenes se decodifican antes de activar la secuencia. Si una falla, se mantiene la composición estática. En móvil, movimiento reducido o texto que no cabe se usa una lectura continua: imágenes a todo el ancho y todos los controles accesibles, sin fijar varios viewports.

## Integración

- index.html: envoltura compartida de la secuencia, retirada del enlace, CTA del restaurante y versiones de caché.
- assets/css/artech-lp03-lp06.css: reemplazo del encuadre anterior, composición y capas.
- assets/js/artech-lp03-lp06.js: cálculo full-width, cámara continua, accesibilidad y navegación.
- assets/js/artech-b01.js: una línea para delegar los saltos de home a la cámara.
- No se modificaron footer ni contenido de páginas interiores. No se implementan pagos o reservas adicionales.
- Se reutilizan las imágenes de LP06. Sus fuentes son de 1672×941; la variante de 2560 px está reescalada, no es nueva fotografía 4K.

## Validación realizada y pendiente

22 pruebas Node aprobadas: geometría, continuidad, reversibilidad, iluminación, rutas y regresiones de las experiencias existentes. Sintaxis JS, estructura HTML, IDs, archivos locales y comparación exacta de footer/contenido interior comprobados.

La geometría se verificó por cálculo para 1905×895, 1881×895, 1920×900, 1920×1080, 1366×768, 1440×900, 1536×730, 2560×1440 y 1024×768; también se comprobaron tamaños táctiles y escenarios de zoom.

No se realizó una revisión visual en navegador ni se ejecutó PowerShell en Windows en este entorno. Revisar antes de publicar:
1. Al iniciar, los tres autos llegan a ambos extremos, los techos no se superponen al título y las cruces/flecha caben.
2. Hover rápido sobre los tres autos, entrada y vuelta desde E360.
3. Scroll lento, rápido y hacia atrás: volante en primer plano, taller, restaurante, cierre.
4. Tab/Shift+Tab, idioma ES/EN, movimiento reducido y móvil.
5. Footer idéntico y enlaces de entradas/mesa funcionando con los flujos existentes.
