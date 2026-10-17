# ARTECH · LP01 + LP02

Base: `entrega/artech-b01`, commit `f44815eda04b2c0433557fa11c37ab502a659aed`.
Dirección aprobada: primer boceto de la última ronda.

## Entrega

- **LP01:** composición de inicio sobre negro continuo; volante/cabina con transparencia, luz blanca y costuras rojas; texto a la derecha; pausa de 160–240 px al final de la escena en escritorio. En móvil, imagen y texto se ordenan verticalmente. Sustituye los grupos repetidos de autos del inicio. El catálogo interior conserva sus fotografías y funcionamiento.
- **LP02:** tres estados fotográficos de iluminación. Hover o foco ilumina el vehículo; la cruz abre su ruta E360 existente. El título aparece con una entrada de 700 ms después de la pantalla de inicio, separado de los techos de los autos. La transición de iluminación dura 380 ms.
- En pantallas táctiles hay botones de iluminación y cruces de acceso independientes. Se mantiene el scroll nativo; movimiento reducido elimina las animaciones.
- Se reutilizan header, botones, traducción ES/EN, loader y footer de esta rama. El HTML del header y footer es idéntico al de la base.

## Recursos y carga

`assets/data/lp01-media.json` documenta procedencia, dimensiones, tamaño y SHA-256.
Las dos iluminaciones suministradas se conservan; la iluminación del clásico y la cabina son reconstrucciones creativas a partir de las referencias aprobadas, no fotografías documentales del catálogo.

Las ocho variantes WebP suman aproximadamente 383 KiB en disco. El hero predeterminado pesa 37 KiB a 1600 px y 16 KiB a 960 px. Solo su estado rojo se precarga; las alternativas se preparan después del inicio, salvo cuando el navegador informa ahorro de datos. En ese caso se solicitan al seleccionarlas. La cabina usa carga diferida. No se añaden librerías ni servicios externos.

La imagen actual permanece visible durante las solicitudes. Una selección más reciente cancela el efecto de una respuesta anterior. Los fallos no sustituyen el estado visible y se permite reintentar en la siguiente selección. La navegación E360 sigue siendo un enlace nativo, independiente de la carga de iluminación.

## Alcance siguiente

- **LP03:** movimiento del volante y transición continua hacia el taller. La cabina queda en una capa independiente del fondo; volante e instrumentos pertenecen todavía a una sola imagen. Esta entrega no incorpora una cámara 3D ni el movimiento final de scroll.
- **LP04:** composición definitiva de taller y restaurante en la landing. Se conserva por ahora el acceso al taller existente.
- **LP05:** cierre «Vívelo en Artech.» a la izquierda y acciones «Comprar entradas» / «Reservar una mesa» a la derecha, conservando el footer.

## Verificación

Pruebas de lógica y regresión, sin dependencias adicionales:

```sh
node --test tests/lp02-hero.test.cjs tests/core.test.cjs tests/f02-e360.test.cjs tests/e362-workshop.test.cjs
node --check assets/js/artech-lp01-lp02.js
```

Se verifican cinco casos de concurrencia/recuperación del hero, las rutas y datos de la base, integridad de recursos y que header, footer y páginas interiores permanezcan intactos.

**Pendiente: revisión visual en navegador.** No se ejecutó QA de navegador en el entorno de entrega. Para revisar localmente en Windows, desde la raíz del repositorio:

```powershell
py -m http.server 5500
```

Abrir `http://localhost:5500/?intro=1#top`. Revisar 1440/1920 px y 390 px, ES/EN, tabulación, hover rápido entre autos, toque y retorno desde las tres rutas E360. Comprobar que los títulos no se superponen a los autos y que hay aire antes del taller. Validar el efecto con movimiento reducido y una conexión lenta. La revisión de tiempos y geometría en dispositivos reales debe preceder a la aprobación visual de estos hitos.

Commit sugerido: `feat: implement LP01 composition and LP02 interactive hero`.
