import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '@env/environment';
import { ArriendoDestacada, ArriendoInmueblePublico, ArriendoUnidadPublico } from '../models';

// Consume /publico/arriendos — sin autenticación, sin tenant, ver
// ArriendosService/ArriendosController en el backend.
@Injectable({ providedIn: 'root' })
export class ArriendosService {
  private readonly baseUrl = `${environment.apiUrl}/publico/arriendos`;

  constructor(private readonly http: HttpClient) {}

  public consultarDestacadas(): Observable<ArriendoDestacada[]> {
    return this.http.get<ArriendoDestacada[]>(`${this.baseUrl}/destacadas`);
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
