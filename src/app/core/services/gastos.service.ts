import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '@env/environment';
import {
  ActualizarGastoRequest,
  CrearGastoRequest,
  Gasto,
  ResumenGastosMes,
  TendenciaMensual,
} from '../models';

@Injectable({ providedIn: 'root' })
export class GastosService {
  private readonly baseUrl = `${environment.apiUrl}/privado/gastos`;

  constructor(private readonly http: HttpClient) {}

  public consultar(inmuebleId: number): Observable<Gasto[]> {
    const params = new HttpParams().set('inmuebleId', inmuebleId);
    return this.http.get<Gasto[]>(this.baseUrl, { params });
  }

  public registrar(datos: CrearGastoRequest): Observable<Gasto> {
    return this.http.post<Gasto>(this.baseUrl, datos);
  }

  public actualizar(id: number, datos: ActualizarGastoRequest): Observable<{ mensaje: string }> {
    return this.http.put<{ mensaje: string }>(`${this.baseUrl}/${id}`, datos);
  }

  public eliminar(id: number): Observable<{ mensaje: string }> {
    return this.http.delete<{ mensaje: string }>(`${this.baseUrl}/${id}`);
  }

  public consultarResumen(): Observable<ResumenGastosMes> {
    return this.http.get<ResumenGastosMes>(`${this.baseUrl}/resumen`);
  }

  public consultarTendencia(meses = 6): Observable<TendenciaMensual[]> {
    return this.http.get<TendenciaMensual[]>(`${this.baseUrl}/tendencia`, {
      params: new HttpParams().set('meses', meses),
    });
  }
}
