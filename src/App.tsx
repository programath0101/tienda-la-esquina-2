import {useCallback, useEffect, useState} from 'react';
import {AlertCircle, RotateCw} from 'lucide-react';
import {supabase} from './supabase';

type Vista = 'inventario' | 'movimientos';

interface Categoria {
  id: number;
  nombre: string;
}

export default function App() {
  const [vista, setVista] = useState<Vista>('inventario');
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [errorSupabase, setErrorSupabase] = useState<string | null>(null);

  const cargarCategorias = useCallback(async () => {
    setCargando(true);
    setErrorSupabase(null);

    try {
      const {data, error} = await supabase
        .from('categorias')
        .select('id, nombre')
        .order('nombre', {ascending: true});

      if (error) {
        setErrorSupabase(error.message);
        setCategorias([]);
        return;
      }

      setCategorias(data ?? []);
    } catch (err) {
      const mensaje =
        err instanceof Error ? err.message : 'Error desconocido al conectar con Supabase.';
      setErrorSupabase(mensaje);
      setCategorias([]);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    void cargarCategorias();
  }, [cargarCategorias]);

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
                  Prueba de conexión con la base de datos: categorías registradas en la tienda.
                </p>
              </div>

              <button
                type="button"
                onClick={() => void cargarCategorias()}
                disabled={cargando}
                className="inline-flex min-h-[44px] items-center gap-2 rounded-md border border-[#D8DDD4] bg-[#FFFFFF] px-4 py-2 text-sm font-medium text-[#18221D] whitespace-nowrap shrink-0 transition-colors duration-150 hover:border-[#18221D] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <RotateCw
                  className={`h-4 w-4 ${cargando ? 'animate-spin' : ''}`}
                  aria-hidden="true"
                />
                Recargar categorías
              </button>
            </div>

            <div className="border border-[#D8DDD4] bg-[#FFFFFF]">
              <div className="border-b-4 border-double border-[#18221D] px-5 py-4 sm:px-6">
                <div className="flex items-center justify-between gap-4">
                  <h2 className="font-display text-base font-semibold text-[#18221D] sm:text-lg">
                    Categorías de la estantería
                  </h2>
                  {!cargando && !errorSupabase && (
                    <span className="font-mono text-sm text-[#526058] tabular-nums">
                      {categorias.length} {categorias.length === 1 ? 'categoría' : 'categorías'}
                    </span>
                  )}
                </div>
              </div>

              {errorSupabase ? (
                <div
                  role="alert"
                  className="m-5 border border-[#FCA5A5] bg-[#FEF2F2] p-4 text-[#991B1B] sm:m-6 sm:p-5"
                >
                  <div className="flex items-start gap-3">
                    <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-[#B91C1C]" aria-hidden="true" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-[#B91C1C]">
                        No se pudo conectar con la tabla categorias en Supabase.
                      </p>
                      <p className="mt-1 font-mono text-xs break-words text-[#991B1B]">
                        {errorSupabase}
                      </p>
                      <p className="mt-2 max-w-prose text-sm text-[#7F1D1D]">
                        Verifica tu conexión a internet o los permisos de lectura en Supabase y vuelve
                        a intentarlo.
                      </p>
                      <div className="mt-4">
                        <button
                          type="button"
                          onClick={() => void cargarCategorias()}
                          className="inline-flex min-h-[40px] items-center rounded-md bg-[#B91C1C] px-4 py-2 text-sm font-medium text-[#FFFFFF] whitespace-nowrap shrink-0 transition-colors duration-150 hover:bg-[#991B1B]"
                        >
                          Reintentar conexión
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : cargando ? (
                <div aria-busy="true" aria-label="Cargando categorías" className="divide-y divide-[#E5E9E2]">
                  {[0, 1, 2, 3].map((fila) => (
                    <div key={fila} className="flex h-12 items-center px-5 sm:px-6">
                      <div className="h-4 w-44 rounded bg-[#E5E9E2]" />
                    </div>
                  ))}
                </div>
              ) : categorias.length === 0 ? (
                <div className="px-5 py-10 text-center sm:px-6">
                  <p className="mx-auto max-w-md text-sm text-[#526058]">
                    La conexión funcionó, pero todavía no hay categorías en la tabla categorias.
                  </p>
                  <div className="mt-4">
                    <button
                      type="button"
                      onClick={() => void cargarCategorias()}
                      className="inline-flex min-h-[44px] items-center rounded-md bg-[#166534] px-5 py-2 text-sm font-medium text-[#FFFFFF] whitespace-nowrap shrink-0 transition-colors duration-150 hover:bg-[#14532D]"
                    >
                      Volver a consultar
                    </button>
                  </div>
                </div>
              ) : (
                <ul className="divide-y divide-[#E5E9E2]">
                  {categorias.map((categoria) => (
                    <li
                      key={categoria.id}
                      className="flex min-h-[44px] items-center justify-between gap-4 px-5 py-3 text-base font-medium text-[#18221D] sm:px-6"
                    >
                      <span>{categoria.nombre}</span>
                    </li>
                  ))}
                </ul>
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
                    Ver prueba en Inventario
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
