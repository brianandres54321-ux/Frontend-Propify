import {
  Directive,
  ElementRef,
  HostListener,
  Renderer2,
  forwardRef,
} from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';

// Formatea un <input> como precio colombiano (separador de miles con
// puntos) mientras se escribe, pero el FormControl guarda siempre el
// number real (sin puntos) — el back recibe el número, no el texto
// formateado. Uso: <input type="text" inputmode="numeric" appMoneda
// formControlName="valorMensual" />
@Directive({
  selector: 'input[appMoneda]',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MonedaInputDirective),
      multi: true,
    },
  ],
})
export class MonedaInputDirective implements ControlValueAccessor {
  private onChange: (valor: number | null) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  constructor(
    private readonly el: ElementRef<HTMLInputElement>,
    private readonly renderer: Renderer2,
  ) {}

  @HostListener('input', ['$event'])
  protected alEscribir(evento: Event): void {
    const valorCrudo = (evento.target as HTMLInputElement).value;
    const numero = this.aNumero(valorCrudo);
    this.onChange(numero);
    this.pintar(numero);
  }

  @HostListener('blur')
  protected alSalir(): void {
    this.onTouched();
  }

  public writeValue(valor: number | null): void {
    this.pintar(valor);
  }

  public registerOnChange(fn: (valor: number | null) => void): void {
    this.onChange = fn;
  }

  public registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  public setDisabledState(estaDeshabilitado: boolean): void {
    this.renderer.setProperty(this.el.nativeElement, 'disabled', estaDeshabilitado);
  }

  private aNumero(valorCrudo: string): number | null {
    const soloDigitos = valorCrudo.replace(/\D/g, '');
    return soloDigitos ? Number(soloDigitos) : null;
  }

  private pintar(valor: number | null): void {
    const texto = valor != null ? valor.toLocaleString('es-CO') : '';
    this.renderer.setProperty(this.el.nativeElement, 'value', texto);
  }
}
