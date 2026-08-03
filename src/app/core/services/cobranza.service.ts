import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ConsultarCuentasFiltros, CuentaResumen } from '../models';
import { RegistrarPagoRequest } from '../models';

@Injectable({ providedIn: 'root' })
export class CobranzaService {
  private readonly baseUrl = `${environment.apiUrl}/privado/cobranza`;

  constructor(private readonly http: HttpClient) {}

  public consultarCuentas(filtros: ConsultarCuentasFiltros): Observable<CuentaResumen[]> {
    let params = new HttpParams();
    if (filtros.estado) {
      params = params.set('estado', filtros.estado);
    }
    if (filtros.inmuebleId) {
      params = params.set('inmuebleId', filtros.inmuebleId);
    }
    return this.http.get<CuentaResumen[]>(`${this.baseUrl}/cuentas`, { params });
  }

  public registrarPago(
    codCuenta: number,
    datos: RegistrarPagoRequest,
  ): Observable<{ mensaje: string }> {
    return this.http.post<{ mensaje: string }>(
      `${this.baseUrl}/cuentas/${codCuenta}/pagos`,
      datos,
    );
  }

  public ejecutarCiclo(): Observable<{ mensaje: string }> {
    return this.http.post<{ mensaje: string }>(`${this.baseUrl}/ejecutar`, {});
  }
}
