import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { Rol, UsuarioResumen } from '@core/models';
import { AuthService } from '@core/services/auth.service';
import { RoleNames } from '@core/constants';
import { mensajeErrorApi } from '@core/utils';
import { RolesService } from '@core/services/roles.service';
import { UsuariosService } from '@core/services/usuarios.service';
import { AlertComponent } from '@shared/components/alert/alert';
import { ButtonComponent } from '@shared/components/button/button';
import { ConfirmDialogService } from '@shared/components/confirm-dialog/confirm-dialog.service';
import { LoadingComponent } from '@shared/components/loading/loading';
import { TableComponent } from '@shared/components/table/table';
import { TableColumn } from '@shared/interfaces';
import { UsuarioFormModal } from './components/usuario-form-modal';

@Component({
  selector: 'app-usuarios-page',
  imports: [AlertComponent, ButtonComponent, LoadingComponent, TableComponent],
  templateUrl: './usuarios.page.html',
  styleUrl: './usuarios.page.scss',
})
export class UsuariosPage implements OnInit {
  private readonly usuariosService = inject(UsuariosService);
  private readonly rolesService = inject(RolesService);
  private readonly modalService = inject(NgbModal);
  private readonly confirmDialog = inject(ConfirmDialogService);
  private readonly auth = inject(AuthService);

  protected readonly usuarios = signal<UsuarioResumen[]>([]);
  protected readonly roles = signal<Rol[]>([]);
  protected readonly cargando = signal(true);
  protected readonly errorMensaje = signal<string | null>(null);

  // Solo un dueño puede asignar el rol dueño — el backend ya lo exige, esto
  // solo evita ofrecer una opción que terminaría en un 403.
  protected readonly rolesAsignables = computed(() => {
    const esDueno = this.auth.tieneRol(RoleNames.DUENO);
    return this.roles().filter((rol) => esDueno || rol.nombreRol !== RoleNames.DUENO);
  });

  protected readonly columnas: TableColumn<UsuarioResumen>[] = [
    { key: 'nombre_usuario', label: 'Nombre' },
    { key: 'correo_usuario', label: 'Correo' },
    { key: 'nombre_rol', label: 'Rol' },
  ];

  ngOnInit(): void {
    this.cargar();
    this.rolesService.consultar().subscribe({
      next: (roles) => this.roles.set(roles),
      error: () => this.roles.set([]),
    });
  }

  private cargar(): void {
    this.cargando.set(true);
    this.usuariosService.consultar().subscribe({
      next: (usuarios) => {
        this.usuarios.set(usuarios);
        this.cargando.set(false);
      },
      error: (error: unknown) => {
        this.cargando.set(false);
        this.errorMensaje.set(mensajeErrorApi(error, 'No se pudieron cargar los usuarios.'));
      },
    });
  }

  protected abrirCrear(): void {
    const modalRef = this.modalService.open(UsuarioFormModal, { centered: true });
    const instancia: UsuarioFormModal = modalRef.componentInstance;
    instancia.roles = this.rolesAsignables();

    modalRef.result.then(
      (datos) => {
        this.usuariosService.registrar(datos).subscribe({
          next: () => this.cargar(),
          error: (error: unknown) =>
            this.errorMensaje.set(mensajeErrorApi(error, 'No se pudo crear el usuario.')),
        });
      },
      () => undefined,
    );
  }

  protected async eliminar(usuario: UsuarioResumen): Promise<void> {
    const confirmado = await this.confirmDialog.confirm({
      titulo: 'Eliminar usuario',
      mensaje: `¿Eliminar a "${usuario.nombre_usuario}"? Esta acción no se puede deshacer.`,
      textoConfirmar: 'Eliminar',
    });
    if (!confirmado) {
      return;
    }

    this.usuariosService.eliminar(usuario.cod_usuario).subscribe({
      next: () => this.cargar(),
      error: (error: unknown) =>
        this.errorMensaje.set(mensajeErrorApi(error, 'No se pudo eliminar el usuario.')),
    });
  }
}
