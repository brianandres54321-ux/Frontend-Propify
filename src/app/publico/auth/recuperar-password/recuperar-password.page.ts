import { Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { AuthService } from '@core/services/auth.service';
import { mensajeErrorApi } from '@core/utils';
import { AlertComponent } from '@shared/components/alert/alert';
import { ButtonComponent } from '@shared/components/button/button';
import { TextFieldComponent } from '@shared/components/text-field/text-field';

// Paso 1 del flujo de recuperación: el usuario pide el enlace por correo.
// El backend responde SIEMPRE con el mismo mensaje genérico (exista o no la
// cuenta) para no filtrar qué correos están registrados — por eso al éxito
// se muestra ese texto tal cual, sin prometer que el correo llegó.
@Component({
  selector: 'app-recuperar-password-page',
  imports: [ReactiveFormsModule, RouterLink, AlertComponent, ButtonComponent, TextFieldComponent],
  templateUrl: './recuperar-password.page.html',
  styleUrl: './recuperar-password.page.scss',
})
export class RecuperarPasswordPage {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly auth = inject(AuthService);

  protected readonly enviando = signal(false);
  protected readonly errorMensaje = signal<string | null>(null);
  protected readonly mensajeExito = signal<string | null>(null);

  protected readonly form = this.fb.group({
    correoUsuario: this.fb.control('', [Validators.required, Validators.email]),
  });

  protected enviar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.enviando.set(true);
    this.errorMensaje.set(null);

    this.auth.recuperarPassword(this.form.getRawValue()).subscribe({
      next: (respuesta) => {
        this.enviando.set(false);
        this.mensajeExito.set(respuesta.mensaje);
      },
      error: (error: unknown) => {
        this.enviando.set(false);
        this.errorMensaje.set(
          mensajeErrorApi(error, 'No se pudo procesar la solicitud. Intenta de nuevo.'),
        );
      },
    });
  }
}
