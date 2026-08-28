import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';

import { environment } from '@env/environment';
import {
  ActualizarContactoRequest,
  ActualizarTenantRequest,
  CrearTenantRequest,
  PlanTipo,
  Tenant,
} from '../models';

@Injectable({ providedIn: 'root' })
export class TenantsService {
  private readonly baseUrl = `${environment.apiUrl}/privado/tenants`;

  // Cacheado en sesión: lo consulta InternoLayout una vez al entrar a /app
  // y de ahí lo leen tanto el sidebar (para ocultar módulos que el plan no
  // ofrece) como los formularios de inmueble (para pre-marcar banderas).
  private readonly planSignal = signal<PlanTipo | null>(null);
  public readonly plan = this.planSignal.asReadonly();

  private readonly tenantSignal = signal<Tenant | null>(null);
  public readonly tenant = this.tenantSignal.asReadonly();

  constructor(private readonly http: HttpClient) {}

  // Autoservicio: cualquier rol no-superadmin puede leer su propio tenant
  // (ver tenants.controller.ts en el backend).
  public consultarPropio(): Observable<Tenant> {
    return this.http.get<Tenant>(`${this.baseUrl}/mi-tenant`).pipe(
      tap((tenant) => {
        this.planSignal.set(tenant.plan);
        this.tenantSignal.set(tenant);
      }),
    );
  }

  // Autoservicio: DUENO edita nombre/teléfono de contacto desde
  // /app/configuracion (no puede tocar plan/activo/pagado por esta vía).
  public actualizarContacto(datos: ActualizarContactoRequest): Observable<{ mensaje: string }> {
    return this.http
      .put<{ mensaje: string }>(`${this.baseUrl}/mi-tenant`, datos)
      .pipe(tap(() => this.consultarPropio().subscribe()));
  }

  // ---------- Superadministrador ----------

  public consultarTodos(): Observable<Tenant[]> {
    return this.http.get<Tenant[]>(this.baseUrl);
  }

  public crear(datos: CrearTenantRequest): Observable<Tenant> {
    return this.http.post<Tenant>(this.baseUrl, datos);
  }

  public actualizar(
    id: number,
    datos: ActualizarTenantRequest,
  ): Observable<{ mensaje: string }> {
    return this.http.put<{ mensaje: string }>(`${this.baseUrl}/${id}`, datos);
  }

  public eliminar(id: number): Observable<{ mensaje: string }> {
    return this.http.delete<{ mensaje: string }>(`${this.baseUrl}/${id}`);
  }
}
