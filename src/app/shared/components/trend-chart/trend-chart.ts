import { Component, computed, input, signal } from '@angular/core';

export interface SerieTendencia {
  nombre: string;
  // Un CSS var(...) o color literal — se usa tal cual como fill del SVG.
  color: string;
  valores: number[];
}

interface BarraVista {
  x: number;
  y: number;
  ancho: number;
  alto: number;
  path: string;
  color: string;
  serie: string;
  valor: number;
}

interface GrupoVista {
  etiqueta: string;
  centroX: number;
  hitX: number;
  hitAncho: number;
  barras: BarraVista[];
}

interface GridlineVista {
  y: number;
  etiqueta: string;
}

const ANCHO = 700;
const ALTO = 260;
const PADDING_IZQ = 60;
const PADDING_DER = 12;
const PADDING_SUP = 16;
const PADDING_INF = 32;
const ANCHO_BARRA_MAX = 24;
const GAP_BARRAS = 2;
const RADIO_ESQUINA = 4;

// Redondea hacia arriba al "número bonito" más cercano (1/2/5 × 10^n) —
// mismo criterio que pide marks-and-anatomy.md para los ticks del eje Y.
function numeroBonito(valor: number): number {
  if (valor <= 0) return 1;
  const exponente = Math.floor(Math.log10(valor));
  const base = Math.pow(10, exponente);
  const fraccion = valor / base;
  const pasos = [1, 2, 5, 10];
  const paso = pasos.find((p) => fraccion <= p) ?? 10;
  return paso * base;
}

function rectRedondeadaArriba(x: number, y: number, ancho: number, alto: number): string {
  if (alto <= 0 || ancho <= 0) return '';
  const r = Math.min(RADIO_ESQUINA, alto, ancho / 2);
  return [
    `M ${x} ${y + r}`,
    `Q ${x} ${y} ${x + r} ${y}`,
    `L ${x + ancho - r} ${y}`,
    `Q ${x + ancho} ${y} ${x + ancho} ${y + r}`,
    `L ${x + ancho} ${y + alto}`,
    `L ${x} ${y + alto}`,
    'Z',
  ].join(' ');
}

// Gráfico de barras agrupadas genérico (2-3 series) para tendencias
// mensuales — ver skill de dataviz: marcas ≤24px, esquinas redondeadas
// arriba, gap de 2px entre barras, gridlines hairline, leyenda + tabla
// alternativa siempre presentes, tooltip por grupo accesible por teclado.
@Component({
  selector: 'app-trend-chart',
  templateUrl: './trend-chart.html',
  styleUrl: './trend-chart.scss',
})
export class TrendChartComponent {
  public readonly etiquetas = input.required<string[]>();
  public readonly series = input.required<SerieTendencia[]>();
  public readonly formatoValor = input<(valor: number) => string>((valor) =>
    valor.toLocaleString('es-CO'),
  );

  protected readonly viewBox = `0 0 ${ANCHO} ${ALTO}`;
  protected readonly mostrarTabla = signal(false);
  protected readonly indiceActivo = signal<number | null>(null);

  // Expuestos para el template — evita duplicar constantes mágicas en el HTML.
  protected readonly ejeXInicio = PADDING_IZQ;
  protected readonly ejeXFin = ANCHO - PADDING_DER;
  protected readonly ejeXTextoY = ALTO - PADDING_INF + 20;
  protected readonly hitY = PADDING_SUP;
  protected readonly hitAlto = ALTO - PADDING_SUP - PADDING_INF;

  private readonly altoGrafico = this.hitAlto;

  protected readonly maxValor = computed(() =>
    numeroBonito(Math.max(1, ...this.series().flatMap((s) => s.valores))),
  );

  protected readonly gridlines = computed<GridlineVista[]>(() => {
    const max = this.maxValor();
    return [0, 0.25, 0.5, 0.75, 1].map((fraccion) => ({
      y: PADDING_SUP + this.altoGrafico * (1 - fraccion),
      etiqueta: Math.round(max * fraccion).toLocaleString('es-CO'),
    }));
  });

  protected readonly grupos = computed<GrupoVista[]>(() => {
    const etiquetas = this.etiquetas();
    const series = this.series();
    const max = this.maxValor();
    const n = etiquetas.length;
    if (n === 0) return [];

    const anchoGrupo = (ANCHO - PADDING_IZQ - PADDING_DER) / n;
    const anchoBarra = Math.min(
      ANCHO_BARRA_MAX,
      Math.max(4, (anchoGrupo - 12 - GAP_BARRAS * (series.length - 1)) / series.length),
    );
    const anchoInternoGrupo = anchoBarra * series.length + GAP_BARRAS * (series.length - 1);

    return etiquetas.map((etiqueta, i) => {
      const inicioGrupo = PADDING_IZQ + i * anchoGrupo + (anchoGrupo - anchoInternoGrupo) / 2;

      const barras: BarraVista[] = series.map((serie, j) => {
        const valor = serie.valores[i] ?? 0;
        const alto = max > 0 ? (valor / max) * this.altoGrafico : 0;
        const x = inicioGrupo + j * (anchoBarra + GAP_BARRAS);
        const y = PADDING_SUP + (this.altoGrafico - alto);
        return {
          x,
          y,
          ancho: anchoBarra,
          alto,
          path: rectRedondeadaArriba(x, y, anchoBarra, alto),
          color: serie.color,
          serie: serie.nombre,
          valor,
        };
      });

      return {
        etiqueta,
        centroX: inicioGrupo + anchoInternoGrupo / 2,
        hitX: PADDING_IZQ + i * anchoGrupo,
        hitAncho: anchoGrupo,
        barras,
      };
    });
  });

  protected readonly grupoActivo = computed(() => {
    const indice = this.indiceActivo();
    return indice === null ? null : (this.grupos()[indice] ?? null);
  });

  // Clamp horizontal para que el tooltip no se salga del viewBox cerca de
  // los bordes izquierdo/derecho.
  protected readonly tooltipX = computed(() => {
    const grupo = this.grupoActivo();
    if (!grupo) return 0;
    const anchoTooltip = 160;
    return Math.min(Math.max(grupo.centroX - anchoTooltip / 2, 4), ANCHO - anchoTooltip - 4);
  });

  protected activar(indice: number): void {
    this.indiceActivo.set(indice);
  }

  protected desactivar(): void {
    this.indiceActivo.set(null);
  }

  protected toggleTabla(): void {
    this.mostrarTabla.update((valor) => !valor);
  }
}
