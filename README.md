# Tienda La Esquina

Aplicación web para controlar el inventario y los movimientos de mercancía de una tienda de barrio. Permite consultar las unidades disponibles de cada producto a partir de las entradas y salidas registradas y detectar a tiempo qué productos tienen stock bajo.

## Ventanas de la aplicación

1. **Inventario**: muestra el total de productos, cuántos tienen stock bajo y el total de movimientos registrados. Incluye buscador por nombre, filtro por categoría y la tabla completa de productos con precio en pesos colombianos, stock actual, stock mínimo y estado (`Stock bajo` u `OK`).
2. **Nuevo producto**: formulario para crear un producto con nombre, categoría, precio de venta y stock mínimo. Todo producto nuevo inicia con stock `0`, ya que el inventario solo cambia mediante movimientos.
3. **Movimientos**: formulario para registrar una **Entrada** o una **Salida** indicando producto, cantidad entera mayor que cero y una nota opcional, acompañado del historial ordenado del movimiento más reciente al más antiguo. Si una salida supera el stock disponible, la base de datos la rechaza y se muestra el aviso debajo del formulario.

## Variables de entorno

La aplicación se conecta a Supabase desde el navegador mediante `@supabase/supabase-js` y lee estas dos variables en `src/config.ts`:

- `VITE_SUPABASE_URL`: URL del proyecto en Supabase.
- `VITE_SUPABASE_PUBLISHABLE_KEY`: clave pública (*publishable key*) de Supabase.

Puedes copiar `.env.example` a `.env` para configurar tus propios valores localmente o definirlos en la configuración del proyecto en Vercel. Si no se definen, `src/config.ts` usa los valores por defecto configurados en el proyecto.

## Cómo ejecutar el proyecto

Requisitos previos: Node.js instalado.

```bash
npm install
npm run dev
```

Luego abre en tu navegador la dirección local que muestre Vite (por defecto `http://localhost:3000`).

Para generar la versión de producción (por ejemplo, para publicar en Vercel):

```bash
npm run build
```
