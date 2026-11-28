import {type FormEvent, useCallback, useEffect, useMemo, useState} from 'react';
import {
  AppBar,
  Box,
  Container,
  CssBaseline,
  Link,
  Tab,
  Tabs,
  ThemeProvider,
  Toolbar,
} from '@mui/material';
import {InventarioView} from './components/InventarioView';
import {type ErroresMovimiento, MovimientosView} from './components/MovimientosView';
import {type ErroresNuevoProducto, NuevoProductoView} from './components/NuevoProductoView';
import {supabase} from './supabase';
import {PALETA, theme} from './theme';
import {
  type Categoria,
  type Movimiento,
  type OrdenTabla,
  type ProductoVista,
  type TipoMovimiento,
  type Vista,
} from './types';

export default function App() {
  const [vista, setVista] = useState<Vista>('inventario');
  const [productos, setProductos] = useState<ProductoVista[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [totalMovimientos, setTotalMovimientos] = useState<number>(0);
  const [cargando, setCargando] = useState<boolean>(true);
  const [errorSupabase, setErrorSupabase] = useState<string | null>(null);

  const [busqueda, setBusqueda] = useState<string>('');
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>('todas');
  const [soloStockBajo, setSoloStockBajo] = useState<boolean>(false);
  const [ordenTabla, setOrdenTabla] = useState<OrdenTabla>('nombre-asc');

  const [nuevoNombre, setNuevoNombre] = useState<string>('');
  const [nuevaCategoriaId, setNuevaCategoriaId] = useState<string>('');
  const [nuevoPrecio, setNuevoPrecio] = useState<string>('');
  const [nuevoStockMinimo, setNuevoStockMinimo] = useState<string>('');
  const [erroresFormulario, setErroresFormulario] = useState<ErroresNuevoProducto>({});
  const [guardandoProducto, setGuardandoProducto] = useState<boolean>(false);
  const [errorGuardarProducto, setErrorGuardarProducto] = useState<string | null>(null);

  const [movimientos, setMovimientos] = useState<Movimiento[]>([]);
  const [cargandoMovimientos, setCargandoMovimientos] = useState<boolean>(true);
  const [errorCargarMovimientos, setErrorCargarMovimientos] = useState<string | null>(null);

  const [movProductoId, setMovProductoId] = useState<string>('');
  const [movTipo, setMovTipo] = useState<TipoMovimiento | null>(null);
  const [movCantidad, setMovCantidad] = useState<string>('');
  const [movNota, setMovNota] = useState<string>('');
  const [erroresMovimiento, setErroresMovimiento] = useState<ErroresMovimiento>({});
  const [registrandoMovimiento, setRegistrandoMovimiento] = useState<boolean>(false);
  const [errorRegistrarMovimiento, setErrorRegistrarMovimiento] = useState<string | null>(null);

  const cargarInventario = useCallback(async () => {
    setCargando(true);
    setErrorSupabase(null);

    try {
      const [resProductos, resCategorias, resMovimientos] = await Promise.all([
        supabase
          .from('vista_productos')
          .select(
            'id, nombre, categoria, categoria_id, precio, stock_actual, stock_minimo, stock_bajo',
          )
          .order('nombre', {ascending: true}),
        supabase.from('categorias').select('id, nombre').order('nombre', {ascending: true}),
        supabase.from('movimientos').select('id', {count: 'exact', head: true}),
      ]);

      if (resProductos.error) {
        setErrorSupabase(resProductos.error.message);
        return;
      }
      if (resCategorias.error) {
        setErrorSupabase(resCategorias.error.message);
        return;
      }
      if (resMovimientos.error) {
        setErrorSupabase(resMovimientos.error.message);
        return;
      }

      setProductos((resProductos.data as ProductoVista[]) ?? []);
      setCategorias((resCategorias.data as Categoria[]) ?? []);
      setTotalMovimientos(resMovimientos.count ?? 0);
    } catch (err) {
      const mensaje =
        err instanceof Error ? err.message : 'Error desconocido al conectar con Supabase.';
      setErrorSupabase(mensaje);
    } finally {
      setCargando(false);
    }
  }, []);

  const cargarMovimientos = useCallback(async () => {
    setCargandoMovimientos(true);
    setErrorCargarMovimientos(null);

    try {
      const {data, error} = await supabase
        .from('movimientos')
        .select('id, producto_id, tipo, cantidad, nota, creado_en')
        .order('creado_en', {ascending: false})
        .order('id', {ascending: false});

      if (error) {
        setErrorCargarMovimientos(error.message);
        return;
      }

      setMovimientos((data as Movimiento[]) ?? []);
    } catch (err) {
      const mensaje =
        err instanceof Error ? err.message : 'Error desconocido al cargar los movimientos.';
      setErrorCargarMovimientos(mensaje);
    } finally {
      setCargandoMovimientos(false);
    }
  }, []);

  useEffect(() => {
    void cargarInventario();
    void cargarMovimientos();
  }, [cargarInventario, cargarMovimientos]);

  const totalProductos = productos.length;
  const totalStockBajo = useMemo(
    () => productos.filter((producto) => producto.stock_bajo).length,
    [productos],
  );

  const productosFiltrados = useMemo(() => {
    const termino = busqueda.trim().toLowerCase();
    const filtrados = productos.filter((producto) => {
      const coincideNombre =
        termino === '' || producto.nombre.toLowerCase().includes(termino);
      const coincideCategoria =
        categoriaFiltro === 'todas' || String(producto.categoria_id) === categoriaFiltro;
      const coincideStockBajo = !soloStockBajo || producto.stock_bajo;
      return coincideNombre && coincideCategoria && coincideStockBajo;
    });

    return [...filtrados].sort((a, b) => {
      switch (ordenTabla) {
        case 'stock-asc':
          return a.stock_actual - b.stock_actual || a.nombre.localeCompare(b.nombre, 'es');
        case 'stock-desc':
          return b.stock_actual - a.stock_actual || a.nombre.localeCompare(b.nombre, 'es');
        case 'estado-bajo-primero':
          if (a.stock_bajo !== b.stock_bajo) {
            return a.stock_bajo ? -1 : 1;
          }
          return a.stock_actual - b.stock_actual || a.nombre.localeCompare(b.nombre, 'es');
        case 'estado-ok-primero':
          if (a.stock_bajo !== b.stock_bajo) {
            return a.stock_bajo ? 1 : -1;
          }
          return a.nombre.localeCompare(b.nombre, 'es');
        default:
          return a.nombre.localeCompare(b.nombre, 'es');
      }
    });
  }, [productos, busqueda, categoriaFiltro, soloStockBajo, ordenTabla]);

  const hayFiltrosActivos =
    busqueda.trim() !== '' || categoriaFiltro !== 'todas' || soloStockBajo;

  const limpiarFiltros = () => {
    setBusqueda('');
    setCategoriaFiltro('todas');
    setSoloStockBajo(false);
  };

  const alternarOrdenStock = () => {
    setOrdenTabla((prev) => (prev === 'stock-asc' ? 'stock-desc' : 'stock-asc'));
  };

  const alternarOrdenEstado = () => {
    setOrdenTabla((prev) =>
      prev === 'estado-bajo-primero' ? 'estado-ok-primero' : 'estado-bajo-primero',
    );
  };

  const abrirNuevoProducto = () => {
    setNuevoNombre('');
    setNuevaCategoriaId('');
    setNuevoPrecio('');
    setNuevoStockMinimo('');
    setErroresFormulario({});
    setErrorGuardarProducto(null);
    setVista('nuevo-producto');
  };

  const manejarGuardarProducto = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorGuardarProducto(null);

    const nuevosErrores: ErroresNuevoProducto = {};

    const nombreLimpio = nuevoNombre.trim();
    if (!nombreLimpio) {
      nuevosErrores.nombre = 'Escribe el nombre del producto para poder guardarlo.';
    }

    if (!nuevaCategoriaId) {
      nuevosErrores.categoria = 'Elige una categoría de la lista.';
    }

    const precioTexto = nuevoPrecio.trim();
    const precioNumero = Number(precioTexto);
    if (precioTexto === '') {
      nuevosErrores.precio = 'Escribe el precio de venta en pesos.';
    } else if (!Number.isInteger(precioNumero) || precioNumero <= 0) {
      nuevosErrores.precio =
        'Escribe el precio como un número entero mayor que 0, sin puntos ni decimales.';
    }

    const stockMinTexto = nuevoStockMinimo.trim();
    const stockMinNumero = Number(stockMinTexto);
    if (stockMinTexto === '') {
      nuevosErrores.stockMinimo = 'Escribe el stock mínimo para activar alertas.';
    } else if (!Number.isInteger(stockMinNumero) || stockMinNumero < 0) {
      nuevosErrores.stockMinimo =
        'Escribe el stock mínimo como un número entero igual o mayor que 0.';
    }

    if (Object.keys(nuevosErrores).length > 0) {
      setErroresFormulario(nuevosErrores);
      return;
    }

    setErroresFormulario({});
    setGuardandoProducto(true);

    try {
      const {error} = await supabase.from('productos').insert({
        nombre: nombreLimpio,
        categoria_id: Number(nuevaCategoriaId),
        precio: precioNumero,
        stock_actual: 0,
        stock_minimo: stockMinNumero,
      });

      if (error) {
        setErrorGuardarProducto(error.message);
        return;
      }

      setVista('inventario');
      await cargarInventario();
    } catch (err) {
      const mensaje =
        err instanceof Error ? err.message : 'Error desconocido al guardar el producto.';
      setErrorGuardarProducto(mensaje);
    } finally {
      setGuardandoProducto(false);
    }
  };

  const productosPorId = useMemo(() => {
    const mapa = new Map<number, ProductoVista>();
    for (const producto of productos) {
      mapa.set(producto.id, producto);
    }
    return mapa;
  }, [productos]);

  const manejarRegistrarMovimiento = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorRegistrarMovimiento(null);

    const nuevosErrores: ErroresMovimiento = {};

    if (!movProductoId) {
      nuevosErrores.producto = 'Elige un producto de la lista.';
    }

    if (!movTipo) {
      nuevosErrores.tipo = 'Elige si el movimiento es entrada o salida.';
    }

    const cantidadTexto = movCantidad.trim();
    const cantidadNumero = Number(cantidadTexto);
    if (cantidadTexto === '') {
      nuevosErrores.cantidad = 'Escribe la cantidad de unidades.';
    } else if (!Number.isInteger(cantidadNumero) || cantidadNumero <= 0) {
      nuevosErrores.cantidad = 'Escribe una cantidad entera mayor que 0.';
    }

    if (Object.keys(nuevosErrores).length > 0 || !movTipo) {
      setErroresMovimiento(nuevosErrores);
      return;
    }

    setErroresMovimiento({});
    setRegistrandoMovimiento(true);

    try {
      const {error} = await supabase.from('movimientos').insert({
        producto_id: Number(movProductoId),
        tipo: movTipo,
        cantidad: cantidadNumero,
        nota: movNota.trim() || null,
      });

      if (error) {
        setErrorRegistrarMovimiento(error.message);
        return;
      }

      setMovProductoId('');
      setMovTipo(null);
      setMovCantidad('');
      setMovNota('');
      setErroresMovimiento({});
      setErrorRegistrarMovimiento(null);

      await Promise.all([cargarInventario(), cargarMovimientos()]);
    } catch (err) {
      const mensaje =
        err instanceof Error ? err.message : 'Error desconocido al registrar el movimiento.';
      setErrorRegistrarMovimiento(mensaje);
    } finally {
      setRegistrandoMovimiento(false);
    }
  };

  const productoSeleccionadoMovimiento = movProductoId
    ? productosPorId.get(Number(movProductoId))
    : undefined;
  const cantidadMovimientoTrim = movCantidad.trim();
  const cantidadMovimientoNumero = Number(cantidadMovimientoTrim);
  const cantidadMovimientoValida =
    cantidadMovimientoTrim !== '' &&
    Number.isInteger(cantidadMovimientoNumero) &&
    cantidadMovimientoNumero > 0;
  const stockResultantePrevio =
    productoSeleccionadoMovimiento && movTipo && cantidadMovimientoValida
      ? movTipo === 'entrada'
        ? productoSeleccionadoMovimiento.stock_actual + cantidadMovimientoNumero
        : productoSeleccionadoMovimiento.stock_actual - cantidadMovimientoNumero
      : null;

  const pestanaActiva = vista === 'movimientos' ? 'movimientos' : 'inventario';

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{minHeight: '100vh', bgcolor: PALETA.honeydew, color: PALETA.ink}}>
        <AppBar
          position="sticky"
          sx={{
            bgcolor: PALETA.oxfordNavy,
            borderBottom: `3px solid ${PALETA.cerulean}`,
          }}
        >
          <Container
            maxWidth={false}
            disableGutters
            sx={{maxWidth: 1320, mx: 'auto', px: {xs: 2, sm: 3}}}
          >
            <Toolbar
              disableGutters
              sx={{
                minHeight: {xs: 56, sm: 64},
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: {xs: 2, sm: 4},
              }}
            >
              <Link
                href="#inventario"
                underline="none"
                onClick={(e) => {
                  e.preventDefault();
                  setVista('inventario');
                }}
                sx={{
                  fontFamily: 'var(--font-display)',
                  fontSize: {xs: '1.05rem', sm: '1.3rem'},
                  fontWeight: 700,
                  letterSpacing: '-0.02em',
                  color: '#FFFFFF',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                  py: 1,
                }}
              >
                Tienda La Esquina
              </Link>

              <Tabs
                value={pestanaActiva}
                onChange={(_, nuevaVista: 'inventario' | 'movimientos') => setVista(nuevaVista)}
                aria-label="Navegación principal"
                slotProps={{
                  indicator: {
                    sx: {
                      height: 4,
                      bgcolor: PALETA.frostedBlue,
                    },
                  },
                }}
                sx={{
                  minHeight: {xs: 56, sm: 64},
                  '& .MuiTab-root': {
                    minHeight: {xs: 56, sm: 64},
                    minWidth: 'auto',
                    px: {xs: 1.5, sm: 2.5},
                    color: '#D7E8EA',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    whiteSpace: 'nowrap',
                    '&.Mui-selected': {
                      color: PALETA.frostedBlue,
                      fontWeight: 700,
                    },
                    '&:hover': {
                      color: '#FFFFFF',
                    },
                  },
                }}
              >
                <Tab label="Inventario" value="inventario" />
                <Tab label="Movimientos" value="movimientos" />
              </Tabs>
            </Toolbar>
          </Container>
        </AppBar>

        <Container
          component="main"
          maxWidth={false}
          sx={{
            maxWidth: 1320,
            mx: 'auto',
            px: {xs: 2, sm: 3},
            py: {xs: 4, sm: 5},
          }}
        >
          {vista === 'inventario' ? (
            <InventarioView
              productos={productos}
              productosFiltrados={productosFiltrados}
              categorias={categorias}
              totalProductos={totalProductos}
              totalStockBajo={totalStockBajo}
              totalMovimientos={totalMovimientos}
              cargando={cargando}
              errorSupabase={errorSupabase}
              busqueda={busqueda}
              categoriaFiltro={categoriaFiltro}
              soloStockBajo={soloStockBajo}
              ordenTabla={ordenTabla}
              hayFiltrosActivos={hayFiltrosActivos}
              onBusquedaChange={setBusqueda}
              onCategoriaFiltroChange={setCategoriaFiltro}
              onToggleSoloStockBajo={() => setSoloStockBajo((prev) => !prev)}
              onOrdenTablaChange={setOrdenTabla}
              onAlternarOrdenStock={alternarOrdenStock}
              onAlternarOrdenEstado={alternarOrdenEstado}
              onLimpiarFiltros={limpiarFiltros}
              onAbrirNuevoProducto={abrirNuevoProducto}
              onRecargarInventario={() => void cargarInventario()}
            />
          ) : vista === 'nuevo-producto' ? (
            <NuevoProductoView
              categorias={categorias}
              nuevoNombre={nuevoNombre}
              nuevaCategoriaId={nuevaCategoriaId}
              nuevoPrecio={nuevoPrecio}
              nuevoStockMinimo={nuevoStockMinimo}
              erroresFormulario={erroresFormulario}
              guardandoProducto={guardandoProducto}
              errorGuardarProducto={errorGuardarProducto}
              onNombreChange={(valor) => {
                setNuevoNombre(valor);
                if (erroresFormulario.nombre) {
                  setErroresFormulario((prev) => ({...prev, nombre: undefined}));
                }
              }}
              onCategoriaChange={(valor) => {
                setNuevaCategoriaId(valor);
                if (erroresFormulario.categoria) {
                  setErroresFormulario((prev) => ({...prev, categoria: undefined}));
                }
              }}
              onPrecioChange={(valor) => {
                setNuevoPrecio(valor);
                if (erroresFormulario.precio) {
                  setErroresFormulario((prev) => ({...prev, precio: undefined}));
                }
              }}
              onStockMinimoChange={(valor) => {
                setNuevoStockMinimo(valor);
                if (erroresFormulario.stockMinimo) {
                  setErroresFormulario((prev) => ({...prev, stockMinimo: undefined}));
                }
              }}
              onCancelar={() => setVista('inventario')}
              onSubmit={(e) => void manejarGuardarProducto(e)}
            />
          ) : (
            <MovimientosView
              productos={productos}
              productosPorId={productosPorId}
              movimientos={movimientos}
              cargandoMovimientos={cargandoMovimientos}
              errorCargarMovimientos={errorCargarMovimientos}
              movProductoId={movProductoId}
              movTipo={movTipo}
              movCantidad={movCantidad}
              movNota={movNota}
              erroresMovimiento={erroresMovimiento}
              registrandoMovimiento={registrandoMovimiento}
              errorRegistrarMovimiento={errorRegistrarMovimiento}
              productoSeleccionado={productoSeleccionadoMovimiento}
              stockResultantePrevio={stockResultantePrevio}
              onProductoChange={(valor) => {
                setMovProductoId(valor);
                if (erroresMovimiento.producto) {
                  setErroresMovimiento((prev) => ({...prev, producto: undefined}));
                }
                if (errorRegistrarMovimiento) {
                  setErrorRegistrarMovimiento(null);
                }
              }}
              onTipoChange={(valor) => {
                setMovTipo(valor);
                if (erroresMovimiento.tipo) {
                  setErroresMovimiento((prev) => ({...prev, tipo: undefined}));
                }
                if (errorRegistrarMovimiento) {
                  setErrorRegistrarMovimiento(null);
                }
              }}
              onCantidadChange={(valor) => {
                setMovCantidad(valor);
                if (erroresMovimiento.cantidad) {
                  setErroresMovimiento((prev) => ({...prev, cantidad: undefined}));
                }
                if (errorRegistrarMovimiento) {
                  setErrorRegistrarMovimiento(null);
                }
              }}
              onNotaChange={setMovNota}
              onSubmit={(e) => void manejarRegistrarMovimiento(e)}
              onRecargarMovimientos={() => void cargarMovimientos()}
            />
          )}
        </Container>
      </Box>
    </ThemeProvider>
  );
}
