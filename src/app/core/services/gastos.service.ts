import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ActualizarGastoRequest, CrearGastoRequest, Gasto } from '../models';

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

  public actualizar(
    id: number,
    datos: ActualizarGastoRequest,
  ): Observable<{ mensaje: string }> {
    return this.http.put<{ mensaje: string }>(`${this.baseUrl}/${id}`, datos);
  }

  public eliminar(id: number): Observable<{ mensaje: string }> {
    return this.http.delete<{ mensaje: string }>(`${this.baseUrl}/${id}`);
  }
}
