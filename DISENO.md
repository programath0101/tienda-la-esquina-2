# Guía y plan de diseño — Tienda La Esquina

Adaptada y resumida de la skill «frontend-design» de Anthropic
(github.com/anthropics/skills, licencia Apache 2.0), aplicada a **Tienda La Esquina** con
**Material UI (MUI)** y un tono **moderno y llamativo**.

## Plan de diseño aplicado

- **Librería de interfaz:** Material UI (`@mui/material`, `@emotion/react`, `@emotion/styled` e íconos `@mui/icons-material`) mediante tema centralizado (`ThemeProvider` + `createTheme`).
- **Paleta de colores (5 colores):**
  - **Oxford Navy (`#1d3557`)**: color primario de marca; barra superior de navegación, botones principales («Guardar producto», «Registrar»), estado `OK`, acciones de `Entrada` y anillo de foco visible.
  - **Cerulean (`#457b9d`)**: acento secundario; realce superior de métricas informativas, borde inferior de la barra superior y etiquetas de entradas en el historial.
  - **Frosted Blue (`#a8dadc`)**: acento moderno y llamativo; botón destacado «Nuevo producto» (con texto **Oxford Navy `#1d3557`** de alto contraste), indicador activo de pestañas en la barra superior y realces interactivos.
  - **Honeydew (`#f1faee`)**: lienzo general fresco y limpio, bandas de encabezado en las tablas y fondo de avisos informativos.
  - **Punch Red (`#e63946`)**: alertas de «Stock bajo», movimientos de `Salida`, errores de validación y avisos de rechazo de stock desde Supabase (con variante oscurecida `#B81D2A` en textos pequeños para garantizar contraste WCAG AA $\ge 4.5:1$).
- **Tipografía (Google Fonts):**
  - **Encabezados y marca:** `Bricolage Grotesque` (600, 700).
  - **Cuerpo, formularios y controles:** `Plus Jakarta Sans` (400, 500, 600).
  - **Precios, cantidades, stock y fechas:** `IBM Plex Mono` (400, 500) con `tabular-nums`.
  - No se usan `Roboto`, `Inter`, `Geist`, `Arial` ni la fuente genérica del sistema.
- **Disposición:**
  - Barra superior pegajosa en **Oxford Navy (`#1d3557`)** con marca a la izquierda y pestañas («Inventario» y «Movimientos») subrayadas en **Frosted Blue (`#a8dadc`)**.
  - Contenedor centrado (`maxWidth="lg"`), con tarjetas de resumen en cuadrícula de 3 columnas (Móvil 1 columna, Desktop 3), barra de filtros clara, tabla densa y legible en escritorio y lista cómoda en celular.
  - En V3 («Movimientos»), grilla de 2 columnas en escritorio (formulario a la izquierda e historial a la derecha) y apilado limpio en celular.
- **Elemento memorable:**
  - El contraste moderno entre la **barra superior en Oxford Navy (`#1d3557`) con acento Frosted Blue (`#a8dadc`)** sobre el lienzo limpio **Honeydew (`#f1faee`)**, junto a la tarjeta interactiva de **«Con stock bajo»** resaltada en **Punch Red (`#e63946`)** que filtra la estantería al instante.

## Lo que evita esta versión

- Tarjetas idénticas anidadas con sombras grises pesadas (se usa superficie plana blanca con borde fino azul-grisáceo `#C9D9DC` y un solo nivel de elevación).
- Etiquetas en cápsula/píldora para estados estáticos («Stock bajo», «OK», «Entrada», «Salida» se muestran como tipografía semántica limpia sin píldoras).
- Puntos decorativos, degradados de adorno, bordes izquierdos gruesos (`border-l-4`), flechas «→» en botones o emojis en lugar de íconos.
- Textos de ejemplo únicamente en `placeholder`: cada campo conserva su etiqueta visible (`shrink`) y texto de ayuda debajo.

## Piso de calidad y textos

- Contraste WCAG AA ($\ge 4.5:1$), áreas táctiles $\ge 44\text{px}$ en móvil y foco de teclado visible sin quedar tapado por la barra superior (`scroll-padding-top: 84px`).
- Respeta `prefers-reduced-motion`.
- Español cotidiano y directo del tendero: verbos claros («Guardar producto», «Registrar», «Buscar por nombre...»), precios en pesos sin decimales (`$12.500`), fechas relativas (`Hoy 14:30`, `Ayer 09:15`, `21 nov 13:48`) y errores explicando qué pasó y cómo resolverlo.
