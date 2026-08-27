import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, Validators, NonNullableFormBuilder } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { AuthService } from '@core/services/auth.service';
import { mensajeErrorApi } from '@core/services/api-error.util';
import { AlertComponent } from '@shared/components/alert/alert';
import { ButtonComponent } from '@shared/components/button/button';
import { TextFieldComponent } from '@shared/components/text-field/text-field';

@Component({
  selector: 'app-login-page',
  imports: [ReactiveFormsModule, RouterLink, AlertComponent, ButtonComponent, TextFieldComponent],
  templateUrl: './login.page.html',
  styleUrl: './login.page.scss',
})
export class LoginPage {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly enviando = signal(false);
  protected readonly errorMensaje = signal<string | null>(null);
  protected readonly mostrarClave = signal(false);

  protected readonly form = this.fb.group({
    correoUsuario: this.fb.control('', [Validators.required, Validators.email]),
    claveAcceso: this.fb.control('', [Validators.required]),
  });

  protected enviar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.enviando.set(true);
    this.errorMensaje.set(null);

    this.auth.login(this.form.getRawValue()).subscribe({
      next: () => {
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') ?? '/app';
        this.router.navigateByUrl(returnUrl);
      },
      error: (error: unknown) => {
        this.enviando.set(false);
        this.errorMensaje.set(mensajeErrorApi(error, 'Correo o contraseña incorrectos.'));
      },
    });
  }
}
