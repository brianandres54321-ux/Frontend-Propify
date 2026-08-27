import { AfterViewInit, Directive, ElementRef, OnDestroy, inject } from '@angular/core';

// Agrega la clase .revelado la primera vez que el elemento entra en el
// viewport — combinado con la transición CSS .revelar-scroll (ver
// styles.scss) da un fade-in + subida suave al hacer scroll. Se
// desconecta después de revelar una vez (no vuelve a ocultarse).
@Directive({
  selector: '[appRevelarAlScroll]',
})
export class RevelarAlScrollDirective implements AfterViewInit, OnDestroy {
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private observador?: IntersectionObserver;

  ngAfterViewInit(): void {
    const elemento = this.elementRef.nativeElement;
    elemento.classList.add('revelar-scroll');

    if (typeof IntersectionObserver === 'undefined') {
      elemento.classList.add('revelado');
      return;
    }

    this.observador = new IntersectionObserver(
      (entradas) => {
        for (const entrada of entradas) {
          if (entrada.isIntersecting) {
            elemento.classList.add('revelado');
            this.observador?.unobserve(elemento);
          }
        }
      },
      { threshold: 0.15 },
    );
    this.observador.observe(elemento);
  }

  ngOnDestroy(): void {
    this.observador?.disconnect();
  }
}
