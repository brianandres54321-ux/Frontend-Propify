import { Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { mensajeErrorApi } from '@core/services/api-error.util';
import { PorteriaService } from '@core/services/porteria.service';
import { AlertComponent } from '@shared/components/alert/alert';
import { ButtonComponent } from '@shared/components/button/button';
import { TextFieldComponent } from '@shared/components/text-field/text-field';

// Autoservicio para RESIDENTE: autoriza un visitante propio con una ventana
// de tiempo, para que portería lo deje pasar sin llamar a preguntar (ver
// AutorizacionesPreviasController — solo el celador puede consultar
// autorizaciones vigentes, el residente solo puede crearlas).
@Component({
  selector: 'app-autorizar-visitante-page',
  imports: [ReactiveFormsModule, AlertComponent, ButtonComponent, TextFieldComponent],
  templateUrl: './autorizar-visitante.page.html',
  styleUrl: './autorizar-visitante.page.scss',
})
export class AutorizarVisitantePage {
  private readonly porteriaService = inject(PorteriaService);
  private readonly fb = inject(NonNullableFormBuilder);

  protected readonly enviando = signal(false);
  protected readonly enviado = signal(false);
  protected readonly errorEnvio = signal<string | null>(null);

  protected readonly formulario = this.fb.group({
    nombreEsperado: ['', [Validators.required, Validators.maxLength(250)]],
    notas: [''],
    ventanaInicio: ['', Validators.required],
    ventanaFin: ['', Validators.required],
  });

  protected enviar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    const { nombreEsperado, notas, ventanaInicio, ventanaFin } = this.formulario.getRawValue();

    if (new Date(ventanaInicio) >= new Date(ventanaFin)) {
      this.errorEnvio.set('La hora de inicio debe ser antes de la hora de fin.');
      return;
    }

    this.enviando.set(true);
    this.errorEnvio.set(null);

    this.porteriaService
      .registrarAutorizacion({
        nombreEsperado,
        notas: notas.trim() || undefined,
        ventanaInicio: new Date(ventanaInicio).toISOString(),
        ventanaFin: new Date(ventanaFin).toISOString(),
      })
      .subscribe({
        next: () => {
          this.enviando.set(false);
          this.enviado.set(true);
          this.formulario.reset({
            nombreEsperado: '',
            notas: '',
            ventanaInicio: '',
            ventanaFin: '',
          });
        },
        error: (error: unknown) => {
          this.enviando.set(false);
          this.errorEnvio.set(mensajeErrorApi(error, 'No se pudo registrar la autorización.'));
        },
      });
  }
}
