export type Vista = 'inventario' | 'nuevo-producto' | 'movimientos';

export type OrdenTabla =
  | 'nombre-asc'
  | 'stock-asc'
  | 'stock-desc'
  | 'estado-bajo-primero'
  | 'estado-ok-primero';

export interface Categoria {
  id: number;
  nombre: string;
}

export interface ProductoVista {
  id: number;
  nombre: string;
  categoria: string;
  categoria_id: number;
  precio: number;
  stock_actual: number;
  stock_minimo: number;
  stock_bajo: boolean;
}

export type TipoMovimiento = 'entrada' | 'salida';

export interface Movimiento {
  id: number;
  producto_id: number;
  tipo: TipoMovimiento;
  cantidad: number;
  nota: string | null;
  creado_en: string;
}

export const OPCIONES_ORDEN: Array<{value: OrdenTabla; label: string}> = [
  {value: 'nombre-asc', label: 'Nombre (A–Z)'},
  {value: 'stock-asc', label: 'Stock (menor a mayor)'},
  {value: 'stock-desc', label: 'Stock (mayor a menor)'},
  {value: 'estado-bajo-primero', label: 'Estado (Stock bajo primero)'},
  {value: 'estado-ok-primero', label: 'Estado (OK primero)'},
];

export function formatearPrecio(valor: number): string {
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

export function formatearFechaMovimiento(iso: string): string {
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
