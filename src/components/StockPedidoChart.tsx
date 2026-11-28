import {useMemo} from 'react';
import {Box, Paper, Skeleton, Typography} from '@mui/material';
import {useTheme} from '@mui/material/styles';
import {BarChart} from '@mui/x-charts/BarChart';
import {ChartsReferenceLine} from '@mui/x-charts/ChartsReferenceLine';
import {PALETA} from '../theme';
import {type ProductoVista} from '../types';

interface StockPedidoChartProps {
  productos: ProductoVista[];
  cargando: boolean;
}

interface DatoBarra {
  id: string;
  nombre: string;
  stockActual: number;
  stockMinimo: number;
  porcentaje: number;
}

function acortarNombre(nombre: string, max = 18): string {
  if (nombre.length <= max) {
    return nombre;
  }
  return `${nombre.slice(0, max - 1).trimEnd()}…`;
}

export function StockPedidoChart({productos, cargando}: StockPedidoChartProps) {
  const theme = useTheme();

  const datosOrdenados = useMemo<DatoBarra[]>(() => {
    return productos
      .map((producto) => {
        let porcentaje: number;
        if (producto.stock_minimo > 0) {
          const exacto = (producto.stock_actual / producto.stock_minimo) * 100;
          if (producto.stock_actual <= producto.stock_minimo) {
            porcentaje = Math.min(100, Math.round(exacto));
          } else {
            porcentaje = Math.max(101, Math.round(exacto));
          }
        } else {
          porcentaje = producto.stock_actual > 0 ? 200 : 0;
        }

        return {
          id: String(producto.id),
          nombre: producto.nombre,
          stockActual: producto.stock_actual,
          stockMinimo: producto.stock_minimo,
          porcentaje,
        };
      })
      .sort((a, b) => a.porcentaje - b.porcentaje || a.nombre.localeCompare(b.nombre, 'es'));
  }, [productos]);

  const mapaPorId = useMemo(() => {
    const mapa = new Map<string, DatoBarra>();
    for (const item of datosOrdenados) {
      mapa.set(item.id, item);
    }
    return mapa;
  }, [datosOrdenados]);

  const cantidadPorPedir = useMemo(
    () => datosOrdenados.filter((item) => item.porcentaje <= 100).length,
    [datosOrdenados],
  );

  const tituloConclusion =
    cantidadPorPedir === 0
      ? 'No toca pedir productos'
      : cantidadPorPedir === 1
        ? 'Toca pedir 1 producto'
        : `Toca pedir ${cantidadPorPedir} productos`;

  const maxPorcentaje = useMemo(
    () => Math.max(100, ...datosOrdenados.map((item) => item.porcentaje)),
    [datosOrdenados],
  );
  const xAxisMax = Math.max(125, Math.ceil((maxPorcentaje + 25) / 25) * 25);
  const altoGrafico = Math.max(260, datosOrdenados.length * 36 + 74);

  const prefiereMenosMovimiento =
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  return (
    <Paper
      sx={{
        overflow: 'hidden',
        border: `1px solid ${PALETA.border}`,
        bgcolor: PALETA.paper,
      }}
    >
      <Box
        sx={{
          px: {xs: 2.5, sm: 3},
          py: 1.75,
          bgcolor: PALETA.honeydewSoft,
          borderBottom: `2px solid ${
            !cargando && cantidadPorPedir > 0
              ? theme.palette.error.main
              : PALETA.oxfordNavy
          }`,
        }}
      >
        <Typography
          variant="h2"
          sx={{
            fontSize: '1.05rem',
            color:
              !cargando && cantidadPorPedir > 0
                ? theme.palette.error.main
                : PALETA.ink,
          }}
        >
          {cargando ? 'Qué productos hay que pedir' : tituloConclusion}
        </Typography>
        <Typography sx={{mt: 0.25, fontSize: '0.78rem', color: PALETA.inkMuted}}>
          Stock actual como porcentaje del mínimo (ordenado de menor a mayor)
        </Typography>
      </Box>

      {cargando ? (
        <Box aria-busy="true" aria-label="Cargando gráfico de pedidos" sx={{p: 2.5}}>
          {[0, 1, 2, 3, 4].map((fila) => (
            <Box
              key={fila}
              sx={{display: 'flex', alignItems: 'center', gap: 1.5, mb: fila < 4 ? 1.75 : 0}}
            >
              <Skeleton variant="rounded" width={96} height={18} />
              <Skeleton
                variant="rounded"
                width={`${35 + ((fila * 17) % 50)}%`}
                height={20}
              />
            </Box>
          ))}
        </Box>
      ) : datosOrdenados.length === 0 ? (
        <Box sx={{px: {xs: 2.5, sm: 3}, py: 6, textAlign: 'center'}}>
          <Typography sx={{fontSize: '0.9rem', color: PALETA.inkMuted}}>
            Cuando registres productos verás aquí cuáles están por debajo de su mínimo.
          </Typography>
        </Box>
      ) : (
        <Box sx={{px: {xs: 1.5, sm: 2}, pt: 1.5, pb: 2}}>
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              gap: 2,
              px: 1,
              pb: 0.5,
              fontSize: '0.75rem',
              color: PALETA.inkMuted,
            }}
          >
            <Box sx={{display: 'inline-flex', alignItems: 'center', gap: 0.75}}>
              <Box
                aria-hidden="true"
                sx={{
                  width: 10,
                  height: 10,
                  borderRadius: '2px',
                  bgcolor: theme.palette.error.main,
                }}
              />
              <span>100 % o menos (pedir)</span>
            </Box>
            <Box sx={{display: 'inline-flex', alignItems: 'center', gap: 0.75}}>
              <Box
                aria-hidden="true"
                sx={{
                  width: 10,
                  height: 10,
                  borderRadius: '2px',
                  bgcolor: theme.palette.grey[500],
                }}
              />
              <span>Más de 100 %</span>
            </Box>
          </Box>

          <BarChart
            layout="horizontal"
            height={altoGrafico}
            hideLegend
            skipAnimation={prefiereMenosMovimiento}
            margin={{top: 32, right: 44, bottom: 28, left: 4}}
            grid={{vertical: true}}
            borderRadius={4}
            series={[
              {
                data: datosOrdenados.map((item) => item.porcentaje),
                label: 'Stock vs. mínimo',
                barLabel: (item) => `${item.value ?? 0}%`,
                barLabelPlacement: 'outside',
                valueFormatter: (value, context) => {
                  const item = datosOrdenados[context.dataIndex];
                  const pct = value ?? 0;
                  return item
                    ? `${pct}% (${item.stockActual} de ${item.stockMinimo} mín.)`
                    : `${pct}%`;
                },
              },
            ]}
            yAxis={[
              {
                id: 'productos-axis',
                scaleType: 'band',
                data: datosOrdenados.map((item) => item.id),
                width: 128,
                valueFormatter: (id, context) => {
                  const item = mapaPorId.get(String(id));
                  if (!item) {
                    return String(id);
                  }
                  return context.location === 'tick'
                    ? acortarNombre(item.nombre)
                    : item.nombre;
                },
                tickLabelStyle: {
                  fontSize: 12,
                  fill: PALETA.ink,
                  fontFamily: '"Plus Jakarta Sans", sans-serif',
                },
              },
            ]}
            xAxis={[
              {
                id: 'porcentaje-axis',
                min: 0,
                max: xAxisMax,
                valueFormatter: (valor: number) => `${valor}%`,
                colorMap: {
                  type: 'piecewise',
                  thresholds: [100.0001],
                  colors: [theme.palette.error.main, theme.palette.grey[500]],
                },
                tickLabelStyle: {
                  fontSize: 11,
                  fill: PALETA.inkMuted,
                  fontFamily: '"IBM Plex Mono", monospace',
                },
              },
            ]}
            slotProps={{
              barLabel: {
                style: {
                  fontSize: 11,
                  fontWeight: 600,
                  fill: PALETA.ink,
                  fontFamily: '"IBM Plex Mono", monospace',
                },
              },
            }}
          >
            <ChartsReferenceLine
              x={100}
              label="mínimo"
              labelAlign="start"
              spacing={{x: 0, y: -8}}
              lineStyle={{
                stroke: theme.palette.error.main,
                strokeWidth: 1.5,
                strokeDasharray: '4 4',
              }}
              labelStyle={{
                fill: theme.palette.error.main,
                fontSize: 12,
                fontWeight: 700,
                textAnchor: 'middle',
                dominantBaseline: 'auto',
                fontFamily: '"Plus Jakarta Sans", sans-serif',
              }}
            />
          </BarChart>
        </Box>
      )}
    </Paper>
  );
}
