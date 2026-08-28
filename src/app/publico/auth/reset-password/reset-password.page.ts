import { Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

import { AuthService } from '@core/services/auth.service';
import { mensajeErrorApi } from '@core/utils';
import {
  PASSWORD_REGEX_MESSAGE,
  passwordSeguraValidator,
  passwordsCoincidenValidator,
} from '@shared/validators';
import { AlertComponent } from '@shared/components/alert/alert';
import { ButtonComponent } from '@shared/components/button/button';
import { TextFieldComponent } from '@shared/components/text-field/text-field';

// Paso 2 del flujo: se llega aquí desde el enlace del correo
// (/reset-password/:token). El token en texto plano solo existe en la URL;
// el backend lo valida contra su hash y verifica que no esté usado ni
// vencido (15 min) — ver registros.service.ts → cambiarContrasenia().
@Component({
  selector: 'app-reset-password-page',
  imports: [ReactiveFormsModule, RouterLink, AlertComponent, ButtonComponent, TextFieldComponent],
  templateUrl: './reset-password.page.html',
  styleUrl: './reset-password.page.scss',
})
export class ResetPasswordPage {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly auth = inject(AuthService);
  private readonly route = inject(ActivatedRoute);

  private readonly token = this.route.snapshot.paramMap.get('token') ?? '';

  protected readonly passwordHint = PASSWORD_REGEX_MESSAGE;
  protected readonly enviando = signal(false);
  protected readonly errorMensaje = signal<string | null>(null);
  protected readonly exito = signal(false);
  // El enlace ya no sirve (token inválido/usado/vencido, o URL sin token):
  // se oculta el formulario y se ofrece pedir uno nuevo.
  protected readonly enlaceInvalido = signal(!this.token);
  protected readonly mostrarClave = signal(false);
  protected readonly mostrarConfirmar = signal(false);

  protected readonly form = this.fb.group(
    {
      nuevaClave: this.fb.control('', [Validators.required, passwordSeguraValidator()]),
      confirmarClave: this.fb.control('', [Validators.required]),
    },
    { validators: passwordsCoincidenValidator('nuevaClave', 'confirmarClave') },
  );

  protected enviar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.enviando.set(true);
    this.errorMensaje.set(null);

    this.auth
      .nuevaPassword({ token: this.token, nuevaClave: this.form.getRawValue().nuevaClave })
      .subscribe({
        next: () => {
          this.enviando.set(false);
          this.exito.set(true);
        },
        error: (error: unknown) => {
          this.enviando.set(false);
          if (error instanceof HttpErrorResponse && error.status === 401) {
            this.enlaceInvalido.set(true);
            return;
          }
          this.errorMensaje.set(
            mensajeErrorApi(error, 'No se pudo cambiar la contraseña. Intenta de nuevo.'),
          );
        },
      });
  }
}
