import {type FormEvent} from 'react';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  FormControl,
  FormHelperText,
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
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import {PALETA} from '../theme';
import {
  type Movimiento,
  type ProductoVista,
  type TipoMovimiento,
  formatearFechaMovimiento,
} from '../types';

export interface ErroresMovimiento {
  producto?: string;
  tipo?: string;
  cantidad?: string;
}

interface MovimientosViewProps {
  productos: ProductoVista[];
  productosPorId: Map<number, ProductoVista>;
  movimientos: Movimiento[];
  cargandoMovimientos: boolean;
  errorCargarMovimientos: string | null;
  movProductoId: string;
  movTipo: TipoMovimiento | null;
  movCantidad: string;
  movNota: string;
  erroresMovimiento: ErroresMovimiento;
  registrandoMovimiento: boolean;
  errorRegistrarMovimiento: string | null;
  productoSeleccionado: ProductoVista | undefined;
  stockResultantePrevio: number | null;
  onProductoChange: (valor: string) => void;
  onTipoChange: (valor: TipoMovimiento | null) => void;
  onCantidadChange: (valor: string) => void;
  onNotaChange: (valor: string) => void;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  onRecargarMovimientos: () => void;
}

export function MovimientosView({
  productos,
  productosPorId,
  movimientos,
  cargandoMovimientos,
  errorCargarMovimientos,
  movProductoId,
  movTipo,
  movCantidad,
  movNota,
  erroresMovimiento,
  registrandoMovimiento,
  errorRegistrarMovimiento,
  productoSeleccionado,
  stockResultantePrevio,
  onProductoChange,
  onTipoChange,
  onCantidadChange,
  onNotaChange,
  onSubmit,
  onRecargarMovimientos,
}: MovimientosViewProps) {
  return (
    <Box component="section" aria-labelledby="titulo-movimientos">
      <Box sx={{pb: 3}}>
        <Typography
          id="titulo-movimientos"
          variant="h1"
          sx={{fontSize: {xs: '1.65rem', sm: '2.1rem'}, lineHeight: 1.15}}
        >
          Registrar movimiento
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
          Una entrada suma al stock; una salida resta.
        </Typography>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {xs: '1fr', lg: '5fr 7fr'},
          gap: 3,
          alignItems: 'start',
        }}
      >
        <Box>
          <Paper
            sx={{
              border: `1px solid ${PALETA.border}`,
              borderTop: `4px solid ${PALETA.oxfordNavy}`,
              bgcolor: PALETA.paper,
            }}
          >
            <Box component="form" onSubmit={onSubmit} noValidate sx={{p: {xs: 2.5, sm: 3}}}>
              <Stack spacing={2.75}>
                <FormControl fullWidth required error={Boolean(erroresMovimiento.producto)}>
                  <InputLabel shrink id="label-mov-producto">
                    Producto
                  </InputLabel>
                  <Select
                    labelId="label-mov-producto"
                    id="mov-producto"
                    label="Producto *"
                    displayEmpty
                    value={movProductoId}
                    onChange={(e) => onProductoChange(String(e.target.value))}
                    renderValue={(selected) => {
                      if (!selected) {
                        return (
                          <Typography
                            component="span"
                            sx={{color: PALETA.inkMuted, fontSize: '0.95rem'}}
                          >
                            Selecciona un producto
                          </Typography>
                        );
                      }
                      const prod = productosPorId.get(Number(selected));
                      return prod
                        ? `${prod.nombre} (stock: ${prod.stock_actual})`
                        : `Producto #${selected}`;
                    }}
                  >
                    {productos.map((producto) => (
                      <MenuItem key={producto.id} value={String(producto.id)}>
                        {producto.nombre} (stock: {producto.stock_actual})
                      </MenuItem>
                    ))}
                  </Select>
                  <FormHelperText>
                    {erroresMovimiento.producto ?? 'Elige el producto que entra o sale de la tienda.'}
                  </FormHelperText>
                </FormControl>

                <FormControl fullWidth required error={Boolean(erroresMovimiento.tipo)}>
                  <Typography
                    component="span"
                    sx={{
                      mb: 0.75,
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      color: erroresMovimiento.tipo ? PALETA.punchRedAccessible : PALETA.ink,
                    }}
                  >
                    Tipo{' '}
                    <Box component="span" sx={{color: PALETA.punchRed}}>
                      *
                    </Box>
                  </Typography>

                  <ToggleButtonGroup
                    exclusive
                    fullWidth
                    value={movTipo}
                    onChange={(_, nextValue: TipoMovimiento | null) => {
                      if (nextValue !== null) {
                        onTipoChange(nextValue);
                      }
                    }}
                    aria-label="Tipo de movimiento"
                    sx={{
                      '& .MuiToggleButton-root': {
                        minHeight: 44,
                        textTransform: 'none',
                        fontWeight: 700,
                        fontSize: '0.9rem',
                        gap: 1,
                        borderColor: erroresMovimiento.tipo ? PALETA.punchRed : PALETA.border,
                        color: PALETA.inkMuted,
                        bgcolor: PALETA.paper,
                      },
                    }}
                  >
                    <ToggleButton
                      value="entrada"
                      sx={{
                        '&.Mui-selected': {
                          bgcolor: PALETA.oxfordNavy,
                          color: '#FFFFFF',
                          borderColor: PALETA.oxfordNavy,
                          '&:hover': {bgcolor: PALETA.oxfordNavyDark},
                        },
                      }}
                    >
                      <ArrowDownwardIcon fontSize="small" aria-hidden="true" />
                      Entrada
                    </ToggleButton>

                    <ToggleButton
                      value="salida"
                      sx={{
                        '&.Mui-selected': {
                          bgcolor: PALETA.punchRedAccessible,
                          color: '#FFFFFF',
                          borderColor: PALETA.punchRedAccessible,
                          '&:hover': {bgcolor: PALETA.punchRedDark},
                        },
                      }}
                    >
                      <ArrowUpwardIcon fontSize="small" aria-hidden="true" />
                      Salida
                    </ToggleButton>
                  </ToggleButtonGroup>

                  <FormHelperText>
                    {erroresMovimiento.tipo ??
                      'Elige Entrada cuando llega mercancía o Salida cuando se vende.'}
                  </FormHelperText>
                </FormControl>

                <TextField
                  id="mov-cantidad"
                  label="Cantidad"
                  required
                  fullWidth
                  type="number"
                  value={movCantidad}
                  onChange={(e) => onCantidadChange(e.target.value)}
                  placeholder="5"
                  error={Boolean(erroresMovimiento.cantidad)}
                  helperText={
                    erroresMovimiento.cantidad ?? 'Ejemplo: 5. Escribe un número entero mayor que 0.'
                  }
                  slotProps={{
                    inputLabel: {shrink: true},
                    htmlInput: {min: 1, step: 1, inputMode: 'numeric'},
                    input: {
                      className: 'tabular-nums',
                      sx: {fontFamily: 'var(--font-mono)'},
                    },
                  }}
                />

                <TextField
                  id="mov-nota"
                  label="Nota (opcional)"
                  fullWidth
                  value={movNota}
                  onChange={(e) => onNotaChange(e.target.value)}
                  placeholder="Ej. Pedido al proveedor"
                  helperText="Ejemplo: Pedido al proveedor o ventas del día."
                  slotProps={{inputLabel: {shrink: true}}}
                />

                {productoSeleccionado && (
                  <Box
                    aria-live="polite"
                    sx={{
                      p: 1.75,
                      borderRadius: 1,
                      border: `1px solid ${
                        stockResultantePrevio !== null && stockResultantePrevio < 0
                          ? PALETA.punchRed
                          : PALETA.border
                      }`,
                      bgcolor:
                        stockResultantePrevio !== null && stockResultantePrevio < 0
                          ? PALETA.punchRedTint
                          : PALETA.honeydewSoft,
                      color:
                        stockResultantePrevio !== null && stockResultantePrevio < 0
                          ? PALETA.punchRedAccessible
                          : PALETA.ink,
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 1,
                        fontSize: '0.875rem',
                      }}
                    >
                      <Typography component="span" sx={{fontSize: '0.875rem'}}>
                        Stock actual:{' '}
                        <Box
                          component="strong"
                          className="tabular-nums"
                          sx={{fontFamily: 'var(--font-mono)', fontWeight: 700}}
                        >
                          {productoSeleccionado.stock_actual}
                        </Box>
                      </Typography>

                      {stockResultantePrevio !== null && (
                        <Typography component="span" sx={{fontSize: '0.875rem'}}>
                          Stock resultante:{' '}
                          <Box
                            component="strong"
                            className="tabular-nums"
                            sx={{fontFamily: 'var(--font-mono)', fontWeight: 700}}
                          >
                            {stockResultantePrevio}
                          </Box>
                        </Typography>
                      )}
                    </Box>

                    {stockResultantePrevio !== null && stockResultantePrevio < 0 && (
                      <Typography
                        sx={{
                          mt: 0.75,
                          fontSize: '0.78rem',
                          fontWeight: 600,
                          color: PALETA.punchRedAccessible,
                        }}
                      >
                        Esta salida supera el stock disponible.
                      </Typography>
                    )}

                    {stockResultantePrevio !== null &&
                      stockResultantePrevio >= 0 &&
                      stockResultantePrevio <= productoSeleccionado.stock_minimo && (
                        <Typography
                          sx={{
                            mt: 0.75,
                            fontSize: '0.78rem',
                            fontWeight: 600,
                            color: PALETA.punchRedAccessible,
                          }}
                        >
                          Con este movimiento quedará en Stock bajo (mínimo:{' '}
                          {productoSeleccionado.stock_minimo}).
                        </Typography>
                      )}
                  </Box>
                )}

                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    pt: 2,
                    borderTop: `1px solid ${PALETA.divider}`,
                  }}
                >
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={registrandoMovimiento}
                  >
                    {registrandoMovimiento ? 'Registrando...' : 'Registrar'}
                  </Button>
                </Box>
              </Stack>
            </Box>
          </Paper>

          {errorRegistrarMovimiento && (
            <Alert
              severity="error"
              variant="outlined"
              sx={{
                mt: 2,
                bgcolor: PALETA.punchRedTint,
                borderColor: PALETA.punchRed,
                color: PALETA.ink,
                '& .MuiAlert-icon': {color: PALETA.punchRed},
              }}
            >
              <AlertTitle sx={{fontWeight: 700, color: PALETA.punchRedAccessible}}>
                {errorRegistrarMovimiento}
              </AlertTitle>
              Ajusta la cantidad o registra primero una entrada de mercancía.
            </Alert>
          )}
        </Box>

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
              Historial de movimientos
            </Typography>
            {!cargandoMovimientos && !errorCargarMovimientos && (
              <Typography
                className="tabular-nums"
                sx={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.78rem',
                  fontWeight: 500,
                  color: PALETA.inkMuted,
                }}
              >
                {movimientos.length} {movimientos.length === 1 ? 'movimiento' : 'movimientos'}
              </Typography>
            )}
          </Box>

          {errorCargarMovimientos ? (
            <Box sx={{p: {xs: 2.5, sm: 3}}}>
              <Alert
                severity="error"
                variant="outlined"
                sx={{
                  bgcolor: PALETA.punchRedTint,
                  borderColor: PALETA.punchRed,
                  color: PALETA.ink,
                  '& .MuiAlert-icon': {color: PALETA.punchRed},
                }}
              >
                <AlertTitle sx={{fontWeight: 700, color: PALETA.punchRedAccessible}}>
                  No se pudo cargar el historial de movimientos.
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
                  {errorCargarMovimientos}
                </Typography>
                <Typography sx={{mt: 1, fontSize: '0.875rem', color: PALETA.ink}}>
                  Revisa tu conexión a internet y vuelve a cargar el historial.
                </Typography>
                <Box sx={{mt: 2}}>
                  <Button
                    type="button"
                    variant="contained"
                    color="error"
                    onClick={onRecargarMovimientos}
                  >
                    Volver a cargar
                  </Button>
                </Box>
              </Alert>
            </Box>
          ) : cargandoMovimientos ? (
            <Box aria-busy="true" aria-label="Cargando historial de movimientos">
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
                  <Skeleton variant="rounded" width="44%" height={20} />
                  <Skeleton variant="rounded" width="20%" height={20} />
                </Box>
              ))}
            </Box>
          ) : movimientos.length === 0 ? (
            <Box sx={{px: {xs: 2.5, sm: 3}, py: 6, textAlign: 'center'}}>
              <Typography sx={{mx: 'auto', maxWidth: 440, fontSize: '0.925rem', color: PALETA.inkMuted}}>
                Todavía no hay movimientos registrados. Registra la primera entrada o salida en el
                formulario.
              </Typography>
            </Box>
          ) : (
            <>
              <TableContainer sx={{display: {xs: 'none', md: 'block'}}}>
                <Table aria-label="Historial de movimientos">
                  <TableHead>
                    <TableRow sx={{bgcolor: PALETA.honeydewSoft}}>
                      <TableCell sx={{px: 2.5, py: 1.5, fontSize: '0.78rem', fontWeight: 700, color: PALETA.inkMuted}}>
                        Fecha
                      </TableCell>
                      <TableCell sx={{px: 2, py: 1.5, fontSize: '0.78rem', fontWeight: 700, color: PALETA.inkMuted}}>
                        Producto
                      </TableCell>
                      <TableCell sx={{px: 2, py: 1.5, fontSize: '0.78rem', fontWeight: 700, color: PALETA.inkMuted}}>
                        Tipo
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{px: 2, py: 1.5, fontSize: '0.78rem', fontWeight: 700, color: PALETA.inkMuted}}
                      >
                        Cant.
                      </TableCell>
                      <TableCell sx={{px: 2.5, py: 1.5, fontSize: '0.78rem', fontWeight: 700, color: PALETA.inkMuted}}>
                        Nota
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {movimientos.map((mov) => {
                      const nombreProducto =
                        productosPorId.get(mov.producto_id)?.nombre ?? `Producto #${mov.producto_id}`;
                      return (
                        <TableRow
                          key={mov.id}
                          sx={{
                            transition: 'background-color 150ms cubic-bezier(0.16, 1, 0.3, 1)',
                            '&:hover': {bgcolor: PALETA.honeydewSoft},
                            '&:last-child td': {borderBottom: 0},
                          }}
                        >
                          <TableCell
                            className="tabular-nums"
                            sx={{
                              px: 2.5,
                              py: 1.5,
                              fontFamily: 'var(--font-mono)',
                              fontSize: '0.78rem',
                              color: PALETA.inkMuted,
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {formatearFechaMovimiento(mov.creado_en)}
                          </TableCell>
                          <TableCell sx={{px: 2, py: 1.5, fontWeight: 600, color: PALETA.ink}}>
                            {nombreProducto}
                          </TableCell>
                          <TableCell sx={{px: 2, py: 1.5, whiteSpace: 'nowrap'}}>
                            <Typography
                              component="span"
                              sx={{
                                fontSize: '0.875rem',
                                fontWeight: 700,
                                color:
                                  mov.tipo === 'entrada'
                                    ? PALETA.ceruleanDark
                                    : PALETA.punchRedAccessible,
                              }}
                            >
                              {mov.tipo === 'entrada' ? 'Entrada' : 'Salida'}
                            </Typography>
                          </TableCell>
                          <TableCell
                            align="right"
                            className="tabular-nums"
                            sx={{
                              px: 2,
                              py: 1.5,
                              fontFamily: 'var(--font-mono)',
                              fontWeight: 600,
                              color: PALETA.ink,
                            }}
                          >
                            {mov.cantidad}
                          </TableCell>
                          <TableCell sx={{px: 2.5, py: 1.5, color: PALETA.inkMuted}}>
                            {mov.nota && mov.nota.trim() !== '' ? mov.nota : '—'}
                          </TableCell>
                        </TableRow>
                      );
                    })}
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
                {movimientos.map((mov, indice) => {
                  const nombreProducto =
                    productosPorId.get(mov.producto_id)?.nombre ?? `Producto #${mov.producto_id}`;
                  return (
                    <Box
                      component="li"
                      key={mov.id}
                      sx={{
                        px: 2.5,
                        py: 2,
                        borderBottom:
                          indice < movimientos.length - 1
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
                            {nombreProducto}
                          </Typography>
                          <Typography
                            className="tabular-nums"
                            sx={{
                              mt: 0.25,
                              fontFamily: 'var(--font-mono)',
                              fontSize: '0.78rem',
                              color: PALETA.inkMuted,
                            }}
                          >
                            {formatearFechaMovimiento(mov.creado_en)}
                          </Typography>
                        </Box>
                        <Box sx={{flexShrink: 0, textAlign: 'right'}}>
                          <Typography
                            component="span"
                            sx={{
                              fontSize: '0.875rem',
                              fontWeight: 700,
                              color:
                                mov.tipo === 'entrada'
                                  ? PALETA.ceruleanDark
                                  : PALETA.punchRedAccessible,
                            }}
                          >
                            {mov.tipo === 'entrada' ? 'Entrada' : 'Salida'}
                          </Typography>
                          <Typography
                            className="tabular-nums"
                            sx={{
                              fontFamily: 'var(--font-mono)',
                              fontSize: '0.9rem',
                              fontWeight: 600,
                              color: PALETA.ink,
                            }}
                          >
                            {mov.cantidad}
                          </Typography>
                        </Box>
                      </Box>
                      {mov.nota && mov.nota.trim() !== '' && (
                        <Typography
                          sx={{
                            mt: 1.25,
                            pt: 1,
                            borderTop: `1px solid ${PALETA.divider}`,
                            fontSize: '0.875rem',
                            color: PALETA.inkMuted,
                          }}
                        >
                          {mov.nota}
                        </Typography>
                      )}
                    </Box>
                  );
                })}
              </Box>
            </>
          )}
        </Paper>
      </Box>
    </Box>
  );
}
