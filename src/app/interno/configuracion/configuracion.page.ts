import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbNavModule } from '@ng-bootstrap/ng-bootstrap';

import { RoleNames } from '@core/constants';
import { PerfilUsuario } from '@core/models';
import { mensajeErrorApi } from '@core/services/api-error.util';
import { AuthService } from '@core/services/auth.service';
import {
  PASSWORD_REGEX_MESSAGE,
  passwordSeguraValidator,
  passwordsCoincidenValidator,
} from '@core/services/password.validator';
import { TenantsService } from '@core/services/tenants.service';
import { ThemeService } from '@core/services/theme.service';
import { UsuariosService } from '@core/services/usuarios.service';
import { AlertComponent } from '@shared/components/alert/alert';
import { ButtonComponent } from '@shared/components/button/button';
import { LoadingComponent } from '@shared/components/loading/loading';
import { TextFieldComponent } from '@shared/components/text-field/text-field';

// Módulo de Configuración: consolida en un solo lugar acciones que antes
// vivían dispersas (ej. el teléfono de contacto se editaba desde
// Inmuebles) y agrega las que faltaban (cambio de contraseña, que ya
// tenía servicio en AuthService pero ningún formulario lo usaba).
// Accesible a cualquier rol; las pestañas de tenant (Empresa, Información
// de contacto) solo se muestran a DUEÑO — el resto de roles no puede
// tocar esos datos (ver propify_especificacion.md §3).
@Component({
  selector: 'app-configuracion-page',
  imports: [
    ReactiveFormsModule,
    NgbNavModule,
    AlertComponent,
    ButtonComponent,
    LoadingComponent,
    TextFieldComponent,
  ],
  templateUrl: './configuracion.page.html',
  styleUrl: './configuracion.page.scss',
})
export class ConfiguracionPage implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly usuariosService = inject(UsuariosService);
  private readonly tenantsService = inject(TenantsService);
  protected readonly themeService = inject(ThemeService);
  private readonly fb = inject(NonNullableFormBuilder);

  protected readonly esDueno = computed(() => this.auth.tieneRol(RoleNames.DUENO));
  protected readonly pestanaActiva = signal(1);
  protected readonly passwordHint = PASSWORD_REGEX_MESSAGE;

  // ---------- Mi perfil ----------
  protected readonly perfil = signal<PerfilUsuario | null>(null);
  protected readonly cargandoPerfil = signal(true);

  // ---------- Empresa ----------
  protected readonly tenant = this.tenantsService.tenant;
  protected readonly guardandoEmpresa = signal(false);
  protected readonly errorEmpresa = signal<string | null>(null);
  protected readonly exitoEmpresa = signal(false);
  protected readonly empresaForm = this.fb.group({
    nombre: this.fb.control('', [Validators.required, Validators.minLength(2)]),
    colorPrimario: this.fb.control(''),
    colorSecundario: this.fb.control(''),
    logoUrl: this.fb.control(''),
  });

  // ---------- Información de contacto ----------
  protected readonly guardandoContacto = signal(false);
  protected readonly errorContacto = signal<string | null>(null);
  protected readonly exitoContacto = signal(false);
  protected readonly contactoForm = this.fb.group({
    telefonoContacto: this.fb.control(''),
  });

  // ---------- Seguridad ----------
  protected readonly cambiandoClave = signal(false);
  protected readonly errorClave = signal<string | null>(null);
  protected readonly exitoClave = signal(false);
  protected readonly claveForm = this.fb.group(
    {
      claveActual: this.fb.control('', [Validators.required]),
      nuevaClave: this.fb.control('', [Validators.required, passwordSeguraValidator()]),
      confirmarClave: this.fb.control('', [Validators.required]),
    },
    { validators: passwordsCoincidenValidator('nuevaClave', 'confirmarClave') },
  );

  ngOnInit(): void {
    this.usuariosService.consultarPerfil().subscribe({
      next: (perfil) => {
        this.perfil.set(perfil);
        this.cargandoPerfil.set(false);
      },
      error: () => this.cargandoPerfil.set(false),
    });

    if (this.esDueno()) {
      if (this.tenant()) {
        this.precargarFormulariosTenant();
      } else {
        // InternoLayout ya lo consulta al entrar a /app — esto es solo una
        // red de seguridad si por algún motivo todavía no llegó.
        this.tenantsService.consultarPropio().subscribe({
          next: () => this.precargarFormulariosTenant(),
          error: () => undefined,
        });
      }
    }
  }

  private precargarFormulariosTenant(): void {
    const datosTenant = this.tenant();
    if (!datosTenant) {
      return;
    }
    this.empresaForm.patchValue({
      nombre: datosTenant.nombre,
      colorPrimario: datosTenant.colorPrimario ?? '',
      colorSecundario: datosTenant.colorSecundario ?? '',
      logoUrl: datosTenant.logoUrl ?? '',
    });
    this.contactoForm.patchValue({
      telefonoContacto: datosTenant.telefonoContacto ?? '',
    });
  }

  protected guardarEmpresa(): void {
    if (this.empresaForm.invalid) {
      this.empresaForm.markAllAsTouched();
      return;
    }
    this.guardandoEmpresa.set(true);
    this.errorEmpresa.set(null);
    this.exitoEmpresa.set(false);

    const { nombre, colorPrimario, colorSecundario, logoUrl } = this.empresaForm.getRawValue();

    this.tenantsService
      .actualizarContacto({
        nombre,
        colorPrimario: colorPrimario || undefined,
        colorSecundario: colorSecundario || undefined,
        logoUrl: logoUrl || undefined,
      })
      .subscribe({
        next: () => {
          this.guardandoEmpresa.set(false);
          this.exitoEmpresa.set(true);
        },
        error: (error: unknown) => {
          this.guardandoEmpresa.set(false);
          this.errorEmpresa.set(
            mensajeErrorApi(error, 'No se pudo guardar la información de la empresa.'),
          );
        },
      });
  }

  protected guardarContacto(): void {
    this.guardandoContacto.set(true);
    this.errorContacto.set(null);
    this.exitoContacto.set(false);
    const telefonoContacto = this.contactoForm.getRawValue().telefonoContacto.trim();

    this.tenantsService.actualizarContacto({ telefonoContacto }).subscribe({
      next: () => {
        this.guardandoContacto.set(false);
        this.exitoContacto.set(true);
      },
      error: (error: unknown) => {
        this.guardandoContacto.set(false);
        this.errorContacto.set(mensajeErrorApi(error, 'No se pudo guardar el teléfono.'));
      },
    });
  }

  protected cambiarClave(): void {
    if (this.claveForm.invalid) {
      this.claveForm.markAllAsTouched();
      return;
    }
    this.cambiandoClave.set(true);
    this.errorClave.set(null);
    this.exitoClave.set(false);
    const { claveActual, nuevaClave } = this.claveForm.getRawValue();

    this.auth.cambiarPassword({ claveActual, nuevaClave }).subscribe({
      next: () => {
        this.cambiandoClave.set(false);
        this.exitoClave.set(true);
        this.claveForm.reset();
      },
      error: (error: unknown) => {
        this.cambiandoClave.set(false);
        this.errorClave.set(mensajeErrorApi(error, 'No se pudo cambiar la contraseña.'));
      },
    });
  }
}
