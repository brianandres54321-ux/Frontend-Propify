import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '@env/environment';
import { ActualizarZonaComunRequest, CrearZonaComunRequest, ZonaComun } from '../models';

@Injectable({ providedIn: 'root' })
export class ZonasComunesService {
  private readonly baseUrl = `${environment.apiUrl}/privado/zonas-comunes`;

  constructor(private readonly http: HttpClient) {}

  public consultar(inmuebleId: number): Observable<ZonaComun[]> {
    const params = new HttpParams().set('inmuebleId', inmuebleId);
    return this.http.get<ZonaComun[]>(this.baseUrl, { params });
  }

  public registrar(datos: CrearZonaComunRequest): Observable<ZonaComun> {
    return this.http.post<ZonaComun>(this.baseUrl, datos);
  }

  public actualizar(
    id: number,
    datos: ActualizarZonaComunRequest,
  ): Observable<{ mensaje: string }> {
    return this.http.put<{ mensaje: string }>(`${this.baseUrl}/${id}`, datos);
  }

  public eliminar(id: number): Observable<{ mensaje: string }> {
    return this.http.delete<{ mensaje: string }>(`${this.baseUrl}/${id}`);
  }
}
