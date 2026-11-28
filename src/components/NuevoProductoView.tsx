import {type FormEvent} from 'react';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import {
  Alert,
  AlertTitle,
  Box,
  Breadcrumbs,
  Button,
  FormControl,
  FormHelperText,
  InputAdornment,
  InputLabel,
  Link,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import {PALETA} from '../theme';
import {type Categoria} from '../types';

export interface ErroresNuevoProducto {
  nombre?: string;
  categoria?: string;
  precio?: string;
  stockMinimo?: string;
}

interface NuevoProductoViewProps {
  categorias: Categoria[];
  nuevoNombre: string;
  nuevaCategoriaId: string;
  nuevoPrecio: string;
  nuevoStockMinimo: string;
  erroresFormulario: ErroresNuevoProducto;
  guardandoProducto: boolean;
  errorGuardarProducto: string | null;
  onNombreChange: (valor: string) => void;
  onCategoriaChange: (valor: string) => void;
  onPrecioChange: (valor: string) => void;
  onStockMinimoChange: (valor: string) => void;
  onCancelar: () => void;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
}

export function NuevoProductoView({
  categorias,
  nuevoNombre,
  nuevaCategoriaId,
  nuevoPrecio,
  nuevoStockMinimo,
  erroresFormulario,
  guardandoProducto,
  errorGuardarProducto,
  onNombreChange,
  onCategoriaChange,
  onPrecioChange,
  onStockMinimoChange,
  onCancelar,
  onSubmit,
}: NuevoProductoViewProps) {
  return (
    <Box component="section" aria-labelledby="titulo-nuevo-producto">
      <Breadcrumbs
        aria-label="Ruta de navegación"
        separator={<NavigateNextIcon fontSize="small" sx={{color: PALETA.inkMuted}} />}
        sx={{mb: 1}}
      >
        <Link
          component="button"
          type="button"
          underline="hover"
          onClick={onCancelar}
          sx={{
            minHeight: 44,
            display: 'inline-flex',
            alignItems: 'center',
            fontSize: '0.875rem',
            fontWeight: 500,
            color: PALETA.inkMuted,
            '&:hover': {color: PALETA.oxfordNavy},
          }}
        >
          Inventario
        </Link>
        <Typography sx={{fontSize: '0.875rem', fontWeight: 600, color: PALETA.ink}}>
          Nuevo producto
        </Typography>
      </Breadcrumbs>

      <Box sx={{pb: 3}}>
        <Typography
          id="titulo-nuevo-producto"
          variant="h1"
          sx={{fontSize: {xs: '1.65rem', sm: '2.1rem'}, lineHeight: 1.15}}
        >
          Nuevo producto
        </Typography>
      </Box>

      <Paper
        sx={{
          maxWidth: 600,
          border: `1px solid ${PALETA.border}`,
          borderTop: `4px solid ${PALETA.oxfordNavy}`,
          bgcolor: PALETA.paper,
        }}
      >
        <Box component="form" onSubmit={onSubmit} noValidate sx={{p: {xs: 2.5, sm: 3.5}}}>
          <Stack spacing={3}>
            <TextField
              id="nuevo-nombre"
              label="Nombre"
              required
              fullWidth
              value={nuevoNombre}
              onChange={(e) => onNombreChange(e.target.value)}
              placeholder="Ej. Aceite 1 L"
              error={Boolean(erroresFormulario.nombre)}
              helperText={erroresFormulario.nombre ?? 'Ejemplo: Aceite 1 L.'}
              slotProps={{inputLabel: {shrink: true}}}
            />

            <FormControl fullWidth required error={Boolean(erroresFormulario.categoria)}>
              <InputLabel shrink id="label-nueva-categoria">
                Categoría
              </InputLabel>
              <Select
                labelId="label-nueva-categoria"
                id="nuevo-categoria"
                label="Categoría *"
                displayEmpty
                value={nuevaCategoriaId}
                onChange={(e) => onCategoriaChange(String(e.target.value))}
                renderValue={(selected) => {
                  if (!selected) {
                    return (
                      <Typography component="span" sx={{color: PALETA.inkMuted, fontSize: '0.95rem'}}>
                        Selecciona una categoría
                      </Typography>
                    );
                  }
                  const encontrada = categorias.find((cat) => String(cat.id) === String(selected));
                  return encontrada ? encontrada.nombre : String(selected);
                }}
              >
                {categorias.map((categoria) => (
                  <MenuItem key={categoria.id} value={String(categoria.id)}>
                    {categoria.nombre}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>
                {erroresFormulario.categoria ?? 'Elige el grupo al que pertenece el producto.'}
              </FormHelperText>
            </FormControl>

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {xs: '1fr', sm: '1fr 1fr'},
                gap: 2.5,
              }}
            >
              <TextField
                id="nuevo-precio"
                label="Precio de venta"
                required
                fullWidth
                type="number"
                value={nuevoPrecio}
                onChange={(e) => onPrecioChange(e.target.value)}
                placeholder="12500"
                error={Boolean(erroresFormulario.precio)}
                helperText={
                  erroresFormulario.precio ?? 'Ejemplo: 12500 sin puntos ni decimales.'
                }
                slotProps={{
                  inputLabel: {shrink: true},
                  htmlInput: {min: 1, step: 1, inputMode: 'numeric'},
                  input: {
                    className: 'tabular-nums',
                    sx: {fontFamily: 'var(--font-mono)'},
                    startAdornment: (
                      <InputAdornment position="start">
                        <Typography
                          component="span"
                          sx={{fontFamily: 'var(--font-mono)', color: PALETA.inkMuted}}
                        >
                          $
                        </Typography>
                      </InputAdornment>
                    ),
                  },
                }}
              />

              <TextField
                id="nuevo-stock-minimo"
                label="Stock mínimo"
                required
                fullWidth
                type="number"
                value={nuevoStockMinimo}
                onChange={(e) => onStockMinimoChange(e.target.value)}
                placeholder="4"
                error={Boolean(erroresFormulario.stockMinimo)}
                helperText={
                  erroresFormulario.stockMinimo ??
                  'Con este número o menos sale la alerta de stock bajo.'
                }
                slotProps={{
                  inputLabel: {shrink: true},
                  htmlInput: {min: 0, step: 1, inputMode: 'numeric'},
                  input: {
                    className: 'tabular-nums',
                    sx: {fontFamily: 'var(--font-mono)'},
                  },
                }}
              />
            </Box>

            <Alert
              severity="info"
              variant="outlined"
              sx={{
                bgcolor: PALETA.honeydewSoft,
                borderColor: PALETA.cerulean,
                color: PALETA.ink,
                '& .MuiAlert-icon': {color: PALETA.cerulean},
              }}
            >
              El producto empieza con stock 0. El stock solo cambia cuando registras una entrada o
              una salida.
            </Alert>

            {errorGuardarProducto && (
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
                  {errorGuardarProducto}
                </AlertTitle>
                Revisa los datos del producto o tu conexión e intenta guardar de nuevo.
              </Alert>
            )}

            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'flex-end',
                gap: 1.5,
                pt: 2.5,
                borderTop: `1px solid ${PALETA.divider}`,
              }}
            >
              <Button
                type="button"
                variant="outlined"
                color="primary"
                onClick={onCancelar}
                disabled={guardandoProducto}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={guardandoProducto}
              >
                {guardandoProducto ? 'Guardando...' : 'Guardar producto'}
              </Button>
            </Box>
          </Stack>
        </Box>
      </Paper>
    </Box>
  );
}
