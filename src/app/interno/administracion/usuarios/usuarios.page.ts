import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { Rol, UsuarioResumen } from '@core/models';
import { AuthService } from '@core/services/auth.service';
import { RoleNames, etiquetaRol } from '@core/constants';
import { mensajeErrorApi } from '@core/utils';
import { RolesService } from '@core/services/roles.service';
import { UsuariosService } from '@core/services/usuarios.service';
import { AlertComponent } from '@shared/components/alert/alert';
import { ButtonComponent } from '@shared/components/button/button';
import { ConfirmDialogService } from '@shared/components/confirm-dialog/confirm-dialog.service';
import { LoadingComponent } from '@shared/components/loading/loading';
import { TableComponent } from '@shared/components/table/table';
import { TableColumn } from '@shared/interfaces';
import { UsuarioFormModal, UsuarioFormResultado } from './components/usuario-form-modal';

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

  // Roles que se pueden crear desde esta pantalla:
  //  - `residente` no se crea aquí: un residente se gestiona como ficha en su
  //    unidad (Inmuebles → Unidades → Residentes), no necesita cuenta de acceso.
  //  - `superadministrador` nunca se asigna por esta vía (lo bloquea el backend).
  //  - `dueno` solo lo puede asignar otro dueño (el backend devuelve 403 si no).
  protected readonly rolesAsignables = computed(() => {
    const esDueno = this.auth.tieneRol(RoleNames.DUENO);
    return this.roles().filter((rol) => {
      if (rol.nombreRol === RoleNames.RESIDENTE || rol.nombreRol === RoleNames.SUPERADMIN) {
        return false;
      }
      return esDueno || rol.nombreRol !== RoleNames.DUENO;
    });
  });

  protected readonly columnas: TableColumn<UsuarioResumen>[] = [
    { key: 'nombre_usuario', label: 'Nombre' },
    { key: 'correo_usuario', label: 'Correo' },
    { key: 'nombre_rol', label: 'Rol', valor: (fila) => etiquetaRol(fila.nombre_rol) },
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

  // Un admin operativo no puede tocar la cuenta del dueño (el backend también
  // lo bloquea) — se le ocultan las acciones sobre esa fila.
  protected puedeGestionar(usuario: UsuarioResumen): boolean {
    if (usuario.nombre_rol === RoleNames.DUENO) {
      return this.auth.tieneRol(RoleNames.DUENO);
    }
    return true;
  }

  protected abrirCrear(): void {
    const modalRef = this.modalService.open(UsuarioFormModal, { centered: true });
    const instancia: UsuarioFormModal = modalRef.componentInstance;
    instancia.roles = this.rolesAsignables();

    modalRef.result.then(
      (datos: UsuarioFormResultado) => {
        this.usuariosService
          .registrar({ ...datos, claveAcceso: datos.claveAcceso! })
          .subscribe({
            next: () => this.cargar(),
            error: (error: unknown) =>
              this.errorMensaje.set(mensajeErrorApi(error, 'No se pudo crear el usuario.')),
          });
      },
      () => undefined,
    );
  }

  protected abrirEditar(usuario: UsuarioResumen): void {
    const modalRef = this.modalService.open(UsuarioFormModal, { centered: true });
    const instancia: UsuarioFormModal = modalRef.componentInstance;
    // Ofrece también el rol actual aunque ya no sea asignable (p. ej. un
    // `residente` heredado), para que el select lo muestre y se pueda corregir.
    const asignables = this.rolesAsignables();
    const actual = this.roles().find((r) => r.codRol === usuario.cod_rol);
    instancia.roles =
      actual && !asignables.some((r) => r.codRol === actual.codRol)
        ? [...asignables, actual]
        : asignables;
    instancia.usuario = usuario;

    modalRef.result.then(
      (datos: UsuarioFormResultado) => {
        this.usuariosService.actualizar(usuario.cod_usuario, datos).subscribe({
          next: () => this.cargar(),
          error: (error: unknown) =>
            this.errorMensaje.set(mensajeErrorApi(error, 'No se pudo actualizar el usuario.')),
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
