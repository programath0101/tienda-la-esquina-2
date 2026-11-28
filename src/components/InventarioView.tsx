import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  ButtonBase,
  FormControl,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  TextField,
  Typography,
} from '@mui/material';
import {PALETA} from '../theme';
import {
  type Categoria,
  OPCIONES_ORDEN,
  type OrdenTabla,
  type ProductoVista,
  formatearPrecio,
} from '../types';
import {StockPedidoChart} from './StockPedidoChart';

interface InventarioViewProps {
  productos: ProductoVista[];
  productosFiltrados: ProductoVista[];
  categorias: Categoria[];
  totalProductos: number;
  totalStockBajo: number;
  totalMovimientos: number;
  cargando: boolean;
  errorSupabase: string | null;
  busqueda: string;
  categoriaFiltro: string;
  soloStockBajo: boolean;
  ordenTabla: OrdenTabla;
  hayFiltrosActivos: boolean;
  onBusquedaChange: (valor: string) => void;
  onCategoriaFiltroChange: (valor: string) => void;
  onToggleSoloStockBajo: () => void;
  onOrdenTablaChange: (valor: OrdenTabla) => void;
  onAlternarOrdenStock: () => void;
  onAlternarOrdenEstado: () => void;
  onLimpiarFiltros: () => void;
  onAbrirNuevoProducto: () => void;
  onRecargarInventario: () => void;
}

export function InventarioView({
  productos,
  productosFiltrados,
  categorias,
  totalProductos,
  totalStockBajo,
  totalMovimientos,
  cargando,
  errorSupabase,
  busqueda,
  categoriaFiltro,
  soloStockBajo,
  ordenTabla,
  hayFiltrosActivos,
  onBusquedaChange,
  onCategoriaFiltroChange,
  onToggleSoloStockBajo,
  onOrdenTablaChange,
  onAlternarOrdenStock,
  onAlternarOrdenEstado,
  onLimpiarFiltros,
  onAbrirNuevoProducto,
  onRecargarInventario,
}: InventarioViewProps) {
  const alertaStock = !cargando && totalStockBajo > 0;

  return (
    <Box component="section" aria-labelledby="titulo-inventario">
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          gap: 2,
          pb: 3,
        }}
      >
        <Box>
          <Typography
            id="titulo-inventario"
            variant="h1"
            sx={{fontSize: {xs: '1.65rem', sm: '2.1rem'}, lineHeight: 1.15}}
          >
            Inventario
          </Typography>
          <Typography
            variant="body1"
            sx={{
              mt: 0.75,
              maxWidth: '60ch',
              color: PALETA.inkMuted,
              fontSize: {xs: '0.9rem', sm: '1rem'},
            }}
          >
            Lo que hay en la tienda y lo que toca pedir.
          </Typography>
        </Box>

        <Button
          type="button"
          variant="contained"
          color="secondary"
          startIcon={<AddIcon />}
          onClick={onAbrirNuevoProducto}
          sx={{
            bgcolor: PALETA.frostedBlue,
            color: PALETA.oxfordNavy,
            fontWeight: 700,
            border: `1.5px solid ${PALETA.oxfordNavy}`,
            '&:hover': {
              bgcolor: PALETA.frostedBlueHover,
            },
          }}
        >
          Nuevo producto
        </Button>
      </Box>

      {errorSupabase && (
        <Alert
          severity="error"
          variant="outlined"
          sx={{
            mb: 3,
            bgcolor: PALETA.punchRedTint,
            borderColor: PALETA.punchRed,
            color: PALETA.ink,
            '& .MuiAlert-icon': {color: PALETA.punchRed},
          }}
        >
          <AlertTitle sx={{fontWeight: 700, color: PALETA.punchRedAccessible}}>
            No se pudo cargar el inventario desde Supabase.
          </AlertTitle>
          <Typography
            sx={{
              mt: 0.5,
              fontFamily: 'var(--font-mono)',
              fontSize: '0.75rem',
              wordBreak: 'break-word',
              color: PALETA.punchRedAccessible,
            }}
          >
            {errorSupabase}
          </Typography>
          <Typography sx={{mt: 1, fontSize: '0.875rem', color: PALETA.ink}}>
            Revisa tu conexión a internet y vuelve a cargar los datos.
          </Typography>
          <Box sx={{mt: 2}}>
            <Button
              type="button"
              variant="contained"
              color="error"
              onClick={onRecargarInventario}
            >
              Volver a cargar
            </Button>
          </Box>
        </Alert>
      )}

      <Box
        sx={{
          mb: 3,
          display: 'grid',
          gridTemplateColumns: {xs: '1fr', sm: 'repeat(3, 1fr)'},
          gap: 2,
        }}
      >
        <Paper
          sx={{
            p: {xs: 2.25, sm: 2.75},
            border: `1px solid ${PALETA.border}`,
            borderTop: `4px solid ${PALETA.oxfordNavy}`,
            bgcolor: PALETA.paper,
          }}
        >
          <Typography sx={{fontSize: '0.875rem', fontWeight: 600, color: PALETA.inkMuted}}>
            Productos
          </Typography>
          {cargando ? (
            <Skeleton variant="rounded" width={64} height={36} sx={{mt: 1}} />
          ) : (
            <Typography
              className="tabular-nums"
              sx={{
                mt: 0.75,
                fontFamily: 'var(--font-mono)',
                fontSize: {xs: '1.75rem', sm: '2rem'},
                fontWeight: 500,
                color: PALETA.ink,
                lineHeight: 1.15,
              }}
            >
              {totalProductos}
            </Typography>
          )}
        </Paper>

        <Paper
          sx={{
            overflow: 'hidden',
            border: soloStockBajo
              ? `2px solid ${PALETA.punchRed}`
              : `1px solid ${alertaStock ? PALETA.punchRedBorder : PALETA.border}`,
            borderTop: soloStockBajo
              ? `4px solid ${PALETA.punchRed}`
              : `4px solid ${alertaStock ? PALETA.punchRed : PALETA.cerulean}`,
            bgcolor: soloStockBajo || alertaStock ? PALETA.punchRedTint : PALETA.paper,
          }}
        >
          <ButtonBase
            type="button"
            onClick={onToggleSoloStockBajo}
            aria-pressed={soloStockBajo}
            sx={{
              width: '100%',
              minHeight: 44,
              p: {xs: 2.25, sm: 2.75},
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'stretch',
              textAlign: 'left',
              transition: 'background-color 150ms cubic-bezier(0.16, 1, 0.3, 1)',
              '&:hover': {
                bgcolor:
                  soloStockBajo || alertaStock ? '#FDE3E5' : PALETA.honeydewSoft,
              },
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 1,
              }}
            >
              <Typography
                sx={{
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color:
                    soloStockBajo || alertaStock ? PALETA.punchRedAccessible : PALETA.inkMuted,
                }}
              >
                Con stock bajo
              </Typography>
              <Typography
                sx={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: soloStockBajo ? PALETA.punchRedAccessible : PALETA.inkMuted,
                }}
              >
                {soloStockBajo ? 'Filtro activo' : 'Tocar para filtrar'}
              </Typography>
            </Box>

            {cargando ? (
              <Skeleton variant="rounded" width={72} height={36} sx={{mt: 1}} />
            ) : (
              <Box sx={{mt: 0.75, display: 'flex', alignItems: 'baseline', gap: 1.5}}>
                <Typography
                  className="tabular-nums"
                  sx={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: {xs: '1.75rem', sm: '2rem'},
                    fontWeight: 500,
                    lineHeight: 1.15,
                    color: totalStockBajo > 0 ? PALETA.punchRedAccessible : PALETA.ink,
                  }}
                >
                  {totalStockBajo}
                </Typography>
                <Typography
                  sx={{
                    fontSize: '0.875rem',
                    fontWeight: 700,
                    color:
                      totalStockBajo > 0 ? PALETA.punchRedAccessible : PALETA.ceruleanDark,
                  }}
                >
                  {totalStockBajo > 0 ? 'Stock bajo' : 'Al día'}
                </Typography>
              </Box>
            )}
          </ButtonBase>
        </Paper>

        <Paper
          sx={{
            p: {xs: 2.25, sm: 2.75},
            border: `1px solid ${PALETA.border}`,
            borderTop: `4px solid ${PALETA.cerulean}`,
            bgcolor: PALETA.paper,
          }}
        >
          <Typography sx={{fontSize: '0.875rem', fontWeight: 600, color: PALETA.inkMuted}}>
            Movimientos registrados
          </Typography>
          {cargando ? (
            <Skeleton variant="rounded" width={64} height={36} sx={{mt: 1}} />
          ) : (
            <Typography
              className="tabular-nums"
              sx={{
                mt: 0.75,
                fontFamily: 'var(--font-mono)',
                fontSize: {xs: '1.75rem', sm: '2rem'},
                fontWeight: 500,
                color: PALETA.ink,
                lineHeight: 1.15,
              }}
            >
              {totalMovimientos}
            </Typography>
          )}
        </Paper>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {xs: '1fr', lg: '5fr 7fr'},
          gap: 3,
          alignItems: 'start',
        }}
      >
        <StockPedidoChart productos={productos} cargando={cargando} />

        <Box sx={{minWidth: 0}}>
          <Paper
            sx={{
              mb: 2.5,
              p: 2,
              border: `1px solid ${PALETA.border}`,
              bgcolor: PALETA.paper,
            }}
          >
        <Stack
          direction={{xs: 'column', sm: 'row'}}
          spacing={2}
          sx={{alignItems: {xs: 'stretch', sm: 'flex-end'}}}
        >
          <TextField
            id="buscar-producto"
            label="Buscar producto"
            type="search"
            size="small"
            value={busqueda}
            onChange={(e) => onBusquedaChange(e.target.value)}
            placeholder="Buscar por nombre..."
            sx={{flex: 1, maxWidth: {sm: 320}}}
            slotProps={{
              inputLabel: {shrink: true},
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{fontSize: 20, color: PALETA.cerulean}} aria-hidden="true" />
                  </InputAdornment>
                ),
              },
            }}
          />

          <FormControl size="small" sx={{minWidth: {sm: 220}}}>
            <InputLabel shrink id="label-filtro-categoria">
              Categoría
            </InputLabel>
            <Select
              labelId="label-filtro-categoria"
              id="filtro-categoria"
              label="Categoría"
              value={categoriaFiltro}
              onChange={(e) => onCategoriaFiltroChange(String(e.target.value))}
            >
              <MenuItem value="todas">Todas las categorías</MenuItem>
              {categorias.map((categoria) => (
                <MenuItem key={categoria.id} value={String(categoria.id)}>
                  {categoria.nombre}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{display: {xs: 'flex', md: 'none'}}}>
            <InputLabel shrink id="label-orden-movil">
              Ordenar por
            </InputLabel>
            <Select
              labelId="label-orden-movil"
              id="orden-productos-movil"
              label="Ordenar por"
              value={ordenTabla}
              onChange={(e) => onOrdenTablaChange(e.target.value as OrdenTabla)}
            >
              {OPCIONES_ORDEN.map((opcion) => (
                <MenuItem key={opcion.value} value={opcion.value}>
                  {opcion.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {hayFiltrosActivos && (
            <Button
              type="button"
              variant="outlined"
              color="primary"
              onClick={onLimpiarFiltros}
              sx={{
                whiteSpace: 'nowrap',
                flexShrink: 0,
                borderColor: PALETA.cerulean,
                '&:hover': {
                  bgcolor: PALETA.honeydewSoft,
                  borderColor: PALETA.oxfordNavy,
                },
              }}
            >
              Limpiar filtros
            </Button>
          )}
        </Stack>
      </Paper>

      <Paper
        sx={{
          overflow: 'hidden',
          border: `1px solid ${PALETA.border}`,
          bgcolor: PALETA.paper,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
            px: {xs: 2.5, sm: 3},
            py: 1.75,
            bgcolor: PALETA.honeydewSoft,
            borderBottom: `2px solid ${PALETA.oxfordNavy}`,
          }}
        >
          <Typography variant="h2" sx={{fontSize: '1.05rem'}}>
            Lista de productos
          </Typography>
          {!cargando && (
            <Typography
              className="tabular-nums"
              sx={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.78rem',
                fontWeight: 500,
                color: PALETA.inkMuted,
              }}
            >
              Mostrando {productosFiltrados.length} de {totalProductos}
            </Typography>
          )}
        </Box>

        {cargando ? (
          <Box aria-busy="true" aria-label="Cargando productos">
            {[0, 1, 2, 3, 4].map((fila) => (
              <Box
                key={fila}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 2,
                  px: {xs: 2.5, sm: 3},
                  py: 1.75,
                  borderBottom: `1px solid ${PALETA.divider}`,
                }}
              >
                <Skeleton variant="rounded" width="42%" height={20} />
                <Skeleton variant="rounded" width="22%" height={20} />
              </Box>
            ))}
          </Box>
        ) : productos.length === 0 ? (
          <Box sx={{px: {xs: 2.5, sm: 3}, py: 6, textAlign: 'center'}}>
            <Typography sx={{mx: 'auto', maxWidth: 440, fontSize: '0.925rem', color: PALETA.inkMuted}}>
              Todavía no hay productos registrados en la tienda. Crea el primero para empezar a
              llevar las cuentas.
            </Typography>
            <Box sx={{mt: 2.5}}>
              <Button
                type="button"
                variant="contained"
                color="secondary"
                startIcon={<AddIcon />}
                onClick={onAbrirNuevoProducto}
                sx={{
                  bgcolor: PALETA.frostedBlue,
                  color: PALETA.oxfordNavy,
                  fontWeight: 700,
                  border: `1.5px solid ${PALETA.oxfordNavy}`,
                  '&:hover': {bgcolor: PALETA.frostedBlueHover},
                }}
              >
                Nuevo producto
              </Button>
            </Box>
          </Box>
        ) : productosFiltrados.length === 0 ? (
          <Box sx={{px: {xs: 2.5, sm: 3}, py: 6, textAlign: 'center'}}>
            <Typography sx={{mx: 'auto', maxWidth: 440, fontSize: '0.925rem', color: PALETA.inkMuted}}>
              Ningún producto coincide con los filtros actuales.
            </Typography>
            {hayFiltrosActivos && (
              <Box sx={{mt: 2.5}}>
                <Button
                  type="button"
                  variant="outlined"
                  color="primary"
                  onClick={onLimpiarFiltros}
                >
                  Limpiar filtros
                </Button>
              </Box>
            )}
          </Box>
        ) : (
          <>
            <TableContainer sx={{display: {xs: 'none', md: 'block'}}}>
              <Table aria-label="Tabla de inventario">
                <TableHead>
                  <TableRow sx={{bgcolor: PALETA.honeydewSoft}}>
                    <TableCell
                      sortDirection={ordenTabla === 'nombre-asc' ? 'asc' : false}
                      sx={{px: 3, py: 1.5, fontSize: '0.78rem', fontWeight: 700, color: PALETA.inkMuted}}
                    >
                      <TableSortLabel
                        active={ordenTabla === 'nombre-asc'}
                        direction="asc"
                        onClick={() => onOrdenTablaChange('nombre-asc')}
                        sx={{
                          '&.Mui-active': {color: PALETA.oxfordNavy},
                          '&.Mui-active .MuiTableSortLabel-icon': {color: PALETA.cerulean},
                        }}
                      >
                        Producto
                      </TableSortLabel>
                    </TableCell>
                    <TableCell sx={{px: 2, py: 1.5, fontSize: '0.78rem', fontWeight: 700, color: PALETA.inkMuted}}>
                      Categoría
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{px: 2, py: 1.5, fontSize: '0.78rem', fontWeight: 700, color: PALETA.inkMuted}}
                    >
                      Precio
                    </TableCell>
                    <TableCell
                      align="right"
                      sortDirection={
                        ordenTabla === 'stock-asc'
                          ? 'asc'
                          : ordenTabla === 'stock-desc'
                            ? 'desc'
                            : false
                      }
                      sx={{px: 2, py: 1.5, fontSize: '0.78rem', fontWeight: 700, color: PALETA.inkMuted}}
                    >
                      <TableSortLabel
                        active={ordenTabla === 'stock-asc' || ordenTabla === 'stock-desc'}
                        direction={ordenTabla === 'stock-desc' ? 'desc' : 'asc'}
                        onClick={onAlternarOrdenStock}
                        sx={{
                          '&.Mui-active': {color: PALETA.oxfordNavy},
                          '&.Mui-active .MuiTableSortLabel-icon': {color: PALETA.cerulean},
                        }}
                      >
                        Stock
                      </TableSortLabel>
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{px: 2, py: 1.5, fontSize: '0.78rem', fontWeight: 700, color: PALETA.inkMuted}}
                    >
                      Mínimo
                    </TableCell>
                    <TableCell
                      align="right"
                      sortDirection={
                        ordenTabla === 'estado-bajo-primero'
                          ? 'asc'
                          : ordenTabla === 'estado-ok-primero'
                            ? 'desc'
                            : false
                      }
                      sx={{px: 3, py: 1.5, fontSize: '0.78rem', fontWeight: 700, color: PALETA.inkMuted}}
                    >
                      <TableSortLabel
                        active={
                          ordenTabla === 'estado-bajo-primero' ||
                          ordenTabla === 'estado-ok-primero'
                        }
                        direction={ordenTabla === 'estado-ok-primero' ? 'desc' : 'asc'}
                        onClick={onAlternarOrdenEstado}
                        sx={{
                          '&.Mui-active': {color: PALETA.oxfordNavy},
                          '&.Mui-active .MuiTableSortLabel-icon': {color: PALETA.cerulean},
                        }}
                      >
                        Estado
                      </TableSortLabel>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {productosFiltrados.map((producto) => (
                    <TableRow
                      key={producto.id}
                      sx={{
                        transition: 'background-color 150ms cubic-bezier(0.16, 1, 0.3, 1)',
                        '&:hover': {bgcolor: PALETA.honeydewSoft},
                        '&:last-child td': {borderBottom: 0},
                      }}
                    >
                      <TableCell sx={{px: 3, py: 1.75, fontWeight: 600, color: PALETA.ink}}>
                        {producto.nombre}
                      </TableCell>
                      <TableCell sx={{px: 2, py: 1.75, color: PALETA.inkMuted}}>
                        {producto.categoria}
                      </TableCell>
                      <TableCell
                        align="right"
                        className="tabular-nums"
                        sx={{
                          px: 2,
                          py: 1.75,
                          fontFamily: 'var(--font-mono)',
                          fontWeight: 500,
                          color: PALETA.ink,
                        }}
                      >
                        {formatearPrecio(producto.precio)}
                      </TableCell>
                      <TableCell
                        align="right"
                        className="tabular-nums"
                        sx={{
                          px: 2,
                          py: 1.75,
                          fontFamily: 'var(--font-mono)',
                          fontWeight: 600,
                          color: producto.stock_bajo ? PALETA.punchRedAccessible : PALETA.ink,
                        }}
                      >
                        {producto.stock_actual}
                      </TableCell>
                      <TableCell
                        align="right"
                        className="tabular-nums"
                        sx={{
                          px: 2,
                          py: 1.75,
                          fontFamily: 'var(--font-mono)',
                          color: PALETA.inkMuted,
                        }}
                      >
                        {producto.stock_minimo}
                      </TableCell>
                      <TableCell align="right" sx={{px: 3, py: 1.75, whiteSpace: 'nowrap'}}>
                        <Typography
                          component="span"
                          sx={{
                            fontSize: '0.875rem',
                            fontWeight: producto.stock_bajo ? 700 : 600,
                            color: producto.stock_bajo
                              ? PALETA.punchRedAccessible
                              : PALETA.ceruleanDark,
                          }}
                        >
                          {producto.stock_bajo ? 'Stock bajo' : 'OK'}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <Box
              component="ul"
              sx={{
                display: {xs: 'block', md: 'none'},
                listStyle: 'none',
                m: 0,
                p: 0,
              }}
            >
              {productosFiltrados.map((producto, indice) => (
                <Box
                  component="li"
                  key={producto.id}
                  sx={{
                    px: 2.5,
                    py: 2,
                    borderBottom:
                      indice < productosFiltrados.length - 1
                        ? `1px solid ${PALETA.divider}`
                        : 'none',
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      gap: 1.5,
                    }}
                  >
                    <Box sx={{minWidth: 0}}>
                      <Typography sx={{fontWeight: 600, color: PALETA.ink}}>
                        {producto.nombre}
                      </Typography>
                      <Typography sx={{mt: 0.25, fontSize: '0.85rem', color: PALETA.inkMuted}}>
                        {producto.categoria}
                      </Typography>
                    </Box>
                    <Typography
                      component="span"
                      sx={{
                        flexShrink: 0,
                        fontSize: '0.85rem',
                        fontWeight: producto.stock_bajo ? 700 : 600,
                        color: producto.stock_bajo
                          ? PALETA.punchRedAccessible
                          : PALETA.ceruleanDark,
                      }}
                    >
                      {producto.stock_bajo ? 'Stock bajo' : 'OK'}
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      mt: 1.5,
                      pt: 1.25,
                      borderTop: `1px solid ${PALETA.divider}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 2,
                      fontSize: '0.875rem',
                    }}
                  >
                    <Typography
                      component="span"
                      className="tabular-nums"
                      sx={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        color: PALETA.ink,
                      }}
                    >
                      {formatearPrecio(producto.precio)}
                    </Typography>
                    <Box sx={{display: 'flex', alignItems: 'center', gap: 2, color: PALETA.inkMuted}}>
                      <Typography component="span" sx={{fontSize: '0.85rem'}}>
                        Stock:{' '}
                        <Box
                          component="strong"
                          className="tabular-nums"
                          sx={{
                            fontFamily: 'var(--font-mono)',
                            fontWeight: 600,
                            color: producto.stock_bajo ? PALETA.punchRedAccessible : PALETA.ink,
                          }}
                        >
                          {producto.stock_actual}
                        </Box>
                      </Typography>
                      <Typography component="span" sx={{fontSize: '0.85rem'}}>
                        Mínimo:{' '}
                        <Box
                          component="span"
                          className="tabular-nums"
                          sx={{fontFamily: 'var(--font-mono)'}}
                        >
                          {producto.stock_minimo}
                        </Box>
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              ))}
            </Box>
          </>
        )}
      </Paper>
        </Box>
      </Box>
    </Box>
  );
}
