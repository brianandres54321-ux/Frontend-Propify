import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '@env/environment';
import {
  ActualizarReporteDanoRequest,
  CrearReporteDanoRequest,
  ReporteDano,
  ResumenReportesDano,
} from '../models';

@Injectable({ providedIn: 'root' })
export class ReportesDanoService {
  private readonly baseUrl = `${environment.apiUrl}/privado/reportes-dano`;

  constructor(private readonly http: HttpClient) {}

  // Solo DUEÑO/ADMIN (ver ReportesDanoController) — un RESIDENTE no puede
  // listar, solo crear.
  public consultar(unidadId: number): Observable<ReporteDano[]> {
    const params = new HttpParams().set('unidadId', unidadId);
    return this.http.get<ReporteDano[]>(this.baseUrl, { params });
  }

  public registrar(datos: CrearReporteDanoRequest): Observable<ReporteDano> {
    return this.http.post<ReporteDano>(this.baseUrl, datos);
  }

  public actualizar(
    id: number,
    datos: ActualizarReporteDanoRequest,
  ): Observable<{ mensaje: string }> {
    return this.http.put<{ mensaje: string }>(`${this.baseUrl}/${id}`, datos);
  }

  // Conteo agregado del tenant, para la alerta del dashboard.
  public consultarResumen(): Observable<ResumenReportesDano> {
    return this.http.get<ResumenReportesDano>(`${this.baseUrl}/resumen`);
  }
}
