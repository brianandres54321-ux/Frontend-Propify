import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { RoleNames } from '../../../../core/constants/roles.constant';
import { Residente } from '../../../../core/models';
import { AuthService } from '../../../../core/services/auth.service';
import { mensajeErrorApi } from '../../../../core/services/api-error.util';
import { ResidentesService } from '../../../../core/services/residentes.service';
import { AlertComponent } from '../../../../shared/components/alert/alert';
import { ButtonComponent } from '../../../../shared/components/button/button';
import { ConfirmDialogService } from '../../../../shared/components/confirm-dialog/confirm-dialog.service';
import { LoadingComponent } from '../../../../shared/components/loading/loading';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination';
import { TableComponent } from '../../../../shared/components/table/table';
import { TableColumn } from '../../../../shared/interfaces/table-column.interface';
import { ResidenteFormModal } from './residente-form-modal';

const TAMANIO_PAGINA = 10;

// Las columnas `numeric` de Postgres llegan como string (ej. "850000.00"),
// no como number, aunque el modelo TS diga `number` — pg/TypeORM no las
// convierte para no perder precisión. Hay que forzar Number() antes de
// formatear (aplica a cualquier otro monto que venga del backend: pagos,
// gastos, precios de zonas comunes, etc).
function formatoMonto(valor: number): string {
  return '$' + Number(valor).toLocaleString('es-CO');
}

@Component({
  selector: 'app-residentes-page',
  imports: [
    RouterLink,
    AlertComponent,
    ButtonComponent,
    LoadingComponent,
    PaginationComponent,
    TableComponent,
  ],
  templateUrl: './residentes.page.html',
  styleUrl: './residentes.page.scss',
})
export class ResidentesPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly residentesService = inject(ResidentesService);
  private readonly modalService = inject(NgbModal);
  private readonly confirmDialog = inject(ConfirmDialogService);
  private readonly auth = inject(AuthService);

  protected readonly TAMANIO_PAGINA = TAMANIO_PAGINA;
  protected readonly inmuebleId = Number(this.route.snapshot.paramMap.get('inmuebleId'));
  protected readonly unidadId = Number(this.route.snapshot.paramMap.get('unidadId'));

  protected readonly residentes = signal<Residente[]>([]);
  protected readonly cargando = signal(true);
  protected readonly errorMensaje = signal<string | null>(null);
  protected readonly paginaActual = signal(1);

  protected readonly puedeGestionar = computed(() =>
    this.auth.tieneRol(RoleNames.DUENO, RoleNames.ADMIN),
  );

  protected readonly filasPagina = computed(() => {
    const inicio = (this.paginaActual() - 1) * TAMANIO_PAGINA;
    return this.residentes().slice(inicio, inicio + TAMANIO_PAGINA);
  });

  protected readonly columnas: TableColumn<Residente>[] = [
    { key: 'nombre', label: 'Nombre' },
    { key: 'telefono', label: 'Teléfono' },
    { key: 'correo', label: 'Correo', valor: (f) => f.correo ?? '—' },
    {
      key: 'esPropietario',
      label: 'Calidad',
      badge: (f) => ({
        texto: f.esPropietario ? 'Propietario' : 'Arrendatario',
        variante: f.esPropietario ? 'success' : 'info',
      }),
    },
    { key: 'valorMensual', label: 'Valor mensual', valor: (f) => formatoMonto(f.valorMensual) },
    { key: 'diaPago', label: 'Día de pago' },
  ];

  ngOnInit(): void {
    this.cargar();
  }

  private cargar(): void {
    this.cargando.set(true);
    this.residentesService.consultar(this.unidadId).subscribe({
      next: (residentes) => {
        this.residentes.set(residentes);
        this.cargando.set(false);
      },
      error: (error: unknown) => {
        this.cargando.set(false);
        this.errorMensaje.set(mensajeErrorApi(error, 'No se pudieron cargar los inquilinos.'));
      },
    });
  }

  protected abrirCrear(): void {
    const modalRef = this.modalService.open(ResidenteFormModal, { centered: true });
    const instancia: ResidenteFormModal = modalRef.componentInstance;
    instancia.modo = 'crear';

    modalRef.result.then(
      (datos) => {
        this.residentesService.registrar({ ...datos, codUnidad: this.unidadId }).subscribe({
          next: () => this.cargar(),
          error: (error: unknown) =>
            this.errorMensaje.set(mensajeErrorApi(error, 'No se pudo crear el inquilino.')),
        });
      },
      () => undefined,
    );
  }

  protected abrirEditar(residente: Residente): void {
    const modalRef = this.modalService.open(ResidenteFormModal, { centered: true });
    const instancia: ResidenteFormModal = modalRef.componentInstance;
    instancia.modo = 'editar';
    instancia.precargar(residente);

    modalRef.result.then(
      (datos) => {
        this.residentesService.actualizar(residente.codResidente, datos).subscribe({
          next: () => this.cargar(),
          error: (error: unknown) =>
            this.errorMensaje.set(mensajeErrorApi(error, 'No se pudo actualizar el inquilino.')),
        });
      },
      () => undefined,
    );
  }

  protected async eliminar(residente: Residente): Promise<void> {
    const confirmado = await this.confirmDialog.confirm({
      titulo: 'Eliminar inquilino',
      mensaje: `¿Eliminar a "${residente.nombre}"? Esta acción no se puede deshacer.`,
      textoConfirmar: 'Eliminar',
    });
    if (!confirmado) {
      return;
    }

    this.residentesService.eliminar(residente.codResidente).subscribe({
      next: () => this.cargar(),
      error: (error: unknown) =>
        this.errorMensaje.set(mensajeErrorApi(error, 'No se pudo eliminar el inquilino.')),
    });
  }

  protected subirContrato(residente: Residente, input: HTMLInputElement): void {
    const archivo = input.files?.[0];
    if (!archivo) return;

    this.residentesService.subirContrato(residente.codResidente, archivo).subscribe({
      next: () => {
        input.value = '';
        this.cargar();
      },
      error: (error: unknown) => {
        input.value = '';
        this.errorMensaje.set(mensajeErrorApi(error, 'No se pudo subir el contrato.'));
      },
    });
  }

  protected descargarContrato(residente: Residente): void {
    this.residentesService.descargarContrato(residente.codResidente).subscribe({
      next: (blob) => {
        const extension = residente.archivoContrato?.split('.').pop() ?? 'pdf';
        const url = URL.createObjectURL(blob);
        const enlace = document.createElement('a');
        enlace.href = url;
        enlace.download = `contrato-${residente.nombre.replace(/\s+/g, '-')}.${extension}`;
        enlace.click();
        URL.revokeObjectURL(url);
      },
      error: (error: unknown) =>
        this.errorMensaje.set(mensajeErrorApi(error, 'No se pudo descargar el contrato.')),
    });
  }
}
