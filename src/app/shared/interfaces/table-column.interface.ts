export interface TableColumn<T> {
  key: string;
  label: string;
  // Si no se define, se muestra fila[key] tal cual.
  valor?: (fila: T) => string | number;
  align?: 'start' | 'end' | 'center';
}
