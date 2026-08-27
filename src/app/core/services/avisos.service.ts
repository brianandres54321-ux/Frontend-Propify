import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '@env/environment';
import { Aviso, CrearAvisoRequest } from '../models';

@Injectable({ providedIn: 'root' })
export class AvisosService {
  private readonly baseUrl = `${environment.apiUrl}/privado/avisos`;

  constructor(private readonly http: HttpClient) {}

  public consultar(inmuebleId: number): Observable<Aviso[]> {
    const params = new HttpParams().set('inmuebleId', inmuebleId);
    return this.http.get<Aviso[]>(this.baseUrl, { params });
  }

  public registrar(datos: CrearAvisoRequest): Observable<Aviso> {
    return this.http.post<Aviso>(this.baseUrl, datos);
  }
}
