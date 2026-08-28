import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  output,
  viewChild,
} from '@angular/core';

// Pad de firma manuscrita: se dibuja con dedo, lápiz o mouse (Pointer
// Events) sobre un <canvas>. Emite la firma como data URL PNG cada vez que
// se levanta el trazo, y `null` cuando se limpia. Sin librerías externas.
@Component({
  selector: 'app-firma-pad',
  templateUrl: './firma-pad.html',
  styleUrl: './firma-pad.scss',
})
export class FirmaPadComponent implements AfterViewInit, OnDestroy {
  private readonly canvasRef =
    viewChild.required<ElementRef<HTMLCanvasElement>>('lienzo');

  // data URL PNG mientras haya trazo, null cuando está vacío.
  public readonly firma = output<string | null>();

  private ctx!: CanvasRenderingContext2D;
  private dibujando = false;
  private hayTrazo = false;
  private ultimo: { x: number; y: number } | null = null;
  private readonly observer = new ResizeObserver(() => this.ajustarTamano());

  ngAfterViewInit(): void {
    const canvas = this.canvasRef().nativeElement;
    this.ctx = canvas.getContext('2d')!;
    this.ajustarTamano();
    this.observer.observe(canvas);
  }

  ngOnDestroy(): void {
    this.observer.disconnect();
  }

  protected get vacio(): boolean {
    return !this.hayTrazo;
  }

  // Reasignar canvas.width/height reinicia el contexto (incluida la
  // transformación), así que el escalado por devicePixelRatio se aplica una
  // sola vez y no se acumula entre redimensiones.
  private ajustarTamano(): void {
    const canvas = this.canvasRef().nativeElement;
    const rect = canvas.getBoundingClientRect();
    if (rect.width === 0) {
      return;
    }
    const dpr = window.devicePixelRatio || 1;
    const previa = this.hayTrazo ? canvas.toDataURL() : null;

    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);
    this.ctx.scale(dpr, dpr);
    this.ctx.lineWidth = 2;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
    this.ctx.strokeStyle = '#252525';

    if (previa) {
      const img = new Image();
      img.onload = () => this.ctx.drawImage(img, 0, 0, rect.width, rect.height);
      img.src = previa;
    }
  }

  private posicion(evento: PointerEvent): { x: number; y: number } {
    const rect = this.canvasRef().nativeElement.getBoundingClientRect();
    return { x: evento.clientX - rect.left, y: evento.clientY - rect.top };
  }

  protected inicio(evento: PointerEvent): void {
    evento.preventDefault();
    this.canvasRef().nativeElement.setPointerCapture(evento.pointerId);
    this.dibujando = true;
    this.ultimo = this.posicion(evento);
  }

  protected mover(evento: PointerEvent): void {
    if (!this.dibujando || !this.ultimo) {
      return;
    }
    evento.preventDefault();
    const punto = this.posicion(evento);
    this.ctx.beginPath();
    this.ctx.moveTo(this.ultimo.x, this.ultimo.y);
    this.ctx.lineTo(punto.x, punto.y);
    this.ctx.stroke();
    this.ultimo = punto;
    this.hayTrazo = true;
  }

  protected fin(): void {
    if (!this.dibujando) {
      return;
    }
    this.dibujando = false;
    this.ultimo = null;
    this.firma.emit(
      this.hayTrazo
        ? this.canvasRef().nativeElement.toDataURL('image/png')
        : null,
    );
  }

  protected limpiar(): void {
    const canvas = this.canvasRef().nativeElement;
    this.ctx.clearRect(0, 0, canvas.width, canvas.height);
    this.hayTrazo = false;
    this.firma.emit(null);
  }
}
