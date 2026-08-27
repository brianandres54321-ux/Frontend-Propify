import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { RoleNames } from '@core/constants';
import { EstadoReporte, Inmueble, ReporteDano, Unidad } from '@core/models';
import { AuthService } from '@core/services/auth.service';
import { mensajeErrorApi } from '@core/services/api-error.util';
import { InmueblesService } from '@core/services/inmuebles.service';
import { ReportesDanoService } from '@core/services/reportes-dano.service';
import { UnidadesService } from '@core/services/unidades.service';
import { AlertComponent } from '@shared/components/alert/alert';
import { ButtonComponent } from '@shared/components/button/button';
import { LoadingComponent } from '@shared/components/loading/loading';
import { TableComponent } from '@shared/components/table/table';
import { TextFieldComponent } from '@shared/components/text-field/text-field';
import { TableBadgeVariant, TableColumn } from '@shared/interfaces';

const ETIQUETA_ESTADO: Record<EstadoReporte, string> = {
  [EstadoReporte.PENDIENTE]: 'Pendiente',
  [EstadoReporte.EN_PROCESO]: 'En proceso',
  [EstadoReporte.RESUELTO]: 'Resuelto',
};

const VARIANTE_ESTADO: Record<EstadoReporte, TableBadgeVariant> = {
  [EstadoReporte.PENDIENTE]: 'warning',
  [EstadoReporte.EN_PROCESO]: 'info',
  [EstadoReporte.RESUELTO]: 'success',
};

function formatoFecha(valor: string): string {
  return new Date(valor).toLocaleDateString('es-CO');
}

// Vista distinta por rol: DUEÑO/ADMIN ven y resuelven los reportes de sus
// unidades; RESIDENTE solo puede crear uno (el backend no expone un
// "listar los míos" para ese rol — ver ReportesDanoController).
@Component({
  selector: 'app-reportes-dano-page',
  imports: [
    ReactiveFormsModule,
    AlertComponent,
    ButtonComponent,
    LoadingComponent,
    TableComponent,
    TextFieldComponent,
  ],
  templateUrl: './reportes-dano.page.html',
  styleUrl: './reportes-dano.page.scss',
})
export class ReportesDanoPage implements OnInit {
  private readonly inmueblesService = inject(InmueblesService);
  private readonly unidadesService = inject(UnidadesService);
  private readonly reportesDanoService = inject(ReportesDanoService);
  private readonly auth = inject(AuthService);
  private readonly fb = inject(NonNullableFormBuilder);

  protected readonly esDuenoAdmin = computed(() =>
    this.auth.tieneRol(RoleNames.DUENO, RoleNames.ADMIN),
  );
  protected readonly esResidente = computed(() => this.auth.tieneRol(RoleNames.RESIDENTE));

  protected readonly formatoFecha = formatoFecha;
  protected readonly EstadoReporte = EstadoReporte;

  // ---------- DUEÑO / ADMIN ----------

  protected readonly inmuebles = signal<Inmueble[]>([]);
  protected readonly unidades = signal<Unidad[]>([]);
  protected readonly inmuebleSeleccionado = signal<number | ''>('');
  protected readonly unidadSeleccionada = signal<number | ''>('');
  protected readonly reportes = signal<ReporteDano[]>([]);
  protected readonly cargando = signal(true);
  protected readonly errorMensaje = signal<string | null>(null);

  protected readonly columnas: TableColumn<ReporteDano>[] = [
    { key: 'descripcion', label: 'Descripción' },
    { key: 'creadoEn', label: 'Fecha', valor: (f) => formatoFecha(f.creadoEn) },
    {
      key: 'estado',
      label: 'Estado',
      badge: (f) => ({ texto: ETIQUETA_ESTADO[f.estado], variante: VARIANTE_ESTADO[f.estado] }),
    },
  ];

  // ---------- RESIDENTE ----------

  protected readonly enviando = signal(false);
  protected readonly enviado = signal(false);
  protected readonly errorEnvio = signal<string | null>(null);
  protected readonly formularioReporte = this.fb.group({
    descripcion: ['', [Validators.required, Validators.maxLength(2000)]],
    fotoUrl: [''],
  });

  ngOnInit(): void {
    if (this.esDuenoAdmin()) {
      this.cargarInmuebles();
    }
  }

  private cargarInmuebles(): void {
    this.inmueblesService.consultar().subscribe({
      next: (inmuebles) => {
        this.inmuebles.set(inmuebles);
        if (inmuebles.length > 0) {
          this.inmuebleSeleccionado.set(inmuebles[0].codInmueble);
          this.cargarUnidades();
        } else {
          this.cargando.set(false);
        }
      },
      error: () => {
        this.inmuebles.set([]);
        this.cargando.set(false);
      },
    });
  }

  protected cambiarInmueble(valor: string): void {
    this.inmuebleSeleccionado.set(valor ? Number(valor) : '');
    this.cargarUnidades();
  }

  protected cambiarUnidad(valor: string): void {
    this.unidadSeleccionada.set(valor ? Number(valor) : '');
    this.cargarReportes();
  }

  private cargarUnidades(): void {
    const inmuebleId = this.inmuebleSeleccionado();
    if (!inmuebleId) {
      this.unidades.set([]);
      this.unidadSeleccionada.set('');
      this.cargarReportes();
      return;
    }

    this.unidadesService.consultar(inmuebleId).subscribe({
      next: (unidades) => {
        this.unidades.set(unidades);
        this.unidadSeleccionada.set(unidades.length > 0 ? unidades[0].codUnidad : '');
        this.cargarReportes();
      },
      error: (error: unknown) => {
        this.cargando.set(false);
        this.errorMensaje.set(mensajeErrorApi(error, 'No se pudieron cargar las unidades.'));
      },
    });
  }

  private cargarReportes(): void {
    const unidadId = this.unidadSeleccionada();
    if (!unidadId) {
      this.reportes.set([]);
      this.cargando.set(false);
      return;
    }

    this.cargando.set(true);
    this.errorMensaje.set(null);

    this.reportesDanoService.consultar(unidadId).subscribe({
      next: (reportes) => {
        this.reportes.set(reportes);
        this.cargando.set(false);
      },
      error: (error: unknown) => {
        this.cargando.set(false);
        this.errorMensaje.set(mensajeErrorApi(error, 'No se pudieron cargar los reportes.'));
      },
    });
  }

  protected marcarEstado(reporte: ReporteDano, estado: EstadoReporte): void {
    this.reportesDanoService.actualizar(reporte.codReporte, { estado }).subscribe({
      next: () => this.cargarReportes(),
      error: (error: unknown) =>
        this.errorMensaje.set(mensajeErrorApi(error, 'No se pudo actualizar el reporte.')),
    });
  }

  protected enviarReporte(): void {
    if (this.formularioReporte.invalid) {
      this.formularioReporte.markAllAsTouched();
      return;
    }

    this.enviando.set(true);
    this.errorEnvio.set(null);
    const { descripcion, fotoUrl } = this.formularioReporte.getRawValue();

    this.reportesDanoService
      .registrar({ descripcion, fotoUrl: fotoUrl.trim() || undefined })
      .subscribe({
        next: () => {
          this.enviando.set(false);
          this.enviado.set(true);
          this.formularioReporte.reset({ descripcion: '', fotoUrl: '' });
        },
        error: (error: unknown) => {
          this.enviando.set(false);
          this.errorEnvio.set(mensajeErrorApi(error, 'No se pudo enviar el reporte.'));
        },
      });
  }
}
