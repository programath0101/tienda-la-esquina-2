import {type FormEvent, useCallback, useEffect, useMemo, useState} from 'react';
import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  ChevronRight,
  Info,
  Plus,
  Search,
} from 'lucide-react';
import {supabase} from './supabase';

type Vista = 'inventario' | 'nuevo-producto' | 'movimientos';

interface Categoria {
  id: number;
  nombre: string;
}

interface ProductoVista {
  id: number;
  nombre: string;
  categoria: string;
  categoria_id: number;
  precio: number;
  stock_actual: number;
  stock_minimo: number;
  stock_bajo: boolean;
}

type TipoMovimiento = 'entrada' | 'salida';

interface Movimiento {
  id: number;
  producto_id: number;
  tipo: TipoMovimiento;
  cantidad: number;
  nota: string | null;
  creado_en: string;
}

function formatearPrecio(valor: number): string {
  const entero = Math.trunc(valor);
  const conPuntos = entero.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `$${conPuntos}`;
}

const MESES_CORTOS = [
  'ene',
  'feb',
  'mar',
  'abr',
  'may',
  'jun',
  'jul',
  'ago',
  'sep',
  'oct',
  'nov',
  'dic',
];

function formatearFechaMovimiento(iso: string): string {
  const fecha = new Date(iso);
  if (Number.isNaN(fecha.getTime())) {
    return iso;
  }

  const horas = String(fecha.getHours()).padStart(2, '0');
  const minutos = String(fecha.getMinutes()).padStart(2, '0');
  const horaTexto = `${horas}:${minutos}`;

  const ahora = new Date();
  const inicioHoy = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());
  const inicioAyer = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate() - 1);
  const inicioFecha = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate());

  if (inicioFecha.getTime() === inicioHoy.getTime()) {
    return `Hoy ${horaTexto}`;
  }
  if (inicioFecha.getTime() === inicioAyer.getTime()) {
    return `Ayer ${horaTexto}`;
  }

  const dia = fecha.getDate();
  const mes = MESES_CORTOS[fecha.getMonth()] ?? '';
  return `${dia} ${mes} ${horaTexto}`;
}

export default function App() {
  const [vista, setVista] = useState<Vista>('inventario');
  const [productos, setProductos] = useState<ProductoVista[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [totalMovimientos, setTotalMovimientos] = useState<number>(0);
  const [cargando, setCargando] = useState<boolean>(true);
  const [errorSupabase, setErrorSupabase] = useState<string | null>(null);

  const [busqueda, setBusqueda] = useState<string>('');
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>('todas');

  const [nuevoNombre, setNuevoNombre] = useState<string>('');
  const [nuevaCategoriaId, setNuevaCategoriaId] = useState<string>('');
  const [nuevoPrecio, setNuevoPrecio] = useState<string>('');
  const [nuevoStockMinimo, setNuevoStockMinimo] = useState<string>('');
  const [erroresFormulario, setErroresFormulario] = useState<{
    nombre?: string;
    categoria?: string;
    precio?: string;
    stockMinimo?: string;
  }>({});
  const [guardandoProducto, setGuardandoProducto] = useState<boolean>(false);
  const [errorGuardarProducto, setErrorGuardarProducto] = useState<string | null>(null);

  const [movimientos, setMovimientos] = useState<Movimiento[]>([]);
  const [cargandoMovimientos, setCargandoMovimientos] = useState<boolean>(true);
  const [errorCargarMovimientos, setErrorCargarMovimientos] = useState<string | null>(null);

  const [movProductoId, setMovProductoId] = useState<string>('');
  const [movTipo, setMovTipo] = useState<TipoMovimiento>('entrada');
  const [movCantidad, setMovCantidad] = useState<string>('');
  const [movNota, setMovNota] = useState<string>('');
  const [erroresMovimiento, setErroresMovimiento] = useState<{
    producto?: string;
    cantidad?: string;
  }>({});
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
    return productos.filter((producto) => {
      const coincideNombre =
        termino === '' || producto.nombre.toLowerCase().includes(termino);
      const coincideCategoria =
        categoriaFiltro === 'todas' || String(producto.categoria_id) === categoriaFiltro;
      return coincideNombre && coincideCategoria;
    });
  }, [productos, busqueda, categoriaFiltro]);

  const hayFiltrosActivos = busqueda.trim() !== '' || categoriaFiltro !== 'todas';

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

    const nuevosErrores: {
      nombre?: string;
      categoria?: string;
      precio?: string;
      stockMinimo?: string;
    } = {};

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

    const nuevosErrores: {
      producto?: string;
      cantidad?: string;
    } = {};

    if (!movProductoId) {
      nuevosErrores.producto = 'Elige un producto de la lista.';
    }

    const cantidadTexto = movCantidad.trim();
    const cantidadNumero = Number(cantidadTexto);
    if (cantidadTexto === '') {
      nuevosErrores.cantidad = 'Escribe la cantidad de unidades.';
    } else if (!Number.isInteger(cantidadNumero) || cantidadNumero <= 0) {
      nuevosErrores.cantidad = 'Escribe una cantidad entera mayor que 0.';
    }

    if (Object.keys(nuevosErrores).length > 0) {
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
      setMovTipo('entrada');
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

  return (
    <div className="min-h-screen bg-[#F6F7F4] text-[#18221D]">
      <header className="sticky top-0 z-10 border-b border-[#D8DDD4] bg-[#FFFFFF]">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 sm:gap-8 sm:px-6">
          <a
            href="#inventario"
            onClick={(e) => {
              e.preventDefault();
              setVista('inventario');
            }}
            className="font-display py-3 text-base font-bold tracking-tight text-[#18221D] whitespace-nowrap shrink-0 sm:py-4 sm:text-xl"
          >
            Tienda La Esquina
          </a>

          <nav aria-label="Navegación principal" className="flex items-center gap-4 sm:gap-8">
            <button
              type="button"
              onClick={() => setVista('inventario')}
              aria-current={
                vista === 'inventario' || vista === 'nuevo-producto' ? 'page' : undefined
              }
              className={`min-h-[44px] border-b-2 px-1 py-3 text-sm font-semibold whitespace-nowrap shrink-0 transition-colors duration-150 sm:py-4 ${
                vista === 'inventario' || vista === 'nuevo-producto'
                  ? 'border-[#166534] text-[#166534]'
                  : 'border-transparent text-[#526058] hover:text-[#18221D]'
              }`}
            >
              Inventario
            </button>
            <button
              type="button"
              onClick={() => setVista('movimientos')}
              aria-current={vista === 'movimientos' ? 'page' : undefined}
              className={`min-h-[44px] border-b-2 px-1 py-3 text-sm font-semibold whitespace-nowrap shrink-0 transition-colors duration-150 sm:py-4 ${
                vista === 'movimientos'
                  ? 'border-[#166534] text-[#166534]'
                  : 'border-transparent text-[#526058] hover:text-[#18221D]'
              }`}
            >
              Movimientos
            </button>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
        {vista === 'inventario' ? (
          <section aria-labelledby="titulo-inventario">
            <div className="flex flex-wrap items-end justify-between gap-4 pb-6">
              <div>
                <h1
                  id="titulo-inventario"
                  className="font-display text-2xl font-bold tracking-tight text-[#18221D] sm:text-3xl"
                >
                  Inventario
                </h1>
                <p className="mt-1 max-w-prose text-sm text-[#526058] sm:text-base">
                  Lo que hay en la tienda y lo que toca pedir.
                </p>
              </div>

              <button
                type="button"
                onClick={abrirNuevoProducto}
                className="inline-flex min-h-[44px] items-center gap-2 rounded-md bg-[#166534] px-4 py-2 text-sm font-medium text-[#FFFFFF] whitespace-nowrap shrink-0 transition-colors duration-150 hover:bg-[#14532D]"
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
                Nuevo producto
              </button>
            </div>

            {errorSupabase && (
              <div
                role="alert"
                className="mb-6 border border-[#FCA5A5] bg-[#FEF2F2] p-4 text-[#991B1B] sm:p-5"
              >
                <div className="flex items-start gap-3">
                  <AlertCircle
                    className="mt-0.5 h-5 w-5 shrink-0 text-[#B91C1C]"
                    aria-hidden="true"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-[#B91C1C]">
                      No se pudo cargar el inventario desde Supabase.
                    </p>
                    <p className="mt-1 font-mono text-xs break-words text-[#991B1B]">
                      {errorSupabase}
                    </p>
                    <p className="mt-2 max-w-prose text-sm text-[#7F1D1D]">
                      Revisa tu conexión a internet y vuelve a cargar los datos.
                    </p>
                    <div className="mt-4">
                      <button
                        type="button"
                        onClick={() => void cargarInventario()}
                        className="inline-flex min-h-[44px] items-center rounded-md bg-[#B91C1C] px-4 py-2 text-sm font-medium text-[#FFFFFF] whitespace-nowrap shrink-0 transition-colors duration-150 hover:bg-[#991B1B]"
                      >
                        Volver a cargar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="mb-6 grid grid-cols-1 divide-y divide-[#D8DDD4] border border-[#D8DDD4] bg-[#FFFFFF] sm:grid-cols-3 sm:divide-x sm:divide-y-0">
              <div className="px-5 py-4 sm:px-6 sm:py-5">
                <p className="text-sm font-medium text-[#526058]">Productos</p>
                {cargando ? (
                  <div className="mt-2 h-8 w-14 rounded bg-[#E5E9E2]" />
                ) : (
                  <p className="font-mono mt-1 text-2xl font-medium text-[#18221D] tabular-nums sm:text-3xl">
                    {totalProductos}
                  </p>
                )}
              </div>

              <div
                className={`px-5 py-4 sm:px-6 sm:py-5 ${
                  !cargando && totalStockBajo > 0 ? 'bg-[#FEF2F2]' : ''
                }`}
              >
                <p
                  className={`text-sm font-medium ${
                    !cargando && totalStockBajo > 0 ? 'text-[#991B1B]' : 'text-[#526058]'
                  }`}
                >
                  Con stock bajo
                </p>
                {cargando ? (
                  <div className="mt-2 h-8 w-14 rounded bg-[#E5E9E2]" />
                ) : (
                  <p
                    className={`font-mono mt-1 text-2xl font-medium tabular-nums sm:text-3xl ${
                      totalStockBajo > 0 ? 'text-[#B91C1C]' : 'text-[#18221D]'
                    }`}
                  >
                    {totalStockBajo}
                  </p>
                )}
              </div>

              <div className="px-5 py-4 sm:px-6 sm:py-5">
                <p className="text-sm font-medium text-[#526058]">Movimientos registrados</p>
                {cargando ? (
                  <div className="mt-2 h-8 w-14 rounded bg-[#E5E9E2]" />
                ) : (
                  <p className="font-mono mt-1 text-2xl font-medium text-[#18221D] tabular-nums sm:text-3xl">
                    {totalMovimientos}
                  </p>
                )}
              </div>
            </div>

            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative flex-1 sm:max-w-xs">
                <label htmlFor="buscar-producto" className="sr-only">
                  Buscar por nombre
                </label>
                <Search
                  className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[#526058]"
                  aria-hidden="true"
                />
                <input
                  id="buscar-producto"
                  type="search"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  placeholder="Buscar por nombre..."
                  className="min-h-[44px] w-full rounded-md border border-[#D8DDD4] bg-[#FFFFFF] pr-3 pl-9 text-sm text-[#18221D] placeholder:text-[#526058] focus:border-[#166534] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#166534]"
                />
              </div>

              <div className="sm:w-56">
                <label htmlFor="filtro-categoria" className="sr-only">
                  Filtrar por categoría
                </label>
                <select
                  id="filtro-categoria"
                  value={categoriaFiltro}
                  onChange={(e) => setCategoriaFiltro(e.target.value)}
                  className="min-h-[44px] w-full rounded-md border border-[#D8DDD4] bg-[#FFFFFF] px-3 py-2 text-sm text-[#18221D] focus:border-[#166534] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#166534]"
                >
                  <option value="todas">Todas las categorías</option>
                  {categorias.map((categoria) => (
                    <option key={categoria.id} value={String(categoria.id)}>
                      {categoria.nombre}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="border border-[#D8DDD4] bg-[#FFFFFF]">
              <div className="flex items-center justify-between gap-4 border-b-4 border-double border-[#18221D] px-5 py-3.5 sm:px-6">
                <h2 className="font-display text-base font-semibold text-[#18221D]">
                  Lista de productos
                </h2>
                {!cargando && (
                  <span className="font-mono text-xs text-[#526058] tabular-nums">
                    {productosFiltrados.length}{' '}
                    {productosFiltrados.length === 1 ? 'producto' : 'productos'}
                  </span>
                )}
              </div>

              {cargando ? (
                <div
                  aria-busy="true"
                  aria-label="Cargando productos"
                  className="divide-y divide-[#E5E9E2]"
                >
                  {[0, 1, 2, 3, 4].map((fila) => (
                    <div
                      key={fila}
                      className="flex min-h-[44px] items-center justify-between gap-4 px-5 py-3 sm:px-6"
                    >
                      <div className="h-4 w-40 rounded bg-[#E5E9E2]" />
                      <div className="h-4 w-24 rounded bg-[#E5E9E2]" />
                    </div>
                  ))}
                </div>
              ) : productos.length === 0 ? (
                <div className="px-5 py-10 text-center sm:px-6">
                  <p className="mx-auto max-w-md text-sm text-[#526058]">
                    Todavía no hay productos registrados en la tienda. Crea el primero para empezar a
                    llevar las cuentas.
                  </p>
                  <div className="mt-4">
                    <button
                      type="button"
                      onClick={abrirNuevoProducto}
                      className="inline-flex min-h-[44px] items-center gap-2 rounded-md bg-[#166534] px-4 py-2 text-sm font-medium text-[#FFFFFF] whitespace-nowrap shrink-0 transition-colors duration-150 hover:bg-[#14532D]"
                    >
                      <Plus className="h-4 w-4" aria-hidden="true" />
                      Nuevo producto
                    </button>
                  </div>
                </div>
              ) : productosFiltrados.length === 0 ? (
                <div className="px-5 py-10 text-center sm:px-6">
                  <p className="mx-auto max-w-md text-sm text-[#526058]">
                    Ningún producto coincide con tu búsqueda o categoría seleccionada.
                  </p>
                  {hayFiltrosActivos && (
                    <div className="mt-4">
                      <button
                        type="button"
                        onClick={() => {
                          setBusqueda('');
                          setCategoriaFiltro('todas');
                        }}
                        className="inline-flex min-h-[44px] items-center rounded-md border border-[#D8DDD4] bg-[#FFFFFF] px-4 py-2 text-sm font-medium text-[#18221D] whitespace-nowrap shrink-0 transition-colors duration-150 hover:border-[#18221D]"
                      >
                        Limpiar filtros
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <div className="hidden overflow-x-auto md:block">
                    <table className="w-full border-collapse text-left">
                      <thead>
                        <tr className="border-b border-[#D8DDD4] bg-[#F6F7F4]/60 text-xs font-semibold text-[#526058]">
                          <th scope="col" className="px-6 py-3">
                            Producto
                          </th>
                          <th scope="col" className="px-4 py-3">
                            Categoría
                          </th>
                          <th scope="col" className="px-4 py-3 text-right">
                            Precio
                          </th>
                          <th scope="col" className="px-4 py-3 text-right">
                            Stock
                          </th>
                          <th scope="col" className="px-4 py-3 text-right">
                            Mínimo
                          </th>
                          <th scope="col" className="px-6 py-3 text-right">
                            Estado
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E5E9E2] text-sm">
                        {productosFiltrados.map((producto) => (
                          <tr
                            key={producto.id}
                            className="transition-colors duration-150 hover:bg-[#F6F7F4]/70"
                          >
                            <td className="px-6 py-3 font-medium text-[#18221D]">
                              {producto.nombre}
                            </td>
                            <td className="px-4 py-3 text-[#526058]">{producto.categoria}</td>
                            <td className="font-mono px-4 py-3 text-right text-[#18221D] tabular-nums">
                              {formatearPrecio(producto.precio)}
                            </td>
                            <td
                              className={`font-mono px-4 py-3 text-right font-medium tabular-nums ${
                                producto.stock_bajo ? 'text-[#B91C1C]' : 'text-[#18221D]'
                              }`}
                            >
                              {producto.stock_actual}
                            </td>
                            <td className="font-mono px-4 py-3 text-right text-[#526058] tabular-nums">
                              {producto.stock_minimo}
                            </td>
                            <td className="px-6 py-3 text-right whitespace-nowrap">
                              {producto.stock_bajo ? (
                                <span className="font-semibold text-[#B91C1C]">Stock bajo</span>
                              ) : (
                                <span className="font-medium text-[#166534]">OK</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <ul className="divide-y divide-[#E5E9E2] md:hidden">
                    {productosFiltrados.map((producto) => (
                      <li key={producto.id} className="px-5 py-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="font-medium text-[#18221D]">{producto.nombre}</p>
                            <p className="mt-0.5 text-sm text-[#526058]">{producto.categoria}</p>
                          </div>
                          {producto.stock_bajo ? (
                            <span className="shrink-0 text-sm font-semibold text-[#B91C1C]">
                              Stock bajo
                            </span>
                          ) : (
                            <span className="shrink-0 text-sm font-medium text-[#166534]">OK</span>
                          )}
                        </div>
                        <div className="mt-3 flex items-center justify-between gap-4 border-t border-[#E5E9E2] pt-2.5 text-sm">
                          <span className="font-mono font-medium text-[#18221D] tabular-nums">
                            {formatearPrecio(producto.precio)}
                          </span>
                          <div className="flex items-center gap-4 text-[#526058]">
                            <span>
                              Stock:{' '}
                              <strong
                                className={`font-mono font-medium tabular-nums ${
                                  producto.stock_bajo ? 'text-[#B91C1C]' : 'text-[#18221D]'
                                }`}
                              >
                                {producto.stock_actual}
                              </strong>
                            </span>
                            <span>
                              Mínimo:{' '}
                              <span className="font-mono tabular-nums">
                                {producto.stock_minimo}
                              </span>
                            </span>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          </section>
        ) : vista === 'nuevo-producto' ? (
          <section aria-labelledby="titulo-nuevo-producto">
            <nav aria-label="Ruta de navegación" className="mb-2 flex items-center gap-1.5 text-sm text-[#526058]">
              <button
                type="button"
                onClick={() => setVista('inventario')}
                className="hover:text-[#18221D] hover:underline"
              >
                Inventario
              </button>
              <ChevronRight className="h-4 w-4 shrink-0 text-[#526058]" aria-hidden="true" />
              <span className="font-medium text-[#18221D]">Nuevo producto</span>
            </nav>

            <div className="pb-6">
              <h1
                id="titulo-nuevo-producto"
                className="font-display text-2xl font-bold tracking-tight text-[#18221D] sm:text-3xl"
              >
                Nuevo producto
              </h1>
            </div>

            <div className="max-w-xl border border-[#D8DDD4] bg-[#FFFFFF]">
              <form onSubmit={(e) => void manejarGuardarProducto(e)} noValidate className="p-5 sm:p-6">
                <div className="space-y-5">
                  <div>
                    <label
                      htmlFor="nuevo-nombre"
                      className="block text-sm font-semibold text-[#18221D]"
                    >
                      Nombre <span className="text-[#B91C1C]">*</span>
                    </label>
                    <input
                      id="nuevo-nombre"
                      type="text"
                      value={nuevoNombre}
                      onChange={(e) => {
                        setNuevoNombre(e.target.value);
                        if (erroresFormulario.nombre) {
                          setErroresFormulario((prev) => ({...prev, nombre: undefined}));
                        }
                      }}
                      placeholder="Ej. Aceite 1 L"
                      aria-invalid={erroresFormulario.nombre ? 'true' : undefined}
                      aria-describedby={erroresFormulario.nombre ? 'error-nuevo-nombre' : undefined}
                      className={`mt-1.5 min-h-[44px] w-full rounded-md border bg-[#FFFFFF] px-3 py-2 text-sm text-[#18221D] placeholder:text-[#526058] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#166534] ${
                        erroresFormulario.nombre
                          ? 'border-[#B91C1C] focus:border-[#B91C1C]'
                          : 'border-[#D8DDD4] focus:border-[#166534]'
                      }`}
                    />
                    {erroresFormulario.nombre && (
                      <p id="error-nuevo-nombre" className="mt-1.5 text-sm text-[#B91C1C]">
                        {erroresFormulario.nombre}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="nuevo-categoria"
                      className="block text-sm font-semibold text-[#18221D]"
                    >
                      Categoría <span className="text-[#B91C1C]">*</span>
                    </label>
                    <select
                      id="nuevo-categoria"
                      value={nuevaCategoriaId}
                      onChange={(e) => {
                        setNuevaCategoriaId(e.target.value);
                        if (erroresFormulario.categoria) {
                          setErroresFormulario((prev) => ({...prev, categoria: undefined}));
                        }
                      }}
                      aria-invalid={erroresFormulario.categoria ? 'true' : undefined}
                      aria-describedby={
                        erroresFormulario.categoria ? 'error-nueva-categoria' : undefined
                      }
                      className={`mt-1.5 min-h-[44px] w-full rounded-md border bg-[#FFFFFF] px-3 py-2 text-sm text-[#18221D] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#166534] ${
                        erroresFormulario.categoria
                          ? 'border-[#B91C1C] focus:border-[#B91C1C]'
                          : 'border-[#D8DDD4] focus:border-[#166534]'
                      }`}
                    >
                      <option value="">Selecciona una categoría</option>
                      {categorias.map((categoria) => (
                        <option key={categoria.id} value={String(categoria.id)}>
                          {categoria.nombre}
                        </option>
                      ))}
                    </select>
                    {erroresFormulario.categoria && (
                      <p id="error-nueva-categoria" className="mt-1.5 text-sm text-[#B91C1C]">
                        {erroresFormulario.categoria}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="nuevo-precio"
                        className="block text-sm font-semibold text-[#18221D]"
                      >
                        Precio de venta <span className="text-[#B91C1C]">*</span>
                      </label>
                      <div className="relative mt-1.5">
                        <span
                          aria-hidden="true"
                          className="font-mono pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm text-[#526058]"
                        >
                          $
                        </span>
                        <input
                          id="nuevo-precio"
                          type="number"
                          min={1}
                          step={1}
                          inputMode="numeric"
                          value={nuevoPrecio}
                          onChange={(e) => {
                            setNuevoPrecio(e.target.value);
                            if (erroresFormulario.precio) {
                              setErroresFormulario((prev) => ({...prev, precio: undefined}));
                            }
                          }}
                          placeholder="12500"
                          aria-invalid={erroresFormulario.precio ? 'true' : undefined}
                          aria-describedby={
                            erroresFormulario.precio ? 'error-nuevo-precio' : undefined
                          }
                          className={`font-mono min-h-[44px] w-full rounded-md border bg-[#FFFFFF] pr-3 pl-7 text-sm text-[#18221D] tabular-nums placeholder:text-[#526058] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#166534] ${
                            erroresFormulario.precio
                              ? 'border-[#B91C1C] focus:border-[#B91C1C]'
                              : 'border-[#D8DDD4] focus:border-[#166534]'
                          }`}
                        />
                      </div>
                      {erroresFormulario.precio && (
                        <p id="error-nuevo-precio" className="mt-1.5 text-sm text-[#B91C1C]">
                          {erroresFormulario.precio}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="nuevo-stock-minimo"
                        className="block text-sm font-semibold text-[#18221D]"
                      >
                        Stock mínimo <span className="text-[#B91C1C]">*</span>
                      </label>
                      <input
                        id="nuevo-stock-minimo"
                        type="number"
                        min={0}
                        step={1}
                        inputMode="numeric"
                        value={nuevoStockMinimo}
                        onChange={(e) => {
                          setNuevoStockMinimo(e.target.value);
                          if (erroresFormulario.stockMinimo) {
                            setErroresFormulario((prev) => ({
                              ...prev,
                              stockMinimo: undefined,
                            }));
                          }
                        }}
                        placeholder="4"
                        aria-invalid={erroresFormulario.stockMinimo ? 'true' : undefined}
                        aria-describedby={
                          erroresFormulario.stockMinimo
                            ? 'error-nuevo-stock-minimo'
                            : 'ayuda-stock-minimo'
                        }
                        className={`font-mono mt-1.5 min-h-[44px] w-full rounded-md border bg-[#FFFFFF] px-3 py-2 text-sm text-[#18221D] tabular-nums placeholder:text-[#526058] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#166534] ${
                          erroresFormulario.stockMinimo
                            ? 'border-[#B91C1C] focus:border-[#B91C1C]'
                            : 'border-[#D8DDD4] focus:border-[#166534]'
                        }`}
                      />
                      {erroresFormulario.stockMinimo ? (
                        <p id="error-nuevo-stock-minimo" className="mt-1.5 text-sm text-[#B91C1C]">
                          {erroresFormulario.stockMinimo}
                        </p>
                      ) : (
                        <p id="ayuda-stock-minimo" className="mt-1.5 text-xs text-[#526058]">
                          Con este número o menos sale la alerta de stock bajo.
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 border border-[#D8DDD4] bg-[#F6F7F4] p-3.5 text-sm text-[#18221D]">
                    <Info
                      className="mt-0.5 h-4 w-4 shrink-0 text-[#166534]"
                      aria-hidden="true"
                    />
                    <p className="max-w-prose">
                      El producto empieza con stock 0. El stock solo cambia cuando registras una
                      entrada o una salida.
                    </p>
                  </div>

                  {errorGuardarProducto && (
                    <div
                      role="alert"
                      className="flex items-start gap-2.5 border border-[#FCA5A5] bg-[#FEF2F2] p-3.5 text-sm text-[#991B1B]"
                    >
                      <AlertCircle
                        className="mt-0.5 h-4 w-4 shrink-0 text-[#B91C1C]"
                        aria-hidden="true"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-[#B91C1C] break-words">
                          {errorGuardarProducto}
                        </p>
                        <p className="mt-1 text-xs text-[#7F1D1D]">
                          Revisa los datos del producto o tu conexión e intenta guardar de nuevo.
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center justify-end gap-3 border-t border-[#E5E9E2] pt-5">
                    <button
                      type="button"
                      onClick={() => setVista('inventario')}
                      disabled={guardandoProducto}
                      className="inline-flex min-h-[44px] items-center rounded-md border border-[#D8DDD4] bg-[#FFFFFF] px-4 py-2 text-sm font-medium text-[#18221D] whitespace-nowrap shrink-0 transition-colors duration-150 hover:border-[#18221D] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={guardandoProducto}
                      className="inline-flex min-h-[44px] items-center rounded-md bg-[#166534] px-5 py-2 text-sm font-medium text-[#FFFFFF] whitespace-nowrap shrink-0 transition-colors duration-150 hover:bg-[#14532D] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {guardandoProducto ? 'Guardando...' : 'Guardar producto'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </section>
        ) : (
          <section aria-labelledby="titulo-movimientos">
            <div className="pb-6">
              <h1
                id="titulo-movimientos"
                className="font-display text-2xl font-bold tracking-tight text-[#18221D] sm:text-3xl"
              >
                Registrar movimiento
              </h1>
              <p className="mt-1 max-w-prose text-sm text-[#526058] sm:text-base">
                Una entrada suma al stock; una salida resta.
              </p>
            </div>

            <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
              <div className="lg:col-span-5">
                <div className="border border-[#D8DDD4] bg-[#FFFFFF]">
                  <form
                    onSubmit={(e) => void manejarRegistrarMovimiento(e)}
                    noValidate
                    className="p-5 sm:p-6"
                  >
                    <div className="space-y-5">
                      <div>
                        <label
                          htmlFor="mov-producto"
                          className="block text-sm font-semibold text-[#18221D]"
                        >
                          Producto <span className="text-[#B91C1C]">*</span>
                        </label>
                        <select
                          id="mov-producto"
                          value={movProductoId}
                          onChange={(e) => {
                            setMovProductoId(e.target.value);
                            if (erroresMovimiento.producto) {
                              setErroresMovimiento((prev) => ({...prev, producto: undefined}));
                            }
                            if (errorRegistrarMovimiento) {
                              setErrorRegistrarMovimiento(null);
                            }
                          }}
                          aria-invalid={erroresMovimiento.producto ? 'true' : undefined}
                          aria-describedby={
                            erroresMovimiento.producto ? 'error-mov-producto' : undefined
                          }
                          className={`mt-1.5 min-h-[44px] w-full rounded-md border bg-[#FFFFFF] px-3 py-2 text-sm text-[#18221D] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#166534] ${
                            erroresMovimiento.producto
                              ? 'border-[#B91C1C] focus:border-[#B91C1C]'
                              : 'border-[#D8DDD4] focus:border-[#166534]'
                          }`}
                        >
                          <option value="">Selecciona un producto</option>
                          {productos.map((producto) => (
                            <option key={producto.id} value={String(producto.id)}>
                              {producto.nombre} (stock: {producto.stock_actual})
                            </option>
                          ))}
                        </select>
                        {erroresMovimiento.producto && (
                          <p id="error-mov-producto" className="mt-1.5 text-sm text-[#B91C1C]">
                            {erroresMovimiento.producto}
                          </p>
                        )}
                      </div>

                      <div>
                        <span className="block text-sm font-semibold text-[#18221D]">
                          Tipo <span className="text-[#B91C1C]">*</span>
                        </span>
                        <div
                          role="group"
                          aria-label="Tipo de movimiento"
                          className="mt-1.5 grid grid-cols-2 divide-x divide-[#D8DDD4] overflow-hidden rounded-md border border-[#D8DDD4]"
                        >
                          <button
                            type="button"
                            onClick={() => {
                              setMovTipo('entrada');
                              if (errorRegistrarMovimiento) {
                                setErrorRegistrarMovimiento(null);
                              }
                            }}
                            aria-pressed={movTipo === 'entrada'}
                            className={`inline-flex min-h-[44px] items-center justify-center gap-2 px-3 py-2 text-sm font-semibold whitespace-nowrap transition-colors duration-150 ${
                              movTipo === 'entrada'
                                ? 'bg-[#166534] text-[#FFFFFF]'
                                : 'bg-[#FFFFFF] text-[#526058] hover:text-[#18221D]'
                            }`}
                          >
                            <ArrowDown className="h-4 w-4 shrink-0" aria-hidden="true" />
                            Entrada
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setMovTipo('salida');
                              if (errorRegistrarMovimiento) {
                                setErrorRegistrarMovimiento(null);
                              }
                            }}
                            aria-pressed={movTipo === 'salida'}
                            className={`inline-flex min-h-[44px] items-center justify-center gap-2 px-3 py-2 text-sm font-semibold whitespace-nowrap transition-colors duration-150 ${
                              movTipo === 'salida'
                                ? 'bg-[#18221D] text-[#FFFFFF]'
                                : 'bg-[#FFFFFF] text-[#526058] hover:text-[#18221D]'
                            }`}
                          >
                            <ArrowUp className="h-4 w-4 shrink-0" aria-hidden="true" />
                            Salida
                          </button>
                        </div>
                      </div>

                      <div>
                        <label
                          htmlFor="mov-cantidad"
                          className="block text-sm font-semibold text-[#18221D]"
                        >
                          Cantidad <span className="text-[#B91C1C]">*</span>
                        </label>
                        <input
                          id="mov-cantidad"
                          type="number"
                          min={1}
                          step={1}
                          inputMode="numeric"
                          value={movCantidad}
                          onChange={(e) => {
                            setMovCantidad(e.target.value);
                            if (erroresMovimiento.cantidad) {
                              setErroresMovimiento((prev) => ({...prev, cantidad: undefined}));
                            }
                            if (errorRegistrarMovimiento) {
                              setErrorRegistrarMovimiento(null);
                            }
                          }}
                          placeholder="1"
                          aria-invalid={erroresMovimiento.cantidad ? 'true' : undefined}
                          aria-describedby={
                            erroresMovimiento.cantidad ? 'error-mov-cantidad' : undefined
                          }
                          className={`font-mono mt-1.5 min-h-[44px] w-full rounded-md border bg-[#FFFFFF] px-3 py-2 text-sm text-[#18221D] tabular-nums placeholder:text-[#526058] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#166534] ${
                            erroresMovimiento.cantidad
                              ? 'border-[#B91C1C] focus:border-[#B91C1C]'
                              : 'border-[#D8DDD4] focus:border-[#166534]'
                          }`}
                        />
                        {erroresMovimiento.cantidad && (
                          <p id="error-mov-cantidad" className="mt-1.5 text-sm text-[#B91C1C]">
                            {erroresMovimiento.cantidad}
                          </p>
                        )}
                      </div>

                      <div>
                        <label
                          htmlFor="mov-nota"
                          className="block text-sm font-semibold text-[#18221D]"
                        >
                          Nota <span className="font-normal text-[#526058]">(opcional)</span>
                        </label>
                        <input
                          id="mov-nota"
                          type="text"
                          value={movNota}
                          onChange={(e) => setMovNota(e.target.value)}
                          placeholder="Ej. Pedido al proveedor o ventas del día"
                          className="mt-1.5 min-h-[44px] w-full rounded-md border border-[#D8DDD4] bg-[#FFFFFF] px-3 py-2 text-sm text-[#18221D] placeholder:text-[#526058] focus:border-[#166534] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#166534]"
                        />
                      </div>

                      <div className="flex justify-end border-t border-[#E5E9E2] pt-5">
                        <button
                          type="submit"
                          disabled={registrandoMovimiento}
                          className="inline-flex min-h-[44px] items-center rounded-md bg-[#166534] px-5 py-2 text-sm font-medium text-[#FFFFFF] whitespace-nowrap shrink-0 transition-colors duration-150 hover:bg-[#14532D] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {registrandoMovimiento ? 'Registrando...' : 'Registrar'}
                        </button>
                      </div>
                    </div>
                  </form>
                </div>

                {errorRegistrarMovimiento && (
                  <div
                    role="alert"
                    className="mt-4 flex items-start gap-2.5 border border-[#FCA5A5] bg-[#FEF2F2] p-4 text-sm text-[#991B1B]"
                  >
                    <AlertCircle
                      className="mt-0.5 h-4 w-4 shrink-0 text-[#B91C1C]"
                      aria-hidden="true"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-[#B91C1C] break-words">
                        {errorRegistrarMovimiento}
                      </p>
                      <p className="mt-1 text-xs text-[#7F1D1D]">
                        Ajusta la cantidad o registra primero una entrada de mercancía.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="lg:col-span-7">
                <div className="border border-[#D8DDD4] bg-[#FFFFFF]">
                  <div className="flex items-center justify-between gap-4 border-b-4 border-double border-[#18221D] px-5 py-3.5 sm:px-6">
                    <h2 className="font-display text-base font-semibold text-[#18221D]">
                      Historial de movimientos
                    </h2>
                    {!cargandoMovimientos && !errorCargarMovimientos && (
                      <span className="font-mono text-xs text-[#526058] tabular-nums">
                        {movimientos.length}{' '}
                        {movimientos.length === 1 ? 'movimiento' : 'movimientos'}
                      </span>
                    )}
                  </div>

                  {errorCargarMovimientos ? (
                    <div
                      role="alert"
                      className="m-5 border border-[#FCA5A5] bg-[#FEF2F2] p-4 text-[#991B1B] sm:m-6"
                    >
                      <div className="flex items-start gap-3">
                        <AlertCircle
                          className="mt-0.5 h-5 w-5 shrink-0 text-[#B91C1C]"
                          aria-hidden="true"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-[#B91C1C]">
                            No se pudo cargar el historial de movimientos.
                          </p>
                          <p className="mt-1 font-mono text-xs break-words text-[#991B1B]">
                            {errorCargarMovimientos}
                          </p>
                          <p className="mt-2 text-sm text-[#7F1D1D]">
                            Revisa tu conexión a internet y vuelve a cargar el historial.
                          </p>
                          <div className="mt-3">
                            <button
                              type="button"
                              onClick={() => void cargarMovimientos()}
                              className="inline-flex min-h-[44px] items-center rounded-md bg-[#B91C1C] px-4 py-2 text-sm font-medium text-[#FFFFFF] whitespace-nowrap shrink-0 transition-colors duration-150 hover:bg-[#991B1B]"
                            >
                              Volver a cargar
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : cargandoMovimientos ? (
                    <div
                      aria-busy="true"
                      aria-label="Cargando historial de movimientos"
                      className="divide-y divide-[#E5E9E2]"
                    >
                      {[0, 1, 2, 3, 4].map((fila) => (
                        <div
                          key={fila}
                          className="flex min-h-[44px] items-center justify-between gap-4 px-5 py-3 sm:px-6"
                        >
                          <div className="h-4 w-36 rounded bg-[#E5E9E2]" />
                          <div className="h-4 w-20 rounded bg-[#E5E9E2]" />
                        </div>
                      ))}
                    </div>
                  ) : movimientos.length === 0 ? (
                    <div className="px-5 py-10 text-center sm:px-6">
                      <p className="mx-auto max-w-md text-sm text-[#526058]">
                        Todavía no hay movimientos registrados. Registra la primera entrada o salida
                        en el formulario.
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="hidden overflow-x-auto md:block">
                        <table className="w-full border-collapse text-left">
                          <thead>
                            <tr className="border-b border-[#D8DDD4] bg-[#F6F7F4]/60 text-xs font-semibold text-[#526058]">
                              <th scope="col" className="px-5 py-3">
                                Fecha
                              </th>
                              <th scope="col" className="px-4 py-3">
                                Producto
                              </th>
                              <th scope="col" className="px-4 py-3">
                                Tipo
                              </th>
                              <th scope="col" className="px-4 py-3 text-right">
                                Cant.
                              </th>
                              <th scope="col" className="px-5 py-3">
                                Nota
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#E5E9E2] text-sm">
                            {movimientos.map((mov) => {
                              const nombreProducto =
                                productosPorId.get(mov.producto_id)?.nombre ??
                                `Producto #${mov.producto_id}`;
                              return (
                                <tr
                                  key={mov.id}
                                  className="transition-colors duration-150 hover:bg-[#F6F7F4]/70"
                                >
                                  <td className="font-mono px-5 py-3 text-xs text-[#526058] whitespace-nowrap tabular-nums">
                                    {formatearFechaMovimiento(mov.creado_en)}
                                  </td>
                                  <td className="px-4 py-3 font-medium text-[#18221D]">
                                    {nombreProducto}
                                  </td>
                                  <td className="px-4 py-3 whitespace-nowrap">
                                    {mov.tipo === 'entrada' ? (
                                      <span className="font-semibold text-[#166534]">Entrada</span>
                                    ) : (
                                      <span className="font-semibold text-[#B91C1C]">Salida</span>
                                    )}
                                  </td>
                                  <td className="font-mono px-4 py-3 text-right font-medium text-[#18221D] tabular-nums">
                                    {mov.cantidad}
                                  </td>
                                  <td className="px-5 py-3 text-[#526058]">
                                    {mov.nota && mov.nota.trim() !== '' ? mov.nota : '—'}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>

                      <ul className="divide-y divide-[#E5E9E2] md:hidden">
                        {movimientos.map((mov) => {
                          const nombreProducto =
                            productosPorId.get(mov.producto_id)?.nombre ??
                            `Producto #${mov.producto_id}`;
                          return (
                            <li key={mov.id} className="px-5 py-4">
                              <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                  <p className="font-medium text-[#18221D]">{nombreProducto}</p>
                                  <p className="font-mono mt-0.5 text-xs text-[#526058] tabular-nums">
                                    {formatearFechaMovimiento(mov.creado_en)}
                                  </p>
                                </div>
                                <div className="shrink-0 text-right">
                                  <span
                                    className={`text-sm font-semibold ${
                                      mov.tipo === 'entrada' ? 'text-[#166534]' : 'text-[#B91C1C]'
                                    }`}
                                  >
                                    {mov.tipo === 'entrada' ? 'Entrada' : 'Salida'}
                                  </span>
                                  <p className="font-mono text-sm font-medium text-[#18221D] tabular-nums">
                                    {mov.cantidad}
                                  </p>
                                </div>
                              </div>
                              {mov.nota && mov.nota.trim() !== '' && (
                                <p className="mt-2 border-t border-[#E5E9E2] pt-2 text-sm text-[#526058]">
                                  {mov.nota}
                                </p>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    </>
                  )}
                </div>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
