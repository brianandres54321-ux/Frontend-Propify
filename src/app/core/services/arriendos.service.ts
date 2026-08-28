import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '@env/environment';
import {
  ArriendoBusquedaRespuesta,
  ArriendoDestacada,
  ArriendoInmueblePublico,
  ArriendoUnidadPublico,
  BuscarArriendosParams,
} from '../models';

// Consume /publico/arriendos — sin autenticación, sin tenant, ver
// ArriendosService/ArriendosController en el backend.
@Injectable({ providedIn: 'root' })
export class ArriendosService {
  private readonly baseUrl = `${environment.apiUrl}/publico/arriendos`;

  constructor(private readonly http: HttpClient) {}

  public consultarDestacadas(): Observable<ArriendoDestacada[]> {
    return this.http.get<ArriendoDestacada[]>(`${this.baseUrl}/destacadas`);
  }

  public buscar(filtros: BuscarArriendosParams): Observable<ArriendoBusquedaRespuesta> {
    let params = new HttpParams();
    for (const [clave, valor] of Object.entries(filtros)) {
      if (valor !== undefined && valor !== null && valor !== '') {
        params = params.set(clave, String(valor));
      }
    }
    return this.http.get<ArriendoBusquedaRespuesta>(`${this.baseUrl}/buscar`, { params });
  }

  public consultarPorInmueble(inmuebleId: number): Observable<ArriendoInmueblePublico> {
    return this.http.get<ArriendoInmueblePublico>(`${this.baseUrl}/inmuebles/${inmuebleId}`);
  }

  public consultarUnidad(unidadId: number): Observable<ArriendoUnidadPublico> {
    return this.http.get<ArriendoUnidadPublico>(`${this.baseUrl}/unidades/${unidadId}`);
  }

  public urlFoto(unidadId: number, codFoto: number): string {
    return `${this.baseUrl}/unidades/${unidadId}/fotos/${codFoto}`;
  }
}
