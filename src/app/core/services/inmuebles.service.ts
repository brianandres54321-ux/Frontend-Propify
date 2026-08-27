import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '@env/environment';
import { ActualizarInmuebleRequest, CrearInmuebleRequest, Inmueble } from '../models';

@Injectable({ providedIn: 'root' })
export class InmueblesService {
  private readonly baseUrl = `${environment.apiUrl}/privado/inmuebles`;

  constructor(private readonly http: HttpClient) {}

  public consultar(): Observable<Inmueble[]> {
    return this.http.get<Inmueble[]>(this.baseUrl);
  }

  public registrar(datos: CrearInmuebleRequest): Observable<Inmueble> {
    return this.http.post<Inmueble>(this.baseUrl, datos);
  }

  public actualizar(id: number, datos: ActualizarInmuebleRequest): Observable<{ mensaje: string }> {
    return this.http.put<{ mensaje: string }>(`${this.baseUrl}/${id}`, datos);
  }

  public eliminar(id: number): Observable<{ mensaje: string }> {
    return this.http.delete<{ mensaje: string }>(`${this.baseUrl}/${id}`);
  }
}
