import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '@env/environment';
import { CargoDetalle, CuentaMensual, Pago } from '../models';

@Injectable({ providedIn: 'root' })
export class CuentasMensualesService {
  private readonly baseUrl = `${environment.apiUrl}/privado/cuentas`;

  constructor(private readonly http: HttpClient) {}

  // Todas las cuentas del tenant (DUEÑO/ADMIN) — se filtra por residente en
  // el cliente ya que el volumen es bajo y no vale la pena un endpoint
  // aparte solo para eso.
  public consultarTodas(): Observable<CuentaMensual[]> {
    return this.http.get<CuentaMensual[]>(this.baseUrl);
  }

  // Solo las cuentas del residente logueado.
  public consultarMias(): Observable<CuentaMensual[]> {
    return this.http.get<CuentaMensual[]>(`${this.baseUrl}/me`);
  }

  public consultarUna(
    id: number,
  ): Observable<{ cuenta: CuentaMensual; cargos: CargoDetalle[]; pagos: Pago[] }> {
    return this.http.get<{ cuenta: CuentaMensual; cargos: CargoDetalle[]; pagos: Pago[] }>(
      `${this.baseUrl}/${id}`,
    );
  }
}
