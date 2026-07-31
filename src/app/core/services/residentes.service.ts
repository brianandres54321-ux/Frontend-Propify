import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import {
  ActualizarResidenteRequest,
  CrearResidenteRequest,
  Residente,
} from '../models';

@Injectable({ providedIn: 'root' })
export class ResidentesService {
  private readonly baseUrl = `${environment.apiUrl}/privado/residentes`;

  constructor(private readonly http: HttpClient) {}

  public consultar(unidadId: number): Observable<Residente[]> {
    return this.http.get<Residente[]>(this.baseUrl, {
      params: new HttpParams().set('unidadId', unidadId),
    });
  }

  public registrar(datos: CrearResidenteRequest): Observable<Residente> {
    return this.http.post<Residente>(this.baseUrl, datos);
  }

  public actualizar(
    id: number,
    datos: ActualizarResidenteRequest,
  ): Observable<{ mensaje: string }> {
    return this.http.put<{ mensaje: string }>(`${this.baseUrl}/${id}`, datos);
  }

  public eliminar(id: number): Observable<{ mensaje: string }> {
    return this.http.delete<{ mensaje: string }>(`${this.baseUrl}/${id}`);
  }
}
