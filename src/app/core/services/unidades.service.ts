import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ActualizarUnidadRequest, CrearUnidadRequest, Unidad } from '../models';

@Injectable({ providedIn: 'root' })
export class UnidadesService {
  private readonly baseUrl = `${environment.apiUrl}/privado/unidades`;

  constructor(private readonly http: HttpClient) {}

  public consultar(inmuebleId: number): Observable<Unidad[]> {
    return this.http.get<Unidad[]>(this.baseUrl, {
      params: new HttpParams().set('inmuebleId', inmuebleId),
    });
  }

  public registrar(datos: CrearUnidadRequest): Observable<Unidad> {
    return this.http.post<Unidad>(this.baseUrl, datos);
  }

  public actualizar(
    id: number,
    datos: ActualizarUnidadRequest,
  ): Observable<{ mensaje: string }> {
    return this.http.put<{ mensaje: string }>(`${this.baseUrl}/${id}`, datos);
  }

  public eliminar(id: number): Observable<{ mensaje: string }> {
    return this.http.delete<{ mensaje: string }>(`${this.baseUrl}/${id}`);
  }
}
