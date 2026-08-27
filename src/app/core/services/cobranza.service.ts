import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '@env/environment';
import {
  ConsultarCuentasFiltros,
  CuentaResumen,
  PendienteNotificacion,
  ResumenFinanciero,
  TendenciaMensual,
  TipoNotificacionAccionable,
} from '../models';
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
    return this.http.post<{ mensaje: string }>(`${this.baseUrl}/cuentas/${codCuenta}/pagos`, datos);
  }

  public ejecutarCiclo(): Observable<{ mensaje: string }> {
    return this.http.post<{ mensaje: string }>(`${this.baseUrl}/ejecutar`, {});
  }

  public consultarResumen(): Observable<ResumenFinanciero> {
    return this.http.get<ResumenFinanciero>(`${this.baseUrl}/resumen`);
  }

  public consultarTendencia(meses = 6): Observable<TendenciaMensual[]> {
    return this.http.get<TendenciaMensual[]>(`${this.baseUrl}/tendencia`, {
      params: new HttpParams().set('meses', meses),
    });
  }

  public consultarPendientesNotificacion(): Observable<PendienteNotificacion[]> {
    return this.http.get<PendienteNotificacion[]>(`${this.baseUrl}/pendientes-notificacion`);
  }

  // El dueño ya abrió wa.me y le dio enviar — esto solo lo registra para
  // que no vuelva a aparecer en la lista hoy.
  public marcarNotificado(
    codCuenta: number,
    tipo: TipoNotificacionAccionable,
  ): Observable<{ mensaje: string }> {
    return this.http.post<{ mensaje: string }>(
      `${this.baseUrl}/cuentas/${codCuenta}/marcar-notificado`,
      { tipo },
    );
  }
}
