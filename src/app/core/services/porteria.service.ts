import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '@env/environment';
import {
  AutorizacionPrevia,
  CrearAutorizacionPreviaRequest,
  CrearPaqueteRequest,
  CrearVisitaRequest,
  PanoramaPorteria,
  Paquete,
  ResumenPorteria,
  Visita,
} from '../models';

@Injectable({ providedIn: 'root' })
export class PorteriaService {
  private readonly baseUrl = `${environment.apiUrl}/privado/porteria`;
  private readonly visitasUrl = `${environment.apiUrl}/privado/visitas`;
  private readonly paquetesUrl = `${environment.apiUrl}/privado/paquetes`;
  private readonly autorizacionesUrl = `${environment.apiUrl}/privado/autorizaciones-previas`;

  constructor(private readonly http: HttpClient) {}

  public consultarPanorama(inmuebleId: number): Observable<PanoramaPorteria> {
    const params = new HttpParams().set('inmuebleId', inmuebleId);
    return this.http.get<PanoramaPorteria>(`${this.baseUrl}/panorama`, { params });
  }

  public marcarPaqueteNotificado(id: number): Observable<{ mensaje: string }> {
    return this.http.patch<{ mensaje: string }>(
      `${this.paquetesUrl}/${id}/notificado`,
      {},
    );
  }

  public consultarVisitas(unidadId: number): Observable<Visita[]> {
    const params = new HttpParams().set('unidadId', unidadId);
    return this.http.get<Visita[]>(this.visitasUrl, { params });
  }

  public registrarEntradaVisita(datos: CrearVisitaRequest): Observable<Visita> {
    return this.http.post<Visita>(`${this.visitasUrl}/entrada`, datos);
  }

  public registrarSalidaVisita(id: number): Observable<{ mensaje: string }> {
    return this.http.patch<{ mensaje: string }>(`${this.visitasUrl}/${id}/salida`, {});
  }

  public consultarPaquetes(unidadId: number): Observable<Paquete[]> {
    const params = new HttpParams().set('unidadId', unidadId);
    return this.http.get<Paquete[]>(this.paquetesUrl, { params });
  }

  public registrarLlegadaPaquete(datos: CrearPaqueteRequest): Observable<Paquete> {
    return this.http.post<Paquete>(this.paquetesUrl, datos);
  }

  public registrarEntregaPaquete(id: number): Observable<{ mensaje: string }> {
    return this.http.patch<{ mensaje: string }>(`${this.paquetesUrl}/${id}/entregado`, {});
  }

  public consultarAutorizacionesVigentes(unidadId: number): Observable<AutorizacionPrevia[]> {
    const params = new HttpParams().set('unidadId', unidadId);
    return this.http.get<AutorizacionPrevia[]>(this.autorizacionesUrl, { params });
  }

  // Solo RESIDENTE (ver AutorizacionesPreviasController) — autoriza un
  // visitante propio para que portería lo deje pasar.
  public registrarAutorizacion(
    datos: CrearAutorizacionPreviaRequest,
  ): Observable<AutorizacionPrevia> {
    return this.http.post<AutorizacionPrevia>(this.autorizacionesUrl, datos);
  }

  public consultarResumen(): Observable<ResumenPorteria> {
    return this.http.get<ResumenPorteria>(`${this.baseUrl}/resumen`);
  }
}
