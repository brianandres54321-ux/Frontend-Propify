import { Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { ContactoService } from '@core/services/contacto.service';
import { mensajeErrorApi } from '@core/utils';
import { AlertComponent } from '@shared/components/alert/alert';
import { ButtonComponent } from '@shared/components/button/button';
import { TextFieldComponent } from '@shared/components/text-field/text-field';

// Formulario público de contacto — POST /publico/contacto (envía un correo al
// buzón de soporte, no persiste nada).
@Component({
  selector: 'app-contacto-page',
  imports: [ReactiveFormsModule, AlertComponent, ButtonComponent, TextFieldComponent],
  templateUrl: './contacto.page.html',
  styleUrl: './contacto.page.scss',
})
export class ContactoPage {
  private readonly contactoService = inject(ContactoService);
  private readonly fb = inject(NonNullableFormBuilder);

  protected readonly enviando = signal(false);
  protected readonly errorMensaje = signal<string | null>(null);
  protected readonly exito = signal<string | null>(null);

  protected readonly form = this.fb.group({
    nombre: ['', [Validators.required, Validators.maxLength(120)]],
    correo: ['', [Validators.required, Validators.email, Validators.maxLength(180)]],
    telefono: ['', [Validators.maxLength(40)]],
    asunto: ['', [Validators.maxLength(150)]],
    mensaje: ['', [Validators.required, Validators.maxLength(3000)]],
  });

  protected enviar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.enviando.set(true);
    this.errorMensaje.set(null);
    const v = this.form.getRawValue();

    this.contactoService
      .enviarMensaje({
        nombre: v.nombre.trim(),
        correo: v.correo.trim(),
        telefono: v.telefono.trim() || undefined,
        asunto: v.asunto.trim() || undefined,
        mensaje: v.mensaje.trim(),
      })
      .subscribe({
        next: (respuesta) => {
          this.enviando.set(false);
          this.exito.set(respuesta.mensaje);
          this.form.reset();
        },
        error: (error: unknown) => {
          this.enviando.set(false);
          this.errorMensaje.set(
            mensajeErrorApi(error, 'No se pudo enviar tu mensaje. Intenta de nuevo.'),
          );
        },
      });
  }
}
