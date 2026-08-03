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
  align?: 'start' | 'end' | 'center';
}
