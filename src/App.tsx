import {useCallback, useEffect, useMemo, useState} from 'react';
import {AlertCircle, Plus, Search} from 'lucide-react';
import {supabase} from './supabase';

type Vista = 'inventario' | 'movimientos';

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

function formatearPrecio(valor: number): string {
  const entero = Math.trunc(valor);
  const conPuntos = entero.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `$${conPuntos}`;
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

  useEffect(() => {
    void cargarInventario();
  }, [cargarInventario]);

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

  return (
    <div className="min-h-screen bg-[#F6F7F4] text-[#18221D]">
      <header className="sticky top-0 z-10 border-b border-[#D8DDD4] bg-[#FFFFFF]">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-8 px-4 sm:px-6">
          <a
            href="#inventario"
            onClick={(e) => {
              e.preventDefault();
              setVista('inventario');
            }}
            className="font-display py-4 text-lg font-bold tracking-tight text-[#18221D] whitespace-nowrap shrink-0 sm:text-xl"
          >
            Tienda La Esquina
          </a>

          <nav aria-label="Navegación principal" className="flex items-center gap-6 sm:gap-8">
            <button
              type="button"
              onClick={() => setVista('inventario')}
              aria-current={vista === 'inventario' ? 'page' : undefined}
              className={`min-h-[44px] border-b-2 px-1 py-4 text-sm font-semibold whitespace-nowrap shrink-0 transition-colors duration-150 ${
                vista === 'inventario'
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
              className={`min-h-[44px] border-b-2 px-1 py-4 text-sm font-semibold whitespace-nowrap shrink-0 transition-colors duration-150 ${
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
                onClick={() => {}}
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
                        className="inline-flex min-h-[40px] items-center rounded-md bg-[#B91C1C] px-4 py-2 text-sm font-medium text-[#FFFFFF] whitespace-nowrap shrink-0 transition-colors duration-150 hover:bg-[#991B1B]"
                      >
                        Reintentar
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
                  className="min-h-[44px] w-full rounded-md border border-[#D8DDD4] bg-[#FFFFFF] pr-3 pl-9 text-sm text-[#18221D] placeholder:text-[#526058] focus:border-[#166534] focus:outline-none"
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
                  className="min-h-[44px] w-full rounded-md border border-[#D8DDD4] bg-[#FFFFFF] px-3 py-2 text-sm text-[#18221D] focus:border-[#166534] focus:outline-none"
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
                    Todavía no hay productos registrados en el inventario.
                  </p>
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
                        className="inline-flex min-h-[40px] items-center rounded-md border border-[#D8DDD4] bg-[#FFFFFF] px-4 py-2 text-sm font-medium text-[#18221D] whitespace-nowrap shrink-0 transition-colors duration-150 hover:border-[#18221D]"
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
        ) : (
          <section aria-labelledby="titulo-movimientos">
            <div className="pb-6">
              <h1
                id="titulo-movimientos"
                className="font-display text-2xl font-bold tracking-tight text-[#18221D] sm:text-3xl"
              >
                Movimientos
              </h1>
              <p className="mt-1 max-w-prose text-sm text-[#526058] sm:text-base">
                Registro de entradas y salidas de mercancía.
              </p>
            </div>

            <div className="border border-[#D8DDD4] bg-[#FFFFFF]">
              <div className="border-b-4 border-double border-[#18221D] px-5 py-4 sm:px-6">
                <h2 className="font-display text-base font-semibold text-[#18221D] sm:text-lg">
                  Cuaderno de entradas y salidas
                </h2>
              </div>
              <div className="px-5 py-10 sm:px-6">
                <p className="max-w-prose text-sm text-[#526058] sm:text-base">
                  Este es el esqueleto inicial de la aplicación. En los próximos pasos se habilitará
                  el formulario de entradas y salidas junto con el historial completo.
                </p>
                <div className="mt-5">
                  <button
                    type="button"
                    onClick={() => setVista('inventario')}
                    className="inline-flex min-h-[44px] items-center rounded-md bg-[#166534] px-5 py-2 text-sm font-medium text-[#FFFFFF] whitespace-nowrap shrink-0 transition-colors duration-150 hover:bg-[#14532D]"
                  >
                    Volver a Inventario
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
