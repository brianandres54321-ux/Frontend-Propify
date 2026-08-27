import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '@env/environment';
import { ActualizarResidenteRequest, CrearResidenteRequest, Residente } from '../models';

@Injectable({ providedIn: 'root' })
export class ResidentesService {
  private readonly baseUrl = `${environment.apiUrl}/privado/residentes`;

  constructor(private readonly http: HttpClient) {}

  public consultar(unidadId: number): Observable<Residente[]> {
    return this.http.get<Residente[]>(this.baseUrl, {
      params: new HttpParams().set('unidadId', unidadId),
    });
  }

  // El propio residente logueado (para "Mis cuentas").
  public consultarMe(): Observable<Residente> {
    return this.http.get<Residente>(`${this.baseUrl}/me`);
  }

  public consultarUno(id: number): Observable<Residente> {
    return this.http.get<Residente>(`${this.baseUrl}/${id}`);
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

  // Contratos por vencer del tenant completo (para el Dashboard) — no
  // requiere unidadId, a diferencia de consultar().
  public consultarPorVencer(): Observable<Residente[]> {
    return this.http.get<Residente[]>(`${this.baseUrl}/por-vencer`);
  }

  // El archivo (PDF/Word) del contrato del residente, guardado en disco en
  // el backend — ver ResidentesService.subirContrato en el backend.
  public subirContrato(id: number, archivo: File): Observable<{ mensaje: string }> {
    const formData = new FormData();
    formData.append('archivo', archivo);
    return this.http.post<{ mensaje: string }>(`${this.baseUrl}/${id}/contrato`, formData);
  }

  // responseType 'blob' porque es una descarga de archivo, no JSON — el
  // interceptor de auth igual le agrega el Bearer token a esta petición.
  public descargarContrato(id: number): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/${id}/contrato`, { responseType: 'blob' });
  }

  public eliminarContrato(id: number): Observable<{ mensaje: string }> {
    return this.http.delete<{ mensaje: string }>(`${this.baseUrl}/${id}/contrato`);
  }
}
