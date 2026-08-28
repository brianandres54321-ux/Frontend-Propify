import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '@env/environment';
import {
  ActualizarUnidadRequest,
  CrearUnidadRequest,
  FotoUnidad,
  GenerarUnidadesRequest,
  GenerarUnidadesResultado,
  ResumenOcupacion,
  Unidad,
} from '../models';

@Injectable({ providedIn: 'root' })
export class UnidadesService {
  private readonly baseUrl = `${environment.apiUrl}/privado/unidades`;

  constructor(private readonly http: HttpClient) {}

  public consultar(inmuebleId: number): Observable<Unidad[]> {
    return this.http.get<Unidad[]>(this.baseUrl, {
      params: new HttpParams().set('inmuebleId', inmuebleId),
    });
  }

  public consultarResumenOcupacion(): Observable<ResumenOcupacion> {
    return this.http.get<ResumenOcupacion>(`${this.baseUrl}/resumen-ocupacion`);
  }

  public registrar(datos: CrearUnidadRequest): Observable<Unidad> {
    return this.http.post<Unidad>(this.baseUrl, datos);
  }

  public generarLote(datos: GenerarUnidadesRequest): Observable<GenerarUnidadesResultado> {
    return this.http.post<GenerarUnidadesResultado>(`${this.baseUrl}/lote`, datos);
  }

  public actualizar(id: number, datos: ActualizarUnidadRequest): Observable<{ mensaje: string }> {
    return this.http.put<{ mensaje: string }>(`${this.baseUrl}/${id}`, datos);
  }

  public eliminar(id: number): Observable<{ mensaje: string }> {
    return this.http.delete<{ mensaje: string }>(`${this.baseUrl}/${id}`);
  }

  public consultarFotos(id: number): Observable<FotoUnidad[]> {
    return this.http.get<FotoUnidad[]>(`${this.baseUrl}/${id}/fotos`);
  }

  public subirFoto(id: number, archivo: File): Observable<FotoUnidad> {
    const formData = new FormData();
    formData.append('foto', archivo);
    return this.http.post<FotoUnidad>(`${this.baseUrl}/${id}/fotos`, formData);
  }

  public eliminarFoto(id: number, fotoId: number): Observable<{ mensaje: string }> {
    return this.http.delete<{ mensaje: string }>(`${this.baseUrl}/${id}/fotos/${fotoId}`);
  }

  // responseType 'blob' porque es una imagen, no JSON — el interceptor de
  // auth igual le agrega el Bearer token (necesario: a diferencia del
  // endpoint público, este funciona sin importar el estadoOcupacion, para
  // poder previsualizar fotos antes de publicar la unidad).
  public obtenerFotoBlob(id: number, fotoId: number): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/${id}/fotos/${fotoId}`, { responseType: 'blob' });
  }
}
