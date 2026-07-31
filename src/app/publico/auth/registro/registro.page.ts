import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, Validators, NonNullableFormBuilder } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { PlanTipo } from '../../../core/models';
import { AuthService } from '../../../core/services/auth.service';
import {
  PASSWORD_REGEX_MESSAGE,
  passwordSeguraValidator,
  passwordsCoincidenValidator,
} from '../../../core/services/password.validator';
import { mensajeErrorApi } from '../../../core/services/api-error.util';
import { AlertComponent } from '../../../shared/components/alert/alert';
import { ButtonComponent } from '../../../shared/components/button/button';
import { TextFieldComponent } from '../../../shared/components/text-field/text-field';

interface OpcionPlan {
  valor: PlanTipo;
  titulo: string;
  descripcion: string;
}

// Alta de un tenant nuevo (nuevo cliente de Propify): crea el conjunto/edificio
// y su usuario dueño. Unirse a un tenant ya existente (con código de invitación)
// queda para cuando se construya ese flujo específico.
@Component({
  selector: 'app-registro-page',
  imports: [ReactiveFormsModule, RouterLink, AlertComponent, ButtonComponent, TextFieldComponent],
  templateUrl: './registro.page.html',
  styleUrl: './registro.page.scss',
})
export class RegistroPage {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly passwordHint = PASSWORD_REGEX_MESSAGE;
  protected readonly enviando = signal(false);
  protected readonly errorMensaje = signal<string | null>(null);

  // Categoría del cliente — hoy es informativa (no limita módulos por sí
  // sola, eso lo controla cada inmueble con tieneTorres/tieneZonasComunes/
  // etc.), pero conviene capturarla desde el alta para poder usarla más
  // adelante (ej. precargar esos flags al crear el primer inmueble).
  protected readonly opcionesPlan: OpcionPlan[] = [
    {
      valor: PlanTipo.CASAS,
      titulo: 'Casas',
      descripcion: 'Viviendas individuales o en arriendo, sin torres.',
    },
    {
      valor: PlanTipo.EDIFICIOS,
      titulo: 'Edificio',
      descripcion: 'Un solo inmueble organizado en torres y pisos.',
    },
    {
      valor: PlanTipo.CONJUNTOS,
      titulo: 'Conjunto',
      descripcion: 'Varias casas o torres con zonas comunes compartidas.',
    },
  ];

  protected readonly form = this.fb.group(
    {
      nombreTenant: this.fb.control('', [Validators.required, Validators.minLength(2)]),
      plan: this.fb.control<PlanTipo>(PlanTipo.CASAS, [Validators.required]),
      nombreUsuario: this.fb.control('', [Validators.required, Validators.minLength(2)]),
      correoUsuario: this.fb.control('', [Validators.required, Validators.email]),
      claveAcceso: this.fb.control('', [Validators.required, passwordSeguraValidator()]),
      confirmarClave: this.fb.control('', [Validators.required]),
    },
    { validators: passwordsCoincidenValidator('claveAcceso', 'confirmarClave') },
  );

  protected enviar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.enviando.set(true);
    this.errorMensaje.set(null);

    const { confirmarClave, ...datos } = this.form.getRawValue();
    void confirmarClave;

    this.auth.registrarTenant(datos).subscribe({
      next: () => this.router.navigateByUrl('/app'),
      error: (error: unknown) => {
        this.enviando.set(false);
        this.errorMensaje.set(mensajeErrorApi(error, 'No se pudo crear la cuenta.'));
      },
    });
  }
}
