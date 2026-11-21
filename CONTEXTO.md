# Tienda La Esquina: contexto del proyecto

## Problema

Una tienda de barrio anota las ventas en un cuaderno. Para saber cuánto queda de un producto hay que
ir a contar a la bodega, y a veces un producto se acaba antes de que pase el proveedor. La app lleva
la cuenta de cuántas unidades hay de cada producto, a partir de lo que entra y lo que sale, y avisa
cuáles están por acabarse.

## Requerimientos funcionales

- RF-01. El usuario abre la app. La app muestra tres tarjetas (total de productos, productos con
stock bajo, movimientos registrados) y la tabla de productos con su estado.
- RF-02. El usuario busca por nombre o filtra por categoría. La app muestra solo los productos que
cumplen.
- RF-03. El usuario crea un producto con nombre, categoría, precio y stock mínimo. La app valida que
no falte ningún dato, lo guarda con stock 0 y vuelve al inventario.
- RF-04. El usuario registra una entrada de mercancía. La app suma la cantidad al stock y guarda el
movimiento en el historial.
- RF-05. El usuario registra una salida. Si hay stock suficiente, la app la resta y la guarda. Si
no, la rechaza y muestra cuántas unidades quedan.

## Reglas de negocio

- RN-01. El stock nunca se escribe a mano. Solo cambia cuando se inserta una fila en `movimientos`;
la base de datos lo actualiza sola.
- RN-02. Una salida no puede ser mayor que el stock. La base de datos la rechaza con el mensaje «No
hay suficiente stock: quedan N unidades».
- RN-03. Un producto tiene stock bajo cuando `stock_actual <= stock_minimo`. La vista
`vista_productos` lo calcula en la columna `stock_bajo`.

## Datos (ya existen en Supabase; no crear tablas ni datos)

- `categorias`: id, nombre (único).
- `productos`: id, nombre, categoria_id, precio (entero, pesos colombianos), stock_actual,
stock_minimo, creado_en.
- `movimientos`: id, producto_id, tipo ('entrada' o 'salida'), cantidad (entero mayor que 0), nota,
creado_en.
- Vista `vista_productos`: id, nombre, categoria, categoria_id, precio, stock_actual, stock_minimo,
stock_bajo. Se usa para leer productos.
- Un trigger en `movimientos` suma o resta el stock y rechaza las salidas imposibles (RN-02).

## Ventanas

- V1 Inventario: tres tarjetas (RF-01), buscador por nombre y filtro por categoría (RF-02), tabla de
productos con precio, stock, mínimo y la etiqueta «Stock bajo». Botón «Nuevo producto» que abre V2.
- V2 Nuevo producto: nombre, categoría (lista), precio y stock mínimo, todos obligatorios. Sin campo
de stock (RN-01). Aviso: «El producto empieza con stock 0». Al guardar vuelve a V1 con los datos
recargados.
- V3 Movimientos: producto (mostrando su stock), tipo Entrada o Salida, cantidad y nota. Si la base
de datos rechaza la salida, su mensaje aparece en un aviso rojo debajo del formulario. Al lado, el
historial del más reciente al más antiguo.

Navegación: menú superior con «Inventario» (V1) y «Movimientos» (V3).

## Arquitectura

- App web solo de cliente: React, Vite y TypeScript. Sin servidor propio.
- Datos con `@supabase/supabase-js`, usando la publishable key (pública; la seguridad la ponen las
políticas RLS).
- Configuración en `src/config.ts`, que lee `import.meta.env.VITE_SUPABASE_URL` y
`import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY`.
- Precios con formato $12.500 (punto de miles, sin decimales).
- Después de guardar cualquier cosa, la app vuelve a cargar los datos.
