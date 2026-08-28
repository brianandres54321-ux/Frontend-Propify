export type TableBadgeVariant = 'primary' | 'success' | 'warning' | 'danger' | 'info';

export interface TableBadge {
  texto: string;
  variante: TableBadgeVariant;
}

export interface TableColumn<T> {
  key: string;
  label: string;
  // Si no se define, se muestra fila[key] tal cual.
  valor?: (fila: T) => string | number;
  // Si se define, la celda se pinta como una píldora de color en vez de
  // texto plano (p. ej. "Activo" en verde, "3 días" en rojo).
  badge?: (fila: T) => TableBadge;
  // Si se define, la celda muestra una imagen (src). Devuelve null/'' para
  // mostrar un guion. Pensado para miniaturas: firmas, avatares, etc.
  imagen?: (fila: T) => string | null | undefined;
  align?: 'start' | 'end' | 'center';
}
