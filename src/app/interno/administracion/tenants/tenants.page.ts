import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { PlanTipo, Tenant } from '@core/models';
import { mensajeErrorApi } from '@core/utils';
import { TenantsService } from '@core/services/tenants.service';
import { AlertComponent } from '@shared/components/alert/alert';
import { ButtonComponent } from '@shared/components/button/button';
import { LoadingComponent } from '@shared/components/loading/loading';
import { PaginationComponent } from '@shared/components/pagination/pagination';
import { TableComponent } from '@shared/components/table/table';
import { TableColumn } from '@shared/interfaces';

import { TenantFormModal } from './components/tenant-form-modal';

const ETIQUETAS_PLAN: Record<PlanTipo, string> = {
  [PlanTipo.CASAS]: 'Casas',
  [PlanTipo.EDIFICIOS]: 'Edificios',
  [PlanTipo.CONJUNTOS]: 'Conjuntos',
};

const TAMANIO_PAGINA = 10;

function fraccion(uso: number, limite: number | null): string {
  return `${uso} / ${limite ?? '∞'}`;
}

// Misma pantalla para /app/tenants/pagados y /app/tenants/demo — el `modo`
// llega por route.data y solo cambia el subconjunto que se lista.
@Component({
  selector: 'app-tenants-page',
  imports: [AlertComponent, ButtonComponent, LoadingComponent, PaginationComponent, TableComponent],
  templateUrl: './tenants.page.html',
  styleUrl: './tenants.page.scss',
})
export class TenantsPage implements OnInit {
  private readonly tenantsService = inject(TenantsService);
  private readonly modalService = inject(NgbModal);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly modo: 'pagados' | 'demo' =
    this.route.snapshot.data['modo'] === 'demo' ? 'demo' : 'pagados';

  private readonly todos = signal<Tenant[]>([]);
  protected readonly cargando = signal(true);
  protected readonly errorMensaje = signal<string | null>(null);
  protected readonly exitoMensaje = signal<string | null>(null);
  protected readonly pagina = signal(1);

  protected readonly esPagados = this.modo === 'pagados';
  protected readonly titulo = this.esPagados ? 'Clientes pagados' : 'Clientes demo';
  protected readonly tamanioPagina = TAMANIO_PAGINA;

  // Subconjunto de este modo (pagado sí/no).
  protected readonly tenants = computed(() =>
    this.todos().filter((t) => t.pagado === this.esPagados),
  );

  protected readonly totales = computed(() => {
    const lista = this.tenants();
    return {
      tenants: lista.length,
      inmuebles: lista.reduce((n, t) => n + (t.uso?.inmuebles ?? 0), 0),
      unidades: lista.reduce((n, t) => n + (t.uso?.unidades ?? 0), 0),
    };
  });

  protected readonly tenantsPagina = computed(() => {
    const inicio = (this.pagina() - 1) * TAMANIO_PAGINA;
    return this.tenants().slice(inicio, inicio + TAMANIO_PAGINA);
  });

  protected readonly columnas: TableColumn<Tenant>[] = [
    { key: 'nombre', label: 'Cliente' },
    { key: 'plan', label: 'Plan', valor: (t) => ETIQUETAS_PLAN[t.plan] },
    {
      key: 'activo',
      label: 'Estado',
      badge: (t) =>
        t.activo
          ? { texto: 'Activo', variante: 'success' }
          : { texto: 'Inactivo', variante: 'danger' },
    },
    {
      key: 'inmuebles',
      label: 'Inmuebles',
      align: 'center',
      valor: (t) => fraccion(t.uso?.inmuebles ?? 0, t.uso?.limiteInmuebles ?? null),
    },
    {
      key: 'unidades',
      label: 'Unidades',
      align: 'center',
      valor: (t) => fraccion(t.uso?.unidades ?? 0, t.uso?.limiteUnidades ?? null),
    },
  ];

  ngOnInit(): void {
    this.cargar();
  }

  private cargar(): void {
    this.cargando.set(true);
    this.tenantsService.consultarTodos().subscribe({
      next: (tenants) => {
        this.todos.set(tenants);
        this.pagina.set(1);
        this.cargando.set(false);
      },
      error: (error: unknown) => {
        this.cargando.set(false);
        this.errorMensaje.set(mensajeErrorApi(error, 'No se pudieron cargar los clientes.'));
      },
    });
  }

  protected irADetalle(tenant: Tenant): void {
    void this.router.navigate(['/app/tenants', tenant.codTenant]);
  }

  protected cambiarPagina(pagina: number): void {
    this.pagina.set(pagina);
  }

  protected abrirCrear(): void {
    const modalRef = this.modalService.open(TenantFormModal, { centered: true });

    modalRef.result.then(
      (datos) => {
        this.tenantsService.crear(datos).subscribe({
          next: () => {
            this.exitoMensaje.set(
              `Cliente creado. Se envió un correo a ${datos.duenoCorreo} para que defina su contraseña.`,
            );
            this.errorMensaje.set(null);
            this.cargar();
          },
          error: (error: unknown) =>
            this.errorMensaje.set(mensajeErrorApi(error, 'No se pudo crear el cliente.')),
        });
      },
      () => undefined,
    );
  }
}
