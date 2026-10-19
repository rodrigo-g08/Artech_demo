# ARTECH P11 · Corrección de alcance

Este parche se instala sobre P10 y recupera el recorrido de pago con tarjeta
que existía antes. No necesita el servidor de reservas de P10 para probarlo.

## Cambios

- Vuelve el bloque Pago con tarjeta dentro de Tus datos: número, vencimiento y
  código de seguridad con la tarjeta ficticia original, de solo lectura.
- Se conservan las dos opciones de demostración: Aprobado y Rechazado.
- Aprobado muestra la entrada y los dos botones de billetera; Rechazado conserva
  el formulario y permite reintentar. No hay paso pendiente ni confirmación manual.
- Se retiran del checkout los enlaces para coordinar por WhatsApp, el botón de
  actualizar estado y las llamadas a la API de reservas.
- Los botones usan las piezas de marca de Apple Wallet y Google Wallet, con sus
  logos, colores y proporciones. Google Wallet es la opción para guardar entradas;
  Google Pay corresponde al pago. Se conserva la interfaz en español e inglés.
- Los botones de billetera están en presentación: al pulsarlos muestran
  «Disponible próximamente». No intentan agregar un pase ni simulan haberlo guardado.
- Solo los vehículos clasificados como `modern` en el catálogo se reducen un 20%
  respecto de P10, tanto en frontal como 3/4, galería, miniaturas y transición.
  Afecta a 13 vistas con foto. Las 26 vistas clásicas conservan la geometría exacta
  de P10. La carrocería y las sombras mantienen su posición relativa y la línea de piso.

El pago recuperado sigue siendo la simulación anterior: no procesa tarjetas ni
efectúa cobros. Los campos de tarjeta son ficticios y no se envían a ningún servidor.
No se ha conectado una pasarela. Los QR se leen y abren una vista previa de la
entrada, identificada como prueba; no certifican un pago ni autorizan ingreso al museo.
La vista previa no incluye nombre, correo ni datos de tarjeta en el enlace.

El instalador conserva los demás archivos de P10. El nuevo checkout no usa su
API ni su pantalla de confirmación del personal. No se borra información existente.

## Probar en local

Detén cualquier servidor que use el puerto 5500 con Ctrl+C. Desde Artech_demo:

```powershell
py -m http.server 5500
```

Abre http://localhost:5500/#p-tickets y recarga con Ctrl+F5.
En Tus datos usa los datos de prueba, acepta la casilla y prueba ambos resultados
en Opciones de demostración. Para revisar la reducción visita un Porsche moderno
en sus vistas frontal y 3/4 y compáralo con un clásico.

Los QR que contienen localhost se abren en la misma computadora. En una dirección
pública se podrán abrir desde otros dispositivos, conservando su condición de vista previa.

## Instalación y reversión

El ZIP contiene Aplicar-ARTECH-P11.ps1 y un manifiesto de los archivos del parche.
El instalador comprueba P10, protege cambios posteriores, crea un respaldo fuera
del repositorio y muestra el comando para restaurarlo. No hace commit, push ni deploy.
No necesita que P10 ya esté confirmado en Git, solo que esté instalado.

El manifiesto incluye también el generador QR reutilizado de P10 para que el
commit funcione aunque ese archivo todavía no se hubiera confirmado en Git.

## Verificación

Pasaron 6 pruebas automatizadas dirigidas: aprobación con tarjeta y botones en
ambos idiomas, rechazo y reintento, grupos y menores sin coordinación manual,
cancelación de la animación sin aprobación tardía, comparación de las 39 vistas
en 6 tamaños y apertura/descarga de la vista previa del QR sin API ni datos personales.
Además se comprobaron sintaxis JavaScript, integridad ZIP y hashes del instalador.

No se ejecutó el instalador en Windows ni se revisó la página en un navegador real.
Los botones no están activados para guardar pases en dispositivos.

## Recursos de marca

Se conservan los archivos gráficos de origen, sin redibujar los logos.

- Apple Wallet: https://developer.apple.com/wallet/add-to-apple-wallet-guidelines/
- Badge de Apple usado en la vista previa:
  https://developer.apple.com/wallet/add-to-apple-wallet-guidelines/images/button-two-line-large_2x.png
- Google Wallet: https://developers.google.com/wallet/generic/resources/brand-guidelines
- SVG oficiales: https://developers.google.com/static/wallet/download-assets/add-to-wallet-svg.zip
  Variantes condensadas es419 y enUS.

Apple y Apple Wallet son marcas de Apple Inc. Google y Google Wallet son marcas
de Google LLC. Este parche presenta el aspecto de los botones; su publicación
como integración activa requiere conectar los pases y cumplir las condiciones
de cada proveedor.
